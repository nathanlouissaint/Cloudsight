import { prisma } from "../../config/prisma";

function buildDefaultOrganizationName(email: string): string {
  const localPart = email.split("@")[0]?.trim();

  if (!localPart) {
    return "My Organization";
  }

  return `${localPart}'s Organization`;
}

function buildOrganizationSlug(userId: string): string {
  return `org-${userId}`;
}

export class OrganizationBootstrapService {
  async ensureDefaultOrganizationForUser(userId: string) {
    const existingMembership =
      await prisma.organizationMember.findFirst({
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

    if (existingMembership) {
      return existingMembership.organization;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    return prisma.$transaction(async (tx) => {
      const organization =
        await tx.organization.create({
          data: {
            name: buildDefaultOrganizationName(user.email),
            slug: buildOrganizationSlug(user.id),
          },
        });

      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      return organization;
    });
  }
}

export const organizationBootstrapService =
  new OrganizationBootstrapService();