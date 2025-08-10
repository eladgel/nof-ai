import clsx from "clsx";
import { X } from "lucide-react";
import { BankCommission } from "@/types";
import { isIsraeliBank } from "@/lib/bank-utils";
import { BankSelectorList } from "./BankSelectorList";
import type { RefObject } from "react";

interface BankSelectorModalContentProps {
  banks: BankCommission[];
  currentBankId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  isOpen: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
}

export function BankSelectorModalContent({
  banks,
  currentBankId,
  onSelect,
  onClose,
  isOpen,
  contentRef,
  closeBtnRef,
}: BankSelectorModalContentProps) {
  return (
    <div
      ref={contentRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bank-selector-title"
      className={clsx(
        "w-full max-w-3xl rounded-2xl border border-border/60 bg-card/95 text-card-foreground p-4 shadow-2xl sm:p-6",
        "backdrop-blur supports-[backdrop-filter]:bg-card/80",
        "transition-all duration-200 ease-out",
        isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-1"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4 flex items-center justify-between">
        <div id="bank-selector-title" className="text-lg font-semibold">
          בחר בנק / בית השקעות
        </div>
        <button
          ref={closeBtnRef}
          type="button"
          className={clsx(
            "rounded-full p-2",
            "text-foreground",
            "bg-foreground/10 hover:bg-foreground/20",
            "border-4 border-foreground/30",
            "backdrop-blur shadow-sm",
            "transition-all duration-200 ease-out",
            "hover:scale-110 hover:shadow-md hover:border-foreground/50",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          )}
          onClick={onClose}
          aria-label="סגור מודאל"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid max-h-[70vh] grid-cols-1 overflow-auto sm:grid-cols-2 sm:divide-x sm:divide-border">
        <BankSelectorList
          title="בנקים ישראליים"
          banks={banks.filter((b) => isIsraeliBank(b.id))}
          currentBankId={currentBankId}
          onSelect={onSelect}
        />
        <BankSelectorList
          title="בתי השקעות / חברי בורסה"
          banks={banks.filter((b) => !isIsraeliBank(b.id))}
          currentBankId={currentBankId}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}