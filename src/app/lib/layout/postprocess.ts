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
  isVisualConflictRankBetter
} from "./scoring";
import type { NodePositionMapOptions, VisualConflictRank } from "./types";

interface UntanglePassConfig {
  maxIterations: number;
  nudgeMultipliers: readonly number[];
  diagonalDepth: number;
}

const STANDARD_PASS_CONFIG: UntanglePassConfig = {
  maxIterations: 40,
  nudgeMultipliers: [1, -1, 2, -2, 3, -3, 4, -4],
  diagonalDepth: 6
};

const AGGRESSIVE_PASS_CONFIG: UntanglePassConfig = {
  maxIterations: 24,
  nudgeMultipliers: [2, -2, 4, -4, 6, -6, 8, -8, 10, -10],
  diagonalDepth: 8
};

function hasVisualConflicts(rank: VisualConflictRank): boolean {
  return rank[0] > 0 || rank[1] > 0 || rank[2] > 0;
}

function isRankImproved(
  currentConflictActive: boolean,
  currentVisualRank: VisualConflictRank,
  candidateConflictActive: boolean,
  candidateVisualRank: VisualConflictRank
): boolean {
  if (candidateConflictActive !== currentConflictActive) {
    return !candidateConflictActive;
  }

  return isVisualConflictRankBetter(candidateVisualRank, currentVisualRank);
}

function findBestMoveForNode(
  nodeId: NodeId,
  positions: Record<NodeId, NodePosition>,
  segments: Segment[],
  options: NodePositionMapOptions,
  passConfig: UntanglePassConfig,
  isConflictActive: (trialPositions: Record<NodeId, NodePosition>) => boolean
): NodePosition | null {
  const source = positions[nodeId];
  if (source === undefined) {
    return null;
  }

  const sourceRank = getVisualConflictRank(segments, positions);
  const sourceConflictActive = isConflictActive(positions);
  let best = source;
  let bestRank = sourceRank;
  let bestConflictActive = sourceConflictActive;

  for (const candidate of listNudgeCandidates(source, options, {
    multipliers: passConfig.nudgeMultipliers,
    diagonalDepth: passConfig.diagonalDepth
  })) {
    const trial = {
      ...positions,
      [nodeId]: candidate
    };
    const candidateRank = getVisualConflictRank(segments, trial);
    const candidateConflictActive = isConflictActive(trial);
    if (isRankImproved(bestConflictActive, bestRank, candidateConflictActive, candidateRank)) {
      best = candidate;
      bestRank = candidateRank;
      bestConflictActive = candidateConflictActive;
    }
  }

  if (best.x === source.x && best.y === source.y) {
    return null;
  }

  return best;
}

function buildStateKey(nodeIds: NodeId[], positions: Record<NodeId, NodePosition>): string {
  return nodeIds
    .map((nodeId) => {
      const position = positions[nodeId];
      if (position === undefined) {
        return `${nodeId}:?`;
      }
      return `${nodeId}:${position.x},${position.y}`;
    })
    .join("|");
}

