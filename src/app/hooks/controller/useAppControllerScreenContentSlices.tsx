import type { ComponentProps, ComponentType, Dispatch, SetStateAction } from "react";
import { InspectorContextPanel } from "../../components/InspectorContextPanel";

type NetworkSummaryPanelProps = ComponentProps<typeof import("../../components/NetworkSummaryPanel").NetworkSummaryPanel>;
type NetworkScopeWorkspaceContentProps = ComponentProps<
  typeof import("../../components/workspace/NetworkScopeWorkspaceContent").NetworkScopeWorkspaceContent
>;
type ModelingPrimaryTablesProps = ComponentProps<
  typeof import("../../components/workspace/ModelingPrimaryTables").ModelingPrimaryTables
>;
type ModelingSecondaryTablesProps = ComponentProps<
  typeof import("../../components/workspace/ModelingSecondaryTables").ModelingSecondaryTables
>;
type ModelingFormsColumnProps = ComponentProps<
  typeof import("../../components/workspace/ModelingFormsColumn").ModelingFormsColumn
>;
type AnalysisWorkspaceContentProps = ComponentProps<
  typeof import("../../components/workspace/AnalysisWorkspaceContent").AnalysisWorkspaceContent
>;
type ValidationWorkspaceContentProps = ComponentProps<
  typeof import("../../components/workspace/ValidationWorkspaceContent").ValidationWorkspaceContent
>;
type SettingsWorkspaceContentProps = ComponentProps<
  typeof import("../../components/workspace/SettingsWorkspaceContent").SettingsWorkspaceContent
>;

type BooleanStateSetter = Dispatch<SetStateAction<boolean>>;

type InspectorContextPanelControllerSliceParams = Omit<
  ComponentProps<typeof InspectorContextPanel>,
  | "mode"
  | "canExpandFromCollapsed"
  | "canCollapseToCollapsed"
  | "onExpandFromCollapsed"
  | "onCollapseToCollapsed"
  | "connectorOccupiedCount"
  | "spliceOccupiedCount"
  | "onEditSelected"
  | "onClearSelection"
> & {
  isInspectorOpen: boolean;
  canExpandInspectorFromCollapsed: boolean;
  canCollapseInspectorToCollapsed: boolean;
  expandInspectorFromCollapsed: () => void;
  collapseInspectorToCollapsed: () => void;
  selectedConnectorOccupiedCount: number;
  selectedSpliceOccupiedCount: number;
  handleStartSelectedEdit: ComponentProps<typeof InspectorContextPanel>["onEditSelected"];
  onClearSelection: ComponentProps<typeof InspectorContextPanel>["onClearSelection"];
};

type NetworkSummaryPanelControllerSliceParams = Omit<
  NetworkSummaryPanelProps,
  | "labelStrokeMode"
  | "labelSizeMode"
  | "calloutTextSize"
  | "labelRotationDegrees"
  | "toggleShowNetworkInfoPanels"
  | "toggleShowSegmentLengths"
  | "toggleShowCableCallouts"
  | "toggleShowNetworkGrid"
  | "toggleSnapNodesToGrid"
  | "toggleLockEntityMovement"
  | "routingGraphNodeCount"
  | "routingGraphSegmentCount"
  | "onRegenerateLayout"
> & {
  NetworkSummaryPanelComponent: ComponentType<NetworkSummaryPanelProps>;
  includeNetworkSummaryPanel?: boolean;
  setShowNetworkInfoPanels: BooleanStateSetter;
  setShowSegmentLengths: BooleanStateSetter;
  setShowCableCallouts: BooleanStateSetter;
  setShowNetworkGrid: BooleanStateSetter;
  setSnapNodesToGrid: BooleanStateSetter;
  setLockEntityMovement: BooleanStateSetter;
  networkLabelStrokeMode: NetworkSummaryPanelProps["labelStrokeMode"];
  networkLabelSizeMode: NetworkSummaryPanelProps["labelSizeMode"];
  networkCalloutTextSize: NetworkSummaryPanelProps["calloutTextSize"];
  networkLabelRotationDegrees: NetworkSummaryPanelProps["labelRotationDegrees"];
  routingGraph: {
    nodeIds: string[];
    segmentIds: string[];
  };
  handleRegenerateLayout: NetworkSummaryPanelProps["onRegenerateLayout"];
};

type NetworkScopeScreenContentSliceParams = Omit<
  NetworkScopeWorkspaceContentProps,
  "focusRequestedNetworkId" | "focusRequestedNetworkToken"
> & {
  NetworkScopeWorkspaceContentComponent: ComponentType<NetworkScopeWorkspaceContentProps>;
  networkFocusRequest: {
    id: NetworkScopeWorkspaceContentProps["focusRequestedNetworkId"];
    token: NetworkScopeWorkspaceContentProps["focusRequestedNetworkToken"];
  };
};

type ModelingScreenContentSliceParams = Omit<
  ModelingPrimaryTablesProps,
  | "onOpenCreateConnector"
  | "onEditConnector"
  | "onDeleteConnector"
  | "onOpenCreateSplice"
  | "onEditSplice"
  | "onDeleteSplice"
  | "onOpenCreateNode"
  | "onEditNode"
  | "onDeleteNode"
