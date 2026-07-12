import type { WireEndpoint } from "../../../core/entities";
import { resolveSplicePortMode } from "../../../core/splicePortMode";
import type { AppState } from "../../types";
import { isValidSlotIndex } from "../shared";

function isDirectionalSpliceEndpoint(state: AppState, endpoint: WireEndpoint): boolean {
  if (endpoint.kind !== "splicePort") {
    return false;
  }

  const splice = state.splices.byId[endpoint.spliceId];
  return splice !== undefined && resolveSplicePortMode(splice) === "directional";
}

export function isEndpointOccupancyExclusive(state: AppState, endpoint: WireEndpoint): boolean {
  return !isDirectionalSpliceEndpoint(state, endpoint);
}

export function canWriteEndpointOccupancy(state: AppState, endpoint: WireEndpoint): boolean {
  if (endpoint.kind === "connectorCavity") {
    const connector = state.connectors.byId[endpoint.connectorId];
    if (connector === undefined) {
      console.warn("Rejected wire occupancy write for missing connector endpoint.", {
        connectorId: endpoint.connectorId,
        cavityIndex: endpoint.cavityIndex
      });
      return false;
    }

    if (!isValidSlotIndex(endpoint.cavityIndex, connector.cavityCount)) {
      console.warn("Rejected wire occupancy write with out-of-range connector cavity index.", {
        connectorId: endpoint.connectorId,
        cavityIndex: endpoint.cavityIndex,
        cavityCount: connector.cavityCount
      });
      return false;
    }

    return true;
  }

  const splice = state.splices.byId[endpoint.spliceId];
  if (splice === undefined) {
    console.warn("Rejected wire occupancy write for missing splice endpoint.", {
      spliceId: endpoint.spliceId,
      portIndex: endpoint.portIndex
    });
    return false;
  }

  const portMode = resolveSplicePortMode(splice);
  const isValidPortIndex =
    portMode === "unbounded"
      ? Number.isInteger(endpoint.portIndex) && endpoint.portIndex >= 1
      : portMode === "directional"
        ? endpoint.portIndex === 1 || endpoint.portIndex === 2
        : isValidSlotIndex(endpoint.portIndex, splice.portCount);
  if (!isValidPortIndex) {
    console.warn("Rejected wire occupancy write with out-of-range splice port index.", {
      spliceId: endpoint.spliceId,
      portIndex: endpoint.portIndex,
      portMode,
      portCount: splice.portCount
    });
    return false;
  }

  return true;
}
