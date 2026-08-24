import {
  findAccountTrendForOrganization,
} from "../repositories/account-trend.repository";

import {
  findCloudAccountByIdForOrganization,
} from "../repositories/cloud-account.repository";

type AccountTrendSnapshot = Awaited<
  ReturnType<
    typeof findAccountTrendForOrganization
  >
>[number];

export async function getAccountTrend(
  organizationId: string,
  accountId: string,
  startDate: Date,
  endDate: Date,
) {
  const account =
    await findCloudAccountByIdForOrganization(
      organizationId,
      accountId,
    );

  if (!account) {
    return null;
  }

  const snapshots =
    await findAccountTrendForOrganization(
      organizationId,
      accountId,
      startDate,
      endDate,
    );

  return {
    accountId,
    accountName: account.accountName,

    totalCost: snapshots.reduce(
      (
        sum: number,
        row: AccountTrendSnapshot,
      ) => sum + row.totalCost,
      0,
    ),

    trend: snapshots.map(
      (row: AccountTrendSnapshot) => ({
        date: row.snapshotDate,
        cost: row.totalCost,
      }),
    ),
  };
}