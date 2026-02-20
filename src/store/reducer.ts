import type { AppAction } from "./actions";
import type { AppState, EntityState, SelectionState } from "./types";

function sortIds<Id extends string>(ids: Id[]): Id[] {
  return [...ids].sort((left, right) => left.localeCompare(right));
}

function upsertEntity<T extends { id: Id }, Id extends string>(
  state: EntityState<T, Id>,
  entity: T
): EntityState<T, Id> {
  const existing = state.byId[entity.id];
  const byId = {
    ...state.byId,
    [entity.id]: entity
  };

  if (existing !== undefined) {
    return {
      byId,
      allIds: state.allIds
    };
  }

  return {
    byId,
    allIds: sortIds([...state.allIds, entity.id])
  };
}

function removeEntity<T, Id extends string>(state: EntityState<T, Id>, id: Id): EntityState<T, Id> {
  if (state.byId[id] === undefined) {
    return state;
  }

  const byId = { ...state.byId };
  delete byId[id];

  return {
    byId,
    allIds: state.allIds.filter((candidate) => candidate !== id)
  };
}

function shouldClearSelection(selected: SelectionState | null, kind: SelectionState["kind"], id: string): boolean {
  return selected?.kind === kind && selected.id === id;
}

function clearLastError(state: AppState): AppState {
  if (state.ui.lastError === null) {
    return state;
  }

  return {
    ...state,
    ui: {
      ...state.ui,
      lastError: null
    }
  };
}

function withError(state: AppState, message: string): AppState {
  if (state.ui.lastError === message) {
    return state;
  }

  return bumpRevision({
    ...state,
    ui: {
      ...state.ui,
      lastError: message
    }
  });
}

function isValidSlotIndex(index: number, max: number): boolean {
  return Number.isInteger(index) && index >= 1 && index <= max;
}

function hasDuplicateConnectorTechnicalId(state: AppState, connectorId: string, technicalId: string): boolean {
  return state.connectors.allIds.some((id) => {
    if (id === connectorId) {
      return false;
    }

    const connector = state.connectors.byId[id];
    if (connector === undefined) {
      return false;
    }

    return connector.technicalId === technicalId;
  });
}

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

