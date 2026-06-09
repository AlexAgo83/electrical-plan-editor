import type { ThemeMode } from "../../store";
import type {
  AppLocale,
  CanvasCalloutTextSize,
  CanvasExportFormat,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  CanvasResizeBehaviorMode,
  ConnectorDrawingDisplayMode,
  NetworkCalloutContentMode,
  TableFontSize,
  TabularExportFormat,
  WorkspaceCurrencyCode,
  WorkspacePanelsLayoutMode
} from "../types/app-controller";

const UI_PREFERENCES_SCHEMA_VERSION = 15;
const UI_PREFERENCES_STORAGE_KEY = "electrical-plan-editor.ui-preferences.v1";

type TableDensity = "comfortable" | "compact";
type TableFontSizePreference = TableFontSize;
type WorkspacePanelsLayoutPreference = WorkspacePanelsLayoutMode;
type SortField = "name" | "technicalId" | "lengthMm";
type SortDirection = "asc" | "desc";

export interface UiPreferencesPayload {
  schemaVersion: number;
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
  canvasDefaultCalloutContentMode?: NetworkCalloutContentMode;
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
  workspacePanelsLayoutMode: WorkspacePanelsLayoutPreference;
  workspaceWideScreen: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function migrateUiPreferencesFromV1(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    canvasDefaultShowSegmentNames:
      typeof candidate.canvasDefaultShowSegmentNames === "boolean" ? candidate.canvasDefaultShowSegmentNames : false,
    schemaVersion: 2
  };
}

function migrateUiPreferencesFromV2(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    tabularExportFormat: typeof candidate.tabularExportFormat === "string" ? candidate.tabularExportFormat : "csv",
    schemaVersion: 3
  };
}

function migrateUiPreferencesFromV3(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    tabularExportFormat: typeof candidate.tabularExportFormat === "string" ? candidate.tabularExportFormat : "csv",
    schemaVersion: 4
  };
}

function migrateUiPreferencesFromV4(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    bomExportCompactColumns: typeof candidate.bomExportCompactColumns === "boolean" ? candidate.bomExportCompactColumns : false,
    schemaVersion: 5
  };
}

function migrateUiPreferencesFromV5(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    spliceSectionImbalanceRatioPercent:
      typeof candidate.spliceSectionImbalanceRatioPercent === "number"
        ? candidate.spliceSectionImbalanceRatioPercent
        : 300,
    schemaVersion: 6
  };
}

function migrateUiPreferencesFromV6(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    bomTraceabilityLabelsHidden:
      typeof candidate.bomTraceabilityLabelsHidden === "boolean" ? candidate.bomTraceabilityLabelsHidden : false,
    schemaVersion: 7
  };
}

function migrateUiPreferencesFromV7(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    showRoutePreviewPanel: typeof candidate.showRoutePreviewPanel === "boolean" ? candidate.showRoutePreviewPanel : false,
    schemaVersion: 8
  };
}

function migrateUiPreferencesFromV8(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    canvasCalloutConnectorDrawingScalePercent:
      typeof candidate.canvasCalloutConnectorDrawingScalePercent === "number"
        ? candidate.canvasCalloutConnectorDrawingScalePercent
        : 150,
    schemaVersion: 9
  };
}

function migrateUiPreferencesFromV9(candidate: Record<string, unknown>): Record<string, unknown> {
  const legacyMode = candidate.canvasDefaultCalloutContentMode;
  return {
    ...candidate,
    canvasConnectorDrawingDisplayMode:
      legacyMode === "connectorDrawing" || legacyMode === "both" ? "nodes" : "disabled",
    schemaVersion: 10
  };
}

function migrateUiPreferencesFromV10(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    canvasGlobalRenderScalePercent:
      typeof candidate.canvasGlobalRenderScalePercent === "number" ? candidate.canvasGlobalRenderScalePercent : 0,
    schemaVersion: 11
  };
}

function migrateUiPreferencesFromV11(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    canvasResetZoomPercentInput:
      candidate.canvasResetZoomPercentInput === "60" || typeof candidate.canvasResetZoomPercentInput !== "string"
        ? "100"
        : candidate.canvasResetZoomPercentInput,
    schemaVersion: 12
  };
}

