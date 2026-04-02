import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactElement } from "react";
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

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
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
  cancelLabel = "Cancel",
  intent = "warning",
  closeOnBackdrop = true,
  confirmOnEnter = false,
  onConfirm,
  onCancel
}: DeleteImpactDialogProps): ReactElement | null {
  const dialogRef = useRef<HTMLElement | null>(null);
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const enterConfirmationArmedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (variant === "deleteCascade") {
      cancelButtonRef.current?.focus();
    } else {
      primaryButtonRef.current?.focus();
    }

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
  }, [isOpen, title, variant]);

  useEffect(() => {
    if (!isOpen || !confirmOnEnter) {
      enterConfirmationArmedRef.current = false;
      return;
    }

    enterConfirmationArmedRef.current = false;

    const armEnterConfirmation = () => {
      enterConfirmationArmedRef.current = true;
      window.removeEventListener("keyup", armEnterConfirmation, true);
    };

    const fallbackTimer = window.setTimeout(() => {
      enterConfirmationArmedRef.current = true;
      window.removeEventListener("keyup", armEnterConfirmation, true);
    }, 0);

    window.addEventListener("keyup", armEnterConfirmation, true);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("keyup", armEnterConfirmation, true);
      enterConfirmationArmedRef.current = false;
    };
  }, [isOpen, confirmOnEnter, title]);

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

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }

    if (event.key === "Enter" && confirmOnEnter) {
      event.preventDefault();
      event.stopPropagation();
      if (!enterConfirmationArmedRef.current) {
        return;
      }
      onConfirm();
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
        aria-label="Dismiss delete impact dialog"
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
        onKeyDown={handleDialogKeyDown}
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
