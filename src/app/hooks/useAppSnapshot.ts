import { useSyncExternalStore } from "react";
import type { AppStore } from "../../store";

export function useAppSnapshot(store: AppStore) {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}
