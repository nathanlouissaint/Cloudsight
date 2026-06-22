import type {
  Request,
  Response,
} from "express";

import {
  getCostSummary,
} from "../aws/services/cost-explorer.service";

export async function getAwsCosts(
  _req: Request,
  res: Response
) {
  try {
    const data =
      await getCostSummary();

    return res.status(200).json(data);
  } catch (error) {
    console.error(
      "AWS cost explorer error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to retrieve AWS costs",
    });
  }
}
