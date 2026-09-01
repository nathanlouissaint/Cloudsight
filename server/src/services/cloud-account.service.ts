import {
  Prisma,
} from "@prisma/client";

import {
  configureCloudAccountConnection,
  createCloudAccount,
  disconnectCloudAccount,
  findAllCloudAccountsForOrganization,
  findCloudAccountByAwsAccountId,
  findCloudAccountByIdForOrganization,
  reconnectCloudAccount,
  updateCloudAccountConnectionState,
  updateCloudAccountName,
} from "../repositories/cloud-account.repository";

import {
  generateExternalId,
  validateRoleArn,
  verifyAwsAccountConnection,
} from "../aws/services/account-connection.service";

export class CloudAccountError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "CloudAccountError";
  }
}

function normalizeAccountName(
  value: string,
): string {
  const accountName = value.trim();

  if (!accountName) {
    throw new CloudAccountError(
      400,
      "Account name is required",
    );
  }

  if (accountName.length > 120) {
    throw new CloudAccountError(
      400,
      "Account name must be 120 characters or fewer",
    );
  }

  return accountName;
}

function normalizeAwsAccountId(
  value: string,
): string {
  const awsAccountId = value.trim();

  if (!/^\d{12}$/.test(awsAccountId)) {
    throw new CloudAccountError(
      400,
      "AWS account ID must contain exactly 12 digits",
    );
  }

  return awsAccountId;
}

export async function listCloudAccounts(
  organizationId: string,
) {
  return findAllCloudAccountsForOrganization(
    organizationId,
  );
}

export async function addCloudAccount(
  organizationId: string,
  awsAccountIdInput: string,
  accountNameInput: string,
) {
  const awsAccountId =
    normalizeAwsAccountId(
      awsAccountIdInput,
    );

  const accountName =
    normalizeAccountName(
      accountNameInput,
    );

  const existing =
    await findCloudAccountByAwsAccountId(
      awsAccountId,
    );

  if (existing) {
    throw new CloudAccountError(
      409,
      "AWS account is already registered",
    );
  }

  const externalId =
    generateExternalId();

  try {
    return await createCloudAccount(
      organizationId,
      awsAccountId,
      accountName,
      externalId,
    );
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new CloudAccountError(
        409,
        "AWS account is already registered",
      );
    }

    throw error;
  }
}

export async function renameCloudAccount(
  organizationId: string,
  accountId: string,
  accountNameInput: string,
) {
  const account =
    await findCloudAccountByIdForOrganization(
      organizationId,
      accountId,
    );

  if (!account) {
    throw new CloudAccountError(
      404,
      "Cloud account not found",
    );
  }

  const accountName =
    normalizeAccountName(
      accountNameInput,
    );

  return updateCloudAccountName(
    organizationId,
    accountId,
    accountName,
  );
}

export async function disconnectCloudAccountForOrganization(
  organizationId: string,
  accountId: string,
) {
  const account =
    await findCloudAccountByIdForOrganization(
      organizationId,
      accountId,
    );

  if (!account) {
    throw new CloudAccountError(
      404,
      "Cloud account not found",
    );
  }

  if (!account.isActive) {
    return account;
  }

  return disconnectCloudAccount(
    organizationId,
    accountId,
  );
}

export async function reconnectCloudAccountForOrganization(
  organizationId: string,
  accountId: string,
) {
  const account =
    await findCloudAccountByIdForOrganization(
      organizationId,
      accountId,
    );

  if (!account) {
    throw new CloudAccountError(
      404,
      "Cloud account not found",
    );
  }

  if (account.isActive) {
    return account;
  }

  return reconnectCloudAccount(
    organizationId,
    accountId,
  );
}

export async function configureAwsConnection(
  organizationId: string,
  accountId: string,
  roleArnInput: string,
) {
  const account =
    await findCloudAccountByIdForOrganization(
      organizationId,
      accountId,
    );

  if (!account) {
    throw new CloudAccountError(
      404,
      "Cloud account not found",
    );
  }

  if (!account.isActive) {
    throw new CloudAccountError(
      409,
      "Cloud account is disconnected",
    );
  }

  let roleArn: string;

  try {
    roleArn =
      validateRoleArn(
        roleArnInput,
      );
  } catch {
    throw new CloudAccountError(
      400,
      "AWS role ARN is invalid",
    );
  }

  const arnMatch =
    roleArn.match(
      /^arn:(?:aws|aws-us-gov|aws-cn):iam::(\d{12}):role\//,
    );

  if (
    !arnMatch ||
    arnMatch[1] !== account.awsAccountId
  ) {
    throw new CloudAccountError(
      400,
      "AWS role ARN must belong to the registered AWS account",
    );
  }

  const externalId =
    account.externalId ??
    generateExternalId();

  return configureCloudAccountConnection(
    organizationId,
    accountId,
    roleArn,
    externalId,
  );
}

export async function verifyCloudAccountAwsConnection(
  organizationId: string,
  accountId: string,
  verifyConnection = verifyAwsAccountConnection,
) {
  const account =
    await findCloudAccountByIdForOrganization(
      organizationId,
      accountId,
    );

  if (!account) {
    throw new CloudAccountError(
      404,
      "Cloud account not found",
    );
  }

  if (!account.isActive) {
    throw new CloudAccountError(
      409,
      "Cloud account is disconnected",
    );
  }

  if (
    !account.roleArn ||
    !account.externalId
  ) {
    throw new CloudAccountError(
      409,
      "AWS connection is not configured",
    );
  }

  await updateCloudAccountConnectionState(
    organizationId,
    accountId,
    {
      connectionStatus:
        "PENDING",
      connectionError: null,
    },
  );

  try {
    const identity =
      await verifyConnection({
        roleArn:
          account.roleArn,

        externalId:
          account.externalId,

        expectedAwsAccountId:
          account.awsAccountId,
      });

    const updated =
      await updateCloudAccountConnectionState(
        organizationId,
        accountId,
        {
          connectionStatus:
            "CONNECTED",

          lastVerifiedAt:
            new Date(),

          connectionError: null,
        },
      );

    return {
      account: updated,
      identity,
    };
  } catch (error) {
    const connectionError =
      error instanceof Error
        ? error.message.slice(0, 1000)
        : "AWS connection verification failed";

    await updateCloudAccountConnectionState(
      organizationId,
      accountId,
      {
        connectionStatus:
          "ERROR",

        lastVerifiedAt: null,

        connectionError,
      },
    );

    throw new CloudAccountError(
      502,
      "AWS account verification failed",
    );
  }
}
