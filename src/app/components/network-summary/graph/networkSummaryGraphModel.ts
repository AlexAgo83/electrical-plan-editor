import type {
  Connector,
  ConnectorId,
  CatalogItem,
  ConnectorLayout,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  WireId
} from "../../../../core/entities";
import { resolveSplicePlacementFromEntities } from "../../../../core/splicePlacement";
import { resolveEditedConnectorLayout } from "../../../../core/connectorLayout";
import type { NodePosition } from "../../../types/app-controller";
import type { ConnectorDrawingDisplayMode } from "../../../types/app-controller";
import type { CalloutGroup } from "../callouts/calloutLayout";
import {
  getConnectorCavityWireIdByIndex,
  getConsistentConnectorLayoutDrawingSize,
  getHighlightedConnectorCavityIndexes
} from "../callouts/NetworkSummaryCalloutsLayer";
import { normalizeReadableSegmentLabelAngle } from "../callouts/calloutLayout";
import { resolveBackshellHelperNodeReference } from "../../../lib/backshellHelperNodeReference";

export interface RenderedSegmentModel {
  segment: Segment;
  nodeAPosition: NodePosition;
  nodeBPosition: NodePosition;
  segmentClassName: string;
  segmentGroupClassName: string;
  labelX: number;
  labelY: number;
  segmentLabelRotationDegrees: number;
  segmentIdLabelX: number;
  segmentIdLabelY: number;
  segmentLengthLabelX: number;
  segmentLengthLabelY: number;
  segmentCallout: {
    key: string;
    segmentId: SegmentId;
    anchorX: number;
    anchorY: number;
    targetX: number;
    targetY: number;
    width: number;
    height: number;
    routeLabel: string;
    headers: [string, string, string, string, string];
    values: [string, string, string, string, string];
  } | null;
  mountingLabels: Array<{
    key: string;
    x: number;
    y: number;
    text: string;
  }>;
}

export interface RenderedNodeModel {
  node: NetworkNode;
  position: NodePosition;
  nodeClassName: string;
  nodeLabel: string;
  connectorLayout?: ConnectorLayout;
  highlightedConnectorCavityIndexes: ReadonlySet<number>;
  connectorCavityWireIdByIndex: ReadonlyMap<number, WireId>;
  labelOffsetY: number;
  isSubNetworkDeemphasized: boolean;
}

export interface RenderedFloatingSpliceModel {
  splice: Splice;
  position: NodePosition;
  anchorPosition: NodePosition;
  nodeClassName: string;
  nodeLabel: string;
  hostNodeId: NodeId;
  isSubNetworkDeemphasized: boolean;
}

interface BuildRenderedSegmentsParams {
  segments: Segment[];
  nodes: NetworkNode[];
  networkNodePositions: Record<NodeId, NodePosition>;
  segmentSubNetworkTagById: ReadonlyMap<SegmentId, string>;
  isSubNetworkFilteringActive: boolean;
  activeSubNetworkTagSet: ReadonlySet<string>;
  selectedWireRouteSegmentIds: ReadonlySet<SegmentId>;
  selectedSegmentId: SegmentId | null;
  selectedBatchSegmentIds?: ReadonlySet<SegmentId>;
  connectorMap: ReadonlyMap<ConnectorId, Connector>;
  catalogItems: CatalogItem[];
  connectorDrawingDisplayMode: ConnectorDrawingDisplayMode;
  normalizedNodeShapeScale: number;
  connectorDrawingScale: number;
  useConsistentConnectorLayoutScale: boolean;
  zoomInvariantNodeShapes: boolean;
  inverseLabelScale: number;
  autoSegmentLabelRotation: boolean;
  labelRotationDegrees: number;
  showSegmentNames: boolean;
  showSegmentLengths: boolean;
  draftSegmentCalloutPositions?: Record<SegmentId, NodePosition>;
  spliceMap?: ReadonlyMap<SpliceId, Splice>;
}

interface SegmentRenderGeometry {
  labelAnchor: NodePosition;
  normalX: number;
  normalY: number;
}

interface SegmentNodeVisualBounds {
  halfWidth: number;
  halfHeight: number;
  kind: "rect" | "diamond" | "circle";
}

const CONNECTOR_NODE_WIDTH = 46;
const CONNECTOR_NODE_HEIGHT = 30;
const SPLICE_DIAMOND_SIZE = 30;
const INTERMEDIATE_NODE_RADIUS = 17;
const SEGMENT_SHEATH_CALLOUT_HEADERS = ["Layer", "Insulation", "Line Style", "Int Part", "Quantity"] as const;
const SEGMENT_SHEATH_CALLOUT_WIDTH = 192;
const SEGMENT_SHEATH_CALLOUT_HEIGHT = 28;
const SEGMENT_SHEATH_CALLOUT_OFFSET = 26;

