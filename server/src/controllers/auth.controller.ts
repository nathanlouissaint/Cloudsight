import type {
  Request,
  Response,
} from "express";

import {
  loginUser,
  registerUser,
} from "../services/auth/auth.service";

export async function register(
  req: Request,
  res: Response
) {
  try {
    const { email, password } = req.body;

    const user =
      await registerUser(
        email,
        password
      );

    return res
      .status(201)
      .json(user);
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

export async function login(
  req: Request,
  res: Response
) {
  try {
    const { email, password } = req.body;

    const result =
      await loginUser(
        email,
        password
      );

    return res.json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "PASSWORD_LOGIN_UNAVAILABLE"
    ) {
      return res.status(400).json({
        message:
          "This account uses Google sign-in",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}