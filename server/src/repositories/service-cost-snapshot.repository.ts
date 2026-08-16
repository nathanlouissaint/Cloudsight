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

export async function findServiceSnapshotsByDateRangeForOrganization(
  organizationId: string,
  startDate: Date,
  endDate: Date,
) {
  return prisma.serviceCostSnapshot.findMany({
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

export async function findServiceSnapshotsByServiceForOrganization(
  organizationId: string,
  serviceName: string,
  startDate: Date,
  endDate: Date,
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

export async function findCurrentMonthServiceSnapshotsForOrganization(
  organizationId: string,
) {
  const now = new Date();

  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  return prisma.serviceCostSnapshot.findMany({
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

export async function findCurrentMonthServiceSnapshotsByServiceForOrganization(
  organizationId: string,
  serviceName: string,
) {
  const now = new Date();

  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  return prisma.serviceCostSnapshot.findMany({
    where: {
      serviceName,
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