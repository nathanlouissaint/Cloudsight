import assert from "node:assert/strict";
import {
  after,
  afterEach,
  before,
  test,
} from "node:test";
import {
  randomUUID,
} from "node:crypto";
import type {
  AddressInfo,
} from "node:net";
import type {
  Server,
} from "node:http";

import jwt from "jsonwebtoken";

import app from "../src/app";
import {
  prisma,
} from "../src/config/prisma";
import {
  spendGuardCostExplorerService,
} from "../src/aws/services/cost-explorer.service";

const jwtSecret =
  "spend-guard-analysis-integration-test-secret";
const testRunId = randomUUID();
const emailPrefix =
  `spend-guard-analysis-${testRunId}`;
const organizationPrefix =
  `Spend Guard Analysis ${testRunId}`;

let server: Server;
let baseUrl: string;

function accessToken(user: {
  id: string;
  email: string;
}) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    jwtSecret,
    {
      expiresIn: "7d",
    },
  );
}

function currentPeriod() {
  const now = new Date();

  return {
    month: now.getUTCMonth() + 1,
    year: now.getUTCFullYear(),
  };
}

function completedUtcDay(daysAgo = 1) {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysAgo,
    ),
  );
}

function dailyCostDate(day: number) {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      day,
    ),
  ).toISOString().slice(0, 10);
}

async function createOrganizationOwner(
  suffix: string,
) {
  const user = await prisma.user.create({
    data: {
      email: `${emailPrefix}-${suffix}@example.test`,
      passwordHash: "spend-guard-analysis-test-password-hash",
    },
  });
  const organization = await prisma.organization.create({
    data: {
      id: randomUUID(),
      name: `${organizationPrefix} ${suffix}`,
      slug: `spend-guard-analysis-${randomUUID()}`,
      updatedAt: new Date(),
    },
  });

  await prisma.organizationMember.create({
    data: {
      id: randomUUID(),
      organizationId: organization.id,
      userId: user.id,
      role: "OWNER",
      updatedAt: new Date(),
    },
  });

  return {
    user,
    organization,
    token: accessToken(user),
  };
}

async function createCloudAccount(
  organizationId: string,
  suffix: string,
) {
  const awsAccountId = String(
    Math.floor(
      100_000_000_000 +
        Math.random() * 900_000_000_000,
    ),
  );
  const roleArn =
    `arn:aws:iam::${awsAccountId}:role/${suffix}`;

  return prisma.cloudAccount.create({
    data: {
      id: randomUUID(),
      organizationId,
      awsAccountId,
      accountName: `AWS Account ${awsAccountId}`,
      roleArn,
      isActive: true,
      connectionStatus: "MOCK_VERIFIED",
      updatedAt: new Date(),
      lastVerifiedAt: new Date(),
    },
  });
}

async function createBudget(
  organizationId: string,
  amount: number,
) {
  const period = currentPeriod();

  return prisma.budget.create({
    data: {
      organizationId,
      name: "Spend Guard Monthly Budget",
      amount,
      month: period.month,
      year: period.year,
      updatedAt: new Date(),
    },
  });
}

async function requestAnalysis(
  method: "GET" | "POST",
  token: string,
) {
  const response = await fetch(
    `${baseUrl}/spend-guard/analysis`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return {
    response,
    body: await response.json() as Record<string, unknown>,
  };
}

async function cleanTestData() {
  const organizations = await prisma.organization.findMany({
    where: {
      name: {
        startsWith: organizationPrefix,
      },
    },
    select: {
      id: true,
    },
  });
  const organizationIds = organizations.map(
    (organization) => organization.id,
  );

  if (organizationIds.length > 0) {
    const accounts = await prisma.cloudAccount.findMany({
      where: {
        organizationId: {
          in: organizationIds,
        },
      },
      select: {
        id: true,
      },
    });
    const accountIds = accounts.map(
      (account) => account.id,
    );

    if (accountIds.length > 0) {
      await prisma.serviceCostSnapshot.deleteMany({
        where: { accountId: { in: accountIds } },
      });
      await prisma.costSnapshot.deleteMany({
        where: { accountId: { in: accountIds } },
      });
    }

    await prisma.budget.deleteMany({
      where: { organizationId: { in: organizationIds } },
    });
    await prisma.cloudAccount.deleteMany({
      where: { organizationId: { in: organizationIds } },
    });
    await prisma.organization.deleteMany({
      where: { id: { in: organizationIds } },
    });
  }

  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: emailPrefix,
      },
    },
  });
}

