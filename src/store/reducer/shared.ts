import type { AppState, EntityState, SelectionState } from "../types";

function sortIds<Id extends string>(ids: Id[]): Id[] {
  return [...ids].sort((left, right) => left.localeCompare(right));
}

export function upsertEntity<T extends { id: Id }, Id extends string>(
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

export function removeEntity<T, Id extends string>(state: EntityState<T, Id>, id: Id): EntityState<T, Id> {
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

export function shouldClearSelection(selected: SelectionState | null, kind: SelectionState["kind"], id: string): boolean {
  return selected?.kind === kind && selected.id === id;
}

export function clearLastError(state: AppState): AppState {
  if (state.ui.lastError === null) {
    return state;
  }

  return {
    ...state,
    ui: {
      ...state.ui,
      lastError: null
    }
  };
}

export function bumpRevision(state: AppState): AppState {
  return {
    ...state,
    meta: {
      revision: state.meta.revision + 1
    }
  };
}

export function withError(state: AppState, message: string): AppState {
  if (state.ui.lastError === message) {
    return state;
  }

  return bumpRevision({
    ...state,
    ui: {
      ...state.ui,
      lastError: message
    }
  });
}

export function isValidSlotIndex(index: number, max: number): boolean {
  return Number.isInteger(index) && index >= 1 && index <= max;
}
