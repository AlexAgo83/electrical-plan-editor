import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactElement } from "react";
import type { OverwriteCandidate } from "../../../adapters/portability";

export type OverwriteDecision = "overwrite" | "import-as-new";

interface ImportOverwriteDialogProps {
  isOpen: boolean;
  candidates: OverwriteCandidate[];
  themeHostClassName?: string;
  onConfirm: (decisions: Map<string, OverwriteDecision>) => void;
  onCancel: () => void;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
}

const MATCH_REASON_LABELS: Record<OverwriteCandidate["matchReason"], string> = {
  technicalId: "same technical ID",
  name: "same name",
  nameVariant: "similar name"
};

export function ImportOverwriteDialog({
  isOpen,
  candidates,
  themeHostClassName,
  onConfirm,
  onCancel
}: ImportOverwriteDialogProps): ReactElement | null {
  const dialogRef = useRef<HTMLElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  const [decisions, setDecisions] = useState<Map<string, OverwriteDecision>>(() => {
    const initial = new Map<string, OverwriteDecision>();
    for (const candidate of candidates) {
      initial.set(candidate.importedNetworkId, "overwrite");
    }
    return initial;
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const next = new Map<string, OverwriteDecision>();
    for (const candidate of candidates) {
      next.set(candidate.importedNetworkId, "overwrite");
    }
    setDecisions(next);
    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelButtonRef.current?.focus();

    return () => {
      const previousFocusedElement = previousFocusedElementRef.current;
      if (previousFocusedElement?.isConnected) {
        previousFocusedElement.focus();
      }
      previousFocusedElementRef.current = null;
    };
  }, [isOpen, candidates]);

  if (!isOpen) {
    return null;
  }

  const titleId = "import-overwrite-dialog-title";
  const descriptionId = "import-overwrite-dialog-description";

  const handleDecisionChange = (importedNetworkId: string, decision: OverwriteDecision): void => {
    setDecisions((previous) => {
      const next = new Map(previous);
      next.set(importedNetworkId, decision);
      return next;
    });
  };

  const handleConfirm = (): void => {
    onConfirm(decisions);
  };

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
    <div
      className={
        themeHostClassName
          ? `confirm-dialog-layer ${themeHostClassName}`
          : "confirm-dialog-layer"
      }
      role="presentation"
    >
      <button
        type="button"
        className="confirm-dialog-backdrop"
        aria-label="Dismiss dialog"
        onClick={onCancel}
      />
      <section
        ref={dialogRef}
        className="confirm-dialog panel import-overwrite-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="confirm-dialog-header">
          <h2 id={titleId}>Similar networks detected</h2>
        </header>
        <p id={descriptionId} className="confirm-dialog-message">
          {candidates.length === 1
            ? "1 imported network matches an existing one."
            : `${candidates.length} imported networks match existing ones.`}{" "}
          Choose how to handle each conflict.
        </p>
        <ul className="import-overwrite-candidates">
          {candidates.map((candidate) => {
            const decision = decisions.get(candidate.importedNetworkId) ?? "overwrite";
            return (
              <li key={candidate.importedNetworkId} className="import-overwrite-candidate">
                <div className="import-overwrite-candidate-info">
                  <span className="import-overwrite-existing-label">Existing</span>
                  <span className="import-overwrite-name">{candidate.existingName}</span>
                  <code className="import-overwrite-tech-id">{candidate.existingTechnicalId}</code>
                </div>
                <div className="import-overwrite-candidate-info import-overwrite-imported-info">
                  <span className="import-overwrite-imported-label">
                    Imported · {MATCH_REASON_LABELS[candidate.matchReason]}
                  </span>
                  <span className="import-overwrite-name">{candidate.importedName}</span>
                  <code className="import-overwrite-tech-id">{candidate.importedTechnicalId}</code>
                </div>
                <div className="import-overwrite-choices" role="group" aria-label={`Decision for ${candidate.existingName}`}>
                  <label className="import-overwrite-choice">
                    <input
                      type="radio"
                      name={`decision-${candidate.importedNetworkId}`}
                      value="overwrite"
                      checked={decision === "overwrite"}
                      onChange={() => { handleDecisionChange(candidate.importedNetworkId, "overwrite"); }}
                    />
                    <span>Overwrite existing</span>
                  </label>
                  <label className="import-overwrite-choice">
                    <input
                      type="radio"
                      name={`decision-${candidate.importedNetworkId}`}
                      value="import-as-new"
                      checked={decision === "import-as-new"}
                      onChange={() => { handleDecisionChange(candidate.importedNetworkId, "import-as-new"); }}
                    />
                    <span>Import as new copy</span>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
        <footer className="confirm-dialog-actions">
          <button ref={cancelButtonRef} type="button" className="confirm-dialog-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="button-with-icon confirm-dialog-confirm" onClick={handleConfirm}>
            <span className="action-button-icon is-open" aria-hidden="true" />
            <span>Confirm</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
