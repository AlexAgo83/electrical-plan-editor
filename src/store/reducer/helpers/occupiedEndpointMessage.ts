import type { WireEndpoint, WireId } from "../../../core/entities";
import type { AppState } from "../../types";

/** Resolve stored occupancy refs to the names and technical IDs visible in Modeling. */
export function occupiedEndpointMessage(state: AppState, endpoint: WireEndpoint, refs: string[]): string {
  const occupants = refs.map((ref) => {
    const match = /^wire:(.*):[AB]$/.exec(ref);
    const wire = match === null ? undefined : state.wires.byId[match[1] as WireId];
    return wire === undefined ? `'${ref}'` : `wire ${wire.name} (${wire.technicalId})`;
  }).join(", ");
  if (endpoint.kind === "connectorCavity") {
    const connector = state.connectors.byId[endpoint.connectorId];
    const label = connector === undefined ? endpoint.connectorId : `${connector.name} (${connector.technicalId})`;
    return `Way ${endpoint.cavityIndex} of connector ${label} is already occupied by ${occupants}.`;
  }
  const splice = state.splices.byId[endpoint.spliceId];
  const label = splice === undefined ? endpoint.spliceId : `${splice.name} (${splice.technicalId})`;
  return `Port ${endpoint.portIndex} of splice ${label} is already occupied by ${occupants}.`;
}
