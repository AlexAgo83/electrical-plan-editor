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
    | "newNetworkCreatedAtDate"
    | "setNewNetworkCreatedAtDate"
    | "newNetworkDescription"
    | "setNewNetworkDescription"
    | "newNetworkAuthor"
    | "setNewNetworkAuthor"
    | "newNetworkVoltageV"
    | "setNewNetworkVoltageV"
    | "newNetworkProjectCode"
    | "setNewNetworkProjectCode"
    | "newNetworkLogoUrl"
    | "setNewNetworkLogoUrl"
    | "newNetworkExportNotes"
    | "setNewNetworkExportNotes"
    | "setNetworkFormError"
  >;
  workspace: Pick<
    WorkspaceHandlersParams,
    | "isCurrentWorkspaceEmpty"
    | "hasBuiltInSampleState"
    | "nodes"
    | "segments"
    | "networkNodePositions"
    | "connectorMap"
    | "spliceMap"
    | "configuredResetScale"
    | "networkViewWidth"
    | "networkViewHeight"
    | "setNetworkScale"
    | "setNetworkOffset"
  >;
  canvasDefaults: Pick<
    WorkspaceHandlersParams,
    | "showSegmentDressings"
    | "showCableCallouts"
    | "networkCalloutTextSize"
    | "setShowNetworkGrid"
    | "setSnapNodesToGrid"
    | "setLockEntityMovement"
    | "setShowNetworkInfoPanels"
    | "setShowSegmentNames"
    | "setShowSegmentLengths"
    | "setShowSegmentDressings"
    | "setShowCableCallouts"
    | "setNetworkCalloutContentMode"
    | "setShowSelectedCalloutOnly"
    | "setNetworkLabelStrokeMode"
    | "setNetworkLabelSizeMode"
    | "setNetworkCalloutTextSize"
    | "setNetworkLabelRotationDegrees"
    | "setNetworkAutoSegmentLabelRotation"
  >;
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
    | "setLocale"
    | "setThemeMode"
    | "setTableDensity"
    | "setTableFontSize"
    | "setWorkspaceCurrencyCode"
    | "setWorkspaceTaxEnabled"
    | "setWorkspaceTaxRatePercent"
    | "setBomTraceabilityLabelsHidden"
    | "setWireExportStrippingAllowanceMm"
    | "setWireExportTwistedPairLengthCoefficient"
    | "setDefaultWireSectionMm2"
    | "setDefaultAutoCreateLinkedNodes"
    | "setDefaultSortField"
    | "setDefaultSortDirection"
    | "setDefaultIdSortDirection"
    | "setCanvasDefaultShowGrid"
    | "setCanvasDefaultSnapToGrid"
    | "setCanvasDefaultLockEntityMovement"
    | "setCanvasDefaultShowInfoPanels"
    | "setCanvasDefaultShowSegmentNames"
    | "setCanvasDefaultShowSegmentLengths"
    | "setCanvasDefaultShowCableCallouts"
    | "setCanvasDefaultCalloutContentMode"
    | "setCanvasDefaultShowSelectedCalloutOnly"
    | "setCanvasDefaultLabelStrokeMode"
    | "setCanvasDefaultLabelSizeMode"
    | "setCanvasDefaultCalloutTextSize"
    | "setCanvasDefaultLabelRotationDegrees"
    | "setCanvasDefaultAutoSegmentLabelRotation"
    | "setCanvasShowCalloutWireNames"
    | "setCanvasConnectorDrawingDisplayMode"
    | "setCanvasGlobalRenderScalePercent"
    | "setCanvasZoomInvariantNodeShapes"
    | "setCanvasNodeShapeSizePercent"
    | "setCanvasExportFormat"
    | "setCanvasResetZoomPercentInput"
    | "setCanvasPngExportIncludeBackground"
    | "setCanvasExportIncludeFrame"
    | "setCanvasExportIncludeCartouche"
    | "setCanvasResizeBehaviorMode"
    | "setShowShortcutHints"
    | "setKeyboardShortcutsEnabled"
    | "setRestoreViewportOnUndo"
    | "setShowFloatingInspectorPanel"
    | "setShowRoutePreviewPanel"
    | "setHideWireAnalysisRoutePanel"
    | "setShowMultiNetworkFunctionalAnalysisPanel"
    | "setWorkspacePanelsLayoutMode"
    | "setWorkspaceWideScreen"
  >;
}

export function useAppControllerWorkspaceHandlersAssembly({
  base,
  networkForm,
  workspace,
  canvasDefaults,
  sortSetters,
  preferenceSetters
}: UseAppControllerWorkspaceHandlersAssemblyParams) {
  return useWorkspaceHandlers({
    ...base,
    ...networkForm,
    ...workspace,
    ...canvasDefaults,
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
    "setInteractionMode" | "networkScale" | "networkViewWidth" | "networkViewHeight" | "setNetworkScale" | "setNetworkOffset"
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
    | "nodes"
    | "nodesCount"
    | "interactionMode"
    | "isModelingScreen"
    | "isModelingAnalysisFocused"
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
    | "networkViewWidth"
    | "networkViewHeight"
    | "networkNodePositions"
    | "snapNodesToGrid"
    | "lockEntityMovement"
    | "networkOffset"
    | "networkScale"
    | "networkRenderScale"
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
    | "persistNodePositions"
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
