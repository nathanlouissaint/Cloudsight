import { getAwsProvider }
  from "../factory/provider.factory";

import { createCostSnapshot }
  from "../../repositories/cost-snapshot.repository";

import { createServiceCostSnapshot }
  from "../../repositories/service-cost-snapshot.repository";

import { findAllCloudAccounts }
  from "../../repositories/cloud-account.repository";

export async function collectCosts() {
  const provider =
    getAwsProvider();

  const data =
    await provider.getCostSummary();

  const accounts =
    await findAllCloudAccounts();

  if (accounts.length === 0) {
    throw new Error(
      "No cloud accounts found"
    );
  }

  const account =
    accounts[0];

  const snapshotDate =
    new Date();

  const snapshot =
    await createCostSnapshot({
      accountId: account.id,
      snapshotDate,
      totalCost:
        data.summary.totalCost,
    });

  for (const service of data.services) {
    await createServiceCostSnapshot({
      accountId: account.id,
      serviceName:
        service.service,
      snapshotDate,
      cost:
        service.amount,
    });
  }

  return {
    snapshot,
    services:
      data.services.length,
  };
}
