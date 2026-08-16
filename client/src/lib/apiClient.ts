import { refreshAccessToken } from "../auth/services/refresh.api";

import {
  clearTokens,
  getAccessToken,
} from "../auth/utils/tokenStorage";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:5001";

export class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getResponseMessage(
  response: Response
): Promise<string> {
  try {
    const body = await response.json();

    if (
      typeof body?.message === "string"
    ) {
      return body.message;
    }
  } catch {
    // Fall back to the HTTP status.
  }

  return (
    response.statusText ||
    "Request failed."
  );
}

function createHeaders(
  options: RequestInit,
  accessToken: string | null
): Headers {
  const headers = new Headers(
    options.headers
  );

  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`
    );
  } else {
    headers.delete("Authorization");
  }

  return headers;
}

function sendRequest(
  path: string,
  options: RequestInit,
  accessToken: string | null
): Promise<Response> {
  return fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: createHeaders(
        options,
        accessToken
      ),
      credentials: "include",
    }
  );
}

async function parseResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    throw new ApiError(
      await getResponseMessage(response),
      response.status
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function executeRequest<T>(
  path: string,
  options: RequestInit,
  allowRefresh: boolean
): Promise<T> {
  const response = await sendRequest(
    path,
    options,
    getAccessToken()
  );

  if (
    response.status !== 401 ||
    !allowRefresh
  ) {
    return parseResponse<T>(response);
  }

  try {
    const accessToken =
      await refreshAccessToken();

    const retryResponse =
      await sendRequest(
        path,
        options,
        accessToken
      );

    return parseResponse<T>(
      retryResponse
    );
  } catch (error) {
    clearTokens();

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      await getResponseMessage(response),
      response.status
    );
  }
}

export function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return executeRequest<T>(
    path,
    options,
    true
  );
}

/**
 * Execute a request without replaying a state-changing operation after a
 * 401 response. Destructive authentication mutations must not be retried.
 */
export function apiRequestWithoutRefresh<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return executeRequest<T>(
    path,
    options,
    false
  );
}
