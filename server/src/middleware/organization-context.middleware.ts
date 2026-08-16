import type {
  Response,
  NextFunction,
} from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import {
  organizationRepository,
} from "../repositories/organization.repository";

const ORGANIZATION_HEADER = "x-organization-id";

export async function requireOrganizationContext(
  req: OrganizationAuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  const organizationId =
    req.get(ORGANIZATION_HEADER)?.trim();

  if (!organizationId) {
    res.status(400).json({
      message: "Organization context is required",
    });
    return;
  }

  try {
    const membership =
      await organizationRepository.findMembership(
        req.user.userId,
        organizationId,
      );

    if (!membership) {
      res.status(403).json({
        message:
          "You do not have access to this organization",
      });
      return;
    }

    req.organization = {
      id: membership.organization.id,
      membershipId: membership.id,
      role: membership.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}