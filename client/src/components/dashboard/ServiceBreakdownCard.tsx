import { motion } from "framer-motion";
import { useServiceAnalytics } from "../../hooks/useServiceAnalytics";

export default function ServiceBreakdownCard() {
  const { data, isLoading } =
    useServiceAnalytics();

  if (isLoading || !data) {
    return null;
  }

  const totalSpend =
    data.reduce(
      (sum, item) =>
        sum + item.totalCost,
      0
    );

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
        {data.map((service) => {
          const percentage =
            (
              (service.totalCost /
                totalSpend) *
              100
            ).toFixed(1);

          return (
            <div
              key={
                service.serviceName
              }
              className="service-row"
            >
              <div className="service-name">
                {service.serviceName}
              </div>

              <div className="service-bar-wrapper">
                <div
                  className="service-bar"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>

              <div className="service-value">
                $
                {service.totalCost.toLocaleString()}
              </div>

              <div className="service-percent">
                {percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
