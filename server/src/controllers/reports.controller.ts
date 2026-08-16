import type {
  Response,
} from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import {
  prisma,
} from "../config/prisma";

import {
  budgetService,
} from "../services/budget.service";

import {
  createReportNote,
  deleteReportNote,
  generateReportCsv,
  getReportNotes,
  updateReportNote,
} from "../services/reports/report.service";

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

export async function getExecutiveReport(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    requireOrganizationId(
      req,
      res,
    );

  if (!organizationId) {
    return;
  }

  try {
    const now = new Date();

    const currentMonthStart =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );

    const spendResult =
      await prisma.costSnapshot.aggregate({
        _sum: {
          totalCost: true,
        },
        where: {
          snapshotDate: {
            gte: currentMonthStart,
            lte: now,
          },
          account: {
            organizationId,
          },
        },
      });

    const totalSpend =
      spendResult
        ._sum
        .totalCost ?? 0;

    const elapsedDays =
      Math.max(
        now.getDate(),
        1,
      );

    const daysInMonth =
      new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();

    const forecastedSpend =
      (
        totalSpend /
        elapsedDays
      ) *
      daysInMonth;

    const budget =
      await budgetService.getCurrentMonthlyBudget(
        organizationId,
        now,
      );

    const budgetAmount =
      budget?.amount ?? 0;

    const usagePercent =
      budgetAmount > 0
        ? (
            totalSpend /
            budgetAmount
          ) * 100
        : 0;

    let budgetStatus =
      "healthy";

    if (
      usagePercent >= 100
    ) {
      budgetStatus =
        "exceeded";
    } else if (
      usagePercent >= 85
    ) {
      budgetStatus =
        "critical";
    } else if (
      usagePercent >= 70
    ) {
      budgetStatus =
        "warning";
    }

    const serviceRecords =
      await prisma.serviceCostSnapshot.findMany({
        where: {
          snapshotDate: {
            gte: currentMonthStart,
            lte: now,
          },
          account: {
            organizationId,
          },
        },
      });

    const serviceTotals =
      new Map<
        string,
        number
      >();

    for (
      const record of serviceRecords
    ) {
      const current =
        serviceTotals.get(
          record.serviceName,
        ) ?? 0;

      serviceTotals.set(
        record.serviceName,
        current +
          record.cost,
      );
    }

    const sortedServices =
      Array.from(
        serviceTotals.entries(),
      ).sort(
        (a, b) =>
          b[1] - a[1],
      );

    const topService =
      sortedServices[0]?.[0] ??
      "No dominant service";

    const topServiceSpend =
      sortedServices[0]?.[1] ??
      0;

    const topServicePercent =
      totalSpend > 0
        ? (
            (
              topServiceSpend /
              totalSpend
            ) *
            100
          ).toFixed(1)
        : "0";

    const monthName =
      now.toLocaleString(
        "en-US",
        {
          month: "long",
        },
      );

    const summary =
      budgetAmount > 0
        ? `Cloud spend remains ${
            forecastedSpend <=
            budgetAmount
              ? "below"
              : "above"
          } the approved monthly budget. ${topService} accounts for ${topServicePercent}% of total spend and continues to be the primary cost driver. Based on the current run rate, projected month-end spend is $${forecastedSpend.toFixed(
            2,
          )}.`
        : `No monthly budget has been configured. ${topService} is currently the largest cost driver, representing ${topServicePercent}% of spend. Projected month-end spend is $${forecastedSpend.toFixed(
            2,
          )}.`;

    return res.status(200).json({
      period:
        `${monthName} ${now.getFullYear()}`,

      totalSpend:
        Number(
          totalSpend.toFixed(2),
        ),

      budget:
        Number(
          budgetAmount.toFixed(2),
        ),

      forecastedSpend:
        Number(
          forecastedSpend.toFixed(
            2,
          ),
        ),

      topService,

      topServiceSpend:
        Number(
          topServiceSpend.toFixed(
            2,
          ),
        ),

      budgetStatus,

      summary,
    });
  } catch (error) {
    console.error(
      "Executive report error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to generate report",
    });
  }
}

export async function exportCsv(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    requireOrganizationId(
      req,
      res,
    );

  if (!organizationId) {
    return;
  }

  try {
    const csv =
      await generateReportCsv(
        organizationId,
      );

    res.setHeader(
      "Content-Type",
      "text/csv",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="cloud-cost-report.csv"',
    );

    return res
      .status(200)
      .send(csv);
  } catch (error) {
    console.error(
      "CSV export error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to export report.",
    });
  }
}

export async function getNotes(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    requireOrganizationId(
      req,
      res,
    );

  if (!organizationId) {
    return;
  }

  try {
    const notes =
      await getReportNotes(
        organizationId,
      );

    return res
      .status(200)
      .json(notes);
  } catch (error) {
    console.error(
      "Get notes error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to load notes.",
    });
  }
}

export async function createNote(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    requireOrganizationId(
      req,
      res,
    );

  if (!organizationId) {
    return;
  }

  try {
    const {
      title,
      content,
    } = req.body ?? {};

    if (
      typeof title !== "string" ||
      typeof content !== "string"
    ) {
      return res.status(400).json({
        message:
          "title and content are required",
      });
    }

    const note =
      await createReportNote(
        organizationId,
        title,
        content,
      );

    return res
      .status(201)
      .json(note);
  } catch (error) {
    console.error(
      "Create note error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to create note.",
    });
  }
}

export async function updateNote(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    requireOrganizationId(
      req,
      res,
    );

  if (!organizationId) {
    return;
  }

  try {
    const rawId =
      req.params.id;

    const id =
      Array.isArray(rawId)
        ? rawId[0]
        : rawId;

    if (!id) {
      return res.status(400).json({
        message:
          "Report note ID is required",
      });
    }

    const {
      title,
      content,
    } = req.body ?? {};

    if (
      typeof title !== "string" ||
      typeof content !== "string"
    ) {
      return res.status(400).json({
        message:
          "title and content are required",
      });
    }

    const note =
      await updateReportNote(
        organizationId,
        id,
        title,
        content,
      );

    if (!note) {
      return res.status(404).json({
        message:
          "Report note not found",
      });
    }

    return res
      .status(200)
      .json(note);
  } catch (error) {
    console.error(
      "Update note error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to update note.",
    });
  }
}

export async function removeNote(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    requireOrganizationId(
      req,
      res,
    );

  if (!organizationId) {
    return;
  }

  try {
    const rawId =
      req.params.id;

    const id =
      Array.isArray(rawId)
        ? rawId[0]
        : rawId;

    if (!id) {
      return res.status(400).json({
        message:
          "Report note ID is required",
      });
    }

    const deleted =
      await deleteReportNote(
        organizationId,
        id,
      );

    if (!deleted) {
      return res.status(404).json({
        message:
          "Report note not found",
      });
    }

    return res
      .status(204)
      .send();
  } catch (error) {
    console.error(
      "Delete note error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to delete note.",
    });
  }
}