import type { NetworkId } from "../core/entities";
import { cloneNetworkSummaryViewState, type AppState, type NetworkScopedState } from "./types";

function cloneEntityState<T, Id extends string>(state: { byId: Record<Id, T>; allIds: Id[] }): {
  byId: Record<Id, T>;
  allIds: Id[];
} {
  return {
    byId: { ...state.byId },
    allIds: [...state.allIds]
  };
}

export function extractScopedState(state: AppState): NetworkScopedState {
  const existingScoped = state.activeNetworkId === null ? undefined : state.networkStates[state.activeNetworkId];
  return {
    catalogItems: cloneEntityState(state.catalogItems),
    connectors: cloneEntityState(state.connectors),
    splices: cloneEntityState(state.splices),
    nodes: cloneEntityState(state.nodes),
    segments: cloneEntityState(state.segments),
    wires: cloneEntityState(state.wires),
    nodePositions: { ...state.nodePositions },
    connectorCavityOccupancy: { ...state.connectorCavityOccupancy },
    splicePortOccupancy: { ...state.splicePortOccupancy },
    networkSummaryViewState: cloneNetworkSummaryViewState(existingScoped?.networkSummaryViewState)
  };
}

export function assignScopedState(state: AppState, scoped: NetworkScopedState): AppState {
  return {
    ...state,
    catalogItems: scoped.catalogItems,
    connectors: scoped.connectors,
    splices: scoped.splices,
    nodes: scoped.nodes,
    segments: scoped.segments,
    wires: scoped.wires,
    nodePositions: scoped.nodePositions,
    connectorCavityOccupancy: scoped.connectorCavityOccupancy,
    splicePortOccupancy: scoped.splicePortOccupancy
  };
}

export function persistActiveNetworkSnapshot(state: AppState): AppState {
  if (state.activeNetworkId === null) {
    return state;
  }

  return {
    ...state,
    networkStates: {
      ...state.networkStates,
      [state.activeNetworkId]: extractScopedState(state)
    }
  };
}

export function loadNetworkIntoActiveScope(state: AppState, networkId: NetworkId): AppState {
  const scoped = state.networkStates[networkId];
  if (scoped === undefined) {
    return state;
  }

  return assignScopedState(
    {
      ...state,
      activeNetworkId: networkId
    },
    scoped
  );
}

export function clearActiveScope(state: AppState): AppState {
  return {
    ...state,
    catalogItems: { byId: {} as AppState["catalogItems"]["byId"], allIds: [] },
    connectors: { byId: {} as AppState["connectors"]["byId"], allIds: [] },
    splices: { byId: {} as AppState["splices"]["byId"], allIds: [] },
    nodes: { byId: {} as AppState["nodes"]["byId"], allIds: [] },
    segments: { byId: {} as AppState["segments"]["byId"], allIds: [] },
    wires: { byId: {} as AppState["wires"]["byId"], allIds: [] },
    nodePositions: {} as AppState["nodePositions"],
    connectorCavityOccupancy: {} as AppState["connectorCavityOccupancy"],
    splicePortOccupancy: {} as AppState["splicePortOccupancy"]
  };
}

export function syncCurrentScopeToNetworkMap(state: AppState): AppState {
  if (state.activeNetworkId === null) {
    return state;
  }

  const snapshot = extractScopedState(state);
  const existing = state.networkStates[state.activeNetworkId];
  if (existing === undefined) {
    return {
      ...state,
      networkStates: {
        ...state.networkStates,
        [state.activeNetworkId]: snapshot
      }
    };
  }

  return {
    ...state,
    networkStates: {
      ...state.networkStates,
      [state.activeNetworkId]: snapshot
    }
  };
}

export function buildNetworkDeletionFallback(
  networks: AppState["networks"],
  excludedNetworkId: NetworkId
): NetworkId | null {
  const remaining = networks.allIds
    .map((id) => networks.byId[id])
    .filter((network): network is NonNullable<typeof network> => network !== undefined && network.id !== excludedNetworkId);
  if (remaining.length === 0) {
    return null;
  }

  remaining.sort((left, right) => {
    const createdComparison = left.createdAt.localeCompare(right.createdAt);
    if (createdComparison !== 0) {
      return createdComparison;
    }

    return left.technicalId.localeCompare(right.technicalId);
  });

  return remaining[0]?.id ?? null;
}
