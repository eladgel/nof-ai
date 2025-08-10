"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Check } from "lucide-react";
import { BankCommission, InvestmentData } from "@/types";
import {
  calculateManagementFee,
  calculateTradingFee,
  resolveManagementRates,
} from "@/lib/fee-calculator";
import { loadInvestmentData, saveInvestmentData } from "@/lib/storage";
import { ISRAELI_BANKS } from "@/consts/banks";

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
  const managementFee = calculateManagementFee(
    bank,
    israeliAmount,
    foreignAmount
  );
  const totalBase = Math.max(1, (israeliAmount || 0) + (foreignAmount || 0));

  const israeliRate =
    israeliAmount > 0 ? (israeliFee / israeliAmount) * 100 : 0;
  const foreignRate =
    foreignAmount > 0 ? (foreignFee / foreignAmount) * 100 : 0;
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

  return (
    <div className="rounded-lg border p-4 bg-card/50">
      <div className="flex items-center justify-between">
        <div className="font-medium">{bank.name}</div>
        <div className="text-sm text-muted-foreground">
          תצוגה לפי סכומים נוכחיים
        </div>
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

function isIsraeliBank(code: string): boolean {
  return ISRAELI_BANKS.some((b) => b.code === code);
}

function getLogoSrc(id: string): string {
  const code = id.padStart(4, "0");
  return `https://market.tase.co.il/assets/img/tase_members/heb/00${code}.png`;
}

function BankCard({
  bank,
  total,
  breakdown,
}: {
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
}) {
  const bankCode = bank.id.padStart(4, "0");
  const logoSrc = `https://market.tase.co.il/assets/img/tase_members/heb/00${bankCode}.png`;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={logoSrc}
            alt={bank.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded bg-white object-contain"
          />
          <div className="font-medium">{bank.name}</div>
        </div>
        <div className="text-sm text-muted-foreground">{bank.id}</div>
      </div>
      <div className="mt-3 text-sm">סה&quot;כ עמלות שנתיות</div>
      <div className="text-2xl font-bold">₪ {total.toLocaleString()}</div>
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">מסחר ישראלי</span>
          <span>
            ₪ {breakdown.israeliFee.toLocaleString()} (
            {breakdown.israeliRate.toFixed(3)}%)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">מסחר חו&quot;ל</span>
          <span>
            ₪ {breakdown.foreignFee.toLocaleString()} (
            {breakdown.foreignRate.toFixed(3)}%)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">דמי ניהול</span>
          <span>
            ₪ {breakdown.managementFee.toLocaleString()} (
            {breakdown.managementRate.toFixed(3)}%)
          </span>
        </div>
      </div>
      {bank.exceptional && bank.exceptionalMessage ? (
        <div className="mt-2 text-xs text-amber-600">
          {bank.exceptionalMessage}
        </div>
      ) : null}
    </div>
  );
}

function BankSelectorModalTrigger({
  banks,
  currentBankId,
  onSelect,
}: {
  banks: BankCommission[];
  currentBankId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = banks.find((b) => b.id === currentBankId) || null;
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">בחר בנק נוכחי</label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border bg-background/50 px-3 py-2 text-left shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {current ? current.name : "בחר"}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border bg-white p-4 shadow-xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold">בחר בנק / בית השקעות</div>
              <button
                className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                סגור
              </button>
            </div>
            <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-auto divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
              <div className="sm:pr-3">
                <div className="mb-2 text-sm font-medium text-muted-foreground">
                  בנקים ישראליים
                </div>
                <ul className="space-y-2">
                  {banks
                    .filter((b) => isIsraeliBank(b.id))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((b) => {
                      const selected = currentBankId === b.id;
                      return (
                        <li key={b.id}>
                          <button
                            className={clsx(
                              "flex w-full items-center justify-between rounded-lg border px-3 py-2 hover:bg-accent",
                              selected && "border-primary bg-primary/5"
                            )}
                            onClick={() => {
                              onSelect(b.id);
                              setOpen(false);
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <Image
                                src={getLogoSrc(b.id)}
                                alt={b.name}
                                width={24}
                                height={24}
                                className="h-6 w-6 rounded bg-white object-contain"
                              />
                              {b.name}
                            </span>
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                              {selected ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : null}
                              {b.id}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
              <div className="sm:pl-3">
                <div className="mb-2 text-sm font-medium text-muted-foreground">
                  בתי השקעות / חברי בורסה
                </div>
                <ul className="space-y-2">
                  {banks
                    .filter((b) => !isIsraeliBank(b.id))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((b) => {
                      const selected = currentBankId === b.id;
                      return (
                        <li key={b.id}>
                          <button
                            className={clsx(
                              "flex w-full items-center justify-between rounded-lg border px-3 py-2 hover:bg-accent",
                              selected && "border-primary bg-primary/5"
                            )}
                            onClick={() => {
                              onSelect(b.id);
                              setOpen(false);
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <Image
                                src={getLogoSrc(b.id)}
                                alt={b.name}
                                width={24}
                                height={24}
                                className="h-6 w-6 rounded bg-white object-contain"
                              />
                              {b.name}
                            </span>
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                              {selected ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : null}
                              {b.id}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
