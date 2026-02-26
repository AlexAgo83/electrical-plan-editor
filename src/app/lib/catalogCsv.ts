import type { CatalogItem } from "../../core/entities";
import { isValidCatalogUrlInput, normalizeManufacturerReferenceKey } from "../../store";
import type { CsvCellValue } from "./csv";

export const CATALOG_CSV_HEADERS = [
  "Manufacturer reference",
  "Connection count",
  "Name",
  "Unit price (excl. tax)",
  "URL"
] as const;

export interface CatalogCsvImportRow {
  manufacturerReference: string;
  connectionCount: number;
  name?: string;
  unitPriceExclTax?: number;
  url?: string;
}

export interface CatalogCsvImportIssue {
  kind: "error" | "warning";
  rowNumber: number;
  message: string;
}

export interface CatalogCsvImportParseResult {
  rows: CatalogCsvImportRow[];
  issues: CatalogCsvImportIssue[];
}

type ParsedCsvRow = string[];

function parseCsvRows(text: string): ParsedCsvRow[] {
  const rows: ParsedCsvRow[] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let index = 0;
  let inQuotes = false;

  while (index < text.length) {
    const char = text[index];

    if (inQuotes) {
      if (char === "\"") {
        const nextChar = text[index + 1];
        if (nextChar === "\"") {
          currentCell += "\"";
          index += 2;
          continue;
        }
        inQuotes = false;
        index += 1;
        continue;
      }
      currentCell += char;
      index += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
      index += 1;
      continue;
    }
    if (char === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      index += 1;
      continue;
    }
    if (char === "\r") {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      index += text[index + 1] === "\n" ? 2 : 1;
      continue;
    }
    if (char === "\n") {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      index += 1;
      continue;
    }

    currentCell += char;
    index += 1;
  }

  if (inQuotes) {
    throw new Error("CSV contains an unterminated quoted field.");
  }

  currentRow.push(currentCell);
  const isSingleEmptyRow = rows.length === 0 && currentRow.length === 1 && currentRow[0] === "";
  if (!isSingleEmptyRow) {
    rows.push(currentRow);
  }

  return rows;
}

function normalizeOptionalText(value: string): string | undefined {
  const normalized = value.trim();
  return normalized.length === 0 ? undefined : normalized;
}

function parseStrictNonNegativeNumber(raw: string): number | undefined {
  const normalized = raw.trim().replace(",", ".");
  if (normalized.length === 0) {
    return undefined;
  }
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return Number.NaN;
  }
  return parsed;
}

export function buildCatalogCsvExport(catalogItems: CatalogItem[]): { headers: string[]; rows: CsvCellValue[][] } {
  const rows = [...catalogItems]
    .sort((left, right) => left.manufacturerReference.localeCompare(right.manufacturerReference, undefined, { sensitivity: "base" }))
    .map<CsvCellValue[]>((item) => [
      item.manufacturerReference,
      item.connectionCount,
      item.name ?? "",
      item.unitPriceExclTax ?? "",
      item.url ?? ""
    ]);

  return {
    headers: [...CATALOG_CSV_HEADERS],
    rows
  };
}

export function parseCatalogCsvImportText(text: string): CatalogCsvImportParseResult {
  const rows = parseCsvRows(text);
  if (rows.length === 0) {
    return {
      rows: [],
      issues: [{ kind: "error", rowNumber: 1, message: "CSV is empty." }]
    };
  }

  const headerRow = rows[0]?.map((value) => value.replace(/^\uFEFF/, "")) ?? [];
  const expectedHeaders = [...CATALOG_CSV_HEADERS];
  const issues: CatalogCsvImportIssue[] = [];

  if (
    headerRow.length !== expectedHeaders.length ||
    headerRow.some((value, index) => value !== expectedHeaders[index])
  ) {
    return {
      rows: [],
      issues: [
        {
          kind: "error",
          rowNumber: 1,
          message: `Invalid CSV headers. Expected: ${expectedHeaders.join(", ")}.`
        }
      ]
    };
  }

  const dataRows = rows.slice(1);
  const rawRowsByManufacturerRef = new Map<string, { rowNumber: number; values: string[]; manufacturerReference: string }>();

  for (let dataIndex = 0; dataIndex < dataRows.length; dataIndex += 1) {
    const values = dataRows[dataIndex] ?? [];
    const rowNumber = dataIndex + 2;
    const hasAnyValue = values.some((value) => value.trim().length > 0);
    if (!hasAnyValue) {
      continue;
    }

    if (values.length !== expectedHeaders.length) {
      issues.push({
        kind: "error",
        rowNumber,
        message: `Expected ${expectedHeaders.length} columns but found ${values.length}.`
      });
      continue;
    }

    const manufacturerReference = values[0]?.trim() ?? "";
    if (manufacturerReference.length === 0) {
      issues.push({
        kind: "error",
        rowNumber,
        message: "Manufacturer reference is required."
      });
      continue;
    }

    const manufacturerReferenceKey = normalizeManufacturerReferenceKey(manufacturerReference);
    if (manufacturerReferenceKey === undefined) {
      issues.push({
        kind: "error",
        rowNumber,
        message: "Manufacturer reference is required."
      });
      continue;
    }

    const existing = rawRowsByManufacturerRef.get(manufacturerReferenceKey);
    if (existing !== undefined) {
      issues.push({
        kind: "error",
        rowNumber,
        message: `Duplicate manufacturer reference '${manufacturerReference}' in import file (already defined at row ${existing.rowNumber}).`
      });
      continue;
    }
    rawRowsByManufacturerRef.set(manufacturerReferenceKey, { rowNumber, values, manufacturerReference });
  }

  const parsedRows: CatalogCsvImportRow[] = [];
  for (const { rowNumber, values, manufacturerReference } of rawRowsByManufacturerRef.values()) {
    const connectionCountText = values[1]?.trim() ?? "";
    const connectionCount = Number(connectionCountText);
    if (!Number.isFinite(connectionCount) || !Number.isInteger(connectionCount) || connectionCount < 1) {
      issues.push({
        kind: "error",
        rowNumber,
        message: "Connection count must be an integer >= 1."
      });
      continue;
    }

    const unitPriceExclTax = parseStrictNonNegativeNumber(values[3] ?? "");
    if (Number.isNaN(unitPriceExclTax)) {
      issues.push({
        kind: "error",
        rowNumber,
        message: "Unit price (excl. tax) must be a valid number >= 0 when provided."
      });
      continue;
    }

    const url = normalizeOptionalText(values[4] ?? "");
    if (url !== undefined && !isValidCatalogUrlInput(url)) {
      issues.push({
        kind: "error",
        rowNumber,
        message: "URL must be empty or a valid absolute http/https URL."
      });
      continue;
    }

    parsedRows.push({
      manufacturerReference,
      connectionCount,
      name: normalizeOptionalText(values[2] ?? ""),
      unitPriceExclTax,
      url
    });
  }

  return {
    rows: parsedRows,
    issues: issues.sort((left, right) => left.rowNumber - right.rowNumber || left.kind.localeCompare(right.kind))
  };
}
