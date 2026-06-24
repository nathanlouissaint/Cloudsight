import { findAccountTrend }
  from "../repositories/account-trend.repository";

export async function getAccountTrend(
  accountId: string,
  startDate: Date,
  endDate: Date
) {
  const snapshots =
    await findAccountTrend(
      accountId,
      startDate,
      endDate
    );

  return {
    accountId,
    totalCost: snapshots.reduce(
      (sum, row) => sum + row.totalCost,
      0
    ),

    trend: snapshots.map((row) => ({
      date: row.snapshotDate,
      cost: row.totalCost,
    })),
  };
}