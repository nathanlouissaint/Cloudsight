import { prisma } from "../config/prisma";

export async function findAccountTrend(
  accountId: string,
  startDate: Date,
  endDate: Date
) {
  return prisma.costSnapshot.findMany({
    where: {
      accountId,
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