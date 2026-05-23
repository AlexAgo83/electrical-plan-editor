import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactElement
} from "react";
import type {
  ConnectorId,
  NodeId,
  Segment,
  SegmentId,
  SpliceId
} from "../../core/entities";
import type {
  NodePosition
} from "../types/app-controller";
import { NetworkRoutePreviewPanel } from "./network-summary/NetworkRoutePreviewPanel";
import { NetworkSummaryEditMenu } from "./network-summary/NetworkSummaryEditMenu";
import { NetworkSummaryViewMenu } from "./network-summary/NetworkSummaryViewMenu";
import { NetworkSummaryExportMenu } from "./network-summary/NetworkSummaryExportMenu";
import { NetworkSummaryQuickEntityNavigation } from "./network-summary/NetworkSummaryQuickEntityNavigation";
import { NetworkSummaryCanvasPanel } from "./network-summary/NetworkSummaryCanvasPanel";
import { useActiveSubNetworkTags } from "./network-summary/useActiveSubNetworkTags";
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
  type CalloutTargetKey,
  type DraggingCalloutState
} from "./network-summary/callouts/calloutLayout";
import {
  buildRenderedNodes,
  buildRenderedSegments
} from "./network-summary/graph/networkSummaryGraphModel";
import {
  useNetworkSummaryExportActions
} from "./network-summary/export/useNetworkSummaryExportActions";
import { FunctionalSchematicPanel } from "./network-summary/FunctionalSchematicPanel";
import { SvgExportPreviewDialog } from "./dialogs/SvgExportPreviewDialog";
import { snapToGrid } from "../lib/app-utils-shared";
import type { NetworkSummaryPanelProps } from "./network-summary/NetworkSummaryPanel.types";

const CALLOUT_DRAG_START_THRESHOLD_PX = 4;

