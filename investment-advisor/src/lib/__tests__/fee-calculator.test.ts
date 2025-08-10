import { describe, it, expect } from "vitest";
import {
  calculateTradingFee,
  calculateManagementFee,
  resolveManagementRates,
} from "@/lib/fee-calculator";
import type { BankCommission } from "@/types";

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
    const total = amountIL + amountFR; // 200k → tier [100k, 500k]
    const rates = resolveManagementRates(tieredBank, amountIL, amountFR);

    expect(rates.israeliAnnualRatePct).toBeCloseTo(0.4, 6);
    expect(rates.foreignAnnualRatePct).toBeCloseTo(0.6, 6);

    const fee = calculateManagementFee(tieredBank, amountIL, amountFR);
    // 120k * 0.4% = 480 ; 80k * 0.6% = 480 ; total 960
    expect(fee).toBeCloseTo(960, 4);
  });
});


