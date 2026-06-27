import {
  findCostSnapshotsByDateRange,
} from "../repositories/cost-snapshot.repository";

export interface HistoricalTrendPoint {
  date: string;
  spend: number;
}

export class HistoricalTrendService {

  async getDailyTrend(
    startDate: Date,
    endDate: Date
  ): Promise<HistoricalTrendPoint[]> {

    const snapshots =
      await findCostSnapshotsByDateRange(
        startDate,
        endDate
      );

    const grouped =
      new Map<string, number>();

    for (const snapshot of snapshots) {

      const day =
        snapshot.snapshotDate
          .toISOString()
          .slice(0, 10);

      grouped.set(
        day,
        (grouped.get(day) ?? 0) +
        snapshot.totalCost
      );

    }

    return Array.from(
      grouped.entries()
    )
      .map(
        ([date, spend]) => ({
          date,
          spend: Number(
            spend.toFixed(2)
          ),
        })
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(
            b.date
          )
      );

  }

}

export const historicalTrendService =
  new HistoricalTrendService();
