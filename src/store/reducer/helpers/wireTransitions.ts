import type { NodeId, SegmentId, Wire, WireEndpoint, WireId } from "../../../core/entities";
import { buildRoutingGraphIndex } from "../../../core/graph";
import { findShortestRoute } from "../../../core/pathfinding";
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

  if (!isValidSlotIndex(endpoint.portIndex, splice.portCount)) {
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

  const graph = buildRoutingGraphIndex(
    state.nodes.allIds
      .map((nodeId) => state.nodes.byId[nodeId])
      .filter((node): node is NonNullable<typeof node> => node !== undefined),
    state.segments.allIds
      .map((segmentId) => state.segments.byId[segmentId])
      .filter((segment): segment is NonNullable<typeof segment> => segment !== undefined)
  );

  const nextWiresById: Record<WireId, Wire> = { ...state.wires.byId };

  for (const wireId of state.wires.allIds) {
    const wire = state.wires.byId[wireId];
    if (wire === undefined) {
      continue;
    }

    const startNodeId = findNodeIdForEndpoint(state, wire.endpointA);
    const endNodeId = findNodeIdForEndpoint(state, wire.endpointB);
    if (startNodeId === undefined || endNodeId === undefined) {
      return { error: `Wire '${wire.technicalId}' has endpoints not mapped to graph nodes.` };
    }

    if (wire.isRouteLocked) {
      const forcedLength = computeForcedRouteLength(state, startNodeId, endNodeId, wire.routeSegmentIds);
      if (forcedLength === null) {
        return { error: `Locked route for wire '${wire.technicalId}' is no longer valid.` };
      }

      nextWiresById[wireId] = {
        ...wire,
        lengthMm: forcedLength
      };
      continue;
    }

    const shortestRoute = findShortestRoute(graph, startNodeId, endNodeId);
    if (shortestRoute === null) {
      return { error: `No route found for wire '${wire.technicalId}'.` };
    }

    nextWiresById[wireId] = {
      ...wire,
      routeSegmentIds: shortestRoute.segmentIds,
      lengthMm: shortestRoute.totalLengthMm,
      isRouteLocked: false
    };
  }

  return {
    wires: {
      byId: nextWiresById,
      allIds: state.wires.allIds
    }
  };
}
