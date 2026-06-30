import { motion } from "framer-motion";

import { useHistoricalTrends } from "../../hooks/useHistoricalTrends";

import AreaSpendChart from "../shared/charts/AreaSpendChart";
import BudgetHealthCard from "./BudgetHealthCard";
import AnalyticsCard from "../shared/AnalyticsCard";

export default function AnalyticsRow() {
  const {
    data = [],
    isLoading,
  } = useHistoricalTrends();

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="analytics-grid"
    >
      <AnalyticsCard
        title="Spend Trend"
        subtitle="Last 30 days cloud spend"
      >
        {isLoading ? (
          <div>Loading trends...</div>
        ) : (
          <AreaSpendChart data={data} />
        )}
      </AnalyticsCard>

      <BudgetHealthCard />
    </motion.section>
  );
}
