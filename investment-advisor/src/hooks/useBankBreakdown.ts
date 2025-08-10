"use client";

import { useMemo } from "react";
import { BankCommission } from "@/types";
import {
  calculateManagementFee,
  calculateTradingFee,
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

    const israeliFee = calculateTradingFee(bank, israeliAmount, "israeli");
    const foreignFee = calculateTradingFee(bank, foreignAmount, "foreign");
    const managementFee = calculateManagementFee(
      bank,
      israeliAmount,
      foreignAmount
    );

    const totalBase = Math.max(1, (israeliAmount || 0) + (foreignAmount || 0));
    const { israeliAnnualRatePct, foreignAnnualRatePct } = resolveManagementRates(
      bank,
      israeliAmount,
      foreignAmount
    );
    const managementRate =
      totalBase > 0
        ? ((israeliAmount || 0) * israeliAnnualRatePct +
            (foreignAmount || 0) * foreignAnnualRatePct) /
          totalBase
        : 0;

    const israeliRate = israeliAmount > 0 ? (israeliFee / israeliAmount) * 100 : 0;
    const foreignRate = foreignAmount > 0 ? (foreignFee / foreignAmount) * 100 : 0;

    return {
      israeliFee,
      israeliRate,
      foreignFee,
      foreignRate,
      managementFee,
      managementRate,
    } as const;
  }, [bank, israeliAmount, foreignAmount]);
}


