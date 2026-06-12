import type { AppAction } from "../../../store/actions";
import type { AppStore } from "../../../store";
import type { ScreenId, SubScreenId, UndoHistoryEntry } from "../../types/app-controller";
import type { AppControllerCanvasDisplayStateModel } from "../useAppControllerCanvasDisplayState";
import type { AppControllerPreferencesStateModel } from "../useAppControllerPreferencesState";
import type { CanvasStateModel } from "../useCanvasState";
import type { CatalogHandlersModel } from "../useCatalogHandlers";
import type { EntityListModel } from "../useEntityListModel";
import type { EntityFormsStateModel } from "../useEntityFormsState";
import type { NetworkScopeFormStateModel } from "../useNetworkScopeFormState";
import type { AppControllerSelectionEntitiesModel } from "../useAppControllerSelectionEntities";
import type { ValidationModel } from "../useValidationModel";
import type { AiSettingsModel } from "../useAiSettings";
import type { UseWorkspaceFileStorageModel } from "../useWorkspaceFileStorage";
import type { AiProviderReadiness } from "../../lib/aiSettings";
import { buildWorkspaceLayoutContent } from "../../lib/appControllerWorkspaceLayoutContent";
import type { AppControllerModelingHandlersAssemblyModel } from "./useAppControllerModelingHandlersAssembly";
import type { AppControllerWorkspaceNetworkDomainAssemblyModel } from "./useAppControllerWorkspaceNetworkDomainAssembly";
import type { AppControllerCatalogAnalysisActionsModel } from "./useAppControllerCatalogAnalysisActions";
import type { AppControllerSelectionHandlersDomainAssemblyModel } from "./useAppControllerSelectionHandlersDomainAssembly";
import type { AppControllerCanvasInteractionDomainAssemblyModel } from "./useAppControllerCanvasInteractionDomainAssembly";
import { useCallback, useState, type ComponentType } from "react";
import { useAppControllerHomeWorkspaceContent } from "./useAppControllerHomeWorkspaceContent";
import { useAppControllerNetworkSummaryPanelDomain } from "./useAppControllerNetworkSummaryPanelDomain";
import { useAppControllerModelingAnalysisDomainAssembly } from "./useAppControllerModelingAnalysisDomainAssembly";
import { useAppControllerCatalogScreenDomains } from "./useAppControllerCatalogScreenDomains";
import { useAppControllerAuxDomainAssembly } from "./useAppControllerAuxDomainAssembly";
import { useAppControllerAiAgentWorkspaceContent } from "./useAppControllerAiAgentWorkspaceContent";

type HomeWorkspaceParams = Parameters<typeof useAppControllerHomeWorkspaceContent>[0];
type NetworkSummaryParams = Parameters<typeof useAppControllerNetworkSummaryPanelDomain>[0];
type ModelingAnalysisParams = Parameters<typeof useAppControllerModelingAnalysisDomainAssembly>[0];
type CatalogDomainsParams = Omit<Parameters<typeof useAppControllerCatalogScreenDomains>[0], "modelingLeftColumnContent" | "modelingFormsColumnContent" | "analysisWorkspaceContent">;
type AuxDomainsParams = Parameters<typeof useAppControllerAuxDomainAssembly>[0];
type StatisticsWorkspaceContentProps = Parameters<
  typeof import("../../components/workspace/StatisticsWorkspaceContent").StatisticsWorkspaceContent
>[0];

