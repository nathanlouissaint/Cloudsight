import type { Request, Response } from "express";

import { logoutUser } from "../../services/auth/auth.service";

export async function logout(
  req: Request,
  res: Response,
) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token required",
      });
    }

    await logoutUser(refreshToken);

    return res.status(204).send();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_REFRESH_TOKEN"
    ) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}