function getSegmentLabelAnchor(
  nodeAPosition: NodePosition,
  nodeBPosition: NodePosition,
  nodeABounds: SegmentNodeVisualBounds | undefined,
  nodeBBounds: SegmentNodeVisualBounds | undefined
): NodePosition {
  const midpoint = {
    x: (nodeAPosition.x + nodeBPosition.x) / 2,
    y: (nodeAPosition.y + nodeBPosition.y) / 2
  };
  if (nodeABounds === undefined && nodeBBounds === undefined) {
    return midpoint;
  }

  const vectorX = nodeBPosition.x - nodeAPosition.x;
  const vectorY = nodeBPosition.y - nodeAPosition.y;
  const distance = Math.hypot(vectorX, vectorY);
  if (distance <= 0) {
    return midpoint;
  }

  const directionX = vectorX / distance;
  const directionY = vectorY / distance;
  const startInset = getNodeSegmentInset(nodeABounds, directionX, directionY);
  const endInset = getNodeSegmentInset(nodeBBounds, directionX, directionY);
  const visibleDistance = distance - startInset - endInset;

  if (visibleDistance <= 0) {
    return midpoint;
  }

  return {
    x: (nodeAPosition.x + directionX * startInset + nodeBPosition.x - directionX * endInset) / 2,
    y: (nodeAPosition.y + directionY * startInset + nodeBPosition.y - directionY * endInset) / 2
  };
}

function getNodeSegmentInset(
  bounds: SegmentNodeVisualBounds | undefined,
  directionX: number,
  directionY: number
): number {
  if (bounds === undefined) {
    return 0;
  }

  if (bounds.kind === "circle") {
    return bounds.halfWidth;
  }

  if (bounds.kind === "diamond") {
    const denominator = Math.abs(directionX) + Math.abs(directionY);
    return denominator <= 0 ? 0 : bounds.halfWidth / denominator;
  }

  const horizontalInset = Math.abs(directionX) <= 0 ? Number.POSITIVE_INFINITY : bounds.halfWidth / Math.abs(directionX);
  const verticalInset = Math.abs(directionY) <= 0 ? Number.POSITIVE_INFINITY : bounds.halfHeight / Math.abs(directionY);
  return Math.min(horizontalInset, verticalInset);
}

function getSegmentNodeVisualBounds(
  node: NetworkNode | undefined,
  connectorMap: ReadonlyMap<ConnectorId, Connector>,
  catalogItemById: ReadonlyMap<CatalogItem["id"], CatalogItem>,
  connectorDrawingDisplayMode: ConnectorDrawingDisplayMode,
  nodeShapeScale: number,
  connectorDrawingScale: number,
  useConsistentConnectorLayoutScale: boolean
): SegmentNodeVisualBounds | undefined {
  if (node === undefined) {
    return undefined;
  }

  if (node.kind === "intermediate" || node.kind === "connectorBackshellHelper") {
    return {
      halfWidth: INTERMEDIATE_NODE_RADIUS * nodeShapeScale,
      halfHeight: INTERMEDIATE_NODE_RADIUS * nodeShapeScale,
      kind: "circle"
    };
  }

  if (node.kind === "splice") {
    return {
      halfWidth: (SPLICE_DIAMOND_SIZE * nodeShapeScale) / Math.SQRT2,
      halfHeight: (SPLICE_DIAMOND_SIZE * nodeShapeScale) / Math.SQRT2,
      kind: "diamond"
    };
  }

  const connector = connectorMap.get(node.connectorId);
  const connectorLayout =
    connectorDrawingDisplayMode === "nodes" && connector !== undefined
      ? resolveEditedConnectorLayout(
          connector.catalogItemId === undefined ? undefined : catalogItemById.get(connector.catalogItemId)?.connectorLayout,
          connector.cavityCount
        )
      : undefined;
  if (connectorLayout !== undefined && useConsistentConnectorLayoutScale) {
    const size = getConsistentConnectorLayoutDrawingSize(
      connectorLayout,
      CONNECTOR_NODE_WIDTH * nodeShapeScale * connectorDrawingScale,
      CONNECTOR_NODE_HEIGHT * nodeShapeScale * connectorDrawingScale
    );
    return {
      halfWidth: size.width / 2,
      halfHeight: size.height / 2,
      kind: "rect"
    };
  }

  const layoutScale = connectorLayout === undefined ? 1 : connectorDrawingScale;

  return {
    halfWidth: (CONNECTOR_NODE_WIDTH * nodeShapeScale * layoutScale) / 2,
    halfHeight: (CONNECTOR_NODE_HEIGHT * nodeShapeScale * layoutScale) / 2,
    kind: "rect"
  };
}

