
import { useForecast } from "../hooks/useForecast";

import ForecastConfidenceCard from "../components/forecast/ForecastConfidenceCard";
import BudgetRiskCard from "../components/forecast/BudgetRiskCard";
import ForecastProjectionChart from "../components/forecast/ForecastProjectionChart";

export default function ForecastingPage() {
  const {
    data,
    isLoading,
    error,
  } = useForecast();

  if (isLoading) {
    return <div>Loading forecast...</div>;
  }

  if (error) {
    return <div>{error?.message}</div>;
  }

  if (!data) {
    return <div>No forecast available</div>;
  }

  const confidence = Math.min(
    95,
    Math.round(
      (data.elapsedDays /
        (data.elapsedDays +
          data.remainingDays)) *
        100
    )
  );

  return (
    <div className="dashboard-container">
      <h1>Forecasting</h1>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-title">
            Projected Spend
          </div>

          <div className="summary-value">
            ${data.projectedSpend.toLocaleString()}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-title">
            Budget
          </div>

          <div className="summary-value">
            ${data.budget.toLocaleString()}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-title">
            Variance
          </div>

          <div className="summary-value">
            ${data.projectedVariance.toLocaleString()}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-title">
            Status
          </div>

          <div className="summary-value">
            {data.onTrack
              ? "On Track"
              : "Over Budget"}
          </div>
        </div>

        <ForecastConfidenceCard
          confidence={confidence}
        />

        <BudgetRiskCard
          projectedVariance={
            data.projectedVariance
          }
        />
      </div>

      <div
        style={{
          marginTop: "2rem",
        }}
      >
        <h2>Run Rate Analytics</h2>

        <p>
          Current Spend: $
          {data.currentSpend.toLocaleString()}
        </p>

        <p>
          Average Daily Spend: $
          {data.averageDailySpend.toFixed(2)}
        </p>

        <p>
          Days Elapsed: {data.elapsedDays}
        </p>

        <p>
          Days Remaining: {data.remainingDays}
        </p>
      </div>

      <ForecastProjectionChart />
    </div>
  );
}
