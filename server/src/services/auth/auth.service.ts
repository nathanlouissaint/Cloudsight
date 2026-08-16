import {
  AuditEventType,
} from "@prisma/client";

import {
  userRepository,
} from "../../repositories/auth/user.repository";

import {
  auditService,
} from "./audit.service";

import {
  emailVerificationService,
} from "./email-verification.service";

import {
  comparePassword,
  hashPassword,
} from "./password.service";

import {
  passwordResetService,
} from "./password-reset.service";

import {
  AuthDomainError,
} from "../../errors/auth.errors";
import {
  sessionIssuanceService,
} from "./session-issuance.service";
import {
  sessionService,
} from "./session.service";

export async function registerUser(
  email: string,
  password: string,
) {
  const existingUser =
    await userRepository.findByEmail(email);

  if (existingUser) {
    throw new AuthDomainError(
      "USER_EXISTS",
      "A user with this email already exists.",
    );
  }

  const passwordHash =
    await hashPassword(password);

  const user =
    await userRepository.create({
      email,
      passwordHash,
    });

  await emailVerificationService.createVerificationRequest(
    user.email,
  );

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
    throw new AuthDomainError(
      "INVALID_CREDENTIALS",
      "Invalid credentials.",
    );
  }

  if (!user.passwordHash) {
    throw new AuthDomainError(
      "PASSWORD_LOGIN_UNAVAILABLE",
      "Password login is unavailable for this account.",
    );
  }

  const validPassword =
    await comparePassword(
      password,
      user.passwordHash,
    );

  if (!validPassword) {
    throw new AuthDomainError(
      "INVALID_CREDENTIALS",
      "Invalid credentials.",
    );
  }

  const issuedSession =
    await sessionIssuanceService.issue(
      user,
      metadata,
    );

  await auditService.recordEvent({
    userId: user.id,

    eventType:
      AuditEventType.LOGIN,

    ipAddress: issuedSession.ipAddress,

    userAgent: issuedSession.userAgent,
  });

  return {
    accessToken: issuedSession.accessToken,
    refreshToken: issuedSession.refreshToken,
    sessionExpiresAt:
      issuedSession.sessionExpiresAt,

    user: issuedSession.user,
  };
}

export async function getCurrentUser(
  userId: string,
) {
  const user =
    await userRepository.findById(
      userId,
    );

  if (!user) {
    throw new AuthDomainError(
      "USER_NOT_FOUND",
      "Authenticated user was not found.",
    );
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
    throw new AuthDomainError(
      "INVALID_REFRESH_TOKEN",
      "Refresh token is invalid.",
    );
  }

  await sessionService.revokeSession(
    session.id,
  );
}

/**
 * Reset a user's password using
 * a valid password reset token.
 */
export async function resetPassword(
  token: string,
  newPassword: string,
) {
  const resetRecord =
    await passwordResetService.consumeToken(
      token,
    );

  const passwordHash =
    await hashPassword(
      newPassword,
    );

  await userRepository.updatePassword(
    resetRecord.userId,
    passwordHash,
  );

  await sessionService.revokeAllSessions(
    resetRecord.userId,
  );

  await auditService.recordEvent({
    userId: resetRecord.userId,

    eventType:
      AuditEventType.PASSWORD_RESET,
  });

  return {
    message:
      "Password reset successfully.",
  };
}
