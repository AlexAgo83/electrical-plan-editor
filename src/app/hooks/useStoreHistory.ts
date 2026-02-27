import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NetworkId } from "../../core/entities";
import type { AppStore } from "../../store";
import type { UndoHistoryEntry, UndoHistoryTargetKind } from "../types/app-controller";

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
  undoHistoryEntries: UndoHistoryEntry[];
  dispatchAction: (action: Parameters<AppStore["dispatch"]>[0], options?: { trackHistory?: boolean }) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  replaceStateWithHistory: (nextState: StoreState) => void;
}

type HistoryTrackableAction = Parameters<AppStore["dispatch"]>[0];

function toTargetKind(actionType: HistoryTrackableAction["type"] | "history/replaceState"): UndoHistoryTargetKind {
  const prefix = actionType.split("/")[0];
  switch (prefix) {
    case "network":
    case "catalog":
    case "connector":
    case "splice":
    case "node":
    case "segment":
    case "wire":
    case "layout":
      return prefix;
    default:
      return "workspace";
  }
}

function targetKindLabel(kind: UndoHistoryTargetKind): string {
  switch (kind) {
    case "network":
      return "Network";
    case "catalog":
      return "Catalog item";
    case "connector":
      return "Connector";
    case "splice":
      return "Splice";
    case "node":
      return "Node";
    case "segment":
      return "Segment";
    case "wire":
      return "Wire";
    case "layout":
      return "Layout";
    case "workspace":
      return "Workspace";
  }
}

function resolveTargetId(action: HistoryTrackableAction): string | null {
  switch (action.type) {
    case "network/create":
      return action.payload.network.technicalId || action.payload.network.id;
    case "network/select":
    case "network/setSummaryViewState":
    case "network/rename":
    case "network/delete":
      return action.payload.id;
    case "network/update":
      return action.payload.technicalId || action.payload.id;
    case "network/duplicate":
      return action.payload.network.technicalId || action.payload.network.id;
    case "network/importMany":
      return `${action.payload.networks.length} network(s)`;
    case "catalog/upsert":
      return action.payload.manufacturerReference || action.payload.id;
    case "catalog/remove":
      return action.payload.id;
    case "connector/upsert":
      return action.payload.technicalId || action.payload.id;
    case "connector/remove":
      return action.payload.id;
    case "connector/occupyCavity":
    case "connector/releaseCavity":
      return `${action.payload.connectorId}:${action.payload.cavityIndex + 1}`;
    case "splice/upsert":
      return action.payload.technicalId || action.payload.id;
    case "splice/remove":
      return action.payload.id;
    case "splice/occupyPort":
    case "splice/releasePort":
      return `${action.payload.spliceId}:${action.payload.portIndex + 1}`;
    case "node/upsert":
    case "node/remove":
      return action.payload.id;
    case "node/rename":
      return `${action.payload.fromId}→${action.payload.toId}`;
    case "segment/upsert":
    case "segment/remove":
      return action.payload.id;
    case "segment/rename":
      return `${action.payload.fromId}→${action.payload.toId}`;
    case "wire/save":
      return action.payload.technicalId || action.payload.id;
    case "wire/lockRoute":
    case "wire/resetRoute":
    case "wire/remove":
      return action.payload.id;
    case "wire/upsert":
      return action.payload.technicalId || action.payload.id;
    case "layout/setNodePosition":
      return action.payload.nodeId;
    case "layout/setNodePositions":
      return `${Object.keys(action.payload.positions).length} node(s)`;
    case "ui/select":
    case "ui/setThemeMode":
    case "ui/clearSelection":
    case "ui/clearError":
      return null;
  }
}

function resolveEntryNetworkId(action: HistoryTrackableAction, previousState: StoreState, nextState: StoreState): NetworkId | null {
  switch (action.type) {
    case "network/create":
      return action.payload.network.id;
    case "network/select":
    case "network/setSummaryViewState":
    case "network/rename":
    case "network/update":
    case "network/delete":
      return action.payload.id;
    case "network/duplicate":
      return action.payload.network.id;
    case "network/importMany":
      return nextState.activeNetworkId ?? previousState.activeNetworkId;
    default:
      return previousState.activeNetworkId;
  }
}

