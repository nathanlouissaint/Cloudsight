import { motion } from "framer-motion";

export default function ExecutiveHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="executive-hero"
    >
      <div className="hero-content">
        <p className="hero-label">
          CLOUD COST INTELLIGENCE PLATFORM
        </p>

        <h1>
          Financial visibility for
          enterprise cloud infrastructure.
        </h1>

        <p className="hero-description">
          Monitor spend across AWS accounts, forecast future
          cloud costs, detect anomalies before they become
          budget overruns, and provide executives with
          real-time financial intelligence.
        </p>
      </div>

      <div className="hero-status">
        <div className="status-chip healthy">
          Healthy Budget
        </div>
      </div>
    </motion.section>
  );
}