import {
  findAccountTrendForOrganization,
} from "../repositories/account-trend.repository";

type AccountTrendSnapshot = Awaited<
  ReturnType<typeof findAccountTrendForOrganization>
>[number];

export async function getAccountTrend(
  organizationId: string,
  accountId: string,
  startDate: Date,
  endDate: Date
) {
  const snapshots =
    await findAccountTrendForOrganization(
      organizationId,
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
