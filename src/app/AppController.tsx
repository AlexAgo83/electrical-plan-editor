import {
  Suspense,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from "react";
import appPackageMetadata from "../../package.json";
import type {
  ConnectorId,
  NodeId,
  SegmentId,
  SpliceId,
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
import { NetworkSummaryPanel as NetworkSummaryPanelEager } from "./components/NetworkSummaryPanel";
import { AnalysisWorkspaceContainer } from "./components/containers/AnalysisWorkspaceContainer";
import { ModelingWorkspaceContainer } from "./components/containers/ModelingWorkspaceContainer";
import { NetworkScopeWorkspaceContainer } from "./components/containers/NetworkScopeWorkspaceContainer";
import { SettingsWorkspaceContainer } from "./components/containers/SettingsWorkspaceContainer";
import { ValidationWorkspaceContainer } from "./components/containers/ValidationWorkspaceContainer";
import { AnalysisScreen as AnalysisScreenEager } from "./components/screens/AnalysisScreen";
import { ModelingScreen as ModelingScreenEager } from "./components/screens/ModelingScreen";
import { NetworkScopeScreen as NetworkScopeScreenEager } from "./components/screens/NetworkScopeScreen";
import { SettingsScreen as SettingsScreenEager } from "./components/screens/SettingsScreen";
import { ValidationScreen as ValidationScreenEager } from "./components/screens/ValidationScreen";
import { AppHeaderAndStats } from "./components/workspace/AppHeaderAndStats";
import { AnalysisWorkspaceContent as AnalysisWorkspaceContentEager } from "./components/workspace/AnalysisWorkspaceContent";
import { ModelingFormsColumn as ModelingFormsColumnEager } from "./components/workspace/ModelingFormsColumn";
import { ModelingPrimaryTables as ModelingPrimaryTablesEager } from "./components/workspace/ModelingPrimaryTables";
import { ModelingSecondaryTables as ModelingSecondaryTablesEager } from "./components/workspace/ModelingSecondaryTables";
import { NetworkScopeWorkspaceContent as NetworkScopeWorkspaceContentEager } from "./components/workspace/NetworkScopeWorkspaceContent";
import { OperationsHealthPanel } from "./components/workspace/OperationsHealthPanel";
import { SettingsWorkspaceContent as SettingsWorkspaceContentEager } from "./components/workspace/SettingsWorkspaceContent";
import { ValidationWorkspaceContent as ValidationWorkspaceContentEager } from "./components/workspace/ValidationWorkspaceContent";
import { WorkspaceSidebarPanel } from "./components/workspace/WorkspaceSidebarPanel";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useCanvasInteractionHandlers } from "./hooks/useCanvasInteractionHandlers";
import { useCanvasState } from "./hooks/useCanvasState";
import { useConnectorHandlers } from "./hooks/useConnectorHandlers";
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
import { useNodeHandlers } from "./hooks/useNodeHandlers";
import type { BeforeInstallPromptEventLike } from "./hooks/useWorkspaceShellChrome";
import { useSelectionHandlers } from "./hooks/useSelectionHandlers";
import { useSegmentHandlers } from "./hooks/useSegmentHandlers";
import { useSpliceHandlers } from "./hooks/useSpliceHandlers";
import { useStoreHistory } from "./hooks/useStoreHistory";
import { useUiPreferences } from "./hooks/useUiPreferences";
import { useValidationModel } from "./hooks/useValidationModel";
import { useWireEndpointDescriptions } from "./hooks/useWireEndpointDescriptions";
import { useWireHandlers } from "./hooks/useWireHandlers";
import { useWorkspaceShellChrome } from "./hooks/useWorkspaceShellChrome";
import { useWorkspaceHandlers } from "./hooks/useWorkspaceHandlers";
import { useWorkspaceNavigation } from "./hooks/useWorkspaceNavigation";
import {
  clamp,
  HISTORY_LIMIT,
  NETWORK_GRID_STEP,
  NETWORK_MAX_SCALE,
  NETWORK_MIN_SCALE,
  NETWORK_VIEW_HEIGHT,
  NETWORK_VIEW_WIDTH,
} from "./lib/app-utils-shared";
import { createNodePositionMap } from "./lib/app-utils-layout";
import type {
  AppProps,
  CanvasLabelStrokeMode,
  NodePosition,
  SortState,
  SortDirection,
  SortField,
  SubScreenId,
  TableDensity,
  TableFontSize,
} from "./types/app-controller";
import "./styles.css";

export type { AppProps } from "./types/app-controller";

function useAppSnapshot(store: AppStore) {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

const APP_REPOSITORY_URL = "https://github.com/AlexAgo83/electrical-plan-editor";
const SHOULD_LAZY_LOAD_UI_MODULES = !import.meta.env.VITEST;
const NetworkSummaryPanelLazy = lazy(() =>
  import("./components/NetworkSummaryPanel").then((module) => ({ default: module.NetworkSummaryPanel }))
);
const AnalysisScreenLazy = lazy(() =>
  import("./components/screens/AnalysisScreen").then((module) => ({ default: module.AnalysisScreen }))
);
const ModelingScreenLazy = lazy(() =>
  import("./components/screens/ModelingScreen").then((module) => ({ default: module.ModelingScreen }))
);
const NetworkScopeScreenLazy = lazy(() =>
  import("./components/screens/NetworkScopeScreen").then((module) => ({ default: module.NetworkScopeScreen }))
);
const SettingsScreenLazy = lazy(() =>
  import("./components/screens/SettingsScreen").then((module) => ({ default: module.SettingsScreen }))
);
const ValidationScreenLazy = lazy(() =>
  import("./components/screens/ValidationScreen").then((module) => ({ default: module.ValidationScreen }))
);
const AnalysisWorkspaceContentLazy = lazy(() =>
  import("./components/workspace/AnalysisWorkspaceContent").then((module) => ({ default: module.AnalysisWorkspaceContent }))
);
const ModelingFormsColumnLazy = lazy(() =>
  import("./components/workspace/ModelingFormsColumn").then((module) => ({ default: module.ModelingFormsColumn }))
);
const ModelingPrimaryTablesLazy = lazy(() =>
  import("./components/workspace/ModelingPrimaryTables").then((module) => ({ default: module.ModelingPrimaryTables }))
);
const ModelingSecondaryTablesLazy = lazy(() =>
  import("./components/workspace/ModelingSecondaryTables").then((module) => ({ default: module.ModelingSecondaryTables }))
);
const NetworkScopeWorkspaceContentLazy = lazy(() =>
  import("./components/workspace/NetworkScopeWorkspaceContent").then((module) => ({ default: module.NetworkScopeWorkspaceContent }))
);
const SettingsWorkspaceContentLazy = lazy(() =>
  import("./components/workspace/SettingsWorkspaceContent").then((module) => ({ default: module.SettingsWorkspaceContent }))
);
const ValidationWorkspaceContentLazy = lazy(() =>
  import("./components/workspace/ValidationWorkspaceContent").then((module) => ({ default: module.ValidationWorkspaceContent }))
);
const NetworkSummaryPanel = SHOULD_LAZY_LOAD_UI_MODULES ? NetworkSummaryPanelLazy : NetworkSummaryPanelEager;
const AnalysisScreen = SHOULD_LAZY_LOAD_UI_MODULES ? AnalysisScreenLazy : AnalysisScreenEager;
const ModelingScreen = SHOULD_LAZY_LOAD_UI_MODULES ? ModelingScreenLazy : ModelingScreenEager;
const NetworkScopeScreen = SHOULD_LAZY_LOAD_UI_MODULES ? NetworkScopeScreenLazy : NetworkScopeScreenEager;
const SettingsScreen = SHOULD_LAZY_LOAD_UI_MODULES ? SettingsScreenLazy : SettingsScreenEager;
const ValidationScreen = SHOULD_LAZY_LOAD_UI_MODULES ? ValidationScreenLazy : ValidationScreenEager;
const AnalysisWorkspaceContent = SHOULD_LAZY_LOAD_UI_MODULES ? AnalysisWorkspaceContentLazy : AnalysisWorkspaceContentEager;
const ModelingFormsColumn = SHOULD_LAZY_LOAD_UI_MODULES ? ModelingFormsColumnLazy : ModelingFormsColumnEager;
const ModelingPrimaryTables = SHOULD_LAZY_LOAD_UI_MODULES ? ModelingPrimaryTablesLazy : ModelingPrimaryTablesEager;
const ModelingSecondaryTables = SHOULD_LAZY_LOAD_UI_MODULES ? ModelingSecondaryTablesLazy : ModelingSecondaryTablesEager;
const NetworkScopeWorkspaceContent = SHOULD_LAZY_LOAD_UI_MODULES ? NetworkScopeWorkspaceContentLazy : NetworkScopeWorkspaceContentEager;
const SettingsWorkspaceContent = SHOULD_LAZY_LOAD_UI_MODULES ? SettingsWorkspaceContentLazy : SettingsWorkspaceContentEager;
const ValidationWorkspaceContent = SHOULD_LAZY_LOAD_UI_MODULES ? ValidationWorkspaceContentLazy : ValidationWorkspaceContentEager;

export function AppController({ store = appStore }: AppProps): ReactElement {
  const currentYear = new Date().getFullYear();
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
  const networkEntityCountsById = useNetworkEntityCountsById(networks, state.networkStates);

  const {
    connectorMap,
    spliceMap,
    segmentMap,
    connectorNodeByConnectorId,
    spliceNodeBySpliceId
  } = useEntityRelationshipMaps(connectors, splices, nodes, segments);

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
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [tableDensity, setTableDensity] = useState<TableDensity>("compact");
  const [tableFontSize, setTableFontSize] = useState<TableFontSize>("normal");
  const [defaultSortField, setDefaultSortField] = useState<SortField>("name");
  const [defaultSortDirection, setDefaultSortDirection] = useState<SortDirection>("asc");
  const [defaultIdSortDirection, setDefaultIdSortDirection] = useState<SortDirection>("asc");
  const [networkSort, setNetworkSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [canvasDefaultShowGrid, setCanvasDefaultShowGrid] = useState(true);
  const [canvasDefaultSnapToGrid, setCanvasDefaultSnapToGrid] = useState(true);
  const [canvasDefaultShowInfoPanels, setCanvasDefaultShowInfoPanels] = useState(true);
  const [canvasDefaultShowSegmentLengths, setCanvasDefaultShowSegmentLengths] = useState(false);
  const [canvasDefaultLabelStrokeMode, setCanvasDefaultLabelStrokeMode] = useState<CanvasLabelStrokeMode>("normal");
  const [showNetworkInfoPanels, setShowNetworkInfoPanels] = useState(true);
  const [showSegmentLengths, setShowSegmentLengths] = useState(false);
  const [networkLabelStrokeMode, setNetworkLabelStrokeMode] = useState<CanvasLabelStrokeMode>("normal");
  const [canvasResetZoomPercentInput, setCanvasResetZoomPercentInput] = useState("100");
  const [showShortcutHints, setShowShortcutHints] = useState(false);
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);
  const [preferencesHydrated, setPreferencesHydrated] = useState(false);
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
  } = useWorkspaceNavigation();
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
    setActiveScreen,
    navigationDrawerRef,
    navigationToggleButtonRef,
    operationsPanelRef,
    operationsButtonRef,
    deferredInstallPromptRef
  });
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
  const selectedWireRouteInputValue = selectedWire === null ? "" : selectedWire.routeSegmentIds.join(", ");

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
  const themeClassNamesByMode: Record<ThemeMode, string[]> = {
    normal: ["theme-normal"],
    dark: ["theme-dark"],
    slateNeon: ["theme-dark", "theme-slate-neon"],
    paperBlueprint: ["theme-normal", "theme-paper-blueprint"],
    warmBrown: ["theme-normal", "theme-warm-brown"],
    deepGreen: ["theme-dark", "theme-deep-green"]
  };
  const resolvedThemeClassNames = themeClassNamesByMode[themeMode] ?? themeClassNamesByMode.normal;
  const appShellClassName = [
    "app-shell",
    tableDensity === "compact" ? "table-density-compact" : "",
    `table-font-${tableFontSize}`,
    ...resolvedThemeClassNames
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

  const { describeWireEndpoint, describeWireEndpointId } = useWireEndpointDescriptions({
    connectorMap,
    spliceMap
  });

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
    setWireForcedRouteInput(selectedWireRouteInputValue);
  }, [selectedWireId, selectedWireRouteInputValue, setWireForcedRouteInput]);

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
    tableFontSize,
    defaultSortField,
    defaultSortDirection,
    defaultIdSortDirection,
    canvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    canvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentLengths,
    canvasDefaultLabelStrokeMode,
    canvasResetZoomPercentInput,
    showShortcutHints,
    keyboardShortcutsEnabled,
    preferencesHydrated,
    setTableDensity,
    setTableFontSize,
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
    setCanvasDefaultShowInfoPanels,
    setCanvasDefaultShowSegmentLengths,
    setCanvasDefaultLabelStrokeMode,
    setShowNetworkGrid,
    setSnapNodesToGrid,
    setShowNetworkInfoPanels,
    setShowSegmentLengths,
    setNetworkLabelStrokeMode,
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
    canvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentLengths,
    canvasDefaultLabelStrokeMode,
    setShowNetworkGrid,
    setSnapNodesToGrid,
    setShowNetworkInfoPanels,
    setShowSegmentLengths,
    setNetworkLabelStrokeMode,
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
    setTableFontSize,
    setDefaultSortField,
    setDefaultSortDirection,
    setDefaultIdSortDirection,
    setCanvasDefaultShowGrid,
    setCanvasDefaultSnapToGrid,
    setCanvasDefaultShowInfoPanels,
    setCanvasDefaultShowSegmentLengths,
    setCanvasDefaultLabelStrokeMode,
    setCanvasResetZoomPercentInput,
    setShowShortcutHints,
    setKeyboardShortcutsEnabled
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

  useKeyboardShortcuts({
    keyboardShortcutsEnabled,
    activeScreenRef,
    undoActionRef,
    redoActionRef,
    fitNetworkToContentRef,
    previousValidationIssueRef,
    nextValidationIssueRef,
    setActiveScreen,
    setActiveSubScreen
  });

  const { describeNode, nodeLabelById } = useNodeDescriptions(nodes, connectorMap, spliceMap);

  const {
    resetConnectorForm,
    clearConnectorForm,
    cancelConnectorEdit,
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
    clearSpliceForm,
    cancelSpliceEdit,
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

  const { resetNodeForm, clearNodeForm, cancelNodeEdit, startNodeEdit, handleNodeSubmit, handleNodeDelete } = useNodeHandlers({
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

  const { resetSegmentForm, clearSegmentForm, cancelSegmentEdit, startSegmentEdit, handleSegmentSubmit, handleSegmentDelete } = useSegmentHandlers({
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
    clearWireForm,
    cancelWireEdit,
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
    handleOpenSelectionInAnalysis,
    handleOpenValidationScreen,
    moveValidationIssueCursor,
    moveVisibleValidationIssueCursor,
    handleValidationIssueRowGoTo,
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

  const { clearAllModelingForms } = useModelingFormSelectionSync({
    activeSubScreen,
    connectorFormMode,
    spliceFormMode,
    nodeFormMode,
    segmentFormMode,
    wireFormMode,
    selectedConnectorId,
    selectedSpliceId,
    selectedNodeId,
    selectedSegmentId,
    selectedWireId,
    clearConnectorForm,
    clearSpliceForm,
    clearNodeForm,
    clearSegmentForm,
    clearWireForm
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
    isModelingScreen,
    activeSubScreen,
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
    resetNetworkViewToConfiguredScale,
    startConnectorEdit,
    startSpliceEdit,
    startNodeEdit,
    startSegmentEdit
  });

  const currentValidationIssue = getValidationIssueByCursor();
  const { issueNavigationScopeLabel, issueNavigatorDisplay } = useIssueNavigatorModel({
    isValidationScreen,
    currentValidationIssue,
    orderedValidationIssues,
    visibleValidationIssues
  });
  const networkScalePercent = Math.round(networkScale * 100);
  const selectedConnectorOccupiedCount =
    selectedConnector === null
      ? 0
      : selectConnectorCavityStatuses(state, selectedConnector.id).filter((slot) => slot.isOccupied).length;
  const selectedSpliceOccupiedCount =
    selectedSplice === null
      ? 0
      : selectSplicePortStatuses(state, selectedSplice.id).filter((slot) => slot.isOccupied).length;
  const hasInspectableSelection = selected !== null && selectedSubScreen !== null;
  const {
    isInspectorHidden,
    canExpandInspectorFromCollapsed,
    isInspectorOpen,
    setIsInspectorExpandedOnNarrowViewport
  } = useInspectorPanelVisibility({
    isModelingScreen,
    isAnalysisScreen,
    isValidationScreen,
    hasActiveNetwork,
    hasInspectableSelection,
    viewportWidth,
    isDialogFocusActive,
    isNavigationDrawerOpen,
    isOperationsPanelOpen
  });
  const inspectorContextPanelProps = {
    mode: isInspectorOpen ? "open" : "collapsed",
    canExpandFromCollapsed: canExpandInspectorFromCollapsed,
    canCollapseToCollapsed: canExpandInspectorFromCollapsed,
    onExpandFromCollapsed: () => setIsInspectorExpandedOnNarrowViewport(true),
    onCollapseToCollapsed: () => setIsInspectorExpandedOnNarrowViewport(false),
    selected,
    selectedSubScreen,
    selectedConnector,
    selectedSplice,
    selectedNode,
    selectedSegment,
    selectedWire,
    connectorOccupiedCount: selectedConnectorOccupiedCount,
    spliceOccupiedCount: selectedSpliceOccupiedCount,
    describeNode,
    onEditSelected: handleStartSelectedEdit,
    onOpenAnalysis: handleOpenSelectionInAnalysis,
    onClearSelection: () => {
      dispatchAction(appActions.clearSelection());
      clearAllModelingForms();
    }
  } satisfies ComponentProps<typeof InspectorContextPanel>;
  const inspectorContextPanel = <InspectorContextPanel {...inspectorContextPanelProps} />;

  const networkSummaryPanelProps = {
    handleZoomAction,
    fitNetworkToContent,
    showNetworkGrid,
    snapNodesToGrid,
    showNetworkInfoPanels,
    showSegmentLengths,
    labelStrokeMode: networkLabelStrokeMode,
    toggleShowNetworkInfoPanels: () => setShowNetworkInfoPanels((current) => !current),
    toggleShowSegmentLengths: () => setShowSegmentLengths((current) => !current),
    toggleShowNetworkGrid: () => setShowNetworkGrid((current) => !current),
    toggleSnapNodesToGrid: () => setSnapNodesToGrid((current) => !current),
    networkScalePercent,
    routingGraphNodeCount: routingGraph.nodeIds.length,
    routingGraphSegmentCount: routingGraph.segmentIds.length,
    totalEdgeEntries,
    nodes,
    segments,
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
    handleNetworkNodeMouseDown,
    handleNetworkNodeClick,
    connectorMap,
    spliceMap,
    describeNode,
    subNetworkSummaries,
    routePreviewStartNodeId,
    setRoutePreviewStartNodeId,
    routePreviewEndNodeId,
    setRoutePreviewEndNodeId,
    routePreview,
    onRegenerateLayout: handleRegenerateLayout
  } satisfies ComponentProps<typeof NetworkSummaryPanelEager>;
  const networkSummaryPanel = <NetworkSummaryPanel {...networkSummaryPanelProps} />;
  const networkScopeWorkspaceProps = {
    networks,
    networkSort,
    setNetworkSort,
    networkEntityCountsById,
    activeNetworkId,
    handleSelectNetwork,
    handleDuplicateNetwork,
    handleDeleteNetwork,
    networkFormMode,
    handleOpenCreateNetworkForm,
    handleOpenEditNetworkForm,
    handleCloseNetworkForm,
    newNetworkName,
    setNewNetworkName,
    newNetworkTechnicalId,
    setNewNetworkTechnicalId,
    newNetworkDescription,
    setNewNetworkDescription,
    networkFormError,
    networkTechnicalIdAlreadyUsed,
    handleSubmitNetworkForm,
    focusRequestedNetworkId: networkFocusRequest.id,
    focusRequestedNetworkToken: networkFocusRequest.token
  } satisfies ComponentProps<typeof NetworkScopeWorkspaceContentEager>;
  const modelingPrimaryTablesProps = {
    isConnectorSubScreen,
    connectorFormMode,
    onOpenCreateConnector: resetConnectorForm,
    connectorOccupancyFilter,
    setConnectorOccupancyFilter,
    connectors,
    visibleConnectors,
    connectorSort,
    setConnectorSort,
    getSortIndicator,
    connectorOccupiedCountById,
    selectedConnectorId,
    onEditConnector: startConnectorEdit,
    onDeleteConnector: handleConnectorDelete,
    isSpliceSubScreen,
    spliceFormMode,
    onOpenCreateSplice: resetSpliceForm,
    spliceOccupancyFilter,
    setSpliceOccupancyFilter,
    splices,
    visibleSplices,
    spliceSort,
    setSpliceSort,
    spliceOccupiedCountById,
    selectedSpliceId,
    onEditSplice: startSpliceEdit,
    onDeleteSplice: handleSpliceDelete,
    isNodeSubScreen,
    nodeFormMode,
    onOpenCreateNode: resetNodeForm,
    nodeKindFilter,
    setNodeKindFilter,
    nodes,
    visibleNodes,
    nodeIdSortDirection,
    setNodeIdSortDirection,
    segmentsCountByNodeId,
    selectedNodeId,
    describeNode,
    onEditNode: startNodeEdit,
    onDeleteNode: handleNodeDelete
  } satisfies ComponentProps<typeof ModelingPrimaryTablesEager>;
  const modelingSecondaryTablesProps = {
    isSegmentSubScreen,
    segmentFormMode,
    onOpenCreateSegment: resetSegmentForm,
    segmentSubNetworkFilter,
    setSegmentSubNetworkFilter,
    segments,
    visibleSegments,
    segmentIdSortDirection,
    setSegmentIdSortDirection,
    nodeLabelById,
    selectedSegmentId,
    selectedWireRouteSegmentIds,
    onEditSegment: startSegmentEdit,
    onDeleteSegment: handleSegmentDelete,
    isWireSubScreen,
    wireFormMode,
    onOpenCreateWire: resetWireForm,
    wireRouteFilter,
    setWireRouteFilter,
    wires,
    visibleWires,
    wireSort,
    setWireSort,
    getSortIndicator,
    selectedWireId,
    describeWireEndpoint,
    describeWireEndpointId,
    onEditWire: startWireEdit,
    onDeleteWire: handleWireDelete
  } satisfies ComponentProps<typeof ModelingSecondaryTablesEager>;
  const modelingFormsColumnProps = {
    isConnectorSubScreen,
    connectorFormMode,
    openCreateConnectorForm: resetConnectorForm,
    handleConnectorSubmit,
    connectorName,
    setConnectorName,
    connectorTechnicalId,
    setConnectorTechnicalId,
    connectorTechnicalIdAlreadyUsed,
    cavityCount,
    setCavityCount,
    cancelConnectorEdit,
    connectorFormError,
    isSpliceSubScreen,
    spliceFormMode,
    openCreateSpliceForm: resetSpliceForm,
    handleSpliceSubmit,
    spliceName,
    setSpliceName,
    spliceTechnicalId,
    setSpliceTechnicalId,
    spliceTechnicalIdAlreadyUsed,
    portCount,
    setPortCount,
    cancelSpliceEdit,
    spliceFormError,
    isNodeSubScreen,
    nodeFormMode,
    openCreateNodeForm: resetNodeForm,
    handleNodeSubmit,
    nodeIdInput,
    setNodeIdInput,
    pendingNewNodePosition,
    nodeKind,
    setNodeKind,
    nodeLabel,
    setNodeLabel,
    connectors,
    nodeConnectorId,
    setNodeConnectorId,
    splices,
    nodeSpliceId,
    setNodeSpliceId,
    cancelNodeEdit,
    nodeFormError,
    isSegmentSubScreen,
    segmentFormMode,
    openCreateSegmentForm: resetSegmentForm,
    handleSegmentSubmit,
    segmentIdInput,
    setSegmentIdInput,
    nodes,
    describeNode,
    segmentNodeA,
    setSegmentNodeA,
    segmentNodeB,
    setSegmentNodeB,
    segmentLengthMm,
    setSegmentLengthMm,
    segmentSubNetworkTag,
    setSegmentSubNetworkTag,
    cancelSegmentEdit,
    segmentFormError,
    isWireSubScreen,
    wireFormMode,
    openCreateWireForm: resetWireForm,
    handleWireSubmit,
    wireName,
    setWireName,
    wireTechnicalId,
    setWireTechnicalId,
    wireTechnicalIdAlreadyUsed,
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
    cancelWireEdit,
    wireFormError
  } satisfies ComponentProps<typeof ModelingFormsColumnEager>;
  const analysisWorkspaceContentProps = {
    isConnectorSubScreen,
    isSpliceSubScreen,
    isWireSubScreen,
    networkSummaryPanel,
    selectedConnector,
    selectedConnectorId,
    connectorOccupancyFilter,
    setConnectorOccupancyFilter,
    connectors,
    visibleConnectors,
    connectorSort,
    setConnectorSort,
    connectorOccupiedCountById,
    onSelectConnector: (connectorId: ConnectorId) =>
      dispatchAction(
        appActions.select({
          kind: "connector",
          id: connectorId
        })
      ),
    cavityIndexInput,
    setCavityIndexInput,
    connectorOccupantRefInput,
    setConnectorOccupantRefInput,
    handleReserveCavity,
    connectorCavityStatuses,
    handleReleaseCavity,
    sortedConnectorSynthesisRows,
    connectorSynthesisSort,
    setConnectorSynthesisSort,
    getSortIndicator,
    selectedSplice,
    selectedSpliceId,
    spliceOccupancyFilter,
    setSpliceOccupancyFilter,
    splices,
    visibleSplices,
    spliceSort,
    setSpliceSort,
    spliceOccupiedCountById,
    onSelectSplice: (spliceId: SpliceId) =>
      dispatchAction(
        appActions.select({
          kind: "splice",
          id: spliceId
        })
      ),
    splicePortStatuses,
    portIndexInput,
    setPortIndexInput,
    spliceOccupantRefInput,
    setSpliceOccupantRefInput,
    handleReservePort,
    handleReleasePort,
    sortedSpliceSynthesisRows,
    spliceSynthesisSort,
    setSpliceSynthesisSort,
    wireRouteFilter,
    setWireRouteFilter,
    wires,
    visibleWires,
    wireSort,
    setWireSort,
    selectedWireId,
    onSelectWire: (wireId: WireId) =>
      dispatchAction(
        appActions.select({
          kind: "wire",
          id: wireId
        })
      ),
    selectedWire,
    describeWireEndpoint,
    describeWireEndpointId,
    wireForcedRouteInput,
    setWireForcedRouteInput,
    handleLockWireRoute,
    handleResetWireRoute,
    wireFormError
  } satisfies ComponentProps<typeof AnalysisWorkspaceContentEager>;
  const validationWorkspaceContentProps = {
    validationSeverityFilter,
    setValidationSeverityFilter,
    validationIssuesForSeverityCounts,
    validationSeverityCountByLevel,
    validationCategoryFilter,
    setValidationCategoryFilter,
    validationIssuesForCategoryCounts,
    validationCategories,
    validationCategoryCountByName,
    moveVisibleValidationIssueCursor,
    visibleValidationIssues,
    clearValidationFilters,
    validationIssues,
    groupedValidationIssues,
    findValidationIssueIndex,
    validationIssueCursor,
    handleValidationIssueRowGoTo,
    validationErrorCount,
    validationWarningCount
  } satisfies ComponentProps<typeof ValidationWorkspaceContentEager>;
  const settingsWorkspaceContentProps = {
    isCurrentWorkspaceEmpty,
    hasBuiltInSampleState,
    handleRecreateSampleNetwork,
    handleResetSampleNetwork,
    activeNetworkId,
    selectedExportNetworkIds,
    handleExportNetworks,
    networks,
    toggleSelectedExportNetwork,
    handleOpenImportPicker,
    importFileInputRef,
    handleImportFileChange,
    importExportStatus,
    lastImportSummary,
    themeMode,
    setThemeMode,
    tableDensity,
    setTableDensity,
    tableFontSize,
    setTableFontSize,
    defaultSortField,
    setDefaultSortField,
    defaultSortDirection,
    setDefaultSortDirection,
    defaultIdSortDirection,
    setDefaultIdSortDirection,
    applyListSortDefaults,
    canvasDefaultShowGrid,
    setCanvasDefaultShowGrid,
    canvasDefaultSnapToGrid,
    setCanvasDefaultSnapToGrid,
    canvasDefaultShowInfoPanels,
    setCanvasDefaultShowInfoPanels,
    canvasDefaultShowSegmentLengths,
    setCanvasDefaultShowSegmentLengths,
    canvasDefaultLabelStrokeMode,
    setCanvasDefaultLabelStrokeMode,
    canvasResetZoomPercentInput,
    setCanvasResetZoomPercentInput,
    configuredResetZoomPercent,
    applyCanvasDefaultsNow,
    handleZoomAction,
    showShortcutHints,
    setShowShortcutHints,
    keyboardShortcutsEnabled,
    setKeyboardShortcutsEnabled,
    resetWorkspacePreferencesToDefaults
  } satisfies ComponentProps<typeof SettingsWorkspaceContentEager>;
  const modelingLeftColumnContent = (
    <>
      <ModelingPrimaryTables {...modelingPrimaryTablesProps} />
      <ModelingSecondaryTables {...modelingSecondaryTablesProps} />
    </>
  );
  const modelingFormsColumnContent = <ModelingFormsColumn {...modelingFormsColumnProps} />;
  const analysisWorkspaceContent = <AnalysisWorkspaceContent {...analysisWorkspaceContentProps} />;
  const validationWorkspaceContent = <ValidationWorkspaceContent {...validationWorkspaceContentProps} />;
  const settingsWorkspaceContent = <SettingsWorkspaceContent {...settingsWorkspaceContentProps} />;
  const networkScopeWorkspaceContent = <NetworkScopeWorkspaceContent {...networkScopeWorkspaceProps} />;

  return (
    <Suspense fallback={null}>
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
          <NetworkScopeWorkspaceContainer
            ScreenComponent={NetworkScopeScreen}
            isActive={isNetworkScopeScreen}
            workspaceContent={networkScopeWorkspaceContent}
          />

          {!isNetworkScopeScreen && !hasActiveNetwork ? (
            <section className="panel">
              <h2>No active network</h2>
              <p className="empty-copy">
                Create a network from the network scope controls to start modeling connectors, splices, nodes, segments, and wires.
              </p>
            </section>
          ) : !isNetworkScopeScreen ? (
            <>
              <ModelingWorkspaceContainer
                ScreenComponent={ModelingScreen}
                isActive={isModelingScreen}
                leftColumnContent={modelingLeftColumnContent}
                formsColumnContent={modelingFormsColumnContent}
                networkSummaryPanel={networkSummaryPanel}
              />

              <AnalysisWorkspaceContainer
                ScreenComponent={AnalysisScreen}
                isActive={isAnalysisScreen}
                workspaceContent={analysisWorkspaceContent}
              />

              <ValidationWorkspaceContainer
                ScreenComponent={ValidationScreen}
                isActive={isValidationScreen}
                workspaceContent={validationWorkspaceContent}
              />

              <SettingsWorkspaceContainer
                ScreenComponent={SettingsScreen}
                isActive={isSettingsScreen}
                workspaceContent={settingsWorkspaceContent}
              />
            </>
          ) : null}
        </section>
      </section>
      <a className="app-footer-link" href={APP_REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
        © {currentYear} e-Plan Editor · v{appPackageMetadata.version}
      </a>
      {!isInspectorHidden ? (
        <aside
          className={isInspectorOpen ? "workspace-inspector-panel is-open" : "workspace-inspector-panel is-collapsed"}
          aria-label="Inspector context panel"
        >
          {inspectorContextPanel}
        </aside>
      ) : null}
      </main>
    </Suspense>
  );
}
