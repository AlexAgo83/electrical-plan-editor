import type { ReactElement } from "react";
import type { OnboardingModalMode, OnboardingStepDefinition } from "../../lib/onboarding";

interface OnboardingModalProps {
  isOpen: boolean;
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

export function OnboardingModal({
  isOpen,
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
  if (!isOpen) {
    return null;
  }

  const isFullFlow = mode === "full";
  const titleId = `onboarding-modal-title-${step.id}`;
  const progressLabel = `Step ${stepIndex + 1} of ${totalSteps}`;

  return (
    <div className="onboarding-modal-layer" role="presentation">
      <button
        type="button"
        className="onboarding-modal-backdrop"
        aria-label="Dismiss onboarding overlay"
        onClick={onClose}
      />
      <section
        className="onboarding-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={`${titleId}-description`}
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
          <button type="button" className="onboarding-modal-close" onClick={onClose} aria-label="Close onboarding">
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
