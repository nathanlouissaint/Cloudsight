import type { ForecastResponse } from "../types/forecast";

export const forecastMock: ForecastResponse = {
  summary: {
    currentSpend: 1245.33,
    averageDailySpend: 62.27,
    elapsedDays: 20,
    remainingDays: 11,
    projectedSpend: 1930.37,
    budget: 2200,
    projectedVariance: 269.63,
    onTrack: true,
  },

  confidence: {
    score: 88,
    level: "High",
    reason:
      "Historical spend has remained stable throughout the month.",
  },

  projection: [
    {
      day: 1,
      date: new Date().toISOString(),
      projectedSpend: 1307.6,
    },
    {
      day: 2,
      date: new Date(Date.now() + 86400000).toISOString(),
      projectedSpend: 1369.87,
    },
    {
      day: 3,
      date: new Date(Date.now() + 86400000 * 2).toISOString(),
      projectedSpend: 1432.14,
    },
  ],

  growthDrivers: [
    {
      name: "Amazon EC2",
      impact: 185,
      direction: "up",
    },
    {
      name: "Amazon S3",
      impact: -42,
      direction: "down",
    },
  ],

  explanation:
    "Based on 20 days of collected spend. Average daily spend is $62.27. Projected monthly spend remains below budget while EC2 continues to be the largest projected cost driver.",

  insights: [
    {
      type: "budget",
      severity: "info",
      title: "Forecast remains under budget",
      message:
        "Current projections indicate month-end spend will remain below the allocated budget.",
    },
    {
      type: "trend",
      severity: "warning",
      title: "Daily spend is increasing",
      message:
        "Seven-day moving average indicates a gradual increase in daily spend.",
    },
    {
      type: "service",
      severity: "info",
      title: "EC2 is the primary growth driver",
      message:
        "Amazon EC2 accounts for the largest projected increase during the remainder of the month.",
    },
  ],

  serviceForecasts: [
    {
      service: "Amazon EC2",
      projectedSpend: 1120,
    },
    {
      service: "Amazon S3",
      projectedSpend: 365,
    },
    {
      service: "Amazon RDS",
      projectedSpend: 245,
    },
  ],

  accountForecasts: [
    {
      account: "Production",
      projectedSpend: 1540,
    },
    {
      account: "Development",
      projectedSpend: 390,
    },
  ],
};
