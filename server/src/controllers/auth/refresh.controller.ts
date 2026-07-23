import type { Request, Response } from "express";

import { sessionService } from "../../services/auth/session.service";
import { generateAccessToken } from "../../services/auth/token.service";

export async function refresh(
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

    const result =
      await sessionService.refreshSession(
        refreshToken,
      );

    const accessToken =
      generateAccessToken({
        userId: result.session.userId,
        email: result.session.user.email,
        sessionId: result.session.id,
      });

    return res.json({
      accessToken,
      refreshToken: result.refreshToken,
    });
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