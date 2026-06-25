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
import { resolveSplicePlacementFromEntities, type ResolvedSplicePlacement } from "../../../../core/splicePlacement";
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

export interface SegmentLengthSubLabel {
  key: string;
  anchorX: number;
  anchorY: number;
  textX: number;
  textY: number;
  rotationDegrees: number;
  lengthMm: number;
}

export interface SegmentWireHighlightPortion {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  markers: Array<{ key: string; x: number; y: number }>;
}

export interface SegmentWirePartialCoverage {
  segmentId: SegmentId;
  spliceId: SpliceId;
  coveredLengthMm: number;
}

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
  // Per sub-span length labels (between consecutive nodes/splices). Empty when the
  // segment carries no floating splice, in which case the single full-length label is used.
  segmentLengthSubLabels: SegmentLengthSubLabel[];
  // Only the portion of an endpoint segment actually traversed by the selected wire
  // when that wire terminates on a floating splice. Null for full-segment highlights.
  wireHighlightPortion: SegmentWireHighlightPortion | null;
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
  /**
   * True when this splice shares its physical placement point with one or more
   * other splices and was offset orthogonally to the carrier segment for
   * legibility. Drives the optional colocated-splice link line.
   */
  isColocated: boolean;
}

interface BuildRenderedSegmentsParams {
  segments: Segment[];
  nodes: NetworkNode[];
  networkNodePositions: Record<NodeId, NodePosition>;
  segmentSubNetworkTagById: ReadonlyMap<SegmentId, string>;
  isSubNetworkFilteringActive: boolean;
  activeSubNetworkTagSet: ReadonlySet<string>;
  selectedWireRouteSegmentIds: ReadonlySet<SegmentId>;
  selectedWirePartialCoverage?: ReadonlyArray<SegmentWirePartialCoverage>;
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
// Base column widths were [32, 34, 44, 42, 40]. The sheath-type (Layer) column is
// reduced by 10% and the Insulation column enlarged by 35% for better legibility.
const SEGMENT_SHEATH_CALLOUT_COLUMN_WIDTHS = [29, 46, 44, 42, 40] as const;
const SEGMENT_SHEATH_CALLOUT_CELL_PADDING = 3;
const SEGMENT_SHEATH_CALLOUT_WIDTH = SEGMENT_SHEATH_CALLOUT_COLUMN_WIDTHS.reduce((total, width) => total + width, 0);
const SEGMENT_SHEATH_CALLOUT_HEIGHT = 28;
const SEGMENT_SHEATH_CALLOUT_OFFSET = 26;
const SEGMENT_SHEATH_CALLOUT_COLUMN_LEFT_OFFSETS = SEGMENT_SHEATH_CALLOUT_COLUMN_WIDTHS.reduce<number[]>(
  (offsets, width) => {
    offsets.push((offsets[offsets.length - 1] ?? 0) + width);
    return offsets;
  },
  [0]
);
// Text x (relative to the callout left edge) for each of the 5 columns.
export const SEGMENT_SHEATH_CALLOUT_COLUMN_TEXT_OFFSETS = SEGMENT_SHEATH_CALLOUT_COLUMN_WIDTHS.map(
  (_width, index) => (SEGMENT_SHEATH_CALLOUT_COLUMN_LEFT_OFFSETS[index] ?? 0) + SEGMENT_SHEATH_CALLOUT_CELL_PADDING
);
// Vertical divider x (relative to the left edge) between adjacent columns.
export const SEGMENT_SHEATH_CALLOUT_COLUMN_DIVIDER_OFFSETS = SEGMENT_SHEATH_CALLOUT_COLUMN_LEFT_OFFSETS.slice(1, -1);

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
  selectedWirePartialCoverage = [],
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

  // Offset of a placed splice measured from the segment's nodeA endpoint, regardless of
  // which endpoint the placement happens to reference.
  const offsetFromSegmentNodeA = (placement: ResolvedSplicePlacement, segment: Segment): number =>
    placement.fromNodeId === segment.nodeA ? placement.offsetMm : segment.lengthMm - placement.offsetMm;