function migrateUiPreferencesFromV12(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    hideWireAnalysisRoutePanel:
      typeof candidate.hideWireAnalysisRoutePanel === "boolean" ? candidate.hideWireAnalysisRoutePanel : false,
    schemaVersion: 13
  };
}

function migrateUiPreferencesFromV13(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    canvasUseConsistentConnectorLayoutScale:
      typeof candidate.canvasUseConsistentConnectorLayoutScale === "boolean"
        ? candidate.canvasUseConsistentConnectorLayoutScale
        : true,
    schemaVersion: 14
  };
}

function migrateUiPreferencesFromV14(candidate: Record<string, unknown>): Record<string, unknown> {
  return {
    ...candidate,
    bomExportComputedDownstreamLoad:
      typeof candidate.bomExportComputedDownstreamLoad === "boolean"
        ? candidate.bomExportComputedDownstreamLoad
        : false,
    schemaVersion: 15
  };
}

function migrateUiPreferencesPayload(parsed: unknown): Partial<UiPreferencesPayload> | null {
  if (!isRecord(parsed)) {
    return null;
  }

  const rawSchemaVersion = parsed.schemaVersion;
  let version =
    typeof rawSchemaVersion === "number" && Number.isInteger(rawSchemaVersion) && rawSchemaVersion >= 1
      ? rawSchemaVersion
      : 1;

  if (version > UI_PREFERENCES_SCHEMA_VERSION) {
    return null;
  }

  let migrated: Record<string, unknown> = { ...parsed };
  while (version < UI_PREFERENCES_SCHEMA_VERSION) {
    if (version === 1) {
      migrated = migrateUiPreferencesFromV1(migrated);
      version = 2;
      continue;
    }
    if (version === 2) {
      migrated = migrateUiPreferencesFromV2(migrated);
      version = 3;
      continue;
    }
    if (version === 3) {
      migrated = migrateUiPreferencesFromV3(migrated);
      version = 4;
      continue;
    }
    if (version === 4) {
      migrated = migrateUiPreferencesFromV4(migrated);
      version = 5;
      continue;
    }
    if (version === 5) {
      migrated = migrateUiPreferencesFromV5(migrated);
      version = 6;
      continue;
    }
    if (version === 6) {
      migrated = migrateUiPreferencesFromV6(migrated);
      version = 7;
      continue;
    }
    if (version === 7) {
      migrated = migrateUiPreferencesFromV7(migrated);
      version = 8;
      continue;
    }
    if (version === 8) {
      migrated = migrateUiPreferencesFromV8(migrated);
      version = 9;
      continue;
    }
    if (version === 9) {
      migrated = migrateUiPreferencesFromV9(migrated);
      version = 10;
      continue;
    }
    if (version === 10) {
      migrated = migrateUiPreferencesFromV10(migrated);
      version = 11;
      continue;
    }
    if (version === 11) {
      migrated = migrateUiPreferencesFromV11(migrated);
      version = 12;
      continue;
    }
    if (version === 12) {
      migrated = migrateUiPreferencesFromV12(migrated);
      version = 13;
      continue;
    }
    if (version === 13) {
      migrated = migrateUiPreferencesFromV13(migrated);
      version = 14;
      continue;
    }
    if (version === 14) {
      migrated = migrateUiPreferencesFromV14(migrated);
      version = 15;
      continue;
    }
    return null;
  }

  migrated.schemaVersion = UI_PREFERENCES_SCHEMA_VERSION;
  return migrated;
}

export function readUiPreferences(): Partial<UiPreferencesPayload> | null {
  try {
    const raw = localStorage.getItem(UI_PREFERENCES_STORAGE_KEY);
    if (raw === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return migrateUiPreferencesPayload(parsed);
  } catch {
    return null;
  }
}

export function writeUiPreferences(payload: Omit<UiPreferencesPayload, "schemaVersion">): void {
  try {
    localStorage.setItem(
      UI_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: UI_PREFERENCES_SCHEMA_VERSION,
        ...payload
      })
    );
  } catch {
    // Ignore storage write failures to preserve runtime behavior.
  }
}
