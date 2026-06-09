import { useAppControllerWorkspaceHandlersAssembly } from "./useAppControllerHeavyHookAssemblers";
import type { NetworkScopeFormStateModel } from "../useNetworkScopeFormState";
import type { AppControllerCanvasDisplayStateModel } from "../useAppControllerCanvasDisplayState";
import type { AppControllerPreferencesStateModel } from "../useAppControllerPreferencesState";

type WorkspaceHandlersAssemblyParams = Parameters<typeof useAppControllerWorkspaceHandlersAssembly>[0];

type SortSetters = Pick<
  WorkspaceHandlersAssemblyParams["sortSetters"],
  | "setConnectorSort"
  | "setSpliceSort"
  | "setWireSort"
  | "setConnectorSynthesisSort"
  | "setSpliceSynthesisSort"
  | "setNodeIdSortDirection"
  | "setSegmentIdSortDirection"
>;

interface UseAppControllerWorkspaceHandlersDomainAssemblyParams {
  base: Pick<
    WorkspaceHandlersAssemblyParams["base"],
    "store" | "networks" | "dispatchAction" | "replaceStateWithHistory"
  >;
  requestConfirmation: WorkspaceHandlersAssemblyParams["base"]["confirmAction"];
  networkScopeFormState: NetworkScopeFormStateModel;
  workspace: Pick<
    WorkspaceHandlersAssemblyParams["workspace"],
    | "isCurrentWorkspaceEmpty"
    | "hasBuiltInSampleState"
    | "nodes"
    | "segments"
    | "networkNodePositions"
    | "connectorMap"
    | "spliceMap"
    | "configuredResetScale"
    | "setNetworkScale"
    | "setNetworkOffset"
  > & {
    networkViewWidth: number;
    networkViewHeight: number;
  };
  canvasDisplayState: AppControllerCanvasDisplayStateModel;
  canvasViewportSetters: Pick<
    WorkspaceHandlersAssemblyParams["canvasDefaults"],
    "setShowNetworkGrid" | "setSnapNodesToGrid" | "setLockEntityMovement"
  >;
  sortSetters: SortSetters;
  preferencesState: AppControllerPreferencesStateModel;
}

