import type { NetworkId } from "../../core/entities";
import type { AppAction } from "../actions";
import {
  createEmptyNetworkScopedState,
  type AppState,
  type NetworkScopedState
} from "../types";
import {
  buildNetworkDeletionFallback,
  clearActiveScope,
  loadNetworkIntoActiveScope,
  persistActiveNetworkSnapshot
} from "../networking";
import { bumpRevision, clearLastError, removeEntity, upsertEntity, withError } from "./shared";

function hasDuplicateNetworkTechnicalId(
  state: AppState,
  technicalId: string,
  excludedNetworkId?: NetworkId
): boolean {
  return state.networks.allIds.some((networkId) => {
    if (excludedNetworkId !== undefined && networkId === excludedNetworkId) {
      return false;
    }

    const network = state.networks.byId[networkId];
    return network?.technicalId === technicalId;
  });
}

function cloneScopedState(scoped: NetworkScopedState): NetworkScopedState {
  return {
    connectors: {
      byId: { ...scoped.connectors.byId },
      allIds: [...scoped.connectors.allIds]
    },
    splices: {
      byId: { ...scoped.splices.byId },
      allIds: [...scoped.splices.allIds]
    },
    nodes: {
      byId: { ...scoped.nodes.byId },
      allIds: [...scoped.nodes.allIds]
    },
    segments: {
      byId: { ...scoped.segments.byId },
      allIds: [...scoped.segments.allIds]
    },
    wires: {
      byId: { ...scoped.wires.byId },
      allIds: [...scoped.wires.allIds]
    },
    nodePositions: { ...scoped.nodePositions },
    connectorCavityOccupancy: { ...scoped.connectorCavityOccupancy },
    splicePortOccupancy: { ...scoped.splicePortOccupancy }
  };
}

function withUiResetSelection(state: AppState): AppState {
  return {
    ...state,
    ui: {
      ...state.ui,
      selected: null,
      lastError: null
    }
  };
}

