import type {
  Request,
  Response,
} from "express";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  Prisma,
} from "@prisma/client";
import {
  randomUUID,
} from "node:crypto";

import {
  prisma,
} from "../config/prisma";

function createAccessToken(
  user: {
    id: string;
    email: string;
  },
) {
  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured.",
    );
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    secret,
    {
      expiresIn: "7d",
    },
  );
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

    const token =
      createAccessToken(
        result.user,
      );

    return res.status(201).json({
      token,

      user: {
        id:
          result.user.id,

        email:
          result.user.email,
      },

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

    console.error(
      "Registration error:",
      error,
    );

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

    const token =
      createAccessToken(user);

    return res.status(200).json({
      token,

      user: {
        id:
          user.id,

        email:
          user.email,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error,
    );

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
}
