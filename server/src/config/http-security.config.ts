const DEFAULT_DEVELOPMENT_FRONTEND_ORIGIN = "http://localhost:5173";

const CORS_METHODS = [
  "GET",
  "HEAD",
  "PUT",
  "PATCH",
  "POST",
  "DELETE",
  "OPTIONS",
] as const;

const CORS_ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-CSRF-Token",
  "X-Organization-Id",
] as const;

function validateOrigin(configuredOrigin: string): string {
  if (configuredOrigin === "*") {
    throw new Error("CORS_ORIGIN must not be a wildcard");
  }

  let parsedOrigin: URL;

  try {
    parsedOrigin = new URL(configuredOrigin);
  } catch {
    throw new Error("CORS_ORIGIN must be a valid URL");
  }

  if (
    parsedOrigin.protocol !== "http:" &&
    parsedOrigin.protocol !== "https:"
  ) {
    throw new Error(
      "CORS_ORIGIN must use the http: or https: protocol",
    );
  }

  if (parsedOrigin.username || parsedOrigin.password) {
    throw new Error(
      "CORS_ORIGIN must not contain credentials",
    );
  }

  const hasOriginOnlyShape =
    /^https?:\/\/[^/?#]+\/?$/i.test(
      configuredOrigin,
    );

  if (
    !hasOriginOnlyShape ||
    parsedOrigin.pathname !== "/" ||
    parsedOrigin.search ||
    parsedOrigin.hash
  ) {
    throw new Error(
      "CORS_ORIGIN must contain only an origin",
    );
  }

  return parsedOrigin.origin;
}

export function resolveTrustedFrontendOrigin(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const configuredOrigin =
    env.CORS_ORIGIN?.trim();

  if (!configuredOrigin) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "CORS_ORIGIN must be configured in production",
      );
    }

    return DEFAULT_DEVELOPMENT_FRONTEND_ORIGIN;
  }

  return validateOrigin(configuredOrigin);
}

export function isTrustedCloudSightProxy(
  ip: string,
): boolean {
  const normalized = ip.startsWith("::ffff:")
    ? ip.slice("::ffff:".length)
    : ip;

  const octets = normalized.split(".");

  if (octets.length !== 4) {
    return false;
  }

  const values = octets.map((octet) =>
    Number(octet),
  );

  return (
    values.every((value, index) => {
      const octet = octets[index] ?? "";

      return (
        /^\d{1,3}$/.test(octet) &&
        Number.isInteger(value) &&
        value >= 0 &&
        value <= 255
      );
    }) &&
    values[0] === 172 &&
    values[1] === 30
  );
}

export function resolveTrustProxy(
  nodeEnv = process.env.NODE_ENV,
): false | typeof isTrustedCloudSightProxy {
  return nodeEnv === "production"
    ? isTrustedCloudSightProxy
    : false;
}

export const httpSecurityConfig =
  Object.freeze({
    trustedFrontendOrigin:
      resolveTrustedFrontendOrigin(),
    trustProxy: resolveTrustProxy(),
    corsMethods: CORS_METHODS,
    corsAllowedHeaders: CORS_ALLOWED_HEADERS,
  });