import bcrypt from "bcrypt";
import request from "supertest";

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import app from "../../../src/app";
import { prisma } from "../../../src/config/prisma";

import {
  clearCapturedTestEmails,
  getCapturedTestEmails,
} from "../../../src/services/email/test-email-capture";

import {
  organizationInvitationService,
} from "../../../src/services/organization/organization-invitation.service";

const httpDescribe =
  process.env.TEST_DATABASE_URL
    ? describe
    : describe.skip;

const ORIGIN = "http://localhost:5173";
const PASSWORD =
  "CloudSight-Test-Password-123!";
const PREFIX =
  `org-invite-http-${Date.now()}`;

interface LoginResult {
  agent: ReturnType<typeof request.agent>;
  accessToken: string;
}

async function login(
  email: string,
): Promise<LoginResult> {
  const agent = request.agent(app);

  const csrfResponse =
    await agent
      .get("/auth/csrf")
      .set("Origin", ORIGIN)
      .expect(200);

  const csrfToken =
    csrfResponse.body.csrfToken;

  const loginResponse =
    await agent
      .post("/auth/login")
      .set("Origin", ORIGIN)
      .set(
        "X-CSRF-Token",
        csrfToken,
      )
      .send({
        email,
        password: PASSWORD,
      })
      .expect(200);

  const accessToken =
    loginResponse.body.accessToken;

  if (!accessToken) {
    throw new Error(
      `Login for ${email} did not return an access token`,
    );
  }

  return {
    agent,
    accessToken,
  };
}

function organizationHeaders(
  auth: LoginResult,
  organizationId: string,
) {
  return {
    Authorization:
      `Bearer ${auth.accessToken}`,
    "X-Organization-Id":
      organizationId,
  };
}

function extractInvitationToken(): string {
  const message =
    getCapturedTestEmails().at(-1);

  const token =
    message?.text.match(
      /organization invitation token: (\S+)/,
    )?.[1];

  if (!token) {
    throw new Error(
      "Invitation email did not contain a token",
    );
  }

  return token;
}

