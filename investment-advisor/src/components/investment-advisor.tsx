"use client";
import { useEffect, useMemo, useState } from "react";
import { BankCommission, InvestmentData } from "@/types";
import { calculateManagementFee, calculateTotalFee, calculateTradingFee } from "@/lib/fee-calculator";
import { loadInvestmentData, saveInvestmentData } from "@/lib/storage";

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

        const totalBase = Math.max(1, (israeliAmount || 0) + (foreignAmount || 0));
        return {
          bank,
          total,
          breakdown: {
            israeliFee,
            israeliRate: israeliAmount > 0 ? (israeliFee / israeliAmount) * 100 : 0,
            foreignFee,
            foreignRate: foreignAmount > 0 ? (foreignFee / foreignAmount) * 100 : 0,
            managementFee,
            managementRate: totalBase > 0 ? (managementFee / totalBase) * 100 : 0,
          },
        };
      })
      .sort((a, b) => a.total - b.total)
      .slice(0, 5);
  }, [banks, form]);

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="bank" className="block text-sm font-medium">
              בחר בנק נוכחי
            </label>
            <select
              id="bank"
              className="w-full rounded-md border px-3 py-2"
              value={form.currentBank}
              onChange={(e) =>
                setForm((f) => ({ ...f, currentBank: e.target.value }))
              }
            >
              <option value="">—</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="israeli" className="block text-sm font-medium">
              שווי ני&quot;ע ישראליים (₪)
            </label>
            <input
              id="israeli"
              type="number"
              min={0}
              className="w-full rounded-md border px-3 py-2"
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
              className="w-full rounded-md border px-3 py-2"
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
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map(({ bank, total, breakdown }) => (
              <li key={bank.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{bank.name}</div>
                  <div className="text-sm text-muted-foreground">{bank.id}</div>
                </div>
                <div className="mt-3 text-sm">סה&quot;כ עמלות שנתיות</div>
                <div className="text-2xl font-bold">
                  ₪ {total.toLocaleString()}
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">מסחר ישראלי</span>
                    <span>
                      ₪ {breakdown.israeliFee.toLocaleString()} ({
                        breakdown.israeliRate.toFixed(3)
                      }%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">מסחר חו&quot;ל</span>
                    <span>
                      ₪ {breakdown.foreignFee.toLocaleString()} ({
                        breakdown.foreignRate.toFixed(3)
                      }%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">דמי ניהול</span>
                    <span>
                      ₪ {breakdown.managementFee.toLocaleString()} ({
                        breakdown.managementRate.toFixed(3)
                      }%)
                    </span>
                  </div>
                </div>
                {bank.exceptional && bank.exceptionalMessage ? (
                  <div className="mt-2 text-xs text-amber-600">
                    {bank.exceptionalMessage}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SelectedBankBreakdown({
  bank,
  israeliAmount,
  foreignAmount,
}: {
  bank: BankCommission;
  israeliAmount: number;
  foreignAmount: number;
}) {
  const israeliFee = calculateTradingFee(bank, israeliAmount, "israeli");
  const foreignFee = calculateTradingFee(bank, foreignAmount, "foreign");
  const managementFee = calculateManagementFee(bank, israeliAmount, foreignAmount);
  const totalBase = Math.max(1, (israeliAmount || 0) + (foreignAmount || 0));

  const israeliRate = israeliAmount > 0 ? (israeliFee / israeliAmount) * 100 : 0;
  const foreignRate = foreignAmount > 0 ? (foreignFee / foreignAmount) * 100 : 0;
  const managementRate = totalBase > 0 ? (managementFee / totalBase) * 100 : 0;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">{bank.name}</div>
        <div className="text-sm text-muted-foreground">תצוגה לפי סכומים נוכחיים</div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">מסחר ישראלי</div>
          <div className="text-lg font-semibold">
            ₪ {israeliFee.toLocaleString()} ({israeliRate.toFixed(3)}%)
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">מסחר חו&quot;ל</div>
          <div className="text-lg font-semibold">
            ₪ {foreignFee.toLocaleString()} ({foreignRate.toFixed(3)}%)
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">דמי ניהול</div>
          <div className="text-lg font-semibold">
            ₪ {managementFee.toLocaleString()} ({managementRate.toFixed(3)}%)
          </div>
        </div>
      </div>
    </div>
  );
}
