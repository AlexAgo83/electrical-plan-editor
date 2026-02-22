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
    () =>
      createNodePositionMap(nodes, segments, {
        snapToGrid: snapNodesToGrid,
        gridStep: NETWORK_GRID_STEP
      }),
    [nodes, segments, snapNodesToGrid]
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
