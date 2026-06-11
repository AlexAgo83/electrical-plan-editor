import type { NodeId, SegmentId, WireEndpoint, WireRouteEndpointDetail } from "../../../core/entities";
import { buildRoutingGraphIndex, type RoutingGraphIndex } from "../../../core/graph";
import { findShortestRoute } from "../../../core/pathfinding";
import type { ResolvedSplicePlacement } from "../../../core/splicePlacement";
import type { AppState } from "../../types";
import { resolveSplicePlacement } from "./splicePlacement";
import { findNodeIdForEndpoint } from "./wireEndpointHelpers";

export type WireEndpointAnchor =
  | { kind: "node"; nodeId: NodeId }
  | { kind: "virtual"; placement: ResolvedSplicePlacement };

export function resolveWireEndpointAnchor(
  state: AppState,
  endpoint: WireEndpoint
): { anchor: WireEndpointAnchor } | { error: string } {
  if (endpoint.kind === "connectorCavity") {
    const nodeId = findNodeIdForEndpoint(state, endpoint);
    if (nodeId === undefined) {
      return { error: "Wire connector endpoint is not mapped to a graph node." };
    }
    return { anchor: { kind: "node", nodeId } };
  }

  const resolution = resolveSplicePlacement(state, endpoint.spliceId);
  if (resolution.status === "placed") {
    return { anchor: { kind: "virtual", placement: resolution } };
  }
  if (resolution.status === "legacyNode") {
    return { anchor: { kind: "node", nodeId: resolution.nodeId } };
  }
  if (resolution.status === "missingSplice") {
    return { error: "Wire endpoint references an unknown splice." };
  }
  if (resolution.status === "unplaced") {
    return { error: "Splice must be placed on a segment before wires can connect to it." };
  }

  return { error: "Splice placement is invalid; fix the placement before routing wires." };
}

function getVirtualAnchorNodeId(placement: ResolvedSplicePlacement): NodeId {
  return `virtual-splice:${placement.spliceId}` as NodeId;
}

function getAnchorGraphNodeId(anchor: WireEndpointAnchor): NodeId {
  return anchor.kind === "node" ? anchor.nodeId : getVirtualAnchorNodeId(anchor.placement);
}

/**
 * Derive a routing graph that inserts virtual splice points for the routed
 * wire's endpoint anchors only. Sub-edges keep the host segment ID so route
 * summaries and deterministic tie-breaks never see synthetic edge IDs.
 */
function buildDerivedRoutingGraph(state: AppState, anchors: WireEndpointAnchor[]): RoutingGraphIndex {
  const graph = buildRoutingGraphIndex(
    state.nodes.allIds
      .map((nodeId) => state.nodes.byId[nodeId])
      .filter((node): node is NonNullable<typeof node> => node !== undefined),
    state.segments.allIds
      .map((segmentId) => state.segments.byId[segmentId])
      .filter((segment): segment is NonNullable<typeof segment> => segment !== undefined)
  );

  const virtualAnchors = anchors.filter(
    (anchor): anchor is Extract<WireEndpointAnchor, { kind: "virtual" }> => anchor.kind === "virtual"
  );
  if (virtualAnchors.length === 0) {
    return graph;
  }

  const edgesByNodeId: Record<NodeId, typeof graph.edgesByNodeId[NodeId]> = { ...graph.edgesByNodeId };
  const nodeIds = [...graph.nodeIds];

  const pushEdge = (fromNodeId: NodeId, toNodeId: NodeId, segmentId: SegmentId, lengthMm: number, subNetworkTag: string | null): void => {
    edgesByNodeId[fromNodeId] = [
      ...(edgesByNodeId[fromNodeId] ?? []),
      { segmentId, fromNodeId, toNodeId, lengthMm, subNetworkTag }
    ];
  };

  for (const anchor of virtualAnchors) {
    const placement = anchor.placement;
    const virtualNodeId = getVirtualAnchorNodeId(placement);
    if (edgesByNodeId[virtualNodeId] !== undefined) {
      continue;
    }

    const segment = state.segments.byId[placement.segmentId];
    const subNetworkTagRaw = segment?.subNetworkTag?.trim();
    const subNetworkTag = subNetworkTagRaw === undefined || subNetworkTagRaw.length === 0 ? null : subNetworkTagRaw;

    nodeIds.push(virtualNodeId);
    edgesByNodeId[virtualNodeId] = [];

    pushEdge(virtualNodeId, placement.fromNodeId, placement.segmentId, placement.offsetMm, subNetworkTag);
    pushEdge(placement.fromNodeId, virtualNodeId, placement.segmentId, placement.offsetMm, subNetworkTag);
    pushEdge(virtualNodeId, placement.toNodeId, placement.segmentId, placement.remainderMm, subNetworkTag);
    pushEdge(placement.toNodeId, virtualNodeId, placement.segmentId, placement.remainderMm, subNetworkTag);
  }

  for (let leftIndex = 0; leftIndex < virtualAnchors.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < virtualAnchors.length; rightIndex += 1) {
      const left = virtualAnchors[leftIndex]?.placement;
      const right = virtualAnchors[rightIndex]?.placement;
      if (left === undefined || right === undefined || left.segmentId !== right.segmentId) {
        continue;
      }

      const leftNodeId = getVirtualAnchorNodeId(left);
      const rightNodeId = getVirtualAnchorNodeId(right);
      if (leftNodeId === rightNodeId) {
        continue;
      }

      const leftOffsetFromA = left.fromNodeId === right.fromNodeId ? left.offsetMm : left.segmentLengthMm - left.offsetMm;
      const directLengthMm = Math.abs(leftOffsetFromA - right.offsetMm);
      const segment = state.segments.byId[left.segmentId];
      const subNetworkTagRaw = segment?.subNetworkTag?.trim();
      const subNetworkTag = subNetworkTagRaw === undefined || subNetworkTagRaw.length === 0 ? null : subNetworkTagRaw;

      pushEdge(leftNodeId, rightNodeId, left.segmentId, directLengthMm, subNetworkTag);
      pushEdge(rightNodeId, leftNodeId, left.segmentId, directLengthMm, subNetworkTag);
    }
  }

  return {
    nodeIds,
    segmentIds: graph.segmentIds,
    edgesByNodeId
  };
}

