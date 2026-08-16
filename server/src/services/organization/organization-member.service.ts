import type {
  OrganizationRole,
} from "@prisma/client";

import {
  organizationRepository,
} from "../../repositories/organization.repository";

const ASSIGNABLE_ROLES =
  new Set<OrganizationRole>([
    "OWNER",
    "ADMIN",
    "MEMBER",
    "VIEWER",
  ]);

export class OrganizationMemberError
  extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

function assertValidRole(
  role: string,
): asserts role is OrganizationRole {
  if (
    !ASSIGNABLE_ROLES.has(
      role as OrganizationRole,
    )
  ) {
    throw new OrganizationMemberError(
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
    throw new OrganizationMemberError(
      403,
      "Only an organization owner can assign the OWNER role",
    );
  }
}

function assertActorCanModifyMember(
  actorRole: OrganizationRole,
  targetRole: OrganizationRole,
) {
  if (
    actorRole === "ADMIN" &&
    targetRole === "OWNER"
  ) {
    throw new OrganizationMemberError(
      403,
      "Administrators cannot modify organization owners",
    );
  }
}

export async function addOrganizationMember(
  organizationId: string,
  actorRole: OrganizationRole,
  email: string,
  requestedRole: string,
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new OrganizationMemberError(
      400,
      "Member email is required",
    );
  }

  assertValidRole(requestedRole);

  assertActorCanAssignRole(
    actorRole,
    requestedRole,
  );

  const user =
    await organizationRepository.findUserByEmail(
      normalizedEmail,
    );

  if (!user) {
    throw new OrganizationMemberError(
      404,
      "User not found",
    );
  }

  const existingMembership =
    await organizationRepository.findMembership(
      user.id,
      organizationId,
    );

  if (existingMembership) {
    throw new OrganizationMemberError(
      409,
      "User is already a member of this organization",
    );
  }

  return organizationRepository.createMembership(
    organizationId,
    user.id,
    requestedRole,
  );
}

export async function changeOrganizationMemberRole(
  organizationId: string,
  membershipId: string,
  actorRole: OrganizationRole,
  requestedRole: string,
) {
  assertValidRole(requestedRole);

  const membership =
    await organizationRepository.findMembershipByIdForOrganization(
      organizationId,
      membershipId,
    );

  if (!membership) {
    throw new OrganizationMemberError(
      404,
      "Organization member not found",
    );
  }

  assertActorCanModifyMember(
    actorRole,
    membership.role,
  );

  assertActorCanAssignRole(
    actorRole,
    requestedRole,
  );

  if (
    membership.role === "OWNER" &&
    requestedRole !== "OWNER"
  ) {
    const ownerCount =
      await organizationRepository.countOwners(
        organizationId,
      );

    if (ownerCount <= 1) {
      throw new OrganizationMemberError(
        409,
        "The final organization owner cannot be demoted",
      );
    }
  }

  return organizationRepository.updateMembershipRole(
    organizationId,
    membershipId,
    requestedRole,
  );
}

export async function removeOrganizationMember(
  organizationId: string,
  membershipId: string,
  actorRole: OrganizationRole,
) {
  const membership =
    await organizationRepository.findMembershipByIdForOrganization(
      organizationId,
      membershipId,
    );

  if (!membership) {
    throw new OrganizationMemberError(
      404,
      "Organization member not found",
    );
  }

  assertActorCanModifyMember(
    actorRole,
    membership.role,
  );

  if (membership.role === "OWNER") {
    const ownerCount =
      await organizationRepository.countOwners(
        organizationId,
      );

    if (ownerCount <= 1) {
      throw new OrganizationMemberError(
        409,
        "The final organization owner cannot be removed",
      );
    }
  }

  await organizationRepository.deleteMembership(
    organizationId,
    membershipId,
  );
}
