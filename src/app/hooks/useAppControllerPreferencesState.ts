import { useState } from "react";
import type { ThemeMode } from "../../store";
import type {
  CanvasCalloutTextSize,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  SortDirection,
  SortField,
  SortState,
  TableDensity,
  TableFontSize,
  WorkspaceCurrencyCode,
  WorkspacePanelsLayoutMode
} from "../types/app-controller";

export function useAppControllerPreferencesState() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [tableDensity, setTableDensity] = useState<TableDensity>("compact");
  const [tableFontSize, setTableFontSize] = useState<TableFontSize>("normal");
  const [workspaceCurrencyCode, setWorkspaceCurrencyCode] = useState<WorkspaceCurrencyCode>("EUR");
  const [workspaceTaxEnabled, setWorkspaceTaxEnabled] = useState(true);
  const [workspaceTaxRatePercent, setWorkspaceTaxRatePercent] = useState(20);
  const [defaultWireSectionMm2, setDefaultWireSectionMm2] = useState(0.5);
  const [defaultAutoCreateLinkedNodes, setDefaultAutoCreateLinkedNodes] = useState(true);
  const [defaultSortField, setDefaultSortField] = useState<SortField>("name");
  const [defaultSortDirection, setDefaultSortDirection] = useState<SortDirection>("asc");
  const [defaultIdSortDirection, setDefaultIdSortDirection] = useState<SortDirection>("asc");
  const [networkSort, setNetworkSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [canvasDefaultShowGrid, setCanvasDefaultShowGrid] = useState(true);
  const [canvasDefaultSnapToGrid, setCanvasDefaultSnapToGrid] = useState(true);
  const [canvasDefaultLockEntityMovement, setCanvasDefaultLockEntityMovement] = useState(false);
  const [canvasDefaultShowInfoPanels, setCanvasDefaultShowInfoPanels] = useState(true);
  const [canvasDefaultShowSegmentLengths, setCanvasDefaultShowSegmentLengths] = useState(false);
  const [canvasDefaultShowCableCallouts, setCanvasDefaultShowCableCallouts] = useState(false);
  const [canvasDefaultLabelStrokeMode, setCanvasDefaultLabelStrokeMode] = useState<CanvasLabelStrokeMode>("normal");
  const [canvasDefaultLabelSizeMode, setCanvasDefaultLabelSizeMode] = useState<CanvasLabelSizeMode>("normal");
  const [canvasDefaultCalloutTextSize, setCanvasDefaultCalloutTextSize] = useState<CanvasCalloutTextSize>("normal");
  const [canvasDefaultLabelRotationDegrees, setCanvasDefaultLabelRotationDegrees] =
    useState<CanvasLabelRotationDegrees>(-20);
  const [canvasPngExportIncludeBackground, setCanvasPngExportIncludeBackground] = useState(true);
  const [showShortcutHints, setShowShortcutHints] = useState(false);
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);
  const [showFloatingInspectorPanel, setShowFloatingInspectorPanel] = useState(true);
  const [workspacePanelsLayoutMode, setWorkspacePanelsLayoutMode] = useState<WorkspacePanelsLayoutMode>("singleColumn");
  const [preferencesHydrated, setPreferencesHydrated] = useState(false);

  return {
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
    canvasPngExportIncludeBackground,
    setCanvasPngExportIncludeBackground,
    showShortcutHints,
    setShowShortcutHints,
    keyboardShortcutsEnabled,
    setKeyboardShortcutsEnabled,
    showFloatingInspectorPanel,
    setShowFloatingInspectorPanel,
    workspacePanelsLayoutMode,
    setWorkspacePanelsLayoutMode,
    preferencesHydrated,
    setPreferencesHydrated
  };
}

export type AppControllerPreferencesStateModel = ReturnType<typeof useAppControllerPreferencesState>;