function dedupeConsecutiveSegmentIds(segmentIds: SegmentId[]): SegmentId[] {
  const deduped: SegmentId[] = [];
  for (const segmentId of segmentIds) {
    if (deduped[deduped.length - 1] !== segmentId) {
      deduped.push(segmentId);
    }
  }

  return deduped;
}

function getPlacementOffsetFromSegmentNodeA(placement: ResolvedSplicePlacement, segmentNodeA: NodeId): number {
  return placement.fromNodeId === segmentNodeA ? placement.offsetMm : placement.segmentLengthMm - placement.offsetMm;
}

interface ForcedRouteResolution {
  lengthMm: number;
  detailA?: WireRouteEndpointDetail;
  detailB?: WireRouteEndpointDetail;
}

export function computeForcedRouteWithAnchors(
  state: AppState,
  anchorA: WireEndpointAnchor,
  anchorB: WireEndpointAnchor,
  segmentIds: SegmentId[]
): ForcedRouteResolution | null {
  if (anchorA.kind === "node" && anchorB.kind === "node") {
    const lengthMm = computeForcedRouteLength(state, anchorA.nodeId, anchorB.nodeId, segmentIds);
    return lengthMm === null ? null : { lengthMm };
  }

  if (segmentIds.length === 0) {
    return null;
  }

  const firstSegmentId = segmentIds[0];
  const lastSegmentId = segmentIds[segmentIds.length - 1];

  if (anchorA.kind === "virtual" && anchorB.kind === "virtual" && segmentIds.length === 1) {
    const placementA = anchorA.placement;
    const placementB = anchorB.placement;
    if (placementA.segmentId !== firstSegmentId || placementB.segmentId !== firstSegmentId) {
      return null;
    }
    const segment = state.segments.byId[placementA.segmentId];
    if (segment === undefined) {
      return null;
    }
    const coveredLengthMm = Math.abs(
      getPlacementOffsetFromSegmentNodeA(placementA, segment.nodeA) -
        getPlacementOffsetFromSegmentNodeA(placementB, segment.nodeA)
    );
    return {
      lengthMm: coveredLengthMm,
      detailA: { segmentId: placementA.segmentId, coveredLengthMm },
      detailB: { segmentId: placementB.segmentId, coveredLengthMm }
    };
  }

  const startCandidates: Array<{ nodeId: NodeId; coveredA?: number; consumedFrom: number }> = [];
  if (anchorA.kind === "node") {
    startCandidates.push({ nodeId: anchorA.nodeId, consumedFrom: 0 });
  } else {
    if (anchorA.placement.segmentId !== firstSegmentId) {
      return null;
    }
    startCandidates.push({ nodeId: anchorA.placement.fromNodeId, coveredA: anchorA.placement.offsetMm, consumedFrom: 1 });
    startCandidates.push({ nodeId: anchorA.placement.toNodeId, coveredA: anchorA.placement.remainderMm, consumedFrom: 1 });
  }

  let best: ForcedRouteResolution | null = null;
  for (const startCandidate of startCandidates) {
    const seenSegmentIds = new Set<string>();
    if (anchorA.kind === "virtual" && firstSegmentId !== undefined) {
      seenSegmentIds.add(firstSegmentId);
    }

    const lastConsumedIndex = anchorB.kind === "virtual" ? segmentIds.length - 1 : segmentIds.length;
    let currentNodeId = startCandidate.nodeId;
    let middleLengthMm = 0;
    let chainIsValid = true;

    for (let index = startCandidate.consumedFrom; index < lastConsumedIndex; index += 1) {
      const segmentId = segmentIds[index];
      if (segmentId === undefined || seenSegmentIds.has(segmentId)) {
        chainIsValid = false;
        break;
      }
      seenSegmentIds.add(segmentId);

      const segment = state.segments.byId[segmentId];
      if (segment === undefined) {
        chainIsValid = false;
        break;
      }

      if (segment.nodeA === currentNodeId) {
        currentNodeId = segment.nodeB;
      } else if (segment.nodeB === currentNodeId) {
        currentNodeId = segment.nodeA;
      } else {
        chainIsValid = false;
        break;
      }

      middleLengthMm += segment.lengthMm;
    }

    if (!chainIsValid) {
      continue;
    }

    let coveredB: number | undefined;
    if (anchorB.kind === "node") {
      if (currentNodeId !== anchorB.nodeId) {
        continue;
      }
    } else {
      const placementB = anchorB.placement;
      if (lastSegmentId === undefined || placementB.segmentId !== lastSegmentId || seenSegmentIds.has(lastSegmentId)) {
        continue;
      }
      if (currentNodeId === placementB.fromNodeId) {
        coveredB = placementB.offsetMm;
      } else if (currentNodeId === placementB.toNodeId) {
        coveredB = placementB.remainderMm;
      } else {
        continue;
      }
    }

    const candidate: ForcedRouteResolution = {
      lengthMm: (startCandidate.coveredA ?? 0) + middleLengthMm + (coveredB ?? 0),
      ...(anchorA.kind === "virtual" && firstSegmentId !== undefined
        ? { detailA: { segmentId: firstSegmentId, coveredLengthMm: startCandidate.coveredA ?? 0 } }
        : {}),
      ...(anchorB.kind === "virtual" && lastSegmentId !== undefined && coveredB !== undefined
        ? { detailB: { segmentId: lastSegmentId, coveredLengthMm: coveredB } }
        : {})
    };

    if (best === null || candidate.lengthMm < best.lengthMm) {
      best = candidate;
    }
  }

  return best;
}

