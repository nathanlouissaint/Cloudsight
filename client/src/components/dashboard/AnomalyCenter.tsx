import { motion } from "framer-motion";
import { useDashboard } from "../../hooks/useDashboard";

export default function AnomalyCenter() {
  const { data, loading } = useDashboard();

  if (loading || !data) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="analytics-card anomaly-card"
    >
      <div className="analytics-header">
        <div>
          <div className="analytics-title">
            Anomaly Center
          </div>

          <div className="analytics-subtitle">
            Recent cost anomalies
          </div>
        </div>
      </div>

      <div className="anomaly-list">
        {data.anomalies.map((item) => (
          <div
            key={item.service}
            className="anomaly-row"
          >
            <div>
              <div className="anomaly-service">
                {item.service}
              </div>

              <div className="anomaly-label">
                Spend increase detected
              </div>
            </div>

            <div
              className={`status-chip ${item.severity}`}
            >
              {item.impact}
            </div>
          </div>
        ))}
      </div>

      <div className="anomaly-footer">
        Monitoring active across all accounts
      </div>
    </motion.div>
  );
}
