import { describe, expect, it } from "vitest";
import { appActions, appReducer } from "../store";
import {
  getEndpointOccupants,
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
import { buildWireRecomputeReport } from "../store/reducer/helpers/wireRecomputeReport";
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
      getEndpointOccupants(occupancyState, {
        kind: "connectorCavity",
        connectorId: asConnectorId("C1"),
        cavityIndex: 2
      })
    ).toEqual(["wire:W1:A"]);
    expect(
      getEndpointOccupants(occupancyState, {
        kind: "splicePort",
        spliceId: asSpliceId("S1"),
        portIndex: 1
      })
    ).toEqual(["wire:W1:B"]);
  });

  it("does not release occupancy when expected reference does not match", () => {
    const initial: EndpointOccupancyState = {
      connectorCavityOccupancy: {
        [asConnectorId("C1")]: {
          1: ["wire:W1:A"]
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

  // Regression for floating directional splices placed on a vertical carrier
  // segment (e.g. connector drop branches). The carrier endpoints share the
  // splice x coordinate, so the side must be inferred from the vertical axis
  // instead of collapsing every wire onto a single port.
  const buildVerticalDirectionalState = (sideInverted: boolean) =>
    reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C-TOP"), name: "Top", technicalId: "C-TOP", cavityCount: 1 }),
      appActions.upsertConnector({ id: asConnectorId("C-BOT"), name: "Bottom", technicalId: "C-BOT", cavityCount: 1 }),
      appActions.upsertNode({ id: asNodeId("N-TOP"), kind: "connector", connectorId: asConnectorId("C-TOP") }),
      appActions.upsertNode({ id: asNodeId("N-BOT"), kind: "connector", connectorId: asConnectorId("C-BOT") }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-VERT"),
        nodeA: asNodeId("N-TOP"),
        nodeB: asNodeId("N-BOT"),
        lengthMm: 200
      }),
      appActions.upsertSplice({
        id: asSpliceId("S-VERT"),
        name: "Vertical splice",
        technicalId: "S-VERT",
        portCount: 2,
        portMode: "directional",
        sideInverted,
        placement: {
          kind: "segmentOffset",
          segmentId: asSegmentId("SEG-VERT"),
          fromNodeId: asNodeId("N-TOP"),
          offsetMm: 100
        }
      }),
      appActions.setNodePositions({
        [asNodeId("N-TOP")]: { x: 100, y: 0 },
        [asNodeId("N-BOT")]: { x: 100, y: 200 }
      }),
      appActions.saveWire({
        id: asWireId("W-UP"),
        name: "Up wire",
        technicalId: "W-UP",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-TOP"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-VERT"), portIndex: 1 }
      }),
      appActions.saveWire({
        id: asWireId("W-DOWN"),
        name: "Down wire",
        technicalId: "W-DOWN",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-BOT"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-VERT"), portIndex: 1 }
      })
    ]);

  it("splits directional splice sides by exit direction on a vertical carrier segment", () => {
    const verticalState = buildVerticalDirectionalState(false);

    // Wire exiting upward (toward the smaller-y endpoint) lands on L / port 1,
    // wire exiting downward lands on R / port 2 — two ports, two directions.
    expect(verticalState.wires.byId[asWireId("W-UP")]?.endpointB).toMatchObject({
      spliceSideOverride: "L",
      portIndex: 1
    });
    expect(verticalState.wires.byId[asWireId("W-DOWN")]?.endpointB).toMatchObject({
      spliceSideOverride: "R",
      portIndex: 2
    });
  });

  it("mirrors vertical directional splice sides when sideInverted is set", () => {
    const invertedState = buildVerticalDirectionalState(true);

    expect(invertedState.wires.byId[asWireId("W-UP")]?.endpointB).toMatchObject({
      spliceSideOverride: "R",
      portIndex: 2
    });
    expect(invertedState.wires.byId[asWireId("W-DOWN")]?.endpointB).toMatchObject({
      spliceSideOverride: "L",
      portIndex: 1
    });
  });

  it("preserves a locked directional splice side on a vertical carrier instead of recomputing it", () => {
    const verticalState = buildVerticalDirectionalState(false);
    const downWire = verticalState.wires.byId[asWireId("W-DOWN")];
    if (downWire?.endpointB.kind !== "splicePort") {
      throw new Error("Expected a splice endpoint.");
    }

    // Geometry would resolve this downward wire to R, but a locked override wins.
    expect(
      resolveDirectionalSpliceEndpointSide(
        verticalState,
        { ...downWire.endpointB, spliceSideOverride: "L", spliceSideLocked: true },
        downWire.routeSegmentIds,
        "B"
      )
    ).toBe("L");
  });

  it("keeps horizontal carrier directional splice sides driven by the x axis", () => {
    const horizontalState = reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C-LEFT"), name: "Left", technicalId: "C-LEFT", cavityCount: 1 }),
      appActions.upsertConnector({ id: asConnectorId("C-RIGHT"), name: "Right", technicalId: "C-RIGHT", cavityCount: 1 }),
      appActions.upsertNode({ id: asNodeId("N-LEFT"), kind: "connector", connectorId: asConnectorId("C-LEFT") }),
      appActions.upsertNode({ id: asNodeId("N-RIGHT"), kind: "connector", connectorId: asConnectorId("C-RIGHT") }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-HORIZ"),
        nodeA: asNodeId("N-LEFT"),
        nodeB: asNodeId("N-RIGHT"),
        lengthMm: 200
      }),
      appActions.upsertSplice({
        id: asSpliceId("S-HORIZ"),
        name: "Horizontal splice",
        technicalId: "S-HORIZ",
        portCount: 2,
        portMode: "directional",
        placement: {
          kind: "segmentOffset",
          segmentId: asSegmentId("SEG-HORIZ"),
          fromNodeId: asNodeId("N-LEFT"),
          offsetMm: 100
        }
      }),
      appActions.setNodePositions({
        [asNodeId("N-LEFT")]: { x: 0, y: 100 },
        [asNodeId("N-RIGHT")]: { x: 200, y: 100 }
      }),
      appActions.saveWire({
        id: asWireId("W-LEFT"),
        name: "Left wire",
        technicalId: "W-LEFT",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-LEFT"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-HORIZ"), portIndex: 1 }
      }),
      appActions.saveWire({
        id: asWireId("W-RIGHT"),
        name: "Right wire",
        technicalId: "W-RIGHT",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-RIGHT"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-HORIZ"), portIndex: 1 }
      })
    ]);

    expect(horizontalState.wires.byId[asWireId("W-LEFT")]?.endpointB).toMatchObject({
      spliceSideOverride: "L",
      portIndex: 1
    });
    expect(horizontalState.wires.byId[asWireId("W-RIGHT")]?.endpointB).toMatchObject({
      spliceSideOverride: "R",
      portIndex: 2
    });
  });
});

