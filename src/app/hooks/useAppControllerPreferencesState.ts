import { useState } from "react";
import type { ThemeMode } from "../../store";
import {
  DEFAULT_WIRE_EXPORT_STRIPPING_ALLOWANCE_MM,
  DEFAULT_WIRE_EXPORT_TWISTED_PAIR_LENGTH_COEFFICIENT
} from "../lib/wireExportLength";
import type {
  AppLocale,
  CanvasCalloutTextSize,
  CanvasExportFormat,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasResizeBehaviorMode,
  CanvasLabelStrokeMode,
  ConnectorDrawingDisplayMode,
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
import type { TableColumnPreferences } from "./uiPreferencesStorage";

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
  const [bomExportComputedDownstreamLoad, setBomExportComputedDownstreamLoad] = useState(false);
  const [wireExportStrippingAllowanceMm, setWireExportStrippingAllowanceMm] = useState(
    DEFAULT_WIRE_EXPORT_STRIPPING_ALLOWANCE_MM
  );
  const [wireExportTwistedPairLengthCoefficient, setWireExportTwistedPairLengthCoefficient] = useState(
    DEFAULT_WIRE_EXPORT_TWISTED_PAIR_LENGTH_COEFFICIENT
  );
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
  const [canvasConnectorDrawingDisplayMode, setCanvasConnectorDrawingDisplayMode] =
    useState<ConnectorDrawingDisplayMode>("nodes");
  const [canvasUseConsistentConnectorLayoutScale, setCanvasUseConsistentConnectorLayoutScale] = useState(true);
  const [canvasCalloutConnectorDrawingScalePercent, setCanvasCalloutConnectorDrawingScalePercent] = useState(150);
  const [canvasGlobalRenderScalePercent, setCanvasGlobalRenderScalePercent] = useState(0);
  const [canvasZoomInvariantNodeShapes, setCanvasZoomInvariantNodeShapes] = useState(true);
  const [canvasShowColocatedSpliceLinkLine, setCanvasShowColocatedSpliceLinkLine] = useState(true);
  const [canvasShowNetworkEntityPrefix, setCanvasShowNetworkEntityPrefix] = useState(true);
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
  const [hideWireAnalysisRoutePanel, setHideWireAnalysisRoutePanel] = useState(false);
  const [showMultiNetworkFunctionalAnalysisPanel, setShowMultiNetworkFunctionalAnalysisPanel] = useState(true);
  const [workspacePanelsLayoutMode, setWorkspacePanelsLayoutMode] = useState<WorkspacePanelsLayoutMode>("singleColumn");
  const [workspaceWideScreen, setWorkspaceWideScreen] = useState(false);
  const [tableColumnPreferences, setTableColumnPreferences] = useState<TableColumnPreferences>({});
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
    bomExportComputedDownstreamLoad,
    setBomExportComputedDownstreamLoad,
    wireExportStrippingAllowanceMm,
    setWireExportStrippingAllowanceMm,
    wireExportTwistedPairLengthCoefficient,
    setWireExportTwistedPairLengthCoefficient,
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
    canvasConnectorDrawingDisplayMode,
    setCanvasConnectorDrawingDisplayMode,
    canvasUseConsistentConnectorLayoutScale,
    setCanvasUseConsistentConnectorLayoutScale,
    canvasCalloutConnectorDrawingScalePercent,
    setCanvasCalloutConnectorDrawingScalePercent,
    canvasGlobalRenderScalePercent,
    setCanvasGlobalRenderScalePercent,
    canvasZoomInvariantNodeShapes,
    setCanvasZoomInvariantNodeShapes,
    canvasShowColocatedSpliceLinkLine,
    setCanvasShowColocatedSpliceLinkLine,
    canvasShowNetworkEntityPrefix,
    setCanvasShowNetworkEntityPrefix,
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
    hideWireAnalysisRoutePanel,
    setHideWireAnalysisRoutePanel,
    showMultiNetworkFunctionalAnalysisPanel,
    setShowMultiNetworkFunctionalAnalysisPanel,
    workspacePanelsLayoutMode,
    setWorkspacePanelsLayoutMode,
    workspaceWideScreen,
    setWorkspaceWideScreen,
    tableColumnPreferences,
    setTableColumnPreferences,
    preferencesHydrated,
    setPreferencesHydrated
  };
}

export type AppControllerPreferencesStateModel = ReturnType<typeof useAppControllerPreferencesState>;
