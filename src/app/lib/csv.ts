export type CsvCellValue = string | number | boolean | null | undefined;

function formatCsvCell(value: CsvCellValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);
  if (!/[",\n\r]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, "\"\"")}"`;
}

function normalizeFileName(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized.length > 0 ? normalized : "export";
}

export function downloadCsvFile(filenameBase: string, headers: string[], rows: CsvCellValue[][]): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const lines = [headers, ...rows].map((row) => row.map((cell) => formatCsvCell(cell)).join(","));
  const csvContent = lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `${normalizeFileName(filenameBase)}-${timestamp}.csv`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 0);
}