function resolveSegmentEndpointDisplayLabel(
  node: NetworkNode | undefined,
  connectorMap: ReadonlyMap<ConnectorId, Connector>,
  spliceMap: ReadonlyMap<SpliceId, Splice>
): string | null {
  if (node === undefined) {
    return null;
  }
  if (node.kind === "intermediate") {
    return node.id;
  }
  if (node.kind === "connector" || node.kind === "connectorBackshellHelper") {
    return connectorMap.get(node.connectorId)?.technicalId ?? node.connectorId;
  }
  return spliceMap.get(node.spliceId)?.technicalId ?? node.spliceId;
}

function hasSegmentSheathCallout(segment: Segment): boolean {
  return (
    segment.sheathType !== undefined ||
    segment.insulation !== undefined ||
    segment.lineStyle !== undefined ||
    segment.internalPartReference !== undefined
  );
}

function buildSegmentSheathSignature(segment: Segment): string {
  return JSON.stringify([
    segment.sheathType ?? "",
    segment.insulation ?? "",
    segment.lineStyle ?? "",
    segment.internalPartReference ?? ""
  ]);
}

function getDisplayValue(value: string | undefined): string {
  return value === undefined || value.length === 0 ? "-" : value;
}

function resolveCalloutBoundaryNodeIds(
  componentSegments: Segment[],
  mergeableSpliceNodeIds: ReadonlySet<NodeId>
): [NodeId, NodeId] | null {
  const boundaryNodeIds = componentSegments.flatMap((segment) =>
    [segment.nodeA, segment.nodeB].filter((nodeId) => !mergeableSpliceNodeIds.has(nodeId))
  );
  const uniqueBoundaryNodeIds = Array.from(new Set(boundaryNodeIds));
  if (uniqueBoundaryNodeIds.length < 2) {
    return null;
  }
  return [uniqueBoundaryNodeIds[0]!, uniqueBoundaryNodeIds[uniqueBoundaryNodeIds.length - 1]!];
}

function resolveSegmentCalloutTarget(
  componentSegments: Segment[],
  networkNodePositions: Record<NodeId, NodePosition>,
  anchorPosition: NodePosition
): NodePosition | null {
  let closestSegmentMidpoint: { point: NodePosition; distanceSquared: number } | null = null;

  for (const componentSegment of componentSegments) {
    const start = networkNodePositions[componentSegment.nodeA];
    const end = networkNodePositions[componentSegment.nodeB];
    if (start === undefined || end === undefined) {
      continue;
    }

    const midpoint = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2
    };
    const deltaX = anchorPosition.x - midpoint.x;
    const deltaY = anchorPosition.y - midpoint.y;
    const distanceSquared = deltaX * deltaX + deltaY * deltaY;
    if (closestSegmentMidpoint === null || distanceSquared < closestSegmentMidpoint.distanceSquared) {
      closestSegmentMidpoint = {
        point: midpoint,
        distanceSquared
      };
    }
  }

  return closestSegmentMidpoint?.point ?? null;
}

