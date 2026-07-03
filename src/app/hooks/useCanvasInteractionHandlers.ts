import { useRef, useState, type MouseEvent as ReactMouseEvent, type WheelEvent as ReactWheelEvent } from "react";
import { unstable_batchedUpdates } from "react-dom";
import type { NodeId, SegmentId } from "../../core/entities";
import { appActions } from "../../store";
import { NETWORK_MAX_SCALE, NETWORK_MIN_SCALE, clamp } from "../lib/app-utils-shared";
import {
  applyGroupDragDelta,
  buildDragStopPersistence,
  buildRenderedLayoutPositionSnapshot,
  getSvgCoordinates,
  shouldFreezeRenderedLayoutPositions
} from "../lib/canvasInteractionGeometry";
import type { NodePosition } from "../types/app-controller";
import type { DraggingNodeGroupState, UseCanvasInteractionHandlersParams } from "../types/canvas-interactions";
import { useCanvasFrameScheduler } from "./useCanvasFrameScheduler";

const NODE_DRAG_START_THRESHOLD_PX = 4;
const PAN_CLICK_SUPPRESSION_THRESHOLD_PX = 4;

export function useCanvasInteractionHandlers({
  state,
  nodes,
  nodesCount,
  interactionMode,
  isModelingScreen,
  isModelingAnalysisFocused,
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
  networkRenderScale,
  setNetworkScale,
  setNetworkOffset,
  draggingNodeId,
  setDraggingNodeId,
  manualNodePositions,
  setManualNodePositions,
  setIsPanningNetwork,
  panStartRef,
  dispatchAction,
  persistNodePositions,
  resetNetworkViewToConfiguredScale,
  startConnectorEdit,
  startSpliceEdit,
  startNodeEdit,
  startSegmentEdit,
  onExternalSelectionInteraction
}: UseCanvasInteractionHandlersParams) {
  const [selectedCanvasNodeIds, setSelectedCanvasNodeIds] = useState<Set<NodeId>>(new Set());
  const draggingNodeGroupRef = useRef<DraggingNodeGroupState | null>(null);
  const isPanningNetworkActiveRef = useRef(false);
  const shouldSuppressNextCanvasClickRef = useRef(false);
  const { flushPendingCanvasFrame, latestManualNodePositionsRef, scheduleManualNodePositionsUpdate, scheduleNetworkOffsetUpdate } =
    useCanvasFrameScheduler({ manualNodePositions, networkOffset, setManualNodePositions, setNetworkOffset });

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

  function handleNetworkSegmentClick(segmentId: SegmentId): void {
    if (interactionMode !== "select") {
      return;
    }
    const segment = state.segments.byId[segmentId];
    if (segment === undefined) {
      return;
    }

    unstable_batchedUpdates(() => {
      clearSelectedCanvasNodes();

      if (isModelingScreen && !isModelingAnalysisFocused) {
        onExternalSelectionInteraction?.();
        setActiveSubScreen("segment");
        startSegmentEdit(segment);
        return;
      }

      onExternalSelectionInteraction?.();
      setActiveSubScreen("segment");
      dispatchAction(appActions.select({ kind: "segment", id: segmentId }));
    });
  }

  function handleNetworkNodeActivate(nodeId: NodeId): void {
    if (interactionMode !== "select") {
      return;
    }

    const node = state.nodes.byId[nodeId];
    if (node === undefined) {
      return;
    }

    unstable_batchedUpdates(() => {
      clearSelectedCanvasNodes();

      if (isModelingScreen && !isModelingAnalysisFocused) {
        if (node.kind === "connector" || node.kind === "connectorBackshellHelper") {
          const connector = state.connectors.byId[node.connectorId];
          if (connector !== undefined) {
            onExternalSelectionInteraction?.();
            setActiveSubScreen("connector");
            startConnectorEdit(connector);
            return;
          }
        }

        if (node.kind === "splice") {
          const splice = state.splices.byId[node.spliceId];
          if (splice !== undefined) {
            onExternalSelectionInteraction?.();
            setActiveSubScreen("splice");
            startSpliceEdit(splice);
            return;
          }
        }

        if (node.kind === "intermediate") {
          onExternalSelectionInteraction?.();
          setActiveSubScreen("node");
          startNodeEdit(node);
          return;
        }

        onExternalSelectionInteraction?.();
        if (node.kind === "connector" || node.kind === "connectorBackshellHelper") {
          setActiveSubScreen("connector");
        } else if (node.kind === "splice") {
          setActiveSubScreen("splice");
        } else {
          setActiveSubScreen("node");
        }
        dispatchAction(appActions.select({ kind: "node", id: nodeId }));
        return;
      }

      if (node.kind === "connector" || node.kind === "connectorBackshellHelper") {
        onExternalSelectionInteraction?.();
        setActiveSubScreen("connector");
        dispatchAction(appActions.select({ kind: "connector", id: node.connectorId }));
        return;
      }

      if (node.kind === "splice") {
        onExternalSelectionInteraction?.();
        setActiveSubScreen("splice");
        dispatchAction(appActions.select({ kind: "splice", id: node.spliceId }));
        return;
      }

      setActiveSubScreen("node");
      onExternalSelectionInteraction?.();
      dispatchAction(appActions.select({ kind: "node", id: nodeId }));
    });
  }

  function handleNetworkCanvasClick(event: ReactMouseEvent<SVGSVGElement>): void {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (shouldSuppressNextCanvasClickRef.current) {
      shouldSuppressNextCanvasClickRef.current = false;
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

    const coordinates = getCanvasSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
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

  function getCanvasSvgCoordinates(svgElement: SVGSVGElement, clientX: number, clientY: number): NodePosition | null {
    return getSvgCoordinates(svgElement, clientX, clientY, {
      networkViewWidth,
      networkViewHeight,
      networkOffset,
      networkScale,
      networkRenderScale,
      snapNodesToGrid
    });
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
    const layoutFreezePositions =
      shouldFreezeRenderedLayoutPositions(nodes, state.nodePositions)
        ? buildRenderedLayoutPositionSnapshot(nodes, getStoredNodePosition)
        : null;

    draggingNodeGroupRef.current = {
      anchorNodeId: nodeId,
      anchorStartPosition,
      nodeIds: selectedNodeIds,
      originPositions,
      layoutFreezePositions,
      startClientX: event.clientX,
      startClientY: event.clientY,
      hasStartedDrag: false
    };
  }

  function handleNetworkCanvasMouseDown(event: ReactMouseEvent<SVGSVGElement>): void {
    if (event.button !== 0) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    shouldSuppressNextCanvasClickRef.current = false;
    isPanningNetworkActiveRef.current = false;
    panStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      offsetX: networkOffset.x,
      offsetY: networkOffset.y
    };
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
    const centerModelX = (viewCenterX - networkOffset.x) / (networkScale * networkRenderScale);
    const centerModelY = (viewCenterY - networkOffset.y) / (networkScale * networkRenderScale);
    const nextEffectiveScale = nextScale * networkRenderScale;

    setNetworkScale(nextScale);
    setNetworkOffset({
      x: viewCenterX - centerModelX * nextEffectiveScale,
      y: viewCenterY - centerModelY * nextEffectiveScale
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

      const coordinates = getCanvasSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
      if (coordinates === null) {
        return;
      }

      const deltaX = coordinates.x - draggingNodeGroup.anchorStartPosition.x;
      const deltaY = coordinates.y - draggingNodeGroup.anchorStartPosition.y;
      const nextPositions = applyGroupDragDelta(draggingNodeGroup.originPositions, deltaX, deltaY, snapNodesToGrid);
      scheduleManualNodePositionsUpdate((previous) => {
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
      if (
        Math.hypot(event.clientX - panStartRef.current.clientX, event.clientY - panStartRef.current.clientY) >=
        PAN_CLICK_SUPPRESSION_THRESHOLD_PX
      ) {
        shouldSuppressNextCanvasClickRef.current = true;
        if (!isPanningNetworkActiveRef.current) {
          isPanningNetworkActiveRef.current = true;
          setIsPanningNetwork(true);
        }
      }
      const nextOffsetX = panStartRef.current.offsetX + deltaX;
      const nextOffsetY = panStartRef.current.offsetY + deltaY;
      scheduleNetworkOffsetUpdate((current) => {
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

    const coordinates = getCanvasSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
    if (coordinates === null) {
      return;
    }
    scheduleManualNodePositionsUpdate((previous) => {
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
    flushPendingCanvasFrame();
    const draggingNodeGroup = draggingNodeGroupRef.current;
    if (draggingNodeGroup !== null) {
      const persistence = buildDragStopPersistence(draggingNodeGroup, latestManualNodePositionsRef.current);
      if (persistence !== null) {
        persistNodePositions(persistence.positions);
        setManualNodePositions((previous) => {
          const next = { ...previous };
          let changed = false;
          for (const nodeId of persistence.manualNodeIdsToClear) {
            if (next[nodeId] !== undefined) {
              delete next[nodeId];
              changed = true;
            }
          }
          return changed ? next : previous;
        });
      }

      draggingNodeGroupRef.current = null;
      setDraggingNodeId(null);
    } else if (draggingNodeId !== null) {
      setDraggingNodeId(null);
    }

    if (panStartRef.current !== null) {
      panStartRef.current = null;
      if (isPanningNetworkActiveRef.current) {
        isPanningNetworkActiveRef.current = false;
        setIsPanningNetwork(false);
      }
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
