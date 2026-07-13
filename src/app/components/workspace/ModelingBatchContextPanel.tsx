import { translateCurrent as t } from "../../lib/i18n";
import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
} from "react";
import type { DeleteDependencySummaryCategory } from "../../../store/deleteImpact";
import type { ModelingBatchSelectionScope } from "../../lib/modelingBatchDelete";
import type { ModelingSegmentBatchEditState } from "./ModelingFormsColumn.types";

export interface ModelingBatchContextPanelProps {
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

interface ModelingBatchContextDialogProps extends ModelingBatchContextPanelProps {
  isOpen: boolean;
  onCloseDialog: () => void;
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

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element) =>
      !element.hasAttribute("hidden") &&
      element.getAttribute("aria-hidden") !== "true",
  );
}

function ModelingBatchContextContent({
  scope,
  selectedCount,
  directCount,
  cascadeCount,
  blockedCount,
  summaryCategories,
  summaryNote,
  onDeleteSelected,
  onCancelBatchMode,
  segmentBatchEdit,
}: ModelingBatchContextPanelProps): ReactElement {
  const label = scopeLabel(scope);
  const showSegmentBatchEdit =
    scope === "segment" && segmentBatchEdit !== undefined;
  const fieldHelp = (
    field: "sheathType" | "insulation" | "lineStyle" | "internalPartReference",
  ): string | undefined => {
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
    <div
      className="modeling-batch-context-content"
      data-testid="modeling-batch-context-panel"
    >
      <div className="network-form-header">
        <h3>{t("ui.modelingbatchcontextpanelBatchSelection")}</h3>
        <span className="network-form-mode-chip is-edit">
          Multi-select mode
        </span>
      </div>
      <p className="empty-copy">
        {selectedCount} {label} {t("ui.networkcanvasfloatinginfopanelsSelected")}{showSegmentBatchEdit
          ? t("ui.modelingbatchcontextpanelYouCanUpdateSheathParametersForTheWholeSelection")
          : t("ui.modelingbatchcontextpanelEditingIsUnavailableWhileMultiSelectionIsActive")}
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
            {t("ui.modelingbatchcontextpanelLayerOptional")}<input
              value={segmentBatchEdit.sheathType}
              onChange={(event) =>
                segmentBatchEdit.setSheathType(event.target.value)
              }
              placeholder={t("ui.modelingbatchcontextpanelCt5")}
            />
          </label>
          <small className="inline-help">{fieldHelp("sheathType")}</small>
          <label>
            {t("ui.modelingbatchcontextpanelInsulationOptional")}<input
              value={segmentBatchEdit.insulation}
              onChange={(event) =>
                segmentBatchEdit.setInsulation(event.target.value)
              }
              placeholder={t("ui.modelingbatchcontextpanelPvc")}
            />
          </label>
          <small className="inline-help">{fieldHelp("insulation")}</small>
          <label>
            {t("ui.modelingbatchcontextpanelLineStyleOptional")}<input
              value={segmentBatchEdit.lineStyle}
              onChange={(event) =>
                segmentBatchEdit.setLineStyle(event.target.value)
              }
              placeholder={t("ui.modelingbatchcontextpanelBraidedSleeve")}
            />
          </label>
          <small className="inline-help">{fieldHelp("lineStyle")}</small>
          <label>
            {t("ui.modelingbatchcontextpanelInternalPartReferenceOptional")}<input
              value={segmentBatchEdit.internalPartReference}
              onChange={(event) =>
                segmentBatchEdit.setInternalPartReference(event.target.value)
              }
              placeholder="INT-PART-001"
            />
          </label>
          <small className="inline-help">
            {fieldHelp("internalPartReference")}
          </small>
          {segmentBatchEdit.error !== null ? (
            <small className="inline-error">{segmentBatchEdit.error}</small>
          ) : null}
          <div className="row-actions compact idle-panel-actions">
            <button
              type="submit"
              className="button-with-icon"
              disabled={selectedCount === 0}
            >
              {t("ui.modelingbatchcontextpanelApplyToSelected")}{selectedCount > 0 ? ` (${selectedCount})` : ""}
            </button>
          </div>
        </form>
      ) : null}
      <dl className="compact-definition-list">
        <div>
          <dt>{t("ui.modelingbatchcontextpanelDirectDelete")}</dt>
          <dd>{directCount}</dd>
        </div>
        <div>
          <dt>{t("ui.modelingbatchcontextpanelCascadeDelete")}</dt>
          <dd>{cascadeCount}</dd>
        </div>
        <div>
          <dt>{t("ui.modelingbatchcontextpanelBlocked")}</dt>
          <dd>{blockedCount}</dd>
        </div>
      </dl>
      {summaryCategories.length > 0 ? (
        <div
          className="delete-impact-summary"
          aria-label={t("ui.modelingbatchcontextpanelBatchDeleteSummary")}
        >
          {summaryCategories.map((category) => (
            <section key={category.key} className="delete-impact-category">
              <div className="delete-impact-category-header">
                <strong>{category.label}</strong>
                <span className="status-chip">{category.count}</span>
              </div>
              {category.references.length > 0 ? (
                <p className="delete-impact-references">
                  {category.references.join(", ")}
                </p>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}
      {summaryNote !== undefined ? (
        <p className="helper-text">{summaryNote}</p>
      ) : null}
      <div className="row-actions compact idle-panel-actions">
        <button
          type="button"
          className="button-with-icon"
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
        >
          {t("ui.modelingbatchcontextpanelDeleteSelected")}{selectedCount > 0 ? ` (${selectedCount})` : ""}
        </button>
        <button
          type="button"
          className="button-with-icon"
          onClick={onCancelBatchMode}
        >
          {t("ui.modelingbatchcontextpanelCancelSelection")}</button>
      </div>
    </div>
  );
}

export function ModelingBatchContextPanel(
  props: ModelingBatchContextPanelProps,
): ReactElement {
  return (
    <section className="panel-grid workspace-column workspace-column-right">
      <article className="panel">
        <ModelingBatchContextContent {...props} />
      </article>
    </section>
  );
}

export function ModelingBatchContextDialog({
  isOpen,
  onCloseDialog,
  onCancelBatchMode,
  ...contentProps
}: ModelingBatchContextDialogProps): ReactElement | null {
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();
    return () => {
      const previousFocusedElement = previousFocusedElementRef.current;
      if (previousFocusedElement?.isConnected) {
        previousFocusedElement.focus();
      }
      previousFocusedElementRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleDialogKeyDown = (
    event: ReactKeyboardEvent<HTMLElement>,
  ): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onCloseDialog();
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
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    if (firstFocusable === undefined || lastFocusable === undefined) {
      event.preventDefault();
      dialogElement.focus();
      return;
    }
    const activeElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
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
    <div className="confirm-dialog-layer app-shell" role="presentation">
      <button
        type="button"
        className="confirm-dialog-backdrop"
        aria-label={t("ui.modelingbatchcontextpanelCloseBatchSelection")}
        onClick={onCloseDialog}
      />
      <section
        ref={dialogRef}
        className="confirm-dialog panel workspace-tool-dialog modeling-batch-context-dialog is-neutral"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modeling-batch-context-dialog-title"
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="confirm-dialog-header workspace-tool-dialog-header">
          <h2 id="modeling-batch-context-dialog-title">{t("ui.modelingbatchcontextpanelBatchSelection")}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="confirm-dialog-cancel"
            onClick={onCloseDialog}
          >
            
            {t("ui.close")}
          </button>
        </header>
        <ModelingBatchContextContent
          {...contentProps}
          onCancelBatchMode={onCancelBatchMode}
        />
      </section>
    </div>
  );
}
