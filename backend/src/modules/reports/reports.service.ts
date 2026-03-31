import prisma from "../../config/database";

export const reportsService = {
  async trialBalance(financialYearId: string) {
    const accounts = await prisma.ledgerAccount.findMany({
      where: {
        ledgerEntries: {
          some: { financialYearId },
        },
      },
      include: {
        ledgerEntries: {
          where: { financialYearId },
        },
      },
    });

    const trialBalance = accounts.map((account) => {
      const totalDebit = account.ledgerEntries.reduce(
        (sum, e) => sum + e.debit,
        0,
      );
      const totalCredit = account.ledgerEntries.reduce(
        (sum, e) => sum + e.credit,
        0,
      );

      return {
        accountCode: account.code,
        accountName: account.name,
        accountType: account.accountType,
        totalDebit,
        totalCredit,
        balance: totalDebit - totalCredit,
      };
    });

    const totals = trialBalance.reduce(
      (acc, row) => ({
        totalDebit: acc.totalDebit + row.totalDebit,
        totalCredit: acc.totalCredit + row.totalCredit,
      }),
      { totalDebit: 0, totalCredit: 0 },
    );

    return {
      entries: trialBalance,
      totals,
      isBalanced: totals.totalDebit === totals.totalCredit,
    };
  },

  async profitAndLoss(financialYearId: string) {
    const accounts = await prisma.ledgerAccount.findMany({
      where: {
        accountType: { in: ["INCOME", "EXPENSE"] },
        ledgerEntries: {
          some: { financialYearId },
        },
      },
      include: {
        ledgerEntries: {
          where: { financialYearId },
        },
      },
    });

    const income: any[] = [];
    const expenses: any[] = [];
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const account of accounts) {
      const totalDebit = account.ledgerEntries.reduce(
        (sum, e) => sum + e.debit,
        0,
      );
      const totalCredit = account.ledgerEntries.reduce(
        (sum, e) => sum + e.credit,
        0,
      );
      const netAmount = Math.abs(totalCredit - totalDebit);

      if (account.accountType === "INCOME") {
        income.push({
          name: account.name,
          code: account.code,
          amount: netAmount,
        });
        totalIncome += netAmount;
      } else {
        expenses.push({
          name: account.name,
          code: account.code,
          amount: netAmount,
        });
        totalExpenses += netAmount;
      }
    }

    return {
      income,
      totalIncome,
      expenses,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      isProfit: totalIncome > totalExpenses,
    };
  },

  async gstr3b(financialYearId: string) {
    const salesInvoices = await prisma.salesInvoice.findMany({
      where: { financialYearId },
    });

    const outputGST = salesInvoices.reduce(
      (acc, inv) => ({
        cgst: acc.cgst + inv.cgstTotal,
        sgst: acc.sgst + inv.sgstTotal,
        igst: acc.igst + inv.igstTotal,
        taxableValue: acc.taxableValue + inv.totalAmount,
      }),
      { cgst: 0, sgst: 0, igst: 0, taxableValue: 0 },
    );

    const purchaseInvoices = await prisma.purchaseInvoice.findMany({
      where: { financialYearId },
    });

    const inputGST = purchaseInvoices.reduce(
      (acc, inv) => ({
        cgst: acc.cgst + inv.cgstTotal,
        sgst: acc.sgst + inv.sgstTotal,
        igst: acc.igst + inv.igstTotal,
        taxableValue: acc.taxableValue + inv.totalAmount,
      }),
      { cgst: 0, sgst: 0, igst: 0, taxableValue: 0 },
    );

    const expenseVouchers = await prisma.expenseVoucher.findMany({
      where: { financialYearId },
    });

    const expenseGST = expenseVouchers.reduce(
      (acc, exp) => ({
        cgst: acc.cgst + exp.cgstAmount,
        sgst: acc.sgst + exp.sgstAmount,
        igst: acc.igst + exp.igstAmount,
      }),
      { cgst: 0, sgst: 0, igst: 0 },
    );

    const totalInputCGST = inputGST.cgst + expenseGST.cgst;
    const totalInputSGST = inputGST.sgst + expenseGST.sgst;
    const totalInputIGST = inputGST.igst + expenseGST.igst;

    return {
      outputTax: {
        taxableValue: outputGST.taxableValue,
        cgst: outputGST.cgst,
        sgst: outputGST.sgst,
        igst: outputGST.igst,
        total: outputGST.cgst + outputGST.sgst + outputGST.igst,
      },
      inputTaxCredit: {
        fromPurchases: inputGST,
        fromExpenses: expenseGST,
        totalCGST: totalInputCGST,
        totalSGST: totalInputSGST,
        totalIGST: totalInputIGST,
        total: totalInputCGST + totalInputSGST + totalInputIGST,
      },
      netTaxLiability: {
        cgst: outputGST.cgst - totalInputCGST,
        sgst: outputGST.sgst - totalInputSGST,
        igst: outputGST.igst - totalInputIGST,
        total:
          outputGST.cgst +
          outputGST.sgst +
          outputGST.igst -
          (totalInputCGST + totalInputSGST + totalInputIGST),
      },
    };
  },

  async ledgerStatement(accountId: string, financialYearId: string) {
    const account = await prisma.ledgerAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error("Account not found");

    const entries = await prisma.ledgerEntry.findMany({
      where: { ledgerAccountId: accountId, financialYearId },
      include: { voucher: true },
      orderBy: { date: "asc" },
    });

    let runningBalance = 0;
    const statement = entries.map((entry) => {
      runningBalance += entry.debit - entry.credit;
      return {
        date: entry.date,
        voucherNumber: entry.voucher.voucherNumber,
        voucherType: entry.voucher.voucherType,
        narration: entry.narration,
        debit: entry.debit,
        credit: entry.credit,
        balance: runningBalance,
      };
    });

    return {
      account: {
        name: account.name,
        code: account.code,
        type: account.accountType,
      },
      entries: statement,
      closingBalance: runningBalance,
    };
  },

  async stockSummary() {
    const movements = await prisma.stockMovement.findMany({
      include: { item: true, warehouse: true },
    });

    const summary: Record<string, any> = {};

    for (const m of movements) {
      const key = `${m.itemId}-${m.warehouseId}`;
      if (!summary[key]) {
        summary[key] = {
          item: m.item.name,
          warehouse: m.warehouse.name,
          totalIn: 0,
          totalOut: 0,
          currentStock: 0,
        };
      }
      if (m.movementType === "IN") {
        summary[key].totalIn += m.quantity;
      } else {
        summary[key].totalOut += m.quantity;
      }
      summary[key].currentStock = summary[key].totalIn - summary[key].totalOut;
    }

    return Object.values(summary);
  },
};
