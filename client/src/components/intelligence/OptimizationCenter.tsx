import { motion } from "framer-motion";

const recommendations = [
  {
    item: "Idle EC2",
    savings: "$420/mo"
  },
  {
    item: "Unused EBS",
    savings: "$190/mo"
  },
  {
    item: "Reserved Instances",
    savings: "$630/mo"
  }
];

export default function OptimizationCenter() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="analytics-card"
    >
      <div className="analytics-title">
        Optimization Center
      </div>

      <div className="analytics-subtitle">
        Highest impact savings opportunities
      </div>

      <div className="optimization-list">
        {recommendations.map(item => (
          <div
            key={item.item}
            className="optimization-row"
          >
            <span>{item.item}</span>

            <strong>{item.savings}</strong>
          </div>
        ))}
      </div>

      <div className="optimization-total">
        <span>Total Opportunity</span>
        <strong>$1,240/mo</strong>
      </div>
    </motion.div>
  );
}
