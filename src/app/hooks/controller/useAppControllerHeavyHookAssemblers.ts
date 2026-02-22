import { useCanvasInteractionHandlers } from "../useCanvasInteractionHandlers";
import { useSelectionHandlers } from "../useSelectionHandlers";
import { useWorkspaceHandlers } from "../useWorkspaceHandlers";

type WorkspaceHandlersParams = Parameters<typeof useWorkspaceHandlers>[0];
type SelectionHandlersParams = Parameters<typeof useSelectionHandlers>[0];
type CanvasInteractionHandlersParams = Parameters<typeof useCanvasInteractionHandlers>[0];

interface UseAppControllerWorkspaceHandlersAssemblyParams {
  base: Pick<WorkspaceHandlersParams, "store" | "networks" | "dispatchAction" | "replaceStateWithHistory">;
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
    | "configuredResetScale"
    | "setNetworkScale"
    | "setNetworkOffset"
  >;
  canvasDefaults: Pick<
    WorkspaceHandlersParams,
    | "canvasDefaultShowGrid"
    | "canvasDefaultSnapToGrid"
    | "canvasDefaultShowInfoPanels"
    | "canvasDefaultShowSegmentLengths"
    | "canvasDefaultLabelStrokeMode"
    | "setShowNetworkGrid"
    | "setSnapNodesToGrid"
    | "setShowNetworkInfoPanels"
    | "setShowSegmentLengths"
    | "setNetworkLabelStrokeMode"
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
    | "setDefaultSortField"
    | "setDefaultSortDirection"
    | "setDefaultIdSortDirection"
    | "setCanvasDefaultShowGrid"
    | "setCanvasDefaultSnapToGrid"
    | "setCanvasDefaultShowInfoPanels"
    | "setCanvasDefaultShowSegmentLengths"
    | "setCanvasDefaultLabelStrokeMode"
    | "setCanvasResetZoomPercentInput"
    | "setShowShortcutHints"
    | "setKeyboardShortcutsEnabled"
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
  navigation: Pick<SelectionHandlersParams, "setActiveScreen" | "setActiveSubScreen">;
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
    "startConnectorEdit" | "startSpliceEdit" | "startNodeEdit" | "startSegmentEdit" | "startWireEdit"
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
    | "modeAnchorNodeId"
    | "setModeAnchorNodeId"
    | "isModelingScreen"
    | "activeSubScreen"
    | "setActiveScreen"
    | "setActiveSubScreen"
  >;
  segmentForm: Pick<
    CanvasInteractionHandlersParams,
    "setSegmentFormMode" | "setEditingSegmentId" | "setSegmentFormError" | "setSegmentNodeA" | "setSegmentNodeB"
  >;
  routePreview: Pick<
    CanvasInteractionHandlersParams,
    "setRoutePreviewStartNodeId" | "routePreviewStartNodeId" | "setRoutePreviewEndNodeId" | "routePreviewEndNodeId"
  >;
  wireForm: Pick<
    CanvasInteractionHandlersParams,
    | "setWireFormMode"
    | "setEditingWireId"
    | "setWireFormError"
    | "setWireEndpointAKind"
    | "setWireEndpointAConnectorId"
    | "setWireEndpointASpliceId"
    | "setWireEndpointBKind"
    | "setWireEndpointBConnectorId"
    | "setWireEndpointBSpliceId"
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
  >;
}

export function useAppControllerCanvasInteractionHandlersAssembly({
  core,
  segmentForm,
  routePreview,
  wireForm,
  nodeForm,
  viewport,
  actions
}: UseAppControllerCanvasInteractionHandlersAssemblyParams) {
  return useCanvasInteractionHandlers({
    ...core,
    ...segmentForm,
    ...routePreview,
    ...wireForm,
    ...nodeForm,
    ...viewport,
    ...actions
  });
}
