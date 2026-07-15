import { apiRequest } from "./client";

export interface ReportNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export async function exportReportCsv() {
  const API_BASE =
    import.meta.env.VITE_API_URL ??
    "http://localhost:5001";

  const response = await fetch(
    `${API_BASE}/reports/export/csv`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to export report."
    );
  }

  const blob = await response.blob();

  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "cloud-cost-report.csv";

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}

export async function getReportNotes() {
  return apiRequest<ReportNote[]>(
    "/reports/notes"
  );
}

export async function createReportNote(
  title: string,
  content: string
) {
  const API_BASE =
    import.meta.env.VITE_API_URL ??
    "http://localhost:5001";

  const response = await fetch(
    `${API_BASE}/reports/notes`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        title,
        content,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to create note."
    );
  }

  return response.json();
}

export async function updateReportNote(
  id: string,
  title: string,
  content: string
) {
  const API_BASE =
    import.meta.env.VITE_API_URL ??
    "http://localhost:5001";

  const response = await fetch(
    `${API_BASE}/reports/notes/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        title,
        content,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to update note."
    );
  }

  return response.json();
}

export async function deleteReportNote(
  id: string
) {
  const API_BASE =
    import.meta.env.VITE_API_URL ??
    "http://localhost:5001";

  const response = await fetch(
    `${API_BASE}/reports/notes/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to delete note."
    );
  }
}