function actionVerb(action: HistoryTrackableAction, previousState: StoreState): string {
  switch (action.type) {
    case "network/create":
      return "created";
    case "network/select":
      return "activated";
    case "network/setSummaryViewState":
      return "view updated";
    case "network/rename":
      return "renamed";
    case "network/update":
      return "updated";
    case "network/duplicate":
      return "duplicated";
    case "network/delete":
      return "deleted";
    case "network/importMany":
      return "imported";
    case "catalog/upsert":
      return previousState.catalogItems.byId[action.payload.id] === undefined ? "created" : "updated";
    case "catalog/remove":
      return "deleted";
    case "connector/upsert":
      return previousState.connectors.byId[action.payload.id] === undefined ? "created" : "updated";
    case "connector/remove":
      return "deleted";
    case "connector/occupyCavity":
      return "cavity occupied";
    case "connector/releaseCavity":
      return "cavity released";
    case "splice/upsert":
      return previousState.splices.byId[action.payload.id] === undefined ? "created" : "updated";
    case "splice/remove":
      return "deleted";
    case "splice/occupyPort":
      return "port occupied";
    case "splice/releasePort":
      return "port released";
    case "node/upsert":
      return previousState.nodes.byId[action.payload.id] === undefined ? "created" : "updated";
    case "node/rename":
      return "renamed";
    case "node/remove":
      return "deleted";
    case "segment/upsert":
      return previousState.segments.byId[action.payload.id] === undefined ? "created" : "updated";
    case "segment/rename":
      return "renamed";
    case "segment/remove":
      return "deleted";
    case "wire/save":
      return previousState.wires.byId[action.payload.id] === undefined ? "created" : "updated";
    case "wire/lockRoute":
      return "route locked";
    case "wire/resetRoute":
      return "route reset";
    case "wire/upsert":
      return previousState.wires.byId[action.payload.id] === undefined ? "created" : "updated";
    case "wire/remove":
      return "deleted";
    case "layout/setNodePosition":
    case "layout/setNodePositions":
      return "updated";
    case "ui/select":
    case "ui/setThemeMode":
    case "ui/clearSelection":
    case "ui/clearError":
      return "updated";
  }
}

function toUndoHistoryEntry(
  action: HistoryTrackableAction,
  previousState: StoreState,
  nextState: StoreState,
  sequence: number,
  nowIso: string
): UndoHistoryEntry {
  const targetKind = toTargetKind(action.type);
  const targetId = resolveTargetId(action);
  const labelRoot = targetId === null ? targetKindLabel(targetKind) : `${targetKindLabel(targetKind)} '${targetId}'`;

  return {
    sequence,
    actionType: action.type,
    targetKind,
    targetId,
    networkId: resolveEntryNetworkId(action, previousState, nextState),
    label: `${labelRoot} ${actionVerb(action, previousState)}`,
    timestampIso: nowIso
  };
}

function toReplaceStateHistoryEntry(sequence: number, previousState: StoreState, nextState: StoreState, nowIso: string): UndoHistoryEntry {
  const activeNetworkId = nextState.activeNetworkId ?? previousState.activeNetworkId;
  return {
    sequence,
    actionType: "history/replaceState",
    targetKind: "workspace",
    targetId: activeNetworkId,
    networkId: activeNetworkId,
    label: "Workspace state replaced",
    timestampIso: nowIso
  };
}

export function useStoreHistory({
  store,
  historyLimit,
  onUndoRedoApplied,
  onReplaceStateApplied
}: UseStoreHistoryParams): UseStoreHistoryResult {
  const [undoStack, setUndoStack] = useState<StoreState[]>([]);
  const [redoStack, setRedoStack] = useState<StoreState[]>([]);
  const [undoHistoryEntries, setUndoHistoryEntries] = useState<UndoHistoryEntry[]>([]);
  const [redoHistoryEntries, setRedoHistoryEntries] = useState<UndoHistoryEntry[]>([]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "error">("saved");
  const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyEntrySequenceRef = useRef(0);

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

      const historyEntry = toUndoHistoryEntry(
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
    try {
      store.replaceState(previousState);
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
  }, [historyLimit, onUndoRedoApplied, queueSavedStatus, store, undoHistoryEntries, undoStack]);

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
    try {
      store.replaceState(redoState);
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
  }, [historyLimit, onUndoRedoApplied, queueSavedStatus, redoHistoryEntries, redoStack, store]);

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

      const historyEntry = toReplaceStateHistoryEntry(
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
