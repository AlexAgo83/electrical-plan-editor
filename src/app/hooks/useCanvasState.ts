import { useState } from "react";
import type { NodeId } from "../../core/entities";
import type { InteractionMode, NodePosition } from "../types/app-controller";

export function useCanvasState() {
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("select");
  const [pendingNewNodePosition, setPendingNewNodePosition] = useState<NodePosition | null>(null);
  const [manualNodePositions, setManualNodePositions] = useState<Record<NodeId, NodePosition>>({} as Record<NodeId, NodePosition>);
  const [draggingNodeId, setDraggingNodeId] = useState<NodeId | null>(null);
  const [isPanningNetwork, setIsPanningNetwork] = useState(false);
  const [showNetworkGrid, setShowNetworkGrid] = useState(true);
  const [snapNodesToGrid, setSnapNodesToGrid] = useState(true);
  const [lockEntityMovement, setLockEntityMovement] = useState(false);
  const [networkScale, setNetworkScale] = useState(1);
  const [networkOffset, setNetworkOffset] = useState<NodePosition>({ x: 0, y: 0 });

  return {
    interactionMode,
    setInteractionMode,
    pendingNewNodePosition,
    setPendingNewNodePosition,
    manualNodePositions,
    setManualNodePositions,
    draggingNodeId,
    setDraggingNodeId,
    isPanningNetwork,
    setIsPanningNetwork,
    showNetworkGrid,
    setShowNetworkGrid,
    snapNodesToGrid,
    setSnapNodesToGrid,
    lockEntityMovement,
    setLockEntityMovement,
    networkScale,
    setNetworkScale,
    networkOffset,
    setNetworkOffset
  };
}
