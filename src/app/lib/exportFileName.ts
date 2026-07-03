export function normalizeFileNamePart(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized.length > 0 ? normalized : null;
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function toFilesystemSafeTimestamp(exportedAtIso: string): string {
  const exportedAt = new Date(exportedAtIso);
  if (Number.isNaN(exportedAt.getTime())) {
    return exportedAtIso.replace(/\.\d{3}(?=Z$)/, "").replace(/[:.]/g, "-").replace("T", "_").replace(/Z$/i, "");
  }

  const year = exportedAt.getUTCFullYear();
  const month = pad2(exportedAt.getUTCMonth() + 1);
  const day = pad2(exportedAt.getUTCDate());
  const hour = pad2(exportedAt.getUTCHours());
  const minute = pad2(exportedAt.getUTCMinutes());
  const second = pad2(exportedAt.getUTCSeconds());
  return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
}

/**
 * Maximum combined length (in characters) of the joined, sanitized name segment
 * used in a grouped export filename before truncation kicks in. Keeps filenames
 * within filesystem limits while still naming every selection in typical cases.
 */
export const GROUPED_FILE_NAME_MAX_NAME_LENGTH = 120;

/**
 * Builds a grouped export filename base that includes every selected
 * harness/network label in deterministic (selection) order. When the joined
 * names would exceed the length cap, the overflow names are dropped and a
 * stable `-plus-<n>-more` suffix documents how many were omitted.
 */
export function buildGroupedFileNameBase(
  prefix: string,
  names: Array<string | null | undefined>,
  maxNameLength: number = GROUPED_FILE_NAME_MAX_NAME_LENGTH
): string {
  const normalizedNames = names.flatMap((name) => {
    const normalized = normalizeFileNamePart(name);
    return normalized === null ? [] : [normalized];
  });
  if (normalizedNames.length === 0) {
    return prefix;
  }

  const included: string[] = [];
  let length = 0;
  for (const name of normalizedNames) {
    const addition = (included.length === 0 ? 0 : 1) + name.length;
    if (included.length > 0 && length + addition > maxNameLength) {
      break;
    }
    included.push(name);
    length += addition;
  }

  const omitted = normalizedNames.length - included.length;
  const joined = included.join("-");
  return omitted > 0 ? `${prefix}-${joined}-plus-${omitted}-more` : `${prefix}-${joined}`;
}

export function buildTimestampedFileName(
  parts: Array<string | null | undefined>,
  extension: string,
  exportedAtIso: string = new Date().toISOString(),
  fallbackBase = "export"
): string {
  const normalizedParts = parts.flatMap((part) => {
    const normalized = normalizeFileNamePart(part);
    return normalized === null ? [] : [normalized];
  });
  const baseName = normalizedParts.length > 0 ? normalizedParts.join("-") : fallbackBase;
  return `${baseName}-${toFilesystemSafeTimestamp(exportedAtIso)}.${extension}`;
}