describe("store reducer helpers - wire recompute report", () => {
  const buildDirectionalVerticalState = () =>
    reduceAll([
      appActions.upsertConnector({ id: asConnectorId("C-TOP"), name: "Top", technicalId: "C-TOP", cavityCount: 1 }),
      appActions.upsertConnector({ id: asConnectorId("C-BOT"), name: "Bottom", technicalId: "C-BOT", cavityCount: 1 }),
      appActions.upsertNode({ id: asNodeId("N-TOP"), kind: "connector", connectorId: asConnectorId("C-TOP") }),
      appActions.upsertNode({ id: asNodeId("N-BOT"), kind: "connector", connectorId: asConnectorId("C-BOT") }),
      appActions.upsertSegment({
        id: asSegmentId("SEG-VERT"),
        nodeA: asNodeId("N-TOP"),
        nodeB: asNodeId("N-BOT"),
        lengthMm: 200
      }),
      appActions.upsertSplice({
        id: asSpliceId("S-VERT"),
        name: "Vertical splice",
        technicalId: "S-VERT",
        portCount: 2,
        portMode: "directional",
        placement: {
          kind: "segmentOffset",
          segmentId: asSegmentId("SEG-VERT"),
          fromNodeId: asNodeId("N-TOP"),
          offsetMm: 100
        }
      }),
      appActions.setNodePositions({
        [asNodeId("N-TOP")]: { x: 100, y: 0 },
        [asNodeId("N-BOT")]: { x: 100, y: 200 }
      }),
      appActions.saveWire({
        id: asWireId("W-DOWN"),
        name: "Down wire",
        technicalId: "W-DOWN",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-BOT"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-VERT"), portIndex: 1 }
      })
    ]);

  it("reports no changes when the network is already consistent", () => {
    const state = buildDirectionalVerticalState();
    const result = buildWireRecomputeReport(state);
    if ("error" in result) {
      throw new Error(`Unexpected recompute error: ${result.error}`);
    }
    expect(result.report).toEqual([]);
  });

  it("reports and corrects a stale directional splice side", () => {
    const state = buildDirectionalVerticalState();
    const downWire = state.wires.byId[asWireId("W-DOWN")];
    if (downWire?.endpointB.kind !== "splicePort") {
      throw new Error("Expected a splice endpoint.");
    }
    // The clean state resolves this downward wire to R; corrupt the stored side
    // to L (as a stale workspace would have it) and confirm the recompute fixes it.
    const corruptedState = {
      ...state,
      wires: {
        ...state.wires,
        byId: {
          ...state.wires.byId,
          [asWireId("W-DOWN")]: {
            ...downWire,
            endpointB: { ...downWire.endpointB, spliceSideOverride: "L" as const, portIndex: 1 }
          }
        }
      }
    };

    const result = buildWireRecomputeReport(corruptedState);
    if ("error" in result) {
      throw new Error(`Unexpected recompute error: ${result.error}`);
    }

    expect(result.report).toHaveLength(1);
    const entry = result.report[0];
    expect(entry?.technicalId).toBe("W-DOWN");
    expect(entry?.kinds).toContain("sideB");
    expect(entry?.message).toContain("L -> R");

    const corrected = result.wires.byId[asWireId("W-DOWN")];
    expect(corrected?.endpointB).toMatchObject({ spliceSideOverride: "R", portIndex: 2 });
  });

  it("surfaces the report on ui.lastRecomputeReport via the recomputeAllWires action", () => {
    const state = buildDirectionalVerticalState();
    const after = appReducer(state, appActions.recomputeAllWires());
    // A consistent network reports zero changes but still records that the run happened.
    expect(after.ui.lastRecomputeReport).toEqual([]);
  });
});