> &
  Omit<
    ModelingSecondaryTablesProps,
    | "onOpenCreateSegment"
    | "onEditSegment"
    | "onDeleteSegment"
    | "onOpenCreateWire"
    | "onEditWire"
    | "onDeleteWire"
  > &
  Omit<
    ModelingFormsColumnProps,
    "openCreateConnectorForm" | "openCreateSpliceForm" | "openCreateNodeForm" | "openCreateSegmentForm" | "openCreateWireForm"
  > & {
    ModelingPrimaryTablesComponent: ComponentType<ModelingPrimaryTablesProps>;
    ModelingSecondaryTablesComponent: ComponentType<ModelingSecondaryTablesProps>;
    ModelingFormsColumnComponent: ComponentType<ModelingFormsColumnProps>;
    resetConnectorForm: ModelingPrimaryTablesProps["onOpenCreateConnector"];
    startConnectorEdit: ModelingPrimaryTablesProps["onEditConnector"];
    handleConnectorDelete: ModelingPrimaryTablesProps["onDeleteConnector"];
    resetSpliceForm: ModelingPrimaryTablesProps["onOpenCreateSplice"];
    startSpliceEdit: ModelingPrimaryTablesProps["onEditSplice"];
    handleSpliceDelete: ModelingPrimaryTablesProps["onDeleteSplice"];
    resetNodeForm: ModelingPrimaryTablesProps["onOpenCreateNode"];
    startNodeEdit: ModelingPrimaryTablesProps["onEditNode"];
    handleNodeDelete: ModelingPrimaryTablesProps["onDeleteNode"];
    resetSegmentForm: ModelingSecondaryTablesProps["onOpenCreateSegment"];
    startSegmentEdit: ModelingSecondaryTablesProps["onEditSegment"];
    handleSegmentDelete: ModelingSecondaryTablesProps["onDeleteSegment"];
    resetWireForm: ModelingSecondaryTablesProps["onOpenCreateWire"];
    startWireEdit: ModelingSecondaryTablesProps["onEditWire"];
    handleWireDelete: ModelingSecondaryTablesProps["onDeleteWire"];
  };

type AnalysisScreenContentSliceParams = Omit<
  AnalysisWorkspaceContentProps,
  "onSelectConnector" | "onSelectSplice" | "onSelectNode" | "onSelectSegment" | "onSelectWire"
> & {
  AnalysisWorkspaceContentComponent: ComponentType<AnalysisWorkspaceContentProps>;
  onSelectConnector: AnalysisWorkspaceContentProps["onSelectConnector"];
  onSelectSplice: AnalysisWorkspaceContentProps["onSelectSplice"];
  onSelectNode: AnalysisWorkspaceContentProps["onSelectNode"];
  onSelectSegment: AnalysisWorkspaceContentProps["onSelectSegment"];
  onSelectWire: AnalysisWorkspaceContentProps["onSelectWire"];
};

type ValidationScreenContentSliceParams = ValidationWorkspaceContentProps & {
  ValidationWorkspaceContentComponent: ComponentType<ValidationWorkspaceContentProps>;
};

type SettingsScreenContentSliceParams = SettingsWorkspaceContentProps & {
  SettingsWorkspaceContentComponent: ComponentType<SettingsWorkspaceContentProps>;
};

export function useInspectorContextPanelControllerSlice(params: InspectorContextPanelControllerSliceParams) {
  const inspectorContextPanelProps = {
    mode: params.isInspectorOpen ? "open" : "collapsed",
    canExpandFromCollapsed: params.canExpandInspectorFromCollapsed,
    canCollapseToCollapsed: params.canCollapseInspectorToCollapsed,
    onExpandFromCollapsed: params.expandInspectorFromCollapsed,
    onCollapseToCollapsed: params.collapseInspectorToCollapsed,
    selected: params.selected,
    selectedSubScreen: params.selectedSubScreen,
    selectedConnector: params.selectedConnector,
    selectedSplice: params.selectedSplice,
    selectedNode: params.selectedNode,
    selectedSegment: params.selectedSegment,
    selectedWire: params.selectedWire,
    connectorOccupiedCount: params.selectedConnectorOccupiedCount,
    spliceOccupiedCount: params.selectedSpliceOccupiedCount,
    describeNode: params.describeNode,
    onEditSelected: params.handleStartSelectedEdit,
    onClearSelection: params.onClearSelection
  } satisfies ComponentProps<typeof InspectorContextPanel>;

  return {
    inspectorContextPanelProps,
    inspectorContextPanel: <InspectorContextPanel {...inspectorContextPanelProps} />
  };
}

