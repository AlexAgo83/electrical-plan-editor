import type { ReactElement } from "react";
import type { DeleteDependencySummaryCategory } from "../../../store/deleteImpact";
import type { ModelingBatchSelectionScope } from "../../lib/modelingBatchDelete";

interface ModelingBatchContextPanelProps {
  scope: ModelingBatchSelectionScope;
  selectedCount: number;
  directCount: number;
  cascadeCount: number;
  blockedCount: number;
  summaryCategories: DeleteDependencySummaryCategory[];
  summaryNote?: string;
  onDeleteSelected: () => void;
  onCancelBatchMode: () => void;
}

function scopeLabel(scope: ModelingBatchSelectionScope): string {
  switch (scope) {
    case "connector":
      return "connectors";
    case "splice":
      return "splices";
    case "node":
      return "nodes";
    case "segment":
      return "segments";
    case "wire":
      return "wires";
  }
}

export function ModelingBatchContextPanel({
  scope,
  selectedCount,
  directCount,
  cascadeCount,
  blockedCount,
  summaryCategories,
  summaryNote,
  onDeleteSelected,
  onCancelBatchMode
}: ModelingBatchContextPanelProps): ReactElement {
  const label = scopeLabel(scope);

  return (
    <section className="panel-grid workspace-column workspace-column-right">
      <article className="panel" data-testid="modeling-batch-context-panel">
        <header className="network-form-header">
          <h2>Batch selection</h2>
          <span className="network-form-mode-chip is-edit">Multi-select mode</span>
        </header>
        <p className="empty-copy">
          {selectedCount} {label} selected. Editing is unavailable while multi-selection is active.
        </p>
        <dl className="compact-definition-list">
          <div>
            <dt>Direct delete</dt>
            <dd>{directCount}</dd>
          </div>
          <div>
            <dt>Cascade delete</dt>
            <dd>{cascadeCount}</dd>
          </div>
          <div>
            <dt>Blocked</dt>
            <dd>{blockedCount}</dd>
          </div>
        </dl>
        {summaryCategories.length > 0 ? (
          <div className="delete-impact-summary" aria-label="Batch delete summary">
            {summaryCategories.map((category) => (
              <section key={category.key} className="delete-impact-category">
                <div className="delete-impact-category-header">
                  <strong>{category.label}</strong>
                  <span className="status-chip">{category.count}</span>
                </div>
                {category.references.length > 0 ? (
                  <p className="delete-impact-references">{category.references.join(", ")}</p>
                ) : null}
              </section>
            ))}
          </div>
        ) : null}
        {summaryNote !== undefined ? <p className="helper-text">{summaryNote}</p> : null}
        <div className="row-actions compact idle-panel-actions">
          <button type="button" className="button-with-icon" onClick={onDeleteSelected} disabled={selectedCount === 0}>
            Delete selected{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </button>
          <button type="button" className="button-with-icon" onClick={onCancelBatchMode}>
            Cancel selection
          </button>
        </div>
      </article>
    </section>
  );
}
