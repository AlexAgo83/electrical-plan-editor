import type { EntityListModel } from "../useEntityListModel";
import type { AppControllerFormsStateFlat } from "../useAppControllerNamespacedFormsState";
import type { AppControllerSelectionEntitiesModel } from "../useAppControllerSelectionEntities";
import type { WireEndpointDescriptions } from "../useWireEndpointDescriptions";
import type { AppControllerModelingHandlersOrchestrator } from "./useAppControllerModelingHandlersOrchestrator";
import {
  buildAnalysisScreenContentSlice,
  buildModelingScreenContentSlice
} from "./useAppControllerScreenContentSlices";

type ModelingSliceParams = Parameters<typeof buildModelingScreenContentSlice>[0];
type AnalysisSliceParams = Parameters<typeof buildAnalysisScreenContentSlice>[0];

interface UseAppControllerModelingAnalysisScreenDomainsParams {
  components: Pick<
    ModelingSliceParams,
    "ModelingPrimaryTablesComponent" | "ModelingSecondaryTablesComponent" | "ModelingFormsColumnComponent"
  > &
    Pick<AnalysisSliceParams, "AnalysisWorkspaceContentComponent">;
  screenFlags: Pick<
    ModelingSliceParams,
    "isConnectorSubScreen" | "isSpliceSubScreen" | "isNodeSubScreen" | "isSegmentSubScreen" | "isWireSubScreen"
  > &
    Pick<AnalysisSliceParams, "isConnectorSubScreen" | "isSpliceSubScreen" | "isNodeSubScreen" | "isSegmentSubScreen" | "isWireSubScreen">;
  entities: Pick<
    ModelingSliceParams,
    "catalogItems" | "connectors" | "splices" | "nodes" | "segments" | "wires"
  >;
  formsState: AppControllerFormsStateFlat;
  modelingHandlers: AppControllerModelingHandlersOrchestrator;
  listModel: Pick<
    EntityListModel,
    | "connectorOccupancyFilter"
    | "setConnectorOccupancyFilter"
    | "connectorFilterField"
    | "setConnectorFilterField"
    | "connectorSearchQuery"
    | "setConnectorSearchQuery"
    | "visibleConnectors"
    | "connectorSort"
    | "setConnectorSort"
    | "connectorOccupiedCountById"
    | "spliceOccupancyFilter"
    | "setSpliceOccupancyFilter"
    | "spliceFilterField"
    | "setSpliceFilterField"
    | "spliceSearchQuery"
    | "setSpliceSearchQuery"
    | "visibleSplices"
    | "spliceSort"
    | "setSpliceSort"
    | "spliceOccupiedCountById"
    | "nodeKindFilter"
    | "setNodeKindFilter"
    | "nodeFilterField"
    | "setNodeFilterField"
    | "nodeSearchQuery"
    | "setNodeSearchQuery"
    | "visibleNodes"
    | "nodeIdSortDirection"
    | "setNodeIdSortDirection"
    | "segmentsCountByNodeId"
    | "segmentSubNetworkFilter"
    | "setSegmentSubNetworkFilter"
    | "segmentFilterField"
    | "setSegmentFilterField"
    | "segmentSearchQuery"
    | "setSegmentSearchQuery"
    | "visibleSegments"
    | "segmentIdSortDirection"
    | "setSegmentIdSortDirection"
    | "wireRouteFilter"
    | "setWireRouteFilter"
    | "wireFilterField"
    | "setWireFilterField"
    | "wireEndpointFilterQuery"
    | "setWireEndpointFilterQuery"
    | "visibleWires"
    | "wireSort"
    | "setWireSort"
    | "connectorSynthesisSort"
    | "setConnectorSynthesisSort"
    | "spliceSynthesisSort"
    | "setSpliceSynthesisSort"
    | "sortedConnectorSynthesisRows"
    | "sortedSpliceSynthesisRows"
    | "getSortIndicator"
  >;
  selection: Pick<
    AppControllerSelectionEntitiesModel,
    | "selectedConnectorId"
    | "selectedSpliceId"
    | "selectedNodeId"
    | "selectedSegmentId"
    | "selectedWireId"
    | "selectedConnector"
    | "selectedSplice"
    | "selectedNode"
    | "selectedSegment"
    | "selectedWire"
    | "connectorCavityStatuses"
    | "splicePortStatuses"
  >;
  layoutDerived: Pick<ModelingSliceParams, "selectedWireRouteSegmentIds">;
  pendingNewNodePosition: ModelingSliceParams["pendingNewNodePosition"];
  wireDescriptions: WireEndpointDescriptions;
  describeNode: ModelingSliceParams["describeNode"];
  nodeLabelById: ModelingSliceParams["nodeLabelById"];
  connectorTechnicalIdAlreadyUsed: ModelingSliceParams["connectorTechnicalIdAlreadyUsed"];
  spliceTechnicalIdAlreadyUsed: ModelingSliceParams["spliceTechnicalIdAlreadyUsed"];
  wireTechnicalIdAlreadyUsed: ModelingSliceParams["wireTechnicalIdAlreadyUsed"];
  onSelectConnector: AnalysisSliceParams["onSelectConnector"];
  onSelectSplice: AnalysisSliceParams["onSelectSplice"];
  onSelectNode: AnalysisSliceParams["onSelectNode"];
  onSelectSegment: AnalysisSliceParams["onSelectSegment"];
  onSelectWire: AnalysisSliceParams["onSelectWire"];
  includeModelingContent: boolean;
  includeAnalysisContent: boolean;
  openCatalogSubScreen: () => void;
  markSelectionPanelsFromTable?: () => void;
  onboardingHelp?: {
    openCatalogStep: () => void;
    openConnectorStep: () => void;
    openSpliceStep: () => void;
    openNodeStep: () => void;
    openSegmentStep: () => void;
    openWireStep: () => void;
  };
}

