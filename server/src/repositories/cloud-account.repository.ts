import { prisma } from "../config/prisma";

export async function findAllCloudAccounts() {
  return prisma.cloudAccount.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function findCloudAccountById(id: string) {
  return prisma.cloudAccount.findUnique({
    where: { id },
  });
}

export async function findCloudAccountByAwsAccountId(awsAccountId: string) {
  return prisma.cloudAccount.findUnique({
    where: { awsAccountId },
  });
}