export function buildNetworkSummaryPanelControllerSlice(params: NetworkSummaryPanelControllerSliceParams) {
  if (params.includeNetworkSummaryPanel === false) {
    return {
      networkSummaryPanelProps: null,
      networkSummaryPanel: null
    };
  }

  const networkSummaryPanelProps = {
    handleZoomAction: params.handleZoomAction,
    fitNetworkToContent: params.fitNetworkToContent,
    showNetworkGrid: params.showNetworkGrid,
    snapNodesToGrid: params.snapNodesToGrid,
    lockEntityMovement: params.lockEntityMovement,
    showNetworkInfoPanels: params.showNetworkInfoPanels,
    showSegmentLengths: params.showSegmentLengths,
    showCableCallouts: params.showCableCallouts,
    labelStrokeMode: params.networkLabelStrokeMode,
    labelSizeMode: params.networkLabelSizeMode,
    calloutTextSize: params.networkCalloutTextSize,
    labelRotationDegrees: params.networkLabelRotationDegrees,
    toggleShowNetworkInfoPanels: () => params.setShowNetworkInfoPanels((current: boolean) => !current),
    toggleShowSegmentLengths: () => params.setShowSegmentLengths((current: boolean) => !current),
    toggleShowCableCallouts: () => params.setShowCableCallouts((current: boolean) => !current),
    toggleShowNetworkGrid: () => params.setShowNetworkGrid((current: boolean) => !current),
    toggleSnapNodesToGrid: () => params.setSnapNodesToGrid((current: boolean) => !current),
    toggleLockEntityMovement: () => params.setLockEntityMovement((current: boolean) => !current),
    networkScalePercent: params.networkScalePercent,
    routingGraphNodeCount: params.routingGraph.nodeIds.length,
    routingGraphSegmentCount: params.routingGraph.segmentIds.length,
    totalEdgeEntries: params.totalEdgeEntries,
    nodes: params.nodes,
    segments: params.segments,
    wires: params.wires,
    isPanningNetwork: params.isPanningNetwork,
    networkViewWidth: params.networkViewWidth,
    networkViewHeight: params.networkViewHeight,
    networkGridStep: params.networkGridStep,
    networkOffset: params.networkOffset,
    networkScale: params.networkScale,
    handleNetworkCanvasMouseDown: params.handleNetworkCanvasMouseDown,
    handleNetworkCanvasClick: params.handleNetworkCanvasClick,
    handleNetworkWheel: params.handleNetworkWheel,
    handleNetworkMouseMove: params.handleNetworkMouseMove,
    stopNetworkNodeDrag: params.stopNetworkNodeDrag,
    networkNodePositions: params.networkNodePositions,
    selectedWireRouteSegmentIds: params.selectedWireRouteSegmentIds,
    selectedSegmentId: params.selectedSegmentId,
    handleNetworkSegmentClick: params.handleNetworkSegmentClick,
    selectedNodeId: params.selectedNodeId,
    selectedConnectorId: params.selectedConnectorId,
    selectedSpliceId: params.selectedSpliceId,
    handleNetworkNodeMouseDown: params.handleNetworkNodeMouseDown,
    handleNetworkNodeActivate: params.handleNetworkNodeActivate,
    connectorMap: params.connectorMap,
    spliceMap: params.spliceMap,
    describeNode: params.describeNode,
    subNetworkSummaries: params.subNetworkSummaries,
    routePreviewStartNodeId: params.routePreviewStartNodeId,
    setRoutePreviewStartNodeId: params.setRoutePreviewStartNodeId,
    routePreviewEndNodeId: params.routePreviewEndNodeId,
    setRoutePreviewEndNodeId: params.setRoutePreviewEndNodeId,
    routePreview: params.routePreview,
    quickEntityNavigationMode: params.quickEntityNavigationMode,
    activeSubScreen: params.activeSubScreen,
    entityCountBySubScreen: params.entityCountBySubScreen,
    onQuickEntityNavigation: params.onQuickEntityNavigation,
    onSelectConnectorFromCallout: params.onSelectConnectorFromCallout,
    onSelectSpliceFromCallout: params.onSelectSpliceFromCallout,
    onPersistConnectorCalloutPosition: params.onPersistConnectorCalloutPosition,
    onPersistSpliceCalloutPosition: params.onPersistSpliceCalloutPosition,
    pngExportIncludeBackground: params.pngExportIncludeBackground,
    canExportBomCsv: params.canExportBomCsv,
    onExportBomCsv: params.onExportBomCsv,
    onRegenerateLayout: params.handleRegenerateLayout
  } satisfies NetworkSummaryPanelProps;

  return {
    networkSummaryPanelProps,
    networkSummaryPanel: <params.NetworkSummaryPanelComponent {...networkSummaryPanelProps} />
  };
}

export function buildNetworkScopeScreenContentSlice(params: NetworkScopeScreenContentSliceParams) {
  const networkScopeWorkspaceProps = {
    networks: params.networks,
    networkSort: params.networkSort,
    setNetworkSort: params.setNetworkSort,
    networkEntityCountsById: params.networkEntityCountsById,
    activeNetworkId: params.activeNetworkId,
    handleSelectNetwork: params.handleSelectNetwork,
    handleOpenNetworkInModeling: params.handleOpenNetworkInModeling,
    handleDuplicateNetwork: params.handleDuplicateNetwork,
    handleExportActiveNetwork: params.handleExportActiveNetwork,
    handleDeleteNetwork: params.handleDeleteNetwork,
    networkFormMode: params.networkFormMode,
    handleOpenCreateNetworkForm: params.handleOpenCreateNetworkForm,
    handleOpenEditNetworkForm: params.handleOpenEditNetworkForm,
    handleCloseNetworkForm: params.handleCloseNetworkForm,
    newNetworkName: params.newNetworkName,
    setNewNetworkName: params.setNewNetworkName,
    newNetworkTechnicalId: params.newNetworkTechnicalId,
    setNewNetworkTechnicalId: params.setNewNetworkTechnicalId,
    newNetworkDescription: params.newNetworkDescription,
    setNewNetworkDescription: params.setNewNetworkDescription,
    networkFormError: params.networkFormError,
    networkTechnicalIdAlreadyUsed: params.networkTechnicalIdAlreadyUsed,
    handleSubmitNetworkForm: params.handleSubmitNetworkForm,
    focusRequestedNetworkId: params.networkFocusRequest.id,
    focusRequestedNetworkToken: params.networkFocusRequest.token,
    onOpenOnboardingHelp: params.onOpenOnboardingHelp
  } satisfies NetworkScopeWorkspaceContentProps;

  return {
    networkScopeWorkspaceProps,
    networkScopeWorkspaceContent: <params.NetworkScopeWorkspaceContentComponent {...networkScopeWorkspaceProps} />
  };
}

