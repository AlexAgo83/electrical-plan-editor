import { describe, expect, it } from "vitest";
import type { NodeId, SegmentId } from "../core/entities";
import { appActions, appReducer, createInitialState } from "../store";
import { selectRoutingGraphIndex } from "../store/selectors";

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

describe("selectRoutingGraphIndex", () => {
  it("returns the same graph reference when only unrelated ui state changes", () => {
    let state = createInitialState();
    state = appReducer(
      appReducer(
        appReducer(state, appActions.upsertNode({ id: asNodeId("N1"), kind: "intermediate", label: "N1" })),
        appActions.upsertNode({ id: asNodeId("N2"), kind: "intermediate", label: "N2" })
      ),
      appActions.upsertSegment({
        id: asSegmentId("S1"),
        nodeA: asNodeId("N1"),
        nodeB: asNodeId("N2"),
        lengthMm: 100
      })
    );

    const firstGraph = selectRoutingGraphIndex(state);
    const secondGraph = selectRoutingGraphIndex(state);
    expect(secondGraph).toBe(firstGraph);

    const withThemeChange = appReducer(state, appActions.setThemeMode("olive"));
    const graphAfterThemeChange = selectRoutingGraphIndex(withThemeChange);
    expect(graphAfterThemeChange).toBe(firstGraph);
  });

  it("rebuilds the graph when routing entities change", () => {
    let state = createInitialState();
    state = appReducer(
      appReducer(
        appReducer(state, appActions.upsertNode({ id: asNodeId("N1"), kind: "intermediate", label: "N1" })),
        appActions.upsertNode({ id: asNodeId("N2"), kind: "intermediate", label: "N2" })
      ),
      appActions.upsertSegment({
        id: asSegmentId("S1"),
        nodeA: asNodeId("N1"),
        nodeB: asNodeId("N2"),
        lengthMm: 100
      })
    );

    const firstGraph = selectRoutingGraphIndex(state);

    const withAdditionalNode = appReducer(
      state,
      appActions.upsertNode({ id: asNodeId("N3"), kind: "intermediate", label: "N3" })
    );

    const nextGraph = selectRoutingGraphIndex(withAdditionalNode);
    expect(nextGraph).not.toBe(firstGraph);
    expect(nextGraph.nodeIds).toEqual([asNodeId("N1"), asNodeId("N2"), asNodeId("N3")]);
  });
});
