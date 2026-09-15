import {
  STSClient,
} from "@aws-sdk/client-sts";

export const stsClient = new STSClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
