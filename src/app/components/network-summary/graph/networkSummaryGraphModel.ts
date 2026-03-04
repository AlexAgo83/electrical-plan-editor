import type {
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId
} from "../../../../core/entities";
import type { NodePosition } from "../../../types/app-controller";
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
}

export interface RenderedNodeModel {
  node: NetworkNode;
  position: NodePosition;
  nodeClassName: string;
  nodeLabel: string;
  isSubNetworkDeemphasized: boolean;
}

interface BuildRenderedSegmentsParams {
  segments: Segment[];
  networkNodePositions: Record<NodeId, NodePosition>;
  segmentSubNetworkTagById: ReadonlyMap<SegmentId, string>;
  isSubNetworkFilteringActive: boolean;
  activeSubNetworkTagSet: ReadonlySet<string>;
  selectedWireRouteSegmentIds: ReadonlySet<SegmentId>;
  selectedSegmentId: SegmentId | null;
  autoSegmentLabelRotation: boolean;
  labelRotationDegrees: number;
  showSegmentNames: boolean;
  showSegmentLengths: boolean;
}

export function buildRenderedSegments({
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
}: BuildRenderedSegmentsParams): RenderedSegmentModel[] {
  const result: RenderedSegmentModel[] = [];

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
    const labelX = (nodeAPosition.x + nodeBPosition.x) / 2;
    const labelY = (nodeAPosition.y + nodeBPosition.y) / 2;
    const segmentVectorX = nodeBPosition.x - nodeAPosition.x;
    const segmentVectorY = nodeBPosition.y - nodeAPosition.y;
    const segmentAngleDegrees = normalizeReadableSegmentLabelAngle(
      (Math.atan2(segmentVectorY, segmentVectorX) * 180) / Math.PI
    );
    const segmentLabelRotationDegrees = autoSegmentLabelRotation ? segmentAngleDegrees : labelRotationDegrees;
    const segmentLabelRotationRadians = (segmentLabelRotationDegrees * Math.PI) / 180;
    const segmentLabelOffsetDistance = showSegmentLengths && showSegmentNames ? 6 : 0;

    // Keep ID/length split along the label-normal axis, including when labels are auto-rotated.
    const segmentLengthLabelOffsetX = -Math.sin(segmentLabelRotationRadians) * segmentLabelOffsetDistance;
    const segmentLengthLabelOffsetY = Math.cos(segmentLabelRotationRadians) * segmentLabelOffsetDistance;

    result.push({
      segment,
      nodeAPosition,
      nodeBPosition,
      segmentClassName,
      segmentGroupClassName,
      labelX,
      labelY,
      segmentLabelRotationDegrees,
      segmentIdLabelX: -segmentLengthLabelOffsetX,
      segmentIdLabelY: -segmentLengthLabelOffsetY,
      segmentLengthLabelX: segmentLengthLabelOffsetX,
      segmentLengthLabelY: segmentLengthLabelOffsetY
    });
  }

  return result;
}

interface BuildRenderedNodesParams {
  nodes: NetworkNode[];
  networkNodePositions: Record<NodeId, NodePosition>;
  isSubNetworkFilteringActive: boolean;
  nodeHasActiveSubNetworkConnection: ReadonlyMap<NodeId, boolean>;
  selectedNodeId: NodeId | null;
  selectedConnectorId: ConnectorId | null;
  selectedSpliceId: SpliceId | null;
  connectorMap: ReadonlyMap<ConnectorId, Connector>;
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
  selectedNodeId,
  selectedConnectorId,
  selectedSpliceId,
  connectorMap,
  spliceMap
}: BuildRenderedNodesParams): RenderedNodeModel[] {
  const result: RenderedNodeModel[] = [];

  for (const node of nodes) {
    const position = networkNodePositions[node.id];
    if (position === undefined) {
      continue;
    }

    const isSubNetworkDeemphasized =
      isSubNetworkFilteringActive && !(nodeHasActiveSubNetworkConnection.get(node.id) ?? false);
    const nodeKindClass = resolveNodeKindClass(node.kind);
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

    result.push({
      node,
      position,
      nodeClassName,
      nodeLabel,
      isSubNetworkDeemphasized
    });
  }

  return result;
}
