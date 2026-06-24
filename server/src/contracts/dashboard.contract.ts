import { z } from "zod";

export const DashboardContract = z.object({
  overview: z.object({
    forecast: z.number(),
    budgetUsage: z.number(),
    confidence: z.number(),
    savings: z.number(),
  }),

  summary: z.object({
    content: z.array(z.string()),
  }),

  costDrivers: z.array(
    z.object({
      service: z.string(),
      increase: z.number(),
      reason: z.string(),
    })
  ),

  optimization: z.array(
    z.object({
      resource: z.string(),
      savings: z.number(),
      priority: z.string(),
    })
  ),

  insights: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),

  anomalies: z.array(
    z.object({
      service: z.string(),
      impact: z.string(),
      severity: z.string(),
    })
  ),

  accounts: z.array(
    z.object({
      name: z.string(),
      status: z.string(),
    })
  ),

  forecastFactors: z.array(
    z.object({
      name: z.string(),
      impact: z.string(),
    })
  ),

  services: z.array(
    z.object({
      name: z.string(),
      spend: z.number(),
      percentage: z.number(),
    })
  ),
});

export type DashboardResponse =
  z.infer<typeof DashboardContract>;
