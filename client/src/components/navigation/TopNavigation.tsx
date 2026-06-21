import { Bell, ChevronDown, Search } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  "Dashboard",
  "Costs",
  "Forecasting",
  "Alerts",
  "Reports",
];

export default function TopNavigation() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="top-navigation"
    >
      <div className="nav-left">
        <div className="logo-mark">C</div>

        <div>
          <div className="logo-title">CloudSight</div>
          <div className="logo-subtitle">
            Cloud Cost Intelligence
          </div>
        </div>
      </div>

      <nav className="nav-center">
        {navItems.map((item) => (
          <button key={item}>{item}</button>
        ))}
      </nav>

      <div className="nav-right">
        <button className="search-trigger">
          <Search size={16} />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>

        <button className="icon-button">
          <Bell size={18} />
        </button>

        <button className="account-switcher">
          Production
          <ChevronDown size={14} />
        </button>
      </div>
    </motion.header>
  );
}