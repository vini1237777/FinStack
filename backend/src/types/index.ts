export interface VoucherEntry {
  ledgerAccountId: string;
  debit: number;
  credit: number;
  narration?: string;
}

export interface PostVoucherInput {
  voucherType: string;
  date: Date;
  financialYearId: string;
  referenceModule?: string;
  referenceId?: string;
  entries: VoucherEntry[];
  narration: string;
  createdBy: string;
}

export interface GSTInput {
  amount: number;
  hsnCode: string;
  supplierState: string;
  customerState: string;
}

export interface GSTOutput {
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalWithTax: number;
  isInterstate: boolean;
  rate: number;
}
