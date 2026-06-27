import { prisma } from "../config/prisma";

export async function findCostSnapshotsByAccount(
  accountId: string
) {
  return prisma.costSnapshot.findMany({
    where: {
      accountId,
    },
    include: {
      account: true,
    },
    orderBy: {
      snapshotDate: "asc",
    },
  });
}

export async function findCostSnapshotsByDateRange(
  startDate: Date,
  endDate: Date
) {
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

export async function findCurrentMonthCostSnapshots() {

  const now = new Date();

  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  return prisma.costSnapshot.findMany({
    where: {
      snapshotDate: {
        gte: monthStart,
        lte: now,
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
