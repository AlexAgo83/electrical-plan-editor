import {
  type ChangeEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from "react";
import appPackageMetadata from "../../package.json";
import type { CatalogItemId, ConnectorId, NodeId, SpliceId } from "../core/entities";
import {
  type AppStore,
  appReducer,
  appActions,
  createEmptyWorkspaceState,
  hasSampleNetworkSignature,
  isWorkspaceEmpty,
  selectActiveNetwork,
  selectActiveNetworkId,
  selectConnectorTechnicalIdTaken,
  selectConnectors,
  selectCatalogItems,
  selectCatalogManufacturerReferenceTaken,
  selectLastError,
  selectNetworkTechnicalIdTaken,
  selectNetworks,
  selectNodes,
  selectRoutingGraphIndex,
  selectSegments,
  selectSpliceTechnicalIdTaken,
  selectSplices,
  selectSubNetworkSummaries,
  selectWireTechnicalIdTaken,
  selectWires,
  type NetworkSummaryViewState
} from "../store";
import { appStore } from "./store";
import { appUiModules } from "./components/appUiModules";
import { AppShellLayout } from "./components/layout/AppShellLayout";
import { OnboardingModal } from "./components/onboarding/OnboardingModal";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useCanvasState } from "./hooks/useCanvasState";
import { useCatalogHandlers } from "./hooks/useCatalogHandlers";
import { useAppControllerCanvasDisplayState } from "./hooks/useAppControllerCanvasDisplayState";
import { useAppControllerPreferencesState } from "./hooks/useAppControllerPreferencesState";
import { useAppControllerLayoutDerivedState } from "./hooks/useAppControllerLayoutDerivedState";
import { useAppControllerSelectionEntities } from "./hooks/useAppControllerSelectionEntities";
import { useAppControllerShellDerivedState } from "./hooks/useAppControllerShellDerivedState";
import {
  useAppControllerCanvasInteractionHandlersAssembly,
  useAppControllerSelectionHandlersAssembly,
  useAppControllerWorkspaceHandlersAssembly
} from "./hooks/controller/useAppControllerHeavyHookAssemblers";
import { useAppControllerAuxScreenContentDomains } from "./hooks/controller/useAppControllerAuxScreenContentDomains";
import { useAppControllerModelingAnalysisScreenDomains } from "./hooks/controller/useAppControllerModelingAnalysisScreenDomains";
import { useAppControllerModelingHandlersOrchestrator } from "./hooks/controller/useAppControllerModelingHandlersOrchestrator";
import {
  buildNetworkSummaryPanelControllerSlice,
  useInspectorContextPanelControllerSlice,
} from "./hooks/controller/useAppControllerScreenContentSlices";
import { useEntityListModel } from "./hooks/useEntityListModel";
import { useEntityFormsState } from "./hooks/useEntityFormsState";
import { useEntityRelationshipMaps } from "./hooks/useEntityRelationshipMaps";
import { useInspectorPanelVisibility } from "./hooks/useInspectorPanelVisibility";
import { useIssueNavigatorModel } from "./hooks/useIssueNavigatorModel";
import { useNetworkImportExport } from "./hooks/useNetworkImportExport";
import { useNetworkEntityCountsById } from "./hooks/useNetworkEntityCountsById";
import { useNetworkScopeFormOrchestration } from "./hooks/useNetworkScopeFormOrchestration";
import { useNetworkScopeFormState } from "./hooks/useNetworkScopeFormState";
import { useModelingFormSelectionSync } from "./hooks/useModelingFormSelectionSync";
import { useNodeDescriptions } from "./hooks/useNodeDescriptions";
import type { BeforeInstallPromptEventLike } from "./hooks/useWorkspaceShellChrome";
import { useStoreHistory } from "./hooks/useStoreHistory";
import { useUiPreferences } from "./hooks/useUiPreferences";
import { useValidationModel } from "./hooks/useValidationModel";
import { useWireEndpointDescriptions } from "./hooks/useWireEndpointDescriptions";
import { useWorkspaceShellChrome } from "./hooks/useWorkspaceShellChrome";
import { useWorkspaceNavigation } from "./hooks/useWorkspaceNavigation";
import { ModelingCatalogFormPanel } from "./components/workspace/ModelingCatalogFormPanel";
import { ModelingCatalogListPanel } from "./components/workspace/ModelingCatalogListPanel";
import { CatalogAnalysisWorkspaceContent } from "./components/workspace/CatalogAnalysisWorkspaceContent";
import { buildAppControllerNamespacedCanvasState } from "./hooks/useAppControllerNamespacedCanvasState";
import { buildAppControllerNamespacedFormsState } from "./hooks/useAppControllerNamespacedFormsState";
import {
  HISTORY_LIMIT,
  NETWORK_GRID_STEP,
  NETWORK_MAX_SCALE,
  NETWORK_MIN_SCALE,
  NETWORK_VIEW_HEIGHT,
  NETWORK_VIEW_WIDTH,
  createEntityId
} from "./lib/app-utils-shared";
import { createNodePositionMap } from "./lib/app-utils-layout";
import { buildCatalogCsvExport, parseCatalogCsvImportText } from "./lib/catalogCsv";
import { downloadCsvFile } from "./lib/csv";
import { buildNetworkSummaryBomCsvExport } from "./lib/networkSummaryBomCsv";
import {
  ONBOARDING_STEPS,
  getOnboardingStepById,
  readOnboardingAutoOpenEnabled,
  writeOnboardingAutoOpenEnabled,
  type OnboardingStepDefinition,
  type OnboardingStepId
} from "./lib/onboarding";
import type {
  AppProps,
  ImportExportStatus,
  NodePosition,
  SubScreenId
} from "./types/app-controller";
import "./styles.css";

export type { AppProps } from "./types/app-controller";

type OnboardingStepTarget = OnboardingStepDefinition["target"];

