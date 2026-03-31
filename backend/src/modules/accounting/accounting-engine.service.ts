import prisma from "../../config/database";
import { PostVoucherInput } from "../../types";

export const accountingEngine = {
  async postVoucher(input: PostVoucherInput) {
    const totalDebit = input.entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = input.entries.reduce((sum, e) => sum + e.credit, 0);

    if (totalDebit !== totalCredit) {
      throw new Error(
        `Voucher does not balance. Debit: ${totalDebit}, Credit: ${totalCredit}`,
      );
    }

    for (const entry of input.entries) {
      if (entry.debit > 0 && entry.credit > 0) {
        throw new Error("A single entry cannot have both debit and credit");
      }
    }

    return prisma.$transaction(async (tx) => {
      const count = await tx.voucher.count({
        where: {
          voucherType: input.voucherType,
          financialYearId: input.financialYearId,
        },
      });
      const voucherNumber = `${input.voucherType}-${count + 1}`;

      const voucher = await tx.voucher.create({
        data: {
          voucherNumber,
          voucherType: input.voucherType,
          date: input.date,
          financialYearId: input.financialYearId,
          referenceModule: input.referenceModule,
          referenceId: input.referenceId,
          narration: input.narration,
          totalAmount: totalDebit,
          createdBy: input.createdBy,
        },
      });

      await tx.ledgerEntry.createMany({
        data: input.entries.map((entry, index) => ({
          voucherId: voucher.id,
          ledgerAccountId: entry.ledgerAccountId,
          debit: entry.debit,
          credit: entry.credit,
          narration: entry.narration || input.narration,
          entryOrder: index,
          date: input.date,
          financialYearId: input.financialYearId,
        })),
      });

      for (const entry of input.entries) {
        const netAmount = entry.debit - entry.credit;
        await tx.ledgerAccount.update({
          where: { id: entry.ledgerAccountId },
          data: { currentBalance: { increment: netAmount } },
        });
      }

      return voucher;
    });
  },

  async reverseVoucher(voucherId: string, reason: string, userId: string) {
    const original = await prisma.voucher.findUnique({
      where: { id: voucherId },
      include: { ledgerEntries: true },
    });

    if (!original) throw new Error("Voucher not found");

    return this.postVoucher({
      voucherType: original.voucherType,
      date: new Date(),
      financialYearId: original.financialYearId,
      referenceModule: original.referenceModule || undefined,
      referenceId: original.referenceId || undefined,
      entries: original.ledgerEntries.map((e) => ({
        ledgerAccountId: e.ledgerAccountId,
        debit: e.credit,
        credit: e.debit,
      })),
      narration: `REVERSAL: ${reason} (Original: ${original.voucherNumber})`,
      createdBy: userId,
    });
  },
};
