import { useForecast } from "../hooks/useForecast";

export default function ForecastingPage() {
  const {
    data,
    loading,
    error,
  } = useForecast();

  if (loading) {
    return <div>Loading forecast...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!data) {
    return <div>No forecast available</div>;
  }

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

      </div>
    </div>
  );
}
