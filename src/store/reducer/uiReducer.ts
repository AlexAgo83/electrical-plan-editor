import type { AppAction } from "../actions";
import type { AppState } from "../types";
import { bumpRevision, clearLastError } from "./shared";

export function handleUiActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "ui/select": {
      const currentSelection = state.ui.selected;
      if (currentSelection?.kind === action.payload.kind && currentSelection.id === action.payload.id) {
        return clearLastError(state);
      }

      return bumpRevision({
        ...clearLastError(state),
        ui: {
          ...state.ui,
          selected: action.payload,
          lastError: null
        }
      });
    }

    case "ui/clearSelection": {
      if (state.ui.selected === null) {
        return clearLastError(state);
      }

      return bumpRevision({
        ...clearLastError(state),
        ui: {
          ...state.ui,
          selected: null,
          lastError: null
        }
      });
    }

    case "ui/clearError": {
      return clearLastError(state);
    }

    case "ui/setThemeMode": {
      if (state.ui.themeMode === action.payload.mode) {
        return clearLastError(state);
      }

      return bumpRevision({
        ...clearLastError(state),
        ui: {
          ...state.ui,
          themeMode: action.payload.mode,
          lastError: null
        }
      });
    }

    default:
      return null;
  }
}
