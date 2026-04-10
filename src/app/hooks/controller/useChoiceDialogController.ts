import { useCallback, useEffect, useRef, useState } from "react";
import type { ChoiceDialogRequest, ChoiceDialogOption } from "../../types/confirm-dialog";

export interface ActiveChoiceDialogState {
  title: string;
  message: string;
  details?: string;
  discardLabel: string;
  options: ChoiceDialogOption[];
  closeOnBackdrop: boolean;
}

export function useChoiceDialogController() {
  const choiceDialogResolveRef = useRef<((choiceId: string | null) => void) | null>(null);
  const [activeChoiceDialog, setActiveChoiceDialog] = useState<ActiveChoiceDialogState | null>(null);

  const closeActiveChoiceDialog = useCallback((choiceId: string | null) => {
    const resolve = choiceDialogResolveRef.current;
    choiceDialogResolveRef.current = null;
    setActiveChoiceDialog(null);
    resolve?.(choiceId);
  }, []);

  const requestChoiceSelection = useCallback((request: ChoiceDialogRequest): Promise<string | null> => {
    return new Promise<string | null>((resolve) => {
      const activeResolve = choiceDialogResolveRef.current;
      if (activeResolve !== null) {
        activeResolve(null);
      }

      choiceDialogResolveRef.current = resolve;
      setActiveChoiceDialog({
        title: request.title,
        message: request.message,
        details: request.details,
        discardLabel: request.discardLabel ?? "Discard",
        options: request.options,
        closeOnBackdrop: request.closeOnBackdrop ?? true
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      const resolve = choiceDialogResolveRef.current;
      choiceDialogResolveRef.current = null;
      resolve?.(null);
    };
  }, []);

  return {
    activeChoiceDialog,
    requestChoiceSelection,
    closeActiveChoiceDialog
  };
}
