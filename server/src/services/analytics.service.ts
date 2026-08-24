import {
  findCostSnapshotsByDateRangeForOrganization,
} from "../repositories/cost-snapshot.repository";

import {
  historicalTrendService,
} from "./historical-trend.service";

type CostSnapshotWithAccount = Awaited<
  ReturnType<
    typeof findCostSnapshotsByDateRangeForOrganization
  >
>[number];

export async function getHistoricalCostTrends(
  organizationId: string,
  startDate: Date,
  endDate: Date,
) {
  const snapshots =
    await findCostSnapshotsByDateRangeForOrganization(
      organizationId,
      startDate,
      endDate,
    );

  const trends =
    await historicalTrendService.getDailyTrend(
      organizationId,
      startDate,
      endDate,
    );

  const totalCost =
    snapshots.reduce(
      (
        sum: number,
        row: CostSnapshotWithAccount,
      ) => sum + row.totalCost,
      0,
    );

  const averageDailyCost =
    snapshots.length > 0
      ? totalCost / snapshots.length
      : 0;

  const highest =
    snapshots.length > 0
      ? [...snapshots].sort(
          (
            a: CostSnapshotWithAccount,
            b: CostSnapshotWithAccount,
          ) =>
            b.totalCost - a.totalCost,
        )[0]
      : null;

  const lowest =
    snapshots.length > 0
      ? [...snapshots].sort(
          (
            a: CostSnapshotWithAccount,
            b: CostSnapshotWithAccount,
          ) =>
            a.totalCost - b.totalCost,
        )[0]
      : null;

  return {
    startDate,
    endDate,
    totalCost,
    averageDailyCost,
    snapshotCount: snapshots.length,
    highestCostDay: highest,
    lowestCostDay: lowest,
    trends,
  };
}