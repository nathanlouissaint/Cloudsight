export const AUTH_ERROR_CODES = [
  "USER_EXISTS",
  "INVALID_CREDENTIALS",
  "PASSWORD_LOGIN_UNAVAILABLE",
  "USER_NOT_FOUND",
  "INVALID_VERIFICATION_TOKEN",
  "VERIFICATION_TOKEN_EXPIRED",
  "VERIFICATION_TOKEN_ALREADY_USED",
  "INVALID_RESET_TOKEN",
  "RESET_TOKEN_EXPIRED",
  "INVALID_CURRENT_PASSWORD",
  "PASSWORD_REUSE",
  "SESSION_NOT_FOUND",
  "SESSION_REVOKED",
  "SESSION_EXPIRED",
  "SESSION_FORBIDDEN",
  "INVALID_REFRESH_TOKEN",
  "FEDERATED_PROVIDER_UNAVAILABLE",
  "FEDERATED_PROVIDER_RESPONSE_INVALID",
  "OAUTH_TRANSACTION_INVALID",
  "FEDERATED_OAUTH_UNAVAILABLE",
  "FEDERATED_ACCOUNT_CONFLICT",
] as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[number];

export class AuthDomainError extends Error {
  readonly code: AuthErrorCode;

  constructor(
    code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AuthDomainError";
    this.code = code;
    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

export function isAuthDomainError(
  error: unknown,
): error is AuthDomainError {
  return error instanceof AuthDomainError;
}
