import type { AwsProvider } from "../contracts/aws-provider.interface";
export declare class MockProvider implements AwsProvider {
    getCostSummary(): Promise<{
        summary: {
            totalCost: number;
            currency: string;
            startDate: string;
            endDate: string;
        };
        services: {
            service: string;
            amount: number;
        }[];
    }>;
}
//# sourceMappingURL=mock.provider.d.ts.map