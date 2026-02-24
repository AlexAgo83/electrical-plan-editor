import type { AppAction } from "./actions";
import { syncCurrentScopeToNetworkMap } from "./networking";
import type { AppState } from "./types";
import { handleConnectorActions } from "./reducer/connectorReducer";
import { handleLayoutActions } from "./reducer/layoutReducer";
import { handleNetworkActions } from "./reducer/networkReducer";
import { handleNodeActions } from "./reducer/nodeReducer";
import { handleSegmentActions } from "./reducer/segmentReducer";
import { handleSpliceActions } from "./reducer/spliceReducer";
import { handleUiActions } from "./reducer/uiReducer";
import { handleWireActions } from "./reducer/wireReducer";
import { withError } from "./reducer/shared";

function hasActiveNetworkForDomainActions(state: AppState, action: AppAction): boolean {
  if (
    action.type.startsWith("connector/") ||
    action.type.startsWith("splice/") ||
    action.type.startsWith("node/") ||
    action.type.startsWith("segment/") ||
    action.type.startsWith("wire/") ||
    action.type.startsWith("layout/")
  ) {
    return state.activeNetworkId !== null;
  }

  return true;
}

function finalizeDomainAction(previous: AppState, next: AppState): AppState {
  if (next === previous) {
    return previous;
  }

  return syncCurrentScopeToNetworkMap(next);
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

    case "connector/upsert":
    case "connector/remove":
    case "connector/occupyCavity":
    case "connector/releaseCavity": {
      return finalizeDomainAction(state, handleConnectorActions(state, action) ?? state);
    }

    case "splice/upsert":
    case "splice/remove":
    case "splice/occupyPort":
    case "splice/releasePort": {
      return finalizeDomainAction(state, handleSpliceActions(state, action) ?? state);
    }

    case "node/upsert":
    case "node/rename":
    case "node/remove": {
      return finalizeDomainAction(state, handleNodeActions(state, action) ?? state);
    }

    case "segment/upsert":
    case "segment/rename":
    case "segment/remove": {
      return finalizeDomainAction(state, handleSegmentActions(state, action) ?? state);
    }

    case "wire/save":
    case "wire/lockRoute":
    case "wire/resetRoute":
    case "wire/upsert":
    case "wire/remove": {
      return finalizeDomainAction(state, handleWireActions(state, action) ?? state);
    }

    case "layout/setNodePosition":
    case "layout/setNodePositions": {
      return finalizeDomainAction(state, handleLayoutActions(state, action) ?? state);
    }

    case "ui/select":
    case "ui/setThemeMode":
    case "ui/clearSelection":
    case "ui/clearError": {
      return handleUiActions(state, action) ?? state;
    }
  }

  const unhandled: never = action;
  return unhandled;
}
