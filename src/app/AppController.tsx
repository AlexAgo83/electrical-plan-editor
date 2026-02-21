import {
  type CSSProperties,
  type FormEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from "react";
import type {
  ConnectorId,
  NetworkId,
  NetworkNode,
  NodeId,
  SegmentId,
  SpliceId,
  WireEndpoint,
  WireId
} from "../core/entities";
import {
  type AppStore,
  appActions,
  hasSampleNetworkSignature,
  isWorkspaceEmpty,
  selectActiveNetwork,
  selectActiveNetworkId,
  selectConnectorById,
  selectConnectorCavityStatuses,
  selectConnectorTechnicalIdTaken,
  selectConnectors,
  selectLastError,
  selectNetworkTechnicalIdTaken,
  selectNetworks,
  selectNodePositions,
  selectNodeById,
  selectNodes,
  selectRoutingGraphIndex,
  selectSegmentById,
  selectSegments,
  selectSelection,
  selectShortestRouteBetweenNodes,
  selectSpliceById,
  selectSplicePortStatuses,
  selectSpliceTechnicalIdTaken,
  selectSplices,
  selectSubNetworkSummaries,
  selectWireById,
  selectWireTechnicalIdTaken,
  selectWires,
  type ThemeMode
} from "../store";
import { appStore } from "./store";
import { InspectorContextPanel } from "./components/InspectorContextPanel";
import { NetworkSummaryPanel } from "./components/NetworkSummaryPanel";
import { AnalysisScreen } from "./components/screens/AnalysisScreen";
import { ModelingScreen } from "./components/screens/ModelingScreen";
import { NetworkScopeScreen } from "./components/screens/NetworkScopeScreen";
import { SettingsScreen } from "./components/screens/SettingsScreen";
import { ValidationScreen } from "./components/screens/ValidationScreen";
import { AppHeaderAndStats } from "./components/workspace/AppHeaderAndStats";
import { AnalysisWorkspaceContent } from "./components/workspace/AnalysisWorkspaceContent";
import { ModelingFormsColumn } from "./components/workspace/ModelingFormsColumn";
import { ModelingPrimaryTables } from "./components/workspace/ModelingPrimaryTables";
import { ModelingSecondaryTables } from "./components/workspace/ModelingSecondaryTables";
import { NetworkScopeWorkspaceContent } from "./components/workspace/NetworkScopeWorkspaceContent";
import { OperationsHealthPanel } from "./components/workspace/OperationsHealthPanel";
import { SettingsWorkspaceContent } from "./components/workspace/SettingsWorkspaceContent";
import { ValidationWorkspaceContent } from "./components/workspace/ValidationWorkspaceContent";
import { WorkspaceSidebarPanel } from "./components/workspace/WorkspaceSidebarPanel";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useCanvasInteractionHandlers } from "./hooks/useCanvasInteractionHandlers";
import { useCanvasState } from "./hooks/useCanvasState";
import { useConnectorHandlers } from "./hooks/useConnectorHandlers";
import { useEntityListModel } from "./hooks/useEntityListModel";
import { useEntityFormsState } from "./hooks/useEntityFormsState";
import { useNetworkImportExport } from "./hooks/useNetworkImportExport";
import { useNodeHandlers } from "./hooks/useNodeHandlers";
import { useSelectionHandlers } from "./hooks/useSelectionHandlers";
import { useSegmentHandlers } from "./hooks/useSegmentHandlers";
import { useSpliceHandlers } from "./hooks/useSpliceHandlers";
import { useStoreHistory } from "./hooks/useStoreHistory";
import { useUiPreferences } from "./hooks/useUiPreferences";
import { useValidationModel } from "./hooks/useValidationModel";
import { useWireHandlers } from "./hooks/useWireHandlers";
import { useWorkspaceHandlers } from "./hooks/useWorkspaceHandlers";
import { useWorkspaceNavigation } from "./hooks/useWorkspaceNavigation";
import { applyRegisteredServiceWorkerUpdate } from "./pwa/registerServiceWorker";
import {
  clamp,
  createNodePositionMap,
  HISTORY_LIMIT,
  NETWORK_GRID_STEP,
  NETWORK_MAX_SCALE,
  NETWORK_MIN_SCALE,
  NETWORK_VIEW_HEIGHT,
  NETWORK_VIEW_WIDTH,
} from "./lib/app-utils";
import type {
  AppProps,
  NodePosition,
  SortState,
  SortDirection,
  SortField,
  SubScreenId,
  TableDensity,
} from "./types/app-controller";
import "./styles.css";

export type { AppProps } from "./types/app-controller";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

