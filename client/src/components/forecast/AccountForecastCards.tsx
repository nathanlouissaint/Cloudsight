import type { AccountForecast } from "../../types/forecast";

import ForecastMetricGrid from "./ForecastMetricGrid";
import MetricCard from "./MetricCard";

interface Props {
  forecasts: AccountForecast[];
}

export default function AccountForecastCards({
  forecasts,
}: Props) {
  return (
    <ForecastMetricGrid>

      {forecasts.map((forecast) => (

        <MetricCard
          key={forecast.account}
          title={forecast.account}
          value={`$${forecast.projectedSpend.toLocaleString()}`}
          subtitle="Projected Monthly Spend"
        />

      ))}

    </ForecastMetricGrid>
  );
}
