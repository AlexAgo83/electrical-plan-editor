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
    title: t("ui.operationshealthpanelWorkspaceStorage"),
    labels: [
      t("ui.settingssearchmodelPersistenceMode"),
      t("ui.settingssearchmodelLinkedFile"),
      t("ui.settingssearchmodelPermission"),
      t("ui.operationshealthpanelOpenWorkspaceFile"),
      t("ui.settingsworkspacecontentSaveAsFile"),
      t("ui.settingssearchmodelSaveAsCopy"),
      t("ui.settingsworkspacecontentUseAFileForAutosave"),
      t("ui.settingsworkspacecontentResumeLastFile"),
      t("ui.settingssearchmodelSaveNow"),
      t("ui.settingssearchmodelStopAutosaveLink"),
      t("ui.settingsworkspacecontentResolveConflict"),
      t("ui.settingsworkspacecontentRestoreFileAccess"),
      t("ui.settingssearchmodelLoadFileVersion"),
      t("ui.settingssearchmodelKeepLocalVersion"),
      t("ui.settingssearchmodelSaveLocalCopy")
    ]
  },
  {
    id: "settings-import-export",
    title: t("ui.importExportNetworks"),
    labels: [
      t("ui.selectedNetworksForExport"),
      t("ui.exportActive"),
      t("ui.settingssearchmodelExportSelectedJSON"),
      t("ui.exportAll"),
      t("ui.settingssearchmodelExportSelectedBOMXLSX"),
      t("ui.settingssearchmodelExportSelectedWireListXLSX"),
      t("ui.settingsworkspacecontentExportSelectedSVG"),
      t("ui.settingsworkspacecontentExportSelectedPNG"),
      t("ui.settingsworkspacecontentExportSelectedPDF"),
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
      t("ui.settingssearchmodelShowRoutePreviewPanel"),
      t("ui.settingssearchmodelHideWireAnalysisAutoRoutePanel"),
      t("ui.settingssearchmodelShowMultiNetworkFunctionalAnalysisPanel"),
      t("ui.workspacePanelsLayout"),
      t("ui.wideScreenRemoveAppMaxWidthCap"),
      t("ui.settingssearchmodelEnablePerformanceDebugConsoleLogs"),
      t("ui.defaultWireSectionMm2"),
      t("ui.defaultAutoCreateLinkedNodesForConnectors"),
      t("ui.settingssearchmodelDirectionalSpliceImbalanceLimit"),
      t("ui.language")
    ]
  },
  {
    id: "settings-shortcuts",
    title: t("ui.actionBarAndShortcuts"),
    labels: [t("ui.showShortcutHintsInTheActionBar"), t("ui.enableKeyboardShortcutsUndoRedoNavigationIssuesView"), t("ui.settingssearchmodelRestoreNetworkViewportOnUndoRedo")]
  },
  {
    id: "settings-catalog-bom",
    title: t("ui.catalogBOMSetup"),
    labels: [
      t("ui.currencyCatalogBOM"),
      t("ui.enableTaxVATTVA"),
      t("ui.settingssearchmodelTabularExportFormat"),
      t("ui.wireStrippingAllowanceMm"),
      t("ui.twistedPairLengthCoefficient"),
      t("ui.settingssearchmodelCompactBOMExportColumns"),
      t("ui.settingssearchmodelHideBOMTraceabilityLabels"),
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
    title: t("ui.settingsworkspacecontentAiProvider"),
    labels: [t("ui.settingssearchmodelProvider"), t("ui.settingssearchmodelModel"), t("ui.settingssearchmodelApiKey"), t("ui.settingssearchmodelEndpoint"), t("ui.settingssearchmodelTimeoutMs"), t("ui.settingssearchmodelStrictStructuredOutputMode"), t("ui.settingssearchmodelEnableExperimentalDirectExecution"), t("ui.settingssearchmodelTestConnection")]
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
