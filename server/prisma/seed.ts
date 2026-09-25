import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const organizationId = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000002";
const accounts = [
  { id: "00000000-0000-4000-8000-000000000011", awsAccountId: "111111111111", accountName: "Production", multiplier: 0.65 },
  { id: "00000000-0000-4000-8000-000000000012", awsAccountId: "222222222222", accountName: "Staging", multiplier: 0.22 },
  { id: "00000000-0000-4000-8000-000000000013", awsAccountId: "333333333333", accountName: "Development", multiplier: 0.13 },
];
const services = ["EC2", "EKS", "RDS", "ECS", "CloudFront", "S3", "Lambda", "Route53"];

function cost(dayOffset: number, serviceIndex: number, multiplier: number) {
  return Number(((20 + serviceIndex * 8 + ((dayOffset * 7 + serviceIndex * 3) % 11)) * multiplier).toFixed(2));
}

async function main() {
  const timestamp = new Date();
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: "seed@cloudsight.local", passwordHash: null },
  });
  await prisma.organization.upsert({
    where: { id: organizationId },
    update: { name: "CloudSight Seed Organization", slug: "cloudsight-seed", updatedAt: timestamp },
    create: { id: organizationId, name: "CloudSight Seed Organization", slug: "cloudsight-seed", updatedAt: timestamp },
  });
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId, userId } },
    update: { role: "OWNER", updatedAt: timestamp },
    create: { id: "00000000-0000-4000-8000-000000000003", organizationId, userId, role: "OWNER", updatedAt: timestamp },
  });

  for (const account of accounts) {
    await prisma.cloudAccount.upsert({
      where: { awsAccountId: account.awsAccountId },
      update: { organizationId, accountName: account.accountName, isActive: true, connectionStatus: "MOCK_VERIFIED" },
      create: { id: account.id, organizationId, awsAccountId: account.awsAccountId, accountName: account.accountName, isActive: true, connectionStatus: "MOCK_VERIFIED" },
    });
  }

  const now = new Date();
  await prisma.budget.upsert({
    where: { organizationId_year_month: { organizationId, year: now.getFullYear(), month: now.getMonth() + 1 } },
    update: { amount: 5000, name: "Monthly Cloud Budget", updatedAt: timestamp },
    create: { id: "00000000-0000-4000-8000-000000000004", organizationId, name: "Monthly Cloud Budget", amount: 5000, month: now.getMonth() + 1, year: now.getFullYear(), updatedAt: timestamp },
  });

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const snapshotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset);
    for (const account of accounts) {
      let totalCost = 0;
      for (const [serviceIndex, serviceName] of services.entries()) {
        const serviceCost = cost(dayOffset, serviceIndex, account.multiplier);
        totalCost += serviceCost;
        await prisma.serviceCostSnapshot.upsert({
          where: { accountId_serviceName_snapshotDate: { accountId: account.id, serviceName, snapshotDate } },
          update: { cost: serviceCost },
          create: { id: `${account.id.slice(0, 30)}${dayOffset}${serviceIndex}`, accountId: account.id, serviceName, snapshotDate, cost: serviceCost },
        });
      }
      await prisma.costSnapshot.upsert({
        where: { accountId_snapshotDate: { accountId: account.id, snapshotDate } },
        update: { totalCost: Number(totalCost.toFixed(2)) },
        create: { id: `${account.id.slice(0, 32)}${dayOffset}`, accountId: account.id, snapshotDate, totalCost: Number(totalCost.toFixed(2)) },
      });
    }
  }
  console.log("Seeded organization-scoped accounts, budgets, and daily cost snapshots.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => prisma.$disconnect());
