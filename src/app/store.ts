import { loadState, saveState } from "../adapters/persistence";
import { createAppStore } from "../store";

export const appStore = createAppStore(loadState());

appStore.subscribe(() => {
  saveState(appStore.getState());
});
