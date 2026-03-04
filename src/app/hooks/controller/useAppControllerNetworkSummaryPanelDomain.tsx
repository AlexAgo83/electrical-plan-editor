import { useCallback } from "react";
import type { AppAction } from "../../../store/actions";
import type {
  Connector,
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
import type { AppControllerCanvasDisplayStateModel } from "../useAppControllerCanvasDisplayState";
import type { CanvasStateModel } from "../useCanvasState";
import type { AppControllerPreferencesStateModel } from "../useAppControllerPreferencesState";
import type { ShortestRouteResult } from "../../../core/pathfinding";
import type { NodePosition, SubScreenId } from "../../types/app-controller";
import type { AppControllerSelectionEntitiesModel } from "../useAppControllerSelectionEntities";
import { appActions } from "../../../store";
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
  onViewportSizeChange: (size: { width: number; height: number }) => void;
  canExportBomCsv: boolean;
  onExportBomCsv: () => void;
  handleRegenerateLayout: () => void;
  markDetailPanelsSelectionSourceAsExternal: () => void;
  dispatchAction: (action: AppAction, options?: { trackHistory?: boolean }) => void;
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
  onViewportSizeChange,
  canExportBomCsv,
  onExportBomCsv,
  handleRegenerateLayout,
  markDetailPanelsSelectionSourceAsExternal,
  dispatchAction
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
        handleRegenerateLayout
      }).networkSummaryPanel
    : null;

  return {
    networkSummaryPanel
  };
}
