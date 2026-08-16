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
  `budget-http-${Date.now()}`;

const password =
  "BudgetHttpPassword!123";

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
          `Budget HTTP ${suffix}`,

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
  "budget HTTP organization boundary and RBAC",
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

    beforeAll(async () => {
      await prisma.$connect();

      await prisma.user.deleteMany({
        where: {
          email: {
            startsWith: prefix,
          },
        },
      });

      await prisma.budget.deleteMany({
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
    });

    afterAll(async () => {
      await prisma.budget.deleteMany({
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
      "rejects unauthenticated budget reads",
      async () => {
        const response =
          await request(app)
            .get("/budget");

        expect(
          response.status,
        ).toBe(401);

        expect(
          response.body,
        ).toEqual({
          message:
            "Unauthorized",
        });
      },
    );

    it(
      "rejects unauthenticated budget writes",
      async () => {
        const response =
          await request(app)
            .put("/budget")
            .send({
              name:
                "Monthly Budget",

              amount: 5000,
              month: 8,
              year: 2026,
            });

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
            .get("/budget")
            .set(
              "Authorization",
              bearer(owner),
            );

        expect(
          response.status,
        ).toBe(400);

        expect(
          response.body,
        ).toEqual({
          message:
            "Organization context is required",
        });
      },
    );

    it(
      "rejects access to an organization when the user is not a member",
      async () => {
        const response =
          await request(app)
            .get("/budget")
            .set(
              "Authorization",
              bearer(outsider),
            )
            .set(
              "X-Organization-Id",
              primaryOrganization.id,
            );

        expect(
          response.status,
        ).toBe(403);
      },
    );

    it(
      "allows an OWNER to set a budget",
      async () => {
        const response =
          await request(app)
            .put("/budget")
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            )
            .send({
              name:
                "  Owner Budget  ",

              amount: 5000,
              month: 8,
              year: 2026,
            });

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.budget,
        ).toMatchObject({
          organizationId:
            primaryOrganization.id,

          name:
            "Owner Budget",

          amount: 5000,
          month: 8,
          year: 2026,
        });

        const persisted =
          await prisma.budget.findUnique({
            where: {
              organizationId_year_month: {
                organizationId:
                  primaryOrganization.id,

                year: 2026,
                month: 8,
              },
            },
          });

        expect(
          persisted,
        ).toMatchObject({
          organizationId:
            primaryOrganization.id,

          name:
            "Owner Budget",

          amount: 5000,
        });
      },
    );

    it(
      "allows an ADMIN to set a budget",
      async () => {
        const response =
          await request(app)
            .put("/budget")
            .set(
              organizationRequest(
                admin,
                primaryOrganization,
              ),
            )
            .send({
              name:
                "Admin Budget",

              amount: 6000,
              month: 9,
              year: 2026,
            });

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.budget,
        ).toMatchObject({
          organizationId:
            primaryOrganization.id,

          name:
            "Admin Budget",

          amount: 6000,
        });
      },
    );

    it(
      "rejects MEMBER budget writes",
      async () => {
        const response =
          await request(app)
            .put("/budget")
            .set(
              organizationRequest(
                member,
                primaryOrganization,
              ),
            )
            .send({
              name:
                "Member Attack",

              amount: 7000,
              month: 10,
              year: 2026,
            });

        expect(
          response.status,
        ).toBe(403);

        const persisted =
          await prisma.budget.findUnique({
            where: {
              organizationId_year_month: {
                organizationId:
                  primaryOrganization.id,

                year: 2026,
                month: 10,
              },
            },
          });

        expect(
          persisted,
        ).toBeNull();
      },
    );

    it(
      "rejects VIEWER budget writes",
      async () => {
        const response =
          await request(app)
            .put("/budget")
            .set(
              organizationRequest(
                viewer,
                primaryOrganization,
              ),
            )
            .send({
              name:
                "Viewer Attack",

              amount: 8000,
              month: 11,
              year: 2026,
            });

        expect(
          response.status,
        ).toBe(403);

        const persisted =
          await prisma.budget.findUnique({
            where: {
              organizationId_year_month: {
                organizationId:
                  primaryOrganization.id,

                year: 2026,
                month: 11,
              },
            },
          });

        expect(
          persisted,
        ).toBeNull();
      },
    );

    it(
      "does not allow request body ownership to override organization context",
      async () => {
        const response =
          await request(app)
            .put("/budget")
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            )
            .send({
              organizationId:
                secondaryOrganization.id,

              name:
                "Ownership Attack",

              amount: 9000,
              month: 12,
              year: 2026,
            });

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.budget.organizationId,
        ).toBe(
          primaryOrganization.id,
        );

        const primaryBudget =
          await prisma.budget.findUnique({
            where: {
              organizationId_year_month: {
                organizationId:
                  primaryOrganization.id,

                year: 2026,
                month: 12,
              },
            },
          });

        const foreignBudget =
          await prisma.budget.findUnique({
            where: {
              organizationId_year_month: {
                organizationId:
                  secondaryOrganization.id,

                year: 2026,
                month: 12,
              },
            },
          });

        expect(
          primaryBudget,
        ).not.toBeNull();

        expect(
          foreignBudget,
        ).toBeNull();
      },
    );

    it(
      "allows separate organizations to have budgets for the same month",
      async () => {
        await request(app)
          .put("/budget")
          .set(
            organizationRequest(
              owner,
              primaryOrganization,
            ),
          )
          .send({
            name:
              "Primary Same Month",

            amount: 1111,
            month: 7,
            year: 2027,
          })
          .expect(200);

        await request(app)
          .put("/budget")
          .set(
            organizationRequest(
              owner,
              secondaryOrganization,
            ),
          )
          .send({
            name:
              "Secondary Same Month",

            amount: 2222,
            month: 7,
            year: 2027,
          })
          .expect(200);

        const primaryBudget =
          await prisma.budget.findUnique({
            where: {
              organizationId_year_month: {
                organizationId:
                  primaryOrganization.id,

                year: 2027,
                month: 7,
              },
            },
          });

        const secondaryBudget =
          await prisma.budget.findUnique({
            where: {
              organizationId_year_month: {
                organizationId:
                  secondaryOrganization.id,

                year: 2027,
                month: 7,
              },
            },
          });

        expect(
          primaryBudget?.amount,
        ).toBe(1111);

        expect(
          secondaryBudget?.amount,
        ).toBe(2222);
      },
    );

    it(
      "upserts rather than duplicating an organization monthly budget",
      async () => {
        await request(app)
          .put("/budget")
          .set(
            organizationRequest(
              owner,
              primaryOrganization,
            ),
          )
          .send({
            name:
              "Initial Upsert",

            amount: 3000,
            month: 6,
            year: 2027,
          })
          .expect(200);

        await request(app)
          .put("/budget")
          .set(
            organizationRequest(
              owner,
              primaryOrganization,
            ),
          )
          .send({
            name:
              "Updated Upsert",

            amount: 7500,
            month: 6,
            year: 2027,
          })
          .expect(200);

        const records =
          await prisma.budget.findMany({
            where: {
              organizationId:
                primaryOrganization.id,

              year: 2027,
              month: 6,
            },
          });

        expect(
          records,
        ).toHaveLength(1);

        expect(
          records[0],
        ).toMatchObject({
          organizationId:
            primaryOrganization.id,

          name:
            "Updated Upsert",

          amount: 7500,
        });
      },
    );

    it(
      "returns only the selected organization's current budget",
      async () => {
        const now =
          new Date();

        const year =
          now.getFullYear();

        const month =
          now.getMonth() + 1;

        await prisma.budget.upsert({
          where: {
            organizationId_year_month: {
              organizationId:
                primaryOrganization.id,

              year,
              month,
            },
          },

          create: {
            organizationId:
              primaryOrganization.id,

            name:
              "Primary Current Budget",

            amount: 4321,
            year,
            month,
          },

          update: {
            name:
              "Primary Current Budget",

            amount: 4321,
          },
        });

        await prisma.budget.upsert({
          where: {
            organizationId_year_month: {
              organizationId:
                secondaryOrganization.id,

              year,
              month,
            },
          },

          create: {
            organizationId:
              secondaryOrganization.id,

            name:
              "Secondary Current Budget",

            amount: 9876,
            year,
            month,
          },

          update: {
            name:
              "Secondary Current Budget",

            amount: 9876,
          },
        });

        const response =
          await request(app)
            .get("/budget")
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
          response.body.budget,
        ).toBe(4321);
      },
    );

    it.each([
      ["OWNER", () => owner],
      ["ADMIN", () => admin],
      ["MEMBER", () => member],
      ["VIEWER", () => viewer],
    ])(
      "allows %s to read the organization budget",
      async (
        _role,
        accountFactory,
      ) => {
        const account =
          accountFactory();

        const response =
          await request(app)
            .get("/budget")
            .set(
              organizationRequest(
                account,
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