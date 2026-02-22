import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
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
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  SubScreenId
} from "../types/app-controller";
import { NetworkCanvasFloatingInfoPanels } from "./network-summary/NetworkCanvasFloatingInfoPanels";
import { NetworkRoutePreviewPanel } from "./network-summary/NetworkRoutePreviewPanel";
import { NetworkSummaryLegend } from "./network-summary/NetworkSummaryLegend";
import { snapToGrid } from "../lib/app-utils-shared";

export interface NodePosition {
  x: number;
  y: number;
}

const SVG_EXPORT_STYLE_PROPERTIES = [
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-opacity",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "opacity",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "letter-spacing",
  "text-anchor",
  "dominant-baseline",
  "paint-order",
  "display",
  "visibility"
] as const;

function copyComputedStylesToSvgClone(sourceSvg: SVGSVGElement, cloneSvg: SVGSVGElement): void {
  const sourceElements = [sourceSvg, ...Array.from(sourceSvg.querySelectorAll("*"))] as SVGElement[];
  const cloneElements = [cloneSvg, ...Array.from(cloneSvg.querySelectorAll("*"))] as SVGElement[];
  const pairCount = Math.min(sourceElements.length, cloneElements.length);

  for (let index = 0; index < pairCount; index += 1) {
    const sourceElement = sourceElements[index];
    const cloneElement = cloneElements[index];
    if (sourceElement === undefined || cloneElement === undefined) {
      continue;
    }
    const computedStyle = window.getComputedStyle(sourceElement);
    const inlineStyle = cloneElement.style;

    for (const propertyName of SVG_EXPORT_STYLE_PROPERTIES) {
      const propertyValue = computedStyle.getPropertyValue(propertyName);
      if (propertyValue.length > 0) {
        inlineStyle.setProperty(propertyName, propertyValue);
      }
    }
  }
}

function resolveCanvasExportBackgroundFill(shellElement: HTMLElement | null): string | null {
  if (shellElement === null || typeof window === "undefined") {
    return null;
  }

  const style = window.getComputedStyle(shellElement);
  const backgroundColor = style.backgroundColor.trim();
  if (backgroundColor.length > 0 && backgroundColor !== "rgba(0, 0, 0, 0)" && backgroundColor !== "transparent") {
    return backgroundColor;
  }

  const backgroundImage = style.backgroundImage;
  if (!backgroundImage.includes("gradient")) {
    return null;
  }

  const colorMatch = backgroundImage.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})/);
  return colorMatch?.[1] ?? null;
}

export interface NetworkSummaryPanelProps {
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  fitNetworkToContent: () => void;
  showNetworkInfoPanels: boolean;
  showSegmentLengths: boolean;
  showCableCallouts: boolean;
  labelStrokeMode: CanvasLabelStrokeMode;
  labelSizeMode: CanvasLabelSizeMode;
  labelRotationDegrees: CanvasLabelRotationDegrees;
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
  pngExportIncludeBackground: boolean;
  onRegenerateLayout: () => void;
}

const QUICK_ENTITY_NAV_ITEMS: Record<
  NetworkSummaryPanelProps["quickEntityNavigationMode"],
  ReadonlyArray<{ subScreen: SubScreenId; label: string }>
> = {
  modeling: [
    { subScreen: "connector", label: "Connectors" },
    { subScreen: "splice", label: "Splices" },
    { subScreen: "node", label: "Nodes" },
    { subScreen: "segment", label: "Segments" },
    { subScreen: "wire", label: "Wires" }
  ],
  analysis: [
    { subScreen: "connector", label: "Connectors" },
    { subScreen: "splice", label: "Splices" },
    { subScreen: "wire", label: "Wires" }
  ]
};

const SUB_SCREEN_ICON_CLASS_BY_ID: Record<SubScreenId, string> = {
  connector: "is-connectors",
  splice: "is-splices",
  node: "is-nodes",
  segment: "is-segments",
  wire: "is-wires"
};

type CalloutTargetKey = `connector:${string}` | `splice:${string}`;

interface CalloutEntry {
  wireId: string;
  name: string;
  technicalId: string;
  lengthMm: number;
}

