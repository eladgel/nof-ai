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

const mockBank: BankCommission = {
  id: "1234",
  name: "Mock Bank",
  logo: "",
  israeliStocksRate: 0.2, // 0.2%
  israeliStocksMin: 10,
  israeliStocksMax: 200,
  foreignStocksRate: 0.1, // 0.1%
  foreignStocksMin: 3, // in $; code multiplies by 3.8
  foreignStocksMax: 50, // in $; code multiplies by 3.8
  managementFeeIsraeli: 0.25, // 0.25% per quarter
  managementFeeForeign: 0.3, // 0.3% per quarter
};

describe("fee-calculator", () => {
  it("calculates trading fee for israeli with min/max bounds and percent", () => {
    // amount 1000 -> 0.2% = 2, but min is 10 → expect 10
    expect(calculateTradingFee(mockBank, 1000, "israeli")).toBe(10);

    // amount 200000 -> 0.2% = 400, but max is 200 → expect 200
    expect(calculateTradingFee(mockBank, 200000, "israeli")).toBe(200);

    // amount 100000 -> 0.2% = 200, within bounds → expect 200
    expect(calculateTradingFee(mockBank, 100000, "israeli")).toBe(200);
  });

  it("calculates trading fee for foreign with NIS conversion on min/max", () => {
    // foreign min/max are in $, conversion factor 3.8
    // amount 1000 -> 0.1% = 1, but min is 3 * 3.8 = 11.4 → expect 11.4
    expect(calculateTradingFee(mockBank, 1000, "foreign")).toBeCloseTo(11.4, 6);

    // amount 1,000,000 -> 0.1% = 1000, but max is 50 * 3.8 = 190 → expect 190
    expect(calculateTradingFee(mockBank, 1_000_000, "foreign")).toBeCloseTo(190, 6);
  });

  it("resolves annual management rates from quarterly flat rates", () => {
    const rates = resolveManagementRates(mockBank, 50_000, 50_000);
    // Quarterly 0.25% -> annual 1%; Quarterly 0.3% -> annual 1.2%
    expect(rates.israeliAnnualRatePct).toBeCloseTo(1.0, 6);
    expect(rates.foreignAnnualRatePct).toBeCloseTo(1.2, 6);
  });

  it("calculates management fee from quarterly rates when no tiers exist", () => {
    const fee = calculateManagementFee(mockBank, 100_000, 200_000);
    // Israeli: 0.25% per quarter => annual 1% of 100k = 1000
    // Foreign: 0.3% per quarter => annual 1.2% of 200k = 2400
    // total 3400
    expect(fee).toBeCloseTo(3400, 4);
  });

  it("uses tiered management rates when tiers exist and returns correct % and NIS", () => {
    const tieredBank: BankCommission = {
      ...mockBank,
      managementTiers: [
        { minAmount: 0, maxAmount: 100_000, israeliAnnualRatePct: 0.6, foreignAnnualRatePct: 0.8 },
        { minAmount: 100_000, maxAmount: 500_000, israeliAnnualRatePct: 0.4, foreignAnnualRatePct: 0.6 },
        { minAmount: 500_000, maxAmount: null, israeliAnnualRatePct: 0.2, foreignAnnualRatePct: 0.3 },
      ],
    };

    const amountIL = 120_000;
    const amountFR = 80_000;
    const rates = resolveManagementRates(tieredBank, amountIL, amountFR);

    expect(rates.israeliAnnualRatePct).toBeCloseTo(0.4, 6);
    expect(rates.foreignAnnualRatePct).toBeCloseTo(0.6, 6);

    const fee = calculateManagementFee(tieredBank, amountIL, amountFR);
    // 120k * 0.4% = 480 ; 80k * 0.6% = 480 ; total 960
    expect(fee).toBeCloseTo(960, 4);
  });

  describe("bank 1107 management tiers (from JSON)", () => {
    const loadBank1107 = (): BankCommission => {
      const jsonPath = path.join(process.cwd(), "data", "banks", "1107.json");
      const raw = fs.readFileSync(jsonPath, "utf-8");
      const json = JSON.parse(raw) as BankJsonData;
      return parseBankData(json, "1107");
    };

    it("resolves rates for total <= 25,000 ₪", () => {
      const bank = loadBank1107();
      // Use boundary value exactly 25,000 to ensure correct bucket selection
      const rates = resolveManagementRates(bank, 25_000, 0);
      expect(rates.israeliAnnualRatePct).toBeCloseTo(0.17, 6);
      expect(rates.foreignAnnualRatePct).toBeCloseTo(0.19, 6);

      const fee = calculateManagementFee(bank, 25_000, 0);
      // 25,000 * 0.17% = 42.5
      expect(fee).toBeCloseTo(42.5, 3);
    });

    it("resolves rates for 25,000 < total <= 50,000 ₪", () => {
      const bank = loadBank1107();
      const rates = resolveManagementRates(bank, 30_000, 0);
      // According to 1107.json: IL 0.3100%, Foreign 0.5000%
      expect(rates.israeliAnnualRatePct).toBeCloseTo(0.31, 6);
      expect(rates.foreignAnnualRatePct).toBeCloseTo(0.5, 6);

      const fee = calculateManagementFee(bank, 30_000, 0);
      // 30,000 * 0.31% = 93
      expect(fee).toBeCloseTo(93, 3);
    });

    it("resolves rates for all remaining tiers using representative totals", () => {
      const bank = loadBank1107();
      const cases: Array<{ total: number; il: number; fr: number; note?: string }> = [
        { total: 12_000, il: 0.17, fr: 0.19, note: "עד 25" },
        { total: 30_000, il: 0.31, fr: 0.5, note: "מעל 25 ועד 50" },
        { total: 60_000, il: 0.31, fr: 0.47, note: "מעל 50 ועד 75" },
        { total: 90_000, il: 0.31, fr: 0.42, note: "מעל 75 ועד 100" },
        { total: 150_000, il: 0.29, fr: 0.39, note: "מעל 100 ועד 200" },
        { total: 300_000, il: 0.27, fr: 0.33, note: "מעל 200 ועד 400" },
        { total: 600_000, il: 0.23, fr: 0.26, note: "מעל 400 ועד 700" },
        { total: 900_000, il: 0.2, fr: 0.22, note: "מעל 700 ועד 1,000" },
        { total: 1_200_000, il: 0.08, fr: 0.1, note: "מעל 1,000" },
      ];

      cases.forEach(({ total, il, fr }) => {
        const rates = resolveManagementRates(bank, total, 0);
        expect(rates.israeliAnnualRatePct).toBeCloseTo(il, 6);
        expect(rates.foreignAnnualRatePct).toBeCloseTo(fr, 6);

        // Also validate fee for Israeli-only to match exact rate
        const fee = calculateManagementFee(bank, total, 0);
        expect(fee).toBeCloseTo((total * il) / 100, 3);
      });
    });
  });
});


