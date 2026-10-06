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
  Server,
} from "node:http";
import type {
  AddressInfo,
} from "node:net";

import jwt from "jsonwebtoken";

import app from "../src/app";
import {
  awsConnectionService,
} from "../src/aws/services/aws-connection.service";
import {
  isMockCostCollectionEnabled,
  spendGuardCostExplorerService,
} from "../src/aws/services/cost-explorer.service";
import {
  prisma,
} from "../src/config/prisma";

const jwtSecret =
  "collection-integration-test-secret";
const testRunId = randomUUID();
const emailPrefix =
  `spend-guard-collection-${testRunId}`;
const organizationPrefix =
  `Spend Guard Collection ${testRunId}`;

let server: Server;
let baseUrl: string;

function awsAccountId() {
  return String(
    Math.floor(
      100_000_000_000 +
        Math.random() * 900_000_000_000,
    ),
  );
}

function roleArn(accountId: string, suffix: string) {
  return `arn:aws:iam::${accountId}:role/${suffix}`;
}

function accessToken(user: { id: string; email: string }) {
  return jwt.sign(
    {
      sub: user.id,
    },
    jwtSecret,
    {
      expiresIn: "15m",
      algorithm: "HS256",
      issuer: "cloudsight-api",
      audience: "cloudsight-web",
    },
  );
}

