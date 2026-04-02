import { APP_RELEASE_VERSION, APP_SCHEMA_VERSION } from "../../core/schema";
import { resolveStorageKey } from "../../config/environment";
import { createSampleNetworkState, normalizeAppError, type AppState } from "../../store";
import { parseJsonSafe } from "./json";
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
export const MIGRATION_BACKUP_KEY_PREFIX = `${STORAGE_KEY}.backup.pre-migration`;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type IsoNowProvider = () => string;
const createdAtIsoCache = new WeakMap<object, string>();
let pendingPersistenceRecovery: PersistenceRecoveryState | null = null;

export interface SaveStateResult {
  ok: boolean;
  reason?: "storage-unavailable" | "write-failed" | "quota-exceeded";
  warning?: "storage-near-quota";
}

export interface PersistenceRecoveryState {
  message: string;
  actionLabel: string;
  backupKey: string | null;
}

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

function isValidIsoDate(value: string): boolean {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}

function readJson(raw: string) {
  return parseJsonSafe<unknown>(raw);
}

function writeSnapshot(storage: Pick<Storage, "setItem">, snapshot: PersistedStateSnapshot): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function buildSnapshot(
  state: AppState,
  storage: Pick<Storage, "getItem">,
  updatedAtIso: string
): PersistedStateSnapshot {
  return {
    payloadKind: PERSISTED_STATE_PAYLOAD_KIND,
    schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
    appVersion: APP_RELEASE_VERSION,
    appSchemaVersion: state.schemaVersion,
    createdAtIso: resolveCreatedAtIso(storage, updatedAtIso),
    updatedAtIso,
    state
  };
}

function createRecoveryState(errorMessage: string): AppState {
  const sampleState = createSampleNetworkState();
  return {
    ...sampleState,
    ui: {
      ...sampleState.ui,
      lastError: normalizeAppError(errorMessage)
    }
  };
}

function setPendingPersistenceRecovery(message: string, backupKey: string | null): void {
  pendingPersistenceRecovery = {
    message,
    actionLabel: "Reset stored workspace",
    backupKey
  };
}

export function getPendingPersistenceRecovery(): PersistenceRecoveryState | null {
  return pendingPersistenceRecovery;
}

export function clearPendingPersistenceRecovery(): void {
  pendingPersistenceRecovery = null;
}

export function commitPendingPersistenceRecovery(
  storage: StorageLike | null = getDefaultStorage(),
  nowProvider: IsoNowProvider = getNowIso
): AppState {
  const sampleState = createSampleNetworkState();
  if (storage !== null) {
    const snapshot = buildSnapshot(sampleState, storage, nowProvider());
    writeSnapshot(storage, snapshot);
    createdAtIsoCache.set(storage as object, snapshot.createdAtIso);
  }
  clearPendingPersistenceRecovery();
  return sampleState;
}

function buildMigrationBackupKey(sourceSchemaVersion: number | null, nowIso: string): string {
  const safeIso = nowIso.replace(/[^0-9A-Za-z]+/g, "-");
  const versionSuffix = sourceSchemaVersion === null ? "unknown" : String(sourceSchemaVersion);
  return `${MIGRATION_BACKUP_KEY_PREFIX}.v${versionSuffix}.${safeIso}`;
}

