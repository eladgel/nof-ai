"use client";
import Image from "next/image";
import clsx from "clsx";
import { Check } from "lucide-react";
import { BankCommission } from "@/types";
import { getLogoSrc, isIsraeliBank } from "@/lib/bank-utils";
import { useDisclosure } from "@/hooks/useDisclosure";

export function BankSelectorModalTrigger({
  banks,
  currentBankId,
  onSelect,
}: {
  banks: BankCommission[];
  currentBankId: string;
  onSelect: (id: string) => void;
}) {
  const { isOpen, open, close } = useDisclosure(false);
  const current = banks.find((b) => b.id === currentBankId) || null;
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">בחר בנק נוכחי</label>
      <button
        type="button"
        onClick={open}
        className="w-full rounded-lg border bg-background/50 px-3 py-2 text-left shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {current ? current.name : "בחר"}
      </button>
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border bg-white p-4 shadow-xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold">בחר בנק / בית השקעות</div>
              <button
                className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent"
                onClick={close}
              >
                סגור
              </button>
            </div>
            <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-auto divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
              <BankList
                title="בנקים ישראליים"
                banks={banks.filter((b) => isIsraeliBank(b.id))}
                currentBankId={currentBankId}
                onSelect={(id) => {
                  onSelect(id);
                  close();
                }}
              />
              <BankList
                title="בתי השקעות / חברי בורסה"
                banks={banks.filter((b) => !isIsraeliBank(b.id))}
                currentBankId={currentBankId}
                onSelect={(id) => {
                  onSelect(id);
                  close();
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BankList({
  title,
  banks,
  currentBankId,
  onSelect,
}: {
  title: string;
  banks: BankCommission[];
  currentBankId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="sm:px-3">
      <div className="mb-2 text-sm font-medium text-muted-foreground">
        {title}
      </div>
      <ul className="space-y-2">
        {banks
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
                  onClick={() => onSelect(b.id)}
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
  );
}
