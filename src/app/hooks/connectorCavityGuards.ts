import type { ConnectorId } from "../../core/entities";
import type { AppStore } from "../../store";

export function hasConnectorOccupancyIndexAboveLimit(store: AppStore, connectorId: ConnectorId, maxCavityCount: number): boolean {
  const occupancy = store.getState().connectorCavityOccupancy[connectorId];
  if (occupancy === undefined) {
    return false;
  }
  return Object.keys(occupancy)
    .map((key) => Number(key))
    .some((index) => Number.isFinite(index) && index > maxCavityCount);
}

export function hasConnectorWireEndpointIndexAboveLimit(store: AppStore, connectorId: ConnectorId, maxCavityCount: number): boolean {
  const state = store.getState();
  return state.wires.allIds.some((wireId) => {
    const wire = state.wires.byId[wireId];
    if (wire === undefined) {
      return false;
    }
    return (
      (wire.endpointA.kind === "connectorCavity" && wire.endpointA.connectorId === connectorId && wire.endpointA.cavityIndex > maxCavityCount) ||
      (wire.endpointB.kind === "connectorCavity" && wire.endpointB.connectorId === connectorId && wire.endpointB.cavityIndex > maxCavityCount)
    );
  });
}
