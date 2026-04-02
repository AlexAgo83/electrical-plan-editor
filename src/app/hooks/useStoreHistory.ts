import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadRecentChangesMetadata, saveRecentChangesMetadata } from "../../adapters/persistence/recentChanges";
import { buildReplaceStateHistoryEntry, buildUndoHistoryEntry } from "../lib/recentChangeLabels";
import type { AppStore } from "../../store";
import type { UndoHistoryEntry } from "../types/app-controller";

type StoreState = ReturnType<AppStore["getState"]>;

interface UseStoreHistoryParams {
  store: AppStore;
  historyLimit: number;
  onUndoRedoApplied?: () => void;
  onReplaceStateApplied?: () => void;
  transformUndoRedoTargetState?: (targetState: StoreState, currentState: StoreState) => StoreState;
}

interface UseStoreHistoryResult {
  saveStatus: "saved" | "unsaved" | "error";
  isUndoAvailable: boolean;
  isRedoAvailable: boolean;
  undoHistoryEntries: UndoHistoryEntry[];
  dispatchAction: (action: Parameters<AppStore["dispatch"]>[0], options?: { trackHistory?: boolean }) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  replaceStateWithHistory: (nextState: StoreState) => void;
}

function getHighestHistorySequence(entries: UndoHistoryEntry[]): number {
  let highest = 0;
  for (const entry of entries) {
    if (entry.sequence > highest) {
      highest = entry.sequence;
    }
  }
  return highest;
}

export function useStoreHistory({
  store,
  historyLimit,
  onUndoRedoApplied,
  onReplaceStateApplied,
  transformUndoRedoTargetState
}: UseStoreHistoryParams): UseStoreHistoryResult {
  const [undoStack, setUndoStack] = useState<StoreState[]>([]);
  const [redoStack, setRedoStack] = useState<StoreState[]>([]);
  const [undoHistoryEntries, setUndoHistoryEntries] = useState<UndoHistoryEntry[]>(() =>
    loadRecentChangesMetadata(historyLimit)
  );
  const [redoHistoryEntries, setRedoHistoryEntries] = useState<UndoHistoryEntry[]>([]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "error">("saved");
  const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyEntrySequenceRef = useRef(getHighestHistorySequence(undoHistoryEntries));

  useEffect(() => {
    return () => {
      if (saveStatusTimeoutRef.current !== null) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    saveRecentChangesMetadata(undoHistoryEntries, historyLimit);
  }, [historyLimit, undoHistoryEntries]);

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

      const historyEntry = buildUndoHistoryEntry(
        action,
        previousState,
        nextState,
        ++historyEntrySequenceRef.current,
        new Date().toISOString()
      );

      setUndoStack((previous) => {
        const next = [...previous, previousState];
        return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
      });
      setUndoHistoryEntries((previous) => {
        const next = [...previous, historyEntry];
        return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
      });
      setRedoStack([]);
      setRedoHistoryEntries([]);
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

    const previousHistoryEntry = undoHistoryEntries[undoHistoryEntries.length - 1];
    if (previousHistoryEntry === undefined) {
      return;
    }

    const currentState = store.getState();
    const nextUndoState = transformUndoRedoTargetState?.(previousState, currentState) ?? previousState;
    try {
      store.replaceState(nextUndoState);
    } catch {
      setSaveStatus("error");
      return;
    }

    setUndoStack((previous) => previous.slice(0, -1));
    setUndoHistoryEntries((previous) => previous.slice(0, -1));
    setRedoStack((previous) => {
      const next = [...previous, currentState];
      return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
    });
    setRedoHistoryEntries((previous) => {
      const next = [...previous, previousHistoryEntry];
      return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
    });
    onUndoRedoApplied?.();
    setSaveStatus("unsaved");
    queueSavedStatus();
  }, [historyLimit, onUndoRedoApplied, queueSavedStatus, store, transformUndoRedoTargetState, undoHistoryEntries, undoStack]);

  const handleRedo = useCallback((): void => {
    if (redoStack.length === 0) {
      return;
    }

    const redoState = redoStack[redoStack.length - 1];
    if (redoState === undefined) {
      return;
    }

    const redoHistoryEntry = redoHistoryEntries[redoHistoryEntries.length - 1];
    if (redoHistoryEntry === undefined) {
      return;
    }

    const currentState = store.getState();
    const nextRedoState = transformUndoRedoTargetState?.(redoState, currentState) ?? redoState;
    try {
      store.replaceState(nextRedoState);
    } catch {
      setSaveStatus("error");
      return;
    }

    setRedoStack((previous) => previous.slice(0, -1));
    setRedoHistoryEntries((previous) => previous.slice(0, -1));
    setUndoStack((previous) => {
      const next = [...previous, currentState];
      return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
    });
    setUndoHistoryEntries((previous) => {
      const next = [...previous, redoHistoryEntry];
      return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
    });
    onUndoRedoApplied?.();
    setSaveStatus("unsaved");
    queueSavedStatus();
  }, [historyLimit, onUndoRedoApplied, queueSavedStatus, redoHistoryEntries, redoStack, store, transformUndoRedoTargetState]);

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

      const historyEntry = buildReplaceStateHistoryEntry(
        ++historyEntrySequenceRef.current,
        currentState,
        nextState,
        new Date().toISOString()
      );

      setUndoStack((previous) => {
        const next = [...previous, currentState];
        return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
      });
      setUndoHistoryEntries((previous) => {
        const next = [...previous, historyEntry];
        return next.length > historyLimit ? next.slice(next.length - historyLimit) : next;
      });
      setRedoStack([]);
      setRedoHistoryEntries([]);
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
    undoHistoryEntries,
    dispatchAction,
    handleUndo,
    handleRedo,
    replaceStateWithHistory
  };
}
