import type { AppState, AppStore } from "../../../store";
import { hasSampleNetworkSignature, isWorkspaceEmpty } from "../../../store";
import type { ConfirmDialogRequest } from "../../types/confirm-dialog";
import type { InteractionMode, ScreenId, SubScreenId } from "../../types/app-controller";
import { useToastNotifications } from "../useToastNotifications";
import { useWorkspaceFileStorage } from "../useWorkspaceFileStorage";
import { useAppControllerHistoryDispatch } from "./useAppControllerHistoryDispatch";
import { useAppControllerPersistenceHealth } from "./useAppControllerPersistenceHealth";

interface UseAppControllerWorkspaceRuntimeParams {
  store: AppStore;
  state: AppState;
  restoreViewportOnUndo: boolean;
  setPendingNewNodePosition: (value: null) => void;
  setActiveScreen: (screen: ScreenId) => void;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  requestConfirmation: (request: ConfirmDialogRequest) => Promise<boolean>;
  showSpliceMigrationReport?: (entries: string[]) => void;
}

export function useAppControllerWorkspaceRuntime({
  store,
  state,
  restoreViewportOnUndo,
  setPendingNewNodePosition,
  setActiveScreen,
  setActiveSubScreen,
  setInteractionMode,
  requestConfirmation,
  showSpliceMigrationReport
}: UseAppControllerWorkspaceRuntimeParams) {
  const isCurrentWorkspaceEmpty = isWorkspaceEmpty(state);
  const hasBuiltInSampleState = hasSampleNetworkSignature(state);
  const { toasts, notifyToast, dismissToast } = useToastNotifications();
  const historyDispatch = useAppControllerHistoryDispatch({
    store,
    restoreViewportOnUndo,
    setPendingNewNodePosition,
    setActiveScreen,
    setActiveSubScreen,
    setInteractionMode,
    notifyToast
  });
  const persistenceHealth = useAppControllerPersistenceHealth({
    state,
    dispatchAction: historyDispatch.dispatchAction
  });
  const workspaceFileStorage = useWorkspaceFileStorage({
    store,
    replaceStateWithHistory: historyDispatch.replaceStateWithHistory,
    requestConfirmation,
    notifyToast,
    showSpliceMigrationReport
  });

  return {
    isCurrentWorkspaceEmpty,
    hasBuiltInSampleState,
    toasts,
    notifyToast,
    dismissToast,
    workspaceFileStorage,
    ...historyDispatch,
    ...persistenceHealth
  };
}