export function buildRenderedSegments({
  segments,
  nodes,
  networkNodePositions,
  segmentSubNetworkTagById,
  isSubNetworkFilteringActive,
  activeSubNetworkTagSet,
  selectedWireRouteSegmentIds,
  selectedSegmentId,
  selectedBatchSegmentIds = new Set<SegmentId>(),
  connectorMap,
  catalogItems,
  connectorDrawingDisplayMode,
  normalizedNodeShapeScale,
  connectorDrawingScale,
  useConsistentConnectorLayoutScale,
  zoomInvariantNodeShapes,
  inverseLabelScale,
  autoSegmentLabelRotation,
  labelRotationDegrees,
  showSegmentNames,
  showSegmentLengths,
  draftSegmentCalloutPositions = {},
  spliceMap = new Map<SpliceId, Splice>()
}: BuildRenderedSegmentsParams): RenderedSegmentModel[] {
  const result: RenderedSegmentModel[] = [];
  const nodeById = new Map(nodes.map((node) => [node.id, node] as const));
  const segmentById = new Map(segments.map((segment) => [segment.id, segment] as const));
  const catalogItemById = new Map(catalogItems.map((item) => [item.id, item] as const));
  const nodeShapeScale = normalizedNodeShapeScale * (zoomInvariantNodeShapes ? inverseLabelScale : 1);
  const segmentGeometryById = new Map<SegmentId, SegmentRenderGeometry>();
  const segmentCalloutById = new Map<SegmentId, RenderedSegmentModel["segmentCallout"]>();

  for (const segment of segments) {
    const nodeAPosition = networkNodePositions[segment.nodeA];
    const nodeBPosition = networkNodePositions[segment.nodeB];
    if (nodeAPosition === undefined || nodeBPosition === undefined) {
      continue;
    }
    const labelAnchor = getSegmentLabelAnchor(
      nodeAPosition,
      nodeBPosition,
      getSegmentNodeVisualBounds(
        nodeById.get(segment.nodeA),
        connectorMap,
        catalogItemById,
        connectorDrawingDisplayMode,
        nodeShapeScale,
        connectorDrawingScale,
        useConsistentConnectorLayoutScale
      ),
      getSegmentNodeVisualBounds(
        nodeById.get(segment.nodeB),
        connectorMap,
        catalogItemById,
        connectorDrawingDisplayMode,
        nodeShapeScale,
        connectorDrawingScale,
        useConsistentConnectorLayoutScale
      )
    );
    const segmentVectorX = nodeBPosition.x - nodeAPosition.x;
    const segmentVectorY = nodeBPosition.y - nodeAPosition.y;
    const segmentAngleDegrees = normalizeReadableSegmentLabelAngle(
      (Math.atan2(segmentVectorY, segmentVectorX) * 180) / Math.PI
    );
    const segmentLabelRotationDegrees = autoSegmentLabelRotation ? segmentAngleDegrees : labelRotationDegrees;
    const segmentLabelRotationRadians = (segmentLabelRotationDegrees * Math.PI) / 180;
    segmentGeometryById.set(segment.id, {
      labelAnchor,
      normalX: -Math.sin(segmentLabelRotationRadians),
      normalY: Math.cos(segmentLabelRotationRadians)
    });
  }

  const mergeableNeighborSegmentIdsBySpliceNodeId = new Map<NodeId, Set<SegmentId>>();
  const eligibleSegmentsBySignature = new Map<string, Segment[]>();
  for (const segment of segments) {
    if (!hasSegmentSheathCallout(segment)) {
      continue;
    }
    const signature = buildSegmentSheathSignature(segment);
    const matchingSegments = eligibleSegmentsBySignature.get(signature) ?? [];
    matchingSegments.push(segment);
    eligibleSegmentsBySignature.set(signature, matchingSegments);
  }
  for (const matchingSegments of eligibleSegmentsBySignature.values()) {
    for (const segment of matchingSegments) {
      for (const nodeId of [segment.nodeA, segment.nodeB]) {
        const node = nodeById.get(nodeId);
        if (node?.kind !== "splice") {
          continue;
        }
        const neighboringSegments = matchingSegments.filter(
          (candidate) => candidate.id !== segment.id && (candidate.nodeA === nodeId || candidate.nodeB === nodeId)
        );
        if (neighboringSegments.length !== 1) {
          continue;
        }
        const segmentIds = mergeableNeighborSegmentIdsBySpliceNodeId.get(nodeId) ?? new Set<SegmentId>();
        segmentIds.add(segment.id);
        segmentIds.add(neighboringSegments[0]!.id);
        mergeableNeighborSegmentIdsBySpliceNodeId.set(nodeId, segmentIds);
      }
    }
  }

  const componentSegmentIdsById = new Map<SegmentId, Set<SegmentId>>();
  for (const matchingSegments of eligibleSegmentsBySignature.values()) {
    const adjacency = new Map<SegmentId, Set<SegmentId>>();
    for (const segment of matchingSegments) {
      adjacency.set(segment.id, new Set<SegmentId>());
    }
    for (const [spliceNodeId, connectedSegmentIds] of mergeableNeighborSegmentIdsBySpliceNodeId) {
      const connectedIds = [...connectedSegmentIds].filter((segmentId) => adjacency.has(segmentId));
      if (connectedIds.length !== 2) {
        continue;
      }
      adjacency.get(connectedIds[0]!)?.add(connectedIds[1]!);
      adjacency.get(connectedIds[1]!)?.add(connectedIds[0]!);
      mergeableNeighborSegmentIdsBySpliceNodeId.set(spliceNodeId, new Set(connectedIds));
    }
    for (const segment of matchingSegments) {
      if (componentSegmentIdsById.has(segment.id)) {
        continue;
      }
      const queue = [segment.id];
      const componentIds = new Set<SegmentId>();
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (componentIds.has(currentId)) {
          continue;
        }
        componentIds.add(currentId);
        for (const neighborId of adjacency.get(currentId) ?? []) {
          if (!componentIds.has(neighborId)) {
            queue.push(neighborId);
          }
        }
      }
      for (const componentSegmentId of componentIds) {
        componentSegmentIdsById.set(componentSegmentId, componentIds);
      }
    }
  }

  const processedComponentAnchorIds = new Set<SegmentId>();
  for (const segment of segments) {
    if (!hasSegmentSheathCallout(segment)) {
      continue;
    }
    const componentIds = componentSegmentIdsById.get(segment.id) ?? new Set<SegmentId>([segment.id]);
    const orderedComponentIds = [...componentIds].sort((left, right) => left.localeCompare(right));
    const anchorSegmentId = orderedComponentIds[0]!;
    if (processedComponentAnchorIds.has(anchorSegmentId)) {
      continue;
    }
    processedComponentAnchorIds.add(anchorSegmentId);
    const componentSegments = orderedComponentIds.flatMap((segmentId) => {
      const candidate = segmentById.get(segmentId);
      return candidate === undefined ? [] : [candidate];
    });
    if (componentSegments.length === 0) {
      continue;
    }
    const mergeableSpliceNodeIds = new Set<NodeId>();
    for (const [spliceNodeId, connectedSegmentIds] of mergeableNeighborSegmentIdsBySpliceNodeId) {
      if (connectedSegmentIds.size !== 2) {
        continue;
      }
      if ([...connectedSegmentIds].every((segmentId) => componentIds.has(segmentId))) {
        mergeableSpliceNodeIds.add(spliceNodeId);
      }
    }
    const boundaryNodeIds = resolveCalloutBoundaryNodeIds(componentSegments, mergeableSpliceNodeIds);
    if (boundaryNodeIds === null) {
      continue;
    }
    const [boundaryNodeAId, boundaryNodeBId] = boundaryNodeIds;
    const boundaryLabelA = resolveSegmentEndpointDisplayLabel(nodeById.get(boundaryNodeAId), connectorMap, spliceMap) ?? anchorSegmentId;
    const boundaryLabelB = resolveSegmentEndpointDisplayLabel(nodeById.get(boundaryNodeBId), connectorMap, spliceMap) ?? anchorSegmentId;
    const componentGeometry = componentSegments.flatMap((componentSegment) => {
      const geometry = segmentGeometryById.get(componentSegment.id);
      return geometry === undefined ? [] : [geometry];
    });
    if (componentGeometry.length === 0) {
      continue;
    }
    const centroid = componentGeometry.reduce(
      (accumulator, geometry) => ({
        x: accumulator.x + geometry.labelAnchor.x,
        y: accumulator.y + geometry.labelAnchor.y
      }),
      { x: 0, y: 0 }
    );
    const representativeGeometry = segmentGeometryById.get(anchorSegmentId) ?? componentGeometry[0]!;
    const targetX = centroid.x / componentGeometry.length;
    const targetY = centroid.y / componentGeometry.length;
    const defaultPosition = {
      x: targetX + representativeGeometry.normalX * SEGMENT_SHEATH_CALLOUT_OFFSET,
      y: targetY + representativeGeometry.normalY * SEGMENT_SHEATH_CALLOUT_OFFSET
    };
    const persistedPosition = segmentById.get(anchorSegmentId)?.sheathCalloutPosition;
    const draftPosition = draftSegmentCalloutPositions[anchorSegmentId];
    const position = draftPosition ?? persistedPosition ?? defaultPosition;
    const calloutTarget = resolveSegmentCalloutTarget(componentSegments, networkNodePositions, position) ?? {
      x: targetX,
      y: targetY
    };
    segmentCalloutById.set(anchorSegmentId, {
      key: `segment-sheath:${anchorSegmentId}`,
      segmentId: anchorSegmentId,
      anchorX: position.x,
      anchorY: position.y,
      targetX: calloutTarget.x,
      targetY: calloutTarget.y,
      width: SEGMENT_SHEATH_CALLOUT_WIDTH,
      height: SEGMENT_SHEATH_CALLOUT_HEIGHT,
      routeLabel: `Route: ${boundaryLabelA} to ${boundaryLabelB}`,
      headers: [...SEGMENT_SHEATH_CALLOUT_HEADERS],
      values: [
        getDisplayValue(segment.sheathType),
        getDisplayValue(segment.insulation),
        getDisplayValue(segment.lineStyle),
        getDisplayValue(segment.internalPartReference),
        `${componentSegments.reduce((total, current) => total + current.lengthMm, 0)} mm`
      ]
    });
    for (const componentSegment of componentSegments) {
      if (componentSegment.id !== anchorSegmentId) {
        segmentCalloutById.set(componentSegment.id, null);
      }
    }
  }

  for (const segment of segments) {
    const nodeAPosition = networkNodePositions[segment.nodeA];
    const nodeBPosition = networkNodePositions[segment.nodeB];
    if (nodeAPosition === undefined || nodeBPosition === undefined) {
      continue;
    }

    const segmentSubNetworkTag = segmentSubNetworkTagById.get(segment.id) ?? "(default)";
    const isSubNetworkDeemphasized = isSubNetworkFilteringActive && !activeSubNetworkTagSet.has(segmentSubNetworkTag);
    const isWireHighlighted = selectedWireRouteSegmentIds.has(segment.id);
    const isSelectedSegment = selectedSegmentId === segment.id || selectedBatchSegmentIds.has(segment.id);
    const segmentClassName = `network-segment${isWireHighlighted ? " is-wire-highlighted" : ""}${
      isSelectedSegment ? " is-selected" : ""
    }`;
    const segmentGroupClassName = `network-entity-group${isSubNetworkDeemphasized ? " is-deemphasized" : ""}`;
    const geometry = segmentGeometryById.get(segment.id);
    if (geometry === undefined) {
      continue;
    }
    const labelAnchor = geometry.labelAnchor;
    const segmentVectorX = nodeBPosition.x - nodeAPosition.x;
    const segmentVectorY = nodeBPosition.y - nodeAPosition.y;
    const segmentAngleDegrees = normalizeReadableSegmentLabelAngle(
      (Math.atan2(segmentVectorY, segmentVectorX) * 180) / Math.PI
    );
    const segmentLabelRotationDegrees = autoSegmentLabelRotation ? segmentAngleDegrees : labelRotationDegrees;
    const segmentLabelRotationRadians = (segmentLabelRotationDegrees * Math.PI) / 180;
    const hasSegmentLabel = showSegmentLengths || showSegmentNames;
    const isNearHorizontalSegment = Math.abs(segmentAngleDegrees) <= 15;
    const segmentLabelOffsetDistance = hasSegmentLabel
      ? (showSegmentLengths && showSegmentNames ? 6 : 4) + (isNearHorizontalSegment ? 4 : 0)
      : 0;

    // Keep ID/length split along the label-normal axis, including when labels are auto-rotated.
    const segmentLengthLabelOffsetX = -Math.sin(segmentLabelRotationRadians) * segmentLabelOffsetDistance;
    const segmentLengthLabelOffsetY = Math.cos(segmentLabelRotationRadians) * segmentLabelOffsetDistance;
    const segmentCallout = segmentCalloutById.get(segment.id) ?? null;
    const segmentVectorLength = Math.hypot(segmentVectorX, segmentVectorY);
    const mountingLabels = (segment.mountingLabels ?? []).map((label) => {
      const ratio = Math.min(1, Math.max(0, label.positionRatio));
      const baseX = nodeAPosition.x + segmentVectorX * ratio;
      const baseY = nodeAPosition.y + segmentVectorY * ratio;
      const offsetNormalX = segmentVectorLength <= 0 ? 0 : (-segmentVectorY / segmentVectorLength) * label.offsetY;
      const offsetNormalY = segmentVectorLength <= 0 ? 0 : (segmentVectorX / segmentVectorLength) * label.offsetY;
      return {
        key: `${segment.id}:${label.id}`,
        x: baseX + label.offsetX + offsetNormalX,
        y: baseY + offsetNormalY,
        text: label.text
      };
    });

    result.push({
      segment,
      nodeAPosition,
      nodeBPosition,
      segmentClassName,
      segmentGroupClassName,
      labelX: labelAnchor.x,
      labelY: labelAnchor.y,
      segmentLabelRotationDegrees,
      segmentIdLabelX: -segmentLengthLabelOffsetX,
      segmentIdLabelY: -segmentLengthLabelOffsetY,
      segmentLengthLabelX: segmentLengthLabelOffsetX,
      segmentLengthLabelY: segmentLengthLabelOffsetY,
      segmentCallout,
      mountingLabels
    });
  }

  return result;
}

