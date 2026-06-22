import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useDashboard } from "../../hooks/useDashboard";

export default function ExecutiveSummary() {
  const { data, loading } = useDashboard();

  if (loading || !data) {
    return null;
  }

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

      {data.summary.content.map((item) => (
        <p key={item}>
          {item}
        </p>
      ))}
    </motion.div>
  );
}
