import type { NodePosition } from "../../types/app-controller";
import type { AppControllerCanvasDisplayStateModel } from "../useAppControllerCanvasDisplayState";
import type { AppControllerPreferencesStateModel } from "../useAppControllerPreferencesState";
import { useUiPreferences } from "../useUiPreferences";

type UseUiPreferencesOptions = Parameters<typeof useUiPreferences>[0];

interface UseAppControllerUiPreferencesBindingsParams {
  networkMinScale: number;
  networkMaxScale: number;
  preferencesState: AppControllerPreferencesStateModel;
  canvasDisplayState: AppControllerCanvasDisplayStateModel;
  setConnectorSort: UseUiPreferencesOptions["setConnectorSort"];
  setSpliceSort: UseUiPreferencesOptions["setSpliceSort"];
  setNodeIdSortDirection: UseUiPreferencesOptions["setNodeIdSortDirection"];
  setSegmentIdSortDirection: UseUiPreferencesOptions["setSegmentIdSortDirection"];
  setWireSort: UseUiPreferencesOptions["setWireSort"];
  setConnectorSynthesisSort: UseUiPreferencesOptions["setConnectorSynthesisSort"];
  setSpliceSynthesisSort: UseUiPreferencesOptions["setSpliceSynthesisSort"];
  setShowNetworkGrid: UseUiPreferencesOptions["setShowNetworkGrid"];
  setSnapNodesToGrid: UseUiPreferencesOptions["setSnapNodesToGrid"];
  setLockEntityMovement: UseUiPreferencesOptions["setLockEntityMovement"];
  setNetworkScale: UseUiPreferencesOptions["setNetworkScale"];
  setNetworkOffset: (value: NodePosition) => void;
}

