import { describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import {
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  reduceAll
} from "./helpers/store-reducer-test-utils";

describe("appReducer entity lifecycle", () => {
  it("keeps deterministic allIds ordering for every entity type", () => {
    const state = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C2"), name: "Connector 2", technicalId: "C-2", cavityCount: 4 }),
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 }),
      appActions.upsertSplice({ id: asSpliceId("S2"), name: "Splice 2", technicalId: "S-2", portCount: 4 }),
      appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 2 }),
      appActions.upsertNode({ id: asNodeId("N2"), kind: "intermediate", label: "Node 2" }),
      appActions.upsertNode({ id: asNodeId("N1"), kind: "intermediate", label: "Node 1" }),
      appActions.upsertSegment({
        id: asSegmentId("SEG2"),
        nodeA: asNodeId("N1"),
        nodeB: asNodeId("N2"),
        lengthMm: 100
      }),
      appActions.upsertSegment({
        id: asSegmentId("SEG1"),
        nodeA: asNodeId("N2"),
        nodeB: asNodeId("N1"),
        lengthMm: 120
      }),
      appActions.upsertWire({
        id: asWireId("W2"),
        name: "Wire 2",
        technicalId: "W-2",
        sectionMm2: 0.5,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
        routeSegmentIds: [asSegmentId("SEG1")],
        lengthMm: 120,
        isRouteLocked: false
      }),
      appActions.upsertWire({
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-1",
        sectionMm2: 0.5,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 2 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 2 },
        routeSegmentIds: [asSegmentId("SEG2")],
        lengthMm: 100,
        isRouteLocked: true
      })
    ]);

    expect(state.connectors.allIds).toEqual([asConnectorId("C1"), asConnectorId("C2")]);
    expect(state.splices.allIds).toEqual([asSpliceId("S1"), asSpliceId("S2")]);
    expect(state.nodes.allIds).toEqual([asNodeId("N1"), asNodeId("N2")]);
    expect(state.segments.allIds).toEqual([asSegmentId("SEG1"), asSegmentId("SEG2")]);
    expect(state.wires.allIds).toEqual([asWireId("W1"), asWireId("W2")]);
  });

  it("clears selection when selected entity is removed", () => {
    const initialState = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 }),
      appActions.select({ kind: "connector", id: "C1" })
    ]);

    const nextState = appReducer(initialState, appActions.removeConnector(asConnectorId("C1")));

    expect(nextState.ui.selected).toBeNull();
    expect(nextState.connectors.byId[asConnectorId("C1")]).toBeUndefined();
  });

  it("keeps ids stable when updating an existing entity", () => {
    const first = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 })
    ]);

    const second = appReducer(
      first,
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1 Updated", technicalId: "C-1", cavityCount: 3 })
    );
    const updatedConnector = second.connectors.byId[asConnectorId("C1")];

    expect(second.connectors.allIds).toEqual([asConnectorId("C1")]);
    expect(updatedConnector).toBeDefined();
    expect(updatedConnector?.name).toBe("Connector 1 Updated");
  });

  it("rejects duplicate connector technical IDs", () => {
    const first = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 })
    ]);

    const second = appReducer(
      first,
      appActions.upsertConnector({ id: asConnectorId("C2"), name: "Connector 2", technicalId: "C-1", cavityCount: 3 })
    );

    expect(second.connectors.byId[asConnectorId("C2")]).toBeUndefined();
    expect(second.ui.lastError).toBe("Connector technical ID 'C-1' is already used.");
  });

  it("normalizes optional connector manufacturer references", () => {
    const state = reduceAll([
      appActions.upsertConnector({
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-1",
        cavityCount: 2,
        manufacturerReference: "  TE-1-967616-1  "
      }),
      appActions.upsertConnector({
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-1",
        cavityCount: 2,
        manufacturerReference: " "
      }),
      appActions.upsertConnector({
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-1",
        cavityCount: 2,
        manufacturerReference: `  ${"A".repeat(130)}  `
      })
    ]);

    const connector = state.connectors.byId[asConnectorId("C1")];
    expect(connector?.manufacturerReference).toHaveLength(120);
    expect(connector?.manufacturerReference).toBe("A".repeat(120));
  });

  it("enforces single occupancy per connector cavity", () => {
    const first = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 4 }),
      appActions.occupyConnectorCavity(asConnectorId("C1"), 2, "wire-draft-1:A")
    ]);
    const second = appReducer(first, appActions.occupyConnectorCavity(asConnectorId("C1"), 2, "wire-draft-2:A"));
    const firstConnectorOccupancy = first.connectorCavityOccupancy[asConnectorId("C1")];
    const secondConnectorOccupancy = second.connectorCavityOccupancy[asConnectorId("C1")];

    expect(firstConnectorOccupancy).toBeDefined();
    expect(secondConnectorOccupancy).toBeDefined();
    expect(firstConnectorOccupancy?.[2]).toBe("wire-draft-1:A");
    expect(secondConnectorOccupancy?.[2]).toBe("wire-draft-1:A");
    expect(second.ui.lastError).toBe("Way 2 is already occupied by 'wire-draft-1:A'.");
  });

  it("clears connector occupancy on connector removal", () => {
    const first = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 4 }),
      appActions.occupyConnectorCavity(asConnectorId("C1"), 1, "wire-draft-1:A")
    ]);

    const second = appReducer(first, appActions.removeConnector(asConnectorId("C1")));
    expect(second.connectorCavityOccupancy[asConnectorId("C1")]).toBeUndefined();
  });

  it("rejects duplicate splice technical IDs", () => {
    const first = reduceAll([
      appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 2 })
    ]);

    const second = appReducer(
      first,
      appActions.upsertSplice({ id: asSpliceId("S2"), name: "Splice 2", technicalId: "S-1", portCount: 3 })
    );

    expect(second.splices.byId[asSpliceId("S2")]).toBeUndefined();
    expect(second.ui.lastError).toBe("Splice technical ID 'S-1' is already used.");
  });

  it("normalizes optional splice manufacturer references and allows duplicates across connector/splice", () => {
    const state = reduceAll([
      appActions.upsertConnector({
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-1",
        cavityCount: 2,
        manufacturerReference: " PN-123 "
      }),
      appActions.upsertSplice({
        id: asSpliceId("S1"),
        name: "Splice 1",
        technicalId: "S-1",
        portCount: 2,
        manufacturerReference: " PN-123 "
      }),
      appActions.upsertSplice({
        id: asSpliceId("S1"),
        name: "Splice 1",
        technicalId: "S-1",
        portCount: 2,
        manufacturerReference: ""
      })
    ]);

    expect(state.connectors.byId[asConnectorId("C1")]?.manufacturerReference).toBe("PN-123");
    expect(state.splices.byId[asSpliceId("S1")]?.manufacturerReference).toBeUndefined();
    expect(state.ui.lastError).toBeNull();
  });

  it("enforces single occupancy per splice port", () => {
    const first = reduceAll([
      appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 4 }),
      appActions.occupySplicePort(asSpliceId("S1"), 2, "wire-draft-1:B")
    ]);
    const second = appReducer(first, appActions.occupySplicePort(asSpliceId("S1"), 2, "wire-draft-2:B"));
    const firstSpliceOccupancy = first.splicePortOccupancy[asSpliceId("S1")];
    const secondSpliceOccupancy = second.splicePortOccupancy[asSpliceId("S1")];

    expect(firstSpliceOccupancy).toBeDefined();
    expect(secondSpliceOccupancy).toBeDefined();
    expect(firstSpliceOccupancy?.[2]).toBe("wire-draft-1:B");
    expect(secondSpliceOccupancy?.[2]).toBe("wire-draft-1:B");
    expect(second.ui.lastError).toBe("Port 2 is already occupied by 'wire-draft-1:B'.");
  });

  it("clears splice occupancy on splice removal", () => {
    const first = reduceAll([
      appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 4 }),
      appActions.occupySplicePort(asSpliceId("S1"), 1, "wire-draft-1:B")
    ]);

    const second = appReducer(first, appActions.removeSplice(asSpliceId("S1")));
    expect(second.splicePortOccupancy[asSpliceId("S1")]).toBeUndefined();
  });

  it("requires existing connector or splice when creating specialized nodes", () => {
    const missingConnectorNode = appReducer(
      createInitialState(),
      appActions.upsertNode({
        id: asNodeId("N-CONNECTOR"),
        kind: "connector",
        connectorId: asConnectorId("C-MISSING")
      })
    );
    expect(missingConnectorNode.nodes.byId[asNodeId("N-CONNECTOR")]).toBeUndefined();
    expect(missingConnectorNode.ui.lastError).toBe("Cannot create connector node for unknown connector.");

    const missingSpliceNode = appReducer(
      createInitialState(),
      appActions.upsertNode({
        id: asNodeId("N-SPLICE"),
        kind: "splice",
        spliceId: asSpliceId("S-MISSING")
      })
    );
    expect(missingSpliceNode.nodes.byId[asNodeId("N-SPLICE")]).toBeUndefined();
    expect(missingSpliceNode.ui.lastError).toBe("Cannot create splice node for unknown splice.");
  });

  it("allows only one specialized node per connector or splice", () => {
    const first = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 }),
      appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice 1", technicalId: "S-1", portCount: 2 }),
      appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
      appActions.upsertNode({ id: asNodeId("N-S1"), kind: "splice", spliceId: asSpliceId("S1") })
    ]);

    const second = appReducer(
      first,
      appActions.upsertNode({ id: asNodeId("N-C2"), kind: "connector", connectorId: asConnectorId("C1") })
    );
    expect(second.nodes.byId[asNodeId("N-C2")]).toBeUndefined();
    expect(second.ui.lastError).toBe("Only one connector node is allowed per connector.");

    const third = appReducer(
      first,
      appActions.upsertNode({ id: asNodeId("N-S2"), kind: "splice", spliceId: asSpliceId("S1") })
    );
    expect(third.nodes.byId[asNodeId("N-S2")]).toBeUndefined();
    expect(third.ui.lastError).toBe("Only one splice node is allowed per splice.");
  });

  it("renames a node atomically and remaps segments, layout positions, and node selection", () => {
    const state = reduceAll([
      appActions.upsertNode({ id: asNodeId("N1"), kind: "intermediate", label: "Node 1" }),
      appActions.upsertNode({ id: asNodeId("N2"), kind: "intermediate", label: "Node 2" }),
      appActions.upsertSegment({
        id: asSegmentId("SEG1"),
        nodeA: asNodeId("N1"),
        nodeB: asNodeId("N2"),
        lengthMm: 100
      }),
      appActions.setNodePosition(asNodeId("N1"), { x: 10, y: 20 }),
      appActions.select({ kind: "node", id: "N1" })
    ]);

    const renamed = appReducer(state, appActions.renameNode(asNodeId("N1"), asNodeId("N1A")));

    expect(renamed.nodes.byId[asNodeId("N1")]).toBeUndefined();
    expect(renamed.nodes.byId[asNodeId("N1A")]).toBeDefined();
    expect(renamed.nodes.allIds).toContain(asNodeId("N1A"));
    expect(renamed.segments.byId[asSegmentId("SEG1")]?.nodeA).toBe(asNodeId("N1A"));
    expect(renamed.nodePositions[asNodeId("N1")]).toBeUndefined();
    expect(renamed.nodePositions[asNodeId("N1A")]).toEqual({ x: 10, y: 20 });
    expect(renamed.ui.selected).toEqual({ kind: "node", id: "N1A" });
    expect(renamed.ui.lastError).toBeNull();
  });

  it("rejects node rename when target ID already exists", () => {
    const state = reduceAll([
      appActions.upsertNode({ id: asNodeId("N1"), kind: "intermediate", label: "Node 1" }),
      appActions.upsertNode({ id: asNodeId("N2"), kind: "intermediate", label: "Node 2" })
    ]);

    const renamed = appReducer(state, appActions.renameNode(asNodeId("N1"), asNodeId("N2")));

    expect(renamed.nodes.byId[asNodeId("N1")]).toBeDefined();
    expect(renamed.nodes.byId[asNodeId("N2")]).toBeDefined();
    expect(renamed.ui.lastError).toBe("Node ID 'N2' already exists.");
  });

  it("treats node rename to the same ID as a safe no-op", () => {
    const state = reduceAll([appActions.upsertNode({ id: asNodeId("N1"), kind: "intermediate", label: "Node 1" })]);

    const renamed = appReducer(state, appActions.renameNode(asNodeId("N1"), asNodeId("N1")));

    expect(renamed).toBe(state);
  });

  it("rejects invalid segment endpoints and length", () => {
    const withNodes = reduceAll([
      appActions.upsertNode({ id: asNodeId("N1"), kind: "intermediate", label: "Node 1" }),
      appActions.upsertNode({ id: asNodeId("N2"), kind: "intermediate", label: "Node 2" })
    ]);

    const sameNode = appReducer(
      withNodes,
      appActions.upsertSegment({
        id: asSegmentId("SEG-INVALID-A"),
        nodeA: asNodeId("N1"),
        nodeB: asNodeId("N1"),
        lengthMm: 100
      })
    );
    expect(sameNode.segments.byId[asSegmentId("SEG-INVALID-A")]).toBeUndefined();
    expect(sameNode.ui.lastError).toBe("Segment endpoints must reference two different nodes.");

    const missingNode = appReducer(
      withNodes,
      appActions.upsertSegment({
        id: asSegmentId("SEG-INVALID-B"),
        nodeA: asNodeId("N1"),
        nodeB: asNodeId("N-MISSING"),
        lengthMm: 100
      })
    );
    expect(missingNode.segments.byId[asSegmentId("SEG-INVALID-B")]).toBeUndefined();
    expect(missingNode.ui.lastError).toBe("Segment endpoints must reference existing nodes.");

    const invalidLength = appReducer(
      withNodes,
      appActions.upsertSegment({
        id: asSegmentId("SEG-INVALID-C"),
        nodeA: asNodeId("N1"),
        nodeB: asNodeId("N2"),
        lengthMm: 0
      })
    );
    expect(invalidLength.segments.byId[asSegmentId("SEG-INVALID-C")]).toBeUndefined();
    expect(invalidLength.ui.lastError).toBe("Segment lengthMm must be >= 1.");
  });

  it("blocks node and connector removal when graph references exist", () => {
    const state = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 }),
      appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
      appActions.upsertNode({ id: asNodeId("N2"), kind: "intermediate", label: "Node 2" }),
      appActions.upsertSegment({
        id: asSegmentId("SEG1"),
        nodeA: asNodeId("N-C1"),
        nodeB: asNodeId("N2"),
        lengthMm: 80
      })
    ]);

    const removeNode = appReducer(state, appActions.removeNode(asNodeId("N-C1")));
    expect(removeNode.nodes.byId[asNodeId("N-C1")]).toBeDefined();
    expect(removeNode.ui.lastError).toBe("Cannot remove node while segments are connected to it.");

    const removeConnector = appReducer(state, appActions.removeConnector(asConnectorId("C1")));
    expect(removeConnector.connectors.byId[asConnectorId("C1")]).toBeDefined();
    expect(removeConnector.ui.lastError).toBe("Cannot remove connector while a connector node references it.");
  });
});
