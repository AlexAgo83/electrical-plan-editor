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
    anchorX: number;
    anchorY: number;
    width: number;
    height: number;
    lines: string[];
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

interface BuildRenderedSegmentsParams {
  segments: Segment[];
  nodes: NetworkNode[];
  networkNodePositions: Record<NodeId, NodePosition>;
  segmentSubNetworkTagById: ReadonlyMap<SegmentId, string>;
  isSubNetworkFilteringActive: boolean;
  activeSubNetworkTagSet: ReadonlySet<string>;
  selectedWireRouteSegmentIds: ReadonlySet<SegmentId>;
  selectedSegmentId: SegmentId | null;
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
  spliceMap?: ReadonlyMap<SpliceId, Splice>;
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

export function buildRenderedSegments({
  segments,
  nodes,
  networkNodePositions,
  segmentSubNetworkTagById,
  isSubNetworkFilteringActive,
  activeSubNetworkTagSet,
  selectedWireRouteSegmentIds,
  selectedSegmentId,
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
  spliceMap = new Map<SpliceId, Splice>()
}: BuildRenderedSegmentsParams): RenderedSegmentModel[] {
  const result: RenderedSegmentModel[] = [];
  const nodeById = new Map(nodes.map((node) => [node.id, node] as const));
  const catalogItemById = new Map(catalogItems.map((item) => [item.id, item] as const));
  const nodeShapeScale = normalizedNodeShapeScale * (zoomInvariantNodeShapes ? inverseLabelScale : 1);

  for (const segment of segments) {
    const nodeAPosition = networkNodePositions[segment.nodeA];
    const nodeBPosition = networkNodePositions[segment.nodeB];
    if (nodeAPosition === undefined || nodeBPosition === undefined) {
      continue;
    }

    const segmentSubNetworkTag = segmentSubNetworkTagById.get(segment.id) ?? "(default)";
    const isSubNetworkDeemphasized = isSubNetworkFilteringActive && !activeSubNetworkTagSet.has(segmentSubNetworkTag);
    const isWireHighlighted = selectedWireRouteSegmentIds.has(segment.id);
    const isSelectedSegment = selectedSegmentId === segment.id;
    const segmentClassName = `network-segment${isWireHighlighted ? " is-wire-highlighted" : ""}${
      isSelectedSegment ? " is-selected" : ""
    }`;
    const segmentGroupClassName = `network-entity-group${isSubNetworkDeemphasized ? " is-deemphasized" : ""}`;
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
    const hasSegmentLabel = showSegmentLengths || showSegmentNames;
    const isNearHorizontalSegment = Math.abs(segmentAngleDegrees) <= 15;
    const segmentLabelOffsetDistance = hasSegmentLabel
      ? (showSegmentLengths && showSegmentNames ? 6 : 4) + (isNearHorizontalSegment ? 4 : 0)
      : 0;

    // Keep ID/length split along the label-normal axis, including when labels are auto-rotated.
    const segmentLengthLabelOffsetX = -Math.sin(segmentLabelRotationRadians) * segmentLabelOffsetDistance;
    const segmentLengthLabelOffsetY = Math.cos(segmentLabelRotationRadians) * segmentLabelOffsetDistance;
    const segmentNormalX = -Math.sin(segmentLabelRotationRadians);
    const segmentNormalY = Math.cos(segmentLabelRotationRadians);
    const endpointALabel = resolveSegmentEndpointDisplayLabel(nodeById.get(segment.nodeA), connectorMap, spliceMap);
    const endpointBLabel = resolveSegmentEndpointDisplayLabel(nodeById.get(segment.nodeB), connectorMap, spliceMap);
    const segmentCalloutLines = [
      endpointALabel === null || endpointBLabel === null ? null : `${endpointALabel} -> ${endpointBLabel}`,
      segment.sheathType === undefined ? null : `Sheath: ${segment.sheathType}`,
      segment.insulation === undefined ? null : `Insulation: ${segment.insulation}`,
      segment.lineStyle === undefined ? null : `Line style: ${segment.lineStyle}`,
      segment.internalPartReference === undefined ? null : `Int Part: ${segment.internalPartReference}`,
      `Qty: ${segment.lengthMm} mm`
    ].filter((line): line is string => line !== null);
    const segmentCallout =
      segmentCalloutLines.length > 1
        ? {
            anchorX: labelAnchor.x + segmentNormalX * 20,
            anchorY: labelAnchor.y + segmentNormalY * 20,
            width: 86,
            height: 12 + segmentCalloutLines.length * 9,
            lines: segmentCalloutLines
          }
        : null;
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
          ? `${connectorMap.get(node.connectorId)?.technicalId ?? node.connectorId}-BS`
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
