import type { Connector, ConnectorId, Network, NetworkId, NodeId, Splice, SpliceId, Wire, WireId } from "../../core/entities";
import { normalizeWireColorState } from "../../core/cableColors";
import { APP_RELEASE_VERSION, APP_SCHEMA_VERSION } from "../../core/schema";
import { resolveWireSectionMm2 } from "../../core/wireSection";
import type { AppState, LayoutNodePosition, NetworkScopedState } from "../../store";

export const NETWORK_FILE_SCHEMA_VERSION = 2;
export const NETWORK_FILE_PAYLOAD_KIND = "electrical-plan-editor.network-export";

export type NetworkExportScope = "active" | "selected" | "all";

export interface ExportedNetworkBundle {
  network: Network;
  state: NetworkScopedState;
}

export interface NetworkFilePayloadV1 {
  payloadKind?: typeof NETWORK_FILE_PAYLOAD_KIND;
  schemaVersion: number;
  exportedAt: string;
  source: {
    app: "electrical-plan-editor";
    appVersion?: string;
    appSchemaVersion: number;
  };
  networks: ExportedNetworkBundle[];
}

export interface NetworkImportSummary {
  importedNetworkIds: NetworkId[];
  skippedNetworkIds: string[];
  warnings: string[];
  errors: string[];
}

export interface NetworkImportResult {
  networks: Network[];
  networkStates: Record<NetworkId, NetworkScopedState>;
  summary: NetworkImportSummary;
}

type PlainObject = Record<string, unknown>;

function isRecord(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null;
}

function isEntityState(value: unknown): boolean {
  return isRecord(value) && Array.isArray(value.allIds) && isRecord(value.byId);
}

function normalizeNodePositions(value: unknown): Record<NodeId, LayoutNodePosition> {
  if (!isRecord(value)) {
    return {} as Record<NodeId, LayoutNodePosition>;
  }

  const normalized = {} as Record<NodeId, LayoutNodePosition>;
  for (const [nodeId, rawPosition] of Object.entries(value)) {
    if (!isRecord(rawPosition)) {
      continue;
    }

    const x = rawPosition.x;
    const y = rawPosition.y;
    if (typeof x !== "number" || typeof y !== "number" || !Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }

    normalized[nodeId as NodeId] = { x, y };
  }

  return normalized;
}

function normalizeWiresEntityState(
  wires: NetworkScopedState["wires"]
): NetworkScopedState["wires"] {
  const byId = {} as Record<WireId, Wire>;

  for (const wireId of wires.allIds) {
    const wire = wires.byId[wireId];
    if (wire === undefined) {
      continue;
    }

    byId[wireId] = {
      ...wire,
      sectionMm2: resolveWireSectionMm2((wire as Partial<Wire>).sectionMm2),
      ...normalizeWireColorState(
        (wire as Partial<Wire>).primaryColorId,
        (wire as Partial<Wire>).secondaryColorId,
        (wire as Partial<Wire>).freeColorLabel
      ),
      endpointAConnectionReference: normalizeManufacturerReference((wire as Partial<Wire>).endpointAConnectionReference),
      endpointASealReference: normalizeManufacturerReference((wire as Partial<Wire>).endpointASealReference),
      endpointBConnectionReference: normalizeManufacturerReference((wire as Partial<Wire>).endpointBConnectionReference),
      endpointBSealReference: normalizeManufacturerReference((wire as Partial<Wire>).endpointBSealReference)
    };
  }

  return {
    allIds: [...wires.allIds],
    byId
  };
}

function normalizeManufacturerReference(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return undefined;
  }

  return normalized.length > 120 ? normalized.slice(0, 120) : normalized;
}

function normalizeConnectorsEntityState(
  connectors: NetworkScopedState["connectors"]
): NetworkScopedState["connectors"] {
  const byId = {} as Record<ConnectorId, Connector>;
  for (const connectorId of connectors.allIds) {
    const connector = connectors.byId[connectorId];
    if (connector === undefined) {
      continue;
    }

    byId[connectorId] = {
      ...connector,
      manufacturerReference: normalizeManufacturerReference((connector as Partial<Connector>).manufacturerReference)
    };
  }

  return {
    allIds: [...connectors.allIds],
    byId
  };
}

function normalizeSplicesEntityState(splices: NetworkScopedState["splices"]): NetworkScopedState["splices"] {
  const byId = {} as Record<SpliceId, Splice>;
  for (const spliceId of splices.allIds) {
    const splice = splices.byId[spliceId];
    if (splice === undefined) {
      continue;
    }

    byId[spliceId] = {
      ...splice,
      manufacturerReference: normalizeManufacturerReference((splice as Partial<Splice>).manufacturerReference)
    };
  }

  return {
    allIds: [...splices.allIds],
    byId
  };
}

