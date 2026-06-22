import type { NodeId, SegmentId, WireEndpoint } from "../../../core/entities";
import {
  portIndexToSpliceSide,
  swapDirectionalSpliceSide,
  type DirectionalSpliceSide
} from "../../../core/directionalSplice";
import { resolveSplicePortMode } from "../../../core/splicePortMode";
import type { ResolvedSplicePlacement } from "../../../core/splicePlacement";
import type { AppState } from "../../types";
import { resolveSplicePlacement } from "./splicePlacement";
import { findNodeIdForEndpoint } from "./wireEndpointHelpers";

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

/**
 * Infer the directional side (L/R) of an exit point relative to the splice.
 *
 * The directional splice symbol is laid out horizontally, so Left/Right is
 * driven by the horizontal (x) offset whenever the carrier segment is not
 * vertical. When the exit point shares the splice's x coordinate — i.e. the
 * carrier segment is perfectly vertical — x cannot disambiguate the two branch
 * directions, so we fall back to the vertical (y) axis (upward exits map to L,
 * downward to R). Returns null only when the exit point coincides exactly with
 * the splice, leaving the caller to apply its own positional fallback.
 */
function inferSideAlongAxis(
  exitPosition: { x: number; y: number },
  splicePosition: { x: number; y: number }
): DirectionalSpliceSide | null {
  if (exitPosition.x !== splicePosition.x) {
    return exitPosition.x < splicePosition.x ? "L" : "R";
  }
  if (exitPosition.y !== splicePosition.y) {
    return exitPosition.y < splicePosition.y ? "L" : "R";
  }
  return null;
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
      const inferredSide = exitPosition === undefined ? null : inferSideAlongAxis(exitPosition, splicePosition);
      if (inferredSide !== null) {
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
    const inferredSide =
      splicePosition !== undefined && adjacentPosition !== undefined
        ? inferSideAlongAxis(adjacentPosition, splicePosition)
        : null;
    if (inferredSide !== null) {
      return splice.sideInverted === true ? swapDirectionalSpliceSide(inferredSide) : inferredSide;
    }

    const counts = countConnectorNodesBySide(state, spliceNodeId);
    const fallbackSide = counts.right <= counts.left ? "R" : "L";
    return splice.sideInverted === true ? swapDirectionalSpliceSide(fallbackSide) : fallbackSide;
  }

  const fallbackSide = portIndexToSpliceSide(endpoint.portIndex);
  return splice.sideInverted === true ? swapDirectionalSpliceSide(fallbackSide) : fallbackSide;
}
