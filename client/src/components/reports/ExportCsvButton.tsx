import { useState } from "react";
import { exportReportCsv } from "../../api/report";

export default function ExportCsvButton() {
  const [isExporting, setIsExporting] =
    useState(false);

  async function handleExport() {
    try {
      setIsExporting(true);

      await exportReportCsv();
    } catch (error) {
      console.error(
        "CSV export failed",
        error
      );

      alert(
        "Unable to export report."
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="export-button"
    >
      {isExporting
        ? "Exporting..."
        : "Export CSV"}
    </button>
  );
}