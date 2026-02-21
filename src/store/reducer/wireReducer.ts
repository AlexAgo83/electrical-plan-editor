import type { NodeId, SegmentId, Wire, WireEndpoint, WireId } from "../../core/entities";
import { buildRoutingGraphIndex } from "../../core/graph";
import { findShortestRoute } from "../../core/pathfinding";
import type { AppAction } from "../actions";
import type { AppState, EntityState } from "../types";
import { bumpRevision, clearLastError, removeEntity, shouldClearSelection, upsertEntity, withError } from "./shared";

function hasDuplicateWireTechnicalId(state: AppState, wireId: string, technicalId: string): boolean {
  return state.wires.allIds.some((id) => {
    if (id === wireId) {
      return false;
    }

    const wire = state.wires.byId[id];
    if (wire === undefined) {
      return false;
    }

    return wire.technicalId === technicalId;
  });
}

function getEndpointKey(endpoint: WireEndpoint): string {
  if (endpoint.kind === "connectorCavity") {
    return `connector:${endpoint.connectorId}:${endpoint.cavityIndex}`;
  }

  return `splice:${endpoint.spliceId}:${endpoint.portIndex}`;
}

function getWireEndpointOccupantRef(wireId: WireId, side: "A" | "B"): string {
  return `wire:${wireId}:${side}`;
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

function getEndpointValidationError(state: AppState, endpoint: WireEndpoint): string | null {
  if (endpoint.kind === "connectorCavity") {
    const connector = state.connectors.byId[endpoint.connectorId];
    if (connector === undefined) {
      return "Wire endpoint references an unknown connector.";
    }

    if (!Number.isInteger(endpoint.cavityIndex) || endpoint.cavityIndex < 1 || endpoint.cavityIndex > connector.cavityCount) {
      return "Wire connector cavity endpoint is out of range.";
    }

    return null;
  }

  const splice = state.splices.byId[endpoint.spliceId];
  if (splice === undefined) {
    return "Wire endpoint references an unknown splice.";
  }

  if (!Number.isInteger(endpoint.portIndex) || endpoint.portIndex < 1 || endpoint.portIndex > splice.portCount) {
    return "Wire splice port endpoint is out of range.";
  }

  return null;
}

function getEndpointOccupant(
  connectorCavityOccupancy: AppState["connectorCavityOccupancy"],
  splicePortOccupancy: AppState["splicePortOccupancy"],
  endpoint: WireEndpoint
): string | undefined {
  if (endpoint.kind === "connectorCavity") {
    return connectorCavityOccupancy[endpoint.connectorId]?.[endpoint.cavityIndex];
  }

  return splicePortOccupancy[endpoint.spliceId]?.[endpoint.portIndex];
}

function setEndpointOccupant(
  connectorCavityOccupancy: AppState["connectorCavityOccupancy"],
  splicePortOccupancy: AppState["splicePortOccupancy"],
  endpoint: WireEndpoint,
  occupantRef: string
): void {
  if (endpoint.kind === "connectorCavity") {
    const connectorOccupancy = { ...(connectorCavityOccupancy[endpoint.connectorId] ?? {}) };
    connectorOccupancy[endpoint.cavityIndex] = occupantRef;
    connectorCavityOccupancy[endpoint.connectorId] = connectorOccupancy;
    return;
  }

  const spliceOccupancy = { ...(splicePortOccupancy[endpoint.spliceId] ?? {}) };
  spliceOccupancy[endpoint.portIndex] = occupantRef;
  splicePortOccupancy[endpoint.spliceId] = spliceOccupancy;
}

function releaseEndpointOccupant(
  connectorCavityOccupancy: AppState["connectorCavityOccupancy"],
  splicePortOccupancy: AppState["splicePortOccupancy"],
  endpoint: WireEndpoint,
  expectedOccupantRef: string
): void {
  if (endpoint.kind === "connectorCavity") {
    const connectorOccupancy = connectorCavityOccupancy[endpoint.connectorId];
    if (connectorOccupancy === undefined || connectorOccupancy[endpoint.cavityIndex] !== expectedOccupantRef) {
      return;
    }

    const nextConnectorOccupancy = { ...connectorOccupancy };
    delete nextConnectorOccupancy[endpoint.cavityIndex];
    if (Object.keys(nextConnectorOccupancy).length === 0) {
      delete connectorCavityOccupancy[endpoint.connectorId];
    } else {
      connectorCavityOccupancy[endpoint.connectorId] = nextConnectorOccupancy;
    }

    return;
  }

  const spliceOccupancy = splicePortOccupancy[endpoint.spliceId];
  if (spliceOccupancy === undefined || spliceOccupancy[endpoint.portIndex] !== expectedOccupantRef) {
    return;
  }

  const nextSpliceOccupancy = { ...spliceOccupancy };
  delete nextSpliceOccupancy[endpoint.portIndex];
  if (Object.keys(nextSpliceOccupancy).length === 0) {
    delete splicePortOccupancy[endpoint.spliceId];
  } else {
    splicePortOccupancy[endpoint.spliceId] = nextSpliceOccupancy;
  }
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

export function handleWireActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "wire/save": {
      const normalizedName = action.payload.name.trim();
      const normalizedTechnicalId = action.payload.technicalId.trim();
      if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
        return withError(state, "Wire name and technical ID are required.");
      }

      if (hasDuplicateWireTechnicalId(state, action.payload.id, normalizedTechnicalId)) {
        return withError(state, `Wire technical ID '${normalizedTechnicalId}' is already used.`);
      }

      const endpointAError = getEndpointValidationError(state, action.payload.endpointA);
      if (endpointAError !== null) {
        return withError(state, endpointAError);
      }

      const endpointBError = getEndpointValidationError(state, action.payload.endpointB);
      if (endpointBError !== null) {
        return withError(state, endpointBError);
      }

      if (getEndpointKey(action.payload.endpointA) === getEndpointKey(action.payload.endpointB)) {
        return withError(state, "Wire endpoints must be different.");
      }

      const startNodeId = findNodeIdForEndpoint(state, action.payload.endpointA);
      const endNodeId = findNodeIdForEndpoint(state, action.payload.endpointB);
      if (startNodeId === undefined || endNodeId === undefined) {
        return withError(state, "Wire endpoints must be mapped to routing graph nodes.");
      }

      const existingWire = state.wires.byId[action.payload.id];
      const graph = buildRoutingGraphIndex(
        state.nodes.allIds
          .map((nodeId) => state.nodes.byId[nodeId])
          .filter((node): node is NonNullable<typeof node> => node !== undefined),
        state.segments.allIds
          .map((segmentId) => state.segments.byId[segmentId])
          .filter((segment): segment is NonNullable<typeof segment> => segment !== undefined)
      );

      let routeSegmentIds: SegmentId[] = [];
      let lengthMm = 0;
      let isRouteLocked = false;

      const sameEndpointsAsExisting =
        existingWire !== undefined &&
        getEndpointKey(existingWire.endpointA) === getEndpointKey(action.payload.endpointA) &&
        getEndpointKey(existingWire.endpointB) === getEndpointKey(action.payload.endpointB);

      if (existingWire !== undefined && existingWire.isRouteLocked && sameEndpointsAsExisting) {
        const forcedLength = computeForcedRouteLength(state, startNodeId, endNodeId, existingWire.routeSegmentIds);
        if (forcedLength === null) {
          return withError(state, "Existing locked route is invalid for the current network.");
        }

        routeSegmentIds = existingWire.routeSegmentIds;
        lengthMm = forcedLength;
        isRouteLocked = true;
      } else {
        const shortestRoute = findShortestRoute(graph, startNodeId, endNodeId);
        if (shortestRoute === null) {
          return withError(state, "No valid route was found between selected wire endpoints.");
        }

        routeSegmentIds = shortestRoute.segmentIds;
        lengthMm = shortestRoute.totalLengthMm;
        isRouteLocked = false;
      }

      const nextConnectorCavityOccupancy = { ...state.connectorCavityOccupancy };
      const nextSplicePortOccupancy = { ...state.splicePortOccupancy };

      if (existingWire !== undefined) {
        releaseEndpointOccupant(
          nextConnectorCavityOccupancy,
          nextSplicePortOccupancy,
          existingWire.endpointA,
          getWireEndpointOccupantRef(existingWire.id, "A")
        );
        releaseEndpointOccupant(
          nextConnectorCavityOccupancy,
          nextSplicePortOccupancy,
          existingWire.endpointB,
          getWireEndpointOccupantRef(existingWire.id, "B")
        );
      }

      const endpointAOccupant = getEndpointOccupant(
        nextConnectorCavityOccupancy,
        nextSplicePortOccupancy,
        action.payload.endpointA
      );
      const endpointBOccupant = getEndpointOccupant(
        nextConnectorCavityOccupancy,
        nextSplicePortOccupancy,
        action.payload.endpointB
      );
      const endpointAOccupantRef = getWireEndpointOccupantRef(action.payload.id, "A");
      const endpointBOccupantRef = getWireEndpointOccupantRef(action.payload.id, "B");

      if (
        endpointAOccupant !== undefined &&
        endpointAOccupant !== endpointAOccupantRef &&
        endpointAOccupant !== endpointBOccupantRef
      ) {
        return withError(state, "Wire endpoint A is already occupied.");
      }

      if (
        endpointBOccupant !== undefined &&
        endpointBOccupant !== endpointAOccupantRef &&
        endpointBOccupant !== endpointBOccupantRef
      ) {
        return withError(state, "Wire endpoint B is already occupied.");
      }

      setEndpointOccupant(
        nextConnectorCavityOccupancy,
        nextSplicePortOccupancy,
        action.payload.endpointA,
        endpointAOccupantRef
      );
      setEndpointOccupant(
        nextConnectorCavityOccupancy,
        nextSplicePortOccupancy,
        action.payload.endpointB,
        endpointBOccupantRef
      );

      return bumpRevision({
        ...clearLastError(state),
        connectorCavityOccupancy: nextConnectorCavityOccupancy,
        splicePortOccupancy: nextSplicePortOccupancy,
        wires: upsertEntity(state.wires, {
          id: action.payload.id,
          name: normalizedName,
          technicalId: normalizedTechnicalId,
          endpointA: action.payload.endpointA,
          endpointB: action.payload.endpointB,
          routeSegmentIds,
          lengthMm,
          isRouteLocked
        })
      });
    }

    case "wire/lockRoute": {
      const wire = state.wires.byId[action.payload.id];
      if (wire === undefined) {
        return withError(state, "Cannot lock route for unknown wire.");
      }

      const startNodeId = findNodeIdForEndpoint(state, wire.endpointA);
      const endNodeId = findNodeIdForEndpoint(state, wire.endpointB);
      if (startNodeId === undefined || endNodeId === undefined) {
        return withError(state, "Cannot lock route: wire endpoints are not mapped to graph nodes.");
      }

      const forcedLength = computeForcedRouteLength(state, startNodeId, endNodeId, action.payload.segmentIds);
      if (forcedLength === null) {
        return withError(state, "Forced route is invalid for selected wire endpoints.");
      }

      return bumpRevision({
        ...clearLastError(state),
        wires: upsertEntity(state.wires, {
          ...wire,
          routeSegmentIds: [...action.payload.segmentIds],
          lengthMm: forcedLength,
          isRouteLocked: true
        })
      });
    }

    case "wire/resetRoute": {
      const wire = state.wires.byId[action.payload.id];
      if (wire === undefined) {
        return withError(state, "Cannot reset route for unknown wire.");
      }

      const startNodeId = findNodeIdForEndpoint(state, wire.endpointA);
      const endNodeId = findNodeIdForEndpoint(state, wire.endpointB);
      if (startNodeId === undefined || endNodeId === undefined) {
        return withError(state, "Cannot reset route: wire endpoints are not mapped to graph nodes.");
      }

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
        return withError(state, "No valid shortest route was found for this wire.");
      }

      return bumpRevision({
        ...clearLastError(state),
        wires: upsertEntity(state.wires, {
          ...wire,
          routeSegmentIds: shortestRoute.segmentIds,
          lengthMm: shortestRoute.totalLengthMm,
          isRouteLocked: false
        })
      });
    }

    case "wire/upsert": {
      return bumpRevision({
        ...clearLastError(state),
        wires: upsertEntity(state.wires, action.payload)
      });
    }

    case "wire/remove": {
      const wire = state.wires.byId[action.payload.id];
      if (wire === undefined) {
        return clearLastError(state);
      }

      const nextConnectorCavityOccupancy = { ...state.connectorCavityOccupancy };
      const nextSplicePortOccupancy = { ...state.splicePortOccupancy };
      releaseEndpointOccupant(
        nextConnectorCavityOccupancy,
        nextSplicePortOccupancy,
        wire.endpointA,
        getWireEndpointOccupantRef(wire.id, "A")
      );
      releaseEndpointOccupant(
        nextConnectorCavityOccupancy,
        nextSplicePortOccupancy,
        wire.endpointB,
        getWireEndpointOccupantRef(wire.id, "B")
      );

      return bumpRevision({
        ...clearLastError(state),
        connectorCavityOccupancy: nextConnectorCavityOccupancy,
        splicePortOccupancy: nextSplicePortOccupancy,
        wires: removeEntity(state.wires, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "wire", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    default:
      return null;
  }
}
