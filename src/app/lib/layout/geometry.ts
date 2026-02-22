import type { NodeId, Segment } from "../../../core/entities";
import type { NodePosition } from "../../types/app-controller";
import { clamp } from "../app-utils-shared";

const NETWORK_NODE_VISUAL_RADIUS = 17;
const NETWORK_SEGMENT_VISUAL_WIDTH = 3;
export const NETWORK_MIN_SEGMENT_NODE_CLEARANCE = NETWORK_NODE_VISUAL_RADIUS + NETWORK_SEGMENT_VISUAL_WIDTH;

export function segmentsShareEndpoint(left: Segment, right: Segment): boolean {
  return (
    left.nodeA === right.nodeA ||
    left.nodeA === right.nodeB ||
    left.nodeB === right.nodeA ||
    left.nodeB === right.nodeB
  );
}

export function orientation(a: NodePosition, b: NodePosition, c: NodePosition): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function areSegmentsCrossing(
  aStart: NodePosition,
  aEnd: NodePosition,
  bStart: NodePosition,
  bEnd: NodePosition
): boolean {
  const o1 = orientation(aStart, aEnd, bStart);
  const o2 = orientation(aStart, aEnd, bEnd);
  const o3 = orientation(bStart, bEnd, aStart);
  const o4 = orientation(bStart, bEnd, aEnd);
  if (o1 === 0 || o2 === 0 || o3 === 0 || o4 === 0) {
    return false;
  }

  return (o1 > 0) !== (o2 > 0) && (o3 > 0) !== (o4 > 0);
}

export function isPointOnSegment(start: NodePosition, end: NodePosition, point: NodePosition, epsilon = 0.01): boolean {
  const cross = Math.abs(orientation(start, end, point));
  if (cross > epsilon) {
    return false;
  }

  const minX = Math.min(start.x, end.x) - epsilon;
  const maxX = Math.max(start.x, end.x) + epsilon;
  const minY = Math.min(start.y, end.y) - epsilon;
  const maxY = Math.max(start.y, end.y) + epsilon;
  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

export function distanceBetweenPoints(a: NodePosition, b: NodePosition): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distanceFromPointToSegment(point: NodePosition, start: NodePosition, end: NodePosition): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const squaredLength = dx * dx + dy * dy;
  if (squaredLength <= Number.EPSILON) {
    return distanceBetweenPoints(point, start);
  }

  const projection = ((point.x - start.x) * dx + (point.y - start.y) * dy) / squaredLength;
  const t = clamp(projection, 0, 1);
  const nearest = {
    x: start.x + t * dx,
    y: start.y + t * dy
  };
  return distanceBetweenPoints(point, nearest);
}

export function findFirstCrossingConflict(
  segments: Segment[],
  nodePositions: Record<NodeId, NodePosition>
): { left: Segment; right: Segment } | null {
  for (let leftIndex = 0; leftIndex < segments.length; leftIndex += 1) {
    const left = segments[leftIndex];
    if (left === undefined) {
      continue;
    }

    const leftA = nodePositions[left.nodeA];
    const leftB = nodePositions[left.nodeB];
    if (leftA === undefined || leftB === undefined) {
      continue;
    }

    for (let rightIndex = leftIndex + 1; rightIndex < segments.length; rightIndex += 1) {
      const right = segments[rightIndex];
      if (right === undefined || segmentsShareEndpoint(left, right)) {
        continue;
      }

      const rightA = nodePositions[right.nodeA];
      const rightB = nodePositions[right.nodeB];
      if (rightA === undefined || rightB === undefined) {
        continue;
      }

      if (areSegmentsCrossing(leftA, leftB, rightA, rightB)) {
        return { left, right };
      }
    }
  }

  return null;
}

export function findFirstSegmentNodeOverlapConflict(
  segments: Segment[],
  nodePositions: Record<NodeId, NodePosition>,
  nodeIds: NodeId[]
): { segment: Segment; nodeId: NodeId } | null {
  for (const segment of segments) {
    const start = nodePositions[segment.nodeA];
    const end = nodePositions[segment.nodeB];
    if (start === undefined || end === undefined) {
      continue;
    }

    for (const nodeId of nodeIds) {
      if (nodeId === segment.nodeA || nodeId === segment.nodeB) {
        continue;
      }

      const nodePosition = nodePositions[nodeId];
      if (nodePosition === undefined) {
        continue;
      }

      if (isPointOnSegment(start, end, nodePosition)) {
        return { segment, nodeId };
      }
    }
  }

  return null;
}

export function findFirstSegmentNodeClearanceConflict(
  segments: Segment[],
  nodePositions: Record<NodeId, NodePosition>,
  nodeIds: NodeId[],
  minClearance: number
): { segment: Segment; nodeId: NodeId } | null {
  for (const segment of segments) {
    const start = nodePositions[segment.nodeA];
    const end = nodePositions[segment.nodeB];
    if (start === undefined || end === undefined) {
      continue;
    }

    for (const nodeId of nodeIds) {
      if (nodeId === segment.nodeA || nodeId === segment.nodeB) {
        continue;
      }

      const nodePosition = nodePositions[nodeId];
      if (nodePosition === undefined) {
        continue;
      }

      if (distanceFromPointToSegment(nodePosition, start, end) < minClearance) {
        return { segment, nodeId };
      }
    }
  }

  return null;
}
