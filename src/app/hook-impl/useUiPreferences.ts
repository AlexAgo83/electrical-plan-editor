import { useEffect } from "react";
import { DEFAULT_WIRE_SECTION_MM2, normalizeWireSectionMm2 } from "../../core/wireSection";
import type { ThemeMode } from "../../store";
import { normalizeAppLocale } from "../lib/i18n";
import {
  normalizeWireExportStrippingAllowanceMm,
  normalizeWireExportTwistedPairLengthCoefficient
} from "../lib/wireExportLength";
import { readUiPreferences, writeUiPreferences } from "../hooks/uiPreferencesStorage";
import type { UiPreferencesPayload } from "../hooks/uiPreferencesStorage";
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
  TableFontSize,
  TabularExportFormat,
  WorkspaceCurrencyCode,
  WorkspacePanelsLayoutMode
} from "../types/app-controller";

function normalizeThemeMode(value: unknown): ThemeMode {
  switch (value) {
    case "dark":
      return "dark";
    case "slateNeon":
      return "slateNeon";
    case "paperBlueprint":
      return "paperBlueprint";
    case "warmBrown":
      return "warmBrown";
    case "deepGreen":
      return "deepGreen";
    case "roseQuartz":
    case "roseLight":
      return "roseQuartz";
    case "burgundyNoir":
    case "bordeauxDark":
      return "burgundyNoir";
    case "lavenderHaze":
    case "violetLight":
      return "lavenderHaze";
    case "amberNight":
    case "amberDark":
      return "amberNight";
    case "cyberpunk":
      return "cyberpunk";
    case "olive":
    case "oliveDark":
      return "olive";
    case "mistGray":
      return "mistGray";
    case "sagePaper":
      return "sagePaper";
    case "sandSlate":
      return "sandSlate";
    case "iceBlue":
      return "iceBlue";
    case "softTeal":
      return "softTeal";
    case "dustyRose":
      return "dustyRose";
    case "paleOlive":
      return "paleOlive";
    case "cloudLavender":
      return "cloudLavender";
    case "steelBlue":
      return "steelBlue";
    case "forestGraphite":
      return "forestGraphite";
    case "petrolSlate":
      return "petrolSlate";
    case "copperNight":
      return "copperNight";
    case "mossTaupe":
      return "mossTaupe";
    case "navyAsh":
      return "navyAsh";
    case "charcoalPlum":
      return "charcoalPlum";
    case "smokedTeal":
      return "smokedTeal";
    case "circleMobilityLight":
    case "circleLight":
      return "circleMobilityLight";
    case "circleMobilityDark":
    case "circleDark":
      return "circleMobilityDark";
    default:
      return "warmBrown";
  }
}

