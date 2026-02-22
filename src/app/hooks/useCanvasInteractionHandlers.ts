import type { Dispatch, MouseEvent as ReactMouseEvent, MutableRefObject, SetStateAction, WheelEvent as ReactWheelEvent } from "react";
import type { Connector, NetworkNode, NodeId, Segment, SegmentId, Splice, WireEndpoint, WireId } from "../../core/entities";
import type { AppStore } from "../../store";
import { appActions } from "../../store";
import { NETWORK_GRID_STEP, NETWORK_MAX_SCALE, NETWORK_MIN_SCALE, NETWORK_VIEW_HEIGHT, NETWORK_VIEW_WIDTH, clamp, snapToGrid } from "../lib/app-utils-shared";
import type { NodePosition, SubScreenId } from "../types/app-controller";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

interface UseCanvasInteractionHandlersParams {
  state: ReturnType<AppStore["getState"]>;
  nodesCount: number;
  interactionMode: "select" | "addNode" | "addSegment" | "connect" | "route";
  modeAnchorNodeId: NodeId | null;
  setModeAnchorNodeId: (value: NodeId | null) => void;
  isModelingScreen: boolean;
  activeSubScreen: SubScreenId;
  setActiveScreen: (screen: "networkScope" | "modeling" | "analysis" | "validation" | "settings") => void;
  setActiveSubScreen: (screen: SubScreenId) => void;
  setSegmentFormMode: (mode: "create" | "edit") => void;
  setEditingSegmentId: (id: SegmentId | null) => void;
  setSegmentFormError: (value: string | null) => void;
  setSegmentNodeA: (value: string) => void;
  setSegmentNodeB: (value: string) => void;
  setRoutePreviewStartNodeId: (value: string) => void;
  routePreviewStartNodeId: string;
  setRoutePreviewEndNodeId: (value: string) => void;
  routePreviewEndNodeId: string;
  setWireFormMode: (mode: "create" | "edit") => void;
  setEditingWireId: (id: WireId | null) => void;
  setWireFormError: (value: string | null) => void;
  setWireEndpointAKind: (value: WireEndpoint["kind"]) => void;
  setWireEndpointAConnectorId: (value: string) => void;
  setWireEndpointASpliceId: (value: string) => void;
  setWireEndpointBKind: (value: WireEndpoint["kind"]) => void;
  setWireEndpointBConnectorId: (value: string) => void;
  setWireEndpointBSpliceId: (value: string) => void;
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
  modeAnchorNodeId,
  setModeAnchorNodeId,
  isModelingScreen,
  activeSubScreen,
  setActiveScreen,
  setActiveSubScreen,
  setSegmentFormMode,
  setEditingSegmentId,
  setSegmentFormError,
  setSegmentNodeA,
  setSegmentNodeB,
  setRoutePreviewStartNodeId,
  routePreviewStartNodeId,
  setRoutePreviewEndNodeId,
  routePreviewEndNodeId,
  setWireFormMode,
  setEditingWireId,
  setWireFormError,
  setWireEndpointAKind,
  setWireEndpointAConnectorId,
  setWireEndpointASpliceId,
  setWireEndpointBKind,
  setWireEndpointBConnectorId,
  setWireEndpointBSpliceId,
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
  function applyNodeToWireEndpoint(side: "A" | "B", node: NetworkNode): boolean {
    if (node.kind === "intermediate") {
      setWireFormError("Connect mode only supports connector/splice nodes as wire endpoints.");
      return false;
    }

    if (side === "A") {
      if (node.kind === "connector") {
        setWireEndpointAKind("connectorCavity");
        setWireEndpointAConnectorId(node.connectorId);
      } else {
        setWireEndpointAKind("splicePort");
        setWireEndpointASpliceId(node.spliceId);
      }
      return true;
    }

    if (node.kind === "connector") {
      setWireEndpointBKind("connectorCavity");
      setWireEndpointBConnectorId(node.connectorId);
    } else {
      setWireEndpointBKind("splicePort");
      setWireEndpointBSpliceId(node.spliceId);
    }
    return true;
  }

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

  function handleNetworkNodeClick(nodeId: NodeId): void {
    const node = state.nodes.byId[nodeId];
    if (node === undefined) {
      return;
    }

    if (interactionMode === "select") {
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
      return;
    }

    if (interactionMode === "addSegment") {
      setSegmentFormMode("create");
      setEditingSegmentId(null);
      setSegmentFormError(null);
      if (modeAnchorNodeId === null) {
        setModeAnchorNodeId(nodeId);
        setSegmentNodeA(nodeId);
        setSegmentNodeB("");
        return;
      }

      if (modeAnchorNodeId === nodeId) {
        setModeAnchorNodeId(null);
        setSegmentNodeB("");
        return;
      }

      setSegmentNodeA(modeAnchorNodeId);
      setSegmentNodeB(nodeId);
      setModeAnchorNodeId(null);
      return;
    }

    if (interactionMode === "route") {
      if (routePreviewStartNodeId.length === 0 || routePreviewEndNodeId.length > 0) {
        setRoutePreviewStartNodeId(nodeId);
        setRoutePreviewEndNodeId("");
      } else {
        setRoutePreviewEndNodeId(nodeId);
      }
      return;
    }

    if (interactionMode === "connect") {
      setWireFormMode("create");
      setEditingWireId(null);

      if (modeAnchorNodeId === null) {
        if (!applyNodeToWireEndpoint("A", node)) {
          return;
        }

        setWireFormError(null);
        setModeAnchorNodeId(nodeId);
        return;
      }

      if (modeAnchorNodeId === nodeId) {
        setWireFormError("Connect mode expects two distinct endpoint nodes.");
        return;
      }

      if (!applyNodeToWireEndpoint("B", node)) {
        return;
      }

      setModeAnchorNodeId(null);
      setWireFormError(null);
      return;
    }
  }

  function handleNetworkCanvasClick(event: ReactMouseEvent<SVGSVGElement>): void {
    if (interactionMode !== "addNode") {
      return;
    }

    if (event.target !== event.currentTarget) {
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
    event.preventDefault();
    setDraggingNodeId(nodeId);
    handleNetworkNodeClick(nodeId);
  }

  function handleNetworkCanvasMouseDown(event: ReactMouseEvent<SVGSVGElement>): void {
    if (!event.shiftKey) {
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

    setNetworkScale((current) => clamp(current * (target === "in" ? 1.12 : 0.88), NETWORK_MIN_SCALE, NETWORK_MAX_SCALE));
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
    handleNetworkNodeClick,
    handleNetworkCanvasClick,
    handleNetworkNodeMouseDown,
    handleNetworkCanvasMouseDown,
    handleNetworkWheel,
    handleZoomAction,
    handleNetworkMouseMove,
    stopNetworkNodeDrag
  };
}
