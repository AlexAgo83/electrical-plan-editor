import { translateCurrent as t } from "../../lib/i18n";
import { useCallback, useEffect, useMemo, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import type { AppAction } from "../../../store/actions";
import type {
  Connector,
  CatalogItem,
  ConnectorId,
  HarnessAssemblyId,
  Network,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire
} from "../../../core/entities";
import type { SubNetworkSummary } from "../../../store";
import type { AppStore } from "../../../store";
import type { AppControllerCanvasDisplayStateModel } from "../../hooks/useAppControllerCanvasDisplayState";
import type { CanvasStateModel } from "../../hooks/useCanvasState";
import type { AppControllerPreferencesStateModel } from "../../hooks/useAppControllerPreferencesState";
import type { ShortestRouteResult } from "../../../core/pathfinding";
import type { NodePosition, ScreenId, SubScreenId } from "../../types/app-controller";
import type { AppControllerSelectionEntitiesModel } from "../../hooks/useAppControllerSelectionEntities";
import { appActions } from "../../../store";
import { FunctionalSchematicPanel } from "../../components/network-summary/FunctionalSchematicPanel";
import { HarnessAssemblyFunctionalScopeNavigation } from "../../components/network-summary/HarnessAssemblyFunctionalScopeNavigation";
import { HarnessAssemblyManagerPanel } from "../../components/network-summary/HarnessAssemblyManagerPanel";
import { buildHarnessAssemblyFunctionalSchematicGraph, type FunctionalDomainFilter } from "../../../core/functionalSchematic";
import { buildNetworkSummaryPanelControllerSlice } from "./useAppControllerScreenContentSlices";
import { exportJsonFile } from "../../hooks/useNetworkImportExport";
import {
  buildSelectedHarnessAgentJsonFilename,
  buildSelectedHarnessAgentJsonPayload,
  serializeSelectedHarnessAgentJsonPayload
} from "../../lib/selectedHarnessAgentJson";
type NetworkSummaryPanelSliceParams = Parameters<typeof buildNetworkSummaryPanelControllerSlice>[0];

const DISPLAYED_HARNESS_ASSEMBLY_STORAGE_KEY = "electrical-plan-editor.displayed-harness-assembly-id";

function readPersistedDisplayedAssemblyId(): HarnessAssemblyId | "" {
  if (typeof window === "undefined") {
    return "";
  }
  return (window.localStorage.getItem(DISPLAYED_HARNESS_ASSEMBLY_STORAGE_KEY) ?? "") as HarnessAssemblyId | "";
}

function persistDisplayedAssemblyId(assemblyId: HarnessAssemblyId | ""): void {
  if (typeof window === "undefined") {
    return;
  }
  if (assemblyId === "") {
    window.localStorage.removeItem(DISPLAYED_HARNESS_ASSEMBLY_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(DISPLAYED_HARNESS_ASSEMBLY_STORAGE_KEY, assemblyId);
}

interface UseAppControllerNetworkSummaryPanelDomainParams {
  NetworkSummaryPanelComponent: NetworkSummaryPanelSliceParams["NetworkSummaryPanelComponent"];
  networkSummaryPanelRef?: NetworkSummaryPanelSliceParams["networkSummaryPanelRef"];
  hasActiveNetwork: boolean;
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
  isModelingAnalysisFocused: boolean;
  activeSubScreen: SubScreenId;
  setActiveSubScreen: (subScreen: SubScreenId) => void;
  handleWorkspaceScreenChange: (targetScreen: ScreenId) => void;
  entityCountBySubScreen: Record<SubScreenId, number>;
  onQuickEntityNavigation: (subScreen: SubScreenId) => void;
  isAiAgentOpen?: boolean;
  isAiAgentReady?: boolean;
  aiAgentDisabledReason?: string;
  onOpenAiAgent?: () => void;
  activeNetwork: Network | null;
  networks: NetworkSummaryPanelSliceParams["networks"];
  onSelectActiveNetwork: NetworkSummaryPanelSliceParams["onSelectActiveNetwork"];
  nodes: NetworkSummaryPanelSliceParams["nodes"];
  segments: Segment[];
  wires: Wire[];
  catalogItems: CatalogItem[];
  subNetworkSummaries: SubNetworkSummary[];
  routingGraph: {
    nodeIds: string[];
    segmentIds: string[];
  };
  totalEdgeEntries: number;
  networkNodePositions: Record<NodeId, NodePosition>;
  selectedWireRouteSegmentIds: Set<SegmentId>;
  selectedBatchSegmentIds: ReadonlySet<SegmentId>;
  splicePlacementPreview: NetworkSummaryPanelSliceParams["splicePlacementPreview"];
  canvasState: Pick<
    CanvasStateModel,
    | "isPanningNetwork"
    | "showNetworkGrid"
    | "setShowNetworkGrid"
    | "snapNodesToGrid"
    | "setSnapNodesToGrid"
    | "lockEntityMovement"
    | "setLockEntityMovement"
    | "networkOffset"
    | "setNetworkOffset"
    | "networkScale"
  >;
  canvasDisplayState: Pick<
    AppControllerCanvasDisplayStateModel,
    | "showNetworkInfoPanels"
    | "setShowNetworkInfoPanels"
    | "showSegmentNames"
    | "showSegmentLengths"
    | "setShowSegmentLengths"
    | "showSegmentDressings"
    | "setShowSegmentDressings"
    | "showCableCallouts"
    | "setShowCableCallouts"
    | "networkCalloutContentMode"
    | "showSelectedCalloutOnly"
    | "networkLabelStrokeMode"
    | "networkLabelSizeMode"
    | "networkCalloutTextSize"
    | "networkLabelRotationDegrees"
    | "networkAutoSegmentLabelRotation"
    | "routePreviewStartNodeId"
    | "setRoutePreviewStartNodeId"
    | "routePreviewEndNodeId"
    | "setRoutePreviewEndNodeId"
  >;
  preferencesState: Pick<
    AppControllerPreferencesStateModel,
    | "canvasShowCalloutWireNames"
    | "canvasConnectorDrawingDisplayMode"
    | "canvasUseConsistentConnectorLayoutScale"
    | "canvasCalloutConnectorDrawingScalePercent"
    | "canvasGlobalRenderScalePercent"
    | "setCanvasGlobalRenderScalePercent"
    | "canvasZoomInvariantNodeShapes"
    | "canvasNodeShapeSizePercent"
    | "canvasResizeBehaviorMode"
    | "themeMode"
    | "canvasExportIncludeFrame"
    | "setCanvasExportIncludeFrame"
    | "canvasExportIncludeCartouche"
    | "setCanvasExportIncludeCartouche"
    | "canvasPngExportIncludeBackground"
    | "canvasShowColocatedSpliceLinkLine"
    | "canvasShowNetworkEntityPrefix"
    | "showFloatingInspectorPanel"
    | "setShowFloatingInspectorPanel"
    | "showRoutePreviewPanel"
    | "showMultiNetworkFunctionalAnalysisPanel"
  >;
  selection: Pick<
    AppControllerSelectionEntitiesModel,
    | "selectedSegmentId"
    | "selectedWireId"
    | "selectedNodeId"
    | "selectedConnectorId"
    | "selectedSpliceId"
  >;
  effectiveNetworkViewWidth: number;
  effectiveNetworkViewHeight: number;
  networkGridStep: number;
  networkScalePercent: number;
  routePreview: ShortestRouteResult | null;
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  describeNode: NetworkSummaryPanelSliceParams["describeNode"];
  handleZoomAction: NetworkSummaryPanelSliceParams["handleZoomAction"];
  fitNetworkToContent: NetworkSummaryPanelSliceParams["fitNetworkToContent"];
  handleNetworkCanvasMouseDown: NetworkSummaryPanelSliceParams["handleNetworkCanvasMouseDown"];
  handleNetworkCanvasClick: NetworkSummaryPanelSliceParams["handleNetworkCanvasClick"];
  handleNetworkWheel: NetworkSummaryPanelSliceParams["handleNetworkWheel"];
  handleNetworkMouseMove: NetworkSummaryPanelSliceParams["handleNetworkMouseMove"];
  stopNetworkNodeDrag: NetworkSummaryPanelSliceParams["stopNetworkNodeDrag"];
  handleNetworkSegmentClick: NetworkSummaryPanelSliceParams["handleNetworkSegmentClick"];
  handleNetworkNodeMouseDown: NetworkSummaryPanelSliceParams["handleNetworkNodeMouseDown"];
  handleNetworkNodeActivate: NetworkSummaryPanelSliceParams["handleNetworkNodeActivate"];
  selectedCanvasNodeIds: NetworkSummaryPanelSliceParams["selectedCanvasNodeIds"];
  clearSelectedCanvasNodes: NetworkSummaryPanelSliceParams["clearSelectedCanvasNodes"];
  onViewportSizeChange: (size: { width: number; height: number }) => void;
  canExportBomCsv: boolean;
  onExportBomCsv: () => void;
  onExportNetwork: () => void;
  handleRegenerateLayout: () => void;
  markDetailPanelsSelectionSourceAsTable: () => void;
  startSpliceEdit: (splice: Splice) => void;
  startWireEdit: (wire: Wire) => void;
  onOpenHarnessAssemblyOnboardingHelp: () => void;
  onOpenMultiNetworkFunctionalAnalysis?: () => void;
  dispatchAction: (action: AppAction, options?: { trackHistory?: boolean }) => void;
  store: AppStore;
}

export function useAppControllerNetworkSummaryPanelDomain({
  NetworkSummaryPanelComponent,
  networkSummaryPanelRef,
  hasActiveNetwork,
  isModelingScreen,
  isAnalysisScreen,
  isModelingAnalysisFocused,
  activeSubScreen,
  setActiveSubScreen,
  handleWorkspaceScreenChange,
  entityCountBySubScreen,
  onQuickEntityNavigation,
  isAiAgentOpen = false,
  isAiAgentReady = false,
  aiAgentDisabledReason,
  onOpenAiAgent,
  activeNetwork,
  networks,
  onSelectActiveNetwork,
  nodes,
  segments,
  wires,
  catalogItems,
  subNetworkSummaries,
  routingGraph,
  totalEdgeEntries,
  networkNodePositions,
  selectedWireRouteSegmentIds,
  selectedBatchSegmentIds,
  splicePlacementPreview,
  canvasState,
  canvasDisplayState,
  preferencesState,
  selection,
  effectiveNetworkViewWidth,
  effectiveNetworkViewHeight,
  networkGridStep,
  networkScalePercent,
  routePreview,
  connectorMap,
  spliceMap,
  describeNode,
  handleZoomAction,
  fitNetworkToContent,
  handleNetworkCanvasMouseDown,
  handleNetworkCanvasClick,
  handleNetworkWheel,
  handleNetworkMouseMove,
  stopNetworkNodeDrag,
  handleNetworkSegmentClick,
  handleNetworkNodeMouseDown,
  handleNetworkNodeActivate,
  selectedCanvasNodeIds,
  clearSelectedCanvasNodes,
  onViewportSizeChange,
  canExportBomCsv,
  onExportBomCsv,
  onExportNetwork,
  handleRegenerateLayout,
  markDetailPanelsSelectionSourceAsTable,
  startSpliceEdit,
  startWireEdit,
  onOpenHarnessAssemblyOnboardingHelp,
  onOpenMultiNetworkFunctionalAnalysis,
  dispatchAction,
  store
}: UseAppControllerNetworkSummaryPanelDomainParams) {
  const [displayedAssemblyId, setDisplayedAssemblyId] = useState<HarnessAssemblyId | "new" | "">(readPersistedDisplayedAssemblyId);
  const [harnessAssemblyGraphTab, setHarnessAssemblyGraphTab] = useState<"assembly" | "current">("assembly");
  const [isHarnessAssemblyPickerOpen, setIsHarnessAssemblyPickerOpen] = useState(false);
  const handleOpenActiveNetworkInModeling = useCallback(() => {
    handleWorkspaceScreenChange("modeling");
  }, [handleWorkspaceScreenChange]);
  const handleOpenCurrentNetworkFunctional = useCallback(() => {
    setIsHarnessAssemblyPickerOpen(false);
    setHarnessAssemblyGraphTab("current");
    handleWorkspaceScreenChange("harnessAssembly");
  }, [handleWorkspaceScreenChange]);
  const handleSelectConnectorFromCallout = useCallback(
    (connectorId: ConnectorId) => {
      unstable_batchedUpdates(() => {
        setActiveSubScreen("connector");
        markDetailPanelsSelectionSourceAsTable();
        dispatchAction(appActions.select({ kind: "connector", id: connectorId }), { trackHistory: false });
      });
    },
    [dispatchAction, markDetailPanelsSelectionSourceAsTable, setActiveSubScreen]
  );

  const handleSelectSpliceFromCallout = useCallback(
    (spliceId: SpliceId) => {
      unstable_batchedUpdates(() => {
        setActiveSubScreen("splice");
        markDetailPanelsSelectionSourceAsTable();
        dispatchAction(appActions.select({ kind: "splice", id: spliceId }), { trackHistory: false });
      });
    },
    [dispatchAction, markDetailPanelsSelectionSourceAsTable, setActiveSubScreen]
  );

  const handleActivateFloatingSplice = useCallback(
    (spliceId: SpliceId) => {
      const splice = store.getState().splices.byId[spliceId];
      if (splice === undefined) {
        return;
      }
      unstable_batchedUpdates(() => {
        clearSelectedCanvasNodes();
        if (isModelingScreen && !isModelingAnalysisFocused) {
          setActiveSubScreen("splice");
          startSpliceEdit(splice);
          return;
        }
        setActiveSubScreen("splice");
        dispatchAction(appActions.select({ kind: "splice", id: spliceId }), {
          trackHistory: false,
        });
      });
    },
    [
      clearSelectedCanvasNodes,
      dispatchAction,
      isModelingAnalysisFocused,
      isModelingScreen,
      setActiveSubScreen,
      startSpliceEdit,
      store,
    ]
  );

  const handleSelectWireFromConnectorPin = useCallback(
    (wireId: Wire["id"]) => {
      const wire = store.getState().wires.byId[wireId];
      if (wire === undefined) {
        return;
      }
      unstable_batchedUpdates(() => {
        setActiveSubScreen("wire");
        markDetailPanelsSelectionSourceAsTable();
        startWireEdit(wire);
      });
    },
    [markDetailPanelsSelectionSourceAsTable, setActiveSubScreen, startWireEdit, store]
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

  const persistSegmentSheathCalloutPosition = useCallback(
    (segmentId: SegmentId, position: { x: number; y: number }) => {
      const existing = segments.find((segment) => segment.id === segmentId);
      if (existing === undefined) {
        return;
      }
      dispatchAction(
        appActions.upsertSegment({
          ...existing,
          sheathCalloutPosition: position
        }),
        { trackHistory: false }
      );
    },
    [dispatchAction, segments]
  );

  const shouldIncludeNetworkSummaryPanel = hasActiveNetwork && (isModelingScreen || isAnalysisScreen);

  const networkSummaryPanel = shouldIncludeNetworkSummaryPanel
    ? buildNetworkSummaryPanelControllerSlice({
        NetworkSummaryPanelComponent,
        networkSummaryPanelRef,
        handleZoomAction,
        fitNetworkToContent,
        showNetworkGrid: canvasState.showNetworkGrid,
        setShowNetworkGrid: canvasState.setShowNetworkGrid,
        snapNodesToGrid: canvasState.snapNodesToGrid,
        setSnapNodesToGrid: canvasState.setSnapNodesToGrid,
        lockEntityMovement: canvasState.lockEntityMovement,
        setLockEntityMovement: canvasState.setLockEntityMovement,
        showNetworkInfoPanels: canvasDisplayState.showNetworkInfoPanels,
        setShowNetworkInfoPanels: canvasDisplayState.setShowNetworkInfoPanels,
        showSegmentNames: canvasDisplayState.showSegmentNames,
        showSegmentLengths: canvasDisplayState.showSegmentLengths,
        setShowSegmentLengths: canvasDisplayState.setShowSegmentLengths,
        showSegmentDressings: canvasDisplayState.showSegmentDressings,
        setShowSegmentDressings: canvasDisplayState.setShowSegmentDressings,
        showCableCallouts: canvasDisplayState.showCableCallouts,
        setShowCableCallouts: canvasDisplayState.setShowCableCallouts,
        showColocatedSpliceLinkLine: preferencesState.canvasShowColocatedSpliceLinkLine,
        showNetworkEntityPrefix: preferencesState.canvasShowNetworkEntityPrefix,
        networkCalloutContentMode: canvasDisplayState.networkCalloutContentMode,
        showSelectedCalloutOnly: canvasDisplayState.showSelectedCalloutOnly,
        networkLabelStrokeMode: canvasDisplayState.networkLabelStrokeMode,
        networkLabelSizeMode: canvasDisplayState.networkLabelSizeMode,
        networkCalloutTextSize: canvasDisplayState.networkCalloutTextSize,
        networkLabelRotationDegrees: canvasDisplayState.networkLabelRotationDegrees,
        networkAutoSegmentLabelRotation: canvasDisplayState.networkAutoSegmentLabelRotation,
        showCalloutWireNames: preferencesState.canvasShowCalloutWireNames,
        connectorDrawingDisplayMode: preferencesState.canvasConnectorDrawingDisplayMode,
        useConsistentConnectorLayoutScale: preferencesState.canvasUseConsistentConnectorLayoutScale,
        connectorDrawingScalePercent: preferencesState.canvasCalloutConnectorDrawingScalePercent,
        globalRenderScalePercent: preferencesState.canvasGlobalRenderScalePercent,
        setGlobalRenderScalePercent: preferencesState.setCanvasGlobalRenderScalePercent,
        zoomInvariantNodeShapes: preferencesState.canvasZoomInvariantNodeShapes,
        nodeShapeSizePercent: preferencesState.canvasNodeShapeSizePercent,
        resizeBehaviorMode: preferencesState.canvasResizeBehaviorMode,
        themeMode: preferencesState.themeMode,
        exportIncludeFrame: preferencesState.canvasExportIncludeFrame,
        setExportIncludeFrame: preferencesState.setCanvasExportIncludeFrame,
        exportIncludeCartouche: preferencesState.canvasExportIncludeCartouche,
        setExportIncludeCartouche: preferencesState.setCanvasExportIncludeCartouche,
        exportCartoucheNetworkName: activeNetwork?.name ?? "",
        exportCartoucheAuthor: activeNetwork?.author,
        exportCartoucheProjectCode: activeNetwork?.projectCode,
        exportCartoucheCreatedAt: activeNetwork?.createdAt ?? new Date().toISOString(),
        exportCartoucheLogoUrl: activeNetwork?.logoUrl,
        exportCartoucheNotes: activeNetwork?.exportNotes,
        showFloatingInspectorPanel: preferencesState.showFloatingInspectorPanel,
        setShowFloatingInspectorPanel: preferencesState.setShowFloatingInspectorPanel,
        networkScalePercent,
        routingGraph,
        totalEdgeEntries,
        nodes,
        segments,
        wires,
        catalogItems,
        activeNetwork,
        networks,
        onSelectActiveNetwork,
        isPanningNetwork: canvasState.isPanningNetwork,
        networkViewWidth: effectiveNetworkViewWidth,
        networkViewHeight: effectiveNetworkViewHeight,
        networkGridStep,
        networkOffset: canvasState.networkOffset,
        setNetworkOffset: canvasState.setNetworkOffset,
        networkScale: canvasState.networkScale,
        handleNetworkCanvasMouseDown,
        handleNetworkCanvasClick,
        handleNetworkWheel,
        handleNetworkMouseMove,
        stopNetworkNodeDrag,
        networkNodePositions,
        selectedWireRouteSegmentIds,
        selectedBatchSegmentIds,
        splicePlacementPreview,
        selectedSegmentId: selection.selectedSegmentId,
        selectedWireId: selection.selectedWireId,
        handleNetworkSegmentClick,
        selectedCanvasNodeIds,
        clearSelectedCanvasNodes,
        selectedNodeId: selection.selectedNodeId,
        selectedConnectorId: selection.selectedConnectorId,
        selectedSpliceId: selection.selectedSpliceId,
        handleNetworkNodeMouseDown,
        handleNetworkNodeActivate,
        connectorMap,
        spliceMap,
        describeNode,
        subNetworkSummaries,
        routePreviewStartNodeId: canvasDisplayState.routePreviewStartNodeId,
        setRoutePreviewStartNodeId: canvasDisplayState.setRoutePreviewStartNodeId,
        routePreviewEndNodeId: canvasDisplayState.routePreviewEndNodeId,
        setRoutePreviewEndNodeId: canvasDisplayState.setRoutePreviewEndNodeId,
        routePreview,
        showRoutePreviewPanel: preferencesState.showRoutePreviewPanel,
        quickEntityNavigationMode: isModelingScreen && !isModelingAnalysisFocused ? "modeling" : "analysis",
        activeSubScreen,
        entityCountBySubScreen,
        onQuickEntityNavigation,
        isAiAgentOpen,
        isAiAgentReady,
        aiAgentDisabledReason,
        onOpenAiAgent,
        onSelectConnectorFromCallout: handleSelectConnectorFromCallout,
        onSelectSpliceFromCallout: handleSelectSpliceFromCallout,
        onActivateFloatingSplice: handleActivateFloatingSplice,
        onSelectWireFromConnectorPin: handleSelectWireFromConnectorPin,
        onPersistConnectorCalloutPosition: persistConnectorCalloutPosition,
        onPersistSpliceCalloutPosition: persistSpliceCalloutPosition,
        onPersistSegmentSheathCalloutPosition: persistSegmentSheathCalloutPosition,
        onViewportSizeChange,
        pngExportIncludeBackground: preferencesState.canvasPngExportIncludeBackground,
    canExportBomCsv,
    onExportBomCsv,
    onExportNetwork,
    handleRegenerateLayout,
        onOpenCurrentNetworkFunctional: handleOpenCurrentNetworkFunctional,
        onOpenMultiNetworkFunctionalAnalysis:
          preferencesState.showMultiNetworkFunctionalAnalysisPanel === false ? undefined : onOpenMultiNetworkFunctionalAnalysis,
        showFunctionalSchematic: false
      }).networkSummaryPanel
    : null;
  const globalState = store.getState();
  const mainHarnessConnectorIds = [...connectorMap.values()]
    .filter((connector) => connector.isMainHarnessConnector === true)
    .map((connector) => connector.id);
  const harnessAssemblies = globalState.harnessAssemblies.allIds.flatMap((assemblyId) => {
    const assembly = globalState.harnessAssemblies.byId[assemblyId];
    return assembly === undefined ? [] : [assembly];
  });
  const allNetworks = globalState.networks.allIds.flatMap((networkId) => {
    const network = globalState.networks.byId[networkId];
    return network === undefined ? [] : [network];
  });
  const connectorsByNetworkId = new Map(
    globalState.networks.allIds.map((networkId) => [
      networkId,
      globalState.networkStates[networkId]?.connectors.allIds.flatMap((connectorId) => {
        const connector = globalState.networkStates[networkId]?.connectors.byId[connectorId];
        return connector === undefined ? [] : [connector];
      }) ?? []
    ])
  );
  useEffect(() => {
    if (displayedAssemblyId === "" || displayedAssemblyId === "new") {
      return;
    }
    if (harnessAssemblies.some((assembly) => assembly.id === displayedAssemblyId)) {
      persistDisplayedAssemblyId(displayedAssemblyId);
      return;
    }
    setDisplayedAssemblyId("");
    persistDisplayedAssemblyId("");
  }, [displayedAssemblyId, harnessAssemblies]);

  const handleDisplayedAssemblyIdChange = useCallback((assemblyId: HarnessAssemblyId | "new" | "") => {
    setDisplayedAssemblyId(assemblyId);
    persistDisplayedAssemblyId(assemblyId === "new" ? "" : assemblyId);
  }, []);

  const handlePickDisplayedAssembly = useCallback(
    (assemblyId: HarnessAssemblyId | "new") => {
      handleDisplayedAssemblyIdChange(assemblyId);
      setHarnessAssemblyGraphTab("assembly");
      setIsHarnessAssemblyPickerOpen(false);
    },
    [handleDisplayedAssemblyIdChange]
  );

  const displayedHarnessAssembly =
    displayedAssemblyId === "" || displayedAssemblyId === "new"
      ? null
      : harnessAssemblies.find((assembly) => assembly.id === displayedAssemblyId) ?? null;
  const handleExportSelectedHarnessAgentJson = useCallback(() => {
    if (displayedHarnessAssembly === null) {
      return;
    }
    void (async () => {
      const exportedAt = new Date().toISOString();
      const result = buildSelectedHarnessAgentJsonPayload({
        state: store.getState(),
        selectedHarnessAssemblyId: displayedHarnessAssembly.id,
        exportedAt
      });
      if (!result.ok) {
        return;
      }
      await exportJsonFile(
        buildSelectedHarnessAgentJsonFilename(displayedHarnessAssembly, exportedAt),
        serializeSelectedHarnessAgentJsonPayload(result.payload)
      );
    })();
  }, [displayedHarnessAssembly, store]);
  const assemblyGraphFactory = useMemo(() => {
    if (displayedHarnessAssembly === null) {
      return null;
    }
    return (activeFilter: FunctionalDomainFilter) => {
      const state = store.getState();
      const networksById = new Map(
        displayedHarnessAssembly.members.flatMap((member) => {
          const network = state.networks.byId[member.networkId];
          const scoped = state.networkStates[member.networkId];
          if (network === undefined || scoped === undefined) {
            return [];
          }
          return [
            [
              member.networkId,
              {
                network,
                wires: scoped.wires.allIds.flatMap((wireId) => {
                  const wire = scoped.wires.byId[wireId];
                  return wire === undefined ? [] : [wire];
                }),
                segments: scoped.segments.allIds.flatMap((segmentId) => {
                  const segment = scoped.segments.byId[segmentId];
                  return segment === undefined ? [] : [segment];
                }),
                connectorMap: new Map(scoped.connectors.allIds.flatMap((connectorId) => {
                  const connector = scoped.connectors.byId[connectorId];
                  return connector === undefined ? [] : [[connector.id, connector] as const];
                })),
                spliceMap: new Map(scoped.splices.allIds.flatMap((spliceId) => {
                  const splice = scoped.splices.byId[spliceId];
                  return splice === undefined ? [] : [[splice.id, splice] as const];
                })),
                catalogItemMap: new Map(scoped.catalogItems.allIds.flatMap((catalogItemId) => {
                  const catalogItem = scoped.catalogItems.byId[catalogItemId];
                  return catalogItem === undefined ? [] : [[catalogItem.id, catalogItem] as const];
                }))
              }
            ] as const
          ];
        })
      );
      return buildHarnessAssemblyFunctionalSchematicGraph({
        assembly: displayedHarnessAssembly,
        networksById,
        activeFilter,
        rootConnectorRefs: displayedHarnessAssembly.masterConnectorRefs
      });
    };
  }, [displayedHarnessAssembly, store]);
  const assemblyFunctionalGraphPanel =
    displayedHarnessAssembly === null ? (
      <section className="panel functional-schematic-panel" aria-labelledby="harness-assembly-empty-title">
        <header className="network-summary-header">
          <div>
            <h2 id="harness-assembly-empty-title">Harness assembly functional schematic</h2>
            <p className="functional-schematic-subtitle">Select a saved harness assembly to display its functional graph.</p>
          </div>
        </header>
        <div className="functional-schematic-canvas-shell">
          <p className="empty-copy">No harness assembly selected.</p>
        </div>
      </section>
    ) : (
      <FunctionalSchematicPanel
        network={null}
        wires={[]}
        segments={[]}
        catalogItems={[]}
        connectorMap={new Map()}
        spliceMap={new Map()}
        rootConnectorIds={[]}
        assemblyGraphFactory={assemblyGraphFactory ?? undefined}
        title="Harness assembly functional schematic"
        titleSuffix={displayedHarnessAssembly.name}
        subtitle={`Filtered trace across ${displayedHarnessAssembly.name} from configured master connectors.`}
        selectedWireId={null}
        selectedConnectorId={null}
        selectedSpliceId={null}
        themeMode={preferencesState.themeMode}
        pngExportIncludeBackground={preferencesState.canvasPngExportIncludeBackground}
        exportIncludeFrame={false}
        exportIncludeCartouche={false}
        exportCartoucheName={`${displayedHarnessAssembly.name} functional schematic`}
        exportCartoucheProjectCode={displayedHarnessAssembly.technicalId}
        exportCartoucheCreatedAt={displayedHarnessAssembly.createdAt}
        showSvgPreviewDecorationOptions={false}
        onboardingPanelKey="harness-assembly-functional"
      />
    );
  const currentNetworkFunctionalGraphPanel = hasActiveNetwork ? (
    <FunctionalSchematicPanel
      network={activeNetwork}
      wires={wires}
      segments={segments}
      catalogItems={catalogItems}
      connectorMap={connectorMap}
      spliceMap={spliceMap}
      rootConnectorIds={mainHarnessConnectorIds}
      title="Current network functional"
      titleSuffix={activeNetwork?.name ?? "No active network"}
      selectedWireId={selection.selectedWireId}
      selectedConnectorId={selection.selectedConnectorId ?? mainHarnessConnectorIds[0] ?? null}
      selectedSpliceId={selection.selectedSpliceId}
      themeMode={preferencesState.themeMode}
      pngExportIncludeBackground={preferencesState.canvasPngExportIncludeBackground}
      exportIncludeFrame={false}
      exportIncludeCartouche={false}
      showSvgPreviewDecorationOptions={false}
      onOpenActiveNetworkInModeling={handleOpenActiveNetworkInModeling}
      onboardingPanelKey="harness-assembly-current-network-functional"
    />
  ) : (
    <section className="panel functional-schematic-panel" aria-labelledby="current-network-functional-empty-title">
      <header className="network-summary-header">
        <div>
          <h2 id="current-network-functional-empty-title">Current network functional</h2>
          <p className="functional-schematic-subtitle">Set an active network to display its functional graph.</p>
        </div>
      </header>
      <div className="functional-schematic-canvas-shell">
        <p className="empty-copy">No active network selected.</p>
      </div>
    </section>
  );
  const harnessAssemblyFunctionalScopeNavigation = (
    <HarnessAssemblyFunctionalScopeNavigation
      activeScope={harnessAssemblyGraphTab}
      displayedHarnessAssembly={displayedHarnessAssembly}
      onOpenAssemblyPicker={() => setIsHarnessAssemblyPickerOpen(true)}
      onShowCurrentNetwork={() => {
        setIsHarnessAssemblyPickerOpen(false);
        setHarnessAssemblyGraphTab("current");
      }}
    />
  );
  const headerHarnessAssemblyFunctionalScopeNavigation = (
    <HarnessAssemblyFunctionalScopeNavigation
      activeScope={harnessAssemblyGraphTab}
      displayedHarnessAssembly={displayedHarnessAssembly}
      onOpenAssemblyPicker={() => setIsHarnessAssemblyPickerOpen(true)}
      onShowCurrentNetwork={() => {
        setIsHarnessAssemblyPickerOpen(false);
        setHarnessAssemblyGraphTab("current");
      }}
      variant="header"
    />
  );
  const networkFunctionalSchematicPanel = (
    <>
      {harnessAssemblyFunctionalScopeNavigation}
      {isHarnessAssemblyPickerOpen ? (
        <div className="confirm-dialog-layer harness-assembly-picker-layer" role="presentation">
          <button
            type="button"
            className="confirm-dialog-backdrop"
            aria-label="Close harness assembly selector"
            onClick={() => setIsHarnessAssemblyPickerOpen(false)}
          />
          <section
            className="confirm-dialog panel harness-assembly-picker-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="harness-assembly-picker-title"
          >
            <header className="confirm-dialog-header">
              <h2 id="harness-assembly-picker-title">Select harness assembly</h2>
            </header>
            <div className="harness-assembly-picker-list" role="list">
              <button
                type="button"
                className={
                  displayedAssemblyId === "new"
                    ? "harness-assembly-picker-option is-new is-selected"
                    : "harness-assembly-picker-option is-new"
                }
                onClick={() => handlePickDisplayedAssembly("new")}
              >
                <span>New assembly</span>
                <span className="technical-id">Create draft</span>
              </button>
              {harnessAssemblies.map((assembly) => (
                <button
                  key={assembly.id}
                  type="button"
                  className={displayedAssemblyId === assembly.id ? "harness-assembly-picker-option is-selected" : "harness-assembly-picker-option"}
                  onClick={() => handlePickDisplayedAssembly(assembly.id)}
                >
                  <span>{assembly.name}</span>
                  <span className="technical-id">{assembly.technicalId}</span>
                </button>
              ))}
            </div>
            {harnessAssemblies.length === 0 ? <p className="empty-copy">No saved harness assembly yet.</p> : null}
            <footer className="confirm-dialog-actions">
              <button type="button" className="confirm-dialog-cancel" onClick={() => setIsHarnessAssemblyPickerOpen(false)}>
                
                {t("ui.cancel")}
              </button>
            </footer>
          </section>
        </div>
      ) : null}
      {harnessAssemblyGraphTab === "assembly" ? assemblyFunctionalGraphPanel : currentNetworkFunctionalGraphPanel}
      {harnessAssemblyGraphTab === "assembly" ? (
        <HarnessAssemblyManagerPanel
          assemblies={harnessAssemblies}
          networks={allNetworks}
          connectorsByNetworkId={connectorsByNetworkId}
          selectedAssemblyId={displayedAssemblyId}
          canExportAgentJson={displayedHarnessAssembly !== null}
          onExportAgentJson={handleExportSelectedHarnessAgentJson}
          onOpenOnboardingHelp={onOpenHarnessAssemblyOnboardingHelp}
          onSelectedAssemblyIdChange={handleDisplayedAssemblyIdChange}
          onUpsertAssembly={(assembly) => {
            dispatchAction(appActions.upsertHarnessAssembly(assembly));
            handleDisplayedAssemblyIdChange(assembly.id);
          }}
          onRemoveAssembly={(assemblyId) => {
            dispatchAction(appActions.removeHarnessAssembly(assemblyId));
            if (displayedAssemblyId === assemblyId) {
              handleDisplayedAssemblyIdChange("");
            }
          }}
        />
      ) : null}
    </>
  );

  return {
    networkSummaryPanel,
    networkFunctionalSchematicPanel,
    headerHarnessAssemblyFunctionalScopeNavigation,
    selectedHarnessAssemblyId: displayedHarnessAssembly?.id ?? null
  };
}
