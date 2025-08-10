export interface BankCommission {
  id: string;
  name: string;
  logo: string;
  israeliStocksRate: number;
  israeliStocksMin: number;
  israeliStocksMax: number;
  foreignStocksRate: number;
  foreignStocksMin: number;
  foreignStocksMax: number;
  managementFeeIsraeli: number;
  managementFeeForeign: number;
  managementTiers?: ManagementTier[];
  exceptional?: boolean;
  exceptionalMessage?: string;
}

export interface InvestmentData {
  currentBank: string;
  israeliAmount: number;
  foreignAmount: number;
}

export interface Recommendation {
  bank: BankCommission;
  totalFee: number;
  savings: number;
  savingsPercentage: number;
  breakdown: {
    israeliFee: number;
    foreignFee: number;
    managementFee: number;
  };
}

export interface CommissionTableRow {
  HasNoService: number;
  DescHeb: string;
  Cols: (string | null)[];
}

export interface BankJsonData {
  Name: string;
  Logo: string;
  Comment: string;
  ExceptionalMessage: string;
  Exceptional: boolean;
  CommisionTaarifon: {
    DateUpdate: string;
    Comment: string | null;
    TableRow: CommissionTableRow[];
    TableHeader: string[];
  };
  CommisionAverage?: {
    DateFrom: string;
    DateTo: string;
    Comment: string | null;
    TableValue: string[][]; // rows of values as strings
    TableHeader: string[];
    TableTooltipInfoHeader: string[];
  };
}

export interface ManagementTier {
  minAmount: number; // inclusive, in ₪
  maxAmount: number | null; // inclusive upper bound; null means Infinity
  israeliAnnualRatePct: number; // percent number, e.g. 0.17 = 0.17%
  foreignAnnualRatePct: number; // percent number, e.g. 0.19 = 0.19%
}


