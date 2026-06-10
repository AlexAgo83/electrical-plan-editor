import type { NodeId, SegmentId, Wire, WireEndpoint, WireId, WireRouteEndpointDetail } from "../../../core/entities";
import {
  normalizeDirectionalSpliceEndpoint,
  portIndexToSpliceSide,
  swapDirectionalSpliceSide,
  type DirectionalSpliceSide
} from "../../../core/directionalSplice";
import { buildRoutingGraphIndex, type RoutingGraphIndex } from "../../../core/graph";
import { findShortestRoute } from "../../../core/pathfinding";
import { isSplicePortIndexValid, resolveSplicePortMode } from "../../../core/splicePortMode";
import type { ResolvedSplicePlacement } from "../../../core/splicePlacement";
import type { AppState, EntityState } from "../../types";
import { isValidSlotIndex } from "../shared";
import { resolveSplicePlacement } from "./splicePlacement";

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

export function getEndpointKey(endpoint: WireEndpoint): string {
  if (endpoint.kind === "connectorCavity") {
    return `connector:${endpoint.connectorId}:${endpoint.cavityIndex}`;
  }

  return `splice:${endpoint.spliceId}:${endpoint.portIndex}`;
}

export function findNodeIdForEndpoint(state: AppState, endpoint: WireEndpoint): NodeId | undefined {
  for (const nodeId of state.nodes.allIds) {
    const node = state.nodes.byId[nodeId];
    if (node === undefined) {
      continue;
    }

    if (endpoint.kind === "connectorCavity" && node.kind === "connector" && node.connectorId === endpoint.connectorId) {
      return node.id;
    }

    if (endpoint.kind === "splicePort" && node.kind === "splice" && node.spliceId === endpoint.spliceId) {
      return node.id;
    }
  }

  return undefined;
}

function getOtherNodeId(segment: { nodeA: NodeId; nodeB: NodeId }, nodeId: NodeId): NodeId | null {
  if (segment.nodeA === nodeId) {
    return segment.nodeB;
  }
  if (segment.nodeB === nodeId) {
    return segment.nodeA;
  }
  return null;
}

function isSegmentConnectedToNode(segment: { nodeA: NodeId; nodeB: NodeId }, nodeId: NodeId): boolean {
  return segment.nodeA === nodeId || segment.nodeB === nodeId;
}

function getRouteSegmentAdjacentToNode(
  state: AppState,
  routeSegmentIds: SegmentId[],
  nodeId: NodeId,
  wireSide: "A" | "B"
): SegmentId | undefined {
  const orderedCandidates =
    wireSide === "A" ? routeSegmentIds : [...routeSegmentIds].reverse();

  for (const segmentId of orderedCandidates) {
    const segment = state.segments.byId[segmentId];
    if (segment !== undefined && isSegmentConnectedToNode(segment, nodeId)) {
      return segmentId;
    }
  }

  return undefined;
}

function countReachableConnectorNodesFromBranch(
  state: AppState,
  startNodeId: NodeId,
  blockedNodeId: NodeId
): number {
  const visited = new Set<NodeId>([blockedNodeId]);
  const queue: NodeId[] = [startNodeId];
  let connectorCount = 0;

  while (queue.length > 0) {
    const currentNodeId = queue.shift();
    if (currentNodeId === undefined || visited.has(currentNodeId)) {
      continue;
    }

    visited.add(currentNodeId);
    const currentNode = state.nodes.byId[currentNodeId];
    if (currentNode?.kind === "connector") {
      connectorCount += 1;
    }

    for (const segmentId of state.segments.allIds) {
      const segment = state.segments.byId[segmentId];
      if (segment === undefined || !isSegmentConnectedToNode(segment, currentNodeId)) {
        continue;
      }

      const nextNodeId = getOtherNodeId(segment, currentNodeId);
      if (nextNodeId !== null && !visited.has(nextNodeId)) {
        queue.push(nextNodeId);
      }
    }
  }

  return connectorCount;
}

