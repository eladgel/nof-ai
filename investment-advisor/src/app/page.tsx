import InvestmentAdvisor from "@/components/investment-advisor";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">מערכת המלצות השקעות</h1>
          <p className="text-muted-foreground">
            השוו בין בנקים ובתי השקעות לפי עמלות וראו פירוט לפי אחוזים וסכומים.
          </p>
        </div>
        <ThemeToggle />
      </div>
      <InvestmentAdvisor />
    </div>
  );
}