  // Floating splices that land strictly inside a segment, sorted by their offset from nodeA.
  // These subdivide the segment so we can display node↔splice / splice↔splice distances.
  const placedSpliceOffsetsBySegmentId = new Map<SegmentId, number[]>();
  for (const splice of spliceMap.values()) {
    const placement = resolveSplicePlacementFromEntities(splice, (segmentId) => segmentById.get(segmentId));
    if (placement.status !== "placed") {
      continue;
    }
    const segment = segmentById.get(placement.segmentId);
    if (segment === undefined || segment.lengthMm <= 0) {
      continue;
    }
    const offset = offsetFromSegmentNodeA(placement, segment);
    if (offset <= 0.0001 || offset >= segment.lengthMm - 0.0001) {
      // Sitting on a node endpoint: it does not subdivide the segment.
      continue;
    }
    const offsets = placedSpliceOffsetsBySegmentId.get(placement.segmentId) ?? [];
    offsets.push(offset);
    placedSpliceOffsetsBySegmentId.set(placement.segmentId, offsets);
  }
  for (const offsets of placedSpliceOffsetsBySegmentId.values()) {
    offsets.sort((left, right) => left - right);
  }

  // Per-segment partial highlight ranges for the selected wire when it terminates on a
  // floating splice (it only traverses part of that endpoint segment).
  const partialCoverageBySegmentId = new Map<SegmentId, Array<{ markerRatio: number; coveredLengthMm: number }>>();
  for (const entry of selectedWirePartialCoverage) {
    const segment = segmentById.get(entry.segmentId);
    if (segment === undefined || segment.lengthMm <= 0) {
      continue;
    }
    const splice = spliceMap.get(entry.spliceId);
    if (splice === undefined) {
      continue;
    }
    const placement = resolveSplicePlacementFromEntities(splice, (segmentId) => segmentById.get(segmentId));
    if (placement.status !== "placed" || placement.segmentId !== entry.segmentId) {
      continue;
    }
    const markerRatio = offsetFromSegmentNodeA(placement, segment) / segment.lengthMm;
    const ranges = partialCoverageBySegmentId.get(entry.segmentId) ?? [];
    ranges.push({ markerRatio, coveredLengthMm: entry.coveredLengthMm });
    partialCoverageBySegmentId.set(entry.segmentId, ranges);
  }
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
    const partialCoverage = partialCoverageBySegmentId.get(segment.id);
    const isPartialWireHighlight = isWireHighlighted && partialCoverage !== undefined && partialCoverage.length > 0;
    const isSelectedSegment = selectedSegmentId === segment.id || selectedBatchSegmentIds.has(segment.id);
    // Partial highlights are drawn as a dedicated overlay, so the base line keeps its normal style.
    const segmentClassName = `network-segment${isWireHighlighted && !isPartialWireHighlight ? " is-wire-highlighted" : ""}${
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

    const pointAtRatio = (ratio: number): NodePosition => ({
      x: nodeAPosition.x + segmentVectorX * ratio,
      y: nodeAPosition.y + segmentVectorY * ratio
    });

    // One length label per sub-span (node↔splice, splice↔splice) when the segment carries
    // floating splices; otherwise empty and the single full-length label is rendered instead.
    const spliceOffsets = placedSpliceOffsetsBySegmentId.get(segment.id) ?? [];
    const segmentLengthSubLabels: SegmentLengthSubLabel[] = [];
    if (spliceOffsets.length > 0 && segment.lengthMm > 0) {
      // Physical breakpoints drive the displayed lengths (real mm), while the
      // render-only visual ratios drive WHERE each label sits, so labels land in
      // the visual gaps between the evenly-spread splice markers instead of the
      // physical midpoints (which would bunch up and collide).
      const physicalBreakpoints = [0, ...spliceOffsets, segment.lengthMm];
      const visualRatios = computeFloatingSpliceVisualRatios(
        spliceOffsets.map((offset) => offset / segment.lengthMm),
      );
      const visualBoundaries = [0, ...visualRatios, 1];
      for (let index = 0; index < physicalBreakpoints.length - 1; index += 1) {
        const spanStart = physicalBreakpoints[index] ?? 0;
        const spanEnd = physicalBreakpoints[index + 1] ?? segment.lengthMm;
        const spanLengthMm = spanEnd - spanStart;
        if (spanLengthMm <= 0.0001) {
          continue;
        }
        const visualMidRatio = ((visualBoundaries[index] ?? 0) + (visualBoundaries[index + 1] ?? 1)) / 2;
        const midpoint = pointAtRatio(visualMidRatio);
        segmentLengthSubLabels.push({
          key: `${segment.id}-len-${index}`,
          anchorX: midpoint.x,
          anchorY: midpoint.y,
          textX: segmentLengthLabelOffsetX,
          textY: segmentLengthLabelOffsetY,
          rotationDegrees: segmentLabelRotationDegrees,
          lengthMm: spanLengthMm
        });
      }
    }

    let wireHighlightPortion: SegmentWireHighlightPortion | null = null;
    if (isPartialWireHighlight && partialCoverage !== undefined) {
      const markerRatios = partialCoverage.map((coverage) => coverage.markerRatio);
      let startRatio = 0;
      let endRatio = 0;
      const firstCoverage = partialCoverage[0];
      if (partialCoverage.length >= 2) {
        // Both wire endpoints sit on splices of this single segment: cover between them.
        startRatio = Math.min(...markerRatios);
        endRatio = Math.max(...markerRatios);
      } else if (firstCoverage !== undefined) {
        const { markerRatio, coveredLengthMm } = firstCoverage;
        const distanceToNodeAMm = markerRatio * segment.lengthMm;
        const distanceToNodeBMm = segment.lengthMm - distanceToNodeAMm;
        const extendsTowardNodeA =
          Math.abs(coveredLengthMm - distanceToNodeAMm) <= Math.abs(coveredLengthMm - distanceToNodeBMm);
        const coveredRatio = segment.lengthMm > 0 ? coveredLengthMm / segment.lengthMm : 0;
        const otherRatio = Math.min(
          1,
          Math.max(0, extendsTowardNodeA ? markerRatio - coveredRatio : markerRatio + coveredRatio)
        );
        startRatio = Math.min(markerRatio, otherRatio);
        endRatio = Math.max(markerRatio, otherRatio);
      }
      const start = pointAtRatio(startRatio);
      const end = pointAtRatio(endRatio);
      wireHighlightPortion = {
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        markers: partialCoverage.map((coverage, index) => {
          const markerPoint = pointAtRatio(coverage.markerRatio);
          return { key: `${segment.id}-wirehl-${index}`, x: markerPoint.x, y: markerPoint.y };
        })
      };
    }

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
      segmentLengthSubLabels,
      wireHighlightPortion,
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
  /** Display-only formatter for entity IDs (e.g. network prefix hiding). */
  formatEntityId?: (id: string) => string;
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
  /** Display-only formatter for entity IDs (e.g. network prefix hiding). */
  formatEntityId?: (id: string) => string;
}

const FLOATING_SPLICE_RENDER_CLEARANCE = 24;
const FLOATING_SPLICE_RENDER_STEP = 18;

/**
 * Two placements describe the same physical point when their canonical
 * along-segment ratios (measured from `nodeA`) match within this tolerance. This
 * also catches placements expressed from opposite segment nodes (AC6), because
 * the reverse ratio `1 - r` normalizes back to the same canonical ratio.
 */
const COLOCATION_RATIO_TOLERANCE = 1e-6;

/**
 * Orthogonal spacing (model units) between colocated splice symbols, derived from
 * the rendered splice diamond size so the symbols never overlap (AC14). The
 * diamond is a square rotated 45°, so its bounding half-extent along an axis is
 * ~`size * √2 / 2`; spacing of one full diagonal plus a small gap keeps adjacent
 * symbols clear.
 */
export const COLOCATED_SPLICE_OFFSET_STEP = Math.round(SPLICE_DIAMOND_SIZE * Math.SQRT2) + 6;

/**
 * Render-only symmetric offset units for a colocated group, centered on the true
 * placement point: a pair lands at `[-0.5, 0.5]` (one on each side), a triple at
 * `[-1, 0, 1]`, and so on. Deterministic spacing that avoids overlap (AC3).
 */
export function computeColocatedSpliceOffsetUnits(count: number): number[] {
  if (count <= 0) {
    return [];
  }
  const center = (count - 1) / 2;
  return Array.from({ length: count }, (_value, index) => index - center);
}

/**
 * Render-only visual placement tuning for floating splices. The physical
 * placement (`segmentId`/`fromNodeId`/`offsetMm`) is never mutated; only the
 * on-segment anchor used for drawing is biased toward the segment center so the
 * marker stays clear of endpoint node icons and segment length labels.
 */
export const FLOATING_SPLICE_VISUAL_CENTER_RATIO = 0.5;
/** How much of the physical offset deviation from center is kept visually. */
export const FLOATING_SPLICE_VISUAL_BIAS_FACTOR = 0.35;
/** Bounded visual band around the center the marker is confined to. */
export const FLOATING_SPLICE_VISUAL_MIN_RATIO = 0.3;
export const FLOATING_SPLICE_VISUAL_MAX_RATIO = 0.7;

/**
 * Remaps a physical segment ratio (0..1) into a bounded, center-biased visual
 * ratio. The marker stays generally near the midpoint while keeping only a mild
 * directional bias toward the endpoint the splice is physically closer to. Pure
 * and deterministic so it can be unit tested in isolation.
 */
export function biasFloatingSpliceVisualRatio(physicalRatio: number): number {
  if (!Number.isFinite(physicalRatio)) {
    return FLOATING_SPLICE_VISUAL_CENTER_RATIO;
  }
  const clampedPhysical = Math.min(1, Math.max(0, physicalRatio));
  const biased =
    FLOATING_SPLICE_VISUAL_CENTER_RATIO +
    (clampedPhysical - FLOATING_SPLICE_VISUAL_CENTER_RATIO) * FLOATING_SPLICE_VISUAL_BIAS_FACTOR;
  return Math.min(
    FLOATING_SPLICE_VISUAL_MAX_RATIO,
    Math.max(FLOATING_SPLICE_VISUAL_MIN_RATIO, biased),
  );
}

/**
 * Render-only visual ratios for the floating splices that share a segment, given
 * their physical ratios already sorted along the segment (from nodeA). A lone
 * splice keeps its mild center bias; multiple splices are spread evenly at
 * `i / (N + 1)` so they never overlap. The same mapping drives both the splice
 * markers and the segment length sub-label placement so labels sit in the visual
 * gaps between markers.
 */
export function computeFloatingSpliceVisualRatios(orderedCanonicalRatios: readonly number[]): number[] {
  const count = orderedCanonicalRatios.length;
  if (count === 0) {
    return [];
  }
  if (count === 1) {
    return [biasFloatingSpliceVisualRatio(orderedCanonicalRatios[0] ?? FLOATING_SPLICE_VISUAL_CENTER_RATIO)];
  }
  return orderedCanonicalRatios.map((_ratio, index) => (index + 1) / (count + 1));
}

function normalizeVector(x: number, y: number): NodePosition {
  const length = Math.hypot(x, y);
  if (length <= 0.0001) {
    return { x: 0, y: -1 };
  }
  return { x: x / length, y: y / length };
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
  formatEntityId = (id) => id,
}: BuildRenderedFloatingSplicesParams): RenderedFloatingSpliceModel[] {
  const segmentById = new Map(segments.map((segment) => [segment.id, segment] as const));
  const spliceNodeIds = new Set(
    nodes
      .filter((node) => node.kind === "splice")
      .map((node) => node.spliceId),
  );
  // Collect placed splices with a canonical along-segment ratio (measured from
  // segment.nodeA) so multiple splices on one segment can be ordered and
  // distributed consistently regardless of each splice's reference end.
  const placedInputs = splices
    .filter((splice) => !spliceNodeIds.has(splice.id))
    .flatMap((splice) => {
      const placement = resolveSplicePlacementFromEntities(
        splice,
        (segmentId) => segmentById.get(segmentId),
      );
      if (placement.status !== "placed") {
        return [];
      }
      const segment = segmentById.get(placement.segmentId);
      if (segment === undefined) {
        return [];
      }
      const fromPosition = networkNodePositions[segment.nodeA];
      const toPosition = networkNodePositions[segment.nodeB];
      if (fromPosition === undefined || toPosition === undefined) {
        return [];
      }
      const canonicalPhysicalRatio =
        placement.fromNodeId === segment.nodeA ? placement.ratio : 1 - placement.ratio;
      return [
        {
          splice,
          segmentId: placement.segmentId,
          hostNodeId: placement.fromNodeId,
          fromPosition,
          toPosition,
          canonicalPhysicalRatio,
        },
      ];
    });

  const inputsBySegment = new Map<SegmentId, typeof placedInputs>();
  for (const input of placedInputs) {
    const entries = inputsBySegment.get(input.segmentId) ?? [];
    entries.push(input);
    inputsBySegment.set(input.segmentId, entries);
  }

  // Render-only visual placement (persisted placement/routing/lengths/exports keep
  // the real offset):
  // - a lone splice is biased toward the segment center with a mild lean to the
  //   physically closer endpoint;
  // - multiple splices on one segment are spread evenly at i/(N+1) along the
  //   segment, in physical order, so they no longer collide or hide the inter-
  //   splice distance labels.
  interface PlacedColocationCandidate {
    splice: Splice;
    hostNodeId: NodeId;
    anchorPosition: NodePosition;
    normal: NodePosition;
    segmentId: SegmentId;
    colocationSize: number;
    colocationIndex: number;
  }

  const placedCandidates: PlacedColocationCandidate[] = [...inputsBySegment.values()]
    .flatMap((segmentInputs) => {
      const ordered = [...segmentInputs].sort(
        (left, right) =>
          left.canonicalPhysicalRatio - right.canonicalPhysicalRatio ||
          left.splice.id.localeCompare(right.splice.id),
      );
      // Cluster splices that share the same physical point on the segment into
      // colocation groups. Reverse-from-node placements normalize to the same
      // canonical ratio (AC6), so they cluster together here.
      const groups: (typeof ordered)[] = [];
      for (const input of ordered) {
        const lastGroup = groups[groups.length - 1];
        if (
          lastGroup !== undefined &&
          Math.abs(lastGroup[0]!.canonicalPhysicalRatio - input.canonicalPhysicalRatio) <=
            COLOCATION_RATIO_TOLERANCE
        ) {
          lastGroup.push(input);
        } else {
          groups.push([input]);
        }
      }
      // Distinct colocation points spread evenly along the segment (i/(N+1)); a
      // colocated group occupies a single along-segment slot at the true point.
      const visualRatios = computeFloatingSpliceVisualRatios(
        groups.map((group) => group[0]!.canonicalPhysicalRatio),
      );
      return groups.flatMap((group, groupIndex) => {
        const visualRatio = visualRatios[groupIndex] ?? FLOATING_SPLICE_VISUAL_CENTER_RATIO;
        const reference = group[0]!;
        const anchorPosition = {
          x: reference.fromPosition.x + (reference.toPosition.x - reference.fromPosition.x) * visualRatio,
          y: reference.fromPosition.y + (reference.toPosition.y - reference.fromPosition.y) * visualRatio,
        };
        const tangent = normalizeVector(
          reference.toPosition.x - reference.fromPosition.x,
          reference.toPosition.y - reference.fromPosition.y,
        );
        const normal = normalizeVector(-tangent.y, tangent.x);
        // Deterministic ordering within the colocated group by splice id.
        const orderedGroup = [...group].sort((left, right) =>
          left.splice.id.localeCompare(right.splice.id),
        );
        return orderedGroup.map((input, indexInGroup) => ({
          splice: input.splice,
          hostNodeId: input.hostNodeId,
          anchorPosition,
          normal,
          segmentId: input.segmentId,
          colocationSize: orderedGroup.length,
          colocationIndex: indexInGroup,
        }));
      });
    })
    .sort(
      (left, right) =>
        left.anchorPosition.x - right.anchorPosition.x ||
        left.anchorPosition.y - right.anchorPosition.y ||
        left.splice.id.localeCompare(right.splice.id),
    );

  const nodeObstacles = Object.values(networkNodePositions);
  const renderedPositions: NodePosition[] = [];
  const result: RenderedFloatingSpliceModel[] = [];

  for (const entry of placedCandidates) {
    const segmentTag = segmentSubNetworkTagById.get(entry.segmentId) ?? "(default)";
    const isSubNetworkDeemphasized =
      isSubNetworkFilteringActive && !activeSubNetworkTagSet.has(segmentTag);
    const isColocated = entry.colocationSize > 1;
    const nodeClassName = `network-node splice${
      selectedSpliceId === entry.splice.id ? " is-selected" : ""
    }${isSubNetworkDeemphasized ? " is-deemphasized" : ""} network-floating-splice${
      isColocated ? " is-colocated" : ""
    }`;

    let displayPosition: NodePosition;
    if (isColocated) {
      // Symmetric orthogonal offset around the true placement point, spacing
      // derived from the symbol size so the markers never overlap (AC1-AC3,
      // AC14). The persisted placement is untouched; only the drawn position
      // moves along the carrier-segment normal.
      const offsetUnits =
        computeColocatedSpliceOffsetUnits(entry.colocationSize)[entry.colocationIndex] ?? 0;
      displayPosition = {
        x: entry.anchorPosition.x + entry.normal.x * offsetUnits * COLOCATED_SPLICE_OFFSET_STEP,
        y: entry.anchorPosition.y + entry.normal.y * offsetUnits * COLOCATED_SPLICE_OFFSET_STEP,
      };
    } else {
      // Lone splice: keep it at its along-segment anchor, nudging clear of node
      // icons and previously placed markers along the segment normal.
      const nodeOverlap = isTooClose(
        entry.anchorPosition,
        nodeObstacles,
        FLOATING_SPLICE_RENDER_CLEARANCE,
      );
      displayPosition = entry.anchorPosition;
      const stepCandidates = [0, 1, -1, 2, -2, 3, -3];
      for (const candidateStep of stepCandidates) {
        if (candidateStep === 0 && nodeOverlap) {
          continue;
        }
        const candidatePosition =
          candidateStep === 0
            ? entry.anchorPosition
            : {
                x: entry.anchorPosition.x + entry.normal.x * candidateStep * FLOATING_SPLICE_RENDER_STEP,
                y: entry.anchorPosition.y + entry.normal.y * candidateStep * FLOATING_SPLICE_RENDER_STEP,
              };
        if (isTooClose(candidatePosition, renderedPositions, FLOATING_SPLICE_RENDER_CLEARANCE)) {
          continue;
        }
        displayPosition = candidatePosition;
        break;
      }
    }

    renderedPositions.push(displayPosition);
    result.push({
      splice: entry.splice,
      position: displayPosition,
      anchorPosition: entry.anchorPosition,
      nodeClassName,
      nodeLabel: formatEntityId(entry.splice.technicalId),
      hostNodeId: entry.hostNodeId,
      isSubNetworkDeemphasized,
      isColocated,
    });
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
  spliceMap,
  formatEntityId = (id) => id
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
    const nodeLabel = formatEntityId(
      node.kind === "intermediate"
        ? node.id
        : node.kind === "connectorBackshellHelper"
          ? resolveBackshellHelperNodeReference(node, connectorMap)
        : node.kind === "connector"
          ? (connectorMap.get(node.connectorId)?.technicalId ?? node.connectorId)
          : (spliceMap.get(node.spliceId)?.technicalId ?? node.spliceId)
    );
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
