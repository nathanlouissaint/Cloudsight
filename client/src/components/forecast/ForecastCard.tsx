import { useForecast } from "../../hooks/useForecast";

export default function ForecastCard() {
  const { data, isLoading } = useForecast();

  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div className="summary-card">
      <h2>Forecast</h2>

      <p>
        Status:{" "}
        <strong>
          {data.summary.onTrack ? "On Track" : "Over Budget"}
        </strong>
      </p>

      <p>
        Projected Spend: $
        {data.summary.projectedSpend.toLocaleString()}
      </p>

      <p>
        Current Spend: $
        {data.summary.currentSpend.toLocaleString()}
      </p>

      <p>
        Budget: $
        {data.summary.budget.toLocaleString()}
      </p>

      <p>
        Variance: $
        {data.summary.projectedVariance.toLocaleString()}
      </p>

      <p>
        Remaining Days: {data.summary.remainingDays}
      </p>
    </div>
  );
}
