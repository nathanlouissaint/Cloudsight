import { motion } from "framer-motion";
import { useDashboard } from "../../hooks/useDashboard";

export default function CostDriversCard() {
  const { data, loading } = useDashboard();

  if (loading || !data) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="analytics-card"
    >
      <div className="analytics-title">
        Cost Drivers
      </div>

      <div className="analytics-subtitle">
        Largest spend increases this month
      </div>

      <div className="driver-list">
        {data.costDrivers.map(driver => (
          <div
            key={driver.service}
            className="driver-row"
          >
            <div>
              <strong>{driver.service}</strong>
              <p>{driver.reason}</p>
            </div>

            <div className="status-chip warning">
              +{driver.increase}%
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
