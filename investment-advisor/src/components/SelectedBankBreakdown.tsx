"use client";
import { BankCommission } from "@/types";
import { useBankBreakdown } from "@/hooks/useBankBreakdown";

export function SelectedBankBreakdown({
  bank,
  israeliAmount,
  foreignAmount,
}: {
  bank: BankCommission;
  israeliAmount: number;
  foreignAmount: number;
}) {
  const {
    israeliFee,
    israeliRate,
    foreignFee,
    foreignRate,
    managementFee,
    managementRate,
  } = useBankBreakdown(bank, israeliAmount, foreignAmount);

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
