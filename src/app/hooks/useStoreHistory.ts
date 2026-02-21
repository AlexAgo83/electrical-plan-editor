import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppStore } from "../../store";

type StoreState = ReturnType<AppStore["getState"]>;

interface UseStoreHistoryParams {
  store: AppStore;
  historyLimit: number;
  onUndoRedoApplied?: () => void;
  onReplaceStateApplied?: () => void;
}

interface UseStoreHistoryResult {
  saveStatus: "saved" | "unsaved" | "error";
  isUndoAvailable: boolean;
  isRedoAvailable: boolean;
  dispatchAction: (action: Parameters<AppStore["dispatch"]>[0], options?: { trackHistory?: boolean }) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  replaceStateWithHistory: (nextState: StoreState) => void;
}

export function useStoreHistory({
  store,
  historyLimit,
  onUndoRedoApplied,
  onReplaceStateApplied
}: UseStoreHistoryParams): UseStoreHistoryResult {
  const [undoStack, setUndoStack] = useState<StoreState[]>([]);
  const [redoStack, setRedoStack] = useState<StoreState[]>([]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "error">("saved");
  const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveStatusTimeoutRef.current !== null) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  const queueSavedStatus = useCallback((): void => {
    if (saveStatusTimeoutRef.current !== null) {
      clearTimeout(saveStatusTimeoutRef.current);
    }

    saveStatusTimeoutRef.current = setTimeout(() => {
      setSaveStatus((current) => (current === "unsaved" ? "saved" : current));
      saveStatusTimeoutRef.current = null;
    }, 250);
  }, []);

  const dispatchAction = useCallback(
    (
      action: Parameters<AppStore["dispatch"]>[0],
      options?: {
        trackHistory?: boolean;
      }
    ): void => {
      const shouldTrackHistory = options?.trackHistory ?? !action.type.startsWith("ui/");
      const previousState = store.getState();

      try {
        store.dispatch(action);
      } catch {
        setSaveStatus("error");
        return;
      }

      const nextState = store.getState();
      if (nextState === previousState) {
        return;
      }

      if (!shouldTrackHistory) {
        return;
      }

      setUndoStack((previous) => {
        const next = [...previous, previousState];
        return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
      });
      setRedoStack([]);
      setSaveStatus("unsaved");
      queueSavedStatus();
    },
    [historyLimit, queueSavedStatus, store]
  );

  const handleUndo = useCallback((): void => {
    if (undoStack.length === 0) {
      return;
    }

    const previousState = undoStack[undoStack.length - 1];
    if (previousState === undefined) {
      return;
    }

    const currentState = store.getState();
    try {
      store.replaceState(previousState);
    } catch {
      setSaveStatus("error");
      return;
    }

    setUndoStack((previous) => previous.slice(0, -1));
    setRedoStack((previous) => {
      const next = [...previous, currentState];
      return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
    });
    onUndoRedoApplied?.();
    setSaveStatus("unsaved");
    queueSavedStatus();
  }, [historyLimit, onUndoRedoApplied, queueSavedStatus, store, undoStack]);

  const handleRedo = useCallback((): void => {
    if (redoStack.length === 0) {
      return;
    }

    const redoState = redoStack[redoStack.length - 1];
    if (redoState === undefined) {
      return;
    }

    const currentState = store.getState();
    try {
      store.replaceState(redoState);
    } catch {
      setSaveStatus("error");
      return;
    }

    setRedoStack((previous) => previous.slice(0, -1));
    setUndoStack((previous) => {
      const next = [...previous, currentState];
      return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
    });
    onUndoRedoApplied?.();
    setSaveStatus("unsaved");
    queueSavedStatus();
  }, [historyLimit, onUndoRedoApplied, queueSavedStatus, redoStack, store]);

  const replaceStateWithHistory = useCallback(
    (nextState: StoreState): void => {
      const currentState = store.getState();
      if (nextState === currentState) {
        return;
      }

      try {
        store.replaceState(nextState);
      } catch {
        setSaveStatus("error");
        return;
      }

      setUndoStack((previous) => {
        const next = [...previous, currentState];
        return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
      });
      setRedoStack([]);
      onReplaceStateApplied?.();
      setSaveStatus("unsaved");
      queueSavedStatus();
    },
    [historyLimit, onReplaceStateApplied, queueSavedStatus, store]
  );

  const isUndoAvailable = useMemo(() => undoStack.length > 0, [undoStack.length]);
  const isRedoAvailable = useMemo(() => redoStack.length > 0, [redoStack.length]);

  return {
    saveStatus,
    isUndoAvailable,
    isRedoAvailable,
    dispatchAction,
    handleUndo,
    handleRedo,
    replaceStateWithHistory
  };
}
