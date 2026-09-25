import type { Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getOrganizationIdForUser } from "../services/organization-context.service";
import {
  createReportNote,
  deleteReportNote,
  generateReportCsv,
  getReportNotes,
  updateReportNote,
} from "../services/reports/report.service";

async function requireOrganizationId(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  const organizationId = await getOrganizationIdForUser(userId);
  if (!organizationId) {
    res.status(403).json({ message: "No organization is associated with this account." });
    return null;
  }
  return organizationId;
}

export async function getExecutiveReport(req: AuthenticatedRequest, res: Response) {
  try {
    const organizationId = await requireOrganizationId(req, res);
    if (!organizationId) return;
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const spendResult = await prisma.costSnapshot.aggregate({
      _sum: { totalCost: true },
      where: { snapshotDate: { gte: currentMonthStart, lte: now }, account: { organizationId } },
    });
    const totalSpend = spendResult._sum.totalCost ?? 0;
    const budget = await prisma.budget.findUnique({
      where: { organizationId_year_month: { organizationId, year: now.getFullYear(), month: now.getMonth() + 1 } },
    });
    const budgetAmount = budget?.amount ?? 0;
    const serviceRecords = await prisma.serviceCostSnapshot.findMany({
      where: { snapshotDate: { gte: currentMonthStart, lte: now }, account: { organizationId } },
    });
    const totals = new Map<string, number>();
    for (const record of serviceRecords) totals.set(record.serviceName, (totals.get(record.serviceName) ?? 0) + record.cost);
    const [topService = "No dominant service", topServiceSpend = 0] = [...totals.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const forecastedSpend = (totalSpend / Math.max(now.getDate(), 1)) * daysInMonth;
    const usagePercent = budgetAmount > 0 ? (totalSpend / budgetAmount) * 100 : 0;
    const budgetStatus = usagePercent >= 100 ? "exceeded" : usagePercent >= 85 ? "critical" : usagePercent >= 70 ? "warning" : "healthy";
    const topServicePercent = totalSpend > 0 ? ((topServiceSpend / totalSpend) * 100).toFixed(1) : "0";
    return res.status(200).json({
      period: now.toLocaleString("en-US", { month: "long" }) + ` ${now.getFullYear()}`,
      totalSpend: Number(totalSpend.toFixed(2)), budget: Number(budgetAmount.toFixed(2)),
      forecastedSpend: Number(forecastedSpend.toFixed(2)), topService,
      topServiceSpend: Number(topServiceSpend.toFixed(2)), budgetStatus,
      summary: budgetAmount > 0
        ? `Cloud spend remains ${forecastedSpend <= budgetAmount ? "below" : "above"} the approved monthly budget. ${topService} accounts for ${topServicePercent}% of total spend.`
        : `No monthly budget has been configured. ${topService} is currently the largest cost driver, representing ${topServicePercent}% of spend.`,
    });
  } catch (error) {
    console.error("Executive report error:", error);
    return res.status(500).json({ message: "Failed to generate report" });
  }
}

export async function exportCsv(req: AuthenticatedRequest, res: Response) {
  try {
    const organizationId = await requireOrganizationId(req, res);
    if (!organizationId) return;
    const csv = await generateReportCsv(organizationId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="cloud-cost-report.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    console.error("CSV export error:", error);
    return res.status(500).json({ message: "Failed to export report." });
  }
}

export async function getNotes(req: AuthenticatedRequest, res: Response) {
  const organizationId = await requireOrganizationId(req, res);
  if (!organizationId) return;
  return res.status(200).json(await getReportNotes(organizationId));
}

export async function createNote(req: AuthenticatedRequest, res: Response) {
  const organizationId = await requireOrganizationId(req, res);
  if (!organizationId) return;
  const { title, content } = req.body ?? {};
  if (typeof title !== "string" || typeof content !== "string") return res.status(400).json({ message: "title and content are required" });
  return res.status(201).json(await createReportNote(organizationId, title, content));
}

export async function updateNote(req: AuthenticatedRequest, res: Response) {
  const organizationId = await requireOrganizationId(req, res);
  if (!organizationId) return;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { title, content } = req.body ?? {};
  if (!id || typeof title !== "string" || typeof content !== "string") return res.status(400).json({ message: "id, title, and content are required" });
  const note = await updateReportNote(organizationId, id, title, content);
  return note ? res.status(200).json(note) : res.status(404).json({ message: "Report note not found" });
}

export async function removeNote(req: AuthenticatedRequest, res: Response) {
  const organizationId = await requireOrganizationId(req, res);
  if (!organizationId) return;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) return res.status(400).json({ message: "Report note ID is required" });
  return await deleteReportNote(organizationId, id)
    ? res.status(204).send()
    : res.status(404).json({ message: "Report note not found" });
}
