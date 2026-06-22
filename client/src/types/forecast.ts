export interface ForecastResponse {
  currentSpend: number;
  averageDailySpend: number;
  elapsedDays: number;
  remainingDays: number;
  projectedSpend: number;
  budget: number;
  projectedVariance: number;
  onTrack: boolean;
}
