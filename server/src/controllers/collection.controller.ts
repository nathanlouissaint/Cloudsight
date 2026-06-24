import type {
  Request,
  Response,
} from "express";

import {
  collectCosts,
} from "../aws/services/collector.service";

export async function collectCostsController(
  _req: Request,
  res: Response
) {
  try {
    const result =
      await collectCosts();

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
