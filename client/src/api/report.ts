import {
  apiBlobRequest,
  apiRequest,
} from "../lib/apiClient";

export interface ReportNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export async function exportReportCsv() {
  const blob =
    await apiBlobRequest(
      "/reports/export/csv",
    );

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

export function getReportNotes() {
  return apiRequest<ReportNote[]>(
    "/reports/notes",
  );
}

export function createReportNote(
  title: string,
  content: string,
) {
  return apiRequest<ReportNote>(
    "/reports/notes",
    {
      method: "POST",
      body: JSON.stringify({
        title,
        content,
      }),
    },
  );
}

export function updateReportNote(
  id: string,
  title: string,
  content: string,
) {
  return apiRequest<ReportNote>(
    `/reports/notes/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        title,
        content,
      }),
    },
  );
}

export function deleteReportNote(
  id: string,
) {
  return apiRequest<void>(
    `/reports/notes/${id}`,
    {
      method: "DELETE",
    },
  );
}
