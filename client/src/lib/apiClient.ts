import {
  getAccessToken,
  removeAccessToken,
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

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

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

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  if (response.status === 401) {
    removeAccessToken();
  }

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
