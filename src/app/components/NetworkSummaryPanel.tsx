import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type WheelEvent as ReactWheelEvent
} from "react";
import type {
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire
} from "../../core/entities";
import type { ShortestRouteResult } from "../../core/pathfinding";
import type { SubNetworkSummary } from "../../store";
import type {
  CanvasCalloutTextSize,
  CanvasExportFormat,
  CanvasLabelRotationDegrees,
  CanvasResizeBehaviorMode,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  NodePosition,
  SubScreenId
} from "../types/app-controller";
import { NetworkCanvasFloatingInfoPanels } from "./network-summary/NetworkCanvasFloatingInfoPanels";
import { NetworkRoutePreviewPanel } from "./network-summary/NetworkRoutePreviewPanel";
import { NetworkSummaryLegend } from "./network-summary/NetworkSummaryLegend";
import { NetworkSummaryQuickEntityNavigation } from "./network-summary/NetworkSummaryQuickEntityNavigation";
import {
  buildCableCalloutViewModels,
  buildConnectorCalloutGroupsById,
  buildSpliceCalloutGroupsById
} from "./network-summary/callouts/calloutModel";
import {
  NetworkSummaryCalloutLeaders,
  NetworkSummaryCalloutsLayer
} from "./network-summary/callouts/NetworkSummaryCalloutsLayer";
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
import { NetworkSummaryGraphLayers } from "./network-summary/graph/NetworkSummaryGraphLayers";
import {
  useNetworkSummaryExportActions
} from "./network-summary/export/useNetworkSummaryExportActions";
import { snapToGrid } from "../lib/app-utils-shared";


