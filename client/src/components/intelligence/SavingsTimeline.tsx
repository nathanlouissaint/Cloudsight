import { motion } from "framer-motion";

export default function SavingsTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="analytics-card"
    >
      <div className="analytics-title">
        Savings Trend
      </div>

      <div className="analytics-subtitle">
        Identified opportunities over time
      </div>

      <div
        style={{
          height: "240px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.7,
        }}
      >
        Savings Chart Placeholder
      </div>
    </motion.div>
  );
}
