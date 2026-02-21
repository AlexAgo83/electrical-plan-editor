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
  recomputeAllWiresForNetwork
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
});
