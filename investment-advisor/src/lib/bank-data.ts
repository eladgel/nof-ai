import { BankCommission, BankJsonData } from "@/types";

export function parseBankData(jsonData: BankJsonData, id: string): BankCommission {
  const commissionRows = jsonData.CommisionTaarifon.TableRow;

  const israeliStocksRow = commissionRows.find((row) =>
    row.DescHeb.includes('ני"ע ישראלים: מניות, אג"ח')
  );

  const foreignStocksRow = commissionRows.find((row) =>
    row.DescHeb.includes('ני"ע בחו"ל') && row.DescHeb.includes('מניות, אג"ח')
  );

  const managementIsraeliRow = commissionRows.find((row) =>
    row.DescHeb.includes('דמי ניהול') && row.DescHeb.includes('ישראל')
  );

  const managementForeignRow = commissionRows.find((row) =>
    row.DescHeb.includes('דמי ניהול') && row.DescHeb.includes('חו"ל')
  );

  const parseCommissionString = (
    str: string
  ): { rate: number; min: number; max: number } => {
    const rate = parseFloat(str.match(/(\d+\.?\d*)\s*%/i)?.[1] || "0");
    const min = parseFloat(
      str.match(/(\d+\.?\d*)\s*₪/i)?.[1] || str.match(/(\d+\.?\d*)\s*\$/i)?.[1] || "0"
    );
    const max = 0;
    return { rate, min, max };
  };

  return {
    id,
    name: jsonData.Name,
    logo: jsonData.Logo,
    israeliStocksRate: israeliStocksRow ? parseCommissionString(israeliStocksRow.Cols[0] || "").rate : 0,
    israeliStocksMin: israeliStocksRow ? parseCommissionString(israeliStocksRow.Cols[1] || "").min : 0,
    israeliStocksMax: israeliStocksRow ? parseCommissionString(israeliStocksRow.Cols[2] || "").min : 0,
    foreignStocksRate: foreignStocksRow ? parseCommissionString(foreignStocksRow.Cols[0] || "").rate : 0,
    foreignStocksMin: foreignStocksRow ? parseCommissionString(foreignStocksRow.Cols[1] || "").min : 0,
    foreignStocksMax: foreignStocksRow ? parseCommissionString(foreignStocksRow.Cols[2] || "").min : 0,
    managementFeeIsraeli: managementIsraeliRow ? parseCommissionString(managementIsraeliRow.Cols[0] || "").rate : 0,
    managementFeeForeign: managementForeignRow ? parseCommissionString(managementForeignRow.Cols[0] || "").rate : 0,
    exceptional: jsonData.Exceptional,
    exceptionalMessage: jsonData.ExceptionalMessage,
  };
}

export const banksData: BankCommission[] = [];