interface BuildRenderedNodesParams {
  nodes: NetworkNode[];
  networkNodePositions: Record<NodeId, NodePosition>;
  isSubNetworkFilteringActive: boolean;
  nodeHasActiveSubNetworkConnection: ReadonlyMap<NodeId, boolean>;
  selectedCanvasNodeIds: ReadonlySet<NodeId>;
  selectedNodeId: NodeId | null;
  selectedConnectorId: ConnectorId | null;
  selectedSpliceId: SpliceId | null;
  connectorMap: ReadonlyMap<ConnectorId, Connector>;
  catalogItems: CatalogItem[];
  connectorDrawingDisplayMode: ConnectorDrawingDisplayMode;
  connectorCalloutGroupsById: ReadonlyMap<ConnectorId, CalloutGroup[]>;
  selectedWireId: WireId | null;
  spliceMap: ReadonlyMap<SpliceId, Splice>;
}

interface BuildRenderedFloatingSplicesParams {
  splices: Splice[];
  nodes: NetworkNode[];
  segments: Segment[];
  networkNodePositions: Record<NodeId, NodePosition>;
  segmentSubNetworkTagById: ReadonlyMap<SegmentId, string>;
  isSubNetworkFilteringActive: boolean;
  activeSubNetworkTagSet: ReadonlySet<string>;
  selectedSpliceId: SpliceId | null;
}

