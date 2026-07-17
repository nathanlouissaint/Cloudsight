import { prisma } from "../../config/prisma";
import {
  comparePassword,
  hashPassword,
} from "./password.service";

import {
  generateAccessToken,
} from "./token.service";

export async function registerUser(
  email: string,
  password: string
) {
  const existingUser =
    await prisma.user.findUnique({
      where: { email },
    });

  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  const passwordHash =
    await hashPassword(password);

  const user =
    await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

  return {
    id: user.id,
    email: user.email,
  };
}

export async function loginUser(
  email: string,
  password: string
) {
  const user =
    await prisma.user.findUnique({
      where: { email },
    });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.passwordHash) {
    throw new Error("PASSWORD_LOGIN_UNAVAILABLE");
  }

  const validPassword =
    await comparePassword(
      password,
      user.passwordHash
    );

  if (!validPassword) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token =
    generateAccessToken({
      userId: user.id,
      email: user.email,
    });

  return {
  token,
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    authProvider: user.authProvider,
    avatarUrl: user.avatarUrl,
  },
};
}