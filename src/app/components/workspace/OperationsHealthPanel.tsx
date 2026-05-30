import type { ChangeEvent, ReactElement, RefObject } from "react";
import type { WorkspaceFileStorageStatus } from "../../hooks/useWorkspaceFileStorage";
import type { ValidationIssue } from "../../types/app-controller";

interface OperationsHealthPanelProps {
  handleUndo: () => void;
  handleRedo: () => void;
  isUndoAvailable: boolean;
  isRedoAvailable: boolean;
  showShortcutHints: boolean;
  saveStatus: "saved" | "unsaved" | "error";
  workspaceFileStatus: WorkspaceFileStorageStatus;
  onOpenWorkspaceFile: () => void;
  onRelinkWorkspaceFile: () => void;
  onResumeWorkspaceFile: () => void;
  onSaveWorkspaceFileAs: () => void;
  workspaceFileInputRef: RefObject<HTMLInputElement | null>;
  onWorkspaceFileInputChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  validationIssuesCount: number;
  validationErrorCount: number;
  validationWarningCount: number;
  issueNavigatorDisplay: string;
  issueNavigationScopeLabel: string;
  currentValidationIssue: ValidationIssue | null;
  orderedValidationIssues: ValidationIssue[];
  handleOpenValidationScreen: (filter: "all" | "error" | "warning") => void;
  moveValidationIssueCursor: (direction: 1 | -1) => void;
}

export function OperationsHealthPanel({
  handleUndo,
  handleRedo,
  isUndoAvailable,
  isRedoAvailable,
  showShortcutHints,
  saveStatus,
  workspaceFileStatus,
  onOpenWorkspaceFile,
  onRelinkWorkspaceFile,
  onResumeWorkspaceFile,
  onSaveWorkspaceFileAs,
  workspaceFileInputRef,
  onWorkspaceFileInputChange,
  validationIssuesCount,
  validationErrorCount,
  validationWarningCount,
  issueNavigatorDisplay,
  issueNavigationScopeLabel,
  currentValidationIssue,
  orderedValidationIssues,
  handleOpenValidationScreen,
  moveValidationIssueCursor
}: OperationsHealthPanelProps): ReactElement {
  return (
    <section className="workspace-ops-content panel">
      <h2>Operations and health</h2>
      <div className="row-actions compact">
        <button type="button" className="button-with-icon" onClick={handleUndo} disabled={!isUndoAvailable}>
          <span className="action-button-icon is-undo" aria-hidden="true" />
          Undo
        </button>
        <button type="button" className="button-with-icon" onClick={handleRedo} disabled={!isRedoAvailable}>
          <span className="action-button-icon is-redo" aria-hidden="true" />
          Redo
        </button>
      </div>
      {showShortcutHints ? (
        <>
          <p className="shortcut-hints">Shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redo.</p>
          <p className="shortcut-hints">Nav: Alt+1..7 screens, Alt+Shift+1..5 entity tabs, Alt+V/N/G/C/R modes, Alt+F fit canvas, Alt+J/K issue nav.</p>
        </>
      ) : null}
      <p className={`save-status is-${saveStatus}`}>
        State: {saveStatus === "saved" ? "Saved" : saveStatus === "unsaved" ? "Unsaved" : "Error"}
      </p>
      <section className="workspace-health workspace-storage-ops" aria-label="Workspace storage">
        <h2>Workspace storage</h2>
        <p className="meta-line">
          File state: <strong>{workspaceFileStatus.label}</strong>
        </p>
        <p className="meta-line">
          Mode: {workspaceFileStatus.mode === "linked" ? "Linked file" : "Local only"}
        </p>
        <p className="meta-line">
          Autosave: {workspaceFileStatus.saveTarget === "linked-file" ? "Linked file" : workspaceFileStatus.saveTarget === "download" ? "Downloaded copy" : "Local cache"}
        </p>
        <p className="meta-line">
          Resume: {workspaceFileStatus.resumeStatus === "available" ? "Available" : workspaceFileStatus.resumeStatus === "permission-required" ? "Permission required" : workspaceFileStatus.resumeStatus === "unavailable" ? "Unavailable" : "None"}
        </p>
        <p className="meta-line">
          Direct file access: {workspaceFileStatus.directFileAccessSupported ? "Supported" : "Fallback download only"}
        </p>
        {workspaceFileStatus.fileName !== null ? <p className="meta-line">File: {workspaceFileStatus.fileName}</p> : null}
        {workspaceFileStatus.mode !== "linked" && workspaceFileStatus.resumeFileName !== null ? (
          <p className="meta-line">Resume: {workspaceFileStatus.resumeFileName}</p>
        ) : null}
        {workspaceFileStatus.message !== null ? <p className="meta-line">{workspaceFileStatus.message}</p> : null}
        <div className="row-actions compact workspace-storage-actions">
          <button
            type="button"
            className="button-with-icon"
            onClick={onResumeWorkspaceFile}
            disabled={!workspaceFileStatus.canResume || workspaceFileStatus.mode === "linked"}
          >
            <span className="action-button-icon is-redo" aria-hidden="true" />
            Resume
          </button>
          <button type="button" className="button-with-icon" onClick={onOpenWorkspaceFile}>
            <span className="action-button-icon is-open" aria-hidden="true" />
            Open
          </button>
          <button type="button" className="button-with-icon" onClick={onRelinkWorkspaceFile}>
            <span className="action-button-icon is-swap" aria-hidden="true" />
            Relink
          </button>
          <button type="button" className="button-with-icon" onClick={onSaveWorkspaceFileAs}>
            <span className="action-button-icon is-save" aria-hidden="true" />
            Save as
          </button>
          <input
            ref={workspaceFileInputRef}
            className="visually-hidden"
            type="file"
            accept=".epe.json,.json,application/json"
            onChange={(event) => {
              void onWorkspaceFileInputChange(event);
            }}
            aria-label="Open workspace file"
          />
        </div>
      </section>
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
        <div className="row-actions compact workspace-health-actions">
          <button
            type="button"
            className="button-with-icon"
            onClick={() => moveValidationIssueCursor(-1)}
            disabled={orderedValidationIssues.length === 0}
          >
            <span className="action-button-icon is-prevnext" aria-hidden="true" />
            Previous
          </button>
          <button type="button" className="button-with-icon" onClick={() => handleOpenValidationScreen("all")}>
            <span className="action-button-icon is-open" aria-hidden="true" />
            Open
          </button>
          <button
            type="button"
            className="button-with-icon"
            onClick={() => moveValidationIssueCursor(1)}
            disabled={orderedValidationIssues.length === 0}
          >
            Next
            <span className="action-button-icon is-prevnext is-flip-x" aria-hidden="true" />
          </button>
        </div>
      </section>
    </section>
  );
}
