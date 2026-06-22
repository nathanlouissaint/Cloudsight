export class MockProvider {
    async getCostSummary() {
        return {
            summary: {
                totalCost: 3068,
                currency: "USD",
                startDate: "2026-06-01",
                endDate: "2026-06-30",
            },
            services: [
                {
                    service: "Amazon EC2",
                    amount: 1420,
                },
                {
                    service: "Amazon RDS",
                    amount: 512,
                },
                {
                    service: "Amazon S3",
                    amount: 320,
                },
            ],
        };
    }
}
//# sourceMappingURL=mock.provider.js.map