import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConnectorId, NodeId } from "../core/entities";
import { APP_SCHEMA_VERSION } from "../core/schema";
import {
  STORAGE_KEY,
  loadState,
  migratePersistedPayload,
  saveState,
  type PersistedStateSnapshotV1
} from "../adapters/persistence";
import {
  appActions,
  appReducer,
  createInitialState,
  createSampleNetworkState,
  hasSampleNetworkSignature,
  isWorkspaceEmpty,
  type AppState
} from "../store";

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

function asNodeId(value: string): NodeId {
  return value as NodeId;
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

function toLegacySingleNetworkState(state: AppState): unknown {
  return {
    schemaVersion: 1,
    connectors: state.connectors,
    splices: state.splices,
    nodes: state.nodes,
    segments: state.segments,
    wires: state.wires,
    connectorCavityOccupancy: state.connectorCavityOccupancy,
    splicePortOccupancy: state.splicePortOccupancy,
    ui: {
      selected: state.ui.selected,
      lastError: state.ui.lastError
    },
    meta: state.meta
  };
}

describe("migratePersistedPayload", () => {
  it("keeps a current schema snapshot unchanged", () => {
    const state = createSampleState();
    const currentSnapshot: PersistedStateSnapshotV1 = {
      schemaVersion: APP_SCHEMA_VERSION,
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

    const result = migratePersistedPayload(toLegacySingleNetworkState(legacyState), nowIso);

    expect(result).not.toBeNull();
    expect(result?.wasMigrated).toBe(true);
    expect(result?.snapshot.schemaVersion).toBe(APP_SCHEMA_VERSION);
    expect(result?.snapshot.createdAtIso).toBe(nowIso);
    expect(result?.snapshot.updatedAtIso).toBe(nowIso);
    expect(result?.snapshot.state.connectors).toEqual(legacyState.connectors);
    expect(result?.snapshot.state.splices).toEqual(legacyState.splices);
    expect(result?.snapshot.state.nodes).toEqual(legacyState.nodes);
    expect(result?.snapshot.state.segments).toEqual(legacyState.segments);
    expect(result?.snapshot.state.wires).toEqual(legacyState.wires);
  });
});

describe("localStorage persistence adapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("bootstraps sample state on first run when storage is empty", () => {
    const nowIso = "2026-02-20T10:30:00.000Z";
    const storage = createMemoryStorage();

    const loaded = loadState(storage, () => nowIso);
    const savedRaw = storage.read(STORAGE_KEY);

    expect(hasSampleNetworkSignature(loaded)).toBe(true);
    expect(isWorkspaceEmpty(loaded)).toBe(false);
    expect(savedRaw).not.toBeNull();

    const savedSnapshot = JSON.parse(savedRaw ?? "{}") as PersistedStateSnapshotV1;
    expect(savedSnapshot.schemaVersion).toBe(APP_SCHEMA_VERSION);
    expect(savedSnapshot.createdAtIso).toBe(nowIso);
    expect(savedSnapshot.updatedAtIso).toBe(nowIso);
    expect(hasSampleNetworkSignature(savedSnapshot.state)).toBe(true);
  });

  it("restores state from a persisted snapshot", () => {
    const state = createSampleState();
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: "2026-02-01T08:00:00.000Z",
        updatedAtIso: "2026-02-01T09:00:00.000Z",
        state
      } satisfies PersistedStateSnapshotV1)
    });

    const loaded = loadState(storage, () => "2026-02-20T11:00:00.000Z");

    expect(loaded).toEqual(state);
  });

  it("migrates persisted schema payloads missing layout positions", () => {
    const state = createSampleState();
    const nowIso = "2026-02-20T11:00:00.000Z";
    const rawSnapshotWithoutPositions = JSON.stringify({
      schemaVersion: APP_SCHEMA_VERSION,
      createdAtIso: "2026-02-01T08:00:00.000Z",
      updatedAtIso: "2026-02-01T09:00:00.000Z",
      state: {
        ...state,
        networkStates: Object.fromEntries(
          Object.entries(state.networkStates).map(([networkId, scoped]) => [
            networkId,
            {
              connectors: scoped.connectors,
              splices: scoped.splices,
              nodes: scoped.nodes,
              segments: scoped.segments,
              wires: scoped.wires,
              connectorCavityOccupancy: scoped.connectorCavityOccupancy,
              splicePortOccupancy: scoped.splicePortOccupancy
            }
          ])
        )
      }
    });
    const storage = createMemoryStorage({
      [STORAGE_KEY]: rawSnapshotWithoutPositions
    });

    const loaded = loadState(storage, () => nowIso);
    const activeNetworkId = loaded.activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    if (activeNetworkId === null) {
      throw new Error("Expected an active network after migration.");
    }

    expect(loaded.nodePositions).toEqual({});
    expect(loaded.networkStates[activeNetworkId]?.nodePositions).toEqual({});
  });

  it("falls back safely and clears corrupted payload", () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: "{not-valid-json"
    });

    const loaded = loadState(storage, () => "2026-02-20T11:30:00.000Z");

    expect(hasSampleNetworkSignature(loaded)).toBe(true);
    expect(storage.read(STORAGE_KEY)).not.toBeNull();
  });

  it("migrates legacy payload and rewrites storage using the current snapshot schema", () => {
    const legacyState = createSampleState();
    const nowIso = "2026-02-20T12:00:00.000Z";
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify(toLegacySingleNetworkState(legacyState))
    });

    const loaded = loadState(storage, () => nowIso);
    const rewritten = storage.read(STORAGE_KEY);

    expect(loaded.connectors).toEqual(legacyState.connectors);
    expect(loaded.splices).toEqual(legacyState.splices);
    expect(loaded.nodes).toEqual(legacyState.nodes);
    expect(loaded.segments).toEqual(legacyState.segments);
    expect(loaded.wires).toEqual(legacyState.wires);
    expect(rewritten).not.toBeNull();

    const rewrittenSnapshot = JSON.parse(rewritten ?? "{}") as PersistedStateSnapshotV1;
    expect(rewrittenSnapshot.schemaVersion).toBe(APP_SCHEMA_VERSION);
    expect(rewrittenSnapshot.createdAtIso).toBe(nowIso);
    expect(rewrittenSnapshot.updatedAtIso).toBe(nowIso);
    expect(rewrittenSnapshot.state).toEqual(loaded);
  });

  it("restores a valid persisted empty workspace without bootstrapping the sample", () => {
    const emptyState = createInitialState();
    const nowIso = "2026-02-20T12:30:00.000Z";
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: "2026-02-10T08:00:00.000Z",
        updatedAtIso: "2026-02-10T08:00:00.000Z",
        state: emptyState
      } satisfies PersistedStateSnapshotV1)
    });

    const loaded = loadState(storage, () => nowIso);
    expect(loaded).toEqual(emptyState);
    expect(isWorkspaceEmpty(loaded)).toBe(true);
    expect(hasSampleNetworkSignature(loaded)).toBe(false);

    const rewrittenRaw = storage.read(STORAGE_KEY);
    expect(rewrittenRaw).not.toBeNull();
    const rewrittenSnapshot = JSON.parse(rewrittenRaw ?? "{}") as PersistedStateSnapshotV1;
    expect(rewrittenSnapshot.state).toEqual(emptyState);
  });

  it("falls back safely when the default localStorage accessor throws", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("Storage access blocked");
    });

    const loaded = loadState(undefined, () => "2026-02-20T12:35:00.000Z");
    expect(hasSampleNetworkSignature(loaded)).toBe(true);

    expect(() => {
      saveState(createInitialState(), undefined, () => "2026-02-20T12:36:00.000Z");
    }).not.toThrow();
  });

  it("does not overwrite existing non-empty user state", () => {
    const existingState = createSampleState();
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: "2026-02-10T08:00:00.000Z",
        updatedAtIso: "2026-02-10T08:30:00.000Z",
        state: existingState
      } satisfies PersistedStateSnapshotV1)
    });

    const loaded = loadState(storage, () => "2026-02-20T12:45:00.000Z");

    expect(loaded).toEqual(existingState);
    expect(hasSampleNetworkSignature(loaded)).toBe(false);
  });

  it("keeps deterministic built-in sample fixture available from store helper", () => {
    const sample = createSampleNetworkState();
    expect(hasSampleNetworkSignature(sample)).toBe(true);
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
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: "2026-02-10T07:00:00.000Z",
        updatedAtIso: "2026-02-10T08:00:00.000Z",
        state: firstState
      } satisfies PersistedStateSnapshotV1)
    });

    saveState(secondState, storage, () => "2026-02-20T13:00:00.000Z");

    const raw = storage.read(STORAGE_KEY);
    expect(raw).not.toBeNull();

    const savedSnapshot = JSON.parse(raw ?? "{}") as PersistedStateSnapshotV1;
    expect(savedSnapshot.schemaVersion).toBe(APP_SCHEMA_VERSION);
    expect(savedSnapshot.createdAtIso).toBe("2026-02-10T07:00:00.000Z");
    expect(savedSnapshot.updatedAtIso).toBe("2026-02-20T13:00:00.000Z");
    expect(savedSnapshot.state).toEqual(secondState);
  });

  it("persists and restores node layout positions across save/load", () => {
    const withNode = appReducer(
      createInitialState(),
      appActions.upsertNode({
        id: asNodeId("N-LAYOUT"),
        kind: "intermediate",
        label: "Layout node"
      })
    );
    const positioned = appReducer(withNode, appActions.setNodePosition(asNodeId("N-LAYOUT"), { x: 280, y: 160 }));
    const storage = createMemoryStorage();

    saveState(positioned, storage, () => "2026-02-20T14:00:00.000Z");
    const loaded = loadState(storage, () => "2026-02-20T14:01:00.000Z");

    expect(loaded.nodePositions[asNodeId("N-LAYOUT")]).toEqual({ x: 280, y: 160 });
    const activeNetworkId = loaded.activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    if (activeNetworkId === null) {
      throw new Error("Expected active network.");
    }
    expect(loaded.networkStates[activeNetworkId]?.nodePositions[asNodeId("N-LAYOUT")]).toEqual({ x: 280, y: 160 });
  });
});
