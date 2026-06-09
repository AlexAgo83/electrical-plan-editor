import type { ReactElement } from "react";
import type { DeleteDependencySummaryCategory } from "../../../store/deleteImpact";
import type { ModelingBatchSelectionScope } from "../../lib/modelingBatchDelete";
import type { ModelingSegmentBatchEditState } from "./ModelingFormsColumn.types";

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
  segmentBatchEdit?: ModelingSegmentBatchEditState;
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
  onCancelBatchMode,
  segmentBatchEdit
}: ModelingBatchContextPanelProps): ReactElement {
  const label = scopeLabel(scope);
  const showSegmentBatchEdit = scope === "segment" && segmentBatchEdit !== undefined;
  const fieldHelp = (field: "sheathType" | "insulation" | "lineStyle" | "internalPartReference"): string | undefined => {
    if (segmentBatchEdit === undefined) {
      return undefined;
    }
    if (segmentBatchEdit.dirtyFields.has(field)) {
      return "This value will be applied to all selected segments.";
    }
    if (segmentBatchEdit.mixedFields.has(field)) {
      return "Mixed values across selection. Edit to overwrite all selected segments.";
    }
    return "Leave unchanged, or edit to overwrite all selected segments.";
  };

  return (
    <section className="panel-grid workspace-column workspace-column-right">
      <article className="panel" data-testid="modeling-batch-context-panel">
        <header className="network-form-header">
          <h2>Batch selection</h2>
          <span className="network-form-mode-chip is-edit">Multi-select mode</span>
        </header>
        <p className="empty-copy">
          {selectedCount} {label} selected.
          {showSegmentBatchEdit ? " You can update sheath parameters for the whole selection." : " Editing is unavailable while multi-selection is active."}
        </p>
        {showSegmentBatchEdit ? (
          <form
            className="stack-form"
            onSubmit={(event) => {
              event.preventDefault();
              segmentBatchEdit.onApply();
            }}
          >
            <label>
              Layer (optional)
              <input
                value={segmentBatchEdit.sheathType}
                onChange={(event) => segmentBatchEdit.setSheathType(event.target.value)}
                placeholder="CT5"
              />
            </label>
            <small className="inline-help">{fieldHelp("sheathType")}</small>
            <label>
              Insulation (optional)
              <input
                value={segmentBatchEdit.insulation}
                onChange={(event) => segmentBatchEdit.setInsulation(event.target.value)}
                placeholder="PVC"
              />
            </label>
            <small className="inline-help">{fieldHelp("insulation")}</small>
            <label>
              Line style (optional)
              <input
                value={segmentBatchEdit.lineStyle}
                onChange={(event) => segmentBatchEdit.setLineStyle(event.target.value)}
                placeholder="braided sleeve"
              />
            </label>
            <small className="inline-help">{fieldHelp("lineStyle")}</small>
            <label>
              Internal part reference (optional)
              <input
                value={segmentBatchEdit.internalPartReference}
                onChange={(event) => segmentBatchEdit.setInternalPartReference(event.target.value)}
                placeholder="INT-PART-001"
              />
            </label>
            <small className="inline-help">{fieldHelp("internalPartReference")}</small>
            {segmentBatchEdit.error !== null ? <small className="inline-error">{segmentBatchEdit.error}</small> : null}
            <div className="row-actions compact idle-panel-actions">
              <button type="submit" className="button-with-icon" disabled={selectedCount === 0}>
                Apply to selected{selectedCount > 0 ? ` (${selectedCount})` : ""}
              </button>
            </div>
          </form>
        ) : null}
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
