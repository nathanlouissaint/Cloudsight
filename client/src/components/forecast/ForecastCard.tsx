import { useForecast } from "../../hooks/useForecast";

export default function ForecastCard() {
  const { data, isLoading } = useForecast();

  if (isLoading || !data) {
    return null;
  }

  const {
    currentSpend,
    projectedSpend,
    budget,
    projectedVariance,
    remainingDays,
    onTrack,
  } = data.summary;

  const varianceAmount =
    Math.abs(projectedVariance);

  const varianceLabel = onTrack
    ? `$${varianceAmount.toLocaleString()} under budget`
    : `$${varianceAmount.toLocaleString()} over budget`;

  return (
    <div className="analytics-card">
      <h2>Monthly Spend Forecast</h2>

      <p>
        Status:{" "}
        <strong>
          {onTrack ? "On Track" : "Over Budget"}
        </strong>
      </p>

      <p>
        Projected Spend:{" "}
        <strong>
          ${projectedSpend.toLocaleString()}
        </strong>
      </p>

      <p>
        Current Spend:{" "}
        <strong>
          ${currentSpend.toLocaleString()}
        </strong>
      </p>

      <p>
        Budget:{" "}
        <strong>
          ${budget.toLocaleString()}
        </strong>
      </p>

      <p>
        Forecast Variance:{" "}
        <strong>{varianceLabel}</strong>
      </p>

      <p>
        Remaining Days:{" "}
        <strong>{remainingDays}</strong>
      </p>
    </div>
  );
}