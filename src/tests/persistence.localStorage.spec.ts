import { afterEach, describe, expect, it, vi } from "vitest";
import type { CatalogItemId, ConnectorId, NodeId } from "../core/entities";
import { APP_RELEASE_VERSION, APP_SCHEMA_VERSION } from "../core/schema";
import {
  PERSISTED_STATE_PAYLOAD_KIND,
  PERSISTED_STATE_SCHEMA_VERSION,
  STORAGE_BACKUP_KEY,
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

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function createSampleState(): AppState {
  return [
    appActions.upsertCatalogItem({
      id: asCatalogItemId("catalog-c1"),
      manufacturerReference: "CONN-TEST-2W",
      connectionCount: 2
    }),
    appActions.upsertConnector({
      id: asConnectorId("C1"),
      name: "Connector 1",
      technicalId: "C-1",
      cavityCount: 2,
      manufacturerReference: "CONN-TEST-2W",
      catalogItemId: asCatalogItemId("catalog-c1")
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

  it("preserves wire fuse catalog linkage across save/load", () => {
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

    saveState(withFuseWire, storage, () => "2026-02-26T12:30:00.000Z");
    const loaded = loadState(storage, () => "2026-02-26T12:31:00.000Z");

    expect(loaded.wires.byId[firstWireId]?.protection).toEqual({
      kind: "fuse",
      catalogItemId: firstCatalogItemId
    });
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

  it("bootstraps deterministic legacy placeholders for missing connector/splice manufacturer references", () => {
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
    const expectedSplicePlaceholder = "LEGACY-NOREF-S-SPLICE-LEGACY-2";
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
    expect(loadedSplice?.manufacturerReference).toBe(expectedSplicePlaceholder);
    expect(loadedConnector?.catalogItemId).toBeDefined();
    expect(loadedSplice?.catalogItemId).toBeDefined();
    if (loadedConnector?.catalogItemId !== undefined) {
      expect(loaded.catalogItems.byId[loadedConnector.catalogItemId]?.manufacturerReference).toBe(
        expectedConnectorPlaceholder
      );
    }
    if (loadedSplice?.catalogItemId !== undefined) {
      expect(loaded.catalogItems.byId[loadedSplice.catalogItemId]?.manufacturerReference).toBe(
        expectedSplicePlaceholder
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

  it("falls back safely and clears corrupted payload", () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: "{not-valid-json"
    });

    const loaded = loadState(storage, () => "2026-02-20T11:30:00.000Z");

    expect(hasSampleNetworkSignature(loaded)).toBe(true);
    expect(storage.read(STORAGE_KEY)).not.toBeNull();
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
    expect(savedSnapshot.schemaVersion).toBe(PERSISTED_STATE_SCHEMA_VERSION);
    expect(savedSnapshot.payloadKind).toBe(PERSISTED_STATE_PAYLOAD_KIND);
    expect(savedSnapshot.createdAtIso).toBe("2026-02-10T07:00:00.000Z");
    expect(savedSnapshot.updatedAtIso).toBe("2026-02-20T13:00:00.000Z");
    expect(savedSnapshot.state).toEqual(secondState);
  });

  it("falls back to current save timestamp when persisted createdAtIso is malformed", () => {
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

    saveState(updatedState, storage, () => "2026-02-20T13:20:00.000Z");

    const raw = storage.read(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const savedSnapshot = JSON.parse(raw ?? "{}") as PersistedStateSnapshotV1;
    expect(savedSnapshot.createdAtIso).toBe("2026-02-20T13:20:00.000Z");
    expect(savedSnapshot.updatedAtIso).toBe("2026-02-20T13:20:00.000Z");
  });

  it("preserves createdAt across saves even when storage reads throw", () => {
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

    saveState(state, throwingReadStorage, () => "2026-02-20T13:10:00.000Z");
    saveState(nextState, throwingReadStorage, () => "2026-02-20T13:11:00.000Z");

    const raw = storedValues.get(STORAGE_KEY);
    expect(raw).toBeDefined();
    const snapshot = JSON.parse(raw ?? "{}") as PersistedStateSnapshotV1;
    expect(snapshot.createdAtIso).toBe("2026-02-20T13:10:00.000Z");
    expect(snapshot.updatedAtIso).toBe("2026-02-20T13:11:00.000Z");
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

  it("persists valid network summary view-state and drops malformed persisted view-state payloads", () => {
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
    saveState(withViewState, storage, () => "2026-02-20T14:10:00.000Z");
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
    expect(loaded.ui.lastError).toMatch(/newer app version/i);

    const backupRaw = storage.read(STORAGE_BACKUP_KEY);
    expect(backupRaw).not.toBeNull();
    const backup = JSON.parse(backupRaw ?? "{}") as { raw?: string; reason?: string };
    expect(backup.raw).toBe(rawFuture);
    expect(backup.reason).toContain("unsupportedFutureVersion");
  });
});
