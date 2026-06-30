import type { ForecastSummary } from "../../types/forecast";

import ForecastMetricGrid from "./ForecastMetricGrid";
import MetricCard from "../shared/MetricCard";

interface Props {
  summary: ForecastSummary;
}

export default function RunRateMetrics({
  summary,
}: Props) {
  return (
    <ForecastMetricGrid>

      <MetricCard
        title="Current Spend"
        value={`$${summary.currentSpend.toLocaleString()}`}
      />

      <MetricCard
        title="Average Daily"
        value={`$${summary.averageDailySpend.toFixed(2)}`}
      />

      <MetricCard
        title="Elapsed Days"
        value={summary.elapsedDays.toString()}
      />

      <MetricCard
        title="Remaining Days"
        value={summary.remainingDays.toString()}
      />

    </ForecastMetricGrid>
  );
}
