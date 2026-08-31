import crypto from "crypto";

import {
  Prisma,
  type OrganizationRole,
} from "@prisma/client";

import {
  organizationInvitationRepository,
} from "../../repositories/organization-invitation.repository";

import {
  organizationRepository,
} from "../../repositories/organization.repository";

import {
  userRepository,
} from "../../repositories/auth/user.repository";

import {
  emailService,
} from "../email/email.service";

const INVITATION_EXPIRATION_HOURS = 72;

const ASSIGNABLE_ROLES =
  new Set<OrganizationRole>([
    "OWNER",
    "ADMIN",
    "MEMBER",
    "VIEWER",
  ]);

export class OrganizationInvitationError
  extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "OrganizationInvitationError";
  }
}

function normalizeEmail(
  email: string,
): string {
  return email.trim().toLowerCase();
}

function assertValidRole(
  role: string,
): asserts role is OrganizationRole {
  if (
    !ASSIGNABLE_ROLES.has(
      role as OrganizationRole,
    )
  ) {
    throw new OrganizationInvitationError(
      400,
      "Invalid organization role",
    );
  }
}

function assertActorCanAssignRole(
  actorRole: OrganizationRole,
  targetRole: OrganizationRole,
) {
  if (
    targetRole === "OWNER" &&
    actorRole !== "OWNER"
  ) {
    throw new OrganizationInvitationError(
      403,
      "Only an organization owner can assign the OWNER role",
    );
  }
}

export class OrganizationInvitationService {
  generateToken(): string {
    return crypto
      .randomBytes(32)
      .toString("hex");
  }

  hashToken(
    token: string,
  ): string {
    return crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  }

  async createInvitation(
    organizationId: string,
    invitedByUserId: string,
    actorRole: OrganizationRole,
    email: string,
    requestedRole: string,
  ) {
    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedEmail) {
      throw new OrganizationInvitationError(
        400,
        "Invitation email is required",
      );
    }

    assertValidRole(requestedRole);

    assertActorCanAssignRole(
      actorRole,
      requestedRole,
    );

    const existingUser =
      await userRepository.findByEmail(
        normalizedEmail,
      );

    if (existingUser) {
      const membership =
        await organizationRepository.findMembership(
          existingUser.id,
          organizationId,
        );

      if (membership) {
        throw new OrganizationInvitationError(
          409,
          "User is already a member of this organization",
        );
      }
    }

    const existingInvitation =
      await organizationInvitationRepository
        .findPendingForOrganizationAndEmail(
          organizationId,
          normalizedEmail,
        );

    if (existingInvitation) {
      throw new OrganizationInvitationError(
        409,
        "An active invitation already exists for this email",
      );
    }

    const organization =
      await organizationRepository.findOrganizationById(
        organizationId,
      );

    if (!organization) {
      throw new OrganizationInvitationError(
        404,
        "Organization not found",
      );
    }

    const token =
      this.generateToken();

    let invitation;

    try {
      invitation =
        await organizationInvitationRepository.create({
          organizationId,
          email: normalizedEmail,
          role: requestedRole,
          tokenHash:
            this.hashToken(token),
          invitedByUserId,
          expiresAt: new Date(
            Date.now() +
              INVITATION_EXPIRATION_HOURS *
                60 *
                60 *
                1000,
          ),
        });
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new OrganizationInvitationError(
          409,
          "An active invitation already exists for this email",
        );
      }

      throw error;
    }

    try {
      await emailService.sendOrganizationInvitationEmail({
        email: normalizedEmail,
        token,
        organizationName:
          organization.name,
      });
    } catch (error) {
      await organizationInvitationRepository.revokeById(
        invitation.id,
      );

      throw error;
    }

    return invitation;
  }

  async listInvitations(
    organizationId: string,
  ) {
    return organizationInvitationRepository
      .listForOrganization(
        organizationId,
      );
  }

  async revokeInvitation(
    organizationId: string,
    invitationId: string,
  ) {
    const invitation =
      await organizationInvitationRepository.revoke(
        organizationId,
        invitationId,
      );

    if (!invitation) {
      throw new OrganizationInvitationError(
        404,
        "Organization invitation not found",
      );
    }

    if (invitation.acceptedAt) {
      throw new OrganizationInvitationError(
        409,
        "Accepted invitations cannot be revoked",
      );
    }

    return invitation;
  }

  async getInvitation(
    token: string,
  ) {
    if (!token.trim()) {
      throw new OrganizationInvitationError(
        400,
        "Invitation token is required",
      );
    }

    const invitation =
      await organizationInvitationRepository.findByTokenHash(
        this.hashToken(token),
      );

    if (
      !invitation ||
      invitation.revokedAt
    ) {
      throw new OrganizationInvitationError(
        404,
        "Organization invitation not found",
      );
    }

    if (invitation.acceptedAt) {
      throw new OrganizationInvitationError(
        409,
        "Organization invitation has already been accepted",
      );
    }

    if (
      invitation.expiresAt <
      new Date()
    ) {
      throw new OrganizationInvitationError(
        410,
        "Organization invitation has expired",
      );
    }

    return invitation;
  }

  async acceptInvitation(
    token: string,
    userId: string,
  ) {
    if (!token.trim()) {
      throw new OrganizationInvitationError(
        400,
        "Invitation token is required",
      );
    }

    const user =
      await userRepository.findById(
        userId,
      );

    if (!user) {
      throw new OrganizationInvitationError(
        401,
        "Authenticated user was not found",
      );
    }

    const normalizedUserEmail =
      normalizeEmail(user.email);

    const result =
      await organizationInvitationRepository
        .acceptInvitation(
          this.hashToken(token),
          user.id,
          normalizedUserEmail,
        );

    switch (result) {
      case "ACCEPTED":
        return {
          message:
            "Organization invitation accepted successfully.",
        };

      case "ALREADY_ACCEPTED":
        throw new OrganizationInvitationError(
          409,
          "Organization invitation has already been accepted",
        );

      case "EXPIRED":
        throw new OrganizationInvitationError(
          410,
          "Organization invitation has expired",
        );

      case "REVOKED":
      case "INVALID":
        throw new OrganizationInvitationError(
          404,
          "Organization invitation not found",
        );

      case "EMAIL_MISMATCH":
        throw new OrganizationInvitationError(
          403,
          "Organization invitation does not belong to the authenticated user",
        );

      case "ALREADY_MEMBER":
        throw new OrganizationInvitationError(
          409,
          "User is already a member of this organization",
        );
    }
  }

  async cleanupExpiredInvitations():
    Promise<number> {
    return organizationInvitationRepository
      .deleteExpired();
  }
}

export const organizationInvitationService =
  new OrganizationInvitationService();
