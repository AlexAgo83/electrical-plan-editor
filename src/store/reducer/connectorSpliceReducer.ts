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

function hasConnectorNodeReference(state: AppState, connectorId: string): boolean {
  return state.nodes.allIds.some((id) => {
    const node = state.nodes.byId[id];
    return node?.kind === "connector" && node.connectorId === connectorId;
  });
}

function hasSpliceNodeReference(state: AppState, spliceId: string): boolean {
  return state.nodes.allIds.some((id) => {
    const node = state.nodes.byId[id];
    return node?.kind === "splice" && node.spliceId === spliceId;
  });
}

function hasWireEndpointReferenceOnConnector(state: AppState, connectorId: string): boolean {
  return state.wires.allIds.some((id) => {
    const wire = state.wires.byId[id];
    if (wire === undefined) {
      return false;
    }

    return (
      (wire.endpointA.kind === "connectorCavity" && wire.endpointA.connectorId === connectorId) ||
      (wire.endpointB.kind === "connectorCavity" && wire.endpointB.connectorId === connectorId)
    );
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

export function handleConnectorSpliceActions(state: AppState, action: AppAction): AppState | null {
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
      if (hasConnectorNodeReference(state, action.payload.id)) {
        return withError(state, "Cannot remove connector while a connector node references it.");
      }
      if (hasWireEndpointReferenceOnConnector(state, action.payload.id)) {
        return withError(state, "Cannot remove connector while wire endpoints reference it.");
      }

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
