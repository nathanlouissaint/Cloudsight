import type { AlertsResponse } from "../types/alerts";

export const alertsMock: AlertsResponse = {
  alerts: [
    {
      id: "1",
      type: "cost_spike",
      severity: "warning",
      title: "Compute Spend Increase",
      description:
        "Daily spend increased 34% above baseline.",
      date: "2026-06-22",
    },
    {
      id: "2",
      type: "budget_risk",
      severity: "info",
      title: "Budget Monitoring",
      description:
        "Forecast remains below budget threshold.",
      date: "2026-06-22",
    },
    {
      id: "3",
      type: "budget_breach",
      severity: "critical",
      title: "Budget Threshold Exceeded",
      description:
        "Forecast indicates spend will exceed monthly budget.",
      date: "2026-06-23",
    }
  ],
};
