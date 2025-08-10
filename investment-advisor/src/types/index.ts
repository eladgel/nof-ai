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
}


