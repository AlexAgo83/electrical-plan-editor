import type { NodeId, SpliceId, SplicePlacement } from "../../../core/entities";
import {
  resolveSplicePlacementFromEntities,
  type ResolvedSplicePlacement,
  type UnresolvedSplicePlacement
} from "../../../core/splicePlacement";
import type { AppState } from "../../types";

export function getSplicePlacementValidationError(state: AppState, placement: SplicePlacement): string | null {
  if (!Number.isFinite(placement.offsetMm) || placement.offsetMm < 0) {
    return "Splice placement offset must be a finite value >= 0 mm.";
  }

  const segment = state.segments.byId[placement.segmentId];
  if (segment === undefined) {
    return "Splice placement references an unknown segment.";
  }
  if (segment.role === "rearBackshellLink") {
    return "Splice placement cannot target a rear backshell link segment.";
  }
  if (placement.fromNodeId !== segment.nodeA && placement.fromNodeId !== segment.nodeB) {
    return "Splice placement reference node must be an endpoint of the host segment.";
  }
  if (placement.offsetMm > segment.lengthMm) {
    return "Splice placement offset exceeds the host segment length.";
  }

  return null;
}

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
