import request from "supertest";
import bcrypt from "bcrypt";

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

import type {
  OrganizationRole,
} from "@prisma/client";

import app from "../../../src/app";
import { prisma } from "../../../src/config/prisma";

const origin =
  process.env.CORS_ORIGIN ??
  "http://localhost:5173";

const prefix =
  `accounts-http-${Date.now()}`;

const password =
  "AccountsHttpPassword!123";

type TestAccount = {
  id: string;
  email: string;
  accessToken: string;
};

type TestOrganization = {
  id: string;
  slug: string;
};

async function csrf(
  agent: request.SuperAgentTest,
): Promise<string> {
  const response =
    await agent
      .get("/auth/csrf")
      .set(
        "Origin",
        origin,
      );

  expect(
    response.status,
  ).toBe(200);

  return response.body
    .csrfToken as string;
}

async function createAccount(
  suffix: string,
): Promise<TestAccount> {
  const email =
    `${prefix}-${suffix}@example.test`;

  const user =
    await prisma.user.create({
      data: {
        email,
        passwordHash:
          await bcrypt.hash(
            password,
            4,
          ),
      },
    });

  const agent =
    request.agent(app);

  const csrfToken =
    await csrf(agent);

  const login =
    await agent
      .post("/auth/login")
      .set(
        "Origin",
        origin,
      )
      .set(
        "X-CSRF-Token",
        csrfToken,
      )
      .send({
        email,
        password,
      });

  expect(
    login.status,
  ).toBe(200);

  expect(
    login.body.accessToken,
  ).toEqual(
    expect.any(String),
  );

  return {
    id: user.id,
    email,
    accessToken:
      login.body.accessToken as string,
  };
}

async function createOrganization(
  suffix: string,
): Promise<TestOrganization> {
  const organization =
    await prisma.organization.create({
      data: {
        name:
          `Accounts HTTP ${suffix}`,

        slug:
          `${prefix}-${suffix}`,
      },
    });

  return {
    id: organization.id,
    slug: organization.slug,
  };
}

async function addMember(
  organizationId: string,
  account: TestAccount,
  role: OrganizationRole,
) {
  return prisma.organizationMember.create({
    data: {
      organizationId,
      userId: account.id,
      role,
    },
  });
}

function bearer(
  account: TestAccount,
) {
  return `Bearer ${account.accessToken}`;
}

function organizationRequest(
  account: TestAccount,
  organization: TestOrganization,
) {
  return {
    Authorization:
      bearer(account),

    "X-Organization-Id":
      organization.id,
  };
}

const httpDescribe =
  process.env.TEST_DATABASE_URL
    ? describe
    : describe.skip;

