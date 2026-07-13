import { translateCurrent as t } from "../../lib/i18n";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { useModalDialog } from "../../hooks/useModalDialog";
import type { OverwriteCandidate } from "../../../adapters/portability";

export type OverwriteDecision = "overwrite" | "skip" | "keep-both";

interface ImportOverwriteDialogProps {
  isOpen: boolean;
  candidates: OverwriteCandidate[];
  themeHostClassName?: string;
  onConfirm: (decisions: Map<string, OverwriteDecision>) => void;
  onCancel: () => void;
}

const MATCH_REASON_LABELS: Record<OverwriteCandidate["matchReason"], string> = {
  id: "same network ID",
  technicalId: "same technical ID",
  name: "same name",
  nameVariant: "similar name"
};

const DECISION_LABELS: Record<OverwriteDecision, string> = {
  overwrite: "Overwrite existing",
  skip: "Skip",
  "keep-both": "Keep both (rename incoming)"
};

const DECISION_ORDER: OverwriteDecision[] = ["overwrite", "skip", "keep-both"];

export function ImportOverwriteDialog({
  isOpen,
  candidates,
  themeHostClassName,
  onConfirm,
  onCancel
}: ImportOverwriteDialogProps): ReactElement | null {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const { dialogRef, onKeyDown } = useModalDialog<HTMLElement>({ isOpen, onClose: onCancel, initialFocusRef: cancelButtonRef });

  const [decisions, setDecisions] = useState<Map<string, OverwriteDecision>>(() => {
    const initial = new Map<string, OverwriteDecision>();
    for (const candidate of candidates) {
      initial.set(candidate.importedNetworkId, "overwrite");
    }
    return initial;
  });
  const [manuallyDecided, setManuallyDecided] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const next = new Map<string, OverwriteDecision>();
    for (const candidate of candidates) {
      next.set(candidate.importedNetworkId, "overwrite");
    }
    setDecisions(next);
    setManuallyDecided(new Set());
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
    setManuallyDecided((previous) => {
      if (previous.has(importedNetworkId)) {
        return previous;
      }
      const next = new Set(previous);
      next.add(importedNetworkId);
      return next;
    });
  };

  const handleBulkDecision = (decision: OverwriteDecision): void => {
    setDecisions((previous) => {
      const next = new Map(previous);
      for (const candidate of candidates) {
        if (!manuallyDecided.has(candidate.importedNetworkId)) {
          next.set(candidate.importedNetworkId, decision);
        }
      }
      return next;
    });
  };

  const handleConfirm = (): void => {
    onConfirm(decisions);
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
        onKeyDown={onKeyDown}
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
        {candidates.length > 1 ? (
          <div
            className="import-overwrite-bulk-row"
            role="group"
            aria-label="Apply to all remaining candidates"
          >
            <span className="import-overwrite-bulk-label">Apply to all remaining:</span>
            {DECISION_ORDER.map((decision) => (
              <button
                key={decision}
                type="button"
                className="import-overwrite-bulk-action"
                onClick={() => { handleBulkDecision(decision); }}
              >
                {DECISION_LABELS[decision]}
              </button>
            ))}
          </div>
        ) : null}
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
                  {DECISION_ORDER.map((option) => (
                    <label key={option} className="import-overwrite-choice">
                      <input
                        type="radio"
                        name={`decision-${candidate.importedNetworkId}`}
                        value={option}
                        checked={decision === option}
                        onChange={() => { handleDecisionChange(candidate.importedNetworkId, option); }}
                      />
                      <span>{DECISION_LABELS[option]}</span>
                    </label>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
        <footer className="confirm-dialog-actions">
          <button ref={cancelButtonRef} type="button" className="confirm-dialog-cancel" onClick={onCancel}>
            
            {t("ui.cancel")}
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
