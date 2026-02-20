import { describe, expect, it } from "vitest";
import {
  appActions,
  appReducer,
  createAppStore,
  createInitialState,
  type AppState
} from "../store";
import type { ConnectorId, NodeId, SegmentId, SpliceId, WireId } from "../core/entities";

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

function asWireId(value: string): WireId {
  return value as WireId;
}

function reduceAll(actions: Parameters<typeof appReducer>[1][]): AppState {
  return actions.reduce(appReducer, createInitialState());
}

describe("appReducer", () => {
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
    expect(second.ui.lastError).toBe("Cavity 2 is already occupied by 'wire-draft-1:A'.");
  });

  it("clears connector occupancy on connector removal", () => {
    const first = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 4 }),
      appActions.occupyConnectorCavity(asConnectorId("C1"), 1, "wire-draft-1:A")
    ]);

    const second = appReducer(first, appActions.removeConnector(asConnectorId("C1")));
    expect(second.connectorCavityOccupancy[asConnectorId("C1")]).toBeUndefined();
  });
});

describe("createAppStore", () => {
  it("notifies subscribers on state change", () => {
    const store = createAppStore();
    let notifications = 0;
    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });

    store.dispatch(
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 })
    );

    unsubscribe();

    expect(notifications).toBe(1);
    expect(store.getState().connectors.allIds).toEqual([asConnectorId("C1")]);
  });
});
