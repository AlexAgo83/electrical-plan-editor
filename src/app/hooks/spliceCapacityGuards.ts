import type { SpliceId } from "../../core/entities";
import type { AppStore } from "../../store";

export function hasSpliceOccupancyIndexAboveLimit(store: AppStore, spliceId: SpliceId, maxPortCount: number): boolean {
  const occupancy = store.getState().splicePortOccupancy[spliceId];
  if (occupancy === undefined) {
    return false;
  }
  return Object.keys(occupancy)
    .map((key) => Number(key))
    .some((index) => Number.isFinite(index) && index > maxPortCount);
}

export function hasSpliceWireEndpointIndexAboveLimit(store: AppStore, spliceId: SpliceId, maxPortCount: number): boolean {
  const state = store.getState();
  return state.wires.allIds.some((wireId) => {
    const wire = state.wires.byId[wireId];
    if (wire === undefined) {
      return false;
    }
    return (
      (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === spliceId && wire.endpointA.portIndex > maxPortCount) ||
      (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === spliceId && wire.endpointB.portIndex > maxPortCount)
    );
  });
}