function useAppSnapshot(store: AppStore) {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

const APP_REPOSITORY_URL = "https://github.com/AlexAgo83/electrical-plan-editor";

function isSameNetworkSummaryViewState(
  left: NetworkSummaryViewState | undefined,
  right: NetworkSummaryViewState
): boolean {
  if (left === undefined) {
    return false;
  }

  return (
    left.scale === right.scale &&
    left.offset.x === right.offset.x &&
    left.offset.y === right.offset.y &&
    left.showNetworkInfoPanels === right.showNetworkInfoPanels &&
    left.showSegmentLengths === right.showSegmentLengths &&
    left.showCableCallouts === right.showCableCallouts &&
    left.showNetworkGrid === right.showNetworkGrid &&
    left.snapNodesToGrid === right.snapNodesToGrid &&
    left.lockEntityMovement === right.lockEntityMovement
  );
}

export function AppController({ store = appStore }: AppProps): ReactElement {
  const currentYear = new Date().getFullYear();
  const state = useAppSnapshot(store);
  const {
    NetworkSummaryPanel,
    AnalysisScreen,
    HomeScreen,
    ModelingScreen,
    NetworkScopeScreen,
    SettingsScreen,
    ValidationScreen,
    AnalysisWorkspaceContent,
    HomeWorkspaceContent,
    ModelingFormsColumn,
    ModelingPrimaryTables,
    ModelingSecondaryTables,
    NetworkScopeWorkspaceContent,
    SettingsWorkspaceContent,
    ValidationWorkspaceContent
  } = appUiModules;

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
  const {
    routePreviewStartNodeId,
    setRoutePreviewStartNodeId,
    routePreviewEndNodeId,
    setRoutePreviewEndNodeId,
    showNetworkInfoPanels,
    setShowNetworkInfoPanels,
    showSegmentLengths,
    setShowSegmentLengths,
    showCableCallouts,
    setShowCableCallouts,
    networkLabelStrokeMode,
    setNetworkLabelStrokeMode,
    networkLabelSizeMode,
    setNetworkLabelSizeMode,
    networkCalloutTextSize,
    setNetworkCalloutTextSize,
    networkLabelRotationDegrees,
    setNetworkLabelRotationDegrees,
    canvasResetZoomPercentInput,
    setCanvasResetZoomPercentInput
  } = useAppControllerCanvasDisplayState();
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
  const {
    newNetworkName,
    setNewNetworkName,
    newNetworkTechnicalId,
    setNewNetworkTechnicalId,
    newNetworkDescription,
    setNewNetworkDescription,
    networkFormError,
    setNetworkFormError,
    networkFormMode,
    setNetworkFormMode,
    networkFormTargetId,
    setNetworkFormTargetId,
    networkFocusRequest,
    setNetworkFocusRequest
  } = useNetworkScopeFormState();
  const {
    themeMode,
    setThemeMode,
    tableDensity,
    setTableDensity,
    tableFontSize,
    setTableFontSize,
    workspaceCurrencyCode,
    setWorkspaceCurrencyCode,
    workspaceTaxEnabled,
    setWorkspaceTaxEnabled,
    workspaceTaxRatePercent,
    setWorkspaceTaxRatePercent,
    defaultWireSectionMm2,
    setDefaultWireSectionMm2,
    defaultAutoCreateLinkedNodes,
    setDefaultAutoCreateLinkedNodes,
    defaultSortField,
    setDefaultSortField,
    defaultSortDirection,
    setDefaultSortDirection,
    defaultIdSortDirection,
    setDefaultIdSortDirection,
    networkSort,
    setNetworkSort,
    canvasDefaultShowGrid,
    setCanvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    setCanvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    setCanvasDefaultLockEntityMovement,
    canvasDefaultShowInfoPanels,
    setCanvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentLengths,
    setCanvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts,
    setCanvasDefaultShowCableCallouts,
    canvasDefaultLabelStrokeMode,
    setCanvasDefaultLabelStrokeMode,
    canvasDefaultLabelSizeMode,
    setCanvasDefaultLabelSizeMode,
    canvasDefaultCalloutTextSize,
    setCanvasDefaultCalloutTextSize,
    canvasDefaultLabelRotationDegrees,
    setCanvasDefaultLabelRotationDegrees,
    canvasPngExportIncludeBackground,
    setCanvasPngExportIncludeBackground,
    showShortcutHints,
    setShowShortcutHints,
    keyboardShortcutsEnabled,
    setKeyboardShortcutsEnabled,
    showFloatingInspectorPanel,
    setShowFloatingInspectorPanel,
    workspacePanelsLayoutMode,
    setWorkspacePanelsLayoutMode,
    preferencesHydrated,
    setPreferencesHydrated
  } = useAppControllerPreferencesState();
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
  const [headerOffsetPx, setHeaderOffsetPx] = useState(96);
  const panStartRef = useRef<{
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const undoActionRef = useRef<() => void>(() => {});
  const redoActionRef = useRef<() => void>(() => {});
  const fitNetworkToContentRef = useRef<() => void>(() => {});
  const previousValidationIssueRef = useRef<() => void>(() => {});
  const nextValidationIssueRef = useRef<() => void>(() => {});
  const headerBlockRef = useRef<HTMLElement | null>(null);
  const navigationDrawerRef = useRef<HTMLDivElement | null>(null);
  const navigationToggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const operationsPanelRef = useRef<HTMLDivElement | null>(null);
  const operationsButtonRef = useRef<HTMLButtonElement | null>(null);
  const deferredInstallPromptRef = useRef<BeforeInstallPromptEventLike | null>(null);
  const onboardingAutoOpenAttemptedRef = useRef(false);
  const hasAppliedPerNetworkViewRestoreRef = useRef(false);
  const skipNextPerNetworkViewPersistRef = useRef(false);

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
    selectedSubScreen,
    selectedConnectorOccupiedCount,
    selectedSpliceOccupiedCount
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
  const [onboardingModalMode, setOnboardingModalMode] = useState<"full" | "single">("full");
  const [onboardingStepIndex, setOnboardingStepIndex] = useState(0);
  const [onboardingSingleStepId, setOnboardingSingleStepId] = useState<OnboardingStepId>("networkScope");
  const [onboardingSingleStepTargetOverride, setOnboardingSingleStepTargetOverride] = useState<OnboardingStepTarget | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingAutoOpenEnabled, setOnboardingAutoOpenEnabled] = useState<boolean>(() => readOnboardingAutoOpenEnabled());
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
  const connectorIdExcludedFromUniqueness =
    forms.connector.formMode === "edit" ? forms.connector.editingId ?? undefined : undefined;
  const connectorTechnicalIdAlreadyUsed =
    forms.connector.technicalId.trim().length > 0 &&
    selectConnectorTechnicalIdTaken(state, forms.connector.technicalId.trim(), connectorIdExcludedFromUniqueness);

  const spliceIdExcludedFromUniqueness =
    forms.splice.formMode === "edit" ? forms.splice.editingId ?? undefined : undefined;
  const spliceTechnicalIdAlreadyUsed =
    forms.splice.technicalId.trim().length > 0 &&
    selectSpliceTechnicalIdTaken(state, forms.splice.technicalId.trim(), spliceIdExcludedFromUniqueness);
  const catalogItemIdExcludedFromUniqueness =
    formsState.catalogFormMode === "edit" ? formsState.editingCatalogItemId ?? undefined : undefined;
  const catalogManufacturerReferenceAlreadyUsed =
    formsState.catalogManufacturerReference.trim().length > 0 &&
    selectCatalogManufacturerReferenceTaken(
      state,
      formsState.catalogManufacturerReference.trim(),
      catalogItemIdExcludedFromUniqueness
    );
  const wireIdExcludedFromUniqueness =
    forms.wire.formMode === "edit" ? forms.wire.editingId ?? undefined : undefined;
  const wireTechnicalIdAlreadyUsed =
    forms.wire.technicalId.trim().length > 0 &&
    selectWireTechnicalIdTaken(state, forms.wire.technicalId.trim(), wireIdExcludedFromUniqueness);
  const networkTechnicalIdAlreadyUsed =
    newNetworkTechnicalId.trim().length > 0 &&
    selectNetworkTechnicalIdTaken(
      state,
      newNetworkTechnicalId.trim(),
      networkFormMode === "edit" ? networkFormTargetId ?? undefined : undefined
    );

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
    headerOffsetPx,
    canvasResetZoomPercentInput
  });

  const { describeWireEndpoint, describeWireEndpointId } = useWireEndpointDescriptions({
    connectorMap,
    spliceMap
  });

  const setOnboardingAutoOpenEnabledPersisted = useCallback((enabled: boolean) => {
    setOnboardingAutoOpenEnabled(enabled);
    writeOnboardingAutoOpenEnabled(enabled);
  }, []);

  const openFullOnboarding = useCallback(() => {
    setOnboardingModalMode("full");
    setOnboardingStepIndex(0);
    setOnboardingSingleStepTargetOverride(null);
    setIsOnboardingOpen(true);
  }, []);

  const openSingleStepOnboarding = useCallback((stepId: OnboardingStepId, targetOverride?: OnboardingStepTarget) => {
    setOnboardingModalMode("single");
    setOnboardingSingleStepId(stepId);
    setOnboardingSingleStepTargetOverride(targetOverride ?? null);
    setIsOnboardingOpen(true);
  }, []);

  useEffect(() => {
    if (onboardingAutoOpenAttemptedRef.current) {
      return;
    }
    onboardingAutoOpenAttemptedRef.current = true;
    if (!onboardingAutoOpenEnabled) {
      return;
    }
    openFullOnboarding();
  }, [onboardingAutoOpenEnabled, openFullOnboarding]);

  const focusOnboardingTargetPanel = useCallback((panelSelector: string) => {
    if (typeof document === "undefined") {
      return;
    }

    let attempts = 0;
    const tryFocus = () => {
      const panel = document.querySelector(panelSelector);
      if (panel instanceof HTMLElement) {
        panel.scrollIntoView({ block: "start", behavior: "smooth" });
        const focusTarget =
          panel.querySelector<HTMLElement>("button, [tabindex], input, select, textarea") ??
          panel.querySelector<HTMLElement>("h2");
        focusTarget?.focus?.();
        return;
      }

      attempts += 1;
      if (attempts < 10 && typeof window !== "undefined") {
        window.requestAnimationFrame(tryFocus);
      }
    };

    if (typeof window !== "undefined") {
      window.requestAnimationFrame(tryFocus);
    } else {
      tryFocus();
    }
  }, []);

  const activeOnboardingStep =
    onboardingModalMode === "full" ? ONBOARDING_STEPS[onboardingStepIndex] : getOnboardingStepById(onboardingSingleStepId);
  const activeOnboardingPrimaryTarget =
    onboardingModalMode === "single" && onboardingSingleStepTargetOverride !== null
      ? onboardingSingleStepTargetOverride
      : activeOnboardingStep?.target;

  const isOnboardingStepAlreadyInContext =
    activeOnboardingPrimaryTarget !== undefined &&
    activeScreen === activeOnboardingPrimaryTarget.screen &&
    (activeOnboardingPrimaryTarget.subScreen === undefined || activeSubScreen === activeOnboardingPrimaryTarget.subScreen);

  const onboardingTargetActionLabel =
    activeOnboardingPrimaryTarget === undefined
      ? "Open target"
      : isOnboardingStepAlreadyInContext
        ? `Scroll to ${activeOnboardingPrimaryTarget.panelLabel}`
        : `Open ${activeOnboardingPrimaryTarget.panelLabel}`;

  const openOnboardingTarget = useCallback((target: OnboardingStepTarget) => {
    if (target.screen === "networkScope") {
      setActiveScreen("networkScope");
    } else {
      setActiveScreen("modeling");
      if (target.subScreen !== undefined) {
        setActiveSubScreen(target.subScreen);
      }
    }

    focusOnboardingTargetPanel(target.panelSelector);
  }, [focusOnboardingTargetPanel, setActiveScreen, setActiveSubScreen]);

  const handleOnboardingOpenTarget = useCallback(() => {
    if (activeOnboardingPrimaryTarget === undefined) {
      return;
    }
    openOnboardingTarget(activeOnboardingPrimaryTarget);
  }, [activeOnboardingPrimaryTarget, openOnboardingTarget]);

  const onboardingConnectorSpliceTargetActions =
    activeOnboardingStep?.id === "connectorSpliceLibrary"
      ? (() => {
          const connectorsTarget: OnboardingStepTarget = {
            screen: "modeling",
            subScreen: "connector",
            panelSelector: '[data-onboarding-panel="modeling-connectors"]',
            panelLabel: "Connectors"
          };
          const splicesTarget: OnboardingStepTarget = {
            screen: "modeling",
            subScreen: "splice",
            panelSelector: '[data-onboarding-panel="modeling-splices"]',
            panelLabel: "Splices"
          };
          const primaryIsSplices = activeOnboardingPrimaryTarget?.subScreen === "splice";
          const primaryTarget = primaryIsSplices ? splicesTarget : connectorsTarget;
          const secondaryTarget = primaryIsSplices ? connectorsTarget : splicesTarget;
          const isPrimaryAlreadyInContext =
            activeScreen === primaryTarget.screen &&
            (primaryTarget.subScreen === undefined || activeSubScreen === primaryTarget.subScreen);
          const isSecondaryAlreadyInContext =
            activeScreen === secondaryTarget.screen &&
            (secondaryTarget.subScreen === undefined || activeSubScreen === secondaryTarget.subScreen);
          return [
            {
              label: isPrimaryAlreadyInContext ? `Scroll to ${primaryTarget.panelLabel}` : `Open ${primaryTarget.panelLabel}`,
              onClick: () => openOnboardingTarget(primaryTarget)
            },
            {
              label: isSecondaryAlreadyInContext ? `Scroll to ${secondaryTarget.panelLabel}` : `Open ${secondaryTarget.panelLabel}`,
              onClick: () => openOnboardingTarget(secondaryTarget)
            }
          ];
        })()
      : null;

  const onboardingCatalogTargetActions =
    activeOnboardingStep?.id === "catalog"
      ? (() => {
          const catalogListTarget: OnboardingStepTarget = {
            screen: "modeling",
            subScreen: "catalog",
            panelSelector: '[data-onboarding-panel="modeling-catalog"]',
            panelLabel: "Catalog"
          };
          const isListInContext =
            activeScreen === catalogListTarget.screen &&
            activeSubScreen === catalogListTarget.subScreen;
          return [
            {
              label: isListInContext ? "Scroll to Catalog" : "Open Catalog",
              onClick: () => openOnboardingTarget(catalogListTarget)
            }
          ];
        })()
      : null;

  const onboardingTargetActions = activeOnboardingStep === undefined
    ? []
    : activeOnboardingStep.id === "catalog"
      ? (onboardingCatalogTargetActions ?? [])
    : activeOnboardingStep.id === "connectorSpliceLibrary"
      ? (onboardingConnectorSpliceTargetActions ?? [])
      : [{ label: onboardingTargetActionLabel, onClick: handleOnboardingOpenTarget }];

  const handleOnboardingNext = useCallback(() => {
    if (onboardingModalMode !== "full") {
      setIsOnboardingOpen(false);
      return;
    }

    setOnboardingStepIndex((current) => {
      if (current >= ONBOARDING_STEPS.length - 1) {
        setIsOnboardingOpen(false);
        return current;
      }
      return current + 1;
    });
  }, [onboardingModalMode]);

  useEffect(() => {
    setManualNodePositions({} as Record<NodeId, NodePosition>);
  }, [activeNetworkId, setManualNodePositions]);

  useEffect(() => {
    const validNodeIds = new Set(nodes.map((node) => node.id));
    setManualNodePositions((previous) => {
      let changed = false;
      const next = {} as Record<NodeId, NodePosition>;
      for (const nodeId of Object.keys(previous) as NodeId[]) {
        const position = previous[nodeId];
        if (position !== undefined && validNodeIds.has(nodeId)) {
          next[nodeId] = position;
          continue;
        }

        changed = true;
      }

      return changed ? next : previous;
    });
  }, [nodes, setManualNodePositions]);

  useEffect(() => {
    if (interactionMode !== "addNode") {
      setPendingNewNodePosition(null);
    }
  }, [interactionMode, setPendingNewNodePosition]);

  useEffect(() => {
    setWireForcedRouteInput(selectedWireRouteInputValue);
  }, [setWireForcedRouteInput, selectedWireId, selectedWireRouteInputValue]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let animationFrameId = 0;
    const refreshHeaderOffset = () => {
      animationFrameId = 0;
      const headerRect = headerBlockRef.current?.getBoundingClientRect();
      if (headerRect === undefined) {
        return;
      }

      const nextOffset = Math.max(0, Math.ceil(headerRect.bottom + 6));
      setHeaderOffsetPx((current) => (current === nextOffset ? current : nextOffset));
    };
    const scheduleRefresh = () => {
      if (animationFrameId !== 0) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(refreshHeaderOffset);
    };

    scheduleRefresh();
    window.addEventListener("resize", scheduleRefresh);
    window.addEventListener("scroll", scheduleRefresh, { passive: true });

    const resizeObserver =
      typeof ResizeObserver === "undefined" || headerBlockRef.current === null
        ? null
        : new ResizeObserver(scheduleRefresh);

    if (resizeObserver !== null && headerBlockRef.current !== null) {
      resizeObserver.observe(headerBlockRef.current);
    }

    return () => {
      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("resize", scheduleRefresh);
      window.removeEventListener("scroll", scheduleRefresh);
      resizeObserver?.disconnect();
    };
  }, []);

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
  useUiPreferences({
    networkMinScale: NETWORK_MIN_SCALE,
    networkMaxScale: NETWORK_MAX_SCALE,
    themeMode,
    tableDensity,
    tableFontSize,
    workspaceCurrencyCode,
    workspaceTaxEnabled,
    workspaceTaxRatePercent,
    defaultWireSectionMm2,
    defaultAutoCreateLinkedNodes,
    defaultSortField,
    defaultSortDirection,
    defaultIdSortDirection,
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    canvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts,
    canvasDefaultLabelStrokeMode,
    canvasDefaultLabelSizeMode,
    canvasDefaultCalloutTextSize,
    canvasDefaultLabelRotationDegrees,
    canvasPngExportIncludeBackground,
    canvasResetZoomPercentInput,
    showShortcutHints,
    keyboardShortcutsEnabled,
    showFloatingInspectorPanel,
    workspacePanelsLayoutMode,
    preferencesHydrated,
    setTableDensity,
    setTableFontSize,
    setWorkspaceCurrencyCode,
    setWorkspaceTaxEnabled,
    setWorkspaceTaxRatePercent,
    setDefaultWireSectionMm2,
    setDefaultAutoCreateLinkedNodes,
    setDefaultSortField,
    setDefaultSortDirection,
    setDefaultIdSortDirection,
    setConnectorSort,
    setSpliceSort,
    setWireSort,
    setNetworkSort,
    setConnectorSynthesisSort,
    setSpliceSynthesisSort,
    setNodeIdSortDirection,
    setSegmentIdSortDirection,
    setCanvasDefaultShowGrid,
    setCanvasDefaultSnapToGrid,
    setCanvasDefaultLockEntityMovement,
    setCanvasDefaultShowInfoPanels,
    setCanvasDefaultShowSegmentLengths,
    setCanvasDefaultShowCableCallouts,
    setCanvasDefaultLabelStrokeMode,
    setCanvasDefaultLabelSizeMode,
    setCanvasDefaultCalloutTextSize,
    setCanvasDefaultLabelRotationDegrees,
    setCanvasPngExportIncludeBackground,
    setShowNetworkGrid,
    setSnapNodesToGrid,
    setLockEntityMovement,
    setShowNetworkInfoPanels,
    setShowSegmentLengths,
    setShowCableCallouts,
    setNetworkLabelStrokeMode,
    setNetworkLabelSizeMode,
    setNetworkCalloutTextSize,
    setNetworkLabelRotationDegrees,
    setCanvasResetZoomPercentInput,
    setNetworkScale,
    setNetworkOffset,
    setShowShortcutHints,
    setKeyboardShortcutsEnabled,
    setShowFloatingInspectorPanel,
    setWorkspacePanelsLayoutMode,
    setThemeMode,
    setPreferencesHydrated
  });

  useEffect(() => {
    store.dispatch(appActions.setThemeMode(themeMode));
  }, [store, themeMode]);

  useEffect(() => {
    setNetworkLabelSizeMode(canvasDefaultLabelSizeMode);
  }, [canvasDefaultLabelSizeMode, setNetworkLabelSizeMode]);

  useEffect(() => {
    setNetworkCalloutTextSize(canvasDefaultCalloutTextSize);
  }, [canvasDefaultCalloutTextSize, setNetworkCalloutTextSize]);

  useEffect(() => {
    setNetworkLabelRotationDegrees(canvasDefaultLabelRotationDegrees);
  }, [canvasDefaultLabelRotationDegrees, setNetworkLabelRotationDegrees]);
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
    setValidationCategoryFilter,
    setValidationSeverityFilter,
    setValidationSearchQuery,
    validationIssues,
    orderedValidationIssues,
    visibleValidationIssues,
    validationErrorCount,
    validationWarningCount,
    getValidationIssueByCursor,
    getFocusedValidationIssueByCursor,
    setValidationIssueCursorFromIssue
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

  useEffect(() => {
    hasAppliedPerNetworkViewRestoreRef.current = false;
    skipNextPerNetworkViewPersistRef.current = false;

    if (!preferencesHydrated) {
      return;
    }

    if (activeNetworkId === null) {
      hasAppliedPerNetworkViewRestoreRef.current = true;
      return;
    }

    const clampedFallbackScale = Math.max(NETWORK_MIN_SCALE, Math.min(NETWORK_MAX_SCALE, configuredResetScale));
    const nextScaleRaw = activeNetworkSummaryViewState?.scale ?? clampedFallbackScale;
    const nextScale = Math.max(NETWORK_MIN_SCALE, Math.min(NETWORK_MAX_SCALE, Number.isFinite(nextScaleRaw) ? nextScaleRaw : clampedFallbackScale));
    const nextOffset = activeNetworkSummaryViewState?.offset ?? { x: 0, y: 0 };
    const nextShowInfoPanels = activeNetworkSummaryViewState?.showNetworkInfoPanels ?? canvasDefaultShowInfoPanels;
    const nextShowSegmentLengths = activeNetworkSummaryViewState?.showSegmentLengths ?? canvasDefaultShowSegmentLengths;
    const nextShowCableCallouts = activeNetworkSummaryViewState?.showCableCallouts ?? canvasDefaultShowCableCallouts;
    const nextShowGrid = activeNetworkSummaryViewState?.showNetworkGrid ?? canvasDefaultShowGrid;
    const nextSnapToGrid = activeNetworkSummaryViewState?.snapNodesToGrid ?? canvasDefaultSnapToGrid;
    const nextLockEntityMovement = activeNetworkSummaryViewState?.lockEntityMovement ?? canvasDefaultLockEntityMovement;
    let didScheduleRestore = false;

    if (networkScale !== nextScale) {
      didScheduleRestore = true;
      setNetworkScale(nextScale);
    }
    if (networkOffset.x !== nextOffset.x || networkOffset.y !== nextOffset.y) {
      didScheduleRestore = true;
      setNetworkOffset({ x: nextOffset.x, y: nextOffset.y });
    }
    if (showNetworkInfoPanels !== nextShowInfoPanels) {
      didScheduleRestore = true;
      setShowNetworkInfoPanels(nextShowInfoPanels);
    }
    if (showSegmentLengths !== nextShowSegmentLengths) {
      didScheduleRestore = true;
      setShowSegmentLengths(nextShowSegmentLengths);
    }
    if (showCableCallouts !== nextShowCableCallouts) {
      didScheduleRestore = true;
      setShowCableCallouts(nextShowCableCallouts);
    }
    if (showNetworkGrid !== nextShowGrid) {
      didScheduleRestore = true;
      setShowNetworkGrid(nextShowGrid);
    }
    if (snapNodesToGrid !== nextSnapToGrid) {
      didScheduleRestore = true;
      setSnapNodesToGrid(nextSnapToGrid);
    }
    if (lockEntityMovement !== nextLockEntityMovement) {
      didScheduleRestore = true;
      setLockEntityMovement(nextLockEntityMovement);
    }

    skipNextPerNetworkViewPersistRef.current = didScheduleRestore;
    hasAppliedPerNetworkViewRestoreRef.current = true;
    // Intentionally reacts to network/preference changes only; current local view flags are read to decide whether restore is needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeNetworkId,
    activeNetworkSummaryViewState,
    preferencesHydrated,
    configuredResetScale,
    canvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentLengths,
    canvasDefaultShowCableCallouts,
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultLockEntityMovement,
    setNetworkScale,
    setNetworkOffset,
    setShowNetworkInfoPanels,
    setShowSegmentLengths,
    setShowCableCallouts,
    setShowNetworkGrid,
    setSnapNodesToGrid,
    setLockEntityMovement
  ]);

  useEffect(() => {
    if (!preferencesHydrated || activeNetworkId === null || !hasAppliedPerNetworkViewRestoreRef.current || isPanningNetwork) {
      return;
    }
    if (skipNextPerNetworkViewPersistRef.current) {
      skipNextPerNetworkViewPersistRef.current = false;
      return;
    }

    const clampedScale = Math.max(NETWORK_MIN_SCALE, Math.min(NETWORK_MAX_SCALE, networkScale));
    const nextViewState: NetworkSummaryViewState = {
      scale: clampedScale,
      offset: {
        x: networkOffset.x,
        y: networkOffset.y
      },
      showNetworkInfoPanels,
      showSegmentLengths,
      showCableCallouts,
      showNetworkGrid,
      snapNodesToGrid,
      lockEntityMovement
    };

    if (isSameNetworkSummaryViewState(activeNetworkSummaryViewState, nextViewState)) {
      return;
    }

    dispatchAction(appActions.setNetworkSummaryViewState(activeNetworkId, nextViewState), { trackHistory: false });
  }, [
    activeNetworkId,
    activeNetworkSummaryViewState,
    preferencesHydrated,
    networkScale,
    networkOffset.x,
    networkOffset.y,
    showNetworkInfoPanels,
    showSegmentLengths,
    showCableCallouts,
    showNetworkGrid,
    snapNodesToGrid,
    lockEntityMovement,
    isPanningNetwork,
    dispatchAction
  ]);

  const handleRegenerateLayout = useCallback(() => {
    if (nodes.length === 0) {
      return;
    }

    if (
      Object.keys(persistedNodePositions).length > 0 &&
      typeof window !== "undefined" &&
      typeof window.confirm === "function"
    ) {
      const shouldRegenerate = window.confirm(
        "Regenerate 2D layout for this network? Existing manual positions will be replaced."
      );
      if (!shouldRegenerate) {
        return;
      }
    }

    setManualNodePositions({} as Record<NodeId, NodePosition>);
    dispatchAction(
      appActions.setNodePositions(
        createNodePositionMap(nodes, segments, {
          snapToGrid: snapNodesToGrid,
          gridStep: NETWORK_GRID_STEP
        })
      )
    );
  }, [dispatchAction, nodes, persistedNodePositions, segments, setManualNodePositions, snapNodesToGrid]);
  const {
    importFileInputRef,
    selectedExportNetworkIds,
    importExportStatus,
    lastImportSummary,
    toggleSelectedExportNetwork,
    handleExportNetworks,
    handleOpenImportPicker,
    handleImportFileChange
  } = useNetworkImportExport({
    store,
    networks,
    activeNetworkId,
    dispatchAction
  });
  const catalogCsvImportFileInputRef = useRef<HTMLInputElement | null>(null);
  const [catalogCsvImportExportStatus, setCatalogCsvImportExportStatus] = useState<ImportExportStatus | null>(null);
  const [catalogCsvLastImportSummaryLine, setCatalogCsvLastImportSummaryLine] = useState<string | null>(null);

  function handleExportCatalogCsv(): void {
    if (catalogItems.length === 0) {
      setCatalogCsvImportExportStatus({
        kind: "failed",
        message: "No catalog item available for export."
      });
      return;
    }

    const { headers, rows } = buildCatalogCsvExport(catalogItems);
    downloadCsvFile("Catalog Export", headers, rows);
    setCatalogCsvImportExportStatus({
      kind: "success",
      message: `Exported ${rows.length} catalog item(s).`
    });
  }

  function handleOpenCatalogCsvImportPicker(): void {
    catalogCsvImportFileInputRef.current?.click();
  }

  async function handleCatalogCsvImportFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (file === undefined) {
      return;
    }

    const resetInput = () => {
      event.target.value = "";
    };

    let rawCsv: string;
    try {
      rawCsv = await file.text();
    } catch {
      setCatalogCsvImportExportStatus({
        kind: "failed",
        message: "Unable to read selected CSV file."
      });
      resetInput();
      return;
    }

    const parsed = parseCatalogCsvImportText(rawCsv);
    const warningCount = parsed.issues.filter((issue) => issue.kind === "warning").length;
    const errorIssues = parsed.issues.filter((issue) => issue.kind === "error");
    if (errorIssues.length > 0) {
      const firstError = errorIssues[0];
      setCatalogCsvImportExportStatus({
        kind: "failed",
        message:
          firstError === undefined
            ? "Catalog CSV import failed."
            : `CSV row ${firstError.rowNumber}: ${firstError.message}`
      });
      setCatalogCsvLastImportSummaryLine(
        `Catalog CSV import aborted: ${parsed.rows.length} parsed rows / ${warningCount} warnings / ${errorIssues.length} errors.`
      );
      resetInput();
      return;
    }

    if (parsed.rows.length === 0) {
      setCatalogCsvImportExportStatus({
        kind: "failed",
        message: "CSV contains no catalog data rows."
      });
      setCatalogCsvLastImportSummaryLine(null);
      resetInput();
      return;
    }

    const currentState = store.getState();
    const currentCatalogItems = selectCatalogItems(currentState);
    if (
      currentCatalogItems.length > 0 &&
      typeof window !== "undefined" &&
      typeof window.confirm === "function" &&
      !window.confirm(
        `Import ${parsed.rows.length} catalog row(s) into the current catalog? Existing items are matched by manufacturer reference.`
      )
    ) {
      setCatalogCsvImportExportStatus({
        kind: "failed",
        message: "Catalog CSV import canceled."
      });
      resetInput();
      return;
    }

    const existingByManufacturerReference = new Map(
      currentCatalogItems.map((item) => [item.manufacturerReference.trim(), item] as const)
    );

    let nextState =
      currentState.ui.lastError === null
        ? currentState
        : {
            ...currentState,
            ui: {
              ...currentState.ui,
              lastError: null
            }
          };
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const existing = existingByManufacturerReference.get(row.manufacturerReference);
      const nextCatalogItemId = existing?.id ?? (createEntityId("catalog") as CatalogItemId);
      const candidateState = appReducer(
        nextState,
        appActions.upsertCatalogItem({
          ...(existing ?? {}),
          id: nextCatalogItemId,
          manufacturerReference: row.manufacturerReference,
          connectionCount: row.connectionCount,
          name: row.name,
          unitPriceExclTax: row.unitPriceExclTax,
          url: row.url
        })
      );

      if (candidateState.ui.lastError !== null) {
        setCatalogCsvImportExportStatus({
          kind: "failed",
          message: `Catalog import failed on '${row.manufacturerReference}': ${candidateState.ui.lastError}`
        });
        setCatalogCsvLastImportSummaryLine(
          `Catalog CSV import aborted after ${createdCount + updatedCount} row(s); ${warningCount} warnings in file.`
        );
        resetInput();
        return;
      }

      if (existing === undefined) {
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
      nextState = candidateState;
    }

    replaceStateWithHistory(nextState);
    setActiveScreen("modeling");
    setActiveSubScreen("catalog");
    setCatalogCsvImportExportStatus({
      kind: warningCount > 0 ? "partial" : "success",
      message: `Imported ${parsed.rows.length} catalog row(s): ${createdCount} created / ${updatedCount} updated.`
    });
    setCatalogCsvLastImportSummaryLine(
      `Last catalog CSV import (${file.name}): ${parsed.rows.length} rows, ${warningCount} warnings, ${errorIssues.length} errors.`
    );
    resetInput();
  }

  const {
    handleCreateNetwork,
    handleSelectNetwork,
    handleUpdateActiveNetwork,
    handleDuplicateNetwork,
    handleDeleteNetwork,
    handleRecreateSampleNetwork,
    handleRecreateValidationIssuesSampleNetwork,
    handleRecreateCatalogValidationIssuesSampleNetwork,
    handleRecreatePricingBomQaSampleNetwork,
    handleResetSampleNetwork,
    resetNetworkViewToConfiguredScale,
    fitNetworkToContent,
    applyListSortDefaults,
    applyCanvasDefaultsNow,
    resetWorkspacePreferencesToDefaults
  } = useAppControllerWorkspaceHandlersAssembly({
    base: {
      store,
      networks,
      dispatchAction,
      replaceStateWithHistory
    },
    networkForm: {
      newNetworkName,
      setNewNetworkName,
      newNetworkTechnicalId,
      setNewNetworkTechnicalId,
      newNetworkDescription,
      setNewNetworkDescription,
      setNetworkFormError
    },
    workspace: {
      isCurrentWorkspaceEmpty,
      hasBuiltInSampleState,
      nodes,
      networkNodePositions,
      connectorMap,
      spliceMap,
      configuredResetScale,
      networkScale,
      networkOffset,
      setNetworkScale,
      setNetworkOffset
    },
    canvasDefaults: {
      canvasDefaultShowGrid,
      canvasDefaultSnapToGrid,
      canvasDefaultLockEntityMovement,
      canvasDefaultShowInfoPanels,
      canvasDefaultShowSegmentLengths,
      canvasDefaultShowCableCallouts,
      canvasDefaultLabelStrokeMode,
      canvasDefaultLabelSizeMode,
      canvasDefaultCalloutTextSize,
      canvasDefaultLabelRotationDegrees,
      showCableCallouts,
      networkCalloutTextSize,
      setShowNetworkGrid,
      setSnapNodesToGrid,
      setLockEntityMovement,
      setShowNetworkInfoPanels,
      setShowSegmentLengths,
      setShowCableCallouts,
      setNetworkLabelStrokeMode,
      setNetworkLabelSizeMode,
      setNetworkCalloutTextSize,
      setNetworkLabelRotationDegrees
    },
    sortDefaults: {
      defaultSortField,
      defaultSortDirection,
      defaultIdSortDirection
    },
    sortSetters: {
      setConnectorSort,
      setSpliceSort,
      setWireSort,
      setConnectorSynthesisSort,
      setSpliceSynthesisSort,
      setNetworkSort,
      setNodeIdSortDirection,
      setSegmentIdSortDirection
    },
    preferenceSetters: {
      setThemeMode,
      setTableDensity,
      setTableFontSize,
      setWorkspaceCurrencyCode,
      setWorkspaceTaxEnabled,
      setWorkspaceTaxRatePercent,
      setDefaultWireSectionMm2,
      setDefaultAutoCreateLinkedNodes,
      setDefaultSortField,
      setDefaultSortDirection,
      setDefaultIdSortDirection,
      setCanvasDefaultShowGrid,
      setCanvasDefaultSnapToGrid,
      setCanvasDefaultLockEntityMovement,
      setCanvasDefaultShowInfoPanels,
      setCanvasDefaultShowSegmentLengths,
      setCanvasDefaultShowCableCallouts,
      setCanvasDefaultLabelStrokeMode,
      setCanvasDefaultLabelSizeMode,
      setCanvasDefaultCalloutTextSize,
      setCanvasDefaultLabelRotationDegrees,
      setCanvasResetZoomPercentInput,
      setCanvasPngExportIncludeBackground,
      setShowShortcutHints,
      setKeyboardShortcutsEnabled,
      setShowFloatingInspectorPanel,
      setWorkspacePanelsLayoutMode
    }
  });
  const {
    handleOpenCreateNetworkForm,
    handleOpenEditNetworkForm,
    handleCloseNetworkForm,
    handleSubmitNetworkForm
  } = useNetworkScopeFormOrchestration({
    store,
    networks,
    activeNetworkId,
    isNetworkScopeScreen,
    networksById: state.networks.byId,
    setNewNetworkName,
    setNewNetworkTechnicalId,
    setNewNetworkDescription,
    setNetworkFormError,
    networkFormMode,
    setNetworkFormMode,
    networkFormTargetId,
    setNetworkFormTargetId,
    setNetworkFocusRequest,
    handleCreateNetwork,
    handleUpdateActiveNetwork
  });

  useEffect(() => {
    undoActionRef.current = handleUndo;
    redoActionRef.current = handleRedo;
    fitNetworkToContentRef.current = fitNetworkToContent;
    previousValidationIssueRef.current = () => {
      if (activeScreenRef.current === "validation") {
        moveVisibleValidationIssueCursor(-1);
        return;
      }
      moveValidationIssueCursor(-1);
    };
    nextValidationIssueRef.current = () => {
      if (activeScreenRef.current === "validation") {
        moveVisibleValidationIssueCursor(1);
        return;
      }
      moveValidationIssueCursor(1);
    };
  });

  const { describeNode, nodeLabelById } = useNodeDescriptions(nodes, connectorMap, spliceMap);

  const modelingHandlers = useAppControllerModelingHandlersOrchestrator({
    store,
    state,
    dispatchAction,
    connectorFormMode: formsState.connectorFormMode,
    setConnectorFormMode: formsState.setConnectorFormMode,
    editingConnectorId: formsState.editingConnectorId,
    setEditingConnectorId: formsState.setEditingConnectorId,
    connectorName: formsState.connectorName,
    setConnectorName: formsState.setConnectorName,
    connectorTechnicalId: formsState.connectorTechnicalId,
    setConnectorTechnicalId: formsState.setConnectorTechnicalId,
    connectorCatalogItemId: formsState.connectorCatalogItemId,
    setConnectorCatalogItemId: formsState.setConnectorCatalogItemId,
    connectorManufacturerReference: formsState.connectorManufacturerReference,
    setConnectorManufacturerReference: formsState.setConnectorManufacturerReference,
    connectorAutoCreateLinkedNode: formsState.connectorAutoCreateLinkedNode,
    setConnectorAutoCreateLinkedNode: formsState.setConnectorAutoCreateLinkedNode,
    cavityCount: formsState.cavityCount,
    setCavityCount: formsState.setCavityCount,
    setConnectorFormError: formsState.setConnectorFormError,
    cavityIndexInput: formsState.cavityIndexInput,
    connectorOccupantRefInput: formsState.connectorOccupantRefInput,
    spliceFormMode: formsState.spliceFormMode,
    setSpliceFormMode: formsState.setSpliceFormMode,
    editingSpliceId: formsState.editingSpliceId,
    setEditingSpliceId: formsState.setEditingSpliceId,
    spliceName: formsState.spliceName,
    setSpliceName: formsState.setSpliceName,
    spliceTechnicalId: formsState.spliceTechnicalId,
    setSpliceTechnicalId: formsState.setSpliceTechnicalId,
    spliceCatalogItemId: formsState.spliceCatalogItemId,
    setSpliceCatalogItemId: formsState.setSpliceCatalogItemId,
    spliceManufacturerReference: formsState.spliceManufacturerReference,
    setSpliceManufacturerReference: formsState.setSpliceManufacturerReference,
    spliceAutoCreateLinkedNode: formsState.spliceAutoCreateLinkedNode,
    setSpliceAutoCreateLinkedNode: formsState.setSpliceAutoCreateLinkedNode,
    portCount: formsState.portCount,
    setPortCount: formsState.setPortCount,
    setSpliceFormError: formsState.setSpliceFormError,
    portIndexInput: formsState.portIndexInput,
    spliceOccupantRefInput: formsState.spliceOccupantRefInput,
    nodeFormMode: formsState.nodeFormMode,
    setNodeFormMode: formsState.setNodeFormMode,
    editingNodeId: formsState.editingNodeId,
    setEditingNodeId: formsState.setEditingNodeId,
    nodeIdInput: formsState.nodeIdInput,
    setNodeIdInput: formsState.setNodeIdInput,
    nodeKind: formsState.nodeKind,
    setNodeKind: formsState.setNodeKind,
    nodeConnectorId: formsState.nodeConnectorId,
    setNodeConnectorId: formsState.setNodeConnectorId,
    nodeSpliceId: formsState.nodeSpliceId,
    setNodeSpliceId: formsState.setNodeSpliceId,
    nodeLabel: formsState.nodeLabel,
    setNodeLabel: formsState.setNodeLabel,
    setNodeFormError: formsState.setNodeFormError,
    pendingNewNodePosition,
    setPendingNewNodePosition,
    onNodeIdRenamed: (fromId, toId) => {
      setRoutePreviewStartNodeId((current) => (current === fromId ? toId : current));
      setRoutePreviewEndNodeId((current) => (current === fromId ? toId : current));
    },
    segmentFormMode: formsState.segmentFormMode,
    setSegmentFormMode: formsState.setSegmentFormMode,
    editingSegmentId: formsState.editingSegmentId,
    setEditingSegmentId: formsState.setEditingSegmentId,
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
    setSegmentFormError: formsState.setSegmentFormError,
    wireFormMode: formsState.wireFormMode,
    setWireFormMode: formsState.setWireFormMode,
    editingWireId: formsState.editingWireId,
    setEditingWireId: formsState.setEditingWireId,
    wireName: formsState.wireName,
    setWireName: formsState.setWireName,
    wireTechnicalId: formsState.wireTechnicalId,
    setWireTechnicalId: formsState.setWireTechnicalId,
    wireSectionMm2: formsState.wireSectionMm2,
    setWireSectionMm2: formsState.setWireSectionMm2,
    wireColorMode: formsState.wireColorMode,
    setWireColorMode: formsState.setWireColorMode,
    wirePrimaryColorId: formsState.wirePrimaryColorId,
    setWirePrimaryColorId: formsState.setWirePrimaryColorId,
    wireSecondaryColorId: formsState.wireSecondaryColorId,
    setWireSecondaryColorId: formsState.setWireSecondaryColorId,
    wireFreeColorLabel: formsState.wireFreeColorLabel,
    setWireFreeColorLabel: formsState.setWireFreeColorLabel,
    wireEndpointAConnectionReference: formsState.wireEndpointAConnectionReference,
    setWireEndpointAConnectionReference: formsState.setWireEndpointAConnectionReference,
    wireEndpointASealReference: formsState.wireEndpointASealReference,
    setWireEndpointASealReference: formsState.setWireEndpointASealReference,
    wireEndpointAKind: formsState.wireEndpointAKind,
    setWireEndpointAKind: formsState.setWireEndpointAKind,
    wireEndpointAConnectorId: formsState.wireEndpointAConnectorId,
    setWireEndpointAConnectorId: formsState.setWireEndpointAConnectorId,
    wireEndpointACavityIndex: formsState.wireEndpointACavityIndex,
    setWireEndpointACavityIndex: formsState.setWireEndpointACavityIndex,
    wireEndpointASpliceId: formsState.wireEndpointASpliceId,
    setWireEndpointASpliceId: formsState.setWireEndpointASpliceId,
    wireEndpointAPortIndex: formsState.wireEndpointAPortIndex,
    setWireEndpointAPortIndex: formsState.setWireEndpointAPortIndex,
    wireEndpointBConnectionReference: formsState.wireEndpointBConnectionReference,
    setWireEndpointBConnectionReference: formsState.setWireEndpointBConnectionReference,
    wireEndpointBSealReference: formsState.wireEndpointBSealReference,
    setWireEndpointBSealReference: formsState.setWireEndpointBSealReference,
    wireEndpointBKind: formsState.wireEndpointBKind,
    setWireEndpointBKind: formsState.setWireEndpointBKind,
    wireEndpointBConnectorId: formsState.wireEndpointBConnectorId,
    setWireEndpointBConnectorId: formsState.setWireEndpointBConnectorId,
    wireEndpointBCavityIndex: formsState.wireEndpointBCavityIndex,
    setWireEndpointBCavityIndex: formsState.setWireEndpointBCavityIndex,
    wireEndpointBSpliceId: formsState.wireEndpointBSpliceId,
    setWireEndpointBSpliceId: formsState.setWireEndpointBSpliceId,
    wireEndpointBPortIndex: formsState.wireEndpointBPortIndex,
    setWireEndpointBPortIndex: formsState.setWireEndpointBPortIndex,
    wireForcedRouteInput: formsState.wireForcedRouteInput,
    setWireForcedRouteInput: formsState.setWireForcedRouteInput,
    setWireFormError: formsState.setWireFormError,
    selectedConnectorId,
    selectedSpliceId,
    selectedWire,
    defaultWireSectionMm2,
    defaultAutoCreateLinkedNodes
  });
  const { connector: connectorHandlers, splice: spliceHandlers, node: nodeHandlers, segment: segmentHandlers, wire: wireHandlers } =
    modelingHandlers;

  const handleCreateConnectorFromCatalog = useCallback(
    (catalogItemId: CatalogItemId) => {
      setIsModelingAnalysisFocused(false);
      setActiveScreen("modeling");
      setActiveSubScreen("connector");
      connectorHandlers.resetConnectorForm();
      connectorHandlers.syncDerivedConnectorCatalogFields?.(catalogItemId);
    },
    [connectorHandlers, setActiveScreen, setActiveSubScreen, setIsModelingAnalysisFocused]
  );

  const handleCreateSpliceFromCatalog = useCallback(
    (catalogItemId: CatalogItemId) => {
      setIsModelingAnalysisFocused(false);
      setActiveScreen("modeling");
      setActiveSubScreen("splice");
      spliceHandlers.resetSpliceForm();
      spliceHandlers.syncDerivedSpliceCatalogFields?.(catalogItemId);
    },
    [setActiveScreen, setActiveSubScreen, setIsModelingAnalysisFocused, spliceHandlers]
  );

  const handleOpenConnectorFromCatalogAnalysis = useCallback(
    (connectorId: ConnectorId) => {
      const connector = connectorMap.get(connectorId);
      if (connector === undefined) {
        return;
      }
      setDetailPanelsSelectionSource("table");
      setIsModelingAnalysisFocused(false);
      setActiveScreen("modeling");
      setActiveSubScreen("connector");
      connectorHandlers.startConnectorEdit(connector);
    },
    [connectorHandlers, connectorMap, setActiveScreen, setActiveSubScreen, setIsModelingAnalysisFocused]
  );

  const handleOpenSpliceFromCatalogAnalysis = useCallback(
    (spliceId: SpliceId) => {
      const splice = spliceMap.get(spliceId);
      if (splice === undefined) {
        return;
      }
      setDetailPanelsSelectionSource("table");
      setIsModelingAnalysisFocused(false);
      setActiveScreen("modeling");
      setActiveSubScreen("splice");
      spliceHandlers.startSpliceEdit(splice);
    },
    [setActiveScreen, setActiveSubScreen, setIsModelingAnalysisFocused, spliceHandlers, spliceMap]
  );

  const {
    handleOpenValidationScreen,
    moveValidationIssueCursor,
    moveVisibleValidationIssueCursor,
    handleValidationIssueRowGoTo,
    handleStartSelectedEdit
  } = useAppControllerSelectionHandlersAssembly({
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
      setNetworkScale,
      setNetworkOffset
    },
    selection: {
      selected,
      selectedSubScreen,
      selectedConnector,
      selectedSplice,
      selectedNode,
      selectedSegment,
      selectedWire
    },
    navigation: {
      setActiveScreen,
      setActiveSubScreen,
      markDetailPanelsSelectionSourceAsTable: () => setDetailPanelsSelectionSource("table")
    },
    validation: {
      orderedValidationIssues,
      visibleValidationIssues,
      getFocusedValidationIssueByCursor,
      setValidationIssueCursorFromIssue,
      setValidationSearchQuery,
      setValidationCategoryFilter,
      setValidationSeverityFilter
    },
    editActions: {
      startConnectorEdit: connectorHandlers.startConnectorEdit,
      startCatalogEditFromValidation: (catalogItemId) => {
        const item = state.catalogItems.byId[catalogItemId as CatalogItemId];
        if (item === undefined) {
          return;
        }
        catalogHandlers.startCatalogEdit(item);
      },
      startSpliceEdit: spliceHandlers.startSpliceEdit,
      startNodeEdit: nodeHandlers.startNodeEdit,
      startSegmentEdit: segmentHandlers.startSegmentEdit,
      startWireEdit: wireHandlers.startWireEdit
    }
  });

  const handleWorkspaceScreenChange = useCallback((targetScreen: "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings") => {
    if (targetScreen === "analysis") {
      const analysisSubScreen = lastAnalysisSubScreen;

      if (selectedConnector !== null) {
        dispatchAction(appActions.select({ kind: "connector", id: selectedConnector.id }), { trackHistory: false });
      } else if (selectedSplice !== null) {
        dispatchAction(appActions.select({ kind: "splice", id: selectedSplice.id }), { trackHistory: false });
      } else if (selectedNode !== null) {
        dispatchAction(appActions.select({ kind: "node", id: selectedNode.id }), { trackHistory: false });
      } else if (selectedSegment !== null) {
        dispatchAction(appActions.select({ kind: "segment", id: selectedSegment.id }), { trackHistory: false });
      } else if (selectedWire !== null) {
        dispatchAction(appActions.select({ kind: "wire", id: selectedWire.id }), { trackHistory: false });
      }

      setIsModelingAnalysisFocused(true);
      setActiveScreen("modeling");
      setActiveSubScreen(analysisSubScreen);
      return;
    }

    if (targetScreen === "modeling") {
      setIsModelingAnalysisFocused(false);
      if (selected !== null && selectedSubScreen !== null) {
        handleStartSelectedEdit();
        return;
      }
      setActiveScreen("modeling");
      return;
    }

    if (targetScreen !== "settings") {
      setIsModelingAnalysisFocused(false);
    }
    setActiveScreen(targetScreen);
  }, [
    dispatchAction,
    handleStartSelectedEdit,
    lastAnalysisSubScreen,
    selected,
    selectedConnector,
    selectedNode,
    selectedSegment,
    selectedSplice,
    selectedSubScreen,
    selectedWire,
    setIsModelingAnalysisFocused,
    setActiveScreen,
    setActiveSubScreen
  ]);

  const handleWorkspaceDrawerScreenChange = useCallback(
    (targetScreen: "home" | "networkScope" | "modeling" | "analysis" | "validation" | "settings") => {
      if (targetScreen === "modeling") {
        setIsModelingAnalysisFocused(false);
        setActiveScreen("modeling");
        return;
      }

      handleWorkspaceScreenChange(targetScreen);
    },
    [handleWorkspaceScreenChange, setActiveScreen, setIsModelingAnalysisFocused]
  );

  const markDetailPanelsSelectionSourceAsTable = useCallback(() => {
    setDetailPanelsSelectionSource("table");
  }, []);

  const markDetailPanelsSelectionSourceAsExternal = useCallback(() => {
    setDetailPanelsSelectionSource("external");
  }, []);

  useEffect(() => {
    if (activeScreen === "analysis" || (activeScreen === "modeling" && isModelingAnalysisFocused)) {
      if (activeSubScreen !== "catalog") {
        setLastAnalysisSubScreen(activeSubScreen);
      }
    }
  }, [activeScreen, activeSubScreen, isModelingAnalysisFocused]);

  useKeyboardShortcuts({
    keyboardShortcutsEnabled,
    activeScreenRef,
    undoActionRef,
    redoActionRef,
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
  useEffect(() => {
    if (activeSubScreen !== "catalog" && formsState.catalogFormMode !== "idle") {
      catalogHandlers.clearCatalogForm();
    }
  }, [activeSubScreen, catalogHandlers, formsState.catalogFormMode]);

  const {
    handleNetworkSegmentClick,
    handleNetworkNodeActivate,
    handleNetworkCanvasClick,
    handleNetworkNodeMouseDown,
    handleNetworkCanvasMouseDown,
    handleNetworkWheel,
    handleZoomAction,
    handleNetworkMouseMove,
    stopNetworkNodeDrag
  } = useAppControllerCanvasInteractionHandlersAssembly({
    core: {
      state,
      nodesCount: nodes.length,
      interactionMode,
      isModelingScreen,
      activeSubScreen,
      setActiveScreen,
      setActiveSubScreen
    },
    nodeForm: {
      setNodeFormMode: formsState.setNodeFormMode,
      setEditingNodeId: formsState.setEditingNodeId,
      setNodeKind: formsState.setNodeKind,
      setNodeIdInput: formsState.setNodeIdInput,
      setNodeConnectorId: formsState.setNodeConnectorId,
      setNodeSpliceId: formsState.setNodeSpliceId,
      setNodeLabel: formsState.setNodeLabel,
      setNodeFormError: formsState.setNodeFormError,
      setPendingNewNodePosition
    },
    viewport: {
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
      persistNodePosition: (nodeId, position) =>
        dispatchAction(appActions.setNodePosition(nodeId, position), { trackHistory: false }),
      resetNetworkViewToConfiguredScale,
      startConnectorEdit: connectorHandlers.startConnectorEdit,
      startSpliceEdit: spliceHandlers.startSpliceEdit,
      startNodeEdit: nodeHandlers.startNodeEdit,
      startSegmentEdit: segmentHandlers.startSegmentEdit,
      onExternalSelectionInteraction: markDetailPanelsSelectionSourceAsExternal
    }
  });

  const handleSelectConnectorFromCallout = useCallback(
    (connectorId: ConnectorId) => {
      markDetailPanelsSelectionSourceAsExternal();
      dispatchAction(appActions.select({ kind: "connector", id: connectorId }), { trackHistory: false });
    },
    [dispatchAction, markDetailPanelsSelectionSourceAsExternal]
  );
  const handleSelectSpliceFromCallout = useCallback(
    (spliceId: SpliceId) => {
      markDetailPanelsSelectionSourceAsExternal();
      dispatchAction(appActions.select({ kind: "splice", id: spliceId }), { trackHistory: false });
    },
    [dispatchAction, markDetailPanelsSelectionSourceAsExternal]
  );
  const persistConnectorCalloutPosition = useCallback(
    (connectorId: ConnectorId, position: { x: number; y: number }) => {
      const existing = connectorMap.get(connectorId);
      if (existing === undefined) {
        return;
      }
      dispatchAction(
        appActions.upsertConnector({
          ...existing,
          cableCalloutPosition: position
        }),
        { trackHistory: false }
      );
    },
    [connectorMap, dispatchAction]
  );
  const persistSpliceCalloutPosition = useCallback(
    (spliceId: SpliceId, position: { x: number; y: number }) => {
      const existing = spliceMap.get(spliceId);
      if (existing === undefined) {
        return;
      }
      dispatchAction(
        appActions.upsertSplice({
          ...existing,
          cableCalloutPosition: position
        }),
        { trackHistory: false }
      );
    },
    [dispatchAction, spliceMap]
  );

  const currentValidationIssue = isValidationScreen
    ? (getFocusedValidationIssueByCursor() ?? visibleValidationIssues[0] ?? null)
    : getValidationIssueByCursor();
  const { issueNavigationScopeLabel, issueNavigatorDisplay } = useIssueNavigatorModel({
    isValidationScreen,
    currentValidationIssue,
    orderedValidationIssues,
    visibleValidationIssues
  });
  const networkScalePercent = Math.round(networkScale * 100);
  const hasInspectableSelection = selected !== null && selectedSubScreen !== null && selectedSubScreen !== "catalog";
  const hasTableInspectableSelection = hasInspectableSelection && detailPanelsSelectionSource === "table";
  const hasTableSelectionForActiveSubScreen = hasTableInspectableSelection && selectedSubScreen === activeSubScreen;
  const hasInspectableSelectionForActiveSubScreen = hasInspectableSelection && selectedSubScreen === activeSubScreen;
  const hasCatalogSelectionForActiveSubScreen = isCatalogSubScreen && selectedCatalogItemId !== null;
  const hasActiveEntityForm =
    formsState.catalogFormMode !== "idle" ||
    formsState.connectorFormMode !== "idle" ||
    formsState.spliceFormMode !== "idle" ||
    formsState.nodeFormMode !== "idle" ||
    formsState.segmentFormMode !== "idle" ||
    formsState.wireFormMode !== "idle";
  const {
    isInspectorHidden,
    canExpandInspectorFromCollapsed,
    canCollapseInspectorToCollapsed,
    isInspectorOpen,
    expandInspectorFromCollapsed,
    collapseInspectorToCollapsed
  } = useInspectorPanelVisibility({
    isModelingScreen,
    isAnalysisScreen,
    hasActiveNetwork,
    hasInspectableSelection,
    showFloatingInspectorPanel,
    viewportWidth,
    isDialogFocusActive,
    isNavigationDrawerOpen,
    isOperationsPanelOpen
  });
  const inspectableSelectedSubScreen =
    selectedSubScreen === "catalog" ? null : selectedSubScreen;
  const { inspectorContextPanel } = useInspectorContextPanelControllerSlice({
    isInspectorOpen,
    canExpandInspectorFromCollapsed,
    canCollapseInspectorToCollapsed,
    expandInspectorFromCollapsed,
    collapseInspectorToCollapsed,
    selected,
    selectedSubScreen: inspectableSelectedSubScreen,
    selectedConnector,
    selectedSplice,
    selectedNode,
    selectedSegment,
    selectedWire,
    selectedConnectorOccupiedCount,
    selectedSpliceOccupiedCount,
    describeNode,
    handleStartSelectedEdit,
    onClearSelection: () => {
      dispatchAction(appActions.clearSelection());
      clearAllModelingForms();
    }
  });
  const handleCreateEmptyWorkspace = useCallback(() => {
    if (!isCurrentWorkspaceEmpty && typeof window !== "undefined" && typeof window.confirm === "function") {
      const shouldReplace = window.confirm(
        "Replace the current workspace with an empty workspace? This removes current workspace changes."
      );
      if (!shouldReplace) {
        return;
      }
    }

    replaceStateWithHistory(createEmptyWorkspaceState(state.ui.themeMode));
    setActiveScreen("networkScope");
    setActiveSubScreen("connector");
    setInteractionMode("select");
  }, [
    isCurrentWorkspaceEmpty,
    replaceStateWithHistory,
    setActiveScreen,
    setActiveSubScreen,
    setInteractionMode,
    state.ui.themeMode
  ]);

  const homeWorkspaceContent = (
    <HomeWorkspaceContent
      hasActiveNetwork={hasActiveNetwork}
      activeNetworkName={activeNetwork?.name ?? null}
      activeNetworkTechnicalId={activeNetwork?.technicalId ?? null}
      networkCount={networks.length}
      saveStatus={saveStatus}
      validationIssuesCount={validationIssues.length}
      validationErrorCount={validationErrorCount}
      validationWarningCount={validationWarningCount}
      onCreateEmptyWorkspace={handleCreateEmptyWorkspace}
      onOpenImportPicker={handleOpenImportPicker}
      importFileInputRef={importFileInputRef}
      onImportFileChange={handleImportFileChange}
      importExportStatusMessage={importExportStatus?.message ?? null}
      lastImportSummary={lastImportSummary}
      onOpenNetworkScope={() => handleWorkspaceScreenChange("networkScope")}
      onOpenModeling={() => {
        handleWorkspaceScreenChange("modeling");
        setActiveSubScreen("connector");
      }}
      onOpenValidation={() => handleWorkspaceScreenChange("validation")}
      onOpenOnboardingHelp={openFullOnboarding}
    />
  );
  const shouldIncludeNetworkSummaryPanel = hasActiveNetwork && (isModelingScreen || isAnalysisScreen);
  const networkSummaryPanel =
    shouldIncludeNetworkSummaryPanel
      ? buildNetworkSummaryPanelControllerSlice({
        NetworkSummaryPanelComponent: NetworkSummaryPanel,
        handleZoomAction,
        fitNetworkToContent,
        showNetworkGrid,
        setShowNetworkGrid,
        snapNodesToGrid,
        setSnapNodesToGrid,
        lockEntityMovement,
        setLockEntityMovement,
        showNetworkInfoPanels,
        setShowNetworkInfoPanels,
        showSegmentLengths,
        setShowSegmentLengths,
        showCableCallouts,
        setShowCableCallouts,
        networkLabelStrokeMode,
        networkLabelSizeMode,
        networkCalloutTextSize,
        networkLabelRotationDegrees,
        networkScalePercent,
        routingGraph,
        totalEdgeEntries,
        nodes,
        segments,
        wires,
        isPanningNetwork,
        networkViewWidth: NETWORK_VIEW_WIDTH,
        networkViewHeight: NETWORK_VIEW_HEIGHT,
        networkGridStep: NETWORK_GRID_STEP,
        networkOffset,
        networkScale,
        handleNetworkCanvasMouseDown,
        handleNetworkCanvasClick,
        handleNetworkWheel,
        handleNetworkMouseMove,
        stopNetworkNodeDrag,
        networkNodePositions,
        selectedWireRouteSegmentIds,
        selectedSegmentId,
        handleNetworkSegmentClick,
        selectedNodeId,
        selectedConnectorId,
        selectedSpliceId,
        handleNetworkNodeMouseDown,
        handleNetworkNodeActivate,
        connectorMap,
        spliceMap,
        describeNode,
        subNetworkSummaries,
        routePreviewStartNodeId,
        setRoutePreviewStartNodeId,
        routePreviewEndNodeId,
        setRoutePreviewEndNodeId,
        routePreview,
        quickEntityNavigationMode: isModelingScreen && !isModelingAnalysisFocused ? "modeling" : "analysis",
        activeSubScreen,
        entityCountBySubScreen,
        onQuickEntityNavigation: setActiveSubScreen,
        onSelectConnectorFromCallout: handleSelectConnectorFromCallout,
        onSelectSpliceFromCallout: handleSelectSpliceFromCallout,
        onPersistConnectorCalloutPosition: persistConnectorCalloutPosition,
        onPersistSpliceCalloutPosition: persistSpliceCalloutPosition,
        pngExportIncludeBackground: canvasPngExportIncludeBackground,
        canExportBomCsv,
        onExportBomCsv: handleExportBomCsv,
        handleRegenerateLayout
      }).networkSummaryPanel
      : null;
  const { modelingLeftColumnContent, modelingFormsColumnContent, analysisWorkspaceContent } =
    useAppControllerModelingAnalysisScreenDomains({
      components: {
        ModelingPrimaryTablesComponent: ModelingPrimaryTables,
        ModelingSecondaryTablesComponent: ModelingSecondaryTables,
        ModelingFormsColumnComponent: ModelingFormsColumn,
        AnalysisWorkspaceContentComponent: AnalysisWorkspaceContent
      },
      screenFlags: {
        isConnectorSubScreen,
        isSpliceSubScreen,
        isNodeSubScreen,
        isSegmentSubScreen,
        isWireSubScreen
      },
      entities: {
        catalogItems,
        connectors,
        splices,
        nodes,
        segments,
        wires
      },
      formsState,
      modelingHandlers,
      listModel: entityListModel,
      selection: selectionEntities,
      layoutDerived: {
        selectedWireRouteSegmentIds
      },
      pendingNewNodePosition,
      wireDescriptions: {
        describeWireEndpoint,
        describeWireEndpointId
      },
      onboardingHelp: {
        openCatalogStep: () => openSingleStepOnboarding("catalog"),
        openConnectorStep: () => openSingleStepOnboarding("connectorSpliceLibrary"),
        openSpliceStep: () =>
          openSingleStepOnboarding("connectorSpliceLibrary", {
            screen: "modeling",
            subScreen: "splice",
            panelSelector: '[data-onboarding-panel="modeling-splices"]',
            panelLabel: "Splices"
          }),
        openNodeStep: () => openSingleStepOnboarding("nodes"),
        openSegmentStep: () => openSingleStepOnboarding("segments"),
        openWireStep: () => openSingleStepOnboarding("wires")
      },
      describeNode,
      nodeLabelById,
      connectorTechnicalIdAlreadyUsed,
      spliceTechnicalIdAlreadyUsed,
      wireTechnicalIdAlreadyUsed,
      markSelectionPanelsFromTable: markDetailPanelsSelectionSourceAsTable,
      includeModelingContent: hasActiveNetwork && isModelingScreen,
      includeAnalysisContent: hasActiveNetwork && (isAnalysisScreen || isModelingScreen),
      openCatalogSubScreen: () => {
        handleWorkspaceScreenChange("modeling");
        setActiveSubScreen("catalog");
      },
      onSelectConnector: (connectorId) => {
        markDetailPanelsSelectionSourceAsTable();
        dispatchAction(
          appActions.select({
            kind: "connector",
            id: connectorId
          })
        );
      },
      onSelectSplice: (spliceId) => {
        markDetailPanelsSelectionSourceAsTable();
        dispatchAction(
          appActions.select({
            kind: "splice",
            id: spliceId
          })
        );
      },
      onSelectNode: (nodeId) => {
        markDetailPanelsSelectionSourceAsTable();
        dispatchAction(
          appActions.select({
            kind: "node",
            id: nodeId
          })
        );
      },
      onSelectSegment: (segmentId) => {
        markDetailPanelsSelectionSourceAsTable();
        dispatchAction(
          appActions.select({
            kind: "segment",
            id: segmentId
          })
        );
      },
      onSelectWire: (wireId) => {
        markDetailPanelsSelectionSourceAsTable();
        dispatchAction(
          appActions.select({
            kind: "wire",
            id: wireId
          })
        );
      }
    });
  const catalogModelingLeftColumnContent = (
    <ModelingCatalogListPanel
      isCatalogSubScreen={isCatalogSubScreen}
      catalogItems={catalogItems}
      selectedCatalogItemId={selectedCatalogItemId}
      catalogFormMode={formsState.catalogFormMode}
      workspaceCurrencyCode={workspaceCurrencyCode}
      isSelectedCatalogItemReferenced={
        selectedCatalogItemId !== null &&
        (connectors.some((connector) => connector.catalogItemId === selectedCatalogItemId) ||
          splices.some((splice) => splice.catalogItemId === selectedCatalogItemId))
      }
      onOpenCreateCatalogItem={catalogHandlers.resetCatalogForm}
      onEditCatalogItem={catalogHandlers.startCatalogEdit}
      onDeleteCatalogItem={catalogHandlers.handleCatalogDelete}
      onExportCatalogCsv={handleExportCatalogCsv}
      onOpenCatalogCsvImportPicker={handleOpenCatalogCsvImportPicker}
      catalogCsvImportFileInputRef={catalogCsvImportFileInputRef}
      onCatalogCsvImportFileChange={handleCatalogCsvImportFileChange}
      catalogCsvImportExportStatus={catalogCsvImportExportStatus}
      catalogCsvLastImportSummaryLine={catalogCsvLastImportSummaryLine}
      onOpenCatalogOnboardingHelp={() => openSingleStepOnboarding("catalog")}
    />
  );
  const catalogModelingFormsColumnContent = (
    <section className="panel-grid workspace-column workspace-column-right">
      <ModelingCatalogFormPanel
        isCatalogSubScreen={isCatalogSubScreen}
        catalogFormMode={formsState.catalogFormMode}
        openCreateCatalogForm={catalogHandlers.resetCatalogForm}
        handleCatalogSubmit={catalogHandlers.handleCatalogSubmit}
        catalogManufacturerReference={formsState.catalogManufacturerReference}
        setCatalogManufacturerReference={formsState.setCatalogManufacturerReference}
        catalogConnectionCount={formsState.catalogConnectionCount}
        setCatalogConnectionCount={formsState.setCatalogConnectionCount}
        catalogName={formsState.catalogName}
        setCatalogName={formsState.setCatalogName}
        workspaceCurrencyCode={workspaceCurrencyCode}
        catalogUnitPriceExclTax={formsState.catalogUnitPriceExclTax}
        setCatalogUnitPriceExclTax={formsState.setCatalogUnitPriceExclTax}
        catalogUrl={formsState.catalogUrl}
        setCatalogUrl={formsState.setCatalogUrl}
        catalogManufacturerReferenceAlreadyUsed={catalogManufacturerReferenceAlreadyUsed}
        cancelCatalogEdit={catalogHandlers.cancelCatalogEdit}
        catalogFormError={formsState.catalogFormError}
      />
    </section>
  );
  const modelingLeftColumnContentForSubScreen =
    isCatalogSubScreen ? catalogModelingLeftColumnContent : modelingLeftColumnContent;
  const modelingFormsColumnContentForSubScreen =
    isCatalogSubScreen ? catalogModelingFormsColumnContent : modelingFormsColumnContent;
  const selectedCatalogItem =
    selectedCatalogItemId === null ? null : (catalogItems.find((item) => item.id === selectedCatalogItemId) ?? null);
  const catalogAnalysisWorkspaceContent = (
    <CatalogAnalysisWorkspaceContent
      isCatalogSubScreen={isCatalogSubScreen}
      selectedCatalogItemId={selectedCatalogItemId}
      selectedCatalogItemManufacturerReference={selectedCatalogItem?.manufacturerReference ?? null}
      linkedConnectors={selectedCatalogItemId === null ? [] : connectors.filter((connector) => connector.catalogItemId === selectedCatalogItemId)}
      linkedSplices={selectedCatalogItemId === null ? [] : splices.filter((splice) => splice.catalogItemId === selectedCatalogItemId)}
      onCreateConnectorFromCatalog={handleCreateConnectorFromCatalog}
      onCreateSpliceFromCatalog={handleCreateSpliceFromCatalog}
      onOpenConnector={handleOpenConnectorFromCatalogAnalysis}
      onOpenSplice={handleOpenSpliceFromCatalogAnalysis}
    />
  );
  const analysisWorkspaceContentForSubScreen =
    isCatalogSubScreen ? catalogAnalysisWorkspaceContent : analysisWorkspaceContent;
  const { networkScopeWorkspaceContent, validationWorkspaceContent, settingsWorkspaceContent } =
    useAppControllerAuxScreenContentDomains({
      components: {
        NetworkScopeWorkspaceContentComponent: NetworkScopeWorkspaceContent,
        ValidationWorkspaceContentComponent: ValidationWorkspaceContent,
        SettingsWorkspaceContentComponent: SettingsWorkspaceContent
      },
      networkScope: {
        networks,
        networkSort,
        setNetworkSort,
        networkEntityCountsById,
        activeNetworkId,
        handleSelectNetwork,
        handleOpenNetworkInModeling: (networkId) => {
          handleSelectNetwork(networkId);
          handleWorkspaceScreenChange("modeling");
        },
        handleDuplicateNetwork,
        handleExportActiveNetwork: () => handleExportNetworks("active"),
        handleDeleteNetwork,
        handleOpenCreateNetworkForm,
        handleOpenEditNetworkForm,
        handleCloseNetworkForm,
        networkTechnicalIdAlreadyUsed,
        handleSubmitNetworkForm,
        onOpenOnboardingHelp: () => openSingleStepOnboarding("networkScope"),
        formState: {
          newNetworkName,
          setNewNetworkName,
          newNetworkTechnicalId,
          setNewNetworkTechnicalId,
          newNetworkDescription,
          setNewNetworkDescription,
          networkFormError,
          setNetworkFormError,
          networkFormMode,
          setNetworkFormMode,
          networkFormTargetId,
          setNetworkFormTargetId,
          networkFocusRequest,
          setNetworkFocusRequest
        }
      },
      validation: {
        ...validationModel,
        handleValidationIssueRowGoTo
      },
      settings: {
        isCurrentWorkspaceEmpty,
        hasBuiltInSampleState,
        handleRecreateSampleNetwork,
        handleRecreateValidationIssuesSampleNetwork,
        handleRecreateCatalogValidationIssuesSampleNetwork,
        handleRecreatePricingBomQaSampleNetwork,
        handleResetSampleNetwork,
        activeNetworkId,
        importExport: {
          importFileInputRef,
          selectedExportNetworkIds,
          importExportStatus,
          lastImportSummary,
          toggleSelectedExportNetwork,
          handleExportNetworks,
          handleOpenImportPicker,
          handleImportFileChange
        },
        networks,
        prefs: {
          themeMode,
          setThemeMode,
          tableDensity,
          setTableDensity,
          tableFontSize,
          setTableFontSize,
          workspaceCurrencyCode,
          setWorkspaceCurrencyCode,
          workspaceTaxEnabled,
          setWorkspaceTaxEnabled,
          workspaceTaxRatePercent,
          setWorkspaceTaxRatePercent,
          defaultWireSectionMm2,
          setDefaultWireSectionMm2,
          defaultAutoCreateLinkedNodes,
          setDefaultAutoCreateLinkedNodes,
          defaultSortField,
          setDefaultSortField,
          defaultSortDirection,
          setDefaultSortDirection,
          defaultIdSortDirection,
          setDefaultIdSortDirection,
          networkSort,
          setNetworkSort,
          canvasDefaultShowGrid,
          setCanvasDefaultShowGrid,
          canvasDefaultSnapToGrid,
          setCanvasDefaultSnapToGrid,
          canvasDefaultLockEntityMovement,
          setCanvasDefaultLockEntityMovement,
          canvasDefaultShowInfoPanels,
          setCanvasDefaultShowInfoPanels,
          canvasDefaultShowSegmentLengths,
          setCanvasDefaultShowSegmentLengths,
          canvasDefaultShowCableCallouts,
          setCanvasDefaultShowCableCallouts,
          canvasDefaultLabelStrokeMode,
          setCanvasDefaultLabelStrokeMode,
          canvasDefaultLabelSizeMode,
          setCanvasDefaultLabelSizeMode,
          canvasDefaultCalloutTextSize,
          setCanvasDefaultCalloutTextSize,
          canvasDefaultLabelRotationDegrees,
          setCanvasDefaultLabelRotationDegrees,
          canvasPngExportIncludeBackground,
          setCanvasPngExportIncludeBackground,
          showShortcutHints,
          setShowShortcutHints,
          keyboardShortcutsEnabled,
          setKeyboardShortcutsEnabled,
          showFloatingInspectorPanel,
          setShowFloatingInspectorPanel,
          workspacePanelsLayoutMode,
          setWorkspacePanelsLayoutMode,
          preferencesHydrated,
          setPreferencesHydrated
        },
        canvasDisplay: {
          routePreviewStartNodeId,
          setRoutePreviewStartNodeId,
          routePreviewEndNodeId,
          setRoutePreviewEndNodeId,
          showNetworkInfoPanels,
          setShowNetworkInfoPanels,
          showSegmentLengths,
          setShowSegmentLengths,
          showCableCallouts,
          setShowCableCallouts,
          networkLabelStrokeMode,
          setNetworkLabelStrokeMode,
          networkLabelSizeMode,
          setNetworkLabelSizeMode,
          networkCalloutTextSize,
          setNetworkCalloutTextSize,
          networkLabelRotationDegrees,
          setNetworkLabelRotationDegrees,
          canvasResetZoomPercentInput,
          setCanvasResetZoomPercentInput
        },
        configuredResetZoomPercent,
        applyListSortDefaults,
        applyCanvasDefaultsNow,
        handleZoomAction,
        resetWorkspacePreferencesToDefaults
      },
      includeNetworkScopeContent: isNetworkScopeScreen,
      includeValidationContent: hasActiveNetwork && isValidationScreen,
      includeSettingsContent: isSettingsScreen
    });
  useEffect(() => {
    if (!hasInspectableSelection) {
      setDetailPanelsSelectionSource("external");
    }
  }, [hasInspectableSelection]);
  const modelingFormsColumnContentForLayout =
    hasTableSelectionForActiveSubScreen || hasActiveEntityForm || isCatalogSubScreen
      ? modelingFormsColumnContentForSubScreen
      : null;
  const analysisWorkspaceContentForLayout =
    isCatalogSubScreen
      ? (hasCatalogSelectionForActiveSubScreen ? analysisWorkspaceContentForSubScreen : null)
      : hasInspectableSelectionForActiveSubScreen
        ? analysisWorkspaceContentForSubScreen
        : null;

  return (
    <>
      <AppShellLayout
      appShellClassName={appShellClassName}
      workspaceShellStyle={workspaceShellStyle}
      appRepositoryUrl={APP_REPOSITORY_URL}
      currentYear={currentYear}
      appVersion={appPackageMetadata.version}
      headerBlockRef={headerBlockRef}
      navigationToggleButtonRef={navigationToggleButtonRef}
      operationsButtonRef={operationsButtonRef}
      navigationDrawerRef={navigationDrawerRef}
      operationsPanelRef={operationsPanelRef}
      isNavigationDrawerOpen={isNavigationDrawerOpen}
      isOperationsPanelOpen={isOperationsPanelOpen}
      closeNavigationDrawer={closeNavigationDrawer}
      closeOperationsPanel={closeOperationsPanel}
      onToggleNavigationDrawer={handleToggleNavigationDrawer}
      onToggleOperationsPanel={handleToggleOperationsPanel}
      isSettingsActive={isSettingsScreen}
      onOpenSettings={handleOpenSettingsScreen}
      isInstallPromptAvailable={isInstallPromptAvailable}
      onInstallApp={handleInstallApp}
      isPwaUpdateReady={isPwaUpdateReady}
      onApplyPwaUpdate={handleApplyPwaUpdate}
      validationIssuesCount={validationIssues.length}
      validationErrorCount={validationErrorCount}
      validationWarningCount={validationWarningCount}
      lastError={lastError}
      onClearError={() => dispatchAction(appActions.clearError())}
      activeScreen={activeScreen}
      activeSubScreen={activeSubScreen}
      isModelingScreen={isModelingScreen}
      isAnalysisScreen={isAnalysisScreen}
      isValidationScreen={isValidationScreen}
      entityCountBySubScreen={entityCountBySubScreen}
      onScreenChange={handleWorkspaceDrawerScreenChange}
      onSubScreenChange={setActiveSubScreen}
      handleUndo={handleUndo}
      handleRedo={handleRedo}
      isUndoAvailable={isUndoAvailable}
      isRedoAvailable={isRedoAvailable}
      showShortcutHints={showShortcutHints}
      saveStatus={saveStatus}
      issueNavigatorDisplay={issueNavigatorDisplay}
      issueNavigationScopeLabel={issueNavigationScopeLabel}
      currentValidationIssue={currentValidationIssue}
      orderedValidationIssues={orderedValidationIssues}
      handleOpenValidationScreen={handleOpenValidationScreen}
      moveValidationIssueCursor={moveValidationIssueCursor}
      HomeScreenComponent={HomeScreen}
      NetworkScopeScreenComponent={NetworkScopeScreen}
      ModelingScreenComponent={ModelingScreen}
      AnalysisScreenComponent={AnalysisScreen}
      ValidationScreenComponent={ValidationScreen}
      SettingsScreenComponent={SettingsScreen}
      isHomeScreen={isHomeScreen}
      isNetworkScopeScreen={isNetworkScopeScreen}
      homeWorkspaceContent={homeWorkspaceContent}
      hasActiveNetwork={hasActiveNetwork}
      networkScopeWorkspaceContent={networkScopeWorkspaceContent}
      modelingLeftColumnContent={modelingLeftColumnContentForSubScreen}
      modelingFormsColumnContent={modelingFormsColumnContentForLayout}
      networkSummaryPanel={networkSummaryPanel}
      analysisWorkspaceContent={analysisWorkspaceContentForLayout}
      validationWorkspaceContent={validationWorkspaceContent}
      settingsWorkspaceContent={settingsWorkspaceContent}
      isSettingsScreen={isSettingsScreen}
      isInspectorHidden={isInspectorHidden}
      isInspectorOpen={isInspectorOpen}
      inspectorContextPanel={inspectorContextPanel}
      />
      {activeOnboardingStep !== undefined ? (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          themeHostClassName={appShellClassName}
          mode={onboardingModalMode}
          step={activeOnboardingStep}
          stepIndex={onboardingModalMode === "full" ? onboardingStepIndex : ONBOARDING_STEPS.findIndex((step) => step.id === activeOnboardingStep.id)}
          totalSteps={ONBOARDING_STEPS.length}
          autoOpenEnabled={onboardingAutoOpenEnabled}
          onSetAutoOpenEnabled={setOnboardingAutoOpenEnabledPersisted}
          onClose={() => setIsOnboardingOpen(false)}
          onNext={handleOnboardingNext}
          canGoNext={onboardingModalMode !== "full" || onboardingStepIndex < ONBOARDING_STEPS.length - 1}
          targetActions={onboardingTargetActions}
        />
      ) : null}
    </>
  );
}
