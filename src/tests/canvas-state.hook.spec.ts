import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCanvasState } from "../app/hooks/useCanvasState";
import { asNodeId } from "./helpers/store-reducer-test-utils";

describe("useCanvasState", () => {
  it("exposes the expected default interaction and viewport state", () => {
    const { result } = renderHook(() => useCanvasState());

    expect(result.current.interactionMode).toBe("select");
    expect(result.current.pendingNewNodePosition).toBeNull();
    expect(result.current.manualNodePositions).toEqual({});
    expect(result.current.draggingNodeId).toBeNull();
    expect(result.current.isPanningNetwork).toBe(false);
    expect(result.current.showNetworkGrid).toBe(true);
    expect(result.current.snapNodesToGrid).toBe(true);
    expect(result.current.lockEntityMovement).toBe(false);
    expect(result.current.networkScale).toBe(1);
    expect(result.current.networkOffset).toEqual({ x: 0, y: 0 });
  });

  it("tracks representative manual position and viewport updates", () => {
    const { result } = renderHook(() => useCanvasState());

    act(() => {
      result.current.setInteractionMode("addNode");
      result.current.setPendingNewNodePosition({ x: 24, y: 48 });
      result.current.setManualNodePositions({
        [asNodeId("N-1")]: { x: 100, y: 150 }
      });
      result.current.setNetworkScale(1.5);
      result.current.setNetworkOffset({ x: -20, y: 35 });
    });

    expect(result.current.interactionMode).toBe("addNode");
    expect(result.current.pendingNewNodePosition).toEqual({ x: 24, y: 48 });
    expect(result.current.manualNodePositions).toEqual({
      [asNodeId("N-1")]: { x: 100, y: 150 }
    });
    expect(result.current.networkScale).toBe(1.5);
    expect(result.current.networkOffset).toEqual({ x: -20, y: 35 });
  });
});
