import { useCallback, useEffect, useMemo, useState } from "react";
import { appActions, type AppStore } from "../../../store";
import type { ConfirmDialogRequest } from "../../types/confirm-dialog";
import {
  analyzeModelingBatchDelete,
  type ModelingBatchSelectionId,
  type ModelingBatchSelectionScope
} from "../../lib/modelingBatchDelete";
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
  onGoToSegmentFromAnalysis: AnalysisSliceParams["onGoToSegmentFromAnalysis"];
  onGoToWireFromAnalysis: AnalysisSliceParams["onGoToWireFromAnalysis"];
  includeModelingContent: boolean;
  includeAnalysisContent: boolean;
  store: AppStore;
  dispatchAction: (action: Parameters<AppStore["dispatch"]>[0], options?: { trackHistory?: boolean }) => void;
  requestConfirmation: (request: ConfirmDialogRequest) => Promise<boolean>;
  replaceStateWithHistory: (nextState: ReturnType<AppStore["getState"]>) => void;
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
  onGoToSegmentFromAnalysis,
  onGoToWireFromAnalysis,
  includeModelingContent,
  includeAnalysisContent,
  store,
  dispatchAction,
  requestConfirmation,
  replaceStateWithHistory,
  openCatalogSubScreen,
  markSelectionPanelsFromTable,
  onboardingHelp
}: UseAppControllerModelingAnalysisScreenDomainsParams) {
  const [activeBatchScope, setActiveBatchScope] = useState<ModelingBatchSelectionScope | null>(null);
  const [batchSelectionIds, setBatchSelectionIds] = useState<ReadonlySet<string>>(new Set());
  const activeSubScreenBatchScope = screenFlags.isConnectorSubScreen
    ? "connector"
    : screenFlags.isSpliceSubScreen
      ? "splice"
      : screenFlags.isNodeSubScreen
        ? "node"
        : screenFlags.isSegmentSubScreen
          ? "segment"
          : "wire";

  const clearAllModelingForms = useCallback(() => {
    modelingHandlers.connector.clearConnectorForm();
    modelingHandlers.splice.clearSpliceForm();
    modelingHandlers.node.clearNodeForm();
    modelingHandlers.segment.clearSegmentForm();
    modelingHandlers.wire.clearWireForm();
  }, [modelingHandlers]);

  const exitBatchMode = useCallback(() => {
    setActiveBatchScope(null);
    setBatchSelectionIds(new Set());
  }, []);

  const enterBatchMode = useCallback(
    (scope: ModelingBatchSelectionScope) => {
      clearAllModelingForms();
      dispatchAction(appActions.clearSelection(), { trackHistory: false });
      setActiveBatchScope(scope);
      setBatchSelectionIds(new Set());
    },
    [clearAllModelingForms, dispatchAction]
  );

  useEffect(() => {
    if (activeBatchScope !== null && activeBatchScope !== activeSubScreenBatchScope) {
      exitBatchMode();
    }
  }, [activeBatchScope, activeSubScreenBatchScope, exitBatchMode]);

  useEffect(() => {
    if (activeBatchScope === null) {
      return;
    }
    const availableIds = new Set<string>(
      activeBatchScope === "connector"
        ? entities.connectors.map((connector) => connector.id)
        : activeBatchScope === "splice"
          ? entities.splices.map((splice) => splice.id)
          : activeBatchScope === "node"
            ? entities.nodes.map((node) => node.id)
            : activeBatchScope === "segment"
              ? entities.segments.map((segment) => segment.id)
              : entities.wires.map((wire) => wire.id)
    );
    setBatchSelectionIds((current) => {
      const next = [...current].filter((id) => availableIds.has(id));
      return next.length === current.size ? current : new Set(next);
    });
  }, [activeBatchScope, entities.connectors, entities.nodes, entities.segments, entities.splices, entities.wires]);

  const toggleBatchSelection = useCallback((scope: ModelingBatchSelectionScope, id: string) => {
    setBatchSelectionIds((current) => {
      if (activeBatchScope !== scope) {
        return current;
      }
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, [activeBatchScope]);

  const setBatchSelectionForVisible = useCallback((scope: ModelingBatchSelectionScope, ids: readonly string[]) => {
    setBatchSelectionIds((current) => {
      if (activeBatchScope !== scope) {
        return current;
      }
      const next = new Set(current);
      const allVisibleSelected = ids.length > 0 && ids.every((id) => next.has(id));
      for (const id of ids) {
        if (allVisibleSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      }
      return next;
    });
  }, [activeBatchScope]);

  const batchDeleteAnalysisState = useMemo(
    () => {
      const entitySnapshotSizes = [
        entities.connectors.length,
        entities.splices.length,
        entities.nodes.length,
        entities.segments.length,
        entities.wires.length
      ];
      void entitySnapshotSizes;
      return store.getState();
    },
    [entities.connectors, entities.nodes, entities.segments, entities.splices, entities.wires, store]
  );

  const batchDeletePreflight = useMemo(() => {
    if (activeBatchScope === null) {
      return null;
    }
    return analyzeModelingBatchDelete(
      batchDeleteAnalysisState,
      activeBatchScope,
      [...batchSelectionIds] as ModelingBatchSelectionId[]
    );
  }, [activeBatchScope, batchDeleteAnalysisState, batchSelectionIds]);

  const handleDeleteSelectedInBatchMode = useCallback(() => {
    if (batchDeletePreflight === null || activeBatchScope === null) {
      return;
    }

    void (async () => {
      if (batchDeletePreflight.blockedCount > 0) {
        await requestConfirmation({
          title: batchDeletePreflight.blockedTitle,
          message: batchDeletePreflight.blockedMessage,
          confirmLabel: "Close",
          cancelLabel: "Cancel",
          intent: "warning",
          variant: "deleteBlocked",
          summaryCategories: batchDeletePreflight.summaryCategories,
          summaryNote: batchDeletePreflight.summaryNote
        });
        return;
      }

      if (batchDeletePreflight.nextState === null) {
        return;
      }

      const shouldDelete = await requestConfirmation({
        title: batchDeletePreflight.confirmationTitle,
        message: batchDeletePreflight.confirmationMessage,
        confirmLabel: batchDeletePreflight.confirmLabel,
        cancelLabel: "Cancel",
        intent: "danger",
        confirmOnEnter: true,
        variant: batchDeletePreflight.confirmationVariant,
        summaryCategories: batchDeletePreflight.summaryCategories,
        summaryNote: batchDeletePreflight.summaryNote
      });
      if (!shouldDelete) {
        return;
      }

      replaceStateWithHistory(batchDeletePreflight.nextState);
      clearAllModelingForms();
      exitBatchMode();
    })();
  }, [activeBatchScope, batchDeletePreflight, clearAllModelingForms, exitBatchMode, replaceStateWithHistory, requestConfirmation]);

  const modelingSlice = includeModelingContent
    ? buildModelingScreenContentSlice({
    ModelingPrimaryTablesComponent: components.ModelingPrimaryTablesComponent,
    ModelingSecondaryTablesComponent: components.ModelingSecondaryTablesComponent,
    ModelingFormsColumnComponent: components.ModelingFormsColumnComponent,
    activeBatchScope,
    batchSelectionIds,
    onEnterBatchMode: enterBatchMode,
    onExitBatchMode: exitBatchMode,
    onToggleBatchSelection: toggleBatchSelection,
    onSetBatchSelectionForVisible: setBatchSelectionForVisible,
    onDeleteSelectedInBatchMode: handleDeleteSelectedInBatchMode,
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
    dispatchAction,
    connectorHandlers: modelingHandlers.connector,
    segmentHandlers: modelingHandlers.segment,
    wireHandlers: modelingHandlers.wire,
    selectedWireId: selection.selectedWireId,
    describeWireEndpoint: wireDescriptions.describeWireEndpoint,
    describeWireEndpointCsvParts: wireDescriptions.describeWireEndpointCsvParts,
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
    splicePortMode: formsState.splicePortMode,
    setSplicePortMode: modelingHandlers.splice.setSpliceCapacityMode ?? formsState.setSplicePortMode,
    spliceManufacturerReference: formsState.spliceManufacturerReference,
    setSpliceManufacturerReference: formsState.setSpliceManufacturerReference,
    spliceAutoCreateLinkedNode: formsState.spliceAutoCreateLinkedNode,
    setSpliceAutoCreateLinkedNode: formsState.setSpliceAutoCreateLinkedNode,
    spliceTechnicalIdAlreadyUsed,
    portCount: formsState.portCount,
    setPortCount: formsState.setPortCount,
    spliceFormInfo: formsState.spliceFormInfo,
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
    handleSwapSegmentNodes: modelingHandlers.segment.handleSwapSegmentNodes,
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
    handleSwapWireEndpoints: modelingHandlers.wire.handleSwapWireEndpoints,
    wireName: formsState.wireName,
    setWireName: formsState.setWireName,
    wireTechnicalId: formsState.wireTechnicalId,
    setWireTechnicalId: formsState.setWireTechnicalId,
    wireSectionMm2: formsState.wireSectionMm2,
    setWireSectionMm2: formsState.setWireSectionMm2,
    wireCurrentA: formsState.wireCurrentA,
    setWireCurrentA: formsState.setWireCurrentA,
    wireMaterial: formsState.wireMaterial,
    setWireMaterial: formsState.setWireMaterial,
    recommendedWireSectionMm2: modelingHandlers.wire.recommendedWireSectionMm2,
    handleApplyRecommendedWireSection: modelingHandlers.wire.handleApplyRecommendedWireSection,
    wireColorMode: formsState.wireColorMode,
    setWireColorMode: modelingHandlers.wire.setWireColorModeAndResetIncompatibleValues,
    wirePrimaryColorId: formsState.wirePrimaryColorId,
    setWirePrimaryColorId: formsState.setWirePrimaryColorId,
    wireSecondaryColorId: formsState.wireSecondaryColorId,
    setWireSecondaryColorId: formsState.setWireSecondaryColorId,
    wireFreeColorLabel: formsState.wireFreeColorLabel,
    setWireFreeColorLabel: formsState.setWireFreeColorLabel,
    wireFuseEnabled: formsState.wireFuseEnabled,
    setWireFuseEnabled: formsState.setWireFuseEnabled,
    wireFuseCatalogItemId: formsState.wireFuseCatalogItemId,
    setWireFuseCatalogItemId: formsState.setWireFuseCatalogItemId,
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
    wireFormError: formsState.wireFormError,
    modelingBatchSelection:
      activeBatchScope === null || batchDeletePreflight === null
        ? null
        : {
            scope: activeBatchScope,
            selectedCount: batchDeletePreflight.selectedCount,
            directCount: batchDeletePreflight.directCount,
            cascadeCount: batchDeletePreflight.cascadeCount,
            blockedCount: batchDeletePreflight.blockedCount,
            summaryCategories: batchDeletePreflight.summaryCategories,
            summaryNote: batchDeletePreflight.summaryNote,
            onDeleteSelected: handleDeleteSelectedInBatchMode,
            onCancelBatchMode: exitBatchMode
          }
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
    catalogItems: entities.catalogItems,
    wires: entities.wires,
    visibleWires: listModel.visibleWires,
    wireSort: listModel.wireSort,
    setWireSort: listModel.setWireSort,
    selectedWireId: selection.selectedWireId,
    onSelectWire,
    onGoToSegmentFromAnalysis,
    onGoToWireFromAnalysis,
    onOpenWireOnboardingHelp: onboardingHelp?.openWireStep,
    selectedWire: selection.selectedWire,
    describeWireEndpoint: wireDescriptions.describeWireEndpoint,
    describeWireEndpointCsvParts: wireDescriptions.describeWireEndpointCsvParts,
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
    analysisWorkspaceContent: analysisSlice?.analysisWorkspaceContent ?? null,
    isModelingBatchModeActive: activeBatchScope !== null
  };
}
