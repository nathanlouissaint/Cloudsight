import type {
  AwsProvider,
} from "../contracts/aws-provider.interface";

import type {
  CostExplorerResponse,
  DailyCostCollection,
  ServiceCost,
} from "../contracts/cost-explorer.types";

export class MockProvider
  implements AwsProvider
{
  async getDailyCosts(
    now = new Date(),
  ): Promise<DailyCostCollection> {
    const days = Math.min(now.getUTCDate(), 3);
    const dateForDay = (day: number) =>
      new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          day,
        ),
      ).toISOString().slice(0, 10);

    return {
      accountDailyCosts: Array.from(
        { length: days },
        (_, index) => ({
          date: dateForDay(index + 1),
          amount: 100 + index * 20,
          currency: "USD",
        }),
      ),
      serviceDailyCosts: Array.from(
        { length: days },
        (_, index) => {
          const date = dateForDay(index + 1);

          return [
            {
              date,
              serviceName: "Amazon EC2",
              amount: 70 + index * 10,
              currency: "USD",
            },
            {
              date,
              serviceName: "Amazon S3",
              amount: 30 + index * 10,
              currency: "USD",
            },
          ];
        },
      ).flat(),
    };
  }

  async getCostSummary():
    Promise<CostExplorerResponse>
  {
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

  async getServiceBreakdown():
    Promise<ServiceCost[]>
  {
    return [
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
    ];
  }

  async getForecast():
    Promise<number>
  {
    return 3450;
  }
}
