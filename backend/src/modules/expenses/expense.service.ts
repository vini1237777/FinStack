import prisma from "../../config/database";
import { accountingEngine } from "../accounting/accounting-engine.service";
import { gstCalculator } from "../gst/gst-calculator.service";

interface CreateExpenseInput {
  expenseHead: string;
  supplierId?: string;
  date: string;
  financialYearId: string;
  hsnSacCode?: string;
  amount: number;
  paymentMode: string;
  narration?: string;
  vendorState?: string;
}

export const expenseService = {
  async create(input: CreateExpenseInput, userId: string) {
    const companyState = "MH";

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (input.hsnSacCode) {
      const vendorState = input.vendorState || companyState;
      const gst = await gstCalculator.calculate({
        amount: input.amount,
        hsnCode: input.hsnSacCode,
        supplierState: vendorState,
        customerState: companyState,
      });
      cgstAmount = gst.cgst;
      sgstAmount = gst.sgst;
      igstAmount = gst.igst;
    }

    const totalAmount = input.amount + cgstAmount + sgstAmount + igstAmount;

    const [bankAccount, cashAccount, cgstInput, sgstInput, igstInput] =
      await Promise.all([
        prisma.ledgerAccount.findFirst({ where: { code: "AST-005" } }),
        prisma.ledgerAccount.findFirst({ where: { code: "AST-006" } }),
        prisma.ledgerAccount.findFirst({ where: { code: "AST-001" } }),
        prisma.ledgerAccount.findFirst({ where: { code: "AST-002" } }),
        prisma.ledgerAccount.findFirst({ where: { code: "AST-003" } }),
      ]);

    if (
      !bankAccount ||
      !cashAccount ||
      !cgstInput ||
      !sgstInput ||
      !igstInput
    ) {
      throw new Error("System ledger accounts not found. Run seed first.");
    }

    let expenseAccount = await prisma.ledgerAccount.findFirst({
      where: { name: input.expenseHead },
    });

    if (!expenseAccount) {
      const count = await prisma.ledgerAccount.count();
      expenseAccount = await prisma.ledgerAccount.create({
        data: {
          name: input.expenseHead,
          code: `EXP-${String(count + 1).padStart(3, "0")}`,
          accountType: "EXPENSE",
          accountGroup: "Indirect Expense",
        },
      });
    }

    const expense = await prisma.expenseVoucher.create({
      data: {
        expenseHead: input.expenseHead,
        supplierId: input.supplierId || null,
        date: new Date(input.date),
        financialYearId: input.financialYearId,
        hsnSacCode: input.hsnSacCode || null,
        amount: input.amount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalAmount,
        paymentMode: input.paymentMode,
        createdBy: userId,
        narration: input.narration || null,
      },
    });

    const paymentAccount =
      input.paymentMode === "CASH" ? cashAccount : bankAccount;

    const entries = [
      { ledgerAccountId: expenseAccount.id, debit: input.amount, credit: 0 },
      { ledgerAccountId: paymentAccount.id, debit: 0, credit: totalAmount },
    ];

    if (cgstAmount > 0) {
      entries.push({
        ledgerAccountId: cgstInput.id,
        debit: cgstAmount,
        credit: 0,
      });
    }
    if (sgstAmount > 0) {
      entries.push({
        ledgerAccountId: sgstInput.id,
        debit: sgstAmount,
        credit: 0,
      });
    }
    if (igstAmount > 0) {
      entries.push({
        ledgerAccountId: igstInput.id,
        debit: igstAmount,
        credit: 0,
      });
    }

    const voucher = await accountingEngine.postVoucher({
      voucherType: "EXPENSE",
      date: new Date(input.date),
      financialYearId: input.financialYearId,
      referenceModule: "EXPENSE_VOUCHER",
      referenceId: expense.id,
      entries,
      narration: `Expense: ${input.expenseHead} - ${input.narration || ""}`,
      createdBy: userId,
    });

    const updated = await prisma.expenseVoucher.update({
      where: { id: expense.id },
      data: { voucherId: voucher.id },
    });

    return updated;
  },

  async getAll() {
    return prisma.expenseVoucher.findMany({
      include: { supplier: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    const expense = await prisma.expenseVoucher.findUnique({
      where: { id },
      include: {
        supplier: true,
        voucher: { include: { ledgerEntries: true } },
      },
    });
    if (!expense) throw new Error("Expense not found");
    return expense;
  },
};
