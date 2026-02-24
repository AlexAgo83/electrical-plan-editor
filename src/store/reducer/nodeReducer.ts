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
      const normalizedNodeId = action.payload.id.trim() as typeof action.payload.id;
      if (action.payload.kind === "connector") {
        if (state.connectors.byId[action.payload.connectorId] === undefined) {
          return withError(state, "Cannot create connector node for unknown connector.");
        }

        if (hasConnectorNodeConflict(state, normalizedNodeId, action.payload.connectorId)) {
          return withError(state, "Only one connector node is allowed per connector.");
        }
      }

      if (action.payload.kind === "splice") {
        if (state.splices.byId[action.payload.spliceId] === undefined) {
          return withError(state, "Cannot create splice node for unknown splice.");
        }

        if (hasSpliceNodeConflict(state, normalizedNodeId, action.payload.spliceId)) {
          return withError(state, "Only one splice node is allowed per splice.");
        }
      }

      if (action.payload.kind === "intermediate" && action.payload.label.trim().length === 0) {
        return withError(state, "Intermediate node label must be non-empty.");
      }

      const normalizedPayload =
        action.payload.kind === "intermediate"
          ? {
              ...action.payload,
              id: normalizedNodeId,
              label: action.payload.label.trim()
            }
          : {
              ...action.payload,
              id: normalizedNodeId
            };

      return bumpRevision({
        ...clearLastError(state),
        nodes: upsertEntity(state.nodes, normalizedPayload)
      });
    }

    case "node/rename": {
      const rawFromId = action.payload.fromId;
      const rawToId = action.payload.toId;
      const fromId = rawFromId.trim() as typeof rawFromId;
      const toId = rawToId.trim() as typeof rawToId;

      if (fromId.length === 0 || state.nodes.byId[fromId] === undefined) {
        return withError(state, "Cannot rename unknown node.");
      }
      if (toId.length === 0) {
        return withError(state, "Node ID is required.");
      }
      if (fromId === toId) {
        return clearLastError(state);
      }
      if (state.nodes.byId[toId] !== undefined) {
        return withError(state, `Node ID '${toId}' already exists.`);
      }

      const existingNode = state.nodes.byId[fromId];
      if (existingNode === undefined) {
        return withError(state, "Cannot rename unknown node.");
      }

      const nextNodesById = { ...state.nodes.byId };
      delete nextNodesById[fromId];
      nextNodesById[toId] = { ...existingNode, id: toId };

      const nextNodesAllIds = [...state.nodes.allIds.filter((candidate) => candidate !== fromId), toId].sort((a, b) =>
        a.localeCompare(b)
      );

      let segmentsChanged = false;
      const nextSegmentsById = { ...state.segments.byId };
      for (const segmentId of state.segments.allIds) {
        const segment = state.segments.byId[segmentId];
        if (segment === undefined) {
          continue;
        }
        if (segment.nodeA !== fromId && segment.nodeB !== fromId) {
          continue;
        }
        segmentsChanged = true;
        nextSegmentsById[segmentId] = {
          ...segment,
          nodeA: segment.nodeA === fromId ? toId : segment.nodeA,
          nodeB: segment.nodeB === fromId ? toId : segment.nodeB
        };
      }

      const nextNodePositions = { ...state.nodePositions };
      if (nextNodePositions[fromId] !== undefined) {
        nextNodePositions[toId] = nextNodePositions[fromId];
        delete nextNodePositions[fromId];
      }

      const nextSelected =
        state.ui.selected?.kind === "node" && state.ui.selected.id === fromId
          ? { kind: "node" as const, id: toId }
          : state.ui.selected;

      return bumpRevision({
        ...clearLastError(state),
        nodes: {
          byId: nextNodesById,
          allIds: nextNodesAllIds
        },
        segments: segmentsChanged
          ? {
            ...state.segments,
            byId: nextSegmentsById
          }
          : state.segments,
        nodePositions: nextNodePositions,
        ui: {
          ...state.ui,
          selected: nextSelected,
          lastError: null
        }
      });
    }

    case "node/remove": {
      const linkedSegments = countSegmentsUsingNode(state, action.payload.id);
      if (linkedSegments > 0) {
        return withError(state, "Cannot remove node while segments are connected to it.");
      }

      const nextNodePositions = { ...state.nodePositions };
      delete nextNodePositions[action.payload.id];

      return bumpRevision({
        ...clearLastError(state),
        nodes: removeEntity(state.nodes, action.payload.id),
        nodePositions: nextNodePositions,
        ui: shouldClearSelection(state.ui.selected, "node", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    default:
      return null;
  }
}
