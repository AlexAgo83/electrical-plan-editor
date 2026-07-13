import { translateCurrent as t } from "../../lib/i18n";
import { useRef, type ReactElement } from "react";
import { useModalDialog } from "../../hooks/useModalDialog";
import type { ConfirmDialogIntent } from "../../types/confirm-dialog";
import type { DeleteDependencySummaryCategory, DeleteImpactDialogVariant } from "../../types/delete-impact-dialog";

interface DeleteImpactDialogProps {
  isOpen: boolean;
  themeHostClassName?: string;
  variant: DeleteImpactDialogVariant;
  title: string;
  message: string;
  categories: DeleteDependencySummaryCategory[];
  note?: string;
  confirmLabel: string;
  cancelLabel?: string;
  intent?: ConfirmDialogIntent;
  closeOnBackdrop?: boolean;
  confirmOnEnter?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteImpactDialog({
  isOpen,
  themeHostClassName,
  variant,
  title,
  message,
  categories,
  note,
  confirmLabel,
  cancelLabel = t("ui.cancel"),
  intent = "warning",
  closeOnBackdrop = true,
  confirmOnEnter = false,
  onConfirm,
  onCancel
}: DeleteImpactDialogProps): ReactElement | null {
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const { dialogRef, onKeyDown } = useModalDialog<HTMLElement>({
    isOpen,
    onClose: onCancel,
    initialFocusRef: variant === "deleteCascade" ? cancelButtonRef : primaryButtonRef,
    onConfirm,
    confirmOnEnter,
    identity: `${title}:${variant}`
  });

  if (!isOpen) {
    return null;
  }

  const intentClassName =
    intent === "danger"
      ? "is-danger"
      : intent === "warning"
        ? "is-warning"
        : "is-neutral";
  const titleId = `delete-impact-dialog-title-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const descriptionId = `${titleId}-description`;

  return (
    <div className={themeHostClassName ? `confirm-dialog-layer ${themeHostClassName}` : "confirm-dialog-layer"} role="presentation">
      <button
        type="button"
        className="confirm-dialog-backdrop"
        aria-label={t("ui.deleteimpactdialogDismissDeleteImpactDialog")}
        onClick={() => {
          if (!closeOnBackdrop) {
            return;
          }
          onCancel();
        }}
      />
      <section
        ref={dialogRef}
        className={`confirm-dialog panel ${intentClassName}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <header className="confirm-dialog-header">
          <h2 id={titleId}>{title}</h2>
        </header>
        <p id={descriptionId} className="confirm-dialog-message">
          {message}
        </p>
        {categories.length > 0 ? (
          <ul className="confirm-dialog-details">
            {categories.map((category) => (
              <li key={category.key}>
                <strong>{category.label} ({category.count})</strong>
                {category.references.length > 0 ? `: ${category.references.join(", ")}` : ""}
              </li>
            ))}
          </ul>
        ) : null}
        {note !== undefined && note.length > 0 ? (
          <p className="confirm-dialog-details">{note}</p>
        ) : null}
        <footer className="confirm-dialog-actions">
          {variant === "deleteCascade" ? (
            <button ref={cancelButtonRef} type="button" className="confirm-dialog-cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
          ) : null}
          <button ref={primaryButtonRef} type="button" className="button-with-icon confirm-dialog-confirm" onClick={onConfirm}>
            <span className="action-button-icon is-open" aria-hidden="true" />
            <span>{confirmLabel}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
