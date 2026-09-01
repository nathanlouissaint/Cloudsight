import { prisma } from "../config/prisma";

export async function findAllCloudAccountsForOrganization(
  organizationId: string,
) {
  return prisma.cloudAccount.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function findActiveCloudAccountsForOrganization(
  organizationId: string,
) {
  return prisma.cloudAccount.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function findCloudAccountByIdForOrganization(
  organizationId: string,
  accountId: string,
) {
  return prisma.cloudAccount.findFirst({
    where: {
      id: accountId,
      organizationId,
    },
  });
}

export async function findCloudAccountByAwsAccountId(
  awsAccountId: string,
) {
  return prisma.cloudAccount.findUnique({
    where: {
      awsAccountId,
    },
  });
}

export async function createCloudAccount(
  organizationId: string,
  awsAccountId: string,
  accountName: string,
  externalId: string,
) {
  return prisma.cloudAccount.create({
    data: {
      organizationId,
      awsAccountId,
      accountName,
      externalId,
    },
  });
}

export async function updateCloudAccountName(
  organizationId: string,
  accountId: string,
  accountName: string,
) {
  return prisma.cloudAccount.update({
    where: {
      id: accountId,
      organizationId,
    },
    data: {
      accountName,
    },
  });
}

export async function disconnectCloudAccount(
  organizationId: string,
  accountId: string,
) {
  return prisma.cloudAccount.update({
    where: {
      id: accountId,
      organizationId,
    },
    data: {
      isActive: false,
      disconnectedAt: new Date(),
    },
  });
}

export async function reconnectCloudAccount(
  organizationId: string,
  accountId: string,
) {
  return prisma.cloudAccount.update({
    where: {
      id: accountId,
      organizationId,
    },
    data: {
      isActive: true,
      disconnectedAt: null,
    },
  });
}

export async function configureCloudAccountConnection(
  organizationId: string,
  accountId: string,
  roleArn: string,
  externalId: string,
) {
  return prisma.cloudAccount.update({
    where: {
      id: accountId,
      organizationId,
    },
    data: {
      roleArn,
      externalId,
      connectionStatus: "PENDING",
      lastVerifiedAt: null,
      connectionError: null,
    },
  });
}

export async function updateCloudAccountConnectionState(
  organizationId: string,
  accountId: string,
  input: {
    connectionStatus:
      | "NOT_CONFIGURED"
      | "PENDING"
      | "CONNECTED"
      | "ERROR";
    lastVerifiedAt?: Date | null;
    connectionError?: string | null;
  },
) {
  return prisma.cloudAccount.update({
    where: {
      id: accountId,
      organizationId,
    },
    data: {
      connectionStatus:
        input.connectionStatus,

      ...(input.lastVerifiedAt !==
      undefined
        ? {
            lastVerifiedAt:
              input.lastVerifiedAt,
          }
        : {}),

      ...(input.connectionError !==
      undefined
        ? {
            connectionError:
              input.connectionError,
          }
        : {}),
    },
  });
}
