import TopNavigation from "../components/navigation/TopNavigation";

import {
  DashboardLayout,
  SectionHeader,
} from "../components/layout";

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

import ExportCsvButton from "../components/reports/ExportCsvButton";
import ExecutiveNotes from "../components/reports/ExecutiveNotes";

export default function ReportsPage() {
  const {
    data,
    isLoading,
    error,
  } = useReport();

  const forecastVariance =
    data
      ? data.forecastedSpend - data.budget
      : 0;

  const varianceLabel =
    forecastVariance >= 0
      ? `+$${forecastVariance.toLocaleString()}`
      : `-$${Math.abs(
          forecastVariance
        ).toLocaleString()}`;

  return (
    <DashboardLayout>
      <TopNavigation />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <SectionHeader
          title="Reporting Center"
          subtitle="Review executive summaries, financial performance, and budget outcomes for the selected reporting period."
        />

        <ExportCsvButton />
      </div>

      {isLoading && <SkeletonCard />}

      {error && (
        <ErrorState message={error.message} />
      )}

      {!isLoading &&
        !error &&
        !data && (
          <EmptyState title="No report available" />
        )}

      {!isLoading &&
        !error &&
        data && (
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
                label="Forecast Variance"
                value={varianceLabel}
                subtitle="Difference between projected spend and approved budget."
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
                  marginBottom: 24,
                }}
              >
                {data.summary}
              </p>

              <MetricGrid>
                <MetricCard
                  label="Primary Cost Driver"
                  value={data.topService}
                  subtitle={`${data.topService} accounts for the largest share of cloud spend.`}
                />

                <MetricCard
                  label="Top Service Spend"
                  value={`$${data.topServiceSpend.toLocaleString()}`}
                  subtitle="Highest individual service cost."
                />
              </MetricGrid>
            </div>

            <ExecutiveNotes />
          </>
        )}
    </DashboardLayout>
  );
}