type TableDensity = "comfortable" | "compact";
type TableFontSizePreference = TableFontSize;
type WorkspacePanelsLayoutPreference = WorkspacePanelsLayoutMode;
type SortField = "name" | "technicalId" | "lengthMm";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface UseUiPreferencesOptions {
  networkMinScale: number;
  networkMaxScale: number;
  locale: AppLocale;
  themeMode: ThemeMode;
  tableDensity: TableDensity;
  tableFontSize: TableFontSizePreference;
  workspaceCurrencyCode: WorkspaceCurrencyCode;
  workspaceTaxEnabled: boolean;
  workspaceTaxRatePercent: number;
  tabularExportFormat: TabularExportFormat;
  bomExportCompactColumns: boolean;
  bomTraceabilityLabelsHidden: boolean;
  bomExportComputedDownstreamLoad: boolean;
  wireExportStrippingAllowanceMm: number;
  wireExportTwistedPairLengthCoefficient: number;
  defaultWireSectionMm2: number;
  defaultAutoCreateLinkedNodes: boolean;
  spliceSectionImbalanceRatioPercent: number;
  defaultSortField: SortField;
  defaultSortDirection: SortDirection;
  defaultIdSortDirection: SortDirection;
  canvasDefaultShowGrid: boolean;
  canvasDefaultSnapToGrid: boolean;
  canvasDefaultLockEntityMovement: boolean;
  canvasDefaultShowInfoPanels: boolean;
  canvasDefaultShowSegmentNames: boolean;
  canvasDefaultShowSegmentLengths: boolean;
  canvasDefaultShowCableCallouts: boolean;
  canvasDefaultCalloutContentMode: NetworkCalloutContentMode;
  canvasDefaultShowSelectedCalloutOnly: boolean;
  canvasDefaultLabelStrokeMode: CanvasLabelStrokeMode;
  canvasDefaultLabelSizeMode: CanvasLabelSizeMode;
  canvasDefaultCalloutTextSize: CanvasCalloutTextSize;
  canvasDefaultLabelRotationDegrees: CanvasLabelRotationDegrees;
  canvasDefaultAutoSegmentLabelRotation: boolean;
  canvasShowCalloutWireNames: boolean;
  canvasConnectorDrawingDisplayMode: ConnectorDrawingDisplayMode;
  canvasUseConsistentConnectorLayoutScale: boolean;
  canvasCalloutConnectorDrawingScalePercent: number;
  canvasGlobalRenderScalePercent: number;
  canvasZoomInvariantNodeShapes: boolean;
  canvasNodeShapeSizePercent: number;
  canvasExportFormat: CanvasExportFormat;
  canvasPngExportIncludeBackground: boolean;
  canvasExportIncludeFrame: boolean;
  canvasExportIncludeCartouche: boolean;
  canvasResizeBehaviorMode: CanvasResizeBehaviorMode;
  canvasResetZoomPercentInput: string;
  showShortcutHints: boolean;
  keyboardShortcutsEnabled: boolean;
  restoreViewportOnUndo: boolean;
  showFloatingInspectorPanel: boolean;
  showRoutePreviewPanel: boolean;
  hideWireAnalysisRoutePanel: boolean;
  showMultiNetworkFunctionalAnalysisPanel: boolean;
  workspacePanelsLayoutMode: WorkspacePanelsLayoutPreference;
  workspaceWideScreen: boolean;
  preferencesHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setLocale: (value: AppLocale) => void;
  setTableDensity: (density: TableDensity) => void;
  setTableFontSize: (value: TableFontSizePreference) => void;
  setWorkspaceCurrencyCode: (value: WorkspaceCurrencyCode) => void;
  setWorkspaceTaxEnabled: (value: boolean) => void;
  setWorkspaceTaxRatePercent: (value: number) => void;
  setTabularExportFormat: (value: TabularExportFormat) => void;
  setBomExportCompactColumns: (value: boolean) => void;
  setBomTraceabilityLabelsHidden: (value: boolean) => void;
  setBomExportComputedDownstreamLoad: (value: boolean) => void;
  setWireExportStrippingAllowanceMm: (value: number) => void;
  setWireExportTwistedPairLengthCoefficient: (value: number) => void;
  setDefaultWireSectionMm2: (value: number) => void;
  setDefaultAutoCreateLinkedNodes: (value: boolean) => void;
  setSpliceSectionImbalanceRatioPercent: (value: number) => void;
  setDefaultSortField: (field: SortField) => void;
  setDefaultSortDirection: (direction: SortDirection) => void;
  setDefaultIdSortDirection: (direction: SortDirection) => void;
  setConnectorSort: (state: SortState) => void;
  setSpliceSort: (state: SortState) => void;
  setWireSort: (state: SortState) => void;
  setNetworkSort: (state: SortState) => void;
  setConnectorSynthesisSort: (state: SortState) => void;
  setSpliceSynthesisSort: (state: SortState) => void;
  setNodeIdSortDirection: (direction: SortDirection) => void;
  setSegmentIdSortDirection: (direction: SortDirection) => void;
  setCanvasDefaultShowGrid: (value: boolean) => void;
  setCanvasDefaultSnapToGrid: (value: boolean) => void;
  setCanvasDefaultLockEntityMovement: (value: boolean) => void;
  setCanvasDefaultShowInfoPanels: (value: boolean) => void;
  setCanvasDefaultShowSegmentNames: (value: boolean) => void;
  setCanvasDefaultShowSegmentLengths: (value: boolean) => void;
  setCanvasDefaultShowCableCallouts: (value: boolean) => void;
  setCanvasDefaultCalloutContentMode: (value: NetworkCalloutContentMode) => void;
  setCanvasDefaultShowSelectedCalloutOnly: (value: boolean) => void;
  setCanvasDefaultLabelStrokeMode: (value: CanvasLabelStrokeMode) => void;
  setCanvasDefaultLabelSizeMode: (value: CanvasLabelSizeMode) => void;
  setCanvasDefaultCalloutTextSize: (value: CanvasCalloutTextSize) => void;
  setCanvasDefaultLabelRotationDegrees: (value: CanvasLabelRotationDegrees) => void;
  setCanvasDefaultAutoSegmentLabelRotation: (value: boolean) => void;
  setCanvasShowCalloutWireNames: (value: boolean) => void;
  setCanvasConnectorDrawingDisplayMode: (value: ConnectorDrawingDisplayMode) => void;
  setCanvasUseConsistentConnectorLayoutScale: (value: boolean) => void;
  setCanvasCalloutConnectorDrawingScalePercent: (value: number) => void;
  setCanvasGlobalRenderScalePercent: (value: number) => void;
  setCanvasZoomInvariantNodeShapes: (value: boolean) => void;
  setCanvasNodeShapeSizePercent: (value: number) => void;
  setCanvasExportFormat: (value: CanvasExportFormat) => void;
  setCanvasPngExportIncludeBackground: (value: boolean) => void;
  setCanvasExportIncludeFrame: (value: boolean) => void;
  setCanvasExportIncludeCartouche: (value: boolean) => void;
  setCanvasResizeBehaviorMode: (value: CanvasResizeBehaviorMode) => void;
  setShowNetworkGrid: (value: boolean) => void;
  setSnapNodesToGrid: (value: boolean) => void;
  setLockEntityMovement: (value: boolean) => void;
  setShowNetworkInfoPanels: (value: boolean) => void;
  setShowSegmentNames: (value: boolean) => void;
  setShowSegmentLengths: (value: boolean) => void;
  setShowCableCallouts: (value: boolean) => void;
  setNetworkCalloutContentMode: (value: NetworkCalloutContentMode) => void;
  setShowSelectedCalloutOnly: (value: boolean) => void;
  setNetworkLabelStrokeMode: (value: CanvasLabelStrokeMode) => void;
  setNetworkLabelSizeMode: (value: CanvasLabelSizeMode) => void;
  setNetworkCalloutTextSize: (value: CanvasCalloutTextSize) => void;
  setNetworkLabelRotationDegrees: (value: CanvasLabelRotationDegrees) => void;
  setNetworkAutoSegmentLabelRotation: (value: boolean) => void;
  setCanvasResetZoomPercentInput: (value: string) => void;
  setNetworkScale: (value: number) => void;
  setNetworkOffset: (value: { x: number; y: number }) => void;
  setShowShortcutHints: (value: boolean) => void;
  setKeyboardShortcutsEnabled: (value: boolean) => void;
  setRestoreViewportOnUndo: (value: boolean) => void;
  setShowFloatingInspectorPanel: (value: boolean) => void;
  setShowRoutePreviewPanel: (value: boolean) => void;
  setHideWireAnalysisRoutePanel: (value: boolean) => void;
  setShowMultiNetworkFunctionalAnalysisPanel: (value: boolean) => void;
  setWorkspacePanelsLayoutMode: (value: WorkspacePanelsLayoutPreference) => void;
  setWorkspaceWideScreen: (value: boolean) => void;
  setPreferencesHydrated: (value: boolean) => void;
}

