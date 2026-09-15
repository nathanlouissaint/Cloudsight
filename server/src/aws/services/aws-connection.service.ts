import {
  AssumeRoleCommand,
  GetCallerIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";

import {
  stsClient,
} from "../clients/sts.client";

export interface AwsConnectionVerificationResult {
  accountId: string;
  assumedRoleArn: string;
  roleArn: string;
}

export class AwsConnectionService {
  constructor(
    private readonly sts: STSClient = stsClient,
  ) {}

  async verifyRole(
    roleArn: string,
  ): Promise<AwsConnectionVerificationResult> {
    const assumeRoleResponse = await this.sts.send(
      new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: "cloudsight-spend-guard",
        DurationSeconds: 900,
      }),
    );

    const credentials =
      assumeRoleResponse.Credentials;

    if (
      !credentials?.AccessKeyId ||
      !credentials.SecretAccessKey ||
      !credentials.SessionToken
    ) {
      throw new Error(
        "AWS did not return temporary credentials.",
      );
    }

    const assumedRoleClient =
      new STSClient({
        region:
          process.env.AWS_REGION ??
          "us-east-1",

        credentials: {
          accessKeyId:
            credentials.AccessKeyId,

          secretAccessKey:
            credentials.SecretAccessKey,

          sessionToken:
            credentials.SessionToken,
        },
      });

    const identity =
      await assumedRoleClient.send(
        new GetCallerIdentityCommand({}),
      );

    if (
      !identity.Account ||
      !identity.Arn
    ) {
      throw new Error(
        "Unable to verify AWS identity.",
      );
    }

    return {
      accountId: identity.Account,
      assumedRoleArn: identity.Arn,
      roleArn,
    };
  }
}

export const awsConnectionService =
  new AwsConnectionService();