export function useAppControllerUiPreferencesBindings({
  networkMinScale,
  networkMaxScale,
  preferencesState,
  canvasDisplayState,
  setConnectorSort,
  setSpliceSort,
  setNodeIdSortDirection,
  setSegmentIdSortDirection,
  setWireSort,
  setConnectorSynthesisSort,
  setSpliceSynthesisSort,
  setShowNetworkGrid,
  setSnapNodesToGrid,
  setLockEntityMovement,
  setNetworkScale,
  setNetworkOffset
}: UseAppControllerUiPreferencesBindingsParams) {
  useUiPreferences({
    networkMinScale,
    networkMaxScale,
    locale: preferencesState.locale,
    themeMode: preferencesState.themeMode,
    tableDensity: preferencesState.tableDensity,
    tableFontSize: preferencesState.tableFontSize,
    workspaceCurrencyCode: preferencesState.workspaceCurrencyCode,
    workspaceTaxEnabled: preferencesState.workspaceTaxEnabled,
    workspaceTaxRatePercent: preferencesState.workspaceTaxRatePercent,
    defaultWireSectionMm2: preferencesState.defaultWireSectionMm2,
    defaultAutoCreateLinkedNodes: preferencesState.defaultAutoCreateLinkedNodes,
    defaultSortField: preferencesState.defaultSortField,
    defaultSortDirection: preferencesState.defaultSortDirection,
    defaultIdSortDirection: preferencesState.defaultIdSortDirection,
    canvasDefaultShowGrid: preferencesState.canvasDefaultShowGrid,
    canvasDefaultSnapToGrid: preferencesState.canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement: preferencesState.canvasDefaultLockEntityMovement,
    canvasDefaultShowInfoPanels: preferencesState.canvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentNames: preferencesState.canvasDefaultShowSegmentNames,
    canvasDefaultShowSegmentLengths: preferencesState.canvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts: preferencesState.canvasDefaultShowCableCallouts,
    canvasDefaultShowSelectedCalloutOnly: preferencesState.canvasDefaultShowSelectedCalloutOnly,
    canvasDefaultLabelStrokeMode: preferencesState.canvasDefaultLabelStrokeMode,
    canvasDefaultLabelSizeMode: preferencesState.canvasDefaultLabelSizeMode,
    canvasDefaultCalloutTextSize: preferencesState.canvasDefaultCalloutTextSize,
    canvasDefaultLabelRotationDegrees: preferencesState.canvasDefaultLabelRotationDegrees,
    canvasDefaultAutoSegmentLabelRotation: preferencesState.canvasDefaultAutoSegmentLabelRotation,
    canvasShowCalloutWireNames: preferencesState.canvasShowCalloutWireNames,
    canvasZoomInvariantNodeShapes: preferencesState.canvasZoomInvariantNodeShapes,
    canvasNodeShapeSizePercent: preferencesState.canvasNodeShapeSizePercent,
    canvasExportFormat: preferencesState.canvasExportFormat,
    canvasPngExportIncludeBackground: preferencesState.canvasPngExportIncludeBackground,
    canvasExportIncludeFrame: preferencesState.canvasExportIncludeFrame,
    canvasExportIncludeCartouche: preferencesState.canvasExportIncludeCartouche,
    canvasResizeBehaviorMode: preferencesState.canvasResizeBehaviorMode,
    canvasResetZoomPercentInput: canvasDisplayState.canvasResetZoomPercentInput,
    showShortcutHints: preferencesState.showShortcutHints,
    keyboardShortcutsEnabled: preferencesState.keyboardShortcutsEnabled,
    showFloatingInspectorPanel: preferencesState.showFloatingInspectorPanel,
    workspacePanelsLayoutMode: preferencesState.workspacePanelsLayoutMode,
    workspaceWideScreen: preferencesState.workspaceWideScreen,
    preferencesHydrated: preferencesState.preferencesHydrated,
    setLocale: preferencesState.setLocale,
    setTableDensity: preferencesState.setTableDensity,
    setTableFontSize: preferencesState.setTableFontSize,
    setWorkspaceCurrencyCode: preferencesState.setWorkspaceCurrencyCode,
    setWorkspaceTaxEnabled: preferencesState.setWorkspaceTaxEnabled,
    setWorkspaceTaxRatePercent: preferencesState.setWorkspaceTaxRatePercent,
    setDefaultWireSectionMm2: preferencesState.setDefaultWireSectionMm2,
    setDefaultAutoCreateLinkedNodes: preferencesState.setDefaultAutoCreateLinkedNodes,
    setDefaultSortField: preferencesState.setDefaultSortField,
    setDefaultSortDirection: preferencesState.setDefaultSortDirection,
    setDefaultIdSortDirection: preferencesState.setDefaultIdSortDirection,
    setConnectorSort,
    setSpliceSort,
    setWireSort,
    setNetworkSort: preferencesState.setNetworkSort,
    setConnectorSynthesisSort,
    setSpliceSynthesisSort,
    setNodeIdSortDirection,
    setSegmentIdSortDirection,
    setCanvasDefaultShowGrid: preferencesState.setCanvasDefaultShowGrid,
    setCanvasDefaultSnapToGrid: preferencesState.setCanvasDefaultSnapToGrid,
    setCanvasDefaultLockEntityMovement: preferencesState.setCanvasDefaultLockEntityMovement,
    setCanvasDefaultShowInfoPanels: preferencesState.setCanvasDefaultShowInfoPanels,
    setCanvasDefaultShowSegmentNames: preferencesState.setCanvasDefaultShowSegmentNames,
    setCanvasDefaultShowSegmentLengths: preferencesState.setCanvasDefaultShowSegmentLengths,
    setCanvasDefaultShowCableCallouts: preferencesState.setCanvasDefaultShowCableCallouts,
    setCanvasDefaultShowSelectedCalloutOnly: preferencesState.setCanvasDefaultShowSelectedCalloutOnly,
    setCanvasDefaultLabelStrokeMode: preferencesState.setCanvasDefaultLabelStrokeMode,
    setCanvasDefaultLabelSizeMode: preferencesState.setCanvasDefaultLabelSizeMode,
    setCanvasDefaultCalloutTextSize: preferencesState.setCanvasDefaultCalloutTextSize,
    setCanvasDefaultLabelRotationDegrees: preferencesState.setCanvasDefaultLabelRotationDegrees,
    setCanvasDefaultAutoSegmentLabelRotation: preferencesState.setCanvasDefaultAutoSegmentLabelRotation,
    setCanvasShowCalloutWireNames: preferencesState.setCanvasShowCalloutWireNames,
    setCanvasZoomInvariantNodeShapes: preferencesState.setCanvasZoomInvariantNodeShapes,
    setCanvasNodeShapeSizePercent: preferencesState.setCanvasNodeShapeSizePercent,
    setCanvasExportFormat: preferencesState.setCanvasExportFormat,
    setCanvasPngExportIncludeBackground: preferencesState.setCanvasPngExportIncludeBackground,
    setCanvasExportIncludeFrame: preferencesState.setCanvasExportIncludeFrame,
    setCanvasExportIncludeCartouche: preferencesState.setCanvasExportIncludeCartouche,
    setCanvasResizeBehaviorMode: preferencesState.setCanvasResizeBehaviorMode,
    setShowNetworkGrid,
    setSnapNodesToGrid,
    setLockEntityMovement,
    setShowNetworkInfoPanels: canvasDisplayState.setShowNetworkInfoPanels,
    setShowSegmentNames: canvasDisplayState.setShowSegmentNames,
    setShowSegmentLengths: canvasDisplayState.setShowSegmentLengths,
    setShowCableCallouts: canvasDisplayState.setShowCableCallouts,
    setShowSelectedCalloutOnly: canvasDisplayState.setShowSelectedCalloutOnly,
    setNetworkLabelStrokeMode: canvasDisplayState.setNetworkLabelStrokeMode,
    setNetworkLabelSizeMode: canvasDisplayState.setNetworkLabelSizeMode,
    setNetworkCalloutTextSize: canvasDisplayState.setNetworkCalloutTextSize,
    setNetworkLabelRotationDegrees: canvasDisplayState.setNetworkLabelRotationDegrees,
    setNetworkAutoSegmentLabelRotation: canvasDisplayState.setNetworkAutoSegmentLabelRotation,
    setCanvasResetZoomPercentInput: canvasDisplayState.setCanvasResetZoomPercentInput,
    setNetworkScale,
    setNetworkOffset,
    setShowShortcutHints: preferencesState.setShowShortcutHints,
    setKeyboardShortcutsEnabled: preferencesState.setKeyboardShortcutsEnabled,
    setShowFloatingInspectorPanel: preferencesState.setShowFloatingInspectorPanel,
    setWorkspacePanelsLayoutMode: preferencesState.setWorkspacePanelsLayoutMode,
    setWorkspaceWideScreen: preferencesState.setWorkspaceWideScreen,
    setThemeMode: preferencesState.setThemeMode,
    setPreferencesHydrated: preferencesState.setPreferencesHydrated
  });
}
