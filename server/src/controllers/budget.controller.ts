import type { Response } from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import { prisma } from "../config/prisma";

import {
  budgetService,
  BudgetValidationError,
} from "../services/budget.service";

function requireOrganizationId(
  req: OrganizationAuthenticatedRequest,
  res: Response,
): string | null {
  const organizationId =
    req.organization?.id;

  if (!organizationId) {
    res.status(400).json({
      message:
        "Organization context is required",
    });

    return null;
  }

  return organizationId;
}

export async function getBudgetSummary(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    requireOrganizationId(req, res);

  if (!organizationId) {
    return;
  }

  try {
    const now = new Date();

    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const budget =
      await budgetService.getCurrentMonthlyBudget(
        organizationId,
        now,
      );

    const spendResult =
      await prisma.costSnapshot.aggregate({
        _sum: {
          totalCost: true,
        },
        where: {
          snapshotDate: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
          account: {
            organizationId,
          },
        },
      });

    const spent =
      spendResult._sum.totalCost ?? 0;

    const budgetAmount =
      budget?.amount ?? 0;

    const remaining =
      budgetAmount - spent;

    const usagePercent =
      budgetAmount > 0
        ? (spent / budgetAmount) * 100
        : 0;

    let status = "healthy";

    if (usagePercent >= 100) {
      status = "exceeded";
    } else if (usagePercent >= 85) {
      status = "critical";
    } else if (usagePercent >= 70) {
      status = "warning";
    }

    return res.status(200).json({
      budget: Number(
        budgetAmount.toFixed(2),
      ),
      spent: Number(
        spent.toFixed(2),
      ),
      remaining: Number(
        remaining.toFixed(2),
      ),
      usagePercent: Number(
        usagePercent.toFixed(2),
      ),
      status,
    });
  } catch (error) {
    console.error(
      "Budget summary error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to load budget summary",
    });
  }
}

export async function setBudget(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    requireOrganizationId(req, res);

  if (!organizationId) {
    return;
  }

  try {
    const {
      name,
      amount,
      month,
      year,
    } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof amount !== "number" ||
      typeof month !== "number" ||
      typeof year !== "number"
    ) {
      return res.status(400).json({
        message:
          "name, amount, month, and year are required",
      });
    }

    const budget =
      await budgetService.setMonthlyBudget({
        organizationId,
        name,
        amount,
        month,
        year,
      });

    return res.status(200).json({
      budget,
    });
  } catch (error) {
    if (
      error instanceof BudgetValidationError
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(
      "Set budget error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to save budget",
    });
  }
}