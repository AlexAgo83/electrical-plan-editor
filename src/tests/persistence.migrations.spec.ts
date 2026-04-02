import { afterEach, describe, expect, it, vi } from "vitest";
import { APP_RELEASE_VERSION, APP_SCHEMA_VERSION } from "../core/schema";
import {
  MIGRATION_BACKUP_KEY_PREFIX,
  PERSISTED_STATE_PAYLOAD_KIND,
  PERSISTED_STATE_SCHEMA_VERSION,
  clearPendingPersistenceRecovery,
  getPendingPersistenceRecovery,
  loadState,
  migratePersistedPayloadDetailed,
  setPersistenceMigrationStepOverrideForTests,
  STORAGE_KEY,
  type PersistedStateSnapshot
} from "../adapters/persistence";
import { appActions, appReducer, createInitialState, type AppState } from "../store";
import { asCatalogItemId, asConnectorId, asNodeId, asSegmentId, asSpliceId, asWireId } from "./helpers/app-ui-test-utils";

interface RecordingStorage extends Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  keys: () => string[];
  operations: Array<{ type: "set" | "remove"; key: string }>;
}

function createRecordingStorage(seed: Record<string, string>): RecordingStorage {
  const values = new Map(Object.entries(seed));
  const operations: RecordingStorage["operations"] = [];

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      operations.push({ type: "set", key });
      values.set(key, value);
    },
    removeItem(key) {
      operations.push({ type: "remove", key });
      values.delete(key);
    },
    keys() {
      return [...values.keys()];
    },
    operations
  };
}

function createMigrationFixtureState(): AppState {
  let state = createInitialState();
  const activeNetworkId = state.activeNetworkId;
  if (activeNetworkId === null) {
    throw new Error("Expected initial active network.");
  }

  state = appReducer(
    state,
    appActions.updateNetwork(activeNetworkId, "Body harness", "NET-BODY", "2026-04-02T08:00:00.000Z", "Main loom", {
      createdAt: "2026-03-01T00:00:00.000Z",
      author: "Alexandre",
      voltageV: 24,
      projectCode: "PRJ-42",
      logoUrl: "https://example.com/logo.png",
      exportNotes: "Notes exportees"
    })
  );

  state = [
    appActions.upsertCatalogItem({
      id: asCatalogItemId("catalog-2w"),
      manufacturerReference: "CAT-2W",
      name: "2-way connector",
      connectionCount: 2
    }),
    appActions.upsertConnector({
      id: asConnectorId("C1"),
      name: "Connector 1",
      technicalId: "C-1",
      catalogItemId: asCatalogItemId("catalog-2w"),
      manufacturerReference: "CAT-2W",
      cavityCount: 2
    }),
    appActions.upsertSplice({
      id: asSpliceId("S1"),
      name: "Splice 1",
      technicalId: "S-1",
      portCount: 2
    }),
    appActions.upsertNode({
      id: asNodeId("N-C1"),
      kind: "connector",
      connectorId: asConnectorId("C1")
    }),
    appActions.upsertNode({
      id: asNodeId("N-S1"),
      kind: "splice",
      spliceId: asSpliceId("S1")
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-1"),
      nodeA: asNodeId("N-C1"),
      nodeB: asNodeId("N-S1"),
      lengthMm: 120
    }),
    appActions.setNodePosition(asNodeId("N-C1"), { x: 100, y: 200 }),
    appActions.setNodePosition(asNodeId("N-S1"), { x: 400, y: 200 }),
    appActions.saveWire({
      id: asWireId("W1"),
      name: "Wire 1",
      technicalId: "W-1",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
    }),
    appActions.setNetworkSummaryViewState(activeNetworkId, {
      scale: 1.4,
      offset: { x: -80, y: 45 },
      showNetworkInfoPanels: true,
      showSegmentNames: true,
      showSegmentLengths: true,
      showCableCallouts: false,
      showNetworkGrid: true,
      snapNodesToGrid: true,
      lockEntityMovement: false
    })
  ].reduce(appReducer, state);

  return state;
}

function buildPreTimestampFixture(state: AppState) {
  return {
    schemaVersion: APP_SCHEMA_VERSION,
    state
  };
}

function buildLegacyTimestampedFixture(state: AppState) {
  return {
    schemaVersion: APP_SCHEMA_VERSION,
    createdAtIso: "2026-03-05T08:00:00.000Z",
    updatedAtIso: "2026-03-05T09:00:00.000Z",
    state
  };
}

function buildCurrentVersionedFixture(state: AppState): PersistedStateSnapshot {
  return {
    payloadKind: PERSISTED_STATE_PAYLOAD_KIND,
    schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
    appVersion: APP_RELEASE_VERSION,
    appSchemaVersion: APP_SCHEMA_VERSION,
    createdAtIso: "2026-03-05T08:00:00.000Z",
    updatedAtIso: "2026-03-05T09:00:00.000Z",
    state
  };
}

