import type { AppAction } from "../actions";
import type { AppState } from "../types";
import { bumpRevision, clearLastError } from "./shared";

export function handleLayoutActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "layout/setNodePosition": {
      if (state.nodes.byId[action.payload.nodeId] === undefined) {
        return state;
      }

      return bumpRevision({
        ...clearLastError(state),
        nodePositions: {
          ...state.nodePositions,
          [action.payload.nodeId]: action.payload.position
        }
      });
    }

    case "layout/setNodePositions": {
      const nextPositions = {} as AppState["nodePositions"];
      for (const nodeId of state.nodes.allIds) {
        const position = action.payload.positions[nodeId];
        if (position !== undefined) {
          nextPositions[nodeId] = position;
        }
      }

      return bumpRevision({
        ...clearLastError(state),
        nodePositions: nextPositions
      });
    }

    default:
      return null;
  }
}
