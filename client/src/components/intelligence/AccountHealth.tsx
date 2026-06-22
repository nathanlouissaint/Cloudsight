import { motion } from "framer-motion";

const accounts = [
  {
    name: "Production",
    status: "Healthy",
  },
  {
    name: "Staging",
    status: "Healthy",
  },
  {
    name: "Development",
    status: "Warning",
  },
];

export default function AccountHealth() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="analytics-card"
    >
      <div className="analytics-title">
        Account Health
      </div>

      <div className="analytics-subtitle">
        Environment status overview
      </div>

      {accounts.map((account) => (
        <div
          key={account.name}
          className="driver-row"
        >
          <span>{account.name}</span>

          <div
            className={
              account.status === "Healthy"
                ? "status-chip healthy"
                : "status-chip warning"
            }
          >
            {account.status}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
