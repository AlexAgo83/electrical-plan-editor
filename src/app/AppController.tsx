import { type ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import appPackageMetadata from "../../package.json";
import type { CatalogItemId } from "../core/entities";
import {
  appActions,
  hasSampleNetworkSignature,
  isWorkspaceEmpty
} from "../store";
import { appStore } from "./store";
import { appUiModules, preloadNetworkSummaryWorkspaceUiModules } from "./components/appUiModules";
import { AppShellLayout } from "./components/layout/AppShellLayout";
import { AppControllerOverlays } from "./components/layout/AppControllerOverlays";
import { ToastViewport } from "./components/ToastViewport";
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
import { useAppControllerEntitySnapshot } from "./hooks/controller/useAppControllerEntitySnapshot";
import { useAppControllerInspectorIssueLayoutState } from "./hooks/controller/useAppControllerInspectorIssueLayoutState";
import { useAppControllerNetworkViewportState } from "./hooks/controller/useAppControllerNetworkViewportState";
import { useAppControllerHeaderOffsetState } from "./hooks/controller/useAppControllerHeaderOffsetState";
import { useAppControllerCanvasStateSyncEffects } from "./hooks/controller/useAppControllerCanvasStateSyncEffects";
import { useConfirmDialogController } from "./hooks/controller/useConfirmDialogController";
import { useChoiceDialogController } from "./hooks/controller/useChoiceDialogController";
import { useAppControllerHistoryDispatch } from "./hooks/controller/useAppControllerHistoryDispatch";
import { useAppControllerBomPreviewNavigation } from "./hooks/controller/useAppControllerBomPreviewNavigation";
import { useNetworkSummaryViewStateSync } from "./hooks/controller/useNetworkSummaryViewStateSync";
import { useOnboardingController } from "./hooks/controller/useOnboardingController";
import { useAppControllerPersistenceHealth } from "./hooks/controller/useAppControllerPersistenceHealth";
import { useAppControllerWorkspaceContentAssembly } from "./hooks/controller/useAppControllerWorkspaceContentAssembly";
import { useAppControllerUniquenessFlags } from "./hooks/controller/useAppControllerUniquenessFlags";
import { useAppControllerRefs } from "./hooks/controller/useAppControllerRefs";
import { scrollToAiAgentPanel } from "./lib/aiAgentPanelScroll";
import {
  useAppControllerActionRefsSyncEffect,
  useAppControllerAnalysisSubScreenTrackingEffect,
  useAppControllerCatalogFormGuardEffect,
  useAppControllerInspectorSelectionSourceEffect,
  useAppControllerThemeSyncEffect
} from "./hooks/controller/useAppControllerLifecycleEffects";
import { useEntityListModel } from "./hooks/useEntityListModel";
import { useEntityFormsState } from "./hooks/useEntityFormsState";
import { useNetworkScopeFormState } from "./hooks/useNetworkScopeFormState";
import { useModelingFormSelectionSync } from "./hooks/useModelingFormSelectionSync";
import { useNodeDescriptions } from "./hooks/useNodeDescriptions";
import { useValidationModel } from "./hooks/useValidationModel";
import { useWireEndpointDescriptions } from "./hooks/useWireEndpointDescriptions";
import { useWorkspaceShellChrome } from "./hooks/useWorkspaceShellChrome";
import { useWorkspaceNavigation } from "./hooks/useWorkspaceNavigation";
import { useAppLocaleDomTranslation } from "./hooks/useAppLocaleDomTranslation";
import { useHoverDescriptionTitles } from "./hooks/useHoverDescriptionTitles";
import { useToastNotifications } from "./hooks/useToastNotifications";
import { useAiSettings } from "./hooks/useAiSettings";
import { useWorkspaceFileStorage } from "./hooks/useWorkspaceFileStorage";
import { useAppControllerUiPreferencesBindings } from "./hooks/controller/useAppControllerUiPreferencesBindings";
import { buildAppControllerNamespacedCanvasState } from "./hooks/useAppControllerNamespacedCanvasState";
import { buildAppControllerNamespacedFormsState } from "./hooks/useAppControllerNamespacedFormsState";
import { useAppSnapshot } from "./hooks/useAppSnapshot";
import { NETWORK_GRID_STEP, NETWORK_MAX_SCALE, NETWORK_MIN_SCALE } from "./lib/app-utils-shared";
import { useAppControllerBomExportHandlers } from "./hooks/controller/useAppControllerBomExportHandlers";
import type { AppProps, SubScreenId } from "./types/app-controller";
import "./styles.css";
export type { AppProps } from "./types/app-controller";
const APP_REPOSITORY_URL = "https://github.com/AlexAgo83/electrical-plan-editor";
export function AppController({ store = appStore }: AppProps): ReactElement {
  const currentYear = new Date().getFullYear(), state = useAppSnapshot(store);
  const { NetworkSummaryPanel, AnalysisScreen, HomeScreen, ModelingScreen, NetworkScopeScreen, SettingsScreen, ValidationScreen, AnalysisWorkspaceContent, HomeWorkspaceContent, ModelingFormsColumn, ModelingPrimaryTables, ModelingSecondaryTables, NetworkScopeWorkspaceContent, SettingsWorkspaceContent, ValidationWorkspaceContent } = appUiModules;
  const {
    networks,
    activeNetworkId,
    activeNetworkSummaryViewState,
    activeNetwork,
    connectors,
    catalogItems,
    splices,
    nodes,
    segments,
    wires,
    routingGraph,
    subNetworkSummaries,
    networkEntityCountsById,
    connectorMap,
    spliceMap,
    segmentMap,
    connectorNodeByConnectorId,
    spliceNodeBySpliceId
  } = useAppControllerEntitySnapshot(state);
  const formsState = useEntityFormsState();
  const forms = useMemo(() => buildAppControllerNamespacedFormsState(formsState), [formsState]);
  const { setWireForcedRouteInput } = formsState;
  const canvasDisplayState = useAppControllerCanvasDisplayState();
  const { routePreviewStartNodeId, setRoutePreviewStartNodeId, routePreviewEndNodeId, setRoutePreviewEndNodeId } =
    canvasDisplayState;
  const { showNetworkInfoPanels, setShowNetworkInfoPanels, showSegmentNames, setShowSegmentNames } = canvasDisplayState;
  const { showSegmentLengths, setShowSegmentLengths, showCableCallouts, setShowCableCallouts } = canvasDisplayState;
  const { networkCalloutContentMode, setNetworkCalloutContentMode, canvasResetZoomPercentInput } = canvasDisplayState;
  const { setNetworkLabelSizeMode, setNetworkCalloutTextSize, setNetworkLabelRotationDegrees, setNetworkAutoSegmentLabelRotation } =
    canvasDisplayState;
  const canvasState = useCanvasState();
  const canvas = useMemo(() => buildAppControllerNamespacedCanvasState(canvasState), [canvasState]);
  const { interactionMode, setInteractionMode, pendingNewNodePosition, setPendingNewNodePosition, draggingNodeId, setDraggingNodeId } =
    canvasState;
  const { manualNodePositions, setManualNodePositions, isPanningNetwork, setIsPanningNetwork } = canvasState;
  const { showNetworkGrid, setShowNetworkGrid, snapNodesToGrid, setSnapNodesToGrid, lockEntityMovement, setLockEntityMovement } =
    canvasState;
  const { networkScale, setNetworkScale, networkOffset, setNetworkOffset } = canvasState;
  const networkScopeFormState = useNetworkScopeFormState();
  const { newNetworkTechnicalId, networkFormMode, networkFormTargetId } = networkScopeFormState;
  const preferencesState = useAppControllerPreferencesState();
  const { locale, themeMode, tableDensity, tableFontSize, workspaceCurrencyCode, workspaceTaxEnabled, workspaceTaxRatePercent } =
    preferencesState;
  const { tabularExportFormat, bomExportCompactColumns, bomTraceabilityLabelsHidden, defaultWireSectionMm2 } = preferencesState;
  const { defaultAutoCreateLinkedNodes, spliceSectionImbalanceRatioPercent, networkSort, setNetworkSort } = preferencesState;
  const { canvasDefaultShowGrid, canvasDefaultSnapToGrid, canvasDefaultLockEntityMovement, canvasDefaultShowInfoPanels } =
    preferencesState;
  const { canvasDefaultShowSegmentNames, canvasDefaultShowSegmentLengths, canvasDefaultShowCableCallouts } = preferencesState;
  const { canvasDefaultCalloutContentMode, canvasDefaultLabelSizeMode, canvasDefaultCalloutTextSize } = preferencesState;
  const { canvasDefaultLabelRotationDegrees, canvasDefaultAutoSegmentLabelRotation, canvasResizeBehaviorMode } = preferencesState;
  const { showShortcutHints, keyboardShortcutsEnabled, restoreViewportOnUndo, showFloatingInspectorPanel } = preferencesState;
  const { workspacePanelsLayoutMode, workspaceWideScreen, preferencesHydrated } = preferencesState;
  const {
    activeBomPreview,
    canExportBomCsv,
    closeActiveBomPreview,
    confirmActiveBomPreviewDownload,
    handleExportBomCsv,
    isBomPreviewLoading
  } = useAppControllerBomExportHandlers({
    catalogItems,
    connectors,
    splices,
    wires,
    workspaceCurrencyCode,
    workspaceTaxEnabled,
    workspaceTaxRatePercent,
    tabularExportFormat,
    bomExportCompactColumns,
    bomTraceabilityLabelsHidden,
    connectorCavityOccupancy: state.connectorCavityOccupancy
  });
  const { effectiveNetworkViewWidth, effectiveNetworkViewHeight, handleNetworkSummaryViewportSizeChange } = useAppControllerNetworkViewportState({ canvasResizeBehaviorMode });
  const { headerOffsetPx, headerBlockRef } = useAppControllerHeaderOffsetState();
  const refs = useAppControllerRefs();
  const { panStartRef, undoActionRef, redoActionRef, exportActiveNetworkRef, fitNetworkToContentRef } = refs;
  const { previousValidationIssueRef, nextValidationIssueRef, navigationDrawerRef, navigationToggleButtonRef } = refs;
  const { operationsPanelRef, operationsButtonRef, deferredInstallPromptRef } = refs;
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
    isHarnessAssemblyScreen,
    isModelingScreen,
    isAnalysisScreen,
    isValidationScreen,
    isSettingsScreen,
    activeScreenRef
  } = useWorkspaceNavigation();
  const [isAiAgentModelingOpen, setIsAiAgentModelingOpen] = useState(false);
  const aiSettings = useAiSettings();
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
  const { activeChoiceDialog, requestChoiceSelection, closeActiveChoiceDialog } = useChoiceDialogController();
  const { isInstallPromptAvailable, isPwaUpdateReady, isNavigationDrawerOpen, isOperationsPanelOpen, viewportWidth, isDialogFocusActive, closeNavigationDrawer, handleToggleNavigationDrawer, closeOperationsPanel, handleToggleOperationsPanel, handleOpenSettingsScreen, handleInstallApp, handleApplyPwaUpdate } = useWorkspaceShellChrome({
    activeScreen,
    setActiveScreen,
    navigationDrawerRef,
    navigationToggleButtonRef,
    operationsPanelRef,
    operationsButtonRef,
    deferredInstallPromptRef
  });
  const handleSubScreenChange = useCallback(
    (subScreen: SubScreenId) => {
      setIsAiAgentModelingOpen(false);
      setActiveSubScreen(subScreen);
    },
    [setActiveSubScreen]
  );
  const handleOpenAiAgent = useCallback(() => {
    if (!aiSettings.readiness.isReady) {
      return;
    }
    setActiveScreen("modeling");
    setIsAiAgentModelingOpen(true);
    scrollToAiAgentPanel();
  }, [aiSettings.readiness.isReady, setActiveScreen]);
  const aiAgentDisabledReason = aiSettings.readiness.isReady
    ? "AI Agent is ready."
    : `${aiSettings.readiness.message} Configure a valid provider in Settings.`;
  const networkScalePercent = Math.round(networkScale * 100);
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
  const { describeWireEndpoint, describeWireEndpointId, describeWireEndpointCsvParts } = useWireEndpointDescriptions({ connectorMap, spliceMap });
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
    isValidationScreen,
    spliceSectionImbalanceRatioPercent
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
  useEffect(() => {
    if (hasActiveNetwork && (isModelingScreen || isAnalysisScreen)) {
      preloadNetworkSummaryWorkspaceUiModules();
    }
  }, [hasActiveNetwork, isAnalysisScreen, isModelingScreen]);
  const isCurrentWorkspaceEmpty = isWorkspaceEmpty(state);
  const hasBuiltInSampleState = hasSampleNetworkSignature(state);
  const { toasts, notifyToast, dismissToast } = useToastNotifications();
  const {
    saveStatus,
    isUndoAvailable,
    isRedoAvailable,
    undoHistoryEntries,
    dispatchAction,
    handleUndo,
    handleRedo,
    replaceStateWithHistory
  } = useAppControllerHistoryDispatch({
    store,
    restoreViewportOnUndo,
    setPendingNewNodePosition,
    setActiveScreen,
    setActiveSubScreen,
    setInteractionMode,
    notifyToast
  });
  const {
    lastError,
    bootRecoveryMessage,
    clearPersistenceHealth,
    commitBootRecovery
  } = useAppControllerPersistenceHealth({
    state,
    dispatchAction
  });
  const workspaceFileStorage = useWorkspaceFileStorage({
    store,
    replaceStateWithHistory,
    requestConfirmation,
    notifyToast
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
    catalogAdditionalAccessories: formsState.catalogAdditionalAccessories,
    setCatalogAdditionalAccessories: formsState.setCatalogAdditionalAccessories,
    catalogShowAdditionalAccessories: formsState.catalogShowAdditionalAccessories,
    setCatalogShowAdditionalAccessories: formsState.setCatalogShowAdditionalAccessories,
    catalogShowConnectorMaterialDefaults: formsState.catalogShowConnectorMaterialDefaults,
    setCatalogShowConnectorMaterialDefaults: formsState.setCatalogShowConnectorMaterialDefaults,
    catalogAllSameTerminals: formsState.catalogAllSameTerminals,
    setCatalogAllSameTerminals: formsState.setCatalogAllSameTerminals,
    catalogDefaultTerminalReference: formsState.catalogDefaultTerminalReference,
    setCatalogDefaultTerminalReference: formsState.setCatalogDefaultTerminalReference,
    catalogDefaultTerminalName: formsState.catalogDefaultTerminalName,
    setCatalogDefaultTerminalName: formsState.setCatalogDefaultTerminalName,
    catalogDefaultSealReference: formsState.catalogDefaultSealReference,
    setCatalogDefaultSealReference: formsState.setCatalogDefaultSealReference,
    catalogDefaultSealName: formsState.catalogDefaultSealName,
    setCatalogDefaultSealName: formsState.setCatalogDefaultSealName,
    catalogPlugDefinitionsText: formsState.catalogPlugDefinitionsText,
    setCatalogPlugDefinitionsText: formsState.setCatalogPlugDefinitionsText,
    catalogConnectorLayout: formsState.catalogConnectorLayout,
    setCatalogConnectorLayout: formsState.setCatalogConnectorLayout,
    catalogShowConnectorPhysicalLayout: formsState.catalogShowConnectorPhysicalLayout,
    setCatalogShowConnectorPhysicalLayout: formsState.setCatalogShowConnectorPhysicalLayout,
    catalogIsFuseBox: formsState.catalogIsFuseBox,
    setCatalogIsFuseBox: formsState.setCatalogIsFuseBox,
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
    canvasDefaultCalloutContentMode,
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    networkScale,
    networkOffset,
    networkNodeCount: nodes.length,
    networkNodePositions,
    networkViewWidth: effectiveNetworkViewWidth,
    networkViewHeight: effectiveNetworkViewHeight,
    showNetworkInfoPanels,
    showSegmentNames,
    showSegmentLengths,
    showCableCallouts,
    networkCalloutContentMode,
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
    setNetworkCalloutContentMode,
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
      notifyToast,
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
    notifyToast,
    choiceAction: requestChoiceSelection,
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
  const { openBomPreviewCatalogItem, openBomPreviewConnector } = useAppControllerBomPreviewNavigation({
    store,
    dispatchAction,
    closeActiveBomPreview,
    setDetailPanelsSelectionSource,
    setActiveScreen,
    setActiveSubScreen,
    startCatalogEdit: catalogHandlers.startCatalogEdit,
    startConnectorEdit: modelingHandlers.connector.startConnectorEdit
  });

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
  const handleSelectCatalogItemFromInspector = useCallback(
    (catalogItemId: CatalogItemId) => {
      markDetailPanelsSelectionSourceAsTable();
      setActiveScreen("modeling");
      setActiveSubScreen("catalog");
      const catalogItem = store.getState().catalogItems.byId[catalogItemId];
      if (catalogItem !== undefined) {
        catalogHandlers.startCatalogEdit(catalogItem);
        return;
      }
      dispatchAction(appActions.select({ kind: "catalog", id: catalogItemId }));
    },
    [catalogHandlers, dispatchAction, markDetailPanelsSelectionSourceAsTable, setActiveScreen, setActiveSubScreen, store]
  );

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
    catalogFormMode: formsState.catalogFormMode,
    connectorFormMode: formsState.connectorFormMode,
    spliceFormMode: formsState.spliceFormMode,
    nodeFormMode: formsState.nodeFormMode,
    segmentFormMode: formsState.segmentFormMode,
    wireFormMode: formsState.wireFormMode,
    selectedCatalogItemId,
    selectedConnectorId,
    selectedSpliceId,
    selectedNodeId,
    selectedSegmentId,
    selectedWireId,
    clearCatalogForm: catalogHandlers.clearCatalogForm,
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

  const globalNetworkRenderScale = 1 + Math.min(300, Math.max(0, preferencesState.canvasGlobalRenderScalePercent)) / 100;
  const canvasInteractionDomain = useAppControllerCanvasInteractionDomainAssembly({
    core: {
      state,
      nodesCount: nodes.length,
      interactionMode,
      isModelingScreen,
      isModelingAnalysisFocused,
      activeSubScreen,
      setActiveScreen,
      setActiveSubScreen
    },
    formsState,
    setPendingNewNodePosition,
    viewport: {
      effectiveNetworkViewWidth,
      effectiveNetworkViewHeight,
      networkNodePositions,
      snapNodesToGrid,
      lockEntityMovement,
      networkOffset,
      networkScale,
      networkRenderScale: globalNetworkRenderScale,
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
  const {
    currentValidationIssue,
    issueNavigationScopeLabel,
    issueNavigatorDisplay,
    hasInspectableSelection,
    hasTableSelectionForActiveSubScreen,
    hasInspectableSelectionForActiveSubScreen,
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
    onCloseInspector: () => preferencesState.setShowFloatingInspectorPanel(false),
    viewportWidth,
    isDialogFocusActive,
    isNavigationDrawerOpen,
    isOperationsPanelOpen,
    describeNode,
    handleStartSelectedEdit: selectionHandlersDomain.handleStartSelectedEdit,
    onSelectCatalogItem: handleSelectCatalogItemFromInspector,
    onClearSelection: () => {
      dispatchAction(appActions.clearSelection());
      clearAllModelingForms();
    },
    formsState,
    spliceLengthSuggestion: spliceHandlers.optimizedLengthSuggestion,
    onApplySpliceLengthSuggestion: spliceHandlers.applyOptimizedSpliceLengthSuggestion,
    onCancelSpliceLengthSuggestion: spliceHandlers.cancelOptimizedSpliceLengthSuggestion,
    onSuggestOptimizedSplicePlacement: spliceHandlers.handleSuggestOptimizedSplicePlacementForSplice
  });
  const {
    homeWorkspaceContent,
    networkSummaryPanel,
    modelingLeftColumnContentForSubScreen,
    modelingFormsColumnContentForLayout,
    analysisWorkspaceContentForLayout,
    networkScopeWorkspaceContent,
    harnessAssemblyWorkspaceContent,
    headerHarnessAssemblyFunctionalScopeNavigation,
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
      hasInspectableSelectionForActiveSubScreen,
      networkScalePercent,
      isCurrentWorkspaceEmpty,
      hasBuiltInSampleState,
      themeMode: state.ui.themeMode,
      workspaceCurrencyCode,
      configuredResetZoomPercent,
      networkCount: networks.length,
      networkTechnicalIdAlreadyUsed,
      isAiAgentModelingOpen,
      isAiAgentReady: aiSettings.readiness.isReady,
      aiAgentDisabledReason,
      aiProviderReadiness: aiSettings.readiness
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
      splicePlacementPreview: spliceHandlers.optimizedLengthSuggestion,
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
      catalogHandlers,
      aiSettings,
      workspaceFileStorage
    },
    domains: {
      workspaceNetworkDomain,
      catalogAnalysisDomain,
      selectionHandlersDomain,
      canvasInteractionDomain
    },
    handlers: {
      store,
      requestConfirmation,
      replaceStateWithHistory,
      setActiveScreen,
      setActiveSubScreen: handleSubScreenChange,
      setInteractionMode,
      handleWorkspaceScreenChange,
      handleOpenSettingsScreen,
      handleOpenAiAgent,
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
  useAppControllerInspectorSelectionSourceEffect({ hasInspectableSelection, setDetailPanelsSelectionSource });
  const appShellLayoutProps = buildAppControllerShellLayoutProps({
    meta: { appShellClassName, workspaceShellStyle, appRepositoryUrl: APP_REPOSITORY_URL, currentYear, appVersion: appPackageMetadata.version },
    refs: { headerBlockRef, navigationToggleButtonRef, operationsButtonRef, navigationDrawerRef, operationsPanelRef },
    shellChrome: {
      isNavigationDrawerOpen,
      isOperationsPanelOpen,
      closeNavigationDrawer,
      closeOperationsPanel,
      onToggleNavigationDrawer: handleToggleNavigationDrawer,
      onToggleOperationsPanel: handleToggleOperationsPanel,
      onOpenHome: () => setActiveScreen("home"),
      isSettingsActive: isSettingsScreen,
      onOpenSettings: handleOpenSettingsScreen,
      isInstallPromptAvailable,
      onInstallApp: handleInstallApp,
      isPwaUpdateReady,
      onApplyPwaUpdate: handleApplyPwaUpdate,
      workspaceFileStatus: workspaceFileStorage.workspaceFileStatus,
      onOpenWorkspaceFile: workspaceFileStorage.openWorkspaceFile,
      onResumeWorkspaceFile: workspaceFileStorage.resumeWorkspaceFile,
      onSaveWorkspaceFileAs: workspaceFileStorage.saveWorkspaceFileAs,
      workspaceFileInputRef: workspaceFileStorage.workspaceFileInputRef,
      onWorkspaceFileInputChange: workspaceFileStorage.handleWorkspaceFileInputChange
    },
    health: {
      validationIssuesCount: validationIssues.length,
      validationErrorCount,
      validationWarningCount,
      lastError,
      onClearError: clearPersistenceHealth,
      bootRecoveryMessage,
      onCommitBootRecovery: commitBootRecovery
    },
    navigation: {
      activeScreen,
      activeSubScreen,
      isModelingScreen,
      isAnalysisScreen,
      isValidationScreen,
      entityCountBySubScreen,
      isAiAgentOpen: isAiAgentModelingOpen,
      isAiAgentReady: aiSettings.readiness.isReady,
      aiAgentDisabledReason,
      onScreenChange: handleWorkspaceDrawerScreenChange,
      onSubScreenChange: handleSubScreenChange,
      onOpenAiAgent: handleOpenAiAgent
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
    screenComponents: { HomeScreenComponent: HomeScreen, NetworkScopeScreenComponent: NetworkScopeScreen, ModelingScreenComponent: ModelingScreen, AnalysisScreenComponent: AnalysisScreen, ValidationScreenComponent: ValidationScreen, SettingsScreenComponent: SettingsScreen },
    workspace: {
      isHomeScreen,
      isNetworkScopeScreen,
      isHarnessAssemblyScreen,
      homeWorkspaceContent,
      hasActiveNetwork,
      networkScopeWorkspaceContent,
      harnessAssemblyWorkspaceContent,
      headerHarnessAssemblyFunctionalScopeNavigation,
      modelingLeftColumnContent: modelingLeftColumnContentForSubScreen,
      modelingFormsColumnContent: modelingFormsColumnContentForLayout,
      networkSummaryPanel,
      analysisWorkspaceContent: analysisWorkspaceContentForLayout,
      validationWorkspaceContent,
      settingsWorkspaceContent,
      isSettingsScreen
    },
    inspector: { isInspectorHidden, isInspectorOpen, inspectorContextPanel }
  });
  return <><AppShellLayout {...appShellLayoutProps} /><ToastViewport toasts={toasts} onDismissToast={dismissToast} /><AppControllerOverlays appShellClassName={appShellClassName} activeConfirmDialog={activeConfirmDialog} closeActiveConfirmDialog={closeActiveConfirmDialog} activeChoiceDialog={activeChoiceDialog} closeActiveChoiceDialog={closeActiveChoiceDialog} activeBomPreview={activeBomPreview} isBomPreviewLoading={isBomPreviewLoading} closeActiveBomPreview={closeActiveBomPreview} confirmActiveBomPreviewDownload={confirmActiveBomPreviewDownload} openBomPreviewCatalogItem={openBomPreviewCatalogItem} openBomPreviewConnector={openBomPreviewConnector} onboarding={{ activeOnboardingStep, isOnboardingOpen, onboardingModalMode, onboardingStepDisplayIndex, onboardingTotalSteps, onboardingAutoOpenEnabled, setOnboardingAutoOpenEnabledPersisted, closeOnboarding, handleOnboardingNext, canGoNext: canOnboardingGoNext, onboardingTargetActions }} /></>;
}
