import type { ReactElement } from "react";

export interface SpliceLengthSuggestionPanelModel {
  spliceSummary: string;
  message: string;
  comparisonDetails: string;
  hasWarning: boolean;
}

interface SpliceLengthSuggestionPanelProps {
  suggestion: SpliceLengthSuggestionPanelModel;
  onApply: () => void;
  onCancel: () => void;
}

export function SpliceLengthSuggestionPanel({
  suggestion,
  onApply,
  onCancel
}: SpliceLengthSuggestionPanelProps): ReactElement {
  return (
    <article className={suggestion.hasWarning ? "panel splice-length-suggestion-panel is-warning" : "panel splice-length-suggestion-panel"}>
      <div className="inspector-context-header">
        <h2>Suggested splice lengths</h2>
      </div>
      <div className="inspector-entity-line">
        <span className="inspector-kind-chip">splice</span>
        <span className="technical-id inspector-entity-id">{suggestion.spliceSummary}</span>
      </div>
      <p className="splice-length-suggestion-message">{suggestion.message}</p>
      <div className="splice-length-suggestion-details" aria-label="Comparison">
        <span className="confirm-dialog-details-label">Comparison</span>
        <code className="confirm-dialog-details-code">{suggestion.comparisonDetails}</code>
      </div>
      <div className="row-actions inspector-actions splice-length-suggestion-actions">
        <button type="button" className="button-with-icon" onClick={onApply}>
          <span className="action-button-icon is-open" aria-hidden="true" />
          <span>Apply suggestion</span>
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </article>
  );
}
