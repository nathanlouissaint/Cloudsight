const API_BASE =
  import.meta.env.VITE_API_URL ??
  "http://localhost:5001";

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