async function createOrganizationOwner(suffix: string) {
  const user = await prisma.user.create({
    data: {
      email: `${emailPrefix}-${suffix}@example.test`,
      passwordHash: "collection-test-password-hash",
    },
  });
  const organization = await prisma.organization.create({
    data: {
      id: randomUUID(),
      name: `${organizationPrefix} ${suffix}`,
      slug: `spend-guard-collection-${randomUUID()}`,
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

async function createCloudAccount(input: {
  organizationId: string;
  suffix: string;
  status?: "VERIFIED" | "MOCK_VERIFIED";
}) {
  const accountId = awsAccountId();
  const arn = roleArn(accountId, input.suffix);
  const cloudAccount = await prisma.cloudAccount.create({
    data: {
      id: randomUUID(),
      organizationId: input.organizationId,
      awsAccountId: accountId,
      accountName: `AWS Account ${accountId}`,
      roleArn: arn,
      isActive: true,
      connectionStatus: input.status ?? "MOCK_VERIFIED",
      updatedAt: new Date(),
      lastVerifiedAt: new Date(),
    },
  });

  return {
    cloudAccount,
    roleArn: arn,
  };
}

async function createUserWithoutOrganization() {
  const user = await prisma.user.create({
    data: {
      email: `${emailPrefix}-no-membership@example.test`,
      passwordHash: "collection-test-password-hash",
    },
  });

  return accessToken(user);
}

async function collect(
  token: string | undefined,
  body: Record<string, unknown> = {},
) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}/aws/collect`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

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
    const accountIds = accounts.map((account) => account.id);

    if (accountIds.length > 0) {
      await prisma.serviceCostSnapshot.deleteMany({
        where: { accountId: { in: accountIds } },
      });
      await prisma.costSnapshot.deleteMany({
        where: { accountId: { in: accountIds } },
      });
    }

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
      "Collection integration tests require cloudsight_test.",
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

test("collection requires membership-backed authentication", async () => {
  const tokenWithoutMembership =
    await createUserWithoutOrganization();

  const missing = await collect(undefined);
  const invalid = await collect("not-a-jwt");
  const noMembership = await collect(tokenWithoutMembership);

  assert.equal(missing.response.status, 401);
  assert.equal(invalid.response.status, 401);
  assert.equal(noMembership.response.status, 403);
});

test("collection requires an active verified organization CloudAccount", async () => {
  const owner = await createOrganizationOwner("unconfigured");
  const result = await collect(owner.token);

  assert.equal(result.response.status, 409);
  assert.match(String(result.body.message), /active verified AWS connection/i);
});

test("collection selects only the authenticated organization account", async () => {
  const ownerA = await createOrganizationOwner("tenant-a");
  const ownerB = await createOrganizationOwner("tenant-b");
  const accountA = await createCloudAccount({
    organizationId: ownerA.organization.id,
    suffix: "TenantAReadOnly",
  });
  const accountB = await createCloudAccount({
    organizationId: ownerB.organization.id,
    suffix: "TenantBReadOnly",
  });
  const originalGetDailyCosts =
    spendGuardCostExplorerService.getDailyCosts;
  const originalAssumeRole = awsConnectionService.assumeRole;
  const requestedRoleArns: string[] = [];

  spendGuardCostExplorerService.getDailyCosts = async (input) => {
    requestedRoleArns.push(input.roleArn);
    return {
      accountDailyCosts: [{
        date: "2026-09-01",
        amount: 125,
        currency: "USD",
      }],
      serviceDailyCosts: [{
        date: "2026-09-01",
        serviceName: "Amazon EC2",
        amount: 125,
        currency: "USD",
      }],
    };
  };
  awsConnectionService.assumeRole = async () => {
    throw new Error("Mock collection must not invoke STS.");
  };

  try {
    const result = await collect(ownerA.token, {
      organizationId: ownerB.organization.id,
      cloudAccountId: accountB.cloudAccount.id,
    });

    assert.equal(result.response.status, 200);
    assert.deepEqual(requestedRoleArns, [accountA.roleArn]);
  } finally {
    spendGuardCostExplorerService.getDailyCosts = originalGetDailyCosts;
    awsConnectionService.assumeRole = originalAssumeRole;
  }

  assert.equal(
    await prisma.costSnapshot.count({
      where: { accountId: accountA.cloudAccount.id },
    }),
    1,
  );
  assert.equal(
    await prisma.costSnapshot.count({
      where: { accountId: accountB.cloudAccount.id },
    }),
    0,
  );

  const collectedAccount =
    await prisma.cloudAccount.findUniqueOrThrow({
      where: { id: accountA.cloudAccount.id },
    });

  assert.notEqual(
    collectedAccount.lastCollectionAttemptAt,
    null,
  );
  assert.notEqual(
    collectedAccount.lastSuccessfulSyncAt,
    null,
  );
  assert.equal(collectedAccount.collectionError, null);
});

test("daily account and service snapshots are idempotently updated", async () => {
  const owner = await createOrganizationOwner("idempotent");
  const account = await createCloudAccount({
    organizationId: owner.organization.id,
    suffix: "IdempotentReadOnly",
  });
  const originalGetDailyCosts =
    spendGuardCostExplorerService.getDailyCosts;
  let revision = 1;

  spendGuardCostExplorerService.getDailyCosts = async () => ({
    accountDailyCosts: [
      { date: "2026-09-01", amount: revision * 100, currency: "USD" },
      { date: "2026-09-02", amount: revision * 200, currency: "USD" },
    ],
    serviceDailyCosts: [
      { date: "2026-09-01", serviceName: "Amazon EC2", amount: revision * 70, currency: "USD" },
      { date: "2026-09-01", serviceName: "Amazon S3", amount: revision * 30, currency: "USD" },
      { date: "2026-09-02", serviceName: "Amazon EC2", amount: revision * 140, currency: "USD" },
      { date: "2026-09-02", serviceName: "Amazon S3", amount: revision * 60, currency: "USD" },
    ],
  });

  try {
    assert.equal((await collect(owner.token)).response.status, 200);
    revision = 2;
    assert.equal((await collect(owner.token)).response.status, 200);
  } finally {
    spendGuardCostExplorerService.getDailyCosts = originalGetDailyCosts;
  }

  assert.equal(
    await prisma.costSnapshot.count({
      where: { accountId: account.cloudAccount.id },
    }),
    2,
  );
  assert.equal(
    await prisma.serviceCostSnapshot.count({
      where: { accountId: account.cloudAccount.id },
    }),
    4,
  );

  const septemberFirst = new Date("2026-09-01T00:00:00.000Z");
  const total = await prisma.costSnapshot.findUnique({
    where: {
      accountId_snapshotDate: {
        accountId: account.cloudAccount.id,
        snapshotDate: septemberFirst,
      },
    },
  });
  const service = await prisma.serviceCostSnapshot.findUnique({
    where: {
      accountId_serviceName_snapshotDate: {
        accountId: account.cloudAccount.id,
        serviceName: "Amazon EC2",
        snapshotDate: septemberFirst,
      },
    },
  });

  assert.equal(total?.totalCost, 200);
  assert.equal(service?.cost, 140);
});

test("failed collection preserves snapshots and records failure state", async () => {
  const owner = await createOrganizationOwner("failure");
  const account = await createCloudAccount({
    organizationId: owner.organization.id,
    suffix: "FailureReadOnly",
    status: "VERIFIED",
  });

  assert.equal((await collect(owner.token)).response.status, 200);
  const beforeFailure = await prisma.cloudAccount.findUniqueOrThrow({
    where: { id: account.cloudAccount.id },
  });
  const snapshotCount = await prisma.costSnapshot.count({
    where: { accountId: account.cloudAccount.id },
  });
  const originalMockSetting = process.env.SPEND_GUARD_MOCK_AWS;
  const originalAssumeRole = awsConnectionService.assumeRole;

  process.env.SPEND_GUARD_MOCK_AWS = "false";
  awsConnectionService.assumeRole = async () => {
    throw new Error("AssumeRole failed for test");
  };

  try {
    const result = await collect(owner.token);
    assert.equal(result.response.status, 502);
  } finally {
    process.env.SPEND_GUARD_MOCK_AWS = originalMockSetting;
    awsConnectionService.assumeRole = originalAssumeRole;
  }

  const afterFailure = await prisma.cloudAccount.findUniqueOrThrow({
    where: { id: account.cloudAccount.id },
  });
  assert.equal(
    await prisma.costSnapshot.count({
      where: { accountId: account.cloudAccount.id },
    }),
    snapshotCount,
  );
  assert.equal(
    afterFailure.lastSuccessfulSyncAt?.toISOString(),
    beforeFailure.lastSuccessfulSyncAt?.toISOString(),
  );
  assert.match(afterFailure.collectionError ?? "", /AssumeRole failed/);
  assert.notEqual(afterFailure.lastCollectionAttemptAt, null);
});

test("production mode cannot enable mock collection", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousMockSetting = process.env.SPEND_GUARD_MOCK_AWS;

  try {
    process.env.NODE_ENV = "production";
    process.env.SPEND_GUARD_MOCK_AWS = "true";
    assert.equal(isMockCostCollectionEnabled(), false);
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
    process.env.SPEND_GUARD_MOCK_AWS = previousMockSetting;
  }
});
