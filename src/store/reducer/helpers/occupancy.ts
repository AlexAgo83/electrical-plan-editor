import type { WireEndpoint, WireId } from "../../../core/entities";
import type { AppState } from "../../types";

export interface EndpointOccupancyState {
  connectorCavityOccupancy: AppState["connectorCavityOccupancy"];
  splicePortOccupancy: AppState["splicePortOccupancy"];
}

export function getWireEndpointOccupantRef(wireId: WireId, side: "A" | "B"): string {
  return `wire:${wireId}:${side}`;
}

export function getEndpointOccupant(state: EndpointOccupancyState, endpoint: WireEndpoint): string | undefined {
  if (endpoint.kind === "connectorCavity") {
    return state.connectorCavityOccupancy[endpoint.connectorId]?.[endpoint.cavityIndex];
  }

  return state.splicePortOccupancy[endpoint.spliceId]?.[endpoint.portIndex];
}

export function setEndpointOccupant(
  state: EndpointOccupancyState,
  endpoint: WireEndpoint,
  occupantRef: string
): EndpointOccupancyState {
  if (endpoint.kind === "connectorCavity") {
    return {
      connectorCavityOccupancy: {
        ...state.connectorCavityOccupancy,
        [endpoint.connectorId]: {
          ...(state.connectorCavityOccupancy[endpoint.connectorId] ?? {}),
          [endpoint.cavityIndex]: occupantRef
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
    if (connectorOccupancy === undefined || connectorOccupancy[endpoint.cavityIndex] !== expectedOccupantRef) {
      return state;
    }

    const nextConnectorOccupancy = { ...connectorOccupancy };
    delete nextConnectorOccupancy[endpoint.cavityIndex];

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
