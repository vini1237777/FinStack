import prisma from "../../config/database";
import { GSTInput, GSTOutput } from "../../types";

export const gstCalculator = {
  async calculate(input: GSTInput): Promise<GSTOutput> {
    const hsnConfig = await prisma.hsnSacCode.findFirst({
      where: { code: input.hsnCode },
    });

    if (!hsnConfig) {
      throw new Error(`HSN/SAC code ${input.hsnCode} not found`);
    }

    const rate = hsnConfig.gstRate;
    const isInterstate = input.supplierState !== input.customerState;
    const taxAmount = Math.round((input.amount * rate) / 100);

    if (isInterstate) {
      return {
        taxableAmount: input.amount,
        cgst: 0,
        sgst: 0,
        igst: taxAmount,
        totalWithTax: input.amount + taxAmount,
        isInterstate: true,
        rate,
      };
    } else {
      const halfTax = Math.round(taxAmount / 2);
      return {
        taxableAmount: input.amount,
        cgst: halfTax,
        sgst: taxAmount - halfTax,
        igst: 0,
        totalWithTax: input.amount + taxAmount,
        isInterstate: false,
        rate,
      };
    }
  },
};
