interface SerializedLogRequest {
  url?: unknown;
  query?: unknown;
  [key: string]: unknown;
}

interface SerializedLogResponse {
  headers?: Record<string, unknown>;
  [key: string]: unknown;
}

const OAUTH_CALLBACK_PATH = /^\/auth\/oauth\/[^/?]+\/callback$/i;
const LOG_SANITIZER_BASE_URL = "http://cloudsight.invalid";

function isOAuthCallbackUrl(value: string): boolean {
  try {
    return OAUTH_CALLBACK_PATH.test(new URL(value, LOG_SANITIZER_BASE_URL).pathname);
  } catch {
    return false;
  }
}

/** Remove OAuth callback credentials before pino serializes the request. */
export function sanitizeRequestForLogging<T extends SerializedLogRequest>(request: T): T {
  if (typeof request.url !== "string" || !isOAuthCallbackUrl(request.url)) {
    return request;
  }

  return {
    ...request,
    url: request.url.split("?", 1)[0],
    query: {},
  };
}

const OAUTH_LOG_SENSITIVE_QUERY_KEYS = [
  "state",
  "code",
  "code_challenge",
  "nonce",
  "client_secret",
  "access_token",
  "id_token",
] as const;
const OAUTH_LOG_SENSITIVE_QUERY_KEY_SET = new Set<string>(
  OAUTH_LOG_SENSITIVE_QUERY_KEYS,
);

function containsSensitiveLocationParameter(location: string): boolean {
  const parameterStart = location.search(/[?#]/);
  if (parameterStart === -1) return false;

  return location
    .slice(parameterStart + 1)
    .split(/[&#]/)
    .some((parameter) => {
      const rawKey = parameter.split("=", 1)[0].replace(/\+/g, " ");
      let key = rawKey;

      try {
        key = decodeURIComponent(rawKey);
      } catch {
        // A malformed escape cannot conceal a literal sensitive key.
      }

      return OAUTH_LOG_SENSITIVE_QUERY_KEY_SET.has(key.toLowerCase());
    });
}

function stripLocationParameters(location: string): string {
  const parameterStart = location.search(/[?#]/);
  return parameterStart === -1 ? location : location.slice(0, parameterStart);
}

/** Keep redirect destinations observable without logging OAuth credentials. */
export function sanitizeResponseForLogging<T extends SerializedLogResponse>(response: T): T {
  const location = response.headers?.location;
  if (typeof location !== "string" || !containsSensitiveLocationParameter(location)) {
    return response;
  }

  return {
    ...response,
    headers: {
      ...response.headers,
      location: stripLocationParameters(location),
    },
  };
}
