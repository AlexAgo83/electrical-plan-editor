import {
  useRef,
  useState,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type SetStateAction,
  type WheelEvent as ReactWheelEvent
} from "react";
import type { Connector, NetworkNode, NodeId, Segment, SegmentId, Splice } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { NETWORK_GRID_STEP, NETWORK_MAX_SCALE, NETWORK_MIN_SCALE, clamp, snapToGrid } from "../lib/app-utils-shared";
import type { InteractionMode, NodePosition, SubScreenId } from "../types/app-controller";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

const NODE_DRAG_START_THRESHOLD_PX = 4;

interface UseCanvasInteractionHandlersParams {
  state: ReturnType<AppStore["getState"]>;
  nodesCount: number;
  interactionMode: InteractionMode;
  isModelingScreen: boolean;
  activeSubScreen: SubScreenId;
  setActiveScreen: (screen: "home" | "networkScope" | "harnessAssembly" | "modeling" | "analysis" | "validation" | "settings") => void;
  setActiveSubScreen: (screen: SubScreenId) => void;
  setNodeFormMode: (mode: "create" | "edit") => void;
  setEditingNodeId: (id: NodeId | null) => void;
  setNodeKind: (kind: NetworkNode["kind"]) => void;
  setNodeIdInput: (value: string) => void;
  setNodeConnectorId: (value: string) => void;
  setNodeSpliceId: (value: string) => void;
  setNodeLabel: (value: string) => void;
  setNodeFormError: (value: string | null) => void;
  setPendingNewNodePosition: (value: NodePosition | null) => void;
  networkViewWidth: number;
  networkViewHeight: number;
  networkNodePositions: Record<NodeId, NodePosition>;
  snapNodesToGrid: boolean;
  lockEntityMovement: boolean;
  networkOffset: NodePosition;
  networkScale: number;
  setNetworkScale: Dispatch<SetStateAction<number>>;
  setNetworkOffset: Dispatch<SetStateAction<NodePosition>>;
  draggingNodeId: NodeId | null;
  setDraggingNodeId: (value: NodeId | null) => void;
  manualNodePositions: Record<NodeId, NodePosition>;
  setManualNodePositions: Dispatch<SetStateAction<Record<NodeId, NodePosition>>>;
  setIsPanningNetwork: (value: boolean) => void;
  panStartRef: MutableRefObject<
    | {
        clientX: number;
        clientY: number;
        offsetX: number;
        offsetY: number;
      }
    | null
  >;
  dispatchAction: DispatchAction;
  persistNodePosition: (nodeId: NodeId, position: NodePosition) => void;
  persistNodePositions: (positions: Record<NodeId, NodePosition>) => void;
  resetNetworkViewToConfiguredScale: () => void;
  startConnectorEdit: (connector: Connector) => void;
  startSpliceEdit: (splice: Splice) => void;
  startNodeEdit: (node: NetworkNode) => void;
  startSegmentEdit: (segment: Segment) => void;
  onExternalSelectionInteraction?: () => void;
}