export interface AppControllerWorkspaceContentAssemblyParams {
  components: {
    HomeWorkspaceContentComponent: HomeWorkspaceParams["HomeWorkspaceContentComponent"];
    NetworkSummaryPanelComponent: NetworkSummaryParams["NetworkSummaryPanelComponent"];
    ModelingPrimaryTablesComponent: ModelingAnalysisParams["components"]["ModelingPrimaryTablesComponent"];
    ModelingSecondaryTablesComponent: ModelingAnalysisParams["components"]["ModelingSecondaryTablesComponent"];
    ModelingFormsColumnComponent: ModelingAnalysisParams["components"]["ModelingFormsColumnComponent"];
    AnalysisWorkspaceContentComponent: ModelingAnalysisParams["components"]["AnalysisWorkspaceContentComponent"];
    NetworkScopeWorkspaceContentComponent: AuxDomainsParams["components"]["NetworkScopeWorkspaceContentComponent"];
    StatisticsWorkspaceContentComponent: ComponentType<StatisticsWorkspaceContentProps>;
    ValidationWorkspaceContentComponent: AuxDomainsParams["components"]["ValidationWorkspaceContentComponent"];
    SettingsWorkspaceContentComponent: AuxDomainsParams["components"]["SettingsWorkspaceContentComponent"];
  };
  state: {
    hasActiveNetwork: boolean;
    activeNetworkName: string | null;
    activeNetworkTechnicalId: string | null;
    activeNetwork: NetworkSummaryParams["activeNetwork"];
    activeSubScreen: SubScreenId;
    isModelingScreen: boolean;
    isAnalysisScreen: boolean;
    isModelingAnalysisFocused: boolean;
    isNetworkScopeScreen: boolean;
    isStatisticsScreen: boolean;
    isValidationScreen: boolean;
    isSettingsScreen: boolean;
    isCatalogSubScreen: boolean;
    isConnectorSubScreen: boolean;
    isSpliceSubScreen: boolean;
    isNodeSubScreen: boolean;
    isSegmentSubScreen: boolean;
    isWireSubScreen: boolean;
    selectedCatalogItemId: CatalogDomainsParams["selectedCatalogItemId"];
    hasTableSelectionForActiveSubScreen: boolean;
    hasActiveEntityForm: boolean;
    hasInspectableSelectionForActiveSubScreen: boolean;
    networkScalePercent: number;
    isCurrentWorkspaceEmpty: boolean;
    hasBuiltInSampleState: boolean;
    themeMode: HomeWorkspaceParams["themeMode"];
    workspaceCurrencyCode: CatalogDomainsParams["workspaceCurrencyCode"];
    configuredResetZoomPercent: AuxDomainsParams["settings"]["configuredResetZoomPercent"];
    networkCount: number;
    networkTechnicalIdAlreadyUsed: boolean;
    isAiAgentModelingOpen: boolean;
    isAiAgentReady: boolean;
    aiAgentDisabledReason: string;
    aiProviderReadiness: AiProviderReadiness;
    appState: StatisticsWorkspaceContentProps["appState"];
  };
  entities: {
    entityCountBySubScreen: NetworkSummaryParams["entityCountBySubScreen"];
    networks: AuxDomainsParams["networkScope"]["networks"];
    networkSort: AuxDomainsParams["networkScope"]["networkSort"];
    setNetworkSort: AuxDomainsParams["networkScope"]["setNetworkSort"];
    networkEntityCountsById: AuxDomainsParams["networkScope"]["networkEntityCountsById"];
    activeNetworkId: AuxDomainsParams["networkScope"]["activeNetworkId"];
    catalogItems: CatalogDomainsParams["catalogItems"];
    connectors: CatalogDomainsParams["connectors"];
    splices: CatalogDomainsParams["splices"];
    nodes: NetworkSummaryParams["nodes"];
    segments: NetworkSummaryParams["segments"];
    wires: NetworkSummaryParams["wires"];
    subNetworkSummaries: NetworkSummaryParams["subNetworkSummaries"];
    routingGraph: NetworkSummaryParams["routingGraph"];
    totalEdgeEntries: NetworkSummaryParams["totalEdgeEntries"];
    networkNodePositions: NetworkSummaryParams["networkNodePositions"];
    selectedWireRouteSegmentIds: NetworkSummaryParams["selectedWireRouteSegmentIds"];
    splicePlacementPreview: NetworkSummaryParams["splicePlacementPreview"];
    routePreview: NetworkSummaryParams["routePreview"];
    connectorMap: NetworkSummaryParams["connectorMap"];
    spliceMap: NetworkSummaryParams["spliceMap"];
    selectedSegmentId: NetworkSummaryParams["selection"]["selectedSegmentId"];
    selectedWireId: NetworkSummaryParams["selection"]["selectedWireId"];
    selectedNodeId: NetworkSummaryParams["selection"]["selectedNodeId"];
    selectedConnectorId: NetworkSummaryParams["selection"]["selectedConnectorId"];
    selectedSpliceId: NetworkSummaryParams["selection"]["selectedSpliceId"];
    undoHistoryEntries: UndoHistoryEntry[];
  };
  models: {
    formsState: EntityFormsStateModel;
    canvasState: CanvasStateModel;
    canvasDisplayState: AppControllerCanvasDisplayStateModel;
    preferencesState: AppControllerPreferencesStateModel;
    modelingHandlers: AppControllerModelingHandlersAssemblyModel;
    entityListModel: EntityListModel;
    selectionEntities: AppControllerSelectionEntitiesModel;
    validationModel: ValidationModel;
    networkScopeFormState: NetworkScopeFormStateModel;
    catalogHandlers: CatalogHandlersModel;
    aiSettings: AiSettingsModel;
    workspaceFileStorage: UseWorkspaceFileStorageModel;
  };
  domains: {
    workspaceNetworkDomain: AppControllerWorkspaceNetworkDomainAssemblyModel;
    catalogAnalysisDomain: AppControllerCatalogAnalysisActionsModel;
    selectionHandlersDomain: AppControllerSelectionHandlersDomainAssemblyModel;
    canvasInteractionDomain: AppControllerCanvasInteractionDomainAssemblyModel;
  };
  handlers: {
    store: AppStore;
    requestConfirmation: HomeWorkspaceParams["requestConfirmation"];
    replaceStateWithHistory: HomeWorkspaceParams["replaceStateWithHistory"];
    setActiveScreen: (screen: ScreenId) => void;
    setActiveSubScreen: (subScreen: SubScreenId) => void;
    setInteractionMode: HomeWorkspaceParams["setInteractionMode"];
    handleWorkspaceScreenChange: (targetScreen: ScreenId) => void;
    handleOpenSettingsScreen: () => void;
    handleOpenAiAgent: () => void;
    openFullOnboarding: HomeWorkspaceParams["onOpenOnboardingHelp"];
    openSingleStepOnboarding: ModelingAnalysisParams["openSingleStepOnboarding"];
    markDetailPanelsSelectionSourceAsTable: () => void;
    markDetailPanelsSelectionSourceAsExternal: () => void;
    dispatchAction: (action: AppAction, options?: { trackHistory?: boolean }) => void;
    handleNetworkSummaryViewportSizeChange: NetworkSummaryParams["onViewportSizeChange"];
    canExportBomCsv: boolean;
    handleExportBomCsv: () => void;
    describeNode: NetworkSummaryParams["describeNode"];
    nodeLabelById: ModelingAnalysisParams["nodeLabelById"];
    describeWireEndpoint: ModelingAnalysisParams["wireDescriptions"]["describeWireEndpoint"];
    describeWireEndpointId: ModelingAnalysisParams["wireDescriptions"]["describeWireEndpointId"];
    describeWireEndpointCsvParts: ModelingAnalysisParams["wireDescriptions"]["describeWireEndpointCsvParts"];
    connectorTechnicalIdAlreadyUsed: boolean;
    spliceTechnicalIdAlreadyUsed: boolean;
    wireTechnicalIdAlreadyUsed: boolean;
    catalogManufacturerReferenceAlreadyUsed: boolean;
    pendingNewNodePosition: ModelingAnalysisParams["pendingNewNodePosition"];
    effectiveNetworkViewWidth: number;
    effectiveNetworkViewHeight: number;
    networkGridStep: number;
  };
}

