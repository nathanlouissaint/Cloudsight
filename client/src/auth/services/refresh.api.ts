import {
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "../utils/tokenStorage";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:5001";

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken =
    getRefreshToken();

  if (!refreshToken) {
    throw new Error(
      "Missing refresh token."
    );
  }

  const response = await fetch(
    `${API_URL}/auth/refresh`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Refresh token request failed."
    );
  }

  const result =
    (await response.json()) as RefreshResponse;

  setAccessToken(
    result.accessToken
  );

  setRefreshToken(
    result.refreshToken
  );

  return result.accessToken;
}