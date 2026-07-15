import { motion } from "framer-motion";

import { useForecast } from "../../hooks/useForecast";

export default function ForecastExplanation() {
  const { data, isLoading } = useForecast();

  if (isLoading || !data) {
    return null;
  }

  const topDrivers =
    data.growthDrivers.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="analytics-card"
    >
      <div className="analytics-title">
        Forecast Drivers
      </div>

      <div className="analytics-subtitle">
        Largest contributors to projected month-end spend
      </div>

      <div className="driver-list">
        {topDrivers.map((driver) => (
          <div
            key={driver.name}
            className="driver-row"
          >
            <span>{driver.name}</span>

            <strong>
              ${driver.impact.toLocaleString()}
            </strong>
          </div>
        ))}
      </div>
    </motion.div>
  );
}