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
const createdAtIsoCache = new WeakMap<object, string>();

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

function readRawFromStorageSafe(storage: Pick<Storage, "getItem">): string | null {
  try {
    return readRawFromStorage(storage);
  } catch {
    return null;
  }
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
    createdAtIsoCache.set(storage as object, snapshot.createdAtIso);
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

  let rawFromInitialRead: string | null = null;
  try {
    const raw = readRawFromStorageSafe(storage);
    rawFromInitialRead = raw;
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

    createdAtIsoCache.set(storage as object, migration.snapshot.createdAtIso);
    return migration.snapshot.state;
  } catch {
    const raw = rawFromInitialRead ?? readRawFromStorageSafe(storage);
    if (raw !== null) {
      safeWriteBackup(storage, raw, "load-json-parse-or-runtime-error", nowIso);
    }
    return bootstrapSampleState(storage, nowIso, "Stored workspace data could not be loaded safely. A backup copy was preserved.");
  }
}

function resolveCreatedAtIsoFromRaw(
  raw: string | null,
  fallbackIso: string
): string {
  if (raw === null) {
    return fallbackIso;
  }

  try {
    const parsed = readJson(raw);
    if (typeof parsed === "object" && parsed !== null && "createdAtIso" in parsed) {
      const createdAtIso = (parsed as { createdAtIso?: unknown }).createdAtIso;
      if (typeof createdAtIso === "string" && createdAtIso.length > 0) {
        return createdAtIso;
      }
    }
  } catch {
    // Ignore malformed persisted payloads and fall back to updatedAtIso.
  }

  return fallbackIso;
}

function resolveCreatedAtIso(
  storage: Pick<Storage, "getItem">,
  updatedAtIso: string
): string {
  const cached = createdAtIsoCache.get(storage as object);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const resolved = resolveCreatedAtIsoFromRaw(readRawFromStorageSafe(storage), updatedAtIso);
    createdAtIsoCache.set(storage as object, resolved);
    return resolved;
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
    createdAtIsoCache.set(storage as object, snapshot.createdAtIso);
  } catch {
    // Ignore storage write failures to keep reducer flow deterministic.
  }
}
