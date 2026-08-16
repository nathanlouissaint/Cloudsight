const API_URL =
  import.meta.env?.VITE_API_URL ??
  "http://localhost:5001";

const CSRF_EXPIRATION_SKEW_MS = 5_000;
const MAX_CSRF_TOKEN_LENGTH = 512;
const ISO_8601_UTC_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

interface CsrfBootstrapResponse {
  csrfToken: string;
  expiresAt: string;
}

interface ParsedCsrfState {
  token: string;
  expiration: number;
}

let csrfToken: string | null = null;
let csrfTokenExpiresAt: number | null =
  null;
let bootstrapPromise: Promise<string> | null =
  null;

function invalidBootstrapResponse(): Error {
  return new Error(
    "Invalid CSRF bootstrap response.",
  );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseBootstrapResponse(
  value: unknown,
): CsrfBootstrapResponse {
  if (!isRecord(value)) {
    throw invalidBootstrapResponse();
  }

  const keys = Object.keys(value).sort();

  if (
    keys.length !== 2 ||
    keys[0] !== "csrfToken" ||
    keys[1] !== "expiresAt"
  ) {
    throw invalidBootstrapResponse();
  }

  const parsed = parseCsrfState(
    value.csrfToken,
    value.expiresAt,
  );

  return {
    csrfToken: parsed.token,
    expiresAt: new Date(
      parsed.expiration,
    ).toISOString(),
  };
}

function parseCsrfState(
  token: unknown,
  expiresAt: unknown,
): ParsedCsrfState {
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > MAX_CSRF_TOKEN_LENGTH ||
    typeof expiresAt !== "string" ||
    !ISO_8601_UTC_PATTERN.test(expiresAt)
  ) {
    throw invalidBootstrapResponse();
  }

  const expiration = Date.parse(expiresAt);

  if (
    !Number.isFinite(expiration) ||
    new Date(expiration).toISOString() !==
      expiresAt ||
    expiration <=
      Date.now() +
        CSRF_EXPIRATION_SKEW_MS
  ) {
    throw invalidBootstrapResponse();
  }

  return {
    token,
    expiration,
  };
}

function getUsableCsrfToken(): string | null {
  if (
    csrfToken !== null &&
    csrfTokenExpiresAt !== null &&
    csrfTokenExpiresAt >
      Date.now() +
        CSRF_EXPIRATION_SKEW_MS
  ) {
    return csrfToken;
  }

  return null;
}

export function getCsrfToken(): string | null {
  return csrfToken;
}

export function getCsrfTokenExpiry(): Date | null {
  return csrfTokenExpiresAt === null
    ? null
    : new Date(csrfTokenExpiresAt);
}

export function setCsrfToken(
  token: string,
  expiresAt: Date,
): void {
  const expiration = expiresAt.getTime();

  if (
    token.length === 0 ||
    token.length > MAX_CSRF_TOKEN_LENGTH ||
    !Number.isFinite(expiration)
  ) {
    throw new Error(
      "Invalid CSRF token state.",
    );
  }

  csrfToken = token;
  csrfTokenExpiresAt = expiration;
}

export function clearCsrfToken(): void {
  csrfToken = null;
  csrfTokenExpiresAt = null;
}

export function setCsrfTokenFromResponse(
  token: unknown,
  expiresAt: unknown,
): void {
  clearCsrfToken();

  const parsed = parseCsrfState(
    token,
    expiresAt,
  );

  setCsrfToken(
    parsed.token,
    new Date(parsed.expiration),
  );
}

export async function bootstrapCsrfToken(): Promise<string> {
  clearCsrfToken();

  const response = await fetch(
    `${API_URL}/auth/csrf`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      "CSRF bootstrap request failed.",
    );
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw invalidBootstrapResponse();
  }

  const result = parseBootstrapResponse(
    body,
  );
  const expiresAt = new Date(
    result.expiresAt,
  );

  setCsrfToken(
    result.csrfToken,
    expiresAt,
  );

  return result.csrfToken;
}

export function ensureCsrfToken(): Promise<string> {
  const usableToken =
    getUsableCsrfToken();

  if (usableToken) {
    return Promise.resolve(
      usableToken,
    );
  }

  if (!bootstrapPromise) {
    bootstrapPromise =
      bootstrapCsrfToken().finally(() => {
        bootstrapPromise = null;
      });
  }

  return bootstrapPromise;
}
