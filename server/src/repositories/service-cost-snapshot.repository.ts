import { prisma } from "../config/prisma";

export async function createServiceCostSnapshot(input: {
  accountId: string;
  serviceName: string;
  snapshotDate: Date;
  cost: number;
}) {
  return prisma.serviceCostSnapshot.create({
    data: input,
  });
}

export async function findServiceSnapshotsByDateRange(
  startDate: Date,
  endDate: Date
) {
  return prisma.serviceCostSnapshot.findMany({
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

export async function findServiceSnapshotsByService(
  serviceName: string,
  startDate: Date,
  endDate: Date
) {
  return prisma.serviceCostSnapshot.findMany({
    where: {
      serviceName: {
        contains: serviceName,
        mode: "insensitive",
      },
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

export async function findCurrentMonthServiceSnapshots() {

  const now = new Date();

  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  return prisma.serviceCostSnapshot.findMany({
    where: {
      snapshotDate: {
        gte: monthStart,
        lte: now,
      },
    },
    include: {
      account: true,
    },
    orderBy: [
      {
        serviceName: "asc",
      },
      {
        snapshotDate: "asc",
      },
    ],
  });

}

export async function findCurrentMonthServiceSnapshotsByService(
  serviceName: string
) {

  const now = new Date();

  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  return prisma.serviceCostSnapshot.findMany({
    where: {
      serviceName,
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
