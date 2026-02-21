import type { FormEvent, ReactElement } from "react";
import type { NetworkId } from "../../../core/entities";
import type { ThemeMode } from "../../../store";
import type { SortDirection, SortField, TableDensity } from "../../types/app-controller";

interface NetworkScopeWorkspaceContentProps {
  networks: Array<{ id: NetworkId; name: string; technicalId: string }>;
  activeNetworkId: NetworkId | null;
  activeNetworkLabel: string;
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
  themeMode: ThemeMode;
  setThemeMode: (value: ThemeMode) => void;
  tableDensity: TableDensity;
  setTableDensity: (value: TableDensity) => void;
  defaultSortField: SortField;
  setDefaultSortField: (value: SortField) => void;
  defaultSortDirection: SortDirection;
  setDefaultSortDirection: (value: SortDirection) => void;
  defaultIdSortDirection: SortDirection;
  setDefaultIdSortDirection: (value: SortDirection) => void;
  applyListSortDefaults: () => void;
  canvasDefaultShowGrid: boolean;
  setCanvasDefaultShowGrid: (value: boolean) => void;
  canvasDefaultSnapToGrid: boolean;
  setCanvasDefaultSnapToGrid: (value: boolean) => void;
  canvasResetZoomPercentInput: string;
  setCanvasResetZoomPercentInput: (value: string) => void;
  configuredResetZoomPercent: number;
  applyCanvasDefaultsNow: () => void;
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  showShortcutHints: boolean;
  setShowShortcutHints: (value: boolean) => void;
  keyboardShortcutsEnabled: boolean;
  setKeyboardShortcutsEnabled: (value: boolean) => void;
  resetWorkspacePreferencesToDefaults: () => void;
}

export function NetworkScopeWorkspaceContent({
  networks,
  activeNetworkId,
  activeNetworkLabel,
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
  themeMode,
  setThemeMode,
  tableDensity,
  setTableDensity,
  defaultSortField,
  setDefaultSortField,
  defaultSortDirection,
  setDefaultSortDirection,
  defaultIdSortDirection,
  setDefaultIdSortDirection,
  applyListSortDefaults,
  canvasDefaultShowGrid,
  setCanvasDefaultShowGrid,
  canvasDefaultSnapToGrid,
  setCanvasDefaultSnapToGrid,
  canvasResetZoomPercentInput,
  setCanvasResetZoomPercentInput,
  configuredResetZoomPercent,
  applyCanvasDefaultsNow,
  handleZoomAction,
  showShortcutHints,
  setShowShortcutHints,
  keyboardShortcutsEnabled,
  setKeyboardShortcutsEnabled,
  resetWorkspacePreferencesToDefaults
}: NetworkScopeWorkspaceContentProps): ReactElement {
  return (
    <section className="panel-grid">
      <section className="panel">
        <h2>Network Scope</h2>
        <p className="meta-line">
          Active network: <strong>{activeNetworkLabel}</strong>
        </p>
        <p className="meta-line">
          Available networks: <strong>{networks.length}</strong>
        </p>
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
      </section>

      <section className="panel">
        <h2>Create network</h2>
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

      <section className="panel">
        <h2>Network lifecycle</h2>
        {!hasActiveNetwork ? (
          <p className="empty-copy">
            No active network is currently selected.
          </p>
        ) : (
          <p className="empty-copy">
            Use duplicate, rename, and delete actions to manage the current network scope.
          </p>
        )}
      </section>

      <section className="panel">
        <h2>Table and list preferences</h2>
        <div className="settings-grid">
          <label>
            Theme mode
            <select value={themeMode} onChange={(event) => setThemeMode(event.target.value as ThemeMode)}>
              <option value="normal">Normal</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label>
            Table density
            <select value={tableDensity} onChange={(event) => setTableDensity(event.target.value as TableDensity)}>
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </label>
          <label>
            Default sort column
            <select value={defaultSortField} onChange={(event) => setDefaultSortField(event.target.value as SortField)}>
              <option value="name">Name</option>
              <option value="technicalId">Technical ID</option>
            </select>
          </label>
          <label>
            Default sort direction
            <select value={defaultSortDirection} onChange={(event) => setDefaultSortDirection(event.target.value as SortDirection)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
          <label>
            Default ID sort direction
            <select value={defaultIdSortDirection} onChange={(event) => setDefaultIdSortDirection(event.target.value as SortDirection)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
        <div className="row-actions">
          <button type="button" onClick={applyListSortDefaults}>Apply sort defaults now</button>
        </div>
      </section>

      <section className="panel">
        <h2>Canvas preferences</h2>
        <div className="settings-grid">
          <label className="settings-checkbox">
            <input type="checkbox" checked={canvasDefaultShowGrid} onChange={(event) => setCanvasDefaultShowGrid(event.target.checked)} />
            Show grid by default
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasDefaultSnapToGrid}
              onChange={(event) => setCanvasDefaultSnapToGrid(event.target.checked)}
            />
            Snap node movement by default
          </label>
          <label>
            Reset zoom target (%)
            <input type="number" value={canvasResetZoomPercentInput} onChange={(event) => setCanvasResetZoomPercentInput(event.target.value)} />
          </label>
        </div>
        <div className="row-actions">
          <button type="button" onClick={applyCanvasDefaultsNow}>Apply canvas defaults now</button>
          <button type="button" onClick={() => handleZoomAction("reset")}>Reset current view</button>
        </div>
        <p className="meta-line">Configured reset zoom: {configuredResetZoomPercent}%.</p>
      </section>

      <section className="panel">
        <h2>Action bar and shortcuts</h2>
        <div className="settings-grid">
          <label className="settings-checkbox">
            <input type="checkbox" checked={showShortcutHints} onChange={(event) => setShowShortcutHints(event.target.checked)} />
            Show shortcut hints in the action bar
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={keyboardShortcutsEnabled}
              onChange={(event) => setKeyboardShortcutsEnabled(event.target.checked)}
            />
            Enable keyboard shortcuts (undo/redo/navigation/modes)
          </label>
        </div>
        <ul className="subnetwork-list">
          <li><span className="technical-id">Ctrl/Cmd + Z</span> Undo last modeling action</li>
          <li><span className="technical-id">Ctrl/Cmd + Shift + Z</span> Redo</li>
          <li><span className="technical-id">Ctrl/Cmd + Y</span> Redo alternative shortcut</li>
          <li><span className="technical-id">Alt + 1..5</span> Switch top-level workspace</li>
          <li><span className="technical-id">Alt + Shift + 1..5</span> Switch entity sub-screen</li>
          <li><span className="technical-id">Alt + V/N/G/C/R</span> Set interaction mode</li>
          <li><span className="technical-id">Alt + F</span> Fit network view to current graph</li>
          <li><span className="technical-id">Alt + J / Alt + K</span> Previous / next validation issue</li>
        </ul>
        <div className="row-actions">
          <button type="button" onClick={resetWorkspacePreferencesToDefaults}>Reset all UI preferences</button>
        </div>
      </section>
    </section>
  );
}
