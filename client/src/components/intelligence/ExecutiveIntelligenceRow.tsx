import ExecutiveSummary from "./ExecutiveSummary";
import CostDriversCard from "./CostDriversCard";
import OptimizationCenter from "./OptimizationCenter";
import ForecastConfidenceCard from "./ForecastConfidenceCard";

export default function ExecutiveIntelligenceRow() {
  return (
    <section className="executive-intelligence-grid">
      <ExecutiveSummary />

      <div className="executive-side-column">
        <ForecastConfidenceCard />
        <CostDriversCard />
        <OptimizationCenter />
      </div>
    </section>
  );
}