function normalizeCanvasLabelSizeMode(value: unknown): CanvasLabelSizeMode {
  return value === "extraSmall" ||
    value === "small" ||
    value === "large" ||
    value === "extraLarge"
    ? value
    : "small";
}

function normalizeCanvasCalloutTextSize(value: unknown): CanvasCalloutTextSize {
  if (value === "small" || value === "normal" || value === "large") {
    return value;
  }
  // Legacy persisted value, now folded into the "large" tier.
  if (value === "extraLarge") {
    return "large";
  }
  return "normal";
}

function normalizeNetworkCalloutContentMode(value: unknown): NetworkCalloutContentMode {
  if (value === "connectorDrawing" || value === "both") {
    return "both";
  }
  return value === "wireDetails" ? value : "both";
}

function normalizeConnectorDrawingDisplayMode(value: unknown): ConnectorDrawingDisplayMode {
  if (value === "disabled" || value === "nodes") {
    return value;
  }
  return "nodes";
}

function normalizeCanvasLabelRotationDegrees(value: unknown): CanvasLabelRotationDegrees {
  return value === -90 || value === -45 || value === -20 || value === 0 || value === 20 || value === 45 || value === 90
    ? value
    : 0;
}

function normalizeCanvasExportFormat(value: unknown): CanvasExportFormat {
  return value === "png" ? "png" : "svg";
}

function normalizeCanvasResizeBehaviorMode(value: unknown): CanvasResizeBehaviorMode {
  return value === "responsiveContentScale" ? "responsiveContentScale" : "visibleAreaOnly";
}

function normalizeCanvasNodeShapeSizePercent(value: unknown): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(parsed)) {
    return 70;
  }
  return clamp(Math.round(Number(parsed)), 50, 125);
}

function normalizeCanvasCalloutConnectorDrawingScalePercent(value: unknown): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(parsed)) {
    return 150;
  }
  return clamp(Math.round(Number(parsed)), 100, 200);
}

function normalizeCanvasGlobalRenderScalePercent(value: unknown): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return clamp(Math.round(Number(parsed)), 0, 300);
}

function normalizeWorkspacePanelsLayoutMode(value: unknown): WorkspacePanelsLayoutPreference {
  return value === "multiColumn" ? "multiColumn" : "singleColumn";
}

function normalizeWorkspaceCurrencyCode(value: unknown): WorkspaceCurrencyCode {
  return value === "USD" || value === "GBP" || value === "CAD" || value === "CHF" ? value : "EUR";
}

function normalizeWorkspaceTaxEnabled(value: unknown): boolean {
  return typeof value === "boolean" ? value : true;
}

function normalizeWorkspaceTaxRatePercent(value: unknown): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(parsed)) {
    return 20;
  }
  if (Number(parsed) < 0 || Number(parsed) > 1000) {
    return 20;
  }
  return Number(parsed);
}

function normalizeSpliceSectionImbalanceRatioPercent(value: unknown): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(parsed)) {
    return 300;
  }
  return clamp(Math.round(Number(parsed)), 100, 10000);
}

