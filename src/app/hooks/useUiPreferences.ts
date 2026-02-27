import { useEffect } from "react";
import { DEFAULT_WIRE_SECTION_MM2, normalizeWireSectionMm2 } from "../../core/wireSection";
import type { ThemeMode } from "../../store";
import type {
  CanvasCalloutTextSize,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  TableFontSize,
  WorkspaceCurrencyCode,
  WorkspacePanelsLayoutMode
} from "../types/app-controller";

const UI_PREFERENCES_SCHEMA_VERSION = 1;
const UI_PREFERENCES_STORAGE_KEY = "electrical-plan-editor.ui-preferences.v1";

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
      return "normal";
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

interface UiPreferencesPayload {
  schemaVersion: number;
  themeMode: ThemeMode;
  tableDensity: TableDensity;
  tableFontSize: TableFontSizePreference;
  workspaceCurrencyCode: WorkspaceCurrencyCode;
  workspaceTaxEnabled: boolean;
  workspaceTaxRatePercent: number;
  defaultWireSectionMm2: number;
  defaultAutoCreateLinkedNodes: boolean;
  defaultSortField: SortField;
  defaultSortDirection: SortDirection;
  defaultIdSortDirection: SortDirection;
  canvasDefaultShowGrid: boolean;
  canvasDefaultSnapToGrid: boolean;
  canvasDefaultLockEntityMovement: boolean;
  canvasDefaultShowInfoPanels: boolean;
  canvasDefaultShowSegmentLengths: boolean;
  canvasDefaultShowCableCallouts: boolean;
  canvasDefaultLabelStrokeMode: CanvasLabelStrokeMode;
  canvasDefaultLabelSizeMode: CanvasLabelSizeMode;
  canvasDefaultCalloutTextSize: CanvasCalloutTextSize;
  canvasDefaultLabelRotationDegrees: CanvasLabelRotationDegrees;
  canvasDefaultAutoSegmentLabelRotation: boolean;
  canvasPngExportIncludeBackground: boolean;
  canvasResetZoomPercentInput: string;
  showShortcutHints: boolean;
  keyboardShortcutsEnabled: boolean;
  showFloatingInspectorPanel: boolean;
  workspacePanelsLayoutMode: WorkspacePanelsLayoutPreference;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readUiPreferences(): Partial<UiPreferencesPayload> | null {
  try {
    const raw = localStorage.getItem(UI_PREFERENCES_STORAGE_KEY);
    if (raw === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const payload = parsed as Partial<UiPreferencesPayload>;
    if (payload.schemaVersion !== UI_PREFERENCES_SCHEMA_VERSION) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

interface UseUiPreferencesOptions {
  networkMinScale: number;
  networkMaxScale: number;
  themeMode: ThemeMode;
  tableDensity: TableDensity;
  tableFontSize: TableFontSizePreference;
  workspaceCurrencyCode: WorkspaceCurrencyCode;
  workspaceTaxEnabled: boolean;
  workspaceTaxRatePercent: number;
  defaultWireSectionMm2: number;
  defaultAutoCreateLinkedNodes: boolean;
  defaultSortField: SortField;
  defaultSortDirection: SortDirection;
  defaultIdSortDirection: SortDirection;
  canvasDefaultShowGrid: boolean;
  canvasDefaultSnapToGrid: boolean;
  canvasDefaultLockEntityMovement: boolean;
  canvasDefaultShowInfoPanels: boolean;
  canvasDefaultShowSegmentLengths: boolean;
  canvasDefaultShowCableCallouts: boolean;
  canvasDefaultLabelStrokeMode: CanvasLabelStrokeMode;
  canvasDefaultLabelSizeMode: CanvasLabelSizeMode;
  canvasDefaultCalloutTextSize: CanvasCalloutTextSize;
  canvasDefaultLabelRotationDegrees: CanvasLabelRotationDegrees;
  canvasDefaultAutoSegmentLabelRotation: boolean;
  canvasPngExportIncludeBackground: boolean;
  canvasResetZoomPercentInput: string;
  showShortcutHints: boolean;
  keyboardShortcutsEnabled: boolean;
  showFloatingInspectorPanel: boolean;
  workspacePanelsLayoutMode: WorkspacePanelsLayoutPreference;
  preferencesHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setTableDensity: (density: TableDensity) => void;
  setTableFontSize: (value: TableFontSizePreference) => void;
  setWorkspaceCurrencyCode: (value: WorkspaceCurrencyCode) => void;
  setWorkspaceTaxEnabled: (value: boolean) => void;
  setWorkspaceTaxRatePercent: (value: number) => void;
  setDefaultWireSectionMm2: (value: number) => void;
  setDefaultAutoCreateLinkedNodes: (value: boolean) => void;
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
  setCanvasDefaultShowSegmentLengths: (value: boolean) => void;
  setCanvasDefaultShowCableCallouts: (value: boolean) => void;
  setCanvasDefaultLabelStrokeMode: (value: CanvasLabelStrokeMode) => void;
  setCanvasDefaultLabelSizeMode: (value: CanvasLabelSizeMode) => void;
  setCanvasDefaultCalloutTextSize: (value: CanvasCalloutTextSize) => void;
  setCanvasDefaultLabelRotationDegrees: (value: CanvasLabelRotationDegrees) => void;
  setCanvasDefaultAutoSegmentLabelRotation: (value: boolean) => void;
  setCanvasPngExportIncludeBackground: (value: boolean) => void;
  setShowNetworkGrid: (value: boolean) => void;
  setSnapNodesToGrid: (value: boolean) => void;
  setLockEntityMovement: (value: boolean) => void;
  setShowNetworkInfoPanels: (value: boolean) => void;
  setShowSegmentLengths: (value: boolean) => void;
  setShowCableCallouts: (value: boolean) => void;
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
  setShowFloatingInspectorPanel: (value: boolean) => void;
  setWorkspacePanelsLayoutMode: (value: WorkspacePanelsLayoutPreference) => void;
  setPreferencesHydrated: (value: boolean) => void;
}

function normalizeCanvasLabelSizeMode(value: unknown): CanvasLabelSizeMode {
  return value === "extraSmall" ||
    value === "small" ||
    value === "large" ||
    value === "extraLarge"
    ? value
    : "normal";
}

function normalizeCanvasCalloutTextSize(value: unknown): CanvasCalloutTextSize {
  return value === "small" || value === "large" ? value : "normal";
}

function normalizeCanvasLabelRotationDegrees(value: unknown): CanvasLabelRotationDegrees {
  return value === -90 || value === -45 || value === -20 || value === 0 || value === 20 || value === 45 || value === 90
    ? value
    : 0;
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

export function useUiPreferences({
  networkMinScale,
  networkMaxScale,
  themeMode,
  tableDensity,
  tableFontSize,
  workspaceCurrencyCode,
  workspaceTaxEnabled,
  workspaceTaxRatePercent,
  defaultWireSectionMm2,
  defaultAutoCreateLinkedNodes,
  defaultSortField,
  defaultSortDirection,
  defaultIdSortDirection,
  canvasDefaultShowGrid,
  canvasDefaultSnapToGrid,
  canvasDefaultLockEntityMovement,
  canvasDefaultShowInfoPanels,
  canvasDefaultShowSegmentLengths,
  canvasDefaultShowCableCallouts,
  canvasDefaultLabelStrokeMode,
  canvasDefaultLabelSizeMode,
  canvasDefaultCalloutTextSize,
  canvasDefaultLabelRotationDegrees,
  canvasDefaultAutoSegmentLabelRotation,
  canvasPngExportIncludeBackground,
  canvasResetZoomPercentInput,
  showShortcutHints,
  keyboardShortcutsEnabled,
  showFloatingInspectorPanel,
  workspacePanelsLayoutMode,
  preferencesHydrated,
  setThemeMode,
  setTableDensity,
  setTableFontSize,
  setWorkspaceCurrencyCode,
  setWorkspaceTaxEnabled,
  setWorkspaceTaxRatePercent,
  setDefaultWireSectionMm2,
  setDefaultAutoCreateLinkedNodes,
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
  setCanvasDefaultShowSegmentLengths,
  setCanvasDefaultShowCableCallouts,
  setCanvasDefaultLabelStrokeMode,
  setCanvasDefaultLabelSizeMode,
  setCanvasDefaultCalloutTextSize,
  setCanvasDefaultLabelRotationDegrees,
  setCanvasDefaultAutoSegmentLabelRotation,
  setCanvasPngExportIncludeBackground,
  setShowNetworkGrid,
  setSnapNodesToGrid,
  setLockEntityMovement,
  setShowNetworkInfoPanels,
  setShowSegmentLengths,
  setShowCableCallouts,
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
  setShowFloatingInspectorPanel,
  setWorkspacePanelsLayoutMode,
  setPreferencesHydrated
}: UseUiPreferencesOptions): void {
  useEffect(() => {
    const preferences = readUiPreferences();
    if (preferences !== null) {
      const sortField = preferences.defaultSortField === "technicalId" ? "technicalId" : "name";
      const defaultWireSectionMm2Value = normalizeWireSectionMm2(preferences.defaultWireSectionMm2) ?? DEFAULT_WIRE_SECTION_MM2;
      const defaultAutoCreateLinkedNodesValue =
        typeof preferences.defaultAutoCreateLinkedNodes === "boolean" ? preferences.defaultAutoCreateLinkedNodes : true;
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
      const showSegmentLengthsDefault =
        typeof preferences.canvasDefaultShowSegmentLengths === "boolean"
          ? preferences.canvasDefaultShowSegmentLengths
          : false;
      const showCableCalloutsDefault =
        typeof preferences.canvasDefaultShowCableCallouts === "boolean"
          ? preferences.canvasDefaultShowCableCallouts
          : false;
      const labelStrokeModeDefault =
        preferences.canvasDefaultLabelStrokeMode === "none" || preferences.canvasDefaultLabelStrokeMode === "light"
          ? preferences.canvasDefaultLabelStrokeMode
          : "normal";
      const labelSizeModeDefault = normalizeCanvasLabelSizeMode(preferences.canvasDefaultLabelSizeMode);
      const calloutTextSizeDefault = normalizeCanvasCalloutTextSize(preferences.canvasDefaultCalloutTextSize);
      const labelRotationDegreesDefault = normalizeCanvasLabelRotationDegrees(preferences.canvasDefaultLabelRotationDegrees);
      const autoSegmentLabelRotationDefault =
        typeof preferences.canvasDefaultAutoSegmentLabelRotation === "boolean"
          ? preferences.canvasDefaultAutoSegmentLabelRotation
          : false;
      const rawResetZoomPercent =
        typeof preferences.canvasResetZoomPercentInput === "string" ? preferences.canvasResetZoomPercentInput : "100";
      const parsedResetZoomPercent = Number(rawResetZoomPercent);
      const resetScale = Number.isFinite(parsedResetZoomPercent)
        ? clamp(parsedResetZoomPercent / 100, networkMinScale, networkMaxScale)
        : 1;

      setThemeMode(normalizeThemeMode(preferences.themeMode));
      setTableDensity(preferences.tableDensity === "comfortable" ? "comfortable" : "compact");
      setTableFontSize(
        preferences.tableFontSize === "small" || preferences.tableFontSize === "large"
          ? preferences.tableFontSize
          : "normal"
      );
      setWorkspaceCurrencyCode(normalizeWorkspaceCurrencyCode(preferences.workspaceCurrencyCode));
      setWorkspaceTaxEnabled(normalizeWorkspaceTaxEnabled(preferences.workspaceTaxEnabled));
      setWorkspaceTaxRatePercent(normalizeWorkspaceTaxRatePercent(preferences.workspaceTaxRatePercent));
      setDefaultWireSectionMm2(defaultWireSectionMm2Value);
      setDefaultAutoCreateLinkedNodes(defaultAutoCreateLinkedNodesValue);
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
      setCanvasDefaultShowSegmentLengths(showSegmentLengthsDefault);
      setCanvasDefaultShowCableCallouts(showCableCalloutsDefault);
      setCanvasDefaultLabelStrokeMode(labelStrokeModeDefault);
      setCanvasDefaultLabelSizeMode(labelSizeModeDefault);
      setCanvasDefaultCalloutTextSize(calloutTextSizeDefault);
      setCanvasDefaultLabelRotationDegrees(labelRotationDegreesDefault);
      setCanvasDefaultAutoSegmentLabelRotation(autoSegmentLabelRotationDefault);
      setCanvasPngExportIncludeBackground(
        typeof preferences.canvasPngExportIncludeBackground === "boolean"
          ? preferences.canvasPngExportIncludeBackground
          : true
      );
      setShowNetworkGrid(showGridDefault);
      setSnapNodesToGrid(snapDefault);
      setLockEntityMovement(lockMovementDefault);
      setShowNetworkInfoPanels(showInfoPanelsDefault);
      setShowSegmentLengths(showSegmentLengthsDefault);
      setShowCableCallouts(showCableCalloutsDefault);
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
      setShowFloatingInspectorPanel(
        typeof preferences.showFloatingInspectorPanel === "boolean" ? preferences.showFloatingInspectorPanel : true
      );
      setWorkspacePanelsLayoutMode(normalizeWorkspacePanelsLayoutMode(preferences.workspacePanelsLayoutMode));
    }

    setPreferencesHydrated(true);
  }, [
    networkMaxScale,
    networkMinScale,
    setCanvasDefaultShowGrid,
    setCanvasDefaultSnapToGrid,
    setCanvasDefaultLockEntityMovement,
    setCanvasDefaultShowInfoPanels,
    setCanvasDefaultShowSegmentLengths,
    setCanvasDefaultShowCableCallouts,
    setCanvasDefaultLabelStrokeMode,
    setCanvasDefaultLabelSizeMode,
    setCanvasDefaultCalloutTextSize,
    setCanvasDefaultLabelRotationDegrees,
    setCanvasDefaultAutoSegmentLabelRotation,
    setCanvasPngExportIncludeBackground,
    setCanvasResetZoomPercentInput,
    setConnectorSort,
    setDefaultIdSortDirection,
    setDefaultWireSectionMm2,
    setDefaultAutoCreateLinkedNodes,
    setDefaultSortDirection,
    setDefaultSortField,
    setNetworkSort,
    setKeyboardShortcutsEnabled,
    setNetworkOffset,
    setNetworkScale,
    setNodeIdSortDirection,
    setPreferencesHydrated,
    setSegmentIdSortDirection,
    setShowNetworkGrid,
    setShowNetworkInfoPanels,
    setShowFloatingInspectorPanel,
    setShowShortcutHints,
    setShowSegmentLengths,
    setShowCableCallouts,
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
    setWorkspaceCurrencyCode,
    setWorkspaceTaxEnabled,
    setWorkspaceTaxRatePercent,
    setThemeMode,
    setWireSort,
    setConnectorSynthesisSort,
    setWorkspacePanelsLayoutMode
  ]);

  useEffect(() => {
    if (!preferencesHydrated) {
      return;
    }

    const payload: UiPreferencesPayload = {
      schemaVersion: UI_PREFERENCES_SCHEMA_VERSION,
      themeMode,
      tableDensity,
      tableFontSize,
      workspaceCurrencyCode,
      workspaceTaxEnabled,
      workspaceTaxRatePercent,
      defaultWireSectionMm2,
      defaultAutoCreateLinkedNodes,
      defaultSortField,
      defaultSortDirection,
      defaultIdSortDirection,
      canvasDefaultShowGrid,
      canvasDefaultSnapToGrid,
      canvasDefaultLockEntityMovement,
      canvasDefaultShowInfoPanels,
      canvasDefaultShowSegmentLengths,
      canvasDefaultShowCableCallouts,
      canvasDefaultLabelStrokeMode,
      canvasDefaultLabelSizeMode,
      canvasDefaultCalloutTextSize,
      canvasDefaultLabelRotationDegrees,
      canvasDefaultAutoSegmentLabelRotation,
      canvasPngExportIncludeBackground,
      canvasResetZoomPercentInput,
      showShortcutHints,
      keyboardShortcutsEnabled,
      showFloatingInspectorPanel,
      workspacePanelsLayoutMode
    };

    try {
      localStorage.setItem(UI_PREFERENCES_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage write failures to preserve runtime behavior.
    }
  }, [
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    canvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts,
    canvasDefaultLabelStrokeMode,
    canvasDefaultLabelSizeMode,
    canvasDefaultCalloutTextSize,
    canvasDefaultLabelRotationDegrees,
    canvasDefaultAutoSegmentLabelRotation,
    canvasPngExportIncludeBackground,
    canvasResetZoomPercentInput,
    defaultIdSortDirection,
    defaultSortDirection,
    defaultSortField,
    keyboardShortcutsEnabled,
    preferencesHydrated,
    showFloatingInspectorPanel,
    showShortcutHints,
    tableDensity,
    tableFontSize,
    workspaceCurrencyCode,
    workspaceTaxEnabled,
    workspaceTaxRatePercent,
    defaultWireSectionMm2,
    defaultAutoCreateLinkedNodes,
    themeMode,
    workspacePanelsLayoutMode
  ]);
}
