import { translateCurrent as t } from "../lib/i18n";
import type { ReactElement } from "react";
import type { ToastNotification } from "../hooks/useToastNotifications";

interface ToastViewportProps {
  toasts: ToastNotification[];
  onDismissToast: (toastId: string) => void;
}

export function ToastViewport({ toasts, onDismissToast }: ToastViewportProps): ReactElement | null {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <section className="toast-viewport" aria-label={t("ui.toastviewportNotifications")} aria-live="polite" aria-relevant="additions text">
      {toasts.map((toast) => (
        <article key={toast.id} className={`toast-notification is-${toast.variant}`} role="status">
          <div className="toast-notification-content">
            <p className="toast-notification-title">{toast.title}</p>
            {toast.message === undefined ? null : <p className="toast-notification-message">{toast.message}</p>}
          </div>
          <button
            type="button"
            className="toast-notification-dismiss"
            onClick={() => onDismissToast(toast.id)}
            aria-label={t("ui.toastviewportDismissNotificationTitle", { title: toast.title })}
          >
            <span aria-hidden="true">x</span>
          </button>
        </article>
      ))}
    </section>
  );
}