function expectPreservedUserFields(nextState: AppState): void {
  const activeNetworkId = nextState.activeNetworkId;
  expect(activeNetworkId).not.toBeNull();
  if (activeNetworkId === null) {
    throw new Error("Expected active network after migration.");
  }

  expect(nextState.networks.byId[activeNetworkId]?.name).toBe("Body harness");
  expect(nextState.networks.byId[activeNetworkId]?.technicalId).toBe("NET-BODY");
  expect(nextState.networks.byId[activeNetworkId]?.projectCode).toBe("PRJ-42");
  expect(nextState.networks.byId[activeNetworkId]?.author).toBe("Alexandre");
  expect(nextState.connectors.allIds).toEqual([asConnectorId("C1")]);
  expect(nextState.splices.allIds).toEqual([asSpliceId("S1")]);
  expect(nextState.nodes.allIds).toEqual([asNodeId("N-C1"), asNodeId("N-S1")]);
  expect(nextState.segments.allIds).toEqual([asSegmentId("SEG-1")]);
  expect(nextState.wires.allIds).toEqual([asWireId("W1")]);
  expect(nextState.networkStates[activeNetworkId]?.networkSummaryViewState).toEqual({
    scale: 1.4,
    offset: { x: -80, y: 45 },
    showNetworkInfoPanels: true,
    showSegmentNames: true,
    showSegmentLengths: true,
    showCableCallouts: false,
    showNetworkGrid: true,
    snapNodesToGrid: true,
    lockEntityMovement: false
  });
}

describe("persistence migrations", () => {
  afterEach(() => {
    clearPendingPersistenceRecovery();
    setPersistenceMigrationStepOverrideForTests(1, null);
    setPersistenceMigrationStepOverrideForTests(2, null);
    vi.restoreAllMocks();
  });

  it("keeps the current v3 versioned fixture unchanged", () => {
    const fixtureState = createMigrationFixtureState();
    const fixture = buildCurrentVersionedFixture(fixtureState);

    const result = migratePersistedPayloadDetailed(fixture, "2026-04-02T10:00:00.000Z");

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected current fixture to remain valid.");
    }
    expect(result.wasMigrated).toBe(false);
    expect(result.snapshot).toEqual(fixture);
  });

  it("migrates the pre-timestamp v1 fixture and preserves user-authored fields", () => {
    const fixture = buildPreTimestampFixture(createMigrationFixtureState());

    const result = migratePersistedPayloadDetailed(fixture, "2026-04-02T10:00:00.000Z");

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected pre-timestamp fixture to migrate.");
    }
    expect(result.wasMigrated).toBe(true);
    expectPreservedUserFields(result.snapshot.state);
  });

  it("migrates the timestamped v2 fixture and preserves user-authored fields", () => {
    const fixture = buildLegacyTimestampedFixture(createMigrationFixtureState());

    const result = migratePersistedPayloadDetailed(fixture, "2026-04-02T10:00:00.000Z");

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected timestamped fixture to migrate.");
    }
    expect(result.wasMigrated).toBe(true);
    expect(result.snapshot.createdAtIso).toBe("2026-03-05T08:00:00.000Z");
    expect(result.snapshot.updatedAtIso).toBe("2026-03-05T09:00:00.000Z");
    expectPreservedUserFields(result.snapshot.state);
  });

  it("surfaces a step-1 migration failure through the recovery state without crashing", () => {
    setPersistenceMigrationStepOverrideForTests(1, () => {
      throw new Error("step-1 boom");
    });

    const storage = createRecordingStorage({
      [STORAGE_KEY]: JSON.stringify(buildPreTimestampFixture(createMigrationFixtureState()))
    });

    const loaded = loadState(storage, () => "2026-04-02T10:00:00.000Z");

    expect(loaded.ui.lastError).toMatch(/migration failed/i);
    expect(getPendingPersistenceRecovery()?.message).toMatch(/reset the stored workspace/i);
  });

  it("surfaces a step-2 migration failure through the recovery state without crashing", () => {
    setPersistenceMigrationStepOverrideForTests(1, (snapshot) => ({
      ...snapshot,
      version: 2
    }));
    setPersistenceMigrationStepOverrideForTests(2, () => {
      throw new Error("step-2 boom");
    });

    const storage = createRecordingStorage({
      [STORAGE_KEY]: JSON.stringify(buildPreTimestampFixture(createMigrationFixtureState()))
    });

    const loaded = loadState(storage, () => "2026-04-02T10:00:00.000Z");

    expect(loaded.ui.lastError).toMatch(/migration failed/i);
    expect(getPendingPersistenceRecovery()?.message).toMatch(/reset the stored workspace/i);
  });

  it("writes and then removes the pre-migration backup on successful migration", () => {
    const storage = createRecordingStorage({
      [STORAGE_KEY]: JSON.stringify(buildLegacyTimestampedFixture(createMigrationFixtureState()))
    });

    const loaded = loadState(storage, () => "2026-04-02T10:00:00.000Z");

    expect(loaded.ui.lastError).toBeNull();
    const backupSet = storage.operations.find(
      (entry) => entry.type === "set" && entry.key.startsWith(MIGRATION_BACKUP_KEY_PREFIX)
    );
    const backupRemoved = storage.operations.find(
      (entry) => entry.type === "remove" && entry.key.startsWith(MIGRATION_BACKUP_KEY_PREFIX)
    );
    expect(backupSet).toBeDefined();
    expect(backupRemoved).toBeDefined();
    expect(storage.keys().some((key) => key.startsWith(MIGRATION_BACKUP_KEY_PREFIX))).toBe(false);
  });
});