function computeDerivedEdgeLengthMm(
  anchorA: WireEndpointAnchor,
  anchorB: WireEndpointAnchor,
  state: AppState,
  fromNodeId: NodeId,
  toNodeId: NodeId,
  segmentId: SegmentId
): number {
  const virtualPlacements: ResolvedSplicePlacement[] = [];
  if (anchorA.kind === "virtual") {
    virtualPlacements.push(anchorA.placement);
  }
  if (anchorB.kind === "virtual") {
    virtualPlacements.push(anchorB.placement);
  }

  const placementAt = (nodeId: NodeId): ResolvedSplicePlacement | undefined =>
    virtualPlacements.find((placement) => getVirtualAnchorNodeId(placement) === nodeId);

  const fromPlacement = placementAt(fromNodeId);
  const toPlacement = placementAt(toNodeId);

  if (fromPlacement !== undefined && toPlacement !== undefined) {
    const segment = state.segments.byId[segmentId];
    if (segment === undefined) {
      return 0;
    }
    return Math.abs(
      getPlacementOffsetFromSegmentNodeA(fromPlacement, segment.nodeA) -
        getPlacementOffsetFromSegmentNodeA(toPlacement, segment.nodeA)
    );
  }

  const placement = fromPlacement ?? toPlacement;
  if (placement !== undefined) {
    const realNodeId = fromPlacement !== undefined ? toNodeId : fromNodeId;
    if (realNodeId === placement.fromNodeId) {
      return placement.offsetMm;
    }
    if (realNodeId === placement.toNodeId) {
      return placement.remainderMm;
    }
    return 0;
  }

  return state.segments.byId[segmentId]?.lengthMm ?? 0;
}

