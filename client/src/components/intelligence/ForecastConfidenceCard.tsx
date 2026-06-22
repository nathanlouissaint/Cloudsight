import { motion } from "framer-motion";
import { useDashboard } from "../../hooks/useDashboard";

export default function ForecastConfidenceCard() {
  const { data, loading } = useDashboard();

  if (loading || !data) {
    return null;
  }

  const confidence =
    data.overview.confidence;

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
        {confidence}%
      </div>

      <div className="forecast-progress">
        <div
          className="forecast-fill"
          style={{
            width: `${confidence}%`
          }}
        />
      </div>

      <p>
        Based on historical spend,
        service growth patterns,
        and forecast models.
      </p>
    </motion.div>
  );
}
