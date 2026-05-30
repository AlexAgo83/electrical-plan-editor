import type { ChangeEvent, ReactElement, RefObject } from "react";
import type { NetworkImportSummary } from "../../../adapters/portability";
import { ImportOverwriteDialog } from "../dialogs/ImportOverwriteDialog";
import type { NetworkId } from "../../../core/entities";
import type { ThemeMode } from "../../../store";
import { THEME_MODE_OPTIONS } from "../../lib/themeModes";
import { getAiProviderLabel, type AiProviderId } from "../../lib/aiSettings";
import type { AiSettingsModel } from "../../hooks/useAiSettings";
import type {
  AppLocale,
  CanvasCalloutTextSize,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasResizeBehaviorMode,
  CanvasLabelStrokeMode,
  ConnectorDrawingDisplayMode,
  NetworkCalloutContentMode,
  SortDirection,
  SortField,
  TableDensity,
  TableFontSize,
  TabularExportFormat,
  WorkspaceCurrencyCode,
  WorkspacePanelsLayoutMode
} from "../../types/app-controller";
import type { ImportExportStatus } from "../../types/app-controller";

interface SettingsWorkspaceContentProps {
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
  locale: AppLocale;
  setLocale: (value: AppLocale) => void;
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
  tabularExportFormat: TabularExportFormat;
  setTabularExportFormat: (value: TabularExportFormat) => void;
  bomExportCompactColumns: boolean;
  setBomExportCompactColumns: (value: boolean) => void;
  bomTraceabilityLabelsHidden: boolean;
  setBomTraceabilityLabelsHidden: (value: boolean) => void;
  defaultWireSectionMm2: number;
  setDefaultWireSectionMm2: (value: number) => void;
  defaultAutoCreateLinkedNodes: boolean;
  setDefaultAutoCreateLinkedNodes: (value: boolean) => void;
  spliceSectionImbalanceRatioPercent: number;
  setSpliceSectionImbalanceRatioPercent: (value: number) => void;
  defaultSortField: SortField;
  setDefaultSortField: (value: SortField) => void;
  defaultSortDirection: SortDirection;
  setDefaultSortDirection: (value: SortDirection) => void;
  defaultIdSortDirection: SortDirection;
  setDefaultIdSortDirection: (value: SortDirection) => void;
  canvasDefaultShowGrid: boolean;
  setCanvasDefaultShowGrid: (value: boolean) => void;
  canvasDefaultSnapToGrid: boolean;
  setCanvasDefaultSnapToGrid: (value: boolean) => void;
  canvasDefaultLockEntityMovement: boolean;
  setCanvasDefaultLockEntityMovement: (value: boolean) => void;
  canvasDefaultShowInfoPanels: boolean;
  setCanvasDefaultShowInfoPanels: (value: boolean) => void;
  showSegmentNames: boolean;
  setShowSegmentNames: (value: boolean) => void;
  canvasDefaultShowSegmentLengths: boolean;
  setCanvasDefaultShowSegmentLengths: (value: boolean) => void;
  canvasDefaultShowCableCallouts: boolean;
  setCanvasDefaultShowCableCallouts: (value: boolean) => void;
  canvasDefaultCalloutContentMode: NetworkCalloutContentMode;
  setCanvasDefaultCalloutContentMode: (value: NetworkCalloutContentMode) => void;
  setNetworkCalloutContentMode: (value: NetworkCalloutContentMode) => void;
  canvasDefaultShowSelectedCalloutOnly: boolean;
  setCanvasDefaultShowSelectedCalloutOnly: (value: boolean) => void;
  setShowSelectedCalloutOnly: (value: boolean) => void;
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
  canvasShowCalloutWireNames: boolean;
  setCanvasShowCalloutWireNames: (value: boolean) => void;
  canvasConnectorDrawingDisplayMode: ConnectorDrawingDisplayMode;
  setCanvasConnectorDrawingDisplayMode: (value: ConnectorDrawingDisplayMode) => void;
  canvasCalloutConnectorDrawingScalePercent: number;
  setCanvasCalloutConnectorDrawingScalePercent: (value: number) => void;
  canvasGlobalRenderScalePercent: number;
  setCanvasGlobalRenderScalePercent: (value: number) => void;
  canvasZoomInvariantNodeShapes: boolean;
  setCanvasZoomInvariantNodeShapes: (value: boolean) => void;
  canvasNodeShapeSizePercent: number;
  setCanvasNodeShapeSizePercent: (value: number) => void;
  canvasPngExportIncludeBackground: boolean;
  setCanvasPngExportIncludeBackground: (value: boolean) => void;
  canvasExportIncludeFrame: boolean;
  setCanvasExportIncludeFrame: (value: boolean) => void;
  canvasExportIncludeCartouche: boolean;
  setCanvasExportIncludeCartouche: (value: boolean) => void;
  canvasResetZoomPercentInput: string;
  setCanvasResetZoomPercentInput: (value: string) => void;
  canvasResizeBehaviorMode: CanvasResizeBehaviorMode;
  setCanvasResizeBehaviorMode: (value: CanvasResizeBehaviorMode) => void;
  configuredResetZoomPercent: number;
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  showShortcutHints: boolean;
  setShowShortcutHints: (value: boolean) => void;
  keyboardShortcutsEnabled: boolean;
  setKeyboardShortcutsEnabled: (value: boolean) => void;
  restoreViewportOnUndo: boolean;
  setRestoreViewportOnUndo: (value: boolean) => void;
  showFloatingInspectorPanel: boolean;
  setShowFloatingInspectorPanel: (value: boolean) => void;
  showRoutePreviewPanel: boolean;
  setShowRoutePreviewPanel: (value: boolean) => void;
  hideWireAnalysisRoutePanel: boolean;
  setHideWireAnalysisRoutePanel: (value: boolean) => void;
  workspacePanelsLayoutMode: WorkspacePanelsLayoutMode;
  setWorkspacePanelsLayoutMode: (value: WorkspacePanelsLayoutMode) => void;
  workspaceWideScreen: boolean;
  setWorkspaceWideScreen: (value: boolean) => void;
  resetWorkspacePreferencesToDefaults: () => void;
  importOverwriteDialog?: import("../../hooks/useNetworkImportExport").ImportOverwriteDialogModel | null;
  handleExportGroupedBom?: (networkIds: NetworkId[]) => void;
  handleExportGroupedSvg?: (networkIds: NetworkId[]) => void;
  aiSettings: AiSettingsModel;
}

