import prisma from "../../config/database";
import { accountingEngine } from "../accounting/accounting-engine.service";
import { gstCalculator } from "../gst/gst-calculator.service";
import { inventoryService } from "../inventory/inventory.service";

interface SalesInvoiceItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  hsnCode: string;
  warehouseId: string;
}

interface CreateSalesInvoiceInput {
  customerId: string;
  invoiceDate: string;
  financialYearId: string;
  items: SalesInvoiceItem[];
}

export const salesService = {
  async createInvoice(input: CreateSalesInvoiceInput, userId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: input.customerId },
    });
    if (!customer) throw new Error("Customer not found");

    const companyState = "MH";

    let totalAmount = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    const lineItems: any[] = [];

    for (const item of input.items) {
      const taxableAmount = item.quantity * item.unitPrice;

      const gst = await gstCalculator.calculate({
        amount: taxableAmount,
        hsnCode: item.hsnCode,
        supplierState: companyState,
        customerState: customer.stateCode,
      });

      lineItems.push({
        itemId: item.itemId,
        hsnCode: item.hsnCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxableAmount,
        gstRate: gst.rate,
        cgstAmount: gst.cgst,
        sgstAmount: gst.sgst,
        igstAmount: gst.igst,
        totalAmount: gst.totalWithTax,
        warehouseId: item.warehouseId,
      });

      totalAmount += taxableAmount;
      cgstTotal += gst.cgst;
      sgstTotal += gst.sgst;
      igstTotal += gst.igst;
    }

    const grandTotal = totalAmount + cgstTotal + sgstTotal + igstTotal;

    const [
      salesRevenue,
      accountsReceivable,
      cgstPayable,
      sgstPayable,
      igstPayable,
    ] = await Promise.all([
      prisma.ledgerAccount.findFirst({ where: { code: "REV-001" } }),
      prisma.ledgerAccount.findFirst({ where: { code: "AST-004" } }),
      prisma.ledgerAccount.findFirst({ where: { code: "LIA-001" } }),
      prisma.ledgerAccount.findFirst({ where: { code: "LIA-002" } }),
      prisma.ledgerAccount.findFirst({ where: { code: "LIA-003" } }),
    ]);

    if (
      !salesRevenue ||
      !accountsReceivable ||
      !cgstPayable ||
      !sgstPayable ||
      !igstPayable
    ) {
      throw new Error("System ledger accounts not found. Run seed first.");
    }

    const count = await prisma.salesInvoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;

    const invoice = await prisma.salesInvoice.create({
      data: {
        invoiceNumber,
        customerId: input.customerId,
        invoiceDate: new Date(input.invoiceDate),
        financialYearId: input.financialYearId,
        totalAmount,
        cgstTotal,
        sgstTotal,
        igstTotal,
        grandTotal,
        status: "CONFIRMED",
        createdBy: userId,
        items: {
          create: lineItems.map((li) => ({
            itemId: li.itemId,
            hsnCode: li.hsnCode,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            taxableAmount: li.taxableAmount,
            gstRate: li.gstRate,
            cgstAmount: li.cgstAmount,
            sgstAmount: li.sgstAmount,
            igstAmount: li.igstAmount,
            totalAmount: li.totalAmount,
          })),
        },
      },
      include: { items: true, customer: true },
    });

    for (const li of lineItems) {
      await inventoryService.stockOut({
        itemId: li.itemId,
        warehouseId: li.warehouseId,
        quantity: li.quantity,
        referenceType: "SALES_INVOICE",
        referenceId: invoice.id,
        date: new Date(input.invoiceDate),
      });
    }

    const entries = [
      { ledgerAccountId: accountsReceivable.id, debit: grandTotal, credit: 0 },
      { ledgerAccountId: salesRevenue.id, debit: 0, credit: totalAmount },
    ];

    if (cgstTotal > 0) {
      entries.push({
        ledgerAccountId: cgstPayable.id,
        debit: 0,
        credit: cgstTotal,
      });
    }
    if (sgstTotal > 0) {
      entries.push({
        ledgerAccountId: sgstPayable.id,
        debit: 0,
        credit: sgstTotal,
      });
    }
    if (igstTotal > 0) {
      entries.push({
        ledgerAccountId: igstPayable.id,
        debit: 0,
        credit: igstTotal,
      });
    }

    const voucher = await accountingEngine.postVoucher({
      voucherType: "SALES",
      date: new Date(input.invoiceDate),
      financialYearId: input.financialYearId,
      referenceModule: "SALES_INVOICE",
      referenceId: invoice.id,
      entries,
      narration: `Sales Invoice ${invoiceNumber} - ${customer.name}`,
      createdBy: userId,
    });

    const updatedInvoice = await prisma.salesInvoice.update({
      where: { id: invoice.id },
      data: { voucherId: voucher.id },
      include: { items: true, customer: true },
    });

    return updatedInvoice;
  },

  async getAll() {
    return prisma.salesInvoice.findMany({
      include: { customer: true, items: { include: { item: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    const invoice = await prisma.salesInvoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { item: true } },
        voucher: { include: { ledgerEntries: true } },
      },
    });
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  },
};