const FLOATING_SPLICE_RENDER_CLEARANCE = 24;
const FLOATING_SPLICE_RENDER_STEP = 18;

function normalizeVector(x: number, y: number): NodePosition {
  const length = Math.hypot(x, y);
  if (length <= 0.0001) {
    return { x: 0, y: -1 };
  }
  return { x: x / length, y: y / length };
}

function buildFanSteps(count: number): number[] {
  if (count <= 1) {
    return [0];
  }
  const steps: number[] = [];
  if (count % 2 === 1) {
    const radius = (count - 1) / 2;
    for (let index = -radius; index <= radius; index += 1) {
      steps.push(index);
    }
    return steps;
  }

  const radius = count / 2;
  for (let index = -radius; index <= radius; index += 1) {
    if (index === 0) {
      continue;
    }
    steps.push(index);
  }
  return steps;
}

function isTooClose(
  position: NodePosition,
  obstacles: readonly NodePosition[],
  minimumDistance: number
): boolean {
  const minimumDistanceSquared = minimumDistance * minimumDistance;
  return obstacles.some((obstacle) => {
    const deltaX = position.x - obstacle.x;
    const deltaY = position.y - obstacle.y;
    return deltaX * deltaX + deltaY * deltaY < minimumDistanceSquared;
  });
}

