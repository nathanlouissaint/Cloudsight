import { findCostSnapshotsByDateRange } from "../repositories/cost-snapshot.repository";

export async function getAccountSummary(
  startDate: Date,
  endDate: Date
) {
  const snapshots =
    await findCostSnapshotsByDateRange(
      startDate,
      endDate
    );

  const accounts = snapshots.reduce((acc, snapshot) => {
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
  }, {} as Record<string, any>);

  return Object.values(accounts);
}