import type { Dispatch, MouseEvent as ReactMouseEvent, MutableRefObject, SetStateAction, WheelEvent as ReactWheelEvent } from "react";
import type { Connector, NetworkNode, NodeId, Segment, SegmentId, Splice } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { NETWORK_GRID_STEP, NETWORK_MAX_SCALE, NETWORK_MIN_SCALE, NETWORK_VIEW_HEIGHT, NETWORK_VIEW_WIDTH, clamp, snapToGrid } from "../lib/app-utils-shared";
import type { InteractionMode, NodePosition, SubScreenId } from "../types/app-controller";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseCanvasInteractionHandlersParams {
  state: ReturnType<AppStore["getState"]>;
  nodesCount: number;
  interactionMode: InteractionMode;
  isModelingScreen: boolean;
  activeSubScreen: SubScreenId;
  setActiveScreen: (screen: "networkScope" | "modeling" | "analysis" | "validation" | "settings") => void;
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
  resetNetworkViewToConfiguredScale: () => void;
  startConnectorEdit: (connector: Connector) => void;
  startSpliceEdit: (splice: Splice) => void;
  startNodeEdit: (node: NetworkNode) => void;
  startSegmentEdit: (segment: Segment) => void;
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
  resetNetworkViewToConfiguredScale,
  startConnectorEdit,
  startSpliceEdit,
  startNodeEdit,
  startSegmentEdit
}: UseCanvasInteractionHandlersParams) {
  function handleNetworkSegmentClick(segmentId: SegmentId): void {
    if (interactionMode !== "select") {
      return;
    }
    const segment = state.segments.byId[segmentId];
    if (segment === undefined) {
      return;
    }

    if (isModelingScreen && activeSubScreen === "segment") {
      startSegmentEdit(segment);
      return;
    }

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

    if (isModelingScreen) {
      if (activeSubScreen === "connector" && node.kind === "connector") {
        const connector = state.connectors.byId[node.connectorId];
        if (connector !== undefined) {
          startConnectorEdit(connector);
          return;
        }
      }

      if (activeSubScreen === "splice" && node.kind === "splice") {
        const splice = state.splices.byId[node.spliceId];
        if (splice !== undefined) {
          startSpliceEdit(splice);
          return;
        }
      }

      if (activeSubScreen === "node") {
        startNodeEdit(node);
        return;
      }
    }

    if (activeSubScreen === "connector" && node.kind === "connector") {
      dispatchAction(appActions.select({ kind: "connector", id: node.connectorId }));
      return;
    }

    if (activeSubScreen === "splice" && node.kind === "splice") {
      dispatchAction(appActions.select({ kind: "splice", id: node.spliceId }));
      return;
    }

    dispatchAction(appActions.select({ kind: "node", id: nodeId }));
  }

  function handleNetworkCanvasClick(event: ReactMouseEvent<SVGSVGElement>): void {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (interactionMode === "select") {
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
      x: ((clientX - bounds.left) / bounds.width) * NETWORK_VIEW_WIDTH,
      y: ((clientY - bounds.top) / bounds.height) * NETWORK_VIEW_HEIGHT
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
      x: clamp(snappedX, 20, NETWORK_VIEW_WIDTH - 20),
      y: clamp(snappedY, 20, NETWORK_VIEW_HEIGHT - 20)
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
    handleNetworkNodeActivate(nodeId);
    if (lockEntityMovement) {
      return;
    }
    setDraggingNodeId(nodeId);
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
    event.preventDefault();
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

    const viewCenterX = NETWORK_VIEW_WIDTH / 2;
    const viewCenterY = NETWORK_VIEW_HEIGHT / 2;
    const centerModelX = (viewCenterX - networkOffset.x) / networkScale;
    const centerModelY = (viewCenterY - networkOffset.y) / networkScale;

    setNetworkScale(nextScale);
    setNetworkOffset({
      x: viewCenterX - centerModelX * nextScale,
      y: viewCenterY - centerModelY * nextScale
    });
  }

  function handleNetworkMouseMove(event: ReactMouseEvent<SVGSVGElement>): void {
    if (draggingNodeId === null) {
      if (panStartRef.current === null) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) {
        return;
      }

      const deltaX = ((event.clientX - panStartRef.current.clientX) / bounds.width) * NETWORK_VIEW_WIDTH;
      const deltaY = ((event.clientY - panStartRef.current.clientY) / bounds.height) * NETWORK_VIEW_HEIGHT;
      setNetworkOffset({
        x: panStartRef.current.offsetX + deltaX,
        y: panStartRef.current.offsetY + deltaY
      });
      return;
    }

    const coordinates = getSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
    if (coordinates === null) {
      return;
    }

    setManualNodePositions((previous) => ({
      ...previous,
      [draggingNodeId]: coordinates
    }));
  }

  function stopNetworkNodeDrag(): void {
    if (draggingNodeId !== null) {
      const draggedPosition = manualNodePositions[draggingNodeId];
      if (draggedPosition !== undefined) {
        persistNodePosition(draggingNodeId, draggedPosition);
        setManualNodePositions((previous) => {
          if (previous[draggingNodeId] === undefined) {
            return previous;
          }

          const next = { ...previous };
          delete next[draggingNodeId];
          return next;
        });
      }

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
    stopNetworkNodeDrag
  };
}
