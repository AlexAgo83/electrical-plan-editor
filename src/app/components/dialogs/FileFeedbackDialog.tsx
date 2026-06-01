import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactElement } from "react";
import type { ConfirmDialogIntent } from "../../types/confirm-dialog";

interface FileFeedbackDialogProps {
  isOpen: boolean;
  themeHostClassName?: string;
  title: string;
  message: string;
  items?: string[];
  intent?: ConfirmDialogIntent;
  onClose: () => void;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])')
  ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
}

export function FileFeedbackDialog({
  isOpen,
  themeHostClassName,
  title,
  message,
  items = [],
  intent = "warning",
  onClose
}: FileFeedbackDialogProps): ReactElement | null {
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    return () => {
      previousFocusedElementRef.current?.focus();
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
  const titleId = `file-feedback-dialog-title-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const descriptionId = `${titleId}-description`;

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
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
      <button type="button" className="confirm-dialog-backdrop" aria-label="Close import feedback" onClick={onClose} />
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
        {items.length > 0 ? (
          <div className="confirm-dialog-details">
            <span className="confirm-dialog-details-label">Details</span>
            <ul className="confirm-dialog-feedback-list">
              {items.map((item, index) => (
                <li key={`${index}-${item}`}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <footer className="confirm-dialog-actions">
          <button ref={closeButtonRef} type="button" className="button-with-icon confirm-dialog-confirm" onClick={onClose}>
            <span className="action-button-icon is-open" aria-hidden="true" />
            <span>Close</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
