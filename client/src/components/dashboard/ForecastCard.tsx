import { motion } from "framer-motion";

export default function ForecastCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="analytics-card forecast-card"
    >
      <div className="analytics-header">
        <div>
          <div className="analytics-title">
            Forecast Overview
          </div>

          <div className="analytics-subtitle">
            Month-end projection
          </div>
        </div>
      </div>

      <div className="forecast-main">
        <div className="forecast-value">
          $4,383.33
        </div>

        <div className="forecast-variance">
          -$616.67 under budget
        </div>
      </div>

      <div className="forecast-metrics">
        <div>
          <span>Days Remaining</span>
          <strong>9</strong>
        </div>

        <div>
          <span>Daily Average</span>
          <strong>$146.11</strong>
        </div>

        <div>
          <span>Confidence</span>
          <strong>92%</strong>
        </div>
      </div>

      <div className="forecast-progress">
        <div className="forecast-fill" />
      </div>

      <div className="status-chip healthy">
        On Track
      </div>
    </motion.div>
  );
}