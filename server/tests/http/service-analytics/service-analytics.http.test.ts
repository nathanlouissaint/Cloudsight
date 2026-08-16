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
  `service-analytics-http-${Date.now()}`;

const password =
  "ServiceAnalyticsPassword!123";

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
          `Service Analytics HTTP ${suffix}`,

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
  "service analytics HTTP organization boundary and RBAC",
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

      const primaryCloudAccount =
        await prisma.cloudAccount.create({
          data: {
            organizationId:
              primaryOrganization.id,

            awsAccountId:
              `${Date.now()}101`,

            accountName:
              "Primary Service Analytics Account",
          },
        });

      primaryAccountId =
        primaryCloudAccount.id;

      const secondaryCloudAccount =
        await prisma.cloudAccount.create({
          data: {
            organizationId:
              secondaryOrganization.id,

            awsAccountId:
              `${Date.now()}202`,

            accountName:
              "Secondary Service Analytics Account",
          },
        });

      secondaryAccountId =
        secondaryCloudAccount.id;

      await prisma.serviceCostSnapshot.createMany({
        data: [
          {
            accountId:
              primaryAccountId,

            serviceName:
              "Amazon EC2",

            snapshotDate:
              new Date(
                "2026-08-05T12:00:00.000Z",
              ),

            cost: 60,
          },
          {
            accountId:
              primaryAccountId,

            serviceName:
              "Amazon EC2",

            snapshotDate:
              new Date(
                "2026-08-06T12:00:00.000Z",
              ),

            cost: 40,
          },
          {
            accountId:
              primaryAccountId,

            serviceName:
              "Amazon S3",

            snapshotDate:
              new Date(
                "2026-08-05T12:00:00.000Z",
              ),

            cost: 25,
          },
          {
            accountId:
              primaryAccountId,

            serviceName:
              "Amazon RDS",

            snapshotDate:
              new Date(
                "2026-08-07T12:00:00.000Z",
              ),

            cost: 75,
          },
          {
            accountId:
              secondaryAccountId,

            serviceName:
              "Amazon EC2",

            snapshotDate:
              new Date(
                "2026-08-05T12:00:00.000Z",
              ),

            cost: 999,
          },
          {
            accountId:
              secondaryAccountId,

            serviceName:
              "Secondary Secret Service",

            snapshotDate:
              new Date(
                "2026-08-06T12:00:00.000Z",
              ),

            cost: 888,
          },
        ],
      });
    });

    afterAll(async () => {
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
      "rejects unauthenticated service analytics reads",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services",
            )
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
      "rejects authenticated requests without organization context",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services",
            )
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
            .get(
              "/analytics/services",
            )
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
      "OWNER can read service breakdown",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services",
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
          response.body,
        ).toEqual([
          {
            serviceName:
              "Amazon EC2",
            totalCost: 100,
          },
          {
            serviceName:
              "Amazon RDS",
            totalCost: 75,
          },
          {
            serviceName:
              "Amazon S3",
            totalCost: 25,
          },
        ]);
      },
    );

    it(
      "service breakdown excludes another organization's snapshots",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services",
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

        const names =
          response.body.map(
            (
              service: {
                serviceName: string;
              },
            ) =>
              service.serviceName,
          );

        expect(
          names,
        ).not.toContain(
          "Secondary Secret Service",
        );

        const ec2 =
          response.body.find(
            (
              service: {
                serviceName: string;
              },
            ) =>
              service.serviceName ===
              "Amazon EC2",
          );

        expect(
          ec2?.totalCost,
        ).toBe(100);
      },
    );

    it(
      "ADMIN can read service analytics",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services",
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
      "MEMBER can read service analytics",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services",
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
      "VIEWER can read service analytics",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services",
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

    it(
      "top drivers are calculated only from the selected organization",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services/top-drivers",
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
          response.body,
        ).toEqual([
          {
            serviceName:
              "Amazon EC2",
            totalCost: 100,
            percentOfSpend: 50,
          },
          {
            serviceName:
              "Amazon RDS",
            totalCost: 75,
            percentOfSpend: 37.5,
          },
          {
            serviceName:
              "Amazon S3",
            totalCost: 25,
            percentOfSpend: 12.5,
          },
        ]);
      },
    );

    it(
      "top drivers exclude another organization's services",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services/top-drivers",
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

        const names =
          response.body.map(
            (
              service: {
                serviceName: string;
              },
            ) =>
              service.serviceName,
          );

        expect(
          names,
        ).not.toContain(
          "Secondary Secret Service",
        );
      },
    );

    it(
      "service trend returns only selected organization snapshots",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services/Amazon%20EC2/trends",
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
          response.body.serviceName,
        ).toBe(
          "Amazon EC2",
        );

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
          60,
          40,
        ]);

        for (
          const point of
          response.body.trend
        ) {
          expect(
            point.accountId,
          ).toBe(
            primaryAccountId,
          );
        }
      },
    );

    it(
      "service trend cannot expose another organization's matching service",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services/Amazon%20EC2/trends",
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

        const accountIds =
          response.body.trend.map(
            (
              point: {
                accountId: string;
              },
            ) =>
              point.accountId,
          );

        expect(
          accountIds,
        ).not.toContain(
          secondaryAccountId,
        );

        expect(
          response.body.trend.some(
            (
              point: {
                cost: number;
              },
            ) =>
              point.cost === 999,
          ),
        ).toBe(false);
      },
    );

    it(
      "requesting a service that exists only in another organization returns an empty trend",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services/Secondary%20Secret%20Service/trends",
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
          response.body,
        ).toEqual({
          serviceName:
            "Secondary Secret Service",
          trend: [],
        });
      },
    );

    it(
      "secondary organization sees its own service breakdown independently",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services",
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
          response.body,
        ).toEqual([
          {
            serviceName:
              "Amazon EC2",
            totalCost: 999,
          },
          {
            serviceName:
              "Secondary Secret Service",
            totalCost: 888,
          },
        ]);
      },
    );

    it(
      "date range filters service breakdown results",
      async () => {
        const response =
          await request(app)
            .get(
              "/analytics/services",
            )
            .query({
              startDate:
                "2026-08-07T00:00:00.000Z",

              endDate:
                "2026-08-07T23:59:59.999Z",
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
          response.body,
        ).toEqual([
          {
            serviceName:
              "Amazon RDS",
            totalCost: 75,
          },
        ]);
      },
    );
  },
);
