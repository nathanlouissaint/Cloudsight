import type {
  AlertMetrics,
  AlertSummary,
} from "../../types/alerts";

import AlertSummaryCard from "./AlertSummaryCard";

interface Props {
  summary: AlertSummary;
  metrics: AlertMetrics;
}

export default function AlertSummary({
  summary,
  metrics,
}: Props) {
  return (
    <section className="summary-grid">

      <AlertSummaryCard
        title="Critical Alerts"
        value={summary.critical}
        subtitle="Immediate attention"
        severity="critical"
      />

      <AlertSummaryCard
        title="Warnings"
        value={summary.warning}
        subtitle="Needs review"
        severity="warning"
      />

      <AlertSummaryCard
        title="Monitoring"
        value={summary.monitoring}
        subtitle="Under observation"
        severity="info"
      />

      <AlertSummaryCard
        title="Active"
        value={metrics.active}
        subtitle="Currently open"
        severity="info"
      />

    </section>
  );
}
