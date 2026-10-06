import { authStore } from "../auth/auth.store";
import type { AuthUser } from "../auth/auth.store";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
  skipAuthRefresh?: boolean;
  skipAuthHeader?: boolean;
}

export interface RefreshedAuthResponse {
  accessToken: string;
  user: AuthUser;
}

let refreshPromise: Promise<RefreshedAuthResponse> | null = null;

async function parseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");
  return contentType?.includes("application/json") ? response.json() : null;
}

function getErrorMessage(data: unknown, status: number) {
  return data && typeof data === "object" && "message" in data && typeof data.message === "string"
    ? data.message
    : `Request failed: ${status}`;
}

async function requestRefresh(): Promise<RefreshedAuthResponse> {
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  const data = await parseJson(response);
  if (!response.ok || !data || typeof data !== "object" || !("accessToken" in data) || typeof data.accessToken !== "string" || !("user" in data) || !data.user || typeof data.user !== "object" || !("id" in data.user) || typeof data.user.id !== "string" || !("email" in data.user) || typeof data.user.email !== "string") {
    authStore.clear();
    throw new Error(getErrorMessage(data, response.status));
  }
  const refreshed = { accessToken: data.accessToken, user: { id: data.user.id, email: data.user.email } };
  authStore.setAuthenticated(refreshed.accessToken, refreshed.user);
  return refreshed;
}

export function refreshAccessToken() {
  if (!refreshPromise) refreshPromise = requestRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

async function fetchWithAuthRetry(endpoint: string, options: ApiRequestOptions): Promise<Response> {
  const { method = "GET", body, token, skipAuthRefresh = false, skipAuthHeader = false } = options;
  const serializedBody = body === undefined ? undefined : JSON.stringify(body);
  const send = (accessToken: string | null) => {
    const headers = new Headers({ Accept: "application/json" });
    if (serializedBody !== undefined) headers.set("Content-Type", "application/json");
    if (!skipAuthHeader && (token ?? accessToken)) headers.set("Authorization", `Bearer ${token ?? accessToken}`);
    return fetch(`${API_BASE}${endpoint}`, { method, headers, body: serializedBody, credentials: "include" });
  };
  let response = await send(authStore.getAccessToken());
  if (response.status !== 401 || skipAuthRefresh || endpoint.startsWith("/auth/")) return response;
  try {
    const refreshed = await refreshAccessToken();
    response = await send(refreshed.accessToken);
  } catch {
    authStore.clear();
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (response.status === 401) {
    authStore.clear();
    throw new Error("Your session has expired. Please sign in again.");
  }
  return response;
}

export async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await fetchWithAuthRetry(endpoint, options);
  const data = await parseJson(response);
  if (!response.ok) throw new Error(getErrorMessage(data, response.status));
  return data as T;
}

export async function apiRequestBlob(endpoint: string, options: ApiRequestOptions = {}): Promise<Blob> {
  const response = await fetchWithAuthRetry(endpoint, options);
  if (!response.ok) {
    const data = await parseJson(response);
    throw new Error(getErrorMessage(data, response.status));
  }
  return response.blob();
}
