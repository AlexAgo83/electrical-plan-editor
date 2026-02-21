import type { AppAction } from "./actions";
import type { AppState } from "./types";
import { handleConnectorActions } from "./reducer/connectorReducer";
import { handleNodeActions } from "./reducer/nodeReducer";
import { handleSegmentActions } from "./reducer/segmentReducer";
import { handleSpliceActions } from "./reducer/spliceReducer";
import { handleUiActions } from "./reducer/uiReducer";
import { handleWireActions } from "./reducer/wireReducer";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "connector/upsert":
    case "connector/remove":
    case "connector/occupyCavity":
    case "connector/releaseCavity": {
      return handleConnectorActions(state, action) ?? state;
    }

    case "splice/upsert":
    case "splice/remove":
    case "splice/occupyPort":
    case "splice/releasePort": {
      return handleSpliceActions(state, action) ?? state;
    }

    case "node/upsert":
    case "node/remove": {
      return handleNodeActions(state, action) ?? state;
    }

    case "segment/upsert":
    case "segment/remove": {
      return handleSegmentActions(state, action) ?? state;
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
