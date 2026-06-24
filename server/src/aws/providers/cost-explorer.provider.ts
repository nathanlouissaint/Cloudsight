import {
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
  ServiceCost,
} from "../contracts/cost-explorer.types";

export class CostExplorerProvider
  implements AwsProvider
{
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
