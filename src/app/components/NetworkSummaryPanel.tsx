import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactElement
} from "react";
import type { ConnectorId, NodeId, Segment, SegmentId, SpliceId } from "../../core/entities";
import type { NodePosition } from "../types/app-controller";
import { NetworkRoutePreviewPanel } from "./network-summary/NetworkRoutePreviewPanel";
import { NetworkSummaryHeader } from "./network-summary/NetworkSummaryHeader";
import { NetworkSummaryQuickEntityNavigation } from "./network-summary/NetworkSummaryQuickEntityNavigation";
import { NetworkSummaryCanvasPanel } from "./network-summary/NetworkSummaryCanvasPanel";
import { useActiveSubNetworkTags } from "./network-summary/useActiveSubNetworkTags";
import { useNetworkSummaryCalloutDragging } from "./network-summary/useNetworkSummaryCalloutDragging";
import { useNetworkSummaryRenderScaleControls } from "./network-summary/useNetworkSummaryRenderScaleControls";
import { useNetworkSummaryViewportSizeChange } from "./network-summary/useNetworkSummaryViewportSizeChange";
import {
  buildCableCalloutViewModels,
  buildConnectorCalloutGroupsById,
  buildSpliceCalloutGroupsById
} from "./network-summary/callouts/calloutModel";
import {
  CALLOUT_OFFSET_SCREEN_UNITS,
  computeRenderedCableCallouts,
  disposeCalloutMeasurementResources,
  normalizeVector,
  type CableCalloutViewModel,
  type CalloutTargetKey
} from "./network-summary/callouts/calloutLayout";
import { buildRenderedNodes, buildRenderedSegments } from "./network-summary/graph/networkSummaryGraphModel";
import { type SvgPreviewOptions, useNetworkSummaryExportActions } from "./network-summary/export/useNetworkSummaryExportActions";
import { FunctionalSchematicPanel } from "./network-summary/FunctionalSchematicPanel";
import { SvgExportPreviewDialog } from "./dialogs/SvgExportPreviewDialog";
import { PreviewLoadingDialog } from "./dialogs/PreviewLoadingDialog";
import { snapToGrid } from "../lib/app-utils-shared";
import { getThemeClassNames } from "../lib/themeModes";
import type { NetworkSummaryPanelHandle, NetworkSummaryPanelProps } from "./network-summary/NetworkSummaryPanel.types";

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function NetworkSummaryPanel({
  handleZoomAction,
  fitNetworkToContent,
  showNetworkInfoPanels,
  showSegmentNames,
  showSegmentLengths,
  showCableCallouts,
  calloutContentMode,
  showSelectedCalloutOnly,
  showCalloutWireNames,
  connectorDrawingDisplayMode,
  useConsistentConnectorLayoutScale,
  connectorDrawingScalePercent,
  globalRenderScalePercent,
  setGlobalRenderScalePercent,
  zoomInvariantNodeShapes,
  nodeShapeSizePercent,
  resizeBehaviorMode,
  labelStrokeMode,
  labelSizeMode,
  calloutTextSize,
  labelRotationDegrees,
  autoSegmentLabelRotation,
  themeMode,
  exportIncludeFrame,
  setExportIncludeFrame,
  exportIncludeCartouche,
  setExportIncludeCartouche,
  exportCartoucheNetworkName,
  exportCartoucheAuthor,
  exportCartoucheProjectCode,
  exportCartoucheCreatedAt,
  exportCartoucheLogoUrl,
  exportCartoucheNotes,
  showFloatingInspectorPanel,
  showNetworkGrid,
  snapNodesToGrid,
  lockEntityMovement,
  toggleShowNetworkInfoPanels,
  toggleShowSegmentLengths,
  toggleShowCableCallouts,
  toggleShowFloatingInspectorPanel,
  openInspectorForCanvasSelection,
  toggleShowNetworkGrid,
  toggleSnapNodesToGrid,
  toggleLockEntityMovement,
  routingGraphNodeCount,
  routingGraphSegmentCount,
  totalEdgeEntries,
  nodes,
  segments,
  splicePlacementPreview,
  wires,
  isPanningNetwork,
  networkViewWidth,
  networkViewHeight,
  networkGridStep,
  networkOffset,
  setNetworkOffset,
  networkScale,
  handleNetworkCanvasMouseDown,
  handleNetworkCanvasClick,
  handleNetworkWheel,
  handleNetworkMouseMove,
  stopNetworkNodeDrag,
  networkNodePositions,
  selectedWireRouteSegmentIds,
  selectedSegmentId,
  selectedBatchSegmentIds,
  selectedWireId,
  handleNetworkSegmentClick,
  selectedCanvasNodeIds,
  clearSelectedCanvasNodes,
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
  showRoutePreviewPanel,
  quickEntityNavigationMode,
  activeSubScreen,
  entityCountBySubScreen,
  onQuickEntityNavigation,
  isAiAgentOpen = false,
  isAiAgentReady = false,
  aiAgentDisabledReason,
  onOpenAiAgent,
  onSelectConnectorFromCallout,
  onSelectSpliceFromCallout,
  onSelectWireFromConnectorPin,
  onPersistConnectorCalloutPosition,
  onPersistSpliceCalloutPosition,
  onPersistSegmentSheathCalloutPosition,
  onViewportSizeChange,
  pngExportIncludeBackground,
  canExportBomCsv,
  onExportBomCsv,
  onExportNetwork,
  onRegenerateLayout,
  onOpenCurrentNetworkFunctional,
  onOpenMultiNetworkFunctionalAnalysis,
  activeNetwork,
  networks,
  onSelectActiveNetwork,
  catalogItems,
  showFunctionalSchematic = true,
  imperativeRef
}: NetworkSummaryPanelProps): ReactElement {
  const networkSvgRef = useRef<SVGSVGElement | null>(null);
  const networkCanvasShellRef = useRef<HTMLDivElement | null>(null);
  const graphStats = [
    { label: "Graph nodes", value: routingGraphNodeCount },
    { label: "Graph segments", value: routingGraphSegmentCount },
    { label: "Adjacency entries", value: totalEdgeEntries }
  ];
  const dialogThemeHostClassName = ["app-shell", ...getThemeClassNames(themeMode)].join(" ");
  const globalRenderScale = 1 + clampNumber(globalRenderScalePercent, 0, 300) / 100;
  const effectiveScale = networkScale > 0 ? networkScale : 1;
  const effectiveRenderScale = effectiveScale * globalRenderScale;
  const inverseLabelScale = 1 / effectiveScale;
  const normalizedNodeShapeScale = zoomInvariantNodeShapes
    ? Math.min(1.25, Math.max(0.5, nodeShapeSizePercent / 100))
    : 1;
  const normalizedNodeStrokeScale = zoomInvariantNodeShapes
    ? clampNumber(normalizedNodeShapeScale, 0.65, 1.35)
    : 1;
  const nodeStrokeWidth = clampNumber(2 * normalizedNodeStrokeScale, 1.4, 3.4);
  const nodeStrokeEmphasisWidth = clampNumber(3 * normalizedNodeStrokeScale, 2.1, 5.1);
  const segmentStrokeWidth = clampNumber(3 * normalizedNodeStrokeScale, 1.95, 4.05);
  const segmentStrokeEmphasisWidth = clampNumber(5 * normalizedNodeStrokeScale, 3.25, 6.75);
  const calloutLeaderStrokeWidth = clampNumber(1.25 * normalizedNodeStrokeScale, 0.82, 1.7);
  const calloutLeaderDashFirst = clampNumber(1.7 * normalizedNodeStrokeScale, 1.1, 2.3);
  const calloutLeaderDashSecond = clampNumber(2.4 * normalizedNodeStrokeScale, 1.56, 3.24);
  const networkSvgStrokeVariables = {
    "--network-segment-stroke-width": `${segmentStrokeWidth}`,
    "--network-segment-stroke-emphasis-width": `${segmentStrokeEmphasisWidth}`,
    "--network-callout-leader-stroke-width": `${calloutLeaderStrokeWidth}`,
    "--network-callout-leader-dasharray": `${calloutLeaderDashFirst} ${calloutLeaderDashSecond}`
  } as CSSProperties;
  const useStrokeInvariantLines = resizeBehaviorMode === "visibleAreaOnly";
  const visibleModelMinX = (0 - networkOffset.x) / effectiveRenderScale;
  const visibleModelMaxX = (networkViewWidth - networkOffset.x) / effectiveRenderScale;
  const visibleModelMinY = (0 - networkOffset.y) / effectiveRenderScale;
  const visibleModelMaxY = (networkViewHeight - networkOffset.y) / effectiveRenderScale;
  const gridStartX = Math.floor(visibleModelMinX / networkGridStep) * networkGridStep;
  const gridEndX = Math.ceil(visibleModelMaxX / networkGridStep) * networkGridStep;
  const gridStartY = Math.floor(visibleModelMinY / networkGridStep) * networkGridStep;
  const gridEndY = Math.ceil(visibleModelMaxY / networkGridStep) * networkGridStep;
  const verticalGridLineCount = Math.max(0, Math.ceil((gridEndX - gridStartX) / networkGridStep) + 1);
  const horizontalGridLineCount = Math.max(0, Math.ceil((gridEndY - gridStartY) / networkGridStep) + 1);
  const gridXPositions = Array.from({ length: verticalGridLineCount }, (_, index) => gridStartX + index * networkGridStep);
  const gridYPositions = Array.from({ length: horizontalGridLineCount }, (_, index) => gridStartY + index * networkGridStep);
  const handleGlobalRenderScalePercentChange = useNetworkSummaryRenderScaleControls({
    effectiveScale,
    globalRenderScalePercent,
    networkViewWidth,
    networkViewHeight,
    setGlobalRenderScalePercent,
    setNetworkOffset
  });
  const allSubNetworkTags = useMemo(
    () => subNetworkSummaries.map((summary) => summary.tag),
    [subNetworkSummaries]
  );
  const {
    activeSubNetworkTags,
    isSubNetworkFilteringActive,
    toggleSubNetworkTag,
    enableAllSubNetworkTags
  } = useActiveSubNetworkTags(allSubNetworkTags);
  useEffect(() => {
    return () => {
      disposeCalloutMeasurementResources();
    };
  }, []);

  useNetworkSummaryViewportSizeChange({
    networkCanvasShellRef,
    networkSvgRef,
    nodeCount: nodes.length,
    onViewportSizeChange,
    resizeBehaviorMode
  });

  const segmentSubNetworkTagById = useMemo(() => {
    const byId = new Map<SegmentId, string>();
    for (const segment of segments) {
      const normalizedTag = segment.subNetworkTag?.trim();
      byId.set(segment.id, normalizedTag === undefined || normalizedTag.length === 0 ? "(default)" : normalizedTag);
    }
    return byId;
  }, [segments]);
  const nodeHasActiveSubNetworkConnection = useMemo(() => {
    const byNodeId = new Map<NodeId, boolean>();
    for (const node of nodes) {
      byNodeId.set(node.id, false);
    }
    for (const segment of segments) {
      const tag = segmentSubNetworkTagById.get(segment.id) ?? "(default)";
      if (!activeSubNetworkTags.has(tag)) {
        continue;
      }
      byNodeId.set(segment.nodeA, true);
      byNodeId.set(segment.nodeB, true);
    }
    return byNodeId;
  }, [nodes, segments, segmentSubNetworkTagById, activeSubNetworkTags]);
  const graphCenter = useMemo(() => {
    const positionedNodes = nodes
      .map((node) => networkNodePositions[node.id])
      .filter((position): position is NodePosition => position !== undefined);
    if (positionedNodes.length === 0) {
      return { x: 0, y: 0 };
    }
    const sum = positionedNodes.reduce(
      (accumulator, position) => ({
        x: accumulator.x + position.x,
        y: accumulator.y + position.y
      }),
      { x: 0, y: 0 }
    );
    return {
      x: sum.x / positionedNodes.length,
      y: sum.y / positionedNodes.length
    };
  }, [nodes, networkNodePositions]);

  const connectedSegmentDirectionByNodeId = useMemo(() => {
    const directions = new Map<NodeId, { x: number; y: number }[]>();
    for (const node of nodes) {
      directions.set(node.id, []);
    }
    for (const segment of segments) {
      const positionA = networkNodePositions[segment.nodeA];
      const positionB = networkNodePositions[segment.nodeB];
      if (positionA === undefined || positionB === undefined) {
        continue;
      }
      const forward = normalizeVector(positionB.x - positionA.x, positionB.y - positionA.y);
      const backward = normalizeVector(positionA.x - positionB.x, positionA.y - positionB.y);
      directions.get(segment.nodeA)?.push(forward);
      directions.get(segment.nodeB)?.push(backward);
    }
    return directions;
  }, [nodes, segments, networkNodePositions]);

  const connectorCalloutGroupsById = useMemo(
    () =>
      buildConnectorCalloutGroupsById({
        connectorMap,
        spliceMap,
        wires
      }),
    [connectorMap, spliceMap, wires]
  );

  const spliceCalloutGroupsById = useMemo(
    () =>
      buildSpliceCalloutGroupsById({
        connectorMap,
        spliceMap,
        wires
      }),
    [connectorMap, spliceMap, wires]
  );

  const getDefaultCalloutPosition = useCallback(
    (nodeId: NodeId, nodePosition: NodePosition) => {
      const connectedDirections = connectedSegmentDirectionByNodeId.get(nodeId) ?? [];
      let outward = { x: 0, y: 0 };
      if (connectedDirections.length > 0) {
        const accumulated = connectedDirections.reduce(
          (accumulator, direction) => ({
            x: accumulator.x + direction.x,
            y: accumulator.y + direction.y
          }),
          { x: 0, y: 0 }
        );
        outward = normalizeVector(-accumulated.x, -accumulated.y);
      }

      if (outward.x === 0 && outward.y === 0) {
        outward = normalizeVector(nodePosition.x - graphCenter.x, nodePosition.y - graphCenter.y);
      }
      if (outward.x === 0 && outward.y === 0) {
        outward = { x: 1, y: -0.4 };
      }

      const distance = CALLOUT_OFFSET_SCREEN_UNITS * inverseLabelScale;
      return {
        x: nodePosition.x + outward.x * distance,
        y: nodePosition.y + outward.y * distance
      } satisfies NodePosition;
    },
    [connectedSegmentDirectionByNodeId, graphCenter, inverseLabelScale]
  );

  const getSvgCoordinates = useCallback(
    (svgElement: SVGSVGElement, clientX: number, clientY: number): NodePosition | null => {
      const bounds = svgElement.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) {
        return null;
      }

      const localX = ((clientX - bounds.left) / bounds.width) * networkViewWidth;
      const localY = ((clientY - bounds.top) / bounds.height) * networkViewHeight;
      const modelX = (localX - networkOffset.x) / effectiveRenderScale;
      const modelY = (localY - networkOffset.y) / effectiveRenderScale;
      return {
        x: snapNodesToGrid ? snapToGrid(modelX, networkGridStep) : modelX,
        y: snapNodesToGrid ? snapToGrid(modelY, networkGridStep) : modelY
      };
    },
    [effectiveRenderScale, networkGridStep, networkOffset.x, networkOffset.y, networkViewHeight, networkViewWidth, snapNodesToGrid]
  );

  const selectCalloutTarget = useCallback(
    (callout: Pick<CableCalloutViewModel, "kind" | "entityId">) => {
      clearSelectedCanvasNodes();
      if (callout.kind === "connector") {
        onSelectConnectorFromCallout(callout.entityId as ConnectorId);
      } else {
        onSelectSpliceFromCallout(callout.entityId as SpliceId);
      }
    },
    [clearSelectedCanvasNodes, onSelectConnectorFromCallout, onSelectSpliceFromCallout]
  );

  const {
    hoveredCalloutKey,
    setHoveredCalloutKey,
    draggingCallout,
    draftCalloutPositions,
    draftSegmentCalloutPositions,
    handleCalloutMouseDown,
    beginSegmentCalloutDrag,
    handleCanvasMouseMoveWithCallouts,
    stopNetworkInteractions
  } = useNetworkSummaryCalloutDragging({
    lockEntityMovement,
    getSvgCoordinates,
    handleNetworkMouseMove,
    handleNetworkSegmentClick,
    selectCalloutTarget,
    onPersistConnectorCalloutPosition,
    onPersistSpliceCalloutPosition,
    onPersistSegmentSheathCalloutPosition,
    stopNetworkNodeDrag
  });

  const cableCalloutViewModels = useMemo(
    () =>
      buildCableCalloutViewModels({
        showCableCallouts,
        calloutContentMode: connectorDrawingDisplayMode === "callouts" ? calloutContentMode : "wireDetails",
        showSelectedCalloutOnly,
        nodes,
        networkNodePositions,
        connectorMap,
        catalogItems,
        spliceMap,
        connectorCalloutGroupsById,
        spliceCalloutGroupsById,
        draftCalloutPositions,
        getDefaultCalloutPosition,
        isSubNetworkFilteringActive,
        nodeHasActiveSubNetworkConnection,
        selectedConnectorId,
        selectedSpliceId,
        selectedNodeId
      }),
    [
      showCableCallouts,
      calloutContentMode,
      connectorDrawingDisplayMode,
      showSelectedCalloutOnly,
      nodes,
      networkNodePositions,
      connectorMap,
      catalogItems,
      spliceMap,
      connectorCalloutGroupsById,
      spliceCalloutGroupsById,
      draftCalloutPositions,
      getDefaultCalloutPosition,
      isSubNetworkFilteringActive,
      nodeHasActiveSubNetworkConnection,
      selectedConnectorId,
      selectedSpliceId,
      selectedNodeId
    ]
  );

  useEffect(() => {
    if (!showCableCallouts || cableCalloutViewModels.length === 0) {
      return;
    }

    for (const callout of cableCalloutViewModels) {
      if (callout.kind === "connector") {
        const connector = connectorMap.get(callout.entityId as ConnectorId);
        if (connector?.cableCalloutPosition === undefined) {
          onPersistConnectorCalloutPosition(callout.entityId as ConnectorId, callout.position);
        }
        continue;
      }

      const splice = spliceMap.get(callout.entityId as SpliceId);
      if (splice?.cableCalloutPosition === undefined) {
        onPersistSpliceCalloutPosition(callout.entityId as SpliceId, callout.position);
      }
    }
  }, [
    cableCalloutViewModels,
    connectorMap,
    onPersistConnectorCalloutPosition,
    onPersistSpliceCalloutPosition,
    showCableCallouts,
    spliceMap
  ]);

  const orderedCableCallouts = useMemo(() => {
    if (cableCalloutViewModels.length <= 1) {
      return cableCalloutViewModels;
    }

    const draggingKey = draggingCallout?.key ?? null;
    return [...cableCalloutViewModels].sort((left, right) => {
      const weightFor = (key: CalloutTargetKey, isSelected: boolean) => {
        if (draggingKey === key) {
          return 3;
        }
        if (hoveredCalloutKey === key) {
          return 2;
        }
        if (isSelected) {
          return 1;
        }
        return 0;
      };
      const weightDelta = weightFor(left.key, left.isSelected) - weightFor(right.key, right.isSelected);
      if (weightDelta !== 0) {
        return weightDelta;
      }
      return left.title.localeCompare(right.title) || left.subtitle.localeCompare(right.subtitle);
    });
  }, [cableCalloutViewModels, draggingCallout?.key, hoveredCalloutKey]);

  const {
    activeSvgPreview,
    createPngPreview,
    createPdfPage,
    createSvgPreview,
    handleCloseSvgPreview,
    handleDownloadSvgPreview,
    handleExportPlanAsPdfDirect,
    handleExportPlanAsPng,
    handleExportPlanAsPngDirect,
    handleExportPlanAsSvg,
    handleExportPlanAsSvgDirect,
    isSvgPreviewLoading,
    svgPreviewLoadingFormat
  } = useNetworkSummaryExportActions({
    networkSvgRef,
    networkCanvasShellRef,
    networkOffset,
    networkScale: effectiveScale,
    renderedNetworkScale: effectiveRenderScale,
    themeMode,
    pngExportIncludeBackground,
    exportIncludeFrame,
    exportIncludeCartouche,
    exportIncludeGrid: showNetworkGrid,
    exportCartoucheNetworkName,
    exportCartoucheAuthor,
    exportCartoucheProjectCode,
    exportCartoucheCreatedAt,
    exportCartoucheLogoUrl,
    exportCartoucheNotes
  });

  useImperativeHandle(
    imperativeRef,
    (): NetworkSummaryPanelHandle => ({
      exportPngDirect: handleExportPlanAsPngDirect,
      exportPdfDirect: handleExportPlanAsPdfDirect,
      exportPdfPage: createPdfPage,
      exportSvgDirect: handleExportPlanAsSvgDirect
    }),
    [createPdfPage, handleExportPlanAsPdfDirect, handleExportPlanAsPngDirect, handleExportPlanAsSvgDirect]
  );
  const handleSvgPreviewOptionsChange = useCallback(
    (options: SvgPreviewOptions) => {
      if (options.includeFrame !== undefined) {
        setExportIncludeFrame(options.includeFrame);
      }
      if (options.includeCartouche !== undefined) {
        setExportIncludeCartouche(options.includeCartouche);
      }
      if (options.format === "png") {
        void createPngPreview(options);
        return;
      }
      void createSvgPreview(options);
    },
    [createPngPreview, createSvgPreview, setExportIncludeCartouche, setExportIncludeFrame]
  );

  const normalizedConnectorDrawingScale = clampNumber(connectorDrawingScalePercent / 100, 1, 2);
  const normalizedConnectorNodeDrawingScale =
    connectorDrawingDisplayMode === "nodes" ? normalizedConnectorDrawingScale * 2.4 : normalizedConnectorDrawingScale;

  const renderedCableCallouts = useMemo(() => {
    return computeRenderedCableCallouts({
      orderedCableCallouts,
      calloutTextSize,
      connectorDrawingScale: normalizedConnectorDrawingScale,
      calloutContentMode,
      showCalloutWireNames,
      inverseLabelScale,
      hoveredCalloutKey,
      draggingCalloutKey: draggingCallout?.key ?? null,
      visibleModelMinX,
      visibleModelMaxX,
      visibleModelMinY,
      visibleModelMaxY
    });
  }, [
    orderedCableCallouts,
    calloutTextSize,
    normalizedConnectorDrawingScale,
    calloutContentMode,
    showCalloutWireNames,
    inverseLabelScale,
    hoveredCalloutKey,
    draggingCallout?.key,
    visibleModelMinX,
    visibleModelMaxX,
    visibleModelMinY,
    visibleModelMaxY
  ]);

  const segmentCalloutObstacles = useMemo(
    () =>
      renderedCableCallouts
        .filter(({ isVisibleInViewport }) => isVisibleInViewport)
        .map(({ callout, layout }) => ({
          centerX: callout.position.x,
          centerY: callout.position.y,
          width: layout.width * inverseLabelScale,
          height: layout.height * inverseLabelScale
        })),
    [renderedCableCallouts, inverseLabelScale]
  );

  const renderedSegments = useMemo(
    () =>
      buildRenderedSegments({
        segments,
        nodes,
        networkNodePositions,
        segmentSubNetworkTagById,
        isSubNetworkFilteringActive,
        activeSubNetworkTagSet: activeSubNetworkTags,
        selectedWireRouteSegmentIds,
        selectedSegmentId,
        selectedBatchSegmentIds,
        connectorMap,
        catalogItems,
        connectorDrawingDisplayMode,
        normalizedNodeShapeScale,
        connectorDrawingScale: normalizedConnectorNodeDrawingScale,
        useConsistentConnectorLayoutScale,
        zoomInvariantNodeShapes,
        inverseLabelScale,
        autoSegmentLabelRotation,
        labelRotationDegrees,
        showSegmentNames,
        showSegmentLengths,
        draftSegmentCalloutPositions,
        spliceMap
      }),
    [
      segments,
      nodes,
      networkNodePositions,
      segmentSubNetworkTagById,
      isSubNetworkFilteringActive,
      activeSubNetworkTags,
      selectedWireRouteSegmentIds,
      selectedSegmentId,
      selectedBatchSegmentIds,
      connectorMap,
      catalogItems,
      connectorDrawingDisplayMode,
      normalizedNodeShapeScale,
      normalizedConnectorNodeDrawingScale,
      useConsistentConnectorLayoutScale,
      zoomInvariantNodeShapes,
      inverseLabelScale,
      autoSegmentLabelRotation,
      labelRotationDegrees,
      showSegmentNames,
      showSegmentLengths,
      draftSegmentCalloutPositions,
      spliceMap
    ]
  );

  const handleSegmentCalloutMouseDown = useCallback(
    (event: ReactMouseEvent<SVGGElement>, segmentId: SegmentId) => {
      const segmentCallout = renderedSegments.find((entry) => entry.segment.id === segmentId)?.segmentCallout;
      beginSegmentCalloutDrag(
        event,
        segmentId,
        segmentCallout === null || segmentCallout === undefined
          ? null
          : { x: segmentCallout.anchorX, y: segmentCallout.anchorY }
      );
    },
    [beginSegmentCalloutDrag, renderedSegments]
  );

  const splicePlacementPreviewSegments = useMemo(() => {
    if (splicePlacementPreview === undefined || splicePlacementPreview === null) {
      return [];
    }

    const changedSegmentIds = new Set<SegmentId>([
      ...Object.keys(splicePlacementPreview.segments).map((segmentId) => segmentId as SegmentId),
      ...splicePlacementPreview.removedSegmentIds
    ]);
    const previewNodePositions =
      splicePlacementPreview.spliceNodePosition === null
        ? networkNodePositions
        : {
            ...networkNodePositions,
            [splicePlacementPreview.spliceNodeId]: splicePlacementPreview.spliceNodePosition
          };

    const buildPreviewLine = (
      segment: Segment,
      kind: "current" | "suggested",
      nodePositions: Record<NodeId, NodePosition>
    ) => {
      const nodeAPosition = nodePositions[segment.nodeA];
      const nodeBPosition = nodePositions[segment.nodeB];
      if (nodeAPosition === undefined || nodeBPosition === undefined) {
        return null;
      }
      return {
        key: `${kind}:${segment.id}`,
        segmentId: segment.id,
        kind,
        nodeAPosition,
        nodeBPosition
      };
    };

    const currentLines = segments
      .filter((segment) => changedSegmentIds.has(segment.id))
      .map((segment) => buildPreviewLine(segment, "current", networkNodePositions))
      .filter((line): line is NonNullable<typeof line> => line !== null);
    const suggestedLines = Object.values(splicePlacementPreview.segments)
      .map((segment) => buildPreviewLine(segment, "suggested", previewNodePositions))
      .filter((line): line is NonNullable<typeof line> => line !== null);

    return [...currentLines, ...suggestedLines];
  }, [networkNodePositions, segments, splicePlacementPreview]);

  const splicePlacementPreviewNode = useMemo(() => {
    if (
      splicePlacementPreview === undefined ||
      splicePlacementPreview === null ||
      splicePlacementPreview.spliceNodePosition === null
    ) {
      return null;
    }

    return {
      nodeId: splicePlacementPreview.spliceNodeId,
      position: splicePlacementPreview.spliceNodePosition
    };
  }, [splicePlacementPreview]);

  const renderedNodes = useMemo(
    () =>
      buildRenderedNodes({
        nodes,
        networkNodePositions,
        isSubNetworkFilteringActive,
        nodeHasActiveSubNetworkConnection,
        selectedCanvasNodeIds,
        selectedNodeId,
        selectedConnectorId,
        selectedSpliceId,
        connectorMap,
        catalogItems,
        connectorDrawingDisplayMode,
        connectorCalloutGroupsById,
        selectedWireId,
        spliceMap
      }),
    [
      nodes,
      networkNodePositions,
      isSubNetworkFilteringActive,
      nodeHasActiveSubNetworkConnection,
      selectedCanvasNodeIds,
      selectedNodeId,
      selectedConnectorId,
      selectedSpliceId,
      connectorMap,
      catalogItems,
      connectorDrawingDisplayMode,
      connectorCalloutGroupsById,
      selectedWireId,
      spliceMap
    ]
  );

  return (
    <section className="network-summary-stack">
      <NetworkSummaryQuickEntityNavigation
        quickEntityNavigationMode={quickEntityNavigationMode}
        activeSubScreen={activeSubScreen}
        entityCountBySubScreen={entityCountBySubScreen}
        onQuickEntityNavigation={onQuickEntityNavigation}
        isAiAgentOpen={isAiAgentOpen}
        isAiAgentReady={isAiAgentReady}
        aiAgentDisabledReason={aiAgentDisabledReason}
        onOpenAiAgent={onOpenAiAgent}
      />
      <section className="panel">
        <NetworkSummaryHeader
          activeNetwork={activeNetwork}
          networks={networks}
          showNetworkGrid={showNetworkGrid}
          snapNodesToGrid={snapNodesToGrid}
          lockEntityMovement={lockEntityMovement}
          showFloatingInspectorPanel={showFloatingInspectorPanel}
          showNetworkInfoPanels={showNetworkInfoPanels}
          showSegmentLengths={showSegmentLengths}
          showCableCallouts={showCableCallouts}
          canExportSvg={nodes.length > 0}
          canExportPng={nodes.length > 0}
          canExportPdf={nodes.length > 0}
          canExportNetwork={activeNetwork !== null}
          canExportBomCsv={canExportBomCsv}
          onSelectActiveNetwork={onSelectActiveNetwork}
          toggleShowNetworkGrid={toggleShowNetworkGrid}
          toggleSnapNodesToGrid={toggleSnapNodesToGrid}
          toggleLockEntityMovement={toggleLockEntityMovement}
          toggleShowFloatingInspectorPanel={toggleShowFloatingInspectorPanel}
          toggleShowNetworkInfoPanels={toggleShowNetworkInfoPanels}
          toggleShowSegmentLengths={toggleShowSegmentLengths}
          toggleShowCableCallouts={toggleShowCableCallouts}
          onRegenerateLayout={onRegenerateLayout}
          onOpenCurrentNetworkFunctional={onOpenCurrentNetworkFunctional}
          onOpenMultiNetworkFunctionalAnalysis={onOpenMultiNetworkFunctionalAnalysis}
          onExportSvg={() => {
            void handleExportPlanAsSvg();
          }}
          onExportPng={() => {
            void handleExportPlanAsPng();
          }}
          onExportPdf={() => {
            void handleExportPlanAsPdfDirect();
          }}
          onExportNetwork={onExportNetwork}
          onExportBomCsv={onExportBomCsv}
        />
        <NetworkSummaryCanvasPanel
          nodes={nodes}
          networkCanvasShellRef={networkCanvasShellRef}
          networkSvgRef={networkSvgRef}
          isPanningNetwork={isPanningNetwork}
          showNetworkInfoPanels={showNetworkInfoPanels}
          handleZoomAction={handleZoomAction}
          fitNetworkToContent={fitNetworkToContent}
          globalRenderScalePercent={globalRenderScalePercent}
          setGlobalRenderScalePercent={handleGlobalRenderScalePercentChange}
          selectedCanvasNodeCount={selectedCanvasNodeIds.size}
          clearSelectedCanvasNodes={clearSelectedCanvasNodes}
          subNetworkSummaries={subNetworkSummaries}
          activeSubNetworkTags={activeSubNetworkTags}
          toggleSubNetworkTag={toggleSubNetworkTag}
          enableAllSubNetworkTags={enableAllSubNetworkTags}
          graphStats={graphStats}
          useStrokeInvariantLines={useStrokeInvariantLines}
          labelStrokeMode={labelStrokeMode}
          labelSizeMode={labelSizeMode}
          calloutTextSize={calloutTextSize}
          networkViewWidth={networkViewWidth}
          networkViewHeight={networkViewHeight}
          networkSvgStrokeVariables={networkSvgStrokeVariables}
          handleNetworkCanvasMouseDown={handleNetworkCanvasMouseDown}
          handleNetworkCanvasClick={handleNetworkCanvasClick}
          handleNetworkWheel={handleNetworkWheel}
          handleCanvasMouseMoveWithCallouts={handleCanvasMouseMoveWithCallouts}
          stopNetworkInteractions={stopNetworkInteractions}
          networkOffset={networkOffset}
          networkScale={effectiveRenderScale}
          showNetworkGrid={showNetworkGrid}
          gridXPositions={gridXPositions}
          gridYPositions={gridYPositions}
          visibleModelMinX={visibleModelMinX}
          visibleModelMaxX={visibleModelMaxX}
          visibleModelMinY={visibleModelMinY}
          visibleModelMaxY={visibleModelMaxY}
          renderedCableCallouts={renderedCableCallouts}
          renderedSegments={renderedSegments}
                splicePlacementPreviewSegments={splicePlacementPreviewSegments}
                splicePlacementPreviewNode={splicePlacementPreviewNode}
                renderedNodes={renderedNodes}
                calloutObstacles={segmentCalloutObstacles}
                showSegmentNames={showSegmentNames}
                showSegmentLengths={showSegmentLengths}
          inverseLabelScale={inverseLabelScale}
          labelRotationDegrees={labelRotationDegrees}
          zoomInvariantNodeShapes={zoomInvariantNodeShapes}
          normalizedNodeShapeScale={normalizedNodeShapeScale}
          normalizedConnectorNodeDrawingScale={normalizedConnectorNodeDrawingScale}
          useConsistentConnectorLayoutScale={useConsistentConnectorLayoutScale}
          nodeStrokeWidth={nodeStrokeWidth}
          nodeStrokeEmphasisWidth={nodeStrokeEmphasisWidth}
          describeNode={describeNode}
          handleNetworkSegmentClick={handleNetworkSegmentClick}
          handleSegmentCalloutMouseDown={handleSegmentCalloutMouseDown}
          handleNetworkNodeMouseDown={handleNetworkNodeMouseDown}
          handleNetworkNodeActivate={handleNetworkNodeActivate}
          openInspectorForCanvasSelection={openInspectorForCanvasSelection}
          selectedWireId={selectedWireId}
          setHoveredCalloutKey={setHoveredCalloutKey}
          handleCalloutMouseDown={handleCalloutMouseDown}
          onSelectConnectorFromCallout={onSelectConnectorFromCallout}
          onSelectSpliceFromCallout={onSelectSpliceFromCallout}
          onSelectWireFromConnectorPin={onSelectWireFromConnectorPin}
        />
      </section>
      {showRoutePreviewPanel ? (
        <NetworkRoutePreviewPanel
          nodes={nodes}
          describeNode={describeNode}
          routePreviewStartNodeId={routePreviewStartNodeId}
          setRoutePreviewStartNodeId={setRoutePreviewStartNodeId}
          routePreviewEndNodeId={routePreviewEndNodeId}
          setRoutePreviewEndNodeId={setRoutePreviewEndNodeId}
          routePreview={routePreview}
        />
      ) : null}
      {showFunctionalSchematic ? (
        <FunctionalSchematicPanel
          network={activeNetwork}
          wires={wires}
          segments={segments}
          catalogItems={catalogItems}
          connectorMap={connectorMap}
          spliceMap={spliceMap}
          selectedWireId={selectedWireId}
          selectedConnectorId={selectedConnectorId}
          selectedSpliceId={selectedSpliceId}
          themeMode={themeMode}
          pngExportIncludeBackground={pngExportIncludeBackground}
          exportIncludeFrame={exportIncludeFrame}
          exportIncludeCartouche={exportIncludeCartouche}
        />
      ) : null}
      <SvgExportPreviewDialog
        isOpen={activeSvgPreview !== null}
        themeHostClassName={dialogThemeHostClassName}
        showGridOption={true}
        preview={activeSvgPreview}
        onPreviewOptionsChange={handleSvgPreviewOptionsChange}
        onConfirm={handleDownloadSvgPreview}
        onCancel={handleCloseSvgPreview}
      />
      <PreviewLoadingDialog
        isOpen={isSvgPreviewLoading && activeSvgPreview === null}
        themeHostClassName={dialogThemeHostClassName}
        title={`Preparing ${svgPreviewLoadingFormat.toUpperCase()} preview`}
        message="Rendering the current network export."
      />
    </section>
  );
}
