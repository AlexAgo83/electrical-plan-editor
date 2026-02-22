import type { NodeId, Segment } from "../../../core/entities";
import type { NodePosition } from "../../types/app-controller";
import {
  areSegmentsCrossing,
  distanceFromPointToSegment,
  findFirstCrossingConflict,
  findFirstSegmentNodeClearanceConflict,
  findFirstSegmentNodeOverlapConflict,
  isPointOnSegment,
  NETWORK_MIN_SEGMENT_NODE_CLEARANCE
} from "./geometry";
import { listNudgeCandidates } from "./grid";
import {
  getVisualConflictRank,
  isVisualConflictRankBetter,
  scoreVisualConflicts
} from "./scoring";
import type { NodePositionMapOptions } from "./types";

function isRankImproved(
  currentConflictActive: boolean,
  currentScore: number,
  candidateConflictActive: boolean,
  candidateScore: number
): boolean {
  const currentRank = [currentConflictActive ? 1 : 0, currentScore] as const;
  const candidateRank = [candidateConflictActive ? 1 : 0, candidateScore] as const;
  return (
    candidateRank[0] < currentRank[0] ||
    (candidateRank[0] === currentRank[0] && candidateRank[1] < currentRank[1])
  );
}

function findBestMoveForNode(
  nodeId: NodeId,
  positions: Record<NodeId, NodePosition>,
  segments: Segment[],
  options: NodePositionMapOptions,
  isConflictActive: (trialPositions: Record<NodeId, NodePosition>) => boolean
): NodePosition | null {
  const source = positions[nodeId];
  if (source === undefined) {
    return null;
  }

  const sourceScore = scoreVisualConflicts(segments, positions);
  const sourceConflictActive = isConflictActive(positions);
  let best = source;
  let bestScore = sourceScore;
  let bestConflictActive = sourceConflictActive;
  for (const candidate of listNudgeCandidates(source, options)) {
    const trial = {
      ...positions,
      [nodeId]: candidate
    };
    const candidateScore = scoreVisualConflicts(segments, trial);
    const candidateConflictActive = isConflictActive(trial);
    if (isRankImproved(bestConflictActive, bestScore, candidateConflictActive, candidateScore)) {
      best = candidate;
      bestScore = candidateScore;
      bestConflictActive = candidateConflictActive;
    }
  }

  if (best.x === source.x && best.y === source.y) {
    return null;
  }

  return best;
}

