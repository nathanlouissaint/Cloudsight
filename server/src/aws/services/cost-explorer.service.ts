import {
  CostExplorerProvider,
} from "../providers/cost-explorer.provider";

import {
  MockProvider,
} from "../adapters/mock.provider";

import type {
  AwsTemporaryCredentials,
} from "./aws-connection.service";

import type {
  DailyCostCollection,
} from "../contracts/cost-explorer.types";

import { getAwsProvider }
  from "../factory/provider.factory";

export function isMockCostCollectionEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.SPEND_GUARD_MOCK_AWS === "true"
  );
}

export const spendGuardCostExplorerService = {
  async getDailyCosts(input: {
    roleArn: string;
    credentials?: AwsTemporaryCredentials;
  }): Promise<DailyCostCollection> {
    if (isMockCostCollectionEnabled()) {
      return new MockProvider().getDailyCosts();
    }

    if (!input.credentials) {
      throw new Error(
        "Temporary AWS credentials are required for cost collection.",
      );
    }

    return new CostExplorerProvider(
      input.credentials,
    ).getDailyCosts();
  },
};

export async function getCostSummary() {
  const provider =
    getAwsProvider();

  return provider.getCostSummary();
}
