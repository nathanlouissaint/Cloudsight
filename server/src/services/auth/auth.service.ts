import { userRepository } from "../../repositories/auth/user.repository";

import { sessionMetadataService } from "./session-metadata.service";
import {
  comparePassword,
  hashPassword,
} from "./password.service";
import {
  generateAccessToken,
} from "./token.service";
import { sessionService } from "./session.service";
import { refreshTokenService } from "./refresh-token.service";

export async function registerUser(
  email: string,
  password: string,
) {
  const existingUser =
    await userRepository.findByEmail(email);

  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  const passwordHash =
    await hashPassword(password);

  const user =
    await userRepository.create({
      email,
      passwordHash,
    });

  return {
    id: user.id,
    email: user.email,
  };
}

export async function loginUser(
  email: string,
  password: string,
  metadata: {
    userAgent?: string;
    ipAddress?: string;
  },
) {
  const user =
    await userRepository.findByEmail(email);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.passwordHash) {
    throw new Error("PASSWORD_LOGIN_UNAVAILABLE");
  }

  const validPassword =
    await comparePassword(
      password,
      user.passwordHash,
    );

  if (!validPassword) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const sessionMetadata =
    sessionMetadataService.build(
      metadata.userAgent,
      metadata.ipAddress,
    );

  // Generate refresh token
  const refreshToken =
    refreshTokenService.generate();

  // Persist session
  const session =
    await sessionService.createSession(
      {
        userId: user.id,
        expiresAt:
          refreshTokenService.getExpirationDate(),
        deviceName:
          sessionMetadata.deviceName,
        userAgent:
          sessionMetadata.userAgent,
        ipAddress:
          sessionMetadata.ipAddress,
      },
      refreshToken,
    );

  // Generate short-lived access token
  const accessToken =
    generateAccessToken({
      userId: user.id,
      email: user.email,
      sessionId: session.id,
    });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      authProvider: user.authProvider,
    },
  };
}

export async function getCurrentUser(
  userId: string,
) {
  const user =
    await userRepository.findById(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
}

export async function logoutUser(
  refreshToken: string,
) {
  const session =
    await sessionService.validateRefreshToken(
      refreshToken,
    );

  if (!session) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  await sessionService.revokeSession(
    session.id,
  );
}