httpDescribe(
  "organization invitations HTTP",
  () => {
    let ownerEmail: string;
    let adminEmail: string;
    let memberEmail: string;
    let viewerEmail: string;

    let ownerId: string;
    let adminId: string;
    let memberId: string;
    let viewerId: string;

    let primaryOrganizationId: string;
    let secondaryOrganizationId: string;

    let ownerAuth: LoginResult;
    let adminAuth: LoginResult;
    let memberAuth: LoginResult;
    let viewerAuth: LoginResult;

    beforeAll(async () => {
      const passwordHash =
        await bcrypt.hash(
          PASSWORD,
          10,
        );

      ownerEmail =
        `${PREFIX}-owner@example.com`;

      adminEmail =
        `${PREFIX}-admin@example.com`;

      memberEmail =
        `${PREFIX}-member@example.com`;

      viewerEmail =
        `${PREFIX}-viewer@example.com`;

      const [
        owner,
        admin,
        member,
        viewer,
      ] = await Promise.all([
        prisma.user.create({
          data: {
            email: ownerEmail,
            passwordHash,
            name: "Invite Owner",
          },
        }),

        prisma.user.create({
          data: {
            email: adminEmail,
            passwordHash,
            name: "Invite Admin",
          },
        }),

        prisma.user.create({
          data: {
            email: memberEmail,
            passwordHash,
            name: "Invite Member",
          },
        }),

        prisma.user.create({
          data: {
            email: viewerEmail,
            passwordHash,
            name: "Invite Viewer",
          },
        }),
      ]);

      ownerId = owner.id;
      adminId = admin.id;
      memberId = member.id;
      viewerId = viewer.id;

      const primaryOrganization =
        await prisma.organization.create({
          data: {
            name:
              `${PREFIX} Primary`,
            slug:
              `${PREFIX}-primary`,
          },
        });

      const secondaryOrganization =
        await prisma.organization.create({
          data: {
            name:
              `${PREFIX} Secondary`,
            slug:
              `${PREFIX}-secondary`,
          },
        });

      primaryOrganizationId =
        primaryOrganization.id;

      secondaryOrganizationId =
        secondaryOrganization.id;

      await Promise.all([
        prisma.organizationMember.create({
          data: {
            organizationId:
              primaryOrganizationId,
            userId: ownerId,
            role: "OWNER",
          },
        }),

        prisma.organizationMember.create({
          data: {
            organizationId:
              primaryOrganizationId,
            userId: adminId,
            role: "ADMIN",
          },
        }),

        prisma.organizationMember.create({
          data: {
            organizationId:
              primaryOrganizationId,
            userId: memberId,
            role: "MEMBER",
          },
        }),

        prisma.organizationMember.create({
          data: {
            organizationId:
              primaryOrganizationId,
            userId: viewerId,
            role: "VIEWER",
          },
        }),

        prisma.organizationMember.create({
          data: {
            organizationId:
              secondaryOrganizationId,
            userId: ownerId,
            role: "OWNER",
          },
        }),
      ]);

      ownerAuth =
        await login(ownerEmail);

      adminAuth =
        await login(adminEmail);

      memberAuth =
        await login(memberEmail);

      viewerAuth =
        await login(viewerEmail);
    });

    beforeEach(async () => {
      clearCapturedTestEmails();

      await prisma.organizationInvitation
        .deleteMany({
          where: {
            organization: {
              slug: {
                startsWith: PREFIX,
              },
            },
          },
        });
    });

    afterAll(async () => {
      await prisma.organizationInvitation
        .deleteMany({
          where: {
            organization: {
              slug: {
                startsWith: PREFIX,
              },
            },
          },
        });

      await prisma.organizationMember
        .deleteMany({
          where: {
            organization: {
              slug: {
                startsWith: PREFIX,
              },
            },
          },
        });

      await prisma.organization
        .deleteMany({
          where: {
            slug: {
              startsWith: PREFIX,
            },
          },
        });

      await prisma.session.deleteMany({
        where: {
          user: {
            email: {
              startsWith: PREFIX,
            },
          },
        },
      });

      await prisma.user.deleteMany({
        where: {
          email: {
            startsWith: PREFIX,
          },
        },
      });

      clearCapturedTestEmails();
    });

    it(
      "allows an owner to create an invitation",
      async () => {
        const email =
          `${PREFIX}-new-user@example.com`;

        const response =
          await ownerAuth.agent
            .post(
              "/organizations/current/invitations",
            )
            .set(
              organizationHeaders(
                ownerAuth,
                primaryOrganizationId,
              ),
            )
            .send({
              email,
              role: "MEMBER",
            })
            .expect(201);

        expect(
          response.body.invitation,
        ).toMatchObject({
          organizationId:
            primaryOrganizationId,
          email,
          role: "MEMBER",
        });

        expect(
          response.body.invitation.tokenHash,
        ).toBeUndefined();

        const stored =
          await prisma.organizationInvitation
            .findFirstOrThrow({
              where: {
                organizationId:
                  primaryOrganizationId,
                email,
              },
            });

        expect(stored.tokenHash)
          .toEqual(expect.any(String));

        expect(stored.tokenHash)
          .not.toBe(
            extractInvitationToken(),
          );
      },
    );

    it.each([
      "OWNER",
      "ADMIN",
      "MEMBER",
      "VIEWER",
    ] as const)(
      "allows an owner to invite role %s",
      async (role) => {
        await ownerAuth.agent
          .post(
            "/organizations/current/invitations",
          )
          .set(
            organizationHeaders(
              ownerAuth,
              primaryOrganizationId,
            ),
          )
          .send({
            email:
              `${PREFIX}-owner-role-${role.toLowerCase()}@example.com`,
            role,
          })
          .expect(201);
      },
    );

    it(
      "prevents an admin from inviting an owner",
      async () => {
        await adminAuth.agent
          .post(
            "/organizations/current/invitations",
          )
          .set(
            organizationHeaders(
              adminAuth,
              primaryOrganizationId,
            ),
          )
          .send({
            email:
              `${PREFIX}-admin-owner@example.com`,
            role: "OWNER",
          })
          .expect(403);
      },
    );

    it.each([
      ["member", () => memberAuth],
      ["viewer", () => viewerAuth],
    ])(
      "prevents %s from managing invitations",
      async (
        _label,
        getAuth,
      ) => {
        const auth = getAuth();

        await auth.agent
          .get(
            "/organizations/current/invitations",
          )
          .set(
            organizationHeaders(
              auth,
              primaryOrganizationId,
            ),
          )
          .expect(403);

        await auth.agent
          .post(
            "/organizations/current/invitations",
          )
          .set(
            organizationHeaders(
              auth,
              primaryOrganizationId,
            ),
          )
          .send({
            email:
              `${PREFIX}-blocked@example.com`,
            role: "MEMBER",
          })
          .expect(403);
      },
    );

    it(
      "rejects inviting an existing member",
      async () => {
        await ownerAuth.agent
          .post(
            "/organizations/current/invitations",
          )
          .set(
            organizationHeaders(
              ownerAuth,
              primaryOrganizationId,
            ),
          )
          .send({
            email: memberEmail,
            role: "MEMBER",
          })
          .expect(409);
      },
    );

    it(
      "rejects a duplicate active invitation",
      async () => {
        const email =
          `${PREFIX}-duplicate@example.com`;

        const makeRequest = () =>
          ownerAuth.agent
            .post(
              "/organizations/current/invitations",
            )
            .set(
              organizationHeaders(
                ownerAuth,
                primaryOrganizationId,
              ),
            )
            .send({
              email,
              role: "MEMBER",
            });

        await makeRequest().expect(201);
        await makeRequest().expect(409);

        expect(
          await prisma.organizationInvitation.count({
            where: {
              organizationId:
                primaryOrganizationId,
              email,
              acceptedAt: null,
              revokedAt: null,
            },
          }),
        ).toBe(1);
      },
    );

    it(
      "lists only current organization invitations without token hashes",
      async () => {
        await ownerAuth.agent
          .post(
            "/organizations/current/invitations",
          )
          .set(
            organizationHeaders(
              ownerAuth,
              primaryOrganizationId,
            ),
          )
          .send({
            email:
              `${PREFIX}-primary-list@example.com`,
            role: "MEMBER",
          })
          .expect(201);

        await ownerAuth.agent
          .post(
            "/organizations/current/invitations",
          )
          .set(
            organizationHeaders(
              ownerAuth,
              secondaryOrganizationId,
            ),
          )
          .send({
            email:
              `${PREFIX}-secondary-list@example.com`,
            role: "VIEWER",
          })
          .expect(201);

        const response =
          await ownerAuth.agent
            .get(
              "/organizations/current/invitations",
            )
            .set(
              organizationHeaders(
                ownerAuth,
                primaryOrganizationId,
              ),
            )
            .expect(200);

        expect(
          response.body.invitations,
        ).toHaveLength(1);

        expect(
          response.body.invitations[0].email,
        ).toBe(
          `${PREFIX}-primary-list@example.com`,
        );

        expect(
          response.body.invitations[0].tokenHash,
        ).toBeUndefined();
      },
    );

    it(
      "prevents cross-organization invitation revocation",
      async () => {
        const created =
          await ownerAuth.agent
            .post(
              "/organizations/current/invitations",
            )
            .set(
              organizationHeaders(
                ownerAuth,
                primaryOrganizationId,
              ),
            )
            .send({
              email:
                `${PREFIX}-cross-org@example.com`,
              role: "MEMBER",
            })
            .expect(201);

        await ownerAuth.agent
          .delete(
            `/organizations/current/invitations/${created.body.invitation.id}`,
          )
          .set(
            organizationHeaders(
              ownerAuth,
              secondaryOrganizationId,
            ),
          )
          .expect(404);
      },
    );

    it(
      "rejects acceptance by the wrong authenticated email",
      async () => {
        await ownerAuth.agent
          .post(
            "/organizations/current/invitations",
          )
          .set(
            organizationHeaders(
              ownerAuth,
              primaryOrganizationId,
            ),
          )
          .send({
            email:
              `${PREFIX}-someone-else@example.com`,
            role: "MEMBER",
          })
          .expect(201);

        const token =
          extractInvitationToken();

        await viewerAuth.agent
          .post(
            `/organization-invitations/${token}/accept`,
          )
          .set(
            "Authorization",
            `Bearer ${viewerAuth.accessToken}`,
          )
          .expect(403);
      },
    );

    it(
      "accepts an invitation once and creates the requested membership",
      async () => {
        const inviteeEmail =
          `${PREFIX}-accept@example.com`;

        const passwordHash =
          await bcrypt.hash(
            PASSWORD,
            10,
          );

        const invitee =
          await prisma.user.create({
            data: {
              email: inviteeEmail,
              passwordHash,
            },
          });

        await ownerAuth.agent
          .post(
            "/organizations/current/invitations",
          )
          .set(
            organizationHeaders(
              ownerAuth,
              primaryOrganizationId,
            ),
          )
          .send({
            email: inviteeEmail,
            role: "VIEWER",
          })
          .expect(201);

        const token =
          extractInvitationToken();

        const inviteeAuth =
          await login(inviteeEmail);

        await inviteeAuth.agent
          .post(
            `/organization-invitations/${token}/accept`,
          )
          .set(
            "Authorization",
            `Bearer ${inviteeAuth.accessToken}`,
          )
          .expect(200);

        const membership =
          await prisma.organizationMember
            .findUnique({
              where: {
                organizationId_userId: {
                  organizationId:
                    primaryOrganizationId,
                  userId:
                    invitee.id,
                },
              },
            });

        expect(membership?.role)
          .toBe("VIEWER");

        await inviteeAuth.agent
          .post(
            `/organization-invitations/${token}/accept`,
          )
          .set(
            "Authorization",
            `Bearer ${inviteeAuth.accessToken}`,
          )
          .expect(409);

        expect(
          await prisma.organizationMember.count({
            where: {
              organizationId:
                primaryOrganizationId,
              userId: invitee.id,
            },
          }),
        ).toBe(1);
      },
    );

    it(
      "rejects an expired invitation",
      async () => {
        const inviteeEmail =
          `${PREFIX}-expired@example.com`;

        const passwordHash =
          await bcrypt.hash(
            PASSWORD,
            10,
          );

        await prisma.user.create({
          data: {
            email: inviteeEmail,
            passwordHash,
          },
        });

        const token =
          "expired-invitation-token";

        await prisma.organizationInvitation
          .create({
            data: {
              organizationId:
                primaryOrganizationId,
              email: inviteeEmail,
              role: "MEMBER",
              tokenHash:
                organizationInvitationService
                  .hashToken(token),
              invitedByUserId:
                ownerId,
              expiresAt:
                new Date(
                  Date.now() - 60_000,
                ),
            },
          });

        const inviteeAuth =
          await login(inviteeEmail);

        await inviteeAuth.agent
          .post(
            `/organization-invitations/${token}/accept`,
          )
          .set(
            "Authorization",
            `Bearer ${inviteeAuth.accessToken}`,
          )
          .expect(410);
      },
    );
    it(
      "allows only one concurrent active invitation for the same organization and email",
      async () => {
        const email =
          `${PREFIX}-concurrent-create@example.com`;

        const makeRequest = () =>
          ownerAuth.agent
            .post(
              "/organizations/current/invitations",
            )
            .set(
              organizationHeaders(
                ownerAuth,
                primaryOrganizationId,
              ),
            )
            .send({
              email,
              role: "MEMBER",
            });

        const results =
          await Promise.allSettled([
            makeRequest(),
            makeRequest(),
          ]);

        const statuses =
          results.map((result) => {
            if (result.status === "rejected") {
              throw result.reason;
            }

            return result.value.status;
          });

        expect(
          statuses.sort(),
        ).toEqual([
          201,
          409,
        ]);

        expect(
          await prisma.organizationInvitation.count({
            where: {
              organizationId:
                primaryOrganizationId,
              email,
              acceptedAt: null,
              revokedAt: null,
            },
          }),
        ).toBe(1);
      },
    );

    it(
      "allows only one concurrent acceptance of an invitation",
      async () => {
        const inviteeEmail =
          `${PREFIX}-concurrent-accept@example.com`;

        const passwordHash =
          await bcrypt.hash(
            PASSWORD,
            10,
          );

        const invitee =
          await prisma.user.create({
            data: {
              email: inviteeEmail,
              passwordHash,
            },
          });

        const created =
          await ownerAuth.agent
            .post(
              "/organizations/current/invitations",
            )
            .set(
              organizationHeaders(
                ownerAuth,
                primaryOrganizationId,
              ),
            )
            .send({
              email: inviteeEmail,
              role: "MEMBER",
            })
            .expect(201);

        const token =
          extractInvitationToken();

        const inviteeAuth =
          await login(inviteeEmail);

        const accept = () =>
          inviteeAuth.agent
            .post(
              `/organization-invitations/${token}/accept`,
            )
            .set(
              "Authorization",
              `Bearer ${inviteeAuth.accessToken}`,
            );

        const results =
          await Promise.allSettled([
            accept(),
            accept(),
          ]);

        const statuses =
          results.map((result) => {
            if (result.status === "rejected") {
              throw result.reason;
            }

            return result.value.status;
          });

        expect(
          statuses.sort(),
        ).toEqual([
          200,
          409,
        ]);

        expect(
          await prisma.organizationMember.count({
            where: {
              organizationId:
                primaryOrganizationId,
              userId: invitee.id,
            },
          }),
        ).toBe(1);

        const invitation =
          await prisma.organizationInvitation
            .findUniqueOrThrow({
              where: {
                id:
                  created.body.invitation.id,
              },
            });

        expect(
          invitation.acceptedAt,
        ).not.toBeNull();
      },
    );

  },
);
