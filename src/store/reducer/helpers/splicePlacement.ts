import type { NodeId, SpliceId } from "../../../core/entities";
import {
  resolveSplicePlacementFromEntities,
  type ResolvedSplicePlacement,
  type UnresolvedSplicePlacement
} from "../../../core/splicePlacement";
import type { AppState } from "../../types";

export type StoreSplicePlacementResolution =
  | ResolvedSplicePlacement
  | UnresolvedSplicePlacement
  | { status: "legacyNode"; spliceId: SpliceId; nodeId: NodeId }
  | { status: "missingSplice"; spliceId: SpliceId };

export function findLegacySpliceNodeId(state: AppState, spliceId: SpliceId): NodeId | undefined {
  for (const nodeId of state.nodes.allIds) {
    const node = state.nodes.byId[nodeId];
    if (node?.kind === "splice" && node.spliceId === spliceId) {
      return node.id;
    }
  }

  return undefined;
}

/**
 * Central placement resolver. Canonical segment-offset placements win; a
 * legacy splice node is only honored as a compatibility input while the
 * splice has no canonical placement (pre-migration states).
 */
export function resolveSplicePlacement(state: AppState, spliceId: SpliceId): StoreSplicePlacementResolution {
  const splice = state.splices.byId[spliceId];
  if (splice === undefined) {
    return { status: "missingSplice", spliceId };
  }

  if (splice.placement === undefined) {
    const legacyNodeId = findLegacySpliceNodeId(state, spliceId);
    if (legacyNodeId !== undefined) {
      return { status: "legacyNode", spliceId, nodeId: legacyNodeId };
    }
  }

  return resolveSplicePlacementFromEntities(splice, (segmentId) => state.segments.byId[segmentId]);
}

export function listPlacedSpliceIdsOnSegment(state: AppState, segmentId: string): SpliceId[] {
  const spliceIds: SpliceId[] = [];
  for (const spliceId of state.splices.allIds) {
    const splice = state.splices.byId[spliceId];
    if (splice?.placement !== undefined && splice.placement.segmentId === segmentId) {
      spliceIds.push(spliceId);
    }
  }

  return spliceIds;
}
