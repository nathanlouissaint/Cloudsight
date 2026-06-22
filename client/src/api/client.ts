/*
|--------------------------------------------------------------------------
| CloudSight API Client
|--------------------------------------------------------------------------
|
| Responsible for:
| - HTTP requests
| - Base URL management
| - Error handling
| - Authentication headers
|
| Every hook communicates through this client.
|
*/

const API_BASE =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api"\;

export async function apiRequest<T>(
  endpoint: string
): Promise<T> {
  const response = await fetch(
    `${API_BASE}${endpoint}`
  );

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status}`
    );
  }

  return response.json();
}
