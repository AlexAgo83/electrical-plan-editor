import { useState } from "react";
import type { ThemeMode } from "../../store";
import type {
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  SortDirection,
  SortField,
  SortState,
  TableDensity,
  TableFontSize
} from "../types/app-controller";

export function useAppControllerPreferencesState() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [tableDensity, setTableDensity] = useState<TableDensity>("compact");
  const [tableFontSize, setTableFontSize] = useState<TableFontSize>("normal");
  const [defaultSortField, setDefaultSortField] = useState<SortField>("name");
  const [defaultSortDirection, setDefaultSortDirection] = useState<SortDirection>("asc");
  const [defaultIdSortDirection, setDefaultIdSortDirection] = useState<SortDirection>("asc");
  const [networkSort, setNetworkSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [canvasDefaultShowGrid, setCanvasDefaultShowGrid] = useState(true);
  const [canvasDefaultSnapToGrid, setCanvasDefaultSnapToGrid] = useState(true);
  const [canvasDefaultLockEntityMovement, setCanvasDefaultLockEntityMovement] = useState(false);
  const [canvasDefaultShowInfoPanels, setCanvasDefaultShowInfoPanels] = useState(true);
  const [canvasDefaultShowSegmentLengths, setCanvasDefaultShowSegmentLengths] = useState(false);
  const [canvasDefaultLabelStrokeMode, setCanvasDefaultLabelStrokeMode] = useState<CanvasLabelStrokeMode>("normal");
  const [canvasDefaultLabelSizeMode, setCanvasDefaultLabelSizeMode] = useState<CanvasLabelSizeMode>("normal");
  const [canvasDefaultLabelRotationDegrees, setCanvasDefaultLabelRotationDegrees] =
    useState<CanvasLabelRotationDegrees>(0);
  const [canvasPngExportIncludeBackground, setCanvasPngExportIncludeBackground] = useState(false);
  const [showShortcutHints, setShowShortcutHints] = useState(false);
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);
  const [showFloatingInspectorPanel, setShowFloatingInspectorPanel] = useState(true);
  const [preferencesHydrated, setPreferencesHydrated] = useState(false);

  return {
    themeMode,
    setThemeMode,
    tableDensity,
    setTableDensity,
    tableFontSize,
    setTableFontSize,
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
    canvasDefaultLabelStrokeMode,
    setCanvasDefaultLabelStrokeMode,
    canvasDefaultLabelSizeMode,
    setCanvasDefaultLabelSizeMode,
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
    preferencesHydrated,
    setPreferencesHydrated
  };
}

export type AppControllerPreferencesStateModel = ReturnType<typeof useAppControllerPreferencesState>;
