import { describe, expect, it } from "vitest";
import type { ConnectorId } from "../core/entities";
import {
  STORAGE_KEY,
  loadState,
  migratePersistedPayload,
  saveState,
  type PersistedStateSnapshotV1
} from "../adapters/persistence";
import { appActions, appReducer, createInitialState, type AppState } from "../store";

interface MemoryStorage extends Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  read: (key: string) => string | null;
}

function createMemoryStorage(seed: Record<string, string> = {}): MemoryStorage {
  const entries = new Map(Object.entries(seed));

  return {
    getItem(key: string) {
      return entries.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      entries.set(key, value);
    },
    removeItem(key: string) {
      entries.delete(key);
    },
    read(key: string) {
      return entries.get(key) ?? null;
    }
  };
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function createSampleState(): AppState {
  return [
    appActions.upsertConnector({
      id: asConnectorId("C1"),
      name: "Connector 1",
      technicalId: "C-1",
      cavityCount: 2
    }),
    appActions.occupyConnectorCavity(asConnectorId("C1"), 1, "wire:W1:A")
  ].reduce(appReducer, createInitialState());
}

describe("migratePersistedPayload", () => {
  it("keeps a current schema snapshot unchanged", () => {
    const state = createSampleState();
    const currentSnapshot: PersistedStateSnapshotV1 = {
      schemaVersion: 1,
      createdAtIso: "2026-02-10T08:00:00.000Z",
      updatedAtIso: "2026-02-10T08:30:00.000Z",
      state
    };

    const result = migratePersistedPayload(currentSnapshot, "2026-02-20T09:00:00.000Z");

    expect(result).not.toBeNull();
    expect(result?.wasMigrated).toBe(false);
    expect(result?.snapshot).toEqual(currentSnapshot);
  });

  it("migrates legacy state payload into current snapshot", () => {
    const legacyState = createSampleState();
    const nowIso = "2026-02-20T10:00:00.000Z";

    const result = migratePersistedPayload(legacyState, nowIso);

    expect(result).not.toBeNull();
    expect(result?.wasMigrated).toBe(true);
    expect(result?.snapshot.schemaVersion).toBe(1);
    expect(result?.snapshot.createdAtIso).toBe(nowIso);
    expect(result?.snapshot.updatedAtIso).toBe(nowIso);
    expect(result?.snapshot.state).toEqual(legacyState);
  });
});

describe("localStorage persistence adapter", () => {
  it("restores state from a persisted snapshot", () => {
    const state = createSampleState();
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: 1,
        createdAtIso: "2026-02-01T08:00:00.000Z",
        updatedAtIso: "2026-02-01T09:00:00.000Z",
        state
      } satisfies PersistedStateSnapshotV1)
    });

    const loaded = loadState(storage, () => "2026-02-20T11:00:00.000Z");

    expect(loaded).toEqual(state);
  });

  it("falls back safely and clears corrupted payload", () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: "{not-valid-json"
    });

    const loaded = loadState(storage, () => "2026-02-20T11:30:00.000Z");

    expect(loaded).toEqual(createInitialState());
    expect(storage.read(STORAGE_KEY)).toBeNull();
  });

  it("migrates legacy payload and rewrites storage using the current snapshot schema", () => {
    const legacyState = createSampleState();
    const nowIso = "2026-02-20T12:00:00.000Z";
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify(legacyState)
    });

    const loaded = loadState(storage, () => nowIso);
    const rewritten = storage.read(STORAGE_KEY);

    expect(loaded).toEqual(legacyState);
    expect(rewritten).not.toBeNull();

    const rewrittenSnapshot = JSON.parse(rewritten ?? "{}") as PersistedStateSnapshotV1;
    expect(rewrittenSnapshot.schemaVersion).toBe(1);
    expect(rewrittenSnapshot.createdAtIso).toBe(nowIso);
    expect(rewrittenSnapshot.updatedAtIso).toBe(nowIso);
    expect(rewrittenSnapshot.state).toEqual(legacyState);
  });

  it("saves with schema version and preserves createdAt timestamp across updates", () => {
    const firstState = createSampleState();
    const secondState = appReducer(
      firstState,
      appActions.upsertConnector({
        id: asConnectorId("C2"),
        name: "Connector 2",
        technicalId: "C-2",
        cavityCount: 4
      })
    );
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: 1,
        createdAtIso: "2026-02-10T07:00:00.000Z",
        updatedAtIso: "2026-02-10T08:00:00.000Z",
        state: firstState
      } satisfies PersistedStateSnapshotV1)
    });

    saveState(secondState, storage, () => "2026-02-20T13:00:00.000Z");

    const raw = storage.read(STORAGE_KEY);
    expect(raw).not.toBeNull();

    const savedSnapshot = JSON.parse(raw ?? "{}") as PersistedStateSnapshotV1;
    expect(savedSnapshot.schemaVersion).toBe(1);
    expect(savedSnapshot.createdAtIso).toBe("2026-02-10T07:00:00.000Z");
    expect(savedSnapshot.updatedAtIso).toBe("2026-02-20T13:00:00.000Z");
    expect(savedSnapshot.state).toEqual(secondState);
  });
});
