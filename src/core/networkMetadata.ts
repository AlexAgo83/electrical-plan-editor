export const NETWORK_AUTHOR_MAX_LENGTH = 80;
export const NETWORK_PROJECT_CODE_MAX_LENGTH = 40;
export const NETWORK_LOGO_URL_MAX_LENGTH = 2048;
export const NETWORK_EXPORT_NOTES_MAX_LENGTH = 2000;
export const NETWORK_EXPORT_NOTES_MAX_LINES = 8;
export const NETWORK_PLAN_REVISION_MAX_LENGTH = 40;
export const NETWORK_PLAN_PARTY_NAME_MAX_LENGTH = 80;
export const NETWORK_PLAN_PARTY_REFERENCE_MAX_LENGTH = 120;

const NETWORK_PROJECT_CODE_ALLOWED_PATTERN = /^[A-Za-z0-9 _./-]+$/;
const NETWORK_LOCAL_DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function normalizeOptionalTrimmedText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed.slice(0, maxLength);
}

export function normalizeNetworkAuthor(value: unknown): string | undefined {
  return normalizeOptionalTrimmedText(value, NETWORK_AUTHOR_MAX_LENGTH);
}

export function normalizeNetworkProjectCode(value: unknown): string | undefined {
  return normalizeOptionalTrimmedText(value, NETWORK_PROJECT_CODE_MAX_LENGTH);
}

export function isNetworkProjectCodeValid(value: string): boolean {
  return NETWORK_PROJECT_CODE_ALLOWED_PATTERN.test(value);
}

export function normalizeNetworkLogoUrl(value: unknown): string | undefined {
  return normalizeOptionalTrimmedText(value, NETWORK_LOGO_URL_MAX_LENGTH);
}

export function isNetworkLogoUrlValid(value: string): boolean {
  if (value.toLowerCase().startsWith("data:image/")) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeNetworkExportNotes(value: unknown): string | undefined {
  return normalizeOptionalTrimmedText(value, NETWORK_EXPORT_NOTES_MAX_LENGTH);
}

export function normalizeNetworkPlanRevision(value: unknown): string | undefined {
  return normalizeOptionalTrimmedText(value, NETWORK_PLAN_REVISION_MAX_LENGTH);
}

/** Plan-level manufacturer/supplier identification fields, in cartouche display order. */
export const NETWORK_PLAN_PARTY_FIELDS = [
  "planManufacturerName",
  "planManufacturerReference",
  "planSupplierName",
  "planSupplierReference"
] as const;

export type NetworkPlanPartyField = (typeof NETWORK_PLAN_PARTY_FIELDS)[number];

export type NetworkPlanParties = { [Field in NetworkPlanPartyField]?: string };

const NETWORK_PLAN_PARTY_LINE_BREAK_PATTERN = /[\r\n\u2028\u2029]/;
const NETWORK_PLAN_PARTY_LINE_BREAK_RUN_PATTERN = /[ \t]*[\r\n\u2028\u2029]+[ \t]*/g;

export function isNetworkPlanPartyNameField(field: NetworkPlanPartyField): boolean {
  return field === "planManufacturerName" || field === "planSupplierName";
}

export function getNetworkPlanPartyFieldMaxLength(field: NetworkPlanPartyField): number {
  return isNetworkPlanPartyNameField(field) ? NETWORK_PLAN_PARTY_NAME_MAX_LENGTH : NETWORK_PLAN_PARTY_REFERENCE_MAX_LENGTH;
}

/** True when the text spans several lines; plan party values are single-line. */
export function hasNetworkPlanPartyLineBreak(value: string): boolean {
  return NETWORK_PLAN_PARTY_LINE_BREAK_PATTERN.test(value);
}

/**
 * Normalizes one plan party value: non-strings and blank text become unset, line breaks become
 * single spaces, and the trimmed text is bounded. Case, punctuation and leading zeroes are kept.
 */
export function normalizeNetworkPlanPartyValue(field: NetworkPlanPartyField, value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  return normalizeOptionalTrimmedText(
    value.replace(NETWORK_PLAN_PARTY_LINE_BREAK_RUN_PATTERN, " "),
    getNetworkPlanPartyFieldMaxLength(field)
  );
}

/** Normalizes all four plan party fields; every key is present, unset ones as `undefined`. */
export function normalizeNetworkPlanParties(source: { [Field in NetworkPlanPartyField]?: unknown }): NetworkPlanParties {
  return {
    planManufacturerName: normalizeNetworkPlanPartyValue("planManufacturerName", source.planManufacturerName),
    planManufacturerReference: normalizeNetworkPlanPartyValue(
      "planManufacturerReference",
      source.planManufacturerReference
    ),
    planSupplierName: normalizeNetworkPlanPartyValue("planSupplierName", source.planSupplierName),
    planSupplierReference: normalizeNetworkPlanPartyValue("planSupplierReference", source.planSupplierReference)
  };
}

/**
 * Validates a calendar date string `YYYY-MM-DD` without any timezone conversion.
 */
export function isNetworkPlanIssueDateValid(value: string): boolean {
  const match = NETWORK_LOCAL_DATE_INPUT_PATTERN.exec(value);
  if (match === null) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
  return day <= daysInMonth;
}

/**
 * Returns the trimmed calendar date when it is a valid `YYYY-MM-DD` value, `undefined` when empty,
 * and `null` when a non-empty value is not a valid calendar date.
 */
export function normalizeNetworkPlanIssueDate(value: unknown): string | undefined | null {
  if (typeof value !== "string") {
    return value === undefined || value === null ? undefined : null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return isNetworkPlanIssueDateValid(trimmed) ? trimmed : null;
}

export function normalizeNetworkIsoTimestamp(value: unknown, fallbackIso: string): string {
  if (typeof value !== "string") {
    return fallbackIso;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return fallbackIso;
  }

  const timestamp = Date.parse(trimmed);
  if (!Number.isFinite(timestamp)) {
    return fallbackIso;
  }

  return new Date(timestamp).toISOString();
}

export function parseLocalDateInputToIso(value: string): string | null {
  const match = NETWORK_LOCAL_DATE_INPUT_PATTERN.exec(value);
  if (match === null) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (
    Number.isNaN(candidate.getTime()) ||
    candidate.getFullYear() !== year ||
    candidate.getMonth() + 1 !== month ||
    candidate.getDate() !== day
  ) {
    return null;
  }

  return candidate.toISOString();
}

function toTwoDigits(value: number): string {
  return value.toString().padStart(2, "0");
}

export function formatIsoToLocalDateInput(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  const date = new Date(timestamp);
  return `${date.getFullYear()}-${toTwoDigits(date.getMonth() + 1)}-${toTwoDigits(date.getDate())}`;
}
