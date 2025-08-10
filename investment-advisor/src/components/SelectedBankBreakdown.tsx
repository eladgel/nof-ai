"use client";
import { BankCommission } from "@/types";
import {
  calculateManagementFee,
  calculateTradingFee,
  resolveManagementRates,
} from "@/lib/fee-calculator";

export function SelectedBankBreakdown({
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
