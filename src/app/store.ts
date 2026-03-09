import { loadState, saveState, type SaveStateResult } from "../adapters/persistence";
import { appActions, createAppStore, type AppStore } from "../store";

export const PERSISTENCE_WRITE_FAILURE_MESSAGE =
  "Local persistence is currently unavailable. Changes remain in this tab only until storage works again.";

interface AttachPersistenceSyncOptions {
  save?: (state: ReturnType<AppStore["getState"]>) => SaveStateResult;
}

export function attachPersistenceSync(store: AppStore, options?: AttachPersistenceSyncOptions): () => void {
  const save = options?.save ?? saveState;
  let isApplyingPersistenceFeedback = false;

  return store.subscribe(() => {
    if (isApplyingPersistenceFeedback) {
      return;
    }

    const currentState = store.getState();
    const saveResult = save(currentState);
    const isPersistenceErrorVisible = currentState.ui.lastError === PERSISTENCE_WRITE_FAILURE_MESSAGE;
    if (!saveResult.ok) {
      if (isPersistenceErrorVisible) {
        return;
      }

      isApplyingPersistenceFeedback = true;
      store.dispatch(appActions.setError(PERSISTENCE_WRITE_FAILURE_MESSAGE));
      isApplyingPersistenceFeedback = false;
      return;
    }

    if (!isPersistenceErrorVisible) {
      return;
    }

    isApplyingPersistenceFeedback = true;
    store.dispatch(appActions.clearError());
    isApplyingPersistenceFeedback = false;
  });
}

export const appStore = createAppStore(loadState());
attachPersistenceSync(appStore);
