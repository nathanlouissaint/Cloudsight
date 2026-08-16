import type {
  OrganizationRole,
} from "@prisma/client";

import { prisma } from "../config/prisma";

export class OrganizationRepository {
  async findMembership(
    userId: string,
    organizationId: string,
  ) {
    return prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      include: {
        organization: true,
      },
    });
  }

  async findOrganizationsForUser(
    userId: string,
  ) {
    return prisma.organizationMember.findMany({
      where: {
        userId,
      },
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findOrganizationById(
    organizationId: string,
  ) {
    return prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });
  }

  async findMembersForOrganization(
    organizationId: string,
  ) {
    return prisma.organizationMember.findMany({
      where: {
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findMembershipByIdForOrganization(
    organizationId: string,
    membershipId: string,
  ) {
    return prisma.organizationMember.findFirst({
      where: {
        id: membershipId,
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findUserByEmail(
    email: string,
  ) {
    return prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      },
    });
  }

  async createMembership(
    organizationId: string,
    userId: string,
    role: OrganizationRole,
  ) {
    return prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async updateMembershipRole(
    organizationId: string,
    membershipId: string,
    role: OrganizationRole,
  ) {
    return prisma.organizationMember.update({
      where: {
        id: membershipId,
        organizationId,
      },
      data: {
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async deleteMembership(
    organizationId: string,
    membershipId: string,
  ) {
    return prisma.organizationMember.delete({
      where: {
        id: membershipId,
        organizationId,
      },
    });
  }

  async countOwners(
    organizationId: string,
  ) {
    return prisma.organizationMember.count({
      where: {
        organizationId,
        role: "OWNER",
      },
    });
  }

  async updateOrganizationName(
    organizationId: string,
    name: string,
  ) {
    return prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        name,
      },
    });
  }
}

export const organizationRepository =
  new OrganizationRepository();
