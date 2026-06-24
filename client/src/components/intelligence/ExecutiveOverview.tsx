import { motion } from "framer-motion";
import { useReport } from "../../hooks/useReport";

export default function ExecutiveOverview() {
  const {
    data,
    isLoading,
    error,
  } = useReport();

  if (isLoading) {
    return null;
  }

  if (error || !data) {
    return null;
  }

  const budgetUsage =
    data.budget > 0
      ? (
          (data.totalSpend /
            data.budget) *
          100
        ).toFixed(1)
      : "0";

  const status =
    data.budgetStatus === "healthy"
      ? "On Track"
      : "Attention Required";

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="executive-overview"
    >
      <div className="overview-header">
        <div>
          <p className="overview-label">
            EXECUTIVE OVERVIEW
          </p>

          <h1>
            Cloud Financial Health
          </h1>
        </div>

        <div
          className={`status-chip ${data.budgetStatus}`}
        >
          {status}
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-metric">
          <span>Forecast</span>

          <strong>
            $
            {data.forecastedSpend.toLocaleString()}
          </strong>
        </div>

        <div className="overview-metric">
          <span>Budget Usage</span>

          <strong>
            {budgetUsage}%
          </strong>
        </div>

        <div className="overview-metric">
          <span>Top Service</span>

          <strong>
            {data.topService}
          </strong>
        </div>

        <div className="overview-metric">
          <span>Monthly Spend</span>

          <strong>
            $
            {data.totalSpend.toLocaleString()}
          </strong>
        </div>
      </div>
    </motion.section>
  );
}
