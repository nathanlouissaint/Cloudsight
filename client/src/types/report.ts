export interface ReportResponse {
  period: string;
  totalSpend: number;
  budget: number;
  forecastedSpend: number;
  topService: string;
  topServiceSpend: number;
  budgetStatus: string;
  summary: string;
}
