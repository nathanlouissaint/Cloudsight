import ForecastExplanation from "./ForecastExplanation";
import AccountHealth from "./AccountHealth";

export default function ForecastAndHealthRow() {
  return (
    <section
      className="forecast-health-grid"
    >
      <ForecastExplanation />
      <AccountHealth />
    </section>
  );
}
