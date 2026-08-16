import type {
  Response,
} from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import {
  getServiceBreakdown,
  getServiceTrend,
  getTopDrivers,
} from "../services/service-analytics.service";

function getDates(
  req: OrganizationAuthenticatedRequest,
) {
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
            1000,
      );

  return {
    startDate,
    endDate,
  };
}

export async function getServices(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    const organizationId =
      req.organization?.id;

    if (!organizationId) {
      res.status(400).json({
        message:
          "Organization context is required",
      });

      return;
    }

    const {
      startDate,
      endDate,
    } = getDates(req);

    const result =
      await getServiceBreakdown(
        organizationId,
        startDate,
        endDate,
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
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    const organizationId =
      req.organization?.id;

    if (!organizationId) {
      res.status(400).json({
        message:
          "Organization context is required",
      });

      return;
    }

    const {
      startDate,
      endDate,
    } = getDates(req);

    const result =
      await getTopDrivers(
        organizationId,
        startDate,
        endDate,
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
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    const organizationId =
      req.organization?.id;

    if (!organizationId) {
      res.status(400).json({
        message:
          "Organization context is required",
      });

      return;
    }

    const rawServiceName =
      req.params.serviceName;

    const serviceName =
      Array.isArray(rawServiceName)
        ? rawServiceName[0]
        : rawServiceName;

    if (!serviceName) {
      res.status(400).json({
        message:
          "Service name is required",
      });

      return;
    }

    const {
      startDate,
      endDate,
    } = getDates(req);

    const result =
      await getServiceTrend(
        organizationId,
        serviceName,
        startDate,
        endDate,
      );

    res.status(200).json(result);
  } catch {
    res.status(500).json({
      message:
        "Failed to load service trend",
    });
  }
}