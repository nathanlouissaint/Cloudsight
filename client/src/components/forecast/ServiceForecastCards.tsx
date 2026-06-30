import type { ServiceForecast } from "../../types/forecast";

import ForecastMetricGrid from "./ForecastMetricGrid";
import MetricCard from "../shared/MetricCard";

interface Props {
  forecasts: ServiceForecast[];
}

export default function ServiceForecastCards({
  forecasts,
}: Props) {
  return (
    <ForecastMetricGrid>

      {forecasts.map((forecast) => (

        <MetricCard
          key={forecast.service}
          title={forecast.service}
          value={`$${forecast.projectedSpend.toLocaleString()}`}
          subtitle="Projected Monthly Spend"
        />

      ))}

    </ForecastMetricGrid>
  );
}
