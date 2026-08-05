import {
  AuditEventType,
} from "@prisma/client";

import { userRepository } from "../../repositories/auth/user.repository";

import { auditService } from "./audit.service";
import {
  comparePassword,
  hashPassword,
} from "./password.service";
import { sessionService } from "./session.service";

export interface ChangePasswordInput {
  userId: string;
  currentSessionId: string;
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export class ChangePasswordService {
  /**
   * Change an authenticated user's password.
   */
  async changePassword(
    input: ChangePasswordInput,
  ) {
    const user =
      await userRepository.findAuthUserById(
        input.userId,
      );

    if (!user) {
      throw new Error(
        "USER_NOT_FOUND",
      );
    }

    if (!user.passwordHash) {
      throw new Error(
        "PASSWORD_LOGIN_UNAVAILABLE",
      );
    }

    const validCurrentPassword =
      await comparePassword(
        input.currentPassword,
        user.passwordHash,
      );

    if (!validCurrentPassword) {
      throw new Error(
        "INVALID_CURRENT_PASSWORD",
      );
    }

    const isSamePassword =
      await comparePassword(
        input.newPassword,
        user.passwordHash,
      );

    if (isSamePassword) {
      throw new Error(
        "PASSWORD_REUSE",
      );
    }

    const passwordHash =
      await hashPassword(
        input.newPassword,
      );

    await userRepository.updatePassword(
      user.id,
      passwordHash,
    );

    if (input.revokeOtherSessions) {
      await sessionService.revokeOtherSessions(
        input.userId,
        input.currentSessionId,
      );
    }

    await auditService.recordEvent({
      userId: user.id,
      eventType:
        AuditEventType.PASSWORD_CHANGED,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return {
      message:
        "Password changed successfully.",
    };
  }
}

export const changePasswordService =
  new ChangePasswordService();