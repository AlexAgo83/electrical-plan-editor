import { translateCurrent as t } from "../../lib/i18n";
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
      <h2>{t("ui.operationsAndHealth")}</h2>
      <div className="row-actions compact">
        <button type="button" className="button-with-icon" onClick={handleUndo} disabled={!isUndoAvailable}>
          <span className="action-button-icon is-undo" aria-hidden="true" />
          
          {t("ui.undo")}
        </button>
        <button type="button" className="button-with-icon" onClick={handleRedo} disabled={!isRedoAvailable}>
          <span className="action-button-icon is-redo" aria-hidden="true" />
          
          {t("ui.redo")}
        </button>
      </div>
      {showShortcutHints ? (
        <>
          <p className="shortcut-hints">{t("ui.shortcutsCtrlCmdZUndoCtrlCmdShiftZOr")}</p>
          <p className="shortcut-hints">{t("ui.navAlt17ScreensAltShift15Entity")}</p>
        </>
      ) : null}
      <p className={`save-status is-${saveStatus}`}>
        
        {t("ui.state")} {saveStatus === "saved" ? t("ui.saved") : saveStatus === "unsaved" ? t("ui.unsaved") : t("ui.error")}
      </p>
      <section className="workspace-health workspace-storage-ops" aria-label={t("ui.operationshealthpanelWorkspaceStorage")}>
        <h2>{t("ui.operationshealthpanelWorkspaceStorage")}</h2>
        <p className="meta-line">
          {t("ui.operationshealthpanelFileState")}<strong>{workspaceFileStatus.label}</strong>
        </p>
        <p className="meta-line">
          {t("ui.operationshealthpanelMode")}{workspaceFileStatus.mode === "linked" ? t("ui.settingssearchmodelLinkedFile") : t("ui.operationshealthpanelLocalOnly")}
        </p>
        <p className="meta-line">
          {t("ui.operationshealthpanelAutosave")}{workspaceFileStatus.saveTarget === "linked-file" ? t("ui.settingssearchmodelLinkedFile") : workspaceFileStatus.saveTarget === "download" ? "Downloaded copy" : "Local cache"}
        </p>
        <p className="meta-line">
          {t("ui.operationshealthpanelResume")}{workspaceFileStatus.resumeStatus === "available" ? t("ui.networkscopeworkspacecontentAvailable") : workspaceFileStatus.resumeStatus === "permission-required" ? "Permission required" : workspaceFileStatus.resumeStatus === "unavailable" ? "Unavailable" : t("ui.none")}
        </p>
        <p className="meta-line">
          {t("ui.operationshealthpanelDirectFileAccess")}{workspaceFileStatus.directFileAccessSupported ? t("ui.operationshealthpanelSupported") : t("ui.operationshealthpanelFallbackDownloadOnly")}
        </p>
        <p className="meta-line">
          {t("ui.operationshealthpanelFileAvailability")}{workspaceFileStatus.fileAvailability === "available" ? t("ui.networkscopeworkspacecontentAvailable") : workspaceFileStatus.fileAvailability === "unavailable" ? "Unavailable" : "Unknown"}
        </p>
        {workspaceFileStatus.fileName !== null ? <p className="meta-line">{t("ui.operationshealthpanelFile")}{workspaceFileStatus.fileName}</p> : null}
        {workspaceFileStatus.mode !== "linked" && workspaceFileStatus.resumeFileName !== null ? (
          <p className="meta-line">{t("ui.operationshealthpanelResume")}{workspaceFileStatus.resumeFileName}</p>
        ) : null}
        {workspaceFileStatus.message !== null ? <p className="meta-line">{workspaceFileStatus.message}</p> : null}
        <div className="row-actions compact workspace-storage-actions">
          <button
            type="button"
            className="button-with-icon"
            onClick={onResumeWorkspaceFile}
            disabled={!workspaceFileStatus.canResume || workspaceFileStatus.mode === "linked"}
            aria-label={t("ui.operationshealthpanelResumeWorkspaceFile")}
            title={t("ui.operationshealthpanelResumeTheLastWorkspaceFileRememberedByThisBrowser")}
          >
            <span className="action-button-icon is-redo" aria-hidden="true" />
            
            {t("ui.resume")}
          </button>
          <button
            type="button"
            className="button-with-icon"
            onClick={onOpenWorkspaceFile}
            aria-label={t("ui.operationshealthpanelOpenWorkspaceFile")}
            title={t("ui.operationshealthpanelOpenAWorkspaceFileAndReplaceTheCurrentWorkspace")}
          >
            <span className="action-button-icon is-open" aria-hidden="true" />
            
            {t("ui.open")}
          </button>
          <button
            type="button"
            className="button-with-icon"
            onClick={onSaveWorkspaceFileAs}
            aria-label={t("ui.operationshealthpanelSaveWorkspaceFileAs")}
            title={t("ui.operationshealthpanelSaveANewWorkspaceFileCopy")}
          >
            <span className="action-button-icon is-save" aria-hidden="true" />
            {t("ui.operationshealthpanelSaveAs")}</button>
          <input
            ref={workspaceFileInputRef}
            className="visually-hidden"
            type="file"
            accept=".epe.json,.json,application/json"
            onChange={(event) => {
              void onWorkspaceFileInputChange(event);
            }}
            aria-label={t("ui.operationshealthpanelOpenWorkspaceFile")}
          />
        </div>
      </section>
      <section className="workspace-health" aria-label={t("ui.modelHealth")}>
        <h2>{t("ui.modelHealth")}</h2>
        <p className="meta-line">
          
          {t("ui.totalIssues")} <strong>{validationIssuesCount}</strong>
        </p>
        <p className="meta-line">
          
          {t("ui.errors")} <strong>{validationErrorCount}</strong> {t("ui.operationshealthpanelWarnings")}<strong>{validationWarningCount}</strong>
        </p>
        <p className="meta-line">
          
          {t("ui.issueNavigator")} <strong>{issueNavigatorDisplay}</strong>
        </p>
        <p className="meta-line">{t("ui.scope")} {issueNavigationScopeLabel}</p>
        {currentValidationIssue !== null ? (
          <p className="meta-line">
            
            {t("ui.currentIssue")} <strong>[{currentValidationIssue.severity.toUpperCase()}] {currentValidationIssue.category}</strong>
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
            
            {t("ui.previous")}
          </button>
          <button type="button" className="button-with-icon" onClick={() => handleOpenValidationScreen("all")}>
            <span className="action-button-icon is-open" aria-hidden="true" />
            
            {t("ui.open")}
          </button>
          <button
            type="button"
            className="button-with-icon"
            onClick={() => moveValidationIssueCursor(1)}
            disabled={orderedValidationIssues.length === 0}
          >
            
            {t("ui.next")}
            <span className="action-button-icon is-prevnext is-flip-x" aria-hidden="true" />
          </button>
        </div>
      </section>
    </section>
  );
}
