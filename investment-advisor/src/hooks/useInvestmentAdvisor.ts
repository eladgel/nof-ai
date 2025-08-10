"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BankCommission, InvestmentData } from "@/types";
import {
  calculateManagementFee,
  calculateTradingFee,
  resolveManagementRates,
} from "@/lib/fee-calculator";
import { loadInvestmentData, saveInvestmentData } from "@/lib/storage";

export type RecommendationBreakdown = {
  israeliFee: number;
  israeliRate: number;
  foreignFee: number;
  foreignRate: number;
  managementFee: number;
  managementRate: number;
};

export type RecommendationResult = {
  bank: BankCommission;
  total: number;
  breakdown: RecommendationBreakdown;
};

export function useInvestmentAdvisor() {
  const [banks, setBanks] = useState<BankCommission[]>([]);
  const [form, setForm] = useState<InvestmentData>({
    currentBank: "",
    israeliAmount: 0,
    foreignAmount: 0,
  });

  useEffect(() => {
    const saved = loadInvestmentData();
    if (saved) setForm(saved);
  }, []);

  useEffect(() => {
    fetch("/api/banks")
      .then((r) => r.json())
      .then((data: BankCommission[]) => setBanks(data))
      .catch(() => setBanks([]));
  }, []);

  useEffect(() => {
    saveInvestmentData(form);
  }, [form]);

  const setCurrentBank = useCallback((id: string) => {
    setForm((f) => ({ ...f, currentBank: id }));
  }, []);

  const setIsraeliAmount = useCallback((amount: number) => {
    setForm((f) => ({ ...f, israeliAmount: amount }));
  }, []);

  const setForeignAmount = useCallback((amount: number) => {
    setForm((f) => ({ ...f, foreignAmount: amount }));
  }, []);

  const recommendations: RecommendationResult[] = useMemo(() => {
    if (banks.length === 0) return [];

    const { israeliAmount, foreignAmount } = form;

    return banks
      .map((bank) => {
        const israeliFee = calculateTradingFee(bank, israeliAmount, "israeli");
        const foreignFee = calculateTradingFee(bank, foreignAmount, "foreign");
        const managementFee = calculateManagementFee(
          bank,
          israeliAmount,
          foreignAmount
        );
        const total = israeliFee + foreignFee + managementFee;

        const totalBase = Math.max(1, (israeliAmount || 0) + (foreignAmount || 0));
        const { israeliAnnualRatePct, foreignAnnualRatePct } =
          resolveManagementRates(bank, israeliAmount, foreignAmount);
        const weightedManagementRate =
          totalBase > 0
            ? ((israeliAmount || 0) * israeliAnnualRatePct +
                (foreignAmount || 0) * foreignAnnualRatePct) /
              totalBase
            : 0;

        return {
          bank,
          total,
          breakdown: {
            israeliFee,
            israeliRate: israeliAmount > 0 ? (israeliFee / israeliAmount) * 100 : 0,
            foreignFee,
            foreignRate: foreignAmount > 0 ? (foreignFee / foreignAmount) * 100 : 0,
            managementFee,
            managementRate: weightedManagementRate,
          },
        } as RecommendationResult;
      })
      .sort((a, b) => a.total - b.total)
      .slice(0, 8);
  }, [banks, form]);

  return {
    banks,
    form,
    setForm,
    setCurrentBank,
    setIsraeliAmount,
    setForeignAmount,
    recommendations,
  } as const;
}


