"use client";
import { isIsraeliBank } from "@/lib/bank-utils";
import { BankCard } from "@/components/BankCard";
import { SelectedBankBreakdown } from "@/components/SelectedBankBreakdown";
import { BankSelectorModalTrigger } from "@/components/BankSelectorModal";
import { useInvestmentAdvisor } from "@/hooks/useInvestmentAdvisor";

export default function InvestmentAdvisor() {
  const {
    banks,
    form,
    setCurrentBank,
    setIsraeliAmount,
    setForeignAmount,
    recommendations,
  } = useInvestmentAdvisor();

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <BankSelectorModalTrigger
            banks={banks}
            currentBankId={form.currentBank}
            onSelect={setCurrentBank}
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
              onChange={(e) => setIsraeliAmount(Number(e.target.value) || 0)}
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
              onChange={(e) => setForeignAmount(Number(e.target.value) || 0)}
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
