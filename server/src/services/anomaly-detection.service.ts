import type { AlertModel } from "../types/alert.types";

import {
  findCurrentMonthCostSnapshots,
} from "../repositories/cost-snapshot.repository";

export class AnomalyDetectionService {

  async detectCostSpike(): Promise<AlertModel[]> {

    const snapshots =
      await findCurrentMonthCostSnapshots();

    if (snapshots.length < 8) {
      return [];
    }

    const dailyTotals =
      new Map<string, number>();

    for (const snapshot of snapshots) {

      const date =
        snapshot.snapshotDate
          .toISOString()
          .split("T")[0];

      dailyTotals.set(
        date,
        (dailyTotals.get(date) ?? 0) +
        snapshot.totalCost
      );

    }

    const days =
      Array.from(dailyTotals.entries())
        .map(([date, cost]) => ({
          date,
          cost,
        }));

    if (days.length < 8) {
      return [];
    }

    const latest =
      days[days.length - 1];

    const previous =
      days.slice(
        days.length - 8,
        days.length - 1
      );

    const average =
      previous.reduce(
        (sum, day) => sum + day.cost,
        0
      ) / previous.length;

    const ratio =
      latest.cost / average;

    const buildAlert = (
      severity: AlertModel["severity"],
      title: string
    ): AlertModel => ({
      id: `cost-spike-${latest.date}`,

      type: "cost_spike",

      severity,

      status: "active",

      title,

      description:
        `Daily spend is ${(
          (ratio - 1) * 100
        ).toFixed(0)}% above the 7-day average.`,

      recommendation:
        "Review recent deployments, infrastructure changes, and high-cost services contributing to the increase.",

      metric:
        "Daily Spend",

      currentValue:
        Number(
          latest.cost.toFixed(2)
        ),

      threshold:
        Number(
          average.toFixed(2)
        ),

      date:
        latest.date,
    });

    if (ratio >= 2) {
      return [
        buildAlert(
          "critical",
          "Major Cost Spike"
        ),
      ];
    }

    if (ratio >= 1.5) {
      return [
        buildAlert(
          "warning",
          "Unusual Cost Increase"
        ),
      ];
    }

    if (ratio >= 1.2) {
      return [
        buildAlert(
          "info",
          "Cost Increase Detected"
        ),
      ];
    }

    return [];

  }

}

export const anomalyDetectionService =
  new AnomalyDetectionService();