export interface NetworkSummaryPanelProps {
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  fitNetworkToContent: () => void;
  showNetworkInfoPanels: boolean;
  showSegmentNames: boolean;
  showSegmentLengths: boolean;
  showCableCallouts: boolean;
  showSelectedCalloutOnly: boolean;
  showCalloutWireNames: boolean;
  zoomInvariantNodeShapes: boolean;
  nodeShapeSizePercent: number;
  resizeBehaviorMode: CanvasResizeBehaviorMode;
  labelStrokeMode: CanvasLabelStrokeMode;
  labelSizeMode: CanvasLabelSizeMode;
  calloutTextSize: CanvasCalloutTextSize;
  labelRotationDegrees: CanvasLabelRotationDegrees;
  autoSegmentLabelRotation: boolean;
  canvasExportFormat: CanvasExportFormat;
  exportIncludeFrame: boolean;
  exportIncludeCartouche: boolean;
  exportCartoucheNetworkName: string;
  exportCartoucheAuthor?: string;
  exportCartoucheProjectCode?: string;
  exportCartoucheCreatedAt: string;
  exportCartoucheLogoUrl?: string;
  exportCartoucheNotes?: string;
  showNetworkGrid: boolean;
  snapNodesToGrid: boolean;
  lockEntityMovement: boolean;
  toggleShowNetworkInfoPanels: () => void;
  toggleShowSegmentLengths: () => void;
  toggleShowCableCallouts: () => void;
  toggleShowNetworkGrid: () => void;
  toggleSnapNodesToGrid: () => void;
  toggleLockEntityMovement: () => void;
  networkScalePercent: number;
  routingGraphNodeCount: number;
  routingGraphSegmentCount: number;
  totalEdgeEntries: number;
  nodes: NetworkNode[];
  segments: Segment[];
  wires: Wire[];
  isPanningNetwork: boolean;
  networkViewWidth: number;
  networkViewHeight: number;
  networkGridStep: number;
  networkOffset: NodePosition;
  networkScale: number;
  handleNetworkCanvasMouseDown: (event: ReactMouseEvent<SVGSVGElement>) => void;
  handleNetworkCanvasClick: (event: ReactMouseEvent<SVGSVGElement>) => void;
  handleNetworkWheel: (event: ReactWheelEvent<SVGSVGElement>) => void;
  handleNetworkMouseMove: (event: ReactMouseEvent<SVGSVGElement>) => void;
  stopNetworkNodeDrag: () => void;
  networkNodePositions: Record<NodeId, NodePosition>;
  selectedWireRouteSegmentIds: Set<SegmentId>;
  selectedSegmentId: SegmentId | null;
  selectedWireId: Wire["id"] | null;
  handleNetworkSegmentClick: (segmentId: SegmentId) => void;
  selectedNodeId: NodeId | null;
  selectedConnectorId: ConnectorId | null;
  selectedSpliceId: SpliceId | null;
  handleNetworkNodeMouseDown: (event: ReactMouseEvent<SVGGElement>, nodeId: NodeId) => void;
  handleNetworkNodeActivate: (nodeId: NodeId) => void;
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  describeNode: (node: NetworkNode) => string;
  subNetworkSummaries: SubNetworkSummary[];
  routePreviewStartNodeId: string;
  setRoutePreviewStartNodeId: (value: string) => void;
  routePreviewEndNodeId: string;
  setRoutePreviewEndNodeId: (value: string) => void;
  routePreview: ShortestRouteResult | null;
  quickEntityNavigationMode: "modeling" | "analysis";
  activeSubScreen: SubScreenId;
  entityCountBySubScreen: Record<SubScreenId, number>;
  onQuickEntityNavigation: (subScreen: SubScreenId) => void;
  onSelectConnectorFromCallout: (connectorId: ConnectorId) => void;
  onSelectSpliceFromCallout: (spliceId: SpliceId) => void;
  onPersistConnectorCalloutPosition: (connectorId: ConnectorId, position: NodePosition) => void;
  onPersistSpliceCalloutPosition: (spliceId: SpliceId, position: NodePosition) => void;
  onViewportSizeChange?: (size: { width: number; height: number }) => void;
  pngExportIncludeBackground: boolean;
  canExportBomCsv: boolean;
  onExportBomCsv: () => void;
  onRegenerateLayout: () => void;
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
  showSelectedCalloutOnly,
  showCalloutWireNames,
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
  exportIncludeCartouche,
  exportCartoucheNetworkName,
  exportCartoucheAuthor,
  exportCartoucheProjectCode,
  exportCartoucheCreatedAt,
  exportCartoucheLogoUrl,
  exportCartoucheNotes,
  showNetworkGrid,
  snapNodesToGrid,
  lockEntityMovement,
  toggleShowNetworkInfoPanels,
  toggleShowSegmentLengths,
  toggleShowCableCallouts,
  toggleShowNetworkGrid,
  toggleSnapNodesToGrid,
  toggleLockEntityMovement,
  networkScalePercent,
  routingGraphNodeCount,
  routingGraphSegmentCount,
  totalEdgeEntries,
  nodes,
  segments,
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
  quickEntityNavigationMode,
  activeSubScreen,
  entityCountBySubScreen,
  onQuickEntityNavigation,
  onSelectConnectorFromCallout,
  onSelectSpliceFromCallout,
  onPersistConnectorCalloutPosition,
  onPersistSpliceCalloutPosition,
  onViewportSizeChange,
  pngExportIncludeBackground,
  canExportBomCsv,
  onExportBomCsv,
  onRegenerateLayout
}: NetworkSummaryPanelProps): ReactElement {
  const networkSvgRef = useRef<SVGSVGElement | null>(null);
  const networkCanvasShellRef = useRef<HTMLDivElement | null>(null);
  const subNetworkFilterInitializedRef = useRef(false);
  const [activeSubNetworkTags, setActiveSubNetworkTags] = useState<Set<string>>(new Set());
  const graphStats = [
    { label: "Graph nodes", value: routingGraphNodeCount },
    { label: "Graph segments", value: routingGraphSegmentCount },
    { label: "Adjacency entries", value: totalEdgeEntries }
  ];
  const effectiveScale = networkScale > 0 ? networkScale : 1;
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
  const visibleModelMinX = (0 - networkOffset.x) / effectiveScale;
  const visibleModelMaxX = (networkViewWidth - networkOffset.x) / effectiveScale;
  const visibleModelMinY = (0 - networkOffset.y) / effectiveScale;
  const visibleModelMaxY = (networkViewHeight - networkOffset.y) / effectiveScale;
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

  useEffect(() => {
    return () => {
      disposeCalloutMeasurementResources();
    };
  }, []);

  useEffect(() => {
    if (allSubNetworkTags.length === 0) {
      subNetworkFilterInitializedRef.current = false;
      setActiveSubNetworkTags((current) => (current.size === 0 ? current : new Set()));
      return;
    }

    setActiveSubNetworkTags((current) => {
      const next = new Set<string>();
      const isUninitialized = !subNetworkFilterInitializedRef.current;
      for (const tag of allSubNetworkTags) {
        if (isUninitialized || current.has(tag)) {
          next.add(tag);
        }
      }
      if (isUninitialized) {
        subNetworkFilterInitializedRef.current = true;
      }
      const hasSameSize = next.size === current.size;
      if (hasSameSize && [...next].every((tag) => current.has(tag))) {
        return current;
      }
      return next;
    });
  }, [allSubNetworkTags]);

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

  const activeSubNetworkTagSet = activeSubNetworkTags as ReadonlySet<string>;
  const isSubNetworkFilteringActive =
    allSubNetworkTags.length > 0 && activeSubNetworkTagSet.size < allSubNetworkTags.length;

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
      if (!activeSubNetworkTagSet.has(tag)) {
        continue;
      }
      byNodeId.set(segment.nodeA, true);
      byNodeId.set(segment.nodeB, true);
    }
    return byNodeId;
  }, [nodes, segments, segmentSubNetworkTagById, activeSubNetworkTagSet]);

  const toggleSubNetworkTag = useCallback((tag: string) => {
    setActiveSubNetworkTags((current) => {
      const next = new Set(current);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const enableAllSubNetworkTags = useCallback(() => {
    setActiveSubNetworkTags(new Set(allSubNetworkTags));
  }, [allSubNetworkTags]);

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
        showSelectedCalloutOnly,
        nodes,
        networkNodePositions,
        connectorMap,
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
      showSelectedCalloutOnly,
      nodes,
      networkNodePositions,
      connectorMap,
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
      const modelX = (localX - networkOffset.x) / networkScale;
      const modelY = (localY - networkOffset.y) / networkScale;
      return {
        x: snapNodesToGrid ? snapToGrid(modelX, networkGridStep) : modelX,
        y: snapNodesToGrid ? snapToGrid(modelY, networkGridStep) : modelY
      };
    },
    [networkGridStep, networkOffset.x, networkOffset.y, networkScale, networkViewHeight, networkViewWidth, snapNodesToGrid]
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
      if (callout.kind === "connector") {
        onSelectConnectorFromCallout(callout.entityId as ConnectorId);
      } else {
        onSelectSpliceFromCallout(callout.entityId as SpliceId);
      }

      if (lockEntityMovement) {
        return;
      }

      setDraggingCallout({
        key: callout.key,
        kind: callout.kind,
        entityId: callout.entityId,
        startPosition: callout.position
      });
      setDraftCalloutPositions((current) => ({
        ...current,
        [callout.key]: callout.position
      }));
    },
    [lockEntityMovement, onSelectConnectorFromCallout, onSelectSpliceFromCallout]
  );

  const handleCanvasMouseMoveWithCallouts = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (draggingCallout === null) {
        handleNetworkMouseMove(event);
        return;
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
    [draggingCallout, getSvgCoordinates, handleNetworkMouseMove]
  );

  const stopCalloutDrag = useCallback(() => {
    if (draggingCallout === null) {
      return;
    }

    const draftPosition = draftCalloutPositions[draggingCallout.key];
    if (draftPosition !== undefined) {
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
    onPersistSpliceCalloutPosition
  ]);

  const stopNetworkInteractions = useCallback(() => {
    stopCalloutDrag();
    stopNetworkNodeDrag();
  }, [stopCalloutDrag, stopNetworkNodeDrag]);

  const { handleExportPlan } = useNetworkSummaryExportActions({
    networkSvgRef,
    networkCanvasShellRef,
    canvasExportFormat,
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

  const renderedCableCallouts = useMemo(() => {
    return computeRenderedCableCallouts({
      orderedCableCallouts,
      calloutTextSize,
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
        networkNodePositions,
        segmentSubNetworkTagById,
        isSubNetworkFilteringActive,
        activeSubNetworkTagSet,
        selectedWireRouteSegmentIds,
        selectedSegmentId,
        autoSegmentLabelRotation,
        labelRotationDegrees,
        showSegmentNames,
        showSegmentLengths
      }),
    [
      segments,
      networkNodePositions,
      segmentSubNetworkTagById,
      isSubNetworkFilteringActive,
      activeSubNetworkTagSet,
      selectedWireRouteSegmentIds,
      selectedSegmentId,
      autoSegmentLabelRotation,
      labelRotationDegrees,
      showSegmentNames,
      showSegmentLengths
    ]
  );

  const renderedNodes = useMemo(
    () =>
      buildRenderedNodes({
        nodes,
        networkNodePositions,
        isSubNetworkFilteringActive,
        nodeHasActiveSubNetworkConnection,
        selectedNodeId,
        selectedConnectorId,
        selectedSpliceId,
        connectorMap,
        spliceMap
      }),
    [
      nodes,
      networkNodePositions,
      isSubNetworkFilteringActive,
      nodeHasActiveSubNetworkConnection,
      selectedNodeId,
      selectedConnectorId,
      selectedSpliceId,
      connectorMap,
      spliceMap
    ]
  );

  return (
    <section className="network-summary-stack">
      <section className="panel">
        <header className="network-summary-header">
          <h2>Network summary</h2>
          <div className="network-summary-header-actions" role="group" aria-label="Network summary display options">
            <button
              type="button"
              className={showNetworkInfoPanels ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleShowNetworkInfoPanels}
            >
              <span className="network-summary-info-icon" aria-hidden="true" />
              Info
            </button>
            <button
              type="button"
              className={showSegmentLengths ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleShowSegmentLengths}
            >
              <span className="network-summary-length-icon" aria-hidden="true" />
              Length
            </button>
            <button
              type="button"
              className={showCableCallouts ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleShowCableCallouts}
            >
              <span className="network-summary-callouts-icon" aria-hidden="true" />
              Callouts
            </button>
            <button
              type="button"
              className={showNetworkGrid ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleShowNetworkGrid}
            >
              <span className="network-summary-grid-icon" aria-hidden="true" />
              Grid
            </button>
            <button
              type="button"
              className={snapNodesToGrid ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleSnapNodesToGrid}
            >
              <span className="network-summary-snap-icon" aria-hidden="true" />
              Snap
            </button>
            <button
              type="button"
              className={lockEntityMovement ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleLockEntityMovement}
            >
              <span className="network-summary-lock-move-icon" aria-hidden="true" />
              Lock
            </button>
            <button
              type="button"
              className="workspace-tab network-summary-export-button"
              onClick={handleExportPlan}
              disabled={nodes.length === 0}
            >
              <span className="network-summary-export-icon" aria-hidden="true" />
              {canvasExportFormat.toUpperCase()}
            </button>
            <button
              type="button"
              className="workspace-tab network-summary-export-button"
              onClick={onExportBomCsv}
              disabled={!canExportBomCsv}
            >
              <span className="table-export-icon" aria-hidden="true" />
              BOM
            </button>
          </div>
        </header>
        <div className="network-summary-canvas-region">
          {nodes.length === 0 ? (
            <p className="empty-copy">No nodes yet. Create nodes and segments to render the 2D network.</p>
          ) : (
            <div ref={networkCanvasShellRef} className={`network-canvas-shell${isPanningNetwork ? " is-panning" : ""}`}>
              <NetworkCanvasFloatingInfoPanels
                showNetworkInfoPanels={showNetworkInfoPanels}
                handleZoomAction={handleZoomAction}
                fitNetworkToContent={fitNetworkToContent}
                onRegenerateLayout={onRegenerateLayout}
                networkScalePercent={networkScalePercent}
                subNetworkSummaries={subNetworkSummaries}
                activeSubNetworkTags={activeSubNetworkTagSet}
                toggleSubNetworkTag={toggleSubNetworkTag}
                enableAllSubNetworkTags={enableAllSubNetworkTags}
                graphStats={graphStats}
              />
              <svg
                ref={networkSvgRef}
                className={`network-svg${useStrokeInvariantLines ? " network-svg--stroke-invariant" : ""} network-canvas--label-stroke-${labelStrokeMode} network-canvas--label-size-${labelSizeMode} network-callout-text-size-${calloutTextSize}`}
                aria-label="2D network diagram"
                viewBox={`0 0 ${networkViewWidth} ${networkViewHeight}`}
                style={networkSvgStrokeVariables}
                onMouseDown={handleNetworkCanvasMouseDown}
                onClick={handleNetworkCanvasClick}
                onWheel={handleNetworkWheel}
                onMouseMove={handleCanvasMouseMoveWithCallouts}
                onMouseUp={stopNetworkInteractions}
                onMouseLeave={stopNetworkInteractions}
              >
              <NetworkSummaryCalloutLeaders
                renderedCableCallouts={renderedCableCallouts}
                networkOffset={networkOffset}
                networkScale={networkScale}
              />
              <NetworkSummaryGraphLayers
                networkOffset={networkOffset}
                networkScale={networkScale}
                showNetworkGrid={showNetworkGrid}
                gridXPositions={gridXPositions}
                gridYPositions={gridYPositions}
                visibleModelMinX={visibleModelMinX}
                visibleModelMaxX={visibleModelMaxX}
                visibleModelMinY={visibleModelMinY}
                visibleModelMaxY={visibleModelMaxY}
                renderedSegments={renderedSegments}
                renderedNodes={renderedNodes}
                showSegmentNames={showSegmentNames}
                showSegmentLengths={showSegmentLengths}
                inverseLabelScale={inverseLabelScale}
                labelRotationDegrees={labelRotationDegrees}
                zoomInvariantNodeShapes={zoomInvariantNodeShapes}
                normalizedNodeShapeScale={normalizedNodeShapeScale}
                nodeStrokeWidth={nodeStrokeWidth}
                nodeStrokeEmphasisWidth={nodeStrokeEmphasisWidth}
                describeNode={describeNode}
                onSelectSegment={handleNetworkSegmentClick}
                onNodeMouseDown={handleNetworkNodeMouseDown}
                onNodeActivate={handleNetworkNodeActivate}
              />

              <NetworkSummaryCalloutsLayer
                renderedCableCallouts={renderedCableCallouts}
                inverseLabelScale={inverseLabelScale}
                selectedWireId={selectedWireId}
                onHoverCallout={setHoveredCalloutKey}
                onCalloutMouseDown={handleCalloutMouseDown}
                onSelectConnectorFromCallout={onSelectConnectorFromCallout}
                onSelectSpliceFromCallout={onSelectSpliceFromCallout}
                networkOffset={networkOffset}
                networkScale={networkScale}
              />
              </svg>
            </div>
          )}
        </div>
        <p className="empty-copy network-summary-mobile-unavailable" role="status">
          2D network summary is not available on mobile. Use a wider screen to access the canvas controls and legend.
        </p>
        <NetworkSummaryLegend />
      </section>
      <NetworkRoutePreviewPanel
        nodes={nodes}
        describeNode={describeNode}
        routePreviewStartNodeId={routePreviewStartNodeId}
        setRoutePreviewStartNodeId={setRoutePreviewStartNodeId}
        routePreviewEndNodeId={routePreviewEndNodeId}
        setRoutePreviewEndNodeId={setRoutePreviewEndNodeId}
        routePreview={routePreview}
      />
      <NetworkSummaryQuickEntityNavigation
        quickEntityNavigationMode={quickEntityNavigationMode}
        activeSubScreen={activeSubScreen}
        entityCountBySubScreen={entityCountBySubScreen}
        onQuickEntityNavigation={onQuickEntityNavigation}
      />
    </section>
  );
}
