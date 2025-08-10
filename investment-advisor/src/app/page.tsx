import InvestmentAdvisor from "@/components/investment-advisor";

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">מערכת המלצות השקעות</h1>
      <p className="text-muted-foreground mb-6">
        השוו בין בנקים ובתי השקעות לפי עמלות וראו פירוט לפי אחוזים וסכומים.
      </p>
      <InvestmentAdvisor />
    </div>
  );
}
