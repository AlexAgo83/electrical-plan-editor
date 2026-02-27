import type { ChangeEvent, ReactElement, RefObject } from "react";
import type { NetworkImportSummary } from "../../../adapters/portability";
import type { NetworkId } from "../../../core/entities";
import type { ThemeMode } from "../../../store";
import type {
  CanvasCalloutTextSize,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  SortDirection,
  SortField,
  TableDensity,
  TableFontSize,
  WorkspaceCurrencyCode,
  WorkspacePanelsLayoutMode
} from "../../types/app-controller";
import type { ImportExportStatus } from "../../types/app-controller";

interface SettingsWorkspaceContentProps {
  isCurrentWorkspaceEmpty: boolean;
  hasBuiltInSampleState: boolean;
  handleRecreateSampleNetwork: () => void;
  handleRecreateValidationIssuesSampleNetwork: () => void;
  handleRecreateCatalogValidationIssuesSampleNetwork: () => void;
  handleRecreatePricingBomQaSampleNetwork: () => void;
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
  themeMode: ThemeMode;
  setThemeMode: (value: ThemeMode) => void;
  tableDensity: TableDensity;
  setTableDensity: (value: TableDensity) => void;
  tableFontSize: TableFontSize;
  setTableFontSize: (value: TableFontSize) => void;
  workspaceCurrencyCode: WorkspaceCurrencyCode;
  setWorkspaceCurrencyCode: (value: WorkspaceCurrencyCode) => void;
  workspaceTaxEnabled: boolean;
  setWorkspaceTaxEnabled: (value: boolean) => void;
  workspaceTaxRatePercent: number;
  setWorkspaceTaxRatePercent: (value: number) => void;
  defaultWireSectionMm2: number;
  setDefaultWireSectionMm2: (value: number) => void;
  defaultAutoCreateLinkedNodes: boolean;
  setDefaultAutoCreateLinkedNodes: (value: boolean) => void;
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
  canvasDefaultLockEntityMovement: boolean;
  setCanvasDefaultLockEntityMovement: (value: boolean) => void;
  canvasDefaultShowInfoPanels: boolean;
  setCanvasDefaultShowInfoPanels: (value: boolean) => void;
  canvasDefaultShowSegmentLengths: boolean;
  setCanvasDefaultShowSegmentLengths: (value: boolean) => void;
  canvasDefaultShowCableCallouts: boolean;
  setCanvasDefaultShowCableCallouts: (value: boolean) => void;
  canvasDefaultLabelStrokeMode: CanvasLabelStrokeMode;
  setCanvasDefaultLabelStrokeMode: (value: CanvasLabelStrokeMode) => void;
  canvasDefaultLabelSizeMode: CanvasLabelSizeMode;
  setCanvasDefaultLabelSizeMode: (value: CanvasLabelSizeMode) => void;
  canvasDefaultCalloutTextSize: CanvasCalloutTextSize;
  setCanvasDefaultCalloutTextSize: (value: CanvasCalloutTextSize) => void;
  canvasDefaultLabelRotationDegrees: CanvasLabelRotationDegrees;
  setCanvasDefaultLabelRotationDegrees: (value: CanvasLabelRotationDegrees) => void;
  canvasDefaultAutoSegmentLabelRotation: boolean;
  setCanvasDefaultAutoSegmentLabelRotation: (value: boolean) => void;
  canvasPngExportIncludeBackground: boolean;
  setCanvasPngExportIncludeBackground: (value: boolean) => void;
  canvasResetZoomPercentInput: string;
  setCanvasResetZoomPercentInput: (value: string) => void;
  configuredResetZoomPercent: number;
  applyCanvasDefaultsNow: () => void;
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  showShortcutHints: boolean;
  setShowShortcutHints: (value: boolean) => void;
  keyboardShortcutsEnabled: boolean;
  setKeyboardShortcutsEnabled: (value: boolean) => void;
  showFloatingInspectorPanel: boolean;
  setShowFloatingInspectorPanel: (value: boolean) => void;
  workspacePanelsLayoutMode: WorkspacePanelsLayoutMode;
  setWorkspacePanelsLayoutMode: (value: WorkspacePanelsLayoutMode) => void;
  resetWorkspacePreferencesToDefaults: () => void;
}

