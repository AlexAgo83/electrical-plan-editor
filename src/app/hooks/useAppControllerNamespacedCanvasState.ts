import { useCanvasState } from "./useCanvasState";

export type AppControllerCanvasStateFlat = ReturnType<typeof useCanvasState>;

// Adapts an existing canvas state object into namespaced groups; it does not allocate state.
export function buildAppControllerNamespacedCanvasState(canvas: AppControllerCanvasStateFlat) {
  return {
    interaction: {
      interactionMode: canvas.interactionMode,
      setInteractionMode: canvas.setInteractionMode,
      pendingNewNodePosition: canvas.pendingNewNodePosition,
      setPendingNewNodePosition: canvas.setPendingNewNodePosition
    },
    viewport: {
      manualNodePositions: canvas.manualNodePositions,
      setManualNodePositions: canvas.setManualNodePositions,
      draggingNodeId: canvas.draggingNodeId,
      setDraggingNodeId: canvas.setDraggingNodeId,
      isPanningNetwork: canvas.isPanningNetwork,
      setIsPanningNetwork: canvas.setIsPanningNetwork,
      showNetworkGrid: canvas.showNetworkGrid,
      setShowNetworkGrid: canvas.setShowNetworkGrid,
      snapNodesToGrid: canvas.snapNodesToGrid,
      setSnapNodesToGrid: canvas.setSnapNodesToGrid,
      networkScale: canvas.networkScale,
      setNetworkScale: canvas.setNetworkScale,
      networkOffset: canvas.networkOffset,
      setNetworkOffset: canvas.setNetworkOffset
    }
  } as const;
}
export type AppControllerNamespacedCanvasState = ReturnType<typeof buildAppControllerNamespacedCanvasState>;
