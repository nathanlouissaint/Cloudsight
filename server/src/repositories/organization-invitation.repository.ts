import type {
  OrganizationInvitation,
  OrganizationRole,
} from "@prisma/client";

import { prisma } from "../config/prisma";

export interface CreateOrganizationInvitationInput {
  organizationId: string;
  email: string;
  role: OrganizationRole;
  tokenHash: string;
  invitedByUserId: string;
  expiresAt: Date;
}

export type InvitationAcceptanceResult =
  | "ACCEPTED"
  | "ALREADY_ACCEPTED"
  | "INVALID"
  | "EXPIRED"
  | "REVOKED"
  | "EMAIL_MISMATCH"
  | "ALREADY_MEMBER";

export class OrganizationInvitationRepository {
  async create(
    input: CreateOrganizationInvitationInput,
    now = new Date(),
  ): Promise<OrganizationInvitation> {
    return prisma.$transaction(async (tx) => {
      await tx.organizationInvitation.updateMany({
        where: {
          organizationId: input.organizationId,
          email: input.email,
          acceptedAt: null,
          revokedAt: null,
          expiresAt: {
            lt: now,
          },
        },
        data: {
          revokedAt: now,
        },
      });

      return tx.organizationInvitation.create({
        data: input,
      });
    });
  }

  async findByTokenHash(
    tokenHash: string,
  ) {
    return prisma.organizationInvitation.findUnique({
      where: {
        tokenHash,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        invitedByUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findPendingForOrganizationAndEmail(
    organizationId: string,
    email: string,
    now = new Date(),
  ) {
    return prisma.organizationInvitation.findFirst({
      where: {
        organizationId,
        email,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: {
          gte: now,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async listForOrganization(
    organizationId: string,
  ) {
    return prisma.organizationInvitation.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        organizationId: true,
        email: true,
        role: true,
        invitedByUserId: true,
        expiresAt: true,
        acceptedAt: true,
        revokedAt: true,
        createdAt: true,
        updatedAt: true,
        invitedByUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async revoke(
    organizationId: string,
    invitationId: string,
    now = new Date(),
  ): Promise<OrganizationInvitation | null> {
    const invitation =
      await prisma.organizationInvitation.findFirst({
        where: {
          id: invitationId,
          organizationId,
        },
      });

    if (!invitation) {
      return null;
    }

    if (
      invitation.acceptedAt ||
      invitation.revokedAt
    ) {
      return invitation;
    }

    return prisma.organizationInvitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        revokedAt: now,
      },
    });
  }

  async acceptInvitation(
    tokenHash: string,
    userId: string,
    normalizedUserEmail: string,
    now = new Date(),
  ): Promise<InvitationAcceptanceResult> {
    return prisma.$transaction(async (tx) => {
      const invitation =
        await tx.organizationInvitation.findUnique({
          where: {
            tokenHash,
          },
        });

      if (!invitation) {
        return "INVALID";
      }

      if (invitation.acceptedAt) {
        return "ALREADY_ACCEPTED";
      }

      if (invitation.revokedAt) {
        return "REVOKED";
      }

      if (invitation.expiresAt < now) {
        return "EXPIRED";
      }

      if (
        invitation.email !== normalizedUserEmail
      ) {
        return "EMAIL_MISMATCH";
      }

      const existingMembership =
        await tx.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId:
                invitation.organizationId,
              userId,
            },
          },
        });

      if (existingMembership) {
        return "ALREADY_MEMBER";
      }

      const claim =
        await tx.organizationInvitation.updateMany({
          where: {
            id: invitation.id,
            acceptedAt: null,
            revokedAt: null,
            expiresAt: {
              gte: now,
            },
          },
          data: {
            acceptedAt: now,
          },
        });

      if (claim.count !== 1) {
        const current =
          await tx.organizationInvitation.findUnique({
            where: {
              id: invitation.id,
            },
          });

        if (current?.acceptedAt) {
          return "ALREADY_ACCEPTED";
        }

        if (current?.revokedAt) {
          return "REVOKED";
        }

        if (
          current &&
          current.expiresAt < now
        ) {
          return "EXPIRED";
        }

        return "INVALID";
      }

      await tx.organizationMember.create({
        data: {
          organizationId:
            invitation.organizationId,
          userId,
          role: invitation.role,
        },
      });

      return "ACCEPTED";
    });
  }

  async revokeById(
    invitationId: string,
    now = new Date(),
  ): Promise<void> {
    await prisma.organizationInvitation.updateMany({
      where: {
        id: invitationId,
        acceptedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });
  }

  async deleteExpired(
    now = new Date(),
  ): Promise<number> {
    const result =
      await prisma.organizationInvitation.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
          acceptedAt: null,
          revokedAt: null,
        },
      });

    return result.count;
  }
}

export const organizationInvitationRepository =
  new OrganizationInvitationRepository();
