import { APP_RELEASE_VERSION, APP_SCHEMA_VERSION } from "../../core/schema";
import { resolveWireSectionMm2 } from "../../core/wireSection";
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

export const PERSISTED_STATE_SCHEMA_VERSION = 2;
export const PERSISTED_STATE_PAYLOAD_KIND = "electrical-plan-editor.workspace-state";

type PlainObject = Record<string, unknown>;

function isRecord(value: unknown): value is PlainObject {
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

function normalizeWireEntityState(candidate: EntityState<Wire, WireId>): EntityState<Wire, WireId> {
  const byId = {} as EntityState<Wire, WireId>["byId"];
  for (const wireId of candidate.allIds) {
    const wire = candidate.byId[wireId];
    if (wire === undefined) {
      continue;
    }

    byId[wireId] = {
      ...wire,
      sectionMm2: resolveWireSectionMm2((wire as Partial<Wire>).sectionMm2)
    };
  }

  return {
    allIds: [...candidate.allIds],
    byId
  };
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
    wires: normalizeWireEntityState(candidate.wires as EntityState<Wire, WireId>),
    nodePositions: normalizeNodePositions(candidate.nodePositions),
    connectorCavityOccupancy: candidate.connectorCavityOccupancy as NetworkScopedState["connectorCavityOccupancy"],
    splicePortOccupancy: candidate.splicePortOccupancy as NetworkScopedState["splicePortOccupancy"]
  };
}

function normalizeAndValidateCurrentAppState(candidate: unknown): AppState | null {
  if (!isRecord(candidate)) {
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

  const rawNetworks = candidate.networks as AppState["networks"];
  const rawNetworkStates = candidate.networkStates;
  const normalizedNetworkStates = {} as AppState["networkStates"];

  for (const networkId of rawNetworks.allIds) {
    if (typeof networkId !== "string") {
      return null;
    }
    const network = rawNetworks.byId[networkId];
    if (!isRecord(network)) {
      return null;
    }
    const scoped = normalizeNetworkScopedState(rawNetworkStates[networkId]);
    if (scoped === null) {
      return null;
    }
    normalizedNetworkStates[networkId] = scoped;
  }

  const candidateState = {
    ...(candidate as unknown as AppState),
    schemaVersion: APP_SCHEMA_VERSION,
    networkStates: normalizedNetworkStates,
    wires: normalizeWireEntityState(candidate.wires as EntityState<Wire, WireId>),
    nodePositions: normalizeNodePositions(candidate.nodePositions)
  } satisfies AppState;

  const knownNetworkIds = new Set(candidateState.networks.allIds);
  let nextActiveNetworkId = candidateState.activeNetworkId;
  if (nextActiveNetworkId !== null && !knownNetworkIds.has(nextActiveNetworkId)) {
    nextActiveNetworkId = candidateState.networks.allIds[0] ?? null;
  }

  const nextState: AppState = {
    ...candidateState,
    activeNetworkId: nextActiveNetworkId
  };

  if (nextActiveNetworkId !== null) {
    const activeScoped = normalizedNetworkStates[nextActiveNetworkId];
    if (activeScoped === undefined) {
      return null;
    }

    nextState.connectors = activeScoped.connectors;
    nextState.splices = activeScoped.splices;
    nextState.nodes = activeScoped.nodes;
    nextState.segments = activeScoped.segments;
    nextState.wires = activeScoped.wires;
    nextState.nodePositions = activeScoped.nodePositions;
    nextState.connectorCavityOccupancy = activeScoped.connectorCavityOccupancy;
    nextState.splicePortOccupancy = activeScoped.splicePortOccupancy;
  }

  return nextState;
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
  schemaVersion: number;
  createdAtIso: string;
  updatedAtIso: string;
  state: AppState;
  payloadKind?: string;
  appVersion?: string;
  appSchemaVersion?: number;
}

export interface PersistedStateSnapshot
  extends Omit<PersistedStateSnapshotV1, "schemaVersion" | "payloadKind" | "appVersion" | "appSchemaVersion"> {
  schemaVersion: typeof PERSISTED_STATE_SCHEMA_VERSION;
  payloadKind: typeof PERSISTED_STATE_PAYLOAD_KIND;
  appVersion: string;
  appSchemaVersion: typeof APP_SCHEMA_VERSION;
}

export interface PersistenceMigrationResult {
  snapshot: PersistedStateSnapshot;
  wasMigrated: boolean;
  diagnostics: string[];
}

export interface PersistenceMigrationFailure {
  code: "unsupportedFutureVersion" | "invalidPayload";
  message: string;
}

export type PersistenceMigrationAttempt =
  | ({ ok: true } & PersistenceMigrationResult)
  | {
      ok: false;
      error: PersistenceMigrationFailure;
    };

function buildCurrentSnapshotEnvelope(
  state: AppState,
  createdAtIso: string,
  updatedAtIso: string
): PersistedStateSnapshot {
  return {
    payloadKind: PERSISTED_STATE_PAYLOAD_KIND,
    schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
    appVersion: APP_RELEASE_VERSION,
    appSchemaVersion: APP_SCHEMA_VERSION,
    createdAtIso,
    updatedAtIso,
    state: {
      ...state,
      schemaVersion: APP_SCHEMA_VERSION
    }
  };
}

function asCurrentVersionedSnapshot(payload: unknown): PersistedStateSnapshot | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (
    payload.payloadKind !== PERSISTED_STATE_PAYLOAD_KIND ||
    payload.schemaVersion !== PERSISTED_STATE_SCHEMA_VERSION ||
    typeof payload.appVersion !== "string" ||
    payload.appVersion.trim().length === 0 ||
    payload.appSchemaVersion !== APP_SCHEMA_VERSION
  ) {
    return null;
  }

  const createdAtIso = payload.createdAtIso;
  const updatedAtIso = payload.updatedAtIso;
  if (!isIsoDate(createdAtIso) || !isIsoDate(updatedAtIso)) {
    return null;
  }

  const normalizedState = normalizeAndValidateCurrentAppState(payload.state);
  if (normalizedState === null) {
    return null;
  }

  return buildCurrentSnapshotEnvelope(normalizedState, createdAtIso, updatedAtIso);
}

