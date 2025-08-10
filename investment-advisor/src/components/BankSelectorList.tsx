import { BankCommission } from "@/types";
import { BankSelectorCard } from "./BankSelectorCard";

interface BankSelectorListProps {
  title: string;
  banks: BankCommission[];
  currentBankId: string;
  onSelect: (id: string) => void;
}

export function BankSelectorList({
  title,
  banks,
  currentBankId,
  onSelect,
}: BankSelectorListProps) {
  return (
    <div className="sm:px-3">
      <div className="mb-2 text-sm font-medium text-muted-foreground">
        {title}
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {banks
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((bank) => (
            <li key={bank.id}>
              <BankSelectorCard
                bank={bank}
                isSelected={currentBankId === bank.id}
                onSelect={() => onSelect(bank.id)}
              />
            </li>
          ))}
      </ul>
    </div>
  );
}