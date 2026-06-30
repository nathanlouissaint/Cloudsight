import TopNavigation from "../components/navigation/TopNavigation";

import {
  DashboardLayout,
  SectionHeader,
} from "../components/layout";

import { useForecast } from "../hooks/useForecast";
import { useHistoricalTrends } from "../hooks/useHistoricalTrends";

import {
  AccountForecastCards,
  BudgetRiskCard,
  ForecastConfidenceCard,
  ForecastInsights,
  ForecastProjectionChart,
  ForecastSection,
  GrowthDriverCards,
  RunRateMetrics,
  ServiceForecastCards,
} from "../components/forecast";

import {
  EmptyState,
  ErrorState,
  SkeletonCard,
} from "../components/states";

export default function ForecastingPage() {
  const {
    data,
    isLoading,
    error,
  } = useForecast();

  const {
    data: historical = [],
  } = useHistoricalTrends();

  return (
    <DashboardLayout>
      <TopNavigation />

      <SectionHeader
        title="Future Spend Planning"
        subtitle="Project future cloud spend, evaluate forecast confidence, and identify the factors driving projected costs."
      />

      {isLoading && <SkeletonCard />}

      {error && (
        <ErrorState message={error.message} />
      )}

      {!isLoading && !error && !data && (
        <EmptyState title="No forecast available" />
      )}

      {!isLoading && !error && data && (
        <>
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
              projectedVariance={
                data.summary.projectedVariance
              }
              budget={data.summary.budget}
            />
          </div>

          <SectionHeader
            title="Run Rate Analytics"
            subtitle="Current spending velocity and projected month-end performance."
          />

          <ForecastSection title="">
            <RunRateMetrics
              summary={data.summary}
            />
          </ForecastSection>

          <SectionHeader
            title="Forecast Projection"
            subtitle="Historical cloud spend with projected month-end trajectory."
          />

          <ForecastProjectionChart
            historical={historical}
            projection={data.projection}
            budget={data.summary.budget}
          />

          <SectionHeader
            title="Forecast Intelligence"
            subtitle="Insights generated from the forecasting engine."
          />

          <ForecastSection title="">
            <ForecastInsights
              insights={data.insights}
              confidence={data.confidence}
              topDriver={data.growthDrivers[0]}
              explanation={data.explanation}
            />
          </ForecastSection>

          <SectionHeader
            title="Growth Drivers"
            subtitle="Primary factors influencing projected cloud spend."
          />

          <ForecastSection title="">
            <GrowthDriverCards
              drivers={data.growthDrivers}
            />
          </ForecastSection>

          <SectionHeader
            title="Service Forecasts"
            subtitle="Projected spending by cloud service."
          />

          <ForecastSection title="">
            <ServiceForecastCards
              forecasts={data.serviceForecasts}
            />
          </ForecastSection>

          <SectionHeader
            title="Account Forecasts"
            subtitle="Projected spending across cloud accounts."
          />

          <ForecastSection title="">
            <AccountForecastCards
              forecasts={data.accountForecasts}
            />
          </ForecastSection>
        </>
      )}
    </DashboardLayout>
  );
}
