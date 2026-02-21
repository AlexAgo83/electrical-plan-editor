import type { AppAction } from "./actions";
import { appReducer } from "./reducer";
import { createInitialState, type AppState } from "./types";

type StoreListener = () => void;

export interface AppStore {
  dispatch: (action: AppAction) => void;
  replaceState: (nextState: AppState) => void;
  getState: () => AppState;
  subscribe: (listener: StoreListener) => () => void;
}

export function createAppStore(initialState: AppState = createInitialState()): AppStore {
  let currentState = initialState;
  const listeners = new Set<StoreListener>();

  return {
    dispatch(action) {
      const nextState = appReducer(currentState, action);
      if (nextState === currentState) {
        return;
      }

      currentState = nextState;
      listeners.forEach((listener) => listener());
    },

    replaceState(nextState) {
      if (nextState === currentState) {
        return;
      }

      currentState = nextState;
      listeners.forEach((listener) => listener());
    },

    getState() {
      return currentState;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
}
