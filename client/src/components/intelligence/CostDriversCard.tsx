import { motion } from "framer-motion";
import { useTopDrivers } from "../../hooks/useTopDrivers";

export default function CostDriversCard() {
  const { data, isLoading } =
    useTopDrivers();

  if (isLoading || !data) {
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
        Largest spend contributors
      </div>

      <div className="driver-list">
        {data.slice(0, 5).map(
          (driver) => (
            <div
              key={
                driver.serviceName
              }
              className="driver-row"
            >
              <div>
                <strong>
                  {
                    driver.serviceName
                  }
                </strong>

                <p>
                  $
                  {driver.totalCost.toLocaleString()}
                </p>
              </div>

              <div className="status-chip warning">
                {
                  driver.percentOfSpend
                }
                %
              </div>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}
