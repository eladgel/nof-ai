"use client";
import Image from "next/image";
import { BankCommission } from "@/types";
import { getLogoSrc } from "@/lib/bank-utils";

export function BankCard({
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
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={getLogoSrc(bank.id)}
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
          <span className="text-muted-foreground">דמי ניהול - ני"ע ישראלים</span>
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
