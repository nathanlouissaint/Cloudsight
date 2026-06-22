import { motion } from "framer-motion";

const drivers = [
  {
    service: "EKS",
    increase: "+14.2%",
    reason: "Cluster expansion"
  },
  {
    service: "EC2",
    increase: "+8.1%",
    reason: "Compute growth"
  },
  {
    service: "Data Transfer",
    increase: "+22.7%",
    reason: "Traffic increase"
  }
];

export default function CostDriversCard() {
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
        {drivers.map(driver => (
          <div
            key={driver.service}
            className="driver-row"
          >
            <div>
              <strong>{driver.service}</strong>
              <p>{driver.reason}</p>
            </div>

            <div className="status-chip warning">
              {driver.increase}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
