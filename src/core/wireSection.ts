export const DEFAULT_WIRE_SECTION_MM2 = 0.5;

export function normalizeWireSectionMm2(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

export function resolveWireSectionMm2(value: unknown, fallback = DEFAULT_WIRE_SECTION_MM2): number {
  const normalized = normalizeWireSectionMm2(value);
  if (normalized !== null) {
    return normalized;
  }

  const normalizedFallback = normalizeWireSectionMm2(fallback);
  return normalizedFallback ?? DEFAULT_WIRE_SECTION_MM2;
}
