import { useCallback, useEffect, useRef, useState } from "react";

export type ToastNotificationVariant = "success" | "info" | "warning" | "error";

export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  variant: ToastNotificationVariant;
}

interface NotifyToastOptions {
  message?: string;
  variant?: ToastNotificationVariant;
}

const TOAST_AUTO_DISMISS_MS = 4200;
const TOAST_VISIBLE_LIMIT = 4;

export function useToastNotifications() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const sequenceRef = useRef(0);
  const timeoutByToastIdRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((toastId: string): void => {
    const timeout = timeoutByToastIdRef.current.get(toastId);
    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeoutByToastIdRef.current.delete(toastId);
    }

    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const notifyToast = useCallback(
    (title: string, options: NotifyToastOptions = {}): void => {
      const id = `toast-${Date.now()}-${++sequenceRef.current}`;
      const toast: ToastNotification = {
        id,
        title,
        message: options.message,
        variant: options.variant ?? "success"
      };

      setToasts((current) => [...current, toast].slice(-TOAST_VISIBLE_LIMIT));
      const timeout = setTimeout(() => dismissToast(id), TOAST_AUTO_DISMISS_MS);
      timeoutByToastIdRef.current.set(id, timeout);
    },
    [dismissToast]
  );

  useEffect(() => {
    const timeoutByToastId = timeoutByToastIdRef.current;
    return () => {
      for (const timeout of timeoutByToastId.values()) {
        clearTimeout(timeout);
      }
      timeoutByToastId.clear();
    };
  }, []);

  return {
    toasts,
    notifyToast,
    dismissToast
  };
}
