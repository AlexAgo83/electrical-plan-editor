import { loadState, saveState, saveStateSync, type SaveStateResult } from "../adapters/persistence";
import { appActions, createAppStore, getAppErrorMessage, type AppStore } from "../store";

export const PERSISTENCE_WRITE_FAILURE_MESSAGE =
  "Local persistence is currently unavailable. Changes remain in this tab only until storage works again.";
export const PERSISTENCE_QUOTA_EXCEEDED_MESSAGE =
  "Browser storage is full. Persistence could not save the latest changes until space is freed.";
export const PERSISTENCE_STORAGE_WARNING_MESSAGE =
  "Browser storage is almost full. Persistence may stop saving changes if the workspace grows further.";

interface AttachPersistenceSyncOptions {
  save?: (state: ReturnType<AppStore["getState"]>) => SaveStateResult | Promise<SaveStateResult>;
  saveSync?: (state: ReturnType<AppStore["getState"]>) => SaveStateResult;
  debounceMs?: number;
}

const DEFAULT_PERSISTENCE_DEBOUNCE_MS = 200;
type IdleCallbackHandle = ReturnType<typeof setTimeout> | number;

function requestPersistenceIdleCallback(callback: () => void): IdleCallbackHandle {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(callback);
  }
  return setTimeout(callback, 0);
}

function cancelPersistenceIdleCallback(handle: IdleCallbackHandle): void {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window && typeof handle === "number") {
    window.cancelIdleCallback(handle);
    return;
  }
  clearTimeout(handle);
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
  const saveSync = options?.saveSync ?? saveStateSync;
  const debounceMs = options?.debounceMs ?? DEFAULT_PERSISTENCE_DEBOUNCE_MS;
  let isApplyingPersistenceFeedback = false;
  let saveSequence = 0;
  let pendingTimerId: ReturnType<typeof setTimeout> | null = null;
  let pendingIdleId: IdleCallbackHandle | null = null;

  function applyPersistenceFeedback(saveResult: SaveStateResult): void {
    const nextState = store.getState();
    const currentMessage = getAppErrorMessage(nextState.ui.lastError);
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
  }

  function applyWriteFailureFeedback(): void {
    const nextState = store.getState();
    if (getAppErrorMessage(nextState.ui.lastError) === PERSISTENCE_WRITE_FAILURE_MESSAGE) {
      return;
    }

    isApplyingPersistenceFeedback = true;
    store.dispatch(appActions.setError(PERSISTENCE_WRITE_FAILURE_MESSAGE));
    isApplyingPersistenceFeedback = false;
  }

  function runPendingSave(): void {
    pendingIdleId = null;
    const currentState = store.getState();
    const currentSequence = saveSequence + 1;
    saveSequence = currentSequence;
    const startedAt = typeof performance === "undefined" ? 0 : performance.now();

    void Promise.resolve(save(currentState))
      .then((saveResult) => {
        if (currentSequence !== saveSequence) {
          return;
        }

        applyPersistenceFeedback(saveResult);
      })
      .catch(() => {
        if (currentSequence !== saveSequence) {
          return;
        }

        applyWriteFailureFeedback();
      })
      .finally(() => {
        if (
          typeof performance !== "undefined" &&
          import.meta.env.DEV &&
          typeof localStorage !== "undefined" &&
          localStorage.getItem("debug:persistence") === "true"
        ) {
          console.debug(`[persistence] steady-state save took ${(performance.now() - startedAt).toFixed(1)}ms`);
        }
      });
  }

  function flushPendingSave(): void {
    pendingTimerId = null;
    if (pendingIdleId !== null) {
      cancelPersistenceIdleCallback(pendingIdleId);
    }
    pendingIdleId = requestPersistenceIdleCallback(runPendingSave);
  }

  // Synchronous flush for page-lifecycle transitions and detach. A pending
  // debounced write would otherwise be dropped when the tab is hidden/closed or
  // the subscription is torn down before the trailing timer fires. The write
  // must be synchronous because the page can be discarded before any awaited
  // microtask runs.
  function flushPendingSaveSync(): void {
    if (pendingTimerId === null && pendingIdleId === null) {
      return;
    }

    if (pendingTimerId !== null) {
      clearTimeout(pendingTimerId);
    }
    pendingTimerId = null;
    if (pendingIdleId !== null) {
      cancelPersistenceIdleCallback(pendingIdleId);
      pendingIdleId = null;
    }
    // Invalidate any in-flight async save so its late feedback cannot clobber this one.
    saveSequence += 1;

    try {
      applyPersistenceFeedback(saveSync(store.getState()));
    } catch {
      applyWriteFailureFeedback();
    }
  }

  const unsubscribe = store.subscribe(() => {
    if (isApplyingPersistenceFeedback) {
      return;
    }

    if (debounceMs <= 0) {
      flushPendingSave();
      return;
    }

    if (pendingTimerId !== null) {
      clearTimeout(pendingTimerId);
    }
    pendingTimerId = setTimeout(flushPendingSave, debounceMs);
  });

  const supportsDomLifecycle = typeof window !== "undefined" && typeof document !== "undefined";

  function handlePageHide(): void {
    flushPendingSaveSync();
  }

  function handleVisibilityChange(): void {
    if (document.visibilityState === "hidden") {
      flushPendingSaveSync();
    }
  }

  if (supportsDomLifecycle) {
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  return () => {
    flushPendingSaveSync();
    if (pendingTimerId !== null) {
      clearTimeout(pendingTimerId);
      pendingTimerId = null;
    }
    if (pendingIdleId !== null) {
      cancelPersistenceIdleCallback(pendingIdleId);
      pendingIdleId = null;
    }
    if (supportsDomLifecycle) {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
    unsubscribe();
  };
}

export const appStore = createAppStore(loadState());
attachPersistenceSync(appStore);
