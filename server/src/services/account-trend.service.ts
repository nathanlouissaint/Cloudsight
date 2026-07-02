import {
  findAccountTrend,
} from "../repositories/account-trend.repository";

type AccountTrendSnapshot = Awaited<
  ReturnType<typeof findAccountTrend>
>[number];

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
      (
        sum: number,
        row: AccountTrendSnapshot
      ) => sum + row.totalCost,
      0
    ),

    trend: snapshots.map(
      (row: AccountTrendSnapshot) => ({
        date: row.snapshotDate,
        cost: row.totalCost,
      })
    ),
  };
}
