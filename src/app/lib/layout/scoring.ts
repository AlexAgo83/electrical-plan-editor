import type { NodeId, Segment } from "../../../core/entities";
import type { NodePosition } from "../../types/app-controller";
import {
  NETWORK_MIN_SEGMENT_NODE_CLEARANCE,
  areSegmentsCrossing,
  distanceFromPointToSegment,
  isPointOnSegment,
  segmentsShareEndpoint
} from "./geometry";
import type { VisualConflictRank } from "./types";

export function countSegmentCrossings(
  segments: Segment[],
  nodePositions: Record<NodeId, NodePosition>
): number {
  let crossings = 0;
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
        crossings += 1;
      }
    }
  }

  return crossings;
}

export function countSegmentNodeOverlaps(
  segments: Segment[],
  nodePositions: Record<NodeId, NodePosition>
): number {
  const nodeIds = Object.keys(nodePositions) as NodeId[];
  let overlaps = 0;
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
        overlaps += 1;
      }
    }
  }

  return overlaps;
}

export function countSegmentNodeClearanceViolations(
  segments: Segment[],
  nodePositions: Record<NodeId, NodePosition>,
  minClearance = NETWORK_MIN_SEGMENT_NODE_CLEARANCE
): number {
  const nodeIds = Object.keys(nodePositions) as NodeId[];
  let violations = 0;
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
        violations += 1;
      }
    }
  }

  return violations;
}

export function scoreVisualConflicts(
  segments: Segment[],
  nodePositions: Record<NodeId, NodePosition>
): number {
  const crossings = countSegmentCrossings(segments, nodePositions);
  const nodeOverlaps = countSegmentNodeOverlaps(segments, nodePositions);
  const nodeClearanceViolations = countSegmentNodeClearanceViolations(segments, nodePositions);
  return crossings * 400 + nodeOverlaps * 120 + nodeClearanceViolations * 24;
}

export function getVisualConflictRank(
  segments: Segment[],
  nodePositions: Record<NodeId, NodePosition>
): VisualConflictRank {
  const crossings = countSegmentCrossings(segments, nodePositions);
  const nodeOverlaps = countSegmentNodeOverlaps(segments, nodePositions);
  const clearanceViolations = countSegmentNodeClearanceViolations(segments, nodePositions);
  const score = crossings * 400 + nodeOverlaps * 120 + clearanceViolations * 24;
  return [nodeOverlaps, clearanceViolations, crossings, score];
}

export function isVisualConflictRankBetter(candidate: VisualConflictRank, current: VisualConflictRank): boolean {
  if (candidate[0] !== current[0]) {
    return candidate[0] < current[0];
  }

  if (candidate[1] !== current[1]) {
    return candidate[1] < current[1];
  }

  if (candidate[2] !== current[2]) {
    return candidate[2] < current[2];
  }

  return candidate[3] < current[3];
}
