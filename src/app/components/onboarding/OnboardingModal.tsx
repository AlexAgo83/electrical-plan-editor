import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactElement } from "react";
import type { OnboardingModalMode, OnboardingStepDefinition } from "../../lib/onboarding";

interface OnboardingModalProps {
  isOpen: boolean;
  themeHostClassName?: string;
  mode: OnboardingModalMode;
  step: OnboardingStepDefinition;
  stepIndex: number;
  totalSteps: number;
  autoOpenEnabled: boolean;
  onSetAutoOpenEnabled: (enabled: boolean) => void;
  onClose: () => void;
  onNext: () => void;
  canGoNext: boolean;
  targetActions: ReadonlyArray<{
    label: string;
    onClick: () => void;
  }>;
}

function renderDescription(step: OnboardingStepDefinition): ReactElement {
  return (
    <p className="onboarding-modal-description">
      {step.description.map((part, index) =>
        part.strong ? (
          <strong key={`${step.id}-part-${index}`}>{part.text}</strong>
        ) : (
          <span key={`${step.id}-part-${index}`}>{part.text}</span>
        )
      )}
    </p>
  );
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
}

export function OnboardingModal({
  isOpen,
  themeHostClassName,
  mode,
  step,
  stepIndex,
  totalSteps,
  autoOpenEnabled,
  onSetAutoOpenEnabled,
  onClose,
  onNext,
  canGoNext,
  targetActions
}: OnboardingModalProps): ReactElement | null {
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

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
  }, [isOpen, step.id]);

  if (!isOpen) {
    return null;
  }

  const isFullFlow = mode === "full";
  const titleId = `onboarding-modal-title-${step.id}`;
  const progressLabel = `Step ${stepIndex + 1} of ${totalSteps}`;
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
    <div className={themeHostClassName ? `onboarding-modal-layer ${themeHostClassName}` : "onboarding-modal-layer"} role="presentation">
      <button
        type="button"
        className="onboarding-modal-backdrop"
        aria-label="Dismiss onboarding overlay"
        onClick={onClose}
      />
      <section
        ref={dialogRef}
        className="onboarding-modal panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={`${titleId}-description`}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="onboarding-modal-header">
          <div className="onboarding-modal-header-main">
            <span className="onboarding-modal-badge" aria-hidden="true">
              {step.badgeIconClass ? <span className={`action-button-icon ${step.badgeIconClass}`} aria-hidden="true" /> : step.badge}
            </span>
            <div className="onboarding-modal-title-block">
              <h2 id={titleId}>{step.title}</h2>
              {isFullFlow ? <p className="onboarding-modal-progress">{progressLabel}</p> : <p className="onboarding-modal-progress">Context help</p>}
            </div>
          </div>
          <button ref={closeButtonRef} type="button" className="onboarding-modal-close" onClick={onClose} aria-label="Close onboarding">
            Close
          </button>
        </header>

        <div className="onboarding-modal-body">
          <div id={`${titleId}-description`}>{renderDescription(step)}</div>
          <p className="onboarding-modal-target">
            Target panel: <strong>{step.target.panelLabel}</strong>
          </p>
          <label className="onboarding-modal-checkbox">
            <input
              type="checkbox"
              checked={!autoOpenEnabled}
              onChange={(event) => onSetAutoOpenEnabled(!event.target.checked)}
            />
            <span>Do not open automatically on app load</span>
          </label>
        </div>

        <footer className="onboarding-modal-actions">
          <div className="onboarding-modal-target-actions">
            {targetActions.map((action, index) => (
              <button key={`${action.label}-${index}`} type="button" className="filter-chip" onClick={action.onClick}>
                {action.label}
              </button>
            ))}
          </div>
          <div className="onboarding-modal-actions-spacer" />
          {isFullFlow ? (
            <button type="button" className="button-with-icon onboarding-modal-next-button" onClick={onNext}>
              <span className="action-button-icon is-open" aria-hidden="true" />
              <span>{canGoNext ? "Next" : "Finish"}</span>
            </button>
          ) : null}
        </footer>
      </section>
    </div>
  );
}
