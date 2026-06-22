/*
|--------------------------------------------------------------------------
| Dashboard Domain Types
|--------------------------------------------------------------------------
|
| Executive dashboard payload.
|
*/

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
}

export interface Optimization {
  resource: string;
  savings: number;
}

export interface DashboardResponse {
  overview: Overview;
  summary: ExecutiveSummary;
  costDrivers: CostDriver[];
  optimization: Optimization[];
}
