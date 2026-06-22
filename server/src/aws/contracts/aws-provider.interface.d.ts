import type { CostExplorerResponse } from "./cost-explorer.types";
export interface AwsProvider {
    getCostSummary(): Promise<CostExplorerResponse>;
}
//# sourceMappingURL=aws-provider.interface.d.ts.map