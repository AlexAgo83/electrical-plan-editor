import type { AppAction } from "./actions";
import type { AppState, EntityState, SelectionState } from "./types";

function sortIds<Id extends string>(ids: Id[]): Id[] {
  return [...ids].sort((left, right) => left.localeCompare(right));
}

function upsertEntity<T extends { id: Id }, Id extends string>(
  state: EntityState<T, Id>,
  entity: T
): EntityState<T, Id> {
  const existing = state.byId[entity.id];
  const byId = {
    ...state.byId,
    [entity.id]: entity
  };

  if (existing !== undefined) {
    return {
      byId,
      allIds: state.allIds
    };
  }

  return {
    byId,
    allIds: sortIds([...state.allIds, entity.id])
  };
}

function removeEntity<T, Id extends string>(state: EntityState<T, Id>, id: Id): EntityState<T, Id> {
  if (state.byId[id] === undefined) {
    return state;
  }

  const byId = { ...state.byId };
  delete byId[id];

  return {
    byId,
    allIds: state.allIds.filter((candidate) => candidate !== id)
  };
}

function shouldClearSelection(selected: SelectionState | null, kind: SelectionState["kind"], id: string): boolean {
  return selected?.kind === kind && selected.id === id;
}

function bumpRevision(state: AppState): AppState {
  return {
    ...state,
    meta: {
      revision: state.meta.revision + 1
    }
  };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "connector/upsert": {
      return bumpRevision({
        ...state,
        connectors: upsertEntity(state.connectors, action.payload)
      });
    }

    case "connector/remove": {
      return bumpRevision({
        ...state,
        connectors: removeEntity(state.connectors, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "connector", action.payload.id)
          ? { selected: null }
          : state.ui
      });
    }

    case "splice/upsert": {
      return bumpRevision({
        ...state,
        splices: upsertEntity(state.splices, action.payload)
      });
    }

    case "splice/remove": {
      return bumpRevision({
        ...state,
        splices: removeEntity(state.splices, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "splice", action.payload.id)
          ? { selected: null }
          : state.ui
      });
    }

    case "node/upsert": {
      return bumpRevision({
        ...state,
        nodes: upsertEntity(state.nodes, action.payload)
      });
    }

    case "node/remove": {
      return bumpRevision({
        ...state,
        nodes: removeEntity(state.nodes, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "node", action.payload.id)
          ? { selected: null }
          : state.ui
      });
    }

    case "segment/upsert": {
      return bumpRevision({
        ...state,
        segments: upsertEntity(state.segments, action.payload)
      });
    }

    case "segment/remove": {
      return bumpRevision({
        ...state,
        segments: removeEntity(state.segments, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "segment", action.payload.id)
          ? { selected: null }
          : state.ui
      });
    }

    case "wire/upsert": {
      return bumpRevision({
        ...state,
        wires: upsertEntity(state.wires, action.payload)
      });
    }

    case "wire/remove": {
      return bumpRevision({
        ...state,
        wires: removeEntity(state.wires, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "wire", action.payload.id)
          ? { selected: null }
          : state.ui
      });
    }

    case "ui/select": {
      return bumpRevision({
        ...state,
        ui: {
          selected: action.payload
        }
      });
    }

    case "ui/clearSelection": {
      if (state.ui.selected === null) {
        return state;
      }

      return bumpRevision({
        ...state,
        ui: {
          selected: null
        }
      });
    }

    default: {
      const unhandled: never = action;
      return unhandled;
    }
  }
}
