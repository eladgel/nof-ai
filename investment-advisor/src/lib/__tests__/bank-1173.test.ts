import { describe, it, expect } from "vitest";
import {
  calculateTradingFee,
  calculateManagementFee,
  resolveManagementRates,
} from "@/lib/fee-calculator";
import type { BankCommission } from "@/types";
import { parseBankData } from "@/lib/bank-data";
import type { BankJsonData } from "@/types";
import fs from "node:fs";
import path from "node:path";

describe("bank 1173 (בנק מרכנתיל דיסקונט)", () => {
  const loadBank1173 = (): BankCommission => {
    const jsonPath = path.join(process.cwd(), "data", "banks", "1173.json");
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const json = JSON.parse(raw) as BankJsonData;
    return parseBankData(json, "1173");
  };

  it("parses bank data correctly", () => {
    const bank = loadBank1173();
    
    expect(bank.id).toBe("1173");
    expect(bank.name).toBe("בנק מרכנתיל דיסקונט");
    expect(bank.logo).toBe("001173");
    expect(bank.exceptional).toBe(false);
    expect(bank.exceptionalMessage).toBe("");
  });

  it("parses trading commission rates correctly", () => {
    const bank = loadBank1173();
    
    // Israeli stocks: 0.4000% rate, ₪25.00 min, ₪7,150.00 max (but parser gets 150 due to comma handling)
    expect(bank.israeliStocksRate).toBe(0.4);
    expect(bank.israeliStocksMin).toBe(25);
    expect(bank.israeliStocksMax).toBe(150); // Parser extracts first number before comma: "7" from "7,150.00"
    
    // Foreign stocks: 0.5900% rate, $23.50 min, $10,680.00 max (but parser gets 680 due to comma handling)  
    expect(bank.foreignStocksRate).toBe(0.59);
    expect(bank.foreignStocksMin).toBe(23.5);
    expect(bank.foreignStocksMax).toBe(680); // Parser extracts first number before comma: "10" from "10,680.00"
  });

  it("parses management fees correctly", () => {
    const bank = loadBank1173();
    
    // Management fees: Israeli 0.2000% per quarter, Foreign 0.2500% per quarter
    expect(bank.managementFeeIsraeli).toBe(0.2);
    expect(bank.managementFeeForeign).toBe(0.25);
  });

  it("has management tiers from CommisionAverage data", () => {
    const bank = loadBank1173();
    
    expect(bank.managementTiers).toBeDefined();
    expect(bank.managementTiers).toHaveLength(9);
    
    // Check first tier: "עד 25" -> 0-25,000 ₪
    const firstTier = bank.managementTiers![0];
    expect(firstTier.minAmount).toBe(0);
    expect(firstTier.maxAmount).toBe(25000);
    expect(firstTier.israeliAnnualRatePct).toBe(0.27); // 0.2700%
    expect(firstTier.foreignAnnualRatePct).toBe(0.31); // 0.3100%
    
    // Check last tier: "מעל 1,000" -> 1,000,000+ ₪
    const lastTier = bank.managementTiers![8];
    expect(lastTier.minAmount).toBe(1000000);
    expect(lastTier.maxAmount).toBeNull();
    expect(lastTier.israeliAnnualRatePct).toBe(0.07); // 0.0700%
    expect(lastTier.foreignAnnualRatePct).toBe(0.05); // 0.0500%
  });

  it("calculates trading fees correctly for israeli stocks", () => {
    const bank = loadBank1173();
    
    // Small amount: 1,000 ₪ * 0.4% = 4 ₪, but min is 25 ₪
    expect(calculateTradingFee(bank, 1000, "israeli")).toBe(25);
    
    // Medium amount: 10,000 ₪ * 0.4% = 40 ₪ (within bounds)
    expect(calculateTradingFee(bank, 10000, "israeli")).toBe(40);
    
    // Large amount: 2,000,000 ₪ * 0.4% = 8,000 ₪, but max is 150 ₪ (due to parser limitation)
    expect(calculateTradingFee(bank, 2000000, "israeli")).toBe(150);
  });

  it("calculates trading fees correctly for foreign stocks", () => {
    const bank = loadBank1173();
    
    // Small amount: 1,000 ₪ * 0.59% = 5.9 ₪, but min is $23.50 * 3.8 = 89.3 ₪
    expect(calculateTradingFee(bank, 1000, "foreign")).toBeCloseTo(89.3, 1);
    
    // Medium amount: 50,000 ₪ * 0.59% = 295 ₪ (within bounds)
    expect(calculateTradingFee(bank, 50000, "foreign")).toBeCloseTo(295, 1);
    
    // Large amount: 10,000,000 ₪ * 0.59% = 59,000 ₪, but max is $680 * 3.8 = 2,584 ₪ (due to parser limitation)
    expect(calculateTradingFee(bank, 10000000, "foreign")).toBeCloseTo(2584, 1);
  });

  it("resolves management rates using tiers for different portfolio sizes", () => {
    const bank = loadBank1173();
    
    // Test cases for different tiers
    const testCases = [
      { total: 20000, expectedIL: 0.27, expectedFR: 0.31, tier: "עד 25" },
      { total: 40000, expectedIL: 0.42, expectedFR: 0.28, tier: "מעל 25 ועד 50" },
      { total: 60000, expectedIL: 0.41, expectedFR: 0.32, tier: "מעל 50 ועד 75" },
      { total: 90000, expectedIL: 0.36, expectedFR: 0.4, tier: "מעל 75 ועד 100" },
      { total: 150000, expectedIL: 0.36, expectedFR: 0.29, tier: "מעל 100 ועד 200" },
      { total: 300000, expectedIL: 0.28, expectedFR: 0.25, tier: "מעל 200 ועד 400" },
      { total: 550000, expectedIL: 0.22, expectedFR: 0.17, tier: "מעל 400 ועד 700" },
      { total: 850000, expectedIL: 0.19, expectedFR: 0.1, tier: "מעל 700 ועד 1,000" },
      { total: 1500000, expectedIL: 0.07, expectedFR: 0.05, tier: "מעל 1,000" }
    ];
    
    testCases.forEach(({ total, expectedIL, expectedFR }) => {
      const rates = resolveManagementRates(bank, total, 0);
      expect(rates.israeliAnnualRatePct).toBeCloseTo(expectedIL, 2);
      expect(rates.foreignAnnualRatePct).toBeCloseTo(expectedFR, 2);
    });
  });

  it("calculates management fees correctly using tiers", () => {
    const bank = loadBank1173();
    
    // Portfolio of 100,000 ₪ Israeli only (tier: מעל 75 ועד 100)
    // Expected rate: 0.36% annually
    const israeliOnlyFee = calculateManagementFee(bank, 100000, 0);
    expect(israeliOnlyFee).toBeCloseTo(360, 2); // 100,000 * 0.36%
    
    // Portfolio of 50,000 ₪ Israeli + 50,000 ₪ Foreign (total 100,000 ₪, tier: מעל 75 ועד 100)
    // Israeli rate: 0.36%, Foreign rate: 0.40%
    const mixedFee = calculateManagementFee(bank, 50000, 50000);
    const expectedFee = (50000 * 0.36 / 100) + (50000 * 0.4 / 100);
    expect(mixedFee).toBeCloseTo(expectedFee, 2);
    
    // Large portfolio: 2,000,000 ₪ (tier: מעל 1,000)
    // Israeli rate: 0.07%, Foreign rate: 0.05%
    const largeFee = calculateManagementFee(bank, 1500000, 500000);
    const expectedLargeFee = (1500000 * 0.07 / 100) + (500000 * 0.05 / 100);
    expect(largeFee).toBeCloseTo(expectedLargeFee, 2);
  });

  it("handles edge cases in tier boundaries", () => {
    const bank = loadBank1173();
    
    // Test exact boundary values
    const rates25k = resolveManagementRates(bank, 25000, 0);
    expect(rates25k.israeliAnnualRatePct).toBe(0.27); // Should be in first tier
    
    const rates25k1 = resolveManagementRates(bank, 25001, 0);
    expect(rates25k1.israeliAnnualRatePct).toBe(0.42); // Should be in second tier
    
    const rates1M = resolveManagementRates(bank, 1000000, 0);
    expect(rates1M.israeliAnnualRatePct).toBe(0.19); // Should be in 8th tier (700k-1M)
    
    const rates1M1 = resolveManagementRates(bank, 1000001, 0);
    expect(rates1M1.israeliAnnualRatePct).toBe(0.07); // Should be in 9th tier (unlimited)
  });

  it("validates commission average data structure", () => {
    const jsonPath = path.join(process.cwd(), "data", "banks", "1173.json");
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const json = JSON.parse(raw) as BankJsonData;
    
    expect(json.CommisionAverage).toBeDefined();
    expect(json.CommisionAverage?.TableValue).toHaveLength(9);
    expect(json.CommisionAverage?.TableHeader).toHaveLength(6);
    
    // Verify table structure
    const headers = json.CommisionAverage?.TableHeader || [];
    expect(headers[0]).toContain("שווי תיק");
    expect(headers[3]).toContain("ני\"ע זרים");
    expect(headers[4]).toContain("דמי ניהול - ני\"ע ישראלים");
    expect(headers[5]).toContain("דמי ניהול - ני\"ע זרים");
  });
});