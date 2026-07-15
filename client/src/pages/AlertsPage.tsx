import TopNavigation from "../components/navigation/TopNavigation";

import { DashboardLayout, SectionHeader } from "../components/layout";

import {
  AlertCard,
  AlertHistoryTimeline,
  AlertRecommendationPanel,
  AlertSummary,
} from "../components/alerts";

import { useAlerts } from "../hooks/useAlerts";
import { useAlertHistory } from "../hooks/useAlertHistory";

export default function AlertsPage() {

  const {
    data,
    isLoading,
    error,
  } = useAlerts();

  const {
    data: history = [],
    isLoading: historyLoading,
  } = useAlertHistory();

  if (isLoading) {
    return (
      <DashboardLayout>
        <TopNavigation />
        <div>Loading alerts...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <TopNavigation />
        <div>{error.message}</div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <TopNavigation />
        <div>No alert data available.</div>
      </DashboardLayout>
    );
  }

  const {
    summary,
    metrics,
    alerts,
  } = data;

  return (
    <DashboardLayout>

      <TopNavigation />

      <SectionHeader
        title="Alert Center"
        subtitle="Monitor cloud spending anomalies, forecast risks, budget thresholds, and operational events that may require attention."
      />

      <AlertSummary
        summary={summary}
        metrics={metrics}
      />

      <SectionHeader
        title="Active Alerts"
        subtitle="High-priority issues requiring immediate investigation to prevent unexpected cloud costs or operational impact."
      />

      <div className="analytics-grid">

        <div className="analytics-card">

          {alerts.length === 0 ? (

            <p>
              No active alerts detected.
            </p>

          ) : (

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >

              {alerts.map((alert) => (

                <AlertCard
                  key={alert.id}
                  alert={alert}
                />

              ))}

            </div>

          )}

        </div>

        <AlertRecommendationPanel
          alerts={alerts}
        />

      </div>

      <SectionHeader
        title="Alert History"
        subtitle="Previously detected alert events."
      />

      {historyLoading ? (

        <div className="analytics-card">
          Loading history...
        </div>

      ) : (

        <AlertHistoryTimeline
          history={history}
        />

      )}

    </DashboardLayout>
  );

}
