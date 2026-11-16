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

export interface AwsTemporaryCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

export class AwsConnectionService {
  constructor(
    private readonly sts: STSClient = stsClient,
  ) {}

  async assumeRole(
    roleArn: string,
  ): Promise<AwsTemporaryCredentials> {
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

    return {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
    };
  }

  async verifyRole(
    roleArn: string,
  ): Promise<AwsConnectionVerificationResult> {
    const credentials =
      await this.assumeRole(roleArn);

    const assumedRoleClient =
      new STSClient({
        region:
          process.env.AWS_REGION ??
          "us-east-1",

        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken,
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
