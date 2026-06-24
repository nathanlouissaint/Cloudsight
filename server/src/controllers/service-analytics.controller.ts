import type {
  Request,
  Response,
} from "express";

import {
  getServiceBreakdown,
  getServiceTrend,
  getTopDrivers,
} from "../services/service-analytics.service";

function getDates(req: Request) {
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
  req: Request,
  res: Response
) {
  try {
    const { startDate, endDate } =
      getDates(req);

    const result =
      await getServiceBreakdown(
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
  req: Request,
  res: Response
) {
  try {
    const { startDate, endDate } =
      getDates(req);

    const result =
      await getTopDrivers(
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
  req: Request,
  res: Response
) {
  try {
    const { startDate, endDate } =
      getDates(req);

    const result =
      await getServiceTrend(
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
