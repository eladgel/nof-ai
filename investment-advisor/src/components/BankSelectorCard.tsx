import Image from "next/image";
import clsx from "clsx";
import { BankCommission } from "@/types";
import { getLogoSrc } from "@/lib/bank-utils";

interface BankSelectorCardProps {
  bank: BankCommission;
  isSelected: boolean;
  onSelect: () => void;
}

export function BankSelectorCard({ bank, isSelected, onSelect }: BankSelectorCardProps) {
  return (
    <button
      type="button"
      className={clsx(
        "group relative w-full rounded-xl border p-4 sm:p-5",
        "flex aspect-square flex-col items-center justify-center gap-2",
        "transition-all duration-300 ease-out",
        "hover:bg-accent/60 hover:scale-105 hover:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        "items-center justify-center text-center",
        isSelected 
          ? "border-2 border-primary bg-primary/10 shadow-md ring-2 ring-primary/20" 
          : "border-border/50 hover:border-primary/40"
      )}
      onClick={onSelect}
    >
      <span className="h-20 w-20 sm:h-20 sm:w-20 rounded-md bg-white ring-1 ring-border/50 flex items-center justify-center">
        <Image
          src={getLogoSrc(bank.id)}
          alt={bank.name}
          width={56}
          height={56}
          className="h-14 w-14 object-contain"
        />
      </span>
      <span
        className={clsx(
          "mt-1 w-full truncate text-center flex justify-center items-center",
          isSelected ? "font-semibold" : "font-medium"
        )}
      >
        {bank.name}
      </span>
    </button>
  );
}