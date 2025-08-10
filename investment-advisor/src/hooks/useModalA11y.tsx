import { useEffect, type RefObject } from "react";

export function useModalA11y(
  isOpen: boolean,
  contentRef: RefObject<HTMLDivElement | null>,
  closeBtnRef: RefObject<HTMLButtonElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    if (!isOpen) return;
    
    closeBtnRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
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