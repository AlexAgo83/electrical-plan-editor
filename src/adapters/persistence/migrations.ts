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
import type { AppState, EntityState, NetworkScopedState } from "../../store";
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

function isEntityState(candidate: unknown): candidate is EntityState<unknown, string> {
  if (!isRecord(candidate)) {
    return false;
  }

  return isRecord(candidate.byId) && Array.isArray(candidate.allIds);
}

function isCurrentAppState(candidate: unknown): candidate is AppState {
  if (!isRecord(candidate)) {
    return false;
  }

  if (candidate.schemaVersion !== APP_SCHEMA_VERSION) {
    return false;
  }

  return (
    isEntityState(candidate.networks) &&
    isRecord(candidate.networkStates) &&
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

  if (!isIsoDate(createdAtIso) || !isIsoDate(updatedAtIso) || !isCurrentAppState(state)) {
    return null;
  }

  return {
    schemaVersion: APP_SCHEMA_VERSION,
    createdAtIso,
    updatedAtIso,
    state
  };
}

function asPreTimestampSnapshot(payload: unknown): AppState | null {
  if (!isRecord(payload) || payload.schemaVersion !== APP_SCHEMA_VERSION) {
    return null;
  }

  return isCurrentAppState(payload.state) ? payload.state : null;
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
