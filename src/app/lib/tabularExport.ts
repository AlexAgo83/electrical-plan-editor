import { buildCsvContent, type CsvCellValue } from "./csv";
import type { Workbook, Worksheet } from "exceljs";
import { buildTimestampedFileName, normalizeFileNamePart } from "./exportFileName";

export type TabularExportFormat = "csv" | "xlsx";

export interface TabularWorksheetExport {
  name: string;
  headers: string[];
  rows: CsvCellValue[][];
  freezeHeaderRow?: boolean;
  autoFilter?: boolean;
  configureWorksheet?: (worksheet: Worksheet) => void;
}

function measureCellWidth(value: CsvCellValue): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return String(value).length;
}

function addWorksheet(workbook: Workbook, sheet: TabularWorksheetExport): void {
  const worksheet = workbook.addWorksheet(sheet.name);
  worksheet.addRow(sheet.headers);
  for (const row of sheet.rows) {
    worksheet.addRow(row);
  }

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEDEDED" }
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFB8B8B8" } },
      left: { style: "thin", color: { argb: "FFB8B8B8" } },
      bottom: { style: "thin", color: { argb: "FFB8B8B8" } },
      right: { style: "thin", color: { argb: "FFB8B8B8" } }
    };
  });

  if (sheet.freezeHeaderRow === true) {
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
  }
  if (sheet.autoFilter === true) {
    worksheet.autoFilter = {
      from: "A1",
      to: {
        row: 1,
        column: Math.max(1, sheet.headers.length)
      }
    };
  }

  sheet.configureWorksheet?.(worksheet);

  const allRows = [sheet.headers, ...sheet.rows];
  worksheet.columns = sheet.headers.map((header, columnIndex) => {
    const maxWidth = allRows.reduce((current, row) => Math.max(current, measureCellWidth(row[columnIndex])), header.length);
    return {
      width: Math.min(60, Math.max(10, maxWidth + 2))
    };
  });

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: rowNumber === 1 ? "center" : "left",
        wrapText: true
      };
    });
  });
}

function downloadBlob(blob: Blob, filenameBase: string, extension: "csv" | "xlsx"): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = buildTimestampedFileName([normalizeFileNamePart(filenameBase) ?? "export"], extension);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 0);
}

export async function downloadTabularWorkbookFile(
  filenameBase: string,
  sheets: TabularWorksheetExport[]
): Promise<void> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "electrical-plan-editor";
  workbook.created = new Date();
  workbook.modified = new Date();
  for (const sheet of sheets) {
    addWorksheet(workbook, sheet);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  downloadBlob(blob, filenameBase, "xlsx");
}

export async function downloadTabularCsvOrXlsxFile(
  filenameBase: string,
  format: TabularExportFormat,
  sheet: TabularWorksheetExport,
  options?: { includeUtf8Bom?: boolean }
): Promise<void> {
  if (format === "xlsx") {
    await downloadTabularWorkbookFile(filenameBase, [sheet]);
    return;
  }

  const csvContent = buildCsvContent(sheet.headers, sheet.rows);
  const payload = options?.includeUtf8Bom ? `\uFEFF${csvContent}` : csvContent;
  const blob = new Blob([payload], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, filenameBase, "csv");
}
