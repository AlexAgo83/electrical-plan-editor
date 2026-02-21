import type { SegmentId } from "../../core/entities";
import { buildRoutingGraphIndex } from "../../core/graph";
import { findShortestRoute } from "../../core/pathfinding";
import type { AppAction } from "../actions";
import type { AppState } from "../types";
import {
  getEndpointOccupant,
  getWireEndpointOccupantRef,
  releaseEndpointOccupant,
  setEndpointOccupant,
  type EndpointOccupancyState
} from "./helpers/occupancy";
import {
  computeForcedRouteLength,
  findNodeIdForEndpoint,
  getEndpointKey,
  getEndpointValidationError
} from "./helpers/wireTransitions";
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

      let occupancyState: EndpointOccupancyState = {
        connectorCavityOccupancy: state.connectorCavityOccupancy,
        splicePortOccupancy: state.splicePortOccupancy
      };

      if (existingWire !== undefined) {
        occupancyState = releaseEndpointOccupant(
          occupancyState,
          existingWire.endpointA,
          getWireEndpointOccupantRef(existingWire.id, "A")
        );
        occupancyState = releaseEndpointOccupant(
          occupancyState,
          existingWire.endpointB,
          getWireEndpointOccupantRef(existingWire.id, "B")
        );
      }

      const endpointAOccupant = getEndpointOccupant(occupancyState, action.payload.endpointA);
      const endpointBOccupant = getEndpointOccupant(occupancyState, action.payload.endpointB);
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

      occupancyState = setEndpointOccupant(occupancyState, action.payload.endpointA, endpointAOccupantRef);
      occupancyState = setEndpointOccupant(occupancyState, action.payload.endpointB, endpointBOccupantRef);

      return bumpRevision({
        ...clearLastError(state),
        connectorCavityOccupancy: occupancyState.connectorCavityOccupancy,
        splicePortOccupancy: occupancyState.splicePortOccupancy,
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

      let occupancyState: EndpointOccupancyState = {
        connectorCavityOccupancy: state.connectorCavityOccupancy,
        splicePortOccupancy: state.splicePortOccupancy
      };
      occupancyState = releaseEndpointOccupant(occupancyState, wire.endpointA, getWireEndpointOccupantRef(wire.id, "A"));
      occupancyState = releaseEndpointOccupant(occupancyState, wire.endpointB, getWireEndpointOccupantRef(wire.id, "B"));

      return bumpRevision({
        ...clearLastError(state),
        connectorCavityOccupancy: occupancyState.connectorCavityOccupancy,
        splicePortOccupancy: occupancyState.splicePortOccupancy,
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
