import type { AppAction } from "../actions";
import { normalizeConnectorTerminalMaterial } from "../../core/connectorCatalogMaterials";
import { normalizePinElectricalRolesMap } from "../../core/pinElectricalRole";
import type { ConnectorTerminalMaterial, PinElectricalRole } from "../../core/entities";
import { analyzeConnectorDeleteImpact } from "../deleteImpact";
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

function normalizeApplyCatalogFlag(value: boolean | undefined): boolean | undefined {
  return value === false ? false : undefined;
}

function normalizeConnectorTerminalOverrides(
  overrides: Record<number, ConnectorTerminalMaterial> | undefined,
  cavityCount: number
): Record<number, ConnectorTerminalMaterial> | undefined {
  if (overrides === undefined || typeof overrides !== "object") {
    return undefined;
  }
  const normalized: Record<number, ConnectorTerminalMaterial> = {};
  for (const [key, value] of Object.entries(overrides)) {
    const cavityIndex = Number(key);
    if (!Number.isInteger(cavityIndex) || cavityIndex < 1 || cavityIndex > cavityCount) {
      continue;
    }
    const material = normalizeConnectorTerminalMaterial(value);
    if (material !== undefined) {
      normalized[cavityIndex] = material;
    }
  }
  return Object.keys(normalized).length === 0 ? undefined : normalized;
}

function normalizeConnectorPinElectricalRoles(
  roles: Record<number, PinElectricalRole> | undefined,
  cavityCount: number
): Record<number, PinElectricalRole> | undefined {
  if (roles === undefined) {
    return undefined;
  }
  const { value } = normalizePinElectricalRolesMap(roles, { cavityCount });
  return Object.keys(value).length === 0 ? undefined : value;
}

function hasWireEndpointIndexOutOfRange(state: AppState, connectorId: string, cavityCount: number): boolean {
  return state.wires.allIds.some((id) => {
    const wire = state.wires.byId[id];
    if (wire === undefined) {
      return false;
    }
    return (
      (wire.endpointA.kind === "connectorCavity" && wire.endpointA.connectorId === connectorId && wire.endpointA.cavityIndex > cavityCount) ||
      (wire.endpointB.kind === "connectorCavity" && wire.endpointB.connectorId === connectorId && wire.endpointB.cavityIndex > cavityCount)
    );
  });
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
      let cavityCount = action.payload.cavityCount;
      if (action.payload.id.trim().length === 0) {
        return withError(state, "Connector ID is required.");
      }
      if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
        return withError(state, "Connector name and technical ID are required.");
      }
      const linkedCatalogItem =
        action.payload.catalogItemId === undefined ? undefined : state.catalogItems.byId[action.payload.catalogItemId];
      if (action.payload.catalogItemId !== undefined && linkedCatalogItem === undefined) {
        return withError(state, "Connector catalog item is invalid.");
      }
      if (linkedCatalogItem !== undefined) {
        cavityCount = linkedCatalogItem.connectionCount;
      }

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
      if (hasWireEndpointIndexOutOfRange(state, action.payload.id, cavityCount)) {
        return withError(state, "Connector wayCount cannot be reduced below wire endpoint way indexes.");
      }

      return bumpRevision({
        ...clearLastError(state),
        connectors: upsertEntity(state.connectors, {
          ...action.payload,
          name: normalizedName,
          technicalId: normalizedTechnicalId,
          cavityCount,
          isMainHarnessConnector: action.payload.isMainHarnessConnector === true ? true : undefined,
          applyCatalogPlugs: normalizeApplyCatalogFlag(action.payload.applyCatalogPlugs),
          applyCatalogSeals: normalizeApplyCatalogFlag(action.payload.applyCatalogSeals),
          terminalOverrides: normalizeConnectorTerminalOverrides(action.payload.terminalOverrides, cavityCount),
          pinElectricalRoles: normalizeConnectorPinElectricalRoles(action.payload.pinElectricalRoles, cavityCount),
          manufacturerReference:
            linkedCatalogItem !== undefined
              ? linkedCatalogItem.manufacturerReference
              : normalizeManufacturerReference(action.payload.manufacturerReference)
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

    case "connector/removeCascade": {
      const impact = analyzeConnectorDeleteImpact(state, action.payload.id);
      if (impact.kind === "direct") {
        return handleConnectorActions(state, { type: "connector/remove", payload: action.payload });
      }
      if (impact.kind !== "cascade") {
        return withError(state, "Cannot cascade remove connector while higher-level dependencies still reference it.");
      }

      const nextNodes = impact.linkedNodeIds.reduce((current, nodeId) => removeEntity(current, nodeId), state.nodes);
      const nextNodePositions = { ...state.nodePositions };
      for (const nodeId of impact.linkedNodeIds) {
        delete nextNodePositions[nodeId];
      }
      const nextConnectorCavityOccupancy = { ...state.connectorCavityOccupancy };
      delete nextConnectorCavityOccupancy[action.payload.id];
      const shouldClearCurrentSelection =
        shouldClearSelection(state.ui.selected, "connector", action.payload.id) ||
        impact.linkedNodeIds.some((nodeId) => shouldClearSelection(state.ui.selected, "node", nodeId));

      return bumpRevision({
        ...clearLastError(state),
        connectors: removeEntity(state.connectors, action.payload.id),
        nodes: nextNodes,
        nodePositions: nextNodePositions,
        connectorCavityOccupancy: nextConnectorCavityOccupancy,
        ui: shouldClearCurrentSelection
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
        console.warn("Rejected connector occupancy write with out-of-range cavity index.", {
          connectorId: action.payload.connectorId,
          cavityIndex: action.payload.cavityIndex,
          cavityCount: connector.cavityCount
        });
        return state;
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
        console.warn("Rejected connector occupancy release with out-of-range cavity index.", {
          connectorId: action.payload.connectorId,
          cavityIndex: action.payload.cavityIndex,
          cavityCount: connector.cavityCount
        });
        return state;
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