export function useCanvasInteractionHandlers({
  state,
  nodesCount,
  interactionMode,
  isModelingScreen,
  activeSubScreen,
  setActiveScreen,
  setActiveSubScreen,
  setNodeFormMode,
  setEditingNodeId,
  setNodeKind,
  setNodeIdInput,
  setNodeConnectorId,
  setNodeSpliceId,
  setNodeLabel,
  setNodeFormError,
  setPendingNewNodePosition,
  networkViewWidth,
  networkViewHeight,
  networkNodePositions,
  snapNodesToGrid,
  lockEntityMovement,
  networkOffset,
  networkScale,
  setNetworkScale,
  setNetworkOffset,
  draggingNodeId,
  setDraggingNodeId,
  manualNodePositions,
  setManualNodePositions,
  setIsPanningNetwork,
  panStartRef,
  dispatchAction,
  persistNodePosition,
  persistNodePositions,
  resetNetworkViewToConfiguredScale,
  startConnectorEdit,
  startSpliceEdit,
  startNodeEdit,
  startSegmentEdit,
  onExternalSelectionInteraction
}: UseCanvasInteractionHandlersParams) {
  const [selectedCanvasNodeIds, setSelectedCanvasNodeIds] = useState<Set<NodeId>>(new Set());
  const draggingNodeGroupRef = useRef<{
    anchorNodeId: NodeId;
    anchorStartPosition: NodePosition;
    nodeIds: NodeId[];
    originPositions: Record<NodeId, NodePosition>;
    startClientX: number;
    startClientY: number;
    hasStartedDrag: boolean;
  } | null>(null);

  function clearSelectedCanvasNodes(): void {
    setSelectedCanvasNodeIds((previous) => (previous.size === 0 ? previous : new Set<NodeId>()));
  }

  function getStoredNodePosition(nodeId: NodeId): NodePosition | null {
    const position = manualNodePositions[nodeId] ?? networkNodePositions[nodeId] ?? state.nodePositions[nodeId];
    if (position === undefined) {
      return null;
    }

    return {
      x: position.x,
      y: position.y
    };
  }

  function applyGroupDragDelta(originPositions: Record<NodeId, NodePosition>, deltaX: number, deltaY: number) {
    const nextPositions = {} as Record<NodeId, NodePosition>;
    for (const [nodeId, origin] of Object.entries(originPositions) as Array<[NodeId, NodePosition]>) {
      const nextX = origin.x + deltaX;
      const nextY = origin.y + deltaY;
      nextPositions[nodeId] = {
        x: snapNodesToGrid ? snapToGrid(nextX, NETWORK_GRID_STEP) : nextX,
        y: snapNodesToGrid ? snapToGrid(nextY, NETWORK_GRID_STEP) : nextY
      };
    }
    return nextPositions;
  }

  function handleNetworkSegmentClick(segmentId: SegmentId): void {
    if (interactionMode !== "select") {
      return;
    }
    const segment = state.segments.byId[segmentId];
    if (segment === undefined) {
      return;
    }

    clearSelectedCanvasNodes();

    if (isModelingScreen && activeSubScreen === "segment") {
      onExternalSelectionInteraction?.();
      startSegmentEdit(segment);
      return;
    }

    onExternalSelectionInteraction?.();
    dispatchAction(appActions.select({ kind: "segment", id: segmentId }));
  }

  function handleNetworkNodeActivate(nodeId: NodeId): void {
    if (interactionMode !== "select") {
      return;
    }

    const node = state.nodes.byId[nodeId];
    if (node === undefined) {
      return;
    }

    clearSelectedCanvasNodes();

    if (isModelingScreen) {
      if (activeSubScreen === "connector" && node.kind === "connector") {
        const connector = state.connectors.byId[node.connectorId];
        if (connector !== undefined) {
          onExternalSelectionInteraction?.();
          startConnectorEdit(connector);
          return;
        }
      }

      if (activeSubScreen === "splice" && node.kind === "splice") {
        const splice = state.splices.byId[node.spliceId];
        if (splice !== undefined) {
          onExternalSelectionInteraction?.();
          startSpliceEdit(splice);
          return;
        }
      }

      if (activeSubScreen === "node") {
        onExternalSelectionInteraction?.();
        startNodeEdit(node);
        return;
      }
    }

    if (activeSubScreen === "connector" && node.kind === "connector") {
      onExternalSelectionInteraction?.();
      dispatchAction(appActions.select({ kind: "connector", id: node.connectorId }));
      return;
    }

    if (activeSubScreen === "splice" && node.kind === "splice") {
      onExternalSelectionInteraction?.();
      dispatchAction(appActions.select({ kind: "splice", id: node.spliceId }));
      return;
    }

    onExternalSelectionInteraction?.();
    dispatchAction(appActions.select({ kind: "node", id: nodeId }));
  }

  function handleNetworkCanvasClick(event: ReactMouseEvent<SVGSVGElement>): void {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (interactionMode === "select") {
      clearSelectedCanvasNodes();
      onExternalSelectionInteraction?.();
      dispatchAction(appActions.clearSelection(), { trackHistory: false });
      return;
    }

    if (interactionMode !== "addNode") {
      return;
    }

    const coordinates = getSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
    if (coordinates === null) {
      return;
    }

    setActiveScreen("modeling");
    setActiveSubScreen("node");
    setNodeFormMode("create");
    setEditingNodeId(null);
    setNodeKind("intermediate");
    setNodeIdInput("");
    setNodeConnectorId("");
    setNodeSpliceId("");
    setNodeLabel(`N-branch-${nodesCount + 1}`);
    setNodeFormError(null);
    setPendingNewNodePosition(coordinates);
  }

  function getLocalSvgPoint(svgElement: SVGSVGElement, clientX: number, clientY: number): NodePosition | null {
    const bounds = svgElement.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) {
      return null;
    }

    return {
      x: ((clientX - bounds.left) / bounds.width) * networkViewWidth,
      y: ((clientY - bounds.top) / bounds.height) * networkViewHeight
    };
  }

  function getSvgCoordinates(svgElement: SVGSVGElement, clientX: number, clientY: number): NodePosition | null {
    const localPoint = getLocalSvgPoint(svgElement, clientX, clientY);
    if (localPoint === null) {
      return null;
    }

    const localX = localPoint.x;
    const localY = localPoint.y;
    const modelX = (localX - networkOffset.x) / networkScale;
    const modelY = (localY - networkOffset.y) / networkScale;
    const snappedX = snapNodesToGrid ? snapToGrid(modelX, NETWORK_GRID_STEP) : modelX;
    const snappedY = snapNodesToGrid ? snapToGrid(modelY, NETWORK_GRID_STEP) : modelY;

    return {
      x: snappedX,
      y: snappedY
    };
  }

  function handleNetworkNodeMouseDown(event: ReactMouseEvent<SVGGElement>, nodeId: NodeId): void {
    if (interactionMode !== "select") {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();

    if (event.shiftKey) {
      onExternalSelectionInteraction?.();
      dispatchAction(appActions.clearSelection(), { trackHistory: false });
      setSelectedCanvasNodeIds((previous) => {
        const next = new Set(previous);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      });
      return;
    }

    const shouldPreserveCanvasSelection = selectedCanvasNodeIds.has(nodeId);
    if (!shouldPreserveCanvasSelection) {
      handleNetworkNodeActivate(nodeId);
    }
    if (lockEntityMovement) {
      return;
    }

    const selectedNodeIds = shouldPreserveCanvasSelection ? Array.from(selectedCanvasNodeIds) : [nodeId];
    const originPositions = {} as Record<NodeId, NodePosition>;
    for (const selectedNodeId of selectedNodeIds) {
      const position = getStoredNodePosition(selectedNodeId);
      if (position !== null) {
        originPositions[selectedNodeId] = position;
      }
    }

    const anchorStartPosition = originPositions[nodeId];
    if (anchorStartPosition === undefined) {
      return;
    }

    draggingNodeGroupRef.current = {
      anchorNodeId: nodeId,
      anchorStartPosition,
      nodeIds: selectedNodeIds,
      originPositions,
      startClientX: event.clientX,
      startClientY: event.clientY,
      hasStartedDrag: false
    };
  }

  function handleNetworkCanvasMouseDown(event: ReactMouseEvent<SVGSVGElement>): void {
    if (!event.shiftKey) {
      return;
    }
    if (event.button !== 0) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    panStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      offsetX: networkOffset.x,
      offsetY: networkOffset.y
    };
    setIsPanningNetwork(true);
  }

  function handleNetworkWheel(event: ReactWheelEvent<SVGSVGElement>): void {
    if (event.cancelable) {
      event.preventDefault();
    }
  }

  function handleZoomAction(target: "in" | "out" | "reset"): void {
    if (target === "reset") {
      resetNetworkViewToConfiguredScale();
      return;
    }

    const nextScale = clamp(networkScale * (target === "in" ? 1.12 : 0.88), NETWORK_MIN_SCALE, NETWORK_MAX_SCALE);
    if (nextScale === networkScale) {
      return;
    }

    const viewCenterX = networkViewWidth / 2;
    const viewCenterY = networkViewHeight / 2;
    const centerModelX = (viewCenterX - networkOffset.x) / networkScale;
    const centerModelY = (viewCenterY - networkOffset.y) / networkScale;

    setNetworkScale(nextScale);
    setNetworkOffset({
      x: viewCenterX - centerModelX * nextScale,
      y: viewCenterY - centerModelY * nextScale
    });
  }

  function handleNetworkMouseMove(event: ReactMouseEvent<SVGSVGElement>): void {
    const draggingNodeGroup = draggingNodeGroupRef.current;
    if (draggingNodeGroup !== null) {
      if (!draggingNodeGroup.hasStartedDrag) {
        const deltaClientX = event.clientX - draggingNodeGroup.startClientX;
        const deltaClientY = event.clientY - draggingNodeGroup.startClientY;
        if (Math.hypot(deltaClientX, deltaClientY) < NODE_DRAG_START_THRESHOLD_PX) {
          return;
        }

        draggingNodeGroup.hasStartedDrag = true;
        setDraggingNodeId(draggingNodeGroup.anchorNodeId);
      }

      const coordinates = getSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
      if (coordinates === null) {
        return;
      }

      const deltaX = coordinates.x - draggingNodeGroup.anchorStartPosition.x;
      const deltaY = coordinates.y - draggingNodeGroup.anchorStartPosition.y;
      const nextPositions = applyGroupDragDelta(draggingNodeGroup.originPositions, deltaX, deltaY);
      setManualNodePositions((previous) => {
        let changed = false;
        for (const [nodeId, nextPosition] of Object.entries(nextPositions) as Array<[NodeId, NodePosition]>) {
          const previousPosition = previous[nodeId];
          if (
            previousPosition === undefined ||
            Math.abs(previousPosition.x - nextPosition.x) > 0.0001 ||
            Math.abs(previousPosition.y - nextPosition.y) > 0.0001
          ) {
            changed = true;
            break;
          }
        }

        if (!changed) {
          return previous;
        }

        return {
          ...previous,
          ...nextPositions
        };
      });
      return;
    }

    if (draggingNodeId === null) {
      if (panStartRef.current === null) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) {
        return;
      }

      const deltaX = ((event.clientX - panStartRef.current.clientX) / bounds.width) * networkViewWidth;
      const deltaY = ((event.clientY - panStartRef.current.clientY) / bounds.height) * networkViewHeight;
      const nextOffsetX = panStartRef.current.offsetX + deltaX;
      const nextOffsetY = panStartRef.current.offsetY + deltaY;
      setNetworkOffset((current) => {
        if (Math.abs(current.x - nextOffsetX) <= 0.0001 && Math.abs(current.y - nextOffsetY) <= 0.0001) {
          return current;
        }
        return {
          x: nextOffsetX,
          y: nextOffsetY
        };
      });
      return;
    }

    const coordinates = getSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
    if (coordinates === null) {
      return;
    }
    setManualNodePositions((previous) => {
      const previousPosition = previous[draggingNodeId];
      if (
        previousPosition !== undefined &&
        Math.abs(previousPosition.x - coordinates.x) <= 0.0001 &&
        Math.abs(previousPosition.y - coordinates.y) <= 0.0001
      ) {
        return previous;
      }
      return {
        ...previous,
        [draggingNodeId]: coordinates
      };
    });
  }

  function stopNetworkNodeDrag(): void {
    const draggingNodeGroup = draggingNodeGroupRef.current;
    if (draggingNodeGroup !== null) {
      if (draggingNodeGroup.hasStartedDrag && draggingNodeGroup.nodeIds.length > 1) {
        const nextPersistedPositions = {} as Record<NodeId, NodePosition>;
        for (const nodeId of draggingNodeGroup.nodeIds) {
          const draggedPosition = manualNodePositions[nodeId];
          if (draggedPosition !== undefined) {
            nextPersistedPositions[nodeId] = draggedPosition;
          }
        }

        if (Object.keys(nextPersistedPositions).length > 0) {
          persistNodePositions(nextPersistedPositions);
          setManualNodePositions((previous) => {
            let changed = false;
            const next = { ...previous };
            for (const nodeId of Object.keys(nextPersistedPositions) as NodeId[]) {
              if (next[nodeId] !== undefined) {
                delete next[nodeId];
                changed = true;
              }
            }
            return changed ? next : previous;
          });
        }
      } else if (draggingNodeGroup.hasStartedDrag) {
        const draggedPosition = manualNodePositions[draggingNodeGroup.anchorNodeId];
        if (draggedPosition !== undefined) {
          persistNodePosition(draggingNodeGroup.anchorNodeId, draggedPosition);
          setManualNodePositions((previous) => {
            if (previous[draggingNodeGroup.anchorNodeId] === undefined) {
              return previous;
            }

            const next = { ...previous };
            delete next[draggingNodeGroup.anchorNodeId];
            return next;
          });
        }
      }

      draggingNodeGroupRef.current = null;
      setDraggingNodeId(null);
    } else if (draggingNodeId !== null) {
      setDraggingNodeId(null);
    }

    if (panStartRef.current !== null) {
      panStartRef.current = null;
      setIsPanningNetwork(false);
    }
  }

  return {
    handleNetworkSegmentClick,
    handleNetworkNodeActivate,
    handleNetworkCanvasClick,
    handleNetworkNodeMouseDown,
    handleNetworkCanvasMouseDown,
    handleNetworkWheel,
    handleZoomAction,
    handleNetworkMouseMove,
    stopNetworkNodeDrag,
    selectedCanvasNodeIds,
    clearSelectedCanvasNodes
  };
}
