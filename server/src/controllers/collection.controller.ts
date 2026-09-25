import type {
  Response,
} from "express";

import {
  collectCosts,
} from "../aws/services/collector.service";

import {
  prisma,
} from "../config/prisma";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

async function getOrganizationIdForUser(
  userId: string,
) {
  const membership =
    await prisma.organizationMember.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        organizationId: true,
      },
    });

  return membership?.organizationId ?? null;
}

export async function collectCostsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const organizationId =
      await getOrganizationIdForUser(userId);

    if (!organizationId) {
      return res.status(403).json({
        message:
          "No organization is associated with this account.",
      });
    }

    const acceptsMockConnection =
      process.env.NODE_ENV !== "production" &&
      process.env.SPEND_GUARD_MOCK_AWS === "true";

    const cloudAccount =
      await prisma.cloudAccount.findFirst({
        where: {
          organizationId,
          isActive: true,
          roleArn: {
            not: null,
          },
          connectionStatus: {
            in: acceptsMockConnection
              ? ["VERIFIED", "MOCK_VERIFIED"]
              : ["VERIFIED"],
          },
        },
        orderBy: {
          lastVerifiedAt: "desc",
        },
      });

    if (!cloudAccount) {
      return res.status(409).json({
        message:
          "No active verified AWS connection is configured for this organization.",
      });
    }

    const result =
      await collectCosts(cloudAccount);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    console.error(error);

    return res.status(502).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Collection failed",
    });
  }
}