function bumpRevision(state: AppState): AppState {
  return {
    ...state,
    meta: {
      revision: state.meta.revision + 1
    }
  };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "connector/upsert": {
      const cavityCount = action.payload.cavityCount;
      if (!Number.isInteger(cavityCount) || cavityCount < 1) {
        return withError(state, "Connector cavityCount must be an integer >= 1.");
      }

      if (hasDuplicateConnectorTechnicalId(state, action.payload.id, action.payload.technicalId)) {
        return withError(state, `Connector technical ID '${action.payload.technicalId}' is already used.`);
      }

      const occupancy = state.connectorCavityOccupancy[action.payload.id];
      if (occupancy !== undefined) {
        const hasOutOfRangeOccupancy = Object.keys(occupancy)
          .map((key) => Number(key))
          .some((slot) => slot > cavityCount);

        if (hasOutOfRangeOccupancy) {
          return withError(
            state,
            "Connector cavityCount cannot be reduced below occupied cavity indexes."
          );
        }
      }

      return bumpRevision({
        ...clearLastError(state),
        connectors: upsertEntity(state.connectors, action.payload)
      });
    }

    case "connector/remove": {
      const nextConnectorCavityOccupancy = { ...state.connectorCavityOccupancy };
      delete nextConnectorCavityOccupancy[action.payload.id];

      return bumpRevision({
        ...clearLastError(state),
        connectors: removeEntity(state.connectors, action.payload.id),
        connectorCavityOccupancy: nextConnectorCavityOccupancy,
        ui: shouldClearSelection(state.ui.selected, "connector", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    case "connector/occupyCavity": {
      const connector = state.connectors.byId[action.payload.connectorId];
      if (connector === undefined) {
        return withError(state, "Cannot occupy cavity on unknown connector.");
      }

      if (!isValidSlotIndex(action.payload.cavityIndex, connector.cavityCount)) {
        return withError(state, "Connector cavity index is out of range.");
      }

      const occupantRef = action.payload.occupantRef.trim();
      if (occupantRef.length === 0) {
        return withError(state, "Occupant reference must be non-empty.");
      }

      const connectorOccupancy = state.connectorCavityOccupancy[action.payload.connectorId] ?? {};
      const currentOccupant = connectorOccupancy[action.payload.cavityIndex];
      if (currentOccupant !== undefined && currentOccupant !== occupantRef) {
        return withError(
          state,
          `Cavity ${action.payload.cavityIndex} is already occupied by '${currentOccupant}'.`
        );
      }

      if (currentOccupant === occupantRef && state.ui.lastError === null) {
        return state;
      }

      return bumpRevision({
        ...clearLastError(state),
        connectorCavityOccupancy: {
          ...state.connectorCavityOccupancy,
          [action.payload.connectorId]: {
            ...connectorOccupancy,
            [action.payload.cavityIndex]: occupantRef
          }
        }
      });
    }

    case "connector/releaseCavity": {
      const connector = state.connectors.byId[action.payload.connectorId];
      if (connector === undefined) {
        return withError(state, "Cannot release cavity on unknown connector.");
      }

      if (!isValidSlotIndex(action.payload.cavityIndex, connector.cavityCount)) {
        return withError(state, "Connector cavity index is out of range.");
      }

      const connectorOccupancy = state.connectorCavityOccupancy[action.payload.connectorId];
      if (connectorOccupancy === undefined || connectorOccupancy[action.payload.cavityIndex] === undefined) {
        return clearLastError(state);
      }

      const nextConnectorOccupancy = { ...connectorOccupancy };
      delete nextConnectorOccupancy[action.payload.cavityIndex];

      const nextConnectorCavityOccupancy = { ...state.connectorCavityOccupancy };
      if (Object.keys(nextConnectorOccupancy).length === 0) {
        delete nextConnectorCavityOccupancy[action.payload.connectorId];
      } else {
        nextConnectorCavityOccupancy[action.payload.connectorId] = nextConnectorOccupancy;
      }

      return bumpRevision({
        ...clearLastError(state),
        connectorCavityOccupancy: nextConnectorCavityOccupancy
      });
    }

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

    case "node/upsert": {
      return bumpRevision({
        ...clearLastError(state),
        nodes: upsertEntity(state.nodes, action.payload)
      });
    }

    case "node/remove": {
      return bumpRevision({
        ...clearLastError(state),
        nodes: removeEntity(state.nodes, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "node", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    case "segment/upsert": {
      return bumpRevision({
        ...clearLastError(state),
        segments: upsertEntity(state.segments, action.payload)
      });
    }

    case "segment/remove": {
      return bumpRevision({
        ...clearLastError(state),
        segments: removeEntity(state.segments, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "segment", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    case "wire/upsert": {
      return bumpRevision({
        ...clearLastError(state),
        wires: upsertEntity(state.wires, action.payload)
      });
    }

    case "wire/remove": {
      return bumpRevision({
        ...clearLastError(state),
        wires: removeEntity(state.wires, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "wire", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    case "ui/select": {
      return bumpRevision({
        ...clearLastError(state),
        ui: {
          ...state.ui,
          selected: action.payload,
          lastError: null
        }
      });
    }

    case "ui/clearSelection": {
      if (state.ui.selected === null) {
        return clearLastError(state);
      }

      return bumpRevision({
        ...clearLastError(state),
        ui: {
          ...state.ui,
          selected: null,
          lastError: null
        }
      });
    }

    case "ui/clearError": {
      return clearLastError(state);
    }

    default: {
      const unhandled: never = action;
      return unhandled;
    }
  }
}
