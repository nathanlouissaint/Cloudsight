const ACCESS_TOKEN_KEY = "cloudsight.accessToken";
const REFRESH_TOKEN_KEY = "cloudsight.refreshToken";

export function getAccessToken(): string | null {
  return window.localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
}

export function setAccessToken(
  token: string
): void {
  window.localStorage.setItem(
    ACCESS_TOKEN_KEY,
    token
  );
}

export function removeAccessToken(): void {
  window.localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );
}

export function getRefreshToken(): string | null {
  return window.localStorage.getItem(
    REFRESH_TOKEN_KEY
  );
}

export function setRefreshToken(
  token: string
): void {
  window.localStorage.setItem(
    REFRESH_TOKEN_KEY,
    token
  );
}

export function removeRefreshToken(): void {
  window.localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );
}

export function clearTokens(): void {
  removeAccessToken();
  removeRefreshToken();
}