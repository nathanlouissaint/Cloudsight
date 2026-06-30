import type { GrowthDriver } from "../../types/forecast";

import ForecastMetricGrid from "./ForecastMetricGrid";
import MetricCard from "../shared/MetricCard";

interface Props {
  drivers: GrowthDriver[];
}

export default function GrowthDriverCards({
  drivers,
}: Props) {
  return (
    <ForecastMetricGrid>

      {drivers.map((driver) => (

        <MetricCard
          key={driver.name}
          title={driver.name}
          value={`$${driver.impact.toLocaleString()}`}
          subtitle={
            driver.direction === "up"
              ? "Increasing Spend"
              : "Decreasing Spend"
          }
        />

      ))}

    </ForecastMetricGrid>
  );
}
