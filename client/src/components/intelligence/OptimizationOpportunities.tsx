import { motion } from "framer-motion";

const opportunities = [
  {
    resource: "Idle EC2 Instances",
    impact: "$420/mo",
    priority: "High"
  },
  {
    resource: "Unused EBS Volumes",
    impact: "$190/mo",
    priority: "Medium"
  },
  {
    resource: "Savings Plan Coverage",
    impact: "$630/mo",
    priority: "High"
  }
];

export default function OptimizationOpportunities() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="analytics-card"
    >
      <div className="analytics-title">
        Optimization Opportunities
      </div>

      <div className="analytics-subtitle">
        Ranked by financial impact
      </div>

      <div className="optimization-table">
        {opportunities.map((item) => (
          <div
            key={item.resource}
            className="optimization-row"
          >
            <div>
              <strong>{item.resource}</strong>
            </div>

            <div>
              <strong>{item.impact}</strong>
            </div>

            <div
              className={
                item.priority === "High"
                  ? "status-chip critical"
                  : "status-chip warning"
              }
            >
              {item.priority}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
