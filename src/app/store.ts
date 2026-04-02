import { loadState, saveState, type SaveStateResult } from "../adapters/persistence";
import { appActions, createAppStore, type AppStore } from "../store";

export const PERSISTENCE_WRITE_FAILURE_MESSAGE =
  "Local persistence is currently unavailable. Changes remain in this tab only until storage works again.";
export const PERSISTENCE_QUOTA_EXCEEDED_MESSAGE =
  "Browser storage is full. Persistence could not save the latest changes until space is freed.";
export const PERSISTENCE_STORAGE_WARNING_MESSAGE =
  "Browser storage is almost full. Persistence may stop saving changes if the workspace grows further.";

interface AttachPersistenceSyncOptions {
  save?: (state: ReturnType<AppStore["getState"]>) => SaveStateResult | Promise<SaveStateResult>;
}

function mapPersistenceResultToMessage(result: SaveStateResult): string | null {
  if (!result.ok) {
    if (result.reason === "quota-exceeded") {
      return PERSISTENCE_QUOTA_EXCEEDED_MESSAGE;
    }

    return PERSISTENCE_WRITE_FAILURE_MESSAGE;
  }

  if (result.warning === "storage-near-quota") {
    return PERSISTENCE_STORAGE_WARNING_MESSAGE;
  }

  return null;
}

function isPersistenceFeedbackMessage(message: string | null): boolean {
  return (
    message === PERSISTENCE_WRITE_FAILURE_MESSAGE ||
    message === PERSISTENCE_QUOTA_EXCEEDED_MESSAGE ||
    message === PERSISTENCE_STORAGE_WARNING_MESSAGE
  );
}

export function attachPersistenceSync(store: AppStore, options?: AttachPersistenceSyncOptions): () => void {
  const save = options?.save ?? saveState;
  let isApplyingPersistenceFeedback = false;
  let saveSequence = 0;

  return store.subscribe(() => {
    if (isApplyingPersistenceFeedback) {
      return;
    }

    const currentState = store.getState();
    const currentSequence = saveSequence + 1;
    saveSequence = currentSequence;

    void Promise.resolve(save(currentState))
      .then((saveResult) => {
        if (currentSequence !== saveSequence) {
          return;
        }

        const nextState = store.getState();
        const currentMessage = nextState.ui.lastError;
        const nextMessage = mapPersistenceResultToMessage(saveResult);
        const isPersistenceMessageVisible = isPersistenceFeedbackMessage(currentMessage);

        if (nextMessage !== null) {
          if (currentMessage === nextMessage) {
            return;
          }

          isApplyingPersistenceFeedback = true;
          store.dispatch(appActions.setError(nextMessage));
          isApplyingPersistenceFeedback = false;
          return;
        }

        if (!isPersistenceMessageVisible) {
          return;
        }

        isApplyingPersistenceFeedback = true;
        store.dispatch(appActions.clearError());
        isApplyingPersistenceFeedback = false;
      })
      .catch(() => {
        if (currentSequence !== saveSequence) {
          return;
        }

        const nextState = store.getState();
        if (nextState.ui.lastError === PERSISTENCE_WRITE_FAILURE_MESSAGE) {
          return;
        }

        isApplyingPersistenceFeedback = true;
        store.dispatch(appActions.setError(PERSISTENCE_WRITE_FAILURE_MESSAGE));
        isApplyingPersistenceFeedback = false;
      });
  });
}

export const appStore = createAppStore(loadState());
attachPersistenceSync(appStore);
