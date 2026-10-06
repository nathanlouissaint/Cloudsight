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
  prisma,
} from "../src/config/prisma";

const jwtSecret =
  "budget-integration-test-secret";

const testRunId =
  randomUUID();

const emailPrefix =
  `spend-guard-budget-${testRunId}`;

const organizationPrefix =
  `Spend Guard Budget ${testRunId}`;

let server: Server;
let baseUrl: string;

function currentPeriod() {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
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
          "budget-test-password-hash",
      },
    });

  const organizationId =
    randomUUID();

  const organization =
    await prisma.organization.create({
      data: {
        id: organizationId,
        name:
          `${organizationPrefix} ${suffix}`,
        slug:
          `spend-guard-budget-${randomUUID()}`,
        updatedAt:
          new Date(),
      },
    });

  await prisma.organizationMember.create({
    data: {
      id: randomUUID(),
      organizationId:
        organization.id,
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

async function createUserWithoutOrganization(
  suffix: string,
) {
  const user =
    await prisma.user.create({
      data: {
        email:
          `${emailPrefix}-no-organization-${suffix}@example.test`,
        passwordHash:
          "budget-test-password-hash",
      },
    });

  return {
    user,
    token: accessToken(user),
  };
}

async function requestBudget(
  method: "GET" | "POST",
  token?: string,
  body?: Record<string, unknown>,
) {
  const headers = new Headers();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  if (body) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response =
    await fetch(
      `${baseUrl}/budget`,
      {
        method,
        headers,
        body:
          body
            ? JSON.stringify(body)
            : undefined,
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
          startsWith:
            organizationPrefix,
        },
      },
      select: {
        id: true,
      },
    });

  const organizationIds =
    organizations.map(
      (organization) => organization.id,
    );

  if (organizationIds.length > 0) {
    await prisma.budget.deleteMany({
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
        startsWith:
          emailPrefix,
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
      "Budget integration tests require cloudsight_test.",
    );
  }

  process.env.JWT_SECRET = jwtSecret;

  server =
    app.listen(0);

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

test("owner creates a current-month organization budget", async () => {
  const owner =
    await createOrganizationOwner("create");

  const {
    response,
    body,
  } = await requestBudget(
    "POST",
    owner.token,
    {
      amount: 1234.56,
    },
  );

  const period =
    currentPeriod();

  assert.equal(response.status, 200);
  assert.deepEqual(body.budget, {
    id: (body.budget as { id: string }).id,
    organizationId: owner.organization.id,
    name: "Spend Guard Monthly Budget",
    amount: 1234.56,
    month: period.month,
    year: period.year,
  });

  const persisted =
    await prisma.budget.findUnique({
      where: {
        organizationId_year_month: {
          organizationId: owner.organization.id,
          month: period.month,
          year: period.year,
        },
      },
    });

  assert.equal(persisted?.organizationId, owner.organization.id);
  assert.equal(persisted?.amount, 1234.56);
});

test("owner upserts one monthly budget for their organization", async () => {
  const owner =
    await createOrganizationOwner("upsert");

  await requestBudget(
    "POST",
    owner.token,
    {
      amount: 100,
    },
  );

  const {
    response,
    body,
  } = await requestBudget(
    "POST",
    owner.token,
    {
      amount: 250,
    },
  );

  const period =
    currentPeriod();

  assert.equal(response.status, 200);
  assert.equal(
    (body.budget as { amount: number }).amount,
    250,
  );
  assert.equal(
    await prisma.budget.count({
      where: {
        organizationId: owner.organization.id,
        month: period.month,
        year: period.year,
      },
    }),
    1,
  );
});

test("owner retrieves their persisted current-month budget", async () => {
  const owner =
    await createOrganizationOwner("get");

  await requestBudget(
    "POST",
    owner.token,
    {
      amount: 875,
    },
  );

  const {
    response,
    body,
  } = await requestBudget(
    "GET",
    owner.token,
  );

  assert.equal(response.status, 200);
  assert.equal(body.organizationId, owner.organization.id);
  assert.equal(body.budget, 875);
  assert.equal(body.configured, true);
  assert.deepEqual(
    {
      month: body.month,
      year: body.year,
    },
    currentPeriod(),
  );
});

test("budgets remain isolated between organizations", async () => {
  const ownerA =
    await createOrganizationOwner("tenant-a");

  const ownerB =
    await createOrganizationOwner("tenant-b");

  await requestBudget(
    "POST",
    ownerA.token,
    {
      amount: 100,
    },
  );

  await requestBudget(
    "POST",
    ownerB.token,
    {
      amount: 200,
    },
  );

  const budgetA =
    await requestBudget(
      "GET",
      ownerA.token,
    );

  const budgetB =
    await requestBudget(
      "GET",
      ownerB.token,
    );

  assert.equal(budgetA.response.status, 200);
  assert.equal(budgetA.body.budget, 100);
  assert.equal(
    budgetA.body.organizationId,
    ownerA.organization.id,
  );
  assert.equal(budgetB.response.status, 200);
  assert.equal(budgetB.body.budget, 200);
  assert.equal(
    budgetB.body.organizationId,
    ownerB.organization.id,
  );
});

test("client-supplied organizationId is ignored", async () => {
  const ownerA =
    await createOrganizationOwner("ignored-org-a");

  const ownerB =
    await createOrganizationOwner("ignored-org-b");

  const {
    response,
    body,
  } = await requestBudget(
    "POST",
    ownerA.token,
    {
      amount: 450,
      organizationId: ownerB.organization.id,
    },
  );

  const period =
    currentPeriod();

  assert.equal(response.status, 200);
  assert.equal(
    (body.budget as { organizationId: string }).organizationId,
    ownerA.organization.id,
  );
  assert.equal(
    await prisma.budget.count({
      where: {
        organizationId: ownerA.organization.id,
        month: period.month,
        year: period.year,
      },
    }),
    1,
  );
  assert.equal(
    await prisma.budget.count({
      where: {
        organizationId: ownerB.organization.id,
        month: period.month,
        year: period.year,
      },
    }),
    0,
  );
});

test("budget endpoints require valid membership-backed authentication", async () => {
  const user =
    await createUserWithoutOrganization("authorization");

  const missing =
    await requestBudget(
      "POST",
      undefined,
      {
        amount: 100,
      },
    );

  const invalid =
    await requestBudget(
      "POST",
      "not-a-jwt",
      {
        amount: 100,
      },
    );

  const noMembership =
    await requestBudget(
      "POST",
      user.token,
      {
        amount: 100,
      },
    );

  assert.equal(missing.response.status, 401);
  assert.equal(invalid.response.status, 401);
  assert.equal(noMembership.response.status, 403);
});

test("budget endpoint rejects invalid amounts", async () => {
  const owner =
    await createOrganizationOwner("validation");

  for (const amount of [
    0,
    -1,
    "not-a-number",
  ]) {
    const {
      response,
    } = await requestBudget(
      "POST",
      owner.token,
      {
        amount,
      },
    );

    assert.equal(response.status, 400);
  }
});
