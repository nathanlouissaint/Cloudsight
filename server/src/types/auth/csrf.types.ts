export type CsrfTokenVersion = "v1";

export interface IssuedCsrfToken {
  token: string;
  expiresAt: Date;
}

export interface ValidatedCsrfToken {
  version: CsrfTokenVersion;
  expiresAt: Date;
}

export interface CsrfBootstrapResponse {
  csrfToken: string;
  expiresAt: string;
}

export interface LoginCsrfResponse {
  csrfToken: string;
  csrfExpiresAt: string;
}