export function handleNetworkActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "network/create": {
      const { network, setActive = true } = action.payload;
      const normalizedName = network.name.trim();
      const normalizedTechnicalId = network.technicalId.trim();
      if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
        return withError(state, "Network name and technical ID are required.");
      }

      if (state.networks.byId[network.id] !== undefined) {
        return withError(state, `Network '${network.id}' already exists.`);
      }

      if (hasDuplicateNetworkTechnicalId(state, normalizedTechnicalId)) {
        return withError(state, `Network technical ID '${normalizedTechnicalId}' is already used.`);
      }

      const persisted = persistActiveNetworkSnapshot(clearLastError(state));
      const nextNetwork = {
        ...network,
        name: normalizedName,
        technicalId: normalizedTechnicalId
      };
      let nextState: AppState = {
        ...persisted,
        networks: upsertEntity(persisted.networks, nextNetwork),
        networkStates: {
          ...persisted.networkStates,
          [network.id]: createEmptyNetworkScopedState()
        }
      };

      if (setActive || persisted.activeNetworkId === null) {
        nextState = loadNetworkIntoActiveScope(
          withUiResetSelection({
            ...nextState,
            activeNetworkId: network.id
          }),
          network.id
        );
      }

      return bumpRevision(nextState);
    }

    case "network/select": {
      if (state.networks.byId[action.payload.id] === undefined) {
        return withError(state, "Cannot activate unknown network.");
      }

      if (state.activeNetworkId === action.payload.id) {
        return clearLastError(state);
      }

      const persisted = persistActiveNetworkSnapshot(clearLastError(state));
      const switched = loadNetworkIntoActiveScope(
        withUiResetSelection({
          ...persisted,
          activeNetworkId: action.payload.id
        }),
        action.payload.id
      );

      return bumpRevision(switched);
    }

    case "network/rename": {
      const existing = state.networks.byId[action.payload.id];
      if (existing === undefined) {
        return withError(state, "Cannot rename unknown network.");
      }

      const normalizedName = action.payload.name.trim();
      if (normalizedName.length === 0) {
        return withError(state, "Network name must be non-empty.");
      }

      const nextState: AppState = {
        ...clearLastError(state),
        networks: upsertEntity(state.networks, {
          ...existing,
          name: normalizedName,
          description: action.payload.description,
          updatedAt: action.payload.updatedAt
        })
      };

      return bumpRevision(nextState);
    }

    case "network/duplicate": {
      const source = state.networks.byId[action.payload.sourceNetworkId];
      if (source === undefined) {
        return withError(state, "Cannot duplicate unknown network.");
      }

      const duplicated = action.payload.network;
      const normalizedName = duplicated.name.trim();
      const normalizedTechnicalId = duplicated.technicalId.trim();
      if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
        return withError(state, "Network name and technical ID are required.");
      }

      if (state.networks.byId[duplicated.id] !== undefined) {
        return withError(state, `Network '${duplicated.id}' already exists.`);
      }

      if (hasDuplicateNetworkTechnicalId(state, normalizedTechnicalId)) {
        return withError(state, `Network technical ID '${normalizedTechnicalId}' is already used.`);
      }

      const persisted = persistActiveNetworkSnapshot(clearLastError(state));
      const sourceScoped = persisted.networkStates[action.payload.sourceNetworkId];
      if (sourceScoped === undefined) {
        return withError(state, "Cannot duplicate network state: source snapshot is missing.");
      }

      const nextState = loadNetworkIntoActiveScope(
        withUiResetSelection({
          ...persisted,
          networks: upsertEntity(persisted.networks, {
            ...duplicated,
            name: normalizedName,
            technicalId: normalizedTechnicalId
          }),
          networkStates: {
            ...persisted.networkStates,
            [duplicated.id]: cloneScopedState(sourceScoped)
          },
          activeNetworkId: duplicated.id
        }),
        duplicated.id
      );

      return bumpRevision(nextState);
    }

    case "network/delete": {
      const existing = state.networks.byId[action.payload.id];
      if (existing === undefined) {
        return withError(state, "Cannot delete unknown network.");
      }

      const persisted = persistActiveNetworkSnapshot(clearLastError(state));
      const remainingNetworks = removeEntity(persisted.networks, action.payload.id);
      const nextNetworkStates = { ...persisted.networkStates };
      delete nextNetworkStates[action.payload.id];

      const fallbackId = buildNetworkDeletionFallback(persisted.networks, action.payload.id);
      if (fallbackId === null) {
        const cleared = clearActiveScope(
          withUiResetSelection({
            ...persisted,
            networks: remainingNetworks,
            networkStates: nextNetworkStates,
            activeNetworkId: null
          })
        );
        return bumpRevision(cleared);
      }

      const switched = loadNetworkIntoActiveScope(
        withUiResetSelection({
          ...persisted,
          networks: remainingNetworks,
          networkStates: nextNetworkStates,
          activeNetworkId: fallbackId
        }),
        fallbackId
      );
      return bumpRevision(switched);
    }

    case "network/importMany": {
      if (action.payload.networks.length === 0) {
        return clearLastError(state);
      }

      const persisted = persistActiveNetworkSnapshot(clearLastError(state));
      let nextNetworks = persisted.networks;
      const nextNetworkStates = { ...persisted.networkStates };
      for (const network of action.payload.networks) {
        if (nextNetworks.byId[network.id] !== undefined) {
          return withError(state, `Cannot import network '${network.id}': ID already exists.`);
        }

        if (hasDuplicateNetworkTechnicalId({ ...persisted, networks: nextNetworks }, network.technicalId)) {
          return withError(state, `Cannot import network '${network.technicalId}': technical ID already exists.`);
        }

        const scoped = action.payload.networkStates[network.id];
        if (scoped === undefined) {
          return withError(state, `Cannot import network '${network.id}': network payload is incomplete.`);
        }

        nextNetworks = upsertEntity(nextNetworks, network);
        nextNetworkStates[network.id] = cloneScopedState(scoped);
      }

      const nextStateBase: AppState = {
        ...persisted,
        networks: nextNetworks,
        networkStates: nextNetworkStates
      };

      const desiredActiveId =
        action.payload.activateFirst && action.payload.networks[0] !== undefined
          ? action.payload.networks[0].id
          : nextStateBase.activeNetworkId ?? action.payload.networks[0]?.id ?? null;
      if (desiredActiveId === null) {
        return bumpRevision(nextStateBase);
      }

      return bumpRevision(loadNetworkIntoActiveScope({ ...nextStateBase, activeNetworkId: desiredActiveId }, desiredActiveId));
    }

    default:
      return null;
  }
}