export function SettingsWorkspaceContent({
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
  lastImportSummary,
  locale,
  setLocale,
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
  tabularExportFormat,
  setTabularExportFormat,
  bomExportCompactColumns,
  setBomExportCompactColumns,
  bomTraceabilityLabelsHidden,
  setBomTraceabilityLabelsHidden,
  defaultWireSectionMm2,
  setDefaultWireSectionMm2,
  defaultAutoCreateLinkedNodes,
  setDefaultAutoCreateLinkedNodes,
  spliceSectionImbalanceRatioPercent,
  setSpliceSectionImbalanceRatioPercent,
  defaultSortField,
  setDefaultSortField,
  defaultSortDirection,
  setDefaultSortDirection,
  defaultIdSortDirection,
  setDefaultIdSortDirection,
  canvasDefaultShowGrid,
  setCanvasDefaultShowGrid,
  canvasDefaultSnapToGrid,
  setCanvasDefaultSnapToGrid,
  canvasDefaultLockEntityMovement,
  setCanvasDefaultLockEntityMovement,
  canvasDefaultShowInfoPanels,
  setCanvasDefaultShowInfoPanels,
  showSegmentNames,
  setShowSegmentNames,
  canvasDefaultShowSegmentLengths,
  setCanvasDefaultShowSegmentLengths,
  canvasDefaultShowCableCallouts,
  setCanvasDefaultShowCableCallouts,
  setCanvasDefaultCalloutContentMode,
  setNetworkCalloutContentMode,
  canvasDefaultShowSelectedCalloutOnly,
  setCanvasDefaultShowSelectedCalloutOnly,
  setShowSelectedCalloutOnly,
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
  canvasShowCalloutWireNames,
  setCanvasShowCalloutWireNames,
  canvasConnectorDrawingDisplayMode,
  setCanvasConnectorDrawingDisplayMode,
  canvasCalloutConnectorDrawingScalePercent,
  setCanvasCalloutConnectorDrawingScalePercent,
  canvasGlobalRenderScalePercent,
  setCanvasGlobalRenderScalePercent,
  canvasZoomInvariantNodeShapes,
  setCanvasZoomInvariantNodeShapes,
  canvasNodeShapeSizePercent,
  setCanvasNodeShapeSizePercent,
  canvasPngExportIncludeBackground,
  setCanvasPngExportIncludeBackground,
  canvasExportIncludeFrame,
  setCanvasExportIncludeFrame,
  canvasExportIncludeCartouche,
  setCanvasExportIncludeCartouche,
  canvasResetZoomPercentInput,
  setCanvasResetZoomPercentInput,
  canvasResizeBehaviorMode,
  setCanvasResizeBehaviorMode,
  handleZoomAction,
  showShortcutHints,
  setShowShortcutHints,
  keyboardShortcutsEnabled,
  setKeyboardShortcutsEnabled,
  restoreViewportOnUndo,
  setRestoreViewportOnUndo,
  showFloatingInspectorPanel,
  setShowFloatingInspectorPanel,
  showRoutePreviewPanel,
  setShowRoutePreviewPanel,
  hideWireAnalysisRoutePanel,
  setHideWireAnalysisRoutePanel,
  workspacePanelsLayoutMode,
  setWorkspacePanelsLayoutMode,
  workspaceWideScreen,
  setWorkspaceWideScreen,
  resetWorkspacePreferencesToDefaults,
  importOverwriteDialog = null,
  handleExportGroupedBom,
  handleExportGroupedSvg,
  aiSettings
}: SettingsWorkspaceContentProps): ReactElement {
  const activeAiProviderConfig = aiSettings.settings.providers[aiSettings.settings.provider];
  return (
    <section className="panel-grid settings-panel-grid">
      <section className="panel settings-panel" data-onboarding-panel="settings-ai-provider">
        <header className="settings-panel-header">
          <h2>AI provider</h2>
          <span className="settings-panel-chip">AI</span>
        </header>
        <p className="settings-panel-intro">
          Configure the local provider used by the Modeling AI Agent. API keys are stored locally in this browser.
        </p>
        <div className="settings-state-row" aria-label="AI provider status">
          <span className={aiSettings.readiness.isReady ? "settings-state-chip is-ok" : "settings-state-chip is-warn"}>
            {aiSettings.readiness.isReady ? "Ready" : "Not ready"}
          </span>
          <span className="settings-state-chip">{aiSettings.readiness.message}</span>
        </div>
        <div className="settings-grid">
          <label className="settings-field">
            Provider
            <select
              value={aiSettings.settings.provider}
              onChange={(event) => aiSettings.setProvider(event.target.value as AiProviderId)}
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
            </select>
          </label>
          <label className="settings-field">
            Model
            <input
              type="text"
              value={activeAiProviderConfig.model}
              onChange={(event) => aiSettings.updateProviderConfig(aiSettings.settings.provider, { model: event.target.value })}
              placeholder={aiSettings.settings.provider === "openai" ? "gpt-4.1-mini" : "gemini-2.0-flash"}
            />
          </label>
          <label className="settings-field">
            API key
            <input
              type="password"
              value={activeAiProviderConfig.apiKey}
              onChange={(event) => aiSettings.updateProviderConfig(aiSettings.settings.provider, { apiKey: event.target.value })}
              placeholder={`${getAiProviderLabel(aiSettings.settings.provider)} API key`}
              autoComplete="off"
            />
          </label>
          <label className="settings-field">
            Endpoint
            <input
              type="url"
              value={activeAiProviderConfig.endpoint}
              onChange={(event) => aiSettings.updateProviderConfig(aiSettings.settings.provider, { endpoint: event.target.value })}
            />
          </label>
          <label className="settings-field">
            Timeout (ms)
            <input
              type="number"
              min={5000}
              max={120000}
              step={1000}
              value={String(aiSettings.settings.timeoutMs)}
              onChange={(event) => {
                const parsed = Number(event.target.value);
                if (!Number.isFinite(parsed)) {
                  return;
                }
                aiSettings.setTimeoutMs(Math.min(120000, Math.max(5000, Math.round(parsed))));
              }}
            />
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={aiSettings.settings.strictMode}
              onChange={(event) => aiSettings.setStrictMode(event.target.checked)}
            />
            Strict structured output mode
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={aiSettings.settings.experimentalDirectExecutionEnabled}
              onChange={(event) => aiSettings.setExperimentalDirectExecutionEnabled(event.target.checked)}
            />
            Enable experimental direct execution
          </label>
        </div>
        <div className="row-actions settings-actions">
          <button type="button" disabled>
            Test connection
          </button>
        </div>
        <p className="meta-line">
          Connection testing and live provider calls are intentionally disabled until the operation contract is wired.
        </p>
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
              <option value="none">None</option>
              <option value="light">Light</option>
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
            Connector drawing display
            <select
              value={canvasConnectorDrawingDisplayMode}
              onChange={(event) => {
                const nextMode = event.target.value as ConnectorDrawingDisplayMode;
                const nextCalloutMode: NetworkCalloutContentMode = nextMode === "callouts" ? "both" : "wireDetails";
                setCanvasConnectorDrawingDisplayMode(nextMode);
                setCanvasDefaultCalloutContentMode(nextCalloutMode);
                setNetworkCalloutContentMode(nextCalloutMode);
              }}
            >
              <option value="disabled">Disabled</option>
              <option value="callouts">Callouts</option>
              <option value="nodes">Nodes</option>
            </select>
          </label>
          <label className="settings-field settings-range-field">
            Connector drawing size (%)
            <div className="settings-range-control">
              <input
                className="settings-range-input"
                type="range"
                min={100}
                max={200}
                step={5}
                value={canvasCalloutConnectorDrawingScalePercent}
                disabled={canvasConnectorDrawingDisplayMode === "disabled"}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  if (!Number.isFinite(parsed)) {
                    return;
                  }
                  setCanvasCalloutConnectorDrawingScalePercent(Math.min(200, Math.max(100, Math.round(parsed))));
                }}
              />
              <span className="settings-range-value">{canvasCalloutConnectorDrawingScalePercent}%</span>
            </div>
          </label>
          <label className="settings-field settings-range-field">
            Summary global scale (%)
            <div className="settings-range-control">
              <input
                className="settings-range-input"
                type="range"
                min={0}
                max={300}
                step={5}
                value={canvasGlobalRenderScalePercent}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  if (!Number.isFinite(parsed)) {
                    return;
                  }
                  setCanvasGlobalRenderScalePercent(Math.min(300, Math.max(0, Math.round(parsed))));
                }}
              />
              <span className="settings-range-value">{canvasGlobalRenderScalePercent}%</span>
            </div>
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
            2D label rotation
            <select
              value={String(canvasDefaultLabelRotationDegrees)}
              disabled={canvasDefaultAutoSegmentLabelRotation}
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
            Reset zoom target (%)
            <input type="number" value={canvasResetZoomPercentInput} onChange={(event) => setCanvasResetZoomPercentInput(event.target.value)} />
          </label>
          <label className="settings-field">
            Viewport resize behavior
            <select
              value={canvasResizeBehaviorMode}
              disabled
              onChange={(event) => setCanvasResizeBehaviorMode(event.target.value as CanvasResizeBehaviorMode)}
            >
              <option value="visibleAreaOnly">Resize changes visible area only</option>
            </select>
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
              checked={showSegmentNames}
              onChange={(event) => setShowSegmentNames(event.target.checked)}
            />
            Show segment names
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
              checked={canvasDefaultShowSelectedCalloutOnly}
              onChange={(event) => {
                const { checked } = event.target;
                setCanvasDefaultShowSelectedCalloutOnly(checked);
                setShowSelectedCalloutOnly(checked);
              }}
            />
            Show only selected connector/splice callout
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasShowCalloutWireNames}
              onChange={(event) => setCanvasShowCalloutWireNames(event.target.checked)}
            />
            Show wire names in callout table
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasZoomInvariantNodeShapes}
              onChange={(event) => setCanvasZoomInvariantNodeShapes(event.target.checked)}
            />
            Keep connector/splice/node shape size constant while zooming
          </label>
          <label className="settings-field settings-range-field">
            Node shape target size (%)
            <div className="settings-range-control">
              <input
                className="settings-range-input"
                type="range"
                min={50}
                max={125}
                step={5}
                value={canvasNodeShapeSizePercent}
                disabled={!canvasZoomInvariantNodeShapes}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  if (!Number.isFinite(parsed)) {
                    return;
                  }
                  setCanvasNodeShapeSizePercent(Math.min(125, Math.max(50, Math.round(parsed))));
                }}
              />
              <span className="settings-range-value">{canvasNodeShapeSizePercent}%</span>
            </div>
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasPngExportIncludeBackground}
              onChange={(event) => setCanvasPngExportIncludeBackground(event.target.checked)}
            />
            Include background in PNG export
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasExportIncludeFrame}
              onChange={(event) => setCanvasExportIncludeFrame(event.target.checked)}
            />
            Include frame in SVG/PNG export
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasExportIncludeCartouche}
              onChange={(event) => setCanvasExportIncludeCartouche(event.target.checked)}
            />
            Include identity cartouche in SVG/PNG export
          </label>
        </div>
      </section>

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
              {THEME_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
      </section>

      <section className="panel settings-panel" data-onboarding-panel="settings-global-preferences">
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
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={showRoutePreviewPanel}
              onChange={(event) => setShowRoutePreviewPanel(event.target.checked)}
            />
            Show route preview panel
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={hideWireAnalysisRoutePanel}
              onChange={(event) => setHideWireAnalysisRoutePanel(event.target.checked)}
            />
            Hide Wire analysis auto route panel
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
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={workspaceWideScreen}
              onChange={(event) => setWorkspaceWideScreen(event.target.checked)}
            />
            Wide screen (remove app max width cap)
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
          <label className="settings-field">
            Directional splice imbalance limit (%)
            <input
              type="number"
              min={100}
              step={10}
              value={String(spliceSectionImbalanceRatioPercent)}
              onChange={(event) => {
                const nextValue = Number(event.target.value.replace(",", "."));
                if (!Number.isFinite(nextValue) || nextValue < 100) {
                  return;
                }
                setSpliceSectionImbalanceRatioPercent(Math.round(nextValue));
              }}
            />
          </label>
          <label className="settings-field settings-locale-field">
            <span className="settings-locale-label">
              <span className="action-button-icon is-settings settings-locale-icon" aria-hidden="true" />
              <span>Language</span>
            </span>
            <select
              className="settings-locale-select"
              aria-label="Language"
              value={locale}
              onChange={(event) => setLocale(event.target.value as AppLocale)}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
            <span className="settings-locale-hint">Apply language across all app screens (except changelog).</span>
          </label>
        </div>
        <div className="row-actions settings-actions">
          <button type="button" className="settings-primary-action" onClick={resetWorkspacePreferencesToDefaults}>Reset all UI preferences</button>
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
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={restoreViewportOnUndo}
              onChange={(event) => setRestoreViewportOnUndo(event.target.checked)}
            />
            Restore network viewport on undo/redo
          </label>
        </div>
        <ul className="settings-shortcut-list">
          <li><span className="technical-id settings-shortcut-key">Ctrl/Cmd + Z</span> <span>Undo last modeling action</span></li>
          <li><span className="technical-id settings-shortcut-key">Ctrl/Cmd + Shift + Z</span> <span>Redo</span></li>
          <li><span className="technical-id settings-shortcut-key">Ctrl/Cmd + Y</span> <span>Redo (alternative shortcut)</span></li>
          <li><span className="technical-id settings-shortcut-key">Ctrl/Cmd + S</span> <span>Save active plan (export JSON)</span></li>
          <li><span className="technical-id settings-shortcut-key">Alt + 1..7</span> <span>Switch top-level workspace</span></li>
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
            Tabular export format
            <select value={tabularExportFormat} onChange={(event) => setTabularExportFormat(event.target.value as TabularExportFormat)}>
              <option value="csv">CSV</option>
              <option value="xlsx">XLSX</option>
            </select>
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={bomExportCompactColumns}
              onChange={(event) => setBomExportCompactColumns(event.target.checked)}
            />
            Compact BOM export columns
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={bomTraceabilityLabelsHidden}
              onChange={(event) => setBomTraceabilityLabelsHidden(event.target.checked)}
            />
            Hide BOM traceability labels
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

      <section className="panel settings-panel settings-panel--import-export">
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
        <div className="settings-import-export-grid">
          <div className="settings-import-export-actions-column">
            <div className="row-actions settings-actions">
              <button type="button" onClick={() => handleExportNetworks("active")} disabled={activeNetworkId === null}>Export active</button>
              <button type="button" onClick={() => handleExportNetworks("selected")} disabled={selectedExportNetworkIds.length === 0}>Export selected</button>
              <button type="button" onClick={() => handleExportNetworks("all")} disabled={networks.length === 0}>Export all</button>
            </div>
            <div className="row-actions settings-actions">
              <button
                type="button"
                onClick={() => handleExportGroupedBom?.(selectedExportNetworkIds)}
                disabled={selectedExportNetworkIds.length === 0 || handleExportGroupedBom === undefined}
              >
                Export grouped BOM (XLSX)
              </button>
              <button
                type="button"
                onClick={() => handleExportGroupedSvg?.(selectedExportNetworkIds)}
                disabled={selectedExportNetworkIds.length === 0 || handleExportGroupedSvg === undefined}
              >
                Export grouped SVG
              </button>
            </div>
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
              {importOverwriteDialog !== null ? (
                <ImportOverwriteDialog
                  isOpen
                  candidates={importOverwriteDialog.candidates}
                  onConfirm={importOverwriteDialog.onConfirm}
                  onCancel={importOverwriteDialog.onCancel}
                />
              ) : null}
            </div>
          </div>
          <fieldset className="inline-fieldset settings-export-fieldset settings-import-export-selection-column">
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
        </div>
        {importExportStatus !== null ? <p className={`meta-line import-status is-${importExportStatus.kind}`}>{importExportStatus.message}</p> : null}
        {lastImportSummary !== null ? (
          <>
            <div className="settings-import-summary">
              <p className="meta-line"><span>Imported</span> <strong>{lastImportSummary.importedNetworkIds.length}</strong></p>
              <p className="meta-line"><span>Skipped</span> <strong>{lastImportSummary.skippedNetworkIds.length}</strong></p>
              <p className="meta-line"><span>Warnings</span> <strong>{lastImportSummary.warnings.length}</strong></p>
              <p className="meta-line"><span>Errors</span> <strong>{lastImportSummary.errors.length}</strong></p>
            </div>
            {lastImportSummary.warnings.length > 0 ? (
              <div className="settings-import-details is-warning" role="status" aria-label="Import warning details">
                <h3>Warning details</h3>
                <ul>
                  {lastImportSummary.warnings.map((warning, index) => (
                    <li key={`${index}-${warning}`}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {lastImportSummary.errors.length > 0 ? (
              <div className="settings-import-details is-error" role="alert" aria-label="Import error details">
                <h3>Error details</h3>
                <ul>
                  {lastImportSummary.errors.map((error, index) => (
                    <li key={`${index}-${error}`}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : null}
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
          <button type="button" onClick={handleResetSampleNetwork} disabled={!hasBuiltInSampleState}>
            Reset sample network to baseline
          </button>
        </div>
      </section>
    </section>
  );
}
