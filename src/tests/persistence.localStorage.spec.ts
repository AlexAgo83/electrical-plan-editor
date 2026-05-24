import { afterEach, describe, expect, it, vi } from "vitest";
import { APP_RELEASE_VERSION, APP_SCHEMA_VERSION } from "../core/schema";
import {
  clearPendingPersistenceRecovery,
  PERSISTED_STATE_PAYLOAD_KIND,
  PERSISTED_STATE_SCHEMA_VERSION,
  STORAGE_KEY,
  loadState,
  migratePersistedPayload,
  saveState,
  setPersistenceMigrationStepOverrideForTests,
  type PersistedStateSnapshotV1
} from "../adapters/persistence";
import {
  appActions,
  appReducer,
  createSampleNetworkState,
  hasSampleNetworkSignature,
  isWorkspaceEmpty,
  type AppState
} from "../store";

import {
  asConnectorId,
  createMemoryStorage,
  createSampleState,
  toLegacySingleNetworkState
} from "./helpers/persistence-local-storage-test-utils";
describe("migratePersistedPayload", () => {
  it("keeps a current schema snapshot unchanged", () => {
    const state = createSampleState();
    const currentSnapshot: PersistedStateSnapshotV1 = {
      payloadKind: PERSISTED_STATE_PAYLOAD_KIND,
      schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
      appVersion: APP_RELEASE_VERSION,
      appSchemaVersion: APP_SCHEMA_VERSION,
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
    expect(result?.snapshot.schemaVersion).toBe(PERSISTED_STATE_SCHEMA_VERSION);
    expect(result?.snapshot.payloadKind).toBe(PERSISTED_STATE_PAYLOAD_KIND);
    expect(result?.snapshot.createdAtIso).toBe(nowIso);
    expect(result?.snapshot.updatedAtIso).toBe(nowIso);
    expect(result?.snapshot.state.connectors.allIds).toEqual(legacyState.connectors.allIds);
    const migratedConnector = result?.snapshot.state.connectors.byId[asConnectorId("C1")];
    expect(migratedConnector?.manufacturerReference).toBe("CONN-TEST-2W");
    expect(migratedConnector?.catalogItemId).toBeDefined();
    expect(result?.snapshot.state.splices).toEqual(legacyState.splices);
    expect(result?.snapshot.state.nodes).toEqual(legacyState.nodes);
    expect(result?.snapshot.state.segments).toEqual(legacyState.segments);
    expect(result?.snapshot.state.wires).toEqual(legacyState.wires);
  });
});

describe("localStorage persistence adapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearPendingPersistenceRecovery();
    setPersistenceMigrationStepOverrideForTests(1, null);
    setPersistenceMigrationStepOverrideForTests(2, null);
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
    expect(savedSnapshot.schemaVersion).toBe(PERSISTED_STATE_SCHEMA_VERSION);
    expect(savedSnapshot.payloadKind).toBe(PERSISTED_STATE_PAYLOAD_KIND);
    expect(savedSnapshot.appVersion).toBe(APP_RELEASE_VERSION);
    expect(savedSnapshot.appSchemaVersion).toBe(APP_SCHEMA_VERSION);
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

  it("preserves wire fuse catalog linkage across save/load", async () => {
    const sample = createSampleNetworkState();
    const firstWireId = sample.wires.allIds[0];
    const firstCatalogItemId = sample.catalogItems.allIds[0];
    expect(firstWireId).toBeDefined();
    expect(firstCatalogItemId).toBeDefined();
    if (firstWireId === undefined || firstCatalogItemId === undefined) {
      throw new Error("Expected sample state to include wires and catalog items.");
    }
    const firstWire = sample.wires.byId[firstWireId];
    if (firstWire === undefined) {
      throw new Error("Expected first wire in sample state.");
    }

    const withFuseWire = appReducer(
      sample,
      appActions.upsertWire({
        ...firstWire,
        protection: { kind: "fuse", catalogItemId: firstCatalogItemId }
      })
    );
    const storage = createMemoryStorage();

    await saveState(withFuseWire, storage, () => "2026-02-26T12:30:00.000Z");
    const loaded = loadState(storage, () => "2026-02-26T12:31:00.000Z");

    expect(loaded.wires.byId[firstWireId]?.protection).toEqual({
      kind: "fuse",
      catalogItemId: firstCatalogItemId
    });
  });

  it("preserves network voltage and wire sizing metadata across save/load", async () => {
    const base = createSampleNetworkState();
    const activeNetworkId = base.activeNetworkId;
    const firstWireId = base.wires.allIds[0];
    if (activeNetworkId === null || firstWireId === undefined) {
      throw new Error("Expected active network and first wire in sample state.");
    }

    const firstWire = base.wires.byId[firstWireId];
    if (firstWire === undefined) {
      throw new Error("Expected first wire payload.");
    }

    const withVoltage = appReducer(
      base,
      appActions.updateNetwork(activeNetworkId, "Main network sample", "NET-MAIN-SAMPLE", "2026-03-01T08:00:00.000Z", undefined, {
        voltageV: 48
      })
    );
    const enriched = appReducer(
      withVoltage,
      appActions.upsertWire({
        ...firstWire,
        currentA: 6,
        material: "aluminum"
      })
    );
    const storage = createMemoryStorage();

    await saveState(enriched, storage, () => "2026-03-01T09:00:00.000Z");
    const loaded = loadState(storage, () => "2026-03-01T09:01:00.000Z");

    expect(loaded.networks.byId[activeNetworkId]?.voltageV).toBe(48);
    expect(loaded.wires.byId[firstWireId]?.currentA).toBe(6);
    expect(loaded.wires.byId[firstWireId]?.material).toBe("aluminum");
  });

  it("patches legacy persisted wires missing section/colors/side references to defaults", () => {
    const state = createSampleNetworkState();
    const nowIso = "2026-02-20T11:00:00.000Z";
    const stripWireSections = (input: AppState): AppState => ({
      ...input,
      wires: {
        allIds: [...input.wires.allIds],
        byId: Object.fromEntries(
          input.wires.allIds.map((wireId) => {
            const wire = input.wires.byId[wireId];
            return [
              wireId,
              wire === undefined
                ? undefined
                : ({
                    ...wire,
                    sectionMm2: undefined,
                    primaryColorId: undefined,
                    secondaryColorId: undefined,
                    freeColorLabel: undefined,
                    endpointAConnectionReference: undefined,
                    endpointASealReference: undefined,
                    endpointBConnectionReference: undefined,
                    endpointBSealReference: undefined
                  } as unknown)
            ];
          })
        ) as AppState["wires"]["byId"]
      },
      networkStates: Object.fromEntries(
        Object.entries(input.networkStates).map(([networkId, scoped]) => [
          networkId,
          {
            ...scoped,
            wires: {
              allIds: [...scoped.wires.allIds],
              byId: Object.fromEntries(
                scoped.wires.allIds.map((wireId) => {
                  const wire = scoped.wires.byId[wireId];
                  return [
                    wireId,
                    wire === undefined
                      ? undefined
                      : ({
                          ...wire,
                          sectionMm2: undefined,
                          primaryColorId: undefined,
                          secondaryColorId: undefined,
                          freeColorLabel: undefined,
                          endpointAConnectionReference: undefined,
                          endpointASealReference: undefined,
                          endpointBConnectionReference: undefined,
                          endpointBSealReference: undefined
                        } as unknown)
                  ];
                })
              ) as typeof scoped.wires.byId
            }
          }
        ])
      ) as AppState["networkStates"]
    });
    const legacyWithoutSections = stripWireSections(state);
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: "2026-02-01T08:00:00.000Z",
        updatedAtIso: "2026-02-01T09:00:00.000Z",
        state: legacyWithoutSections
      } satisfies PersistedStateSnapshotV1)
    });

    const loaded = loadState(storage, () => nowIso);
    const loadedWire = loaded.wires.byId[loaded.wires.allIds[0]!];
    expect(loadedWire?.sectionMm2).toBe(0.5);
    expect(loadedWire?.primaryColorId).toBeNull();
    expect(loadedWire?.secondaryColorId).toBeNull();
    expect(loadedWire?.freeColorLabel).toBeNull();
    expect(loadedWire?.endpointAConnectionReference).toBeUndefined();
    expect(loadedWire?.endpointASealReference).toBeUndefined();
    expect(loadedWire?.endpointBConnectionReference).toBeUndefined();
    expect(loadedWire?.endpointBSealReference).toBeUndefined();

    const activeNetworkId = loaded.activeNetworkId;
    if (activeNetworkId !== null) {
      const scopedWire = loaded.networkStates[activeNetworkId]?.wires.byId[loaded.wires.allIds[0]!];
      expect(scopedWire?.sectionMm2).toBe(0.5);
      expect(scopedWire?.primaryColorId).toBeNull();
      expect(scopedWire?.secondaryColorId).toBeNull();
      expect(scopedWire?.freeColorLabel).toBeNull();
      expect(scopedWire?.endpointAConnectionReference).toBeUndefined();
      expect(scopedWire?.endpointASealReference).toBeUndefined();
      expect(scopedWire?.endpointBConnectionReference).toBeUndefined();
      expect(scopedWire?.endpointBSealReference).toBeUndefined();
    }
  });

  it("normalizes persisted wire side connection/seal references", () => {
    const state = createSampleNetworkState();
    const nowIso = "2026-02-20T11:40:00.000Z";
    const wireId = state.wires.allIds[0];
    const activeNetworkId = state.activeNetworkId;
    expect(wireId).toBeDefined();
    expect(activeNetworkId).not.toBeNull();
    if (wireId === undefined || activeNetworkId === null) {
      throw new Error("Expected sample network wire and active network.");
    }

    const rawState: AppState = {
      ...state,
      wires: {
        ...state.wires,
        byId: {
          ...state.wires.byId,
          [wireId]: {
            ...state.wires.byId[wireId]!,
            endpointAConnectionReference: "  TERM-A-LEGACY  ",
            endpointASealReference: " ",
            endpointBConnectionReference: ` ${"C".repeat(130)} `,
            endpointBSealReference: "  SEAL-B-LEGACY  "
          }
        }
      },
      networkStates: {
        ...state.networkStates,
        [activeNetworkId]: {
          ...state.networkStates[activeNetworkId]!,
          wires: {
            ...state.networkStates[activeNetworkId]!.wires,
            byId: {
              ...state.networkStates[activeNetworkId]!.wires.byId,
              [wireId]: {
                ...state.networkStates[activeNetworkId]!.wires.byId[wireId]!,
                endpointAConnectionReference: "  TERM-A-LEGACY  ",
                endpointASealReference: " ",
                endpointBConnectionReference: ` ${"C".repeat(130)} `,
                endpointBSealReference: "  SEAL-B-LEGACY  "
              }
            }
          }
        }
      }
    };

    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: "2026-02-01T08:00:00.000Z",
        updatedAtIso: "2026-02-01T09:00:00.000Z",
        state: rawState
      } satisfies PersistedStateSnapshotV1)
    });

    const loaded = loadState(storage, () => nowIso);
    const loadedWire = loaded.wires.byId[wireId];
    expect(loadedWire?.endpointAConnectionReference).toBe("TERM-A-LEGACY");
    expect(loadedWire?.endpointASealReference).toBeUndefined();
    expect(loadedWire?.endpointBConnectionReference).toBe("C".repeat(120));
    expect(loadedWire?.endpointBSealReference).toBe("SEAL-B-LEGACY");
  });

  it("normalizes persisted mixed wire color state by prioritizing freeColorLabel", () => {
    const state = createSampleNetworkState();
    const nowIso = "2026-02-20T11:50:00.000Z";
    const wireId = state.wires.allIds[0];
    const activeNetworkId = state.activeNetworkId;
    expect(wireId).toBeDefined();
    expect(activeNetworkId).not.toBeNull();
    if (wireId === undefined || activeNetworkId === null) {
      throw new Error("Expected sample network wire and active network.");
    }

    const rawState: AppState = {
      ...state,
      wires: {
        ...state.wires,
        byId: {
          ...state.wires.byId,
          [wireId]: {
            ...state.wires.byId[wireId]!,
            colorMode: undefined,
            primaryColorId: "RD",
            secondaryColorId: "BU",
            freeColorLabel: "  vendor beige/brown  "
          }
        }
      },
      networkStates: {
        ...state.networkStates,
        [activeNetworkId]: {
          ...state.networkStates[activeNetworkId]!,
          wires: {
            ...state.networkStates[activeNetworkId]!.wires,
            byId: {
              ...state.networkStates[activeNetworkId]!.wires.byId,
              [wireId]: {
                ...state.networkStates[activeNetworkId]!.wires.byId[wireId]!,
                colorMode: undefined,
                primaryColorId: "RD",
                secondaryColorId: "BU",
                freeColorLabel: "  vendor beige/brown  "
              }
            }
          }
        }
      }
    };

    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: "2026-02-01T08:00:00.000Z",
        updatedAtIso: "2026-02-01T09:00:00.000Z",
        state: rawState
      } satisfies PersistedStateSnapshotV1)
    });

    const loaded = loadState(storage, () => nowIso);
    const normalizedWire = loaded.wires.byId[wireId];
    expect(normalizedWire?.primaryColorId).toBeNull();
    expect(normalizedWire?.secondaryColorId).toBeNull();
    expect(normalizedWire?.colorMode).toBe("free");
    expect(normalizedWire?.freeColorLabel).toBe("vendor beige/brown");
    const scopedWire = loaded.networkStates[activeNetworkId]?.wires.byId[wireId];
    expect(scopedWire?.primaryColorId).toBeNull();
    expect(scopedWire?.secondaryColorId).toBeNull();
    expect(scopedWire?.colorMode).toBe("free");
    expect(scopedWire?.freeColorLabel).toBe("vendor beige/brown");
  });

  it("preserves explicit free color mode with an empty freeColorLabel as unspecified", () => {
    const state = createSampleNetworkState();
    const nowIso = "2026-02-20T11:55:00.000Z";
    const wireId = state.wires.allIds[0];
    const activeNetworkId = state.activeNetworkId;
    if (wireId === undefined || activeNetworkId === null) {
      throw new Error("Expected sample network wire and active network.");
    }

    const rawState: AppState = {
      ...state,
      wires: {
        ...state.wires,
        byId: {
          ...state.wires.byId,
          [wireId]: {
            ...state.wires.byId[wireId]!,
            colorMode: "free",
            primaryColorId: "RD",
            secondaryColorId: "BU",
            freeColorLabel: " "
          }
        }
      },
      networkStates: {
        ...state.networkStates,
        [activeNetworkId]: {
          ...state.networkStates[activeNetworkId]!,
          wires: {
            ...state.networkStates[activeNetworkId]!.wires,
            byId: {
              ...state.networkStates[activeNetworkId]!.wires.byId,
              [wireId]: {
                ...state.networkStates[activeNetworkId]!.wires.byId[wireId]!,
                colorMode: "free",
                primaryColorId: "RD",
                secondaryColorId: "BU",
                freeColorLabel: " "
              }
            }
          }
        }
      }
    };

    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: "2026-02-01T08:00:00.000Z",
        updatedAtIso: "2026-02-01T09:00:00.000Z",
        state: rawState
      } satisfies PersistedStateSnapshotV1)
    });

    const loaded = loadState(storage, () => nowIso);
    const normalizedWire = loaded.wires.byId[wireId];
    expect(normalizedWire?.colorMode).toBe("free");
    expect(normalizedWire?.primaryColorId).toBeNull();
    expect(normalizedWire?.secondaryColorId).toBeNull();
    expect(normalizedWire?.freeColorLabel).toBeNull();
    const scopedWire = loaded.networkStates[activeNetworkId]?.wires.byId[wireId];
    expect(scopedWire?.colorMode).toBe("free");
    expect(scopedWire?.freeColorLabel).toBeNull();
  });

  it("normalizes persisted connector and splice manufacturer references", () => {
    const state = createSampleNetworkState();
    const nowIso = "2026-02-20T11:30:00.000Z";
    const connectorId = state.connectors.allIds[0];
    const spliceId = state.splices.allIds[0];
    expect(connectorId).toBeDefined();
    expect(spliceId).toBeDefined();
    if (connectorId === undefined || spliceId === undefined) {
      throw new Error("Expected sample network to include at least one connector and one splice.");
    }

    const activeNetworkId = state.activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    if (activeNetworkId === null) {
      throw new Error("Expected an active network.");
    }

    const legacyStateWithRawRefs: AppState = {
      ...state,
      connectors: {
        ...state.connectors,
        byId: {
          ...state.connectors.byId,
          [connectorId]: {
            ...state.connectors.byId[connectorId]!,
            manufacturerReference: "  TE-1-967616-1  ",
            catalogItemId: undefined
          }
        }
      },
      splices: {
        ...state.splices,
        byId: {
          ...state.splices.byId,
          [spliceId]: {
            ...state.splices.byId[spliceId]!,
            manufacturerReference: " ",
            catalogItemId: undefined
          }
        }
      },
      networkStates: {
        ...state.networkStates,
        [activeNetworkId]: {
          ...state.networkStates[activeNetworkId]!,
          connectors: {
            ...state.networkStates[activeNetworkId]!.connectors,
            byId: {
              ...state.networkStates[activeNetworkId]!.connectors.byId,
              [connectorId]: {
                ...state.networkStates[activeNetworkId]!.connectors.byId[connectorId]!,
                manufacturerReference: ` ${"B".repeat(130)} `,
                catalogItemId: undefined
              }
            }
          },
          splices: {
            ...state.networkStates[activeNetworkId]!.splices,
            byId: {
              ...state.networkStates[activeNetworkId]!.splices.byId,
              [spliceId]: {
                ...state.networkStates[activeNetworkId]!.splices.byId[spliceId]!,
                manufacturerReference: "  AMP/SEAL-42  ",
                catalogItemId: undefined
              }
            }
          }
        }
      }
    };

    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: APP_SCHEMA_VERSION,
        createdAtIso: "2026-02-01T08:00:00.000Z",
        updatedAtIso: "2026-02-01T09:00:00.000Z",
        state: legacyStateWithRawRefs
      } satisfies PersistedStateSnapshotV1)
    });

    const loaded = loadState(storage, () => nowIso);
    expect(loaded.connectors.byId[connectorId]?.manufacturerReference).toBe("B".repeat(120));
    expect(loaded.splices.byId[spliceId]?.manufacturerReference).toBe("AMP/SEAL-42");

    const loadedScoped = loaded.networkStates[activeNetworkId];
    expect(loadedScoped?.connectors.byId[connectorId]?.manufacturerReference).toBe("B".repeat(120));
    expect(loadedScoped?.splices.byId[spliceId]?.manufacturerReference).toBe("AMP/SEAL-42");
  });

});
