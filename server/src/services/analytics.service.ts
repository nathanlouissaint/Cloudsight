import {
  findCostSnapshotsByDateRange
}
from "../repositories/cost-snapshot.repository";

export async function getHistoricalCostTrends(
  startDate: Date,
  endDate: Date
) {
  const snapshots =
    await findCostSnapshotsByDateRange(
      startDate,
      endDate
    );

  const totalCost = snapshots.reduce(
    (sum, row) =>
      sum + row.totalCost,
    0
  );

  const averageDailyCost =
    snapshots.length > 0
      ? totalCost / snapshots.length
      : 0;

  const highest =
    snapshots.length > 0
      ? [...snapshots].sort(
          (a, b) =>
            b.totalCost -
            a.totalCost
        )[0]
      : null;

  const lowest =
    snapshots.length > 0
      ? [...snapshots].sort(
          (a, b) =>
            a.totalCost -
            b.totalCost
        )[0]
      : null;

  return {
    startDate,
    endDate,

    totalCost,

    averageDailyCost,

    snapshotCount:
      snapshots.length,

    highestCostDay:
      highest,

    lowestCostDay:
      lowest,

    trends: snapshots.map(
      (snapshot) => ({
        accountId:
          snapshot.accountId,

        accountName:
          snapshot.account
            .accountName,

        awsAccountId:
          snapshot.account
            .awsAccountId,

        snapshotDate:
          snapshot.snapshotDate,

        totalCost:
          snapshot.totalCost,
      })
    ),
  };
}
