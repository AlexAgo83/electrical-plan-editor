import { useCallback, useEffect, useRef, useState } from "react";
import type { ConfirmDialogIntent, ConfirmDialogRequest } from "../../types/confirm-dialog";

export interface ActiveConfirmDialogState {
  title: string;
  message: string;
  details?: string;
  confirmLabel: string;
  cancelLabel: string;
  intent: ConfirmDialogIntent;
  closeOnBackdrop: boolean;
}

export function useConfirmDialogController() {
  const confirmDialogResolveRef = useRef<((confirmed: boolean) => void) | null>(null);
  const [activeConfirmDialog, setActiveConfirmDialog] = useState<ActiveConfirmDialogState | null>(null);

  const closeActiveConfirmDialog = useCallback((confirmed: boolean) => {
    const resolve = confirmDialogResolveRef.current;
    confirmDialogResolveRef.current = null;
    setActiveConfirmDialog(null);
    resolve?.(confirmed);
  }, []);

  const requestConfirmation = useCallback((request: ConfirmDialogRequest): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const activeResolve = confirmDialogResolveRef.current;
      if (activeResolve !== null) {
        activeResolve(false);
      }

      confirmDialogResolveRef.current = resolve;
      setActiveConfirmDialog({
        title: request.title,
        message: request.message,
        details: request.details,
        confirmLabel: request.confirmLabel ?? "Confirm",
        cancelLabel: request.cancelLabel ?? "Cancel",
        intent: request.intent ?? "neutral",
        closeOnBackdrop: request.closeOnBackdrop ?? true
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      const resolve = confirmDialogResolveRef.current;
      confirmDialogResolveRef.current = null;
      resolve?.(false);
    };
  }, []);

  return {
    activeConfirmDialog,
    requestConfirmation,
    closeActiveConfirmDialog
  };
}
