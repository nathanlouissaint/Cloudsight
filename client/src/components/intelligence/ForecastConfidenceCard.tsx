import { motion } from "framer-motion";

export default function ForecastConfidenceCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="analytics-card"
    >
      <h3>Forecast Confidence</h3>

      <p className="analytics-subtitle">
        Prediction reliability
      </p>

      <div className="confidence-value">
        92%
      </div>

      <div className="forecast-progress">
        <div
          className="forecast-fill"
          style={{ width: "92%" }}
        />
      </div>

      <p>
        Based on 30 days of historical spend,
        current growth rate and service trends.
      </p>
    </motion.div>
  );
}
