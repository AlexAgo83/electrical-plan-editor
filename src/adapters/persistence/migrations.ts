import { APP_SCHEMA_VERSION } from "../../core/schema";
import type {
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireId
} from "../../core/entities";
import type { AppState, EntityState, LayoutNodePosition, NetworkScopedState } from "../../store";
import {
  DEFAULT_NETWORK_CREATED_AT,
  DEFAULT_NETWORK_ID,
  DEFAULT_NETWORK_TECHNICAL_ID,
  createInitialState
} from "../../store/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isEntityState(candidate: unknown): candidate is EntityState<unknown, string> {
  if (!isRecord(candidate)) {
    return false;
  }

  return isRecord(candidate.byId) && Array.isArray(candidate.allIds);
}

function normalizeNodePositions(candidate: unknown): Record<NodeId, LayoutNodePosition> {
  if (!isRecord(candidate)) {
    return {} as Record<NodeId, LayoutNodePosition>;
  }

  const normalized = {} as Record<NodeId, LayoutNodePosition>;
  for (const [nodeId, rawPosition] of Object.entries(candidate)) {
    if (!isRecord(rawPosition)) {
      continue;
    }

    const x = rawPosition.x;
    const y = rawPosition.y;
    if (!isFiniteNumber(x) || !isFiniteNumber(y)) {
      continue;
    }

    normalized[nodeId as NodeId] = { x, y };
  }

  return normalized;
}

function normalizeNetworkScopedState(candidate: unknown): NetworkScopedState | null {
  if (!isRecord(candidate)) {
    return null;
  }

  if (
    !isEntityState(candidate.connectors) ||
    !isEntityState(candidate.splices) ||
    !isEntityState(candidate.nodes) ||
    !isEntityState(candidate.segments) ||
    !isEntityState(candidate.wires) ||
    !isRecord(candidate.connectorCavityOccupancy) ||
    !isRecord(candidate.splicePortOccupancy)
  ) {
    return null;
  }

  return {
    connectors: candidate.connectors as NetworkScopedState["connectors"],
    splices: candidate.splices as NetworkScopedState["splices"],
    nodes: candidate.nodes as NetworkScopedState["nodes"],
    segments: candidate.segments as NetworkScopedState["segments"],
    wires: candidate.wires as NetworkScopedState["wires"],
    nodePositions: normalizeNodePositions(candidate.nodePositions),
    connectorCavityOccupancy: candidate.connectorCavityOccupancy as NetworkScopedState["connectorCavityOccupancy"],
    splicePortOccupancy: candidate.splicePortOccupancy as NetworkScopedState["splicePortOccupancy"]
  };
}

function asCurrentAppState(candidate: unknown): AppState | null {
  if (!isRecord(candidate)) {
    return null;
  }

  if (candidate.schemaVersion !== APP_SCHEMA_VERSION) {
    return null;
  }

  if (
    !isEntityState(candidate.networks) ||
    !isRecord(candidate.networkStates) ||
    !isEntityState(candidate.connectors) ||
    !isEntityState(candidate.splices) ||
    !isEntityState(candidate.nodes) ||
    !isEntityState(candidate.segments) ||
    !isEntityState(candidate.wires) ||
    !isRecord(candidate.connectorCavityOccupancy) ||
    !isRecord(candidate.splicePortOccupancy) ||
    !isRecord(candidate.ui) ||
    !isRecord(candidate.meta)
  ) {
    return null;
  }

  const normalizedNetworkStates = {} as AppState["networkStates"];
  for (const networkId of Object.keys(candidate.networkStates)) {
    const normalizedScoped = normalizeNetworkScopedState(candidate.networkStates[networkId]);
    if (normalizedScoped === null) {
      return null;
    }
    normalizedNetworkStates[networkId as keyof AppState["networkStates"]] = normalizedScoped;
  }

  return {
    ...(candidate as unknown as AppState),
    networkStates: normalizedNetworkStates,
    nodePositions: normalizeNodePositions(candidate.nodePositions)
  };
}

interface LegacySingleNetworkState {
  schemaVersion: 1;
  connectors: EntityState<Connector, ConnectorId>;
  splices: EntityState<Splice, SpliceId>;
  nodes: EntityState<NetworkNode, NodeId>;
  segments: EntityState<Segment, SegmentId>;
  wires: EntityState<Wire, WireId>;
  connectorCavityOccupancy: Record<ConnectorId, Record<number, string>>;
  splicePortOccupancy: Record<SpliceId, Record<number, string>>;
  ui: {
    selected: AppState["ui"]["selected"];
    lastError: string | null;
  };
  meta: {
    revision: number;
  };
}