function useAppSnapshot(store: AppStore) {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

export function AppController({ store = appStore }: AppProps): ReactElement {
  const state = useAppSnapshot(store);

  const networks = selectNetworks(state);
  const activeNetworkId = selectActiveNetworkId(state);
  const activeNetwork = selectActiveNetwork(state);
  const connectors = selectConnectors(state);
  const splices = selectSplices(state);
  const nodes = selectNodes(state);
  const segments = selectSegments(state);
  const wires = selectWires(state);
  const routingGraph = selectRoutingGraphIndex(state);
  const subNetworkSummaries = selectSubNetworkSummaries(state);
  const networkEntityCountsById = useMemo(() => {
    const counts: Partial<
      Record<
        NetworkId,
        {
          connectorCount: number;
          spliceCount: number;
          nodeCount: number;
          segmentCount: number;
          wireCount: number;
        }
      >
    > = {};

    for (const network of networks) {
      const scoped = state.networkStates[network.id];
      counts[network.id] = {
        connectorCount: scoped?.connectors.allIds.length ?? 0,
        spliceCount: scoped?.splices.allIds.length ?? 0,
        nodeCount: scoped?.nodes.allIds.length ?? 0,
        segmentCount: scoped?.segments.allIds.length ?? 0,
        wireCount: scoped?.wires.allIds.length ?? 0
      };
    }

    return counts;
  }, [networks, state.networkStates]);

  const connectorMap = useMemo(() => new Map(connectors.map((connector) => [connector.id, connector])), [connectors]);
  const spliceMap = useMemo(() => new Map(splices.map((splice) => [splice.id, splice])), [splices]);
  const segmentMap = useMemo(() => new Map(segments.map((segment) => [segment.id, segment])), [segments]);
  const connectorNodeByConnectorId = useMemo(
    () =>
      new Map(
        nodes
          .filter((node): node is Extract<NetworkNode, { kind: "connector" }> => node.kind === "connector")
          .map((node) => [node.connectorId, node.id])
      ),
    [nodes]
  );
  const spliceNodeBySpliceId = useMemo(
    () =>
      new Map(
        nodes
          .filter((node): node is Extract<NetworkNode, { kind: "splice" }> => node.kind === "splice")
          .map((node) => [node.spliceId, node.id])
      ),
    [nodes]
  );

  const {
    connectorFormMode,
    setConnectorFormMode,
    editingConnectorId,
    setEditingConnectorId,
    connectorName,
    setConnectorName,
    connectorTechnicalId,
    setConnectorTechnicalId,
    cavityCount,
    setCavityCount,
    cavityIndexInput,
    setCavityIndexInput,
    connectorOccupantRefInput,
    setConnectorOccupantRefInput,
    connectorFormError,
    setConnectorFormError,
    spliceFormMode,
    setSpliceFormMode,
    editingSpliceId,
    setEditingSpliceId,
    spliceName,
    setSpliceName,
    spliceTechnicalId,
    setSpliceTechnicalId,
    portCount,
    setPortCount,
    portIndexInput,
    setPortIndexInput,
    spliceOccupantRefInput,
    setSpliceOccupantRefInput,
    spliceFormError,
    setSpliceFormError,
    nodeFormMode,
    setNodeFormMode,
    editingNodeId,
    setEditingNodeId,
    nodeIdInput,
    setNodeIdInput,
    nodeKind,
    setNodeKind,
    nodeConnectorId,
    setNodeConnectorId,
    nodeSpliceId,
    setNodeSpliceId,
    nodeLabel,
    setNodeLabel,
    nodeFormError,
    setNodeFormError,
    segmentFormMode,
    setSegmentFormMode,
    editingSegmentId,
    setEditingSegmentId,
    segmentIdInput,
    setSegmentIdInput,
    segmentNodeA,
    setSegmentNodeA,
    segmentNodeB,
    setSegmentNodeB,
    segmentLengthMm,
    setSegmentLengthMm,
    segmentSubNetworkTag,
    setSegmentSubNetworkTag,
    segmentFormError,
    setSegmentFormError,
    wireFormMode,
    setWireFormMode,
    editingWireId,
    setEditingWireId,
    wireName,
    setWireName,
    wireTechnicalId,
    setWireTechnicalId,
    wireEndpointAKind,
    setWireEndpointAKind,
    wireEndpointAConnectorId,
    setWireEndpointAConnectorId,
    wireEndpointACavityIndex,
    setWireEndpointACavityIndex,
    wireEndpointASpliceId,
    setWireEndpointASpliceId,
    wireEndpointAPortIndex,
    setWireEndpointAPortIndex,
    wireEndpointBKind,
    setWireEndpointBKind,
    wireEndpointBConnectorId,
    setWireEndpointBConnectorId,
    wireEndpointBCavityIndex,
    setWireEndpointBCavityIndex,
    wireEndpointBSpliceId,
    setWireEndpointBSpliceId,
    wireEndpointBPortIndex,
    setWireEndpointBPortIndex,
    wireForcedRouteInput,
    setWireForcedRouteInput,
    wireFormError,
    setWireFormError
  } = useEntityFormsState();
  const [routePreviewStartNodeId, setRoutePreviewStartNodeId] = useState("");
  const [routePreviewEndNodeId, setRoutePreviewEndNodeId] = useState("");
  const {
    interactionMode,
    setInteractionMode,
    modeAnchorNodeId,
    setModeAnchorNodeId,
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
    networkScale,
    setNetworkScale,
    networkOffset,
    setNetworkOffset
  } = useCanvasState();
  const [newNetworkName, setNewNetworkName] = useState("");
  const [newNetworkTechnicalId, setNewNetworkTechnicalId] = useState("");
  const [newNetworkDescription, setNewNetworkDescription] = useState("");
  const [networkFormError, setNetworkFormError] = useState<string | null>(null);
  const [networkFormMode, setNetworkFormMode] = useState<"create" | "edit" | null>(null);
  const [networkFormTargetId, setNetworkFormTargetId] = useState<NetworkId | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [tableDensity, setTableDensity] = useState<TableDensity>("comfortable");
  const [defaultSortField, setDefaultSortField] = useState<SortField>("name");
  const [defaultSortDirection, setDefaultSortDirection] = useState<SortDirection>("asc");
  const [defaultIdSortDirection, setDefaultIdSortDirection] = useState<SortDirection>("asc");
  const [networkSort, setNetworkSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [canvasDefaultShowGrid, setCanvasDefaultShowGrid] = useState(true);
  const [canvasDefaultSnapToGrid, setCanvasDefaultSnapToGrid] = useState(true);
  const [canvasResetZoomPercentInput, setCanvasResetZoomPercentInput] = useState("100");
  const [showShortcutHints, setShowShortcutHints] = useState(true);
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);
  const [preferencesHydrated, setPreferencesHydrated] = useState(false);
  const [isInstallPromptAvailable, setIsInstallPromptAvailable] = useState(false);
  const [isPwaUpdateReady, setIsPwaUpdateReady] = useState(false);
  const [isNavigationDrawerOpen, setIsNavigationDrawerOpen] = useState(false);
  const [isOperationsPanelOpen, setIsOperationsPanelOpen] = useState(false);
  const [headerOffsetPx, setHeaderOffsetPx] = useState(96);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth
  );
  const [isDialogFocusActive, setIsDialogFocusActive] = useState(false);
  const [isInspectorExpandedOnNarrowViewport, setIsInspectorExpandedOnNarrowViewport] = useState(false);
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
  const deferredInstallPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const hasAutoOpenedNetworkFormRef = useRef(false);

  const selected = selectSelection(state);
  const {
    activeScreen,
    setActiveScreen,
    activeSubScreen,
    setActiveSubScreen,
    isNetworkScopeScreen,
    isModelingScreen,
    isAnalysisScreen,
    isValidationScreen,
    isSettingsScreen,
    activeScreenRef
  } = useWorkspaceNavigation(selected);
  const selectedConnectorId = selected?.kind === "connector" ? (selected.id as ConnectorId) : null;
  const selectedSpliceId = selected?.kind === "splice" ? (selected.id as SpliceId) : null;
  const selectedNodeId = selected?.kind === "node" ? (selected.id as NodeId) : null;
  const selectedSegmentId = selected?.kind === "segment" ? (selected.id as SegmentId) : null;
  const selectedWireId = selected?.kind === "wire" ? (selected.id as WireId) : null;

  const selectedConnector =
    selectedConnectorId === null ? null : (selectConnectorById(state, selectedConnectorId) ?? null);
  const selectedSplice = selectedSpliceId === null ? null : (selectSpliceById(state, selectedSpliceId) ?? null);
  const selectedNode = selectedNodeId === null ? null : (selectNodeById(state, selectedNodeId) ?? null);
  const selectedSegment = selectedSegmentId === null ? null : (selectSegmentById(state, selectedSegmentId) ?? null);
  const selectedWire = selectedWireId === null ? null : (selectWireById(state, selectedWireId) ?? null);

  const connectorCavityStatuses = useMemo(() => {
    if (selectedConnectorId === null) {
      return [];
    }

    return selectConnectorCavityStatuses(state, selectedConnectorId);
  }, [state, selectedConnectorId]);

  const splicePortStatuses = useMemo(() => {
    if (selectedSpliceId === null) {
      return [];
    }

    return selectSplicePortStatuses(state, selectedSpliceId);
  }, [state, selectedSpliceId]);

  const connectorIdExcludedFromUniqueness =
    connectorFormMode === "edit" ? editingConnectorId ?? undefined : undefined;
  const connectorTechnicalIdAlreadyUsed =
    connectorTechnicalId.trim().length > 0 &&
    selectConnectorTechnicalIdTaken(state, connectorTechnicalId.trim(), connectorIdExcludedFromUniqueness);

  const spliceIdExcludedFromUniqueness = spliceFormMode === "edit" ? editingSpliceId ?? undefined : undefined;
  const spliceTechnicalIdAlreadyUsed =
    spliceTechnicalId.trim().length > 0 &&
    selectSpliceTechnicalIdTaken(state, spliceTechnicalId.trim(), spliceIdExcludedFromUniqueness);
  const wireIdExcludedFromUniqueness = wireFormMode === "edit" ? editingWireId ?? undefined : undefined;
  const wireTechnicalIdAlreadyUsed =
    wireTechnicalId.trim().length > 0 &&
    selectWireTechnicalIdTaken(state, wireTechnicalId.trim(), wireIdExcludedFromUniqueness);
  const networkTechnicalIdAlreadyUsed =
    newNetworkTechnicalId.trim().length > 0 &&
    selectNetworkTechnicalIdTaken(
      state,
      newNetworkTechnicalId.trim(),
      networkFormMode === "edit" ? networkFormTargetId ?? undefined : undefined
    );

  const totalEdgeEntries = routingGraph.nodeIds.reduce(
    (sum, nodeId) => sum + (routingGraph.edgesByNodeId[nodeId]?.length ?? 0),
    0
  );
  const routePreview = useMemo(() => {
    if (routePreviewStartNodeId.length === 0 || routePreviewEndNodeId.length === 0) {
      return null;
    }

    return selectShortestRouteBetweenNodes(
      state,
      routePreviewStartNodeId as NodeId,
      routePreviewEndNodeId as NodeId
    );
  }, [state, routePreviewStartNodeId, routePreviewEndNodeId]);
  const selectedWireRouteSegmentIds = useMemo(() => new Set(selectedWire?.routeSegmentIds ?? []), [selectedWire]);
  const persistedNodePositions = selectNodePositions(state);
  const autoNodePositions = useMemo(
    () =>
      createNodePositionMap(nodes, segments, {
        snapToGrid: snapNodesToGrid,
        gridStep: NETWORK_GRID_STEP
      }),
    [nodes, segments, snapNodesToGrid]
  );
  const networkNodePositions = useMemo(() => {
    const merged = { ...autoNodePositions };
    for (const node of nodes) {
      const persistedPosition = persistedNodePositions[node.id];
      if (persistedPosition !== undefined) {
        merged[node.id] = persistedPosition;
      }

      const manualPosition = manualNodePositions[node.id];
      if (manualPosition !== undefined) {
        merged[node.id] = manualPosition;
      }
    }
    return merged;
  }, [autoNodePositions, manualNodePositions, nodes, persistedNodePositions]);
  const isConnectorSubScreen = activeSubScreen === "connector";
  const isSpliceSubScreen = activeSubScreen === "splice";
  const isNodeSubScreen = activeSubScreen === "node";
  const isSegmentSubScreen = activeSubScreen === "segment";
  const isWireSubScreen = activeSubScreen === "wire";
  const selectedSubScreen = selected?.kind === undefined ? null : (selected.kind as SubScreenId);
  const appShellClassName = [
    "app-shell",
    tableDensity === "compact" ? "table-density-compact" : "",
    themeMode === "dark" ? "theme-dark" : "theme-normal"
  ]
    .filter((token) => token.length > 0)
    .join(" ");
  const workspaceShellStyle = useMemo(
    () =>
      ({
        "--workspace-header-offset": `${headerOffsetPx}px`
      }) as CSSProperties,
    [headerOffsetPx]
  );
  const configuredResetScale = useMemo(() => {
    const parsedPercent = Number(canvasResetZoomPercentInput);
    if (!Number.isFinite(parsedPercent) || parsedPercent <= 0) {
      return 1;
    }

    return clamp(parsedPercent / 100, NETWORK_MIN_SCALE, NETWORK_MAX_SCALE);
  }, [canvasResetZoomPercentInput]);
  const configuredResetZoomPercent = Math.round(configuredResetScale * 100);

  const describeWireEndpoint = useCallback((endpoint: WireEndpoint): string => {
    if (endpoint.kind === "connectorCavity") {
      const connector = connectorMap.get(endpoint.connectorId);
      if (connector === undefined) {
        return `Connector ${endpoint.connectorId} / C${endpoint.cavityIndex}`;
      }

      return `${connector.name} (${connector.technicalId}) / C${endpoint.cavityIndex}`;
    }

    const splice = spliceMap.get(endpoint.spliceId);
    if (splice === undefined) {
      return `Splice ${endpoint.spliceId} / P${endpoint.portIndex}`;
    }

    return `${splice.name} (${splice.technicalId}) / P${endpoint.portIndex}`;
  }, [connectorMap, spliceMap]);

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
    setModeAnchorNodeId(null);
    if (interactionMode !== "addNode") {
      setPendingNewNodePosition(null);
    }
  }, [interactionMode, setModeAnchorNodeId, setPendingNewNodePosition]);

  useEffect(() => {
    if (networkFormMode !== "edit") {
      return;
    }

    if (networkFormTargetId === null) {
      setNetworkFormMode(null);
      return;
    }

    const targetNetwork = state.networks.byId[networkFormTargetId];
    if (targetNetwork === undefined) {
      setNetworkFormMode(null);
      setNetworkFormTargetId(null);
      return;
    }

    setNewNetworkName(targetNetwork.name);
    setNewNetworkTechnicalId(targetNetwork.technicalId);
    setNewNetworkDescription(targetNetwork.description ?? "");
  }, [networkFormMode, networkFormTargetId, state]);

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

  const {
    connectorOccupancyFilter,
    setConnectorOccupancyFilter,
    spliceOccupancyFilter,
    setSpliceOccupancyFilter,
    nodeKindFilter,
    setNodeKindFilter,
    segmentSubNetworkFilter,
    setSegmentSubNetworkFilter,
    wireRouteFilter,
    setWireRouteFilter,
    connectorSort,
    setConnectorSort,
    spliceSort,
    setSpliceSort,
    nodeIdSortDirection,
    setNodeIdSortDirection,
    segmentIdSortDirection,
    setSegmentIdSortDirection,
    wireSort,
    setWireSort,
    connectorSynthesisSort,
    setConnectorSynthesisSort,
    spliceSynthesisSort,
    setSpliceSynthesisSort,
    connectorOccupiedCountById,
    spliceOccupiedCountById,
    sortedConnectorSynthesisRows,
    sortedSpliceSynthesisRows,
    visibleConnectors,
    visibleSplices,
    visibleNodes,
    visibleSegments,
    visibleWires,
    segmentsCountByNodeId,
    getSortIndicator
  } = useEntityListModel({
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
  useUiPreferences({
    networkMinScale: NETWORK_MIN_SCALE,
    networkMaxScale: NETWORK_MAX_SCALE,
    themeMode,
    tableDensity,
    defaultSortField,
    defaultSortDirection,
    defaultIdSortDirection,
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasResetZoomPercentInput,
    showShortcutHints,
    keyboardShortcutsEnabled,
    preferencesHydrated,
    setTableDensity,
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
    setShowNetworkGrid,
    setSnapNodesToGrid,
    setCanvasResetZoomPercentInput,
    setNetworkScale,
    setNetworkOffset,
    setShowShortcutHints,
    setKeyboardShortcutsEnabled,
    setThemeMode,
    setPreferencesHydrated
  });

  useEffect(() => {
    store.dispatch(appActions.setThemeMode(themeMode));
  }, [store, themeMode]);
  const {
    validationCategoryFilter,
    setValidationCategoryFilter,
    validationSeverityFilter,
    setValidationSeverityFilter,
    setValidationSearchQuery,
    validationIssueCursor,
    validationIssues,
    orderedValidationIssues,
    validationCategories,
    validationIssuesForCategoryCounts,
    validationIssuesForSeverityCounts,
    validationCategoryCountByName,
    validationSeverityCountByLevel,
    visibleValidationIssues,
    validationErrorCount,
    validationWarningCount,
    groupedValidationIssues,
    clearValidationFilters,
    findValidationIssueIndex,
    getValidationIssueByCursor,
    getFocusedValidationIssueByCursor,
    setValidationIssueCursorFromIssue
  } = useValidationModel({
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

  const entityCountBySubScreen: Record<SubScreenId, number> = {
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
      setModeAnchorNodeId(null);
      setPendingNewNodePosition(null);
    },
    onReplaceStateApplied: () => {
      setModeAnchorNodeId(null);
      setPendingNewNodePosition(null);
      setActiveScreen("modeling");
      setActiveSubScreen("connector");
      setInteractionMode("select");
    }
  });
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

  const {
    handleCreateNetwork,
    handleSelectNetwork,
    handleUpdateActiveNetwork,
    handleDuplicateNetwork,
    handleDeleteNetwork,
    handleRecreateSampleNetwork,
    handleResetSampleNetwork,
    resetNetworkViewToConfiguredScale,
    fitNetworkToContent,
    applyListSortDefaults,
    applyCanvasDefaultsNow,
    resetWorkspacePreferencesToDefaults
  } = useWorkspaceHandlers({
    store,
    networks,
    newNetworkName,
    setNewNetworkName,
    newNetworkTechnicalId,
    setNewNetworkTechnicalId,
    newNetworkDescription,
    setNewNetworkDescription,
    setNetworkFormError,
    isCurrentWorkspaceEmpty,
    hasBuiltInSampleState,
    dispatchAction,
    replaceStateWithHistory,
    nodes,
    networkNodePositions,
    configuredResetScale,
    setNetworkScale,
    setNetworkOffset,
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    setShowNetworkGrid,
    setSnapNodesToGrid,
    defaultSortField,
    defaultSortDirection,
    defaultIdSortDirection,
    setConnectorSort,
    setSpliceSort,
    setWireSort,
    setConnectorSynthesisSort,
    setSpliceSynthesisSort,
    setNetworkSort,
    setNodeIdSortDirection,
    setSegmentIdSortDirection,
    setThemeMode,
    setTableDensity,
    setDefaultSortField,
    setDefaultSortDirection,
    setDefaultIdSortDirection,
    setCanvasDefaultShowGrid,
    setCanvasDefaultSnapToGrid,
    setCanvasResetZoomPercentInput,
    setShowShortcutHints,
    setKeyboardShortcutsEnabled
  });

  const handleOpenCreateNetworkForm = useCallback(() => {
    setNetworkFormMode("create");
    setNetworkFormTargetId(null);
    setNewNetworkName("");
    setNewNetworkTechnicalId("");
    setNewNetworkDescription("");
    setNetworkFormError(null);
  }, []);

  const handleOpenEditNetworkForm = useCallback((networkId: NetworkId) => {
    const targetNetwork = networks.find((network) => network.id === networkId);
    if (targetNetwork === undefined) {
      return;
    }

    setNetworkFormMode("edit");
    setNetworkFormTargetId(targetNetwork.id);
    setNewNetworkName(targetNetwork.name);
    setNewNetworkTechnicalId(targetNetwork.technicalId);
    setNewNetworkDescription(targetNetwork.description ?? "");
    setNetworkFormError(null);
  }, [networks]);

  const handleCloseNetworkForm = useCallback(() => {
    setNetworkFormMode(null);
    setNetworkFormTargetId(null);
    setNetworkFormError(null);
  }, []);

  const handleSubmitNetworkForm = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      if (networkFormMode === "edit") {
        handleUpdateActiveNetwork(event, networkFormTargetId);
        return;
      }

      handleCreateNetwork(event);
    },
    [handleCreateNetwork, handleUpdateActiveNetwork, networkFormMode, networkFormTargetId]
  );

  useEffect(() => {
    if (!isNetworkScopeScreen || hasAutoOpenedNetworkFormRef.current || networkFormMode === "create") {
      return;
    }

    if (activeNetworkId === null) {
      return;
    }

    handleOpenEditNetworkForm(activeNetworkId);
    hasAutoOpenedNetworkFormRef.current = true;
  }, [activeNetworkId, handleOpenEditNetworkForm, isNetworkScopeScreen, networkFormMode]);

  const closeNavigationDrawer = useCallback(() => {
    setIsNavigationDrawerOpen(false);
  }, []);

  const handleToggleNavigationDrawer = useCallback(() => {
    setIsNavigationDrawerOpen((current) => {
      const next = !current;
      if (next) {
        setIsOperationsPanelOpen(false);
      }
      return next;
    });
  }, []);

  const closeOperationsPanel = useCallback(() => {
    setIsOperationsPanelOpen(false);
  }, []);

  const handleToggleOperationsPanel = useCallback(() => {
    setIsOperationsPanelOpen((current) => {
      const next = !current;
      if (next) {
        setIsNavigationDrawerOpen(false);
      }
      return next;
    });
  }, []);

  const handleOpenSettingsScreen = useCallback(() => {
    setActiveScreen("settings");
    setIsNavigationDrawerOpen(false);
    setIsOperationsPanelOpen(false);
  }, [setActiveScreen]);

  const handleInstallApp = useCallback(() => {
    const promptEvent = deferredInstallPromptRef.current;
    if (promptEvent === null) {
      return;
    }

    void (async () => {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        deferredInstallPromptRef.current = null;
        setIsInstallPromptAvailable(false);
      }
    })();
  }, []);

  const handleApplyPwaUpdate = useCallback(() => {
    void (async () => {
      await applyRegisteredServiceWorkerUpdate();
      setIsPwaUpdateReady(false);
    })();
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event): void => {
      const promptEvent = event as BeforeInstallPromptEvent;
      if (typeof promptEvent.prompt !== "function") {
        return;
      }

      promptEvent.preventDefault();
      deferredInstallPromptRef.current = promptEvent;
      setIsInstallPromptAvailable(true);
    };

    const handleAppInstalled = (): void => {
      deferredInstallPromptRef.current = null;
      setIsInstallPromptAvailable(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const handlePwaUpdateAvailable = (): void => {
      setIsPwaUpdateReady(true);
    };

    const handlePwaRegistrationError = (): void => {
      setIsPwaUpdateReady(false);
    };

    window.addEventListener("app:pwa-update-available", handlePwaUpdateAvailable);
    window.addEventListener("app:pwa-registration-error", handlePwaRegistrationError);
    return () => {
      window.removeEventListener("app:pwa-update-available", handlePwaUpdateAvailable);
      window.removeEventListener("app:pwa-registration-error", handlePwaRegistrationError);
    };
  }, []);

  useEffect(() => {
    if (!isNavigationDrawerOpen) {
      return;
    }

    const handlePointerInteraction = (event: MouseEvent | TouchEvent): void => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (navigationDrawerRef.current?.contains(event.target)) {
        return;
      }

      if (navigationToggleButtonRef.current?.contains(event.target)) {
        return;
      }

      setIsNavigationDrawerOpen(false);
    };

    const handleFocusIn = (event: FocusEvent): void => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (navigationDrawerRef.current?.contains(event.target)) {
        return;
      }

      if (navigationToggleButtonRef.current?.contains(event.target)) {
        return;
      }

      setIsNavigationDrawerOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      setIsNavigationDrawerOpen(false);
      navigationToggleButtonRef.current?.focus();
    };

    document.addEventListener("mousedown", handlePointerInteraction);
    document.addEventListener("touchstart", handlePointerInteraction, { passive: true });
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerInteraction);
      document.removeEventListener("touchstart", handlePointerInteraction);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNavigationDrawerOpen]);

  useEffect(() => {
    if (!isOperationsPanelOpen) {
      return;
    }

    const handlePointerInteraction = (event: MouseEvent | TouchEvent): void => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (operationsPanelRef.current?.contains(event.target)) {
        return;
      }

      if (operationsButtonRef.current?.contains(event.target)) {
        return;
      }

      setIsOperationsPanelOpen(false);
    };

    const handleFocusIn = (event: FocusEvent): void => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (operationsPanelRef.current?.contains(event.target)) {
        return;
      }

      if (operationsButtonRef.current?.contains(event.target)) {
        return;
      }

      setIsOperationsPanelOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      setIsOperationsPanelOpen(false);
      operationsButtonRef.current?.focus();
    };

    document.addEventListener("mousedown", handlePointerInteraction);
    document.addEventListener("touchstart", handlePointerInteraction, { passive: true });
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerInteraction);
      document.removeEventListener("touchstart", handlePointerInteraction);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOperationsPanelOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = (): void => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const updateDialogFocusState = (): void => {
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLElement)) {
        setIsDialogFocusActive(false);
        return;
      }

      setIsDialogFocusActive(activeElement.closest('[role="dialog"], [aria-modal="true"]') !== null);
    };

    updateDialogFocusState();
    document.addEventListener("focusin", updateDialogFocusState);
    return () => {
      document.removeEventListener("focusin", updateDialogFocusState);
    };
  }, []);

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

  useKeyboardShortcuts({
    keyboardShortcutsEnabled,
    activeScreenRef,
    undoActionRef,
    redoActionRef,
    fitNetworkToContentRef,
    previousValidationIssueRef,
    nextValidationIssueRef,
    setActiveScreen,
    setActiveSubScreen,
    setInteractionMode
  });

  const describeNode = useCallback((node: NetworkNode): string => {
    if (node.kind === "intermediate") {
      return `Intermediate: ${node.label}`;
    }

    if (node.kind === "connector") {
      const connector = connectorMap.get(node.connectorId);
      return connector === undefined
        ? `Connector node (${node.connectorId})`
        : `Connector: ${connector.name} (${connector.technicalId})`;
    }

    const splice = spliceMap.get(node.spliceId);
    return splice === undefined ? `Splice node (${node.spliceId})` : `Splice: ${splice.name} (${splice.technicalId})`;
  }, [connectorMap, spliceMap]);
  const nodeLabelById = useMemo(() => {
    const result = new Map<NodeId, string>();
    for (const node of nodes) {
      result.set(node.id, describeNode(node));
    }
    return result;
  }, [describeNode, nodes]);

  const {
    resetConnectorForm,
    startConnectorEdit,
    handleConnectorSubmit,
    handleConnectorDelete,
    handleReserveCavity,
    handleReleaseCavity
  } = useConnectorHandlers({
    store,
    dispatchAction,
    connectorFormMode,
    setConnectorFormMode,
    editingConnectorId,
    setEditingConnectorId,
    connectorName,
    setConnectorName,
    connectorTechnicalId,
    setConnectorTechnicalId,
    cavityCount,
    setCavityCount,
    setConnectorFormError,
    selectedConnectorId,
    cavityIndexInput,
    connectorOccupantRefInput
  });

  const {
    resetSpliceForm,
    startSpliceEdit,
    handleSpliceSubmit,
    handleSpliceDelete,
    handleReservePort,
    handleReleasePort
  } = useSpliceHandlers({
    store,
    dispatchAction,
    spliceFormMode,
    setSpliceFormMode,
    editingSpliceId,
    setEditingSpliceId,
    spliceName,
    setSpliceName,
    spliceTechnicalId,
    setSpliceTechnicalId,
    portCount,
    setPortCount,
    setSpliceFormError,
    selectedSpliceId,
    portIndexInput,
    spliceOccupantRefInput
  });

  const { resetNodeForm, startNodeEdit, handleNodeSubmit, handleNodeDelete } = useNodeHandlers({
    store,
    state,
    dispatchAction,
    nodeFormMode,
    setNodeFormMode,
    editingNodeId,
    setEditingNodeId,
    nodeIdInput,
    setNodeIdInput,
    nodeKind,
    setNodeKind,
    nodeConnectorId,
    setNodeConnectorId,
    nodeSpliceId,
    setNodeSpliceId,
    nodeLabel,
    setNodeLabel,
    setNodeFormError,
    pendingNewNodePosition,
    setPendingNewNodePosition
  });

  const { resetSegmentForm, startSegmentEdit, handleSegmentSubmit, handleSegmentDelete } = useSegmentHandlers({
    store,
    state,
    dispatchAction,
    segmentFormMode,
    setSegmentFormMode,
    editingSegmentId,
    setEditingSegmentId,
    segmentIdInput,
    setSegmentIdInput,
    segmentNodeA,
    setSegmentNodeA,
    segmentNodeB,
    setSegmentNodeB,
    segmentLengthMm,
    setSegmentLengthMm,
    segmentSubNetworkTag,
    setSegmentSubNetworkTag,
    setSegmentFormError
  });

  const {
    resetWireForm,
    startWireEdit,
    handleWireSubmit,
    handleWireDelete,
    handleLockWireRoute,
    handleResetWireRoute
  } = useWireHandlers({
    store,
    dispatchAction,
    wireFormMode,
    setWireFormMode,
    editingWireId,
    setEditingWireId,
    wireName,
    setWireName,
    wireTechnicalId,
    setWireTechnicalId,
    wireEndpointAKind,
    setWireEndpointAKind,
    wireEndpointAConnectorId,
    setWireEndpointAConnectorId,
    wireEndpointACavityIndex,
    setWireEndpointACavityIndex,
    wireEndpointASpliceId,
    setWireEndpointASpliceId,
    wireEndpointAPortIndex,
    setWireEndpointAPortIndex,
    wireEndpointBKind,
    setWireEndpointBKind,
    wireEndpointBConnectorId,
    setWireEndpointBConnectorId,
    wireEndpointBCavityIndex,
    setWireEndpointBCavityIndex,
    wireEndpointBSpliceId,
    setWireEndpointBSpliceId,
    wireEndpointBPortIndex,
    setWireEndpointBPortIndex,
    wireForcedRouteInput,
    setWireForcedRouteInput,
    setWireFormError,
    selectedWire
  });

  const {
    handleFocusCurrentSelectionOnCanvas,
    handleOpenValidationScreen,
    moveValidationIssueCursor,
    moveVisibleValidationIssueCursor,
    handleValidationIssueRowGoTo,
    handleOpenSelectionInInspector,
    handleStartSelectedEdit
  } = useSelectionHandlers({
    state,
    dispatchAction,
    segmentMap,
    networkNodePositions,
    connectorNodeByConnectorId,
    spliceNodeBySpliceId,
    setInteractionMode,
    networkScale,
    setNetworkScale,
    setNetworkOffset,
    selected,
    selectedSubScreen,
    selectedConnector,
    selectedSplice,
    selectedNode,
    selectedSegment,
    selectedWire,
    setActiveScreen,
    setActiveSubScreen,
    orderedValidationIssues,
    visibleValidationIssues,
    getFocusedValidationIssueByCursor,
    setValidationIssueCursorFromIssue,
    setValidationSearchQuery,
    setValidationCategoryFilter,
    setValidationSeverityFilter,
    startConnectorEdit,
    startSpliceEdit,
    startNodeEdit,
    startSegmentEdit,
    startWireEdit
  });

  const {
    handleNetworkSegmentClick,
    handleNetworkNodeClick,
    handleNetworkCanvasClick,
    handleNetworkNodeMouseDown,
    handleNetworkCanvasMouseDown,
    handleNetworkWheel,
    handleZoomAction,
    handleNetworkMouseMove,
    stopNetworkNodeDrag
  } = useCanvasInteractionHandlers({
    state,
    nodesCount: nodes.length,
    interactionMode,
    modeAnchorNodeId,
    setModeAnchorNodeId,
    setActiveScreen,
    setActiveSubScreen,
    setSegmentFormMode,
    setEditingSegmentId,
    setSegmentFormError,
    setSegmentNodeA,
    setSegmentNodeB,
    setRoutePreviewStartNodeId,
    routePreviewStartNodeId,
    setRoutePreviewEndNodeId,
    routePreviewEndNodeId,
    setWireFormMode,
    setEditingWireId,
    setWireFormError,
    setWireEndpointAKind,
    setWireEndpointAConnectorId,
    setWireEndpointASpliceId,
    setWireEndpointBKind,
    setWireEndpointBConnectorId,
    setWireEndpointBSpliceId,
    setNodeFormMode,
    setEditingNodeId,
    setNodeKind,
    setNodeIdInput,
    setNodeConnectorId,
    setNodeSpliceId,
    setNodeLabel,
    setNodeFormError,
    setPendingNewNodePosition,
    snapNodesToGrid,
    networkOffset,
    networkScale,
    setNetworkScale,
    setNetworkOffset,
    draggingNodeId,
    setDraggingNodeId,
    manualNodePositions,
    setManualNodePositions,
    setIsPanningNetwork,
    panStartRef,
    dispatchAction,
    persistNodePosition: (nodeId, position) =>
      dispatchAction(appActions.setNodePosition(nodeId, position), { trackHistory: false }),
    resetNetworkViewToConfiguredScale
  });

  const interactionModeHint =
    interactionMode === "select"
      ? "Select mode: node drag-and-drop and network selection are active."
      : interactionMode === "addNode"
        ? pendingNewNodePosition === null
          ? "Add Node mode: click on empty canvas area to prepare an intermediate node placement."
          : `Add Node mode: placement captured at x=${Math.round(pendingNewNodePosition.x)}, y=${Math.round(
              pendingNewNodePosition.y
            )}. Complete Node ID then create.`
        : interactionMode === "addSegment"
          ? modeAnchorNodeId === null
            ? "Add Segment mode: click first node, then second node to prefill segment endpoints."
            : `Add Segment mode: first node '${modeAnchorNodeId}' selected. Click second node.`
          : interactionMode === "connect"
            ? modeAnchorNodeId === null
              ? "Connect mode: click first connector/splice node to set wire endpoint A."
              : `Connect mode: endpoint A captured on '${modeAnchorNodeId}'. Click second connector/splice node.`
            : "Route mode: click start node then end node to fill route preview.";
  const currentValidationIssue = getValidationIssueByCursor();
  const issueNavigationScopeIssues = isValidationScreen ? visibleValidationIssues : orderedValidationIssues;
  const issueNavigationScopeLabel = isValidationScreen ? "Filtered issues" : "All issues";
  const currentIssuePositionInScope =
    currentValidationIssue === null ? -1 : issueNavigationScopeIssues.findIndex((issue) => issue.id === currentValidationIssue.id);
  const issueNavigatorDisplay =
    issueNavigationScopeIssues.length === 0
      ? "No issue"
      : `${currentIssuePositionInScope >= 0 ? currentIssuePositionInScope + 1 : 1}/${issueNavigationScopeIssues.length}`;
  const networkScalePercent = Math.round(networkScale * 100);
  const selectedConnectorOccupiedCount =
    selectedConnector === null
      ? 0
      : selectConnectorCavityStatuses(state, selectedConnector.id).filter((slot) => slot.isOccupied).length;
  const selectedSpliceOccupiedCount =
    selectedSplice === null
      ? 0
      : selectSplicePortStatuses(state, selectedSplice.id).filter((slot) => slot.isOccupied).length;
  const isInspectorVisibilityScreen = isModelingScreen || isAnalysisScreen || isValidationScreen;
  const hasInspectableSelection = selected !== null && selectedSubScreen !== null;
  const isInspectorNarrowViewport = viewportWidth < 960;
  const isModalDialogFocusActive = isDialogFocusActive || isNavigationDrawerOpen || isOperationsPanelOpen;
  const isInspectorHidden = !isInspectorVisibilityScreen || !hasActiveNetwork || isModalDialogFocusActive;
  const isInspectorAutoCollapsed = !hasInspectableSelection || isInspectorNarrowViewport;
  const canExpandInspectorFromCollapsed = hasInspectableSelection && isInspectorNarrowViewport;
  const isInspectorOpen =
    !isInspectorHidden &&
    (!isInspectorAutoCollapsed || (canExpandInspectorFromCollapsed && isInspectorExpandedOnNarrowViewport));

  useEffect(() => {
    if (isInspectorHidden || !canExpandInspectorFromCollapsed) {
      setIsInspectorExpandedOnNarrowViewport(false);
    }
  }, [canExpandInspectorFromCollapsed, isInspectorHidden]);

  const inspectorContextPanel = (
    <InspectorContextPanel
      mode={isInspectorOpen ? "open" : "collapsed"}
      canExpandFromCollapsed={canExpandInspectorFromCollapsed}
      canCollapseToCollapsed={canExpandInspectorFromCollapsed}
      onExpandFromCollapsed={() => setIsInspectorExpandedOnNarrowViewport(true)}
      onCollapseToCollapsed={() => setIsInspectorExpandedOnNarrowViewport(false)}
      selected={selected}
      selectedSubScreen={selectedSubScreen}
      selectedConnector={selectedConnector}
      selectedSplice={selectedSplice}
      selectedNode={selectedNode}
      selectedSegment={selectedSegment}
      selectedWire={selectedWire}
      connectorOccupiedCount={selectedConnectorOccupiedCount}
      spliceOccupiedCount={selectedSpliceOccupiedCount}
      describeNode={describeNode}
      onOpenInInspector={handleOpenSelectionInInspector}
      onEditSelected={handleStartSelectedEdit}
      onFocusCanvas={handleFocusCurrentSelectionOnCanvas}
      onClearSelection={() => dispatchAction(appActions.clearSelection())}
    />
  );

  const networkSummaryPanel = (
    <NetworkSummaryPanel
      interactionMode={interactionMode}
      setInteractionMode={setInteractionMode}
      handleZoomAction={handleZoomAction}
      fitNetworkToContent={fitNetworkToContent}
      showNetworkGrid={showNetworkGrid}
      snapNodesToGrid={snapNodesToGrid}
      toggleShowNetworkGrid={() => setShowNetworkGrid((current) => !current)}
      toggleSnapNodesToGrid={() => setSnapNodesToGrid((current) => !current)}
      interactionModeHint={interactionModeHint}
      networkScalePercent={networkScalePercent}
      routingGraphNodeCount={routingGraph.nodeIds.length}
      routingGraphSegmentCount={routingGraph.segmentIds.length}
      totalEdgeEntries={totalEdgeEntries}
      nodes={nodes}
      segments={segments}
      isPanningNetwork={isPanningNetwork}
      networkViewWidth={NETWORK_VIEW_WIDTH}
      networkViewHeight={NETWORK_VIEW_HEIGHT}
      networkGridStep={NETWORK_GRID_STEP}
      networkOffset={networkOffset}
      networkScale={networkScale}
      handleNetworkCanvasMouseDown={handleNetworkCanvasMouseDown}
      handleNetworkCanvasClick={handleNetworkCanvasClick}
      handleNetworkWheel={handleNetworkWheel}
      handleNetworkMouseMove={handleNetworkMouseMove}
      stopNetworkNodeDrag={stopNetworkNodeDrag}
      networkNodePositions={networkNodePositions}
      selectedWireRouteSegmentIds={selectedWireRouteSegmentIds}
      selectedSegmentId={selectedSegmentId}
      handleNetworkSegmentClick={handleNetworkSegmentClick}
      selectedNodeId={selectedNodeId}
      handleNetworkNodeMouseDown={handleNetworkNodeMouseDown}
      handleNetworkNodeClick={handleNetworkNodeClick}
      connectorMap={connectorMap}
      spliceMap={spliceMap}
      describeNode={describeNode}
      subNetworkSummaries={subNetworkSummaries}
      selectedConnector={selectedConnector}
      selectedSplice={selectedSplice}
      selectedNode={selectedNode}
      selectedSegment={selectedSegment}
      selectedWire={selectedWire}
      routePreviewStartNodeId={routePreviewStartNodeId}
      setRoutePreviewStartNodeId={setRoutePreviewStartNodeId}
      routePreviewEndNodeId={routePreviewEndNodeId}
      setRoutePreviewEndNodeId={setRoutePreviewEndNodeId}
      routePreview={routePreview}
      onRegenerateLayout={handleRegenerateLayout}
    />
  );

  return (
    <main className={appShellClassName}>
      <AppHeaderAndStats
        headerBlockRef={headerBlockRef}
        isNavigationDrawerOpen={isNavigationDrawerOpen}
        onToggleNavigationDrawer={handleToggleNavigationDrawer}
        navigationToggleButtonRef={navigationToggleButtonRef}
        isSettingsActive={isSettingsScreen}
        onOpenSettings={handleOpenSettingsScreen}
        isInstallPromptAvailable={isInstallPromptAvailable}
        onInstallApp={handleInstallApp}
        isPwaUpdateReady={isPwaUpdateReady}
        onApplyPwaUpdate={handleApplyPwaUpdate}
        isOperationsPanelOpen={isOperationsPanelOpen}
        onToggleOperationsPanel={handleToggleOperationsPanel}
        operationsButtonRef={operationsButtonRef}
        validationIssuesCount={validationIssues.length}
        validationErrorCount={validationErrorCount}
        lastError={lastError}
        onClearError={() => dispatchAction(appActions.clearError())}
      />

      <section className="workspace-shell" style={workspaceShellStyle}>
        <button
          type="button"
          className={isNavigationDrawerOpen ? "workspace-drawer-backdrop is-open" : "workspace-drawer-backdrop"}
          aria-label="Close navigation menu"
          onClick={closeNavigationDrawer}
        />
        <div
          id="workspace-navigation-drawer"
          ref={navigationDrawerRef}
          className={isNavigationDrawerOpen ? "workspace-drawer is-open" : "workspace-drawer"}
        >
          <WorkspaceSidebarPanel
            activeScreen={activeScreen}
            activeSubScreen={activeSubScreen}
            isModelingScreen={isModelingScreen}
            isAnalysisScreen={isAnalysisScreen}
            isValidationScreen={isValidationScreen}
            validationIssuesCount={validationIssues.length}
            validationErrorCount={validationErrorCount}
            entityCountBySubScreen={entityCountBySubScreen}
            onScreenChange={setActiveScreen}
            onSubScreenChange={setActiveSubScreen}
          />
        </div>
        <button
          type="button"
          className={isOperationsPanelOpen ? "workspace-ops-backdrop is-open" : "workspace-ops-backdrop"}
          aria-label="Close operations panel"
          onClick={closeOperationsPanel}
        />
        <div
          id="workspace-operations-panel"
          ref={operationsPanelRef}
          className={isOperationsPanelOpen ? "workspace-ops-panel is-open" : "workspace-ops-panel"}
        >
          <OperationsHealthPanel
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            isUndoAvailable={isUndoAvailable}
            isRedoAvailable={isRedoAvailable}
            showShortcutHints={showShortcutHints}
            saveStatus={saveStatus}
            validationIssuesCount={validationIssues.length}
            validationErrorCount={validationErrorCount}
            validationWarningCount={validationWarningCount}
            issueNavigatorDisplay={issueNavigatorDisplay}
            issueNavigationScopeLabel={issueNavigationScopeLabel}
            currentValidationIssue={currentValidationIssue}
            orderedValidationIssues={orderedValidationIssues}
            handleOpenValidationScreen={handleOpenValidationScreen}
            moveValidationIssueCursor={moveValidationIssueCursor}
          />
        </div>

        <section className="workspace-content">
          <NetworkScopeScreen isActive={isNetworkScopeScreen}>
            <NetworkScopeWorkspaceContent
              networks={networks}
              networkSort={networkSort}
              setNetworkSort={setNetworkSort}
              networkEntityCountsById={networkEntityCountsById}
              activeNetworkId={activeNetworkId}
              handleSelectNetwork={handleSelectNetwork}
              handleDuplicateNetwork={handleDuplicateNetwork}
              handleDeleteNetwork={handleDeleteNetwork}
              networkFormMode={networkFormMode}
              handleOpenCreateNetworkForm={handleOpenCreateNetworkForm}
              handleOpenEditNetworkForm={handleOpenEditNetworkForm}
              handleCloseNetworkForm={handleCloseNetworkForm}
              newNetworkName={newNetworkName}
              setNewNetworkName={setNewNetworkName}
              newNetworkTechnicalId={newNetworkTechnicalId}
              setNewNetworkTechnicalId={setNewNetworkTechnicalId}
              newNetworkDescription={newNetworkDescription}
              setNewNetworkDescription={setNewNetworkDescription}
              networkFormError={networkFormError}
              networkTechnicalIdAlreadyUsed={networkTechnicalIdAlreadyUsed}
              handleSubmitNetworkForm={handleSubmitNetworkForm}
            />
          </NetworkScopeScreen>

          {!isNetworkScopeScreen && !hasActiveNetwork ? (
            <section className="panel">
              <h2>No active network</h2>
              <p className="empty-copy">
                Create a network from the network scope controls to start modeling connectors, splices, nodes, segments, and wires.
              </p>
            </section>
          ) : !isNetworkScopeScreen ? (
            <>
          <ModelingScreen isActive={isModelingScreen}>
        <section className="workspace-stage">
          <section className="panel-grid workspace-column workspace-column-left">
            <ModelingPrimaryTables
              isConnectorSubScreen={isConnectorSubScreen}
              connectorFormMode={connectorFormMode}
              onOpenCreateConnector={resetConnectorForm}
              connectorOccupancyFilter={connectorOccupancyFilter}
              setConnectorOccupancyFilter={setConnectorOccupancyFilter}
              connectors={connectors}
              visibleConnectors={visibleConnectors}
              connectorSort={connectorSort}
              setConnectorSort={setConnectorSort}
              getSortIndicator={getSortIndicator}
              connectorOccupiedCountById={connectorOccupiedCountById}
              selectedConnectorId={selectedConnectorId}
              onEditConnector={startConnectorEdit}
              onDeleteConnector={handleConnectorDelete}
              isSpliceSubScreen={isSpliceSubScreen}
              spliceFormMode={spliceFormMode}
              onOpenCreateSplice={resetSpliceForm}
              spliceOccupancyFilter={spliceOccupancyFilter}
              setSpliceOccupancyFilter={setSpliceOccupancyFilter}
              splices={splices}
              visibleSplices={visibleSplices}
              spliceSort={spliceSort}
              setSpliceSort={setSpliceSort}
              spliceOccupiedCountById={spliceOccupiedCountById}
              selectedSpliceId={selectedSpliceId}
              onEditSplice={startSpliceEdit}
              onDeleteSplice={handleSpliceDelete}
              isNodeSubScreen={isNodeSubScreen}
              nodeFormMode={nodeFormMode}
              onOpenCreateNode={resetNodeForm}
              nodeKindFilter={nodeKindFilter}
              setNodeKindFilter={setNodeKindFilter}
              nodes={nodes}
              visibleNodes={visibleNodes}
              nodeIdSortDirection={nodeIdSortDirection}
              setNodeIdSortDirection={setNodeIdSortDirection}
              segmentsCountByNodeId={segmentsCountByNodeId}
              selectedNodeId={selectedNodeId}
              describeNode={describeNode}
              onEditNode={startNodeEdit}
              onDeleteNode={handleNodeDelete}
            />

            <ModelingSecondaryTables
              isSegmentSubScreen={isSegmentSubScreen}
              segmentFormMode={segmentFormMode}
              onOpenCreateSegment={resetSegmentForm}
              segmentSubNetworkFilter={segmentSubNetworkFilter}
              setSegmentSubNetworkFilter={setSegmentSubNetworkFilter}
              segments={segments}
              visibleSegments={visibleSegments}
              segmentIdSortDirection={segmentIdSortDirection}
              setSegmentIdSortDirection={setSegmentIdSortDirection}
              nodeLabelById={nodeLabelById}
              selectedSegmentId={selectedSegmentId}
              selectedWireRouteSegmentIds={selectedWireRouteSegmentIds}
              onEditSegment={startSegmentEdit}
              onDeleteSegment={handleSegmentDelete}
              isWireSubScreen={isWireSubScreen}
              wireFormMode={wireFormMode}
              onOpenCreateWire={resetWireForm}
              wireRouteFilter={wireRouteFilter}
              setWireRouteFilter={setWireRouteFilter}
              wires={wires}
              visibleWires={visibleWires}
              wireSort={wireSort}
              setWireSort={setWireSort}
              getSortIndicator={getSortIndicator}
              selectedWireId={selectedWireId}
              describeWireEndpoint={describeWireEndpoint}
              onEditWire={startWireEdit}
              onDeleteWire={handleWireDelete}
            />
          </section>
          <ModelingFormsColumn
            isConnectorSubScreen={isConnectorSubScreen}
            connectorFormMode={connectorFormMode}
            handleConnectorSubmit={handleConnectorSubmit}
            connectorName={connectorName}
            setConnectorName={setConnectorName}
            connectorTechnicalId={connectorTechnicalId}
            setConnectorTechnicalId={setConnectorTechnicalId}
            connectorTechnicalIdAlreadyUsed={connectorTechnicalIdAlreadyUsed}
            cavityCount={cavityCount}
            setCavityCount={setCavityCount}
            resetConnectorForm={resetConnectorForm}
            connectorFormError={connectorFormError}
            isSpliceSubScreen={isSpliceSubScreen}
            spliceFormMode={spliceFormMode}
            handleSpliceSubmit={handleSpliceSubmit}
            spliceName={spliceName}
            setSpliceName={setSpliceName}
            spliceTechnicalId={spliceTechnicalId}
            setSpliceTechnicalId={setSpliceTechnicalId}
            spliceTechnicalIdAlreadyUsed={spliceTechnicalIdAlreadyUsed}
            portCount={portCount}
            setPortCount={setPortCount}
            resetSpliceForm={resetSpliceForm}
            spliceFormError={spliceFormError}
            isNodeSubScreen={isNodeSubScreen}
            nodeFormMode={nodeFormMode}
            handleNodeSubmit={handleNodeSubmit}
            nodeIdInput={nodeIdInput}
            setNodeIdInput={setNodeIdInput}
            pendingNewNodePosition={pendingNewNodePosition}
            nodeKind={nodeKind}
            setNodeKind={setNodeKind}
            nodeLabel={nodeLabel}
            setNodeLabel={setNodeLabel}
            connectors={connectors}
            nodeConnectorId={nodeConnectorId}
            setNodeConnectorId={setNodeConnectorId}
            splices={splices}
            nodeSpliceId={nodeSpliceId}
            setNodeSpliceId={setNodeSpliceId}
            resetNodeForm={resetNodeForm}
            nodeFormError={nodeFormError}
            isSegmentSubScreen={isSegmentSubScreen}
            segmentFormMode={segmentFormMode}
            handleSegmentSubmit={handleSegmentSubmit}
            segmentIdInput={segmentIdInput}
            setSegmentIdInput={setSegmentIdInput}
            nodes={nodes}
            describeNode={describeNode}
            segmentNodeA={segmentNodeA}
            setSegmentNodeA={setSegmentNodeA}
            segmentNodeB={segmentNodeB}
            setSegmentNodeB={setSegmentNodeB}
            segmentLengthMm={segmentLengthMm}
            setSegmentLengthMm={setSegmentLengthMm}
            segmentSubNetworkTag={segmentSubNetworkTag}
            setSegmentSubNetworkTag={setSegmentSubNetworkTag}
            resetSegmentForm={resetSegmentForm}
            segmentFormError={segmentFormError}
            isWireSubScreen={isWireSubScreen}
            wireFormMode={wireFormMode}
            handleWireSubmit={handleWireSubmit}
            wireName={wireName}
            setWireName={setWireName}
            wireTechnicalId={wireTechnicalId}
            setWireTechnicalId={setWireTechnicalId}
            wireTechnicalIdAlreadyUsed={wireTechnicalIdAlreadyUsed}
            wireEndpointAKind={wireEndpointAKind}
            setWireEndpointAKind={setWireEndpointAKind}
            wireEndpointAConnectorId={wireEndpointAConnectorId}
            setWireEndpointAConnectorId={setWireEndpointAConnectorId}
            wireEndpointACavityIndex={wireEndpointACavityIndex}
            setWireEndpointACavityIndex={setWireEndpointACavityIndex}
            wireEndpointASpliceId={wireEndpointASpliceId}
            setWireEndpointASpliceId={setWireEndpointASpliceId}
            wireEndpointAPortIndex={wireEndpointAPortIndex}
            setWireEndpointAPortIndex={setWireEndpointAPortIndex}
            wireEndpointBKind={wireEndpointBKind}
            setWireEndpointBKind={setWireEndpointBKind}
            wireEndpointBConnectorId={wireEndpointBConnectorId}
            setWireEndpointBConnectorId={setWireEndpointBConnectorId}
            wireEndpointBCavityIndex={wireEndpointBCavityIndex}
            setWireEndpointBCavityIndex={setWireEndpointBCavityIndex}
            wireEndpointBSpliceId={wireEndpointBSpliceId}
            setWireEndpointBSpliceId={setWireEndpointBSpliceId}
            wireEndpointBPortIndex={wireEndpointBPortIndex}
            setWireEndpointBPortIndex={setWireEndpointBPortIndex}
            resetWireForm={resetWireForm}
            wireFormError={wireFormError}
          />
          <section className="panel-grid workspace-column workspace-column-center">{networkSummaryPanel}</section>
        </section>
      </ModelingScreen>

      <AnalysisScreen isActive={isAnalysisScreen}>
        <AnalysisWorkspaceContent
          isConnectorSubScreen={isConnectorSubScreen}
          isSpliceSubScreen={isSpliceSubScreen}
          isWireSubScreen={isWireSubScreen}
          networkSummaryPanel={networkSummaryPanel}
          selectedConnector={selectedConnector}
          cavityIndexInput={cavityIndexInput}
          setCavityIndexInput={setCavityIndexInput}
          connectorOccupantRefInput={connectorOccupantRefInput}
          setConnectorOccupantRefInput={setConnectorOccupantRefInput}
          handleReserveCavity={handleReserveCavity}
          connectorCavityStatuses={connectorCavityStatuses}
          handleReleaseCavity={handleReleaseCavity}
          sortedConnectorSynthesisRows={sortedConnectorSynthesisRows}
          connectorSynthesisSort={connectorSynthesisSort}
          setConnectorSynthesisSort={setConnectorSynthesisSort}
          getSortIndicator={getSortIndicator}
          selectedSplice={selectedSplice}
          splicePortStatuses={splicePortStatuses}
          portIndexInput={portIndexInput}
          setPortIndexInput={setPortIndexInput}
          spliceOccupantRefInput={spliceOccupantRefInput}
          setSpliceOccupantRefInput={setSpliceOccupantRefInput}
          handleReservePort={handleReservePort}
          handleReleasePort={handleReleasePort}
          sortedSpliceSynthesisRows={sortedSpliceSynthesisRows}
          spliceSynthesisSort={spliceSynthesisSort}
          setSpliceSynthesisSort={setSpliceSynthesisSort}
          selectedWire={selectedWire}
          describeWireEndpoint={describeWireEndpoint}
          wireForcedRouteInput={wireForcedRouteInput}
          setWireForcedRouteInput={setWireForcedRouteInput}
          handleLockWireRoute={handleLockWireRoute}
          handleResetWireRoute={handleResetWireRoute}
          wireFormError={wireFormError}
        />
      </AnalysisScreen>

      <ValidationScreen isActive={isValidationScreen}>
        <ValidationWorkspaceContent
          validationSeverityFilter={validationSeverityFilter}
          setValidationSeverityFilter={setValidationSeverityFilter}
          validationIssuesForSeverityCounts={validationIssuesForSeverityCounts}
          validationSeverityCountByLevel={validationSeverityCountByLevel}
          validationCategoryFilter={validationCategoryFilter}
          setValidationCategoryFilter={setValidationCategoryFilter}
          validationIssuesForCategoryCounts={validationIssuesForCategoryCounts}
          validationCategories={validationCategories}
          validationCategoryCountByName={validationCategoryCountByName}
          moveVisibleValidationIssueCursor={moveVisibleValidationIssueCursor}
          visibleValidationIssues={visibleValidationIssues}
          clearValidationFilters={clearValidationFilters}
          validationIssues={validationIssues}
          groupedValidationIssues={groupedValidationIssues}
          findValidationIssueIndex={findValidationIssueIndex}
          validationIssueCursor={validationIssueCursor}
          handleValidationIssueRowGoTo={handleValidationIssueRowGoTo}
          validationErrorCount={validationErrorCount}
          validationWarningCount={validationWarningCount}
        />
      </ValidationScreen>

      <SettingsScreen isActive={isSettingsScreen}>
        <SettingsWorkspaceContent
          isCurrentWorkspaceEmpty={isCurrentWorkspaceEmpty}
          hasBuiltInSampleState={hasBuiltInSampleState}
          handleRecreateSampleNetwork={handleRecreateSampleNetwork}
          handleResetSampleNetwork={handleResetSampleNetwork}
          activeNetworkId={activeNetworkId}
          selectedExportNetworkIds={selectedExportNetworkIds}
          handleExportNetworks={handleExportNetworks}
          networks={networks}
          toggleSelectedExportNetwork={toggleSelectedExportNetwork}
          handleOpenImportPicker={handleOpenImportPicker}
          importFileInputRef={importFileInputRef}
          handleImportFileChange={handleImportFileChange}
          importExportStatus={importExportStatus}
          lastImportSummary={lastImportSummary}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          tableDensity={tableDensity}
          setTableDensity={setTableDensity}
          defaultSortField={defaultSortField}
          setDefaultSortField={setDefaultSortField}
          defaultSortDirection={defaultSortDirection}
          setDefaultSortDirection={setDefaultSortDirection}
          defaultIdSortDirection={defaultIdSortDirection}
          setDefaultIdSortDirection={setDefaultIdSortDirection}
          applyListSortDefaults={applyListSortDefaults}
          canvasDefaultShowGrid={canvasDefaultShowGrid}
          setCanvasDefaultShowGrid={setCanvasDefaultShowGrid}
          canvasDefaultSnapToGrid={canvasDefaultSnapToGrid}
          setCanvasDefaultSnapToGrid={setCanvasDefaultSnapToGrid}
          canvasResetZoomPercentInput={canvasResetZoomPercentInput}
          setCanvasResetZoomPercentInput={setCanvasResetZoomPercentInput}
          configuredResetZoomPercent={configuredResetZoomPercent}
          applyCanvasDefaultsNow={applyCanvasDefaultsNow}
          handleZoomAction={handleZoomAction}
          showShortcutHints={showShortcutHints}
          setShowShortcutHints={setShowShortcutHints}
          keyboardShortcutsEnabled={keyboardShortcutsEnabled}
          setKeyboardShortcutsEnabled={setKeyboardShortcutsEnabled}
          resetWorkspacePreferencesToDefaults={resetWorkspacePreferencesToDefaults}
        />
      </SettingsScreen>
            </>
          ) : null}
        </section>
      </section>
      {!isInspectorHidden ? (
        <aside
          className={isInspectorOpen ? "workspace-inspector-panel is-open" : "workspace-inspector-panel is-collapsed"}
          aria-label="Inspector context panel"
        >
          {inspectorContextPanel}
        </aside>
      ) : null}
    </main>
  );
}
