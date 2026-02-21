import { useEffect } from "react";
import type { ThemeMode } from "../../store";

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
    default:
      return "normal";
  }
}

type TableDensity = "comfortable" | "compact";
type SortField = "name" | "technicalId";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

interface UiPreferencesPayload {
  schemaVersion: number;
  themeMode: ThemeMode;
  tableDensity: TableDensity;
  defaultSortField: SortField;
  defaultSortDirection: SortDirection;
  defaultIdSortDirection: SortDirection;
  canvasDefaultShowGrid: boolean;
  canvasDefaultSnapToGrid: boolean;
  canvasResetZoomPercentInput: string;
  showShortcutHints: boolean;
  keyboardShortcutsEnabled: boolean;
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
  defaultSortField: SortField;
  defaultSortDirection: SortDirection;
  defaultIdSortDirection: SortDirection;
  canvasDefaultShowGrid: boolean;
  canvasDefaultSnapToGrid: boolean;
  canvasResetZoomPercentInput: string;
  showShortcutHints: boolean;
  keyboardShortcutsEnabled: boolean;
  preferencesHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setTableDensity: (density: TableDensity) => void;
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
  setShowNetworkGrid: (value: boolean) => void;
  setSnapNodesToGrid: (value: boolean) => void;
  setCanvasResetZoomPercentInput: (value: string) => void;
  setNetworkScale: (value: number) => void;
  setNetworkOffset: (value: { x: number; y: number }) => void;
  setShowShortcutHints: (value: boolean) => void;
  setKeyboardShortcutsEnabled: (value: boolean) => void;
  setPreferencesHydrated: (value: boolean) => void;
}

export function useUiPreferences({
  networkMinScale,
  networkMaxScale,
  themeMode,
  tableDensity,
  defaultSortField,
  defaultSortDirection,
  defaultIdSortDirection,
  canvasDefaultShowGrid,
  canvasDefaultSnapToGrid,
  canvasResetZoomPercentInput,
  showShortcutHints,
  keyboardShortcutsEnabled,
  preferencesHydrated,
  setThemeMode,
  setTableDensity,
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
  setShowNetworkGrid,
  setSnapNodesToGrid,
  setCanvasResetZoomPercentInput,
  setNetworkScale,
  setNetworkOffset,
  setShowShortcutHints,
  setKeyboardShortcutsEnabled,
  setPreferencesHydrated
}: UseUiPreferencesOptions): void {
  useEffect(() => {
    const preferences = readUiPreferences();
    if (preferences !== null) {
      const sortField = preferences.defaultSortField === "technicalId" ? "technicalId" : "name";
      const sortDirection = preferences.defaultSortDirection === "desc" ? "desc" : "asc";
      const idSortDirection = preferences.defaultIdSortDirection === "desc" ? "desc" : "asc";
      const showGridDefault =
        typeof preferences.canvasDefaultShowGrid === "boolean" ? preferences.canvasDefaultShowGrid : true;
      const snapDefault =
        typeof preferences.canvasDefaultSnapToGrid === "boolean" ? preferences.canvasDefaultSnapToGrid : true;
      const rawResetZoomPercent =
        typeof preferences.canvasResetZoomPercentInput === "string" ? preferences.canvasResetZoomPercentInput : "100";
      const parsedResetZoomPercent = Number(rawResetZoomPercent);
      const resetScale = Number.isFinite(parsedResetZoomPercent)
        ? clamp(parsedResetZoomPercent / 100, networkMinScale, networkMaxScale)
        : 1;

      setThemeMode(normalizeThemeMode(preferences.themeMode));
      setTableDensity(preferences.tableDensity === "compact" ? "compact" : "comfortable");
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
      setShowNetworkGrid(showGridDefault);
      setSnapNodesToGrid(snapDefault);
      setCanvasResetZoomPercentInput(rawResetZoomPercent);
      setNetworkScale(resetScale);
      setNetworkOffset({ x: 0, y: 0 });
      setShowShortcutHints(typeof preferences.showShortcutHints === "boolean" ? preferences.showShortcutHints : false);
      setKeyboardShortcutsEnabled(
        typeof preferences.keyboardShortcutsEnabled === "boolean" ? preferences.keyboardShortcutsEnabled : true
      );
    }

    setPreferencesHydrated(true);
  }, [
    networkMaxScale,
    networkMinScale,
    setCanvasDefaultShowGrid,
    setCanvasDefaultSnapToGrid,
    setCanvasResetZoomPercentInput,
    setConnectorSort,
    setDefaultIdSortDirection,
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
    setShowShortcutHints,
    setSnapNodesToGrid,
    setSpliceSort,
    setSpliceSynthesisSort,
    setTableDensity,
    setThemeMode,
    setWireSort,
    setConnectorSynthesisSort
  ]);

  useEffect(() => {
    if (!preferencesHydrated) {
      return;
    }

    const payload: UiPreferencesPayload = {
      schemaVersion: UI_PREFERENCES_SCHEMA_VERSION,
      themeMode,
      tableDensity,
      defaultSortField,
      defaultSortDirection,
      defaultIdSortDirection,
      canvasDefaultShowGrid,
      canvasDefaultSnapToGrid,
      canvasResetZoomPercentInput,
      showShortcutHints,
      keyboardShortcutsEnabled
    };

    try {
      localStorage.setItem(UI_PREFERENCES_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage write failures to preserve runtime behavior.
    }
  }, [
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasResetZoomPercentInput,
    defaultIdSortDirection,
    defaultSortDirection,
    defaultSortField,
    keyboardShortcutsEnabled,
    preferencesHydrated,
    showShortcutHints,
    tableDensity,
    themeMode
  ]);
}