function isNetworkScopedState(value: unknown): value is NetworkScopedState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isEntityState(value.connectors) &&
    isEntityState(value.splices) &&
    isEntityState(value.nodes) &&
    isEntityState(value.segments) &&
    isEntityState(value.wires) &&
    (value.nodePositions === undefined || isRecord(value.nodePositions)) &&
    isRecord(value.connectorCavityOccupancy) &&
    isRecord(value.splicePortOccupancy)
  );
}

function isExportedNetworkBundle(value: unknown): value is ExportedNetworkBundle {
  if (!isRecord(value)) {
    return false;
  }

  const network = value.network;
  const state = value.state;
  if (!isRecord(network) || !isNetworkScopedState(state)) {
    return false;
  }

  return (
    typeof network.id === "string" &&
    typeof network.name === "string" &&
    typeof network.technicalId === "string" &&
    typeof network.createdAt === "string" &&
    typeof network.updatedAt === "string"
  );
}

function normalizeScopedState(scoped: NetworkScopedState): NetworkScopedState {
  return {
    connectors: {
      allIds: [...scoped.connectors.allIds].sort((left, right) => left.localeCompare(right)),
      byId: normalizeConnectorsEntityState(scoped.connectors).byId
    },
    splices: {
      allIds: [...scoped.splices.allIds].sort((left, right) => left.localeCompare(right)),
      byId: normalizeSplicesEntityState(scoped.splices).byId
    },
    nodes: {
      allIds: [...scoped.nodes.allIds].sort((left, right) => left.localeCompare(right)),
      byId: { ...scoped.nodes.byId }
    },
    segments: {
      allIds: [...scoped.segments.allIds].sort((left, right) => left.localeCompare(right)),
      byId: { ...scoped.segments.byId }
    },
    wires: {
      allIds: [...scoped.wires.allIds].sort((left, right) => left.localeCompare(right)),
      byId: normalizeWiresEntityState(scoped.wires).byId
    },
    nodePositions: normalizeNodePositions(scoped.nodePositions),
    connectorCavityOccupancy: { ...scoped.connectorCavityOccupancy },
    splicePortOccupancy: { ...scoped.splicePortOccupancy }
  };
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalize(entry));
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.keys(value)
    .sort((left, right) => left.localeCompare(right))
    .reduce((result, key) => {
      result[key] = canonicalize(value[key]);
      return result;
    }, {} as PlainObject);
}

function dedupeWithSuffix(base: string, taken: Set<string>, suffix: string): string {
  if (!taken.has(base)) {
    return base;
  }

  let index = 1;
  let candidate = `${base}${suffix}`;
  while (taken.has(candidate)) {
    index += 1;
    candidate = `${base}${suffix}-${index}`;
  }
  return candidate;
}

function resolveNetworkIdsForScope(
  state: AppState,
  scope: NetworkExportScope,
  selectedNetworkIds: NetworkId[]
): NetworkId[] {
  if (scope === "active") {
    return state.activeNetworkId === null ? [] : [state.activeNetworkId];
  }

  if (scope === "selected") {
    const selectedSet = new Set(selectedNetworkIds);
    return state.networks.allIds.filter((networkId) => selectedSet.has(networkId));
  }

  return [...state.networks.allIds];
}

export function buildNetworkFilePayload(
  state: AppState,
  scope: NetworkExportScope,
  selectedNetworkIds: NetworkId[],
  exportedAt: string
): NetworkFilePayloadV1 {
  const networkIds = resolveNetworkIdsForScope(state, scope, selectedNetworkIds);
  const bundles = networkIds
    .map((networkId) => {
      const network = state.networks.byId[networkId];
      const scoped = state.networkStates[networkId];
      if (network === undefined || scoped === undefined) {
        return null;
      }

      return {
        network: {
          ...network
        },
        state: normalizeScopedState(scoped)
      } satisfies ExportedNetworkBundle;
    })
    .filter((bundle): bundle is ExportedNetworkBundle => bundle !== null)
    .sort((left, right) => left.network.technicalId.localeCompare(right.network.technicalId));

  return {
    payloadKind: NETWORK_FILE_PAYLOAD_KIND,
    schemaVersion: NETWORK_FILE_SCHEMA_VERSION,
    exportedAt,
    source: {
      app: "electrical-plan-editor",
      appVersion: APP_RELEASE_VERSION,
      appSchemaVersion: APP_SCHEMA_VERSION
    },
    networks: bundles
  };
}

export function serializeNetworkFilePayload(payload: NetworkFilePayloadV1): string {
  return JSON.stringify(canonicalize(payload), null, 2);
}