export function buildModelingScreenContentSlice(params: ModelingScreenContentSliceParams) {
  const modelingPrimaryTablesProps = {
    isConnectorSubScreen: params.isConnectorSubScreen,
    connectorFormMode: params.connectorFormMode,
    onOpenCreateConnector: params.resetConnectorForm,
    connectorOccupancyFilter: params.connectorOccupancyFilter,
    setConnectorOccupancyFilter: params.setConnectorOccupancyFilter,
    connectorFilterField: params.connectorFilterField,
    setConnectorFilterField: params.setConnectorFilterField,
    connectorFilterQuery: params.connectorFilterQuery,
    setConnectorFilterQuery: params.setConnectorFilterQuery,
    connectors: params.connectors,
    visibleConnectors: params.visibleConnectors,
    connectorSort: params.connectorSort,
    setConnectorSort: params.setConnectorSort,
    getSortIndicator: params.getSortIndicator,
    connectorOccupiedCountById: params.connectorOccupiedCountById,
    selectedConnectorId: params.selectedConnectorId,
    onEditConnector: params.startConnectorEdit,
    onDeleteConnector: params.handleConnectorDelete,
    onOpenConnectorOnboardingHelp: params.onOpenConnectorOnboardingHelp,
    isSpliceSubScreen: params.isSpliceSubScreen,
    spliceFormMode: params.spliceFormMode,
    onOpenCreateSplice: params.resetSpliceForm,
    spliceOccupancyFilter: params.spliceOccupancyFilter,
    setSpliceOccupancyFilter: params.setSpliceOccupancyFilter,
    spliceFilterField: params.spliceFilterField,
    setSpliceFilterField: params.setSpliceFilterField,
    spliceFilterQuery: params.spliceFilterQuery,
    setSpliceFilterQuery: params.setSpliceFilterQuery,
    splices: params.splices,
    visibleSplices: params.visibleSplices,
    spliceSort: params.spliceSort,
    setSpliceSort: params.setSpliceSort,
    spliceOccupiedCountById: params.spliceOccupiedCountById,
    selectedSpliceId: params.selectedSpliceId,
    onEditSplice: params.startSpliceEdit,
    onDeleteSplice: params.handleSpliceDelete,
    onOpenSpliceOnboardingHelp: params.onOpenSpliceOnboardingHelp,
    isNodeSubScreen: params.isNodeSubScreen,
    nodeFormMode: params.nodeFormMode,
    onOpenCreateNode: params.resetNodeForm,
    nodeKindFilter: params.nodeKindFilter,
    setNodeKindFilter: params.setNodeKindFilter,
    nodeFilterField: params.nodeFilterField,
    setNodeFilterField: params.setNodeFilterField,
    nodeFilterQuery: params.nodeFilterQuery,
    setNodeFilterQuery: params.setNodeFilterQuery,
    nodes: params.nodes,
    visibleNodes: params.visibleNodes,
    nodeIdSortDirection: params.nodeIdSortDirection,
    setNodeIdSortDirection: params.setNodeIdSortDirection,
    segmentsCountByNodeId: params.segmentsCountByNodeId,
    selectedNodeId: params.selectedNodeId,
    describeNode: params.describeNode,
    onEditNode: params.startNodeEdit,
    onDeleteNode: params.handleNodeDelete,
    onOpenNodeOnboardingHelp: params.onOpenNodeOnboardingHelp
  } satisfies ModelingPrimaryTablesProps;
  const modelingSecondaryTablesProps = {
    isSegmentSubScreen: params.isSegmentSubScreen,
    segmentFormMode: params.segmentFormMode,
    onOpenCreateSegment: params.resetSegmentForm,
    segmentSubNetworkFilter: params.segmentSubNetworkFilter,
    setSegmentSubNetworkFilter: params.setSegmentSubNetworkFilter,
    segmentFilterField: params.segmentFilterField,
    setSegmentFilterField: params.setSegmentFilterField,
    segmentFilterQuery: params.segmentFilterQuery,
    setSegmentFilterQuery: params.setSegmentFilterQuery,
    segments: params.segments,
    visibleSegments: params.visibleSegments,
    segmentIdSortDirection: params.segmentIdSortDirection,
    setSegmentIdSortDirection: params.setSegmentIdSortDirection,
    nodeLabelById: params.nodeLabelById,
    selectedSegmentId: params.selectedSegmentId,
    selectedWireRouteSegmentIds: params.selectedWireRouteSegmentIds,
    onEditSegment: params.startSegmentEdit,
    onDeleteSegment: params.handleSegmentDelete,
    isWireSubScreen: params.isWireSubScreen,
    wireFormMode: params.wireFormMode,
    onOpenCreateWire: params.resetWireForm,
    wireRouteFilter: params.wireRouteFilter,
    setWireRouteFilter: params.setWireRouteFilter,
    wireFilterField: params.wireFilterField,
    setWireFilterField: params.setWireFilterField,
    wireEndpointFilterQuery: params.wireEndpointFilterQuery,
    setWireEndpointFilterQuery: params.setWireEndpointFilterQuery,
    wires: params.wires,
    visibleWires: params.visibleWires,
    wireSort: params.wireSort,
    setWireSort: params.setWireSort,
    getSortIndicator: params.getSortIndicator,
    selectedWireId: params.selectedWireId,
    describeWireEndpoint: params.describeWireEndpoint,
    describeWireEndpointId: params.describeWireEndpointId,
    onEditWire: params.startWireEdit,
    onDeleteWire: params.handleWireDelete,
    onOpenSegmentOnboardingHelp: params.onOpenSegmentOnboardingHelp,
    onOpenWireOnboardingHelp: params.onOpenWireOnboardingHelp
  } satisfies ModelingSecondaryTablesProps;
  const modelingFormsColumnProps = {
    catalogItems: params.catalogItems,
    openCatalogSubScreen: params.openCatalogSubScreen,
    isConnectorSubScreen: params.isConnectorSubScreen,
    connectorFormMode: params.connectorFormMode,
    openCreateConnectorForm: params.resetConnectorForm,
    handleConnectorSubmit: params.handleConnectorSubmit,
    connectorName: params.connectorName,
    setConnectorName: params.setConnectorName,
    connectorTechnicalId: params.connectorTechnicalId,
    setConnectorTechnicalId: params.setConnectorTechnicalId,
    connectorCatalogItemId: params.connectorCatalogItemId,
    setConnectorCatalogItemId: params.setConnectorCatalogItemId,
    connectorManufacturerReference: params.connectorManufacturerReference,
    setConnectorManufacturerReference: params.setConnectorManufacturerReference,
    connectorAutoCreateLinkedNode: params.connectorAutoCreateLinkedNode,
    setConnectorAutoCreateLinkedNode: params.setConnectorAutoCreateLinkedNode,
    connectorTechnicalIdAlreadyUsed: params.connectorTechnicalIdAlreadyUsed,
    cavityCount: params.cavityCount,
    setCavityCount: params.setCavityCount,
    cancelConnectorEdit: params.cancelConnectorEdit,
    connectorFormError: params.connectorFormError,
    isSpliceSubScreen: params.isSpliceSubScreen,
    spliceFormMode: params.spliceFormMode,
    openCreateSpliceForm: params.resetSpliceForm,
    handleSpliceSubmit: params.handleSpliceSubmit,
    spliceName: params.spliceName,
    setSpliceName: params.setSpliceName,
    spliceTechnicalId: params.spliceTechnicalId,
    setSpliceTechnicalId: params.setSpliceTechnicalId,
    spliceCatalogItemId: params.spliceCatalogItemId,
    setSpliceCatalogItemId: params.setSpliceCatalogItemId,
    spliceManufacturerReference: params.spliceManufacturerReference,
    setSpliceManufacturerReference: params.setSpliceManufacturerReference,
    spliceAutoCreateLinkedNode: params.spliceAutoCreateLinkedNode,
    setSpliceAutoCreateLinkedNode: params.setSpliceAutoCreateLinkedNode,
    spliceTechnicalIdAlreadyUsed: params.spliceTechnicalIdAlreadyUsed,
    portCount: params.portCount,
    setPortCount: params.setPortCount,
    cancelSpliceEdit: params.cancelSpliceEdit,
    spliceFormError: params.spliceFormError,
    isNodeSubScreen: params.isNodeSubScreen,
    nodeFormMode: params.nodeFormMode,
    openCreateNodeForm: params.resetNodeForm,
    handleNodeSubmit: params.handleNodeSubmit,
    nodeIdInput: params.nodeIdInput,
    setNodeIdInput: params.setNodeIdInput,
    pendingNewNodePosition: params.pendingNewNodePosition,
    nodeKind: params.nodeKind,
    setNodeKind: params.setNodeKind,
    nodeLabel: params.nodeLabel,
    setNodeLabel: params.setNodeLabel,
    connectors: params.connectors,
    nodeConnectorId: params.nodeConnectorId,
    setNodeConnectorId: params.setNodeConnectorId,
    splices: params.splices,
    nodeSpliceId: params.nodeSpliceId,
    setNodeSpliceId: params.setNodeSpliceId,
    cancelNodeEdit: params.cancelNodeEdit,
    nodeFormError: params.nodeFormError,
    isSegmentSubScreen: params.isSegmentSubScreen,
    segmentFormMode: params.segmentFormMode,
    openCreateSegmentForm: params.resetSegmentForm,
    handleSegmentSubmit: params.handleSegmentSubmit,
    segmentIdInput: params.segmentIdInput,
    setSegmentIdInput: params.setSegmentIdInput,
    nodes: params.nodes,
    describeNode: params.describeNode,
    segmentNodeA: params.segmentNodeA,
    setSegmentNodeA: params.setSegmentNodeA,
    segmentNodeB: params.segmentNodeB,
    setSegmentNodeB: params.setSegmentNodeB,
    segmentLengthMm: params.segmentLengthMm,
    setSegmentLengthMm: params.setSegmentLengthMm,
    segmentSubNetworkTag: params.segmentSubNetworkTag,
    setSegmentSubNetworkTag: params.setSegmentSubNetworkTag,
    cancelSegmentEdit: params.cancelSegmentEdit,
    segmentFormError: params.segmentFormError,
    isWireSubScreen: params.isWireSubScreen,
    wireFormMode: params.wireFormMode,
    openCreateWireForm: params.resetWireForm,
    handleWireSubmit: params.handleWireSubmit,
    wireName: params.wireName,
    setWireName: params.setWireName,
    wireTechnicalId: params.wireTechnicalId,
    setWireTechnicalId: params.setWireTechnicalId,
    wireSectionMm2: params.wireSectionMm2,
    setWireSectionMm2: params.setWireSectionMm2,
    wireColorMode: params.wireColorMode,
    setWireColorMode: params.setWireColorMode,
    wirePrimaryColorId: params.wirePrimaryColorId,
    setWirePrimaryColorId: params.setWirePrimaryColorId,
    wireSecondaryColorId: params.wireSecondaryColorId,
    setWireSecondaryColorId: params.setWireSecondaryColorId,
    wireFreeColorLabel: params.wireFreeColorLabel,
    setWireFreeColorLabel: params.setWireFreeColorLabel,
    wireTechnicalIdAlreadyUsed: params.wireTechnicalIdAlreadyUsed,
    wireEndpointAConnectionReference: params.wireEndpointAConnectionReference,
    setWireEndpointAConnectionReference: params.setWireEndpointAConnectionReference,
    wireEndpointASealReference: params.wireEndpointASealReference,
    setWireEndpointASealReference: params.setWireEndpointASealReference,
    wireEndpointAKind: params.wireEndpointAKind,
    setWireEndpointAKind: params.setWireEndpointAKind,
    wireEndpointAConnectorId: params.wireEndpointAConnectorId,
    setWireEndpointAConnectorId: params.setWireEndpointAConnectorId,
    wireEndpointACavityIndex: params.wireEndpointACavityIndex,
    setWireEndpointACavityIndex: params.setWireEndpointACavityIndex,
    wireEndpointASpliceId: params.wireEndpointASpliceId,
    setWireEndpointASpliceId: params.setWireEndpointASpliceId,
    wireEndpointAPortIndex: params.wireEndpointAPortIndex,
    setWireEndpointAPortIndex: params.setWireEndpointAPortIndex,
    wireEndpointASlotHint: params.wireEndpointASlotHint,
    wireEndpointBConnectionReference: params.wireEndpointBConnectionReference,
    setWireEndpointBConnectionReference: params.setWireEndpointBConnectionReference,
    wireEndpointBSealReference: params.wireEndpointBSealReference,
    setWireEndpointBSealReference: params.setWireEndpointBSealReference,
    wireEndpointBKind: params.wireEndpointBKind,
    setWireEndpointBKind: params.setWireEndpointBKind,
    wireEndpointBConnectorId: params.wireEndpointBConnectorId,
    setWireEndpointBConnectorId: params.setWireEndpointBConnectorId,
    wireEndpointBCavityIndex: params.wireEndpointBCavityIndex,
    setWireEndpointBCavityIndex: params.setWireEndpointBCavityIndex,
    wireEndpointBSpliceId: params.wireEndpointBSpliceId,
    setWireEndpointBSpliceId: params.setWireEndpointBSpliceId,
    wireEndpointBPortIndex: params.wireEndpointBPortIndex,
    setWireEndpointBPortIndex: params.setWireEndpointBPortIndex,
    wireEndpointBSlotHint: params.wireEndpointBSlotHint,
    cancelWireEdit: params.cancelWireEdit,
    wireFormError: params.wireFormError
  } satisfies ModelingFormsColumnProps;

  return {
    modelingPrimaryTablesProps,
    modelingSecondaryTablesProps,
    modelingFormsColumnProps,
    modelingLeftColumnContent: (
      <>
        <params.ModelingPrimaryTablesComponent {...modelingPrimaryTablesProps} />
        <params.ModelingSecondaryTablesComponent {...modelingSecondaryTablesProps} />
      </>
    ),
    modelingFormsColumnContent: <params.ModelingFormsColumnComponent {...modelingFormsColumnProps} />
  };
}

