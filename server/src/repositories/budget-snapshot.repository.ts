import { prisma } from "../config/prisma";

export async function findBudgetSnapshotsByDateRange(
  startDate: Date,
  endDate: Date
) {
  return prisma.budgetSnapshot.findMany({
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

export async function createBudgetSnapshot(input: {
  budgetName: string;
  budgetAmount: number;
  actualSpend: number;
  snapshotDate: Date;
}) {
  return prisma.budgetSnapshot.create({
    data: input,
  });
}
