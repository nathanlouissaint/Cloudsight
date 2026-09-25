export interface ServiceCost {
  service: string;
  amount: number;
}

export interface CostSummary {
  totalCost: number;
  currency: string;
  startDate: string;
  endDate: string;
}

export interface CostExplorerResponse {
  summary: CostSummary;
  services: ServiceCost[];
}

export interface DailyCost {
  date: string;
  amount: number;
  currency: string;
}

export interface DailyServiceCost extends DailyCost {
  serviceName: string;
}

export interface DailyCostCollection {
  accountDailyCosts: DailyCost[];
  serviceDailyCosts: DailyServiceCost[];
}
