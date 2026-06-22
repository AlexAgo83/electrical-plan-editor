import type { AppAction } from "./actions";
import { syncCurrentScopeToNetworkMap } from "./networking";
import type { AppState } from "./types";
import { handleConnectorActions } from "./reducer/connectorReducer";
import { handleCatalogActions } from "./reducer/catalogReducer";
import { handleLayoutActions } from "./reducer/layoutReducer";
import { handleNetworkActions } from "./reducer/networkReducer";
import { handleHarnessAssemblyActions } from "./reducer/harnessAssemblyReducer";
import { handleNodeActions } from "./reducer/nodeReducer";
import { handleSegmentActions } from "./reducer/segmentReducer";
import { handleSpliceActions } from "./reducer/spliceReducer";
import { handleUiActions } from "./reducer/uiReducer";
import { handleWireActions } from "./reducer/wireReducer";
import { withError } from "./reducer/shared";

function hasActiveNetworkForDomainActions(state: AppState, action: AppAction): boolean {
  if (
    action.type.startsWith("connector/") ||
    action.type.startsWith("catalog/") ||
    action.type.startsWith("splice/") ||
    action.type.startsWith("node/") ||
    action.type.startsWith("segment/") ||
    action.type.startsWith("mountingLabel/") ||
    action.type.startsWith("wire/") ||
    action.type.startsWith("layout/")
  ) {
    return state.activeNetworkId !== null;
  }

  return true;
}

/**
 * Dual-state invariant:
 * - root-level domain slices (`catalogItems`, `connectors`, `splices`, `nodes`, `segments`, `wires`, layout/occupancy maps)
 *   are the active-network working set;
 * - `networkStates[activeNetworkId]` must remain a synchronized snapshot of that same working set after every scoped mutation.
 *
 * Audit status for the scoped reducers:
 * - `handleConnectorActions` -> synchronized through this wrapper
 * - `handleCatalogActions` -> synchronized through this wrapper
 * - `handleSpliceActions` -> synchronized through this wrapper
 * - `handleNodeActions` -> synchronized through this wrapper
 * - `handleSegmentActions` -> synchronized through this wrapper
 * - `handleWireActions` -> synchronized through this wrapper
 * - `handleLayoutActions` -> synchronized through this wrapper
 */
function finalizeDomainAction(previous: AppState, next: AppState): AppState {
  if (next === previous) {
    return previous;
  }

  return syncCurrentScopeToNetworkMap(next);
}

type DomainReducerHandler = (state: AppState, action: AppAction) => AppState | null;

function runScopedDomainReducer(previous: AppState, action: AppAction, handler: DomainReducerHandler): AppState {
  return finalizeDomainAction(previous, handler(previous, action) ?? previous);
}

export function appReducer(state: AppState, action: AppAction): AppState {
  if (!hasActiveNetworkForDomainActions(state, action)) {
    return withError(state, "No active network selected. Create or select a network first.");
  }

  switch (action.type) {
    case "network/create":
    case "network/select":
    case "network/setSummaryViewState":
    case "network/rename":
    case "network/update":
    case "network/duplicate":
    case "network/delete":
    case "network/importMany": {
      return handleNetworkActions(state, action) ?? state;
    }

    case "harnessAssembly/upsert":
    case "harnessAssembly/remove": {
      return handleHarnessAssemblyActions(state, action) ?? state;
    }

    case "connector/upsert":
    case "connector/remove":
    case "connector/removeCascade":
    case "connector/occupyCavity":
    case "connector/releaseCavity": {
      return runScopedDomainReducer(state, action, handleConnectorActions);
    }

    case "catalog/upsert":
    case "catalog/remove": {
      return runScopedDomainReducer(state, action, handleCatalogActions);
    }

    case "splice/upsert":
    case "splice/convertToDirectional":
    case "splice/rerouteConnectedWires":
    case "splice/applyOptimizedCanvasLayout":
    case "splice/remove":
    case "splice/removeCascade":
    case "splice/occupyPort":
    case "splice/releasePort": {
      return runScopedDomainReducer(state, action, handleSpliceActions);
    }

    case "node/upsert":
    case "node/rename":
    case "node/remove": {
      return runScopedDomainReducer(state, action, handleNodeActions);
    }

    case "segment/upsert":
    case "segment/updateBatch":
    case "segment/rename":
    case "segment/remove": {
      return runScopedDomainReducer(state, action, handleSegmentActions);
    }

    case "mountingLabel/upsert":
    case "mountingLabel/remove": {
      return runScopedDomainReducer(state, action, handleSegmentActions);
    }

    case "wire/save":
    case "wire/lockRoute":
    case "wire/resetRoute":
    case "wire/upsert":
    case "wire/remove":
    case "wire/recomputeAll": {
      return runScopedDomainReducer(state, action, handleWireActions);
    }

    case "layout/setNodePosition":
    case "layout/setNodePositions": {
      return runScopedDomainReducer(state, action, handleLayoutActions);
    }

    case "ui/select":
    case "ui/setError":
    case "ui/setThemeMode":
    case "ui/clearSelection":
    case "ui/clearError":
    case "ui/clearRecomputeReport": {
      return handleUiActions(state, action) ?? state;
    }
  }

  const unhandled: never = action;
  return unhandled;
}
