import type {
  CostExplorerResponse,
  ServiceCost,
} from "./cost-explorer.types";

export interface AwsProvider {
  getCostSummary():
    Promise<CostExplorerResponse>;

  getServiceBreakdown():
    Promise<ServiceCost[]>;

  getForecast():
    Promise<number>;
}