function safeWriteBackupToKey(
  storage: Pick<Storage, "setItem">,
  backupKey: string,
  raw: string,
  reason: string,
  nowIso: string
): void {
  try {
    storage.setItem(
      backupKey,
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

function extractSchemaVersion(payload: unknown): number | null {
  if (typeof payload !== "object" || payload === null || !("schemaVersion" in payload)) {
    return null;
  }

  const schemaVersion = (payload as { schemaVersion?: unknown }).schemaVersion;
  return typeof schemaVersion === "number" && Number.isInteger(schemaVersion) ? schemaVersion : null;
}

function shouldPrepareMigrationBackup(payload: unknown): boolean {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as {
    payloadKind?: unknown;
    schemaVersion?: unknown;
    appSchemaVersion?: unknown;
  };

  return !(
    candidate.payloadKind === PERSISTED_STATE_PAYLOAD_KIND &&
    candidate.schemaVersion === PERSISTED_STATE_SCHEMA_VERSION &&
    candidate.appSchemaVersion === APP_SCHEMA_VERSION
  );
}

function isQuotaExceededError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED";
  }

  if (typeof error === "object" && error !== null) {
    const name = "name" in error ? (error as { name?: unknown }).name : undefined;
    const code = "code" in error ? (error as { code?: unknown }).code : undefined;
    return name === "QuotaExceededError" || code === 22 || code === 1014;
  }

  return false;
}

function estimateSerializedPayloadSize(raw: string): number {
  if (typeof Blob !== "undefined") {
    return new Blob([raw]).size;
  }

  return raw.length * 2;
}

async function estimateStoragePressure(raw: string): Promise<"storage-near-quota" | undefined> {
  if (typeof navigator === "undefined" || navigator.storage === undefined || typeof navigator.storage.estimate !== "function") {
    return undefined;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const quota = typeof estimate.quota === "number" ? estimate.quota : null;
    const usage = typeof estimate.usage === "number" ? estimate.usage : 0;
    if (quota === null || quota <= 0) {
      return undefined;
    }

    const remainingBytes = Math.max(quota - usage, 0);
    if (remainingBytes <= 0) {
      return "storage-near-quota";
    }

    return estimateSerializedPayloadSize(raw) >= remainingBytes * 0.8 ? "storage-near-quota" : undefined;
  } catch {
    return undefined;
  }
}

function safeWriteBackup(
  storage: Pick<Storage, "setItem">,
  raw: string,
  reason: string,
  nowIso: string
): void {
  safeWriteBackupToKey(storage, STORAGE_BACKUP_KEY, raw, reason, nowIso);
}

function bootstrapSampleState(storage: Pick<Storage, "setItem" | "getItem">, nowIso: string): AppState {
  const sampleState = createSampleNetworkState();
  const snapshot = buildSnapshot(sampleState, storage, nowIso);

  try {
    writeSnapshot(storage, snapshot);
    createdAtIsoCache.set(storage as object, snapshot.createdAtIso);
  } catch {
    // Ignore write failures and keep deterministic bootstrap state.
  }

  clearPendingPersistenceRecovery();
  return sampleState;
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

    const parsedPayloadResult = readJson(raw);
    if (!parsedPayloadResult.ok) {
      safeWriteBackup(storage, raw, "load-invalid-json", nowIso);
      const message = "Stored workspace data could not be loaded safely. Reset the stored workspace to continue.";
      setPendingPersistenceRecovery(message, STORAGE_BACKUP_KEY);
      return createRecoveryState(message);
    }

    const parsedPayload = parsedPayloadResult.value;
    const migrationBackupKey = shouldPrepareMigrationBackup(parsedPayload)
      ? buildMigrationBackupKey(extractSchemaVersion(parsedPayload), nowIso)
      : null;
    if (migrationBackupKey !== null) {
      safeWriteBackupToKey(storage, migrationBackupKey, raw, "pre-migration-backup", nowIso);
    }

    const migration = migratePersistedPayloadDetailed(parsedPayload, nowIso);
    if (!migration.ok) {
      safeWriteBackup(storage, raw, `load-failed:${migration.error.code}`, nowIso);
      const message = `${migration.error.message} Reset the stored workspace to continue.`;
      setPendingPersistenceRecovery(message, migrationBackupKey ?? STORAGE_BACKUP_KEY);
      return createRecoveryState(message);
    }

    if (migration.wasMigrated) {
      try {
        writeSnapshot(storage, migration.snapshot);
        if (migrationBackupKey !== null) {
          storage.removeItem(migrationBackupKey);
        }
      } catch (error) {
        if (migrationBackupKey !== null) {
          try {
            storage.setItem(STORAGE_KEY, raw);
          } catch {
            // Ignore restore failures and still surface recovery.
          }
        }

        const message = isQuotaExceededError(error)
          ? "Stored workspace migration could not be completed because browser storage is full. Your previous data was preserved."
          : "Stored workspace migration could not be completed safely. Your previous data was preserved.";
        setPendingPersistenceRecovery(message, migrationBackupKey);
        return createRecoveryState(message);
      }
    }

    clearPendingPersistenceRecovery();
    createdAtIsoCache.set(storage as object, migration.snapshot.createdAtIso);
    return migration.snapshot.state;
  } catch {
    const raw = rawFromInitialRead ?? readRawFromStorageSafe(storage);
    if (raw !== null) {
      safeWriteBackup(storage, raw, "load-json-parse-or-runtime-error", nowIso);
    }
    const message = "Stored workspace data could not be loaded safely. Reset the stored workspace to continue.";
    setPendingPersistenceRecovery(message, raw !== null ? STORAGE_BACKUP_KEY : null);
    return createRecoveryState(message);
  }
}

function resolveCreatedAtIsoFromRaw(
  raw: string | null,
  fallbackIso: string
): string {
  if (raw === null) {
    return fallbackIso;
  }

  const parsedResult = readJson(raw);
  if (parsedResult.ok) {
    const parsed = parsedResult.value;
    if (typeof parsed === "object" && parsed !== null && "createdAtIso" in parsed) {
      const createdAtIso = (parsed as { createdAtIso?: unknown }).createdAtIso;
      if (typeof createdAtIso === "string" && createdAtIso.length > 0 && isValidIsoDate(createdAtIso)) {
        return createdAtIso;
      }
    }
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

export async function saveState(
  state: AppState,
  storage: StorageLike | null = getDefaultStorage(),
  nowProvider: IsoNowProvider = getNowIso
): Promise<SaveStateResult> {
  if (storage === null) {
    return { ok: false, reason: "storage-unavailable" };
  }

  const updatedAtIso = nowProvider();
  const snapshot = buildSnapshot(state, storage, updatedAtIso);
  const serializedSnapshot = JSON.stringify(snapshot);
  const warning = await estimateStoragePressure(serializedSnapshot);

  try {
    storage.setItem(STORAGE_KEY, serializedSnapshot);
    createdAtIsoCache.set(storage as object, snapshot.createdAtIso);
    return warning === undefined ? { ok: true } : { ok: true, warning };
  } catch (error) {
    // Ignore storage write failures to keep reducer flow deterministic.
    return { ok: false, reason: isQuotaExceededError(error) ? "quota-exceeded" : "write-failed" };
  }
}
