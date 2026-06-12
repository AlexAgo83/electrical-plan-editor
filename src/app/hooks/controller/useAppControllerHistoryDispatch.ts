import { useCallback } from "react";
import type { AppStore } from "../../../store";
import { withPreservedNetworkSummaryViewStates } from "../../../store";
import { buildAppActionToast } from "../../lib/app-action-toast";
import { HISTORY_LIMIT } from "../../lib/app-utils-shared";
import type { InteractionMode, ScreenId, SubScreenId } from "../../types/app-controller";
import { useStoreHistory } from "../useStoreHistory";

interface UseAppControllerHistoryDispatchParams {
  store: AppStore;
  restoreViewportOnUndo: boolean;
  setPendingNewNodePosition: (value: null) => void;
  setActiveScreen: (screen: ScreenId) => void;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  notifyToast: (title: string, options?: { message?: string; variant?: "success" | "info" | "warning" | "error" }) => void;
}

export function useAppControllerHistoryDispatch({
  store,
  restoreViewportOnUndo,
  setPendingNewNodePosition,
  setActiveScreen,
  setActiveSubScreen,
  setInteractionMode,
  notifyToast
}: UseAppControllerHistoryDispatchParams) {
  const { dispatchAction: dispatchActionWithHistory, ...history } = useStoreHistory({
    store,
    historyLimit: HISTORY_LIMIT,
    transformUndoRedoTargetState: (targetState, currentState) =>
      restoreViewportOnUndo ? targetState : withPreservedNetworkSummaryViewStates(targetState, currentState),
    onUndoRedoApplied: ({ direction, entry }) => {
      setPendingNewNodePosition(null);
      notifyToast(direction === "undo" ? "Undo applied" : "Redo applied", {
        message: entry.label,
        variant: "info"
      });
    },
    onReplaceStateApplied: () => {
      setPendingNewNodePosition(null);
      setActiveScreen("modeling");
      setActiveSubScreen("connector");
      setInteractionMode("select");
    }
  });

  const dispatchAction = useCallback(
    (
      action: Parameters<typeof dispatchActionWithHistory>[0],
      options?: Parameters<typeof dispatchActionWithHistory>[1]
    ): void => {
      const previousState = store.getState();
      dispatchActionWithHistory(action, options);
      const nextState = store.getState();
      if (nextState === previousState || options?.trackHistory === false) {
        return;
      }

      const toast = buildAppActionToast(action, previousState, nextState);
      if (toast !== null) {
        notifyToast(toast.title, {
          message: toast.message,
          variant: toast.variant
        });
      }

      const nextWarning = nextState.ui.lastWarning ?? null;
      if (nextWarning !== null && nextWarning !== (previousState.ui.lastWarning ?? null)) {
        notifyToast("Adjustment applied", {
          message: nextWarning.message,
          variant: "warning"
        });
      }
    },
    [dispatchActionWithHistory, notifyToast, store]
  );

  return {
    ...history,
    dispatchAction
  };
}
