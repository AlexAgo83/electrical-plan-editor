import type {
  CatalogItem,
  Connector,
  ConnectorCatalogDefaults,
  ConnectorRearBackshell,
  ConnectorPlugDefinition,
  ConnectorTerminalMaterial,
  Wire
} from "./entities";
import { normalizePinElectricalRolesMap } from "./pinElectricalRole";
import { occupantsAt } from "./connectorOccupancy";

export type BomMaterialOrigin = "catalog default" | "instance override" | "manual";

export interface ResolvedConnectorTerminalMaterial extends ConnectorTerminalMaterial {
  origin: BomMaterialOrigin;
}

export interface ResolvedConnectorPlugMaterial extends ConnectorPlugDefinition {
  origin: BomMaterialOrigin;
}

export interface ConnectorMaterialWarning {
  code:
    | "PLUG_QUANTITY_MISMATCH"
    | "PLUG_WITHOUT_UNUSED_CAVITY"
    | "TERMINAL_OVERRIDE_OUT_OF_RANGE";
  connectorId: Connector["id"];
  connectorTechnicalId: string;
  message: string;
}

export type ConnectorCavityOccupancyMap = Record<Connector["id"], Record<number, string[]>>;

function normalizeReference(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  return normalized.length === 0 ? undefined : normalized;
}

function normalizeName(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  return normalized.length === 0 ? undefined : normalized;
}

export function normalizeConnectorTerminalMaterial(
  value: Partial<ConnectorTerminalMaterial> | undefined
): ConnectorTerminalMaterial | undefined {
  if (value === undefined) {
    return undefined;
  }
  const terminalReference = normalizeReference(value.terminalReference);
  const terminalName = normalizeName(value.terminalName);
  const sealReference = normalizeReference(value.sealReference);
  const sealName = normalizeName(value.sealName);
  if (terminalReference === undefined && terminalName === undefined && sealReference === undefined && sealName === undefined) {
    return undefined;
  }
  return {
    terminalReference,
    terminalName,
    sealReference,
    sealName
  };
}

function normalizeTerminalOverrides(
  value: Record<number, ConnectorTerminalMaterial> | undefined,
  connectionCount: number
): Record<number, ConnectorTerminalMaterial> | undefined {
  if (value === undefined || typeof value !== "object") {
    return undefined;
  }

  const normalized: Record<number, ConnectorTerminalMaterial> = {};
  for (const [rawIndex, rawMaterial] of Object.entries(value)) {
    const cavityIndex = Number(rawIndex);
    if (!Number.isInteger(cavityIndex) || cavityIndex < 1 || cavityIndex > connectionCount) {
      continue;
    }
    const material = normalizeConnectorTerminalMaterial(rawMaterial);
    if (material !== undefined) {
      normalized[cavityIndex] = material;
    }
  }
  return Object.keys(normalized).length === 0 ? undefined : normalized;
}

function normalizePlugDefinition(value: Partial<ConnectorPlugDefinition> | undefined): ConnectorPlugDefinition | undefined {
  const plugReference = normalizeReference(value?.plugReference);
  const rawQuantity = value?.quantity;
  const quantity = typeof rawQuantity === "number" && Number.isFinite(rawQuantity) ? Math.trunc(rawQuantity) : 0;
  if (plugReference === undefined || quantity < 1) {
    return undefined;
  }
  return {
    plugReference,
    plugName: normalizeName(value?.plugName),
    quantity
  };
}

function normalizeRearBackshell(value: Partial<ConnectorRearBackshell> | undefined): ConnectorRearBackshell | undefined {
  if (value === undefined || value.enabled !== true) {
    return undefined;
  }
  const lengthMm = typeof value.lengthMm === "number" && Number.isFinite(value.lengthMm) ? value.lengthMm : Number.NaN;
  if (lengthMm < 1) {
    return undefined;
  }
  return {
    enabled: true,
    lengthMm
  };
}

export function normalizeConnectorCatalogDefaults(
  value: Partial<ConnectorCatalogDefaults> | undefined,
  connectionCount: number
): ConnectorCatalogDefaults | undefined {
  if (value === undefined || typeof value !== "object") {
    return undefined;
  }

  const defaultTerminal = normalizeConnectorTerminalMaterial(value.defaultTerminal);
  const terminalOverrides = normalizeTerminalOverrides(value.terminalOverrides, connectionCount);
  const plugs = Array.isArray(value.plugs)
    ? value.plugs.flatMap((plug) => {
        const normalized = normalizePlugDefinition(plug);
        return normalized === undefined ? [] : [normalized];
      })
    : undefined;
  const allSameTerminals = value.allSameTerminals === true;
  const pinElectricalRoles = normalizePinElectricalRolesCatalogDefaults(value.pinElectricalRoles, connectionCount);
  const rearBackshell = normalizeRearBackshell(value.rearBackshell);

  if (
    !allSameTerminals &&
    defaultTerminal === undefined &&
    terminalOverrides === undefined &&
    (plugs?.length ?? 0) === 0 &&
    pinElectricalRoles === undefined &&
    rearBackshell === undefined
  ) {
    return undefined;
  }

  return {
    allSameTerminals: allSameTerminals ? true : undefined,
    defaultTerminal,
    terminalOverrides,
    plugs: plugs !== undefined && plugs.length > 0 ? plugs : undefined,
    pinElectricalRoles,
    rearBackshell
  };
}