export function SettingsWorkspaceContent({
  isCurrentWorkspaceEmpty,
  hasBuiltInSampleState,
  handleRecreateSampleNetwork,
  handleRecreateValidationIssuesSampleNetwork,
  handleRecreateCatalogValidationIssuesSampleNetwork,
  handleRecreatePricingBomQaSampleNetwork,
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
  lastImportSummary,
  themeMode,
  setThemeMode,
  tableDensity,
  setTableDensity,
  tableFontSize,
  setTableFontSize,
  workspaceCurrencyCode,
  setWorkspaceCurrencyCode,
  workspaceTaxEnabled,
  setWorkspaceTaxEnabled,
  workspaceTaxRatePercent,
  setWorkspaceTaxRatePercent,
  defaultWireSectionMm2,
  setDefaultWireSectionMm2,
  defaultAutoCreateLinkedNodes,
  setDefaultAutoCreateLinkedNodes,
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
  canvasDefaultLockEntityMovement,
  setCanvasDefaultLockEntityMovement,
  canvasDefaultShowInfoPanels,
  setCanvasDefaultShowInfoPanels,
  canvasDefaultShowSegmentLengths,
  setCanvasDefaultShowSegmentLengths,
  canvasDefaultShowCableCallouts,
  setCanvasDefaultShowCableCallouts,
  canvasDefaultLabelStrokeMode,
  setCanvasDefaultLabelStrokeMode,
  canvasDefaultLabelSizeMode,
  setCanvasDefaultLabelSizeMode,
  canvasDefaultCalloutTextSize,
  setCanvasDefaultCalloutTextSize,
  canvasDefaultLabelRotationDegrees,
  setCanvasDefaultLabelRotationDegrees,
  canvasDefaultAutoSegmentLabelRotation,
  setCanvasDefaultAutoSegmentLabelRotation,
  canvasPngExportIncludeBackground,
  setCanvasPngExportIncludeBackground,
  canvasResetZoomPercentInput,
  setCanvasResetZoomPercentInput,
  applyCanvasDefaultsNow,
  handleZoomAction,
  showShortcutHints,
  setShowShortcutHints,
  keyboardShortcutsEnabled,
  setKeyboardShortcutsEnabled,
  showFloatingInspectorPanel,
  setShowFloatingInspectorPanel,
  workspacePanelsLayoutMode,
  setWorkspacePanelsLayoutMode,
  resetWorkspacePreferencesToDefaults
}: SettingsWorkspaceContentProps): ReactElement {
  return (
    <section className="panel-grid settings-panel-grid">
      <section className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Appearance preferences</h2>
          <span className="settings-panel-chip">Display</span>
        </header>
        <p className="settings-panel-intro">Global visual defaults for theme, table typography, density, and sorting across modeling and analysis views.</p>
        <div className="settings-grid">
          <label className="settings-field">
            Theme mode
            <select value={themeMode} onChange={(event) => setThemeMode(event.target.value as ThemeMode)}>
              <option value="normal">Light</option>
              <option value="paperBlueprint">Paper Blueprint (Light)</option>
              <option value="warmBrown">Warm Brown (Light)</option>
              <option value="mistGray">Mist Gray (Light)</option>
              <option value="sagePaper">Sage Paper (Light)</option>
              <option value="sandSlate">Sand Slate (Light)</option>
              <option value="iceBlue">Ice Blue (Light)</option>
              <option value="softTeal">Soft Teal (Light)</option>
              <option value="dustyRose">Dusty Rose (Light)</option>
              <option value="paleOlive">Pale Olive (Light)</option>
              <option value="cloudLavender">Cloud Lavender (Light)</option>
              <option value="roseQuartz">Rose Quartz (Light)</option>
              <option value="lavenderHaze">Lavender Haze (Light)</option>
              <option value="circleMobilityLight">Circle Mobility (Light)</option>
              <option value="dark">Dark</option>
              <option value="slateNeon">Slate Neon (Dark)</option>
              <option value="deepGreen">Deep Green (Dark)</option>
              <option value="burgundyNoir">Burgundy Noir (Dark)</option>
              <option value="amberNight">Amber Night (Dark)</option>
              <option value="cyberpunk">Cyberpunk (Dark)</option>
              <option value="olive">Olive (Dark)</option>
              <option value="steelBlue">Steel Blue (Dark)</option>
              <option value="forestGraphite">Forest Graphite (Dark)</option>
              <option value="petrolSlate">Petrol Slate (Dark)</option>
              <option value="copperNight">Copper Night (Dark)</option>
              <option value="mossTaupe">Moss Taupe (Dark)</option>
              <option value="navyAsh">Navy Ash (Dark)</option>
              <option value="charcoalPlum">Charcoal Plum (Dark)</option>
              <option value="smokedTeal">Smoked Teal (Dark)</option>
              <option value="circleMobilityDark">Circle Mobility (Dark)</option>
            </select>
          </label>
          <label className="settings-field">
            Table density
            <select value={tableDensity} onChange={(event) => setTableDensity(event.target.value as TableDensity)}>
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </label>
          <label className="settings-field">
            Table font size
            <select value={tableFontSize} onChange={(event) => setTableFontSize(event.target.value as TableFontSize)}>
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </label>
          <label className="settings-field">
            Default sort column
            <select value={defaultSortField} onChange={(event) => setDefaultSortField(event.target.value as SortField)}>
              <option value="name">Name</option>
              <option value="technicalId">Technical ID</option>
            </select>
          </label>
          <label className="settings-field">
            Default sort direction
            <select value={defaultSortDirection} onChange={(event) => setDefaultSortDirection(event.target.value as SortDirection)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
          <label className="settings-field">
            Default ID sort direction
            <select value={defaultIdSortDirection} onChange={(event) => setDefaultIdSortDirection(event.target.value as SortDirection)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
        <div className="row-actions settings-actions">
          <button type="button" className="settings-primary-action" onClick={applyListSortDefaults}>Apply sort defaults now</button>
        </div>
      </section>

      <section className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Canvas render preferences</h2>
          <span className="settings-panel-chip">Canvas Render</span>
        </header>
        <p className="settings-panel-intro">Typography and rendering defaults used for labels, callouts, and view reset behavior.</p>
        <div className="settings-grid">
          <label className="settings-field">
            Label stroke mode
            <select
              value={canvasDefaultLabelStrokeMode}
              onChange={(event) => setCanvasDefaultLabelStrokeMode(event.target.value as CanvasLabelStrokeMode)}
            >
              <option value="none">Rien</option>
              <option value="light">Léger</option>
              <option value="normal">Normal</option>
            </select>
          </label>
          <label className="settings-field">
            2D label size
            <select
              value={canvasDefaultLabelSizeMode}
              onChange={(event) => setCanvasDefaultLabelSizeMode(event.target.value as CanvasLabelSizeMode)}
            >
              <option value="extraSmall">Extra small</option>
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="extraLarge">Extra large</option>
            </select>
          </label>
          <label className="settings-field">
            Callout text size
            <select
              value={canvasDefaultCalloutTextSize}
              onChange={(event) => setCanvasDefaultCalloutTextSize(event.target.value as CanvasCalloutTextSize)}
            >
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </label>
          <label className="settings-field">
            2D label rotation
            <select
              value={String(canvasDefaultLabelRotationDegrees)}
              onChange={(event) => setCanvasDefaultLabelRotationDegrees(Number(event.target.value) as CanvasLabelRotationDegrees)}
            >
              <option value="-90">-90°</option>
              <option value="-45">-45°</option>
              <option value="-20">-20°</option>
              <option value="0">0°</option>
              <option value="20">20°</option>
              <option value="45">45°</option>
              <option value="90">90°</option>
            </select>
          </label>
          <label className="settings-field">
            Auto segment label rotation
            <select
              value={canvasDefaultAutoSegmentLabelRotation ? "yes" : "no"}
              onChange={(event) => setCanvasDefaultAutoSegmentLabelRotation(event.target.value === "yes")}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="settings-field">
            Reset zoom target (%)
            <input type="number" value={canvasResetZoomPercentInput} onChange={(event) => setCanvasResetZoomPercentInput(event.target.value)} />
          </label>
        </div>
        <div className="row-actions settings-actions">
          <button type="button" onClick={() => handleZoomAction("reset")}>Reset current view</button>
        </div>
      </section>

      <section className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Canvas tools preferences</h2>
          <span className="settings-panel-chip">Canvas Tools</span>
        </header>
        <p className="settings-panel-intro">Default tool behavior and overlay visibility for the 2D network workspace.</p>
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
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasDefaultLockEntityMovement}
              onChange={(event) => setCanvasDefaultLockEntityMovement(event.target.checked)}
            />
            Lock node movement by default
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasDefaultShowInfoPanels}
              onChange={(event) => setCanvasDefaultShowInfoPanels(event.target.checked)}
            />
            Show info overlays by default
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasDefaultShowSegmentLengths}
              onChange={(event) => setCanvasDefaultShowSegmentLengths(event.target.checked)}
            />
            Show segment lengths by default
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasDefaultShowCableCallouts}
              onChange={(event) => setCanvasDefaultShowCableCallouts(event.target.checked)}
            />
            Show connector/splice cable callouts by default
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasPngExportIncludeBackground}
              onChange={(event) => setCanvasPngExportIncludeBackground(event.target.checked)}
            />
            Include background in PNG export
          </label>
        </div>
        <div className="row-actions settings-actions">
          <button type="button" className="settings-primary-action" onClick={applyCanvasDefaultsNow}>Apply canvas defaults now</button>
        </div>
      </section>

      <section className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Action bar and shortcuts</h2>
          <span className="settings-panel-chip">Shortcuts</span>
        </header>
        <p className="settings-panel-intro">Enable keyboard helpers and keep a quick reference of available shortcuts.</p>
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
            Enable keyboard shortcuts (undo/redo/navigation/issues/view)
          </label>
        </div>
        <ul className="settings-shortcut-list">
          <li><span className="technical-id settings-shortcut-key">Ctrl/Cmd + Z</span> <span>Undo last modeling action</span></li>
          <li><span className="technical-id settings-shortcut-key">Ctrl/Cmd + Shift + Z</span> <span>Redo</span></li>
          <li><span className="technical-id settings-shortcut-key">Ctrl/Cmd + Y</span> <span>Redo (alternative shortcut)</span></li>
          <li><span className="technical-id settings-shortcut-key">Alt + 1..6</span> <span>Switch top-level workspace</span></li>
          <li><span className="technical-id settings-shortcut-key">Alt + Shift + 1..5</span> <span>Switch entity sub-screen</span></li>
          <li><span className="technical-id settings-shortcut-key">Alt + F</span> <span>Fit network view to current graph</span></li>
          <li><span className="technical-id settings-shortcut-key">Alt + J / Alt + K</span> <span>Previous / next validation issue</span></li>
        </ul>
      </section>

      <section className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Catalog & BOM setup</h2>
          <span className="settings-panel-chip">Pricing</span>
        </header>
        <p className="settings-panel-intro">
          Workspace pricing context for catalog and BOM flows. Catalog prices stay stored as excl. tax values.
        </p>
        <p className="meta-line">
          Tax/VAT settings only affect BOM calculations/export context. Disabling tax keeps HT-only outputs and preserves the last tax rate.
        </p>
        <div className="settings-grid">
          <label className="settings-field">
            Currency (Catalog/BOM)
            <select
              value={workspaceCurrencyCode}
              onChange={(event) => setWorkspaceCurrencyCode(event.target.value as WorkspaceCurrencyCode)}
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="CHF">CHF</option>
            </select>
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={workspaceTaxEnabled}
              onChange={(event) => setWorkspaceTaxEnabled(event.target.checked)}
            />
            Enable tax / VAT (TVA)
          </label>
          <label className="settings-field">
            Tax rate (%)
            <input
              type="number"
              min={0}
              max={1000}
              step={0.01}
              value={String(workspaceTaxRatePercent)}
              onChange={(event) => {
                const nextValue = Number(event.target.value.replace(",", "."));
                if (!Number.isFinite(nextValue) || nextValue < 0) {
                  return;
                }
                setWorkspaceTaxRatePercent(Math.min(1000, nextValue));
              }}
              disabled={!workspaceTaxEnabled}
            />
          </label>
        </div>
      </section>

      <section className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Global preferences</h2>
          <span className="settings-panel-chip">Defaults</span>
        </header>
        <p className="settings-panel-intro">Shared UI preferences applied across workspace screens (outside of screen-specific controls).</p>
        <div className="settings-grid">
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={showFloatingInspectorPanel}
              onChange={(event) => setShowFloatingInspectorPanel(event.target.checked)}
            />
            Show floating inspector panel on supported screens
          </label>
          <label className="settings-field">
            Workspace panels layout
            <select
              value={workspacePanelsLayoutMode}
              onChange={(event) => setWorkspacePanelsLayoutMode(event.target.value as WorkspacePanelsLayoutMode)}
              disabled
            >
              <option value="multiColumn">Responsive multi-column</option>
              <option value="singleColumn">Force single column</option>
            </select>
          </label>
          <label className="settings-field">
            Default wire section (mm²)
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={String(defaultWireSectionMm2)}
              onChange={(event) => {
                const nextValue = Number(event.target.value.replace(",", "."));
                if (!Number.isFinite(nextValue) || nextValue <= 0) {
                  return;
                }
                setDefaultWireSectionMm2(nextValue);
              }}
            />
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={defaultAutoCreateLinkedNodes}
              onChange={(event) => setDefaultAutoCreateLinkedNodes(event.target.checked)}
            />
            Default auto-create linked nodes for connectors/splices
          </label>
        </div>
        <div className="row-actions settings-actions">
          <button type="button" className="settings-primary-action" onClick={resetWorkspacePreferencesToDefaults}>Reset all UI preferences</button>
        </div>
      </section>

      <section className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Sample network controls</h2>
          <span className="settings-panel-chip">Sample</span>
        </header>
        <p className="settings-panel-intro">Quickly recreate baseline and QA-oriented sample data when testing flows or resetting your sandbox.</p>
        <div className="settings-state-row" aria-label="Sample workspace status">
          <span className={isCurrentWorkspaceEmpty ? "settings-state-chip is-ok" : "settings-state-chip"}>
            Workspace: {isCurrentWorkspaceEmpty ? "empty" : "loaded"}
          </span>
          <span className={hasBuiltInSampleState ? "settings-state-chip is-ok" : "settings-state-chip is-warn"}>
            Sample signature: {hasBuiltInSampleState ? "detected" : "missing"}
          </span>
        </div>
        <div className="row-actions settings-actions">
          <button type="button" onClick={handleRecreateSampleNetwork}>
            Recreate sample network
          </button>
          <button type="button" onClick={handleRecreateValidationIssuesSampleNetwork}>
            Recreate validation issues sample
          </button>
          <button type="button" onClick={handleRecreateCatalogValidationIssuesSampleNetwork}>
            Recreate catalog validation issues sample
          </button>
          <button type="button" onClick={handleRecreatePricingBomQaSampleNetwork}>
            Recreate pricing / BOM QA sample
          </button>
          <button type="button" onClick={handleResetSampleNetwork} disabled={!hasBuiltInSampleState}>
            Reset sample network to baseline
          </button>
        </div>
      </section>

      <section className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Import / Export networks</h2>
          <span className="settings-panel-chip">Portability</span>
        </header>
        <p className="settings-panel-intro">
          Deterministic JSON import/export for active, selected, or full network scopes.
        </p>
        <p className="meta-line">
          Export active, selected, or all networks as deterministic JSON payloads. Import preserves existing local data and resolves conflicts with deterministic suffixes.
        </p>
        <div className="row-actions settings-actions">
          <button type="button" onClick={() => handleExportNetworks("active")} disabled={activeNetworkId === null}>Export active</button>
          <button type="button" onClick={() => handleExportNetworks("selected")} disabled={selectedExportNetworkIds.length === 0}>Export selected</button>
          <button type="button" onClick={() => handleExportNetworks("all")} disabled={networks.length === 0}>Export all</button>
        </div>
        <fieldset className="inline-fieldset settings-export-fieldset">
          <legend>Selected networks for export</legend>
          {networks.length === 0 ? (
            <p className="empty-copy">No network available.</p>
          ) : (
            <div className="settings-grid settings-export-selection-grid">
              {networks.map((network) => (
                <label key={network.id} className="settings-checkbox settings-export-network-option">
                  <input
                    type="checkbox"
                    checked={selectedExportNetworkIds.includes(network.id)}
                    onChange={() => toggleSelectedExportNetwork(network.id)}
                  />
                  <span className="settings-export-network-copy">
                    <span className="settings-export-network-name">{network.name}</span>
                    <span className="settings-export-network-technical-id">
                      <span aria-hidden="true">(</span>
                      <span className="technical-id">{network.technicalId}</span>
                      <span aria-hidden="true">)</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
        <div className="row-actions settings-actions">
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
          <div className="settings-import-summary">
            <p className="meta-line"><span>Imported</span> <strong>{lastImportSummary.importedNetworkIds.length}</strong></p>
            <p className="meta-line"><span>Skipped</span> <strong>{lastImportSummary.skippedNetworkIds.length}</strong></p>
            <p className="meta-line"><span>Warnings</span> <strong>{lastImportSummary.warnings.length}</strong></p>
            <p className="meta-line"><span>Errors</span> <strong>{lastImportSummary.errors.length}</strong></p>
          </div>
        ) : null}
      </section>
    </section>
  );
}
