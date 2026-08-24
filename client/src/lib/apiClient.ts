import { refreshAccessToken } from "../auth/services/refresh.api";

import {
  clearTokens,
  getAccessToken,
} from "../auth/utils/tokenStorage";

import {
  getStoredOrganizationId,
} from "../organizations/organizationStorage";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:5001";

export class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getResponseMessage(
  response: Response,
): Promise<string> {
  try {
    const body = await response
      .clone()
      .json();

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

function getRequestPathname(
  path: string,
): string {
  return path.split("?")[0];
}

function shouldAttachOrganizationContext(
  path: string,
): boolean {
  const pathname =
    getRequestPathname(path);

  if (
    pathname === "/organizations"
  ) {
    return false;
  }

  if (
    pathname === "/auth" ||
    pathname.startsWith("/auth/")
  ) {
    return false;
  }

  return true;
}

function createHeaders(
  path: string,
  options: RequestInit,
  accessToken: string | null,
): Headers {
  const headers = new Headers(
    options.headers,
  );

  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  } else {
    headers.delete("Authorization");
  }

  if (
    shouldAttachOrganizationContext(
      path,
    )
  ) {
    const organizationId =
      getStoredOrganizationId();

    if (organizationId) {
      headers.set(
        "X-Organization-Id",
        organizationId,
      );
    } else {
      headers.delete(
        "X-Organization-Id",
      );
    }
  } else {
    headers.delete(
      "X-Organization-Id",
    );
  }

  return headers;
}

function sendRequest(
  path: string,
  options: RequestInit,
  accessToken: string | null,
): Promise<Response> {
  return fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: createHeaders(
        path,
        options,
        accessToken,
      ),
      credentials: "include",
    },
  );
}

async function executeResponseRequest(
  path: string,
  options: RequestInit,
  allowRefresh: boolean,
): Promise<Response> {
  const response = await sendRequest(
    path,
    options,
    getAccessToken(),
  );

  if (
    response.status !== 401 ||
    !allowRefresh
  ) {
    if (!response.ok) {
      throw new ApiError(
        await getResponseMessage(
          response,
        ),
        response.status,
      );
    }

    return response;
  }

  try {
    const accessToken =
      await refreshAccessToken();

    const retryResponse =
      await sendRequest(
        path,
        options,
        accessToken,
      );

    if (!retryResponse.ok) {
      throw new ApiError(
        await getResponseMessage(
          retryResponse,
        ),
        retryResponse.status,
      );
    }

    return retryResponse;
  } catch (error) {
    clearTokens();

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      await getResponseMessage(
        response,
      ),
      response.status,
    );
  }
}

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function executeRequest<T>(
  path: string,
  options: RequestInit,
  allowRefresh: boolean,
): Promise<T> {
  const response =
    await executeResponseRequest(
      path,
      options,
      allowRefresh,
    );

  return parseResponse<T>(response);
}

export function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return executeRequest<T>(
    path,
    options,
    true,
  );
}

export function apiBlobRequest(
  path: string,
  options: RequestInit = {},
): Promise<Blob> {
  return executeResponseRequest(
    path,
    options,
    true,
  ).then(
    (response) => response.blob(),
  );
}

/**
 * Execute a request without replaying a state-changing operation after a
 * 401 response. Destructive authentication mutations must not be retried.
 */
export function apiRequestWithoutRefresh<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return executeRequest<T>(
    path,
    options,
    false,
  );
}