before(async () => {
  if (!process.env.DATABASE_URL?.includes("cloudsight_test")) {
    throw new Error(
      "Spend Guard analysis integration tests require cloudsight_test.",
    );
  }

  process.env.JWT_SECRET = jwtSecret;
  process.env.NODE_ENV = "test";
  process.env.SPEND_GUARD_MOCK_AWS = "true";

  server = app.listen(0);
  await new Promise<void>((resolve) => {
    server.once("listening", resolve);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await cleanTestData();
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
  await prisma.$disconnect();
});

test(
  "POST /spend-guard/analysis collects costs and returns analysis",
  {
    skip: new Date().getUTCDate() < 3,
  },
  async () => {
    const owner = await createOrganizationOwner("post");
    const account = await createCloudAccount(
      owner.organization.id,
      "AnalysisReadOnly",
    );
    await createBudget(owner.organization.id, 1_000);

    const originalGetDailyCosts =
      spendGuardCostExplorerService.getDailyCosts;
    const requestedRoleArns: string[] = [];

    spendGuardCostExplorerService.getDailyCosts = async (input) => {
      requestedRoleArns.push(input.roleArn);

      return {
        accountDailyCosts: [
          {
            date: dailyCostDate(1),
            amount: 100,
            currency: "USD",
          },
          {
            date: dailyCostDate(2),
            amount: 200,
            currency: "USD",
          },
        ],
        serviceDailyCosts: [
          {
            date: dailyCostDate(1),
            serviceName: "Amazon EC2",
            amount: 70,
            currency: "USD",
          },
          {
            date: dailyCostDate(1),
            serviceName: "Amazon S3",
            amount: 30,
            currency: "USD",
          },
          {
            date: dailyCostDate(2),
            serviceName: "Amazon EC2",
            amount: 140,
            currency: "USD",
          },
          {
            date: dailyCostDate(2),
            serviceName: "Amazon S3",
            amount: 60,
            currency: "USD",
          },
        ],
      };
    };

    try {
      const result = await requestAnalysis("POST", owner.token);

      assert.equal(result.response.status, 200);
      assert.deepEqual(requestedRoleArns, [account.roleArn]);
      assert.equal(
        (result.body.account as { accountId: string }).accountId,
        account.awsAccountId,
      );
      assert.equal(
        (result.body.spend as { currentSpend: number }).currentSpend,
        300,
      );
      assert.equal(
        (result.body.topDrivers as Array<{ serviceName: string }>)[0]?.serviceName,
        "Amazon EC2",
      );
    } finally {
      spendGuardCostExplorerService.getDailyCosts =
        originalGetDailyCosts;
    }
  },
);

test(
  "GET /spend-guard/analysis returns only the authenticated organization's data",
  async () => {
    const ownerA = await createOrganizationOwner("get-a");
    const ownerB = await createOrganizationOwner("get-b");
    const accountA = await createCloudAccount(
      ownerA.organization.id,
      "TenantAReadOnly",
    );
    const accountB = await createCloudAccount(
      ownerB.organization.id,
      "TenantBReadOnly",
    );
    await createBudget(ownerA.organization.id, 1_000);
    await createBudget(ownerB.organization.id, 5_000);

    const snapshotDate = completedUtcDay();

    await prisma.costSnapshot.createMany({
      data: [
        {
          accountId: accountA.id,
          snapshotDate,
          totalCost: 100,
        },
        {
          accountId: accountB.id,
          snapshotDate,
          totalCost: 900,
        },
      ],
    });
    await prisma.serviceCostSnapshot.createMany({
      data: [
        {
          accountId: accountA.id,
          serviceName: "Amazon EC2",
          snapshotDate,
          cost: 100,
        },
        {
          accountId: accountB.id,
          serviceName: "Amazon RDS",
          snapshotDate,
          cost: 900,
        },
      ],
    });

    const result = await requestAnalysis("GET", ownerA.token);

    assert.equal(result.response.status, 200);
    assert.equal(
      (result.body.account as { accountId: string }).accountId,
      accountA.awsAccountId,
    );
    assert.equal(
      (result.body.budget as { monthlyBudget: number }).monthlyBudget,
      1_000,
    );
    assert.equal(
      (result.body.spend as { currentSpend: number }).currentSpend,
      100,
    );
    assert.equal(
      (result.body.topDrivers as Array<{ serviceName: string }>)[0]?.serviceName,
      "Amazon EC2",
    );
  },
);
