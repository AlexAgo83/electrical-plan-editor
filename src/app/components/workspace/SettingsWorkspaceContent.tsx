import { useEffect, useRef, useState, type ChangeEvent, type ReactElement, type ReactNode, type RefObject } from "react";
import type { NetworkImportSummary } from "../../../adapters/portability";
import { ImportOverwriteDialog } from "../dialogs/ImportOverwriteDialog";
import { SettingsSearchControl } from "../settings/SettingsSearchControl";
import { useSettingsSearchDock } from "../settings/SettingsSearchDock";
import type { NetworkId } from "../../../core/entities";
import type { ThemeMode } from "../../../store";
import { THEME_MODE_OPTIONS } from "../../lib/themeModes";
import { getAiProviderLabel, type AiProviderId } from "../../lib/aiSettings";
import type { AiSettingsModel } from "../../hooks/useAiSettings";
import type { WorkspaceFileStorageStatus } from "../../hooks/useWorkspaceFileStorage";
import { SettingsLabelText } from "../settings/SettingsLabelText";
import { SETTINGS_SECTIONS, normalizeSettingsSearch, sectionMatches } from "../settings/settingsSearchModel";
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
  workspaceFileStatus: WorkspaceFileStorageStatus;
  openWorkspaceFile: () => void;
  relinkWorkspaceFile: () => void;
  resumeWorkspaceFile: () => void;
  saveWorkspaceFileNow: () => void;
  saveWorkspaceFileAs: () => void;
  unlinkWorkspaceFile: () => void;
  openLinkedWorkspaceFile: () => void;
  openResumableWorkspaceFile: () => void;
  loadLinkedFileVersion: () => void;
  keepLocalWorkspaceVersion: () => void;
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
  aiSettings,
  workspaceFileStatus,
  openWorkspaceFile,
  relinkWorkspaceFile,
  resumeWorkspaceFile,
  saveWorkspaceFileNow,
  saveWorkspaceFileAs,
  unlinkWorkspaceFile,
  openLinkedWorkspaceFile,
  openResumableWorkspaceFile,
  loadLinkedFileVersion,
  keepLocalWorkspaceVersion
}: SettingsWorkspaceContentProps): ReactElement {
  const activeAiProviderConfig = aiSettings.settings.providers[aiSettings.settings.provider];
  const { settingsSearchQuery, setSettingsSearchQuery } = useSettingsSearchDock();
  const normalizedSettingsSearch = normalizeSettingsSearch(settingsSearchQuery);
  const matchedSectionCounts = SETTINGS_SECTIONS.map((section) => ({
    id: section.id,
    count: sectionMatches(section, normalizedSettingsSearch)
  }));
  const totalMatchCount = matchedSectionCounts.reduce((total, section) => total + section.count, 0);
  const hasSearchQuery = normalizedSettingsSearch.length > 0;
  const contentRef = useRef<HTMLElement | null>(null);
  const sectionVisibilityRatiosRef = useRef<Map<string, number>>(new Map());
  const [activeSettingsSectionId, setActiveSettingsSectionId] = useState("settings-canvas-render");
  const relinkWorkspaceLabel = workspaceFileStatus.mode === "linked" || workspaceFileStatus.resumeFileName !== null ? "Relink" : "Link";
  const relinkWorkspaceAriaLabel =
    relinkWorkspaceLabel === "Relink" ? "Relink workspace file" : "Link workspace file";
  const workspaceStorageStatusTone = workspaceFileStatus.conflict
    ? "is-warn"
    : workspaceFileStatus.mode === "linked" && workspaceFileStatus.fileAvailability !== "unavailable"
      ? "is-ok"
      : "";
  const workspaceStorageTitle = workspaceFileStatus.conflict
    ? "Action needed: linked file changed"
    : workspaceFileStatus.mode === "linked"
      ? `Linked to ${workspaceFileStatus.fileName ?? "a workspace file"}`
      : workspaceFileStatus.resumeFileName !== null
        ? "Saved locally, with a resumable file"
        : "Saved in this browser only";
  const workspaceStorageDescription = workspaceFileStatus.conflict
    ? "The linked file was edited outside this tab. Pick the version to keep before autosave continues."
    : workspaceFileStatus.mode === "linked"
      ? "Changes autosave to the linked file while the browser keeps file permission. Local browser storage remains a fallback."
      : workspaceFileStatus.resumeFileName !== null
        ? "Your work is safe in this browser. You can resume the last file link or save a fresh portable copy."
        : "Your work is safe in this browser. Save a workspace file when you want a portable copy or cloud-folder sync.";
  const workspaceStoragePrimaryAction = workspaceFileStatus.conflict
    ? {
        label: "Resolve conflict",
        ariaLabel: "Resolve workspace file conflict",
        title: "Review the linked file conflict options",
        onClick: loadLinkedFileVersion,
        disabled: false,
        iconClassName: "action-button-icon is-open"
      }
    : workspaceFileStatus.mode === "linked"
      ? workspaceFileStatus.permission === "denied" || workspaceFileStatus.fileAvailability === "unavailable"
        ? {
            label: "Restore file access",
            ariaLabel: relinkWorkspaceAriaLabel,
            title: "Choose the workspace file again to restore browser permission",
            onClick: relinkWorkspaceFile,
            disabled: false,
            iconClassName: "action-button-icon is-swap"
          }
        : {
            label: workspaceFileStatus.isSaving ? "Saving..." : "Save now",
            ariaLabel: "Save workspace file now",
            title: "Save the current workspace to the linked file now",
            onClick: saveWorkspaceFileNow,
            disabled: workspaceFileStatus.isSaving,
            iconClassName: "action-button-icon is-save"
          }
      : workspaceFileStatus.canResume
        ? {
            label: "Resume last file",
            ariaLabel: "Resume workspace file",
            title: "Resume the last workspace file remembered by this browser",
            onClick: resumeWorkspaceFile,
            disabled: false,
            iconClassName: "action-button-icon is-redo"
          }
        : {
            label: "Save as file",
            ariaLabel: "Save workspace file as",
            title: "Save a new workspace file copy",
            onClick: saveWorkspaceFileAs,
            disabled: false,
            iconClassName: "action-button-icon is-save"
          };
  const renderSettingLabel = (text: string): ReactNode => (
    <SettingsLabelText text={text} normalizedQuery={normalizedSettingsSearch} />
  );
  const formatWorkspaceSavedAt = (iso: string | null): string => {
    if (iso === null) {
      return "Not saved to a workspace file yet";
    }

    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  };
  const scrollToSettingsSection = (sectionId: string): void => {
    setActiveSettingsSectionId(sectionId);
    const sectionElement = contentRef.current?.querySelector<HTMLElement>(`#${sectionId}`);
    sectionElement?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement === null || typeof IntersectionObserver === "undefined") {
      return;
    }

    const sectionElements = SETTINGS_SECTIONS.map((section) => contentElement.querySelector<HTMLElement>(`#${section.id}`)).filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          sectionVisibilityRatiosRef.current.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        const [nextActiveSectionId] = [...sectionVisibilityRatiosRef.current.entries()].reduce<[string, number]>(
          (best, entry) => (entry[1] > best[1] ? entry : best),
          [activeSettingsSectionId, 0]
        );

        if (nextActiveSectionId !== activeSettingsSectionId) {
          setActiveSettingsSectionId(nextActiveSectionId);
        }
      },
      {
        root: null,
        rootMargin: "-96px 0px -55% 0px",
        threshold: [0, 0.2, 0.5, 0.8]
      }
    );

    for (const sectionElement of sectionElements) {
      sectionVisibilityRatiosRef.current.set(sectionElement.id, 0);
      observer.observe(sectionElement);
    }

    return () => observer.disconnect();
  }, [activeSettingsSectionId]);

  return (
    <section className="settings-workspace" aria-label="Settings workspace">
      <div className="settings-search-toolbar">
        <SettingsSearchControl />
        {hasSearchQuery ? (
          <div className={totalMatchCount > 0 ? "settings-search-summary" : "settings-search-summary is-empty"} role="status">
            {totalMatchCount > 0 ? `${totalMatchCount} matching setting label${totalMatchCount === 1 ? "" : "s"}` : "No setting label matches this search."}
            <button type="button" onClick={() => setSettingsSearchQuery("")}>Clear</button>
          </div>
        ) : null}
      </div>
      <div className="settings-sectioned-layout">
        <nav className="panel settings-panel settings-section-nav" aria-label="Settings sections">
          <p className="settings-section-nav-title">Sections</p>
          {SETTINGS_SECTIONS.map((section) => {
            const matchCount = matchedSectionCounts.find((entry) => entry.id === section.id)?.count ?? 0;
            const sectionButtonClassName = [
              "settings-section-nav-button",
              section.id === activeSettingsSectionId ? "is-active" : "",
              hasSearchQuery && matchCount === 0 ? "is-dimmed" : ""
            ].filter(Boolean).join(" ");
            return (
              <button
                key={section.id}
                type="button"
                className={sectionButtonClassName}
                aria-current={section.id === activeSettingsSectionId ? "location" : undefined}
                onClick={() => scrollToSettingsSection(section.id)}
              >
                <span>{section.title}</span>
                {hasSearchQuery ? <span className="settings-section-match-count">{matchCount}</span> : null}
              </button>
            );
          })}
        </nav>
        <section ref={contentRef} className="panel settings-panel panel-grid settings-panel-grid settings-section-list" aria-label="Settings sections list">
      <section id="settings-workspace-storage" className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Workspace storage</h2>
          <span className="settings-panel-chip">Storage</span>
        </header>
        <p className="settings-panel-intro">
          Choose where this workspace lives. The browser always keeps a local fallback; file actions are for portable copies and cloud-folder sync.
        </p>
        <div className={`settings-storage-current ${workspaceStorageStatusTone}`} aria-label="Workspace storage status">
          <div className="settings-storage-current-copy">
            <span className="settings-storage-current-kicker">Current save location</span>
            <strong>{workspaceStorageTitle}</strong>
            <p>{workspaceStorageDescription}</p>
          </div>
          <div className="row-actions settings-storage-primary-action-row">
            <button
              type="button"
              className="button-with-icon settings-storage-primary-action"
              onClick={workspaceStoragePrimaryAction.onClick}
              disabled={workspaceStoragePrimaryAction.disabled}
              aria-label={workspaceStoragePrimaryAction.ariaLabel}
              title={workspaceStoragePrimaryAction.title}
            >
              <span className={workspaceStoragePrimaryAction.iconClassName} aria-hidden="true" />
              {renderSettingLabel(workspaceStoragePrimaryAction.label)}
            </button>
          </div>
        </div>
        {workspaceFileStatus.message !== null ? <p className="meta-line settings-storage-message">{workspaceFileStatus.message}</p> : null}
        <div className="row-actions settings-actions settings-storage-secondary-actions" aria-label="More workspace file actions">
          <button
            type="button"
            className="button-with-icon"
            onClick={openWorkspaceFile}
            aria-label="Open workspace file"
            title="Open a workspace file and replace the current workspace"
          >
            <span className="action-button-icon is-open" aria-hidden="true" />
            {renderSettingLabel("Open workspace file")}
          </button>
          {workspaceStoragePrimaryAction.ariaLabel !== "Save workspace file as" ? (
            <button
              type="button"
              className="button-with-icon"
              onClick={saveWorkspaceFileAs}
              aria-label="Save workspace file as"
              title="Save a new workspace file copy"
            >
              <span className="action-button-icon is-save" aria-hidden="true" />
              {renderSettingLabel("Save as copy")}
            </button>
          ) : null}
          {workspaceFileStatus.canResume && workspaceFileStatus.mode !== "linked" && workspaceStoragePrimaryAction.ariaLabel !== "Resume workspace file" ? (
            <button
              type="button"
              className="button-with-icon"
              onClick={resumeWorkspaceFile}
              aria-label="Resume workspace file"
              title="Resume the last workspace file remembered by this browser"
            >
              <span className="action-button-icon is-redo" aria-hidden="true" />
              {renderSettingLabel("Resume last file")}
            </button>
          ) : null}
          <button
            type="button"
            className="button-with-icon"
            onClick={relinkWorkspaceFile}
            aria-label="Use a file for autosave"
            title={`${relinkWorkspaceLabel} a workspace file for direct file autosave when supported`}
          >
            <span className="action-button-icon is-swap" aria-hidden="true" />
            {renderSettingLabel("Use a file for autosave")}
          </button>
          {workspaceFileStatus.mode === "linked" ? (
            <>
              <button
                type="button"
                className="button-with-icon"
                onClick={saveWorkspaceFileNow}
                disabled={workspaceFileStatus.isSaving}
                aria-label="Save workspace file now"
                title="Save the current workspace to the linked file now"
              >
                <span className="action-button-icon is-save" aria-hidden="true" />
                {renderSettingLabel("Save now")}
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={unlinkWorkspaceFile}
                aria-label="Unlink workspace file"
                title="Stop autosaving to the linked file and keep browser-local persistence"
              >
                <span className="action-button-icon is-swap" aria-hidden="true" />
                {renderSettingLabel("Stop autosave link")}
              </button>
            </>
          ) : null}
        </div>
        {workspaceFileStatus.conflict ? (
          <div className="settings-conflict-panel" role="alert">
            <p>The linked file changed outside this tab. Choose which workspace version to keep before autosave resumes.</p>
            <div className="row-actions settings-actions">
              <button type="button" onClick={loadLinkedFileVersion}>{renderSettingLabel("Load file version")}</button>
              <button type="button" onClick={keepLocalWorkspaceVersion}>{renderSettingLabel("Keep local version")}</button>
              <button type="button" onClick={saveWorkspaceFileAs}>{renderSettingLabel("Save local copy")}</button>
            </div>
          </div>
        ) : null}
        <details className="settings-storage-technical-details">
          <summary>Storage details</summary>
          <div className="settings-state-row" aria-label="Workspace technical storage status">
            <span className={workspaceFileStatus.conflict ? "settings-state-chip is-warn" : "settings-state-chip is-ok"}>
              {workspaceFileStatus.label}
            </span>
            <span className="settings-state-chip">
              {workspaceFileStatus.mode === "linked" ? "Linked file" : "Local only"}
            </span>
            <span className="settings-state-chip">
              Permission: {workspaceFileStatus.permission}
            </span>
            <span className="settings-state-chip">
              {workspaceFileStatus.directFileAccessSupported ? "Direct file access" : "Fallback download"}
            </span>
            <span className={workspaceFileStatus.fileAvailability === "unavailable" ? "settings-state-chip is-warn" : "settings-state-chip"}>
              File: {workspaceFileStatus.fileAvailability === "available" ? "Available" : workspaceFileStatus.fileAvailability === "unavailable" ? "Unavailable" : "Unknown"}
            </span>
          </div>
          <dl className="settings-storage-details">
            <div>
              <dt>{renderSettingLabel("Persistence mode")}</dt>
              <dd>{workspaceFileStatus.mode === "linked" ? "Linked file with local cache" : "Local browser storage only"}</dd>
            </div>
            <div>
              <dt>Autosave target</dt>
              <dd>{workspaceFileStatus.saveTarget === "linked-file" ? "Linked workspace file" : workspaceFileStatus.saveTarget === "download" ? "Downloaded workspace copy" : "Local browser cache"}</dd>
            </div>
            <div>
              <dt>{renderSettingLabel("Linked file")}</dt>
              <dd>
                {workspaceFileStatus.fileName === null ? (
                  "None"
                ) : (
                  <button
                    type="button"
                    className="settings-storage-file-link"
                    onClick={openLinkedWorkspaceFile}
                    disabled={workspaceFileStatus.mode !== "linked"}
                    title="Open the linked workspace file in a new browser tab"
                  >
                    {workspaceFileStatus.fileName}
                  </button>
                )}
              </dd>
            </div>
            <div>
              <dt>Resumable file</dt>
              <dd>
                {workspaceFileStatus.resumeFileName === null ? (
                  "None"
                ) : (
                  <button
                    type="button"
                    className="settings-storage-file-link"
                    onClick={openResumableWorkspaceFile}
                    disabled={!workspaceFileStatus.canResume}
                    title="Open the resumable workspace file in a new browser tab"
                  >
                    {workspaceFileStatus.resumeFileName}
                  </button>
                )}
              </dd>
            </div>
            <div>
              <dt>Resume status</dt>
              <dd>{workspaceFileStatus.resumeStatus === "available" ? "Resume available" : workspaceFileStatus.resumeStatus === "permission-required" ? "Permission required" : workspaceFileStatus.resumeStatus === "unavailable" ? "Resume unavailable" : "No resumable file"}</dd>
            </div>
            <div>
              <dt>Last saved</dt>
              <dd>{formatWorkspaceSavedAt(workspaceFileStatus.lastSavedAtIso)}</dd>
            </div>
          </dl>
        </details>
      </section>

      <section id="settings-ai-provider" className="panel settings-panel" data-onboarding-panel="settings-ai-provider">
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
            {renderSettingLabel("Provider")}
            <select
              value={aiSettings.settings.provider}
              onChange={(event) => aiSettings.setProvider(event.target.value as AiProviderId)}
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
            </select>
          </label>
          <label className="settings-field">
            {renderSettingLabel("Model")}
            <input
              type="text"
              value={activeAiProviderConfig.model}
              onChange={(event) => aiSettings.updateProviderConfig(aiSettings.settings.provider, { model: event.target.value })}
              placeholder={aiSettings.settings.provider === "openai" ? "gpt-4.1-mini" : "gemini-2.0-flash"}
            />
          </label>
          <label className="settings-field">
            {renderSettingLabel("API key")}
            <input
              type="password"
              value={activeAiProviderConfig.apiKey}
              onChange={(event) => aiSettings.updateProviderConfig(aiSettings.settings.provider, { apiKey: event.target.value })}
              placeholder={`${getAiProviderLabel(aiSettings.settings.provider)} API key`}
              autoComplete="off"
            />
          </label>
          <label className="settings-field">
            {renderSettingLabel("Endpoint")}
            <input
              type="url"
              value={activeAiProviderConfig.endpoint}
              onChange={(event) => aiSettings.updateProviderConfig(aiSettings.settings.provider, { endpoint: event.target.value })}
            />
          </label>
          <label className="settings-field">
            {renderSettingLabel("Timeout (ms)")}
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
            {renderSettingLabel("Strict structured output mode")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={aiSettings.settings.experimentalDirectExecutionEnabled}
              onChange={(event) => aiSettings.setExperimentalDirectExecutionEnabled(event.target.checked)}
            />
            {renderSettingLabel("Enable experimental direct execution")}
          </label>
        </div>
        <div className="row-actions settings-actions settings-ai-provider-actions">
          <button
            type="button"
            onClick={() => {
              void aiSettings.testConnection();
            }}
            disabled={!aiSettings.readiness.isReady || aiSettings.connectionTest.status === "testing"}
          >
            {renderSettingLabel("Test connection")}
          </button>
        </div>
        <p className="meta-line">{aiSettings.connectionTest.message}</p>
      </section>

      <section id="settings-canvas-render" className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Canvas render preferences</h2>
          <span className="settings-panel-chip">Canvas Render</span>
        </header>
        <p className="settings-panel-intro">Typography and rendering defaults used for labels, callouts, and view reset behavior.</p>
        <div className="settings-grid">
          <label className="settings-field">
            {renderSettingLabel("Label stroke mode")}
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
            {renderSettingLabel("2D label size")}
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
            {renderSettingLabel("Callout text size")}
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
            {renderSettingLabel("Connector drawing display")}
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
            {renderSettingLabel("Connector drawing size (%)")}
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
            {renderSettingLabel("Summary global scale (%)")}
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
            {renderSettingLabel("Auto segment label rotation")}
            <select
              value={canvasDefaultAutoSegmentLabelRotation ? "yes" : "no"}
              onChange={(event) => setCanvasDefaultAutoSegmentLabelRotation(event.target.value === "yes")}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="settings-field">
            {renderSettingLabel("2D label rotation")}
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
            {renderSettingLabel("Reset zoom target (%)")}
            <input type="number" value={canvasResetZoomPercentInput} onChange={(event) => setCanvasResetZoomPercentInput(event.target.value)} />
          </label>
          <label className="settings-field">
            {renderSettingLabel("Viewport resize behavior")}
            <select
              value={canvasResizeBehaviorMode}
              disabled
              onChange={(event) => setCanvasResizeBehaviorMode(event.target.value as CanvasResizeBehaviorMode)}
            >
              <option value="visibleAreaOnly">Resize changes visible area only</option>
            </select>
          </label>
        </div>
        <div className="row-actions settings-actions settings-canvas-render-actions">
          <button type="button" onClick={() => handleZoomAction("reset")}>Reset current view</button>
        </div>
      </section>

      <section id="settings-canvas-tools" className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Canvas tools preferences</h2>
          <span className="settings-panel-chip">Canvas Tools</span>
        </header>
        <p className="settings-panel-intro">Default tool behavior and overlay visibility for the 2D network workspace.</p>
        <div className="settings-grid">
          <label className="settings-checkbox">
            <input type="checkbox" checked={canvasDefaultShowGrid} onChange={(event) => setCanvasDefaultShowGrid(event.target.checked)} />
            {renderSettingLabel("Show grid by default")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasDefaultSnapToGrid}
              onChange={(event) => setCanvasDefaultSnapToGrid(event.target.checked)}
            />
            {renderSettingLabel("Snap node movement by default")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasDefaultLockEntityMovement}
              onChange={(event) => setCanvasDefaultLockEntityMovement(event.target.checked)}
            />
            {renderSettingLabel("Lock node movement by default")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasDefaultShowInfoPanels}
              onChange={(event) => setCanvasDefaultShowInfoPanels(event.target.checked)}
            />
            {renderSettingLabel("Show info overlays by default")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={showSegmentNames}
              onChange={(event) => setShowSegmentNames(event.target.checked)}
            />
            {renderSettingLabel("Show segment names")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasDefaultShowSegmentLengths}
              onChange={(event) => setCanvasDefaultShowSegmentLengths(event.target.checked)}
            />
            {renderSettingLabel("Show segment lengths by default")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasDefaultShowCableCallouts}
              onChange={(event) => setCanvasDefaultShowCableCallouts(event.target.checked)}
            />
            {renderSettingLabel("Show connector/splice cable callouts by default")}
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
            {renderSettingLabel("Show only selected connector/splice callout")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasShowCalloutWireNames}
              onChange={(event) => setCanvasShowCalloutWireNames(event.target.checked)}
            />
            {renderSettingLabel("Show wire names in callout table")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasZoomInvariantNodeShapes}
              onChange={(event) => setCanvasZoomInvariantNodeShapes(event.target.checked)}
            />
            {renderSettingLabel("Keep connector/splice/node shape size constant while zooming")}
          </label>
          <label className="settings-field settings-range-field">
            {renderSettingLabel("Node shape target size (%)")}
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
            {renderSettingLabel("Include background in PNG export")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasExportIncludeFrame}
              onChange={(event) => setCanvasExportIncludeFrame(event.target.checked)}
            />
            {renderSettingLabel("Include frame in SVG/PNG export")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={canvasExportIncludeCartouche}
              onChange={(event) => setCanvasExportIncludeCartouche(event.target.checked)}
            />
            {renderSettingLabel("Include identity cartouche in SVG/PNG export")}
          </label>
        </div>
      </section>

      <section id="settings-appearance" className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Appearance preferences</h2>
          <span className="settings-panel-chip">Display</span>
        </header>
        <p className="settings-panel-intro">Global visual defaults for theme, table typography, density, and sorting across modeling and analysis views.</p>
        <div className="settings-grid">
          <label className="settings-field">
            {renderSettingLabel("Theme mode")}
            <select value={themeMode} onChange={(event) => setThemeMode(event.target.value as ThemeMode)}>
              {THEME_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="settings-field">
            {renderSettingLabel("Table density")}
            <select value={tableDensity} onChange={(event) => setTableDensity(event.target.value as TableDensity)}>
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </label>
          <label className="settings-field">
            {renderSettingLabel("Table font size")}
            <select value={tableFontSize} onChange={(event) => setTableFontSize(event.target.value as TableFontSize)}>
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </label>
          <label className="settings-field">
            {renderSettingLabel("Default sort column")}
            <select value={defaultSortField} onChange={(event) => setDefaultSortField(event.target.value as SortField)}>
              <option value="name">Name</option>
              <option value="technicalId">Technical ID</option>
            </select>
          </label>
          <label className="settings-field">
            {renderSettingLabel("Default sort direction")}
            <select value={defaultSortDirection} onChange={(event) => setDefaultSortDirection(event.target.value as SortDirection)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
          <label className="settings-field">
            {renderSettingLabel("Default ID sort direction")}
            <select value={defaultIdSortDirection} onChange={(event) => setDefaultIdSortDirection(event.target.value as SortDirection)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
      </section>

      <section id="settings-global-preferences" className="panel settings-panel" data-onboarding-panel="settings-global-preferences">
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
            {renderSettingLabel("Show floating inspector panel on supported screens")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={showRoutePreviewPanel}
              onChange={(event) => setShowRoutePreviewPanel(event.target.checked)}
            />
            {renderSettingLabel("Show route preview panel")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={hideWireAnalysisRoutePanel}
              onChange={(event) => setHideWireAnalysisRoutePanel(event.target.checked)}
            />
            {renderSettingLabel("Hide Wire analysis auto route panel")}
          </label>
          <label className="settings-field">
            {renderSettingLabel("Workspace panels layout")}
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
            {renderSettingLabel("Wide screen (remove app max width cap)")}
          </label>
          <label className="settings-field">
            {renderSettingLabel("Default wire section (mm²)")}
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
            {renderSettingLabel("Default auto-create linked nodes for connectors/splices")}
          </label>
          <label className="settings-field">
            {renderSettingLabel("Directional splice imbalance limit (%)")}
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
              <span>{renderSettingLabel("Language")}</span>
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
        <div className="row-actions settings-actions settings-global-preferences-actions">
          <button type="button" onClick={resetWorkspacePreferencesToDefaults}>Reset all UI preferences</button>
        </div>
      </section>

      <section id="settings-shortcuts" className="panel settings-panel">
        <header className="settings-panel-header">
          <h2>Action bar and shortcuts</h2>
          <span className="settings-panel-chip">Shortcuts</span>
        </header>
        <p className="settings-panel-intro">Enable keyboard helpers and keep a quick reference of available shortcuts.</p>
        <div className="settings-grid">
          <label className="settings-checkbox">
            <input type="checkbox" checked={showShortcutHints} onChange={(event) => setShowShortcutHints(event.target.checked)} />
            {renderSettingLabel("Show shortcut hints in the action bar")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={keyboardShortcutsEnabled}
              onChange={(event) => setKeyboardShortcutsEnabled(event.target.checked)}
            />
            {renderSettingLabel("Enable keyboard shortcuts (undo/redo/navigation/issues/view)")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={restoreViewportOnUndo}
              onChange={(event) => setRestoreViewportOnUndo(event.target.checked)}
            />
            {renderSettingLabel("Restore network viewport on undo/redo")}
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

      <section id="settings-catalog-bom" className="panel settings-panel">
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
            {renderSettingLabel("Currency (Catalog/BOM)")}
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
            {renderSettingLabel("Enable tax / VAT (TVA)")}
          </label>
          <label className="settings-field">
            {renderSettingLabel("Tabular export format")}
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
            {renderSettingLabel("Compact BOM export columns")}
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={bomTraceabilityLabelsHidden}
              onChange={(event) => setBomTraceabilityLabelsHidden(event.target.checked)}
            />
            {renderSettingLabel("Hide BOM traceability labels")}
          </label>
          <label className="settings-field">
            {renderSettingLabel("Tax rate (%)")}
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

      <section id="settings-import-export" className="panel settings-panel settings-panel--import-export">
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
              <button type="button" onClick={() => handleExportNetworks("active")} disabled={activeNetworkId === null}>{renderSettingLabel("Export active")}</button>
              <button type="button" onClick={() => handleExportNetworks("selected")} disabled={selectedExportNetworkIds.length === 0}>{renderSettingLabel("Export selected")}</button>
              <button type="button" onClick={() => handleExportNetworks("all")} disabled={networks.length === 0}>{renderSettingLabel("Export all")}</button>
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
              <button type="button" onClick={handleOpenImportPicker}>{renderSettingLabel("Import from file")}</button>
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
            <legend>{renderSettingLabel("Selected networks for export")}</legend>
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

      <section id="settings-sample-network" className="panel settings-panel">
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
            {renderSettingLabel("Recreate sample network")}
          </button>
          <button type="button" onClick={handleResetSampleNetwork} disabled={!hasBuiltInSampleState}>
            {renderSettingLabel("Reset sample network to baseline")}
          </button>
        </div>
      </section>
        </section>
      </div>
    </section>
  );
}
