import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const cards = [
  {
    title: "Current Spend",
    value: "$3,068",
    trend: "+8.3%",
    subtitle: "vs last month",
    icon: DollarSign,
    status: "positive",
  },
  {
    title: "Forecast",
    value: "$4,383",
    trend: "+12.7%",
    subtitle: "projected month-end",
    icon: TrendingUp,
    status: "warning",
  },
  {
    title: "Budget Usage",
    value: "61.37%",
    trend: "+3.6%",
    subtitle: "of $5,000 budget",
    icon: ShieldCheck,
    status: "positive",
  },
  {
    title: "Savings Opportunity",
    value: "$1,240",
    trend: "+12.5%",
    subtitle: "identified optimizations",
    icon: Sparkles,
    status: "positive",
  },
];

export default function SummaryCards() {
  return (
    <section className="summary-grid">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: index * 0.08,
            }}
            whileHover={{
              y: -4,
            }}
            className="summary-card"
          >
            <div className="summary-top">
              <div className="summary-icon">
                <Icon size={18} />
              </div>

              <span
                className={
                  card.status === "positive"
                    ? "trend-positive"
                    : "trend-warning"
                }
              >
                {card.trend}
              </span>
            </div>

            <div className="summary-title">
              {card.title}
            </div>

            <div className="summary-value">
              {card.value}
            </div>

            <div className="summary-subtitle">
              {card.subtitle}
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}