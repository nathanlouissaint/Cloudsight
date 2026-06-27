import { useForecast } from "../hooks/useForecast";
import { useHistoricalTrends } from "../hooks/useHistoricalTrends";

import ForecastConfidenceCard from "../components/forecast/ForecastConfidenceCard";
import BudgetRiskCard from "../components/forecast/BudgetRiskCard";
import ForecastProjectionChart from "../components/forecast/ForecastProjectionChart";
import ForecastInsights from "../components/forecast/ForecastInsights";
import ForecastSection from "../components/forecast/ForecastSection";
import GrowthDriverCards from "../components/forecast/GrowthDriverCards";
import ServiceForecastCards from "../components/forecast/ServiceForecastCards";
import AccountForecastCards from "../components/forecast/AccountForecastCards";
import RunRateMetrics from "../components/forecast/RunRateMetrics";

export default function ForecastingPage() {
  const {
    data,
    isLoading,
    error,
  } = useForecast();

  const {
    data: historical = [],
  } = useHistoricalTrends();

  if (isLoading) {
    return <div>Loading forecast...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data) {
    return <div>No forecast available.</div>;
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
            ${data.summary.projectedSpend.toLocaleString()}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-title">
            Budget
          </div>

          <div className="summary-value">
            ${data.summary.budget.toLocaleString()}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-title">
            Variance
          </div>

          <div className="summary-value">
            ${data.summary.projectedVariance.toLocaleString()}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-title">
            Status
          </div>

          <div className="summary-value">
            {data.summary.onTrack
              ? "On Track"
              : "Over Budget"}
          </div>
        </div>

        <ForecastConfidenceCard
          confidence={data.confidence.score}
        />

        <BudgetRiskCard
          projectedVariance={data.summary.projectedVariance}
          budget={data.summary.budget}
        />

      </div>

      <ForecastSection
        title="Run Rate Analytics"
      >

        <RunRateMetrics
          summary={data.summary}
        />

      </ForecastSection>

      <ForecastProjectionChart
        historical={historical}
        projection={data.projection}
        budget={data.summary.budget}
      />

      <ForecastSection
        title="Forecast Intelligence"
      >

        <ForecastInsights
          insights={data.insights}
          confidence={data.confidence}
          topDriver={data.growthDrivers[0]}
          explanation={data.explanation}
        />

      </ForecastSection>

      <ForecastSection
        title="Growth Drivers"
      >

        <GrowthDriverCards
          drivers={data.growthDrivers}
        />

      </ForecastSection>

      <ForecastSection
        title="Service Forecasts"
      >

        <ServiceForecastCards
          forecasts={data.serviceForecasts}
        />

      </ForecastSection>

      <ForecastSection
        title="Account Forecasts"
      >

        <AccountForecastCards
          forecasts={data.accountForecasts}
        />

      </ForecastSection>

    </div>
  );
}