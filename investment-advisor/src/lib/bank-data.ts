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

  const parseRate = (str: string | null | undefined): number => {
    if (!str) return 0;
    return parseFloat(str.match(/(\d+\.?\d*)\s*%/i)?.[1] || "0");
  };

  const parseCurrency = (str: string | null | undefined): number => {
    if (!str) return 0;
    return parseFloat(
      str.match(/(\d+\.?\d*)\s*₪/i)?.[1] ||
        str.match(/(\d+\.?\d*)\s*\$/i)?.[1] ||
        "0"
    );
  };

  return {
    id,
    name: jsonData.Name,
    logo: jsonData.Logo,
    israeliStocksRate: israeliStocksRow ? parseRate(israeliStocksRow.Cols[0]) : 0,
    israeliStocksMin: israeliStocksRow ? parseCurrency(israeliStocksRow.Cols[1]) : 0,
    israeliStocksMax: israeliStocksRow ? parseCurrency(israeliStocksRow.Cols[2]) : 0,
    foreignStocksRate: foreignStocksRow ? parseRate(foreignStocksRow.Cols[0]) : 0,
    foreignStocksMin: foreignStocksRow ? parseCurrency(foreignStocksRow.Cols[1]) : 0,
    foreignStocksMax: foreignStocksRow ? parseCurrency(foreignStocksRow.Cols[2]) : 0,
    managementFeeIsraeli: managementIsraeliRow ? parseRate(managementIsraeliRow.Cols[0]) : 0,
    managementFeeForeign: managementForeignRow ? parseRate(managementForeignRow.Cols[0]) : 0,
    exceptional: jsonData.Exceptional,
    exceptionalMessage: jsonData.ExceptionalMessage,
  };
}

export const banksData: BankCommission[] = [];