export function buildRenderedFloatingSplices({
  splices,
  nodes,
  segments,
  networkNodePositions,
  segmentSubNetworkTagById,
  isSubNetworkFilteringActive,
  activeSubNetworkTagSet,
  selectedSpliceId,
}: BuildRenderedFloatingSplicesParams): RenderedFloatingSpliceModel[] {
  const segmentById = new Map(segments.map((segment) => [segment.id, segment] as const));
  const spliceNodeIds = new Set(
    nodes
      .filter((node) => node.kind === "splice")
      .map((node) => node.spliceId),
  );
  const placedCandidates = splices
    .filter((splice) => !spliceNodeIds.has(splice.id))
    .flatMap((splice) => {
      const placement = resolveSplicePlacementFromEntities(
        splice,
        (segmentId) => segmentById.get(segmentId),
      );
      if (placement.status !== "placed") {
        return [];
      }
      const fromPosition = networkNodePositions[placement.fromNodeId];
      const toPosition = networkNodePositions[placement.toNodeId];
      if (fromPosition === undefined || toPosition === undefined) {
        return [];
      }
      const anchorPosition = {
        x: fromPosition.x + (toPosition.x - fromPosition.x) * placement.ratio,
        y: fromPosition.y + (toPosition.y - fromPosition.y) * placement.ratio,
      };
      const tangent = normalizeVector(
        toPosition.x - fromPosition.x,
        toPosition.y - fromPosition.y,
      );
      return [
        {
          splice,
          hostNodeId: placement.fromNodeId,
          anchorPosition,
          normal: normalizeVector(-tangent.y, tangent.x),
          segmentId: placement.segmentId,
        },
      ];
    })
    .sort(
      (left, right) =>
        left.anchorPosition.x - right.anchorPosition.x ||
        left.anchorPosition.y - right.anchorPosition.y ||
        left.splice.id.localeCompare(right.splice.id),
    );

  const groupEntriesByAnchorKey = new Map<string, typeof placedCandidates>();
  for (const candidate of placedCandidates) {
    const key = `${candidate.anchorPosition.x.toFixed(3)}:${candidate.anchorPosition.y.toFixed(3)}`;
    const entries = groupEntriesByAnchorKey.get(key) ?? [];
    entries.push(candidate);
    groupEntriesByAnchorKey.set(key, entries);
  }

  const nodeObstacles = Object.values(networkNodePositions);
  const renderedPositions: NodePosition[] = [];
  const result: RenderedFloatingSpliceModel[] = [];

  for (const [anchorKey, groupEntries] of groupEntriesByAnchorKey) {
    void anchorKey;
    const fanSteps = buildFanSteps(groupEntries.length);
    for (let index = 0; index < groupEntries.length; index += 1) {
      const entry = groupEntries[index]!;
      const segmentTag =
        segmentSubNetworkTagById.get(entry.segmentId) ?? "(default)";
      const isSubNetworkDeemphasized =
        isSubNetworkFilteringActive && !activeSubNetworkTagSet.has(segmentTag);
      const nodeClassName = `network-node splice${
        selectedSpliceId === entry.splice.id ? " is-selected" : ""
      }${isSubNetworkDeemphasized ? " is-deemphasized" : ""} network-floating-splice`;
      const preferredStep = fanSteps[index] ?? 0;
      const nodeOverlap = isTooClose(
        entry.anchorPosition,
        nodeObstacles,
        FLOATING_SPLICE_RENDER_CLEARANCE,
      );
      const fallbackSign =
        preferredStep === 0
          ? 1
          : preferredStep < 0
            ? -1
            : 1;
      const stepCandidates =
        preferredStep === 0
          ? [0, fallbackSign, -fallbackSign, 2 * fallbackSign, -2 * fallbackSign, 3 * fallbackSign]
          : [
              preferredStep,
              preferredStep + fallbackSign,
              preferredStep - fallbackSign,
              preferredStep + 2 * fallbackSign,
              preferredStep - 2 * fallbackSign,
            ];

      let displayPosition = entry.anchorPosition;
      for (const candidateStep of stepCandidates) {
        if (candidateStep === 0 && (nodeOverlap || groupEntries.length > 1)) {
          continue;
        }
        const candidatePosition =
          candidateStep === 0
            ? entry.anchorPosition
            : {
                x:
                  entry.anchorPosition.x +
                  entry.normal.x * candidateStep * FLOATING_SPLICE_RENDER_STEP,
                y:
                  entry.anchorPosition.y +
                  entry.normal.y * candidateStep * FLOATING_SPLICE_RENDER_STEP,
              };
        if (
          isTooClose(
            candidatePosition,
            renderedPositions,
            FLOATING_SPLICE_RENDER_CLEARANCE,
          )
        ) {
          continue;
        }
        displayPosition = candidatePosition;
        break;
      }

      renderedPositions.push(displayPosition);
      result.push({
        splice: entry.splice,
        position: displayPosition,
        anchorPosition: entry.anchorPosition,
        nodeClassName,
        nodeLabel: entry.splice.technicalId,
        hostNodeId: entry.hostNodeId,
        isSubNetworkDeemphasized,
      });
    }
  }

  return result;
}

