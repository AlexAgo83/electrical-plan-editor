import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { NetworkNode, Segment } from "../core/entities";
import { createInitialState } from "../store";
import { useAppControllerLayoutDerivedState } from "../app/hooks/useAppControllerLayoutDerivedState";
import { asNodeId, asSegmentId } from "./helpers/store-reducer-test-utils";

vi.mock("../app/lib/app-utils-layout", () => ({
  createNodePositionMap: vi.fn(() => {
    throw new Error("createNodePositionMap should not run when persisted positions cover every node.");
  })
}));

describe("useAppControllerLayoutDerivedState", () => {
  it("skips generated layout work when persisted positions cover every node", () => {
    const nodeA = asNodeId("N-A");
    const nodeB = asNodeId("N-B");
    const nodes: NetworkNode[] = [
      { id: nodeA, kind: "intermediate", label: "A" },
      { id: nodeB, kind: "intermediate", label: "B" }
    ];
    const segments: Segment[] = [
      { id: asSegmentId("S-A-B"), nodeA, nodeB, lengthMm: 100 }
    ];
    const persistedPositions = {
      [nodeA]: { x: 120, y: 140 },
      [nodeB]: { x: 260, y: 220 }
    };
    const state = {
      ...createInitialState(),
      nodePositions: persistedPositions
    };

    const { result } = renderHook(() =>
      useAppControllerLayoutDerivedState({
        state,
        nodes,
        segments,
        snapNodesToGrid: true,
        manualNodePositions: {},
        selectedWireRouteSegmentIdsSource: undefined,
        routePreviewStartNodeId: "",
        routePreviewEndNodeId: "",
        routingGraphNodeIds: [],
        routingGraphEdgesByNodeId: {}
      })
    );

    expect(result.current.networkNodePositions).toEqual(persistedPositions);
  });
});
