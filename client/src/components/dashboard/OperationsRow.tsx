import ServiceBreakdownCard from "./ServiceBreakdownCard";
import ForecastCard from "./ForecastCard";

export default function OperationsRow() {
  return (
    <section className="operations-grid">
      <ServiceBreakdownCard />
      <ForecastCard />
    </section>
  );
}