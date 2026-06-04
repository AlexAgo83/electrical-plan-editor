import { useMemo } from "react";
import type { NetworkNode, NodeId, Segment, SegmentId } from "../../core/entities";
import {
  selectNodePositions,
  selectShortestRouteBetweenNodes,
  type AppState
} from "../../store";
import { NETWORK_GRID_STEP } from "../lib/app-utils-shared";
import { createNodePositionMap } from "../lib/app-utils-layout";
import type { NodePosition } from "../types/app-controller";

interface UseAppControllerLayoutDerivedStateParams {
  state: AppState;
  nodes: NetworkNode[];
  segments: Segment[];
  snapNodesToGrid: boolean;
  manualNodePositions: Record<NodeId, NodePosition>;
  selectedWireRouteSegmentIdsSource: readonly SegmentId[] | undefined;
  routePreviewStartNodeId: string;
  routePreviewEndNodeId: string;
  routingGraphNodeIds: NodeId[];
  routingGraphEdgesByNodeId: Record<NodeId, ReadonlyArray<unknown> | undefined>;
}

function snapPosition(value: number, enabled: boolean): number {
  return enabled ? Math.round(value / NETWORK_GRID_STEP) * NETWORK_GRID_STEP : value;
}

function findAvailableFallbackPosition(
  basePosition: NodePosition,
  occupiedPositions: Record<NodeId, NodePosition>,
  snapToGrid: boolean
): NodePosition {
  const offsetSteps = [
    { x: 0, y: 0 },
    { x: NETWORK_GRID_STEP, y: 0 },
    { x: 0, y: NETWORK_GRID_STEP },
    { x: -NETWORK_GRID_STEP, y: 0 },
    { x: 0, y: -NETWORK_GRID_STEP },
    { x: NETWORK_GRID_STEP, y: NETWORK_GRID_STEP },
    { x: -NETWORK_GRID_STEP, y: NETWORK_GRID_STEP },
    { x: NETWORK_GRID_STEP, y: -NETWORK_GRID_STEP },
    { x: -NETWORK_GRID_STEP, y: -NETWORK_GRID_STEP }
  ];

  for (const offset of offsetSteps) {
    const candidate = {
      x: snapPosition(basePosition.x + offset.x, snapToGrid),
      y: snapPosition(basePosition.y + offset.y, snapToGrid)
    };
    const isOccupied = Object.values(occupiedPositions).some(
      (position) => Math.abs(position.x - candidate.x) <= 0.0001 && Math.abs(position.y - candidate.y) <= 0.0001
    );
    if (!isOccupied) {
      return candidate;
    }
  }

  return {
    x: snapPosition(basePosition.x + NETWORK_GRID_STEP * 2, snapToGrid),
    y: snapPosition(basePosition.y + NETWORK_GRID_STEP * 2, snapToGrid)
  };
}

export function buildMissingNodePositionMap(
  nodes: NetworkNode[],
  segments: Segment[],
  positionedNodePositions: Record<NodeId, NodePosition>,
  snapToGrid: boolean
): Record<NodeId, NodePosition> {
  const missingNodeIds = nodes
    .map((node) => node.id)
    .filter((nodeId) => positionedNodePositions[nodeId] === undefined);
  if (missingNodeIds.length === 0) {
    return {};
  }

  const generatedPositions = {} as Record<NodeId, NodePosition>;
  const occupiedPositions = { ...positionedNodePositions };
  for (const nodeId of missingNodeIds) {
    const connectedPositions = segments.flatMap((segment) => {
      if (segment.nodeA === nodeId) {
        const position = occupiedPositions[segment.nodeB];
        return position === undefined ? [] : [position];
      }
      if (segment.nodeB === nodeId) {
        const position = occupiedPositions[segment.nodeA];
        return position === undefined ? [] : [position];
      }
      return [];
    });
    const basePosition =
      connectedPositions.length > 0
        ? {
            x: connectedPositions.reduce((sum, position) => sum + position.x, 0) / connectedPositions.length + NETWORK_GRID_STEP,
            y: connectedPositions.reduce((sum, position) => sum + position.y, 0) / connectedPositions.length + NETWORK_GRID_STEP
          }
        : {
            x: NETWORK_GRID_STEP * (Object.keys(occupiedPositions).length + 1),
            y: NETWORK_GRID_STEP
          };
    const fallbackPosition = findAvailableFallbackPosition(basePosition, occupiedPositions, snapToGrid);
    generatedPositions[nodeId] = fallbackPosition;
    occupiedPositions[nodeId] = fallbackPosition;
  }

  return generatedPositions;
}

export function useAppControllerLayoutDerivedState({
  state,
  nodes,
  segments,
  snapNodesToGrid,
  manualNodePositions,
  selectedWireRouteSegmentIdsSource,
  routePreviewStartNodeId,
  routePreviewEndNodeId,
  routingGraphNodeIds,
  routingGraphEdgesByNodeId
}: UseAppControllerLayoutDerivedStateParams) {
  const totalEdgeEntries = routingGraphNodeIds.reduce(
    (sum, nodeId) => sum + (routingGraphEdgesByNodeId[nodeId]?.length ?? 0),
    0
  );

  const routePreview = useMemo(() => {
    if (routePreviewStartNodeId.length === 0 || routePreviewEndNodeId.length === 0) {
      return null;
    }

    return selectShortestRouteBetweenNodes(
      state,
      routePreviewStartNodeId as NodeId,
      routePreviewEndNodeId as NodeId
    );
  }, [state, routePreviewStartNodeId, routePreviewEndNodeId]);

  const selectedWireRouteSegmentIds = useMemo(
    () => new Set(selectedWireRouteSegmentIdsSource ?? []),
    [selectedWireRouteSegmentIdsSource]
  );

  const persistedNodePositions = selectNodePositions(state);
  const autoNodePositions = useMemo(
    () => {
      if (nodes.length === 0 || nodes.every((node) => persistedNodePositions[node.id] !== undefined)) {
        return {};
      }

      if (Object.keys(persistedNodePositions).length > 0) {
        return buildMissingNodePositionMap(nodes, segments, persistedNodePositions, snapNodesToGrid);
      }

      return createNodePositionMap(nodes, segments, {
        snapToGrid: snapNodesToGrid,
        gridStep: NETWORK_GRID_STEP
      });
    },
    [nodes, persistedNodePositions, segments, snapNodesToGrid]
  );

  const networkNodePositions = useMemo(() => {
    const merged = { ...autoNodePositions };
    for (const node of nodes) {
      const persistedPosition = persistedNodePositions[node.id];
      if (persistedPosition !== undefined) {
        merged[node.id] = persistedPosition;
      }

      const manualPosition = manualNodePositions[node.id];
      if (manualPosition !== undefined) {
        merged[node.id] = manualPosition;
      }
    }
    return merged;
  }, [autoNodePositions, manualNodePositions, nodes, persistedNodePositions]);

  return {
    totalEdgeEntries,
    routePreview,
    selectedWireRouteSegmentIds,
    persistedNodePositions,
    networkNodePositions
  };
}

export type AppControllerLayoutDerivedStateModel = ReturnType<typeof useAppControllerLayoutDerivedState>;
