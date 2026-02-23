export type CableColorId = string;

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
