import type { NodeId, SegmentId, Wire, WireEndpoint, WireId } from "../../../core/entities";
import {
  normalizeDirectionalSpliceEndpoint,
  portIndexToSpliceSide,
  swapDirectionalSpliceSide,
  type DirectionalSpliceSide
} from "../../../core/directionalSplice";
import { buildRoutingGraphIndex } from "../../../core/graph";
import { findShortestRoute } from "../../../core/pathfinding";
import { isSplicePortIndexValid, resolveSplicePortMode } from "../../../core/splicePortMode";
import type { AppState, EntityState } from "../../types";
import { isValidSlotIndex } from "../shared";

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

function countConnectorNodesBySide(state: AppState, spliceNodeId: NodeId): { left: number; right: number } {
  const splicePosition = state.nodePositions[spliceNodeId];
  if (splicePosition === undefined) {
    return { left: 0, right: 0 };
  }

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

export function resolveDirectionalSpliceEndpointSide(
  state: AppState,
  endpoint: WireEndpoint,
  routeSegmentIds: SegmentId[],
  wireSide: "A" | "B"
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

  const spliceNodeId = findNodeIdForEndpoint(state, endpoint);
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

export function recomputeWireRouteAndDirectionalEndpoints(
  state: AppState,
  wire: Wire
): { wire: Wire } | { error: string } {
  const startNodeId = findNodeIdForEndpoint(state, wire.endpointA);
  const endNodeId = findNodeIdForEndpoint(state, wire.endpointB);
  if (startNodeId === undefined || endNodeId === undefined) {
    return { error: `Wire '${wire.technicalId}' has endpoints not mapped to graph nodes.` };
  }

  let routeSegmentIds = wire.routeSegmentIds;
  let lengthMm = wire.lengthMm;
  let isRouteLocked = wire.isRouteLocked;

  if (wire.isRouteLocked) {
    const forcedLength = computeForcedRouteLength(state, startNodeId, endNodeId, wire.routeSegmentIds);
    if (forcedLength === null) {
      return { error: `Locked route for wire '${wire.technicalId}' is no longer valid.` };
    }
    lengthMm = forcedLength;
  } else {
    const graph = buildRoutingGraphIndex(
      state.nodes.allIds
        .map((nodeId) => state.nodes.byId[nodeId])
        .filter((node): node is NonNullable<typeof node> => node !== undefined),
      state.segments.allIds
        .map((segmentId) => state.segments.byId[segmentId])
        .filter((segment): segment is NonNullable<typeof segment> => segment !== undefined)
    );
    const shortestRoute = findShortestRoute(graph, startNodeId, endNodeId);
    if (shortestRoute === null) {
      return { error: `No route found for wire '${wire.technicalId}'.` };
    }

    routeSegmentIds = shortestRoute.segmentIds;
    lengthMm = shortestRoute.totalLengthMm;
    isRouteLocked = false;
  }

  let endpointA = wire.endpointA;
  let endpointB = wire.endpointB;
  const endpointASide = resolveDirectionalSpliceEndpointSide(state, endpointA, routeSegmentIds, "A");
  if (endpointASide !== null) {
    endpointA = normalizeDirectionalSpliceEndpoint(endpointA, endpointASide);
  }
  const endpointBSide = resolveDirectionalSpliceEndpointSide(state, endpointB, routeSegmentIds, "B");
  if (endpointBSide !== null) {
    endpointB = normalizeDirectionalSpliceEndpoint(endpointB, endpointBSide);
  }

  return {
    wire: {
      ...wire,
      endpointA,
      endpointB,
      routeSegmentIds,
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
