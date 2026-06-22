import type { DashboardResponse } from "../types/dashboard";

export const dashboardMock: DashboardResponse = {
  overview: {
    forecast: 4184,
    budgetUsage: 61,
    confidence: 92,
    savings: 1240,
  },

  summary: {
    content: [
      "Cloud spend remains below forecast.",
      "EC2 remains the largest cost driver.",
      "No budget breach risks detected.",
    ],
  },

  costDrivers: [
    {
      service: "EC2",
      increase: 18,
      reason: "Compute growth",
    },
    {
      service: "RDS",
      increase: 12,
      reason: "Database scaling",
    },
    {
      service: "S3",
      increase: 7,
      reason: "Storage growth",
    },
  ],

  optimization: [
    {
      resource: "Idle EC2 Instances",
      savings: 420,
      priority: "High",
    },
    {
      resource: "Unused EBS Volumes",
      savings: 190,
      priority: "Medium",
    },
    {
      resource: "Savings Plan Coverage",
      savings: 630,
      priority: "High",
    },
  ],

  insights: [
    {
      title: "Budget Status",
      description:
        "Current spend remains below forecasted budget.",
    },
    {
      title: "Optimization Potential",
      description:
        "Several underutilized resources detected.",
    },
  ],

  anomalies: [
    {
      service: "Lambda",
      impact: "+42%",
      severity: "critical",
    },
    {
      service: "EKS",
      impact: "+18%",
      severity: "warning",
    },
  ],

  accounts: [
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
  ],

  forecastFactors: [
    {
      name: "EKS Expansion",
      impact: "+8.2%",
    },
    {
      name: "Compute Growth",
      impact: "+3.1%",
    },
    {
      name: "Data Transfer",
      impact: "+1.4%",
    },
  ],

  services: [
    {
      name: "EC2",
      spend: 1245,
      percentage: 40.6,
    },
    {
      name: "EKS",
      spend: 842,
      percentage: 27.5,
    },
    {
      name: "RDS",
      spend: 512,
      percentage: 16.7,
    },
  ],
};
