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
    | "networkNodePositions"
    | "connectorMap"
    | "spliceMap"
    | "configuredResetScale"
    | "networkScale"
    | "networkOffset"
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
      setCanvasResetZoomPercentInput: canvasDisplayState.setCanvasResetZoomPercentInput,
      setCanvasPngExportIncludeBackground: preferencesState.setCanvasPngExportIncludeBackground,
      setCanvasExportIncludeFrame: preferencesState.setCanvasExportIncludeFrame,
      setCanvasExportIncludeCartouche: preferencesState.setCanvasExportIncludeCartouche,
      setCanvasResizeBehaviorMode: preferencesState.setCanvasResizeBehaviorMode,
      setShowShortcutHints: preferencesState.setShowShortcutHints,
      setKeyboardShortcutsEnabled: preferencesState.setKeyboardShortcutsEnabled,
      setShowFloatingInspectorPanel: preferencesState.setShowFloatingInspectorPanel,
      setWorkspacePanelsLayoutMode: preferencesState.setWorkspacePanelsLayoutMode,
      setWorkspaceWideScreen: preferencesState.setWorkspaceWideScreen
    }
  });
}
