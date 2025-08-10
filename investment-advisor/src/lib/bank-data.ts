import { BankCommission, BankJsonData, ManagementTier } from "@/types";

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

  // Parse management tiers from CommisionAverage if available
  const tiers: ManagementTier[] | undefined = (() => {
    if (!jsonData.CommisionAverage || !Array.isArray(jsonData.CommisionAverage.TableValue)) {
      return undefined;
    }
    try {
      const rows = jsonData.CommisionAverage.TableValue;
      // Expect columns: [rangeHeb, ..., ..., ..., israeliMgmt, foreignMgmt]
      return rows.map((cols) => {
        const rangeHeb = cols[0] || "";
        const israeliMgmtStr = cols[4] || "0%";
        const foreignMgmtStr = cols[5] || "0%";

        const [minAmount, maxAmount] = (() => {
          // normalize Hebrew range text to extract thousands
          const cleaned = rangeHeb.replace(/[,\s]/g, "");
          // cases: "עד25" or "מעל25ועד50" or "מעל1000"
          if (/^עד\d+/.test(cleaned)) {
            const upTo = Number(cleaned.match(/\d+/)?.[0] || "0");
            return [0, upTo * 1000];
          }
          if (/^מעל\d+ועד\d+/.test(cleaned)) {
            const nums = cleaned.match(/\d+/g) || [];
            const low = Number(nums[0] || 0) * 1000;
            const high = Number(nums[1] || 0) * 1000;
            return [low, high];
          }
          if (/^מעל\d+/.test(cleaned)) {
            const low = Number(cleaned.match(/\d+/)?.[0] || 0) * 1000;
            return [low, null];
          }
          return [0, null];
        })();

        const parsePct = (s: string) => parseFloat((s.match(/(\d+\.?\d*)%/)?.[1] || "0"));
        return {
          minAmount,
          maxAmount,
          israeliAnnualRatePct: parsePct(israeliMgmtStr),
          foreignAnnualRatePct: parsePct(foreignMgmtStr),
        } as ManagementTier;
      });
    } catch {
      return undefined;
    }
  })();

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
    managementTiers: tiers,
    exceptional: jsonData.Exceptional,
    exceptionalMessage: jsonData.ExceptionalMessage,
  };
}

export const banksData: BankCommission[] = [];


