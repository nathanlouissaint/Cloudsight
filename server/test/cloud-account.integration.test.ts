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
  isMockAwsVerificationEnabled,
} from "../src/controllers/aws.controller";
import {
  awsConnectionService,
} from "../src/aws/services/aws-connection.service";
import {
  prisma,
} from "../src/config/prisma";

const jwtSecret =
  "cloud-account-integration-test-secret";

const testRunId =
  randomUUID();

const emailPrefix =
  `spend-guard-cloud-account-${testRunId}`;

const organizationPrefix =
  `Spend Guard Cloud Account ${testRunId}`;

let server: Server;
let baseUrl: string;

function accountId() {
  return String(
    Math.floor(
      100_000_000_000 +
        Math.random() * 900_000_000_000,
    ),
  );
}

function roleArn(
  awsAccountId: string,
  roleName = "CloudSightReadOnly",
) {
  return `arn:aws:iam::${awsAccountId}:role/${roleName}`;
}

function accessToken(
  user: {
    id: string;
    email: string;
  },
) {
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

async function createOrganizationOwner(
  suffix: string,
) {
  const user =
    await prisma.user.create({
      data: {
        email:
          `${emailPrefix}-${suffix}@example.test`,
        passwordHash:
          "cloud-account-test-password-hash",
      },
    });

  const organization =
    await prisma.organization.create({
      data: {
        id: randomUUID(),
        name:
          `${organizationPrefix} ${suffix}`,
        slug:
          `spend-guard-cloud-account-${randomUUID()}`,
        updatedAt:
          new Date(),
      },
    });

  await prisma.organizationMember.create({
    data: {
      id: randomUUID(),
      organizationId: organization.id,
      userId: user.id,
      role: "OWNER",
      updatedAt:
        new Date(),
    },
  });

  return {
    user,
    organization,
    token: accessToken(user),
  };
}

async function createUserWithoutOrganization() {
  const user =
    await prisma.user.create({
      data: {
        email:
          `${emailPrefix}-no-organization@example.test`,
        passwordHash:
          "cloud-account-test-password-hash",
      },
    });

  return accessToken(user);
}

async function verifyConnection(
  token: string | undefined,
  body: Record<string, unknown>,
) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response =
    await fetch(
      `${baseUrl}/aws/verify-connection`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      },
    );

  return {
    response,
    body:
      await response.json() as Record<string, unknown>,
  };
}

