import type { ChangeEvent, ReactElement, RefObject } from "react";
import type { NetworkImportSummary } from "../../../adapters/portability";
import type { NetworkId } from "../../../core/entities";
import type { ThemeMode } from "../../../store";
import type { ImportExportStatus } from "../../types/app-controller";
import type { SortDirection, SortField, TableDensity } from "../../types/app-controller";

interface SettingsWorkspaceContentProps {
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
  isCurrentWorkspaceEmpty: boolean;
  hasBuiltInSampleState: boolean;
  handleRecreateSampleNetwork: () => void;
  handleResetSampleNetwork: () => void;
  activeNetworkId: NetworkId | null;
  selectedExportNetworkIds: NetworkId[];
  handleExportNetworks: (scope: "active" | "selected" | "all") => void;
  networks: Array<{ id: NetworkId; name: string; technicalId: string }>;
  toggleSelectedExportNetwork: (networkId: NetworkId) => void;
  handleOpenImportPicker: () => void;
  importFileInputRef: RefObject<HTMLInputElement | null>;
  handleImportFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  importExportStatus: ImportExportStatus | null;
  lastImportSummary: NetworkImportSummary | null;
}

export function SettingsWorkspaceContent({
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
  resetWorkspacePreferencesToDefaults,
  isCurrentWorkspaceEmpty,
  hasBuiltInSampleState,
  handleRecreateSampleNetwork,
  handleResetSampleNetwork,
  activeNetworkId,
  selectedExportNetworkIds,
  handleExportNetworks,
  networks,
  toggleSelectedExportNetwork,
  handleOpenImportPicker,
  importFileInputRef,
  handleImportFileChange,
  importExportStatus,
  lastImportSummary
}: SettingsWorkspaceContentProps): ReactElement {
  return (
    <section className="panel-grid">
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
          <li><span className="technical-id">Alt + 1..4</span> Switch top-level workspace</li>
          <li><span className="technical-id">Alt + Shift + 1..5</span> Switch entity sub-screen</li>
          <li><span className="technical-id">Alt + V/N/G/C/R</span> Set interaction mode</li>
          <li><span className="technical-id">Alt + F</span> Fit network view to current graph</li>
          <li><span className="technical-id">Alt + J / Alt + K</span> Previous / next validation issue</li>
        </ul>
        <div className="row-actions">
          <button type="button" onClick={resetWorkspacePreferencesToDefaults}>Reset all UI preferences</button>
        </div>
      </section>

      <section className="panel">
        <h2>Sample network controls</h2>
        <p className="meta-line">
          Workspace empty: {isCurrentWorkspaceEmpty ? "yes" : "no"} / Sample signature detected: {hasBuiltInSampleState ? "yes" : "no"}.
        </p>
        <div className="row-actions">
          <button type="button" onClick={handleRecreateSampleNetwork} disabled={!isCurrentWorkspaceEmpty}>
            Recreate sample network (empty workspace only)
          </button>
          <button type="button" onClick={handleResetSampleNetwork} disabled={!hasBuiltInSampleState}>
            Reset sample network to baseline
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Import / Export networks</h2>
        <p className="meta-line">
          Export active, selected, or all networks as deterministic JSON payloads. Import preserves existing local data and resolves conflicts with deterministic suffixes.
        </p>
        <div className="row-actions">
          <button type="button" onClick={() => handleExportNetworks("active")} disabled={activeNetworkId === null}>Export active</button>
          <button type="button" onClick={() => handleExportNetworks("selected")} disabled={selectedExportNetworkIds.length === 0}>Export selected</button>
          <button type="button" onClick={() => handleExportNetworks("all")} disabled={networks.length === 0}>Export all</button>
        </div>
        <fieldset className="inline-fieldset">
          <legend>Selected networks for export</legend>
          {networks.length === 0 ? (
            <p className="empty-copy">No network available.</p>
          ) : (
            <div className="settings-grid">
              {networks.map((network) => (
                <label key={network.id} className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedExportNetworkIds.includes(network.id)}
                    onChange={() => toggleSelectedExportNetwork(network.id)}
                  />
                  {network.name} (<span className="technical-id">{network.technicalId}</span>)
                </label>
              ))}
            </div>
          )}
        </fieldset>
        <div className="row-actions">
          <button type="button" onClick={handleOpenImportPicker}>Import from file</button>
          <input
            ref={importFileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              void handleImportFileChange(event);
            }}
            hidden
          />
        </div>
        {importExportStatus !== null ? <p className={`meta-line import-status is-${importExportStatus.kind}`}>{importExportStatus.message}</p> : null}
        {lastImportSummary !== null ? (
          <div className="settings-grid">
            <p className="meta-line">Imported: {lastImportSummary.importedNetworkIds.length}</p>
            <p className="meta-line">Skipped: {lastImportSummary.skippedNetworkIds.length}</p>
            <p className="meta-line">Warnings: {lastImportSummary.warnings.length}</p>
            <p className="meta-line">Errors: {lastImportSummary.errors.length}</p>
          </div>
        ) : null}
      </section>
    </section>
  );
}
