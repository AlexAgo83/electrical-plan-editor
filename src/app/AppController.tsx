import {
  type ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState
} from "react";
import appPackageMetadata from "../../package.json";
import type { CatalogItemId } from "../core/entities";
import {
  appActions,
  hasSampleNetworkSignature,
  isWorkspaceEmpty,
  selectActiveNetwork,
  selectActiveNetworkId,
  selectConnectors,
  selectCatalogItems,
  selectLastError,
  selectNetworks,
  selectNodes,
  selectRoutingGraphIndex,
  selectSegments,
  selectSplices,
  selectSubNetworkSummaries,
  selectWires
} from "../store";
import { appStore } from "./store";
import { appUiModules } from "./components/appUiModules";
import { AppShellLayout } from "./components/layout/AppShellLayout";
import { AppControllerOverlays } from "./components/layout/AppControllerOverlays";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useCanvasState } from "./hooks/useCanvasState";
import { useCatalogHandlers } from "./hooks/useCatalogHandlers";
import { useAppControllerCanvasDisplayState } from "./hooks/useAppControllerCanvasDisplayState";
import { useAppControllerPreferencesState } from "./hooks/useAppControllerPreferencesState";
import { useAppControllerLayoutDerivedState } from "./hooks/useAppControllerLayoutDerivedState";
import { useAppControllerSelectionEntities } from "./hooks/useAppControllerSelectionEntities";
import { useAppControllerShellDerivedState } from "./hooks/useAppControllerShellDerivedState";
import { useAppControllerModelingHandlersAssembly } from "./hooks/controller/useAppControllerModelingHandlersAssembly";
import { useAppControllerCatalogAnalysisActions } from "./hooks/controller/useAppControllerCatalogAnalysisActions";
import { useAppControllerWorkspaceScreenController } from "./hooks/controller/useAppControllerWorkspaceScreenController";
import { buildAppControllerShellLayoutProps } from "./hooks/controller/buildAppControllerShellLayoutProps";
import { useAppControllerWorkspaceNetworkDomainAssembly } from "./hooks/controller/useAppControllerWorkspaceNetworkDomainAssembly";
import { useAppControllerSelectionHandlersDomainAssembly } from "./hooks/controller/useAppControllerSelectionHandlersDomainAssembly";
import { useAppControllerCanvasInteractionDomainAssembly } from "./hooks/controller/useAppControllerCanvasInteractionDomainAssembly";
import { useAppControllerInspectorIssueLayoutState } from "./hooks/controller/useAppControllerInspectorIssueLayoutState";
import { useAppControllerNetworkViewportState } from "./hooks/controller/useAppControllerNetworkViewportState";
import { useAppControllerHeaderOffsetState } from "./hooks/controller/useAppControllerHeaderOffsetState";
import { useAppControllerCanvasStateSyncEffects } from "./hooks/controller/useAppControllerCanvasStateSyncEffects";
import { useConfirmDialogController } from "./hooks/controller/useConfirmDialogController";
import { useNetworkSummaryViewStateSync } from "./hooks/controller/useNetworkSummaryViewStateSync";
import { useOnboardingController } from "./hooks/controller/useOnboardingController";
import { useAppControllerWorkspaceContentAssembly } from "./hooks/controller/useAppControllerWorkspaceContentAssembly";
import { useAppControllerUniquenessFlags } from "./hooks/controller/useAppControllerUniquenessFlags";
import {
  useAppControllerActionRefsSyncEffect,
  useAppControllerAnalysisSubScreenTrackingEffect,
  useAppControllerCatalogFormGuardEffect,
  useAppControllerInspectorSelectionSourceEffect,
  useAppControllerThemeSyncEffect
} from "./hooks/controller/useAppControllerLifecycleEffects";
import { useEntityListModel } from "./hooks/useEntityListModel";
import { useEntityFormsState } from "./hooks/useEntityFormsState";
import { useEntityRelationshipMaps } from "./hooks/useEntityRelationshipMaps";
import { useNetworkEntityCountsById } from "./hooks/useNetworkEntityCountsById";
import { useNetworkScopeFormState } from "./hooks/useNetworkScopeFormState";
import { useModelingFormSelectionSync } from "./hooks/useModelingFormSelectionSync";
import { useNodeDescriptions } from "./hooks/useNodeDescriptions";
import type { BeforeInstallPromptEventLike } from "./hooks/useWorkspaceShellChrome";
import { useStoreHistory } from "./hooks/useStoreHistory";
import { useValidationModel } from "./hooks/useValidationModel";
import { useWireEndpointDescriptions } from "./hooks/useWireEndpointDescriptions";
import { useWorkspaceShellChrome } from "./hooks/useWorkspaceShellChrome";
import { useWorkspaceNavigation } from "./hooks/useWorkspaceNavigation";
import { useAppLocaleDomTranslation } from "./hooks/useAppLocaleDomTranslation";
import { useHoverDescriptionTitles } from "./hooks/useHoverDescriptionTitles";
import { useAppControllerUiPreferencesBindings } from "./hooks/controller/useAppControllerUiPreferencesBindings";
import { buildAppControllerNamespacedCanvasState } from "./hooks/useAppControllerNamespacedCanvasState";
import { buildAppControllerNamespacedFormsState } from "./hooks/useAppControllerNamespacedFormsState";
import { useAppSnapshot } from "./hooks/useAppSnapshot";
import {
  HISTORY_LIMIT,
  NETWORK_GRID_STEP,
  NETWORK_MAX_SCALE,
  NETWORK_MIN_SCALE,
} from "./lib/app-utils-shared";
import { downloadCsvFile } from "./lib/csv";
import { buildNetworkSummaryBomCsvExport } from "./lib/networkSummaryBomCsv";
import type {
  AppProps,
  SubScreenId
} from "./types/app-controller";
import "./styles.css";

