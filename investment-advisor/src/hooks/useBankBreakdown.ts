"use client";

import { useMemo } from "react";
import { BankCommission } from "@/types";
import {
  resolveManagementRates,
} from "@/lib/fee-calculator";

export function useBankBreakdown(
  bank: BankCommission | null | undefined,
  israeliAmount: number,
  foreignAmount: number
) {
  return useMemo(() => {
    if (!bank) {
      return {
        israeliFee: 0,
        israeliRate: 0,
        foreignFee: 0,
        foreignRate: 0,
        managementFee: 0,
        managementRate: 0,
      } as const;
    }

    // Calculate management fees for Israeli and foreign securities separately
    // Each should use its own tier based on its individual amount
    const israeliRates = resolveManagementRates(bank, israeliAmount, 0);
    const foreignRates = resolveManagementRates(bank, 0, foreignAmount);
    
    const israeliFee = israeliAmount > 0 ? Math.round(((israeliAmount * israeliRates.israeliAnnualRatePct) / 100) * 1000) / 1000 : 0;
    const foreignFee = foreignAmount > 0 ? Math.round(((foreignAmount * foreignRates.foreignAnnualRatePct) / 100) * 1000) / 1000 : 0;
   
    const israeliRate = israeliRates.israeliAnnualRatePct;
    const foreignRate = foreignRates.foreignAnnualRatePct;

    return {
      israeliFee,
      israeliRate,
      foreignFee,
      foreignRate
    } as const;
  }, [bank, israeliAmount, foreignAmount]);
}


