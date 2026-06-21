import { motion } from "framer-motion";
import SpendTrendChart from "../charts/SpendTrendChart";
import BudgetHealthCard from "./BudgetHealthCard";

export default function AnalyticsRow() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="analytics-grid"
    >
      <div className="analytics-card">
        <div className="analytics-header">
          <div>
            <div className="analytics-title">
              Spend Trend
            </div>

            <div className="analytics-subtitle">
              Last 30 days cloud spend
            </div>
          </div>
        </div>

        <SpendTrendChart />
      </div>

      <BudgetHealthCard />
    </motion.section>
  );
}