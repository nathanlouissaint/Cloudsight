import { motion } from "framer-motion";

import ExecutiveCard from "../shared/ExecutiveCard";
import { useReport } from "../../hooks/useReport";

export default function ExecutiveOverview() {
  const { data, isLoading, error } = useReport();

  if (isLoading || error || !data) {
    return null;
  }

  const budgetUsage =
    data.budget > 0
      ? ((data.totalSpend / data.budget) * 100).toFixed(1)
      : "0";

  const topService =
    data.topService &&
    data.topService !== "Unknown" &&
    data.topService !== "No dominant service"
      ? data.topService
      : "No dominant cost driver";

  const overBudget =
    data.forecastedSpend > data.budget;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <ExecutiveCard
        eyebrow="Cloud Cost Summary"
        title="Your Cloud Spending This Month"
        status={
          <div
            className={`status-chip ${
              overBudget
                ? "critical"
                : "healthy"
            }`}
          >
            {overBudget
              ? "Over Budget"
              : "On Budget"}
          </div>
        }
      >
        <div className="overview-grid">
          <div className="overview-metric">
            <span className="metric-label">
              Estimated Month-End Spend
            </span>

            <strong className="metric-value">
              ${data.forecastedSpend.toLocaleString()}
            </strong>

            <p className="metric-helper">
              Expected total spend by month end.
            </p>
          </div>

          <div className="overview-metric">
            <span className="metric-label">
              Budget Used
            </span>

            <strong className="metric-value">
              {budgetUsage}%
            </strong>

            <p className="metric-helper">
              Percentage of approved budget consumed.
            </p>
          </div>

          <div className="overview-metric">
            <span className="metric-label">
              Largest Cost Driver
            </span>

            <strong className="metric-value">
              {topService}
            </strong>

            <p className="metric-helper">
              Largest contributor to cloud spend.
            </p>
          </div>

          <div className="overview-metric">
            <span className="metric-label">
              Current Spend
            </span>

            <strong className="metric-value">
              ${data.totalSpend.toLocaleString()}
            </strong>

            <p className="metric-helper">
              Spend accumulated so far this month.
            </p>
          </div>
        </div>
      </ExecutiveCard>
    </motion.div>
  );
}