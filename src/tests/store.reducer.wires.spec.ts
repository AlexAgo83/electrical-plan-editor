import { describe, expect, it } from "vitest";
import type { CatalogItemId } from "../core/entities";
import { appActions, appReducer } from "../store";
import {
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  reduceAll
} from "./helpers/store-reducer-test-utils";

const asCatalogItemId = (value: string) => value as CatalogItemId;

describe("appReducer wire lifecycle and routing", () => {
  it("creates a wire with automatic shortest route and endpoint occupancy", () => {
    const state = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 }),
      appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 2 }),
      appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
      appActions.upsertNode({ id: asNodeId("N-S1"), kind: "splice", spliceId: asSpliceId("S1") }),
      appActions.upsertSegment({
        id: asSegmentId("SEG1"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 50
      }),
      appActions.saveWire({
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-1",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
      })
    ]);

    const wire = state.wires.byId[asWireId("W1")];
    expect(wire).toBeDefined();
    expect(wire?.isRouteLocked).toBe(false);
    expect(wire?.routeSegmentIds).toEqual([asSegmentId("SEG1")]);
    expect(wire?.lengthMm).toBe(50);
    expect(state.connectorCavityOccupancy[asConnectorId("C1")]?.[1]).toBe("wire:W1:A");
    expect(state.splicePortOccupancy[asSpliceId("S1")]?.[1]).toBe("wire:W1:B");
  });

  it("locks and resets wire route deterministically", () => {
    const state = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 }),
      appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 2 }),
      appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
      appActions.upsertNode({ id: asNodeId("N-S1"), kind: "splice", spliceId: asSpliceId("S1") }),
      appActions.upsertNode({ id: asNodeId("N-X"), kind: "intermediate", label: "N-X" }),
      appActions.upsertSegment({
        id: asSegmentId("SEG1"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-X"),
        lengthMm: 10
      }),
      appActions.upsertSegment({
        id: asSegmentId("SEG2"),
        nodeA: asNodeId("N-X"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 10
      }),
      appActions.upsertSegment({
        id: asSegmentId("SEG3"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 25
      }),
      appActions.saveWire({
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-1",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
      }),
      appActions.lockWireRoute(asWireId("W1"), [asSegmentId("SEG3")]),
      appActions.resetWireRoute(asWireId("W1"))
    ]);

    const wire = state.wires.byId[asWireId("W1")];
    expect(wire).toBeDefined();
    expect(wire?.isRouteLocked).toBe(false);
    expect(wire?.routeSegmentIds).toEqual([asSegmentId("SEG1"), asSegmentId("SEG2")]);
    expect(wire?.lengthMm).toBe(20);
  });

  it("prevents endpoint occupancy conflicts between wires", () => {
    const state = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 }),
      appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 2 }),
      appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
      appActions.upsertNode({ id: asNodeId("N-S1"), kind: "splice", spliceId: asSpliceId("S1") }),
      appActions.upsertSegment({
        id: asSegmentId("SEG1"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 50
      }),
      appActions.saveWire({
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-1",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
      }),
      appActions.saveWire({
        id: asWireId("W2"),
        name: "Wire 2",
        technicalId: "W-2",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 2 }
      })
    ]);

    expect(state.wires.byId[asWireId("W2")]).toBeUndefined();
    expect(state.ui.lastError).toBe("Wire endpoint A is already occupied.");
  });

  it("validates fuse catalog association and persists fuse protection on save", () => {
    const baseState = reduceAll([
      appActions.upsertCatalogItem({
        id: asCatalogItemId("CAT-FUSE"),
        manufacturerReference: "FUSE-10A-BLADE",
        connectionCount: 2
      }),
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 }),
      appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 2 }),
      appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
      appActions.upsertNode({ id: asNodeId("N-S1"), kind: "splice", spliceId: asSpliceId("S1") }),
      appActions.upsertSegment({
        id: asSegmentId("SEG1"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 50
      })
    ]);

    const invalidMissingCatalog = appReducer(
      baseState,
      appActions.saveWire({
        id: asWireId("WFUSE-BAD"),
        name: "Fuse wire",
        technicalId: "W-FUSE-BAD",
        protection: { kind: "fuse", catalogItemId: asCatalogItemId("CAT-MISSING") },
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
      })
    );
    expect(invalidMissingCatalog.wires.byId[asWireId("WFUSE-BAD")]).toBeUndefined();
    expect(invalidMissingCatalog.ui.lastError).toBe("Fuse wire references a missing catalog item.");

    const validFuseWire = appReducer(
      baseState,
      appActions.saveWire({
        id: asWireId("WFUSE-OK"),
        name: "Fuse wire",
        technicalId: "W-FUSE-OK",
        protection: { kind: "fuse", catalogItemId: asCatalogItemId("CAT-FUSE") },
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
      })
    );
    expect(validFuseWire.wires.byId[asWireId("WFUSE-OK")]?.protection).toEqual({
      kind: "fuse",
      catalogItemId: asCatalogItemId("CAT-FUSE")
    });
  });

  it("normalizes fuse catalog item IDs by trimming before lookup and persistence", () => {
    const baseState = reduceAll([
      appActions.upsertCatalogItem({
        id: asCatalogItemId("CAT-FUSE"),
        manufacturerReference: "FUSE-10A-BLADE",
        connectionCount: 2
      }),
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 }),
      appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 2 }),
      appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
      appActions.upsertNode({ id: asNodeId("N-S1"), kind: "splice", spliceId: asSpliceId("S1") }),
      appActions.upsertSegment({
        id: asSegmentId("SEG1"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 50
      })
    ]);

    const savedWire = appReducer(
      baseState,
      appActions.saveWire({
        id: asWireId("WFUSE-TRIM"),
        name: "Fuse wire trimmed",
        technicalId: "W-FUSE-TRIM",
        protection: { kind: "fuse", catalogItemId: asCatalogItemId("  CAT-FUSE  ") },
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
      })
    );

    expect(savedWire.ui.lastError).toBeNull();
    expect(savedWire.wires.byId[asWireId("WFUSE-TRIM")]?.protection).toEqual({
      kind: "fuse",
      catalogItemId: asCatalogItemId("CAT-FUSE")
    });
  });

  it("recomputes unlocked wire route when segment lengths change", () => {
    const first = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 }),
      appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 2 }),
      appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
      appActions.upsertNode({ id: asNodeId("N-S1"), kind: "splice", spliceId: asSpliceId("S1") }),
      appActions.upsertNode({ id: asNodeId("N-X"), kind: "intermediate", label: "N-X" }),
      appActions.upsertSegment({
        id: asSegmentId("SEG1"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-X"),
        lengthMm: 10
      }),
      appActions.upsertSegment({
        id: asSegmentId("SEG2"),
        nodeA: asNodeId("N-X"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 10
      }),
      appActions.upsertSegment({
        id: asSegmentId("SEG3"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 30
      }),
      appActions.saveWire({
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-1",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
      })
    ]);

    const second = appReducer(
      first,
      appActions.upsertSegment({
        id: asSegmentId("SEG3"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 15
      })
    );

    const wire = second.wires.byId[asWireId("W1")];
    expect(wire).toBeDefined();
    expect(wire?.isRouteLocked).toBe(false);
    expect(wire?.routeSegmentIds).toEqual([asSegmentId("SEG3")]);
    expect(wire?.lengthMm).toBe(15);
  });

  it("keeps locked route and recomputes locked length on segment updates", () => {
    const first = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 }),
      appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 2 }),
      appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
      appActions.upsertNode({ id: asNodeId("N-S1"), kind: "splice", spliceId: asSpliceId("S1") }),
      appActions.upsertNode({ id: asNodeId("N-X"), kind: "intermediate", label: "N-X" }),
      appActions.upsertSegment({
        id: asSegmentId("SEG1"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-X"),
        lengthMm: 10
      }),
      appActions.upsertSegment({
        id: asSegmentId("SEG2"),
        nodeA: asNodeId("N-X"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 10
      }),
      appActions.upsertSegment({
        id: asSegmentId("SEG3"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 25
      }),
      appActions.saveWire({
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-1",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
      }),
      appActions.lockWireRoute(asWireId("W1"), [asSegmentId("SEG3")])
    ]);

    const second = appReducer(
      first,
      appActions.upsertSegment({
        id: asSegmentId("SEG3"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N-S1"),
        lengthMm: 40
      })
    );

    const wire = second.wires.byId[asWireId("W1")];
    expect(wire).toBeDefined();
    expect(wire?.isRouteLocked).toBe(true);
    expect(wire?.routeSegmentIds).toEqual([asSegmentId("SEG3")]);
    expect(wire?.lengthMm).toBe(40);
  });
});
