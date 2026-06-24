import { z } from "zod";

export const ForecastContract = z.object({
  currentSpend: z.number(),
  averageDailySpend: z.number(),
  elapsedDays: z.number(),
  remainingDays: z.number(),
  projectedSpend: z.number(),
  budget: z.number(),
  projectedVariance: z.number(),
  onTrack: z.boolean(),
});

export type ForecastResponse =
  z.infer<typeof ForecastContract>;