function runUntanglePass(
  initialPositions: Record<NodeId, NodePosition>,
  orderedSegments: Segment[],
  nodeIds: NodeId[],
  options: NodePositionMapOptions,
  passConfig: UntanglePassConfig,
  minClearance: number
): { positions: Record<NodeId, NodePosition>; rank: VisualConflictRank } {
  const positions = { ...initialPositions };
  let bestPositions = { ...positions };
  let bestRank = getVisualConflictRank(orderedSegments, positions);
  const seenStates = new Set<string>();

  for (let iteration = 0; iteration < passConfig.maxIterations; iteration += 1) {
    const stateKey = buildStateKey(nodeIds, positions);
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
      let bestCandidateRank: VisualConflictRank | null = null;
      for (const nodeId of movableNodeIds) {
        const candidate = findBestMoveForNode(
          nodeId,
          positions,
          orderedSegments,
          options,
          passConfig,
          (trial) => {
            const leftA = trial[crossingConflict.left.nodeA];
            const leftB = trial[crossingConflict.left.nodeB];
            const rightA = trial[crossingConflict.right.nodeA];
            const rightB = trial[crossingConflict.right.nodeB];
            if (leftA === undefined || leftB === undefined || rightA === undefined || rightB === undefined) {
              return true;
            }

            return areSegmentsCrossing(leftA, leftB, rightA, rightB);
          }
        );
        if (candidate === null) {
          continue;
        }

        const trial = { ...positions, [nodeId]: candidate };
        const trialRank = getVisualConflictRank(orderedSegments, trial);
        if (
          bestCandidateRank === null ||
          isVisualConflictRankBetter(trialRank, bestCandidateRank) ||
          (!isVisualConflictRankBetter(bestCandidateRank, trialRank) &&
            (bestNodeId === null || nodeId.localeCompare(bestNodeId) < 0))
        ) {
          bestNodeId = nodeId;
          bestCandidate = candidate;
          bestCandidateRank = trialRank;
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
      const bestMove = findBestMoveForNode(
        overlapConflict.nodeId,
        positions,
        orderedSegments,
        options,
        passConfig,
        (trial) => {
          const trialStart = trial[overlapConflict.segment.nodeA];
          const trialEnd = trial[overlapConflict.segment.nodeB];
          const trialNode = trial[overlapConflict.nodeId];
          if (trialStart === undefined || trialEnd === undefined || trialNode === undefined) {
            return true;
          }

          return isPointOnSegment(trialStart, trialEnd, trialNode);
        }
      );
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
      let bestCandidateRank: VisualConflictRank | null = null;
      for (const nodeId of movableNodeIds) {
        const candidate = findBestMoveForNode(
          nodeId,
          positions,
          orderedSegments,
          options,
          passConfig,
          (trial) => {
            const trialStart = trial[clearanceConflict.segment.nodeA];
            const trialEnd = trial[clearanceConflict.segment.nodeB];
            const trialNode = trial[clearanceConflict.nodeId];
            if (trialStart === undefined || trialEnd === undefined || trialNode === undefined) {
              return true;
            }

            return distanceFromPointToSegment(trialNode, trialStart, trialEnd) < minClearance;
          }
        );
        if (candidate === null) {
          continue;
        }

        const trial = { ...positions, [nodeId]: candidate };
        const trialRank = getVisualConflictRank(orderedSegments, trial);
        if (
          bestCandidateRank === null ||
          isVisualConflictRankBetter(trialRank, bestCandidateRank) ||
          (!isVisualConflictRankBetter(bestCandidateRank, trialRank) &&
            (bestNodeId === null || nodeId.localeCompare(bestNodeId) < 0))
        ) {
          bestNodeId = nodeId;
          bestCandidate = candidate;
          bestCandidateRank = trialRank;
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

  return {
    positions: bestPositions,
    rank: bestRank
  };
}

export function resolveVisualOverlaps(
  initialPositions: Record<NodeId, NodePosition>,
  segments: Segment[],
  options: NodePositionMapOptions
): Record<NodeId, NodePosition> {
  const nodeIds = Object.keys(initialPositions).sort((left, right) => left.localeCompare(right)) as NodeId[];
  const orderedSegments = [...segments].sort((left, right) => left.id.localeCompare(right.id));
  const minClearance = NETWORK_MIN_SEGMENT_NODE_CLEARANCE;

  const baselinePass = runUntanglePass(
    initialPositions,
    orderedSegments,
    nodeIds,
    options,
    STANDARD_PASS_CONFIG,
    minClearance
  );
  if (!hasVisualConflicts(baselinePass.rank)) {
    return baselinePass.positions;
  }

  const aggressivePass = runUntanglePass(
    baselinePass.positions,
    orderedSegments,
    nodeIds,
    options,
    AGGRESSIVE_PASS_CONFIG,
    minClearance
  );

  return isVisualConflictRankBetter(aggressivePass.rank, baselinePass.rank)
    ? aggressivePass.positions
    : baselinePass.positions;
}
