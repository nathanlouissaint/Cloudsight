import { findCostSnapshotsByDateRange } from "../repositories/cost-snapshot.repository";

interface CostSnapshotWithAccount {
  accountId: string;
  totalCost: number;
  account: {
    accountName: string;
    awsAccountId: string;
  };
}

interface AccountSummary {
  accountId: string;
  accountName: string;
  awsAccountId: string;
  totalCost: number;
}

export async function getAccountSummary(
  startDate: Date,
  endDate: Date
): Promise<AccountSummary[]> {
  const snapshots =
    await findCostSnapshotsByDateRange(
      startDate,
      endDate
    ) as CostSnapshotWithAccount[];

  const accounts = snapshots.reduce(
    (
      acc: Record<string, AccountSummary>,
      snapshot: CostSnapshotWithAccount
    ) => {
      const id = snapshot.accountId;

      if (!acc[id]) {
        acc[id] = {
          accountId: id,
          accountName: snapshot.account.accountName,
          awsAccountId: snapshot.account.awsAccountId,
          totalCost: 0,
        };
      }

      acc[id].totalCost += snapshot.totalCost;

      return acc;
    },
    {} as Record<string, AccountSummary>
  );

  return Object.values(accounts);
}