interface CalloutGroup {
  key: string;
  label: string;
  entries: CalloutEntry[];
}

interface CableCalloutViewModel {
  key: CalloutTargetKey;
  kind: "connector" | "splice";
  entityId: ConnectorId | SpliceId;
  nodeId: NodeId;
  nodePosition: NodePosition;
  position: NodePosition;
  title: string;
  subtitle: string;
  groups: CalloutGroup[];
  isDeemphasized: boolean;
  isSelected: boolean;
}

interface CalloutLayoutMetrics {
  width: number;
  headerTitleY: number;
  headerSubtitleY: number;
  groupsStartY: number;
  height: number;
  wrappedRowsByGroupKey: Record<string, string[][]>;
}

interface DraggingCalloutState {
  key: CalloutTargetKey;
  kind: "connector" | "splice";
  entityId: ConnectorId | SpliceId;
  startPosition: NodePosition;
}

const CALLOUT_OFFSET_SCREEN_UNITS = 92;
const CALLOUT_MIN_WIDTH = 132;
const CALLOUT_MAX_WIDTH = 260;

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeVector(x: number, y: number): { x: number; y: number } {
  const magnitude = Math.hypot(x, y);
  if (magnitude <= 0.0001) {
    return { x: 0, y: 0 };
  }
  return { x: x / magnitude, y: y / magnitude };
}

function wrapTextByApproxChars(text: string, maxChars: number): string[] {
  const normalized = text.trim();
  if (normalized.length === 0) {
    return [""];
  }

  const limit = Math.max(8, maxChars);
  if (normalized.length <= limit) {
    return [normalized];
  }

  const words = normalized.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  const flush = () => {
    if (current.length > 0) {
      lines.push(current);
      current = "";
    }
  };

  for (const word of words) {
    if (word.length > limit) {
      flush();
      let remaining = word;
      while (remaining.length > limit) {
        lines.push(remaining.slice(0, limit));
        remaining = remaining.slice(limit);
      }
      current = remaining;
      continue;
    }

    const candidate = current.length === 0 ? word : `${current} ${word}`;
    if (candidate.length <= limit) {
      current = candidate;
    } else {
      flush();
      current = word;
    }
  }
  flush();

  return lines.length > 0 ? lines : [normalized];
}

function buildCalloutLayoutMetrics(groups: CalloutGroup[]): CalloutLayoutMetrics {
  const titleChars = 28;
  const subtitleChars = 34;
  let longestLineLength = Math.max(titleChars, subtitleChars);
  for (const group of groups) {
    longestLineLength = Math.max(longestLineLength, group.label.length);
    for (const entry of group.entries) {
      const line = `${entry.name} (${entry.technicalId}) - ${entry.lengthMm} mm`;
      longestLineLength = Math.max(longestLineLength, line.length);
    }
  }

  const width = clampNumber(84 + longestLineLength * 3.2, CALLOUT_MIN_WIDTH, CALLOUT_MAX_WIDTH);
  const maxChars = Math.max(16, Math.floor((width - 18) / 4.8));
  const wrappedRowsByGroupKey: Record<string, string[][]> = {};

  let y = 0;
  const paddingTop = 10;
  const headerTitleY = paddingTop;
  y = headerTitleY + 9;
  const headerSubtitleY = y;
  y += 8;
  const groupsStartY = y + 3;
  y = groupsStartY;

  for (const group of groups) {
    y += 7.5; // group header
    const wrappedRows: string[][] = [];
    for (const entry of group.entries) {
      const line = `${entry.name} (${entry.technicalId}) - ${entry.lengthMm} mm`;
      const wrapped = wrapTextByApproxChars(line, maxChars);
      wrappedRows.push(wrapped);
      y += wrapped.length * 7;
    }
    if (group.entries.length === 0) {
      const wrapped = wrapTextByApproxChars("No connected cables", maxChars);
      wrappedRows.push(wrapped);
      y += wrapped.length * 7;
    }
    y += 3;
    wrappedRowsByGroupKey[group.key] = wrappedRows;
  }

  const height = Math.max(42, y + 6);
  return { width, headerTitleY, headerSubtitleY, groupsStartY, height, wrappedRowsByGroupKey };
}

