import type { NodeId, SegmentId } from "./entities";
import type { RoutingGraphEdge, RoutingGraphIndex } from "./graph";

interface NodeRouteCandidate {
  nodeId: NodeId;
  totalLengthMm: number;
  segmentIds: SegmentId[];
  nodeIds: NodeId[];
}

export interface ShortestRouteResult {
  fromNodeId: NodeId;
  toNodeId: NodeId;
  totalLengthMm: number;
  segmentIds: SegmentId[];
  nodeIds: NodeId[];
}

function compareSegmentIdArrays(left: SegmentId[], right: SegmentId[]): number {
  const minLength = Math.min(left.length, right.length);
  for (let index = 0; index < minLength; index += 1) {
    const leftSegmentId = left[index];
    const rightSegmentId = right[index];
    if (leftSegmentId === undefined || rightSegmentId === undefined) {
      continue;
    }

    const comparison = leftSegmentId.localeCompare(rightSegmentId);
    if (comparison !== 0) {
      return comparison;
    }
  }

  return left.length - right.length;
}

function compareCandidates(left: NodeRouteCandidate, right: NodeRouteCandidate): number {
  if (left.totalLengthMm !== right.totalLengthMm) {
    return left.totalLengthMm - right.totalLengthMm;
  }

  if (left.segmentIds.length !== right.segmentIds.length) {
    return left.segmentIds.length - right.segmentIds.length;
  }

  const segmentIdsComparison = compareSegmentIdArrays(left.segmentIds, right.segmentIds);
  if (segmentIdsComparison !== 0) {
    return segmentIdsComparison;
  }

  return left.nodeId.localeCompare(right.nodeId);
}

function sortEdgesDeterministically(edges: RoutingGraphEdge[]): RoutingGraphEdge[] {
  return [...edges].sort((left, right) => {
    const segmentComparison = left.segmentId.localeCompare(right.segmentId);
    if (segmentComparison !== 0) {
      return segmentComparison;
    }

    return left.toNodeId.localeCompare(right.toNodeId);
  });
}

export function findShortestRoute(
  graph: RoutingGraphIndex,
  fromNodeId: NodeId,
  toNodeId: NodeId
): ShortestRouteResult | null {
  if (fromNodeId === toNodeId) {
    return {
      fromNodeId,
      toNodeId,
      totalLengthMm: 0,
      segmentIds: [],
      nodeIds: [fromNodeId]
    };
  }

  const fromEdges = graph.edgesByNodeId[fromNodeId];
  const toEdges = graph.edgesByNodeId[toNodeId];
  if (fromEdges === undefined || toEdges === undefined) {
    return null;
  }

  const bestByNodeId: Partial<Record<NodeId, NodeRouteCandidate>> = {
    [fromNodeId]: {
      nodeId: fromNodeId,
      totalLengthMm: 0,
      segmentIds: [],
      nodeIds: [fromNodeId]
    }
  };

  const queue: NodeRouteCandidate[] = [bestByNodeId[fromNodeId] as NodeRouteCandidate];

  while (queue.length > 0) {
    queue.sort(compareCandidates);
    const candidate = queue.shift();
    if (candidate === undefined) {
      break;
    }

    if (bestByNodeId[candidate.nodeId] !== candidate) {
      continue;
    }

    if (candidate.nodeId === toNodeId) {
      return {
        fromNodeId,
        toNodeId,
        totalLengthMm: candidate.totalLengthMm,
        segmentIds: candidate.segmentIds,
        nodeIds: candidate.nodeIds
      };
    }

    const edges = sortEdgesDeterministically(graph.edgesByNodeId[candidate.nodeId] ?? []);

    for (const edge of edges) {
      const nextCandidate: NodeRouteCandidate = {
        nodeId: edge.toNodeId,
        totalLengthMm: candidate.totalLengthMm + edge.lengthMm,
        segmentIds: [...candidate.segmentIds, edge.segmentId],
        nodeIds: [...candidate.nodeIds, edge.toNodeId]
      };

      const currentBest = bestByNodeId[edge.toNodeId];
      if (currentBest === undefined || compareCandidates(nextCandidate, currentBest) < 0) {
        bestByNodeId[edge.toNodeId] = nextCandidate;
        queue.push(nextCandidate);
      }
    }
  }

  return null;
}