httpDescribe(
  "accounts HTTP organization boundary and RBAC",
  () => {
    let owner: TestAccount;
    let admin: TestAccount;
    let member: TestAccount;
    let viewer: TestAccount;
    let outsider: TestAccount;

    let primaryOrganization:
      TestOrganization;

    let secondaryOrganization:
      TestOrganization;

    let primaryAccountId: string;
    let primarySecondAccountId: string;
    let secondaryAccountId: string;

    const rangeStart =
      "2026-08-01T00:00:00.000Z";

    const rangeEnd =
      "2026-08-31T23:59:59.999Z";

    beforeAll(async () => {
      await prisma.$connect();

      owner =
        await createAccount(
          "owner",
        );

      admin =
        await createAccount(
          "admin",
        );

      member =
        await createAccount(
          "member",
        );

      viewer =
        await createAccount(
          "viewer",
        );

      outsider =
        await createAccount(
          "outsider",
        );

      primaryOrganization =
        await createOrganization(
          "primary",
        );

      secondaryOrganization =
        await createOrganization(
          "secondary",
        );

      await addMember(
        primaryOrganization.id,
        owner,
        "OWNER",
      );

      await addMember(
        primaryOrganization.id,
        admin,
        "ADMIN",
      );

      await addMember(
        primaryOrganization.id,
        member,
        "MEMBER",
      );

      await addMember(
        primaryOrganization.id,
        viewer,
        "VIEWER",
      );

      await addMember(
        secondaryOrganization.id,
        owner,
        "OWNER",
      );

      const primaryAccount =
        await prisma.cloudAccount.create({
          data: {
            organizationId:
              primaryOrganization.id,

            awsAccountId:
              `${Date.now()}301`,

            accountName:
              "Primary Production",
          },
        });

      primaryAccountId =
        primaryAccount.id;

      const primarySecondAccount =
        await prisma.cloudAccount.create({
          data: {
            organizationId:
              primaryOrganization.id,

            awsAccountId:
              `${Date.now()}302`,

            accountName:
              "Primary Development",
          },
        });

      primarySecondAccountId =
        primarySecondAccount.id;

      const secondaryAccount =
        await prisma.cloudAccount.create({
          data: {
            organizationId:
              secondaryOrganization.id,

            awsAccountId:
              `${Date.now()}303`,

            accountName:
              "Secondary Secret Account",
          },
        });

      secondaryAccountId =
        secondaryAccount.id;

      await prisma.costSnapshot.createMany({
        data: [
          {
            accountId:
              primaryAccountId,

            snapshotDate:
              new Date(
                "2026-08-05T12:00:00.000Z",
              ),

            totalCost: 50,
          },
          {
            accountId:
              primaryAccountId,

            snapshotDate:
              new Date(
                "2026-08-06T12:00:00.000Z",
              ),

            totalCost: 75,
          },
          {
            accountId:
              primaryAccountId,

            snapshotDate:
              new Date(
                "2026-07-15T12:00:00.000Z",
              ),

            totalCost: 9999,
          },
          {
            accountId:
              primarySecondAccountId,

            snapshotDate:
              new Date(
                "2026-08-05T12:00:00.000Z",
              ),

            totalCost: 25,
          },
          {
            accountId:
              secondaryAccountId,

            snapshotDate:
              new Date(
                "2026-08-05T12:00:00.000Z",
              ),

            totalCost: 777,
          },
          {
            accountId:
              secondaryAccountId,

            snapshotDate:
              new Date(
                "2026-08-06T12:00:00.000Z",
              ),

            totalCost: 888,
          },
        ],
      });
    });

    afterAll(async () => {
      await prisma.costSnapshot.deleteMany({
        where: {
          account: {
            organization: {
              slug: {
                startsWith: prefix,
              },
            },
          },
        },
      });

      await prisma.serviceCostSnapshot.deleteMany({
        where: {
          account: {
            organization: {
              slug: {
                startsWith: prefix,
              },
            },
          },
        },
      });

      await prisma.cloudAccount.deleteMany({
        where: {
          organization: {
            slug: {
              startsWith: prefix,
            },
          },
        },
      });

      await prisma.organizationMember.deleteMany({
        where: {
          organization: {
            slug: {
              startsWith: prefix,
            },
          },
        },
      });

      await prisma.organization.deleteMany({
        where: {
          slug: {
            startsWith: prefix,
          },
        },
      });

      await prisma.user.deleteMany({
        where: {
          email: {
            startsWith: prefix,
          },
        },
      });

      await prisma.$disconnect();
    });

    it(
      "rejects unauthenticated account reads",
      async () => {
        const response =
          await request(app)
            .get("/analytics/accounts")
            .set(
              "X-Organization-Id",
              primaryOrganization.id,
            );

        expect(
          response.status,
        ).toBe(401);
      },
    );

    it(
      "rejects authenticated account reads without organization context",
      async () => {
        const response =
          await request(app)
            .get("/analytics/accounts")
            .set(
              "Authorization",
              bearer(owner),
            );

        expect(
          response.status,
        ).toBe(400);
      },
    );

    it(
      "rejects a non-member of the selected organization",
      async () => {
        const response =
          await request(app)
            .get("/analytics/accounts")
            .set(
              organizationRequest(
                outsider,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(403);
      },
    );

    it(
      "OWNER can read account summaries",
      async () => {
        const response =
          await request(app)
            .get("/analytics/accounts")
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.accountCount,
        ).toBe(2);

        expect(
          response.body.accounts,
        ).toEqual(
          expect.arrayContaining([
            {
              accountId:
                primaryAccountId,

              accountName:
                "Primary Production",

              totalCost: 125,
            },
            {
              accountId:
                primarySecondAccountId,

              accountName:
                "Primary Development",

              totalCost: 25,
            },
          ]),
        );
      },
    );

    it(
      "account summaries exclude another organization's accounts and costs",
      async () => {
        const response =
          await request(app)
            .get("/analytics/accounts")
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);

        const ids =
          response.body.accounts.map(
            (
              account: {
                accountId: string;
              },
            ) =>
              account.accountId,
          );

        expect(
          ids,
        ).not.toContain(
          secondaryAccountId,
        );

        expect(
          response.body.accounts,
        ).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              accountName:
                "Secondary Secret Account",
            }),
          ]),
        );
      },
    );

    it(
      "ADMIN can read account summaries",
      async () => {
        const response =
          await request(app)
            .get("/analytics/accounts")
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                admin,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);
      },
    );

    it(
      "MEMBER can read account summaries",
      async () => {
        const response =
          await request(app)
            .get("/analytics/accounts")
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                member,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);
      },
    );

    it(
      "VIEWER can read account summaries",
      async () => {
        const response =
          await request(app)
            .get("/analytics/accounts")
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                viewer,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);
      },
    );

    it(
      "secondary organization sees only its own account summary",
      async () => {
        const response =
          await request(app)
            .get("/analytics/accounts")
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                owner,
                secondaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.accountCount,
        ).toBe(1);

        expect(
          response.body.accounts,
        ).toEqual([
          {
            accountId:
              secondaryAccountId,

            accountName:
              "Secondary Secret Account",

            totalCost: 1665,
          },
        ]);
      },
    );

    it(
      "date range filters account summary costs",
      async () => {
        const response =
          await request(app)
            .get("/analytics/accounts")
            .query({
              startDate:
                "2026-08-05T00:00:00.000Z",

              endDate:
                "2026-08-05T23:59:59.999Z",
            })
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.accounts,
        ).toEqual(
          expect.arrayContaining([
            {
              accountId:
                primaryAccountId,

              accountName:
                "Primary Production",

              totalCost: 50,
            },
            {
              accountId:
                primarySecondAccountId,

              accountName:
                "Primary Development",

              totalCost: 25,
            },
          ]),
        );
      },
    );

    it(
      "OWNER can read an account trend",
      async () => {
        const response =
          await request(app)
            .get(
              `/analytics/accounts/${primaryAccountId}/trends`,
            )
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.accountId,
        ).toBe(
          primaryAccountId,
        );

        expect(
          response.body.accountName,
        ).toBe(
          "Primary Production",
        );

        expect(
          response.body.totalCost,
        ).toBe(125);

        expect(
          response.body.trend,
        ).toHaveLength(2);

        expect(
          response.body.trend.map(
            (
              point: {
                cost: number;
              },
            ) =>
              point.cost,
          ),
        ).toEqual([
          50,
          75,
        ]);
      },
    );

    it(
      "account trend respects the requested date range",
      async () => {
        const response =
          await request(app)
            .get(
              `/analytics/accounts/${primaryAccountId}/trends`,
            )
            .query({
              startDate:
                "2026-08-06T00:00:00.000Z",

              endDate:
                "2026-08-06T23:59:59.999Z",
            })
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.totalCost,
        ).toBe(75);

        expect(
          response.body.trend,
        ).toHaveLength(1);

        expect(
          response.body.trend[0].cost,
        ).toBe(75);
      },
    );

    it(
      "cannot access another organization's account trend",
      async () => {
        const response =
          await request(app)
            .get(
              `/analytics/accounts/${secondaryAccountId}/trends`,
            )
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(404);

        expect(
          response.body.message,
        ).toBe(
          "Account not found",
        );
      },
    );

    it(
      "foreign account trend data is not exposed through primary organization context",
      async () => {
        const response =
          await request(app)
            .get(
              `/analytics/accounts/${secondaryAccountId}/trends`,
            )
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(404);

        expect(
          response.body.totalCost,
        ).toBeUndefined();

        expect(
          response.body.trend,
        ).toBeUndefined();
      },
    );

    it(
      "secondary organization can access its own account trend",
      async () => {
        const response =
          await request(app)
            .get(
              `/analytics/accounts/${secondaryAccountId}/trends`,
            )
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                owner,
                secondaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.accountId,
        ).toBe(
          secondaryAccountId,
        );

        expect(
          response.body.totalCost,
        ).toBe(1665);

        expect(
          response.body.trend,
        ).toHaveLength(2);
      },
    );

    it(
      "ADMIN can read account trends",
      async () => {
        const response =
          await request(app)
            .get(
              `/analytics/accounts/${primaryAccountId}/trends`,
            )
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                admin,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);
      },
    );

    it(
      "MEMBER can read account trends",
      async () => {
        const response =
          await request(app)
            .get(
              `/analytics/accounts/${primaryAccountId}/trends`,
            )
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                member,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);
      },
    );

    it(
      "VIEWER can read account trends",
      async () => {
        const response =
          await request(app)
            .get(
              `/analytics/accounts/${primaryAccountId}/trends`,
            )
            .query({
              startDate:
                rangeStart,
              endDate:
                rangeEnd,
            })
            .set(
              organizationRequest(
                viewer,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);
      },
    );
  },
);
