import { APP_RELEASE_VERSION } from "../../core/schema";
import { resolveStorageKey } from "../../config/environment";
import { createSampleNetworkState, type AppState } from "../../store";
import {
  PERSISTED_STATE_PAYLOAD_KIND,
  PERSISTED_STATE_SCHEMA_VERSION,
  migratePersistedPayloadDetailed,
  type PersistedStateSnapshot
} from "./migrations";

const configuredStorageKey =
  typeof import.meta.env.VITE_STORAGE_KEY === "string" ? import.meta.env.VITE_STORAGE_KEY : undefined;

export const STORAGE_KEY = resolveStorageKey(configuredStorageKey);
export const STORAGE_BACKUP_KEY = `${STORAGE_KEY}.backup`;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type IsoNowProvider = () => string;

function getDefaultStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getNowIso(): string {
  return new Date().toISOString();
}

function readRawFromStorage(storage: Pick<Storage, "getItem">): string | null {
  return storage.getItem(STORAGE_KEY);
}

function readJson(raw: string): unknown {
  return JSON.parse(raw) as unknown;
}

function writeSnapshot(storage: Pick<Storage, "setItem">, snapshot: PersistedStateSnapshot): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function safeWriteBackup(
  storage: Pick<Storage, "setItem">,
  raw: string,
  reason: string,
  nowIso: string
): void {
  try {
    storage.setItem(
      STORAGE_BACKUP_KEY,
      JSON.stringify({
        reason,
        backedUpAtIso: nowIso,
        raw
      })
    );
  } catch {
    // Ignore backup failures and keep fallback behavior stable.
  }
}

function bootstrapSampleState(
  storage: Pick<Storage, "setItem">,
  nowIso: string,
  errorMessage?: string
): AppState {
  const sampleState = createSampleNetworkState();
  const hydratedState =
    errorMessage === undefined
      ? sampleState
      : {
          ...sampleState,
          ui: {
            ...sampleState.ui,
            lastError: errorMessage
          }
        };
  const snapshot: PersistedStateSnapshot = {
    payloadKind: PERSISTED_STATE_PAYLOAD_KIND,
    schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
    appVersion: APP_RELEASE_VERSION,
    appSchemaVersion: hydratedState.schemaVersion,
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    state: hydratedState
  };

  try {
    writeSnapshot(storage, snapshot);
  } catch {
    // Ignore write failures and keep deterministic bootstrap state.
  }

  return hydratedState;
}

export function loadState(storage: StorageLike | null = getDefaultStorage(), nowProvider: IsoNowProvider = getNowIso): AppState {
  const nowIso = nowProvider();
  if (storage === null) {
    return createSampleNetworkState();
  }

  try {
    const raw = readRawFromStorage(storage);
    if (raw === null) {
      return bootstrapSampleState(storage, nowIso);
    }

    const migration = migratePersistedPayloadDetailed(readJson(raw), nowIso);
    if (!migration.ok) {
      safeWriteBackup(storage, raw, `load-failed:${migration.error.code}`, nowIso);
      return bootstrapSampleState(storage, nowIso, migration.error.message);
    }

    if (migration.wasMigrated) {
      safeWriteBackup(storage, raw, "load-migrated-upgrade", nowIso);
      writeSnapshot(storage, migration.snapshot);
    }

    return migration.snapshot.state;
  } catch {
    const raw = readRawFromStorage(storage);
    if (raw !== null) {
      safeWriteBackup(storage, raw, "load-json-parse-or-runtime-error", nowIso);
    }
    return bootstrapSampleState(storage, nowIso, "Stored workspace data could not be loaded safely. A backup copy was preserved.");
  }
}

function resolveCreatedAtIso(
  storage: Pick<Storage, "getItem">,
  updatedAtIso: string
): string {
  try {
    const raw = readRawFromStorage(storage);
    if (raw === null) {
      return updatedAtIso;
    }

    const migration = migratePersistedPayloadDetailed(readJson(raw), updatedAtIso);
    return migration.ok ? migration.snapshot.createdAtIso : updatedAtIso;
  } catch {
    return updatedAtIso;
  }
}

export function saveState(
  state: AppState,
  storage: StorageLike | null = getDefaultStorage(),
  nowProvider: IsoNowProvider = getNowIso
): void {
  if (storage === null) {
    return;
  }

  const updatedAtIso = nowProvider();
  const snapshot: PersistedStateSnapshot = {
    payloadKind: PERSISTED_STATE_PAYLOAD_KIND,
    schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
    appVersion: APP_RELEASE_VERSION,
    appSchemaVersion: state.schemaVersion,
    createdAtIso: resolveCreatedAtIso(storage, updatedAtIso),
    updatedAtIso,
    state
  };

  try {
    writeSnapshot(storage, snapshot);
  } catch {
    // Ignore storage write failures to keep reducer flow deterministic.
  }
}
