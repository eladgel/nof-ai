"use client";
import { useEffect, useMemo, useState } from "react";
import { BankCommission, InvestmentData } from "@/types";
import {
  calculateManagementFee,
  calculateTradingFee,
  resolveManagementRates,
} from "@/lib/fee-calculator";
import { loadInvestmentData, saveInvestmentData } from "@/lib/storage";
import { isIsraeliBank } from "@/lib/bank-utils";
import { BankCard } from "@/components/BankCard";
import { SelectedBankBreakdown } from "@/components/SelectedBankBreakdown";
import { BankSelectorModalTrigger } from "@/components/BankSelectorModal";

export default function InvestmentAdvisor() {
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

  const recommendations = useMemo(() => {
    if (banks.length === 0)
      return [] as Array<{
        bank: BankCommission;
        total: number;
        breakdown: {
          israeliFee: number;
          israeliRate: number;
          foreignFee: number;
          foreignRate: number;
          managementFee: number;
          managementRate: number;
        };
      }>;

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

        const totalBase = Math.max(
          1,
          (israeliAmount || 0) + (foreignAmount || 0)
        );
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
            israeliRate:
              israeliAmount > 0 ? (israeliFee / israeliAmount) * 100 : 0,
            foreignFee,
            foreignRate:
              foreignAmount > 0 ? (foreignFee / foreignAmount) * 100 : 0,
            managementFee,
            managementRate: weightedManagementRate,
          },
        };
      })
      .sort((a, b) => a.total - b.total)
      .slice(0, 8);
  }, [banks, form]);

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <BankSelectorModalTrigger
            banks={banks}
            currentBankId={form.currentBank}
            onSelect={(id) => setForm((f) => ({ ...f, currentBank: id }))}
          />

          <div className="space-y-2">
            <label htmlFor="israeli" className="block text-sm font-medium">
              שווי ני&quot;ע ישראליים (₪)
            </label>
            <input
              id="israeli"
              type="number"
              min={0}
              className="w-full appearance-none rounded-lg border bg-background/50 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.israeliAmount || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  israeliAmount: Number(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="foreign" className="block text-sm font-medium">
              שווי ני&quot;ע זרים (₪)
            </label>
            <input
              id="foreign"
              type="number"
              min={0}
              className="w-full appearance-none rounded-lg border bg-background/50 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.foreignAmount || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  foreignAmount: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
        </div>
        {banks.length > 0 && form.currentBank ? (
          <SelectedBankBreakdown
            bank={banks.find((b) => b.id === form.currentBank) || banks[0]}
            israeliAmount={form.israeliAmount}
            foreignAmount={form.foreignAmount}
          />
        ) : null}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">המלצות מובילות</h2>
        {recommendations.length === 0 ? (
          <p className="text-muted-foreground">אין נתוני בנקים להצגה עדיין.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                בנקים ישראליים
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {recommendations
                  .filter(({ bank }) => isIsraeliBank(bank.id))
                  .map(({ bank, total, breakdown }) => (
                    <li
                      key={bank.id}
                      className="rounded-xl border p-4 shadow-sm bg-card hover:shadow-md transition-shadow"
                    >
                      <BankCard
                        bank={bank}
                        total={total}
                        breakdown={breakdown}
                      />
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                בתי השקעות / חברי בורסה
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {recommendations
                  .filter(({ bank }) => !isIsraeliBank(bank.id))
                  .map(({ bank, total, breakdown }) => (
                    <li
                      key={bank.id}
                      className="rounded-xl border p-4 shadow-sm bg-card hover:shadow-md transition-shadow"
                    >
                      <BankCard
                        bank={bank}
                        total={total}
                        breakdown={breakdown}
                      />
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
