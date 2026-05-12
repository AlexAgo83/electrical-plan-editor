import { useCallback, useMemo } from "react";
import type { AppAction } from "../../../store/actions";
import type {
  Connector,
  CatalogItem,
  ConnectorId,
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
import type { AppControllerCanvasDisplayStateModel } from "../useAppControllerCanvasDisplayState";
import type { CanvasStateModel } from "../useCanvasState";
import type { AppControllerPreferencesStateModel } from "../useAppControllerPreferencesState";
import type { ShortestRouteResult } from "../../../core/pathfinding";
import type { NodePosition, SubScreenId } from "../../types/app-controller";
import type { AppControllerSelectionEntitiesModel } from "../useAppControllerSelectionEntities";
import { appActions } from "../../../store";
import { FunctionalSchematicPanel } from "../../components/network-summary/FunctionalSchematicPanel";
import { HarnessAssemblyManagerPanel } from "../../components/network-summary/HarnessAssemblyManagerPanel";
import { buildHarnessAssemblyFunctionalSchematicGraph, type FunctionalDomainFilter } from "../../../core/functionalSchematic";
import { buildNetworkSummaryPanelControllerSlice } from "./useAppControllerScreenContentSlices";

type NetworkSummaryPanelSliceParams = Parameters<typeof buildNetworkSummaryPanelControllerSlice>[0];

interface UseAppControllerNetworkSummaryPanelDomainParams {
  NetworkSummaryPanelComponent: NetworkSummaryPanelSliceParams["NetworkSummaryPanelComponent"];
  hasActiveNetwork: boolean;
  isModelingScreen: boolean;
  isAnalysisScreen: boolean;
  isModelingAnalysisFocused: boolean;
  activeSubScreen: SubScreenId;
  entityCountBySubScreen: Record<SubScreenId, number>;
  onQuickEntityNavigation: (subScreen: SubScreenId) => void;
  activeNetwork: Network | null;
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
    | "networkScale"
  >;
  canvasDisplayState: Pick<
    AppControllerCanvasDisplayStateModel,
    | "showNetworkInfoPanels"
    | "setShowNetworkInfoPanels"
    | "showSegmentNames"
    | "showSegmentLengths"
    | "setShowSegmentLengths"
    | "showCableCallouts"
    | "setShowCableCallouts"
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
    | "canvasZoomInvariantNodeShapes"
    | "canvasNodeShapeSizePercent"
    | "canvasResizeBehaviorMode"
    | "canvasExportFormat"
    | "canvasExportIncludeFrame"
    | "canvasExportIncludeCartouche"
    | "canvasPngExportIncludeBackground"
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
  handleRegenerateLayout: () => void;
  markDetailPanelsSelectionSourceAsExternal: () => void;
  dispatchAction: (action: AppAction, options?: { trackHistory?: boolean }) => void;
  store: AppStore;
}

export function useAppControllerNetworkSummaryPanelDomain({
  NetworkSummaryPanelComponent,
  hasActiveNetwork,
  isModelingScreen,
  isAnalysisScreen,
  isModelingAnalysisFocused,
  activeSubScreen,
  entityCountBySubScreen,
  onQuickEntityNavigation,
  activeNetwork,
  nodes,
  segments,
  wires,
  catalogItems,
  subNetworkSummaries,
  routingGraph,
  totalEdgeEntries,
  networkNodePositions,
  selectedWireRouteSegmentIds,
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
  handleRegenerateLayout,
  markDetailPanelsSelectionSourceAsExternal,
  dispatchAction,
  store
}: UseAppControllerNetworkSummaryPanelDomainParams) {
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

  const shouldIncludeNetworkSummaryPanel = hasActiveNetwork && (isModelingScreen || isAnalysisScreen);

  const networkSummaryPanel = shouldIncludeNetworkSummaryPanel
    ? buildNetworkSummaryPanelControllerSlice({
        NetworkSummaryPanelComponent,
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
        showCableCallouts: canvasDisplayState.showCableCallouts,
        setShowCableCallouts: canvasDisplayState.setShowCableCallouts,
        showSelectedCalloutOnly: canvasDisplayState.showSelectedCalloutOnly,
        networkLabelStrokeMode: canvasDisplayState.networkLabelStrokeMode,
        networkLabelSizeMode: canvasDisplayState.networkLabelSizeMode,
        networkCalloutTextSize: canvasDisplayState.networkCalloutTextSize,
        networkLabelRotationDegrees: canvasDisplayState.networkLabelRotationDegrees,
        networkAutoSegmentLabelRotation: canvasDisplayState.networkAutoSegmentLabelRotation,
        showCalloutWireNames: preferencesState.canvasShowCalloutWireNames,
        zoomInvariantNodeShapes: preferencesState.canvasZoomInvariantNodeShapes,
        nodeShapeSizePercent: preferencesState.canvasNodeShapeSizePercent,
        resizeBehaviorMode: preferencesState.canvasResizeBehaviorMode,
        canvasExportFormat: preferencesState.canvasExportFormat,
        exportIncludeFrame: preferencesState.canvasExportIncludeFrame,
        exportIncludeCartouche: preferencesState.canvasExportIncludeCartouche,
        exportCartoucheNetworkName: activeNetwork?.name ?? "",
        exportCartoucheAuthor: activeNetwork?.author,
        exportCartoucheProjectCode: activeNetwork?.projectCode,
        exportCartoucheCreatedAt: activeNetwork?.createdAt ?? new Date().toISOString(),
        exportCartoucheLogoUrl: activeNetwork?.logoUrl,
        exportCartoucheNotes: activeNetwork?.exportNotes,
        networkScalePercent,
        routingGraph,
        totalEdgeEntries,
        nodes,
        segments,
        wires,
        catalogItems,
        activeNetwork,
        isPanningNetwork: canvasState.isPanningNetwork,
        networkViewWidth: effectiveNetworkViewWidth,
        networkViewHeight: effectiveNetworkViewHeight,
        networkGridStep,
        networkOffset: canvasState.networkOffset,
        networkScale: canvasState.networkScale,
        handleNetworkCanvasMouseDown,
        handleNetworkCanvasClick,
        handleNetworkWheel,
        handleNetworkMouseMove,
        stopNetworkNodeDrag,
        networkNodePositions,
        selectedWireRouteSegmentIds,
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
        quickEntityNavigationMode: isModelingScreen && !isModelingAnalysisFocused ? "modeling" : "analysis",
        activeSubScreen,
        entityCountBySubScreen,
        onQuickEntityNavigation,
        onSelectConnectorFromCallout: handleSelectConnectorFromCallout,
        onSelectSpliceFromCallout: handleSelectSpliceFromCallout,
        onPersistConnectorCalloutPosition: persistConnectorCalloutPosition,
        onPersistSpliceCalloutPosition: persistSpliceCalloutPosition,
        onViewportSizeChange,
        pngExportIncludeBackground: preferencesState.canvasPngExportIncludeBackground,
        canExportBomCsv,
        onExportBomCsv,
        handleRegenerateLayout,
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
  const activeHarnessAssembly =
    globalState.activeNetworkId === null
      ? null
      : harnessAssemblies.find((assembly) => assembly.members.some((member) => member.networkId === globalState.activeNetworkId)) ?? null;
  const networksById = new Map(allNetworks.map((network) => [network.id, network]));
  const assemblyGraphFactory = useMemo(() => {
    if (activeHarnessAssembly === null) {
      return null;
    }
    return (activeFilter: FunctionalDomainFilter) => {
      const state = store.getState();
      const networksById = new Map(
        activeHarnessAssembly.members.flatMap((member) => {
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
      const rootConnectorRefs =
        activeHarnessAssembly.masterConnectorRefs.length > 0
          ? activeHarnessAssembly.masterConnectorRefs
          : [...networksById].flatMap(([networkId, bundle]) =>
              [...bundle.connectorMap.values()]
                .filter((connector) => connector.isMainHarnessConnector === true)
                .map((connector) => ({ networkId, connectorId: connector.id }))
            );
      return buildHarnessAssemblyFunctionalSchematicGraph({
        assembly: activeHarnessAssembly,
        networksById,
        activeFilter,
        rootConnectorRefs
      });
    };
  }, [activeHarnessAssembly, store]);
  const interconnectorDetails =
    activeHarnessAssembly === null
      ? undefined
      : new Map(
          activeHarnessAssembly.connectorLinks.flatMap((link) => {
            const sourceNetwork = networksById.get(link.sourceNetworkId);
            const targetNetwork = networksById.get(link.targetNetworkId);
            const sourceConnector = connectorsByNetworkId.get(link.sourceNetworkId)?.find((connector) => connector.id === link.sourceConnectorId);
            const targetConnector = connectorsByNetworkId.get(link.targetNetworkId)?.find((connector) => connector.id === link.targetConnectorId);
            if (sourceNetwork === undefined || targetNetwork === undefined || sourceConnector === undefined || targetConnector === undefined) {
              return [];
            }
            return [
              [
                String(link.id),
                {
                  name: link.name ?? "Interconnector",
                  sourceNetworkId: link.sourceNetworkId,
                  sourceNetworkLabel: `${sourceNetwork.technicalId} - ${sourceNetwork.name}`,
                  sourceConnectorId: link.sourceConnectorId,
                  sourceConnectorLabel: `${sourceConnector.technicalId} - ${sourceConnector.name}`,
                  targetNetworkId: link.targetNetworkId,
                  targetNetworkLabel: `${targetNetwork.technicalId} - ${targetNetwork.name}`,
                  targetConnectorId: link.targetConnectorId,
                  targetConnectorLabel: `${targetConnector.technicalId} - ${targetConnector.name}`,
                  onOpenSource: () => {
                    dispatchAction(appActions.selectNetwork(link.sourceNetworkId), { trackHistory: false });
                    dispatchAction(appActions.select({ kind: "connector", id: link.sourceConnectorId }), { trackHistory: false });
                  },
                  onOpenTarget: () => {
                    dispatchAction(appActions.selectNetwork(link.targetNetworkId), { trackHistory: false });
                    dispatchAction(appActions.select({ kind: "connector", id: link.targetConnectorId }), { trackHistory: false });
                  }
                }
              ] as const
            ];
          })
        );
  const networkFunctionalSchematicPanel = hasActiveNetwork ? (
    <>
      <HarnessAssemblyManagerPanel
        assemblies={harnessAssemblies}
        networks={allNetworks}
        connectorsByNetworkId={connectorsByNetworkId}
        activeNetworkId={globalState.activeNetworkId}
        onUpsertAssembly={(assembly) => dispatchAction(appActions.upsertHarnessAssembly(assembly))}
        onRemoveAssembly={(assemblyId) => dispatchAction(appActions.removeHarnessAssembly(assemblyId))}
      />
      <FunctionalSchematicPanel
        network={activeNetwork}
        wires={wires}
        segments={segments}
        catalogItems={catalogItems}
        connectorMap={connectorMap}
        spliceMap={spliceMap}
        rootConnectorIds={mainHarnessConnectorIds}
        assemblyGraphFactory={assemblyGraphFactory ?? undefined}
        interconnectorDetails={interconnectorDetails}
        title={activeHarnessAssembly === null ? "Functional schematic" : "Harness assembly functional schematic"}
        subtitle={
          activeHarnessAssembly === null
            ? undefined
            : `Filtered trace across ${activeHarnessAssembly.name} from configured master connectors.`
        }
        selectedWireId={null}
        selectedConnectorId={mainHarnessConnectorIds[0] ?? null}
        selectedSpliceId={null}
        canvasExportFormat={preferencesState.canvasExportFormat}
        pngExportIncludeBackground={preferencesState.canvasPngExportIncludeBackground}
        exportIncludeFrame={preferencesState.canvasExportIncludeFrame}
        exportIncludeCartouche={preferencesState.canvasExportIncludeCartouche}
      />
    </>
  ) : null;

  return {
    networkSummaryPanel,
    networkFunctionalSchematicPanel
  };
}
