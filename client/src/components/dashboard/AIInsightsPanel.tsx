import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default function AIInsightsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="analytics-card ai-insights-card"
    >
      <div className="analytics-header">
        <div>
          <div className="analytics-title">
            Executive Insights
          </div>

          <div className="analytics-subtitle">
            AI-generated operational summary
          </div>
        </div>

        <Sparkles size={18} />
      </div>

      <div className="insight-list">
        <div className="insight-item">
          <ShieldCheck size={18} />

          <div>
            <h4>Budget Status</h4>

            <p>
              Current spend remains within
              projected budget thresholds and is
              forecasted to finish under target.
            </p>
          </div>
        </div>

        <div className="insight-item">
          <TrendingUp size={18} />

          <div>
            <h4>EKS Growth Detected</h4>

            <p>
              Kubernetes infrastructure costs
              increased 14.2% week-over-week.
            </p>
          </div>
        </div>

        <div className="insight-highlight">
          <span>Potential Monthly Savings</span>

          <strong>$1,240</strong>
        </div>
      </div>
    </motion.div>
  );
}