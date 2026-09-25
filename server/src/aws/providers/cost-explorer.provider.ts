import {
  CostExplorerClient,
  type CostExplorerClientConfig,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

import {
  costExplorerClient,
} from "../clients/cost-explorer.client";

import type {
  AwsProvider,
} from "../contracts/aws-provider.interface";

import type {
  CostExplorerResponse,
  DailyCostCollection,
  ServiceCost,
} from "../contracts/cost-explorer.types";

export class CostExplorerProvider
  implements AwsProvider
{
  private readonly client: CostExplorerClient;

  constructor(
    credentials?: CostExplorerClientConfig["credentials"],
  ) {
    this.client = new CostExplorerClient({
      region: process.env.AWS_REGION ?? "us-east-1",
      credentials,
    });
  }

  async getDailyCosts(
    now = new Date(),
  ): Promise<DailyCostCollection> {
    const startDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1,
      ),
    );
    const endDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
      ),
    );
    const timePeriod = {
      Start: startDate.toISOString().slice(0, 10),
      End: endDate.toISOString().slice(0, 10),
    };

    const [accountResult, serviceResult] =
      await Promise.all([
        this.client.send(
          new GetCostAndUsageCommand({
            TimePeriod: timePeriod,
            Granularity: "DAILY",
            Metrics: ["UnblendedCost"],
          }),
        ),
        this.client.send(
          new GetCostAndUsageCommand({
            TimePeriod: timePeriod,
            Granularity: "DAILY",
            Metrics: ["UnblendedCost"],
            GroupBy: [
              {
                Type: "DIMENSION",
                Key: "SERVICE",
              },
            ],
          }),
        ),
      ]);

    const accountDailyCosts =
      (accountResult.ResultsByTime ?? []).flatMap(
        (result) => {
          const date = result.TimePeriod?.Start;
          const metric = result.Total?.UnblendedCost;
          const amount = Number(metric?.Amount);

          if (!date || !Number.isFinite(amount)) {
            return [];
          }

          return [{
            date,
            amount,
            currency: metric?.Unit ?? "USD",
          }];
        },
      );

    const serviceDailyCosts =
      (serviceResult.ResultsByTime ?? []).flatMap(
        (result) => {
          const date = result.TimePeriod?.Start;

          if (!date) {
            return [];
          }

          return (result.Groups ?? []).flatMap(
            (group) => {
              const serviceName = group.Keys?.[0];
              const metric = group.Metrics?.UnblendedCost;
              const amount = Number(metric?.Amount);

              if (!serviceName || !Number.isFinite(amount)) {
                return [];
              }

              return [{
                date,
                serviceName,
                amount,
                currency: metric?.Unit ?? "USD",
              }];
            },
          );
        },
      );

    return {
      accountDailyCosts,
      serviceDailyCosts,
    };
  }

  async getCostSummary():
    Promise<CostExplorerResponse>
  {
    const endDate =
      new Date();

    const startDate =
      new Date();

    startDate.setDate(
      startDate.getDate() - 30
    );

    const result =
      await costExplorerClient.send(
        new GetCostAndUsageCommand({
          TimePeriod: {
            Start:
              startDate
                .toISOString()
                .split("T")[0],

            End:
              endDate
                .toISOString()
                .split("T")[0],
          },

          Granularity: "MONTHLY",

          Metrics: ["UnblendedCost"],
        })
      );

    return {
      summary: {
        totalCost: 0,
        currency: "USD",
        startDate:
          startDate
            .toISOString()
            .split("T")[0],

        endDate:
          endDate
            .toISOString()
            .split("T")[0],
      },

      services: [],
    };
  }

  async getServiceBreakdown():
    Promise<ServiceCost[]>
  {
    return [];
  }

  async getForecast():
    Promise<number>
  {
    return 0;
  }
}
