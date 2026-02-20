import type { NetworkNode, NodeId, Segment, SegmentId } from "./entities";

export interface RoutingGraphEdge {
  segmentId: SegmentId;
  fromNodeId: NodeId;
  toNodeId: NodeId;
  lengthMm: number;
  subNetworkTag: string | null;
}

export interface RoutingGraphIndex {
  nodeIds: NodeId[];
  segmentIds: SegmentId[];
  edgesByNodeId: Record<NodeId, RoutingGraphEdge[]>;
}

export function buildRoutingGraphIndex(
  nodes: NetworkNode[],
  segments: Segment[]
): RoutingGraphIndex {
  const nodeIds = nodes.map((node) => node.id);
  const nodeSet = new Set(nodeIds);

  const edgesByNodeId = Object.fromEntries(
    nodeIds.map((nodeId) => [nodeId, [] as RoutingGraphEdge[]])
  ) as Record<NodeId, RoutingGraphEdge[]>;

  const segmentIds: SegmentId[] = [];

  for (const segment of segments) {
    if (segment.nodeA === segment.nodeB) {
      continue;
    }

    if (!nodeSet.has(segment.nodeA) || !nodeSet.has(segment.nodeB)) {
      continue;
    }

    if (!Number.isFinite(segment.lengthMm) || segment.lengthMm <= 0) {
      continue;
    }

    segmentIds.push(segment.id);

    const subNetworkTag = segment.subNetworkTag?.trim();
    const normalizedTag = subNetworkTag === undefined || subNetworkTag.length === 0 ? null : subNetworkTag;

    const edgesFromA = edgesByNodeId[segment.nodeA];
    const edgesFromB = edgesByNodeId[segment.nodeB];
    if (edgesFromA === undefined || edgesFromB === undefined) {
      continue;
    }

    edgesFromA.push({
      segmentId: segment.id,
      fromNodeId: segment.nodeA,
      toNodeId: segment.nodeB,
      lengthMm: segment.lengthMm,
      subNetworkTag: normalizedTag
    });

    edgesFromB.push({
      segmentId: segment.id,
      fromNodeId: segment.nodeB,
      toNodeId: segment.nodeA,
      lengthMm: segment.lengthMm,
      subNetworkTag: normalizedTag
    });
  }

  return {
    nodeIds,
    segmentIds,
    edgesByNodeId
  };
}
