import type { CatalogItemId, ConnectorId, NodeId } from "../../core/entities";
import { appActions, appReducer, createInitialState, type AppState } from "../../store";

export interface MemoryStorage extends Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  read: (key: string) => string | null;
  keys: () => string[];
}

export function createMemoryStorage(seed: Record<string, string> = {}): MemoryStorage {
  const entries = new Map(Object.entries(seed));

  return {
    getItem(key: string) {
      return entries.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      entries.set(key, value);
    },
    removeItem(key: string) {
      entries.delete(key);
    },
    read(key: string) {
      return entries.get(key) ?? null;
    },
    keys() {
      return [...entries.keys()];
    }
  };
}

export function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

export function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

export function asNodeId(value: string): NodeId {
  return value as NodeId;
}

export function createSampleState(): AppState {
  return [
    appActions.upsertCatalogItem({
      id: asCatalogItemId("catalog-c1"),
      manufacturerReference: "CONN-TEST-2W",
      connectionCount: 2
    }),
    appActions.upsertConnector({
      id: asConnectorId("C1"),
      name: "Connector 1",
      technicalId: "C-1",
      cavityCount: 2,
      manufacturerReference: "CONN-TEST-2W",
      catalogItemId: asCatalogItemId("catalog-c1")
    }),
    appActions.occupyConnectorCavity(asConnectorId("C1"), 1, "wire:W1:A")
  ].reduce(appReducer, createInitialState());
}

export function toLegacySingleNetworkState(state: AppState): unknown {
  return {
    schemaVersion: 1,
    connectors: state.connectors,
    splices: state.splices,
    nodes: state.nodes,
    segments: state.segments,
    wires: state.wires,
    connectorCavityOccupancy: state.connectorCavityOccupancy,
    splicePortOccupancy: state.splicePortOccupancy,
    ui: {
      selected: state.ui.selected,
      lastError: state.ui.lastError
    },
    meta: state.meta
  };
}
