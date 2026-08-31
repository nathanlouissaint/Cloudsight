import type {
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../../types/auth/request.types";

import type {
  OrganizationAuthenticatedRequest,
} from "../../types/organization/request.types";

import {
  organizationInvitationService,
  OrganizationInvitationError,
} from "../../services/organization/organization-invitation.service";

function handleInvitationError(
  error: unknown,
  res: Response,
  fallbackMessage: string,
) {
  if (
    error instanceof
    OrganizationInvitationError
  ) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  console.error(
    fallbackMessage,
    error,
  );

  res.status(500).json({
    message: fallbackMessage,
  });
}

export async function createOrganizationInvitation(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    if (!req.organization) {
      res.status(400).json({
        message:
          "Organization context is required",
      });
      return;
    }

    const email =
      typeof req.body?.email === "string"
        ? req.body.email
        : "";

    const role =
      typeof req.body?.role === "string"
        ? req.body.role
        : "MEMBER";

    const invitation =
      await organizationInvitationService
        .createInvitation(
          req.organization.id,
          req.user.userId,
          req.organization.role,
          email,
          role,
        );

    res.status(201).json({
      invitation: {
        id: invitation.id,
        organizationId:
          invitation.organizationId,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      },
    });
  } catch (error) {
    handleInvitationError(
      error,
      res,
      "Failed to create organization invitation",
    );
  }
}

export async function getOrganizationInvitations(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.organization) {
      res.status(400).json({
        message:
          "Organization context is required",
      });
      return;
    }

    const invitations =
      await organizationInvitationService
        .listInvitations(
          req.organization.id,
        );

    res.status(200).json({
      invitations,
    });
  } catch (error) {
    handleInvitationError(
      error,
      res,
      "Failed to load organization invitations",
    );
  }
}

export async function deleteOrganizationInvitation(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.organization) {
      res.status(400).json({
        message:
          "Organization context is required",
      });
      return;
    }

    await organizationInvitationService
      .revokeInvitation(
        req.organization.id,
        String(req.params.invitationId),
      );

    res.status(204).send();
  } catch (error) {
    handleInvitationError(
      error,
      res,
      "Failed to revoke organization invitation",
    );
  }
}

export async function getOrganizationInvitation(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const invitation =
      await organizationInvitationService
        .getInvitation(
          String(req.params.token ?? ""),
        );

    res.status(200).json({
      invitation: {
        organization: {
          id: invitation.organization.id,
          name: invitation.organization.name,
          slug: invitation.organization.slug,
        },
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    handleInvitationError(
      error,
      res,
      "Failed to load organization invitation",
    );
  }
}

export async function acceptOrganizationInvitation(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const result =
      await organizationInvitationService
        .acceptInvitation(
          String(req.params.token ?? ""),
          req.user.userId,
        );

    res.status(200).json(result);
  } catch (error) {
    handleInvitationError(
      error,
      res,
      "Failed to accept organization invitation",
    );
  }
}
