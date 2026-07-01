import {
  findServiceSnapshotsByDateRange,
  findServiceSnapshotsByService,
} from "../repositories/service-cost-snapshot.repository";

interface ServiceSnapshot {
  accountId: string;
  serviceName: string;
  snapshotDate: Date;
  cost: number;
}

interface ServiceBreakdownItem {
  serviceName: string;
  totalCost: number;
}

export async function getServiceBreakdown(
  startDate: Date,
  endDate: Date
): Promise<ServiceBreakdownItem[]> {
  const snapshots =
    await findServiceSnapshotsByDateRange(
      startDate,
      endDate
    ) as ServiceSnapshot[];

  const grouped = snapshots.reduce(
    (
      acc: Record<string, number>,
      row: ServiceSnapshot
    ) => {
      acc[row.serviceName] =
        (acc[row.serviceName] || 0) +
        row.cost;

      return acc;
    },
    {} as Record<string, number>
  );

  const entries =
    Object.entries(grouped) as [
      string,
      number
    ][];

  return entries
    .map(
      ([serviceName, totalCost]) => ({
        serviceName,
        totalCost,
      })
    )
    .sort(
      (
        a: ServiceBreakdownItem,
        b: ServiceBreakdownItem
      ) => b.totalCost - a.totalCost
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
      (
        sum: number,
        service: ServiceBreakdownItem
      ) => sum + service.totalCost,
      0
    );

  return services.map(
    (service: ServiceBreakdownItem) => ({
      serviceName: service.serviceName,

      totalCost:
        Number(
          service.totalCost.toFixed(2)
        ),

      percentOfSpend:
        totalSpend > 0
          ? Number(
              (
                (service.totalCost /
                  totalSpend) *
                100
              ).toFixed(2)
            )
          : 0,
    })
  );
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
    ) as ServiceSnapshot[];

  return {
    serviceName,

    trend: snapshots.map(
      (row: ServiceSnapshot) => ({
        date: row.snapshotDate,
        cost: row.cost,
        accountId: row.accountId,
      })
    ),
  };
}
