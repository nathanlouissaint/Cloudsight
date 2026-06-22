import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ExecutiveSummary() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="analytics-card executive-summary"
    >
      <div className="summary-header">
        <Sparkles size={18} />

        <h3>
          Executive Summary
        </h3>
      </div>

      <p>
        Cloud spend is forecasted to finish
        12% under budget this month.
      </p>

      <p>
        EKS spending increased 14.2%
        week-over-week due to cluster growth.
      </p>

      <p>
        Three optimization opportunities
        could reduce spend by approximately
        $1,240 monthly.
      </p>
    </motion.div>
  );
}
