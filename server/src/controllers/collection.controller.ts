import type {
  Response,
} from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import {
  collectCosts,
} from "../aws/services/collector.service";

export async function collectCostsController(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.organization) {
      return res.status(400).json({
        success: false,
        message:
          "Organization context is required",
      });
    }

    const result =
      await collectCosts(
        req.organization.id,
      );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ??
        "Collection failed",
    });
  }
}