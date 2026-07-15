import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import {
  createReportNote,
  deleteReportNote,
  generateReportCsv,
  getReportNotes,
  updateReportNote,
} from "../services/reports/report.service";

export async function getExecutiveReport(
  _req: Request,
  res: Response
) {
  try {
    const now = new Date();

    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const spendResult =
      await prisma.costRecord.aggregate({
        _sum: {
          cost: true,
        },
        where: {
          usageDate: {
            gte: currentMonthStart,
          },
        },
      });

    const totalSpend =
      spendResult._sum.cost ?? 0;

    const elapsedDays =
      now.getDate();

    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    const forecastedSpend =
      (totalSpend / elapsedDays) *
      daysInMonth;

    const budget =
      await prisma.budget.findFirst({
        where: {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const budgetAmount =
      budget?.amount ?? 0;

    const usagePercent =
      budgetAmount > 0
        ? (totalSpend / budgetAmount) * 100
        : 0;

    let budgetStatus = "healthy";

    if (usagePercent >= 100) {
      budgetStatus = "exceeded";
    } else if (usagePercent >= 85) {
      budgetStatus = "critical";
    } else if (usagePercent >= 70) {
      budgetStatus = "warning";
    }

    const serviceRecords =
      await prisma.costRecord.findMany({
        where: {
          usageDate: {
            gte: currentMonthStart,
          },
        },
        include: {
          service: true,
        },
      });

    const serviceTotals = new Map<
      string,
      number
    >();

    for (const record of serviceRecords) {
      const current =
        serviceTotals.get(
          record.service.name
        ) ?? 0;

      serviceTotals.set(
        record.service.name,
        current + record.cost
      );
    }

    const sortedServices = Array.from(
      serviceTotals.entries()
    ).sort(
      (a, b) => b[1] - a[1]
    );

    const topService =
      sortedServices[0]?.[0] ??
      "No dominant service";

    const topServiceSpend =
      sortedServices[0]?.[1] ?? 0;

    const topServicePercent =
      totalSpend > 0
        ? (
            (topServiceSpend /
              totalSpend) *
            100
          ).toFixed(1)
        : "0";

    const monthName =
      now.toLocaleString("en-US", {
        month: "long",
      });

    const summary =
  budgetAmount > 0
    ? `Cloud spend remains ${
        forecastedSpend <= budgetAmount
          ? "below"
          : "above"
      } the approved monthly budget. ${topService} accounts for ${topServicePercent}% of total spend and continues to be the primary cost driver. Based on the current run rate, projected month-end spend is $${forecastedSpend.toFixed(
        2
      )}.`
    : `No monthly budget has been configured. ${topService} is currently the largest cost driver, representing ${topServicePercent}% of spend. Projected month-end spend is $${forecastedSpend.toFixed(
        2
      )}.`;
      
const budgetVariance =
  budgetAmount - totalSpend;

const variancePercent =
  budgetAmount > 0
    ? (budgetVariance / budgetAmount) * 100
    : 0;

const reportStatus =
  budgetStatus === "healthy"
    ? "Final"
    : "Action Required";

const generatedAt =
  now.toISOString();


    return res.status(200).json({
      period: `${monthName} ${now.getFullYear()}`,
      totalSpend: Number(
        totalSpend.toFixed(2)
      ),
      budget: Number(
        budgetAmount.toFixed(2)
      ),
      forecastedSpend: Number(
        forecastedSpend.toFixed(2)
      ),
      topService,
      topServiceSpend: Number(
        topServiceSpend.toFixed(2)
      ),
      budgetStatus,
      summary,
    });
  } catch (error) {
    console.error(
      "Executive report error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to generate report",
    });
  }
}

export async function exportCsv(
  _req: Request,
  res: Response
) {
  try {
    const csv =
      await generateReportCsv();

    res.setHeader(
      "Content-Type",
      "text/csv"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="cloud-cost-report.csv"'
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error(
      "CSV export error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to export report.",
    });
  }
}

export async function getNotes(
  _req: Request,
  res: Response
) {
  try {
    const notes =
      await getReportNotes();

    return res.status(200).json(
      notes
    );
  } catch (error) {
    console.error(
      "Get notes error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load notes.",
    });
  }
}

export async function createNote(
  req: Request,
  res: Response
) {
  try {
   const {
  title,
  content,
} = req.body;

const note =
  await createReportNote(
    title,
    content
  );

    return res.status(201).json(
      note
    );
  } catch (error) {
    console.error(
      "Create note error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create note.",
    });
  }
}
export async function updateNote(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;

    const {
      title,
      content,
    } = req.body;

    const note =
      await updateReportNote(
        id,
        title,
        content
      );

    return res.status(200).json(note);
  } catch (error) {
    console.error(
      "Update note error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update note.",
    });
  }
}

export async function removeNote(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;

    await deleteReportNote(id);

    return res.status(204).send();
  } catch (error) {
    console.error(
      "Delete note error:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete note.",
    });
  }
}
