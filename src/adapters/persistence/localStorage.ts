import { APP_SCHEMA_VERSION } from "../../core/schema";
import { createInitialState, type AppState } from "../../store";
import { migratePersistedPayload, type PersistedStateSnapshotV1 } from "./migrations";

export const STORAGE_KEY = "electrical-plan-editor.state";

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

export function loadState(storage: StorageLike | null = getDefaultStorage(), nowProvider: IsoNowProvider = getNowIso): AppState {
  if (storage === null) {
    return createInitialState();
  }

  try {
    const parsed = readJsonFromStorage(storage);
    if (parsed === null) {
      return createInitialState();
    }

    const migration = migratePersistedPayload(parsed, nowProvider());
    if (migration === null) {
      safeRemove(storage);
      return createInitialState();
    }

    if (migration.wasMigrated) {
      writeSnapshot(storage, migration.snapshot);
    }

    return migration.snapshot.state;
  } catch {
    safeRemove(storage);
    return createInitialState();
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
