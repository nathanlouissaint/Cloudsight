import {
  findServiceSnapshotsByDateRange,
  findServiceSnapshotsByService,
} from "../repositories/service-cost-snapshot.repository";

export async function getServiceBreakdown(
  startDate: Date,
  endDate: Date
) {
  const snapshots =
    await findServiceSnapshotsByDateRange(
      startDate,
      endDate
    );

  const grouped = snapshots.reduce(
    (acc, row) => {
      acc[row.serviceName] =
        (acc[row.serviceName] || 0) +
        row.cost;

      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(grouped)
    .map(([serviceName, totalCost]) => ({
      serviceName,
      totalCost,
    }))
    .sort(
      (a, b) =>
        b.totalCost - a.totalCost
    );
}

export async function getTopDrivers(
  startDate: Date,
  endDate: Date
) {
  const services =
    await getServiceBreakdown(
      startDate,
      endDate
    );

  const totalSpend =
    services.reduce(
      (sum, service) =>
        sum + service.totalCost,
      0
    );

  return services.map((service) => ({
    serviceName:
      service.serviceName,

    totalCost:
      Number(
        service.totalCost.toFixed(2)
      ),

    percentOfSpend:
      Number(
        (
          (service.totalCost /
            totalSpend) *
          100
        ).toFixed(2)
      ),
  }));
}

export async function getServiceTrend(
  serviceName: string,
  startDate: Date,
  endDate: Date
) {
  const snapshots =
    await findServiceSnapshotsByService(
      serviceName,
      startDate,
      endDate
    );

  return {
    serviceName,

    trend: snapshots.map(
      (row) => ({
        date: row.snapshotDate,
        cost: row.cost,
        accountId:
          row.accountId,
      })
    ),
  };
}
