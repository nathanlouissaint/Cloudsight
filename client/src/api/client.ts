const API_BASE =
  import.meta.env.VITE_API_URL ??
  "/api";

interface ApiRequestOptions {
  method?:
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";

  body?: unknown;

  token?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    token,
  } = options;

  const headers =
    new Headers();

  headers.set(
    "Accept",
    "application/json",
  );

  if (body !== undefined) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      method,
      headers,
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    },
  );

  const contentType =
    response.headers.get(
      "content-type",
    );

  const isJson =
    contentType?.includes(
      "application/json",
    );

  const data = isJson
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : `Request failed: ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}
