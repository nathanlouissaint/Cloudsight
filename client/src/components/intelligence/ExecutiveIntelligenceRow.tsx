import ExecutiveSummary from "./ExecutiveSummary";
import CostDriversCard from "./CostDriversCard";
import OptimizationCenter from "./OptimizationCenter";

export default function ExecutiveIntelligenceRow() {
  return (
    <section className="executive-intelligence-grid">
      <ExecutiveSummary />
      <CostDriversCard />
      <OptimizationCenter />
    </section>
  );
}
