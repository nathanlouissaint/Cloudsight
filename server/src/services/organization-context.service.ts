import { prisma } from "../config/prisma";

/**
 * Resolves the organization used by the current single-organization request
 * flow. Keeping this lookup in one place prevents global data queries while
 * the API has not yet introduced an explicit organization selector.
 */
export async function getOrganizationIdForUser(
  userId: string,
): Promise<string | null> {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { organizationId: true },
  });

  return membership?.organizationId ?? null;
}
