import type { WireEndpoint, WireId } from "../../../core/entities";
import { occupantsAt } from "../../../core/connectorOccupancy";
import type { AppState } from "../../types";

export interface EndpointOccupancyState {
  connectorCavityOccupancy: AppState["connectorCavityOccupancy"];
  splicePortOccupancy: AppState["splicePortOccupancy"];
}

export function getWireEndpointOccupantRef(wireId: WireId, side: "A" | "B"): string {
  return `wire:${wireId}:${side}`;
}

/**
 * All occupant refs held at an endpoint's slot. Connector ways can hold several
 * (shared way); splice ports hold at most one.
 */
export function getEndpointOccupants(state: EndpointOccupancyState, endpoint: WireEndpoint): string[] {
  if (endpoint.kind === "connectorCavity") {
    return occupantsAt(state.connectorCavityOccupancy[endpoint.connectorId]?.[endpoint.cavityIndex]);
  }

  const occupant = state.splicePortOccupancy[endpoint.spliceId]?.[endpoint.portIndex];
  return occupant !== undefined && occupant.length > 0 ? [occupant] : [];
}

export function setEndpointOccupant(
  state: EndpointOccupancyState,
  endpoint: WireEndpoint,
  occupantRef: string
): EndpointOccupancyState {
  if (endpoint.kind === "connectorCavity") {
    const current = occupantsAt(state.connectorCavityOccupancy[endpoint.connectorId]?.[endpoint.cavityIndex]);
    // Append the occupant (a shared way keeps every occupant); avoid duplicates.
    const next = current.includes(occupantRef) ? current : [...current, occupantRef];
    return {
      connectorCavityOccupancy: {
        ...state.connectorCavityOccupancy,
        [endpoint.connectorId]: {
          ...(state.connectorCavityOccupancy[endpoint.connectorId] ?? {}),
          [endpoint.cavityIndex]: next
        }
      },
      splicePortOccupancy: state.splicePortOccupancy
    };
  }

  return {
    connectorCavityOccupancy: state.connectorCavityOccupancy,
    splicePortOccupancy: {
      ...state.splicePortOccupancy,
      [endpoint.spliceId]: {
        ...(state.splicePortOccupancy[endpoint.spliceId] ?? {}),
        [endpoint.portIndex]: occupantRef
      }
    }
  };
}

export function releaseEndpointOccupant(
  state: EndpointOccupancyState,
  endpoint: WireEndpoint,
  expectedOccupantRef: string
): EndpointOccupancyState {
  if (endpoint.kind === "connectorCavity") {
    const connectorOccupancy = state.connectorCavityOccupancy[endpoint.connectorId];
    if (connectorOccupancy === undefined) {
      return state;
    }
    const current = occupantsAt(connectorOccupancy[endpoint.cavityIndex]);
    if (!current.includes(expectedOccupantRef)) {
      return state;
    }

    // Remove only this occupant — other wires sharing the way stay put.
    const remaining = current.filter((ref) => ref !== expectedOccupantRef);

    const nextConnectorOccupancy = { ...connectorOccupancy };
    if (remaining.length === 0) {
      delete nextConnectorOccupancy[endpoint.cavityIndex];
    } else {
      nextConnectorOccupancy[endpoint.cavityIndex] = remaining;
    }

    const nextConnectorCavityOccupancy = { ...state.connectorCavityOccupancy };
    if (Object.keys(nextConnectorOccupancy).length === 0) {
      delete nextConnectorCavityOccupancy[endpoint.connectorId];
    } else {
      nextConnectorCavityOccupancy[endpoint.connectorId] = nextConnectorOccupancy;
    }

    return {
      connectorCavityOccupancy: nextConnectorCavityOccupancy,
      splicePortOccupancy: state.splicePortOccupancy
    };
  }

  const spliceOccupancy = state.splicePortOccupancy[endpoint.spliceId];
  if (spliceOccupancy === undefined || spliceOccupancy[endpoint.portIndex] !== expectedOccupantRef) {
    return state;
  }

  const nextSpliceOccupancy = { ...spliceOccupancy };
  delete nextSpliceOccupancy[endpoint.portIndex];

  const nextSplicePortOccupancy = { ...state.splicePortOccupancy };
  if (Object.keys(nextSpliceOccupancy).length === 0) {
    delete nextSplicePortOccupancy[endpoint.spliceId];
  } else {
    nextSplicePortOccupancy[endpoint.spliceId] = nextSpliceOccupancy;
  }

  return {
    connectorCavityOccupancy: state.connectorCavityOccupancy,
    splicePortOccupancy: nextSplicePortOccupancy
  };
}
