import { afterEach, describe, expect, it, vi } from "vitest";
import { APP_SCHEMA_VERSION } from "../core/schema";
import {
  clearPendingPersistenceRecovery,
  commitPendingPersistenceRecovery,
  getPendingPersistenceRecovery,
  MIGRATION_BACKUP_KEY_PREFIX,
  PERSISTED_STATE_PAYLOAD_KIND,
  PERSISTED_STATE_SCHEMA_VERSION,
  RECENT_CHANGES_STORAGE_KEY,
  STORAGE_BACKUP_KEY,
  STORAGE_KEY,
  loadState,
  loadRecentChangesMetadata,
  saveRecentChangesMetadata,
  saveState,
  setPersistenceMigrationStepOverrideForTests,
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
import {
  asCatalogItemId,
  asConnectorId,
  asNodeId,
  createMemoryStorage,
  createSampleState,
  toLegacySingleNetworkState
} from "./helpers/persistence-local-storage-test-utils";

describe("localStorage persistence adapter - migration recovery and sidecars", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearPendingPersistenceRecovery();
    setPersistenceMigrationStepOverrideForTests(1, null);
    setPersistenceMigrationStepOverrideForTests(2, null);
  });

  it("bootstraps deterministic legacy placeholders for connectors while keeping unlinked splices without placeholders", () => {
    const state = createSampleNetworkState();
    const activeNetworkId = state.activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    if (activeNetworkId === null) {
      throw new Error("Expected active network.");
    }
    const connectorId = state.connectors.allIds[0];
    const spliceId = state.splices.allIds[0];
    expect(connectorId).toBeDefined();
    expect(spliceId).toBeDefined();
    if (connectorId === undefined || spliceId === undefined) {
      throw new Error("Expected sample connector/splice.");
    }

    const connector = state.connectors.byId[connectorId]!;
    const splice = state.splices.byId[spliceId]!;
    const scoped = state.networkStates[activeNetworkId]!;
    const expectedConnectorPlaceholder = "LEGACY-NOREF-C-CONN-LEGACY-01";
    const legacyRawState: AppState = {
      ...state,
      connectors: {
        ...state.connectors,
        byId: {
          ...state.connectors.byId,
          [connectorId]: {
            ...connector,
            technicalId: "Conn / Legacy 01",
            manufacturerReference: " ",
            catalogItemId: undefined
          }
        }
      },
      splices: {
        ...state.splices,
        byId: {
          ...state.splices.byId,
          [spliceId]: {
            ...splice,
            technicalId: "splice:legacy?2",
            manufacturerReference: "",
            catalogItemId: undefined
          }
        }
      },
      networkStates: {
        ...state.networkStates,
        [activeNetworkId]: {
          ...scoped,
          connectors: {
            ...scoped.connectors,
            byId: {
              ...scoped.connectors.byId,
              [connectorId]: {
                ...scoped.connectors.byId[connectorId]!,
                technicalId: "Conn / Legacy 01",
                manufacturerReference: " ",
                catalogItemId: undefined
              }
            }
          },
          splices: {
            ...scoped.splices,
            byId: {
              ...scoped.splices.byId,
              [spliceId]: {
                ...scoped.splices.byId[spliceId]!,
                technicalId: "splice:legacy?2",
                manufacturerReference: "",
                catalogItemId: undefined
              }
            }
          },
          catalogItems: { byId: {} as typeof scoped.catalogItems.byId, allIds: [] }
        }
      },
      catalogItems: { byId: {} as typeof state.catalogItems.byId, allIds: [] }
    };

    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: "2026-02-01T08:00:00.000Z",
        updatedAtIso: "2026-02-01T09:00:00.000Z",
        state: legacyRawState
      } satisfies PersistedStateSnapshotV1)
    });

    const loaded = loadState(storage, () => "2026-02-22T09:00:00.000Z");
    const loadedConnector = loaded.connectors.byId[connectorId];
    const loadedSplice = loaded.splices.byId[spliceId];
    expect(loadedConnector?.manufacturerReference).toBe(expectedConnectorPlaceholder);
    expect(loadedSplice?.manufacturerReference).toBeUndefined();
    expect(loadedConnector?.catalogItemId).toBeDefined();
    expect(loadedSplice?.catalogItemId).toBeUndefined();
    if (loadedConnector?.catalogItemId !== undefined) {
      expect(loaded.catalogItems.byId[loadedConnector.catalogItemId]?.manufacturerReference).toBe(
        expectedConnectorPlaceholder
      );
    }
  });

  it("keeps case-variant duplicate catalog manufacturer references unchanged on load", () => {
    const state = createSampleState();
    const activeNetworkId = state.activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    if (activeNetworkId === null) {
      throw new Error("Expected active network.");
    }

    const duplicateCatalogId = asCatalogItemId("catalog-c2");
    const scoped = state.networkStates[activeNetworkId];
    expect(scoped).toBeDefined();
    if (scoped === undefined) {
      throw new Error("Expected scoped state for active network.");
    }

    const legacyStateWithCaseVariantDuplicate: AppState = {
      ...state,
      catalogItems: {
        byId: {
          ...state.catalogItems.byId,
          [duplicateCatalogId]: {
            id: duplicateCatalogId,
            manufacturerReference: "conn-test-2w",
            connectionCount: 2
          }
        },
        allIds: [...state.catalogItems.allIds, duplicateCatalogId]
      },
      networkStates: {
        ...state.networkStates,
        [activeNetworkId]: {
          ...scoped,
          catalogItems: {
            byId: {
              ...scoped.catalogItems.byId,
              [duplicateCatalogId]: {
                id: duplicateCatalogId,
                manufacturerReference: "conn-test-2w",
                connectionCount: 2
              }
            },
            allIds: [...scoped.catalogItems.allIds, duplicateCatalogId]
          }
        }
      }
    };

    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: "2026-02-01T08:00:00.000Z",
        updatedAtIso: "2026-02-01T09:00:00.000Z",
        state: legacyStateWithCaseVariantDuplicate
      } satisfies PersistedStateSnapshotV1)
    });

    const loaded = loadState(storage, () => "2026-02-22T09:00:00.000Z");
    expect(loaded.catalogItems.byId[asCatalogItemId("catalog-c1")]?.manufacturerReference).toBe("CONN-TEST-2W");
    expect(loaded.catalogItems.byId[duplicateCatalogId]?.manufacturerReference).toBe("conn-test-2w");
    expect(loaded.catalogItems.allIds).toContain(duplicateCatalogId);
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

  it("keeps corrupted payload untouched until explicit recovery reset", () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: "{not-valid-json"
    });

    const loaded = loadState(storage, () => "2026-02-20T11:30:00.000Z");

    expect(hasSampleNetworkSignature(loaded)).toBe(true);
    expect(storage.read(STORAGE_KEY)).toBe("{not-valid-json");
    expect(getPendingPersistenceRecovery()?.message).toMatch(/could not be loaded safely/i);

    const committed = commitPendingPersistenceRecovery(storage, () => "2026-02-20T11:31:00.000Z");
    expect(hasSampleNetworkSignature(committed)).toBe(true);
    expect(storage.read(STORAGE_KEY)).not.toBe("{not-valid-json");
    expect(getPendingPersistenceRecovery()).toBeNull();
  });

  it("falls back safely when storage getItem throws at load time", () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("read blocked");
      }),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    const loaded = loadState(storage, () => "2026-02-20T11:35:00.000Z");

    expect(hasSampleNetworkSignature(loaded)).toBe(true);
    expect(storage.setItem).toHaveBeenCalled();
  });

  it("migrates legacy payload and rewrites storage using the current snapshot schema", () => {
    const legacyState = createSampleState();
    const nowIso = "2026-02-20T12:00:00.000Z";
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify(toLegacySingleNetworkState(legacyState))
    });

    const loaded = loadState(storage, () => nowIso);
    const rewritten = storage.read(STORAGE_KEY);

    expect(loaded.connectors.allIds).toEqual(legacyState.connectors.allIds);
    expect(loaded.connectors.byId[asConnectorId("C1")]?.manufacturerReference).toBe("CONN-TEST-2W");
    expect(loaded.connectors.byId[asConnectorId("C1")]?.catalogItemId).toBeDefined();
    expect(loaded.splices).toEqual(legacyState.splices);
    expect(loaded.nodes).toEqual(legacyState.nodes);
    expect(loaded.segments).toEqual(legacyState.segments);
    expect(loaded.wires).toEqual(legacyState.wires);
    expect(rewritten).not.toBeNull();

    const rewrittenSnapshot = JSON.parse(rewritten ?? "{}") as PersistedStateSnapshotV1;
    expect(rewrittenSnapshot.schemaVersion).toBe(PERSISTED_STATE_SCHEMA_VERSION);
    expect(rewrittenSnapshot.payloadKind).toBe(PERSISTED_STATE_PAYLOAD_KIND);
    expect(rewrittenSnapshot.createdAtIso).toBe(nowIso);
    expect(rewrittenSnapshot.updatedAtIso).toBe(nowIso);
    expect(rewrittenSnapshot.state).toEqual(loaded);
  });

  it("preserves a pre-migration backup when a migration step fails", () => {
    const legacyState = createSampleState();
    const rawLegacyPayload = JSON.stringify(toLegacySingleNetworkState(legacyState));
    const storage = createMemoryStorage({
      [STORAGE_KEY]: rawLegacyPayload
    });
    setPersistenceMigrationStepOverrideForTests(1, () => {
      throw new Error("forced migration failure");
    });

    const loaded = loadState(storage, () => "2026-02-20T12:05:00.000Z");

    expect(hasSampleNetworkSignature(loaded)).toBe(true);
    expect(storage.read(STORAGE_KEY)).toBe(rawLegacyPayload);
    const migrationBackupKey = storage.keys().find((key) => key.startsWith(MIGRATION_BACKUP_KEY_PREFIX));
    expect(migrationBackupKey).toBeDefined();
    expect(storage.read(migrationBackupKey ?? "")).toContain("pre-migration-backup");
    expect(getPendingPersistenceRecovery()?.backupKey).toBe(migrationBackupKey);
    expect(loaded.ui.lastError?.message).toMatch(/migration failed/i);
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

  it("falls back safely when the default localStorage accessor throws", async () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("Storage access blocked");
    });

    const loaded = loadState(undefined, () => "2026-02-20T12:35:00.000Z");
    expect(hasSampleNetworkSignature(loaded)).toBe(true);

    await expect(saveState(createInitialState(), undefined, () => "2026-02-20T12:36:00.000Z")).resolves.toEqual({
      ok: false,
      reason: "storage-unavailable"
    });
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

  it("saves with schema version and preserves createdAt timestamp across updates", async () => {
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

    await saveState(secondState, storage, () => "2026-02-20T13:00:00.000Z");

    const raw = storage.read(STORAGE_KEY);
    expect(raw).not.toBeNull();

    const savedSnapshot = JSON.parse(raw ?? "{}") as PersistedStateSnapshotV1;
    expect(savedSnapshot.schemaVersion).toBe(PERSISTED_STATE_SCHEMA_VERSION);
    expect(savedSnapshot.payloadKind).toBe(PERSISTED_STATE_PAYLOAD_KIND);
    expect(savedSnapshot.createdAtIso).toBe("2026-02-10T07:00:00.000Z");
    expect(savedSnapshot.updatedAtIso).toBe("2026-02-20T13:00:00.000Z");
    expect(savedSnapshot.state).toEqual(secondState);
  });

  it("falls back to current save timestamp when persisted createdAtIso is malformed", async () => {
    const initialState = createSampleState();
    const updatedState = appReducer(
      initialState,
      appActions.upsertConnector({
        id: asConnectorId("C4"),
        name: "Connector 4",
        technicalId: "C-4",
        cavityCount: 2
      })
    );
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: "invalid-created-at",
        updatedAtIso: "2026-02-10T08:00:00.000Z",
        state: initialState
      } satisfies PersistedStateSnapshotV1)
    });

    await saveState(updatedState, storage, () => "2026-02-20T13:20:00.000Z");

    const raw = storage.read(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const savedSnapshot = JSON.parse(raw ?? "{}") as PersistedStateSnapshotV1;
    expect(savedSnapshot.createdAtIso).toBe("2026-02-20T13:20:00.000Z");
    expect(savedSnapshot.updatedAtIso).toBe("2026-02-20T13:20:00.000Z");
  });

  it("preserves createdAt across saves even when storage reads throw", async () => {
    const state = createSampleState();
    const nextState = appReducer(
      state,
      appActions.upsertConnector({
        id: asConnectorId("C3"),
        name: "Connector 3",
        technicalId: "C-3",
        cavityCount: 6
      })
    );
    const storedValues = new Map<string, string>();
    const throwingReadStorage = {
      getItem: vi.fn(() => {
        throw new Error("read blocked");
      }),
      setItem: vi.fn((key: string, value: string) => {
        storedValues.set(key, value);
      }),
      removeItem: vi.fn()
    };

    await saveState(state, throwingReadStorage, () => "2026-02-20T13:10:00.000Z");
    await saveState(nextState, throwingReadStorage, () => "2026-02-20T13:11:00.000Z");

    const raw = storedValues.get(STORAGE_KEY);
    expect(raw).toBeDefined();
    const snapshot = JSON.parse(raw ?? "{}") as PersistedStateSnapshotV1;
    expect(snapshot.createdAtIso).toBe("2026-02-20T13:10:00.000Z");
    expect(snapshot.updatedAtIso).toBe("2026-02-20T13:11:00.000Z");
  });

  it("persists and restores node layout positions across save/load", async () => {
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

    await saveState(positioned, storage, () => "2026-02-20T14:00:00.000Z");
    const loaded = loadState(storage, () => "2026-02-20T14:01:00.000Z");

    expect(loaded.nodePositions[asNodeId("N-LAYOUT")]).toEqual({ x: 280, y: 160 });
    const activeNetworkId = loaded.activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    if (activeNetworkId === null) {
      throw new Error("Expected active network.");
    }
    expect(loaded.networkStates[activeNetworkId]?.nodePositions[asNodeId("N-LAYOUT")]).toEqual({ x: 280, y: 160 });
  });

  it("persists valid network summary view-state and drops malformed persisted view-state payloads", async () => {
    const state = createSampleState();
    const activeNetworkId = state.activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    if (activeNetworkId === null) {
      throw new Error("Expected active network.");
    }

    const persistedViewState = {
      scale: 1.15,
      offset: { x: 48, y: -22 },
      showNetworkInfoPanels: false,
      showSegmentNames: true,
      showSegmentLengths: true,
      showCableCallouts: true,
      showNetworkGrid: false,
      snapNodesToGrid: false,
      lockEntityMovement: true
    } as const;

    const withViewState: AppState = {
      ...state,
      networkStates: {
        ...state.networkStates,
        [activeNetworkId]: {
          ...state.networkStates[activeNetworkId]!,
          networkSummaryViewState: persistedViewState
        }
      }
    };

    const storage = createMemoryStorage();
    await saveState(withViewState, storage, () => "2026-02-20T14:10:00.000Z");
    const loaded = loadState(storage, () => "2026-02-20T14:11:00.000Z");
    expect(loaded.networkStates[activeNetworkId]?.networkSummaryViewState).toEqual(persistedViewState);

    const malformedSnapshot = JSON.stringify({
      schemaVersion: APP_SCHEMA_VERSION,
      createdAtIso: "2026-02-10T08:00:00.000Z",
      updatedAtIso: "2026-02-10T08:30:00.000Z",
      state: {
        ...withViewState,
        networkStates: {
          ...withViewState.networkStates,
          [activeNetworkId]: {
            ...withViewState.networkStates[activeNetworkId]!,
            networkSummaryViewState: {
              scale: "oops",
              offset: { x: 12, y: null },
              showNetworkInfoPanels: false
            }
          }
        }
      }
    } satisfies PersistedStateSnapshotV1);

    const malformedStorage = createMemoryStorage({
      [STORAGE_KEY]: malformedSnapshot
    });
    const normalized = loadState(malformedStorage, () => "2026-02-20T14:12:00.000Z");
    expect(normalized.networkStates[activeNetworkId]?.networkSummaryViewState).toBeUndefined();
  });

  it("persists bounded recent-change metadata in a local sidecar payload", () => {
    const storage = createMemoryStorage();
    const entries = [
      {
        sequence: 1,
        actionType: "network/update",
        targetKind: "network",
        targetId: "NET-A",
        networkId: null,
        label: "Network 'NET-A' updated",
        timestampIso: "2026-02-28T10:00:00.000Z"
      },
      {
        sequence: 2,
        actionType: "connector/upsert",
        targetKind: "connector",
        targetId: "C-1",
        networkId: null,
        label: "Connector 'C-1' created",
        timestampIso: "2026-02-28T10:01:00.000Z"
      },
      {
        sequence: 3,
        actionType: "segment/upsert",
        targetKind: "segment",
        targetId: "SEG-1",
        networkId: null,
        label: "Segment 'SEG-1' created",
        timestampIso: "2026-02-28T10:02:00.000Z"
      }
    ] as const;

    saveRecentChangesMetadata([...entries], 2, storage, () => "2026-02-28T10:03:00.000Z");
    const raw = storage.read(RECENT_CHANGES_STORAGE_KEY);
    expect(raw).not.toBeNull();

    const loaded = loadRecentChangesMetadata(60, storage);
    expect(loaded.map((entry) => entry.sequence)).toEqual([2, 3]);
    expect(loaded.map((entry) => entry.label)).toEqual([
      "Connector 'C-1' created",
      "Segment 'SEG-1' created"
    ]);
  });

  it("returns empty recent-change metadata when sidecar payload is malformed", () => {
    const storage = createMemoryStorage({
      [RECENT_CHANGES_STORAGE_KEY]: "{\"schemaVersion\":1,\"entries\":\"invalid\"}"
    });
    const loaded = loadRecentChangesMetadata(60, storage);
    expect(loaded).toEqual([]);
  });

  it("backs up unsupported future-version payloads before replacing local storage", () => {
    const futurePayload = {
      payloadKind: PERSISTED_STATE_PAYLOAD_KIND,
      schemaVersion: PERSISTED_STATE_SCHEMA_VERSION + 10,
      appVersion: "9.9.9",
      appSchemaVersion: APP_SCHEMA_VERSION + 10,
      createdAtIso: "2026-02-01T08:00:00.000Z",
      updatedAtIso: "2026-02-01T08:05:00.000Z",
      state: createSampleState()
    };
    const rawFuture = JSON.stringify(futurePayload);
    const storage = createMemoryStorage({
      [STORAGE_KEY]: rawFuture
    });

    const loaded = loadState(storage, () => "2026-02-20T15:00:00.000Z");

    expect(hasSampleNetworkSignature(loaded)).toBe(true);
    expect(loaded.ui.lastError?.message).toMatch(/newer app version/i);

    const backupRaw = storage.read(STORAGE_BACKUP_KEY);
    expect(backupRaw).not.toBeNull();
    const backup = JSON.parse(backupRaw ?? "{}") as { raw?: string; reason?: string };
    expect(backup.raw).toBe(rawFuture);
    expect(backup.reason).toContain("unsupportedFutureVersion");
  });

  it("returns a storage-near-quota warning when navigator storage estimate shows low remaining capacity", async () => {
    const storage = createMemoryStorage();
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: {
        estimate: vi.fn().mockResolvedValue({ quota: 1_000, usage: 850 })
      }
    });
    const estimateSpy = vi
      .spyOn(navigator.storage, "estimate")
      .mockResolvedValue({ quota: 1_000, usage: 850 });

    const result = await saveState(createSampleState(), storage, () => "2026-02-20T15:05:00.000Z");

    expect(result).toEqual({ ok: true, warning: "storage-near-quota" });
    expect(estimateSpy).toHaveBeenCalled();
  });

  it("returns a quota-exceeded result when storage writes exceed browser quota", async () => {
    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      }),
      removeItem: vi.fn()
    };

    const result = await saveState(createSampleState(), storage, () => "2026-02-20T15:10:00.000Z");

    expect(result).toEqual({ ok: false, reason: "quota-exceeded" });
  });
});
