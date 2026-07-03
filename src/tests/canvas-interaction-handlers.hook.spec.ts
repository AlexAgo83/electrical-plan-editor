import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import { useCanvasInteractionHandlers } from "../app/hooks/useCanvasInteractionHandlers";
import type { NodePosition } from "../app/types/app-controller";
import type { UseCanvasInteractionHandlersParams } from "../app/types/canvas-interactions";
import { createInitialState } from "../store";

function createSvgEvent(svg: SVGSVGElement, clientX: number, clientY: number) {
  return {
    button: 0,
    clientX,
    clientY,
    target: svg,
    currentTarget: svg,
    preventDefault: vi.fn(),
    cancelable: true
  };
}

function useHarness(overrides: Partial<UseCanvasInteractionHandlersParams> = {}) {
  const panStartRef = useRef<UseCanvasInteractionHandlersParams["panStartRef"]["current"]>(null);
  return useCanvasInteractionHandlers({
    state: createInitialState(),
    nodes: [],
    nodesCount: 0,
    interactionMode: "select",
    isModelingScreen: true,
    isModelingAnalysisFocused: false,
    activeSubScreen: "node",
    setActiveScreen: vi.fn(),
    setActiveSubScreen: vi.fn(),
    setNodeFormMode: vi.fn(),
    setEditingNodeId: vi.fn(),
    setNodeKind: vi.fn(),
    setNodeIdInput: vi.fn(),
    setNodeConnectorId: vi.fn(),
    setNodeSpliceId: vi.fn(),
    setNodeLabel: vi.fn(),
    setNodeFormError: vi.fn(),
    setPendingNewNodePosition: vi.fn(),
    networkViewWidth: 100,
    networkViewHeight: 100,
    networkNodePositions: {},
    snapNodesToGrid: false,
    lockEntityMovement: false,
    networkOffset: { x: 0, y: 0 },
    networkScale: 1,
    networkRenderScale: 1,
    setNetworkScale: vi.fn(),
    setNetworkOffset: vi.fn(),
    draggingNodeId: null,
    setDraggingNodeId: vi.fn(),
    manualNodePositions: {},
    setManualNodePositions: vi.fn(),
    setIsPanningNetwork: vi.fn(),
    panStartRef,
    dispatchAction: vi.fn(),
    persistNodePositions: vi.fn(),
    resetNetworkViewToConfiguredScale: vi.fn(),
    startConnectorEdit: vi.fn(),
    startSpliceEdit: vi.fn(),
    startNodeEdit: vi.fn(),
    startSegmentEdit: vi.fn(),
    ...overrides
  });
}

describe("useCanvasInteractionHandlers", () => {
  let frameCallback: FrameRequestCallback | null = null;
  const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
    frameCallback = callback;
    return 1;
  });
  const cancelAnimationFrameMock = vi.fn();

  beforeEach(() => {
    frameCallback = null;
    requestAnimationFrameMock.mockClear();
    cancelAnimationFrameMock.mockClear();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(requestAnimationFrameMock);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(cancelAnimationFrameMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("coalesces pan moves to one canvas commit per animation frame", () => {
    const setNetworkOffset = vi.fn();
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.getBoundingClientRect = vi.fn(() => ({ width: 100, height: 100 }) as DOMRect);
    const { result } = renderHook(() => useHarness({ setNetworkOffset }));

    act(() => {
      result.current.handleNetworkCanvasMouseDown(createSvgEvent(svg, 10, 10) as never);
      result.current.handleNetworkMouseMove(createSvgEvent(svg, 20, 10) as never);
      result.current.handleNetworkMouseMove(createSvgEvent(svg, 30, 10) as never);
      result.current.handleNetworkMouseMove(createSvgEvent(svg, 40, 10) as never);
    });

    expect(requestAnimationFrameMock).toHaveBeenCalledTimes(1);
    expect(setNetworkOffset).not.toHaveBeenCalled();

    act(() => {
      frameCallback?.(0);
    });

    expect(setNetworkOffset).toHaveBeenCalledTimes(1);
    expect(setNetworkOffset).toHaveBeenCalledWith({ x: 30, y: 0 } satisfies NodePosition);
  });

  it("does not enter panning state for a plain canvas click", () => {
    const setIsPanningNetwork = vi.fn();
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const { result } = renderHook(() => useHarness({ setIsPanningNetwork }));

    act(() => {
      result.current.handleNetworkCanvasMouseDown(createSvgEvent(svg, 10, 10) as never);
      result.current.stopNetworkNodeDrag();
    });

    expect(setIsPanningNetwork).not.toHaveBeenCalled();
  });

  it("flushes the last pending pan position when stopping interaction", () => {
    const setNetworkOffset = vi.fn();
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.getBoundingClientRect = vi.fn(() => ({ width: 100, height: 100 }) as DOMRect);
    const { result } = renderHook(() => useHarness({ setNetworkOffset }));

    act(() => {
      result.current.handleNetworkCanvasMouseDown(createSvgEvent(svg, 5, 5) as never);
      result.current.handleNetworkMouseMove(createSvgEvent(svg, 25, 45) as never);
      result.current.stopNetworkNodeDrag();
    });

    expect(cancelAnimationFrameMock).toHaveBeenCalledWith(1);
    expect(setNetworkOffset).toHaveBeenCalledWith({ x: 20, y: 40 } satisfies NodePosition);
  });
});
