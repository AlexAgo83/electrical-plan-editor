import { describe, expect, it } from "vitest";
import { appActions, appReducer } from "../store";
import { findSplicePlacementSuggestion } from "../store/splicePlacementOptimizer";
import {
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId,
  reduceAll
} from "./helpers/store-reducer-test-utils";

function buildOptimizableSpliceState() {
  return reduceAll([
    appActions.upsertConnector({ id: asConnectorId("C-L"), name: "Left", technicalId: "C-L", cavityCount: 1 }),
    appActions.upsertConnector({ id: asConnectorId("C-R"), name: "Right", technicalId: "C-R", cavityCount: 1 }),
    appActions.upsertSplice({
      id: asSpliceId("S-OPT"),
      name: "Optimized splice",
      technicalId: "S-OPT",
      portMode: "directional",
      portCount: 2
    }),
    appActions.upsertNode({ id: asNodeId("N-L"), kind: "connector", connectorId: asConnectorId("C-L") }),
    appActions.upsertNode({ id: asNodeId("N-R"), kind: "connector", connectorId: asConnectorId("C-R") }),
    appActions.upsertNode({ id: asNodeId("N-S"), kind: "splice", spliceId: asSpliceId("S-OPT") }),
    appActions.setNodePosition(asNodeId("N-L"), { x: 0, y: 0 }),
    appActions.setNodePosition(asNodeId("N-R"), { x: 100, y: 0 }),
    appActions.setNodePosition(asNodeId("N-S"), { x: 80, y: 0 }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-L"),
      nodeA: asNodeId("N-L"),
      nodeB: asNodeId("N-S"),
      lengthMm: 80
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-R"),
      nodeA: asNodeId("N-S"),
      nodeB: asNodeId("N-R"),
      lengthMm: 20
    }),
    appActions.saveWire({
      id: asWireId("W-L"),
      name: "Left heavy wire",
      technicalId: "W-L",
      sectionMm2: 4,
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-L"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-OPT"), portIndex: 1 }
    }),
    appActions.saveWire({
      id: asWireId("W-R"),
      name: "Right light wire",
      technicalId: "W-R",
      sectionMm2: 1,
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-R"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S-OPT"), portIndex: 2 }
    })
  ]);
}

describe("splice placement optimizer", () => {
  it("suggests a lower copper placement for a directional splice on two adjacent segments", () => {
    const state = buildOptimizableSpliceState();
    const result = findSplicePlacementSuggestion(state, asSpliceId("S-OPT"));

    expect("suggestion" in result).toBe(true);
    if (!("suggestion" in result)) {
      throw new Error(result.reason);
    }

    expect(result.suggestion.current.copperVolumeMm3).toBe(340);
    expect(result.suggestion.suggested.copperVolumeMm3).toBeLessThan(result.suggestion.current.copperVolumeMm3);
    expect(result.suggestion.copperVolumeDeltaPercent).toBeLessThan(-1);
    expect(result.suggestion.segmentLengths[asSegmentId("SEG-L")]).toBeLessThan(80);
    expect(result.suggestion.segmentLengths[asSegmentId("SEG-R")]).toBeGreaterThan(20);
  });

  it("applies the optimized placement as one reducer action with segment lengths and rerouted wires", () => {
    const state = buildOptimizableSpliceState();
    const result = findSplicePlacementSuggestion(state, asSpliceId("S-OPT"));
    if (!("suggestion" in result)) {
      throw new Error(result.reason);
    }

    const next = appReducer(
      state,
      appActions.applyOptimizedSplicePlacement(
        result.suggestion.spliceId,
        result.suggestion.spliceNodeId,
        result.suggestion.position,
        result.suggestion.segmentLengths
      )
    );

    expect(next.meta.revision).toBe(state.meta.revision + 1);
    expect(next.nodePositions[asNodeId("N-S")]).toEqual(result.suggestion.position);
    expect(next.segments.byId[asSegmentId("SEG-L")]?.lengthMm).toBe(result.suggestion.segmentLengths[asSegmentId("SEG-L")]);
    expect(next.segments.byId[asSegmentId("SEG-R")]?.lengthMm).toBe(result.suggestion.segmentLengths[asSegmentId("SEG-R")]);
    expect(next.wires.byId[asWireId("W-L")]?.lengthMm).toBe(result.suggestion.segmentLengths[asSegmentId("SEG-L")]);
    expect(next.wires.byId[asWireId("W-R")]?.lengthMm).toBe(result.suggestion.segmentLengths[asSegmentId("SEG-R")]);
  });
});
