import { prisma } from "../config/prisma";

export async function findAccountTrendForOrganization(
  organizationId: string,
  accountId: string,
  startDate: Date,
  endDate: Date,
) {
  return prisma.costSnapshot.findMany({
    where: {
      accountId,
      account: {
        organizationId,
      },
      snapshotDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      snapshotDate: "asc",
    },
  });
}