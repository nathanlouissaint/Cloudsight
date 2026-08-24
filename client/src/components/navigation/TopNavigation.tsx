import {
  Bell,
  Search,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  NavLink,
} from "react-router-dom";

import {
  useOrganization,
} from "../../organizations/useOrganization";

const navItems = [
  {
    label: "Dashboard",
    path: "/",
  },
  {
    label: "Costs",
    path: "/costs",
  },
  {
    label: "Forecasting",
    path: "/forecasting",
  },
  {
    label: "Alerts",
    path: "/alerts",
  },
  {
    label: "Reports",
    path: "/reports",
  },
  {
    label: "Security",
    path: "/settings/security",
  },
  {
    label: "Organization",
    path: "/settings/organization",
  },
];

export default function TopNavigation() {
  const {
    organizations,
    currentOrganizationId,
    loading,
    selectOrganization,
  } = useOrganization();

  const handleOrganizationChange = (
    organizationId: string,
  ) => {
    if (!organizationId) {
      return;
    }

    void selectOrganization(
      organizationId,
    );
  };

  return (
    <motion.header
      initial={{
        y: -20,
        opacity: 0,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.4,
      }}
      className="top-navigation"
    >
      <div className="nav-left">
        <div className="logo-mark">
          C
        </div>

        <div>
          <div className="logo-title">
            CloudSight
          </div>

          <div className="logo-subtitle">
            Cloud Cost Intelligence
          </div>
        </div>
      </div>

      <nav className="nav-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-right">
        <button className="search-trigger">
          <Search size={16} />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>

        <button
          type="button"
          className="icon-button"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <select
          className="account-switcher"
          aria-label="Switch workspace"
          value={
            currentOrganizationId ?? ""
          }
          disabled={
            loading ||
            organizations.length === 0
          }
          onChange={(event) =>
            handleOrganizationChange(
              event.target.value,
            )
          }
        >
          {loading && (
            <option value="">
              Loading workspaces...
            </option>
          )}

          {!loading &&
            organizations.length === 0 && (
              <option value="">
                No workspace
              </option>
            )}

          {!loading &&
            organizations.map(
              (organization) => (
                <option
                  key={organization.id}
                  value={organization.id}
                >
                  {organization.name}
                </option>
              ),
            )}
        </select>
      </div>
    </motion.header>
  );
}