async function getConnection(
  token: string,
) {
  const response =
    await fetch(
      `${baseUrl}/aws/connection`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  return {
    response,
    body:
      await response.json() as Record<string, unknown>,
  };
}

async function cleanTestData() {
  const organizations =
    await prisma.organization.findMany({
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
    await prisma.cloudAccount.deleteMany({
      where: {
        organizationId: {
          in: organizationIds,
        },
      },
    });

    await prisma.organization.deleteMany({
      where: {
        id: {
          in: organizationIds,
        },
      },
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
  if (
    !process.env.DATABASE_URL?.includes(
      "cloudsight_test",
    )
  ) {
    throw new Error(
      "Cloud account integration tests require cloudsight_test.",
    );
  }

  process.env.JWT_SECRET = jwtSecret;
  process.env.NODE_ENV = "test";
  process.env.SPEND_GUARD_MOCK_AWS = "true";

  server = app.listen(0);

  await new Promise<void>((resolve) => {
    server.once("listening", resolve);
  });

  const address =
    server.address() as AddressInfo;

  baseUrl =
    `http://127.0.0.1:${address.port}`;
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

test("authenticated owner persists a mock-verified CloudAccount", async () => {
  const owner =
    await createOrganizationOwner("create");

  const awsAccountId = accountId();

  const originalVerifyRole =
    awsConnectionService.verifyRole;

  awsConnectionService.verifyRole = async () => {
    throw new Error(
      "Live AWS verification must not run in mock tests.",
    );
  };

  try {
    const {
      response,
      body,
    } = await verifyConnection(
      owner.token,
      {
        roleArn: roleArn(awsAccountId),
      },
    );

    assert.equal(response.status, 200);
    assert.equal(body.accountId, awsAccountId);
    assert.equal(body.mocked, true);
    assert.equal(body.connectionStatus, "MOCK_VERIFIED");
  } finally {
    awsConnectionService.verifyRole = originalVerifyRole;
  }

  const persisted =
    await prisma.cloudAccount.findUnique({
      where: {
        awsAccountId,
      },
    });

  assert.equal(
    persisted?.organizationId,
    owner.organization.id,
  );
  assert.equal(
    persisted?.accountName,
    `AWS Account ${awsAccountId}`,
  );
  assert.equal(persisted?.roleArn, roleArn(awsAccountId));
  assert.equal(persisted?.isActive, true);
  assert.equal(persisted?.connectionStatus, "MOCK_VERIFIED");
  assert.equal(persisted?.connectionError, null);
  assert.notEqual(persisted?.lastVerifiedAt, null);
  assert.equal(persisted?.lastSuccessfulSyncAt, null);
});

test("same organization re-verification updates one CloudAccount", async () => {
  const owner =
    await createOrganizationOwner("idempotent");

  const awsAccountId = accountId();

  const first =
    await verifyConnection(
      owner.token,
      {
        roleArn: roleArn(awsAccountId, "FirstRole"),
      },
    );

  const second =
    await verifyConnection(
      owner.token,
      {
        roleArn: roleArn(awsAccountId, "SecondRole"),
      },
    );

  assert.equal(first.response.status, 200);
  assert.equal(second.response.status, 200);
  assert.equal(
    await prisma.cloudAccount.count({
      where: {
        awsAccountId,
      },
    }),
    1,
  );

  const persisted =
    await prisma.cloudAccount.findUnique({
      where: {
        awsAccountId,
      },
    });

  assert.equal(
    persisted?.organizationId,
    owner.organization.id,
  );
  assert.equal(
    persisted?.roleArn,
    roleArn(awsAccountId, "SecondRole"),
  );
  assert.notEqual(persisted?.lastVerifiedAt, null);
});

test("another organization cannot claim an existing AWS account", async () => {
  const ownerA =
    await createOrganizationOwner("conflict-a");

  const ownerB =
    await createOrganizationOwner("conflict-b");

  const awsAccountId = accountId();
  const firstRoleArn = roleArn(awsAccountId, "OwnerARole");

  await verifyConnection(
    ownerA.token,
    {
      roleArn: firstRoleArn,
    },
  );

  const conflict =
    await verifyConnection(
      ownerB.token,
      {
        roleArn: roleArn(awsAccountId, "OwnerBRole"),
      },
    );

  assert.equal(conflict.response.status, 409);

  const persisted =
    await prisma.cloudAccount.findUnique({
      where: {
        awsAccountId,
      },
    });

  assert.equal(
    persisted?.organizationId,
    ownerA.organization.id,
  );
  assert.equal(persisted?.roleArn, firstRoleArn);
});

test("client-supplied organizationId is ignored", async () => {
  const ownerA =
    await createOrganizationOwner("body-org-a");

  const ownerB =
    await createOrganizationOwner("body-org-b");

  const awsAccountId = accountId();

  const {
    response,
  } = await verifyConnection(
    ownerA.token,
    {
      roleArn: roleArn(awsAccountId),
      organizationId: ownerB.organization.id,
    },
  );

  assert.equal(response.status, 200);

  const persisted =
    await prisma.cloudAccount.findUnique({
      where: {
        awsAccountId,
      },
    });

  assert.equal(
    persisted?.organizationId,
    ownerA.organization.id,
  );
});

test("connection endpoints require membership-backed authentication", async () => {
  const noMembershipToken =
    await createUserWithoutOrganization();

  const awsAccountId = accountId();

  const missing =
    await verifyConnection(
      undefined,
      {
        roleArn: roleArn(awsAccountId),
      },
    );

  const invalid =
    await verifyConnection(
      "not-a-jwt",
      {
        roleArn: roleArn(awsAccountId),
      },
    );

  const noMembership =
    await verifyConnection(
      noMembershipToken,
      {
        roleArn: roleArn(awsAccountId),
      },
    );

  assert.equal(missing.response.status, 401);
  assert.equal(invalid.response.status, 401);
  assert.equal(noMembership.response.status, 403);
});

test("connection reads are organization-scoped and unconfigured when absent", async () => {
  const ownerA =
    await createOrganizationOwner("get-a");

  const ownerB =
    await createOrganizationOwner("get-b");

  const ownerWithoutConnection =
    await createOrganizationOwner("get-none");

  const accountA = accountId();
  const accountB = accountId();

  await verifyConnection(
    ownerA.token,
    {
      roleArn: roleArn(accountA),
    },
  );

  await verifyConnection(
    ownerB.token,
    {
      roleArn: roleArn(accountB),
    },
  );

  const connectionA =
    await getConnection(ownerA.token);

  const connectionB =
    await getConnection(ownerB.token);

  const unconfigured =
    await getConnection(ownerWithoutConnection.token);

  assert.equal(connectionA.response.status, 200);
  assert.equal(connectionA.body.configured, true);
  assert.equal(connectionA.body.accountId, accountA);
  assert.equal(connectionB.response.status, 200);
  assert.equal(connectionB.body.configured, true);
  assert.equal(connectionB.body.accountId, accountB);
  assert.deepEqual(unconfigured.body, {
    configured: false,
  });
});

test("failed mock validation does not persist a CloudAccount", async () => {
  const owner =
    await createOrganizationOwner("failed-verification");

  const before =
    await prisma.cloudAccount.count({
      where: {
        organizationId: owner.organization.id,
      },
    });

  const {
    response,
  } = await verifyConnection(
    owner.token,
    {
      roleArn: "not-an-arn",
    },
  );

  assert.equal(response.status, 400);
  assert.equal(
    await prisma.cloudAccount.count({
      where: {
        organizationId: owner.organization.id,
      },
    }),
    before,
  );
});

test("production mode cannot enable mock verification", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousMockSetting =
    process.env.SPEND_GUARD_MOCK_AWS;

  try {
    process.env.NODE_ENV = "production";
    process.env.SPEND_GUARD_MOCK_AWS = "true";

    assert.equal(
      isMockAwsVerificationEnabled(),
      false,
    );
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
    process.env.SPEND_GUARD_MOCK_AWS =
      previousMockSetting;
  }
});
