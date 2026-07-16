import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import {
  hashPassword,
  comparePassword,
} from "../services/auth/password.service";

import {
  generateAccessToken,
} from "../services/auth/token.service";

import {
  registerUser,
  loginUser,
} from "../services/auth/auth.service";



export async function register(req: Request, res: Response) {
try {
  const { email, password } = req.body;

  const user =
    await registerUser(
      email,
      password
    );

  return res.status(201).json(user);

} catch (error) {

  if (
    error instanceof Error &&
    error.message === "USER_EXISTS"
  ) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Internal server error",
  });
}
  }


export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
const passwordMatches = await comparePassword(
  password,
  user.passwordHash
);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

   const token =
  generateAccessToken({
    userId: user.id,
    email: user.email,
  });

    return res.json({
      token,
    });


  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}