export interface ComputedWireRoute {
  routeSegmentIds: SegmentId[];
  lengthMm: number;
  detailA?: WireRouteEndpointDetail;
  detailB?: WireRouteEndpointDetail;
  exitNodeIdHintA: NodeId | null;
  exitNodeIdHintB: NodeId | null;
}

export function computeShortestWireRoute(
  state: AppState,
  anchorA: WireEndpointAnchor,
  anchorB: WireEndpointAnchor
): ComputedWireRoute | null {
  const graph = buildDerivedRoutingGraph(state, [anchorA, anchorB]);
  const startNodeId = getAnchorGraphNodeId(anchorA);
  const endNodeId = getAnchorGraphNodeId(anchorB);
  const shortestRoute = findShortestRoute(graph, startNodeId, endNodeId);
  if (shortestRoute === null) {
    return null;
  }

  if (shortestRoute.segmentIds.length === 0 && anchorA.kind === "virtual") {
    // Same resolved point for both endpoints: keep the host segment visible
    // in the route summary instead of an empty route.
    return {
      routeSegmentIds: [anchorA.placement.segmentId],
      lengthMm: 0,
      detailA: { segmentId: anchorA.placement.segmentId, coveredLengthMm: 0 },
      detailB: { segmentId: anchorA.placement.segmentId, coveredLengthMm: 0 },
      exitNodeIdHintA: null,
      exitNodeIdHintB: null
    };
  }

  let detailA: WireRouteEndpointDetail | undefined;
  let detailB: WireRouteEndpointDetail | undefined;
  let exitNodeIdHintA: NodeId | null = null;
  let exitNodeIdHintB: NodeId | null = null;

  if (anchorA.kind === "virtual" && shortestRoute.segmentIds.length > 0) {
    const firstSegmentId = shortestRoute.segmentIds[0];
    const nextNodeId = shortestRoute.nodeIds[1];
    if (firstSegmentId !== undefined && nextNodeId !== undefined) {
      detailA = {
        segmentId: firstSegmentId,
        coveredLengthMm: computeDerivedEdgeLengthMm(anchorA, anchorB, state, startNodeId, nextNodeId, firstSegmentId)
      };
      exitNodeIdHintA = nextNodeId === endNodeId && anchorB.kind === "virtual" ? null : nextNodeId;
    }
  }
  if (anchorB.kind === "virtual" && shortestRoute.segmentIds.length > 0) {
    const lastSegmentId = shortestRoute.segmentIds[shortestRoute.segmentIds.length - 1];
    const previousNodeId = shortestRoute.nodeIds[shortestRoute.nodeIds.length - 2];
    if (lastSegmentId !== undefined && previousNodeId !== undefined) {
      detailB = {
        segmentId: lastSegmentId,
        coveredLengthMm: computeDerivedEdgeLengthMm(anchorA, anchorB, state, previousNodeId, endNodeId, lastSegmentId)
      };
      exitNodeIdHintB = previousNodeId === startNodeId && anchorA.kind === "virtual" ? null : previousNodeId;
    }
  }

  return {
    routeSegmentIds: dedupeConsecutiveSegmentIds(shortestRoute.segmentIds),
    lengthMm: shortestRoute.totalLengthMm,
    detailA,
    detailB,
    exitNodeIdHintA,
    exitNodeIdHintB
  };
}

export function computeForcedRouteLength(
  state: AppState,
  startNodeId: NodeId,
  endNodeId: NodeId,
  segmentIds: SegmentId[]
): number | null {
  if (segmentIds.length === 0) {
    return null;
  }

  const seenSegmentIds = new Set<string>();
  let currentNodeId: NodeId = startNodeId;
  let totalLengthMm = 0;

  for (const segmentId of segmentIds) {
    if (seenSegmentIds.has(segmentId)) {
      return null;
    }
    seenSegmentIds.add(segmentId);

    const segment = state.segments.byId[segmentId];
    if (segment === undefined) {
      return null;
    }

    if (segment.nodeA === currentNodeId) {
      currentNodeId = segment.nodeB;
    } else if (segment.nodeB === currentNodeId) {
      currentNodeId = segment.nodeA;
    } else {
      return null;
    }

    totalLengthMm += segment.lengthMm;
  }

  return currentNodeId === endNodeId ? totalLengthMm : null;
}
