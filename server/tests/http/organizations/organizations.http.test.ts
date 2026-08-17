import bcrypt from "bcrypt";
import request from "supertest";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

import app from "../../../src/app";
import { prisma } from "../../../src/config/prisma";

const httpDescribe =
  process.env.TEST_DATABASE_URL
    ? describe
    : describe.skip;

const ORIGIN = "http://localhost:5173";
const PASSWORD = "CloudSight-Test-Password-123!";
const PREFIX = `org-http-${Date.now()}`;

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

httpDescribe(
  "organizations HTTP management and tenant boundaries",
  () => {
    let ownerEmail: string;
    let secondOwnerEmail: string;
    let adminEmail: string;
    let memberEmail: string;
    let viewerEmail: string;
    let outsiderEmail: string;
    let addableUserEmail: string;
    let adminAddableUserEmail: string;

    let ownerId: string;
    let secondOwnerId: string;
    let adminId: string;
    let memberId: string;
    let viewerId: string;

    let primaryOrganizationId: string;
    let secondaryOrganizationId: string;

    let primaryOwnerMembershipId: string;
    let secondOwnerMembershipId: string;
    let adminMembershipId: string;
    let memberMembershipId: string;
    let viewerMembershipId: string;

    let secondaryOwnerMembershipId: string;

    let ownerAuth: LoginResult;
    let secondOwnerAuth: LoginResult;
    let adminAuth: LoginResult;
    let memberAuth: LoginResult;
    let viewerAuth: LoginResult;
    let outsiderAuth: LoginResult;

    beforeAll(async () => {
      const passwordHash =
        await bcrypt.hash(
          PASSWORD,
          10,
        );

      ownerEmail =
        `${PREFIX}-owner@example.com`;

      secondOwnerEmail =
        `${PREFIX}-second-owner@example.com`;

      adminEmail =
        `${PREFIX}-admin@example.com`;

      memberEmail =
        `${PREFIX}-member@example.com`;

      viewerEmail =
        `${PREFIX}-viewer@example.com`;

      outsiderEmail =
        `${PREFIX}-outsider@example.com`;

      addableUserEmail =
        `${PREFIX}-addable@example.com`;

      adminAddableUserEmail =
        `${PREFIX}-admin-addable@example.com`;

      const [
        owner,
        secondOwner,
        admin,
        member,
        viewer,
        outsider,
      ] = await Promise.all([
        prisma.user.create({
          data: {
            email: ownerEmail,
            passwordHash,
            name: "Primary Owner",
          },
        }),

        prisma.user.create({
          data: {
            email: secondOwnerEmail,
            passwordHash,
            name: "Second Owner",
          },
        }),

        prisma.user.create({
          data: {
            email: adminEmail,
            passwordHash,
            name: "Organization Admin",
          },
        }),

        prisma.user.create({
          data: {
            email: memberEmail,
            passwordHash,
            name: "Organization Member",
          },
        }),

        prisma.user.create({
          data: {
            email: viewerEmail,
            passwordHash,
            name: "Organization Viewer",
          },
        }),

        prisma.user.create({
          data: {
            email: outsiderEmail,
            passwordHash,
            name: "Organization Outsider",
          },
        }),

        prisma.user.create({
          data: {
            email: addableUserEmail,
            passwordHash,
            name: "Addable User",
          },
        }),

        prisma.user.create({
          data: {
            email:
              adminAddableUserEmail,
            passwordHash,
            name: "Admin Addable User",
          },
        }),
      ]).then((rows) =>
        rows.slice(0, 6),
      );

      ownerId = owner.id;
      secondOwnerId = secondOwner.id;
      adminId = admin.id;
      memberId = member.id;
      viewerId = viewer.id;

      const primaryOrganization =
        await prisma.organization.create({
          data: {
            name:
              `${PREFIX} Primary Organization`,
            slug:
              `${PREFIX}-primary`,
          },
        });

      const secondaryOrganization =
        await prisma.organization.create({
          data: {
            name:
              `${PREFIX} Secondary Organization`,
            slug:
              `${PREFIX}-secondary`,
          },
        });

      primaryOrganizationId =
        primaryOrganization.id;

      secondaryOrganizationId =
        secondaryOrganization.id;

      const memberships =
        await Promise.all([
          prisma.organizationMember.create({
            data: {
              organizationId:
                primaryOrganizationId,
              userId:
                ownerId,
              role: "OWNER",
            },
          }),

          prisma.organizationMember.create({
            data: {
              organizationId:
                primaryOrganizationId,
              userId:
                secondOwnerId,
              role: "OWNER",
            },
          }),

          prisma.organizationMember.create({
            data: {
              organizationId:
                primaryOrganizationId,
              userId:
                adminId,
              role: "ADMIN",
            },
          }),

          prisma.organizationMember.create({
            data: {
              organizationId:
                primaryOrganizationId,
              userId:
                memberId,
              role: "MEMBER",
            },
          }),

          prisma.organizationMember.create({
            data: {
              organizationId:
                primaryOrganizationId,
              userId:
                viewerId,
              role: "VIEWER",
            },
          }),

          prisma.organizationMember.create({
            data: {
              organizationId:
                secondaryOrganizationId,
              userId:
                ownerId,
              role: "OWNER",
            },
          }),
        ]);

      primaryOwnerMembershipId =
        memberships[0].id;

      secondOwnerMembershipId =
        memberships[1].id;

      adminMembershipId =
        memberships[2].id;

      memberMembershipId =
        memberships[3].id;

      viewerMembershipId =
        memberships[4].id;

      secondaryOwnerMembershipId =
        memberships[5].id;

      ownerAuth =
        await login(ownerEmail);

      secondOwnerAuth =
        await login(secondOwnerEmail);

      adminAuth =
        await login(adminEmail);

      memberAuth =
        await login(memberEmail);

      viewerAuth =
        await login(viewerEmail);

      outsiderAuth =
        await login(outsiderEmail);
    });

    afterAll(async () => {
      await prisma.organizationMember.deleteMany({
        where: {
          organization: {
            slug: {
              startsWith: PREFIX,
            },
          },
        },
      });

      await prisma.organization.deleteMany({
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
    });

    it(
      "rejects unauthenticated organization listing",
      async () => {
        await request(app)
          .get("/organizations")
          .expect(401);
      },
    );

    it(
      "lists only organizations the authenticated user belongs to",
      async () => {
        const response =
          await ownerAuth.agent
            .get("/organizations")
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .expect(200);

        expect(
          response.body.organizations,
        ).toHaveLength(2);

        expect(
          response.body.organizations.map(
            (organization: {
              id: string;
            }) => organization.id,
          ),
        ).toEqual(
          expect.arrayContaining([
            primaryOrganizationId,
            secondaryOrganizationId,
          ]),
        );
      },
    );

    it(
      "does not require organization context to list memberships",
      async () => {
        const response =
          await memberAuth.agent
            .get("/organizations")
            .set(
              "Authorization",
              `Bearer ${memberAuth.accessToken}`,
            )
            .expect(200);

        expect(
          response.body.organizations,
        ).toHaveLength(1);

        expect(
          response.body.organizations[0],
        ).toMatchObject({
          id:
            primaryOrganizationId,
          role:
            "MEMBER",
          membershipId:
            memberMembershipId,
        });
      },
    );

    it(
      "rejects unauthenticated organization creation",
      async () => {
        await request(app)
          .post("/organizations")
          .send({
            name: `${PREFIX} Workspace`,
          })
          .expect(401);
      },
    );

    it(
      "creates an organization without requiring organization context",
      async () => {
        const name =
          `${PREFIX} Created Workspace`;

        const response =
          await ownerAuth.agent
            .post("/organizations")
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .send({
              name,
            })
            .expect(201);

        expect(
          response.body.organization,
        ).toMatchObject({
          name,
          role: "OWNER",
        });

        expect(
          response.body.organization.id,
        ).toEqual(expect.any(String));

        expect(
          response.body.organization.slug,
        ).toEqual(expect.any(String));

        expect(
          response.body.organization
            .membershipId,
        ).toEqual(expect.any(String));

        const storedMembership =
          await prisma.organizationMember
            .findUniqueOrThrow({
              where: {
                organizationId_userId: {
                  organizationId:
                    response.body.organization.id,
                  userId: ownerId,
                },
              },
            });

        expect(
          storedMembership.role,
        ).toBe("OWNER");
      },
    );

    it(
      "trims organization names during creation",
      async () => {
        const name =
          `${PREFIX} Trimmed Workspace`;

        const response =
          await ownerAuth.agent
            .post("/organizations")
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .send({
              name: `   ${name}   `,
            })
            .expect(201);

        expect(
          response.body.organization.name,
        ).toBe(name);
      },
    );

    it(
      "rejects an empty organization name during creation",
      async () => {
        await ownerAuth.agent
          .post("/organizations")
          .set(
            "Authorization",
            `Bearer ${ownerAuth.accessToken}`,
          )
          .send({
            name: "   ",
          })
          .expect(400);
      },
    );

    it(
      "rejects organization names longer than 120 characters",
      async () => {
        await ownerAuth.agent
          .post("/organizations")
          .set(
            "Authorization",
            `Bearer ${ownerAuth.accessToken}`,
          )
          .send({
            name: "x".repeat(121),
          })
          .expect(400);
      },
    );

    it(
      "creates unique slugs for organizations with the same name",
      async () => {
        const name =
          `${PREFIX} Duplicate Name`;

        const first =
          await ownerAuth.agent
            .post("/organizations")
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .send({
              name,
            })
            .expect(201);

        const second =
          await ownerAuth.agent
            .post("/organizations")
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .send({
              name,
            })
            .expect(201);

        expect(
          first.body.organization.slug,
        ).not.toBe(
          second.body.organization.slug,
        );
      },
    );

    it(
      "includes a newly created organization in organization listing",
      async () => {
        const name =
          `${PREFIX} Listed Workspace`;

        const created =
          await ownerAuth.agent
            .post("/organizations")
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .send({
              name,
            })
            .expect(201);

        const listing =
          await ownerAuth.agent
            .get("/organizations")
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .expect(200);

        expect(
          listing.body.organizations,
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id:
                created.body.organization.id,
              name,
              role: "OWNER",
              membershipId:
                created.body.organization
                  .membershipId,
            }),
          ]),
        );
      },
    );

    it(
      "rejects current organization access without organization context",
      async () => {
        await ownerAuth.agent
          .get(
            "/organizations/current",
          )
          .set(
            "Authorization",
            `Bearer ${ownerAuth.accessToken}`,
          )
          .expect(400);
      },
    );

    it(
      "rejects current organization access for a non-member",
      async () => {
        await outsiderAuth.agent
          .get(
            "/organizations/current",
          )
          .set(
            "Authorization",
            `Bearer ${outsiderAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .expect(403);
      },
    );

    it(
      "returns the selected organization and current membership role",
      async () => {
        const response =
          await adminAuth.agent
            .get(
              "/organizations/current",
            )
            .set(
              "Authorization",
              `Bearer ${adminAuth.accessToken}`,
            )
            .set(
              "X-Organization-Id",
              primaryOrganizationId,
            )
            .expect(200);

        expect(
          response.body.organization,
        ).toMatchObject({
          id:
            primaryOrganizationId,
          role:
            "ADMIN",
          membershipId:
            adminMembershipId,
        });
      },
    );

    it(
      "OWNER can list organization members",
      async () => {
        const response =
          await ownerAuth.agent
            .get(
              "/organizations/current/members",
            )
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .set(
              "X-Organization-Id",
              primaryOrganizationId,
            )
            .expect(200);

        expect(
          response.body.members,
        ).toHaveLength(5);

        const emails =
          response.body.members.map(
            (membership: {
              user: {
                email: string;
              };
            }) =>
              membership.user.email,
          );

        expect(emails).toEqual(
          expect.arrayContaining([
            ownerEmail,
            secondOwnerEmail,
            adminEmail,
            memberEmail,
            viewerEmail,
          ]),
        );

        expect(
          emails,
        ).not.toContain(
          outsiderEmail,
        );
      },
    );

    it(
      "ADMIN can list organization members",
      async () => {
        await adminAuth.agent
          .get(
            "/organizations/current/members",
          )
          .set(
            "Authorization",
            `Bearer ${adminAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .expect(200);
      },
    );

    it(
      "MEMBER cannot list organization members",
      async () => {
        await memberAuth.agent
          .get(
            "/organizations/current/members",
          )
          .set(
            "Authorization",
            `Bearer ${memberAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .expect(403);
      },
    );

    it(
      "VIEWER cannot list organization members",
      async () => {
        await viewerAuth.agent
          .get(
            "/organizations/current/members",
          )
          .set(
            "Authorization",
            `Bearer ${viewerAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .expect(403);
      },
    );

    it(
      "OWNER can rename the current organization",
      async () => {
        const name =
          `${PREFIX} Renamed Primary`;

        const response =
          await ownerAuth.agent
            .patch(
              "/organizations/current",
            )
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .set(
              "X-Organization-Id",
              primaryOrganizationId,
            )
            .send({
              name,
            })
            .expect(200);

        expect(
          response.body.organization.name,
        ).toBe(name);

        const stored =
          await prisma.organization.findUniqueOrThrow({
            where: {
              id:
                primaryOrganizationId,
            },
          });

        expect(
          stored.name,
        ).toBe(name);
      },
    );

    it(
      "ADMIN cannot rename the organization",
      async () => {
        await adminAuth.agent
          .patch(
            "/organizations/current",
          )
          .set(
            "Authorization",
            `Bearer ${adminAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .send({
            name:
              `${PREFIX} Admin Rename`,
          })
          .expect(403);
      },
    );

    it(
      "rejects an empty organization name",
      async () => {
        await ownerAuth.agent
          .patch(
            "/organizations/current",
          )
          .set(
            "Authorization",
            `Bearer ${ownerAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .send({
            name: "   ",
          })
          .expect(400);
      },
    );

    it(
      "OWNER can add an existing user as a member",
      async () => {
        const response =
          await ownerAuth.agent
            .post(
              "/organizations/current/members",
            )
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .set(
              "X-Organization-Id",
              primaryOrganizationId,
            )
            .send({
              email:
                addableUserEmail,
              role:
                "MEMBER",
            })
            .expect(201);

        expect(
          response.body.member,
        ).toMatchObject({
          role:
            "MEMBER",
          user: {
            email:
              addableUserEmail,
          },
        });
      },
    );

    it(
      "ADMIN can add a MEMBER",
      async () => {
        const response =
          await adminAuth.agent
            .post(
              "/organizations/current/members",
            )
            .set(
              "Authorization",
              `Bearer ${adminAuth.accessToken}`,
            )
            .set(
              "X-Organization-Id",
              primaryOrganizationId,
            )
            .send({
              email:
                adminAddableUserEmail,
              role:
                "MEMBER",
            })
            .expect(201);

        expect(
          response.body.member.role,
        ).toBe("MEMBER");
      },
    );

    it(
      "ADMIN cannot assign OWNER",
      async () => {
        const email =
          `${PREFIX}-admin-owner-target@example.com`;

        const passwordHash =
          await bcrypt.hash(
            PASSWORD,
            10,
          );

        await prisma.user.create({
          data: {
            email,
            passwordHash,
          },
        });

        await adminAuth.agent
          .post(
            "/organizations/current/members",
          )
          .set(
            "Authorization",
            `Bearer ${adminAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .send({
            email,
            role:
              "OWNER",
          })
          .expect(403);
      },
    );

    it(
      "MEMBER cannot add organization members",
      async () => {
        await memberAuth.agent
          .post(
            "/organizations/current/members",
          )
          .set(
            "Authorization",
            `Bearer ${memberAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .send({
            email:
              outsiderEmail,
            role:
              "MEMBER",
          })
          .expect(403);
      },
    );

    it(
      "rejects adding an unknown user",
      async () => {
        await ownerAuth.agent
          .post(
            "/organizations/current/members",
          )
          .set(
            "Authorization",
            `Bearer ${ownerAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .send({
            email:
              `${PREFIX}-missing@example.com`,
            role:
              "MEMBER",
          })
          .expect(404);
      },
    );

    it(
      "rejects adding a duplicate organization member",
      async () => {
        await ownerAuth.agent
          .post(
            "/organizations/current/members",
          )
          .set(
            "Authorization",
            `Bearer ${ownerAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .send({
            email:
              memberEmail,
            role:
              "MEMBER",
          })
          .expect(409);
      },
    );

    it(
      "rejects an invalid organization role",
      async () => {
        const email =
          `${PREFIX}-invalid-role@example.com`;

        const passwordHash =
          await bcrypt.hash(
            PASSWORD,
            10,
          );

        await prisma.user.create({
          data: {
            email,
            passwordHash,
          },
        });

        await ownerAuth.agent
          .post(
            "/organizations/current/members",
          )
          .set(
            "Authorization",
            `Bearer ${ownerAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .send({
            email,
            role:
              "SUPER_ADMIN",
          })
          .expect(400);
      },
    );

    it(
      "OWNER can change a member role",
      async () => {
        const response =
          await ownerAuth.agent
            .patch(
              `/organizations/current/members/${memberMembershipId}`,
            )
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .set(
              "X-Organization-Id",
              primaryOrganizationId,
            )
            .send({
              role:
                "VIEWER",
            })
            .expect(200);

        expect(
          response.body.member.role,
        ).toBe("VIEWER");

        await prisma.organizationMember.update({
          where: {
            id:
              memberMembershipId,
          },
          data: {
            role:
              "MEMBER",
          },
        });
      },
    );

    it(
      "ADMIN can change a non-owner member role",
      async () => {
        const response =
          await adminAuth.agent
            .patch(
              `/organizations/current/members/${viewerMembershipId}`,
            )
            .set(
              "Authorization",
              `Bearer ${adminAuth.accessToken}`,
            )
            .set(
              "X-Organization-Id",
              primaryOrganizationId,
            )
            .send({
              role:
                "MEMBER",
            })
            .expect(200);

        expect(
          response.body.member.role,
        ).toBe("MEMBER");

        await prisma.organizationMember.update({
          where: {
            id:
              viewerMembershipId,
          },
          data: {
            role:
              "VIEWER",
          },
        });
      },
    );

    it(
      "ADMIN cannot modify an OWNER",
      async () => {
        await adminAuth.agent
          .patch(
            `/organizations/current/members/${primaryOwnerMembershipId}`,
          )
          .set(
            "Authorization",
            `Bearer ${adminAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .send({
            role:
              "MEMBER",
          })
          .expect(403);
      },
    );

    it(
      "cross-organization membership IDs are not exposed",
      async () => {
        await ownerAuth.agent
          .patch(
            `/organizations/current/members/${secondaryOwnerMembershipId}`,
          )
          .set(
            "Authorization",
            `Bearer ${ownerAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .send({
            role:
              "MEMBER",
          })
          .expect(404);
      },
    );

    it(
      "OWNER can remove a non-owner member",
      async () => {
        const user =
          await prisma.user.create({
            data: {
              email:
                `${PREFIX}-remove-target@example.com`,
              passwordHash:
                await bcrypt.hash(
                  PASSWORD,
                  10,
                ),
            },
          });

        const membership =
          await prisma.organizationMember.create({
            data: {
              organizationId:
                primaryOrganizationId,
              userId:
                user.id,
              role:
                "MEMBER",
            },
          });

        await ownerAuth.agent
          .delete(
            `/organizations/current/members/${membership.id}`,
          )
          .set(
            "Authorization",
            `Bearer ${ownerAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .expect(204);

        const stored =
          await prisma.organizationMember.findUnique({
            where: {
              id:
                membership.id,
            },
          });

        expect(stored).toBeNull();
      },
    );

    it(
      "ADMIN cannot remove an OWNER",
      async () => {
        await adminAuth.agent
          .delete(
            `/organizations/current/members/${primaryOwnerMembershipId}`,
          )
          .set(
            "Authorization",
            `Bearer ${adminAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .expect(403);
      },
    );

    it(
      "cannot remove a membership from another organization",
      async () => {
        await ownerAuth.agent
          .delete(
            `/organizations/current/members/${secondaryOwnerMembershipId}`,
          )
          .set(
            "Authorization",
            `Bearer ${ownerAuth.accessToken}`,
          )
          .set(
            "X-Organization-Id",
            primaryOrganizationId,
          )
          .expect(404);
      },
    );

    it(
      "final OWNER cannot be demoted",
      async () => {
        await prisma.organizationMember.update({
          where: {
            id:
              secondOwnerMembershipId,
          },
          data: {
            role:
              "ADMIN",
          },
        });

        try {
          await ownerAuth.agent
            .patch(
              `/organizations/current/members/${primaryOwnerMembershipId}`,
            )
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .set(
              "X-Organization-Id",
              primaryOrganizationId,
            )
            .send({
              role:
                "ADMIN",
            })
            .expect(409);
        } finally {
          await prisma.organizationMember.update({
            where: {
              id:
                secondOwnerMembershipId,
            },
            data: {
              role:
                "OWNER",
            },
          });
        }
      },
    );

    it(
      "final OWNER cannot be removed",
      async () => {
        await prisma.organizationMember.update({
          where: {
            id:
              secondOwnerMembershipId,
          },
          data: {
            role:
              "ADMIN",
          },
        });

        try {
          await ownerAuth.agent
            .delete(
              `/organizations/current/members/${primaryOwnerMembershipId}`,
            )
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .set(
              "X-Organization-Id",
              primaryOrganizationId,
            )
            .expect(409);
        } finally {
          await prisma.organizationMember.update({
            where: {
              id:
                secondOwnerMembershipId,
            },
            data: {
              role:
                "OWNER",
            },
          });
        }
      },
    );

    it(
      "an OWNER can demote another OWNER when another owner remains",
      async () => {
        const response =
          await ownerAuth.agent
            .patch(
              `/organizations/current/members/${secondOwnerMembershipId}`,
            )
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .set(
              "X-Organization-Id",
              primaryOrganizationId,
            )
            .send({
              role:
                "ADMIN",
            })
            .expect(200);

        expect(
          response.body.member.role,
        ).toBe("ADMIN");

        await prisma.organizationMember.update({
          where: {
            id:
              secondOwnerMembershipId,
          },
          data: {
            role:
              "OWNER",
          },
        });
      },
    );

    it(
      "organization member list never exposes another organization's membership",
      async () => {
        const response =
          await ownerAuth.agent
            .get(
              "/organizations/current/members",
            )
            .set(
              "Authorization",
              `Bearer ${ownerAuth.accessToken}`,
            )
            .set(
              "X-Organization-Id",
              primaryOrganizationId,
            )
            .expect(200);

        const membershipIds =
          response.body.members.map(
            (membership: {
              id: string;
            }) =>
              membership.id,
          );

        expect(
          membershipIds,
        ).not.toContain(
          secondaryOwnerMembershipId,
        );
      },
    );
  },
);