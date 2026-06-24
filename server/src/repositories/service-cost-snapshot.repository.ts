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
    orderBy: {
      snapshotDate: "asc",
    },
  });
}
