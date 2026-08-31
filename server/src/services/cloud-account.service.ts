import {
  Prisma,
} from "@prisma/client";

import {
  createCloudAccount,
  disconnectCloudAccount,
  findAllCloudAccountsForOrganization,
  findCloudAccountByAwsAccountId,
  findCloudAccountByIdForOrganization,
  reconnectCloudAccount,
  updateCloudAccountName,
} from "../repositories/cloud-account.repository";

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

  try {
    return await createCloudAccount(
      organizationId,
      awsAccountId,
      accountName,
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
