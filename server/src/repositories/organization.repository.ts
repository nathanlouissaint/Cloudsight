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

  async findOrganizationsForUser(userId: string) {
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
}

export const organizationRepository =
  new OrganizationRepository();