export function buildAnalysisScreenContentSlice(params: AnalysisScreenContentSliceParams) {
  const analysisWorkspaceContentProps = {
    showEntityTables: false,
    isConnectorSubScreen: params.isConnectorSubScreen,
    isSpliceSubScreen: params.isSpliceSubScreen,
    isNodeSubScreen: params.isNodeSubScreen,
    isSegmentSubScreen: params.isSegmentSubScreen,
    isWireSubScreen: params.isWireSubScreen,
    selectedConnector: params.selectedConnector,
    selectedConnectorId: params.selectedConnectorId,
    connectorOccupancyFilter: params.connectorOccupancyFilter,
    setConnectorOccupancyFilter: params.setConnectorOccupancyFilter,
    connectorFilterField: params.connectorFilterField,
    setConnectorFilterField: params.setConnectorFilterField,
    connectorFilterQuery: params.connectorFilterQuery,
    setConnectorFilterQuery: params.setConnectorFilterQuery,
    connectors: params.connectors,
    visibleConnectors: params.visibleConnectors,
    connectorSort: params.connectorSort,
    setConnectorSort: params.setConnectorSort,
    connectorOccupiedCountById: params.connectorOccupiedCountById,
    onSelectConnector: params.onSelectConnector,
    onOpenConnectorOnboardingHelp: params.onOpenConnectorOnboardingHelp,
    cavityIndexInput: params.cavityIndexInput,
    setCavityIndexInput: params.setCavityIndexInput,
    connectorOccupantRefInput: params.connectorOccupantRefInput,
    setConnectorOccupantRefInput: params.setConnectorOccupantRefInput,
    handleReserveCavity: params.handleReserveCavity,
    connectorCavityStatuses: params.connectorCavityStatuses,
    handleReleaseCavity: params.handleReleaseCavity,
    sortedConnectorSynthesisRows: params.sortedConnectorSynthesisRows,
    connectorSynthesisSort: params.connectorSynthesisSort,
    setConnectorSynthesisSort: params.setConnectorSynthesisSort,
    getSortIndicator: params.getSortIndicator,
    selectedSplice: params.selectedSplice,
    selectedSpliceId: params.selectedSpliceId,
    spliceOccupancyFilter: params.spliceOccupancyFilter,
    setSpliceOccupancyFilter: params.setSpliceOccupancyFilter,
    spliceFilterField: params.spliceFilterField,
    setSpliceFilterField: params.setSpliceFilterField,
    spliceFilterQuery: params.spliceFilterQuery,
    setSpliceFilterQuery: params.setSpliceFilterQuery,
    splices: params.splices,
    visibleSplices: params.visibleSplices,
    spliceSort: params.spliceSort,
    setSpliceSort: params.setSpliceSort,
    spliceOccupiedCountById: params.spliceOccupiedCountById,
    onSelectSplice: params.onSelectSplice,
    onOpenSpliceOnboardingHelp: params.onOpenSpliceOnboardingHelp,
    splicePortStatuses: params.splicePortStatuses,
    portIndexInput: params.portIndexInput,
    setPortIndexInput: params.setPortIndexInput,
    spliceOccupantRefInput: params.spliceOccupantRefInput,
    setSpliceOccupantRefInput: params.setSpliceOccupantRefInput,
    handleReservePort: params.handleReservePort,
    handleReleasePort: params.handleReleasePort,
    sortedSpliceSynthesisRows: params.sortedSpliceSynthesisRows,
    spliceSynthesisSort: params.spliceSynthesisSort,
    setSpliceSynthesisSort: params.setSpliceSynthesisSort,
    nodeKindFilter: params.nodeKindFilter,
    setNodeKindFilter: params.setNodeKindFilter,
    nodeFilterField: params.nodeFilterField,
    setNodeFilterField: params.setNodeFilterField,
    nodeFilterQuery: params.nodeFilterQuery,
    setNodeFilterQuery: params.setNodeFilterQuery,
    nodes: params.nodes,
    visibleNodes: params.visibleNodes,
    segmentsCountByNodeId: params.segmentsCountByNodeId,
    selectedNodeId: params.selectedNodeId,
    selectedNode: params.selectedNode,
    selectedSegment: params.selectedSegment,
    onSelectNode: params.onSelectNode,
    onOpenNodeOnboardingHelp: params.onOpenNodeOnboardingHelp,
    describeNode: params.describeNode,
    nodeLabelById: params.nodeLabelById,
    segmentSubNetworkFilter: params.segmentSubNetworkFilter,
    setSegmentSubNetworkFilter: params.setSegmentSubNetworkFilter,
    segmentFilterField: params.segmentFilterField,
    setSegmentFilterField: params.setSegmentFilterField,
    segmentFilterQuery: params.segmentFilterQuery,
    setSegmentFilterQuery: params.setSegmentFilterQuery,
    segments: params.segments,
    visibleSegments: params.visibleSegments,
    selectedSegmentId: params.selectedSegmentId,
    onSelectSegment: params.onSelectSegment,
    onOpenSegmentOnboardingHelp: params.onOpenSegmentOnboardingHelp,
    wireRouteFilter: params.wireRouteFilter,
    setWireRouteFilter: params.setWireRouteFilter,
    wireFilterField: params.wireFilterField,
    setWireFilterField: params.setWireFilterField,
    wireEndpointFilterQuery: params.wireEndpointFilterQuery,
    setWireEndpointFilterQuery: params.setWireEndpointFilterQuery,
    wires: params.wires,
    visibleWires: params.visibleWires,
    wireSort: params.wireSort,
    setWireSort: params.setWireSort,
    selectedWireId: params.selectedWireId,
    onSelectWire: params.onSelectWire,
    onOpenWireOnboardingHelp: params.onOpenWireOnboardingHelp,
    selectedWire: params.selectedWire,
    describeWireEndpoint: params.describeWireEndpoint,
    describeWireEndpointId: params.describeWireEndpointId,
    wireForcedRouteInput: params.wireForcedRouteInput,
    setWireForcedRouteInput: params.setWireForcedRouteInput,
    handleLockWireRoute: params.handleLockWireRoute,
    handleResetWireRoute: params.handleResetWireRoute,
    wireFormError: params.wireFormError
  } satisfies AnalysisWorkspaceContentProps;

  return {
    analysisWorkspaceContentProps,
    analysisWorkspaceContent: <params.AnalysisWorkspaceContentComponent {...analysisWorkspaceContentProps} />
  };
}

