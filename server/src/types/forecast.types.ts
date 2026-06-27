export interface ForecastSummary {
  currentSpend: number;
  averageDailySpend: number;
  elapsedDays: number;
  remainingDays: number;
  projectedSpend: number;
  budget: number;
  projectedVariance: number;
  onTrack: boolean;
}

export interface ForecastConfidence {
  score: number;
  level: "Low" | "Medium" | "High";
  reason: string;
}

export interface ForecastProjectionPoint {
  day: number;
  date: string;
  projectedSpend: number;
}

export interface GrowthDriver {
  name: string;
  impact: number;
  direction: "up" | "down";
}

export interface ServiceForecast {
  service: string;
  projectedSpend: number;
}

export interface AccountForecast {
  account: string;
  projectedSpend: number;
}

export interface ForecastInsight {
  type:
    | "trend"
    | "budget"
    | "service";

  severity:
    | "info"
    | "warning"
    | "critical";

  title: string;

  message: string;
}

export interface ForecastModel {
  summary: ForecastSummary;

  confidence: ForecastConfidence;

  projection: ForecastProjectionPoint[];

  growthDrivers: GrowthDriver[];

  explanation: string;

  insights: ForecastInsight[];

  serviceForecasts: ServiceForecast[];

  accountForecasts: AccountForecast[];
}
