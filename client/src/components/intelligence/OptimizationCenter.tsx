import { motion } from "framer-motion";
import { useDashboard } from "../../hooks/useDashboard";

export default function OptimizationCenter() {
  const { data, loading } = useDashboard();

  if (loading || !data) {
    return null;
  }

  const totalSavings =
    data.optimization.reduce(
      (acc, item) => acc + item.savings,
      0
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="analytics-card"
    >
      <div className="analytics-title">
        Optimization Center
      </div>

      <div className="analytics-subtitle">
        Highest impact savings opportunities
      </div>

      <div className="optimization-list">
        {data.optimization.map(item => (
          <div
            key={item.resource}
            className="optimization-row"
          >
            <span>{item.resource}</span>

            <strong>
              ${item.savings}/mo
            </strong>
          </div>
        ))}
      </div>

      <div className="optimization-total">
        <span>Total Opportunity</span>

        <strong>
          ${totalSavings}/mo
        </strong>
      </div>
    </motion.div>
  );
}
