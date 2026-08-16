import { prisma } from "../config/prisma";

export async function findCostSnapshotsByAccountForOrganization(
  organizationId: string,
  accountId: string,
) {
  return prisma.costSnapshot.findMany({
    where: {
      accountId,
      account: {
        organizationId,
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

export async function findCostSnapshotsByDateRangeForOrganization(
  organizationId: string,
  startDate: Date,
  endDate: Date,
) {
  return prisma.costSnapshot.findMany({
    where: {
      snapshotDate: {
        gte: startDate,
        lte: endDate,
      },
      account: {
        organizationId,
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

export async function findCurrentMonthCostSnapshotsForOrganization(
  organizationId: string,
) {
  const now = new Date();

  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  return prisma.costSnapshot.findMany({
    where: {
      snapshotDate: {
        gte: monthStart,
        lte: now,
      },
      account: {
        organizationId,
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