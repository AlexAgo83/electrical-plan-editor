import type { ReactElement } from "react";
import { WorkspaceNavigation } from "../WorkspaceNavigation";
import type { SubScreenId, ValidationIssue } from "../../types/app-controller";

interface WorkspaceSidebarPanelProps {
  activeScreen: "networkScope" | "modeling" | "analysis" | "validation" | "settings";
  activeSubScreen: SubScreenId;
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
  isValidationScreen: boolean;
  validationIssuesCount: number;
  validationErrorCount: number;
  entityCountBySubScreen: Record<SubScreenId, number>;
  onScreenChange: (screen: "networkScope" | "modeling" | "analysis" | "validation" | "settings") => void;
  onSubScreenChange: (subScreen: SubScreenId) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  isUndoAvailable: boolean;
  isRedoAvailable: boolean;
  showShortcutHints: boolean;
  saveStatus: "saved" | "unsaved" | "error";
  validationWarningCount: number;
  issueNavigatorDisplay: string;
  issueNavigationScopeLabel: string;
  currentValidationIssue: ValidationIssue | null;
  orderedValidationIssues: ValidationIssue[];
  handleOpenValidationScreen: (filter: "all" | "error" | "warning") => void;
  moveValidationIssueCursor: (direction: 1 | -1) => void;
}

export function WorkspaceSidebarPanel({
  activeScreen,
  activeSubScreen,
  isModelingScreen,
  isAnalysisScreen,
  isValidationScreen,
  validationIssuesCount,
  validationErrorCount,
  entityCountBySubScreen,
  onScreenChange,
  onSubScreenChange,
  handleUndo,
  handleRedo,
  isUndoAvailable,
  isRedoAvailable,
  showShortcutHints,
  saveStatus,
  validationWarningCount,
  issueNavigatorDisplay,
  issueNavigationScopeLabel,
  currentValidationIssue,
  orderedValidationIssues,
  handleOpenValidationScreen,
  moveValidationIssueCursor
}: WorkspaceSidebarPanelProps): ReactElement {
  return (
    <aside className="workspace-sidebar">
      <WorkspaceNavigation
        activeScreen={activeScreen}
        activeSubScreen={activeSubScreen}
        isModelingScreen={isModelingScreen}
        isAnalysisScreen={isAnalysisScreen}
        isValidationScreen={isValidationScreen}
        validationIssuesCount={validationIssuesCount}
        validationErrorCount={validationErrorCount}
        entityCountBySubScreen={entityCountBySubScreen}
        onScreenChange={onScreenChange}
        onSubScreenChange={onSubScreenChange}
      />

      <section className="workspace-meta">
        <div className="workspace-meta-main">
          <div className="row-actions compact">
            <button type="button" onClick={handleUndo} disabled={!isUndoAvailable}>
              Undo
            </button>
            <button type="button" onClick={handleRedo} disabled={!isRedoAvailable}>
              Redo
            </button>
          </div>
          {showShortcutHints ? (
            <>
              <p className="shortcut-hints">Shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redo.</p>
              <p className="shortcut-hints">Nav: Alt+1..4 screens, Alt+Shift+1..5 entity tabs, Alt+V/N/G/C/R modes, Alt+F fit canvas, Alt+J/K issue nav.</p>
            </>
          ) : null}
        </div>
        <p className={`save-status is-${saveStatus}`}>
          State: {saveStatus === "saved" ? "Saved" : saveStatus === "unsaved" ? "Unsaved" : "Error"}
        </p>
        <section className="workspace-health" aria-label="Model health">
          <h2>Model health</h2>
          <p className="meta-line">
            Total issues: <strong>{validationIssuesCount}</strong>
          </p>
          <p className="meta-line">
            Errors: <strong>{validationErrorCount}</strong> / Warnings: <strong>{validationWarningCount}</strong>
          </p>
          <p className="meta-line">
            Issue navigator: <strong>{issueNavigatorDisplay}</strong>
          </p>
          <p className="meta-line">Scope: {issueNavigationScopeLabel}</p>
          {currentValidationIssue !== null ? (
            <p className="meta-line">
              Current issue: <strong>[{currentValidationIssue.severity.toUpperCase()}] {currentValidationIssue.category}</strong>
            </p>
          ) : null}
          <div className="row-actions compact">
            <button type="button" onClick={() => handleOpenValidationScreen("all")}>
              Open validation
            </button>
            <button type="button" onClick={() => handleOpenValidationScreen("error")} disabled={validationErrorCount === 0}>
              Review errors
            </button>
            <button
              type="button"
              onClick={() => handleOpenValidationScreen("warning")}
              disabled={validationWarningCount === 0}
            >
              Review warnings
            </button>
            <button type="button" onClick={() => moveValidationIssueCursor(-1)} disabled={orderedValidationIssues.length === 0}>
              Previous issue
            </button>
            <button type="button" onClick={() => moveValidationIssueCursor(1)} disabled={orderedValidationIssues.length === 0}>
              Next issue
            </button>
          </div>
        </section>
      </section>
    </aside>
  );
}