function resolveNodeKindClass(nodeKind: NetworkNode["kind"]): "connector" | "splice" | "intermediate" {
  if (nodeKind === "connector") {
    return "connector";
  }
  if (nodeKind === "splice") {
    return "splice";
  }
  return "intermediate";
}

export function buildRenderedNodes({
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
}: BuildRenderedNodesParams): RenderedNodeModel[] {
  const result: RenderedNodeModel[] = [];
  const catalogItemById = new Map(catalogItems.map((item) => [item.id, item] as const));

  for (const node of nodes) {
    const position = networkNodePositions[node.id];
    if (position === undefined) {
      continue;
    }

    const isSubNetworkDeemphasized =
      isSubNetworkFilteringActive && !(nodeHasActiveSubNetworkConnection.get(node.id) ?? false);
    const nodeKindClass = resolveNodeKindClass(node.kind);
    const isSelectedNode =
      selectedCanvasNodeIds.has(node.id) ||
      selectedNodeId === node.id ||
      (node.kind === "connector" && selectedConnectorId === node.connectorId) ||
      (node.kind === "splice" && selectedSpliceId === node.spliceId);
    const nodeClassName = `network-node ${nodeKindClass}${isSelectedNode ? " is-selected" : ""}${
      isSubNetworkDeemphasized ? " is-deemphasized" : ""
    }`;
    const nodeLabel =
      node.kind === "intermediate"
        ? node.id
        : node.kind === "connectorBackshellHelper"
          ? resolveBackshellHelperNodeReference(node, connectorMap)
        : node.kind === "connector"
          ? (connectorMap.get(node.connectorId)?.technicalId ?? node.connectorId)
          : (spliceMap.get(node.spliceId)?.technicalId ?? node.spliceId);
    const connector = node.kind === "connector" ? connectorMap.get(node.connectorId) : undefined;
    const connectorLayout =
      connectorDrawingDisplayMode === "nodes" && connector !== undefined
        ? resolveEditedConnectorLayout(
            connector.catalogItemId === undefined ? undefined : catalogItemById.get(connector.catalogItemId)?.connectorLayout,
            connector.cavityCount
          )
        : undefined;
    const highlightedConnectorCavityIndexes =
      connector !== undefined
        ? getHighlightedConnectorCavityIndexes(connectorCalloutGroupsById.get(connector.id) ?? [], selectedWireId)
        : new Set<number>();
    const connectorCavityWireIdByIndex =
      connector !== undefined
        ? getConnectorCavityWireIdByIndex(connectorCalloutGroupsById.get(connector.id) ?? [])
        : new Map<number, WireId>();

    result.push({
      node,
      position,
      nodeClassName,
      nodeLabel,
      connectorLayout,
      highlightedConnectorCavityIndexes,
      connectorCavityWireIdByIndex,
      labelOffsetY: 0,
      isSubNetworkDeemphasized
    });
  }

  return result;
}
