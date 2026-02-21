import type { AppAction } from "./actions";
import type { AppState } from "./types";
import { handleConnectorSpliceActions } from "./reducer/connectorSpliceReducer";
import { handleNodeSegmentActions } from "./reducer/nodeSegmentReducer";
import { handleUiActions } from "./reducer/uiReducer";
import { handleWireActions } from "./reducer/wireReducer";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "connector/upsert":
    case "connector/remove":
    case "connector/occupyCavity":
    case "connector/releaseCavity":
    case "splice/upsert":
    case "splice/remove":
    case "splice/occupyPort":
    case "splice/releasePort": {
      return handleConnectorSpliceActions(state, action) ?? state;
    }

    case "node/upsert":
    case "node/remove":
    case "segment/upsert":
    case "segment/remove": {
      return handleNodeSegmentActions(state, action) ?? state;
    }

    case "wire/save":
    case "wire/lockRoute":
    case "wire/resetRoute":
    case "wire/upsert":
    case "wire/remove": {
      return handleWireActions(state, action) ?? state;
    }

    case "ui/select":
    case "ui/clearSelection":
    case "ui/clearError": {
      return handleUiActions(state, action) ?? state;
    }
  }

  const unhandled: never = action;
  return unhandled;
}
