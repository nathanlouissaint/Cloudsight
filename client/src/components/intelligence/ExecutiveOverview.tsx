import { motion } from "framer-motion";

export default function ExecutiveOverview() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="executive-overview"
    >
      <div className="overview-header">
        <div>
          <p className="overview-label">
            EXECUTIVE OVERVIEW
          </p>

          <h1>Cloud Financial Health</h1>
        </div>

        <div className="status-chip healthy">
          On Track
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-metric">
          <span>Forecast</span>
          <strong>$4,383</strong>
        </div>

        <div className="overview-metric">
          <span>Budget Usage</span>
          <strong>61.37%</strong>
        </div>

        <div className="overview-metric">
          <span>Confidence</span>
          <strong>92%</strong>
        </div>

        <div className="overview-metric">
          <span>Savings</span>
          <strong>$1,240</strong>
        </div>
      </div>
    </motion.section>
  );
}
