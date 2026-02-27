import { useCanvasInteractionHandlers } from "../useCanvasInteractionHandlers";
import { useSelectionHandlers } from "../useSelectionHandlers";
import { useWorkspaceHandlers } from "../useWorkspaceHandlers";

type WorkspaceHandlersParams = Parameters<typeof useWorkspaceHandlers>[0];
type SelectionHandlersParams = Parameters<typeof useSelectionHandlers>[0];
type CanvasInteractionHandlersParams = Parameters<typeof useCanvasInteractionHandlers>[0];

interface UseAppControllerWorkspaceHandlersAssemblyParams {
  base: Pick<WorkspaceHandlersParams, "store" | "networks" | "dispatchAction" | "replaceStateWithHistory" | "confirmAction">;
  networkForm: Pick<
    WorkspaceHandlersParams,
    | "newNetworkName"
    | "setNewNetworkName"
    | "newNetworkTechnicalId"
    | "setNewNetworkTechnicalId"
    | "newNetworkDescription"
    | "setNewNetworkDescription"
    | "setNetworkFormError"
  >;
  workspace: Pick<
    WorkspaceHandlersParams,
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
  >;
  canvasDefaults: Pick<
    WorkspaceHandlersParams,
    | "canvasDefaultShowGrid"
    | "canvasDefaultSnapToGrid"
    | "canvasDefaultLockEntityMovement"
    | "canvasDefaultShowInfoPanels"
    | "canvasDefaultShowSegmentLengths"
    | "canvasDefaultShowCableCallouts"
    | "canvasDefaultLabelStrokeMode"
    | "canvasDefaultLabelSizeMode"
    | "canvasDefaultCalloutTextSize"
    | "canvasDefaultLabelRotationDegrees"
    | "canvasDefaultAutoSegmentLabelRotation"
    | "showCableCallouts"
    | "networkCalloutTextSize"
    | "setShowNetworkGrid"
    | "setSnapNodesToGrid"
    | "setLockEntityMovement"
    | "setShowNetworkInfoPanels"
    | "setShowSegmentLengths"
    | "setShowCableCallouts"
    | "setNetworkLabelStrokeMode"
    | "setNetworkLabelSizeMode"
    | "setNetworkCalloutTextSize"
    | "setNetworkLabelRotationDegrees"
    | "setNetworkAutoSegmentLabelRotation"
  >;
  sortDefaults: Pick<WorkspaceHandlersParams, "defaultSortField" | "defaultSortDirection" | "defaultIdSortDirection">;
  sortSetters: Pick<
    WorkspaceHandlersParams,
    | "setConnectorSort"
    | "setSpliceSort"
    | "setWireSort"
    | "setConnectorSynthesisSort"
    | "setSpliceSynthesisSort"
    | "setNetworkSort"
    | "setNodeIdSortDirection"
    | "setSegmentIdSortDirection"
  >;
  preferenceSetters: Pick<
    WorkspaceHandlersParams,
    | "setThemeMode"
    | "setTableDensity"
    | "setTableFontSize"
    | "setWorkspaceCurrencyCode"
    | "setWorkspaceTaxEnabled"
    | "setWorkspaceTaxRatePercent"
    | "setDefaultWireSectionMm2"
    | "setDefaultAutoCreateLinkedNodes"
    | "setDefaultSortField"
    | "setDefaultSortDirection"
    | "setDefaultIdSortDirection"
    | "setCanvasDefaultShowGrid"
    | "setCanvasDefaultSnapToGrid"
    | "setCanvasDefaultLockEntityMovement"
    | "setCanvasDefaultShowInfoPanels"
    | "setCanvasDefaultShowSegmentLengths"
    | "setCanvasDefaultShowCableCallouts"
    | "setCanvasDefaultLabelStrokeMode"
    | "setCanvasDefaultLabelSizeMode"
    | "setCanvasDefaultCalloutTextSize"
    | "setCanvasDefaultLabelRotationDegrees"
    | "setCanvasDefaultAutoSegmentLabelRotation"
    | "setCanvasResetZoomPercentInput"
    | "setCanvasPngExportIncludeBackground"
    | "setShowShortcutHints"
    | "setKeyboardShortcutsEnabled"
    | "setShowFloatingInspectorPanel"
    | "setWorkspacePanelsLayoutMode"
  >;
}

