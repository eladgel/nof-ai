import clsx from "clsx";
import { BankCommission } from "@/types";
import { BankSelectorModalContent } from "./BankSelectorModalContent";
import type { RefObject } from "react";

interface BankSelectorModalOverlayProps {
  banks: BankCommission[];
  currentBankId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  isOpen: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
}

export function BankSelectorModalOverlay({
  banks,
  currentBankId,
  onSelect,
  onClose,
  isOpen,
  contentRef,
  closeBtnRef,
}: BankSelectorModalOverlayProps) {
  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "transition-opacity duration-200 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 bg-background/80",
        isOpen ? "opacity-100" : "opacity-0"
      )}
      onClick={onClose}
    >
      <BankSelectorModalContent
        banks={banks}
        currentBankId={currentBankId}
        onSelect={onSelect}
        onClose={onClose}
        isOpen={isOpen}
        contentRef={contentRef}
        closeBtnRef={closeBtnRef}
      />
    </div>
  );
}