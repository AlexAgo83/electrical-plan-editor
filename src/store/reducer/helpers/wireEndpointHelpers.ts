import type { NodeId, WireEndpoint } from "../../../core/entities";
import { isSplicePortIndexValid } from "../../../core/splicePortMode";
import type { AppState } from "../../types";
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

  if (!isSplicePortIndexValid(splice, endpoint.portIndex)) {
    return "Wire splice port endpoint is out of range.";
  }

  return null;
}