export function useAppControllerWorkspaceHandlersAssembly({
  base,
  networkForm,
  workspace,
  canvasDefaults,
  sortDefaults,
  sortSetters,
  preferenceSetters
}: UseAppControllerWorkspaceHandlersAssemblyParams) {
  return useWorkspaceHandlers({
    ...base,
    ...networkForm,
    ...workspace,
    ...canvasDefaults,
    ...sortDefaults,
    ...sortSetters,
    ...preferenceSetters
  });
}

interface UseAppControllerSelectionHandlersAssemblyParams {
  core: Pick<
    SelectionHandlersParams,
    | "state"
    | "dispatchAction"
    | "segmentMap"
    | "networkNodePositions"
    | "connectorNodeByConnectorId"
    | "spliceNodeBySpliceId"
  >;
  canvasFocus: Pick<
    SelectionHandlersParams,
    "setInteractionMode" | "networkScale" | "setNetworkScale" | "setNetworkOffset"
  >;
  selection: Pick<
    SelectionHandlersParams,
    | "selected"
    | "selectedSubScreen"
    | "selectedConnector"
    | "selectedSplice"
    | "selectedNode"
    | "selectedSegment"
    | "selectedWire"
  >;
  navigation: Pick<SelectionHandlersParams, "setActiveScreen" | "setActiveSubScreen" | "markDetailPanelsSelectionSourceAsTable">;
  validation: Pick<
    SelectionHandlersParams,
    | "orderedValidationIssues"
    | "visibleValidationIssues"
    | "getFocusedValidationIssueByCursor"
    | "setValidationIssueCursorFromIssue"
    | "setValidationSearchQuery"
    | "setValidationCategoryFilter"
    | "setValidationSeverityFilter"
  >;
  editActions: Pick<
    SelectionHandlersParams,
    | "startConnectorEdit"
    | "startCatalogEditFromValidation"
    | "startSpliceEdit"
    | "startNodeEdit"
    | "startSegmentEdit"
    | "startWireEdit"
  >;
}

export function useAppControllerSelectionHandlersAssembly({
  core,
  canvasFocus,
  selection,
  navigation,
  validation,
  editActions
}: UseAppControllerSelectionHandlersAssemblyParams) {
  return useSelectionHandlers({
    ...core,
    ...canvasFocus,
    ...selection,
    ...navigation,
    ...validation,
    ...editActions
  });
}

interface UseAppControllerCanvasInteractionHandlersAssemblyParams {
  core: Pick<
    CanvasInteractionHandlersParams,
    | "state"
    | "nodesCount"
    | "interactionMode"
    | "isModelingScreen"
    | "activeSubScreen"
    | "setActiveScreen"
    | "setActiveSubScreen"
  >;
  nodeForm: Pick<
    CanvasInteractionHandlersParams,
    | "setNodeFormMode"
    | "setEditingNodeId"
    | "setNodeKind"
    | "setNodeIdInput"
    | "setNodeConnectorId"
    | "setNodeSpliceId"
    | "setNodeLabel"
    | "setNodeFormError"
    | "setPendingNewNodePosition"
  >;
  viewport: Pick<
    CanvasInteractionHandlersParams,
    | "snapNodesToGrid"
    | "lockEntityMovement"
    | "networkOffset"
    | "networkScale"
    | "setNetworkScale"
    | "setNetworkOffset"
    | "draggingNodeId"
    | "setDraggingNodeId"
    | "manualNodePositions"
    | "setManualNodePositions"
    | "setIsPanningNetwork"
    | "panStartRef"
  >;
  actions: Pick<
    CanvasInteractionHandlersParams,
    | "dispatchAction"
    | "persistNodePosition"
    | "resetNetworkViewToConfiguredScale"
    | "startConnectorEdit"
    | "startSpliceEdit"
    | "startNodeEdit"
    | "startSegmentEdit"
    | "onExternalSelectionInteraction"
  >;
}

export function useAppControllerCanvasInteractionHandlersAssembly({
  core,
  nodeForm,
  viewport,
  actions
}: UseAppControllerCanvasInteractionHandlersAssemblyParams) {
  return useCanvasInteractionHandlers({
    ...core,
    ...nodeForm,
    ...viewport,
    ...actions
  });
}
