import type {
  CloudAccount,
} from "@prisma/client";

import {
  prisma,
} from "../../config/prisma";

import {
  awsConnectionService,
} from "./aws-connection.service";

import {
  isMockCostCollectionEnabled,
  spendGuardCostExplorerService,
} from "./cost-explorer.service";

function normalizeUtcDay(date: string) {
  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("AWS returned an invalid cost date.");
  }

  return parsed;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "AWS cost collection failed.";
}

export async function collectCosts(
  cloudAccount: CloudAccount,
) {
  if (!cloudAccount.roleArn) {
    throw new Error(
      "The selected AWS connection has no verified role ARN.",
    );
  }

  const attemptedAt = new Date();

  await prisma.cloudAccount.update({
    where: {
      id: cloudAccount.id,
    },
    data: {
      lastCollectionAttemptAt: attemptedAt,
    },
  });

  try {
    const credentials =
      isMockCostCollectionEnabled()
        ? undefined
        : await awsConnectionService.assumeRole(
            cloudAccount.roleArn,
          );

    const dailyCosts =
      await spendGuardCostExplorerService.getDailyCosts({
        roleArn: cloudAccount.roleArn,
        credentials,
      });

    const unsupportedCurrency = [
      ...dailyCosts.accountDailyCosts,
      ...dailyCosts.serviceDailyCosts,
    ].find((cost) => cost.currency !== "USD");

    if (unsupportedCurrency) {
      throw new Error(
        "Spend Guard collection supports USD cost data only.",
      );
    }

    const completedAt = new Date();

    await prisma.$transaction(async (tx) => {
      for (const dailyCost of dailyCosts.accountDailyCosts) {
        const snapshotDate = normalizeUtcDay(
          dailyCost.date,
        );

        await tx.costSnapshot.upsert({
          where: {
            accountId_snapshotDate: {
              accountId: cloudAccount.id,
              snapshotDate,
            },
          },
          update: {
            totalCost: dailyCost.amount,
          },
          create: {
            accountId: cloudAccount.id,
            snapshotDate,
            totalCost: dailyCost.amount,
          },
        });
      }

      for (const serviceCost of dailyCosts.serviceDailyCosts) {
        const snapshotDate = normalizeUtcDay(
          serviceCost.date,
        );

        await tx.serviceCostSnapshot.upsert({
          where: {
            accountId_serviceName_snapshotDate: {
              accountId: cloudAccount.id,
              serviceName: serviceCost.serviceName,
              snapshotDate,
            },
          },
          update: {
            cost: serviceCost.amount,
          },
          create: {
            accountId: cloudAccount.id,
            serviceName: serviceCost.serviceName,
            snapshotDate,
            cost: serviceCost.amount,
          },
        });
      }

      await tx.cloudAccount.update({
        where: {
          id: cloudAccount.id,
        },
        data: {
          lastSuccessfulSyncAt: completedAt,
          collectionError: null,
        },
      });
    });

    return {
      accountSnapshots:
        dailyCosts.accountDailyCosts.length,
      serviceSnapshots:
        dailyCosts.serviceDailyCosts.length,
      lastSuccessfulSyncAt: completedAt,
      mocked: isMockCostCollectionEnabled(),
    };
  } catch (error) {
    await prisma.cloudAccount.update({
      where: {
        id: cloudAccount.id,
      },
      data: {
        collectionError: getErrorMessage(error),
      },
    });

    throw error;
  }
}
