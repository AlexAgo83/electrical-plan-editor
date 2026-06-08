import { describe, expect, it } from "vitest";
import type { CatalogItemId, ConnectorId, NetworkId, NodeId, SegmentId, SpliceId, WireId } from "../core/entities";
import { APP_RELEASE_VERSION } from "../core/schema";
import {
  buildNetworkFilePayload,
  detectOverwriteCandidates,
  NETWORK_FILE_PAYLOAD_KIND,
  parseNetworkFilePayload,
  resolveImportConflicts,
  serializeNetworkFilePayload
} from "../adapters/portability";
import { appActions, appReducer, createEmptyNetworkScopedState, createEmptyWorkspaceState, createInitialState, createSampleNetworkState } from "../store";

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

function asWireId(value: string): WireId {
  return value as WireId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

describe("network file portability", () => {
  it("serializes export payload deterministically", () => {
    const seeded = appReducer(
      createInitialState(),
      appActions.createNetwork({
        id: asNetworkId("net-b"),
        name: "Network B",
        technicalId: "NET-B",
        createdAt: "2026-02-21T09:00:00.000Z",
        updatedAt: "2026-02-21T09:00:00.000Z"
      })
    );

    const payloadA = buildNetworkFilePayload(seeded, "all", [], "2026-02-21T10:00:00.000Z");
    const payloadB = buildNetworkFilePayload(seeded, "all", [], "2026-02-21T10:00:00.000Z");

    expect(payloadA.payloadKind).toBe(NETWORK_FILE_PAYLOAD_KIND);
    expect(payloadA.schemaVersion).toBe(3);
    expect(payloadA.source.appVersion).toBe(APP_RELEASE_VERSION);
    expect(serializeNetworkFilePayload(payloadA)).toBe(serializeNetworkFilePayload(payloadB));
  });

  it("parses and migrates schema version 0 payload", () => {
    const legacyPayload = {
      schemaVersion: 0,
      exportedAt: "2026-02-21T10:10:00.000Z",
      networks: [
        {
          network: {
            id: "legacy-net",
            name: "Legacy",
            technicalId: "NET-LEGACY",
            createdAt: "2026-02-20T10:00:00.000Z",
            updatedAt: "2026-02-20T10:00:00.000Z"
          },
          state: createEmptyNetworkScopedState()
        }
      ]
    };

    const parsed = parseNetworkFilePayload(JSON.stringify(legacyPayload));
    expect(parsed.error).toBeNull();
    expect(parsed.payload).not.toBeNull();
    expect(parsed.payload?.payloadKind).toBe(NETWORK_FILE_PAYLOAD_KIND);
    expect(parsed.payload?.schemaVersion).toBe(3);
    expect(parsed.payload?.networks).toHaveLength(1);
  });

  it("deduplicates imported entity allIds before exposing the network state", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-06-04T15:50:00.000Z");
    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawNodes = rawState.nodes as { byId: Record<string, unknown>; allIds: string[] };
    const duplicateNodeId = "N-C-SRC";
    expect(rawNodes.byId[duplicateNodeId]).toBeDefined();
    rawNodes.allIds.push(duplicateNodeId);

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));

    expect(parsed.error).toBeNull();
    const parsedNodeIds = parsed.payload?.networks[0]?.state.nodes.allIds ?? [];
    expect(parsedNodeIds.filter((nodeId) => nodeId === asNodeId(duplicateNodeId))).toHaveLength(1);
    expect(parsed.payload?.networks[0]?.state.nodes.byId[asNodeId(duplicateNodeId)]).toBeDefined();
  });

  it("patches imported wires missing section/colors/side references to defaults", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-02-21T10:15:00.000Z");
    const firstBundle = payload.networks[0];
    expect(firstBundle).toBeDefined();
    if (firstBundle === undefined) {
      throw new Error("Expected an exported network bundle.");
    }

    const firstWireId = firstBundle.state.wires.allIds[0];
    expect(firstWireId).toBeDefined();
    if (firstWireId === undefined) {
      throw new Error("Expected at least one wire in exported sample payload.");
    }

    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawWires = rawState.wires as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    delete rawWires.byId[firstWireId]?.sectionMm2;
    delete rawWires.byId[firstWireId]?.primaryColorId;
    delete rawWires.byId[firstWireId]?.secondaryColorId;
    delete rawWires.byId[firstWireId]?.freeColorLabel;
    delete rawWires.byId[firstWireId]?.endpointAConnectionReference;
    delete rawWires.byId[firstWireId]?.endpointASealReference;
    delete rawWires.byId[firstWireId]?.endpointBConnectionReference;
    delete rawWires.byId[firstWireId]?.endpointBSealReference;

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.sectionMm2).toBe(0.5);
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.primaryColorId).toBeNull();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.secondaryColorId).toBeNull();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.freeColorLabel).toBeNull();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.endpointAConnectionReference).toBeUndefined();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.endpointASealReference).toBeUndefined();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.endpointBConnectionReference).toBeUndefined();
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.endpointBSealReference).toBeUndefined();
  });

  it("preserves wire fuse catalog linkage across export/import round-trip", () => {
    const sample = createSampleNetworkState();
    const firstWireId = sample.wires.allIds[0];
    const firstCatalogItemId = sample.catalogItems.allIds[0];
    expect(firstWireId).toBeDefined();
    expect(firstCatalogItemId).toBeDefined();
    if (firstWireId === undefined || firstCatalogItemId === undefined) {
      throw new Error("Expected sample payload to include wires and catalog items.");
    }

    const firstWire = sample.wires.byId[firstWireId];
    if (firstWire === undefined) {
      throw new Error("Expected first wire in sample.");
    }

    const withFuseWire = appReducer(
      sample,
      appActions.upsertWire({
        ...firstWire,
        protection: { kind: "fuse", catalogItemId: asCatalogItemId(firstCatalogItemId) }
      })
    );

    const payload = buildNetworkFilePayload(withFuseWire, "active", [], "2026-02-26T12:00:00.000Z");
    const parsed = parseNetworkFilePayload(serializeNetworkFilePayload(payload));
    expect(parsed.error).toBeNull();
    expect(parsed.payload?.networks[0]?.state.wires.byId[asWireId(firstWireId)]?.protection).toEqual({
      kind: "fuse",
      catalogItemId: asCatalogItemId(firstCatalogItemId)
    });
  });

  it("preserves fuse-box catalog metadata and connector ratings across export/import round-trip", () => {
    let sample = createSampleNetworkState();
    sample = appReducer(
      sample,
      appActions.upsertCatalogItem({
        id: asCatalogItemId("catalog-fusebox"),
        manufacturerReference: "FUSEBOX-PORTABLE",
        connectionCount: 2,
        fuseBoxConfig: {
          pairs: [{ pairIndex: 0, pinA: 1, pinB: 2 }]
        }
      })
    );
    sample = appReducer(
      sample,
      appActions.upsertConnector({
        id: asConnectorId("connector-fusebox"),
        name: "Fuse box connector",
        technicalId: "C-FUSEBOX",
        catalogItemId: asCatalogItemId("catalog-fusebox"),
        manufacturerReference: "FUSEBOX-PORTABLE",
        cavityCount: 2,
        fusePairRatings: { 0: 10 }
      })
    );

    const payload = buildNetworkFilePayload(sample, "active", [], "2026-03-01T09:30:00.000Z");
    const parsed = parseNetworkFilePayload(serializeNetworkFilePayload(payload));

    expect(parsed.error).toBeNull();
    expect(parsed.payload?.networks[0]?.state.catalogItems.byId[asCatalogItemId("catalog-fusebox")]?.fuseBoxConfig).toEqual({
      pairs: [{ pairIndex: 0, pinA: 1, pinB: 2 }]
    });
    expect(parsed.payload?.networks[0]?.state.connectors.byId[asConnectorId("connector-fusebox")]?.fusePairRatings).toEqual({
      0: 10
    });
  });

  it("preserves network voltage and wire sizing metadata across export/import round-trip", () => {
    const base = createSampleNetworkState();
    const activeNetworkId = base.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected active network in sample state.");
    }

    const sample = appReducer(
      base,
      appActions.updateNetwork(activeNetworkId, "Main network (Sample)", "NET-MAIN-SAMPLE", "2026-03-01T08:00:00.000Z", undefined, {
        voltageV: 24
      })
    );
    const firstWireId = sample.wires.allIds[0];
    if (firstWireId === undefined) {
      throw new Error("Expected first wire in sample state.");
    }

    const firstWire = sample.wires.byId[firstWireId];
    if (firstWire === undefined) {
      throw new Error("Expected first wire payload.");
    }

    const enriched = appReducer(
      sample,
      appActions.upsertWire({
        ...firstWire,
        currentA: 12,
        material: "copper"
      })
    );

    const payload = buildNetworkFilePayload(enriched, "active", [], "2026-03-01T09:00:00.000Z");
    const parsed = parseNetworkFilePayload(serializeNetworkFilePayload(payload));

    expect(parsed.error).toBeNull();
    expect(parsed.payload?.networks[0]?.network.voltageV).toBe(24);
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.currentA).toBe(12);
    expect(parsed.payload?.networks[0]?.state.wires.byId[firstWireId]?.material).toBe("copper");
  });

  it("preserves rear backshell settings and segment sheath annotations across export/import round-trip", () => {
    let state = createInitialState();
    state = appReducer(
      state,
      appActions.upsertCatalogItem({
        id: asCatalogItemId("CAT-BS"),
        manufacturerReference: "CAT-BS",
        name: "Backshell catalog",
        connectionCount: 2,
        connectorDefaults: {
          rearBackshell: {
            enabled: true,
            lengthMm: 28
          }
        }
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        id: asConnectorId("CONN-BS"),
        name: "Connector Backshell",
        technicalId: "CT5",
        catalogItemId: asCatalogItemId("CAT-BS"),
        manufacturerReference: "CAT-BS",
        cavityCount: 2,
        rearBackshellOverride: {
          enabled: true,
          lengthMm: 32
        }
      })
    );
    state = appReducer(
      state,
      appActions.upsertNode({
        id: asNodeId("N-CONN-BS"),
        kind: "connector",
        connectorId: asConnectorId("CONN-BS")
      })
    );
    state = appReducer(
      state,
      appActions.upsertNode({
        id: asNodeId("N10"),
        kind: "intermediate",
        label: "N10"
      })
    );
    state = appReducer(
      state,
      appActions.upsertSegment({
        id: asSegmentId("SEG-ANN"),
        nodeA: asNodeId("N10"),
        nodeB: asNodeId("N-CONN-BS"),
        lengthMm: 88,
        sheathType: "CT5",
        insulation: "XLPE",
        lineStyle: "Braided",
        internalPartReference: "IP-77",
        mountingLabels: [
          {
            id: "LBL-1" as never,
            text: "TAG-A",
            positionRatio: 0.4,
            offsetX: 6,
            offsetY: -4
          }
        ]
      })
    );

    const payload = buildNetworkFilePayload(state, "active", [], "2026-06-08T10:00:00.000Z");
    const parsed = parseNetworkFilePayload(serializeNetworkFilePayload(payload));

    expect(parsed.error).toBeNull();
    expect(parsed.payload?.networks[0]?.state.catalogItems.byId[asCatalogItemId("CAT-BS")]?.connectorDefaults?.rearBackshell).toEqual({
      enabled: true,
      lengthMm: 28
    });
    expect(parsed.payload?.networks[0]?.state.connectors.byId[asConnectorId("CONN-BS")]?.rearBackshellOverride).toEqual({
      enabled: true,
      lengthMm: 32
    });
    expect(parsed.payload?.networks[0]?.state.segments.byId[asSegmentId("SEG-ANN")]?.sheathType).toBe("CT5");
    expect(parsed.payload?.networks[0]?.state.segments.byId[asSegmentId("SEG-ANN")]?.mountingLabels).toEqual([
      {
        id: "LBL-1",
        text: "TAG-A",
        positionRatio: 0.4,
        offsetX: 6,
        offsetY: -4
      }
    ]);
  });

  it("preserves pin roles, catalog pin defaults, and ampacity overrides across export/import round-trip", () => {
    let state = createSampleNetworkState();
    const activeNetworkId = state.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected active network in sample state.");
    }
    const connectorId = asConnectorId("C-SRC");
    const catalogItemId = asCatalogItemId("CAT-SAMPLE-SRC-12W");
    const connector = state.connectors.byId[connectorId];
    const catalogItem = state.catalogItems.byId[catalogItemId];
    if (connector === undefined || catalogItem === undefined) {
      throw new Error("Expected sample connector and catalog item.");
    }

    state = appReducer(
      state,
      appActions.upsertCatalogItem({
        ...catalogItem,
        connectorDefaults: {
          ...catalogItem.connectorDefaults,
          pinElectricalRoles: {
            1: { role: "source", currentA: 15, label: "CAT BAT+" }
          }
        }
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        ...connector,
        pinElectricalRoles: {
          2: { role: "consumer", currentA: 7.5, label: "Override load" }
        }
      })
    );
    state = {
      ...state,
      networks: {
        ...state.networks,
        byId: {
          ...state.networks.byId,
          [activeNetworkId]: {
            ...state.networks.byId[activeNetworkId]!,
            ampacityOverrides: {
              0.5: 12,
              1: 24
            }
          }
        }
      }
    };

    const payload = buildNetworkFilePayload(state, "active", [], "2026-06-08T08:00:00.000Z");
    const parsed = parseNetworkFilePayload(serializeNetworkFilePayload(payload));
    expect(parsed.error).toBeNull();
    if (parsed.payload === null) {
      throw new Error("Expected parsed network payload.");
    }

    const importedNetworkStates = parsed.payload.networks.reduce<Parameters<typeof appActions.importNetworks>[1]>((states, bundle) => {
      states[bundle.network.id] = bundle.state;
      return states;
    }, {});
    const imported = appReducer(
      createEmptyWorkspaceState(),
      appActions.importNetworks(
        parsed.payload.networks.map((bundle) => bundle.network),
        importedNetworkStates,
        true
      )
    );

    expect(imported.networks.byId[activeNetworkId]?.ampacityOverrides).toEqual({
      0.5: 12,
      1: 24
    });
    expect(imported.connectors.byId[connectorId]?.pinElectricalRoles).toEqual({
      2: { role: "consumer", currentA: 7.5, label: "Override load" }
    });
    expect(imported.catalogItems.byId[catalogItemId]?.connectorDefaults?.pinElectricalRoles).toEqual({
      1: { role: "source", currentA: 15, label: "CAT BAT+" }
    });
  });

  it("normalizes imported wire side connection and seal references", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-02-21T10:16:00.000Z");
    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawWires = rawState.wires as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const firstWireId = rawWires.allIds[0];
    expect(firstWireId).toBeDefined();
    if (firstWireId === undefined) {
      throw new Error("Expected an exported wire.");
    }

    rawWires.byId[firstWireId] = {
      ...rawWires.byId[firstWireId],
      endpointAConnectionReference: "  TERM-A-IMP  ",
      endpointASealReference: " ",
      endpointBConnectionReference: ` ${"D".repeat(130)} `,
      endpointBSealReference: "  SEAL-B-IMP  "
    };

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    const normalizedWire = parsed.payload?.networks[0]?.state.wires.byId[asWireId(firstWireId)];
    expect(normalizedWire?.endpointAConnectionReference).toBe("TERM-A-IMP");
    expect(normalizedWire?.endpointASealReference).toBeUndefined();
    expect(normalizedWire?.endpointBConnectionReference).toBe("D".repeat(120));
    expect(normalizedWire?.endpointBSealReference).toBe("SEAL-B-IMP");
  });

  it("normalizes imported mixed wire color state by prioritizing freeColorLabel", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-02-21T10:18:00.000Z");
    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawWires = rawState.wires as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const firstWireId = rawWires.allIds[0];
    expect(firstWireId).toBeDefined();
    if (firstWireId === undefined) {
      throw new Error("Expected an exported wire.");
    }

    rawWires.byId[firstWireId] = {
      ...rawWires.byId[firstWireId],
      colorMode: undefined,
      primaryColorId: "RD",
      secondaryColorId: "BU",
      freeColorLabel: "  legacy free color  "
    };

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    const normalizedWire = parsed.payload?.networks[0]?.state.wires.byId[asWireId(firstWireId)];
    expect(normalizedWire?.primaryColorId).toBeNull();
    expect(normalizedWire?.secondaryColorId).toBeNull();
    expect(normalizedWire?.colorMode).toBe("free");
    expect(normalizedWire?.freeColorLabel).toBe("legacy free color");
  });

  it("preserves imported explicit free color mode with empty label as free unspecified", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-02-21T10:19:00.000Z");
    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawWires = rawState.wires as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const firstWireId = rawWires.allIds[0];
    if (firstWireId === undefined) {
      throw new Error("Expected an exported wire.");
    }

    rawWires.byId[firstWireId] = {
      ...rawWires.byId[firstWireId],
      colorMode: "free",
      primaryColorId: "RD",
      secondaryColorId: "BU",
      freeColorLabel: " "
    };

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    const normalizedWire = parsed.payload?.networks[0]?.state.wires.byId[asWireId(firstWireId)];
    expect(normalizedWire?.colorMode).toBe("free");
    expect(normalizedWire?.primaryColorId).toBeNull();
    expect(normalizedWire?.secondaryColorId).toBeNull();
    expect(normalizedWire?.freeColorLabel).toBeNull();
  });

  it("normalizes imported connector and splice manufacturer references", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-02-21T10:17:00.000Z");
    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawConnectors = rawState.connectors as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const rawSplices = rawState.splices as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const firstConnectorId = rawConnectors.allIds[0];
    const firstSpliceId = rawSplices.allIds[0];
    expect(firstConnectorId).toBeDefined();
    expect(firstSpliceId).toBeDefined();
    if (firstConnectorId === undefined || firstSpliceId === undefined) {
      throw new Error("Expected exported sample payload to include connectors and splices.");
    }

    rawConnectors.byId[firstConnectorId] = {
      ...rawConnectors.byId[firstConnectorId],
      manufacturerReference: ` ${"A".repeat(130)} `
    };
    rawSplices.byId[firstSpliceId] = {
      ...rawSplices.byId[firstSpliceId],
      manufacturerReference: " "
    };

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    expect(parsed.payload).not.toBeNull();
    const normalizedState = parsed.payload?.networks[0]?.state;
    const normalizedConnector = normalizedState?.connectors.byId[asConnectorId(firstConnectorId)];
    const normalizedSplice = normalizedState?.splices.byId[asSpliceId(firstSpliceId)];
    expect(normalizedConnector?.catalogItemId).toBeDefined();
    expect(normalizedSplice?.catalogItemId).toBeDefined();
    if (normalizedConnector?.catalogItemId !== undefined) {
      expect(normalizedConnector.manufacturerReference).toBe(
        normalizedState?.catalogItems.byId[normalizedConnector.catalogItemId]?.manufacturerReference
      );
    }
    if (normalizedSplice?.catalogItemId !== undefined) {
      expect(normalizedSplice.manufacturerReference).toBe(
        normalizedState?.catalogItems.byId[normalizedSplice.catalogItemId]?.manufacturerReference
      );
    }
  });

  it("bootstraps deterministic placeholder catalog refs on import for connectors while keeping unlinked splices without placeholders", () => {
    const seeded = createSampleNetworkState();
    const payload = buildNetworkFilePayload(seeded, "active", [], "2026-02-21T10:19:00.000Z");
    const rawPayload = JSON.parse(serializeNetworkFilePayload(payload)) as Record<string, unknown>;
    const rawBundles = rawPayload.networks as Array<Record<string, unknown>>;
    const rawState = rawBundles[0]?.state as Record<string, unknown>;
    const rawConnectors = rawState.connectors as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const rawSplices = rawState.splices as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const rawCatalogItems = rawState.catalogItems as { byId: Record<string, Record<string, unknown>>; allIds: string[] };
    const firstConnectorId = rawConnectors.allIds[0];
    const firstSpliceId = rawSplices.allIds[0];
    expect(firstConnectorId).toBeDefined();
    expect(firstSpliceId).toBeDefined();
    if (firstConnectorId === undefined || firstSpliceId === undefined) {
      throw new Error("Expected exported sample payload to include connectors and splices.");
    }

    rawConnectors.byId[firstConnectorId] = {
      ...rawConnectors.byId[firstConnectorId],
      technicalId: "Conn / Legacy 01",
      manufacturerReference: " ",
      catalogItemId: undefined
    };
    rawSplices.byId[firstSpliceId] = {
      ...rawSplices.byId[firstSpliceId],
      technicalId: "splice:legacy?2",
      manufacturerReference: "",
      catalogItemId: undefined
    };
    rawCatalogItems.byId = {};
    rawCatalogItems.allIds = [];

    const parsed = parseNetworkFilePayload(JSON.stringify(rawPayload));
    expect(parsed.error).toBeNull();
    const normalizedState = parsed.payload?.networks[0]?.state;
    const expectedConnectorPlaceholder = "LEGACY-NOREF-C-CONN-LEGACY-01";
    expect(normalizedState?.connectors.byId[asConnectorId(firstConnectorId)]?.manufacturerReference).toBe(
      expectedConnectorPlaceholder
    );
    expect(normalizedState?.splices.byId[asSpliceId(firstSpliceId)]?.manufacturerReference).toBeUndefined();
    const connectorCatalogItemId = normalizedState?.connectors.byId[asConnectorId(firstConnectorId)]?.catalogItemId;
    const spliceCatalogItemId = normalizedState?.splices.byId[asSpliceId(firstSpliceId)]?.catalogItemId;
    expect(connectorCatalogItemId).toBeDefined();
    expect(spliceCatalogItemId).toBeUndefined();
    if (connectorCatalogItemId !== undefined) {
      expect(normalizedState?.catalogItems.byId[connectorCatalogItemId]?.manufacturerReference).toBe(expectedConnectorPlaceholder);
    }
  });

  it("resolves import conflicts with deterministic suffixes", () => {
    const existing = createInitialState();
    const payload = {
      schemaVersion: 1 as const,
      exportedAt: "2026-02-21T10:20:00.000Z",
      source: {
        app: "electrical-plan-editor" as const,
        appVersion: "0.7.3",
        appSchemaVersion: 2
      },
      networks: [
        {
          network: {
            id: existing.activeNetworkId as NetworkId,
            name: "Imported Main",
            technicalId: "NET-MAIN-SAMPLE",
            createdAt: "2026-02-20T10:00:00.000Z",
            updatedAt: "2026-02-20T10:00:00.000Z"
          },
          state: createEmptyNetworkScopedState()
        }
      ]
    };

    const decisions = new Map([
      [existing.activeNetworkId as string, { decision: "keep-both" as const }]
    ]);
    const resolved = resolveImportConflicts(payload, existing, decisions);
    expect(resolved.networks).toHaveLength(1);
    expect(resolved.networks[0]?.id).toBe(asNetworkId("network-main-import"));
    expect(resolved.networks[0]?.technicalId).toBe("NET-MAIN-SAMPLE-IMP");
    expect(resolved.summary.warnings.length).toBeGreaterThanOrEqual(1);
  });

  it("rejects an imported network that collides without an explicit decision", () => {
    const existing = createInitialState();
    const payload = {
      schemaVersion: 2 as const,
      exportedAt: "2026-02-21T10:20:00.000Z",
      source: {
        app: "electrical-plan-editor" as const,
        appVersion: APP_RELEASE_VERSION,
        appSchemaVersion: 2
      },
      networks: [
        {
          network: {
            id: existing.activeNetworkId as NetworkId,
            name: "Imported Main",
            technicalId: "NET-MAIN-SAMPLE",
            createdAt: "2026-02-20T10:00:00.000Z",
            updatedAt: "2026-02-20T10:00:00.000Z"
          },
          state: createEmptyNetworkScopedState()
        }
      ]
    };

    const resolved = resolveImportConflicts(payload, existing);
    expect(resolved.networks).toHaveLength(0);
    expect(resolved.summary.skippedNetworkIds).toContain(existing.activeNetworkId as string);
    expect(resolved.summary.errors.length).toBeGreaterThanOrEqual(1);
    expect(resolved.summary.errors[0]).toMatch(/no import decision was provided/);
  });

  it("detects an id collision with matchReason 'id' even when name and technical ID differ", () => {
    const existing = createInitialState();
    const existingId = existing.activeNetworkId as NetworkId;
    const existingNetworks = [existing.networks.byId[existingId]!];
    const payload = {
      schemaVersion: 3 as const,
      exportedAt: "2026-02-21T10:20:00.000Z",
      source: {
        app: "electrical-plan-editor" as const,
        appVersion: APP_RELEASE_VERSION,
        appSchemaVersion: 2
      },
      networks: [
        {
          network: {
            id: existingId,
            name: "Renamed by user",
            technicalId: "RENAMED-TECH",
            createdAt: "2026-02-20T10:00:00.000Z",
            updatedAt: "2026-02-20T10:00:00.000Z"
          },
          state: createEmptyNetworkScopedState()
        }
      ]
    };

    const candidates = detectOverwriteCandidates(payload, existingNetworks);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.matchReason).toBe("id");
    expect(candidates[0]?.importedNetworkId).toBe(existingId);
    expect(candidates[0]?.existingNetworkId).toBe(existingId);
  });

  it("skips an imported network when its decision is 'skip'", () => {
    const existing = createInitialState();
    const existingId = existing.activeNetworkId as NetworkId;
    const payload = {
      schemaVersion: 3 as const,
      exportedAt: "2026-02-21T10:20:00.000Z",
      source: {
        app: "electrical-plan-editor" as const,
        appVersion: APP_RELEASE_VERSION,
        appSchemaVersion: 2
      },
      networks: [
        {
          network: {
            id: existingId,
            name: "Imported Main",
            technicalId: "NET-MAIN-SAMPLE",
            createdAt: "2026-02-20T10:00:00.000Z",
            updatedAt: "2026-02-20T10:00:00.000Z"
          },
          state: createEmptyNetworkScopedState()
        }
      ]
    };

    const decisions = new Map([[existingId, { decision: "skip" as const }]]);
    const resolved = resolveImportConflicts(payload, existing, decisions);
    expect(resolved.networks).toHaveLength(0);
    expect(resolved.summary.skippedNetworkIds).toContain(existingId);
    expect(resolved.summary.errors).toHaveLength(0);
  });

  it("reuses the existing network id when the decision is 'overwrite'", () => {
    const existing = createInitialState();
    const existingId = existing.activeNetworkId as NetworkId;
    const payload = {
      schemaVersion: 3 as const,
      exportedAt: "2026-02-21T10:20:00.000Z",
      source: {
        app: "electrical-plan-editor" as const,
        appVersion: APP_RELEASE_VERSION,
        appSchemaVersion: 2
      },
      networks: [
        {
          network: {
            id: existingId,
            name: "Imported Main",
            technicalId: "NET-MAIN-SAMPLE",
            createdAt: "2026-02-20T10:00:00.000Z",
            updatedAt: "2026-02-20T10:00:00.000Z"
          },
          state: createEmptyNetworkScopedState()
        }
      ]
    };

    const decisions = new Map([
      [existingId, { decision: "overwrite" as const, existingNetworkId: existingId }]
    ]);
    const resolved = resolveImportConflicts(payload, existing, decisions);
    expect(resolved.networks).toHaveLength(1);
    expect(resolved.networks[0]?.id).toBe(existingId);
    expect(resolved.summary.skippedNetworkIds).toHaveLength(0);
    expect(resolved.summary.errors).toHaveLength(0);
  });

  it("normalizes malformed imported network timestamps with deterministic fallbacks", () => {
    const existing = createInitialState();
    const payload = {
      schemaVersion: 2 as const,
      exportedAt: "2026-02-21T10:20:00.000Z",
      source: {
        app: "electrical-plan-editor" as const,
        appVersion: APP_RELEASE_VERSION,
        appSchemaVersion: 2
      },
      networks: [
        {
          network: {
            id: asNetworkId("imp-1"),
            name: "Imported 1",
            technicalId: "IMP-1",
            createdAt: "not-a-date",
            updatedAt: "2026-02-20T10:00:00.000Z"
          },
          state: createEmptyNetworkScopedState()
        },
        {
          network: {
            id: asNetworkId("imp-2"),
            name: "Imported 2",
            technicalId: "IMP-2",
            createdAt: "2026-02-20T10:01:00.000Z",
            updatedAt: "invalid-date"
          },
          state: createEmptyNetworkScopedState()
        },
        {
          network: {
            id: asNetworkId("imp-3"),
            name: "Imported 3",
            technicalId: "IMP-3",
            createdAt: "nope",
            updatedAt: "nope-too"
          },
          state: createEmptyNetworkScopedState()
        },
        {
          network: {
            id: asNetworkId("imp-4"),
            name: "Imported 4",
            technicalId: "IMP-4",
            createdAt: "2026-02-20T10:20:00.000Z",
            updatedAt: "2026-02-20T10:10:00.000Z"
          },
          state: createEmptyNetworkScopedState()
        }
      ]
    };

    const resolved = resolveImportConflicts(payload, existing);
    expect(resolved.networks).toHaveLength(4);

    const importedOne = resolved.networks.find((network) => network.technicalId === "IMP-1");
    const importedTwo = resolved.networks.find((network) => network.technicalId === "IMP-2");
    const importedThree = resolved.networks.find((network) => network.technicalId === "IMP-3");
    const importedFour = resolved.networks.find((network) => network.technicalId === "IMP-4");
    expect(importedOne?.createdAt).toBe("2026-02-20T10:00:00.000Z");
    expect(importedOne?.updatedAt).toBe("2026-02-20T10:00:00.000Z");
    expect(importedTwo?.createdAt).toBe("2026-02-20T10:01:00.000Z");
    expect(importedTwo?.updatedAt).toBe("2026-02-20T10:01:00.000Z");
    expect(importedThree?.createdAt).toBe(importedThree?.updatedAt);
    expect(Date.parse(importedThree?.createdAt ?? "")).not.toBeNaN();
    expect(importedFour?.updatedAt).toBe(importedFour?.createdAt);
    expect(resolved.summary.warnings.length).toBeGreaterThanOrEqual(4);
  });

  it("rejects malformed payloads", () => {
    const malformed = parseNetworkFilePayload("{\"schemaVersion\":1,\"networks\":[]}");
    expect(malformed.payload).toBeNull();
    expect(malformed.error).not.toBeNull();
  });

  it("rejects unsupported future-version payloads with a clear error", () => {
    const futurePayload = {
      payloadKind: NETWORK_FILE_PAYLOAD_KIND,
      schemaVersion: 99,
      exportedAt: "2026-02-21T10:10:00.000Z",
      source: {
        app: "electrical-plan-editor",
        appVersion: "9.9.9",
        appSchemaVersion: 99
      },
      networks: []
    };

    const parsed = parseNetworkFilePayload(JSON.stringify(futurePayload));
    expect(parsed.payload).toBeNull();
    expect(parsed.error).toMatch(/newer than supported/i);
  });
});
