import {
  CostExplorerClient,
} from "@aws-sdk/client-cost-explorer";

export const costExplorerClient =
  new CostExplorerClient({
    region:
      process.env.AWS_REGION ??
      "us-east-1",
  });
