import type {
  Request,
  Response,
} from "express";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

export async function register(
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

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

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

    const user =
      await prisma.user.create({
        data: {
          email:
            normalizedEmail,
          passwordHash,
        },
      });

    const token =
      createAccessToken(user);

    return res.status(201).json({
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

    if (!user) {
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