export function useAppControllerWorkspaceHandlersDomainAssembly({
  base,
  requestConfirmation,
  networkScopeFormState,
  workspace,
  canvasDisplayState,
  canvasViewportSetters,
  sortSetters,
  preferencesState
}: UseAppControllerWorkspaceHandlersDomainAssemblyParams) {
  return useAppControllerWorkspaceHandlersAssembly({
    base: {
      ...base,
      confirmAction: requestConfirmation
    },
    networkForm: {
      newNetworkName: networkScopeFormState.newNetworkName,
      setNewNetworkName: networkScopeFormState.setNewNetworkName,
      newNetworkTechnicalId: networkScopeFormState.newNetworkTechnicalId,
      setNewNetworkTechnicalId: networkScopeFormState.setNewNetworkTechnicalId,
      newNetworkCreatedAtDate: networkScopeFormState.newNetworkCreatedAtDate,
      setNewNetworkCreatedAtDate: networkScopeFormState.setNewNetworkCreatedAtDate,
      newNetworkDescription: networkScopeFormState.newNetworkDescription,
      setNewNetworkDescription: networkScopeFormState.setNewNetworkDescription,
      newNetworkAuthor: networkScopeFormState.newNetworkAuthor,
      setNewNetworkAuthor: networkScopeFormState.setNewNetworkAuthor,
      newNetworkVoltageV: networkScopeFormState.newNetworkVoltageV,
      setNewNetworkVoltageV: networkScopeFormState.setNewNetworkVoltageV,
      newNetworkProjectCode: networkScopeFormState.newNetworkProjectCode,
      setNewNetworkProjectCode: networkScopeFormState.setNewNetworkProjectCode,
      newNetworkLogoUrl: networkScopeFormState.newNetworkLogoUrl,
      setNewNetworkLogoUrl: networkScopeFormState.setNewNetworkLogoUrl,
      newNetworkExportNotes: networkScopeFormState.newNetworkExportNotes,
      setNewNetworkExportNotes: networkScopeFormState.setNewNetworkExportNotes,
      setNetworkFormError: networkScopeFormState.setNetworkFormError
    },
    workspace: {
      ...workspace
    },
    canvasDefaults: {
      showCableCallouts: canvasDisplayState.showCableCallouts,
      networkCalloutTextSize: canvasDisplayState.networkCalloutTextSize,
      setShowNetworkGrid: canvasViewportSetters.setShowNetworkGrid,
      setSnapNodesToGrid: canvasViewportSetters.setSnapNodesToGrid,
      setLockEntityMovement: canvasViewportSetters.setLockEntityMovement,
      setShowNetworkInfoPanels: canvasDisplayState.setShowNetworkInfoPanels,
      setShowSegmentNames: canvasDisplayState.setShowSegmentNames,
      setShowSegmentLengths: canvasDisplayState.setShowSegmentLengths,
      setShowCableCallouts: canvasDisplayState.setShowCableCallouts,
      setNetworkCalloutContentMode: canvasDisplayState.setNetworkCalloutContentMode,
      setShowSelectedCalloutOnly: canvasDisplayState.setShowSelectedCalloutOnly,
      setNetworkLabelStrokeMode: canvasDisplayState.setNetworkLabelStrokeMode,
      setNetworkLabelSizeMode: canvasDisplayState.setNetworkLabelSizeMode,
      setNetworkCalloutTextSize: canvasDisplayState.setNetworkCalloutTextSize,
      setNetworkLabelRotationDegrees: canvasDisplayState.setNetworkLabelRotationDegrees,
      setNetworkAutoSegmentLabelRotation: canvasDisplayState.setNetworkAutoSegmentLabelRotation
    },
    sortSetters: {
      ...sortSetters,
      setNetworkSort: preferencesState.setNetworkSort
    },
    preferenceSetters: {
      setThemeMode: preferencesState.setThemeMode,
      setLocale: preferencesState.setLocale,
      setTableDensity: preferencesState.setTableDensity,
      setTableFontSize: preferencesState.setTableFontSize,
      setWorkspaceCurrencyCode: preferencesState.setWorkspaceCurrencyCode,
      setWorkspaceTaxEnabled: preferencesState.setWorkspaceTaxEnabled,
      setWorkspaceTaxRatePercent: preferencesState.setWorkspaceTaxRatePercent,
      setBomTraceabilityLabelsHidden: preferencesState.setBomTraceabilityLabelsHidden,
      setDefaultWireSectionMm2: preferencesState.setDefaultWireSectionMm2,
      setDefaultAutoCreateLinkedNodes: preferencesState.setDefaultAutoCreateLinkedNodes,
      setDefaultSortField: preferencesState.setDefaultSortField,
      setDefaultSortDirection: preferencesState.setDefaultSortDirection,
      setDefaultIdSortDirection: preferencesState.setDefaultIdSortDirection,
      setCanvasDefaultShowGrid: preferencesState.setCanvasDefaultShowGrid,
      setCanvasDefaultSnapToGrid: preferencesState.setCanvasDefaultSnapToGrid,
      setCanvasDefaultLockEntityMovement: preferencesState.setCanvasDefaultLockEntityMovement,
      setCanvasDefaultShowInfoPanels: preferencesState.setCanvasDefaultShowInfoPanels,
      setCanvasDefaultShowSegmentNames: preferencesState.setCanvasDefaultShowSegmentNames,
      setCanvasDefaultShowSegmentLengths: preferencesState.setCanvasDefaultShowSegmentLengths,
      setCanvasDefaultShowCableCallouts: preferencesState.setCanvasDefaultShowCableCallouts,
      setCanvasDefaultCalloutContentMode: preferencesState.setCanvasDefaultCalloutContentMode,
      setCanvasDefaultShowSelectedCalloutOnly: preferencesState.setCanvasDefaultShowSelectedCalloutOnly,
      setCanvasDefaultLabelStrokeMode: preferencesState.setCanvasDefaultLabelStrokeMode,
      setCanvasDefaultLabelSizeMode: preferencesState.setCanvasDefaultLabelSizeMode,
      setCanvasDefaultCalloutTextSize: preferencesState.setCanvasDefaultCalloutTextSize,
      setCanvasDefaultLabelRotationDegrees: preferencesState.setCanvasDefaultLabelRotationDegrees,
      setCanvasDefaultAutoSegmentLabelRotation: preferencesState.setCanvasDefaultAutoSegmentLabelRotation,
      setCanvasShowCalloutWireNames: preferencesState.setCanvasShowCalloutWireNames,
      setCanvasConnectorDrawingDisplayMode: preferencesState.setCanvasConnectorDrawingDisplayMode,
      setCanvasGlobalRenderScalePercent: preferencesState.setCanvasGlobalRenderScalePercent,
      setCanvasZoomInvariantNodeShapes: preferencesState.setCanvasZoomInvariantNodeShapes,
      setCanvasNodeShapeSizePercent: preferencesState.setCanvasNodeShapeSizePercent,
      setCanvasExportFormat: preferencesState.setCanvasExportFormat,
      setCanvasResetZoomPercentInput: canvasDisplayState.setCanvasResetZoomPercentInput,
      setCanvasPngExportIncludeBackground: preferencesState.setCanvasPngExportIncludeBackground,
      setCanvasExportIncludeFrame: preferencesState.setCanvasExportIncludeFrame,
      setCanvasExportIncludeCartouche: preferencesState.setCanvasExportIncludeCartouche,
      setCanvasResizeBehaviorMode: preferencesState.setCanvasResizeBehaviorMode,
      setShowShortcutHints: preferencesState.setShowShortcutHints,
      setKeyboardShortcutsEnabled: preferencesState.setKeyboardShortcutsEnabled,
      setRestoreViewportOnUndo: preferencesState.setRestoreViewportOnUndo,
      setShowFloatingInspectorPanel: preferencesState.setShowFloatingInspectorPanel,
      setShowRoutePreviewPanel: preferencesState.setShowRoutePreviewPanel,
      setHideWireAnalysisRoutePanel: preferencesState.setHideWireAnalysisRoutePanel,
      setShowMultiNetworkFunctionalAnalysisPanel: preferencesState.setShowMultiNetworkFunctionalAnalysisPanel,
      setWorkspacePanelsLayoutMode: preferencesState.setWorkspacePanelsLayoutMode,
      setWorkspaceWideScreen: preferencesState.setWorkspaceWideScreen
    }
  });
}
