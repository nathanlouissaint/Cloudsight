import {
  findCostSnapshotsByDateRangeForOrganization,
} from "../repositories/cost-snapshot.repository";

type CostSnapshotWithAccount = Awaited<
  ReturnType<
    typeof findCostSnapshotsByDateRangeForOrganization
  >
>[number];

interface AccountSummary {
  accountId: string;
  accountName: string;
  totalCost: number;
}

export async function getAccountSummary(
  organizationId: string,
  startDate: Date,
  endDate: Date,
): Promise<AccountSummary[]> {
  const snapshots =
    await findCostSnapshotsByDateRangeForOrganization(
      organizationId,
      startDate,
      endDate,
    );

  const accounts = snapshots.reduce(
    (
      acc: Record<string, AccountSummary>,
      snapshot: CostSnapshotWithAccount,
    ) => {
      const id = snapshot.accountId;

      if (!acc[id]) {
        acc[id] = {
          accountId: id,
          accountName:
            snapshot.account.accountName,
          totalCost: 0,
        };
      }

      acc[id].totalCost +=
        snapshot.totalCost;

      return acc;
    },
    {},
  );

  return Object.values(accounts);
}