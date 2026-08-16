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
  `reports-http-${Date.now()}`;

const password =
  "ReportsHttpPassword!123";

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
          `Reports HTTP ${suffix}`,
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
  "reports HTTP organization boundary and RBAC",
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

    let primaryNoteId: string;
    let secondaryNoteId: string;

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
              `${Date.now()}001`,

            accountName:
              "Primary Reports Account",
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
              `${Date.now()}002`,

            accountName:
              "Secondary Reports Account",
          },
        });

      secondaryAccountId =
        secondaryCloudAccount.id;

      const snapshotDate =
        new Date();

      await prisma.costSnapshot.create({
        data: {
          accountId:
            primaryAccountId,

          snapshotDate,
          totalCost: 100,
        },
      });

      await prisma.costSnapshot.create({
        data: {
          accountId:
            secondaryAccountId,

          snapshotDate,
          totalCost: 999,
        },
      });

      await prisma.serviceCostSnapshot.createMany({
        data: [
          {
            accountId:
              primaryAccountId,

            serviceName:
              "Amazon EC2",

            snapshotDate,
            cost: 60,
          },
          {
            accountId:
              primaryAccountId,

            serviceName:
              "Amazon S3",

            snapshotDate,
            cost: 40,
          },
          {
            accountId:
              secondaryAccountId,

            serviceName:
              "Secondary Secret Service",

            snapshotDate,
            cost: 999,
          },
        ],
      });

      const primaryNote =
        await prisma.reportNote.create({
          data: {
            organizationId:
              primaryOrganization.id,

            title:
              "Primary private note",

            content:
              "Primary organization content",
          },
        });

      primaryNoteId =
        primaryNote.id;

      const secondaryNote =
        await prisma.reportNote.create({
          data: {
            organizationId:
              secondaryOrganization.id,

            title:
              "Secondary private note",

            content:
              "Secondary organization content",
          },
        });

      secondaryNoteId =
        secondaryNote.id;
    });

    afterAll(async () => {
      await prisma.reportNote.deleteMany({
        where: {
          organization: {
            slug: {
              startsWith: prefix,
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

      await prisma.budget.deleteMany({
        where: {
          organization: {
            slug: {
              startsWith: prefix,
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
      "rejects unauthenticated report reads",
      async () => {
        const response =
          await request(app)
            .get("/reports")
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
            .get("/reports")
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
      "rejects a user who is not a member of the selected organization",
      async () => {
        const response =
          await request(app)
            .get("/reports")
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
      "OWNER can read the executive report",
      async () => {
        const response =
          await request(app)
            .get("/reports")
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
          response.body.totalSpend,
        ).toBe(100);

        expect(
          response.body.topService,
        ).toBe("Amazon EC2");

        expect(
          response.body.topServiceSpend,
        ).toBe(60);
      },
    );

    it(
      "executive report does not include another organization's costs",
      async () => {
        const primaryResponse =
          await request(app)
            .get("/reports")
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            );

        const secondaryResponse =
          await request(app)
            .get("/reports")
            .set(
              organizationRequest(
                owner,
                secondaryOrganization,
              ),
            );

        expect(
          primaryResponse.status,
        ).toBe(200);

        expect(
          secondaryResponse.status,
        ).toBe(200);

        expect(
          primaryResponse.body.totalSpend,
        ).toBe(100);

        expect(
          secondaryResponse.body.totalSpend,
        ).toBe(999);

        expect(
          primaryResponse.body.topService,
        ).toBe("Amazon EC2");

        expect(
          secondaryResponse.body.topService,
        ).toBe(
          "Secondary Secret Service",
        );
      },
    );

    it(
      "ADMIN can read reports",
      async () => {
        const response =
          await request(app)
            .get("/reports")
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
      "MEMBER can read reports",
      async () => {
        const response =
          await request(app)
            .get("/reports")
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
      "VIEWER can read reports",
      async () => {
        const response =
          await request(app)
            .get("/reports")
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
      "CSV export contains only the selected organization's service costs",
      async () => {
        const response =
          await request(app)
            .get(
              "/reports/export/csv",
            )
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
          response.headers[
            "content-type"
          ],
        ).toContain(
          "text/csv",
        );

        expect(
          response.text,
        ).toContain(
          "Amazon EC2",
        );

        expect(
          response.text,
        ).toContain(
          "Amazon S3",
        );

        expect(
          response.text,
        ).toContain(
          "Primary Reports Account",
        );

        expect(
          response.text,
        ).not.toContain(
          "Secondary Secret Service",
        );

        expect(
          response.text,
        ).not.toContain(
          "Secondary Reports Account",
        );
      },
    );

    it(
      "GET notes returns only notes for the selected organization",
      async () => {
        const response =
          await request(app)
            .get("/reports/notes")
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
          response.body.map(
            (
              note: {
                id: string;
              },
            ) => note.id,
          );

        expect(
          ids,
        ).toContain(
          primaryNoteId,
        );

        expect(
          ids,
        ).not.toContain(
          secondaryNoteId,
        );
      },
    );

    it(
      "OWNER can create a report note in the selected organization",
      async () => {
        const response =
          await request(app)
            .post("/reports/notes")
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            )
            .send({
              title:
                "Owner-created note",

              content:
                "Created in primary organization",
            });

        expect(
          response.status,
        ).toBe(201);

        expect(
          response.body.organizationId,
        ).toBe(
          primaryOrganization.id,
        );

        const stored =
          await prisma.reportNote.findUnique({
            where: {
              id:
                response.body.id,
            },
          });

        expect(
          stored?.organizationId,
        ).toBe(
          primaryOrganization.id,
        );
      },
    );

    it(
      "ADMIN can create report notes",
      async () => {
        const response =
          await request(app)
            .post("/reports/notes")
            .set(
              organizationRequest(
                admin,
                primaryOrganization,
              ),
            )
            .send({
              title:
                "Admin note",

              content:
                "Admin report content",
            });

        expect(
          response.status,
        ).toBe(201);
      },
    );

    it(
      "MEMBER can create report notes",
      async () => {
        const response =
          await request(app)
            .post("/reports/notes")
            .set(
              organizationRequest(
                member,
                primaryOrganization,
              ),
            )
            .send({
              title:
                "Member note",

              content:
                "Member collaboration content",
            });

        expect(
          response.status,
        ).toBe(201);
      },
    );

    it(
      "VIEWER cannot create report notes",
      async () => {
        const response =
          await request(app)
            .post("/reports/notes")
            .set(
              organizationRequest(
                viewer,
                primaryOrganization,
              ),
            )
            .send({
              title:
                "Viewer forbidden note",

              content:
                "This must not be created",
            });

        expect(
          response.status,
        ).toBe(403);

        const stored =
          await prisma.reportNote.findFirst({
            where: {
              organizationId:
                primaryOrganization.id,

              title:
                "Viewer forbidden note",
            },
          });

        expect(
          stored,
        ).toBeNull();
      },
    );

    it(
      "rejects invalid report note payloads",
      async () => {
        const response =
          await request(app)
            .post("/reports/notes")
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            )
            .send({
              title:
                "Missing content",
            });

        expect(
          response.status,
        ).toBe(400);
      },
    );

    it(
      "OWNER can update a note belonging to the selected organization",
      async () => {
        const response =
          await request(app)
            .put(
              `/reports/notes/${primaryNoteId}`,
            )
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            )
            .send({
              title:
                "Updated primary note",

              content:
                "Updated primary content",
            });

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.id,
        ).toBe(
          primaryNoteId,
        );

        expect(
          response.body.title,
        ).toBe(
          "Updated primary note",
        );
      },
    );

    it(
      "cannot update a note through another organization context",
      async () => {
        const response =
          await request(app)
            .put(
              `/reports/notes/${secondaryNoteId}`,
            )
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            )
            .send({
              title:
                "Cross-tenant overwrite",

              content:
                "Must never be written",
            });

        expect(
          response.status,
        ).toBe(404);

        const secondaryNote =
          await prisma.reportNote.findUnique({
            where: {
              id:
                secondaryNoteId,
            },
          });

        expect(
          secondaryNote?.title,
        ).toBe(
          "Secondary private note",
        );

        expect(
          secondaryNote?.content,
        ).toBe(
          "Secondary organization content",
        );
      },
    );

    it(
      "VIEWER cannot update report notes",
      async () => {
        const response =
          await request(app)
            .put(
              `/reports/notes/${primaryNoteId}`,
            )
            .set(
              organizationRequest(
                viewer,
                primaryOrganization,
              ),
            )
            .send({
              title:
                "Viewer overwrite",

              content:
                "Forbidden",
            });

        expect(
          response.status,
        ).toBe(403);
      },
    );

    it(
      "cannot delete a note through another organization context",
      async () => {
        const response =
          await request(app)
            .delete(
              `/reports/notes/${secondaryNoteId}`,
            )
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(404);

        const secondaryNote =
          await prisma.reportNote.findUnique({
            where: {
              id:
                secondaryNoteId,
            },
          });

        expect(
          secondaryNote,
        ).not.toBeNull();
      },
    );

    it(
      "VIEWER cannot delete report notes",
      async () => {
        const response =
          await request(app)
            .delete(
              `/reports/notes/${primaryNoteId}`,
            )
            .set(
              organizationRequest(
                viewer,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(403);

        const note =
          await prisma.reportNote.findUnique({
            where: {
              id:
                primaryNoteId,
            },
          });

        expect(
          note,
        ).not.toBeNull();
      },
    );

    it(
      "OWNER can delete a note belonging to the selected organization",
      async () => {
        const note =
          await prisma.reportNote.create({
            data: {
              organizationId:
                primaryOrganization.id,

              title:
                "Delete me",

              content:
                "Temporary note",
            },
          });

        const response =
          await request(app)
            .delete(
              `/reports/notes/${note.id}`,
            )
            .set(
              organizationRequest(
                owner,
                primaryOrganization,
              ),
            );

        expect(
          response.status,
        ).toBe(204);

        const stored =
          await prisma.reportNote.findUnique({
            where: {
              id:
                note.id,
            },
          });

        expect(
          stored,
        ).toBeNull();
      },
    );
  },
);
