import type {
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  prisma,
} from "../config/prisma";
import { invalidateOrganizationAnalyticsCache } from "../services/organization-cache.service";
import { logger } from "../config/logger";

async function getOrganizationIdForUser(
  userId: string,
): Promise<string | null> {
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

function getCurrentMonth() {
  const now = new Date();

  return {
    month:
      now.getMonth() + 1,

    year:
      now.getFullYear(),
  };
}

export async function setBudget(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId =
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const organizationId =
      await getOrganizationIdForUser(
        userId,
      );

    if (!organizationId) {
      return res.status(403).json({
        message:
          "No organization is associated with this account.",
      });
    }

    const numericAmount =
      Number(req.body.amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        message:
          "Budget amount must be greater than zero.",
      });
    }

    const {
      month,
      year,
    } = getCurrentMonth();

    const budget =
      await prisma.budget.upsert({
        where: {
          organizationId_year_month: {
            organizationId,
            year,
            month,
          },
        },

        update: {
          amount:
            numericAmount,

          name:
            "Spend Guard Monthly Budget",

          updatedAt:
            new Date(),
        },

        create: {
          organizationId,

          name:
            "Spend Guard Monthly Budget",

          amount:
            numericAmount,

          month,
          year,

          updatedAt:
            new Date(),
        },
      });

    void invalidateOrganizationAnalyticsCache(
      organizationId,
    );

    return res.status(200).json({
      budget: {
        id:
          budget.id,

        organizationId:
          budget.organizationId,

        name:
          budget.name,

        amount:
          budget.amount,

        month:
          budget.month,

        year:
          budget.year,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Set budget error");

    return res.status(500).json({
      message:
        "Failed to save budget.",
    });
  }
}

export async function getBudgetSummary(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId =
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const organizationId =
      await getOrganizationIdForUser(
        userId,
      );

    if (!organizationId) {
      return res.status(403).json({
        message:
          "No organization is associated with this account.",
      });
    }

    const {
      month,
      year,
    } = getCurrentMonth();

    const budget =
      await prisma.budget.findUnique({
        where: {
          organizationId_year_month: {
            organizationId,
            year,
            month,
          },
        },
      });

    const budgetAmount =
      budget?.amount ?? 0;

    return res.status(200).json({
      organizationId,

      budget:
        Number(
          budgetAmount.toFixed(2),
        ),

      month,
      year,

      configured:
        Boolean(budget),
    });
  } catch (error) {
    logger.error({ err: error }, "Budget summary error");

    return res.status(500).json({
      message:
        "Failed to load budget summary.",
    });
  }
}
