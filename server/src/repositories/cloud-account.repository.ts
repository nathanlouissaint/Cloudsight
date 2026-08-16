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