function isLegacySingleNetworkState(candidate: unknown): candidate is LegacySingleNetworkState {
  if (!isRecord(candidate)) {
    return false;
  }

  if (candidate.schemaVersion !== 1) {
    return false;
  }

  return (
    isEntityState(candidate.connectors) &&
    isEntityState(candidate.splices) &&
    isEntityState(candidate.nodes) &&
    isEntityState(candidate.segments) &&
    isEntityState(candidate.wires) &&
    isRecord(candidate.connectorCavityOccupancy) &&
    isRecord(candidate.splicePortOccupancy) &&
    isRecord(candidate.ui) &&
    isRecord(candidate.meta)
  );
}

export interface PersistedStateSnapshotV1 {
  schemaVersion: typeof APP_SCHEMA_VERSION;
  createdAtIso: string;
  updatedAtIso: string;
  state: AppState;
}

export interface PersistenceMigrationResult {
  snapshot: PersistedStateSnapshotV1;
  wasMigrated: boolean;
}

function asCurrentSnapshot(payload: unknown): PersistedStateSnapshotV1 | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (payload.schemaVersion !== APP_SCHEMA_VERSION) {
    return null;
  }

  const createdAtIso = payload.createdAtIso;
  const updatedAtIso = payload.updatedAtIso;
  const state = payload.state;
  const normalizedState = asCurrentAppState(state);

  if (!isIsoDate(createdAtIso) || !isIsoDate(updatedAtIso) || normalizedState === null) {
    return null;
  }

  return {
    schemaVersion: APP_SCHEMA_VERSION,
    createdAtIso,
    updatedAtIso,
    state: normalizedState
  };
}

function asPreTimestampSnapshot(payload: unknown): AppState | null {
  if (!isRecord(payload) || payload.schemaVersion !== APP_SCHEMA_VERSION) {
    return null;
  }

  return asCurrentAppState(payload.state);
}

function migrateLegacySingleNetworkState(
  legacy: LegacySingleNetworkState,
  nowIso: string
): AppState {
  const seeded = createInitialState();
  const scoped: NetworkScopedState = {
    connectors: legacy.connectors,
    splices: legacy.splices,
    nodes: legacy.nodes,
    segments: legacy.segments,
    wires: legacy.wires,
    nodePositions: {} as Record<NodeId, LayoutNodePosition>,
    connectorCavityOccupancy: legacy.connectorCavityOccupancy,
    splicePortOccupancy: legacy.splicePortOccupancy
  };

  const defaultNetwork = seeded.networks.byId[DEFAULT_NETWORK_ID];
  if (defaultNetwork === undefined) {
    return seeded;
  }

  const network = {
    ...defaultNetwork,
    technicalId: DEFAULT_NETWORK_TECHNICAL_ID,
    createdAt: DEFAULT_NETWORK_CREATED_AT,
    updatedAt: nowIso
  };

  return {
    ...seeded,
    networks: {
      byId: {
        [network.id]: network
      } as AppState["networks"]["byId"],
      allIds: [network.id]
    },
    activeNetworkId: network.id,
    networkStates: {
      [network.id]: scoped
    } as AppState["networkStates"],
    connectors: scoped.connectors,
    splices: scoped.splices,
    nodes: scoped.nodes,
    segments: scoped.segments,
    wires: scoped.wires,
    nodePositions: scoped.nodePositions,
    connectorCavityOccupancy: scoped.connectorCavityOccupancy,
    splicePortOccupancy: scoped.splicePortOccupancy,
    ui: {
      selected: legacy.ui.selected,
      lastError: legacy.ui.lastError,
      themeMode: "normal"
    },
    meta: {
      revision: legacy.meta.revision
    }
  };
}

export function migratePersistedPayload(payload: unknown, nowIso: string): PersistenceMigrationResult | null {
  const currentSnapshot = asCurrentSnapshot(payload);
  if (currentSnapshot !== null) {
    return {
      snapshot: currentSnapshot,
      wasMigrated: false
    };
  }

  const currentStateWithoutTimestamp = asPreTimestampSnapshot(payload);
  if (currentStateWithoutTimestamp !== null) {
    return {
      snapshot: {
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: nowIso,
        updatedAtIso: nowIso,
        state: currentStateWithoutTimestamp
      },
      wasMigrated: true
    };
  }

  const legacyState = isLegacySingleNetworkState(payload)
    ? payload
    : isRecord(payload) && payload.schemaVersion === 1 && isLegacySingleNetworkState(payload.state)
      ? payload.state
      : null;

  if (legacyState === null) {
    return null;
  }

  return {
    snapshot: {
      schemaVersion: APP_SCHEMA_VERSION,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
      state: migrateLegacySingleNetworkState(legacyState, nowIso)
    },
    wasMigrated: true
  };
}
