import type { NetworkNode, NodeId } from "../../core/entities";
import { NETWORK_GRID_STEP, snapToGrid } from "./app-utils-shared";
import type { NodePosition } from "../types/app-controller";

interface SvgCoordinatesOptions {
  networkViewWidth: number;
  networkViewHeight: number;
  networkOffset: NodePosition;
  networkScale: number;
  networkRenderScale: number;
  snapNodesToGrid: boolean;
}

export function getLocalSvgPoint(
  svgElement: SVGSVGElement,
  clientX: number,
  clientY: number,
  networkViewWidth: number,
  networkViewHeight: number
): NodePosition | null {
  const bounds = svgElement.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) {
    return null;
  }

  return {
    x: ((clientX - bounds.left) / bounds.width) * networkViewWidth,
    y: ((clientY - bounds.top) / bounds.height) * networkViewHeight
  };
}

export function getSvgCoordinates(
  svgElement: SVGSVGElement,
  clientX: number,
  clientY: number,
  options: SvgCoordinatesOptions
): NodePosition | null {
  const localPoint = getLocalSvgPoint(svgElement, clientX, clientY, options.networkViewWidth, options.networkViewHeight);
  if (localPoint === null) {
    return null;
  }

  const effectiveScale = options.networkScale * options.networkRenderScale;
  const modelX = (localPoint.x - options.networkOffset.x) / effectiveScale;
  const modelY = (localPoint.y - options.networkOffset.y) / effectiveScale;

  return {
    x: options.snapNodesToGrid ? snapToGrid(modelX, NETWORK_GRID_STEP) : modelX,
    y: options.snapNodesToGrid ? snapToGrid(modelY, NETWORK_GRID_STEP) : modelY
  };
}

export function applyGroupDragDelta(
  originPositions: Record<NodeId, NodePosition>,
  deltaX: number,
  deltaY: number,
  snapNodes: boolean
): Record<NodeId, NodePosition> {
  const nextPositions = {} as Record<NodeId, NodePosition>;
  for (const [nodeId, origin] of Object.entries(originPositions) as Array<[NodeId, NodePosition]>) {
    const nextX = origin.x + deltaX;
    const nextY = origin.y + deltaY;
    nextPositions[nodeId] = {
      x: snapNodes ? snapToGrid(nextX, NETWORK_GRID_STEP) : nextX,
      y: snapNodes ? snapToGrid(nextY, NETWORK_GRID_STEP) : nextY
    };
  }
  return nextPositions;
}

export function shouldFreezeRenderedLayoutPositions(
  nodes: NetworkNode[],
  persistedPositions: Record<NodeId, NodePosition>
): boolean {
  return nodes.every((node) => persistedPositions[node.id] === undefined);
}

export function buildRenderedLayoutPositionSnapshot(
  nodes: NetworkNode[],
  getPosition: (nodeId: NodeId) => NodePosition | null
): Record<NodeId, NodePosition> {
  const positions = {} as Record<NodeId, NodePosition>;
  for (const node of nodes) {
    const renderedPosition = getPosition(node.id);
    if (renderedPosition !== null) {
      positions[node.id] = renderedPosition;
    }
  }
  return positions;
}

interface DragStopGroupState {
  anchorNodeId: NodeId;
  nodeIds: NodeId[];
  layoutFreezePositions: Record<NodeId, NodePosition> | null;
  hasStartedDrag: boolean;
}

export interface DragStopPersistence {
  positions: Record<NodeId, NodePosition>;
  manualNodeIdsToClear: NodeId[];
}

export function buildDragStopPersistence(
  draggingNodeGroup: DragStopGroupState,
  manualNodePositions: Record<NodeId, NodePosition>
): DragStopPersistence | null {
  if (!draggingNodeGroup.hasStartedDrag) {
    return null;
  }

  const positions = { ...(draggingNodeGroup.layoutFreezePositions ?? {}) } as Record<NodeId, NodePosition>;
  const nodeIds = draggingNodeGroup.nodeIds.length > 1 ? draggingNodeGroup.nodeIds : [draggingNodeGroup.anchorNodeId];
  for (const nodeId of nodeIds) {
    const draggedPosition = manualNodePositions[nodeId];
    if (draggedPosition !== undefined) {
      positions[nodeId] = draggedPosition;
    }
  }

  return Object.keys(positions).length === 0 ? null : { positions, manualNodeIdsToClear: nodeIds };
}
