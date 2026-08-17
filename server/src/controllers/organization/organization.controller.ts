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
  organizationRepository,
} from "../../repositories/organization.repository";

import {
  createOrganization,
  OrganizationError,
} from "../../services/organization/organization.service";

import {
  addOrganizationMember,
  changeOrganizationMemberRole,
  removeOrganizationMember,
  OrganizationMemberError,
} from "../../services/organization/organization-member.service";


function handleOrganizationMemberError(
  error: unknown,
  res: Response,
  fallbackMessage: string,
) {
  if (
    error instanceof
    OrganizationMemberError
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


export async function getOrganizations(
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

    const memberships =
      await organizationRepository.findOrganizationsForUser(
        req.user.userId,
      );

    res.status(200).json({
      organizations:
        memberships.map(
          (membership) => ({
            id:
              membership.organization.id,

            name:
              membership.organization.name,

            slug:
              membership.organization.slug,

            role:
              membership.role,

            membershipId:
              membership.id,
          }),
        ),
    });
  } catch (error) {
    console.error(
      "Failed to load organizations:",
      error,
    );

    res.status(500).json({
      message:
        "Failed to load organizations",
    });
  }
}


export async function createNewOrganization(
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
      await createOrganization(
        req.user.userId,
        req.body?.name,
      );

    res.status(201).json({
      organization: {
        id:
          result.organization.id,

        name:
          result.organization.name,

        slug:
          result.organization.slug,

        role:
          result.membership.role,

        membershipId:
          result.membership.id,
      },
    });
  } catch (error) {
    if (
      error instanceof
      OrganizationError
    ) {
      res.status(error.statusCode).json({
        message: error.message,
      });
      return;
    }

    console.error(
      "Failed to create organization:",
      error,
    );

    res.status(500).json({
      message:
        "Failed to create organization",
    });
  }
}


export async function getCurrentOrganization(
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

    const organization =
      await organizationRepository.findOrganizationById(
        req.organization.id,
      );

    if (!organization) {
      res.status(404).json({
        message:
          "Organization not found",
      });
      return;
    }

    res.status(200).json({
      organization: {
        ...organization,

        role:
          req.organization.role,

        membershipId:
          req.organization.membershipId,
      },
    });
  } catch (error) {
    console.error(
      "Failed to load organization:",
      error,
    );

    res.status(500).json({
      message:
        "Failed to load organization",
    });
  }
}


export async function getOrganizationMembers(
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

    const members =
      await organizationRepository.findMembersForOrganization(
        req.organization.id,
      );

    res.status(200).json({
      members:
        members.map(
          (membership) => ({
            id:
              membership.id,

            role:
              membership.role,

            createdAt:
              membership.createdAt,

            user:
              membership.user,
          }),
        ),
    });
  } catch (error) {
    console.error(
      "Failed to load organization members:",
      error,
    );

    res.status(500).json({
      message:
        "Failed to load organization members",
    });
  }
}


export async function updateCurrentOrganization(
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

    const name =
      typeof req.body?.name === "string"
        ? req.body.name.trim()
        : "";

    if (!name) {
      res.status(400).json({
        message:
          "Organization name is required",
      });
      return;
    }

    if (name.length > 120) {
      res.status(400).json({
        message:
          "Organization name must be 120 characters or fewer",
      });
      return;
    }

    const organization =
      await organizationRepository.updateOrganizationName(
        req.organization.id,
        name,
      );

    res.status(200).json({
      organization,
    });
  } catch (error) {
    console.error(
      "Failed to update organization:",
      error,
    );

    res.status(500).json({
      message:
        "Failed to update organization",
    });
  }
}


export async function createOrganizationMember(
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

    const email =
      typeof req.body?.email === "string"
        ? req.body.email
        : "";

    const role =
      typeof req.body?.role === "string"
        ? req.body.role
        : "MEMBER";

    const membership =
      await addOrganizationMember(
        req.organization.id,
        req.organization.role,
        email,
        role,
      );

    res.status(201).json({
      member: membership,
    });
  } catch (error) {
    handleOrganizationMemberError(
      error,
      res,
      "Failed to add organization member",
    );
  }
}


export async function updateOrganizationMemberRole(
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

    const membershipId =
      String(req.params.membershipId);

    const role =
      typeof req.body?.role === "string"
        ? req.body.role
        : "";

    const membership =
      await changeOrganizationMemberRole(
        req.organization.id,
        membershipId,
        req.organization.role,
        role,
      );

    res.status(200).json({
      member: membership,
    });
  } catch (error) {
    handleOrganizationMemberError(
      error,
      res,
      "Failed to update organization member",
    );
  }
}


export async function deleteOrganizationMember(
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

    const membershipId =
      String(req.params.membershipId);

    await removeOrganizationMember(
      req.organization.id,
      membershipId,
      req.organization.role,
    );

    res.status(204).send();
  } catch (error) {
    handleOrganizationMemberError(
      error,
      res,
      "Failed to remove organization member",
    );
  }
}