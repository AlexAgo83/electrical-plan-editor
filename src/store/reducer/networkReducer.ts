import type { Network, NetworkId } from "../../core/entities";
import {
  isNetworkLogoUrlValid,
  isNetworkProjectCodeValid,
  normalizeNetworkAuthor,
  normalizeNetworkExportNotes,
  normalizeNetworkIsoTimestamp,
  normalizeNetworkLogoUrl,
  normalizeNetworkProjectCode
} from "../../core/networkMetadata";
import type { AppAction } from "../actions";
import {
  cloneNetworkSummaryViewState,
  createSeededNetworkScopedState,
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
    catalogItems: {
      byId: { ...scoped.catalogItems.byId },
      allIds: [...scoped.catalogItems.allIds]
    },
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
    splicePortOccupancy: { ...scoped.splicePortOccupancy },
    networkSummaryViewState: cloneNetworkSummaryViewState(scoped.networkSummaryViewState)
  };
}

function isSameNetworkSummaryViewState(
  left: NetworkScopedState["networkSummaryViewState"],
  right: NetworkScopedState["networkSummaryViewState"]
): boolean {
  if (left === right) {
    return true;
  }
  if (left === undefined || right === undefined) {
    return false;
  }

  return (
    left.scale === right.scale &&
    left.offset.x === right.offset.x &&
    left.offset.y === right.offset.y &&
    left.showNetworkInfoPanels === right.showNetworkInfoPanels &&
    left.showSegmentNames === right.showSegmentNames &&
    left.showSegmentLengths === right.showSegmentLengths &&
    left.showCableCallouts === right.showCableCallouts &&
    left.showNetworkGrid === right.showNetworkGrid &&
    left.snapNodesToGrid === right.snapNodesToGrid &&
    left.lockEntityMovement === right.lockEntityMovement
  );
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

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length === 0 ? undefined : normalized;
}

interface NormalizeNetworkMetadataResult {
  metadata: Pick<Network, "author" | "projectCode" | "logoUrl" | "exportNotes">;
  error: string | null;
}

