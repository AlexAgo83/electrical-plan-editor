import type { WireMaterial } from "./entities";

export const STANDARD_WIRE_SECTION_MM2_VALUES = [0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120] as const;
export const DEFAULT_WIRE_MATERIAL: WireMaterial = "copper";

const MATERIAL_RESISTIVITY_OHM_MM2_PER_M: Record<WireMaterial, number> = {
  copper: 0.0175,
  aluminum: 0.0282
};

const DEFAULT_ALLOWED_VOLTAGE_DROP_RATIO = 0.03;

function normalizePositiveNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

export function normalizeNetworkVoltageV(value: unknown): number | undefined {
  return normalizePositiveNumber(value);
}

export function normalizeWireCurrentA(value: unknown): number | undefined {
  return normalizePositiveNumber(value);
}

export function normalizeWireMaterial(value: unknown): WireMaterial | undefined {
  return value === "copper" || value === "aluminum" ? value : undefined;
}

export function resolveWireMaterial(value: unknown, fallback: WireMaterial = DEFAULT_WIRE_MATERIAL): WireMaterial {
  return normalizeWireMaterial(value) ?? fallback;
}

export function normalizeRecommendedWireSectionMm2(value: unknown): number | null {
  const normalized = normalizePositiveNumber(value);
  if (normalized === undefined) {
    return null;
  }

  for (const standardValue of STANDARD_WIRE_SECTION_MM2_VALUES) {
    if (normalized <= standardValue) {
      return standardValue;
    }
  }

  return STANDARD_WIRE_SECTION_MM2_VALUES[STANDARD_WIRE_SECTION_MM2_VALUES.length - 1] ?? null;
}

export interface WireSectionRecommendationInput {
  currentA?: number;
  material?: WireMaterial;
  voltageV?: number;
  lengthMm?: number;
}

export function computeRecommendedWireSectionMm2({
  currentA,
  material,
  voltageV,
  lengthMm
}: WireSectionRecommendationInput): number | null {
  const normalizedCurrentA = normalizeWireCurrentA(currentA);
  const normalizedVoltageV = normalizeNetworkVoltageV(voltageV);
  const normalizedLengthMm = normalizePositiveNumber(lengthMm);
  if (normalizedCurrentA === undefined || normalizedVoltageV === undefined || normalizedLengthMm === undefined) {
    return null;
  }

  const resolvedMaterial = resolveWireMaterial(material);
  const resistivity = MATERIAL_RESISTIVITY_OHM_MM2_PER_M[resolvedMaterial];
  const lengthM = normalizedLengthMm / 1_000;
  const theoreticalSectionMm2 =
    (2 * resistivity * lengthM * normalizedCurrentA) / (normalizedVoltageV * DEFAULT_ALLOWED_VOLTAGE_DROP_RATIO);

  return normalizeRecommendedWireSectionMm2(theoreticalSectionMm2);
}
