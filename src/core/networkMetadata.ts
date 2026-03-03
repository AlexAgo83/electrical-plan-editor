export const NETWORK_AUTHOR_MAX_LENGTH = 80;
export const NETWORK_PROJECT_CODE_MAX_LENGTH = 40;
export const NETWORK_LOGO_URL_MAX_LENGTH = 2048;
export const NETWORK_EXPORT_NOTES_MAX_LENGTH = 2000;
export const NETWORK_EXPORT_NOTES_MAX_LINES = 8;

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
