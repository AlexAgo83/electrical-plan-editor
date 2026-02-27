import type { ChangeEvent, ReactElement, ReactNode, RefObject } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { NetworkImportSummary } from "../../../adapters/portability";
import { HOME_CHANGELOG_ENTRIES } from "../../lib/changelogFeed";

interface HomeWorkspacePostMvpModules {
  sessionSummary?: ReactNode;
  activityHistory?: ReactNode;
  healthSnapshot?: ReactNode;
}

interface HomeWorkspaceContentProps {
  hasActiveNetwork: boolean;
  activeNetworkName: string | null;
  activeNetworkTechnicalId: string | null;
  networkCount: number;
  saveStatus: "saved" | "unsaved" | "error";
  validationIssuesCount: number;
  validationErrorCount: number;
  validationWarningCount: number;
  onCreateEmptyWorkspace: () => void;
  onOpenImportPicker: () => void;
  importFileInputRef: RefObject<HTMLInputElement | null>;
  onImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  importExportStatusMessage: string | null;
  lastImportSummary: NetworkImportSummary | null;
  onOpenNetworkScope: () => void;
  onOpenModeling: () => void;
  onOpenValidation: () => void;
  onOpenOnboardingHelp?: () => void;
  postMvpModules?: HomeWorkspacePostMvpModules;
}

function formatSaveStatus(saveStatus: HomeWorkspaceContentProps["saveStatus"]): string {
  if (saveStatus === "saved") {
    return "Saved";
  }
  if (saveStatus === "unsaved") {
    return "Unsaved";
  }
  return "Error";
}