export function parseNetworkFilePayload(rawJson: string): { payload: NetworkFilePayloadV1 | null; error: string | null } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson) as unknown;
  } catch {
    return {
      payload: null,
      error: "Invalid JSON file."
    };
  }

  if (!isRecord(parsed)) {
    return {
      payload: null,
      error: "Invalid file payload root."
    };
  }

  const schemaVersion = parsed.schemaVersion;
  const networks = parsed.networks;
  const exportedAt = parsed.exportedAt;
  if (!Array.isArray(networks) || typeof exportedAt !== "string") {
    return {
      payload: null,
      error: "Invalid payload structure: missing networks or exportedAt."
    };
  }

  const parsedBundles = networks.filter((bundle) => isExportedNetworkBundle(bundle));
  if (parsedBundles.length !== networks.length) {
    return {
      payload: null,
      error: "Invalid payload structure: at least one network bundle is malformed."
    };
  }

  if (typeof schemaVersion !== "number" || !Number.isInteger(schemaVersion)) {
    return {
      payload: null,
      error: "Invalid payload structure: missing or invalid schemaVersion."
    };
  }

  if (schemaVersion > NETWORK_FILE_SCHEMA_VERSION) {
    return {
      payload: null,
      error: `Unsupported file schema version '${String(schemaVersion)}' (newer than supported ${NETWORK_FILE_SCHEMA_VERSION}).`
    };
  }

  if (schemaVersion !== 0 && schemaVersion !== 1 && schemaVersion !== 2) {
    return {
      payload: null,
      error: `Unsupported file schema version '${String(schemaVersion)}'.`
    };
  }

  const rawSource = parsed.source;
  const sourceRecord = isRecord(rawSource) ? rawSource : {};
  const sourceAppVersion =
    typeof sourceRecord.appVersion === "string" && sourceRecord.appVersion.trim().length > 0
      ? sourceRecord.appVersion
      : "unknown";

  return {
    payload: {
      payloadKind: NETWORK_FILE_PAYLOAD_KIND,
      schemaVersion: NETWORK_FILE_SCHEMA_VERSION,
      exportedAt,
      source: {
        app: "electrical-plan-editor",
        appVersion: sourceAppVersion,
        appSchemaVersion: APP_SCHEMA_VERSION
      },
      networks: parsedBundles.map((bundle) => ({
        network: {
          ...bundle.network
        },
        state: normalizeScopedState(bundle.state)
      }))
    },
    error: null
  };
}

export function resolveImportConflicts(
  payload: NetworkFilePayloadV1,
  existingState: AppState
): NetworkImportResult {
  const existingTechnicalIds = new Set(existingState.networks.allIds.map((id) => existingState.networks.byId[id]?.technicalId ?? ""));
  const existingIds = new Set(existingState.networks.allIds.map((id) => id as string));

  const summary: NetworkImportSummary = {
    importedNetworkIds: [],
    skippedNetworkIds: [],
    warnings: [],
    errors: []
  };
  const networks: Network[] = [];
  const networkStates = {} as Record<NetworkId, NetworkScopedState>;

  for (const bundle of payload.networks) {
    const sourceNetwork = bundle.network;
    const normalizedName = sourceNetwork.name.trim();
    const normalizedTechnicalId = sourceNetwork.technicalId.trim();
    if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
      summary.errors.push(`Skipped network '${sourceNetwork.id}': name and technical ID are required.`);
      summary.skippedNetworkIds.push(sourceNetwork.id);
      continue;
    }

    let importedId = sourceNetwork.id as string;
    if (existingIds.has(importedId)) {
      const dedupedId = dedupeWithSuffix(importedId, existingIds, "-import");
      summary.warnings.push(`Network ID '${sourceNetwork.id}' was renamed to '${dedupedId}' during import.`);
      importedId = dedupedId;
    }

    let importedTechnicalId = normalizedTechnicalId;
    if (existingTechnicalIds.has(importedTechnicalId)) {
      const dedupedTechnicalId = dedupeWithSuffix(importedTechnicalId, existingTechnicalIds, "-IMP");
      summary.warnings.push(
        `Network technical ID '${normalizedTechnicalId}' was renamed to '${dedupedTechnicalId}' during import.`
      );
      importedTechnicalId = dedupedTechnicalId;
    }

    existingIds.add(importedId);
    existingTechnicalIds.add(importedTechnicalId);

    const networkId = importedId as NetworkId;
    networks.push({
      ...sourceNetwork,
      id: networkId,
      name: normalizedName,
      technicalId: importedTechnicalId
    });
    networkStates[networkId] = normalizeScopedState(bundle.state);
    summary.importedNetworkIds.push(networkId);
  }

  return {
    networks,
    networkStates,
    summary
  };
}
