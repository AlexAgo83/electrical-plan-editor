import { APP_SCHEMA_VERSION } from "../../core/schema";
import { resolveStorageKey } from "../../config/environment";
import { createSampleNetworkState, isWorkspaceEmpty, type AppState } from "../../store";
import { migratePersistedPayload, type PersistedStateSnapshotV1 } from "./migrations";

const configuredStorageKey =
  typeof import.meta.env.VITE_STORAGE_KEY === "string" ? import.meta.env.VITE_STORAGE_KEY : undefined;

export const STORAGE_KEY = resolveStorageKey(configuredStorageKey);

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type IsoNowProvider = () => string;

function getDefaultStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function getNowIso(): string {
  return new Date().toISOString();
}

function readJsonFromStorage(storage: Pick<Storage, "getItem">): unknown {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) {
    return null;
  }

  return JSON.parse(raw) as unknown;
}

function writeSnapshot(storage: Pick<Storage, "setItem">, snapshot: PersistedStateSnapshotV1): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function safeRemove(storage: Pick<Storage, "removeItem">): void {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures and keep fallback behavior stable.
  }
}

function bootstrapSampleState(
  storage: Pick<Storage, "setItem">,
  nowIso: string
): AppState {
  const sampleState = createSampleNetworkState();
  const snapshot: PersistedStateSnapshotV1 = {
    schemaVersion: APP_SCHEMA_VERSION,
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    state: sampleState
  };

  try {
    writeSnapshot(storage, snapshot);
  } catch {
    // Ignore write failures and keep deterministic bootstrap state.
  }

  return sampleState;
}

export function loadState(storage: StorageLike | null = getDefaultStorage(), nowProvider: IsoNowProvider = getNowIso): AppState {
  const nowIso = nowProvider();
  if (storage === null) {
    return createSampleNetworkState();
  }

  try {
    const parsed = readJsonFromStorage(storage);
    if (parsed === null) {
      return bootstrapSampleState(storage, nowIso);
    }

    const migration = migratePersistedPayload(parsed, nowIso);
    if (migration === null) {
      safeRemove(storage);
      return bootstrapSampleState(storage, nowIso);
    }

    if (migration.wasMigrated) {
      writeSnapshot(storage, migration.snapshot);
    }

    if (isWorkspaceEmpty(migration.snapshot.state)) {
      return bootstrapSampleState(storage, nowIso);
    }

    return migration.snapshot.state;
  } catch {
    safeRemove(storage);
    return bootstrapSampleState(storage, nowIso);
  }
}

function resolveCreatedAtIso(
  storage: Pick<Storage, "getItem">,
  updatedAtIso: string
): string {
  try {
    const parsed = readJsonFromStorage(storage);
    if (parsed === null) {
      return updatedAtIso;
    }

    const migration = migratePersistedPayload(parsed, updatedAtIso);
    return migration?.snapshot.createdAtIso ?? updatedAtIso;
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
  const snapshot: PersistedStateSnapshotV1 = {
    schemaVersion: APP_SCHEMA_VERSION,
    createdAtIso: resolveCreatedAtIso(storage, updatedAtIso),
    updatedAtIso,
    state: {
      ...state,
      schemaVersion: APP_SCHEMA_VERSION
    }
  };

  try {
    writeSnapshot(storage, snapshot);
  } catch {
    // Ignore storage write failures to keep reducer flow deterministic.
  }
}
