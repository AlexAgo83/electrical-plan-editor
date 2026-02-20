import { APP_SCHEMA_VERSION } from "../../core/schema";
import type { AppState } from "../../store";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isAppState(candidate: unknown): candidate is AppState {
  if (!isRecord(candidate)) {
    return false;
  }

  if (candidate.schemaVersion !== APP_SCHEMA_VERSION) {
    return false;
  }

  const value = candidate as Partial<AppState>;
  return (
    isRecord(value.connectors) &&
    isRecord(value.splices) &&
    isRecord(value.nodes) &&
    isRecord(value.segments) &&
    isRecord(value.wires) &&
    isRecord(value.connectorCavityOccupancy) &&
    isRecord(value.splicePortOccupancy) &&
    isRecord(value.ui) &&
    isRecord(value.meta)
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

  if (!isIsoDate(createdAtIso) || !isIsoDate(updatedAtIso) || !isAppState(state)) {
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

  return isAppState(payload.state) ? payload.state : null;
}

export function migratePersistedPayload(payload: unknown, nowIso: string): PersistenceMigrationResult | null {
  const currentSnapshot = asCurrentSnapshot(payload);
  if (currentSnapshot !== null) {
    return {
      snapshot: currentSnapshot,
      wasMigrated: false
    };
  }

  const legacyState = isAppState(payload) ? payload : asPreTimestampSnapshot(payload);
  if (legacyState === null) {
    return null;
  }

  return {
    snapshot: {
      schemaVersion: APP_SCHEMA_VERSION,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
      state: legacyState
    },
    wasMigrated: true
  };
}
