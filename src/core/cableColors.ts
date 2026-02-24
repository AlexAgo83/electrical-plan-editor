export type CableColorId = string;
export const MAX_FREE_WIRE_COLOR_LABEL_LENGTH = 32;

export interface CableColorDefinition {
  id: CableColorId;
  label: string;
  hex: string;
}

export const CABLE_COLOR_CATALOG: CableColorDefinition[] = [
  { id: "BK", label: "Black", hex: "#1F1F1F" },
  { id: "WH", label: "White", hex: "#F2F2F2" },
  { id: "RD", label: "Red", hex: "#D32F2F" },
  { id: "BU", label: "Blue", hex: "#1976D2" },
  { id: "GN", label: "Green", hex: "#2E7D32" },
  { id: "YE", label: "Yellow", hex: "#FBC02D" },
  { id: "OG", label: "Orange", hex: "#F57C00" },
  { id: "VT", label: "Violet", hex: "#7B1FA2" },
  { id: "BN", label: "Brown", hex: "#6D4C41" },
  { id: "GY", label: "Gray", hex: "#757575" },
  { id: "PK", label: "Pink", hex: "#C2185B" },
  { id: "CY", label: "Cyan", hex: "#0097A7" },
  { id: "TQ", label: "Turquoise", hex: "#00897B" },
  { id: "LM", label: "Lime", hex: "#7CB342" },
  { id: "IN", label: "Indigo", hex: "#3949AB" },
  { id: "BD", label: "Bordeaux", hex: "#8E2430" },
  { id: "BG", label: "Beige", hex: "#C8B27D" },
  { id: "LB", label: "Light Blue", hex: "#4FC3F7" },
  { id: "LG", label: "Light Green", hex: "#66BB6A" },
  { id: "AM", label: "Amber", hex: "#FFB300" }
];

export const CABLE_COLOR_BY_ID: Record<string, CableColorDefinition> = Object.fromEntries(
  CABLE_COLOR_CATALOG.map((entry) => [entry.id, entry])
);

function normalizeColorId(value: unknown): CableColorId | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (normalized.length === 0) {
    return null;
  }

  return CABLE_COLOR_BY_ID[normalized] === undefined ? null : normalized;
}

export function normalizeWireColorIds(
  primaryColorId: unknown,
  secondaryColorId: unknown
): {
  primaryColorId: CableColorId | null;
  secondaryColorId: CableColorId | null;
} {
  const primary = normalizeColorId(primaryColorId);
  if (primary === null) {
    return {
      primaryColorId: null,
      secondaryColorId: null
    };
  }

  const secondary = normalizeColorId(secondaryColorId);
  if (secondary === null || secondary === primary) {
    return {
      primaryColorId: primary,
      secondaryColorId: null
    };
  }

  return {
    primaryColorId: primary,
    secondaryColorId: secondary
  };
}

export function normalizeFreeWireColorLabel(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return null;
  }

  return normalized.length > MAX_FREE_WIRE_COLOR_LABEL_LENGTH
    ? normalized.slice(0, MAX_FREE_WIRE_COLOR_LABEL_LENGTH)
    : normalized;
}

export function normalizeWireColorState(
  primaryColorId: unknown,
  secondaryColorId: unknown,
  freeColorLabel: unknown
): {
  primaryColorId: CableColorId | null;
  secondaryColorId: CableColorId | null;
  freeColorLabel: string | null;
} {
  const normalizedFreeColorLabel = normalizeFreeWireColorLabel(freeColorLabel);
  if (normalizedFreeColorLabel !== null) {
    return {
      primaryColorId: null,
      secondaryColorId: null,
      freeColorLabel: normalizedFreeColorLabel
    };
  }

  const normalizedCatalogColors = normalizeWireColorIds(primaryColorId, secondaryColorId);
  return {
    ...normalizedCatalogColors,
    freeColorLabel: null
  };
}

type WireColorLike = {
  primaryColorId?: string | null;
  secondaryColorId?: string | null;
  freeColorLabel?: string | null;
};

export function isWireFreeColorMode(value: WireColorLike): boolean {
  return normalizeFreeWireColorLabel(value.freeColorLabel) !== null;
}

export function getWireColorCode(value: WireColorLike): string {
  const freeColorLabel = normalizeFreeWireColorLabel(value.freeColorLabel);
  if (freeColorLabel !== null) {
    return `FREE:${freeColorLabel}`;
  }

  const normalized = normalizeWireColorIds(value.primaryColorId, value.secondaryColorId);
  if (normalized.primaryColorId === null) {
    return "";
  }

  return normalized.secondaryColorId === null
    ? normalized.primaryColorId
    : `${normalized.primaryColorId}/${normalized.secondaryColorId}`;
}

export function getWireColorLabel(value: WireColorLike): string {
  const freeColorLabel = normalizeFreeWireColorLabel(value.freeColorLabel);
  if (freeColorLabel !== null) {
    return `Free: ${freeColorLabel}`;
  }

  const normalized = normalizeWireColorIds(value.primaryColorId, value.secondaryColorId);
  if (normalized.primaryColorId === null) {
    return "No color";
  }

  const primary = CABLE_COLOR_BY_ID[normalized.primaryColorId];
  if (normalized.secondaryColorId === null) {
    return primary?.label ?? `Unknown (${normalized.primaryColorId})`;
  }

  const secondary = CABLE_COLOR_BY_ID[normalized.secondaryColorId];
  return `${primary?.label ?? `Unknown (${normalized.primaryColorId})`} / ${secondary?.label ?? `Unknown (${normalized.secondaryColorId})`}`;
}

export function getWireColorSortValue(value: WireColorLike): string {
  const freeColorLabel = normalizeFreeWireColorLabel(value.freeColorLabel);
  if (freeColorLabel !== null) {
    return `2:${freeColorLabel.toLocaleLowerCase()}`;
  }

  const normalized = normalizeWireColorIds(value.primaryColorId, value.secondaryColorId);
  if (normalized.primaryColorId === null) {
    return "0:";
  }

  return `1:${getWireColorCode(normalized).toLocaleLowerCase()} ${getWireColorLabel(normalized).toLocaleLowerCase()}`;
}

export function getWireColorSearchText(value: WireColorLike): string {
  const freeColorLabel = normalizeFreeWireColorLabel(value.freeColorLabel);
  if (freeColorLabel !== null) {
    return `free ${freeColorLabel}`.toLocaleLowerCase();
  }

  const normalized = normalizeWireColorIds(value.primaryColorId, value.secondaryColorId);
  if (normalized.primaryColorId === null) {
    return "no color".toLocaleLowerCase();
  }

  const code = getWireColorCode(normalized);
  const label = getWireColorLabel(normalized);
  return `${code} ${label}`.toLocaleLowerCase();
}
