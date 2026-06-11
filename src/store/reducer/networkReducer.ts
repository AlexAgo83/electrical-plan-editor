import { normalizeNetworkIsoTimestamp } from "../../core/networkMetadata";
import { normalizeNetworkVoltageV } from "../../core/wireSizing";
import type { AppAction } from "../actions";
import {
  cloneNetworkSummaryViewState,
  createEmptyNetworkScopedState,
  type AppState,
  type NetworkScopedState
} from "../types";
import {
  cloneScopedState,
  hasDuplicateNetworkTechnicalId,
  normalizeNetworkMetadata,
  normalizeOptionalText
} from "./helpers/networkClone";
import { collectNetworkImportRejections } from "./helpers/networkImport";
import {
  buildNetworkDeletionFallback,
  clearActiveScope,
  loadNetworkIntoActiveScope,
  persistActiveNetworkSnapshot
} from "../networking";
import { bumpRevision, clearLastError, removeEntity, upsertEntity, withError } from "./shared";
import { cleanupHarnessAssembliesForDeletedNetwork } from "./harnessAssemblyReducer";
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
    left.showSegmentDressings === right.showSegmentDressings &&
    left.showCableCallouts === right.showCableCallouts &&
    left.calloutContentMode === right.calloutContentMode &&
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
export function handleNetworkActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "network/create": {
      const { network, setActive = true, nowIso } = action.payload;
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
      const normalizedCreatedAt = normalizeNetworkIsoTimestamp(network.createdAt, nowIso);
      const normalizedUpdatedAt = normalizeNetworkIsoTimestamp(network.updatedAt, normalizedCreatedAt);
      const normalizedMetadata = normalizeNetworkMetadata(network, {
        author: undefined,
        projectCode: undefined,
        logoUrl: undefined,
        exportNotes: undefined
      });
      const normalizedVoltageV = normalizeNetworkVoltageV(network.voltageV);
      if (normalizedMetadata.error !== null) {
        return withError(state, normalizedMetadata.error);
      }
      if (network.voltageV !== undefined && normalizedVoltageV === undefined) {
        return withError(state, "Network voltage must be a positive number.");
      }
      const persisted = persistActiveNetworkSnapshot(clearLastError(state));
      const nextNetwork = {
        ...network,
        name: normalizedName,
        technicalId: normalizedTechnicalId,
        description: normalizeOptionalText(network.description),
        voltageV: normalizedVoltageV,
        createdAt: normalizedCreatedAt,
        updatedAt: normalizedUpdatedAt,
        ...normalizedMetadata.metadata
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
      const normalizedVoltageV = normalizeNetworkVoltageV(
        action.payload.voltageV === undefined ? existing.voltageV : action.payload.voltageV
      );
      if (normalizedMetadata.error !== null) {
        return withError(state, normalizedMetadata.error);
      }
      if (action.payload.voltageV !== undefined && normalizedVoltageV === undefined) {
        return withError(state, "Network voltage must be a positive number.");
      }
      const nextState: AppState = {
        ...clearLastError(state),
        networks: upsertEntity(state.networks, {
          ...existing,
          name: normalizedName,
          technicalId: normalizedTechnicalId,
          description: normalizeOptionalText(action.payload.description),
          voltageV: normalizedVoltageV,
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
      const { nowIso } = action.payload;
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
      const normalizedCreatedAt = normalizeNetworkIsoTimestamp(duplicated.createdAt, nowIso);
      const normalizedUpdatedAt = normalizeNetworkIsoTimestamp(duplicated.updatedAt, normalizedCreatedAt);
      const normalizedMetadata = normalizeNetworkMetadata(duplicated, {
        author: source.author,
        projectCode: source.projectCode,
        logoUrl: source.logoUrl,
        exportNotes: source.exportNotes
      });
      const normalizedVoltageV = normalizeNetworkVoltageV(duplicated.voltageV);
      if (normalizedMetadata.error !== null) {
        return withError(state, normalizedMetadata.error);
      }
      if (duplicated.voltageV !== undefined && normalizedVoltageV === undefined) {
        return withError(state, "Network voltage must be a positive number.");
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
            voltageV: normalizedVoltageV,
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
      const withCleanedAssemblies = cleanupHarnessAssembliesForDeletedNetwork(
        {
          ...persisted,
          networks: remainingNetworks,
          networkStates: nextNetworkStates
        },
        action.payload.id,
        action.payload.nowIso
      );
      if (fallbackId === null) {
        const cleared = clearActiveScope(
          withUiResetSelection({
            ...withCleanedAssemblies,
            activeNetworkId: null
          })
        );
        return bumpRevision(cleared);
      }
      const switched = loadNetworkIntoActiveScope(
        withUiResetSelection({
          ...withCleanedAssemblies,
          activeNetworkId: fallbackId
        }),
        fallbackId
      );
      return bumpRevision(switched);
    }
    case "network/importMany": {
      if (action.payload.networks.length === 0) {
        const cleared = clearLastError(state);
        return { ...cleared, ui: { ...cleared.ui, lastImportRejections: null } };
      }
      const persisted = persistActiveNetworkSnapshot(clearLastError(state));
      let nextHarnessAssemblies = persisted.harnessAssemblies;
      const overwriteSet = new Set<string>((action.payload.overwriteNetworkIds ?? []).map((id) => id as string));
      const overwriteHarnessAssemblySet = new Set<string>(
        (action.payload.overwriteHarnessAssemblyIds ?? []).map((id) => id as string)
      );
      const { nextNetworks, nextNetworkStates, rejections } = collectNetworkImportRejections({
        networks: action.payload.networks,
        networkStates: action.payload.networkStates,
        persisted,
        overwriteSet,
        nowIso: action.payload.nowIso
      });
      if (rejections.length > 0) {
        const firstReason = rejections[0]!.reason;
        const errored = withError(
          state,
          rejections.length === 1
            ? `Cannot import network: ${firstReason}.`
            : `Cannot import networks: ${rejections.length} network(s) rejected.`
        );
        return {
          ...errored,
          ui: { ...errored.ui, lastImportRejections: rejections }
        };
      }
      for (const assembly of action.payload.harnessAssemblies ?? []) {
        if (nextHarnessAssemblies.byId[assembly.id] !== undefined && !overwriteHarnessAssemblySet.has(assembly.id)) {
          const errored = withError(state, `Cannot import harness assembly '${assembly.id}': ID already exists.`);
          return {
            ...errored,
            ui: {
              ...errored.ui,
              lastImportRejections: [{
                networkId: assembly.id,
                name: assembly.name,
                technicalId: assembly.technicalId,
                reason: `harness assembly ID '${assembly.id}' already exists`
              }]
            }
          };
        }
        nextHarnessAssemblies = upsertEntity(nextHarnessAssemblies, assembly);
      }
      const nextStateBase: AppState = {
        ...persisted,
        networks: nextNetworks,
        harnessAssemblies: nextHarnessAssemblies,
        networkStates: nextNetworkStates,
        ui: { ...persisted.ui, lastImportRejections: null }
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