export function HomeWorkspaceContent({
  hasActiveNetwork,
  activeNetworkName,
  activeNetworkTechnicalId,
  networkCount,
  saveStatus,
  validationIssuesCount,
  validationErrorCount,
  validationWarningCount,
  onCreateEmptyWorkspace,
  onOpenImportPicker,
  importFileInputRef,
  onImportFileChange,
  importExportStatusMessage,
  lastImportSummary,
  onOpenNetworkScope,
  onOpenModeling,
  onOpenValidation,
  onOpenOnboardingHelp,
  postMvpModules
}: HomeWorkspaceContentProps): ReactElement {
  const homeExtensionEntries = [
    ["session", "Session summary", postMvpModules?.sessionSummary],
    ["history", "Activity history", postMvpModules?.activityHistory],
    ["health", "Health snapshot", postMvpModules?.healthSnapshot]
  ] as const;

  const hasPostMvpModules = homeExtensionEntries.some(([, , content]) => content !== undefined && content !== null);

  return (
    <section className="home-workspace-grid" aria-label="Home workspace">
      <div className="home-left-column">
        <section className="panel home-panel home-quick-start-panel">
          <header className="home-panel-header">
            <h2>Quick start</h2>
            <div className="home-panel-header-tools">
              <span className="settings-panel-chip">Home</span>
            </div>
          </header>
          <p className="settings-panel-intro home-start-intro">
            Start a new workspace flow, import existing data, or open workspace management controls.
          </p>
          <div className="row-actions home-primary-actions">
            <button type="button" className="button-with-icon" onClick={onOpenNetworkScope}>
              <span className="action-button-icon is-home-start" aria-hidden="true" />
              <span>Open Network Scope</span>
            </button>
            <button type="button" className="button-with-icon" onClick={onCreateEmptyWorkspace}>
              <span className="action-button-icon is-home-create" aria-hidden="true" />
              <span>Create empty workspace</span>
            </button>
            <button type="button" className="button-with-icon" onClick={onOpenImportPicker}>
              <span className="action-button-icon is-home-import" aria-hidden="true" />
              <span>Import from file</span>
            </button>
          </div>
          <input
            ref={importFileInputRef}
            type="file"
            accept="application/json,.json"
            className="home-hidden-file-input"
            onChange={(event) => {
              void onImportFileChange(event);
            }}
          />
          {importExportStatusMessage !== null ? <p className="meta-line home-inline-status">{importExportStatusMessage}</p> : null}
          {lastImportSummary !== null ? (
            <p className="meta-line home-inline-status">
              Last import: {lastImportSummary.importedNetworkIds.length} imported / {lastImportSummary.skippedNetworkIds.length} skipped
              {lastImportSummary.warnings.length > 0 ? ` / ${lastImportSummary.warnings.length} warnings` : ""}
              {lastImportSummary.errors.length > 0 ? ` / ${lastImportSummary.errors.length} errors` : ""}.
            </p>
          ) : null}
        </section>

        <section className="panel home-panel home-workspace-resume-panel">
          <header className="home-panel-header">
            <h2>Workspace</h2>
            <span className="settings-panel-chip">Active</span>
          </header>
          <p className="settings-panel-intro home-resume-intro">
            Continue where you left off using the current workspace context and active network.
          </p>
          <div className="summary-grid home-summary-grid" aria-label="Workspace summary">
            <article>
              <h3>Networks</h3>
              <p>{networkCount}</p>
            </article>
            <article>
              <h3>State</h3>
              <p>{formatSaveStatus(saveStatus)}</p>
            </article>
            <article>
              <h3>Issues</h3>
              <p>{validationIssuesCount}</p>
            </article>
            <article>
              <h3>Errors / Warnings</h3>
              <p>
                {validationErrorCount} / {validationWarningCount}
              </p>
            </article>
          </div>
          <p className="meta-line home-resume-copy">
            {hasActiveNetwork && activeNetworkName !== null && activeNetworkTechnicalId !== null ? (
              <>
                <span className="home-resume-copy-label">Active network:</span>
                {" "}
                <span className="home-resume-copy-value">{activeNetworkName}</span>
                {" "}
                <span className="home-resume-copy-id">({activeNetworkTechnicalId})</span>
              </>
            ) : (
              "No active network selected. Open Network Scope to choose or create one."
            )}
          </p>
          <div className="row-actions home-resume-actions">
            <button type="button" className="button-with-icon" onClick={onOpenModeling} disabled={!hasActiveNetwork}>
              <span className="action-button-icon is-edit" aria-hidden="true" />
              <span>Resume</span>
            </button>
            <button type="button" className="button-with-icon" onClick={onOpenValidation} disabled={!hasActiveNetwork}>
              <span className="action-button-icon is-open" aria-hidden="true" />
              <span>Validation</span>
            </button>
            {onOpenOnboardingHelp !== undefined ? (
              <button type="button" className="button-with-icon" onClick={onOpenOnboardingHelp}>
                <span className="action-button-icon is-help" aria-hidden="true" />
                <span>Help</span>
              </button>
            ) : null}
          </div>
        </section>
      </div>
      <section className="panel home-panel home-whats-new-panel">
        <header className="home-panel-header">
          <h2>What's new</h2>
          <span className="settings-panel-chip">Changelog</span>
        </header>
        <p className="settings-panel-intro home-whats-new-intro">
          Latest release notes from available changelog files.
        </p>
        <div className="home-whats-new-scroll" aria-label="Changelog feed" tabIndex={0}>
          {HOME_CHANGELOG_ENTRIES.length === 0 ? (
            <p className="empty-copy">No changelog available.</p>
          ) : (
            HOME_CHANGELOG_ENTRIES.map((entry) => (
              <article key={entry.sourcePath} className="home-changelog-entry" aria-label={`Changelog v${entry.version}`}>
                <h3 className="home-changelog-version-heading" data-changelog-version={entry.version}>
                  v{entry.version}
                </h3>
                <div className="home-changelog-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.content}</ReactMarkdown>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {hasPostMvpModules ? (
        <section className="panel home-panel home-extension-panel">
          <header className="home-panel-header">
            <h2>Workspace hub</h2>
            <span className="settings-panel-chip">Post-MVP</span>
          </header>
          <p className="settings-panel-intro">Extension-ready region for session, history, health, and release notes modules.</p>
          <div className="home-extension-grid">
            {homeExtensionEntries.map(([key, title, content]) =>
              content !== undefined && content !== null ? (
                <section key={key} className="home-extension-slot" aria-label={title}>
                  <h3>{title}</h3>
                  {content}
                </section>
              ) : null
            )}
          </div>
        </section>
      ) : null}
    </section>
  );
}
