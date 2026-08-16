import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USER_EMAIL = "demo@cloudsight.dev";
const DEMO_ORGANIZATION_NAME = "CloudSight Demo";
const DEMO_ORGANIZATION_SLUG = "cloudsight-demo";

const SERVICE_PROFILES: Record<
  string,
  {
    base: number;
    variance: number;
  }
> = {
  EC2: { base: 58, variance: 20 },
  EKS: { base: 48, variance: 16 },
  RDS: { base: 34, variance: 12 },
  ECS: { base: 28, variance: 10 },
  CloudFront: { base: 16, variance: 6 },
  S3: { base: 12, variance: 5 },
  Lambda: { base: 8, variance: 4 },
  Route53: { base: 3, variance: 1 },
};

const CLOUD_ACCOUNTS = [
  {
    awsAccountId: "111111111111",
    accountName: "Production",
    multiplier: 0.65,
  },
  {
    awsAccountId: "222222222222",
    accountName: "Staging",
    multiplier: 0.22,
  },
  {
    awsAccountId: "333333333333",
    accountName: "Development",
    multiplier: 0.13,
  },
];

function generateCost(
  base: number,
  variance: number,
  multiplier = 1,
): number {
  const fluctuation =
    (Math.random() - 0.5) *
    variance;

  return Number(
    Math.max(
      (base + fluctuation) *
        multiplier,
      0.5,
    ).toFixed(2),
  );
}

async function main() {
  console.log(
    "Ensuring demo tenant...",
  );

  const demoUser =
    await prisma.user.upsert({
      where: {
        email: DEMO_USER_EMAIL,
      },
      update: {},
      create: {
        email: DEMO_USER_EMAIL,
        emailVerifiedAt:
          new Date(),
      },
    });

  const demoOrganization =
    await prisma.organization.upsert({
      where: {
        slug:
          DEMO_ORGANIZATION_SLUG,
      },
      update: {
        name:
          DEMO_ORGANIZATION_NAME,
      },
      create: {
        name:
          DEMO_ORGANIZATION_NAME,
        slug:
          DEMO_ORGANIZATION_SLUG,
      },
    });

  await prisma.organizationMember.upsert(
    {
      where: {
        organizationId_userId: {
          organizationId:
            demoOrganization.id,
          userId:
            demoUser.id,
        },
      },
      update: {
        role: "OWNER",
      },
      create: {
        organizationId:
          demoOrganization.id,
        userId:
          demoUser.id,
        role: "OWNER",
      },
    },
  );

  console.log(
    "Cleaning existing tenant snapshot records...",
  );

  await prisma.serviceCostSnapshot.deleteMany(
    {
      where: {
        account: {
          organizationId:
            demoOrganization.id,
        },
      },
    },
  );

  await prisma.costSnapshot.deleteMany({
    where: {
      account: {
        organizationId:
          demoOrganization.id,
      },
    },
  });

  await prisma.cloudAccount.deleteMany({
    where: {
      organizationId:
        demoOrganization.id,
    },
  });

  console.log(
    "Creating cloud accounts...",
  );

  const accounts = [];

  for (
    const account of
    CLOUD_ACCOUNTS
  ) {
    const created =
      await prisma.cloudAccount.create({
        data: {
          organizationId:
            demoOrganization.id,
          awsAccountId:
            account.awsAccountId,
          accountName:
            account.accountName,
        },
      });

    accounts.push({
      ...created,
      multiplier:
        account.multiplier,
    });
  }

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

  for (
    let dayOffset = 89;
    dayOffset >= 0;
    dayOffset--
  ) {
    const usageDate =
      new Date();

    usageDate.setDate(
      usageDate.getDate() -
        dayOffset,
    );

    usageDate.setHours(
      0,
      0,
      0,
      0,
    );

    const serviceCosts =
      new Map<
        string,
        number
      >();

    for (
      const [
        serviceName,
        profile,
      ] of Object.entries(
        SERVICE_PROFILES,
      )
    ) {
      const cost =
        generateCost(
          profile.base,
          profile.variance,
        );

      serviceCosts.set(
        serviceName,
        cost,
      );
    }

    for (
      const account of accounts
    ) {
      let accountDailySpend =
        0;

      for (
        const [
          serviceName,
          totalServiceCost,
        ] of serviceCosts.entries()
      ) {
        const accountServiceCost =
          Number(
            (
              totalServiceCost *
              account.multiplier
            ).toFixed(2),
          );

        accountDailySpend +=
          accountServiceCost;

        serviceSnapshots.push({
          accountId:
            account.id,
          serviceName,
          snapshotDate:
            usageDate,
          cost:
            accountServiceCost,
        });
      }

      costSnapshots.push({
        accountId:
          account.id,
        snapshotDate:
          usageDate,
        totalCost:
          Number(
            accountDailySpend.toFixed(
              2,
            ),
          ),
      });
    }
  }

  await prisma.costSnapshot.createMany(
    {
      data:
        costSnapshots,
    },
  );

  await prisma.serviceCostSnapshot.createMany(
    {
      data:
        serviceSnapshots,
    },
  );

  console.log(
    `Created ${costSnapshots.length} cost snapshots`,
  );

  console.log(
    `Created ${serviceSnapshots.length} service snapshots`,
  );

  console.log(
    `Demo organization: ${demoOrganization.slug}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(
    async () => {
      await prisma.$disconnect();
    },
  );