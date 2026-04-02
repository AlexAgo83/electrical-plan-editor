import { useCallback, useState } from "react";
import {
  clearPendingPersistenceRecovery,
  commitPendingPersistenceRecovery,
  getPendingPersistenceRecovery
} from "../../../adapters/persistence";
import { appActions, selectLastError } from "../../../store";
import type { AppState, AppStore } from "../../../store";

type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: { trackHistory?: boolean }
) => void;

interface UseAppControllerPersistenceHealthParams {
  state: AppState;
  dispatchAction: DispatchAction;
}

export function useAppControllerPersistenceHealth({
  state,
  dispatchAction
}: UseAppControllerPersistenceHealthParams) {
  const lastError = selectLastError(state);
  const [bootRecoveryMessage, setBootRecoveryMessage] = useState<string | null>(
    () => getPendingPersistenceRecovery()?.message ?? null
  );

  const clearPersistenceHealth = useCallback(() => {
    clearPendingPersistenceRecovery();
    setBootRecoveryMessage(null);
    dispatchAction(appActions.clearError());
  }, [dispatchAction]);

  const commitBootRecovery = useCallback(() => {
    commitPendingPersistenceRecovery();
    clearPendingPersistenceRecovery();
    setBootRecoveryMessage(null);
    dispatchAction(appActions.clearError());
  }, [dispatchAction]);

  return {
    lastError,
    bootRecoveryMessage,
    clearPersistenceHealth,
    commitBootRecovery
  };
}
