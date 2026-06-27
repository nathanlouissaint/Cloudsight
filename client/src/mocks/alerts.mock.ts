import type {
  AlertsResponse,
} from "../types/alerts";

export const alertsMock: AlertsResponse = {

  summary: {
    total: 3,
    critical: 1,
    warning: 1,
    monitoring: 1,
  },

  metrics: {
    active: 2,
    resolved: 0,
    highestSeverity: "critical",
  },

  alerts: [

    {
      id: "cost-spike-2026-06-22",
      type: "cost_spike",
      severity: "warning",
      status: "active",
      title: "Compute Spend Increase",
      description:
        "Daily spend increased 34% above the 7-day baseline.",
      recommendation:
        "Review recent deployments, scaling changes, and compute-heavy workloads.",
      metric: "Daily Spend",
      currentValue: 184.42,
      threshold: 137.62,
      date: "2026-06-22",
    },

    {
      id: "forecast-risk",
      type: "forecast_risk",
      severity: "critical",
      status: "active",
      title: "Forecast Exceeds Budget",
      description:
        "Projected month-end spend exceeds the active monthly budget.",
      recommendation:
        "Reduce projected spend by optimizing high-cost services before month-end.",
      metric: "Projected Spend",
      currentValue: 5420.5,
      threshold: 5000,
      date: "2026-06-23",
    },

    {
      id: "budget-monitoring",
      type: "budget_risk",
      severity: "info",
      status: "monitoring",
      title: "Budget Monitoring",
      description:
        "Current spend remains within the approved budget range.",
      recommendation:
        "Continue monitoring daily spend and service-level growth drivers.",
      metric: "Monthly Spend",
      currentValue: 3180.25,
      threshold: 5000,
      date: "2026-06-23",
    },

  ],

};