export function useAppControllerModelingAnalysisScreenDomains({
  components,
  screenFlags,
  entities,
  formsState,
  modelingHandlers,
  listModel,
  selection,
  layoutDerived,
  pendingNewNodePosition,
  wireDescriptions,
  describeNode,
  nodeLabelById,
  connectorTechnicalIdAlreadyUsed,
  spliceTechnicalIdAlreadyUsed,
  wireTechnicalIdAlreadyUsed,
  onSelectConnector,
  onSelectSplice,
  onSelectNode,
  onSelectSegment,
  onSelectWire,
  includeModelingContent,
  includeAnalysisContent,
  openCatalogSubScreen,
  markSelectionPanelsFromTable,
  onboardingHelp
}: UseAppControllerModelingAnalysisScreenDomainsParams) {
  const modelingSlice = includeModelingContent
    ? buildModelingScreenContentSlice({
    ModelingPrimaryTablesComponent: components.ModelingPrimaryTablesComponent,
    ModelingSecondaryTablesComponent: components.ModelingSecondaryTablesComponent,
    ModelingFormsColumnComponent: components.ModelingFormsColumnComponent,
    catalogItems: entities.catalogItems,
    openCatalogSubScreen,
    isConnectorSubScreen: screenFlags.isConnectorSubScreen,
    connectorFormMode: formsState.connectorFormMode,
    resetConnectorForm: modelingHandlers.connector.resetConnectorForm,
    connectorOccupancyFilter: listModel.connectorOccupancyFilter,
    setConnectorOccupancyFilter: listModel.setConnectorOccupancyFilter,
    connectorFilterField: listModel.connectorFilterField,
    setConnectorFilterField: listModel.setConnectorFilterField,
    connectorFilterQuery: listModel.connectorSearchQuery,
    setConnectorFilterQuery: listModel.setConnectorSearchQuery,
    connectors: entities.connectors,
    visibleConnectors: listModel.visibleConnectors,
    connectorSort: listModel.connectorSort,
    setConnectorSort: listModel.setConnectorSort,
    getSortIndicator: listModel.getSortIndicator,
    connectorOccupiedCountById: listModel.connectorOccupiedCountById,
    selectedConnectorId: selection.selectedConnectorId,
    startConnectorEdit: (connector) => {
      markSelectionPanelsFromTable?.();
      modelingHandlers.connector.startConnectorEdit(connector);
    },
    handleConnectorDelete: modelingHandlers.connector.handleConnectorDelete,
    onOpenConnectorOnboardingHelp: onboardingHelp?.openConnectorStep,
    isSpliceSubScreen: screenFlags.isSpliceSubScreen,
    spliceFormMode: formsState.spliceFormMode,
    resetSpliceForm: modelingHandlers.splice.resetSpliceForm,
    spliceOccupancyFilter: listModel.spliceOccupancyFilter,
    setSpliceOccupancyFilter: listModel.setSpliceOccupancyFilter,
    spliceFilterField: listModel.spliceFilterField,
    setSpliceFilterField: listModel.setSpliceFilterField,
    spliceFilterQuery: listModel.spliceSearchQuery,
    setSpliceFilterQuery: listModel.setSpliceSearchQuery,
    splices: entities.splices,
    visibleSplices: listModel.visibleSplices,
    spliceSort: listModel.spliceSort,
    setSpliceSort: listModel.setSpliceSort,
    spliceOccupiedCountById: listModel.spliceOccupiedCountById,
    selectedSpliceId: selection.selectedSpliceId,
    startSpliceEdit: (splice) => {
      markSelectionPanelsFromTable?.();
      modelingHandlers.splice.startSpliceEdit(splice);
    },
    handleSpliceDelete: modelingHandlers.splice.handleSpliceDelete,
    onOpenSpliceOnboardingHelp: onboardingHelp?.openSpliceStep,
    isNodeSubScreen: screenFlags.isNodeSubScreen,
    nodeFormMode: formsState.nodeFormMode,
    resetNodeForm: modelingHandlers.node.resetNodeForm,
    nodeKindFilter: listModel.nodeKindFilter,
    setNodeKindFilter: listModel.setNodeKindFilter,
    nodeFilterField: listModel.nodeFilterField,
    setNodeFilterField: listModel.setNodeFilterField,
    nodeFilterQuery: listModel.nodeSearchQuery,
    setNodeFilterQuery: listModel.setNodeSearchQuery,
    nodes: entities.nodes,
    visibleNodes: listModel.visibleNodes,
    nodeIdSortDirection: listModel.nodeIdSortDirection,
    setNodeIdSortDirection: listModel.setNodeIdSortDirection,
    segmentsCountByNodeId: listModel.segmentsCountByNodeId,
    selectedNodeId: selection.selectedNodeId,
    describeNode,
    startNodeEdit: (node) => {
      markSelectionPanelsFromTable?.();
      modelingHandlers.node.startNodeEdit(node);
    },
    handleNodeDelete: modelingHandlers.node.handleNodeDelete,
    onOpenNodeOnboardingHelp: onboardingHelp?.openNodeStep,
    isSegmentSubScreen: screenFlags.isSegmentSubScreen,
    segmentFormMode: formsState.segmentFormMode,
    resetSegmentForm: modelingHandlers.segment.resetSegmentForm,
    segmentSubNetworkFilter: listModel.segmentSubNetworkFilter,
    setSegmentSubNetworkFilter: listModel.setSegmentSubNetworkFilter,
    segmentFilterField: listModel.segmentFilterField,
    setSegmentFilterField: listModel.setSegmentFilterField,
    segmentFilterQuery: listModel.segmentSearchQuery,
    setSegmentFilterQuery: listModel.setSegmentSearchQuery,
    segments: entities.segments,
    visibleSegments: listModel.visibleSegments,
    segmentIdSortDirection: listModel.segmentIdSortDirection,
    setSegmentIdSortDirection: listModel.setSegmentIdSortDirection,
    nodeLabelById,
    selectedSegmentId: selection.selectedSegmentId,
    selectedWireRouteSegmentIds: layoutDerived.selectedWireRouteSegmentIds,
    startSegmentEdit: (segment) => {
      markSelectionPanelsFromTable?.();
      modelingHandlers.segment.startSegmentEdit(segment);
    },
    handleSegmentDelete: modelingHandlers.segment.handleSegmentDelete,
    onOpenSegmentOnboardingHelp: onboardingHelp?.openSegmentStep,
    isWireSubScreen: screenFlags.isWireSubScreen,
    wireFormMode: formsState.wireFormMode,
    resetWireForm: modelingHandlers.wire.resetWireForm,
    wireRouteFilter: listModel.wireRouteFilter,
    setWireRouteFilter: listModel.setWireRouteFilter,
    wireFilterField: listModel.wireFilterField,
    setWireFilterField: listModel.setWireFilterField,
    wireEndpointFilterQuery: listModel.wireEndpointFilterQuery,
    setWireEndpointFilterQuery: listModel.setWireEndpointFilterQuery,
    wires: entities.wires,
    visibleWires: listModel.visibleWires,
    wireSort: listModel.wireSort,
    setWireSort: listModel.setWireSort,
    selectedWireId: selection.selectedWireId,
    describeWireEndpoint: wireDescriptions.describeWireEndpoint,
    describeWireEndpointId: wireDescriptions.describeWireEndpointId,
    startWireEdit: (wire) => {
      markSelectionPanelsFromTable?.();
      modelingHandlers.wire.startWireEdit(wire);
    },
    handleWireDelete: modelingHandlers.wire.handleWireDelete,
    onOpenWireOnboardingHelp: onboardingHelp?.openWireStep,
    handleConnectorSubmit: modelingHandlers.connector.handleConnectorSubmit,
    connectorName: formsState.connectorName,
    setConnectorName: formsState.setConnectorName,
    connectorTechnicalId: formsState.connectorTechnicalId,
    setConnectorTechnicalId: formsState.setConnectorTechnicalId,
    connectorCatalogItemId: formsState.connectorCatalogItemId,
    setConnectorCatalogItemId:
      modelingHandlers.connector.syncDerivedConnectorCatalogFields ?? formsState.setConnectorCatalogItemId,
    connectorManufacturerReference: formsState.connectorManufacturerReference,
    setConnectorManufacturerReference: formsState.setConnectorManufacturerReference,
    connectorAutoCreateLinkedNode: formsState.connectorAutoCreateLinkedNode,
    setConnectorAutoCreateLinkedNode: formsState.setConnectorAutoCreateLinkedNode,
    connectorTechnicalIdAlreadyUsed,
    cavityCount: formsState.cavityCount,
    setCavityCount: formsState.setCavityCount,
    cancelConnectorEdit: modelingHandlers.connector.cancelConnectorEdit,
    connectorFormError: formsState.connectorFormError,
    handleSpliceSubmit: modelingHandlers.splice.handleSpliceSubmit,
    spliceName: formsState.spliceName,
    setSpliceName: formsState.setSpliceName,
    spliceTechnicalId: formsState.spliceTechnicalId,
    setSpliceTechnicalId: formsState.setSpliceTechnicalId,
    spliceCatalogItemId: formsState.spliceCatalogItemId,
    setSpliceCatalogItemId:
      modelingHandlers.splice.syncDerivedSpliceCatalogFields ?? formsState.setSpliceCatalogItemId,
    spliceManufacturerReference: formsState.spliceManufacturerReference,
    setSpliceManufacturerReference: formsState.setSpliceManufacturerReference,
    spliceAutoCreateLinkedNode: formsState.spliceAutoCreateLinkedNode,
    setSpliceAutoCreateLinkedNode: formsState.setSpliceAutoCreateLinkedNode,
    spliceTechnicalIdAlreadyUsed,
    portCount: formsState.portCount,
    setPortCount: formsState.setPortCount,
    cancelSpliceEdit: modelingHandlers.splice.cancelSpliceEdit,
    spliceFormError: formsState.spliceFormError,
    handleNodeSubmit: modelingHandlers.node.handleNodeSubmit,
    nodeIdInput: formsState.nodeIdInput,
    setNodeIdInput: formsState.setNodeIdInput,
    pendingNewNodePosition,
    nodeKind: formsState.nodeKind,
    setNodeKind: formsState.setNodeKind,
    nodeLabel: formsState.nodeLabel,
    setNodeLabel: formsState.setNodeLabel,
    nodeConnectorId: formsState.nodeConnectorId,
    setNodeConnectorId: formsState.setNodeConnectorId,
    nodeSpliceId: formsState.nodeSpliceId,
    setNodeSpliceId: formsState.setNodeSpliceId,
    cancelNodeEdit: modelingHandlers.node.cancelNodeEdit,
    nodeFormError: formsState.nodeFormError,
    handleSegmentSubmit: modelingHandlers.segment.handleSegmentSubmit,
    segmentIdInput: formsState.segmentIdInput,
    setSegmentIdInput: formsState.setSegmentIdInput,
    segmentNodeA: formsState.segmentNodeA,
    setSegmentNodeA: formsState.setSegmentNodeA,
    segmentNodeB: formsState.segmentNodeB,
    setSegmentNodeB: formsState.setSegmentNodeB,
    segmentLengthMm: formsState.segmentLengthMm,
    setSegmentLengthMm: formsState.setSegmentLengthMm,
    segmentSubNetworkTag: formsState.segmentSubNetworkTag,
    setSegmentSubNetworkTag: formsState.setSegmentSubNetworkTag,
    cancelSegmentEdit: modelingHandlers.segment.cancelSegmentEdit,
    segmentFormError: formsState.segmentFormError,
    handleWireSubmit: modelingHandlers.wire.handleWireSubmit,
    wireName: formsState.wireName,
    setWireName: formsState.setWireName,
    wireTechnicalId: formsState.wireTechnicalId,
    setWireTechnicalId: formsState.setWireTechnicalId,
    wireSectionMm2: formsState.wireSectionMm2,
    setWireSectionMm2: formsState.setWireSectionMm2,
    wireColorMode: formsState.wireColorMode,
    setWireColorMode: modelingHandlers.wire.setWireColorModeAndResetIncompatibleValues,
    wirePrimaryColorId: formsState.wirePrimaryColorId,
    setWirePrimaryColorId: formsState.setWirePrimaryColorId,
    wireSecondaryColorId: formsState.wireSecondaryColorId,
    setWireSecondaryColorId: formsState.setWireSecondaryColorId,
    wireFreeColorLabel: formsState.wireFreeColorLabel,
    setWireFreeColorLabel: formsState.setWireFreeColorLabel,
    wireTechnicalIdAlreadyUsed,
    wireEndpointAConnectionReference: formsState.wireEndpointAConnectionReference,
    setWireEndpointAConnectionReference: formsState.setWireEndpointAConnectionReference,
    wireEndpointASealReference: formsState.wireEndpointASealReference,
    setWireEndpointASealReference: formsState.setWireEndpointASealReference,
    wireEndpointAKind: formsState.wireEndpointAKind,
    setWireEndpointAKind: formsState.setWireEndpointAKind,
    wireEndpointAConnectorId: formsState.wireEndpointAConnectorId,
    setWireEndpointAConnectorId: formsState.setWireEndpointAConnectorId,
    wireEndpointACavityIndex: formsState.wireEndpointACavityIndex,
    setWireEndpointACavityIndex: modelingHandlers.wire.setWireEndpointACavityIndex,
    wireEndpointASpliceId: formsState.wireEndpointASpliceId,
    setWireEndpointASpliceId: formsState.setWireEndpointASpliceId,
    wireEndpointAPortIndex: formsState.wireEndpointAPortIndex,
    setWireEndpointAPortIndex: modelingHandlers.wire.setWireEndpointAPortIndex,
    wireEndpointASlotHint: modelingHandlers.wire.wireEndpointASlotHint,
    wireEndpointBConnectionReference: formsState.wireEndpointBConnectionReference,
    setWireEndpointBConnectionReference: formsState.setWireEndpointBConnectionReference,
    wireEndpointBSealReference: formsState.wireEndpointBSealReference,
    setWireEndpointBSealReference: formsState.setWireEndpointBSealReference,
    wireEndpointBKind: formsState.wireEndpointBKind,
    setWireEndpointBKind: formsState.setWireEndpointBKind,
    wireEndpointBConnectorId: formsState.wireEndpointBConnectorId,
    setWireEndpointBConnectorId: formsState.setWireEndpointBConnectorId,
    wireEndpointBCavityIndex: formsState.wireEndpointBCavityIndex,
    setWireEndpointBCavityIndex: modelingHandlers.wire.setWireEndpointBCavityIndex,
    wireEndpointBSpliceId: formsState.wireEndpointBSpliceId,
    setWireEndpointBSpliceId: formsState.setWireEndpointBSpliceId,
    wireEndpointBPortIndex: formsState.wireEndpointBPortIndex,
    setWireEndpointBPortIndex: modelingHandlers.wire.setWireEndpointBPortIndex,
    wireEndpointBSlotHint: modelingHandlers.wire.wireEndpointBSlotHint,
    cancelWireEdit: modelingHandlers.wire.cancelWireEdit,
    wireFormError: formsState.wireFormError
      })
    : null;

  const analysisSlice = includeAnalysisContent
    ? (() => {
      return buildAnalysisScreenContentSlice({
    AnalysisWorkspaceContentComponent: components.AnalysisWorkspaceContentComponent,
    isConnectorSubScreen: screenFlags.isConnectorSubScreen,
    isSpliceSubScreen: screenFlags.isSpliceSubScreen,
    isNodeSubScreen: screenFlags.isNodeSubScreen,
    isSegmentSubScreen: screenFlags.isSegmentSubScreen,
    isWireSubScreen: screenFlags.isWireSubScreen,
    selectedConnector: selection.selectedConnector,
    selectedConnectorId: selection.selectedConnectorId,
    connectorOccupancyFilter: listModel.connectorOccupancyFilter,
    setConnectorOccupancyFilter: listModel.setConnectorOccupancyFilter,
    connectorFilterField: listModel.connectorFilterField,
    setConnectorFilterField: listModel.setConnectorFilterField,
    connectorFilterQuery: listModel.connectorSearchQuery,
    setConnectorFilterQuery: listModel.setConnectorSearchQuery,
    connectors: entities.connectors,
    visibleConnectors: listModel.visibleConnectors,
    connectorSort: listModel.connectorSort,
    setConnectorSort: listModel.setConnectorSort,
    connectorOccupiedCountById: listModel.connectorOccupiedCountById,
    onSelectConnector,
    onOpenConnectorOnboardingHelp: onboardingHelp?.openConnectorStep,
    cavityIndexInput: formsState.cavityIndexInput,
    setCavityIndexInput: formsState.setCavityIndexInput,
    connectorOccupantRefInput: formsState.connectorOccupantRefInput,
    setConnectorOccupantRefInput: formsState.setConnectorOccupantRefInput,
    handleReserveCavity: modelingHandlers.connector.handleReserveCavity,
    connectorCavityStatuses: selection.connectorCavityStatuses,
    handleReleaseCavity: modelingHandlers.connector.handleReleaseCavity,
    sortedConnectorSynthesisRows: listModel.sortedConnectorSynthesisRows,
    connectorSynthesisSort: listModel.connectorSynthesisSort,
    setConnectorSynthesisSort: listModel.setConnectorSynthesisSort,
    getSortIndicator: listModel.getSortIndicator,
    selectedSplice: selection.selectedSplice,
    selectedSpliceId: selection.selectedSpliceId,
    spliceOccupancyFilter: listModel.spliceOccupancyFilter,
    setSpliceOccupancyFilter: listModel.setSpliceOccupancyFilter,
    spliceFilterField: listModel.spliceFilterField,
    setSpliceFilterField: listModel.setSpliceFilterField,
    spliceFilterQuery: listModel.spliceSearchQuery,
    setSpliceFilterQuery: listModel.setSpliceSearchQuery,
    splices: entities.splices,
    visibleSplices: listModel.visibleSplices,
    spliceSort: listModel.spliceSort,
    setSpliceSort: listModel.setSpliceSort,
    spliceOccupiedCountById: listModel.spliceOccupiedCountById,
    onSelectSplice,
    onOpenSpliceOnboardingHelp: onboardingHelp?.openSpliceStep,
    splicePortStatuses: selection.splicePortStatuses,
    portIndexInput: formsState.portIndexInput,
    setPortIndexInput: formsState.setPortIndexInput,
    spliceOccupantRefInput: formsState.spliceOccupantRefInput,
    setSpliceOccupantRefInput: formsState.setSpliceOccupantRefInput,
    handleReservePort: modelingHandlers.splice.handleReservePort,
    handleReleasePort: modelingHandlers.splice.handleReleasePort,
    sortedSpliceSynthesisRows: listModel.sortedSpliceSynthesisRows,
    spliceSynthesisSort: listModel.spliceSynthesisSort,
    setSpliceSynthesisSort: listModel.setSpliceSynthesisSort,
    nodeKindFilter: listModel.nodeKindFilter,
    setNodeKindFilter: listModel.setNodeKindFilter,
    nodeFilterField: listModel.nodeFilterField,
    setNodeFilterField: listModel.setNodeFilterField,
    nodeFilterQuery: listModel.nodeSearchQuery,
    setNodeFilterQuery: listModel.setNodeSearchQuery,
    nodes: entities.nodes,
    visibleNodes: listModel.visibleNodes,
    segmentsCountByNodeId: listModel.segmentsCountByNodeId,
    selectedNodeId: selection.selectedNodeId,
    selectedNode: selection.selectedNode,
    selectedSegment: selection.selectedSegment,
    onSelectNode,
    onOpenNodeOnboardingHelp: onboardingHelp?.openNodeStep,
    describeNode,
    nodeLabelById,
    segmentSubNetworkFilter: listModel.segmentSubNetworkFilter,
    setSegmentSubNetworkFilter: listModel.setSegmentSubNetworkFilter,
    segmentFilterField: listModel.segmentFilterField,
    setSegmentFilterField: listModel.setSegmentFilterField,
    segmentFilterQuery: listModel.segmentSearchQuery,
    setSegmentFilterQuery: listModel.setSegmentSearchQuery,
    segments: entities.segments,
    visibleSegments: listModel.visibleSegments,
    selectedSegmentId: selection.selectedSegmentId,
    onSelectSegment,
    onOpenSegmentOnboardingHelp: onboardingHelp?.openSegmentStep,
    wireRouteFilter: listModel.wireRouteFilter,
    setWireRouteFilter: listModel.setWireRouteFilter,
    wireFilterField: listModel.wireFilterField,
    setWireFilterField: listModel.setWireFilterField,
    wireEndpointFilterQuery: listModel.wireEndpointFilterQuery,
    setWireEndpointFilterQuery: listModel.setWireEndpointFilterQuery,
    wires: entities.wires,
    visibleWires: listModel.visibleWires,
    wireSort: listModel.wireSort,
    setWireSort: listModel.setWireSort,
    selectedWireId: selection.selectedWireId,
    onSelectWire,
    onOpenWireOnboardingHelp: onboardingHelp?.openWireStep,
    selectedWire: selection.selectedWire,
    describeWireEndpoint: wireDescriptions.describeWireEndpoint,
    describeWireEndpointId: wireDescriptions.describeWireEndpointId,
    wireForcedRouteInput: formsState.wireForcedRouteInput,
    setWireForcedRouteInput: formsState.setWireForcedRouteInput,
    handleLockWireRoute: modelingHandlers.wire.handleLockWireRoute,
    handleResetWireRoute: modelingHandlers.wire.handleResetWireRoute,
    wireFormError: formsState.wireFormError
      });
    })()
    : null;

  return {
    modelingLeftColumnContent: modelingSlice?.modelingLeftColumnContent ?? null,
    modelingFormsColumnContent: modelingSlice?.modelingFormsColumnContent ?? null,
    analysisWorkspaceContent: analysisSlice?.analysisWorkspaceContent ?? null
  };
}