function getCalloutFrameEdgePoint(
  nodePosition: NodePosition,
  calloutPosition: NodePosition,
  width: number,
  height: number,
  inverseScale: number
): NodePosition {
  const dx = calloutPosition.x - nodePosition.x;
  const dy = calloutPosition.y - nodePosition.y;
  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
    return calloutPosition;
  }

  const halfWidth = (width / 2) * inverseScale;
  const halfHeight = (height / 2) * inverseScale;
  const scaleX = Math.abs(dx) < 0.0001 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(dx);
  const scaleY = Math.abs(dy) < 0.0001 ? Number.POSITIVE_INFINITY : halfHeight / Math.abs(dy);
  const t = Math.min(scaleX, scaleY);

  return {
    x: calloutPosition.x - dx * t,
    y: calloutPosition.y - dy * t
  };
}

export function NetworkSummaryPanel({
  handleZoomAction,
  fitNetworkToContent,
  showNetworkInfoPanels,
  showSegmentLengths,
  showCableCallouts,
  labelStrokeMode,
  labelSizeMode,
  labelRotationDegrees,
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
  pngExportIncludeBackground,
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

  const connectorCalloutGroupsById = useMemo(() => {
    const map = new Map<ConnectorId, CalloutGroup[]>();
    for (const connector of connectorMap.values()) {
      const groups = Array.from({ length: Math.max(0, connector.cavityCount) }, (_, index) => ({
        key: `connector:${connector.id}:C${index + 1}`,
        label: `C${index + 1}`,
        entries: [] as CalloutEntry[]
      }));
      map.set(connector.id, groups);
    }

    for (const wire of wires) {
      const endpoints = [wire.endpointA, wire.endpointB];
      for (const endpoint of endpoints) {
        if (endpoint.kind !== "connectorCavity") {
          continue;
        }
        const groups = map.get(endpoint.connectorId);
        if (groups === undefined || endpoint.cavityIndex < 1) {
          continue;
        }
        const groupIndex = endpoint.cavityIndex - 1;
        if (groupIndex >= groups.length) {
          continue;
        }
        groups[groupIndex]?.entries.push({
          wireId: wire.id,
          name: wire.name,
          technicalId: wire.technicalId,
          lengthMm: wire.lengthMm
        });
      }
    }

    for (const groups of map.values()) {
      for (const group of groups) {
        group.entries.sort(
          (left, right) =>
            left.name.localeCompare(right.name) || left.technicalId.localeCompare(right.technicalId)
        );
      }
    }
    return map;
  }, [connectorMap, wires]);

  const spliceCalloutGroupsById = useMemo(() => {
    const map = new Map<SpliceId, CalloutGroup[]>();
    for (const splice of spliceMap.values()) {
      const groups = Array.from({ length: Math.max(0, splice.portCount) }, (_, index) => ({
        key: `splice:${splice.id}:P${index + 1}`,
        label: `P${index + 1}`,
        entries: [] as CalloutEntry[]
      }));
      map.set(splice.id, groups);
    }

    for (const wire of wires) {
      const endpoints = [wire.endpointA, wire.endpointB];
      for (const endpoint of endpoints) {
        if (endpoint.kind !== "splicePort") {
          continue;
        }
        const groups = map.get(endpoint.spliceId);
        if (groups === undefined || endpoint.portIndex < 1) {
          continue;
        }
        const groupIndex = endpoint.portIndex - 1;
        if (groupIndex >= groups.length) {
          continue;
        }
        groups[groupIndex]?.entries.push({
          wireId: wire.id,
          name: wire.name,
          technicalId: wire.technicalId,
          lengthMm: wire.lengthMm
        });
      }
    }

    for (const groups of map.values()) {
      for (const group of groups) {
        group.entries.sort(
          (left, right) =>
            left.name.localeCompare(right.name) || left.technicalId.localeCompare(right.technicalId)
        );
      }
    }
    return map;
  }, [spliceMap, wires]);

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

  const cableCalloutViewModels = useMemo(() => {
    if (!showCableCallouts) {
      return [] as CableCalloutViewModel[];
    }

    const models: CableCalloutViewModel[] = [];
    for (const node of nodes) {
      const nodePosition = networkNodePositions[node.id];
      if (nodePosition === undefined || (node.kind !== "connector" && node.kind !== "splice")) {
        continue;
      }

      if (node.kind === "connector") {
        const connector = connectorMap.get(node.connectorId);
        if (connector === undefined) {
          continue;
        }
        const key = `connector:${connector.id}` as const;
        const draftPosition = draftCalloutPositions[key];
        const persistedPosition = connector.cableCalloutPosition;
        const position = draftPosition ?? persistedPosition ?? getDefaultCalloutPosition(node.id, nodePosition);
        models.push({
          key,
          kind: "connector",
          entityId: connector.id,
          nodeId: node.id,
          nodePosition,
          position,
          title: connector.name,
          subtitle: connector.technicalId,
          groups: connectorCalloutGroupsById.get(connector.id) ?? [],
          isDeemphasized: isSubNetworkFilteringActive && !(nodeHasActiveSubNetworkConnection.get(node.id) ?? false),
          isSelected: selectedConnectorId === connector.id
        });
        continue;
      }

      const splice = spliceMap.get(node.spliceId);
      if (splice === undefined) {
        continue;
      }
      const key = `splice:${splice.id}` as const;
      const draftPosition = draftCalloutPositions[key];
      const persistedPosition = splice.cableCalloutPosition;
      const position = draftPosition ?? persistedPosition ?? getDefaultCalloutPosition(node.id, nodePosition);
      models.push({
        key,
        kind: "splice",
        entityId: splice.id,
        nodeId: node.id,
        nodePosition,
        position,
        title: splice.name,
        subtitle: splice.technicalId,
        groups: spliceCalloutGroupsById.get(splice.id) ?? [],
        isDeemphasized: isSubNetworkFilteringActive && !(nodeHasActiveSubNetworkConnection.get(node.id) ?? false),
        isSelected: selectedSpliceId === splice.id
      });
    }

    return models.sort((left, right) => left.title.localeCompare(right.title) || left.subtitle.localeCompare(right.subtitle));
  }, [
    showCableCallouts,
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
    selectedSpliceId
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

      setDraftCalloutPositions((current) => ({
        ...current,
        [draggingCallout.key]: coordinates
      }));
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

  const handleExportPlanAsPng = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const sourceSvg = networkSvgRef.current;
    if (sourceSvg === null) {
      return;
    }

    const viewBoxWidth = sourceSvg.viewBox.baseVal.width;
    const viewBoxHeight = sourceSvg.viewBox.baseVal.height;
    const fallbackRect = sourceSvg.getBoundingClientRect();
    const exportWidth = Math.max(1, Math.round(viewBoxWidth > 0 ? viewBoxWidth : fallbackRect.width));
    const exportHeight = Math.max(1, Math.round(viewBoxHeight > 0 ? viewBoxHeight : fallbackRect.height));

    const svgClone = sourceSvg.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgClone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    svgClone.setAttribute("width", String(exportWidth));
    svgClone.setAttribute("height", String(exportHeight));
    if (!svgClone.getAttribute("viewBox")) {
      svgClone.setAttribute("viewBox", `0 0 ${exportWidth} ${exportHeight}`);
    }
    copyComputedStylesToSvgClone(sourceSvg, svgClone);

    const serializedSvg = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      URL.revokeObjectURL(svgUrl);
      const exportScale = Math.max(1, Math.ceil(window.devicePixelRatio || 1));
      const canvas = document.createElement("canvas");
      canvas.width = exportWidth * exportScale;
      canvas.height = exportHeight * exportScale;

      const context = canvas.getContext("2d");
      if (context === null) {
        return;
      }

      context.setTransform(exportScale, 0, 0, exportScale, 0, 0);
      if (pngExportIncludeBackground) {
        const backgroundFill = resolveCanvasExportBackgroundFill(networkCanvasShellRef.current);
        if (backgroundFill !== null) {
          context.fillStyle = backgroundFill;
          context.fillRect(0, 0, exportWidth, exportHeight);
        }
      }
      context.drawImage(image, 0, 0, exportWidth, exportHeight);

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const downloadLink = document.createElement("a");
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.download = `network-plan-${timestamp}.png`;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    };
    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
    };
    image.src = svgUrl;
  }, [pngExportIncludeBackground]);

  function handleNetworkNodeKeyDown(event: ReactKeyboardEvent<SVGGElement>, nodeId: NodeId): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handleNetworkNodeActivate(nodeId);
  }

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
              <span className="network-summary-info-icon" aria-hidden="true" />
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
              onClick={handleExportPlanAsPng}
              disabled={nodes.length === 0}
            >
              <span className="network-summary-export-icon" aria-hidden="true" />
              Export PNG
            </button>
          </div>
        </header>
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
              className={`network-svg network-canvas--label-stroke-${labelStrokeMode} network-canvas--label-size-${labelSizeMode}`}
              role="img"
              aria-label="2D network diagram"
              viewBox={`0 0 ${networkViewWidth} ${networkViewHeight}`}
              onMouseDown={handleNetworkCanvasMouseDown}
              onClick={handleNetworkCanvasClick}
              onWheel={handleNetworkWheel}
              onMouseMove={handleCanvasMouseMoveWithCallouts}
              onMouseUp={stopNetworkInteractions}
              onMouseLeave={stopNetworkInteractions}
            >
              {showNetworkGrid ? (
                <g className="network-grid" transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}>
                  {gridXPositions.map((position) => {
                    return (
                      <line key={`grid-v-${position}`} x1={position} y1={visibleModelMinY} x2={position} y2={visibleModelMaxY} />
                    );
                  })}
                  {gridYPositions.map((position) => {
                    return (
                      <line key={`grid-h-${position}`} x1={visibleModelMinX} y1={position} x2={visibleModelMaxX} y2={position} />
                    );
                  })}
                </g>
              ) : null}
              <g transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}>
                {segments.map((segment) => {
                  const nodeAPosition = networkNodePositions[segment.nodeA];
                  const nodeBPosition = networkNodePositions[segment.nodeB];
                  if (nodeAPosition === undefined || nodeBPosition === undefined) {
                    return null;
                  }

                  const segmentSubNetworkTag = segmentSubNetworkTagById.get(segment.id) ?? "(default)";
                  const isSubNetworkDeemphasized =
                    isSubNetworkFilteringActive && !activeSubNetworkTagSet.has(segmentSubNetworkTag);
                  const isWireHighlighted = selectedWireRouteSegmentIds.has(segment.id);
                  const isSelectedSegment = selectedSegmentId === segment.id;
                  const segmentClassName = `network-segment${isWireHighlighted ? " is-wire-highlighted" : ""}${
                    isSelectedSegment ? " is-selected" : ""
                  }`;
                  const segmentGroupClassName = `network-entity-group${
                    isSubNetworkDeemphasized ? " is-deemphasized" : ""
                  }`;
                  const labelX = (nodeAPosition.x + nodeBPosition.x) / 2;
                  const labelY = (nodeAPosition.y + nodeBPosition.y) / 2;

                  return (
                    <g key={segment.id} className={segmentGroupClassName}>
                      <line
                        className={segmentClassName}
                        x1={nodeAPosition.x}
                        y1={nodeAPosition.y}
                        x2={nodeBPosition.x}
                        y2={nodeBPosition.y}
                      />
                      <line
                        className="network-segment-hitbox"
                        x1={nodeAPosition.x}
                        y1={nodeAPosition.y}
                        x2={nodeBPosition.x}
                        y2={nodeBPosition.y}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleNetworkSegmentClick(segment.id);
                        }}
                      />
                      <g
                        className="network-segment-label-anchor"
                        transform={`translate(${labelX} ${labelY}) scale(${inverseLabelScale})`}
                      >
                        <text
                          className="network-segment-label"
                          x={0}
                          y={-6}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={labelRotationDegrees === 0 ? undefined : `rotate(${labelRotationDegrees} 0 -6)`}
                        >
                          {segment.id}
                        </text>
                      </g>
                      {showSegmentLengths ? (
                        <g
                          className="network-segment-length-label-anchor"
                          transform={`translate(${labelX} ${labelY}) scale(${inverseLabelScale})`}
                        >
                          <text
                            className="network-segment-length-label"
                            x={0}
                            y={6}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={labelRotationDegrees === 0 ? undefined : `rotate(${labelRotationDegrees} 0 6)`}
                          >
                            {segment.lengthMm} mm
                          </text>
                        </g>
                      ) : null}
                    </g>
                  );
                })}

                {nodes.map((node) => {
                  const position = networkNodePositions[node.id];
                  if (position === undefined) {
                    return null;
                  }

                  const isSubNetworkDeemphasized =
                    isSubNetworkFilteringActive && !(nodeHasActiveSubNetworkConnection.get(node.id) ?? false);
                  const nodeKindClass =
                    node.kind === "connector" ? "connector" : node.kind === "splice" ? "splice" : "intermediate";
                  const isSelectedNode =
                    selectedNodeId === node.id ||
                    (node.kind === "connector" && selectedConnectorId === node.connectorId) ||
                    (node.kind === "splice" && selectedSpliceId === node.spliceId);
                  const nodeClassName = `network-node ${nodeKindClass}${isSelectedNode ? " is-selected" : ""}${
                    isSubNetworkDeemphasized ? " is-deemphasized" : ""
                  }`;
                  const nodeLabel =
                    node.kind === "intermediate"
                      ? node.id
                      : node.kind === "connector"
                        ? (connectorMap.get(node.connectorId)?.technicalId ?? node.connectorId)
                        : (spliceMap.get(node.spliceId)?.technicalId ?? node.spliceId);

                  const connectorWidth = 46;
                  const connectorHeight = 30;
                  const spliceDiamondSize = 30;

                  return (
                    <g
                      key={node.id}
                      className={nodeClassName}
                      role="button"
                      tabIndex={0}
                      focusable="true"
                      aria-label={`Select ${describeNode(node)}`}
                      onMouseDown={(event) => handleNetworkNodeMouseDown(event, node.id)}
                      onKeyDown={(event) => handleNetworkNodeKeyDown(event, node.id)}
                      onClick={(event) => {
                        // Selection/editing is handled on mouse-down to support immediate drag interactions.
                        // Keep click from bubbling to future parent click handlers.
                        event.stopPropagation();
                      }}
                    >
                      <title>{describeNode(node)}</title>
                      {node.kind === "connector" ? (
                        <rect
                          className="network-node-shape"
                          x={position.x - connectorWidth / 2}
                          y={position.y - connectorHeight / 2}
                          width={connectorWidth}
                          height={connectorHeight}
                          rx={7}
                          ry={7}
                        />
                      ) : node.kind === "splice" ? (
                        <rect
                          className="network-node-shape"
                          x={position.x - spliceDiamondSize / 2}
                          y={position.y - spliceDiamondSize / 2}
                          width={spliceDiamondSize}
                          height={spliceDiamondSize}
                          rx={5}
                          ry={5}
                          transform={`rotate(45 ${position.x} ${position.y})`}
                        />
                      ) : (
                        <circle className="network-node-shape" cx={position.x} cy={position.y} r={17} />
                      )}
                      <g
                        className="network-node-label-anchor"
                        transform={`translate(${position.x} ${position.y}) scale(${inverseLabelScale})`}
                      >
                        <text
                          className="network-node-label"
                          x={0}
                          y={4}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={labelRotationDegrees === 0 ? undefined : `rotate(${labelRotationDegrees} 0 4)`}
                        >
                          {nodeLabel}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {orderedCableCallouts.map((callout) => {
                  const layout = buildCalloutLayoutMetrics(callout.groups);
                  const lineEnd = getCalloutFrameEdgePoint(
                    callout.nodePosition,
                    callout.position,
                    layout.width,
                    layout.height,
                    inverseLabelScale
                  );
                  const calloutClassName = `network-callout-group${callout.isDeemphasized ? " is-deemphasized" : ""}${
                    callout.isSelected ? " is-selected" : ""
                  }${hoveredCalloutKey === callout.key ? " is-hovered" : ""}${
                    draggingCallout?.key === callout.key ? " is-dragging" : ""
                  }`;
                  let contentCursorY = layout.groupsStartY;

                  return (
                    <g
                      key={callout.key}
                      className={calloutClassName}
                      onMouseEnter={() => setHoveredCalloutKey(callout.key)}
                      onMouseLeave={() => {
                        setHoveredCalloutKey((current) => (current === callout.key ? null : current));
                      }}
                    >
                      <line
                        className="network-callout-leader-line"
                        x1={callout.nodePosition.x}
                        y1={callout.nodePosition.y}
                        x2={lineEnd.x}
                        y2={lineEnd.y}
                      />
                      <g
                        className="network-callout-anchor"
                        transform={`translate(${callout.position.x} ${callout.position.y}) scale(${inverseLabelScale})`}
                        role="button"
                        tabIndex={0}
                        focusable="true"
                        aria-label={`Select ${callout.kind} ${callout.subtitle}`}
                        onMouseDown={(event) => handleCalloutMouseDown(event, callout)}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") {
                            return;
                          }
                          event.preventDefault();
                          event.stopPropagation();
                          if (callout.kind === "connector") {
                            onSelectConnectorFromCallout(callout.entityId as ConnectorId);
                          } else {
                            onSelectSpliceFromCallout(callout.entityId as SpliceId);
                          }
                        }}
                      >
                        <rect
                          className="network-callout-frame"
                          x={-layout.width / 2}
                          y={-layout.height / 2}
                          width={layout.width}
                          height={layout.height}
                        />
                        <text className="network-callout-title" x={0} y={-layout.height / 2 + layout.headerTitleY} textAnchor="middle">
                          {callout.title}
                        </text>
                        <text
                          className="network-callout-subtitle"
                          x={0}
                          y={-layout.height / 2 + layout.headerSubtitleY}
                          textAnchor="middle"
                        >
                          {callout.subtitle}
                        </text>
                        {callout.groups.map((group) => {
                          const groupHeaderY = -layout.height / 2 + contentCursorY;
                          const wrappedRows =
                            layout.wrappedRowsByGroupKey[group.key] ?? [[group.entries.length === 0 ? "No connected cables" : ""]];
                          contentCursorY += 7.5;
                          const renderedRows = wrappedRows.map((wrappedRowLines, rowIndex) => {
                            const rowY = -layout.height / 2 + contentCursorY;
                            const row = (
                              <text
                                key={`${group.key}-row-${group.entries[rowIndex]?.wireId ?? `empty-${rowIndex}`}`}
                                className="network-callout-row-text"
                                x={-layout.width / 2 + 8}
                                y={rowY}
                                textAnchor="start"
                              >
                                {wrappedRowLines.map((line, lineIndex) => (
                                  <tspan key={`${group.key}-row-${rowIndex}-line-${lineIndex}`} x={-layout.width / 2 + 8} dy={lineIndex === 0 ? 0 : 7}>
                                    {line}
                                  </tspan>
                                ))}
                              </text>
                            );
                            contentCursorY += wrappedRowLines.length * 7;
                            return row;
                          });
                          contentCursorY += 3;
                          return (
                            <g key={group.key} className="network-callout-group-content">
                              <text className="network-callout-group-label" x={-layout.width / 2 + 8} y={groupHeaderY} textAnchor="start">
                                {group.label}
                              </text>
                              {renderedRows}
                            </g>
                          );
                        })}
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        )}
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
      <section className="panel network-summary-quick-entity-nav-panel" aria-label="Quick entity navigation">
        <div className="network-summary-quick-entity-nav" role="group" aria-label="Quick entity navigation strip">
          {QUICK_ENTITY_NAV_ITEMS[quickEntityNavigationMode].map((item) => (
            <button
              key={item.subScreen}
              type="button"
              className={activeSubScreen === item.subScreen ? "filter-chip is-active" : "filter-chip"}
              onClick={() => onQuickEntityNavigation(item.subScreen)}
              aria-pressed={activeSubScreen === item.subScreen}
            >
              <span
                className={`action-button-icon network-summary-quick-entity-nav-icon ${SUB_SCREEN_ICON_CLASS_BY_ID[item.subScreen]}`}
                aria-hidden="true"
              />
              <span className="network-summary-quick-entity-nav-label">{item.label}</span>
              <span className="filter-chip-count">{entityCountBySubScreen[item.subScreen]}</span>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}
