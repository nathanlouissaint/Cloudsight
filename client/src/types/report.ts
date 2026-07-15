export interface ReportResponse {
  period: string;

  totalSpend: number;

  budget: number;

  forecastedSpend: number;

  budgetVariance: number;

  variancePercent: number;

  generatedAt: string;

  reportStatus: string;

  topService: string;

  topServiceSpend: number;

  budgetStatus: string;

  summary: string;
}