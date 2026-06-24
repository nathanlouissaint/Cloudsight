import { prisma } from "../config/prisma";

export async function findCostSnapshotsByAccount(accountId: string) {
  return prisma.costSnapshot.findMany({
    where: { accountId },
    orderBy: {
      snapshotDate: "asc",
    },
  });
}

export async function findCostSnapshotsByDateRange(startDate: Date, endDate: Date) {
  return prisma.costSnapshot.findMany({
    where: {
      snapshotDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      account: true,
    },
    orderBy: {
      snapshotDate: "asc",
    },
  });
}

export async function createCostSnapshot(input: {
  accountId: string;
  snapshotDate: Date;
  totalCost: number;
}) {
  return prisma.costSnapshot.create({
    data: input,
  });
}
