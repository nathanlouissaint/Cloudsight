import type {
  AuthDomainError,
} from "./auth.errors";

export interface AuthErrorHttpResponse {
  status: number;
  message: string;
}

const ERROR_RESPONSES: Record<
  AuthDomainError["code"],
  AuthErrorHttpResponse
> = {
  USER_EXISTS: {
    status: 409,
    message: "User already exists",
  },
  INVALID_CREDENTIALS: {
    status: 401,
    message: "Invalid credentials",
  },
  PASSWORD_LOGIN_UNAVAILABLE: {
    status: 400,
    message:
      "Password sign-in is not available for this account",
  },
  USER_NOT_FOUND: {
    status: 404,
    message: "User not found",
  },
  INVALID_VERIFICATION_TOKEN: {
    status: 400,
    message: "Invalid verification token.",
  },
  VERIFICATION_TOKEN_EXPIRED: {
    status: 400,
    message: "Verification token has expired.",
  },
  VERIFICATION_TOKEN_ALREADY_USED: {
    status: 400,
    message:
      "Verification token has already been used.",
  },
  INVALID_RESET_TOKEN: {
    status: 400,
    message: "Invalid reset token.",
  },
  RESET_TOKEN_EXPIRED: {
    status: 400,
    message: "Reset token has expired.",
  },
  INVALID_CURRENT_PASSWORD: {
    status: 400,
    message: "Current password is incorrect.",
  },
  PASSWORD_REUSE: {
    status: 400,
    message:
      "New password must be different from the current password.",
  },
  SESSION_NOT_FOUND: {
    status: 404,
    message: "Session not found",
  },
  SESSION_REVOKED: {
    status: 401,
    message: "Invalid token",
  },
  SESSION_EXPIRED: {
    status: 401,
    message: "Invalid token",
  },
  SESSION_FORBIDDEN: {
    status: 403,
    message: "Forbidden",
  },
  INVALID_REFRESH_TOKEN: {
    status: 401,
    message: "Invalid refresh token",
  },
  FEDERATED_PROVIDER_UNAVAILABLE: {
    status: 503,
    message: "Federated provider is unavailable",
  },
  FEDERATED_PROVIDER_RESPONSE_INVALID: {
    status: 502,
    message: "Federated authentication failed",
  },
  OAUTH_TRANSACTION_INVALID: {
    status: 400,
    message: "OAuth transaction is invalid",
  },
  FEDERATED_OAUTH_UNAVAILABLE: {
    status: 503,
    message: "Federated authentication is unavailable",
  },
  FEDERATED_ACCOUNT_CONFLICT: {
    status: 409,
    message: "Federated account linking is required",
  },
};

export function mapAuthDomainError(
  error: AuthDomainError,
  publicMessage?: string,
): AuthErrorHttpResponse {
  return {
    ...ERROR_RESPONSES[error.code],
    ...(publicMessage
      ? { message: publicMessage }
      : {}),
  };
}