function normalizeNetworkMetadata(
  source: Partial<Pick<Network, "author" | "projectCode" | "logoUrl" | "exportNotes">>,
  fallback: Pick<Network, "author" | "projectCode" | "logoUrl" | "exportNotes">
): NormalizeNetworkMetadataResult {
  const rawProjectCode = source.projectCode === undefined ? fallback.projectCode : source.projectCode;
  const rawLogoUrl = source.logoUrl === undefined ? fallback.logoUrl : source.logoUrl;
  const normalizedProjectCode = normalizeNetworkProjectCode(rawProjectCode);
  const normalizedLogoUrl = normalizeNetworkLogoUrl(rawLogoUrl);
  if (normalizedProjectCode !== undefined && !isNetworkProjectCodeValid(normalizedProjectCode)) {
    return {
      metadata: fallback,
      error: "Project code supports letters, numbers, spaces, and _ . / - characters only."
    };
  }

  if (normalizedLogoUrl !== undefined && !isNetworkLogoUrlValid(normalizedLogoUrl)) {
    return {
      metadata: fallback,
      error: "Logo URL must use http, https, or data:image/*."
    };
  }

  return {
    metadata: {
      author: normalizeNetworkAuthor(source.author === undefined ? fallback.author : source.author),
      projectCode: normalizedProjectCode,
      logoUrl: normalizedLogoUrl,
      exportNotes: normalizeNetworkExportNotes(source.exportNotes === undefined ? fallback.exportNotes : source.exportNotes)
    },
    error: null
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

      const nowIso = new Date().toISOString();
      const normalizedCreatedAt = normalizeNetworkIsoTimestamp(network.createdAt, nowIso);
      const normalizedUpdatedAt = normalizeNetworkIsoTimestamp(network.updatedAt, normalizedCreatedAt);
      const normalizedMetadata = normalizeNetworkMetadata(network, {
        author: undefined,
        projectCode: undefined,
        logoUrl: undefined,
        exportNotes: undefined
      });
      if (normalizedMetadata.error !== null) {
        return withError(state, normalizedMetadata.error);
      }

      const persisted = persistActiveNetworkSnapshot(clearLastError(state));
      const nextNetwork = {
        ...network,
        name: normalizedName,
        technicalId: normalizedTechnicalId,
        description: normalizeOptionalText(network.description),
        createdAt: normalizedCreatedAt,
        updatedAt: normalizedUpdatedAt,
        ...normalizedMetadata.metadata
      };
      let nextState: AppState = {
        ...persisted,
        networks: upsertEntity(persisted.networks, nextNetwork),
        networkStates: {
          ...persisted.networkStates,
          [network.id]: createSeededNetworkScopedState()
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

    case "network/setSummaryViewState": {
      const { id, viewState } = action.payload;
      if (state.networks.byId[id] === undefined) {
        return withError(state, "Cannot update view state for unknown network.");
      }

      const existingScoped = state.networkStates[id];
      if (existingScoped === undefined) {
        return withError(state, "Cannot update view state: network snapshot is missing.");
      }

      if (isSameNetworkSummaryViewState(existingScoped.networkSummaryViewState, viewState)) {
        return state;
      }

      return {
        ...clearLastError(state),
        networkStates: {
          ...state.networkStates,
          [id]: {
            ...existingScoped,
            networkSummaryViewState: cloneNetworkSummaryViewState(viewState)
          }
        }
      };
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
          description: normalizeOptionalText(action.payload.description),
          updatedAt: normalizeNetworkIsoTimestamp(action.payload.updatedAt, existing.updatedAt)
        })
      };

      return bumpRevision(nextState);
    }

    case "network/update": {
      const existing = state.networks.byId[action.payload.id];
      if (existing === undefined) {
        return withError(state, "Cannot update unknown network.");
      }

      const normalizedName = action.payload.name.trim();
      const normalizedTechnicalId = action.payload.technicalId.trim();
      if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
        return withError(state, "Network name and technical ID are required.");
      }

      if (hasDuplicateNetworkTechnicalId(state, normalizedTechnicalId, action.payload.id)) {
        return withError(state, `Network technical ID '${normalizedTechnicalId}' is already used.`);
      }

      const normalizedMetadata = normalizeNetworkMetadata(
        {
          author: action.payload.author,
          projectCode: action.payload.projectCode,
          logoUrl: action.payload.logoUrl,
          exportNotes: action.payload.exportNotes
        },
        {
          author: existing.author,
          projectCode: existing.projectCode,
          logoUrl: existing.logoUrl,
          exportNotes: existing.exportNotes
        }
      );
      if (normalizedMetadata.error !== null) {
        return withError(state, normalizedMetadata.error);
      }

      const nextState: AppState = {
        ...clearLastError(state),
        networks: upsertEntity(state.networks, {
          ...existing,
          name: normalizedName,
          technicalId: normalizedTechnicalId,
          description: normalizeOptionalText(action.payload.description),
          createdAt: normalizeNetworkIsoTimestamp(action.payload.createdAt, existing.createdAt),
          updatedAt: normalizeNetworkIsoTimestamp(action.payload.updatedAt, existing.updatedAt),
          ...normalizedMetadata.metadata
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

      const nowIso = new Date().toISOString();
      const normalizedCreatedAt = normalizeNetworkIsoTimestamp(duplicated.createdAt, nowIso);
      const normalizedUpdatedAt = normalizeNetworkIsoTimestamp(duplicated.updatedAt, normalizedCreatedAt);
      const normalizedMetadata = normalizeNetworkMetadata(duplicated, {
        author: source.author,
        projectCode: source.projectCode,
        logoUrl: source.logoUrl,
        exportNotes: source.exportNotes
      });
      if (normalizedMetadata.error !== null) {
        return withError(state, normalizedMetadata.error);
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
            technicalId: normalizedTechnicalId,
            description: normalizeOptionalText(duplicated.description),
            createdAt: normalizedCreatedAt,
            updatedAt: normalizedUpdatedAt,
            ...normalizedMetadata.metadata
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
      const nowIso = new Date().toISOString();
      for (const network of action.payload.networks) {
        const normalizedName = network.name.trim();
        const normalizedTechnicalId = network.technicalId.trim();
        if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
          return withError(state, "Cannot import network with empty name or technical ID.");
        }

        if (nextNetworks.byId[network.id] !== undefined) {
          return withError(state, `Cannot import network '${network.id}': ID already exists.`);
        }

        if (hasDuplicateNetworkTechnicalId({ ...persisted, networks: nextNetworks }, normalizedTechnicalId)) {
          return withError(state, `Cannot import network '${normalizedTechnicalId}': technical ID already exists.`);
        }

        const scoped = action.payload.networkStates[network.id];
        if (scoped === undefined) {
          return withError(state, `Cannot import network '${network.id}': network payload is incomplete.`);
        }

        const normalizedMetadata = normalizeNetworkMetadata(network, {
          author: undefined,
          projectCode: undefined,
          logoUrl: undefined,
          exportNotes: undefined
        });
        if (normalizedMetadata.error !== null) {
          return withError(state, normalizedMetadata.error);
        }

        const normalizedCreatedAt = normalizeNetworkIsoTimestamp(network.createdAt, nowIso);
        const normalizedUpdatedAt = normalizeNetworkIsoTimestamp(network.updatedAt, normalizedCreatedAt);

        nextNetworks = upsertEntity(nextNetworks, {
          ...network,
          name: normalizedName,
          technicalId: normalizedTechnicalId,
          description: normalizeOptionalText(network.description),
          createdAt: normalizedCreatedAt,
          updatedAt: normalizedUpdatedAt,
          ...normalizedMetadata.metadata
        });
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
