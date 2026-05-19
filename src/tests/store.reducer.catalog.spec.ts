import { describe, expect, it } from "vitest";
import type { CatalogItemId, ConnectorId, NodeId, SegmentId, SpliceId, WireId } from "../core/entities";
import { appActions, appReducer, createInitialState } from "../store";

const asCatalogItemId = (value: string) => value as CatalogItemId;
const asConnectorId = (value: string) => value as ConnectorId;
const asSpliceId = (value: string) => value as SpliceId;
const asNodeId = (value: string) => value as NodeId;
const asSegmentId = (value: string) => value as SegmentId;
const asWireId = (value: string) => value as WireId;

describe("store reducer - catalog", () => {
  it("rejects case-insensitive duplicate manufacturer references", () => {
    const firstCatalogId = asCatalogItemId("CAT-REF-A");
    const secondCatalogId = asCatalogItemId("CAT-REF-B");
    const seeded = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: firstCatalogId,
        manufacturerReference: "REF-A",
        connectionCount: 2
      })
    );

    const rejected = appReducer(
      seeded,
      appActions.upsertCatalogItem({
        id: secondCatalogId,
        manufacturerReference: "ref-a",
        connectionCount: 2
      })
    );

    expect(rejected.catalogItems.byId[firstCatalogId]).toBeDefined();
    expect(rejected.catalogItems.byId[secondCatalogId]).toBeUndefined();
    expect(rejected.ui.lastError?.message).toContain("already used");
  });

  it("propagates manufacturer reference and connection count changes to linked connectors and splices", () => {
    const catalogId = asCatalogItemId("CAT-1");
    const connectorId = asConnectorId("C1");
    const spliceId = asSpliceId("S1");

    const state = [
      appActions.upsertCatalogItem({
        id: catalogId,
        manufacturerReference: "REF-A",
        connectionCount: 4
      }),
      appActions.upsertConnector({
        id: connectorId,
        name: "Connector",
        technicalId: "C-1",
        catalogItemId: catalogId,
        manufacturerReference: "REF-A",
        cavityCount: 4
      }),
      appActions.upsertSplice({
        id: spliceId,
        name: "Splice",
        technicalId: "S-1",
        catalogItemId: catalogId,
        manufacturerReference: "REF-A",
        portCount: 4
      }),
      appActions.upsertCatalogItem({
        id: catalogId,
        manufacturerReference: "REF-B",
        connectionCount: 6
      })
    ].reduce(appReducer, createInitialState());

    expect(state.catalogItems.byId[catalogId]?.manufacturerReference).toBe("REF-B");
    expect(state.catalogItems.byId[catalogId]?.connectionCount).toBe(6);
    expect(state.connectors.byId[connectorId]?.manufacturerReference).toBe("REF-B");
    expect(state.connectors.byId[connectorId]?.cavityCount).toBe(6);
    expect(state.splices.byId[spliceId]?.manufacturerReference).toBe("REF-B");
    expect(state.splices.byId[spliceId]?.portCount).toBe(6);
  });

  it("preserves connector material opt-outs and overrides when refreshing linked catalog defaults", () => {
    const catalogId = asCatalogItemId("CAT-MATERIAL");
    const connectorId = asConnectorId("C-MATERIAL");

    const state = [
      appActions.upsertCatalogItem({
        id: catalogId,
        manufacturerReference: "MAT-REF-A",
        connectionCount: 4
      }),
      appActions.upsertConnector({
        id: connectorId,
        name: "Material connector",
        technicalId: "C-MAT-1",
        catalogItemId: catalogId,
        manufacturerReference: "MAT-REF-A",
        cavityCount: 4,
        applyCatalogPlugs: false,
        terminalOverrides: {
          2: { terminalReference: "TERM-OVERRIDE", sealReference: "SEAL-OVERRIDE" }
        }
      }),
      appActions.upsertCatalogItem({
        id: catalogId,
        manufacturerReference: "MAT-REF-B",
        connectionCount: 4,
        connectorDefaults: {
          allSameTerminals: true,
          defaultTerminal: { terminalReference: "TERM-DEFAULT", sealReference: "SEAL-DEFAULT" },
          plugs: [{ plugReference: "PLUG-A", quantity: 2 }]
        }
      })
    ].reduce(appReducer, createInitialState());

    expect(state.catalogItems.byId[catalogId]?.connectorDefaults?.defaultTerminal?.terminalReference).toBe("TERM-DEFAULT");
    expect(state.connectors.byId[connectorId]?.manufacturerReference).toBe("MAT-REF-B");
    expect(state.connectors.byId[connectorId]?.applyCatalogPlugs).toBe(false);
    expect(state.connectors.byId[connectorId]?.terminalOverrides?.[2]?.terminalReference).toBe("TERM-OVERRIDE");
  });

  it("normalizes connector physical layout on catalog upsert", () => {
    const catalogId = asCatalogItemId("CAT-LAYOUT");

    const state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: catalogId,
        manufacturerReference: "LAYOUT-REF",
        connectionCount: 3,
        connectorLayout: {
          version: 1,
          units: "grid",
          width: 8,
          height: 6,
          ways: [
            { cavityIndex: 2, x: 5, y: 3, shape: "slot", label: "B" }
          ]
        }
      })
    );

    expect(state.catalogItems.byId[catalogId]?.connectorLayout?.ways).toHaveLength(3);
    expect(state.catalogItems.byId[catalogId]?.connectorLayout?.ways[1]).toEqual({
      cavityIndex: 2,
      x: 5,
      y: 3,
      shape: "slot",
      label: "B"
    });
  });

  it("blocks removing a referenced catalog item and blocks unsafe connection count reduction", () => {
    const catalogId = asCatalogItemId("CAT-LOCKED");
    const connectorId = asConnectorId("C-LOCKED");

    const seeded = [
      appActions.upsertCatalogItem({
        id: catalogId,
        manufacturerReference: "LOCKED-REF",
        connectionCount: 4
      }),
      appActions.upsertConnector({
        id: connectorId,
        name: "Locked connector",
        technicalId: "C-LOCKED-1",
        catalogItemId: catalogId,
        manufacturerReference: "LOCKED-REF",
        cavityCount: 4
      }),
      appActions.occupyConnectorCavity(connectorId, 4, "manual-check")
    ].reduce(appReducer, createInitialState());

    const afterDeleteAttempt = appReducer(seeded, appActions.removeCatalogItem(catalogId));
    expect(afterDeleteAttempt.catalogItems.byId[catalogId]).toBeDefined();
    expect(afterDeleteAttempt.ui.lastError?.message).toBe("Cannot remove catalog item while connectors reference it.");

    const afterReductionAttempt = appReducer(
      seeded,
      appActions.upsertCatalogItem({
        id: catalogId,
        manufacturerReference: "LOCKED-REF",
        connectionCount: 2
      })
    );
    expect(afterReductionAttempt.catalogItems.byId[catalogId]?.connectionCount).toBe(4);
    expect(afterReductionAttempt.connectors.byId[connectorId]?.cavityCount).toBe(4);
    expect(afterReductionAttempt.ui.lastError?.message).toContain("Catalog connection count cannot be reduced");
  });

  it("blocks removing a catalog item referenced by a fuse-mode wire", () => {
    const catalogId = asCatalogItemId("CAT-FUSE-LOCKED");
    const connectorId = asConnectorId("C-FUSE");
    const spliceId = asSpliceId("S-FUSE");

    const seeded = [
      appActions.upsertCatalogItem({
        id: catalogId,
        manufacturerReference: "FUSE-LOCKED-REF",
        connectionCount: 2
      }),
      appActions.upsertConnector({
        id: connectorId,
        name: "Fuse connector",
        technicalId: "C-FUSE-1",
        cavityCount: 2
      }),
      appActions.upsertSplice({
        id: spliceId,
        name: "Fuse splice",
        technicalId: "S-FUSE-1",
        portCount: 2
      }),
      appActions.upsertNode({ id: asNodeId("N-C-FUSE"), kind: "connector", connectorId }),
      appActions.upsertNode({ id: asNodeId("N-S-FUSE"), kind: "splice", spliceId }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-FUSE"),
        nodeA: asNodeId("N-C-FUSE"),
        nodeB: asNodeId("N-S-FUSE"),
        lengthMm: 25
      }),
      appActions.saveWire({
        id: asWireId("W-FUSE-LOCK"),
        name: "Fuse wire",
        technicalId: "W-FUSE-LOCK",
        protection: { kind: "fuse", catalogItemId: catalogId },
        endpointA: { kind: "connectorCavity", connectorId, cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId, portIndex: 1 }
      })
    ].reduce(appReducer, createInitialState());

    const afterDeleteAttempt = appReducer(seeded, appActions.removeCatalogItem(catalogId));
    expect(afterDeleteAttempt.catalogItems.byId[catalogId]).toBeDefined();
    expect(afterDeleteAttempt.ui.lastError?.message).toBe("Cannot remove catalog item while fuse wires reference it.");
  });
});
