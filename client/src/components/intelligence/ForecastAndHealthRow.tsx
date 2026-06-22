import ForecastExplanation from "./ForecastExplanation";
import AccountHealth from "./AccountHealth";
import ForecastCard from "../forecast/ForecastCard";

export default function ForecastAndHealthRow() {
  return (
    <section
      className="forecast-health-grid"
    >
      <ForecastCard />
      <ForecastExplanation />
      <AccountHealth />
    </section>
  );
}