export type { AppProps } from "./types/app-controller";
const APP_REPOSITORY_URL = "https://github.com/AlexAgo83/electrical-plan-editor";

export function AppController({ store = appStore }: AppProps): ReactElement {
  const currentYear = new Date().getFullYear();
  const state = useAppSnapshot(store);
  const { NetworkSummaryPanel, AnalysisScreen, HomeScreen, ModelingScreen, NetworkScopeScreen, SettingsScreen, ValidationScreen } =
    appUiModules;
  const { AnalysisWorkspaceContent, HomeWorkspaceContent, ModelingFormsColumn, ModelingPrimaryTables, ModelingSecondaryTables } =
    appUiModules;
  const { NetworkScopeWorkspaceContent, SettingsWorkspaceContent, ValidationWorkspaceContent } = appUiModules;

  const networks = selectNetworks(state);
  const activeNetworkId = selectActiveNetworkId(state);
  const activeNetworkSummaryViewState =
    activeNetworkId === null ? undefined : state.networkStates[activeNetworkId]?.networkSummaryViewState;
  const activeNetwork = selectActiveNetwork(state);
  const connectors = selectConnectors(state);
  const catalogItems = selectCatalogItems(state);
  const splices = selectSplices(state);
  const nodes = selectNodes(state);
  const segments = selectSegments(state);
  const wires = selectWires(state);
  const routingGraph = selectRoutingGraphIndex(state);
  const subNetworkSummaries = selectSubNetworkSummaries(state);
  const networkEntityCountsById = useNetworkEntityCountsById(networks, state.networkStates);

  const {
    connectorMap,
    spliceMap,
    segmentMap,
    connectorNodeByConnectorId,
    spliceNodeBySpliceId
  } = useEntityRelationshipMaps(connectors, splices, nodes, segments);
  const formsState = useEntityFormsState();
  const forms = buildAppControllerNamespacedFormsState(formsState);
  const { setWireForcedRouteInput } = formsState;
  const canvasDisplayState = useAppControllerCanvasDisplayState();
  const {
    routePreviewStartNodeId,
    setRoutePreviewStartNodeId,
    routePreviewEndNodeId,
    setRoutePreviewEndNodeId,
    showNetworkInfoPanels,
    setShowNetworkInfoPanels,
    showSegmentNames,
    setShowSegmentNames,
    showSegmentLengths,
    setShowSegmentLengths,
    showCableCallouts,
    setShowCableCallouts,
    setNetworkLabelSizeMode,
    setNetworkCalloutTextSize,
    setNetworkLabelRotationDegrees,
    setNetworkAutoSegmentLabelRotation,
    canvasResetZoomPercentInput
  } = canvasDisplayState;
  const canvasState = useCanvasState();
  const canvas = buildAppControllerNamespacedCanvasState(canvasState);
  const {
    interactionMode,
    setInteractionMode,
    pendingNewNodePosition,
    setPendingNewNodePosition,
    manualNodePositions,
    setManualNodePositions,
    draggingNodeId,
    setDraggingNodeId,
    isPanningNetwork,
    setIsPanningNetwork,
    showNetworkGrid,
    setShowNetworkGrid,
    snapNodesToGrid,
    setSnapNodesToGrid,
    lockEntityMovement,
    setLockEntityMovement,
    networkScale,
    setNetworkScale,
    networkOffset,
    setNetworkOffset
  } = canvasState;
  const networkScopeFormState = useNetworkScopeFormState();
  const { newNetworkTechnicalId, networkFormMode, networkFormTargetId } = networkScopeFormState;
  const preferencesState = useAppControllerPreferencesState();
  const {
    locale,
    themeMode,
    tableDensity,
    tableFontSize,
    workspaceCurrencyCode,
    workspaceTaxEnabled,
    workspaceTaxRatePercent,
    defaultWireSectionMm2,
    defaultAutoCreateLinkedNodes,
    networkSort,
    setNetworkSort,
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    canvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentNames,
    canvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts,
    canvasDefaultLabelSizeMode,
    canvasDefaultCalloutTextSize,
    canvasDefaultLabelRotationDegrees,
    canvasDefaultAutoSegmentLabelRotation,
    canvasResizeBehaviorMode,
    showShortcutHints,
    keyboardShortcutsEnabled,
    showFloatingInspectorPanel,
    workspacePanelsLayoutMode,
    workspaceWideScreen,
    preferencesHydrated
  } = preferencesState;
  const networkSummaryBomCsvExport = useMemo(
    () =>
      buildNetworkSummaryBomCsvExport(catalogItems, connectors, splices, workspaceCurrencyCode, workspaceTaxEnabled, workspaceTaxRatePercent),
    [catalogItems, connectors, splices, workspaceCurrencyCode, workspaceTaxEnabled, workspaceTaxRatePercent]
  );
  const canExportBomCsv = networkSummaryBomCsvExport.itemRowCount > 0;
  const handleExportBomCsv = useCallback(() => {
    if (!canExportBomCsv) {
      return;
    }
    downloadCsvFile("network-bom", networkSummaryBomCsvExport.headers, networkSummaryBomCsvExport.rows);
  }, [canExportBomCsv, networkSummaryBomCsvExport]);
  const { effectiveNetworkViewWidth, effectiveNetworkViewHeight, handleNetworkSummaryViewportSizeChange } =
    useAppControllerNetworkViewportState({
      canvasResizeBehaviorMode
    });
  const { headerOffsetPx, headerBlockRef } = useAppControllerHeaderOffsetState();
  const panStartRef = useRef<{
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const undoActionRef = useRef<() => void>(() => {});
  const redoActionRef = useRef<() => void>(() => {});
  const exportActiveNetworkRef = useRef<() => void>(() => {});
  const fitNetworkToContentRef = useRef<() => void>(() => {});
  const previousValidationIssueRef = useRef<() => void>(() => {});
  const nextValidationIssueRef = useRef<() => void>(() => {});
  const navigationDrawerRef = useRef<HTMLDivElement | null>(null);
  const navigationToggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const operationsPanelRef = useRef<HTMLDivElement | null>(null);
  const operationsButtonRef = useRef<HTMLButtonElement | null>(null);
  const deferredInstallPromptRef = useRef<BeforeInstallPromptEventLike | null>(null);

  const selectionEntities = useAppControllerSelectionEntities({ state });
  const {
    selected,
    selectedConnectorId,
    selectedSpliceId,
    selectedNodeId,
    selectedSegmentId,
    selectedWireId,
    selectedConnector,
    selectedSplice,
    selectedNode,
    selectedSegment,
    selectedWire,
    selectedWireRouteInputValue,
    selectedSubScreen
  } = selectionEntities;
  const selectedCatalogItemId = selected?.kind === "catalog" ? (selected.id as CatalogItemId) : null;
  const {
    activeScreen,
    setActiveScreen,
    activeSubScreen,
    setActiveSubScreen,
    isHomeScreen,
    isNetworkScopeScreen,
    isModelingScreen,
    isAnalysisScreen,
    isValidationScreen,
    isSettingsScreen,
    activeScreenRef
  } = useWorkspaceNavigation();
  const [isModelingAnalysisFocused, setIsModelingAnalysisFocused] = useState(false);
  const [lastAnalysisSubScreen, setLastAnalysisSubScreen] = useState<"connector" | "splice" | "node" | "segment" | "wire">("wire");
  const [detailPanelsSelectionSource, setDetailPanelsSelectionSource] = useState<"table" | "external">("external");
  const {
    openFullOnboarding,
    openSingleStepOnboarding,
    activeOnboardingStep,
    isOnboardingOpen,
    onboardingModalMode,
    onboardingStepDisplayIndex,
    onboardingTotalSteps,
    onboardingAutoOpenEnabled,
    setOnboardingAutoOpenEnabledPersisted,
    closeOnboarding,
    handleOnboardingNext,
    canGoNext: canOnboardingGoNext,
    onboardingTargetActions
  } = useOnboardingController({
    activeScreen,
    activeSubScreen,
    setActiveScreen,
    setActiveSubScreen
  });
  const { activeConfirmDialog, requestConfirmation, closeActiveConfirmDialog } = useConfirmDialogController();
  const {
    isInstallPromptAvailable,
    isPwaUpdateReady,
    isNavigationDrawerOpen,
    isOperationsPanelOpen,
    viewportWidth,
    isDialogFocusActive,
    closeNavigationDrawer,
    handleToggleNavigationDrawer,
    closeOperationsPanel,
    handleToggleOperationsPanel,
    handleOpenSettingsScreen,
    handleInstallApp,
    handleApplyPwaUpdate
  } = useWorkspaceShellChrome({
    activeScreen,
    setActiveScreen,
    navigationDrawerRef,
    navigationToggleButtonRef,
    operationsPanelRef,
    operationsButtonRef,
    deferredInstallPromptRef
  });
  const {
    connectorTechnicalIdAlreadyUsed,
    spliceTechnicalIdAlreadyUsed,
    catalogManufacturerReferenceAlreadyUsed,
    wireTechnicalIdAlreadyUsed,
    networkTechnicalIdAlreadyUsed
  } = useAppControllerUniquenessFlags({
    state,
    forms,
    formsState: {
      catalogFormMode: formsState.catalogFormMode,
      editingCatalogItemId: formsState.editingCatalogItemId,
      catalogManufacturerReference: formsState.catalogManufacturerReference
    },
    newNetworkTechnicalId,
    networkFormMode,
    networkFormTargetId
  });

  const {
    totalEdgeEntries,
    routePreview,
    selectedWireRouteSegmentIds,
    persistedNodePositions,
    networkNodePositions
  } = useAppControllerLayoutDerivedState({
    state,
    nodes,
    segments,
    snapNodesToGrid: canvas.viewport.snapNodesToGrid,
    manualNodePositions: canvas.viewport.manualNodePositions,
    selectedWireRouteSegmentIdsSource: selectedWire?.routeSegmentIds,
    routePreviewStartNodeId,
    routePreviewEndNodeId,
    routingGraphNodeIds: routingGraph.nodeIds,
    routingGraphEdgesByNodeId: routingGraph.edgesByNodeId
  });
  const isCatalogSubScreen = activeSubScreen === "catalog";
  const isConnectorSubScreen = activeSubScreen === "connector";
  const isSpliceSubScreen = activeSubScreen === "splice";
  const isNodeSubScreen = activeSubScreen === "node";
  const isSegmentSubScreen = activeSubScreen === "segment";
  const isWireSubScreen = activeSubScreen === "wire";
  const {
    appShellClassName,
    workspaceShellStyle,
    configuredResetScale,
    configuredResetZoomPercent
  } = useAppControllerShellDerivedState({
    themeMode,
    tableDensity,
    tableFontSize,
    workspacePanelsLayoutMode,
    workspaceWideScreen,
    headerOffsetPx,
    canvasResetZoomPercentInput
  });

  const { describeWireEndpoint, describeWireEndpointId, describeWireEndpointCsvParts } = useWireEndpointDescriptions({
    connectorMap,
    spliceMap
  });

  useAppControllerCanvasStateSyncEffects({
    activeNetworkId,
    nodes,
    setManualNodePositions,
    interactionMode,
    setPendingNewNodePosition,
    setWireForcedRouteInput,
    selectedWireId,
    selectedWireRouteInputValue,
    canvasDefaultLabelSizeMode,
    setNetworkLabelSizeMode,
    canvasDefaultCalloutTextSize,
    setNetworkCalloutTextSize,
    canvasDefaultLabelRotationDegrees,
    setNetworkLabelRotationDegrees,
    canvasDefaultAutoSegmentLabelRotation,
    setNetworkAutoSegmentLabelRotation
  });

  const entityListModel = useEntityListModel({
    state,
    connectors,
    splices,
    nodes,
    segments,
    wires,
    connectorMap,
    spliceMap,
    selectedConnector,
    selectedSplice,
    describeWireEndpoint
  });
  const {
    setConnectorSort,
    setSpliceSort,
    setNodeIdSortDirection,
    setSegmentIdSortDirection,
    setWireSort,
    setConnectorSynthesisSort,
    setSpliceSynthesisSort
  } = entityListModel;
  useAppControllerUiPreferencesBindings({
    networkMinScale: NETWORK_MIN_SCALE,
    networkMaxScale: NETWORK_MAX_SCALE,
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
  });

  useAppLocaleDomTranslation(locale);
  useHoverDescriptionTitles(locale);

  useAppControllerThemeSyncEffect({ store, themeMode });
  const validationModel = useValidationModel({
    state,
    connectors,
    splices,
    nodes,
    segments,
    wires,
    connectorMap,
    spliceMap,
    segmentMap,
    connectorNodeByConnectorId,
    spliceNodeBySpliceId,
    isValidationScreen
  });
  const {
    validationIssues,
    orderedValidationIssues,
    visibleValidationIssues,
    validationErrorCount,
    validationWarningCount,
    getValidationIssueByCursor,
    getFocusedValidationIssueByCursor
  } = validationModel;

  const entityCountBySubScreen: Record<SubScreenId, number> = {
    catalog: catalogItems.length,
    connector: connectors.length,
    splice: splices.length,
    node: nodes.length,
    segment: segments.length,
    wire: wires.length
  };
  const hasActiveNetwork = activeNetwork !== null;
  const isCurrentWorkspaceEmpty = isWorkspaceEmpty(state);
  const hasBuiltInSampleState = hasSampleNetworkSignature(state);

  const lastError = selectLastError(state);
  const {
    saveStatus,
    isUndoAvailable,
    isRedoAvailable,
    undoHistoryEntries,
    dispatchAction,
    handleUndo,
    handleRedo,
    replaceStateWithHistory
  } = useStoreHistory({
    store,
    historyLimit: HISTORY_LIMIT,
    onUndoRedoApplied: () => {
      setPendingNewNodePosition(null);
    },
    onReplaceStateApplied: () => {
      setPendingNewNodePosition(null);
      setActiveScreen("modeling");
      setActiveSubScreen("connector");
      setInteractionMode("select");
    }
  });

  const catalogHandlers = useCatalogHandlers({
    store,
    dispatchAction,
    confirmAction: requestConfirmation,
    catalogFormMode: formsState.catalogFormMode,
    setCatalogFormMode: formsState.setCatalogFormMode,
    editingCatalogItemId: formsState.editingCatalogItemId,
    setEditingCatalogItemId: formsState.setEditingCatalogItemId,
    catalogManufacturerReference: formsState.catalogManufacturerReference,
    setCatalogManufacturerReference: formsState.setCatalogManufacturerReference,
    catalogConnectionCount: formsState.catalogConnectionCount,
    setCatalogConnectionCount: formsState.setCatalogConnectionCount,
    catalogName: formsState.catalogName,
    setCatalogName: formsState.setCatalogName,
    catalogUnitPriceExclTax: formsState.catalogUnitPriceExclTax,
    setCatalogUnitPriceExclTax: formsState.setCatalogUnitPriceExclTax,
    catalogUrl: formsState.catalogUrl,
    setCatalogUrl: formsState.setCatalogUrl,
    setCatalogFormError: formsState.setCatalogFormError
  });

  useNetworkSummaryViewStateSync({
    activeNetworkId,
    activeNetworkSummaryViewState,
    preferencesHydrated,
    networkMinScale: NETWORK_MIN_SCALE,
    networkMaxScale: NETWORK_MAX_SCALE,
    configuredResetScale,
    canvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentNames,
    canvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts,
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    networkScale,
    networkOffset,
    showNetworkInfoPanels,
    showSegmentNames,
    showSegmentLengths,
    showCableCallouts,
    showNetworkGrid,
    snapNodesToGrid,
    lockEntityMovement,
    isPanningNetwork,
    setNetworkScale,
    setNetworkOffset,
    setShowNetworkInfoPanels,
    setShowSegmentNames,
    setShowSegmentLengths,
    setShowCableCallouts,
    setShowNetworkGrid,
    setSnapNodesToGrid,
    setLockEntityMovement,
    dispatchAction
  });

  const workspaceNetworkDomain = useAppControllerWorkspaceNetworkDomainAssembly({
    core: {
      store,
      state,
      nodes,
      segments,
      networks,
      activeNetworkId,
      catalogItems,
      isNetworkScopeScreen,
      dispatchAction,
      replaceStateWithHistory
    },
    forms: {
      networkScopeFormState
    },
    layout: {
      persistedNodePositions,
      networkNodePositions,
      snapNodesToGrid,
      setManualNodePositions
    },
    workspace: {
      isCurrentWorkspaceEmpty,
      hasBuiltInSampleState,
      connectorMap,
      spliceMap,
      configuredResetScale,
      effectiveNetworkViewWidth,
      effectiveNetworkViewHeight,
      networkScale,
      networkOffset,
      setNetworkScale,
      setNetworkOffset
    },
    ui: {
      canvasDisplayState,
      canvasViewportSetters: {
        setShowNetworkGrid,
        setSnapNodesToGrid,
        setLockEntityMovement
      },
      sortSetters: {
        setConnectorSort,
        setSpliceSort,
        setWireSort,
        setConnectorSynthesisSort,
        setSpliceSynthesisSort,
        setNodeIdSortDirection,
        setSegmentIdSortDirection
      },
      preferencesState
    },
    navigation: {
      setActiveScreen,
      setActiveSubScreen
    },
    requestConfirmation
  });

  const { describeNode, nodeLabelById } = useNodeDescriptions(nodes, connectorMap, spliceMap);

  const modelingHandlers = useAppControllerModelingHandlersAssembly({
    store,
    state,
    dispatchAction,
    confirmAction: requestConfirmation,
    formsState,
    pendingNewNodePosition,
    setPendingNewNodePosition,
    setRoutePreviewStartNodeId,
    setRoutePreviewEndNodeId,
    selectedConnectorId,
    selectedSpliceId,
    selectedWire,
    defaultWireSectionMm2,
    defaultAutoCreateLinkedNodes
  });
  const { connector: connectorHandlers, splice: spliceHandlers, node: nodeHandlers, segment: segmentHandlers, wire: wireHandlers } =
    modelingHandlers;

  const catalogAnalysisDomain = useAppControllerCatalogAnalysisActions({
    connectorMap,
    spliceMap,
    connectorHandlers,
    spliceHandlers,
    setIsModelingAnalysisFocused,
    setActiveScreen,
    setActiveSubScreen,
    setDetailPanelsSelectionSource
  });

  const selectionHandlersDomain = useAppControllerSelectionHandlersDomainAssembly({
    core: {
      state,
      dispatchAction,
      segmentMap,
      networkNodePositions,
      connectorNodeByConnectorId,
      spliceNodeBySpliceId
    },
    canvasFocus: {
      setInteractionMode,
      networkScale,
      effectiveNetworkViewWidth,
      effectiveNetworkViewHeight,
      setNetworkScale,
      setNetworkOffset
    },
    selectionEntities,
    navigation: {
      setActiveScreen,
      setActiveSubScreen,
      markDetailPanelsSelectionSourceAsTable: () => setDetailPanelsSelectionSource("table")
    },
    validationModel,
    modelingHandlers,
    catalogHandlers
  });
  useAppControllerActionRefsSyncEffect({
    undoActionRef,
    redoActionRef,
    exportActiveNetworkRef,
    fitNetworkToContentRef,
    previousValidationIssueRef,
    nextValidationIssueRef,
    handleUndo,
    handleRedo,
    handleSaveActiveNetworkWithConfirmation: workspaceNetworkDomain.handleSaveActiveNetworkWithConfirmation,
    fitNetworkToContent: workspaceNetworkDomain.fitNetworkToContent,
    activeScreenRef,
    moveVisibleValidationIssueCursor: selectionHandlersDomain.moveVisibleValidationIssueCursor,
    moveValidationIssueCursor: selectionHandlersDomain.moveValidationIssueCursor
  });

  const handleSelectEntityWithoutHistory = useCallback(
    (selection: { kind: "catalog" | "connector" | "splice" | "node" | "segment" | "wire"; id: string }) => {
      dispatchAction(appActions.select(selection), { trackHistory: false });
    },
    [dispatchAction]
  );
  const {
    handleWorkspaceScreenChange,
    handleWorkspaceDrawerScreenChange,
    markDetailPanelsSelectionSourceAsTable,
    markDetailPanelsSelectionSourceAsExternal
  } = useAppControllerWorkspaceScreenController({
    lastAnalysisSubScreen,
    selected,
    selectedSubScreen,
    selectedConnector,
    selectedSplice,
    selectedNode,
    selectedSegment,
    selectedWire,
    handleStartSelectedEdit: selectionHandlersDomain.handleStartSelectedEdit,
    setIsModelingAnalysisFocused,
    setActiveScreen,
    setActiveSubScreen,
    setDetailPanelsSelectionSource,
    onSelectEntityWithoutHistory: handleSelectEntityWithoutHistory
  });

  useAppControllerAnalysisSubScreenTrackingEffect({
    activeScreen,
    activeSubScreen,
    isModelingAnalysisFocused,
    setLastAnalysisSubScreen
  });

  useKeyboardShortcuts({
    keyboardShortcutsEnabled,
    activeScreenRef,
    undoActionRef,
    redoActionRef,
    exportActiveNetworkRef,
    fitNetworkToContentRef,
    previousValidationIssueRef,
    nextValidationIssueRef,
    setActiveScreen: handleWorkspaceScreenChange,
    setActiveSubScreen
  });

  const { clearAllModelingForms } = useModelingFormSelectionSync({
    activeSubScreen,
    connectorFormMode: formsState.connectorFormMode,
    spliceFormMode: formsState.spliceFormMode,
    nodeFormMode: formsState.nodeFormMode,
    segmentFormMode: formsState.segmentFormMode,
    wireFormMode: formsState.wireFormMode,
    selectedConnectorId,
    selectedSpliceId,
    selectedNodeId,
    selectedSegmentId,
    selectedWireId,
    clearConnectorForm: connectorHandlers.clearConnectorForm,
    clearSpliceForm: spliceHandlers.clearSpliceForm,
    clearNodeForm: nodeHandlers.clearNodeForm,
    clearSegmentForm: segmentHandlers.clearSegmentForm,
    clearWireForm: wireHandlers.clearWireForm
  });
  useAppControllerCatalogFormGuardEffect({
    activeSubScreen,
    catalogFormMode: formsState.catalogFormMode,
    clearCatalogForm: catalogHandlers.clearCatalogForm
  });

  const canvasInteractionDomain = useAppControllerCanvasInteractionDomainAssembly({
    core: {
      state,
      nodesCount: nodes.length,
      interactionMode,
      isModelingScreen,
      activeSubScreen,
      setActiveScreen,
      setActiveSubScreen
    },
    formsState,
    setPendingNewNodePosition,
    viewport: {
      effectiveNetworkViewWidth,
      effectiveNetworkViewHeight,
      snapNodesToGrid,
      lockEntityMovement,
      networkOffset,
      networkScale,
      setNetworkScale,
      setNetworkOffset,
      draggingNodeId,
      setDraggingNodeId,
      manualNodePositions,
      setManualNodePositions,
      setIsPanningNetwork,
      panStartRef
    },
    actions: {
      dispatchAction,
      resetNetworkViewToConfiguredScale: workspaceNetworkDomain.resetNetworkViewToConfiguredScale,
      markDetailPanelsSelectionSourceAsExternal
    },
    modelingHandlers
  });

  const networkScalePercent = Math.round(networkScale * 100);
  const {
    currentValidationIssue,
    issueNavigationScopeLabel,
    issueNavigatorDisplay,
    hasInspectableSelection,
    hasTableSelectionForActiveSubScreen,
    hasInspectableSelectionForActiveSubScreen,
    hasCatalogSelectionForActiveSubScreen,
    hasActiveEntityForm,
    isInspectorHidden,
    isInspectorOpen,
    inspectorContextPanel
  } = useAppControllerInspectorIssueLayoutState({
    validationModel: {
      orderedValidationIssues,
      visibleValidationIssues,
      getFocusedValidationIssueByCursor,
      getValidationIssueByCursor
    },
    isValidationScreen,
    selectionEntities,
    activeSubScreen,
    isCatalogSubScreen,
    selectedCatalogItemId,
    detailPanelsSelectionSource,
    isModelingScreen,
    isAnalysisScreen,
    hasActiveNetwork,
    showFloatingInspectorPanel,
    viewportWidth,
    isDialogFocusActive,
    isNavigationDrawerOpen,
    isOperationsPanelOpen,
    describeNode,
    handleStartSelectedEdit: selectionHandlersDomain.handleStartSelectedEdit,
    onClearSelection: () => {
      dispatchAction(appActions.clearSelection());
      clearAllModelingForms();
    },
    formsState
  });
  const {
    homeWorkspaceContent,
    networkSummaryPanel,
    modelingLeftColumnContentForSubScreen,
    modelingFormsColumnContentForLayout,
    analysisWorkspaceContentForLayout,
    networkScopeWorkspaceContent,
    validationWorkspaceContent,
    settingsWorkspaceContent
  } = useAppControllerWorkspaceContentAssembly({
    components: {
      HomeWorkspaceContentComponent: HomeWorkspaceContent,
      NetworkSummaryPanelComponent: NetworkSummaryPanel,
      ModelingPrimaryTablesComponent: ModelingPrimaryTables,
      ModelingSecondaryTablesComponent: ModelingSecondaryTables,
      ModelingFormsColumnComponent: ModelingFormsColumn,
      AnalysisWorkspaceContentComponent: AnalysisWorkspaceContent,
      NetworkScopeWorkspaceContentComponent: NetworkScopeWorkspaceContent,
      ValidationWorkspaceContentComponent: ValidationWorkspaceContent,
      SettingsWorkspaceContentComponent: SettingsWorkspaceContent
    },
    state: {
      hasActiveNetwork,
      activeNetworkName: activeNetwork?.name ?? null,
      activeNetworkTechnicalId: activeNetwork?.technicalId ?? null,
      activeNetwork,
      activeSubScreen,
      isModelingScreen,
      isAnalysisScreen,
      isModelingAnalysisFocused,
      isNetworkScopeScreen,
      isValidationScreen,
      isSettingsScreen,
      isCatalogSubScreen,
      isConnectorSubScreen,
      isSpliceSubScreen,
      isNodeSubScreen,
      isSegmentSubScreen,
      isWireSubScreen,
      selectedCatalogItemId,
      hasTableSelectionForActiveSubScreen,
      hasActiveEntityForm,
      hasCatalogSelectionForActiveSubScreen,
      hasInspectableSelectionForActiveSubScreen,
      networkScalePercent,
      saveStatus,
      validationIssuesCount: validationIssues.length,
      validationErrorCount,
      validationWarningCount,
      isCurrentWorkspaceEmpty,
      hasBuiltInSampleState,
      themeMode: state.ui.themeMode,
      workspaceCurrencyCode,
      configuredResetZoomPercent,
      networkCount: networks.length,
      networkTechnicalIdAlreadyUsed
    },
    entities: {
      entityCountBySubScreen,
      networks,
      networkSort,
      setNetworkSort,
      networkEntityCountsById,
      activeNetworkId,
      catalogItems,
      connectors,
      splices,
      nodes,
      segments,
      wires,
      subNetworkSummaries,
      routingGraph,
      totalEdgeEntries,
      networkNodePositions,
      selectedWireRouteSegmentIds,
      routePreview,
      connectorMap,
      spliceMap,
      selectedSegmentId,
      selectedWireId,
      selectedNodeId,
      selectedConnectorId,
      selectedSpliceId,
      undoHistoryEntries
    },
    models: {
      formsState,
      canvasState,
      canvasDisplayState,
      preferencesState,
      modelingHandlers,
      entityListModel,
      selectionEntities,
      validationModel,
      networkScopeFormState,
      catalogHandlers
    },
    domains: {
      workspaceNetworkDomain,
      catalogAnalysisDomain,
      selectionHandlersDomain,
      canvasInteractionDomain
    },
    handlers: {
      requestConfirmation,
      replaceStateWithHistory,
      setActiveScreen,
      setActiveSubScreen,
      setInteractionMode,
      handleWorkspaceScreenChange,
      openFullOnboarding,
      openSingleStepOnboarding,
      markDetailPanelsSelectionSourceAsTable,
      markDetailPanelsSelectionSourceAsExternal,
      dispatchAction,
      handleNetworkSummaryViewportSizeChange,
      canExportBomCsv,
      handleExportBomCsv,
      describeNode,
      nodeLabelById,
      describeWireEndpoint,
      describeWireEndpointId,
      describeWireEndpointCsvParts,
      connectorTechnicalIdAlreadyUsed,
      spliceTechnicalIdAlreadyUsed,
      wireTechnicalIdAlreadyUsed,
      catalogManufacturerReferenceAlreadyUsed,
      pendingNewNodePosition,
      effectiveNetworkViewWidth,
      effectiveNetworkViewHeight,
      networkGridStep: NETWORK_GRID_STEP
    }
  });
  useAppControllerInspectorSelectionSourceEffect({
    hasInspectableSelection,
    setDetailPanelsSelectionSource
  });
  const appShellLayoutProps = buildAppControllerShellLayoutProps({
    meta: {
      appShellClassName,
      workspaceShellStyle,
      appRepositoryUrl: APP_REPOSITORY_URL,
      currentYear,
      appVersion: appPackageMetadata.version
    },
    refs: {
      headerBlockRef,
      navigationToggleButtonRef,
      operationsButtonRef,
      navigationDrawerRef,
      operationsPanelRef
    },
    shellChrome: {
      isNavigationDrawerOpen,
      isOperationsPanelOpen,
      closeNavigationDrawer,
      closeOperationsPanel,
      onToggleNavigationDrawer: handleToggleNavigationDrawer,
      onToggleOperationsPanel: handleToggleOperationsPanel,
      isSettingsActive: isSettingsScreen,
      onOpenSettings: handleOpenSettingsScreen,
      isInstallPromptAvailable,
      onInstallApp: handleInstallApp,
      isPwaUpdateReady,
      onApplyPwaUpdate: handleApplyPwaUpdate
    },
    health: {
      validationIssuesCount: validationIssues.length,
      validationErrorCount,
      validationWarningCount,
      lastError,
      onClearError: () => dispatchAction(appActions.clearError())
    },
    navigation: {
      activeScreen,
      activeSubScreen,
      isModelingScreen,
      isAnalysisScreen,
      isValidationScreen,
      entityCountBySubScreen,
      onScreenChange: handleWorkspaceDrawerScreenChange,
      onSubScreenChange: setActiveSubScreen
    },
    operations: {
      handleUndo,
      handleRedo,
      isUndoAvailable,
      isRedoAvailable,
      showShortcutHints,
      saveStatus,
      issueNavigatorDisplay,
      issueNavigationScopeLabel,
      currentValidationIssue,
      orderedValidationIssues,
      handleOpenValidationScreen: selectionHandlersDomain.handleOpenValidationScreen,
      moveValidationIssueCursor: selectionHandlersDomain.moveValidationIssueCursor
    },
    screenComponents: {
      HomeScreenComponent: HomeScreen,
      NetworkScopeScreenComponent: NetworkScopeScreen,
      ModelingScreenComponent: ModelingScreen,
      AnalysisScreenComponent: AnalysisScreen,
      ValidationScreenComponent: ValidationScreen,
      SettingsScreenComponent: SettingsScreen
    },
    workspace: {
      isHomeScreen,
      isNetworkScopeScreen,
      homeWorkspaceContent,
      hasActiveNetwork,
      networkScopeWorkspaceContent,
      modelingLeftColumnContent: modelingLeftColumnContentForSubScreen,
      modelingFormsColumnContent: modelingFormsColumnContentForLayout,
      networkSummaryPanel,
      analysisWorkspaceContent: analysisWorkspaceContentForLayout,
      validationWorkspaceContent,
      settingsWorkspaceContent,
      isSettingsScreen
    },
    inspector: {
      isInspectorHidden,
      isInspectorOpen,
      inspectorContextPanel
    }
  });

  return (
    <>
      <AppShellLayout {...appShellLayoutProps} />
      <AppControllerOverlays
        appShellClassName={appShellClassName}
        activeConfirmDialog={activeConfirmDialog}
        closeActiveConfirmDialog={closeActiveConfirmDialog}
        onboarding={{
          activeOnboardingStep,
          isOnboardingOpen,
          onboardingModalMode,
          onboardingStepDisplayIndex,
          onboardingTotalSteps,
          onboardingAutoOpenEnabled,
          setOnboardingAutoOpenEnabledPersisted,
          closeOnboarding,
          handleOnboardingNext,
          canGoNext: canOnboardingGoNext,
          onboardingTargetActions
        }}
      />
    </>
  );
}
