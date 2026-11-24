import type {
  Request,
  Response,
} from "express";

import bcrypt from "bcrypt";
import {
  Prisma,
} from "@prisma/client";
import {
  randomUUID,
} from "node:crypto";

import {
  prisma,
} from "../config/prisma";
import { logger } from "../config/logger";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createSession,
  revokeRefreshToken,
  rotateRefreshToken,
} from "../services/auth-session.service";
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  setRefreshTokenCookie,
} from "../services/auth-cookie.service";
import {
  createAccessToken,
} from "../services/token.service";

function getSessionMetadata(req: Request) {
  return {
    ipAddress: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
  };
}

function buildAuthResponse(
  accessToken: string,
  user: {
    id: string;
    email: string;
  },
) {
  return {
    accessToken,
    // Temporary compatibility alias for the current frontend. This is the
    // same short-lived access token, never the refresh token.
    token: accessToken,
    user,
  };
}

function createOrganizationSlug(
  company: string,
  organizationId: string,
) {
  const normalized =
    company
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-|-$/g,
        "",
      );

  return `${normalized}-${organizationId.slice(
    0,
    8,
  )}`;
}

function isUserEmailUniqueConstraint(
  error: unknown,
) {
  if (
    !(error instanceof
      Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return false;
  }

  const target =
    error.meta?.target;

  return (
    Array.isArray(target) &&
    target.length === 1 &&
    target[0] === "email"
  );
}

export async function register(
  req: Request,
  res: Response,
) {
  try {
    const {
      email,
      password,
      name,
      company,
    } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        message:
          "Email is required.",
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters.",
      });
    }

    if (
      typeof company !== "string" ||
      !company.trim()
    ) {
      return res.status(400).json({
        message:
          "Company is required.",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const normalizedName =
      typeof name === "string" &&
      name.trim()
        ? name.trim()
        : null;

    const normalizedCompany =
      company.trim();

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email:
            normalizedEmail,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "User already exists",
      });
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        10,
      );

    const result =
      await prisma.$transaction(
        async (tx) => {
          const user =
            await tx.user.create({
              data: {
                email:
                  normalizedEmail,

                passwordHash,

                name:
                  normalizedName,
              },
            });

          const organizationId =
            randomUUID();

          const organization =
            await tx.organization.create({
              data: {
                id:
                  organizationId,

                name:
                  normalizedCompany,

                slug:
                  createOrganizationSlug(
                    normalizedCompany,
                    organizationId,
                  ),

                updatedAt:
                  new Date(),
              },
            });

          await tx.organizationMember.create({
            data: {
              id:
                randomUUID(),

              organizationId:
                organization.id,

              userId:
                user.id,

              role:
                "OWNER",

              updatedAt:
                new Date(),
            },
          });

          return {
            user,
            organization,
          };
        },
      );

    const session = await createSession(
      result.user.id,
      getSessionMetadata(req),
    );
    const accessToken = createAccessToken(
      result.user.id,
    );

    setRefreshTokenCookie(
      res,
      session.refreshToken,
      session.session.expiresAt,
    );

    return res.status(201).json({
      ...buildAuthResponse(accessToken, {
        id: result.user.id,
        email: result.user.email,
      }),

      organization: {
        id:
          result.organization.id,

        name:
          result.organization.name,

        slug:
          result.organization.slug,
      },
    });
  } catch (error) {
    if (
      isUserEmailUniqueConstraint(
        error,
      )
    ) {
      return res.status(409).json({
        message:
          "User already exists",
      });
    }

    logger.error({ err: error }, "Registration error");

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
}

export async function login(
  req: Request,
  res: Response,
) {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const user =
      await prisma.user.findUnique({
        where: {
          email:
            normalizedEmail,
        },
      });

    if (
      !user ||
      !user.passwordHash
    ) {
      return res.status(401).json({
        message:
          "Invalid credentials",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash,
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Invalid credentials",
      });
    }

    const session = await createSession(
      user.id,
      getSessionMetadata(req),
    );
    const accessToken = createAccessToken(
      user.id,
    );

    setRefreshTokenCookie(
      res,
      session.refreshToken,
      session.session.expiresAt,
    );

    return res.status(200).json(
      buildAuthResponse(accessToken, {
        id: user.id,
        email: user.email,
      }),
    );
  } catch (error) {
    logger.error({ err: error }, "Login error");

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
}

export async function refresh(
  req: Request,
  res: Response,
) {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (!refreshToken) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const result = await rotateRefreshToken(
      refreshToken,
      getSessionMetadata(req),
    );

    if (result.status !== "rotated") {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: result.session.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const accessToken = createAccessToken(user.id);
    setRefreshTokenCookie(
      res,
      result.refreshToken,
      result.session.expiresAt,
    );

    return res.status(200).json(
      buildAuthResponse(accessToken, user),
    );
  } catch (error) {
    logger.error({ err: error }, "Refresh token error");
    clearRefreshTokenCookie(res);

    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}

export async function logout(
  req: Request,
  res: Response,
) {
  const refreshToken = getRefreshTokenFromRequest(req);

  try {
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
  } catch (error) {
    logger.error({ err: error }, "Logout session revocation error");
  } finally {
    clearRefreshTokenCookie(res);
  }

  return res.status(204).send();
}

export async function me(
  req: AuthenticatedRequest,
  res: Response,
) {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        authProvider: true,
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    logger.error({ err: error }, "Current user lookup error");
    return res.status(500).json({
      message: "Unable to load current user.",
    });
  }
}
