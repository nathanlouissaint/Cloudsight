export interface Overview {
  forecast: number;
  budgetUsage: number;
  confidence: number;
  savings: number;
}

export interface ExecutiveSummary {
  content: string[];
}

export interface CostDriver {
  service: string;
  increase: number;
  reason: string;
}

export interface Optimization {
  resource: string;
  savings: number;
  priority: string;
}

export interface AIInsight {
  title: string;
  description: string;
}

export interface Anomaly {
  service: string;
  impact: string;
  severity: string;
}

export interface AccountStatus {
  name: string;
  status: string;
}

export interface ForecastFactor {
  name: string;
  impact: string;
}

export interface ServiceBreakdown {
  name: string;
  spend: number;
  percentage: number;
}

export interface DashboardResponse {
  overview: Overview;

  summary: ExecutiveSummary;

  costDrivers: CostDriver[];

  optimization: Optimization[];

  insights: AIInsight[];

  anomalies: Anomaly[];

  accounts: AccountStatus[];

  forecastFactors: ForecastFactor[];

  services: ServiceBreakdown[];
}
