import { useRef, type ReactElement } from "react";
import type { ConfirmDialogIntent } from "../../types/confirm-dialog";
import { useModalDialog } from "../../hooks/useModalDialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  themeHostClassName?: string;
  title: string;
  message: string;
  details?: string;
  detailsLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: ConfirmDialogIntent;
  closeOnBackdrop?: boolean;
  confirmOnEnter?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  themeHostClassName,
  title,
  message,
  details,
  detailsLabel = "Filename",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  intent = "neutral",
  closeOnBackdrop = true,
  confirmOnEnter = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps): ReactElement | null {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const { dialogRef, onKeyDown } = useModalDialog<HTMLElement>({
    isOpen,
    onClose: onCancel,
    initialFocusRef: cancelButtonRef,
    onConfirm,
    confirmOnEnter,
    identity: title
  });
  if (!isOpen) return null;

  const intentClassName = intent === "danger" ? "is-danger" : intent === "warning" ? "is-warning" : "is-neutral";
  const titleId = `confirm-dialog-title-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const descriptionId = `${titleId}-description`;
  const detailsId = `${titleId}-details`;

  return (
    <div className={themeHostClassName ? `confirm-dialog-layer ${themeHostClassName}` : "confirm-dialog-layer"} role="presentation">
      <button
        type="button"
        className="confirm-dialog-backdrop"
        aria-label="Dismiss confirmation dialog"
        onClick={closeOnBackdrop ? onCancel : undefined}
      />
      <section
        ref={dialogRef}
        className={`confirm-dialog panel ${intentClassName}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={details ? `${descriptionId} ${detailsId}` : descriptionId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <header className="confirm-dialog-header"><h2 id={titleId}>{title}</h2></header>
        <p id={descriptionId} className="confirm-dialog-message">{message}</p>
        {details ? (
          <p id={detailsId} className="confirm-dialog-details">
            <span className="confirm-dialog-details-label">{detailsLabel}</span>
            <code className="confirm-dialog-details-code">{details}</code>
          </p>
        ) : null}
        <footer className="confirm-dialog-actions">
          <button ref={cancelButtonRef} type="button" className="confirm-dialog-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className="button-with-icon confirm-dialog-confirm" onClick={onConfirm}>
            <span className="action-button-icon is-open" aria-hidden="true" /><span>{confirmLabel}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
