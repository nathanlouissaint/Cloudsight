import {
  randomBytes,
} from "node:crypto";

import {
  AssumeRoleCommand,
  GetCallerIdentityCommand,
  STSClient,
  type STSClientConfig,
} from "@aws-sdk/client-sts";

export interface VerifyAwsAccountConnectionInput {
  roleArn: string;
  externalId: string;
  expectedAwsAccountId: string;
}

export interface VerifiedAwsIdentity {
  accountId: string;
  arn: string | null;
}

type StsClientLike = {
  send(command: unknown): Promise<any>;
};

export type StsClientFactory = (
  config: STSClientConfig,
) => StsClientLike;

const defaultStsClientFactory:
  StsClientFactory =
  (config) => new STSClient(config);

export function generateExternalId(): string {
  return randomBytes(32).toString("hex");
}

export function validateRoleArn(
  value: string,
): string {
  const roleArn = value.trim();

  if (!roleArn) {
    throw new Error(
      "AWS role ARN is required",
    );
  }

  if (
    !/^arn:(aws|aws-us-gov|aws-cn):iam::\d{12}:role\/[\w+=,.@/-]+$/.test(
      roleArn,
    )
  ) {
    throw new Error(
      "AWS role ARN is invalid",
    );
  }

  return roleArn;
}

export async function verifyAwsAccountConnection(
  input: VerifyAwsAccountConnectionInput,
  createStsClient:
    StsClientFactory =
    defaultStsClientFactory,
): Promise<VerifiedAwsIdentity> {
  const roleArn =
    validateRoleArn(input.roleArn);

  const rootClient =
    createStsClient({
      region:
        process.env.AWS_REGION ??
        "us-east-1",
    });

  const assumed =
    await rootClient.send(
      new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName:
          "cloudsight-account-verification",
        ExternalId: input.externalId,
        DurationSeconds: 900,
      }),
    );

  const credentials =
    assumed.Credentials;

  if (
    !credentials?.AccessKeyId ||
    !credentials.SecretAccessKey ||
    !credentials.SessionToken
  ) {
    throw new Error(
      "AWS did not return temporary credentials",
    );
  }

  const accountClient =
    createStsClient({
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
    await accountClient.send(
      new GetCallerIdentityCommand({}),
    );

  if (!identity.Account) {
    throw new Error(
      "AWS account identity was not returned",
    );
  }

  if (
    identity.Account !==
    input.expectedAwsAccountId
  ) {
    throw new Error(
      "AWS role belongs to a different account",
    );
  }

  return {
    accountId:
      identity.Account,

    arn:
      identity.Arn ?? null,
  };
}
