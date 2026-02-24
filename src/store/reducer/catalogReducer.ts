import type { CatalogItem, Connector, Splice } from "../../core/entities";
import type { AppAction } from "../actions";
import {
  isValidCatalogUrlInput,
  normalizeCatalogConnectionCount,
  normalizeCatalogName,
  normalizeCatalogUnitPriceExclTax,
  normalizeCatalogUrl,
  normalizeManufacturerReference
} from "../catalog";
import type { AppState } from "../types";
import { bumpRevision, clearLastError, removeEntity, shouldClearSelection, upsertEntity, withError } from "./shared";

function hasDuplicateManufacturerReference(state: AppState, catalogItemId: string, manufacturerReference: string): boolean {
  return state.catalogItems.allIds.some((id) => {
    if (id === catalogItemId) {
      return false;
    }
    const item = state.catalogItems.byId[id];
    return item?.manufacturerReference === manufacturerReference;
  });
}

function connectorUsesCapacityAbove(state: AppState, connectorId: string, maxCount: number): boolean {
  const occupancy = state.connectorCavityOccupancy[connectorId as keyof typeof state.connectorCavityOccupancy];
  if (occupancy !== undefined) {
    const hasOutOfRangeOccupancy = Object.keys(occupancy)
      .map((key) => Number(key))
      .some((slot) => Number.isInteger(slot) && slot > maxCount);
    if (hasOutOfRangeOccupancy) {
      return true;
    }
  }

  return state.wires.allIds.some((wireId) => {
    const wire = state.wires.byId[wireId];
    if (wire === undefined) {
      return false;
    }
    return (
      (wire.endpointA.kind === "connectorCavity" &&
        wire.endpointA.connectorId === connectorId &&
        wire.endpointA.cavityIndex > maxCount) ||
      (wire.endpointB.kind === "connectorCavity" &&
        wire.endpointB.connectorId === connectorId &&
        wire.endpointB.cavityIndex > maxCount)
    );
  });
}

function spliceUsesCapacityAbove(state: AppState, spliceId: string, maxCount: number): boolean {
  const occupancy = state.splicePortOccupancy[spliceId as keyof typeof state.splicePortOccupancy];
  if (occupancy !== undefined) {
    const hasOutOfRangeOccupancy = Object.keys(occupancy)
      .map((key) => Number(key))
      .some((slot) => Number.isInteger(slot) && slot > maxCount);
    if (hasOutOfRangeOccupancy) {
      return true;
    }
  }

  return state.wires.allIds.some((wireId) => {
    const wire = state.wires.byId[wireId];
    if (wire === undefined) {
      return false;
    }
    return (
      (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === spliceId && wire.endpointA.portIndex > maxCount) ||
      (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === spliceId && wire.endpointB.portIndex > maxCount)
    );
  });
}

function propagateCatalogToConnector(connector: Connector, catalogItem: CatalogItem): Connector {
  return {
    ...connector,
    catalogItemId: catalogItem.id,
    manufacturerReference: catalogItem.manufacturerReference,
    cavityCount: catalogItem.connectionCount
  };
}

function propagateCatalogToSplice(splice: Splice, catalogItem: CatalogItem): Splice {
  return {
    ...splice,
    catalogItemId: catalogItem.id,
    manufacturerReference: catalogItem.manufacturerReference,
    portCount: catalogItem.connectionCount
  };
}

