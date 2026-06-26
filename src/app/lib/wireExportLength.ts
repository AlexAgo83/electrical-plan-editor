import type { Wire } from "../../core/entities";

export const DEFAULT_WIRE_EXPORT_STRIPPING_ALLOWANCE_MM = 20;
export const DEFAULT_WIRE_EXPORT_TWISTED_PAIR_LENGTH_COEFFICIENT = 1.075;

export interface WireExportLengthPreferences {
  strippingAllowanceMm?: number;
  twistedPairLengthCoefficient?: number;
}

function parseFiniteNumber(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number(value.replace(",", ".")) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}

export function normalizeWireExportStrippingAllowanceMm(value: unknown): number {
  const parsed = parseFiniteNumber(value);
  return parsed === null || parsed < 0 ? DEFAULT_WIRE_EXPORT_STRIPPING_ALLOWANCE_MM : parsed;
}

export function normalizeWireExportTwistedPairLengthCoefficient(value: unknown): number {
  const parsed = parseFiniteNumber(value);
  return parsed === null || parsed <= 0 ? DEFAULT_WIRE_EXPORT_TWISTED_PAIR_LENGTH_COEFFICIENT : parsed;
}

export function normalizeWireTwistGroupExportLabel(value: string | undefined): string | null {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function buildWireTwistGroupExportCounts(wires: readonly Wire[]): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const wire of wires) {
    const label = normalizeWireTwistGroupExportLabel(wire.twistGroupLabel);
    if (label !== null) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return counts;
}

export function resolveWireExportLengthMm(
  wire: Wire,
  twistGroupCounts: ReadonlyMap<string, number>,
  preferences: WireExportLengthPreferences = {}
): number {
  const baseLengthMm = Number.isFinite(wire.lengthMm) ? wire.lengthMm : 0;
  const strippingAllowanceMm = normalizeWireExportStrippingAllowanceMm(preferences.strippingAllowanceMm);
  const twistedPairLengthCoefficient = normalizeWireExportTwistedPairLengthCoefficient(
    preferences.twistedPairLengthCoefficient
  );
  const twistGroupLabel = normalizeWireTwistGroupExportLabel(wire.twistGroupLabel);
  const coefficient = twistGroupLabel !== null && (twistGroupCounts.get(twistGroupLabel) ?? 0) >= 2
    ? twistedPairLengthCoefficient
    : 1;

  return Math.round(baseLengthMm * coefficient + strippingAllowanceMm * 2);
}

export function resolveWireUntwistedExportLengthMm(
  wire: Wire,
  twistGroupCounts: ReadonlyMap<string, number>,
  preferences: WireExportLengthPreferences = {}
): number | "" {
  const twistGroupLabel = normalizeWireTwistGroupExportLabel(wire.twistGroupLabel);
  if (twistGroupLabel === null || (twistGroupCounts.get(twistGroupLabel) ?? 0) < 2) {
    return "";
  }

  const baseLengthMm = Number.isFinite(wire.lengthMm) ? wire.lengthMm : 0;
  const strippingAllowanceMm = normalizeWireExportStrippingAllowanceMm(preferences.strippingAllowanceMm);
  return Math.round(baseLengthMm + strippingAllowanceMm * 2);
}
