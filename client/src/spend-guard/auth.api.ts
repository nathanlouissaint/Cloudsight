import { apiRequest, refreshAccessToken } from "../api/client";
import type { AuthUser } from "../auth/auth.store";

export type { AuthUser };

export interface AuthResponse {
  accessToken: string;
  token?: string;
  user: AuthUser;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SpendGuardRegistration extends AuthCredentials {
  name: string;
  company: string;
}

export function registerSpendGuardUser(registration: SpendGuardRegistration) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: registration,
    skipAuthRefresh: true,
    skipAuthHeader: true,
  });
}

export function loginAuth(credentials: AuthCredentials) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: credentials,
    skipAuthRefresh: true,
    skipAuthHeader: true,
  });
}

export function refreshAuth() {
  return refreshAccessToken();
}

export function logoutAuth() {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
    skipAuthRefresh: true,
  });
}

export function getCurrentUser() {
  return apiRequest<AuthUser>("/auth/me");
}
