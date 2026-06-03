import type {
  CatalogItem,
  Connector,
  PinElectricalRole,
  PinElectricalRoleKind
} from "./entities";

export const PIN_ELECTRICAL_ROLE_KINDS: readonly PinElectricalRoleKind[] = [
  "source",
  "consumer",
  "passive",
  "bidirectional"
];

const DEFAULT_PASSIVE_ROLE: PinElectricalRole = { role: "passive" };

export function getDefaultPinElectricalRole(): PinElectricalRole {
  return { ...DEFAULT_PASSIVE_ROLE };
}

function isPinElectricalRoleKind(value: unknown): value is PinElectricalRoleKind {
  return (
    value === "source" ||
    value === "consumer" ||
    value === "passive" ||
    value === "bidirectional"
  );
}

function normalizeOptionalCurrent(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return undefined;
  }
  return value;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizePinElectricalRole(value: unknown): PinElectricalRole | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const candidate = value as Partial<PinElectricalRole> & { role?: unknown };
  if (!isPinElectricalRoleKind(candidate.role)) {
    return undefined;
  }
  const result: PinElectricalRole = { role: candidate.role };
  const currentA = normalizeOptionalCurrent(candidate.currentA);
  if (currentA !== undefined) {
    result.currentA = currentA;
  }
  const label = normalizeOptionalString(candidate.label);
  if (label !== undefined) {
    result.label = label;
  }
  const notes = normalizeOptionalString(candidate.notes);
  if (notes !== undefined) {
    result.notes = notes;
  }
  return result;
}

export interface NormalizePinElectricalRolesMapResult {
  value: Record<number, PinElectricalRole>;
  warnings: string[];
}

export interface NormalizePinElectricalRolesMapOptions {
  cavityCount?: number;
  context?: string;
}

export function normalizePinElectricalRolesMap(
  value: unknown,
  options: NormalizePinElectricalRolesMapOptions = {}
): NormalizePinElectricalRolesMapResult {
  const result: Record<number, PinElectricalRole> = {};
  const warnings: string[] = [];
  if (!value || typeof value !== "object") {
    return { value: result, warnings };
  }
  const { cavityCount, context } = options;
  const contextPrefix = context ? `${context}: ` : "";
  const entries = Object.entries(value as Record<string, unknown>);
  for (const [key, entryValue] of entries) {
    const cavityIndex = Number(key);
    if (!Number.isInteger(cavityIndex) || cavityIndex < 1) {
      warnings.push(`${contextPrefix}invalid cavity index '${key}' dropped`);
      continue;
    }
    if (typeof cavityCount === "number" && cavityIndex > cavityCount) {
      warnings.push(
        `${contextPrefix}cavity ${cavityIndex} exceeds cavity count ${cavityCount}; entry dropped`
      );
      continue;
    }
    const normalized = normalizePinElectricalRole(entryValue);
    if (!normalized) {
      warnings.push(`${contextPrefix}cavity ${cavityIndex} has invalid role payload; entry dropped`);
      continue;
    }
    result[cavityIndex] = normalized;
  }
  return { value: result, warnings };
}

function mergePinElectricalRoles(
  override: PinElectricalRole | undefined,
  fallback: PinElectricalRole | undefined
): PinElectricalRole {
  if (!override && !fallback) {
    return getDefaultPinElectricalRole();
  }
  if (!override && fallback) {
    return { ...fallback };
  }
  if (override && !fallback) {
    return { ...override };
  }
  const merged: PinElectricalRole = { role: override!.role };
  const currentA = override!.currentA ?? fallback!.currentA;
  if (currentA !== undefined) {
    merged.currentA = currentA;
  }
  const label = override!.label ?? fallback!.label;
  if (label !== undefined) {
    merged.label = label;
  }
  const notes = override!.notes ?? fallback!.notes;
  if (notes !== undefined) {
    merged.notes = notes;
  }
  return merged;
}

export type PinElectricalRoleSource = "override" | "catalog" | "default";

export interface ResolvedPinElectricalRoleDescriptor {
  role: PinElectricalRole;
  source: PinElectricalRoleSource;
}

export function resolvePinElectricalRoleDescriptor(
  connector: Pick<Connector, "pinElectricalRoles"> | undefined,
  catalogItem: Pick<CatalogItem, "connectorDefaults"> | undefined,
  cavityIndex: number
): ResolvedPinElectricalRoleDescriptor {
  const override = connector?.pinElectricalRoles?.[cavityIndex];
  const catalogDefault = catalogItem?.connectorDefaults?.pinElectricalRoles?.[cavityIndex];
  if (override) {
    return { role: mergePinElectricalRoles(override, catalogDefault), source: "override" };
  }
  if (catalogDefault) {
    return { role: { ...catalogDefault }, source: "catalog" };
  }
  return { role: getDefaultPinElectricalRole(), source: "default" };
}

export function resolvePinElectricalRole(
  connector: Pick<Connector, "pinElectricalRoles"> | undefined,
  catalogItem: Pick<CatalogItem, "connectorDefaults"> | undefined,
  cavityIndex: number
): PinElectricalRole {
  return resolvePinElectricalRoleDescriptor(connector, catalogItem, cavityIndex).role;
}
