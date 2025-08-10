"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { BankCommission } from "@/types";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useModalA11y } from "@/hooks/useModalA11y";
import { BankSelectorModalOverlay } from "./BankSelectorModalOverlay";

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
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [mounted, setMounted] = useState(false);

  const closeAndReturnFocus = useCallback(() => {
    close();
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 0);
  }, [close]);
  // Handle mount/unmount to allow close animation
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    }
    const timer = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Lock background scroll while modal is visible (including fade-out)
  useEffect(() => {
    if (!mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow || "";
    };
  }, [mounted]);
  const current = banks.find((b) => b.id === currentBankId) || null;
  
  useModalA11y(isOpen, contentRef, closeBtnRef, closeAndReturnFocus);
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">בחר בנק נוכחי</label>
      <button
        type="button"
        ref={triggerRef}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={open}
        className="w-full rounded-lg border bg-background/50 px-3 py-2 text-right shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {current ? current.name : "בחר"}
      </button>
      {mounted ? (
        <BankSelectorModalOverlay
          banks={banks}
          currentBankId={currentBankId}
          onSelect={(id) => {
            onSelect(id);
            closeAndReturnFocus();
          }}
          onClose={closeAndReturnFocus}
          isOpen={isOpen}
          contentRef={contentRef}
          closeBtnRef={closeBtnRef}
        />
      ) : null}
    </div>
  );
}


BankSelectorModalTrigger.displayName = "BankSelectorModalTrigger";
