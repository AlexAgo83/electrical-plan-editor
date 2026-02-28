import type { UndoHistoryEntry, UndoHistoryTargetKind } from "../../app/types/app-controller";
import type { NetworkId } from "../../core/entities";
import { STORAGE_KEY } from "./localStorage";

const RECENT_CHANGES_SCHEMA_VERSION = 1;
export const RECENT_CHANGES_STORAGE_KEY = `${STORAGE_KEY}.recent-changes.v1`;

type StorageLike = Pick<Storage, "getItem" | "setItem">;
type IsoNowProvider = () => string;

interface PersistedRecentChangesSnapshot {
  schemaVersion: number;
  updatedAtIso: string;
  entries: UndoHistoryEntry[];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUndoHistoryTargetKind(value: unknown): value is UndoHistoryTargetKind {
  return (
    value === "network" ||
    value === "catalog" ||
    value === "connector" ||
    value === "splice" ||
    value === "node" ||
    value === "segment" ||
    value === "wire" ||
    value === "layout" ||
    value === "workspace"
  );
}

function normalizeRecentChangesEntries(rawEntries: unknown, historyLimit: number): UndoHistoryEntry[] {
  if (!Array.isArray(rawEntries)) {
    return [];
  }

  const normalized: UndoHistoryEntry[] = [];
  for (const rawEntry of rawEntries) {
    if (!isRecord(rawEntry)) {
      continue;
    }

    const {
      sequence,
      actionType,
      targetKind,
      targetId,
      networkId: rawNetworkId,
      label,
      timestampIso
    } = rawEntry;

    if (!Number.isInteger(sequence) || Number(sequence) <= 0) {
      continue;
    }
    if (typeof actionType !== "string" || actionType.length === 0) {
      continue;
    }
    if (!isUndoHistoryTargetKind(targetKind)) {
      continue;
    }
    if (targetId !== null && typeof targetId !== "string") {
      continue;
    }
    if (rawNetworkId !== null && typeof rawNetworkId !== "string") {
      continue;
    }
    if (typeof label !== "string" || label.length === 0) {
      continue;
    }
    if (typeof timestampIso !== "string" || !Number.isFinite(Date.parse(timestampIso))) {
      continue;
    }

    normalized.push({
      sequence: Number(sequence),
      actionType,
      targetKind,
      targetId,
      networkId: rawNetworkId as NetworkId | null,
      label,
      timestampIso
    });
  }

  const boundedLimit = Math.max(1, Math.trunc(historyLimit));
  return normalized.slice(-boundedLimit);
}

export function loadRecentChangesMetadata(
  historyLimit: number,
  storage: StorageLike | null = getDefaultStorage()
): UndoHistoryEntry[] {
  if (storage === null) {
    return [];
  }

  try {
    const raw = storage.getItem(RECENT_CHANGES_STORAGE_KEY);
    if (raw === null) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.schemaVersion !== RECENT_CHANGES_SCHEMA_VERSION) {
      return [];
    }

    return normalizeRecentChangesEntries(parsed.entries, historyLimit);
  } catch {
    return [];
  }
}

export function saveRecentChangesMetadata(
  entries: UndoHistoryEntry[],
  historyLimit: number,
  storage: StorageLike | null = getDefaultStorage(),
  nowProvider: IsoNowProvider = getNowIso
): void {
  if (storage === null) {
    return;
  }

  const boundedLimit = Math.max(1, Math.trunc(historyLimit));
  const normalizedEntries = normalizeRecentChangesEntries(entries, boundedLimit);
  const snapshot: PersistedRecentChangesSnapshot = {
    schemaVersion: RECENT_CHANGES_SCHEMA_VERSION,
    updatedAtIso: nowProvider(),
    entries: normalizedEntries
  };

  try {
    storage.setItem(RECENT_CHANGES_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore write failures to preserve runtime behavior.
  }
}
