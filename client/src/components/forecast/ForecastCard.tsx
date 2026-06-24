import { useForecast } from "../../hooks/useForecast";

export default function ForecastCard() {
  const {
    data,
    isLoading,
    error,
  } = useForecast();

  if (isLoading) {
    return (
      <section className="glass-card forecast-panel">
        Loading forecast...
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="glass-card forecast-panel">
        Forecast unavailable
      </section>
    );
  }

  return (
    <section className="glass-card forecast-panel">
      <div className="panel-header">
        <div>
          <h3>Forecast Overview</h3>

          <p className="analytics-subtitle">
            Live forecast projection
          </p>
        </div>

        <span
          className={
            data.onTrack
              ? "status-positive"
              : "status-negative"
          }
        >
          {data.onTrack
            ? "On Track"
            : "Over Budget"}
        </span>
      </div>

      <div className="forecast-metric">
        <div className="metric-label">
          Projected Spend
        </div>

        <div className="metric-value">
          $
          {data.projectedSpend.toLocaleString()}
        </div>
      </div>

      <div className="forecast-grid">
        <div>
          <div className="metric-label">
            Current Spend
          </div>

          <div className="metric-small">
            $
            {data.currentSpend.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="metric-label">
            Budget
          </div>

          <div className="metric-small">
            $
            {data.budget.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="metric-label">
            Variance
          </div>

          <div className="metric-small">
            $
            {data.projectedVariance.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="metric-label">
            Days Remaining
          </div>

          <div className="metric-small">
            {data.remainingDays}
          </div>
        </div>
      </div>
    </section>
  );
}
