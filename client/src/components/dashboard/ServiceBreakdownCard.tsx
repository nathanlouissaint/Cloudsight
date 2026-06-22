import { motion } from "framer-motion";
import { useDashboard } from "../../hooks/useDashboard";

export default function ServiceBreakdownCard() {
  const { data, loading } = useDashboard();

  if (loading || !data) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="analytics-card"
    >
      <div className="analytics-header">
        <div>
          <div className="analytics-title">
            Service Breakdown
          </div>

          <div className="analytics-subtitle">
            Cost distribution by AWS service
          </div>
        </div>
      </div>

      <div className="service-list">
        {data.services.map((service) => (
          <div
            key={service.name}
            className="service-row"
          >
            <div className="service-name">
              {service.name}
            </div>

            <div className="service-bar-wrapper">
              <div
                className="service-bar"
                style={{
                  width: `${service.percentage}%`,
                }}
              />
            </div>

            <div className="service-value">
              ${service.spend.toLocaleString()}
            </div>

            <div className="service-percent">
              {service.percentage}%
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