export function buildValidationScreenContentSlice(params: ValidationScreenContentSliceParams) {
  const validationWorkspaceContentProps = {
    validationSeverityFilter: params.validationSeverityFilter,
    setValidationSeverityFilter: params.setValidationSeverityFilter,
    validationIssuesForSeverityCounts: params.validationIssuesForSeverityCounts,
    validationSeverityCountByLevel: params.validationSeverityCountByLevel,
    validationCategoryFilter: params.validationCategoryFilter,
    setValidationCategoryFilter: params.setValidationCategoryFilter,
    validationIssuesForCategoryCounts: params.validationIssuesForCategoryCounts,
    validationCategories: params.validationCategories,
    validationCategoryCountByName: params.validationCategoryCountByName,
    visibleValidationIssues: params.visibleValidationIssues,
    validationIssues: params.validationIssues,
    groupedValidationIssues: params.groupedValidationIssues,
    findValidationIssueIndex: params.findValidationIssueIndex,
    validationIssueCursor: params.validationIssueCursor,
    setValidationIssueCursorFromIssue: params.setValidationIssueCursorFromIssue,
    handleValidationIssueRowGoTo: params.handleValidationIssueRowGoTo,
    validationErrorCount: params.validationErrorCount,
    validationWarningCount: params.validationWarningCount
  } satisfies ValidationWorkspaceContentProps;

  return {
    validationWorkspaceContentProps,
    validationWorkspaceContent: <params.ValidationWorkspaceContentComponent {...validationWorkspaceContentProps} />
  };
}

