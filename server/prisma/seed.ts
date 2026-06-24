import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICE_PROFILES: Record<
  string,
  {
    base: number;
    variance: number;
  }
> = {
  EC2: { base: 42, variance: 18 },
  S3: { base: 8, variance: 4 },
  RDS: { base: 28, variance: 10 },
  Lambda: { base: 5, variance: 3 },
  CloudFront: { base: 11, variance: 5 },
  ECS: { base: 22, variance: 8 },
  EKS: { base: 35, variance: 12 },
  Route53: { base: 2, variance: 1 },
};

const CLOUD_ACCOUNTS = [
  {
    awsAccountId: "111111111111",
    accountName: "Production",
    multiplier: 1.35,
  },
  {
    awsAccountId: "222222222222",
    accountName: "Staging",
    multiplier: 0.45,
  },
  {
    awsAccountId: "333333333333",
    accountName: "Development",
    multiplier: 0.3,
  },
];

function generateCost(
  base: number,
  variance: number,
  multiplier = 1
): number {
  const fluctuation =
    (Math.random() - 0.5) * variance;

  return Number(
    Math.max(
      (base + fluctuation) * multiplier,
      0.5
    ).toFixed(2)
  );
}

async function main() {
  console.log("Cleaning existing records...");

  await prisma.serviceCostSnapshot.deleteMany();
  await prisma.budgetSnapshot.deleteMany();
  await prisma.costSnapshot.deleteMany();
  await prisma.cloudAccount.deleteMany();
  await prisma.costRecord.deleteMany();

  console.log("Loading services...");

  const services =
    await prisma.cloudService.findMany();

  if (services.length !== 8) {
    throw new Error(
      `Expected 8 cloud services, found ${services.length}`
    );
  }

  console.log("Creating cloud accounts...");

  const accounts = [];

  for (const account of CLOUD_ACCOUNTS) {
    const created =
      await prisma.cloudAccount.create({
        data: {
          awsAccountId: account.awsAccountId,
          accountName: account.accountName,
        },
      });

    accounts.push({
      ...created,
      multiplier: account.multiplier,
    });
  }

  const costRecords: {
    serviceId: string;
    usageDate: Date;
    cost: number;
  }[] = [];

  const costSnapshots: {
    accountId: string;
    snapshotDate: Date;
    totalCost: number;
  }[] = [];

  const serviceSnapshots: {
    accountId: string;
    serviceName: string;
    snapshotDate: Date;
    cost: number;
  }[] = [];

  const budgetSnapshots: {
    budgetName: string;
    budgetAmount: number;
    actualSpend: number;
    snapshotDate: Date;
  }[] = [];

  for (
    let dayOffset = 89;
    dayOffset >= 0;
    dayOffset--
  ) {
    const usageDate = new Date();

    usageDate.setDate(
      usageDate.getDate() - dayOffset
    );

    usageDate.setHours(0, 0, 0, 0);

    let totalDailySpend = 0;

    for (const service of services) {
      const profile =
        SERVICE_PROFILES[service.name];

      if (!profile) {
        throw new Error(
          `Missing profile for service: ${service.name}`
        );
      }

      const cost = generateCost(
        profile.base,
        profile.variance
      );

      totalDailySpend += cost;

      costRecords.push({
        serviceId: service.id,
        usageDate,
        cost,
      });

      for (const account of accounts) {
        serviceSnapshots.push({
          accountId: account.id,
          serviceName: service.name,
          snapshotDate: usageDate,
          cost: Number(
            (
              cost *
              account.multiplier
            ).toFixed(2)
          ),
        });
      }
    }

    for (const account of accounts) {
      const accountCost = generateCost(
        totalDailySpend,
        totalDailySpend * 0.12,
        account.multiplier
      );

      costSnapshots.push({
        accountId: account.id,
        snapshotDate: usageDate,
        totalCost: accountCost,
      });
    }

    budgetSnapshots.push({
      budgetName: "Monthly Cloud Budget",
      budgetAmount: 5000,
      actualSpend: Number(
        totalDailySpend.toFixed(2)
      ),
      snapshotDate: usageDate,
    });
  }

  await prisma.costRecord.createMany({
    data: costRecords,
  });

  await prisma.costSnapshot.createMany({
    data: costSnapshots,
  });

  await prisma.serviceCostSnapshot.createMany({
    data: serviceSnapshots,
  });

  await prisma.budgetSnapshot.createMany({
    data: budgetSnapshots,
  });

  console.log(
    `Created ${costRecords.length} cost records`
  );

  console.log(
    `Created ${costSnapshots.length} cost snapshots`
  );

  console.log(
    `Created ${serviceSnapshots.length} service snapshots`
  );

  console.log(
    `Created ${budgetSnapshots.length} budget snapshots`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
