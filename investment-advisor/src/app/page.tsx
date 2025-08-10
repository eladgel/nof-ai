import InvestmentAdvisor from "@/components/investment-advisor";

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">מערכת המלצות השקעות</h1>
      <InvestmentAdvisor />
    </div>
  );
}
