import { useState } from "react";
import type { ThemeMode } from "../../store";
import type {
  AppLocale,
  CanvasCalloutTextSize,
  CanvasExportFormat,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasResizeBehaviorMode,
  CanvasLabelStrokeMode,
  NetworkCalloutContentMode,
  SortDirection,
  SortField,
  SortState,
  TableDensity,
  TableFontSize,
  TabularExportFormat,
  WorkspaceCurrencyCode,
  WorkspacePanelsLayoutMode
} from "../types/app-controller";

export function useAppControllerPreferencesState() {
  const [locale, setLocale] = useState<AppLocale>("en");
  const [themeMode, setThemeMode] = useState<ThemeMode>("warmBrown");
  const [tableDensity, setTableDensity] = useState<TableDensity>("compact");
  const [tableFontSize, setTableFontSize] = useState<TableFontSize>("normal");
  const [workspaceCurrencyCode, setWorkspaceCurrencyCode] = useState<WorkspaceCurrencyCode>("EUR");
  const [workspaceTaxEnabled, setWorkspaceTaxEnabled] = useState(true);
  const [workspaceTaxRatePercent, setWorkspaceTaxRatePercent] = useState(20);
  const [tabularExportFormat, setTabularExportFormat] = useState<TabularExportFormat>("csv");
  const [bomExportCompactColumns, setBomExportCompactColumns] = useState(false);
  const [bomTraceabilityLabelsHidden, setBomTraceabilityLabelsHidden] = useState(false);
  const [defaultWireSectionMm2, setDefaultWireSectionMm2] = useState(0.5);
  const [defaultAutoCreateLinkedNodes, setDefaultAutoCreateLinkedNodes] = useState(true);
  const [spliceSectionImbalanceRatioPercent, setSpliceSectionImbalanceRatioPercent] = useState(300);
  const [defaultSortField, setDefaultSortField] = useState<SortField>("name");
  const [defaultSortDirection, setDefaultSortDirection] = useState<SortDirection>("asc");
  const [defaultIdSortDirection, setDefaultIdSortDirection] = useState<SortDirection>("asc");
  const [networkSort, setNetworkSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [canvasDefaultShowGrid, setCanvasDefaultShowGrid] = useState(true);
  const [canvasDefaultSnapToGrid, setCanvasDefaultSnapToGrid] = useState(true);
  const [canvasDefaultLockEntityMovement, setCanvasDefaultLockEntityMovement] = useState(false);
  const [canvasDefaultShowInfoPanels, setCanvasDefaultShowInfoPanels] = useState(true);
  const [canvasDefaultShowSegmentNames, setCanvasDefaultShowSegmentNames] = useState(false);
  const [canvasDefaultShowSegmentLengths, setCanvasDefaultShowSegmentLengths] = useState(true);
  const [canvasDefaultShowCableCallouts, setCanvasDefaultShowCableCallouts] = useState(false);
  const [canvasDefaultCalloutContentMode, setCanvasDefaultCalloutContentMode] =
    useState<NetworkCalloutContentMode>("both");
  const [canvasDefaultShowSelectedCalloutOnly, setCanvasDefaultShowSelectedCalloutOnly] = useState(false);
  const [canvasDefaultLabelStrokeMode, setCanvasDefaultLabelStrokeMode] = useState<CanvasLabelStrokeMode>("light");
  const [canvasDefaultLabelSizeMode, setCanvasDefaultLabelSizeMode] = useState<CanvasLabelSizeMode>("small");
  const [canvasDefaultCalloutTextSize, setCanvasDefaultCalloutTextSize] = useState<CanvasCalloutTextSize>("normal");
  const [canvasDefaultLabelRotationDegrees, setCanvasDefaultLabelRotationDegrees] =
    useState<CanvasLabelRotationDegrees>(0);
  const [canvasDefaultAutoSegmentLabelRotation, setCanvasDefaultAutoSegmentLabelRotation] = useState(true);
  const [canvasShowCalloutWireNames, setCanvasShowCalloutWireNames] = useState(false);
  const [canvasCalloutConnectorDrawingScalePercent, setCanvasCalloutConnectorDrawingScalePercent] = useState(125);
  const [canvasZoomInvariantNodeShapes, setCanvasZoomInvariantNodeShapes] = useState(true);
  const [canvasNodeShapeSizePercent, setCanvasNodeShapeSizePercent] = useState(70);
  const [canvasExportFormat, setCanvasExportFormat] = useState<CanvasExportFormat>("svg");
  const [canvasPngExportIncludeBackground, setCanvasPngExportIncludeBackground] = useState(true);
  const [canvasExportIncludeFrame, setCanvasExportIncludeFrame] = useState(false);
  const [canvasExportIncludeCartouche, setCanvasExportIncludeCartouche] = useState(true);
  const [canvasResizeBehaviorMode, setCanvasResizeBehaviorMode] =
    useState<CanvasResizeBehaviorMode>("visibleAreaOnly");
  const [showShortcutHints, setShowShortcutHints] = useState(false);
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);
  const [restoreViewportOnUndo, setRestoreViewportOnUndo] = useState(true);
  const [showFloatingInspectorPanel, setShowFloatingInspectorPanel] = useState(true);
  const [showRoutePreviewPanel, setShowRoutePreviewPanel] = useState(false);
  const [workspacePanelsLayoutMode, setWorkspacePanelsLayoutMode] = useState<WorkspacePanelsLayoutMode>("singleColumn");
  const [workspaceWideScreen, setWorkspaceWideScreen] = useState(false);
  const [preferencesHydrated, setPreferencesHydrated] = useState(false);

  return {
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
    networkSort,
    setNetworkSort,
    canvasDefaultShowGrid,
    setCanvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    setCanvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    setCanvasDefaultLockEntityMovement,
    canvasDefaultShowInfoPanels,
    setCanvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentNames,
    setCanvasDefaultShowSegmentNames,
    canvasDefaultShowSegmentLengths,
    setCanvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts,
    setCanvasDefaultShowCableCallouts,
    canvasDefaultCalloutContentMode,
    setCanvasDefaultCalloutContentMode,
    canvasDefaultShowSelectedCalloutOnly,
    setCanvasDefaultShowSelectedCalloutOnly,
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
    canvasCalloutConnectorDrawingScalePercent,
    setCanvasCalloutConnectorDrawingScalePercent,
    canvasZoomInvariantNodeShapes,
    setCanvasZoomInvariantNodeShapes,
    canvasNodeShapeSizePercent,
    setCanvasNodeShapeSizePercent,
    canvasExportFormat,
    setCanvasExportFormat,
    canvasPngExportIncludeBackground,
    setCanvasPngExportIncludeBackground,
    canvasExportIncludeFrame,
    setCanvasExportIncludeFrame,
    canvasExportIncludeCartouche,
    setCanvasExportIncludeCartouche,
    canvasResizeBehaviorMode,
    setCanvasResizeBehaviorMode,
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
    workspacePanelsLayoutMode,
    setWorkspacePanelsLayoutMode,
    workspaceWideScreen,
    setWorkspaceWideScreen,
    preferencesHydrated,
    setPreferencesHydrated
  };
}

export type AppControllerPreferencesStateModel = ReturnType<typeof useAppControllerPreferencesState>;
