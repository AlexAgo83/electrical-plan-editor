import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactElement } from "react";
import type { ChoiceDialogOption } from "../../types/confirm-dialog";
import type { ConfirmDialogIntent } from "../../types/confirm-dialog";

interface ChoiceDialogProps {
  isOpen: boolean;
  themeHostClassName?: string;
  title: string;
  message: string;
  details?: string;
  discardLabel?: string;
  options: ChoiceDialogOption[];
  closeOnBackdrop?: boolean;
  onChoose: (choiceId: string | null) => void;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
}

function getIntentClassName(intent: ConfirmDialogIntent | undefined): string {
  if (intent === "danger") {
    return "is-danger";
  }
  if (intent === "warning") {
    return "is-warning";
  }
  return "is-neutral";
}

export function ChoiceDialog({
  isOpen,
  themeHostClassName,
  title,
  message,
  details,
  discardLabel = "Discard",
  options,
  closeOnBackdrop = true,
  onChoose
}: ChoiceDialogProps): ReactElement | null {
  const dialogRef = useRef<HTMLElement | null>(null);
  const discardButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    discardButtonRef.current?.focus();

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

  const titleId = `choice-dialog-title-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const descriptionId = `${titleId}-description`;
  const detailsId = `${titleId}-details`;

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onChoose(null);
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
        aria-label="Dismiss choice dialog"
        onClick={() => {
          if (!closeOnBackdrop) {
            return;
          }
          onChoose(null);
        }}
      />
      <section
        ref={dialogRef}
        className={`confirm-dialog panel ${getIntentClassName(options[0]?.intent)}`}
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
            {details}
          </p>
        ) : null}
        <footer className="confirm-dialog-actions confirm-dialog-choice-actions">
          <button ref={discardButtonRef} type="button" className="confirm-dialog-cancel" onClick={() => onChoose(null)}>
            {discardLabel}
          </button>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="button-with-icon confirm-dialog-confirm confirm-dialog-choice-button"
              onClick={() => onChoose(option.id)}
            >
              <span className="action-button-icon is-open" aria-hidden="true" />
              <span>{option.label}</span>
            </button>
          ))}
        </footer>
      </section>
    </div>
  );
}