function resolveAlignedDirectionalBranchSide(
  state: AppState,
  spliceNodeId: NodeId,
  routeSegmentId: SegmentId
): DirectionalSpliceSide | null {
  const connectedSegments = state.segments.allIds
    .map((segmentId) => state.segments.byId[segmentId])
    .filter((segment): segment is NonNullable<typeof segment> => segment !== undefined)
    .filter((segment) => isSegmentConnectedToNode(segment, spliceNodeId));

  if (connectedSegments.length !== 2) {
    return null;
  }

  const branchScores = connectedSegments
    .map((segment) => {
      const otherNodeId = getOtherNodeId(segment, spliceNodeId);
      if (otherNodeId === null) {
        return null;
      }

      return {
        segmentId: segment.id,
        connectorCount: countReachableConnectorNodesFromBranch(state, otherNodeId, spliceNodeId),
        wireCount: state.wires.allIds.reduce((count, wireId) => {
          const wire = state.wires.byId[wireId];
          if (wire === undefined) {
            return count;
          }

          const endpointARouteSegmentId =
            wire.endpointA.kind === "splicePort" && findNodeIdForEndpoint(state, wire.endpointA) === spliceNodeId
              ? getRouteSegmentAdjacentToNode(state, wire.routeSegmentIds, spliceNodeId, "A")
              : undefined;
          const endpointBRouteSegmentId =
            wire.endpointB.kind === "splicePort" && findNodeIdForEndpoint(state, wire.endpointB) === spliceNodeId
              ? getRouteSegmentAdjacentToNode(state, wire.routeSegmentIds, spliceNodeId, "B")
              : undefined;

          return endpointARouteSegmentId === segment.id || endpointBRouteSegmentId === segment.id ? count + 1 : count;
        }, 0)
      };
    })
    .filter((score): score is NonNullable<typeof score> => score !== null)
    .sort((left, right) => {
      if (left.wireCount !== right.wireCount) {
        return left.wireCount - right.wireCount;
      }
      if (left.connectorCount !== right.connectorCount) {
        return left.connectorCount - right.connectorCount;
      }

      return left.segmentId.localeCompare(right.segmentId);
    });

  if (branchScores.length !== 2) {
    return null;
  }

  const rightBranchSegmentId = branchScores[0]?.segmentId;
  return routeSegmentId === rightBranchSegmentId ? "R" : "L";
}

function countConnectorNodesAroundPosition(
  state: AppState,
  splicePosition: { x: number; y: number }
): { left: number; right: number } {
  let left = 0;
  let right = 0;
  for (const nodeId of state.nodes.allIds) {
    const node = state.nodes.byId[nodeId];
    if (node?.kind !== "connector") {
      continue;
    }
    const position = state.nodePositions[nodeId];
    if (position === undefined || position.x === splicePosition.x) {
      continue;
    }
    if (position.x < splicePosition.x) {
      left += 1;
    } else {
      right += 1;
    }
  }

  return { left, right };
}

function countConnectorNodesBySide(state: AppState, spliceNodeId: NodeId): { left: number; right: number } {
  const splicePosition = state.nodePositions[spliceNodeId];
  if (splicePosition === undefined) {
    return { left: 0, right: 0 };
  }

  return countConnectorNodesAroundPosition(state, splicePosition);
}

function resolveFloatingSplicePosition(
  state: AppState,
  placement: ResolvedSplicePlacement
): { x: number; y: number } | undefined {
  const fromPosition = state.nodePositions[placement.fromNodeId];
  const toPosition = state.nodePositions[placement.toNodeId];
  if (fromPosition === undefined || toPosition === undefined) {
    return undefined;
  }

  return {
    x: fromPosition.x + (toPosition.x - fromPosition.x) * placement.ratio,
    y: fromPosition.y + (toPosition.y - fromPosition.y) * placement.ratio
  };
}

function deriveFloatingExitNodeId(
  state: AppState,
  placement: ResolvedSplicePlacement,
  routeSegmentIds: SegmentId[],
  wireSide: "A" | "B"
): NodeId | undefined {
  const orderedSegmentIds = wireSide === "A" ? routeSegmentIds : [...routeSegmentIds].reverse();
  const adjacentSegmentId = orderedSegmentIds.find((segmentId) => segmentId !== placement.segmentId);
  if (adjacentSegmentId === undefined) {
    return undefined;
  }

  const adjacentSegment = state.segments.byId[adjacentSegmentId];
  if (adjacentSegment === undefined) {
    return undefined;
  }

  if (adjacentSegment.nodeA === placement.fromNodeId || adjacentSegment.nodeB === placement.fromNodeId) {
    return placement.fromNodeId;
  }
  if (adjacentSegment.nodeA === placement.toNodeId || adjacentSegment.nodeB === placement.toNodeId) {
    return placement.toNodeId;
  }

  return undefined;
}