export function resolveVisualOverlaps(
  initialPositions: Record<NodeId, NodePosition>,
  segments: Segment[],
  options: NodePositionMapOptions
): Record<NodeId, NodePosition> {
  const positions = { ...initialPositions };
  const maxIterations = 24;
  const nodeIds = Object.keys(positions).sort((left, right) => left.localeCompare(right)) as NodeId[];
  const orderedSegments = [...segments].sort((left, right) => left.id.localeCompare(right.id));
  const minClearance = NETWORK_MIN_SEGMENT_NODE_CLEARANCE;
  let bestPositions = { ...positions };
  let bestRank = getVisualConflictRank(orderedSegments, positions);
  const seenStates = new Set<string>();

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const stateKey = nodeIds
      .map((nodeId) => {
        const position = positions[nodeId];
        if (position === undefined) {
          return `${nodeId}:?`;
        }
        return `${nodeId}:${position.x},${position.y}`;
      })
      .join("|");
    if (seenStates.has(stateKey)) {
      break;
    }
    seenStates.add(stateKey);

    const currentRank = getVisualConflictRank(orderedSegments, positions);
    if (isVisualConflictRankBetter(currentRank, bestRank)) {
      bestRank = currentRank;
      bestPositions = { ...positions };
    }

    let moved = false;

    const crossingConflict = findFirstCrossingConflict(orderedSegments, positions);
    if (crossingConflict !== null) {
      const movableNodeIds: NodeId[] = [
        crossingConflict.left.nodeA,
        crossingConflict.left.nodeB,
        crossingConflict.right.nodeA,
        crossingConflict.right.nodeB
      ].sort((left, right) => left.localeCompare(right));

      let bestNodeId: NodeId | null = null;
      let bestCandidate: NodePosition | null = null;
      let bestScore = Number.POSITIVE_INFINITY;
      for (const nodeId of movableNodeIds) {
        const candidate = findBestMoveForNode(nodeId, positions, orderedSegments, options, (trial) => {
          const leftA = trial[crossingConflict.left.nodeA];
          const leftB = trial[crossingConflict.left.nodeB];
          const rightA = trial[crossingConflict.right.nodeA];
          const rightB = trial[crossingConflict.right.nodeB];
          if (leftA === undefined || leftB === undefined || rightA === undefined || rightB === undefined) {
            return true;
          }

          return areSegmentsCrossing(leftA, leftB, rightA, rightB);
        });
        if (candidate === null) {
          continue;
        }

        const trial = { ...positions, [nodeId]: candidate };
        const trialScore = scoreVisualConflicts(orderedSegments, trial);
        if (
          trialScore < bestScore ||
          (trialScore === bestScore && (bestNodeId === null || nodeId.localeCompare(bestNodeId) < 0))
        ) {
          bestNodeId = nodeId;
          bestCandidate = candidate;
          bestScore = trialScore;
        }
      }

      if (bestNodeId !== null && bestCandidate !== null) {
        positions[bestNodeId] = bestCandidate;
        moved = true;
      }
    }

    if (moved) {
      continue;
    }

    const overlapConflict = findFirstSegmentNodeOverlapConflict(orderedSegments, positions, nodeIds);
    if (overlapConflict !== null) {
      const bestMove = findBestMoveForNode(overlapConflict.nodeId, positions, orderedSegments, options, (trial) => {
        const trialStart = trial[overlapConflict.segment.nodeA];
        const trialEnd = trial[overlapConflict.segment.nodeB];
        const trialNode = trial[overlapConflict.nodeId];
        if (trialStart === undefined || trialEnd === undefined || trialNode === undefined) {
          return true;
        }

        return isPointOnSegment(trialStart, trialEnd, trialNode);
      });
      if (bestMove !== null) {
        positions[overlapConflict.nodeId] = bestMove;
        moved = true;
      }
    }

    if (moved) {
      continue;
    }

    const clearanceConflict = findFirstSegmentNodeClearanceConflict(orderedSegments, positions, nodeIds, minClearance);
    if (clearanceConflict !== null) {
      const movableNodeIds: NodeId[] = [
        clearanceConflict.nodeId,
        clearanceConflict.segment.nodeA,
        clearanceConflict.segment.nodeB
      ]
        .sort((left, right) => left.localeCompare(right))
        .filter((nodeId, index, all) => all.indexOf(nodeId) === index);

      let bestNodeId: NodeId | null = null;
      let bestCandidate: NodePosition | null = null;
      let bestScore = Number.POSITIVE_INFINITY;
      for (const nodeId of movableNodeIds) {
        const candidate = findBestMoveForNode(nodeId, positions, orderedSegments, options, (trial) => {
          const trialStart = trial[clearanceConflict.segment.nodeA];
          const trialEnd = trial[clearanceConflict.segment.nodeB];
          const trialNode = trial[clearanceConflict.nodeId];
          if (trialStart === undefined || trialEnd === undefined || trialNode === undefined) {
            return true;
          }

          return distanceFromPointToSegment(trialNode, trialStart, trialEnd) < minClearance;
        });
        if (candidate === null) {
          continue;
        }

        const trial = { ...positions, [nodeId]: candidate };
        const trialScore = scoreVisualConflicts(orderedSegments, trial);
        if (
          trialScore < bestScore ||
          (trialScore === bestScore && (bestNodeId === null || nodeId.localeCompare(bestNodeId) < 0))
        ) {
          bestNodeId = nodeId;
          bestCandidate = candidate;
          bestScore = trialScore;
        }
      }

      if (bestNodeId !== null && bestCandidate !== null) {
        positions[bestNodeId] = bestCandidate;
        moved = true;
      }
    }

    if (!moved) {
      break;
    }
  }

  return bestPositions;
}