interface LegacyTimestampedSnapshotV1 {
  schemaVersion: number;
  createdAtIso: string;
  updatedAtIso: string;
  state: AppState;
}

function asLegacyTimestampedSnapshotV1(payload: unknown): LegacyTimestampedSnapshotV1 | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (
    payload.schemaVersion !== APP_SCHEMA_VERSION ||
    typeof payload.createdAtIso !== "string" ||
    typeof payload.updatedAtIso !== "string" ||
    !("state" in payload)
  ) {
    return null;
  }

  if (!isIsoDate(payload.createdAtIso) || !isIsoDate(payload.updatedAtIso)) {
    return null;
  }

  const normalizedState = normalizeAndValidateCurrentAppState(payload.state);
  if (normalizedState === null) {
    return null;
  }

  return {
    schemaVersion: 1,
    createdAtIso: payload.createdAtIso,
    updatedAtIso: payload.updatedAtIso,
    state: normalizedState
  };
}

function asPreTimestampSnapshot(payload: unknown): AppState | null {
  if (!isRecord(payload) || payload.schemaVersion !== APP_SCHEMA_VERSION) {
    return null;
  }

  return normalizeAndValidateCurrentAppState(payload.state);
}

function migrateLegacySingleNetworkStateToCurrent(
  legacy: LegacySingleNetworkState,
  nowIso: string
): AppState {
  const seeded = createInitialState();
  const scoped: NetworkScopedState = {
    connectors: legacy.connectors,
    splices: legacy.splices,
    nodes: legacy.nodes,
    segments: legacy.segments,
    wires: normalizeWireEntityState(legacy.wires),
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

type PipelineVersion = 1 | 2;
const CURRENT_PIPELINE_VERSION: PipelineVersion = 2;

interface PipelineSnapshot {
  version: PipelineVersion;
  createdAtIso: string;
  updatedAtIso: string;
  state: AppState;
}

type MigrationStep = (snapshot: PipelineSnapshot) => PipelineSnapshot;

const PIPELINE_MIGRATIONS: Record<Exclude<PipelineVersion, typeof CURRENT_PIPELINE_VERSION>, MigrationStep> = {
  1: (snapshot) => ({
    ...snapshot,
    version: 2
  })
};

function runPipeline(initial: PipelineSnapshot): { snapshot: PipelineSnapshot; diagnostics: string[] } {
  const diagnostics: string[] = [];
  let current = initial;
  while (current.version < CURRENT_PIPELINE_VERSION) {
    const step = PIPELINE_MIGRATIONS[current.version as keyof typeof PIPELINE_MIGRATIONS];
    diagnostics.push(`Applied persistence migration v${current.version} -> v${current.version + 1}.`);
    current = step(current);
  }
  return { snapshot: current, diagnostics };
}

function detectUnsupportedFutureVersion(payload: unknown): PersistenceMigrationFailure | null {
  if (!isRecord(payload)) {
    return null;
  }

  const version = payload.schemaVersion;
  if (typeof version === "number" && Number.isInteger(version) && version > PERSISTED_STATE_SCHEMA_VERSION) {
    return {
      code: "unsupportedFutureVersion",
      message: `Unsupported persisted data schema version '${version}'. This data was likely created by a newer app version.`
    };
  }

  return null;
}

function validatePostMigrationState(state: AppState): string[] {
  const diagnostics: string[] = [];
  const networkIds = state.networks.allIds;
  const networkIdSet = new Set<string>(networkIds);
  if (networkIds.length === 0 && state.activeNetworkId !== null) {
    diagnostics.push("Active network ID is set while no networks exist; active selection was normalized.");
  }

  for (const networkId of networkIds) {
    if (state.networkStates[networkId] === undefined) {
      diagnostics.push(`Missing network state for '${networkId}'.`);
    }
  }

  for (const networkId of Object.keys(state.networkStates)) {
    if (!networkIdSet.has(networkId)) {
      diagnostics.push(`Orphan network state '${networkId}' was dropped during normalization.`);
    }
  }

  return diagnostics;
}

export function migratePersistedPayloadDetailed(payload: unknown, nowIso: string): PersistenceMigrationAttempt {
  const currentSnapshot = asCurrentVersionedSnapshot(payload);
  if (currentSnapshot !== null) {
    return {
      ok: true,
      snapshot: currentSnapshot,
      wasMigrated: false,
      diagnostics: validatePostMigrationState(currentSnapshot.state)
    };
  }

  const futureError = detectUnsupportedFutureVersion(payload);
  if (futureError !== null) {
    return {
      ok: false,
      error: futureError
    };
  }

  const legacyTimestamped = asLegacyTimestampedSnapshotV1(payload);
  if (legacyTimestamped !== null) {
    const pipeline = runPipeline({
      version: legacyTimestamped.schemaVersion as PipelineVersion,
      createdAtIso: legacyTimestamped.createdAtIso,
      updatedAtIso: legacyTimestamped.updatedAtIso,
      state: legacyTimestamped.state
    });

    return {
      ok: true,
      snapshot: buildCurrentSnapshotEnvelope(
        pipeline.snapshot.state,
        pipeline.snapshot.createdAtIso,
        pipeline.snapshot.updatedAtIso
      ),
      wasMigrated: true,
      diagnostics: [...pipeline.diagnostics, ...validatePostMigrationState(pipeline.snapshot.state)]
    };
  }

  const currentStateWithoutTimestamp = asPreTimestampSnapshot(payload);
  if (currentStateWithoutTimestamp !== null) {
    const pipeline = runPipeline({
      version: 1,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
      state: currentStateWithoutTimestamp
    });

    return {
      ok: true,
      snapshot: buildCurrentSnapshotEnvelope(
        pipeline.snapshot.state,
        pipeline.snapshot.createdAtIso,
        pipeline.snapshot.updatedAtIso
      ),
      wasMigrated: true,
      diagnostics: ["Normalized legacy untimestamped persisted payload.", ...pipeline.diagnostics, ...validatePostMigrationState(pipeline.snapshot.state)]
    };
  }

  const legacyState = isLegacySingleNetworkState(payload)
    ? payload
    : isRecord(payload) && payload.schemaVersion === 1 && isLegacySingleNetworkState(payload.state)
      ? payload.state
      : null;

  if (legacyState !== null) {
    const migratedState = migrateLegacySingleNetworkStateToCurrent(legacyState, nowIso);
    const pipeline = runPipeline({
      version: 1,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
      state: migratedState
    });

    return {
      ok: true,
      snapshot: buildCurrentSnapshotEnvelope(
        pipeline.snapshot.state,
        pipeline.snapshot.createdAtIso,
        pipeline.snapshot.updatedAtIso
      ),
      wasMigrated: true,
      diagnostics: [
        "Normalized legacy single-network payload into multi-network workspace format.",
        ...pipeline.diagnostics,
        ...validatePostMigrationState(pipeline.snapshot.state)
      ]
    };
  }

  return {
    ok: false,
    error: {
      code: "invalidPayload",
      message: "Persisted payload is invalid or unsupported."
    }
  };
}

export function migratePersistedPayload(payload: unknown, nowIso: string): PersistenceMigrationResult | null {
  const result = migratePersistedPayloadDetailed(payload, nowIso);
  if (!result.ok) {
    return null;
  }

  return {
    snapshot: result.snapshot,
    wasMigrated: result.wasMigrated,
    diagnostics: result.diagnostics
  };
}
