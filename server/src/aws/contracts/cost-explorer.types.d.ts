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
//# sourceMappingURL=cost-explorer.types.d.ts.map