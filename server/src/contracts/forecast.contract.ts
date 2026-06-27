import { z } from "zod";

export const ForecastSummarySchema = z.object({
  currentSpend: z.number(),
  averageDailySpend: z.number(),
  elapsedDays: z.number(),
  remainingDays: z.number(),
  projectedSpend: z.number(),
  budget: z.number(),
  projectedVariance: z.number(),
  onTrack: z.boolean(),
});

export const ForecastConfidenceSchema = z.object({
  score: z.number(),
  level: z.enum([
    "Low",
    "Medium",
    "High",
  ]),
  reason: z.string(),
});

export const ForecastProjectionPointSchema =
  z.object({
    day: z.number(),
    date: z.string(),
    projectedSpend: z.number(),
  });

export const GrowthDriverSchema =
  z.object({
    name: z.string(),
    impact: z.number(),
    direction: z.enum([
      "up",
      "down",
    ]),
  });

export const ForecastInsightSchema =
  z.object({
    type: z.enum([
      "trend",
      "budget",
      "service",
    ]),
    severity: z.enum([
      "info",
      "warning",
      "critical",
    ]),
    title: z.string(),
    message: z.string(),
  });

export const ServiceForecastSchema =
  z.object({
    service: z.string(),
    projectedSpend: z.number(),
  });

export const AccountForecastSchema =
  z.object({
    account: z.string(),
    projectedSpend: z.number(),
  });

export const ForecastContract =
  z.object({
    summary: ForecastSummarySchema,

    confidence:
      ForecastConfidenceSchema,

    projection:
      z.array(
        ForecastProjectionPointSchema
      ),

    growthDrivers:
      z.array(
        GrowthDriverSchema
      ),

    explanation:
      z.string(),

    insights:
      z.array(
        ForecastInsightSchema
      ),

    serviceForecasts:
      z.array(
        ServiceForecastSchema
      ),

    accountForecasts:
      z.array(
        AccountForecastSchema
      ),
  });

export type ForecastResponse =
  z.infer<
    typeof ForecastContract
  >;