interface SvgPreviewOptions {
  includeFrame: boolean;
  includeCartouche: boolean;
}

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
  canvasExportFormat,
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
  toggleShowNetworkGrid,
  toggleSnapNodesToGrid,
  toggleLockEntityMovement,
  networkScalePercent,
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
  networkScale,
  handleNetworkCanvasMouseDown,
  handleNetworkCanvasClick,
  handleNetworkWheel,
  handleNetworkMouseMove,
  stopNetworkNodeDrag,
  networkNodePositions,
  selectedWireRouteSegmentIds,
  selectedSegmentId,
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
  onSelectConnectorFromCallout,
  onSelectSpliceFromCallout,
  onSelectWireFromConnectorPin,
  onPersistConnectorCalloutPosition,
  onPersistSpliceCalloutPosition,
  onViewportSizeChange,
  pngExportIncludeBackground,
  canExportBomCsv,
  onExportBomCsv,
  onRegenerateLayout,
  onOpenCurrentNetworkFunctional,
  activeNetwork,
  catalogItems,
  showFunctionalSchematic = true
}: NetworkSummaryPanelProps): ReactElement {
  void networkScalePercent;
  const [pendingFitSvgPreviewOptions, setPendingFitSvgPreviewOptions] = useState<SvgPreviewOptions | null>(null);
  const networkSvgRef = useRef<SVGSVGElement | null>(null);
  const networkCanvasShellRef = useRef<HTMLDivElement | null>(null);
  const graphStats = [
    { label: "Graph nodes", value: routingGraphNodeCount },
    { label: "Graph segments", value: routingGraphSegmentCount },
    { label: "Adjacency entries", value: totalEdgeEntries }
  ];
  const activeNetworkName = activeNetwork?.name.trim() ?? "";
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

  useEffect(() => {
    if (
      resizeBehaviorMode !== "visibleAreaOnly" ||
      onViewportSizeChange === undefined ||
      typeof window === "undefined"
    ) {
      return undefined;
    }
    let animationFrameId = 0;
    const measureViewport = () => {
      animationFrameId = 0;
      const svgElement = networkSvgRef.current;
      if (svgElement === null) {
        return;
      }
      const rect = svgElement.getBoundingClientRect();
      if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height) || rect.width <= 0 || rect.height <= 0) {
        return;
      }
      onViewportSizeChange({
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height))
      });
    };
    const scheduleMeasure = () => {
      if (animationFrameId !== 0) {
        return;
      }
      animationFrameId = window.requestAnimationFrame(measureViewport);
    };

    scheduleMeasure();
    window.addEventListener("resize", scheduleMeasure);
    const observedElement = networkCanvasShellRef.current ?? networkSvgRef.current;
    const resizeObserver =
      observedElement === null || typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleMeasure);
    if (resizeObserver !== null && observedElement !== null) {
      resizeObserver.observe(observedElement);
    }
    return () => {
      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("resize", scheduleMeasure);
      resizeObserver?.disconnect();
    };
  }, [onViewportSizeChange, resizeBehaviorMode, nodes.length]);

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
  const [hoveredCalloutKey, setHoveredCalloutKey] = useState<CalloutTargetKey | null>(null);
  const [draggingCallout, setDraggingCallout] = useState<DraggingCalloutState | null>(null);
  const [draftCalloutPositions, setDraftCalloutPositions] = useState<Record<string, NodePosition>>({});

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

  const handleCalloutMouseDown = useCallback(
    (
      event: ReactMouseEvent<SVGGElement>,
      callout: Pick<CableCalloutViewModel, "key" | "kind" | "entityId" | "position">
    ) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setDraggingCallout({
        key: callout.key,
        kind: callout.kind,
        entityId: callout.entityId,
        startPosition: callout.position,
        startClientX: event.clientX,
        startClientY: event.clientY,
        hasStartedDrag: false
      });
    },
    []
  );
  const handleCanvasMouseMoveWithCallouts = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (draggingCallout === null) {
        handleNetworkMouseMove(event);
        return;
      }
      let hasStartedDrag = draggingCallout.hasStartedDrag;
      if (!hasStartedDrag) {
        if (lockEntityMovement) {
          return;
        }
        const deltaClientX = event.clientX - draggingCallout.startClientX;
        const deltaClientY = event.clientY - draggingCallout.startClientY;
        if (Math.hypot(deltaClientX, deltaClientY) < CALLOUT_DRAG_START_THRESHOLD_PX) {
          return;
        }
        hasStartedDrag = true;
        selectCalloutTarget(draggingCallout);
        setDraggingCallout((current) =>
          current !== null && current.key === draggingCallout.key
            ? { ...current, hasStartedDrag: true }
            : current
        );
      }
      const coordinates = getSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
      if (coordinates === null) {
        return;
      }
      setDraftCalloutPositions((current) => {
        const previousPosition = current[draggingCallout.key];
        if (
          previousPosition !== undefined &&
          Math.abs(previousPosition.x - coordinates.x) <= 0.0001 &&
          Math.abs(previousPosition.y - coordinates.y) <= 0.0001
        ) {
          return current;
        }
        return {
          ...current,
          [draggingCallout.key]: coordinates
        };
      });
    },
    [draggingCallout, getSvgCoordinates, handleNetworkMouseMove, lockEntityMovement, selectCalloutTarget]
  );

  const stopCalloutDrag = useCallback(() => {
    if (draggingCallout === null) {
      return;
    }

    const draftPosition = draftCalloutPositions[draggingCallout.key];
    if (!draggingCallout.hasStartedDrag) {
      selectCalloutTarget(draggingCallout);
    } else if (draftPosition !== undefined) {
      const changed =
        Math.abs(draftPosition.x - draggingCallout.startPosition.x) > 0.0001 ||
        Math.abs(draftPosition.y - draggingCallout.startPosition.y) > 0.0001;
      if (changed) {
        if (draggingCallout.kind === "connector") {
          onPersistConnectorCalloutPosition(draggingCallout.entityId as ConnectorId, draftPosition);
        } else {
          onPersistSpliceCalloutPosition(draggingCallout.entityId as SpliceId, draftPosition);
        }
      }
    }

    setDraggingCallout(null);
    setDraftCalloutPositions((current) => {
      if (current[draggingCallout.key] === undefined) {
        return current;
      }
      const next = { ...current };
      delete next[draggingCallout.key];
      return next;
    });
  }, [
    draggingCallout,
    draftCalloutPositions,
    onPersistConnectorCalloutPosition,
    onPersistSpliceCalloutPosition,
    selectCalloutTarget
  ]);

  const stopNetworkInteractions = useCallback(() => {
    stopCalloutDrag();
    stopNetworkNodeDrag();
  }, [stopCalloutDrag, stopNetworkNodeDrag]);

  const {
    activeSvgPreview,
    createSvgPreview,
    handleCloseSvgPreview,
    handleDownloadSvgPreview,
    handleExportPlan
  } = useNetworkSummaryExportActions({
    networkSvgRef,
    networkCanvasShellRef,
    canvasExportFormat,
    networkOffset,
    networkScale: effectiveScale,
    renderedNetworkScale: effectiveRenderScale,
    pngExportIncludeBackground,
    exportIncludeFrame,
    exportIncludeCartouche,
    exportCartoucheNetworkName,
    exportCartoucheAuthor,
    exportCartoucheProjectCode,
    exportCartoucheCreatedAt,
    exportCartoucheLogoUrl,
    exportCartoucheNotes
  });

  const handleSvgPreviewOptionsChange = useCallback(
    (options: SvgPreviewOptions) => {
      setExportIncludeFrame(options.includeFrame);
      setExportIncludeCartouche(options.includeCartouche);
      void createSvgPreview(options);
    },
    [createSvgPreview, setExportIncludeCartouche, setExportIncludeFrame]
  );

  const handleFitNetworkAndRefreshSvgPreview = useCallback(() => {
    setPendingFitSvgPreviewOptions(
      activeSvgPreview === null
        ? {
            includeFrame: exportIncludeFrame,
            includeCartouche: exportIncludeCartouche
          }
        : {
            includeFrame: activeSvgPreview.includeFrame,
            includeCartouche: activeSvgPreview.includeCartouche
          }
    );
    fitNetworkToContent();
  }, [activeSvgPreview, exportIncludeCartouche, exportIncludeFrame, fitNetworkToContent]);

  useEffect(() => {
    if (pendingFitSvgPreviewOptions === null) {
      return;
    }

    void createSvgPreview(pendingFitSvgPreviewOptions);
    setPendingFitSvgPreviewOptions(null);
  }, [createSvgPreview, pendingFitSvgPreviewOptions]);

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
        connectorMap,
        catalogItems,
        connectorDrawingDisplayMode,
        normalizedNodeShapeScale,
        connectorDrawingScale: normalizedConnectorNodeDrawingScale,
        zoomInvariantNodeShapes,
        inverseLabelScale,
        autoSegmentLabelRotation,
        labelRotationDegrees,
        showSegmentNames,
        showSegmentLengths
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
      connectorMap,
      catalogItems,
      connectorDrawingDisplayMode,
      normalizedNodeShapeScale,
      normalizedConnectorNodeDrawingScale,
      zoomInvariantNodeShapes,
      inverseLabelScale,
      autoSegmentLabelRotation,
      labelRotationDegrees,
      showSegmentNames,
      showSegmentLengths
    ]
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
      />
      <section className="panel">
        <header className="network-summary-header">
          <div className="network-summary-title">
            <h2>Network summary</h2>
            {activeNetworkName.length > 0 ? (
              <>
                <span className="network-summary-title-separator" aria-hidden="true">
                  :
                </span>
                <span className="network-summary-active-network" aria-hidden="true">
                  {activeNetworkName}
                </span>
              </>
            ) : null}
          </div>
          <div className="network-summary-header-actions" role="group" aria-label="Network summary display options">
            <NetworkSummaryEditMenu
              showNetworkGrid={showNetworkGrid}
              snapNodesToGrid={snapNodesToGrid}
              lockEntityMovement={lockEntityMovement}
              toggleShowNetworkGrid={toggleShowNetworkGrid}
              toggleSnapNodesToGrid={toggleSnapNodesToGrid}
              toggleLockEntityMovement={toggleLockEntityMovement}
              onRegenerateLayout={onRegenerateLayout}
            />
            <NetworkSummaryViewMenu
              showFloatingInspectorPanel={showFloatingInspectorPanel}
              showNetworkInfoPanels={showNetworkInfoPanels}
              showSegmentLengths={showSegmentLengths}
              showCableCallouts={showCableCallouts}
              toggleShowFloatingInspectorPanel={toggleShowFloatingInspectorPanel}
              toggleShowNetworkInfoPanels={toggleShowNetworkInfoPanels}
              toggleShowSegmentLengths={toggleShowSegmentLengths}
              toggleShowCableCallouts={toggleShowCableCallouts}
            />
            {onOpenCurrentNetworkFunctional === undefined ? null : (
              <button
                type="button"
                className="workspace-tab"
                onClick={onOpenCurrentNetworkFunctional}
              >
                <span className="action-button-icon is-harness-assembly" aria-hidden="true" />
                Functional
              </button>
            )}
            <NetworkSummaryExportMenu
              canvasExportFormat={canvasExportFormat}
              canExportCanvas={nodes.length > 0}
              canExportBomCsv={canExportBomCsv}
              onExportCanvas={handleExportPlan}
              onExportBomCsv={onExportBomCsv}
            />
          </div>
        </header>
        <NetworkSummaryCanvasPanel
          nodes={nodes}
          networkCanvasShellRef={networkCanvasShellRef}
          networkSvgRef={networkSvgRef}
          isPanningNetwork={isPanningNetwork}
          showNetworkInfoPanels={showNetworkInfoPanels}
          handleZoomAction={handleZoomAction}
          fitNetworkToContent={fitNetworkToContent}
          globalRenderScalePercent={globalRenderScalePercent}
          setGlobalRenderScalePercent={setGlobalRenderScalePercent}
          selectedCanvasNodeCount={selectedCanvasNodeIds.size}
          clearSelectedCanvasNodes={clearSelectedCanvasNodes}
          lockEntityMovement={lockEntityMovement}
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
          showSegmentNames={showSegmentNames}
          showSegmentLengths={showSegmentLengths}
          inverseLabelScale={inverseLabelScale}
          labelRotationDegrees={labelRotationDegrees}
          zoomInvariantNodeShapes={zoomInvariantNodeShapes}
          normalizedNodeShapeScale={normalizedNodeShapeScale}
          normalizedConnectorNodeDrawingScale={normalizedConnectorNodeDrawingScale}
          nodeStrokeWidth={nodeStrokeWidth}
          nodeStrokeEmphasisWidth={nodeStrokeEmphasisWidth}
          describeNode={describeNode}
          handleNetworkSegmentClick={handleNetworkSegmentClick}
          handleNetworkNodeMouseDown={handleNetworkNodeMouseDown}
          handleNetworkNodeActivate={handleNetworkNodeActivate}
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
          canvasExportFormat={canvasExportFormat}
          pngExportIncludeBackground={pngExportIncludeBackground}
          exportIncludeFrame={exportIncludeFrame}
          exportIncludeCartouche={exportIncludeCartouche}
        />
      ) : null}
      <SvgExportPreviewDialog
        isOpen={activeSvgPreview !== null}
        preview={activeSvgPreview}
        onPreviewOptionsChange={handleSvgPreviewOptionsChange}
        onFitNetwork={handleFitNetworkAndRefreshSvgPreview}
        onConfirm={handleDownloadSvgPreview}
        onCancel={handleCloseSvgPreview}
      />
    </section>
  );
}