export function useAppControllerWorkspaceContentAssembly({
  components,
  state,
  entities,
  models,
  domains,
  handlers
}: AppControllerWorkspaceContentAssemblyParams) {
  const [isMultiNetworkFunctionalAnalysisOpen, setIsMultiNetworkFunctionalAnalysisOpen] = useState(false);
  const openMultiNetworkFunctionalAnalysis = useCallback(() => {
    setIsMultiNetworkFunctionalAnalysisOpen(true);
  }, []);
  const closeMultiNetworkFunctionalAnalysis = useCallback(() => {
    setIsMultiNetworkFunctionalAnalysisOpen(false);
  }, []);

  const { homeWorkspaceContent } = useAppControllerHomeWorkspaceContent({
    HomeWorkspaceContentComponent: components.HomeWorkspaceContentComponent,
    hasActiveNetwork: state.hasActiveNetwork,
    activeNetworkName: state.activeNetworkName,
    activeNetworkTechnicalId: state.activeNetworkTechnicalId,
    activeNetworkId: entities.activeNetworkId,
    undoHistoryEntries: entities.undoHistoryEntries,
    store: handlers.store,
    networkCount: state.networkCount,
    onOpenImportPicker: models.workspaceFileStorage.openWorkspaceFile,
    onSaveWorkspace: models.workspaceFileStorage.saveWorkspaceFileAs,
    importFileInputRef: models.workspaceFileStorage.workspaceFileInputRef,
    onImportFileChange: models.workspaceFileStorage.handleWorkspaceFileInputChange,
    onOpenOnboardingHelp: handlers.openFullOnboarding,
    isCurrentWorkspaceEmpty: state.isCurrentWorkspaceEmpty,
    requestConfirmation: handlers.requestConfirmation,
    replaceStateWithHistory: handlers.replaceStateWithHistory,
    themeMode: state.themeMode,
    setActiveScreen: handlers.setActiveScreen,
    setActiveSubScreen: handlers.setActiveSubScreen,
    setInteractionMode: handlers.setInteractionMode,
    handleWorkspaceScreenChange: handlers.handleWorkspaceScreenChange
  });

  const {
    modelingLeftColumnContent,
    modelingFormsColumnContent,
    analysisWorkspaceContent,
    isModelingBatchModeActive,
    selectedBatchSegmentIds
  } =
    useAppControllerModelingAnalysisDomainAssembly({
      components: {
        ModelingPrimaryTablesComponent: components.ModelingPrimaryTablesComponent,
        ModelingSecondaryTablesComponent: components.ModelingSecondaryTablesComponent,
        ModelingFormsColumnComponent: components.ModelingFormsColumnComponent,
        AnalysisWorkspaceContentComponent: components.AnalysisWorkspaceContentComponent
      },
      screenFlags: {
        isConnectorSubScreen: state.isConnectorSubScreen,
        isSpliceSubScreen: state.isSpliceSubScreen,
        isNodeSubScreen: state.isNodeSubScreen,
        isSegmentSubScreen: state.isSegmentSubScreen,
        isWireSubScreen: state.isWireSubScreen
      },
      entities: {
        catalogItems: entities.catalogItems,
        connectors: entities.connectors,
        splices: entities.splices,
        nodes: entities.nodes,
        segments: entities.segments,
        wires: entities.wires
      },
      activeNetwork: state.activeNetwork,
      tabularExportFormat: models.preferencesState.tabularExportFormat,
      wireExportLengthPreferences: {
        strippingAllowanceMm: models.preferencesState.wireExportStrippingAllowanceMm,
        twistedPairLengthCoefficient: models.preferencesState.wireExportTwistedPairLengthCoefficient
      },
      hideWireAnalysisRoutePanel: models.preferencesState.hideWireAnalysisRoutePanel,
      showMultiNetworkFunctionalAnalysisPanel: models.preferencesState.showMultiNetworkFunctionalAnalysisPanel,
      isMultiNetworkFunctionalAnalysisOpen,
      onCloseMultiNetworkFunctionalAnalysis: closeMultiNetworkFunctionalAnalysis,
      formsState: models.formsState,
      modelingHandlers: models.modelingHandlers,
      catalogHandlers: models.catalogHandlers,
      listModel: models.entityListModel,
      selection: models.selectionEntities,
      layoutDerived: {
        selectedWireRouteSegmentIds: entities.selectedWireRouteSegmentIds
      },
      pendingNewNodePosition: handlers.pendingNewNodePosition,
      wireDescriptions: {
        describeWireEndpoint: handlers.describeWireEndpoint,
        describeWireEndpointId: handlers.describeWireEndpointId,
        describeWireEndpointCsvParts: handlers.describeWireEndpointCsvParts
      },
      describeNode: handlers.describeNode,
      nodeLabelById: handlers.nodeLabelById,
      connectorTechnicalIdAlreadyUsed: handlers.connectorTechnicalIdAlreadyUsed,
      spliceTechnicalIdAlreadyUsed: handlers.spliceTechnicalIdAlreadyUsed,
      wireTechnicalIdAlreadyUsed: handlers.wireTechnicalIdAlreadyUsed,
      includeModelingContent: state.hasActiveNetwork && state.isModelingScreen,
      includeAnalysisContent: state.hasActiveNetwork && (state.isAnalysisScreen || state.isModelingScreen),
      store: handlers.store,
      dispatchAction: handlers.dispatchAction,
      requestConfirmation: handlers.requestConfirmation,
      replaceStateWithHistory: handlers.replaceStateWithHistory,
      setActiveSubScreen: handlers.setActiveSubScreen,
      handleWorkspaceScreenChange: handlers.handleWorkspaceScreenChange,
      openSingleStepOnboarding: handlers.openSingleStepOnboarding,
      markSelectionPanelsFromTable: handlers.markDetailPanelsSelectionSourceAsTable
    });

  const { networkSummaryPanel, networkFunctionalSchematicPanel, headerHarnessAssemblyFunctionalScopeNavigation, selectedHarnessAssemblyId } = useAppControllerNetworkSummaryPanelDomain({
    NetworkSummaryPanelComponent: components.NetworkSummaryPanelComponent,
    networkSummaryPanelRef: domains.workspaceNetworkDomain.networkSummaryPanelRef,
    hasActiveNetwork: state.hasActiveNetwork,
    isModelingScreen: state.isModelingScreen,
    isAnalysisScreen: state.isAnalysisScreen,
    isModelingAnalysisFocused: state.isModelingAnalysisFocused,
    activeSubScreen: state.activeSubScreen,
    setActiveSubScreen: handlers.setActiveSubScreen,
    handleWorkspaceScreenChange: handlers.handleWorkspaceScreenChange,
    entityCountBySubScreen: entities.entityCountBySubScreen,
    onQuickEntityNavigation: handlers.setActiveSubScreen,
    isAiAgentOpen: state.isAiAgentModelingOpen,
    isAiAgentReady: state.isAiAgentReady,
    aiAgentDisabledReason: state.aiAgentDisabledReason,
    onOpenAiAgent: handlers.handleOpenAiAgent,
    activeNetwork: state.activeNetwork,
    networks: entities.networks,
    onSelectActiveNetwork: domains.workspaceNetworkDomain.handleSelectNetwork,
    nodes: entities.nodes,
    segments: entities.segments,
    wires: entities.wires,
    catalogItems: entities.catalogItems,
    subNetworkSummaries: entities.subNetworkSummaries,
    routingGraph: entities.routingGraph,
    totalEdgeEntries: entities.totalEdgeEntries,
    networkNodePositions: entities.networkNodePositions,
    selectedWireRouteSegmentIds: entities.selectedWireRouteSegmentIds,
    selectedBatchSegmentIds,
    splicePlacementPreview: entities.splicePlacementPreview,
    canvasState: {
      isPanningNetwork: models.canvasState.isPanningNetwork,
      showNetworkGrid: models.canvasState.showNetworkGrid,
      setShowNetworkGrid: models.canvasState.setShowNetworkGrid,
      snapNodesToGrid: models.canvasState.snapNodesToGrid,
      setSnapNodesToGrid: models.canvasState.setSnapNodesToGrid,
      lockEntityMovement: models.canvasState.lockEntityMovement,
      setLockEntityMovement: models.canvasState.setLockEntityMovement,
      networkOffset: models.canvasState.networkOffset,
      setNetworkOffset: models.canvasState.setNetworkOffset,
      networkScale: models.canvasState.networkScale
    },
    canvasDisplayState: {
      showNetworkInfoPanels: models.canvasDisplayState.showNetworkInfoPanels,
      setShowNetworkInfoPanels: models.canvasDisplayState.setShowNetworkInfoPanels,
      showSegmentNames: models.canvasDisplayState.showSegmentNames,
      showSegmentLengths: models.canvasDisplayState.showSegmentLengths,
      setShowSegmentLengths: models.canvasDisplayState.setShowSegmentLengths,
      showSegmentDressings: models.canvasDisplayState.showSegmentDressings,
      setShowSegmentDressings: models.canvasDisplayState.setShowSegmentDressings,
      showCableCallouts: models.canvasDisplayState.showCableCallouts,
      setShowCableCallouts: models.canvasDisplayState.setShowCableCallouts,
      networkCalloutContentMode: models.canvasDisplayState.networkCalloutContentMode,
      showSelectedCalloutOnly: models.canvasDisplayState.showSelectedCalloutOnly,
      networkLabelStrokeMode: models.canvasDisplayState.networkLabelStrokeMode,
      networkLabelSizeMode: models.canvasDisplayState.networkLabelSizeMode,
      networkCalloutTextSize: models.canvasDisplayState.networkCalloutTextSize,
      networkLabelRotationDegrees: models.canvasDisplayState.networkLabelRotationDegrees,
      networkAutoSegmentLabelRotation: models.canvasDisplayState.networkAutoSegmentLabelRotation,
      routePreviewStartNodeId: models.canvasDisplayState.routePreviewStartNodeId,
      setRoutePreviewStartNodeId: models.canvasDisplayState.setRoutePreviewStartNodeId,
      routePreviewEndNodeId: models.canvasDisplayState.routePreviewEndNodeId,
      setRoutePreviewEndNodeId: models.canvasDisplayState.setRoutePreviewEndNodeId
    },
    preferencesState: {
      canvasShowCalloutWireNames: models.preferencesState.canvasShowCalloutWireNames,
      canvasConnectorDrawingDisplayMode: models.preferencesState.canvasConnectorDrawingDisplayMode,
      canvasUseConsistentConnectorLayoutScale: models.preferencesState.canvasUseConsistentConnectorLayoutScale,
      canvasCalloutConnectorDrawingScalePercent: models.preferencesState.canvasCalloutConnectorDrawingScalePercent,
      canvasGlobalRenderScalePercent: models.preferencesState.canvasGlobalRenderScalePercent,
      setCanvasGlobalRenderScalePercent: models.preferencesState.setCanvasGlobalRenderScalePercent,
      canvasZoomInvariantNodeShapes: models.preferencesState.canvasZoomInvariantNodeShapes,
      canvasNodeShapeSizePercent: models.preferencesState.canvasNodeShapeSizePercent,
      canvasResizeBehaviorMode: models.preferencesState.canvasResizeBehaviorMode,
      themeMode: models.preferencesState.themeMode,
      canvasExportIncludeFrame: models.preferencesState.canvasExportIncludeFrame,
      setCanvasExportIncludeFrame: models.preferencesState.setCanvasExportIncludeFrame,
      canvasExportIncludeCartouche: models.preferencesState.canvasExportIncludeCartouche,
      setCanvasExportIncludeCartouche: models.preferencesState.setCanvasExportIncludeCartouche,
      canvasPngExportIncludeBackground: models.preferencesState.canvasPngExportIncludeBackground,
      showFloatingInspectorPanel: models.preferencesState.showFloatingInspectorPanel,
      setShowFloatingInspectorPanel: models.preferencesState.setShowFloatingInspectorPanel,
      showRoutePreviewPanel: models.preferencesState.showRoutePreviewPanel,
      showMultiNetworkFunctionalAnalysisPanel: models.preferencesState.showMultiNetworkFunctionalAnalysisPanel
    },
    selection: {
      selectedSegmentId: entities.selectedSegmentId,
      selectedWireId: entities.selectedWireId,
      selectedNodeId: entities.selectedNodeId,
      selectedConnectorId: entities.selectedConnectorId,
      selectedSpliceId: entities.selectedSpliceId
    },
    effectiveNetworkViewWidth: handlers.effectiveNetworkViewWidth,
    effectiveNetworkViewHeight: handlers.effectiveNetworkViewHeight,
    networkGridStep: handlers.networkGridStep,
    networkScalePercent: state.networkScalePercent,
    routePreview: entities.routePreview,
    connectorMap: entities.connectorMap,
    spliceMap: entities.spliceMap,
    describeNode: handlers.describeNode,
    handleZoomAction: domains.canvasInteractionDomain.handleZoomAction,
    fitNetworkToContent: domains.workspaceNetworkDomain.fitNetworkToContent,
    handleNetworkCanvasMouseDown: domains.canvasInteractionDomain.handleNetworkCanvasMouseDown,
    handleNetworkCanvasClick: domains.canvasInteractionDomain.handleNetworkCanvasClick,
    handleNetworkWheel: domains.canvasInteractionDomain.handleNetworkWheel,
    handleNetworkMouseMove: domains.canvasInteractionDomain.handleNetworkMouseMove,
    stopNetworkNodeDrag: domains.canvasInteractionDomain.stopNetworkNodeDrag,
    handleNetworkSegmentClick: domains.canvasInteractionDomain.handleNetworkSegmentClick,
    handleNetworkNodeMouseDown: domains.canvasInteractionDomain.handleNetworkNodeMouseDown,
    handleNetworkNodeActivate: domains.canvasInteractionDomain.handleNetworkNodeActivate,
    selectedCanvasNodeIds: domains.canvasInteractionDomain.selectedCanvasNodeIds,
    clearSelectedCanvasNodes: domains.canvasInteractionDomain.clearSelectedCanvasNodes,
    onViewportSizeChange: handlers.handleNetworkSummaryViewportSizeChange,
    canExportBomCsv: handlers.canExportBomCsv,
    onExportBomCsv: handlers.handleExportBomCsv,
    onExportNetwork: () => domains.workspaceNetworkDomain.handleExportNetworksWithActiveSaveConfirmation("active"),
    handleRegenerateLayout: domains.workspaceNetworkDomain.handleRegenerateLayout,
    markDetailPanelsSelectionSourceAsTable: handlers.markDetailPanelsSelectionSourceAsTable,
    startSpliceEdit: models.modelingHandlers.splice.startSpliceEdit,
    startWireEdit: models.modelingHandlers.wire.startWireEdit,
    onOpenHarnessAssemblyOnboardingHelp: () => handlers.openSingleStepOnboarding("harnessAssembly"),
    onOpenMultiNetworkFunctionalAnalysis: openMultiNetworkFunctionalAnalysis,
    dispatchAction: handlers.dispatchAction,
    store: handlers.store
  });

  const {
    modelingLeftColumnContentForSubScreen,
    modelingFormsColumnContentForSubScreen,
    analysisWorkspaceContentForSubScreen
  } = useAppControllerCatalogScreenDomains({
    isCatalogSubScreen: state.isCatalogSubScreen,
    catalogItems: entities.catalogItems,
    connectors: entities.connectors,
    splices: entities.splices,
    wires: entities.wires,
    selectedCatalogItemId: state.selectedCatalogItemId,
    workspaceCurrencyCode: state.workspaceCurrencyCode,
    catalogHandlers: models.catalogHandlers,
    formsState: models.formsState,
    catalogManufacturerReferenceAlreadyUsed: handlers.catalogManufacturerReferenceAlreadyUsed,
    handleExportCatalogCsv: domains.workspaceNetworkDomain.handleExportCatalogCsv,
    handleOpenCatalogCsvImportPicker: domains.workspaceNetworkDomain.handleOpenCatalogCsvImportPicker,
    catalogCsvImportFileInputRef: domains.workspaceNetworkDomain.catalogCsvImportFileInputRef,
    handleCatalogCsvImportFileChange: domains.workspaceNetworkDomain.handleCatalogCsvImportFileChange,
    catalogCsvImportExportStatus: domains.workspaceNetworkDomain.catalogCsvImportExportStatus,
    catalogCsvLastImportSummaryLine: domains.workspaceNetworkDomain.catalogCsvLastImportSummaryLine,
    catalogCsvImportFailureDialog: domains.workspaceNetworkDomain.catalogCsvImportFailureDialog,
    onOpenCatalogOnboardingHelp: () => handlers.openSingleStepOnboarding("catalog"),
    onCreateConnectorFromCatalog: domains.catalogAnalysisDomain.handleCreateConnectorFromCatalog,
    onCreateSpliceFromCatalog: domains.catalogAnalysisDomain.handleCreateSpliceFromCatalog,
    onOpenConnectorFromCatalogAnalysis: domains.catalogAnalysisDomain.handleOpenConnectorFromCatalogAnalysis,
    onOpenSpliceFromCatalogAnalysis: domains.catalogAnalysisDomain.handleOpenSpliceFromCatalogAnalysis,
    onOpenWireReference: (wire) => {
      handlers.markDetailPanelsSelectionSourceAsTable();
      handlers.setActiveSubScreen("wire");
      models.modelingHandlers.wire.startWireEdit(wire);
    },
    onUpdateWireEndpointReferenceName: models.modelingHandlers.wire.syncWireEndpointReferenceName,
    modelingLeftColumnContent,
    modelingFormsColumnContent,
    analysisWorkspaceContent
  });

  const { networkScopeWorkspaceContent, validationWorkspaceContent, settingsWorkspaceContent } =
    useAppControllerAuxDomainAssembly({
      components: {
        NetworkScopeWorkspaceContentComponent: components.NetworkScopeWorkspaceContentComponent,
        ValidationWorkspaceContentComponent: components.ValidationWorkspaceContentComponent,
        SettingsWorkspaceContentComponent: components.SettingsWorkspaceContentComponent
      },
      networkScope: {
        networks: entities.networks,
        networkSort: entities.networkSort,
        setNetworkSort: entities.setNetworkSort,
        networkEntityCountsById: entities.networkEntityCountsById,
        activeNetworkId: entities.activeNetworkId,
        handleSelectNetwork: domains.workspaceNetworkDomain.handleSelectNetwork,
        handleWorkspaceScreenChange: handlers.handleWorkspaceScreenChange,
        handleDuplicateNetwork: domains.workspaceNetworkDomain.handleDuplicateNetwork,
        handleSaveNetworkWithConfirmation: domains.workspaceNetworkDomain.handleSaveNetworkWithConfirmation,
        handleOpenImportPicker: domains.workspaceNetworkDomain.handleOpenImportPicker,
        importFileInputRef: domains.workspaceNetworkDomain.importFileInputRef,
        handleImportFileChange: domains.workspaceNetworkDomain.handleImportFileChange,
        importOverwriteDialog: domains.workspaceNetworkDomain.importOverwriteDialog,
        importFailureDialog: domains.workspaceNetworkDomain.importFailureDialog,
        handleDeleteNetwork: domains.workspaceNetworkDomain.handleDeleteNetwork,
        handleOpenCreateNetworkForm: domains.workspaceNetworkDomain.handleOpenCreateNetworkForm,
        handleOpenEditNetworkForm: domains.workspaceNetworkDomain.handleOpenEditNetworkForm,
        handleCloseNetworkForm: domains.workspaceNetworkDomain.handleCloseNetworkForm,
        networkTechnicalIdAlreadyUsed: state.networkTechnicalIdAlreadyUsed,
        handleSubmitNetworkForm: domains.workspaceNetworkDomain.handleSubmitNetworkForm,
        openNetworkScopeOnboardingHelp: () => handlers.openSingleStepOnboarding("networkScope"),
        networkScopeFormState: models.networkScopeFormState,
        functionalSchematicPanel: null
      },
      validation: {
        validationModel: models.validationModel,
        handleValidationIssueRowGoTo: domains.selectionHandlersDomain.handleValidationIssueRowGoTo
      },
      settings: {
        isCurrentWorkspaceEmpty: state.isCurrentWorkspaceEmpty,
        hasBuiltInSampleState: state.hasBuiltInSampleState,
        handleRecreateSampleNetwork: domains.workspaceNetworkDomain.handleRecreateSampleNetwork,
        handleResetSampleNetwork: domains.workspaceNetworkDomain.handleResetSampleNetwork,
        activeNetworkId: entities.activeNetworkId,
        networkImportExportModel: domains.workspaceNetworkDomain.networkImportExportModel,
        handleExportNetworksWithActiveSaveConfirmation:
          domains.workspaceNetworkDomain.handleExportNetworksWithActiveSaveConfirmation,
        networks: entities.networks,
        preferencesState: models.preferencesState,
        canvasDisplayState: models.canvasDisplayState,
        configuredResetZoomPercent: state.configuredResetZoomPercent,
        handleZoomAction: domains.canvasInteractionDomain.handleZoomAction,
        resetWorkspacePreferencesToDefaults: domains.workspaceNetworkDomain.resetWorkspacePreferencesToDefaults,
        aiSettings: models.aiSettings,
        workspaceFileStorage: models.workspaceFileStorage
      },
      includeNetworkScopeContent: state.isNetworkScopeScreen,
      includeValidationContent: state.hasActiveNetwork && state.isValidationScreen,
      includeSettingsContent: state.isSettingsScreen
    });

  const aiAgentWorkspaceContent = useAppControllerAiAgentWorkspaceContent({
    isOpen: state.isAiAgentModelingOpen,
    providerReadiness: state.aiProviderReadiness,
    aiSettings: models.aiSettings,
    selectedHarnessAssemblyId,
    store: handlers.store,
    replaceStateWithHistory: handlers.replaceStateWithHistory
  });

  const { modelingLeftColumnContentForActiveMode, modelingFormsColumnContentForLayout, analysisWorkspaceContentForLayout } = buildWorkspaceLayoutContent({
    state,
    isModelingBatchModeActive,
    aiAgentWorkspaceContent,
    modelingLeftColumnContentForSubScreen,
    modelingFormsColumnContentForSubScreen,
    analysisWorkspaceContentForSubScreen,
    showMultiNetworkFunctionalAnalysisPanel: models.preferencesState.showMultiNetworkFunctionalAnalysisPanel
  });

  return {
    homeWorkspaceContent,
    networkSummaryPanel,
    modelingLeftColumnContentForSubScreen: modelingLeftColumnContentForActiveMode,
    modelingFormsColumnContentForLayout,
    analysisWorkspaceContentForLayout,
    networkScopeWorkspaceContent,
    harnessAssemblyWorkspaceContent: networkFunctionalSchematicPanel,
    headerHarnessAssemblyFunctionalScopeNavigation,
    statisticsWorkspaceContent: state.isStatisticsScreen ? (
      <components.StatisticsWorkspaceContentComponent appState={state.appState} />
    ) : null,
    validationWorkspaceContent,
    settingsWorkspaceContent
  };
}

export type AppControllerWorkspaceContentAssemblyModel = ReturnType<typeof useAppControllerWorkspaceContentAssembly>;