export function buildSettingsScreenContentSlice(params: SettingsScreenContentSliceParams) {
  const settingsWorkspaceContentProps = {
    isCurrentWorkspaceEmpty: params.isCurrentWorkspaceEmpty,
    hasBuiltInSampleState: params.hasBuiltInSampleState,
    handleRecreateSampleNetwork: params.handleRecreateSampleNetwork,
    handleRecreateValidationIssuesSampleNetwork: params.handleRecreateValidationIssuesSampleNetwork,
    handleRecreateCatalogValidationIssuesSampleNetwork: params.handleRecreateCatalogValidationIssuesSampleNetwork,
    handleRecreatePricingBomQaSampleNetwork: params.handleRecreatePricingBomQaSampleNetwork,
    handleResetSampleNetwork: params.handleResetSampleNetwork,
    activeNetworkId: params.activeNetworkId,
    selectedExportNetworkIds: params.selectedExportNetworkIds,
    handleExportNetworks: params.handleExportNetworks,
    networks: params.networks,
    toggleSelectedExportNetwork: params.toggleSelectedExportNetwork,
    handleOpenImportPicker: params.handleOpenImportPicker,
    importFileInputRef: params.importFileInputRef,
    handleImportFileChange: params.handleImportFileChange,
    importExportStatus: params.importExportStatus,
    lastImportSummary: params.lastImportSummary,
    themeMode: params.themeMode,
    setThemeMode: params.setThemeMode,
    tableDensity: params.tableDensity,
    setTableDensity: params.setTableDensity,
    tableFontSize: params.tableFontSize,
    setTableFontSize: params.setTableFontSize,
    workspaceCurrencyCode: params.workspaceCurrencyCode,
    setWorkspaceCurrencyCode: params.setWorkspaceCurrencyCode,
    workspaceTaxEnabled: params.workspaceTaxEnabled,
    setWorkspaceTaxEnabled: params.setWorkspaceTaxEnabled,
    workspaceTaxRatePercent: params.workspaceTaxRatePercent,
    setWorkspaceTaxRatePercent: params.setWorkspaceTaxRatePercent,
    defaultWireSectionMm2: params.defaultWireSectionMm2,
    setDefaultWireSectionMm2: params.setDefaultWireSectionMm2,
    defaultAutoCreateLinkedNodes: params.defaultAutoCreateLinkedNodes,
    setDefaultAutoCreateLinkedNodes: params.setDefaultAutoCreateLinkedNodes,
    defaultSortField: params.defaultSortField,
    setDefaultSortField: params.setDefaultSortField,
    defaultSortDirection: params.defaultSortDirection,
    setDefaultSortDirection: params.setDefaultSortDirection,
    defaultIdSortDirection: params.defaultIdSortDirection,
    setDefaultIdSortDirection: params.setDefaultIdSortDirection,
    applyListSortDefaults: params.applyListSortDefaults,
    canvasDefaultShowGrid: params.canvasDefaultShowGrid,
    setCanvasDefaultShowGrid: params.setCanvasDefaultShowGrid,
    canvasDefaultSnapToGrid: params.canvasDefaultSnapToGrid,
    setCanvasDefaultSnapToGrid: params.setCanvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement: params.canvasDefaultLockEntityMovement,
    setCanvasDefaultLockEntityMovement: params.setCanvasDefaultLockEntityMovement,
    canvasDefaultShowInfoPanels: params.canvasDefaultShowInfoPanels,
    setCanvasDefaultShowInfoPanels: params.setCanvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentLengths: params.canvasDefaultShowSegmentLengths,
    setCanvasDefaultShowSegmentLengths: params.setCanvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts: params.canvasDefaultShowCableCallouts,
    setCanvasDefaultShowCableCallouts: params.setCanvasDefaultShowCableCallouts,
    canvasDefaultLabelStrokeMode: params.canvasDefaultLabelStrokeMode,
    setCanvasDefaultLabelStrokeMode: params.setCanvasDefaultLabelStrokeMode,
    canvasDefaultLabelSizeMode: params.canvasDefaultLabelSizeMode,
    setCanvasDefaultLabelSizeMode: params.setCanvasDefaultLabelSizeMode,
    canvasDefaultCalloutTextSize: params.canvasDefaultCalloutTextSize,
    setCanvasDefaultCalloutTextSize: params.setCanvasDefaultCalloutTextSize,
    canvasDefaultLabelRotationDegrees: params.canvasDefaultLabelRotationDegrees,
    setCanvasDefaultLabelRotationDegrees: params.setCanvasDefaultLabelRotationDegrees,
    canvasPngExportIncludeBackground: params.canvasPngExportIncludeBackground,
    setCanvasPngExportIncludeBackground: params.setCanvasPngExportIncludeBackground,
    canvasResetZoomPercentInput: params.canvasResetZoomPercentInput,
    setCanvasResetZoomPercentInput: params.setCanvasResetZoomPercentInput,
    configuredResetZoomPercent: params.configuredResetZoomPercent,
    applyCanvasDefaultsNow: params.applyCanvasDefaultsNow,
    handleZoomAction: params.handleZoomAction,
    showShortcutHints: params.showShortcutHints,
    setShowShortcutHints: params.setShowShortcutHints,
    keyboardShortcutsEnabled: params.keyboardShortcutsEnabled,
    setKeyboardShortcutsEnabled: params.setKeyboardShortcutsEnabled,
    showFloatingInspectorPanel: params.showFloatingInspectorPanel,
    setShowFloatingInspectorPanel: params.setShowFloatingInspectorPanel,
    workspacePanelsLayoutMode: params.workspacePanelsLayoutMode,
    setWorkspacePanelsLayoutMode: params.setWorkspacePanelsLayoutMode,
    resetWorkspacePreferencesToDefaults: params.resetWorkspacePreferencesToDefaults
  } satisfies SettingsWorkspaceContentProps;

  return {
    settingsWorkspaceContentProps,
    settingsWorkspaceContent: <params.SettingsWorkspaceContentComponent {...settingsWorkspaceContentProps} />
  };
}

// Compatibility aliases retained while downstream modules migrate from `use*` naming.
export const useNetworkScopeScreenContentSlice = buildNetworkScopeScreenContentSlice;
export const useModelingScreenContentSlice = buildModelingScreenContentSlice;
export const useAnalysisScreenContentSlice = buildAnalysisScreenContentSlice;
export const useValidationScreenContentSlice = buildValidationScreenContentSlice;
export const useSettingsScreenContentSlice = buildSettingsScreenContentSlice;
export const useNetworkSummaryPanelControllerSlice = buildNetworkSummaryPanelControllerSlice;