function normalizePinElectricalRolesCatalogDefaults(
  value: unknown,
  connectionCount: number
): Record<number, import("./entities").PinElectricalRole> | undefined {
  if (value === undefined) {
    return undefined;
  }
  const { value: normalized } = normalizePinElectricalRolesMap(value, { cavityCount: connectionCount });
  return Object.keys(normalized).length === 0 ? undefined : normalized;
}

export function resolveConnectorTerminalMaterial(
  connector: Connector,
  catalogItem: CatalogItem | undefined,
  cavityIndex: number
): ResolvedConnectorTerminalMaterial | undefined {
  const instanceOverride = connector.terminalOverrides?.[cavityIndex];
  const normalizedInstanceOverride = normalizeConnectorTerminalMaterial(instanceOverride);
  if (normalizedInstanceOverride !== undefined) {
    return { ...normalizedInstanceOverride, origin: "instance override" };
  }

  const catalogDefaults = catalogItem?.connectorDefaults;
  const catalogOverride = normalizeConnectorTerminalMaterial(catalogDefaults?.terminalOverrides?.[cavityIndex]);
  if (catalogOverride !== undefined) {
    return { ...catalogOverride, origin: "catalog default" };
  }

  if (catalogDefaults?.allSameTerminals === true) {
    const defaultTerminal = normalizeConnectorTerminalMaterial(catalogDefaults.defaultTerminal);
    if (defaultTerminal !== undefined) {
      return { ...defaultTerminal, origin: "catalog default" };
    }
  }

  return undefined;
}

export function getUsedConnectorCavities(
  connector: Connector,
  wires: readonly Wire[],
  connectorCavityOccupancy?: ConnectorCavityOccupancyMap
): Set<number> {
  const used = new Set<number>();
  for (const wire of wires) {
    if (wire.endpointA.kind === "connectorCavity" && wire.endpointA.connectorId === connector.id) {
      used.add(wire.endpointA.cavityIndex);
    }
    if (wire.endpointB.kind === "connectorCavity" && wire.endpointB.connectorId === connector.id) {
      used.add(wire.endpointB.cavityIndex);
    }
  }

  const occupancy = connectorCavityOccupancy?.[connector.id];
  if (occupancy !== undefined) {
    for (const [key, occupants] of Object.entries(occupancy)) {
      const cavityIndex = Number(key);
      // A shared way (2+ occupants) counts once — one terminal is crimped for all wires.
      if (Number.isInteger(cavityIndex) && occupantsAt(occupants).length > 0) {
        used.add(cavityIndex);
      }
    }
  }

  return new Set([...used].filter((cavityIndex) => cavityIndex >= 1 && cavityIndex <= connector.cavityCount));
}

export function resolveConnectorPlugMaterials(
  connector: Connector,
  catalogItem: CatalogItem | undefined,
  wires: readonly Wire[],
  connectorCavityOccupancy?: ConnectorCavityOccupancyMap
): { plugs: ResolvedConnectorPlugMaterial[]; unusedCavityCount: number; warnings: ConnectorMaterialWarning[] } {
  const usedCavities = getUsedConnectorCavities(connector, wires, connectorCavityOccupancy);
  const unusedCavityCount = Math.max(0, connector.cavityCount - usedCavities.size);
  const configuredPlugs = catalogItem?.connectorDefaults?.plugs ?? [];
  const warnings: ConnectorMaterialWarning[] = [];

  if (connector.applyCatalogPlugs === false || configuredPlugs.length === 0) {
    return { plugs: [], unusedCavityCount, warnings };
  }

  const plugQuantity = configuredPlugs.reduce((total, plug) => total + plug.quantity, 0);
  if (plugQuantity !== unusedCavityCount) {
    warnings.push({
      code: plugQuantity > 0 && unusedCavityCount === 0 ? "PLUG_WITHOUT_UNUSED_CAVITY" : "PLUG_QUANTITY_MISMATCH",
      connectorId: connector.id,
      connectorTechnicalId: connector.technicalId,
      message: `Connector '${connector.technicalId}' has ${unusedCavityCount} unused cavities but ${plugQuantity} catalog plug quantities.`
    });
  }

  return {
    plugs: configuredPlugs.map((plug) => ({ ...plug, origin: "catalog default" })),
    unusedCavityCount,
    warnings
  };
}
