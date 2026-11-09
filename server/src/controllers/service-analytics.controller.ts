import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getOrganizationIdForUser } from "../services/organization-context.service";

import {
  getServiceBreakdown,
  getServiceTrend,
  getTopDrivers,
} from "../services/service-analytics.service";

function getDates(req: AuthenticatedRequest) {
  const endDate = req.query.endDate
    ? new Date(String(req.query.endDate))
    : new Date();

  const startDate = req.query.startDate
    ? new Date(String(req.query.startDate))
    : new Date(
        Date.now() -
          30 *
            24 *
            60 *
            60 *
            1000
      );

  return { startDate, endDate };
}

export async function getServices(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const organizationId = await getOrganizationIdForUser(userId);
    if (!organizationId) return res.status(403).json({ message: "No organization is associated with this account." });
    const { startDate, endDate } =
      getDates(req);

    const result =
      await getServiceBreakdown(
        organizationId,
        startDate,
        endDate
      );

    res.status(200).json(result);
  } catch {
    res.status(500).json({
      message:
        "Failed to load service analytics",
    });
  }
}

export async function getTopServiceDrivers(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const organizationId = await getOrganizationIdForUser(userId);
    if (!organizationId) return res.status(403).json({ message: "No organization is associated with this account." });
    const { startDate, endDate } =
      getDates(req);

    const result =
      await getTopDrivers(
        organizationId,
        startDate,
        endDate
      );

    res.status(200).json(result);
  } catch {
    res.status(500).json({
      message:
        "Failed to load top drivers",
    });
  }
}

export async function getServiceTrends(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const organizationId = await getOrganizationIdForUser(userId);
    if (!organizationId) return res.status(403).json({ message: "No organization is associated with this account." });
    const { startDate, endDate } =
      getDates(req);

    const result =
      await getServiceTrend(
        organizationId,
        String(
          req.params.serviceName
        ),
        startDate,
        endDate
      );

    res.status(200).json(result);
  } catch {
    res.status(500).json({
      message:
        "Failed to load service trend",
    });
  }
}
