import prisma from "../../config/database";
import { accountingEngine } from "../accounting/accounting-engine.service";
import { gstCalculator } from "../gst/gst-calculator.service";
import { inventoryService } from "../inventory/inventory.service";

interface PurchaseInvoiceItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  hsnCode: string;
  warehouseId: string;
}

interface CreatePurchaseInvoiceInput {
  supplierId: string;
  invoiceDate: string;
  financialYearId: string;
  items: PurchaseInvoiceItem[];
}

export const purchaseService = {
  async createInvoice(input: CreatePurchaseInvoiceInput, userId: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: input.supplierId },
    });
    if (!supplier) throw new Error("Supplier not found");

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
        supplierState: supplier.stateCode,
        customerState: companyState,
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

    const [purchaseAccount, accountsPayable, cgstInput, sgstInput, igstInput] =
      await Promise.all([
        prisma.ledgerAccount.findFirst({ where: { code: "EXP-001" } }),
        prisma.ledgerAccount.findFirst({ where: { code: "LIA-004" } }),
        prisma.ledgerAccount.findFirst({ where: { code: "AST-001" } }),
        prisma.ledgerAccount.findFirst({ where: { code: "AST-002" } }),
        prisma.ledgerAccount.findFirst({ where: { code: "AST-003" } }),
      ]);

    if (
      !purchaseAccount ||
      !accountsPayable ||
      !cgstInput ||
      !sgstInput ||
      !igstInput
    ) {
      throw new Error("System ledger accounts not found. Run seed first.");
    }

    const count = await prisma.purchaseInvoice.count();
    const invoiceNumber = `PUR-${String(count + 1).padStart(4, "0")}`;

    const invoice = await prisma.purchaseInvoice.create({
      data: {
        invoiceNumber,
        supplierId: input.supplierId,
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
      include: { items: true, supplier: true },
    });

    for (const li of lineItems) {
      await inventoryService.stockIn({
        itemId: li.itemId,
        warehouseId: li.warehouseId,
        quantity: li.quantity,
        referenceType: "PURCHASE_INVOICE",
        referenceId: invoice.id,
        date: new Date(input.invoiceDate),
      });
    }

    const entries = [
      { ledgerAccountId: purchaseAccount.id, debit: totalAmount, credit: 0 },
      { ledgerAccountId: accountsPayable.id, debit: 0, credit: grandTotal },
    ];

    if (cgstTotal > 0) {
      entries.push({
        ledgerAccountId: cgstInput.id,
        debit: cgstTotal,
        credit: 0,
      });
    }
    if (sgstTotal > 0) {
      entries.push({
        ledgerAccountId: sgstInput.id,
        debit: sgstTotal,
        credit: 0,
      });
    }
    if (igstTotal > 0) {
      entries.push({
        ledgerAccountId: igstInput.id,
        debit: igstTotal,
        credit: 0,
      });
    }

    const voucher = await accountingEngine.postVoucher({
      voucherType: "PURCHASE",
      date: new Date(input.invoiceDate),
      financialYearId: input.financialYearId,
      referenceModule: "PURCHASE_INVOICE",
      referenceId: invoice.id,
      entries,
      narration: `Purchase Invoice ${invoiceNumber} - ${supplier.name}`,
      createdBy: userId,
    });

    const updatedInvoice = await prisma.purchaseInvoice.update({
      where: { id: invoice.id },
      data: { voucherId: voucher.id },
      include: { items: true, supplier: true },
    });

    return updatedInvoice;
  },

  async getAll() {
    return prisma.purchaseInvoice.findMany({
      include: { supplier: true, items: { include: { item: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: { include: { item: true } },
        voucher: { include: { ledgerEntries: true } },
      },
    });
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  },
};
