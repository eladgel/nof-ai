import { describe, it, expect } from "vitest";
import { resolveManagementRates } from "@/lib/fee-calculator";
import { parseBankData } from "@/lib/bank-data";
import type { BankJsonData } from "@/types";
import fs from "node:fs";
import path from "node:path";

describe("Separate Tier Calculation Logic", () => {
  const loadBank1173 = () => {
    const jsonPath = path.join(process.cwd(), "data", "banks", "1173.json");
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const json = JSON.parse(raw) as BankJsonData;
    return parseBankData(json, "1173");
  };

  it("should calculate tiers separately for Israeli and foreign holdings", () => {
    const bank = loadBank1173();
    
    // Test case: Small Israeli amount + Large foreign amount
    const israeliAmount = 1; // Should be in "עד 25" tier (0.27%)
    const foreignAmount = 2_222_222; // Should be in "מעל 1,000" tier (0.05%)
    
    // Test separate tier calculations
    const israeliRates = resolveManagementRates(bank, israeliAmount, 0);
    const foreignRates = resolveManagementRates(bank, 0, foreignAmount);
    
    // Israeli: ₪1 should get first tier rates
    expect(israeliRates.israeliAnnualRatePct).toBe(0.27); // "עד 25" tier
    
    // Foreign: ₪2,222,222 should get highest tier rates  
    expect(foreignRates.foreignAnnualRatePct).toBe(0.05); // "מעל 1,000" tier
    
    // Calculate fees
    const israeliFee = Math.round(((israeliAmount * israeliRates.israeliAnnualRatePct) / 100) * 1000) / 1000;
    const foreignFee = Math.round(((foreignAmount * foreignRates.foreignAnnualRatePct) / 100) * 1000) / 1000;
    
    // Israeli: ₪1 × 0.270% = ₪0.0027 → rounds to ₪0.003
    expect(israeliFee).toBeCloseTo(0.003, 3);
    
    // Foreign: ₪2,222,222 × 0.050% = ₪1,111.111
    expect(foreignFee).toBeCloseTo(1111.111, 3);
    
    console.log(`✓ Israeli: ₪${israeliAmount.toLocaleString()} × ${israeliRates.israeliAnnualRatePct}% = ₪${israeliFee}`);
    console.log(`✓ Foreign: ₪${foreignAmount.toLocaleString()} × ${foreignRates.foreignAnnualRatePct}% = ₪${foreignFee}`);
    console.log(`✓ Total: ₪${(israeliFee + foreignFee).toFixed(3)}`);
  });

  it("should use correct tiers when both amounts are in different tiers", () => {
    const bank = loadBank1173();
    
    // Test case: Medium Israeli amount + Small foreign amount  
    const israeliAmount = 150_000; // Should be in "מעל 100 ועד 200" tier (0.36%)
    const foreignAmount = 30_000; // Should be in "מעל 25 ועד 50" tier (0.28%)
    
    const israeliRates = resolveManagementRates(bank, israeliAmount, 0);
    const foreignRates = resolveManagementRates(bank, 0, foreignAmount);
    
    // Israeli: ₪150,000 × 0.360% = ₪540
    expect(israeliRates.israeliAnnualRatePct).toBe(0.36);
    const israeliFee = (israeliAmount * israeliRates.israeliAnnualRatePct) / 100;
    expect(israeliFee).toBeCloseTo(540, 2);
    
    // Foreign: ₪30,000 × 0.280% = ₪84  
    expect(foreignRates.foreignAnnualRatePct).toBe(0.28);
    const foreignFee = (foreignAmount * foreignRates.foreignAnnualRatePct) / 100;
    expect(foreignFee).toBeCloseTo(84, 2);
    
    console.log(`✓ Israeli: ₪${israeliAmount.toLocaleString()} × ${israeliRates.israeliAnnualRatePct}% = ₪${israeliFee}`);
    console.log(`✓ Foreign: ₪${foreignAmount.toLocaleString()} × ${foreignRates.foreignAnnualRatePct}% = ₪${foreignFee}`);
  });

  it("should be different from combined tier calculation", () => {
    const bank = loadBank1173();
    
    // Test case where combined vs separate makes a difference
    const israeliAmount = 1;
    const foreignAmount = 2_222_222;
    const totalAmount = israeliAmount + foreignAmount; // 2,222,223
    
    // Test what would happen with COMBINED tier (wrong way)
    const combinedRates = resolveManagementRates(bank, israeliAmount, foreignAmount);
    
    // Test what happens with SEPARATE tiers (correct way)
    const israeliRates = resolveManagementRates(bank, israeliAmount, 0);
    const foreignRates = resolveManagementRates(bank, 0, foreignAmount);
    
    console.log('\\n=== COMPARISON: Combined vs Separate Tier Calculation ===');
    
    // Combined approach (WRONG):
    console.log('Combined approach (using total ₪2,222,223):');
    console.log(`- Both use "מעל 1,000" tier`);
    console.log(`- Israeli rate: ${combinedRates.israeliAnnualRatePct}%`);
    console.log(`- Foreign rate: ${combinedRates.foreignAnnualRatePct}%`);
    
    // Separate approach (CORRECT):
    console.log('\\nSeparate approach:');
    console.log(`- Israeli ₪${israeliAmount} uses "עד 25" tier: ${israeliRates.israeliAnnualRatePct}%`);
    console.log(`- Foreign ₪${foreignAmount.toLocaleString()} uses "מעל 1,000" tier: ${foreignRates.foreignAnnualRatePct}%`);
    
    // The key difference
    expect(israeliRates.israeliAnnualRatePct).toBe(0.27); // Separate: first tier
    expect(combinedRates.israeliAnnualRatePct).toBe(0.07); // Combined: highest tier
    
    const separateIsraeliFee = Math.round(((israeliAmount * israeliRates.israeliAnnualRatePct) / 100) * 1000) / 1000;
    const combinedIsraeliFee = Math.round(((israeliAmount * combinedRates.israeliAnnualRatePct) / 100) * 1000) / 1000;
    
    console.log('\\nIsraeli fee calculation:');
    console.log(`- Separate: ₪${israeliAmount} × ${israeliRates.israeliAnnualRatePct}% = ₪${separateIsraeliFee}`);
    console.log(`- Combined: ₪${israeliAmount} × ${combinedRates.israeliAnnualRatePct}% = ₪${combinedIsraeliFee}`);
    
    expect(separateIsraeliFee).toBeCloseTo(0.003, 3);
    expect(combinedIsraeliFee).toBeCloseTo(0.001, 3);
    expect(separateIsraeliFee).toBeGreaterThan(combinedIsraeliFee);
  });

  it("should verify bank 1173 tiers are loaded correctly", () => {
    const bank = loadBank1173();
    
    expect(bank.managementTiers).toBeDefined();
    expect(bank.managementTiers).toHaveLength(9);
    
    // Verify key tiers
    const firstTier = bank.managementTiers![0];
    expect(firstTier.minAmount).toBe(0);
    expect(firstTier.maxAmount).toBe(25000);
    expect(firstTier.israeliAnnualRatePct).toBe(0.27);
    expect(firstTier.foreignAnnualRatePct).toBe(0.31);
    
    const lastTier = bank.managementTiers![8];
    expect(lastTier.minAmount).toBe(1000000);
    expect(lastTier.maxAmount).toBeNull();
    expect(lastTier.israeliAnnualRatePct).toBe(0.07);
    expect(lastTier.foreignAnnualRatePct).toBe(0.05);
  });
});