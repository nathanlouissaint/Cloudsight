import { apiRequest, apiRequestBlob } from "./client";

export interface ReportNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export async function exportReportCsv() {
  const blob = await apiRequestBlob("/reports/export/csv");

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
  return apiRequest<ReportNote>("/reports/notes", {
    method: "POST",
    body: { title, content },
  });
}

export async function updateReportNote(
  id: string,
  title: string,
  content: string
) {
  return apiRequest<ReportNote>(`/reports/notes/${id}`, {
    method: "PUT",
    body: { title, content },
  });
}

export async function deleteReportNote(
  id: string
) {
  await apiRequest<void>(`/reports/notes/${id}`, { method: "DELETE" });
}
