import type { FormEvent, ReactElement } from "react";
import type { NetworkId } from "../../../core/entities";
import { WorkspaceNavigation } from "../WorkspaceNavigation";
import type { SubScreenId, ValidationIssue } from "../../types/app-controller";

interface WorkspaceSidebarPanelProps {
  activeScreen: "modeling" | "analysis" | "validation" | "settings";
  activeSubScreen: SubScreenId;
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
  isValidationScreen: boolean;
  validationIssuesCount: number;
  validationErrorCount: number;
  entityCountBySubScreen: Record<SubScreenId, number>;
  onScreenChange: (screen: "modeling" | "analysis" | "validation" | "settings") => void;
  onSubScreenChange: (subScreen: SubScreenId) => void;
  networks: Array<{
    id: NetworkId;
    name: string;
    technicalId: string;
  }>;
  activeNetworkId: NetworkId | null;
  hasActiveNetwork: boolean;
  handleSelectNetwork: (networkId: NetworkId) => void;
  handleDuplicateActiveNetwork: () => void;
  handleDeleteActiveNetwork: () => void;
  renameNetworkName: string;
  setRenameNetworkName: (value: string) => void;
  handleRenameActiveNetwork: () => void;
  newNetworkName: string;
  setNewNetworkName: (value: string) => void;
  newNetworkTechnicalId: string;
  setNewNetworkTechnicalId: (value: string) => void;
  newNetworkDescription: string;
  setNewNetworkDescription: (value: string) => void;
  networkFormError: string | null;
  networkTechnicalIdAlreadyUsed: boolean;
  handleCreateNetwork: (event: FormEvent<HTMLFormElement>) => void;
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
  networks,
  activeNetworkId,
  hasActiveNetwork,
  handleSelectNetwork,
  handleDuplicateActiveNetwork,
  handleDeleteActiveNetwork,
  renameNetworkName,
  setRenameNetworkName,
  handleRenameActiveNetwork,
  newNetworkName,
  setNewNetworkName,
  newNetworkTechnicalId,
  setNewNetworkTechnicalId,
  newNetworkDescription,
  setNewNetworkDescription,
  networkFormError,
  networkTechnicalIdAlreadyUsed,
  handleCreateNetwork,
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

      <section className="workspace-health" aria-label="Network scope">
        <h2>Network scope</h2>
        {networks.length === 0 ? (
          <p className="empty-copy">No network available. Create one to enable modeling and analysis.</p>
        ) : (
          <label>
            Active network
            <select value={activeNetworkId ?? ""} onChange={(event) => handleSelectNetwork(event.target.value as NetworkId)}>
              {networks.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name} ({network.technicalId})
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="row-actions compact">
          <button type="button" onClick={handleDuplicateActiveNetwork} disabled={!hasActiveNetwork}>
            Duplicate
          </button>
          <button type="button" onClick={handleDeleteActiveNetwork} disabled={!hasActiveNetwork}>
            Delete
          </button>
        </div>
        <label>
          Rename active network
          <input
            value={renameNetworkName}
            onChange={(event) => setRenameNetworkName(event.target.value)}
            placeholder="Network name"
            disabled={!hasActiveNetwork}
          />
        </label>
        <div className="row-actions compact">
          <button type="button" onClick={handleRenameActiveNetwork} disabled={!hasActiveNetwork}>
            Rename
          </button>
        </div>
        <form className="settings-grid" onSubmit={handleCreateNetwork}>
          <label>
            New network name
            <input value={newNetworkName} onChange={(event) => setNewNetworkName(event.target.value)} placeholder="Vehicle platform A" />
          </label>
          <label>
            New network technical ID
            <input
              value={newNetworkTechnicalId}
              onChange={(event) => setNewNetworkTechnicalId(event.target.value)}
              placeholder="NET-PLAT-A"
            />
          </label>
          <label>
            Description (optional)
            <input
              value={newNetworkDescription}
              onChange={(event) => setNewNetworkDescription(event.target.value)}
              placeholder="Optional description"
            />
          </label>
          {networkFormError !== null ? <p className="form-error">{networkFormError}</p> : null}
          {networkTechnicalIdAlreadyUsed ? <p className="form-hint danger">Technical ID already used by another network.</p> : null}
          <div className="row-actions compact">
            <button type="submit">Create network</button>
          </div>
        </form>
      </section>

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
