import { motion } from "framer-motion";

export default function ForecastExplanation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="analytics-card"
    >
      <div className="analytics-title">
        Forecast Explanation
      </div>

      <div className="analytics-subtitle">
        Primary forecast contributors
      </div>

      <div className="driver-list">
        <div className="driver-row">
          <span>EKS Expansion</span>
          <strong>+8.2%</strong>
        </div>

        <div className="driver-row">
          <span>Compute Growth</span>
          <strong>+3.1%</strong>
        </div>

        <div className="driver-row">
          <span>Data Transfer</span>
          <strong>+1.4%</strong>
        </div>
      </div>
    </motion.div>
  );
}
