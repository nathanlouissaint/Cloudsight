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
  `cloud-accounts-http-${Date.now()}`;

const password =
  "CloudAccountsHttpPassword!123";

type TestAccount = {
  id: string;
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
      .set("Origin", origin);

  expect(response.status).toBe(200);

  return response.body.csrfToken as string;
}

async function createUser(
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
      .set("Origin", origin)
      .set(
        "X-CSRF-Token",
        csrfToken,
      )
      .send({
        email,
        password,
      });

  expect(login.status).toBe(200);

  return {
    id: user.id,
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
          `Cloud Accounts HTTP ${suffix}`,
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
  await prisma.organizationMember.create({
    data: {
      organizationId,
      userId: account.id,
      role,
    },
  });
}

function headers(
  account: TestAccount,
  organization: TestOrganization,
) {
  return {
    Authorization:
      `Bearer ${account.accessToken}`,
    "X-Organization-Id":
      organization.id,
  };
}

const httpDescribe =
  process.env.TEST_DATABASE_URL
    ? describe
    : describe.skip;

httpDescribe(
  "cloud account lifecycle HTTP",
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

    beforeAll(async () => {
      await prisma.$connect();

      owner = await createUser("owner");
      admin = await createUser("admin");
      member = await createUser("member");
      viewer = await createUser("viewer");
      outsider = await createUser("outsider");

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

      const primary =
        await prisma.cloudAccount.create({
          data: {
            organizationId:
              primaryOrganization.id,
            awsAccountId:
              "111111111111",
            accountName:
              "Primary Production",
          },
        });

      primaryAccountId = primary.id;

      const secondary =
        await prisma.cloudAccount.create({
          data: {
            organizationId:
              secondaryOrganization.id,
            awsAccountId:
              "222222222222",
            accountName:
              "Secondary Secret",
          },
        });

      secondaryAccountId =
        secondary.id;

      await prisma.costSnapshot.create({
        data: {
          accountId:
            primaryAccountId,
          snapshotDate:
            new Date(),
          totalCost: 123.45,
        },
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
      "rejects unauthenticated reads",
      async () => {
        const response =
          await request(app)
            .get("/cloud-accounts")
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
      "requires organization context",
      async () => {
        const response =
          await request(app)
            .get("/cloud-accounts")
            .set(
              "Authorization",
              `Bearer ${owner.accessToken}`,
            );

        expect(
          response.status,
        ).toBe(400);
      },
    );

    it(
      "rejects non-members",
      async () => {
        const response =
          await request(app)
            .get("/cloud-accounts")
            .set(
              headers(
                outsider,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(403);
      },
    );

    for (
      const [role, getAccount]
      of [
        [
          "OWNER",
          () => owner,
        ],
        [
          "ADMIN",
          () => admin,
        ],
        [
          "MEMBER",
          () => member,
        ],
        [
          "VIEWER",
          () => viewer,
        ],
      ] as const
    ) {
      it(
        `${role} can list cloud accounts`,
        async () => {
          const response =
            await request(app)
              .get("/cloud-accounts")
              .set(
                headers(
                  getAccount(),
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
              expect.objectContaining({
                id:
                  primaryAccountId,
                accountName:
                  "Primary Production",
              }),
            ]),
          );

          expect(
            response.body.accounts,
          ).not.toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id:
                  secondaryAccountId,
              }),
            ]),
          );
        },
      );
    }

    it(
      "OWNER can create a cloud account",
      async () => {
        const response =
          await request(app)
            .post("/cloud-accounts")
            .set(
              headers(
                owner,
                primaryOrganization,
              ),
            )
            .send({
              awsAccountId:
                "333333333333",
              accountName:
                "Analytics",
            });

        expect(
          response.status,
        ).toBe(201);

        expect(
          response.body.account,
        ).toEqual(
          expect.objectContaining({
            organizationId:
              primaryOrganization.id,
            awsAccountId:
              "333333333333",
            accountName:
              "Analytics",
            isActive: true,
            disconnectedAt: null,
          }),
        );
      },
    );

    it(
      "ADMIN can create a cloud account",
      async () => {
        const response =
          await request(app)
            .post("/cloud-accounts")
            .set(
              headers(
                admin,
                primaryOrganization,
              ),
            )
            .send({
              awsAccountId:
                "444444444444",
              accountName:
                "Sandbox",
            });

        expect(
          response.status,
        ).toBe(201);
      },
    );

    for (
      const [role, getAccount]
      of [
        [
          "MEMBER",
          () => member,
        ],
        [
          "VIEWER",
          () => viewer,
        ],
      ] as const
    ) {
      it(
        `${role} cannot create cloud accounts`,
        async () => {
          const response =
            await request(app)
              .post("/cloud-accounts")
              .set(
                headers(
                  getAccount(),
                  primaryOrganization,
                ),
              )
              .send({
                awsAccountId:
                  role === "MEMBER"
                    ? "555555555555"
                    : "666666666666",
                accountName:
                  "Forbidden",
              });

          expect(
            response.status,
          ).toBe(403);
        },
      );
    }

    it(
      "rejects invalid AWS account IDs",
      async () => {
        const response =
          await request(app)
            .post("/cloud-accounts")
            .set(
              headers(
                owner,
                primaryOrganization,
              ),
            )
            .send({
              awsAccountId:
                "not-an-account",
              accountName:
                "Invalid",
            });

        expect(
          response.status,
        ).toBe(400);
      },
    );

    it(
      "rejects duplicate AWS account IDs",
      async () => {
        const response =
          await request(app)
            .post("/cloud-accounts")
            .set(
              headers(
                owner,
                primaryOrganization,
              ),
            )
            .send({
              awsAccountId:
                "111111111111",
              accountName:
                "Duplicate",
            });

        expect(
          response.status,
        ).toBe(409);
      },
    );

    it(
      "OWNER can rename an account",
      async () => {
        const response =
          await request(app)
            .patch(
              `/cloud-accounts/${primaryAccountId}`,
            )
            .set(
              headers(
                owner,
                primaryOrganization,
              ),
            )
            .send({
              accountName:
                "Production Renamed",
            });

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.account.accountName,
        ).toBe(
          "Production Renamed",
        );
      },
    );

    it(
      "cannot modify another organization's account",
      async () => {
        const response =
          await request(app)
            .patch(
              `/cloud-accounts/${secondaryAccountId}`,
            )
            .set(
              headers(
                admin,
                primaryOrganization,
              ),
            )
            .send({
              accountName:
                "Compromised",
            });

        expect(
          response.status,
        ).toBe(404);

        const account =
          await prisma.cloudAccount.findUnique({
            where: {
              id:
                secondaryAccountId,
            },
          });

        expect(
          account?.accountName,
        ).toBe(
          "Secondary Secret",
        );
      },
    );

    it(
      "disconnect preserves historical cost data",
      async () => {
        const before =
          await prisma.costSnapshot.count({
            where: {
              accountId:
                primaryAccountId,
            },
          });

        const response =
          await request(app)
            .post(
              `/cloud-accounts/${primaryAccountId}/disconnect`,
            )
            .set(
              headers(
                owner,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.account.isActive,
        ).toBe(false);

        expect(
          response.body.account.disconnectedAt,
        ).not.toBeNull();

        const after =
          await prisma.costSnapshot.count({
            where: {
              accountId:
                primaryAccountId,
            },
          });

        expect(after).toBe(before);
      },
    );

    it(
      "disconnect is idempotent",
      async () => {
        const response =
          await request(app)
            .post(
              `/cloud-accounts/${primaryAccountId}/disconnect`,
            )
            .set(
              headers(
                owner,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.account.isActive,
        ).toBe(false);
      },
    );

    it(
      "disconnected accounts remain listable",
      async () => {
        const response =
          await request(app)
            .get("/cloud-accounts")
            .set(
              headers(
                viewer,
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
            expect.objectContaining({
              id:
                primaryAccountId,
              isActive: false,
            }),
          ]),
        );
      },
    );

    it(
      "ADMIN can reconnect an account",
      async () => {
        const response =
          await request(app)
            .post(
              `/cloud-accounts/${primaryAccountId}/reconnect`,
            )
            .set(
              headers(
                admin,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.account.isActive,
        ).toBe(true);

        expect(
          response.body.account.disconnectedAt,
        ).toBeNull();
      },
    );

    it(
      "cannot disconnect another organization's account",
      async () => {
        const response =
          await request(app)
            .post(
              `/cloud-accounts/${secondaryAccountId}/disconnect`,
            )
            .set(
              headers(
                owner,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(404);
      },
    );
  },
);
