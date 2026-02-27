import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactElement } from "react";
import type { ConfirmDialogIntent } from "../../types/confirm-dialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  themeHostClassName?: string;
  title: string;
  message: string;
  details?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: ConfirmDialogIntent;
  closeOnBackdrop?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
}

export function ConfirmDialog({
  isOpen,
  themeHostClassName,
  title,
  message,
  details,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  intent = "neutral",
  closeOnBackdrop = true,
  onConfirm,
  onCancel
}: ConfirmDialogProps): ReactElement | null {
  const dialogRef = useRef<HTMLElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelButtonRef.current?.focus();

    return () => {
      const previousFocusedElement = previousFocusedElementRef.current;
      if (previousFocusedElement?.isConnected) {
        previousFocusedElement.focus();
      } else {
        const fallbackFocusTarget = document.querySelector<HTMLElement>(
          ".header-settings-toggle, .header-nav-toggle, .header-ops-toggle, button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        fallbackFocusTarget?.focus();
      }
      previousFocusedElementRef.current = null;
    };
  }, [isOpen, title]);

  if (!isOpen) {
    return null;
  }

  const intentClassName =
    intent === "danger"
      ? "is-danger"
      : intent === "warning"
        ? "is-warning"
        : "is-neutral";
  const titleId = `confirm-dialog-title-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const descriptionId = `${titleId}-description`;
  const detailsId = `${titleId}-details`;

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const dialogElement = dialogRef.current;
    if (dialogElement === null) {
      return;
    }

    const focusableElements = getFocusableElements(dialogElement);
    if (focusableElements.length === 0) {
      event.preventDefault();
      dialogElement.focus();
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    if (firstFocusable === undefined || lastFocusable === undefined) {
      return;
    }

    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (event.shiftKey) {
      if (activeElement === firstFocusable || activeElement === dialogElement) {
        event.preventDefault();
        lastFocusable.focus();
      }
      return;
    }

    if (activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  };

  return (
    <div className={themeHostClassName ? `confirm-dialog-layer ${themeHostClassName}` : "confirm-dialog-layer"} role="presentation">
      <button
        type="button"
        className="confirm-dialog-backdrop"
        aria-label="Dismiss confirmation dialog"
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
        aria-describedby={details !== undefined && details.length > 0 ? `${descriptionId} ${detailsId}` : descriptionId}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="confirm-dialog-header">
          <h2 id={titleId}>{title}</h2>
        </header>
        <p id={descriptionId} className="confirm-dialog-message">
          {message}
        </p>
        {details !== undefined && details.length > 0 ? (
          <p id={detailsId} className="confirm-dialog-details">
            <span className="confirm-dialog-details-label">Filename</span>
            <code className="confirm-dialog-details-code">{details}</code>
          </p>
        ) : null}
        <footer className="confirm-dialog-actions">
          <button ref={cancelButtonRef} type="button" className="confirm-dialog-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="button-with-icon confirm-dialog-confirm" onClick={onConfirm}>
            <span className="action-button-icon is-open" aria-hidden="true" />
            <span>{confirmLabel}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
