import type { AppAction } from "../actions";
import type { AppState } from "../types";
import {
  bumpRevision,
  clearLastError,
  isValidSlotIndex,
  removeEntity,
  shouldClearSelection,
  upsertEntity,
  withError
} from "./shared";

function hasDuplicateSpliceTechnicalId(state: AppState, spliceId: string, technicalId: string): boolean {
  return state.splices.allIds.some((id) => {
    if (id === spliceId) {
      return false;
    }

    const splice = state.splices.byId[id];
    if (splice === undefined) {
      return false;
    }

    return splice.technicalId === technicalId;
  });
}

function hasSpliceNodeReference(state: AppState, spliceId: string): boolean {
  return state.nodes.allIds.some((id) => {
    const node = state.nodes.byId[id];
    return node?.kind === "splice" && node.spliceId === spliceId;
  });
}

function hasWireEndpointReferenceOnSplice(state: AppState, spliceId: string): boolean {
  return state.wires.allIds.some((id) => {
    const wire = state.wires.byId[id];
    if (wire === undefined) {
      return false;
    }

    return (
      (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === spliceId) ||
      (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === spliceId)
    );
  });
}

export function handleSpliceActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "splice/upsert": {
      const portCount = action.payload.portCount;
      if (!Number.isInteger(portCount) || portCount < 1) {
        return withError(state, "Splice portCount must be an integer >= 1.");
      }

      if (hasDuplicateSpliceTechnicalId(state, action.payload.id, action.payload.technicalId)) {
        return withError(state, `Splice technical ID '${action.payload.technicalId}' is already used.`);
      }

      const occupancy = state.splicePortOccupancy[action.payload.id];
      if (occupancy !== undefined) {
        const hasOutOfRangeOccupancy = Object.keys(occupancy)
          .map((key) => Number(key))
          .some((slot) => slot > portCount);

        if (hasOutOfRangeOccupancy) {
          return withError(
            state,
            "Splice portCount cannot be reduced below occupied port indexes."
          );
        }
      }

      return bumpRevision({
        ...clearLastError(state),
        splices: upsertEntity(state.splices, action.payload)
      });
    }

    case "splice/remove": {
      if (hasSpliceNodeReference(state, action.payload.id)) {
        return withError(state, "Cannot remove splice while a splice node references it.");
      }
      if (hasWireEndpointReferenceOnSplice(state, action.payload.id)) {
        return withError(state, "Cannot remove splice while wire endpoints reference it.");
      }

      const nextSplicePortOccupancy = { ...state.splicePortOccupancy };
      delete nextSplicePortOccupancy[action.payload.id];

      return bumpRevision({
        ...clearLastError(state),
        splices: removeEntity(state.splices, action.payload.id),
        splicePortOccupancy: nextSplicePortOccupancy,
        ui: shouldClearSelection(state.ui.selected, "splice", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    case "splice/occupyPort": {
      const splice = state.splices.byId[action.payload.spliceId];
      if (splice === undefined) {
        return withError(state, "Cannot occupy port on unknown splice.");
      }

      if (!isValidSlotIndex(action.payload.portIndex, splice.portCount)) {
        return withError(state, "Splice port index is out of range.");
      }

      const occupantRef = action.payload.occupantRef.trim();
      if (occupantRef.length === 0) {
        return withError(state, "Occupant reference must be non-empty.");
      }

      const spliceOccupancy = state.splicePortOccupancy[action.payload.spliceId] ?? {};
      const currentOccupant = spliceOccupancy[action.payload.portIndex];
      if (currentOccupant !== undefined && currentOccupant !== occupantRef) {
        return withError(
          state,
          `Port ${action.payload.portIndex} is already occupied by '${currentOccupant}'.`
        );
      }

      if (currentOccupant === occupantRef && state.ui.lastError === null) {
        return state;
      }

      return bumpRevision({
        ...clearLastError(state),
        splicePortOccupancy: {
          ...state.splicePortOccupancy,
          [action.payload.spliceId]: {
            ...spliceOccupancy,
            [action.payload.portIndex]: occupantRef
          }
        }
      });
    }

    case "splice/releasePort": {
      const splice = state.splices.byId[action.payload.spliceId];
      if (splice === undefined) {
        return withError(state, "Cannot release port on unknown splice.");
      }

      if (!isValidSlotIndex(action.payload.portIndex, splice.portCount)) {
        return withError(state, "Splice port index is out of range.");
      }

      const spliceOccupancy = state.splicePortOccupancy[action.payload.spliceId];
      if (spliceOccupancy === undefined || spliceOccupancy[action.payload.portIndex] === undefined) {
        return clearLastError(state);
      }

      const nextSpliceOccupancy = { ...spliceOccupancy };
      delete nextSpliceOccupancy[action.payload.portIndex];

      const nextSplicePortOccupancy = { ...state.splicePortOccupancy };
      if (Object.keys(nextSpliceOccupancy).length === 0) {
        delete nextSplicePortOccupancy[action.payload.spliceId];
      } else {
        nextSplicePortOccupancy[action.payload.spliceId] = nextSpliceOccupancy;
      }

      return bumpRevision({
        ...clearLastError(state),
        splicePortOccupancy: nextSplicePortOccupancy
      });
    }

    default:
      return null;
  }
}
