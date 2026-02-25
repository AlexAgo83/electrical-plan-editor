import { describe, expect, it } from "vitest";
import {
  PERSISTED_STATE_PAYLOAD_KIND,
  PERSISTED_STATE_SCHEMA_VERSION,
  STORAGE_KEY,
  loadState,
  migratePersistedPayload,
  saveState,
  type PersistedStateSnapshotV1
} from "../adapters/persistence";
import { createSampleNetworkState, hasSampleNetworkSignature, type AppState } from "../store";

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

describe("sample network compatibility", () => {
  it("round-trips sample state through persistence snapshot save/load with deterministic catalog normalization", () => {
    const sample = createSampleNetworkState();
    const storage = createMemoryStorage();

    saveState(sample, storage, () => "2026-02-21T10:00:00.000Z");
    const loaded = loadState(storage, () => "2026-02-21T10:01:00.000Z");

    expect(loaded.schemaVersion).toBe(sample.schemaVersion);
    expect(loaded.activeNetworkId).toBe(sample.activeNetworkId);
    expect(loaded.networks).toEqual(sample.networks);
    expect(loaded.nodes).toEqual(sample.nodes);
    expect(loaded.segments).toEqual(sample.segments);
    expect(loaded.wires).toEqual(sample.wires);
    expect(loaded.catalogItems.allIds.length).toBeGreaterThanOrEqual(sample.catalogItems.allIds.length);
    expect(loaded.connectors.allIds).toEqual(sample.connectors.allIds);
    expect(loaded.splices.allIds).toEqual(sample.splices.allIds);
    expect(hasSampleNetworkSignature(loaded)).toBe(true);
  });

  it("migrates legacy sample payload to current persisted snapshot format", () => {
    const sample = createSampleNetworkState();
    const migration = migratePersistedPayload(toLegacySingleNetworkState(sample), "2026-02-21T10:15:00.000Z");

    expect(migration).not.toBeNull();
    expect(migration?.wasMigrated).toBe(true);
    expect(migration?.snapshot.schemaVersion).toBe(PERSISTED_STATE_SCHEMA_VERSION);
    expect(migration?.snapshot.payloadKind).toBe(PERSISTED_STATE_PAYLOAD_KIND);
    expect(hasSampleNetworkSignature(migration?.snapshot.state ?? sample)).toBe(true);
  });

  it("keeps sample signature after JSON serialization/deserialization of persisted snapshot", () => {
    const sample = createSampleNetworkState();
    const storage = createMemoryStorage();
    saveState(sample, storage, () => "2026-02-21T10:30:00.000Z");

    const raw = storage.read(STORAGE_KEY);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw ?? "{}") as PersistedStateSnapshotV1;
    const reEncoded = JSON.parse(JSON.stringify(parsed)) as unknown;
    const migration = migratePersistedPayload(reEncoded, "2026-02-21T10:31:00.000Z");

    expect(migration).not.toBeNull();
    expect(hasSampleNetworkSignature(migration?.snapshot.state ?? sample)).toBe(true);
  });
});
