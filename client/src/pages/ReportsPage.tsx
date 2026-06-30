import TopNavigation from "../components/navigation/TopNavigation";

import { DashboardLayout, SectionHeader } from "../components/layout";

import {
  MetricCard,
  MetricGrid,
} from "../components/shared";

import {
  EmptyState,
  ErrorState,
  SkeletonCard,
} from "../components/states";

import { useReport } from "../hooks/useReport";

export default function ReportsPage() {
  const {
    data,
    isLoading,
    error,
  } = useReport();

  return (
    <DashboardLayout>
      <TopNavigation />

      <SectionHeader
        title="Reporting Center"
        subtitle="Review executive summaries, financial performance, and budget outcomes for the selected reporting period."
      />

      {isLoading && <SkeletonCard />}

      {error && (
        <ErrorState message={error.message} />
      )}

      {!isLoading && !error && !data && (
        <EmptyState title="No report available" />
      )}

      {!isLoading && !error && data && (
        <>
          <MetricGrid>
            <MetricCard
              label="Total Spend"
              value={`$${data.totalSpend.toLocaleString()}`}
              subtitle="Cloud spend during this reporting period."
            />

            <MetricCard
              label="Forecast"
              value={`$${data.forecastedSpend.toLocaleString()}`}
              subtitle="Projected month-end spend."
            />

            <MetricCard
              label="Budget"
              value={`$${data.budget.toLocaleString()}`}
              subtitle="Approved reporting budget."
            />

            <MetricCard
              label="Top Service"
              value={data.topService}
              subtitle="Largest contributor to cloud spend."
            />
          </MetricGrid>

          <SectionHeader
            title="Executive Summary"
            subtitle="Financial narrative generated from reporting data."
          />

          <div className="analytics-card">
            <p
              style={{
                lineHeight: 1.8,
              }}
            >
              {data.summary}
            </p>
          </div>

          <SectionHeader
            title="Financial Performance"
            subtitle="Supporting financial metrics for executive review."
          />

          <MetricGrid>
            <MetricCard
              label="Top Service Spend"
              value={`$${data.topServiceSpend.toLocaleString()}`}
              subtitle="Highest individual service cost."
            />

            <MetricCard
              label="Budget Status"
              value={data.budgetStatus}
              subtitle="Overall budget health."
            />
          </MetricGrid>
        </>
      )}
    </DashboardLayout>
  );
}
