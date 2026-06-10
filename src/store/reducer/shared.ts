import {
  isSameAppError,
  normalizeAppError,
  type AppError,
  type AppState,
  type EntityState,
  type SelectionState
} from "../types";

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
  if (state.ui.lastError === null && (state.ui.lastWarning ?? null) === null) {
    return state;
  }

  return {
    ...state,
    ui: {
      ...state.ui,
      lastError: null,
      lastWarning: null
    }
  };
}

/**
 * Non-blocking warning channel: the action succeeds while the warning is
 * surfaced to the user (clamped offsets, relative position shifts, ...).
 */
export function withWarning(state: AppState, warning: string | AppError): AppState {
  return {
    ...state,
    ui: {
      ...state.ui,
      lastWarning: normalizeAppError(warning)
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

export function withError(state: AppState, error: string | AppError): AppState {
  const normalizedError = normalizeAppError(error);
  if (isSameAppError(state.ui.lastError, normalizedError)) {
    return state;
  }

  return bumpRevision({
    ...state,
    ui: {
      ...state.ui,
      lastError: normalizedError
    }
  });
}

export function isValidSlotIndex(index: number, max: number): boolean {
  return Number.isInteger(index) && index >= 1 && index <= max;
}