export function handleCatalogActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "catalog/upsert": {
      const normalizedManufacturerReference = normalizeManufacturerReference(action.payload.manufacturerReference);
      if (typeof action.payload.id !== "string" || action.payload.id.trim().length === 0) {
        return withError(state, "Catalog item ID is required.");
      }
      if (normalizedManufacturerReference === undefined) {
        return withError(state, "Catalog manufacturer reference is required.");
      }
      const normalizedConnectionCount = normalizeCatalogConnectionCount(action.payload.connectionCount);
      if (normalizedConnectionCount === undefined) {
        return withError(state, "Catalog connection count must be an integer >= 1.");
      }
      if (hasDuplicateManufacturerReference(state, action.payload.id, normalizedManufacturerReference)) {
        return withError(state, `Catalog manufacturer reference '${normalizedManufacturerReference}' is already used.`);
      }

      const rawUrl = typeof action.payload.url === "string" ? action.payload.url.trim() : "";
      if (!isValidCatalogUrlInput(rawUrl)) {
        return withError(state, "Catalog URL must be empty or a valid absolute http/https URL.");
      }

      const existing = state.catalogItems.byId[action.payload.id];
      if (existing !== undefined && normalizedConnectionCount < existing.connectionCount) {
        for (const connectorId of state.connectors.allIds) {
          const connector = state.connectors.byId[connectorId];
          if (connector?.catalogItemId !== existing.id) {
            continue;
          }
          if (connectorUsesCapacityAbove(state, connectorId, normalizedConnectionCount)) {
            return withError(
              state,
              `Catalog connection count cannot be reduced: connector '${connector.technicalId}' uses indexes above ${normalizedConnectionCount}.`
            );
          }
        }
        for (const spliceId of state.splices.allIds) {
          const splice = state.splices.byId[spliceId];
          if (splice?.catalogItemId !== existing.id) {
            continue;
          }
          if (spliceUsesCapacityAbove(state, spliceId, normalizedConnectionCount)) {
            return withError(
              state,
              `Catalog connection count cannot be reduced: splice '${splice.technicalId}' uses indexes above ${normalizedConnectionCount}.`
            );
          }
        }
      }

      const normalizedCatalogItem: CatalogItem = {
        id: action.payload.id,
        manufacturerReference: normalizedManufacturerReference,
        connectionCount: normalizedConnectionCount,
        name: normalizeCatalogName(action.payload.name),
        unitPriceExclTax: normalizeCatalogUnitPriceExclTax(action.payload.unitPriceExclTax),
        url: normalizeCatalogUrl(action.payload.url)
      };

      let nextConnectors = state.connectors;
      for (const connectorId of state.connectors.allIds) {
        const connector = state.connectors.byId[connectorId];
        if (connector?.catalogItemId !== normalizedCatalogItem.id) {
          continue;
        }
        nextConnectors = upsertEntity(nextConnectors, propagateCatalogToConnector(connector, normalizedCatalogItem));
      }

      let nextSplices = state.splices;
      for (const spliceId of state.splices.allIds) {
        const splice = state.splices.byId[spliceId];
        if (splice?.catalogItemId !== normalizedCatalogItem.id) {
          continue;
        }
        nextSplices = upsertEntity(nextSplices, propagateCatalogToSplice(splice, normalizedCatalogItem));
      }

      return bumpRevision({
        ...clearLastError(state),
        catalogItems: upsertEntity(state.catalogItems, normalizedCatalogItem),
        connectors: nextConnectors,
        splices: nextSplices
      });
    }

    case "catalog/remove": {
      const item = state.catalogItems.byId[action.payload.id];
      if (item === undefined) {
        return clearLastError(state);
      }

      const isReferencedByConnector = state.connectors.allIds.some(
        (connectorId) => state.connectors.byId[connectorId]?.catalogItemId === action.payload.id
      );
      if (isReferencedByConnector) {
        return withError(state, "Cannot remove catalog item while connectors reference it.");
      }
      const isReferencedBySplice = state.splices.allIds.some(
        (spliceId) => state.splices.byId[spliceId]?.catalogItemId === action.payload.id
      );
      if (isReferencedBySplice) {
        return withError(state, "Cannot remove catalog item while splices reference it.");
      }

      return bumpRevision({
        ...clearLastError(state),
        catalogItems: removeEntity(state.catalogItems, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "catalog", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    default:
      return null;
  }
}
