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

function normalizeManufacturerReference(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return undefined;
  }

  return normalized.length > 120 ? normalized.slice(0, 120) : normalized;
}

function hasConnectorNodeReference(state: AppState, connectorId: string): boolean {
  return state.nodes.allIds.some((id) => {
    const node = state.nodes.byId[id];
    return node?.kind === "connector" && node.connectorId === connectorId;
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

export function handleConnectorActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "connector/upsert": {
      const normalizedName = action.payload.name.trim();
      const normalizedTechnicalId = action.payload.technicalId.trim();
      const cavityCount = action.payload.cavityCount;
      if (!Number.isInteger(cavityCount) || cavityCount < 1) {
        return withError(state, "Connector wayCount must be an integer >= 1.");
      }

      if (hasDuplicateConnectorTechnicalId(state, action.payload.id, normalizedTechnicalId)) {
        return withError(state, `Connector technical ID '${normalizedTechnicalId}' is already used.`);
      }

      const occupancy = state.connectorCavityOccupancy[action.payload.id];
      if (occupancy !== undefined) {
        const hasOutOfRangeOccupancy = Object.keys(occupancy)
          .map((key) => Number(key))
          .some((slot) => slot > cavityCount);

        if (hasOutOfRangeOccupancy) {
          return withError(
            state,
            "Connector wayCount cannot be reduced below occupied way indexes."
          );
        }
      }

      return bumpRevision({
        ...clearLastError(state),
        connectors: upsertEntity(state.connectors, {
          ...action.payload,
          name: normalizedName,
          technicalId: normalizedTechnicalId,
          manufacturerReference: normalizeManufacturerReference(action.payload.manufacturerReference)
        })
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
        return withError(state, "Cannot occupy way on unknown connector.");
      }

      if (!isValidSlotIndex(action.payload.cavityIndex, connector.cavityCount)) {
        return withError(state, "Connector way index is out of range.");
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
          `Way ${action.payload.cavityIndex} is already occupied by '${currentOccupant}'.`
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
        return withError(state, "Cannot release way on unknown connector.");
      }

      if (!isValidSlotIndex(action.payload.cavityIndex, connector.cavityCount)) {
        return withError(state, "Connector way index is out of range.");
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

    default:
      return null;
  }
}
