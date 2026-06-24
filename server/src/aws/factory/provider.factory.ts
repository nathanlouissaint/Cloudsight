import { MockProvider }
  from "../adapters/mock.provider";

import { CostExplorerProvider }
  from "../providers/cost-explorer.provider";

export function getAwsProvider() {
  const provider =
    process.env.AWS_PROVIDER ??
    "mock";

  switch (provider) {
    case "aws":
      return new CostExplorerProvider();

    case "mock":
    default:
      return new MockProvider();
  }
}