export function resolveDirectionalSpliceEndpointSide(
  state: AppState,
  endpoint: WireEndpoint,
  routeSegmentIds: SegmentId[],
  wireSide: "A" | "B",
  exitNodeIdHint?: NodeId | null
): DirectionalSpliceSide | null {
  if (endpoint.kind !== "splicePort") {
    return null;
  }

  const splice = state.splices.byId[endpoint.spliceId];
  if (splice === undefined || resolveSplicePortMode(splice) !== "directional") {
    return null;
  }

  if (endpoint.spliceSideLocked === true && endpoint.spliceSideOverride !== undefined) {
    return endpoint.spliceSideOverride;
  }

  const resolution = resolveSplicePlacement(state, endpoint.spliceId);
  if (resolution.status === "placed") {
    const splicePosition = resolveFloatingSplicePosition(state, resolution);
    if (splicePosition !== undefined) {
      const exitNodeId =
        exitNodeIdHint ?? deriveFloatingExitNodeId(state, resolution, routeSegmentIds, wireSide);
      const exitPosition = exitNodeId === undefined || exitNodeId === null ? undefined : state.nodePositions[exitNodeId];
      if (exitPosition !== undefined && exitPosition.x !== splicePosition.x) {
        const inferredSide = exitPosition.x < splicePosition.x ? "L" : "R";
        return splice.sideInverted === true ? swapDirectionalSpliceSide(inferredSide) : inferredSide;
      }

      const counts = countConnectorNodesAroundPosition(state, splicePosition);
      const fallbackSide = counts.right <= counts.left ? "R" : "L";
      return splice.sideInverted === true ? swapDirectionalSpliceSide(fallbackSide) : fallbackSide;
    }

    const fallbackSide = portIndexToSpliceSide(endpoint.portIndex);
    return splice.sideInverted === true ? swapDirectionalSpliceSide(fallbackSide) : fallbackSide;
  }

  const spliceNodeId = resolution.status === "legacyNode" ? resolution.nodeId : undefined;
  if (spliceNodeId !== undefined) {
    const routeSegmentId = getRouteSegmentAdjacentToNode(state, routeSegmentIds, spliceNodeId, wireSide);
    if (routeSegmentId !== undefined) {
      const alignedBranchSide = resolveAlignedDirectionalBranchSide(state, spliceNodeId, routeSegmentId);
      if (alignedBranchSide !== null) {
        return splice.sideInverted === true ? swapDirectionalSpliceSide(alignedBranchSide) : alignedBranchSide;
      }
    }

    const splicePosition = state.nodePositions[spliceNodeId];
    const routeSegment = routeSegmentId === undefined ? undefined : state.segments.byId[routeSegmentId];
    const adjacentNodeId = routeSegment === undefined ? null : getOtherNodeId(routeSegment, spliceNodeId);
    const adjacentPosition = adjacentNodeId === null ? undefined : state.nodePositions[adjacentNodeId];
    if (splicePosition !== undefined && adjacentPosition !== undefined && adjacentPosition.x !== splicePosition.x) {
      const inferredSide = adjacentPosition.x < splicePosition.x ? "L" : "R";
      return splice.sideInverted === true ? swapDirectionalSpliceSide(inferredSide) : inferredSide;
    }

    const counts = countConnectorNodesBySide(state, spliceNodeId);
    const fallbackSide = counts.right <= counts.left ? "R" : "L";
    return splice.sideInverted === true ? swapDirectionalSpliceSide(fallbackSide) : fallbackSide;
  }

  const fallbackSide = portIndexToSpliceSide(endpoint.portIndex);
  return splice.sideInverted === true ? swapDirectionalSpliceSide(fallbackSide) : fallbackSide;
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

export function recomputeWireRouteAndDirectionalEndpoints(
  state: AppState,
  wire: Wire
): { wire: Wire } | { error: string } {
  const anchorAResult = resolveWireEndpointAnchor(state, wire.endpointA);
  const anchorBResult = resolveWireEndpointAnchor(state, wire.endpointB);
  if ("error" in anchorAResult || "error" in anchorBResult) {
    const reason = "error" in anchorAResult ? anchorAResult.error : ("error" in anchorBResult ? anchorBResult.error : "");
    return { error: `Wire '${wire.technicalId}': ${reason}` };
  }

  const anchorA = anchorAResult.anchor;
  const anchorB = anchorBResult.anchor;

  let routeSegmentIds = wire.routeSegmentIds;
  let routeEndpointDetailA: WireRouteEndpointDetail | undefined;
  let routeEndpointDetailB: WireRouteEndpointDetail | undefined;
  let lengthMm = wire.lengthMm;
  let isRouteLocked = wire.isRouteLocked;
  let exitNodeIdHintA: NodeId | null = null;
  let exitNodeIdHintB: NodeId | null = null;

  if (wire.isRouteLocked) {
    const forced = computeForcedRouteWithAnchors(state, anchorA, anchorB, wire.routeSegmentIds);
    if (forced === null) {
      return { error: `Locked route for wire '${wire.technicalId}' is no longer valid.` };
    }
    lengthMm = forced.lengthMm;
    routeEndpointDetailA = forced.detailA;
    routeEndpointDetailB = forced.detailB;
  } else {
    const graph = buildDerivedRoutingGraph(state, [anchorA, anchorB]);
    const startNodeId = getAnchorGraphNodeId(anchorA);
    const endNodeId = getAnchorGraphNodeId(anchorB);
    const shortestRoute = findShortestRoute(graph, startNodeId, endNodeId);
    if (shortestRoute === null) {
      return { error: `No route found for wire '${wire.technicalId}'.` };
    }

    if (shortestRoute.segmentIds.length === 0 && anchorA.kind === "virtual") {
      // Same resolved point for both endpoints: keep the host segment visible
      // in the route summary instead of an empty route.
      routeSegmentIds = [anchorA.placement.segmentId];
      routeEndpointDetailA = { segmentId: anchorA.placement.segmentId, coveredLengthMm: 0 };
      routeEndpointDetailB = { segmentId: anchorA.placement.segmentId, coveredLengthMm: 0 };
      lengthMm = 0;
    } else {
      routeSegmentIds = dedupeConsecutiveSegmentIds(shortestRoute.segmentIds);
      lengthMm = shortestRoute.totalLengthMm;

      if (anchorA.kind === "virtual" && shortestRoute.segmentIds.length > 0) {
        const firstSegmentId = shortestRoute.segmentIds[0];
        const nextNodeId = shortestRoute.nodeIds[1];
        if (firstSegmentId !== undefined && nextNodeId !== undefined) {
          routeEndpointDetailA = {
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
          routeEndpointDetailB = {
            segmentId: lastSegmentId,
            coveredLengthMm: computeDerivedEdgeLengthMm(anchorA, anchorB, state, previousNodeId, endNodeId, lastSegmentId)
          };
          exitNodeIdHintB = previousNodeId === startNodeId && anchorA.kind === "virtual" ? null : previousNodeId;
        }
      }
    }
    isRouteLocked = false;
  }

  let endpointA = wire.endpointA;
  let endpointB = wire.endpointB;
  const endpointASide = resolveDirectionalSpliceEndpointSide(state, endpointA, routeSegmentIds, "A", exitNodeIdHintA);
  if (endpointASide !== null) {
    endpointA = normalizeDirectionalSpliceEndpoint(endpointA, endpointASide);
  }
  const endpointBSide = resolveDirectionalSpliceEndpointSide(state, endpointB, routeSegmentIds, "B", exitNodeIdHintB);
  if (endpointBSide !== null) {
    endpointB = normalizeDirectionalSpliceEndpoint(endpointB, endpointBSide);
  }

  return {
    wire: {
      ...wire,
      endpointA,
      endpointB,
      routeSegmentIds,
      routeEndpointDetailA,
      routeEndpointDetailB,
      lengthMm,
      isRouteLocked
    }
  };
}

export function getEndpointValidationError(state: AppState, endpoint: WireEndpoint): string | null {
  if (endpoint.kind === "connectorCavity") {
    const connector = state.connectors.byId[endpoint.connectorId];
    if (connector === undefined) {
      return "Wire endpoint references an unknown connector.";
    }

    if (!isValidSlotIndex(endpoint.cavityIndex, connector.cavityCount)) {
      return "Wire connector way endpoint is out of range.";
    }

    return null;
  }

  const splice = state.splices.byId[endpoint.spliceId];
  if (splice === undefined) {
    return "Wire endpoint references an unknown splice.";
  }

  if (!isSplicePortIndexValid(splice, endpoint.portIndex)) {
    return "Wire splice port endpoint is out of range.";
  }

  return null;
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

export function recomputeAllWiresForNetwork(state: AppState): { wires: EntityState<Wire, WireId> } | { error: string } {
  if (state.wires.allIds.length === 0) {
    return { wires: state.wires };
  }

  const nextWiresById: Record<WireId, Wire> = { ...state.wires.byId };

  for (const wireId of state.wires.allIds) {
    const wire = state.wires.byId[wireId];
    if (wire === undefined) {
      continue;
    }

    const recomputed = recomputeWireRouteAndDirectionalEndpoints(state, wire);
    if (!("wire" in recomputed)) {
      return recomputed;
    }

    nextWiresById[wireId] = recomputed.wire;
  }

  return {
    wires: {
      byId: nextWiresById,
      allIds: state.wires.allIds
    }
  };
}