export function useUiPreferences({
  networkMinScale,
  networkMaxScale,
  locale,
  themeMode,
  tableDensity,
  tableFontSize,
  workspaceCurrencyCode,
  workspaceTaxEnabled,
  workspaceTaxRatePercent,
  tabularExportFormat,
  bomExportCompactColumns,
  bomTraceabilityLabelsHidden,
  bomExportComputedDownstreamLoad,
  wireExportStrippingAllowanceMm,
  wireExportTwistedPairLengthCoefficient,
  defaultWireSectionMm2,
  defaultAutoCreateLinkedNodes,
  spliceSectionImbalanceRatioPercent,
  defaultSortField,
  defaultSortDirection,
  defaultIdSortDirection,
  canvasDefaultShowGrid,
  canvasDefaultSnapToGrid,
  canvasDefaultLockEntityMovement,
  canvasDefaultShowInfoPanels,
  canvasDefaultShowSegmentNames,
  canvasDefaultShowSegmentLengths,
  canvasDefaultShowCableCallouts,
  canvasDefaultCalloutContentMode,
  canvasDefaultShowSelectedCalloutOnly,
  canvasDefaultLabelStrokeMode,
  canvasDefaultLabelSizeMode,
  canvasDefaultCalloutTextSize,
  canvasDefaultLabelRotationDegrees,
  canvasDefaultAutoSegmentLabelRotation,
  canvasShowCalloutWireNames,
  canvasConnectorDrawingDisplayMode,
  canvasUseConsistentConnectorLayoutScale,
  canvasCalloutConnectorDrawingScalePercent,
  canvasGlobalRenderScalePercent,
  canvasZoomInvariantNodeShapes,
  canvasNodeShapeSizePercent,
  canvasExportFormat,
  canvasPngExportIncludeBackground,
  canvasExportIncludeFrame,
  canvasExportIncludeCartouche,
  canvasResizeBehaviorMode,
  canvasResetZoomPercentInput,
  showShortcutHints,
  keyboardShortcutsEnabled,
  restoreViewportOnUndo,
  showFloatingInspectorPanel,
  showRoutePreviewPanel,
  hideWireAnalysisRoutePanel,
  showMultiNetworkFunctionalAnalysisPanel,
  workspacePanelsLayoutMode,
  workspaceWideScreen,
  preferencesHydrated,
  setThemeMode,
  setLocale,
  setTableDensity,
  setTableFontSize,
  setWorkspaceCurrencyCode,
  setWorkspaceTaxEnabled,
  setWorkspaceTaxRatePercent,
  setTabularExportFormat,
  setBomExportCompactColumns,
  setBomTraceabilityLabelsHidden,
  setBomExportComputedDownstreamLoad,
  setWireExportStrippingAllowanceMm,
  setWireExportTwistedPairLengthCoefficient,
  setDefaultWireSectionMm2,
  setDefaultAutoCreateLinkedNodes,
  setSpliceSectionImbalanceRatioPercent,
  setDefaultSortField,
  setDefaultSortDirection,
  setDefaultIdSortDirection,
  setConnectorSort,
  setSpliceSort,
  setWireSort,
  setNetworkSort,
  setConnectorSynthesisSort,
  setSpliceSynthesisSort,
  setNodeIdSortDirection,
  setSegmentIdSortDirection,
  setCanvasDefaultShowGrid,
  setCanvasDefaultSnapToGrid,
  setCanvasDefaultLockEntityMovement,
  setCanvasDefaultShowInfoPanels,
  setCanvasDefaultShowSegmentNames,
  setCanvasDefaultShowSegmentLengths,
  setCanvasDefaultShowCableCallouts,
  setCanvasDefaultCalloutContentMode,
  setCanvasDefaultShowSelectedCalloutOnly,
  setCanvasDefaultLabelStrokeMode,
  setCanvasDefaultLabelSizeMode,
  setCanvasDefaultCalloutTextSize,
  setCanvasDefaultLabelRotationDegrees,
  setCanvasDefaultAutoSegmentLabelRotation,
  setCanvasShowCalloutWireNames,
  setCanvasConnectorDrawingDisplayMode,
  setCanvasUseConsistentConnectorLayoutScale,
  setCanvasCalloutConnectorDrawingScalePercent,
  setCanvasGlobalRenderScalePercent,
  setCanvasZoomInvariantNodeShapes,
  setCanvasNodeShapeSizePercent,
  setCanvasExportFormat,
  setCanvasPngExportIncludeBackground,
  setCanvasExportIncludeFrame,
  setCanvasExportIncludeCartouche,
  setCanvasResizeBehaviorMode,
  setShowNetworkGrid,
  setSnapNodesToGrid,
  setLockEntityMovement,
  setShowNetworkInfoPanels,
  setShowSegmentNames,
  setShowSegmentLengths,
  setShowCableCallouts,
  setNetworkCalloutContentMode,
  setShowSelectedCalloutOnly,
  setNetworkLabelStrokeMode,
  setNetworkLabelSizeMode,
  setNetworkCalloutTextSize,
  setNetworkLabelRotationDegrees,
  setNetworkAutoSegmentLabelRotation,
  setCanvasResetZoomPercentInput,
  setNetworkScale,
  setNetworkOffset,
  setShowShortcutHints,
  setKeyboardShortcutsEnabled,
  setRestoreViewportOnUndo,
  setShowFloatingInspectorPanel,
  setShowRoutePreviewPanel,
  setHideWireAnalysisRoutePanel,
  setShowMultiNetworkFunctionalAnalysisPanel,
  setWorkspacePanelsLayoutMode,
  setWorkspaceWideScreen,
  setPreferencesHydrated
}: UseUiPreferencesOptions): void {
  useEffect(() => {
    const preferences = readUiPreferences();
    if (preferences !== null) {
      const sortField = preferences.defaultSortField === "technicalId" ? "technicalId" : "name";
      const defaultWireSectionMm2Value = normalizeWireSectionMm2(preferences.defaultWireSectionMm2) ?? DEFAULT_WIRE_SECTION_MM2;
      const wireExportStrippingAllowanceMmValue = normalizeWireExportStrippingAllowanceMm(
        preferences.wireExportStrippingAllowanceMm
      );
      const wireExportTwistedPairLengthCoefficientValue = normalizeWireExportTwistedPairLengthCoefficient(
        preferences.wireExportTwistedPairLengthCoefficient
      );
      const defaultAutoCreateLinkedNodesValue =
        typeof preferences.defaultAutoCreateLinkedNodes === "boolean" ? preferences.defaultAutoCreateLinkedNodes : true;
      const spliceSectionImbalanceRatioPercentValue = normalizeSpliceSectionImbalanceRatioPercent(
        preferences.spliceSectionImbalanceRatioPercent
      );
      const sortDirection = preferences.defaultSortDirection === "desc" ? "desc" : "asc";
      const idSortDirection = preferences.defaultIdSortDirection === "desc" ? "desc" : "asc";
      const showGridDefault =
        typeof preferences.canvasDefaultShowGrid === "boolean" ? preferences.canvasDefaultShowGrid : true;
      const snapDefault =
        typeof preferences.canvasDefaultSnapToGrid === "boolean" ? preferences.canvasDefaultSnapToGrid : true;
      const lockMovementDefault =
        typeof preferences.canvasDefaultLockEntityMovement === "boolean"
          ? preferences.canvasDefaultLockEntityMovement
          : false;
      const showInfoPanelsDefault =
        typeof preferences.canvasDefaultShowInfoPanels === "boolean" ? preferences.canvasDefaultShowInfoPanels : true;
      const showSegmentNamesDefault =
        typeof preferences.canvasDefaultShowSegmentNames === "boolean"
          ? preferences.canvasDefaultShowSegmentNames
          : false;
      const showSegmentLengthsDefault =
        typeof preferences.canvasDefaultShowSegmentLengths === "boolean"
          ? preferences.canvasDefaultShowSegmentLengths
          : true;
      const showCableCalloutsDefault =
        typeof preferences.canvasDefaultShowCableCallouts === "boolean"
          ? preferences.canvasDefaultShowCableCallouts
          : false;
      const calloutContentModeDefault = normalizeNetworkCalloutContentMode(preferences.canvasDefaultCalloutContentMode);
      const showSelectedCalloutOnlyDefault =
        typeof preferences.canvasDefaultShowSelectedCalloutOnly === "boolean"
          ? preferences.canvasDefaultShowSelectedCalloutOnly
          : false;
      const labelStrokeModeDefault =
        preferences.canvasDefaultLabelStrokeMode === "none" || preferences.canvasDefaultLabelStrokeMode === "light"
          ? preferences.canvasDefaultLabelStrokeMode
          : "light";
      const labelSizeModeDefault = normalizeCanvasLabelSizeMode(preferences.canvasDefaultLabelSizeMode);
      const calloutTextSizeDefault = normalizeCanvasCalloutTextSize(preferences.canvasDefaultCalloutTextSize);
      const labelRotationDegreesDefault = normalizeCanvasLabelRotationDegrees(preferences.canvasDefaultLabelRotationDegrees);
      const autoSegmentLabelRotationDefault =
        typeof preferences.canvasDefaultAutoSegmentLabelRotation === "boolean"
          ? preferences.canvasDefaultAutoSegmentLabelRotation
          : true;
      const rawResetZoomPercent =
        typeof preferences.canvasResetZoomPercentInput === "string" ? preferences.canvasResetZoomPercentInput : "100";
      const parsedResetZoomPercent = Number(rawResetZoomPercent);
      const resetScale = Number.isFinite(parsedResetZoomPercent)
        ? clamp(parsedResetZoomPercent / 100, networkMinScale, networkMaxScale)
        : 1;

      setThemeMode(normalizeThemeMode(preferences.themeMode));
      setLocale(normalizeAppLocale(preferences.locale));
      setTableDensity(preferences.tableDensity === "comfortable" ? "comfortable" : "compact");
      setTableFontSize(
        preferences.tableFontSize === "small" || preferences.tableFontSize === "large"
          ? preferences.tableFontSize
          : "normal"
      );
      setWorkspaceCurrencyCode(normalizeWorkspaceCurrencyCode(preferences.workspaceCurrencyCode));
      setWorkspaceTaxEnabled(normalizeWorkspaceTaxEnabled(preferences.workspaceTaxEnabled));
      setWorkspaceTaxRatePercent(normalizeWorkspaceTaxRatePercent(preferences.workspaceTaxRatePercent));
      setTabularExportFormat(preferences.tabularExportFormat === "xlsx" ? "xlsx" : "csv");
      setBomExportCompactColumns(preferences.bomExportCompactColumns === true);
      setBomTraceabilityLabelsHidden(preferences.bomTraceabilityLabelsHidden === true);
      setBomExportComputedDownstreamLoad(preferences.bomExportComputedDownstreamLoad === true);
      setWireExportStrippingAllowanceMm(wireExportStrippingAllowanceMmValue);
      setWireExportTwistedPairLengthCoefficient(wireExportTwistedPairLengthCoefficientValue);
      setDefaultWireSectionMm2(defaultWireSectionMm2Value);
      setDefaultAutoCreateLinkedNodes(defaultAutoCreateLinkedNodesValue);
      setSpliceSectionImbalanceRatioPercent(spliceSectionImbalanceRatioPercentValue);
      setDefaultSortField(sortField);
      setDefaultSortDirection(sortDirection);
      setDefaultIdSortDirection(idSortDirection);
      setConnectorSort({ field: sortField, direction: sortDirection });
      setSpliceSort({ field: sortField, direction: sortDirection });
      setWireSort({ field: sortField, direction: sortDirection });
      setNetworkSort({ field: sortField, direction: sortDirection });
      setConnectorSynthesisSort({ field: sortField, direction: sortDirection });
      setSpliceSynthesisSort({ field: sortField, direction: sortDirection });
      setNodeIdSortDirection(idSortDirection);
      setSegmentIdSortDirection(idSortDirection);
      setCanvasDefaultShowGrid(showGridDefault);
      setCanvasDefaultSnapToGrid(snapDefault);
      setCanvasDefaultLockEntityMovement(lockMovementDefault);
      setCanvasDefaultShowInfoPanels(showInfoPanelsDefault);
      setCanvasDefaultShowSegmentNames(showSegmentNamesDefault);
      setCanvasDefaultShowSegmentLengths(showSegmentLengthsDefault);
      setCanvasDefaultShowCableCallouts(showCableCalloutsDefault);
      setCanvasDefaultCalloutContentMode(calloutContentModeDefault);
      setCanvasDefaultShowSelectedCalloutOnly(showSelectedCalloutOnlyDefault);
      setCanvasDefaultLabelStrokeMode(labelStrokeModeDefault);
      setCanvasDefaultLabelSizeMode(labelSizeModeDefault);
      setCanvasDefaultCalloutTextSize(calloutTextSizeDefault);
      setCanvasDefaultLabelRotationDegrees(labelRotationDegreesDefault);
      setCanvasDefaultAutoSegmentLabelRotation(autoSegmentLabelRotationDefault);
      setCanvasShowCalloutWireNames(
        typeof preferences.canvasShowCalloutWireNames === "boolean" ? preferences.canvasShowCalloutWireNames : false
      );
      setCanvasConnectorDrawingDisplayMode(
        normalizeConnectorDrawingDisplayMode(preferences.canvasConnectorDrawingDisplayMode)
      );
      setCanvasUseConsistentConnectorLayoutScale(
        typeof preferences.canvasUseConsistentConnectorLayoutScale === "boolean"
          ? preferences.canvasUseConsistentConnectorLayoutScale
          : true
      );
      setCanvasCalloutConnectorDrawingScalePercent(
        normalizeCanvasCalloutConnectorDrawingScalePercent(preferences.canvasCalloutConnectorDrawingScalePercent)
      );
      setCanvasGlobalRenderScalePercent(normalizeCanvasGlobalRenderScalePercent(preferences.canvasGlobalRenderScalePercent));
      setCanvasZoomInvariantNodeShapes(
        typeof preferences.canvasZoomInvariantNodeShapes === "boolean" ? preferences.canvasZoomInvariantNodeShapes : true
      );
      setCanvasNodeShapeSizePercent(normalizeCanvasNodeShapeSizePercent(preferences.canvasNodeShapeSizePercent));
      setCanvasExportFormat(normalizeCanvasExportFormat(preferences.canvasExportFormat));
      setCanvasPngExportIncludeBackground(
        typeof preferences.canvasPngExportIncludeBackground === "boolean"
          ? preferences.canvasPngExportIncludeBackground
          : true
      );
      setCanvasExportIncludeFrame(
        typeof preferences.canvasExportIncludeFrame === "boolean" ? preferences.canvasExportIncludeFrame : false
      );
      setCanvasExportIncludeCartouche(
        typeof preferences.canvasExportIncludeCartouche === "boolean" ? preferences.canvasExportIncludeCartouche : true
      );
      setCanvasResizeBehaviorMode(normalizeCanvasResizeBehaviorMode(preferences.canvasResizeBehaviorMode));
      setShowNetworkGrid(showGridDefault);
      setSnapNodesToGrid(snapDefault);
      setLockEntityMovement(lockMovementDefault);
      setShowNetworkInfoPanels(showInfoPanelsDefault);
      setShowSegmentNames(showSegmentNamesDefault);
      setShowSegmentLengths(showSegmentLengthsDefault);
      setShowCableCallouts(showCableCalloutsDefault);
      setNetworkCalloutContentMode(calloutContentModeDefault);
      setShowSelectedCalloutOnly(showSelectedCalloutOnlyDefault);
      setNetworkLabelStrokeMode(labelStrokeModeDefault);
      setNetworkLabelSizeMode(labelSizeModeDefault);
      setNetworkCalloutTextSize(calloutTextSizeDefault);
      setNetworkLabelRotationDegrees(labelRotationDegreesDefault);
      setNetworkAutoSegmentLabelRotation(autoSegmentLabelRotationDefault);
      setCanvasResetZoomPercentInput(rawResetZoomPercent);
      setNetworkScale(resetScale);
      setNetworkOffset({ x: 0, y: 0 });
      setShowShortcutHints(typeof preferences.showShortcutHints === "boolean" ? preferences.showShortcutHints : false);
      setKeyboardShortcutsEnabled(
        typeof preferences.keyboardShortcutsEnabled === "boolean" ? preferences.keyboardShortcutsEnabled : true
      );
      setRestoreViewportOnUndo(
        typeof preferences.restoreViewportOnUndo === "boolean" ? preferences.restoreViewportOnUndo : true
      );
      setShowFloatingInspectorPanel(
        typeof preferences.showFloatingInspectorPanel === "boolean" ? preferences.showFloatingInspectorPanel : true
      );
      setShowRoutePreviewPanel(
        typeof preferences.showRoutePreviewPanel === "boolean" ? preferences.showRoutePreviewPanel : false
      );
      setHideWireAnalysisRoutePanel(
        typeof preferences.hideWireAnalysisRoutePanel === "boolean" ? preferences.hideWireAnalysisRoutePanel : false
      );
      setShowMultiNetworkFunctionalAnalysisPanel(
        typeof preferences.showMultiNetworkFunctionalAnalysisPanel === "boolean"
          ? preferences.showMultiNetworkFunctionalAnalysisPanel
          : true
      );
      setWorkspacePanelsLayoutMode(normalizeWorkspacePanelsLayoutMode(preferences.workspacePanelsLayoutMode));
      setWorkspaceWideScreen(typeof preferences.workspaceWideScreen === "boolean" ? preferences.workspaceWideScreen : false);
    }

    setPreferencesHydrated(true);
  }, [
    networkMaxScale,
    networkMinScale,
    setCanvasDefaultShowGrid,
    setCanvasDefaultSnapToGrid,
    setCanvasDefaultLockEntityMovement,
    setCanvasDefaultShowInfoPanels,
    setCanvasDefaultShowSegmentNames,
    setCanvasDefaultShowSegmentLengths,
    setCanvasDefaultShowCableCallouts,
    setCanvasDefaultCalloutContentMode,
    setCanvasDefaultShowSelectedCalloutOnly,
    setCanvasDefaultLabelStrokeMode,
    setCanvasDefaultLabelSizeMode,
    setCanvasDefaultCalloutTextSize,
    setCanvasDefaultLabelRotationDegrees,
    setCanvasDefaultAutoSegmentLabelRotation,
    setCanvasShowCalloutWireNames,
    setCanvasConnectorDrawingDisplayMode,
    setCanvasUseConsistentConnectorLayoutScale,
    setCanvasCalloutConnectorDrawingScalePercent,
    setCanvasGlobalRenderScalePercent,
    setCanvasZoomInvariantNodeShapes,
    setCanvasNodeShapeSizePercent,
    setCanvasExportFormat,
    setCanvasPngExportIncludeBackground,
    setCanvasExportIncludeFrame,
    setCanvasExportIncludeCartouche,
    setCanvasResizeBehaviorMode,
    setCanvasResetZoomPercentInput,
    setConnectorSort,
    setDefaultIdSortDirection,
    setDefaultWireSectionMm2,
    setDefaultAutoCreateLinkedNodes,
    setSpliceSectionImbalanceRatioPercent,
    setDefaultSortDirection,
    setDefaultSortField,
    setNetworkSort,
    setKeyboardShortcutsEnabled,
    setNetworkOffset,
    setNetworkScale,
    setNodeIdSortDirection,
    setPreferencesHydrated,
    setRestoreViewportOnUndo,
    setSegmentIdSortDirection,
    setShowNetworkGrid,
    setShowNetworkInfoPanels,
    setShowSegmentNames,
    setShowFloatingInspectorPanel,
    setShowRoutePreviewPanel,
    setHideWireAnalysisRoutePanel,
    setShowMultiNetworkFunctionalAnalysisPanel,
    setShowShortcutHints,
    setShowSegmentLengths,
    setShowCableCallouts,
    setNetworkCalloutContentMode,
    setShowSelectedCalloutOnly,
    setNetworkLabelStrokeMode,
    setNetworkLabelSizeMode,
    setNetworkCalloutTextSize,
    setNetworkLabelRotationDegrees,
    setNetworkAutoSegmentLabelRotation,
    setSnapNodesToGrid,
    setLockEntityMovement,
    setSpliceSort,
    setSpliceSynthesisSort,
    setTableDensity,
    setTableFontSize,
    setTabularExportFormat,
    setBomExportCompactColumns,
    setBomTraceabilityLabelsHidden,
    setBomExportComputedDownstreamLoad,
    setWireExportStrippingAllowanceMm,
    setWireExportTwistedPairLengthCoefficient,
    setWorkspaceCurrencyCode,
    setWorkspaceTaxEnabled,
    setWorkspaceTaxRatePercent,
    setThemeMode,
    setLocale,
    setWireSort,
    setConnectorSynthesisSort,
    setWorkspacePanelsLayoutMode,
    setWorkspaceWideScreen
  ]);

  useEffect(() => {
    if (!preferencesHydrated) {
      return;
    }

    const payload: Omit<UiPreferencesPayload, "schemaVersion"> = {
      locale,
      themeMode,
      tableDensity,
      tableFontSize,
      workspaceCurrencyCode,
      workspaceTaxEnabled,
      workspaceTaxRatePercent,
      tabularExportFormat,
      bomExportCompactColumns,
      bomTraceabilityLabelsHidden,
      bomExportComputedDownstreamLoad,
      wireExportStrippingAllowanceMm,
      wireExportTwistedPairLengthCoefficient,
      defaultWireSectionMm2,
      defaultAutoCreateLinkedNodes,
      spliceSectionImbalanceRatioPercent,
      defaultSortField,
      defaultSortDirection,
      defaultIdSortDirection,
      canvasDefaultShowGrid,
      canvasDefaultSnapToGrid,
      canvasDefaultLockEntityMovement,
      canvasDefaultShowInfoPanels,
      canvasDefaultShowSegmentNames,
      canvasDefaultShowSegmentLengths,
      canvasDefaultShowCableCallouts,
      canvasDefaultCalloutContentMode,
      canvasDefaultShowSelectedCalloutOnly,
      canvasDefaultLabelStrokeMode,
      canvasDefaultLabelSizeMode,
      canvasDefaultCalloutTextSize,
      canvasDefaultLabelRotationDegrees,
      canvasDefaultAutoSegmentLabelRotation,
      canvasShowCalloutWireNames,
      canvasConnectorDrawingDisplayMode,
      canvasUseConsistentConnectorLayoutScale,
      canvasCalloutConnectorDrawingScalePercent,
      canvasGlobalRenderScalePercent,
      canvasZoomInvariantNodeShapes,
      canvasNodeShapeSizePercent,
      canvasExportFormat,
      canvasPngExportIncludeBackground,
      canvasExportIncludeFrame,
      canvasExportIncludeCartouche,
      canvasResizeBehaviorMode,
      canvasResetZoomPercentInput,
      showShortcutHints,
      keyboardShortcutsEnabled,
      restoreViewportOnUndo,
      showFloatingInspectorPanel,
      showRoutePreviewPanel,
      hideWireAnalysisRoutePanel,
      showMultiNetworkFunctionalAnalysisPanel,
      workspacePanelsLayoutMode,
      workspaceWideScreen
    };

    writeUiPreferences(payload);
  }, [
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    canvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentNames,
    canvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts,
    canvasDefaultCalloutContentMode,
    canvasDefaultShowSelectedCalloutOnly,
    canvasDefaultLabelStrokeMode,
    canvasDefaultLabelSizeMode,
    canvasDefaultCalloutTextSize,
    canvasDefaultLabelRotationDegrees,
    canvasDefaultAutoSegmentLabelRotation,
    canvasShowCalloutWireNames,
    canvasConnectorDrawingDisplayMode,
    canvasUseConsistentConnectorLayoutScale,
    canvasCalloutConnectorDrawingScalePercent,
    canvasGlobalRenderScalePercent,
    canvasZoomInvariantNodeShapes,
    canvasNodeShapeSizePercent,
    canvasExportFormat,
    canvasPngExportIncludeBackground,
    canvasExportIncludeFrame,
    canvasExportIncludeCartouche,
    canvasResizeBehaviorMode,
    canvasResetZoomPercentInput,
    defaultIdSortDirection,
    defaultSortDirection,
    defaultSortField,
    keyboardShortcutsEnabled,
    preferencesHydrated,
    restoreViewportOnUndo,
    showFloatingInspectorPanel,
    showRoutePreviewPanel,
    hideWireAnalysisRoutePanel,
    showMultiNetworkFunctionalAnalysisPanel,
    showShortcutHints,
    tableDensity,
    tableFontSize,
    workspaceCurrencyCode,
    workspaceTaxEnabled,
    workspaceTaxRatePercent,
    tabularExportFormat,
    bomExportCompactColumns,
    bomExportComputedDownstreamLoad,
    bomTraceabilityLabelsHidden,
    wireExportStrippingAllowanceMm,
    wireExportTwistedPairLengthCoefficient,
    defaultWireSectionMm2,
    defaultAutoCreateLinkedNodes,
    spliceSectionImbalanceRatioPercent,
    themeMode,
    locale,
    workspacePanelsLayoutMode,
    workspaceWideScreen
  ]);
}
