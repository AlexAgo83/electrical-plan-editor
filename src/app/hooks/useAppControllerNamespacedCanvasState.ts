import { useCanvasState } from "./useCanvasState";

export type AppControllerCanvasStateFlat = ReturnType<typeof useCanvasState>;

export function buildAppControllerNamespacedCanvasState(canvas: AppControllerCanvasStateFlat) {
  return {
    interaction: {
      interactionMode: canvas.interactionMode,
      setInteractionMode: canvas.setInteractionMode,
      modeAnchorNodeId: canvas.modeAnchorNodeId,
      setModeAnchorNodeId: canvas.setModeAnchorNodeId,
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

export function useAppControllerNamespacedCanvasState() {
  const canvas = useCanvasState();
  return buildAppControllerNamespacedCanvasState(canvas);
}

export type AppControllerNamespacedCanvasState = ReturnType<typeof useAppControllerNamespacedCanvasState>;
