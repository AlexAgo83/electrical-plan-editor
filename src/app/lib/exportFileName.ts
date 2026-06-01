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

  const year = exportedAt.getFullYear();
  const month = pad2(exportedAt.getMonth() + 1);
  const day = pad2(exportedAt.getDate());
  const hour = pad2(exportedAt.getHours());
  const minute = pad2(exportedAt.getMinutes());
  const second = pad2(exportedAt.getSeconds());
  return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
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
