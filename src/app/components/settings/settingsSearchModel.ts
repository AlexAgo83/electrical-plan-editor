import { translateCurrent as t } from "../../lib/i18n";
export interface SettingsSectionDefinition {
  id: string;
  title: string;
  labels: string[];
}

export const SETTINGS_SECTION_IDS = [
  "settings-workspace-storage",
  "settings-import-export",
  "settings-canvas-render",
  "settings-canvas-tools",
  "settings-appearance",
  "settings-global-preferences",
  "settings-shortcuts",
  "settings-catalog-bom",
  "settings-sample-network",
  "settings-ai-provider"
] as const;

export function getSettingsSections(): SettingsSectionDefinition[] {
  return [
  {
    id: "settings-workspace-storage",
    title: "Workspace storage",
    labels: [
      "Persistence mode",
      "Linked file",
      "Permission",
      "Open workspace file",
      "Save as file",
      "Save as copy",
      "Use a file for autosave",
      "Resume last file",
      "Save now",
      "Stop autosave link",
      "Resolve conflict",
      "Restore file access",
      "Load file version",
      "Keep local version",
      "Save local copy"
    ]
  },
  {
    id: "settings-import-export",
    title: t("ui.importExportNetworks"),
    labels: [
      t("ui.selectedNetworksForExport"),
      t("ui.exportActive"),
      "Export selected JSON",
      t("ui.exportAll"),
      "Export selected BOM (XLSX)",
      "Export selected wire list (XLSX)",
      "Export selected SVG",
      "Export selected PNG",
      "Export selected PDF",
      t("ui.importFromFile")
    ]
  },
  {
    id: "settings-canvas-render",
    title: t("ui.canvasRenderPreferences"),
    labels: [
      t("ui.labelStrokeMode"),
      t("ui.2dLabelSize"),
      t("ui.calloutTextSize"),
      t("ui.connectorDrawingDisplay"),
      t("ui.useConsistentPhysicalLayoutScale"),
      t("ui.connectorDrawingSize"),
      t("ui.summaryGlobalScale"),
      t("ui.autoSegmentLabelRotation"),
      t("ui.2dLabelRotation"),
      t("ui.resetZoomTarget"),
      t("ui.viewportResizeBehavior")
    ]
  },
  {
    id: "settings-canvas-tools",
    title: t("ui.canvasToolsPreferences"),
    labels: [
      t("ui.showGridByDefault"),
      t("ui.snapNodeMovementByDefault"),
      t("ui.lockNodeMovementByDefault"),
      t("ui.showInfoOverlaysByDefault"),
      t("ui.showSegmentNames"),
      t("ui.showSegmentLengthsByDefault"),
      t("ui.showConnectorSpliceCableCalloutsByDefault"),
      t("ui.showOnlySelectedConnectorSpliceCallout"),
      t("ui.showWireNamesInCalloutTable"),
      t("ui.keepConnectorSpliceNodeShapeSizeConstantWhileZooming"),
      t("ui.showColocatedSpliceLinkLine"),
      t("ui.showNetworkEntityIDPrefix"),
      t("ui.nodeShapeTargetSize"),
      t("ui.includeBackgroundInPNGExport"),
      t("ui.includeFrameInSVGPNGExport"),
      t("ui.includeIdentityCartoucheInSVGPNGExport")
    ]
  },
  {
    id: "settings-appearance",
    title: t("ui.appearancePreferences"),
    labels: [t("ui.themeMode"), t("ui.tableDensity"), t("ui.tableFontSize"), t("ui.defaultSortColumn"), t("ui.defaultSortDirection"), t("ui.defaultIDSortDirection")]
  },
  {
    id: "settings-global-preferences",
    title: t("ui.globalPreferences"),
    labels: [
      t("ui.showFloatingInspectorPanelOnSupportedScreens"),
      "Show route preview panel",
      "Hide Wire analysis auto route panel",
      "Show multi-network functional analysis panel",
      t("ui.workspacePanelsLayout"),
      t("ui.wideScreenRemoveAppMaxWidthCap"),
      "Enable performance debug console logs",
      t("ui.defaultWireSectionMm2"),
      t("ui.defaultAutoCreateLinkedNodesForConnectors"),
      "Directional splice imbalance limit (%)",
      t("ui.language")
    ]
  },
  {
    id: "settings-shortcuts",
    title: t("ui.actionBarAndShortcuts"),
    labels: [t("ui.showShortcutHintsInTheActionBar"), t("ui.enableKeyboardShortcutsUndoRedoNavigationIssuesView"), "Restore network viewport on undo/redo"]
  },
  {
    id: "settings-catalog-bom",
    title: t("ui.catalogBOMSetup"),
    labels: [
      t("ui.currencyCatalogBOM"),
      t("ui.enableTaxVATTVA"),
      "Tabular export format",
      t("ui.wireStrippingAllowanceMm"),
      t("ui.twistedPairLengthCoefficient"),
      "Compact BOM export columns",
      "Hide BOM traceability labels",
      t("ui.computedDownstreamLoadA"),
      t("ui.taxRate")
    ]
  },
  {
    id: "settings-sample-network",
    title: t("ui.sampleNetworkControls"),
    labels: [t("ui.recreateSampleNetwork"), t("ui.resetSampleNetworkToBaseline")]
  },
  {
    id: "settings-ai-provider",
    title: "AI provider",
    labels: ["Provider", "Model", "API key", "Endpoint", "Timeout (ms)", "Strict structured output mode", "Enable experimental direct execution", "Test connection"]
  }
  ];
}

export function normalizeSettingsSearch(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function settingsLabelMatches(label: string, normalizedQuery: string): boolean {
  return normalizedQuery.length > 0 && label.toLowerCase().includes(normalizedQuery);
}

export function sectionMatches(section: SettingsSectionDefinition, normalizedQuery: string): number {
  if (normalizedQuery.length === 0) {
    return 0;
  }

  return [section.title, ...section.labels].filter((label) => settingsLabelMatches(label, normalizedQuery)).length;
}
