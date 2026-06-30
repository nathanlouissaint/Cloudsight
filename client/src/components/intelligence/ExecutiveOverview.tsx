import { motion } from "framer-motion";

import ExecutiveCard from "../shared/ExecutiveCard";

import { useReport } from "../../hooks/useReport";

export default function ExecutiveOverview() {
  const {
    data,
    isLoading,
    error,
  } = useReport();

  if (isLoading || error || !data) {
    return null;
  }

  const budgetUsage =
    data.budget > 0
      ? (
          (data.totalSpend / data.budget) *
          100
        ).toFixed(1)
      : "0";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <ExecutiveCard
        eyebrow="EXECUTIVE OVERVIEW"
        title="Cloud Financial Health"
        status={
          <div
            className={`status-chip ${data.budgetStatus}`}
          >
            {data.budgetStatus === "healthy"
              ? "On Track"
              : "Attention Required"}
          </div>
        }
      >
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
      </ExecutiveCard>
    </motion.div>
  );
}
