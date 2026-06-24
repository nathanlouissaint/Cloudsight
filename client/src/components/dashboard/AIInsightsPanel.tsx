import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

import { useDashboard } from "../../hooks/useDashboard";

export default function AIInsightsPanel() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return null;
  }

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

        {data.insights.map(
          (insight, index) => (
            <div
              key={insight.title}
              className="insight-item"
            >
              {index === 0 ? (
                <ShieldCheck size={18} />
              ) : (
                <TrendingUp size={18} />
              )}

              <div>
                <h4>{insight.title}</h4>

                <p>
                  {insight.description}
                </p>
              </div>
            </div>
          )
        )}

        <div className="insight-highlight">
          <span>
            Potential Monthly Savings
          </span>

          <strong>
            $
            {data.overview.savings.toLocaleString()}
          </strong>
        </div>

      </div>
    </motion.div>
  );
}
