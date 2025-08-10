"use client";
import Image from "next/image";
import clsx from "clsx";
import { Check } from "lucide-react";
import { BankCommission } from "@/types";
import { getLogoSrc, isIsraeliBank } from "@/lib/bank-utils";
import { useDisclosure } from "@/hooks/useDisclosure";
import {
  useEffect,
  useRef,
  useCallback,
  useState,
  type RefObject,
} from "react";

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
        className="w-full rounded-lg border bg-background/50 px-3 py-2 text-left shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {current ? current.name : "בחר"}
      </button>
      {mounted ? (
        <div
          className={clsx(
            "fixed inset-0 z-50 flex items-center justify-center p-4",
            "transition-opacity duration-200 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 bg-background/80",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeAndReturnFocus}
        >
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
                className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent"
                onClick={closeAndReturnFocus}
                aria-label="סגור מודאל"
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
                  closeAndReturnFocus();
                }}
              />
              <BankList
                title="בתי השקעות / חברי בורסה"
                banks={banks.filter((b) => !isIsraeliBank(b.id))}
                currentBankId={currentBankId}
                onSelect={(id) => {
                  onSelect(id);
                  closeAndReturnFocus();
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
                  type="button"
                  className={clsx(
                    "flex w-full items-center justify-between rounded-lg border px-4 py-3 hover:bg-accent",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
                    selected && "border-primary bg-primary/5"
                  )}
                  onClick={() => onSelect(b.id)}
                >
                  <span className="flex items-center gap-3">
                    <Image
                      src={getLogoSrc(b.id)}
                      alt={b.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded bg-background object-contain"
                    />
                    <span
                      className={clsx(
                        "truncate",
                        selected
                          ? "font-semibold text-base"
                          : "font-medium text-base"
                      )}
                    >
                      {b.name}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {selected ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

// Accessibility: focus handling and trapping within the dialog
// Attach effects after the component since they rely on refs above
BankSelectorModalTrigger.displayName = "BankSelectorModalTrigger";

// Hook effects inside component scope
// We augment the component after declaration to keep file concise
function useModalA11y(
  isOpen: boolean,
  contentRef: RefObject<HTMLDivElement | null>,
  closeBtnRef: RefObject<HTMLButtonElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    if (!isOpen) return;
    // Focus the close button when modal opens
    closeBtnRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      // Close on Cmd+W / Ctrl+W while modal is open
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === "w" || event.key === "W")
      ) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Tab") {
        const container = contentRef.current;
        if (!container) return;
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(
          (el) =>
            !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const isShift = event.shiftKey;
        const active = document.activeElement as HTMLElement | null;
        if (!active) return;
        if (!container.contains(active)) {
          // If focus left the modal somehow, bring it back
          (isShift ? last : first).focus();
          event.preventDefault();
          return;
        }
        if (!isShift && active === last) {
          first.focus();
          event.preventDefault();
        } else if (isShift && active === first) {
          last.focus();
          event.preventDefault();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, contentRef, closeBtnRef, onClose]);
}
