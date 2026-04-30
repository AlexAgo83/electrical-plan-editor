import { describe, expect, it } from "vitest";
import { appActions } from "../store";
import {
  getEndpointOccupant,
  getWireEndpointOccupantRef,
  releaseEndpointOccupant,
  setEndpointOccupant,
  type EndpointOccupancyState
} from "../store/reducer/helpers/occupancy";
import {
  computeForcedRouteLength,
  findNodeIdForEndpoint,
  getEndpointValidationError,
  recomputeAllWiresForNetwork,
  resolveDirectionalSpliceEndpointSide
} from "../store/reducer/helpers/wireTransitions";
import {
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  reduceAll
} from "./helpers/store-reducer-test-utils";

describe("store reducer helpers - occupancy", () => {
  it("sets and reads endpoint occupancy for connector and splice endpoints", () => {
    let occupancyState: EndpointOccupancyState = {
      connectorCavityOccupancy: {},
      splicePortOccupancy: {}
    };

    occupancyState = setEndpointOccupant(
      occupancyState,
      { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 2 },
      "wire:W1:A"
    );
    occupancyState = setEndpointOccupant(
      occupancyState,
      { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
      "wire:W1:B"
    );

    expect(
      getEndpointOccupant(occupancyState, {
        kind: "connectorCavity",
        connectorId: asConnectorId("C1"),
        cavityIndex: 2
      })
    ).toBe("wire:W1:A");
    expect(
      getEndpointOccupant(occupancyState, {
        kind: "splicePort",
        spliceId: asSpliceId("S1"),
        portIndex: 1
      })
    ).toBe("wire:W1:B");
  });

  it("does not release occupancy when expected reference does not match", () => {
    const initial: EndpointOccupancyState = {
      connectorCavityOccupancy: {
        [asConnectorId("C1")]: {
          1: "wire:W1:A"
        }
      },
      splicePortOccupancy: {}
    };

    const next = releaseEndpointOccupant(
      initial,
      { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
      "wire:W2:A"
    );

    expect(next).toBe(initial);
  });

  it("releases occupancy and removes empty container maps", () => {
    const initial: EndpointOccupancyState = {
      connectorCavityOccupancy: {},
      splicePortOccupancy: {
        [asSpliceId("S1")]: {
          2: "wire:W1:B"
        }
      }
    };

    const next = releaseEndpointOccupant(
      initial,
      { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 2 },
      "wire:W1:B"
    );

    expect(next.splicePortOccupancy[asSpliceId("S1")]).toBeUndefined();
  });

  it("builds deterministic wire endpoint occupant references", () => {
    expect(getWireEndpointOccupantRef(asWireId("W1"), "A")).toBe("wire:W1:A");
    expect(getWireEndpointOccupantRef(asWireId("W1"), "B")).toBe("wire:W1:B");
  });
});

describe("store reducer helpers - wire transitions", () => {
  const connectedNetworkState = reduceAll([
    appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector", technicalId: "C-1", cavityCount: 2 }),
    appActions.upsertSplice({ id: asSpliceId("S1"), name: "Splice", technicalId: "S-1", portCount: 2 }),
    appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
    appActions.upsertNode({ id: asNodeId("N-MID"), kind: "intermediate", label: "MID" }),
    appActions.upsertNode({ id: asNodeId("N-S1"), kind: "splice", spliceId: asSpliceId("S1") }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-A"),
      nodeA: asNodeId("N-C1"),
      nodeB: asNodeId("N-MID"),
      lengthMm: 30
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-B"),
      nodeA: asNodeId("N-MID"),
      nodeB: asNodeId("N-S1"),
      lengthMm: 40
    }),
    appActions.saveWire({
      id: asWireId("W1"),
      name: "Wire 1",
      technicalId: "W-1",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 }
    })
  ]);

  it("maps wire endpoints to graph node ids", () => {
    expect(
      findNodeIdForEndpoint(connectedNetworkState, {
        kind: "connectorCavity",
        connectorId: asConnectorId("C1"),
        cavityIndex: 1
      })
    ).toBe(asNodeId("N-C1"));

    expect(
      findNodeIdForEndpoint(connectedNetworkState, {
        kind: "splicePort",
        spliceId: asSpliceId("S1"),
        portIndex: 1
      })
    ).toBe(asNodeId("N-S1"));
  });

  it("validates endpoint references against state entities", () => {
    expect(
      getEndpointValidationError(connectedNetworkState, {
        kind: "connectorCavity",
        connectorId: asConnectorId("UNKNOWN"),
        cavityIndex: 1
      })
    ).toBe("Wire endpoint references an unknown connector.");

    expect(
      getEndpointValidationError(connectedNetworkState, {
        kind: "splicePort",
        spliceId: asSpliceId("S1"),
        portIndex: 99
      })
    ).toBe("Wire splice port endpoint is out of range.");
  });

  it("computes forced route length and rejects invalid forced paths", () => {
    expect(
      computeForcedRouteLength(
        connectedNetworkState,
        asNodeId("N-C1"),
        asNodeId("N-S1"),
        [asSegmentId("SEG-A"), asSegmentId("SEG-B")]
      )
    ).toBe(70);

    expect(
      computeForcedRouteLength(connectedNetworkState, asNodeId("N-C1"), asNodeId("N-S1"), [asSegmentId("SEG-B")])
    ).toBeNull();
  });

  it("recomputes all wire routes in a deterministic way", () => {
    const recomputed = recomputeAllWiresForNetwork(connectedNetworkState);
    expect("wires" in recomputed).toBe(true);
    if (!("wires" in recomputed)) {
      throw new Error("Expected recompute result to contain wires.");
    }

    expect(recomputed.wires.byId[asWireId("W1")]?.routeSegmentIds).toEqual([asSegmentId("SEG-A"), asSegmentId("SEG-B")]);
    expect(recomputed.wires.byId[asWireId("W1")]?.lengthMm).toBe(70);
  });

  it("recomputes unlocked directional splice sides from the adjacent branch instead of trusting stale overrides", () => {
    const directionalState = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C-R"), name: "Right leaf", technicalId: "C-R", cavityCount: 1 }),
      appActions.upsertConnector({ id: asConnectorId("C-L1"), name: "Left 1", technicalId: "C-L1", cavityCount: 1 }),
      appActions.upsertConnector({ id: asConnectorId("C-L2"), name: "Left 2", technicalId: "C-L2", cavityCount: 1 }),
      appActions.upsertSplice({
        id: asSpliceId("S-DIR"),
        name: "Directional splice",
        technicalId: "S-DIR",
        portCount: 2,
        portMode: "directional"
      }),
      appActions.upsertNode({ id: asNodeId("N-R"), kind: "connector", connectorId: asConnectorId("C-R") }),
      appActions.upsertNode({ id: asNodeId("N-L1"), kind: "connector", connectorId: asConnectorId("C-L1") }),
      appActions.upsertNode({ id: asNodeId("N-L2"), kind: "connector", connectorId: asConnectorId("C-L2") }),
      appActions.upsertNode({ id: asNodeId("N-S"), kind: "splice", spliceId: asSpliceId("S-DIR") }),
      appActions.upsertNode({ id: asNodeId("N-LMID"), kind: "intermediate", label: "LMID" }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-R"),
        nodeA: asNodeId("N-R"),
        nodeB: asNodeId("N-S"),
        lengthMm: 10
      }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-L1"),
        nodeA: asNodeId("N-S"),
        nodeB: asNodeId("N-LMID"),
        lengthMm: 10
      }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-L2"),
        nodeA: asNodeId("N-LMID"),
        nodeB: asNodeId("N-L2"),
        lengthMm: 10
      }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-L3"),
        nodeA: asNodeId("N-LMID"),
        nodeB: asNodeId("N-L1"),
        lengthMm: 10
      }),
      appActions.setNodePositions({
        [asNodeId("N-S")]: { x: 100, y: 100 },
        [asNodeId("N-R")]: { x: 100, y: 0 },
        [asNodeId("N-LMID")]: { x: 100, y: 200 },
        [asNodeId("N-L1")]: { x: 60, y: 260 },
        [asNodeId("N-L2")]: { x: 140, y: 260 }
      }),
      appActions.saveWire({
        id: asWireId("W-LEFT"),
        name: "Left branch wire",
        technicalId: "W-LEFT",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-L1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-DIR"), portIndex: 1 }
      }),
      appActions.saveWire({
        id: asWireId("W-DIR"),
        name: "Directional wire",
        technicalId: "W-DIR",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-R"), cavityIndex: 1 },
        endpointB: {
          kind: "splicePort",
          spliceId: asSpliceId("S-DIR"),
          portIndex: 1,
          spliceSideOverride: "L",
          spliceSideLocked: false
        }
      })
    ]);

    const wire = directionalState.wires.byId[asWireId("W-DIR")];
    expect(wire?.endpointB.kind).toBe("splicePort");
    if (wire?.endpointB.kind !== "splicePort") {
      throw new Error("Expected a splice endpoint.");
    }

    expect(wire.endpointB.spliceSideOverride).toBe("R");
    expect(wire.endpointB.portIndex).toBe(2);

    expect(
      resolveDirectionalSpliceEndpointSide(
        directionalState,
        {
          ...wire.endpointB,
          spliceSideOverride: "L",
          spliceSideLocked: false
        },
        wire.routeSegmentIds,
        "B"
      )
    ).toBe("R");
  });

  it("assigns R to the less populated branch when a directional splice has two outgoing branches", () => {
    const initialState = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C-SOLO"), name: "Solo", technicalId: "C-SOLO", cavityCount: 1 }),
      appActions.upsertConnector({ id: asConnectorId("C-BUS"), name: "Bus", technicalId: "C-BUS", cavityCount: 3 }),
      appActions.upsertSplice({
        id: asSpliceId("S-BRANCH"),
        name: "Branch splice",
        technicalId: "S-BRANCH",
        portCount: 2,
        portMode: "directional"
      }),
      appActions.upsertNode({ id: asNodeId("N-S"), kind: "splice", spliceId: asSpliceId("S-BRANCH") }),
      appActions.upsertNode({ id: asNodeId("N-SOLO"), kind: "connector", connectorId: asConnectorId("C-SOLO") }),
      appActions.upsertNode({ id: asNodeId("N-BUS"), kind: "connector", connectorId: asConnectorId("C-BUS") }),
      appActions.upsertSegment({ id: asSegmentId("SEG-SOLO"), nodeA: asNodeId("N-S"), nodeB: asNodeId("N-SOLO"), lengthMm: 20 }),
      appActions.upsertSegment({ id: asSegmentId("SEG-BUS"), nodeA: asNodeId("N-S"), nodeB: asNodeId("N-BUS"), lengthMm: 20 }),
      appActions.setNodePositions({
        [asNodeId("N-S")]: { x: 0, y: 0 },
        [asNodeId("N-SOLO")]: { x: 120, y: -120 },
        [asNodeId("N-BUS")]: { x: 120, y: 120 }
      }),
      appActions.saveWire({
        id: asWireId("W-SOLO"),
        name: "Solo",
        technicalId: "W-SOLO",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-SOLO"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-BRANCH"), portIndex: 1 }
      }),
      appActions.saveWire({
        id: asWireId("W-BUS-1"),
        name: "Bus 1",
        technicalId: "W-BUS-1",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-BUS"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-BRANCH"), portIndex: 1 }
      }),
      appActions.saveWire({
        id: asWireId("W-BUS-2"),
        name: "Bus 2",
        technicalId: "W-BUS-2",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-BUS"), cavityIndex: 2 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-BRANCH"), portIndex: 1 }
      })
    ]);

    const recomputed = recomputeAllWiresForNetwork(initialState);
    expect("wires" in recomputed).toBe(true);
    if (!("wires" in recomputed)) {
      throw new Error("Expected recompute result to contain wires.");
    }
    const branchState = recomputed.wires;

    expect(branchState.byId[asWireId("W-SOLO")]?.endpointB).toMatchObject({ spliceSideOverride: "R", portIndex: 2 });
    expect(branchState.byId[asWireId("W-BUS-1")]?.endpointB).toMatchObject({ spliceSideOverride: "L", portIndex: 1 });
    expect(branchState.byId[asWireId("W-BUS-2")]?.endpointB).toMatchObject({ spliceSideOverride: "L", portIndex: 1 });
  });
});
