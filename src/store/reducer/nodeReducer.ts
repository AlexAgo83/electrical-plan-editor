import type { AppAction } from "../actions";
import type { AppState } from "../types";
import { bumpRevision, clearLastError, removeEntity, shouldClearSelection, upsertEntity, withError } from "./shared";

function hasConnectorNodeConflict(state: AppState, nodeId: string, connectorId: string): boolean {
  return state.nodes.allIds.some((id) => {
    if (id === nodeId) {
      return false;
    }

    const node = state.nodes.byId[id];
    return node?.kind === "connector" && node.connectorId === connectorId;
  });
}

function hasSpliceNodeConflict(state: AppState, nodeId: string, spliceId: string): boolean {
  return state.nodes.allIds.some((id) => {
    if (id === nodeId) {
      return false;
    }

    const node = state.nodes.byId[id];
    return node?.kind === "splice" && node.spliceId === spliceId;
  });
}

function countSegmentsUsingNode(state: AppState, nodeId: string): number {
  return state.segments.allIds.reduce((count, segmentId) => {
    const segment = state.segments.byId[segmentId];
    if (segment === undefined) {
      return count;
    }

    return segment.nodeA === nodeId || segment.nodeB === nodeId ? count + 1 : count;
  }, 0);
}

export function handleNodeActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "node/upsert": {
      if (action.payload.kind === "connector") {
        if (state.connectors.byId[action.payload.connectorId] === undefined) {
          return withError(state, "Cannot create connector node for unknown connector.");
        }

        if (hasConnectorNodeConflict(state, action.payload.id, action.payload.connectorId)) {
          return withError(state, "Only one connector node is allowed per connector.");
        }
      }

      if (action.payload.kind === "splice") {
        if (state.splices.byId[action.payload.spliceId] === undefined) {
          return withError(state, "Cannot create splice node for unknown splice.");
        }

        if (hasSpliceNodeConflict(state, action.payload.id, action.payload.spliceId)) {
          return withError(state, "Only one splice node is allowed per splice.");
        }
      }

      if (action.payload.kind === "intermediate" && action.payload.label.trim().length === 0) {
        return withError(state, "Intermediate node label must be non-empty.");
      }

      return bumpRevision({
        ...clearLastError(state),
        nodes: upsertEntity(state.nodes, action.payload)
      });
    }

    case "node/remove": {
      const linkedSegments = countSegmentsUsingNode(state, action.payload.id);
      if (linkedSegments > 0) {
        return withError(state, "Cannot remove node while segments are connected to it.");
      }

      return bumpRevision({
        ...clearLastError(state),
        nodes: removeEntity(state.nodes, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "node", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    default:
      return null;
  }
}
