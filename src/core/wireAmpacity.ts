import type { Network, WireMaterial } from "./entities";
import { STANDARD_WIRE_SECTION_MM2_VALUES } from "./wireSizing";

const COPPER_AMPACITY_A_BY_SECTION_MM2: Record<number, number> = {
  0.5: 11,
  0.75: 15,
  1: 19,
  1.5: 24,
  2.5: 32,
  4: 42,
  6: 54,
  10: 73,
  16: 98,
  25: 129,
  35: 158,
  50: 198,
  70: 245,
  95: 292,
  120: 344
};

export const DEFAULT_COPPER_AMPACITY_A_BY_SECTION_MM2: Readonly<Record<number, number>> =
  COPPER_AMPACITY_A_BY_SECTION_MM2;

const COPPER_RESISTIVITY = 0.0175;
const ALUMINUM_RESISTIVITY = 0.0282;
const ALUMINUM_DERIVATION_RATIO = COPPER_RESISTIVITY / ALUMINUM_RESISTIVITY;

const STANDARD_SECTION_SET = new Set<number>(STANDARD_WIRE_SECTION_MM2_VALUES);

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function getStandardCopperDefault(sectionMm2: number): number | undefined {
  return COPPER_AMPACITY_A_BY_SECTION_MM2[sectionMm2];
}

export interface NormalizeAmpacityOverridesResult {
  value: Record<number, number>;
  warnings: string[];
}

export function normalizeAmpacityOverrides(value: unknown): NormalizeAmpacityOverridesResult {
  const result: Record<number, number> = {};
  const warnings: string[] = [];
  if (!value || typeof value !== "object") {
    return { value: result, warnings };
  }
  const entries = Object.entries(value as Record<string, unknown>);
  for (const [key, entryValue] of entries) {
    const sectionMm2 = Number(key);
    if (!Number.isFinite(sectionMm2) || !STANDARD_SECTION_SET.has(sectionMm2)) {
      warnings.push(`Ampacity override for non-standard section '${key}' dropped`);
      continue;
    }
    if (typeof entryValue !== "number" || !Number.isFinite(entryValue) || entryValue <= 0) {
      warnings.push(`Ampacity override for section ${sectionMm2} must be a positive number; entry dropped`);
      continue;
    }
    result[sectionMm2] = entryValue;
  }
  return { value: result, warnings };
}

export function resolveCopperAmpacityA(
  sectionMm2: number,
  network: Pick<Network, "ampacityOverrides"> | undefined
): number | undefined {
  const override = network?.ampacityOverrides?.[sectionMm2];
  if (typeof override === "number" && Number.isFinite(override) && override > 0) {
    return override;
  }
  return getStandardCopperDefault(sectionMm2);
}

export function resolveAmpacityA(
  sectionMm2: number,
  material: WireMaterial,
  network: Pick<Network, "ampacityOverrides"> | undefined
): number | undefined {
  const copperValue = resolveCopperAmpacityA(sectionMm2, network);
  if (copperValue === undefined) {
    return undefined;
  }
  if (material === "aluminum") {
    return roundOneDecimal(copperValue * ALUMINUM_DERIVATION_RATIO);
  }
  return copperValue;
}
