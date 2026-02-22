import type {
  NetworkNode,
  NodeId,
  Segment
} from "../../core/entities";
import type { NodePosition } from "../types/app-controller";
import {
  NETWORK_GRID_STEP,
  NETWORK_VIEW_HEIGHT,
  NETWORK_VIEW_WIDTH,
  clamp,
  snapToGrid
} from "./app-utils-shared";

const NETWORK_NODE_VISUAL_RADIUS = 17;
const NETWORK_SEGMENT_VISUAL_WIDTH = 3;
const NETWORK_MIN_SEGMENT_NODE_CLEARANCE = NETWORK_NODE_VISUAL_RADIUS + NETWORK_SEGMENT_VISUAL_WIDTH;

interface NodePositionMapOptions {
  snapToGrid?: boolean;
  gridStep?: number;
}

type LocalLayout = {
  positions: Record<NodeId, NodePosition>;
  width: number;
  height: number;
};

function buildAdjacency(nodes: NetworkNode[], segments: Segment[]): Map<NodeId, Set<NodeId>> {
  const adjacency = new Map<NodeId, Set<NodeId>>();
  const nodeIds = new Set(nodes.map((node) => node.id));
  for (const node of nodes) {
    adjacency.set(node.id, new Set<NodeId>());
  }

  for (const segment of segments) {
    if (!nodeIds.has(segment.nodeA) || !nodeIds.has(segment.nodeB) || segment.nodeA === segment.nodeB) {
      continue;
    }

    adjacency.get(segment.nodeA)?.add(segment.nodeB);
    adjacency.get(segment.nodeB)?.add(segment.nodeA);
  }

  return adjacency;
}

function getConnectedComponents(adjacency: Map<NodeId, Set<NodeId>>): NodeId[][] {
  const unvisited = new Set([...adjacency.keys()].sort((left, right) => left.localeCompare(right)));
  const components: NodeId[][] = [];

  while (unvisited.size > 0) {
    const root = unvisited.values().next().value;
    if (root === undefined) {
      break;
    }

    const stack = [root];
    unvisited.delete(root);
    const component: NodeId[] = [];
    while (stack.length > 0) {
      const nodeId = stack.pop();
      if (nodeId === undefined) {
        continue;
      }

      component.push(nodeId);
      const neighbors = adjacency.get(nodeId);
      if (neighbors === undefined) {
        continue;
      }

      for (const neighbor of [...neighbors].sort((left, right) => left.localeCompare(right))) {
        if (!unvisited.has(neighbor)) {
          continue;
        }

        unvisited.delete(neighbor);
        stack.push(neighbor);
      }
    }

    components.push(component.sort((left, right) => left.localeCompare(right)));
  }

  return components;
}

function createComponentLayout(componentNodeIds: NodeId[], adjacency: Map<NodeId, Set<NodeId>>): LocalLayout {
  const horizontalSpacing = 120;
  const verticalSpacing = 96;
  const nodePadding = 24;

  if (componentNodeIds.length === 0) {
    return {
      positions: {} as Record<NodeId, NodePosition>,
      width: 0,
      height: 0
    };
  }

  if (componentNodeIds.length === 1) {
    const nodeId = componentNodeIds[0] as NodeId;
    return {
      positions: {
        [nodeId]: { x: nodePadding, y: nodePadding }
      } as Record<NodeId, NodePosition>,
      width: nodePadding * 2,
      height: nodePadding * 2
    };
  }

  const root = [...componentNodeIds].sort((left, right) => {
    const leftDegree = adjacency.get(left)?.size ?? 0;
    const rightDegree = adjacency.get(right)?.size ?? 0;
    if (leftDegree !== rightDegree) {
      return rightDegree - leftDegree;
    }

    return left.localeCompare(right);
  })[0];
  if (root === undefined) {
    return {
      positions: {} as Record<NodeId, NodePosition>,
      width: 0,
      height: 0
    };
  }

  const nodeLayer = new Map<NodeId, number>();
  const layered = [] as NodeId[][];
  const queue: NodeId[] = [root];
  nodeLayer.set(root, 0);
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      continue;
    }

    const layerIndex = nodeLayer.get(current) ?? 0;
    if (layered[layerIndex] === undefined) {
      layered[layerIndex] = [];
    }
    layered[layerIndex]?.push(current);

    for (const neighbor of [...(adjacency.get(current) ?? [])].sort((left, right) => left.localeCompare(right))) {
      if (nodeLayer.has(neighbor)) {
        continue;
      }

      nodeLayer.set(neighbor, layerIndex + 1);
      queue.push(neighbor);
    }
  }

  for (const nodeId of componentNodeIds) {
    if (nodeLayer.has(nodeId)) {
      continue;
    }

    const fallbackLayer = layered.length;
    nodeLayer.set(nodeId, fallbackLayer);
    if (layered[fallbackLayer] === undefined) {
      layered[fallbackLayer] = [];
    }
    layered[fallbackLayer]?.push(nodeId);
  }

  const layers = layered
    .map((layer) => (layer === undefined ? [] : [...layer].sort((left, right) => left.localeCompare(right))))
    .filter((layer) => layer.length > 0);

  for (let iteration = 0; iteration < 4; iteration += 1) {
    for (let layerIndex = 1; layerIndex < layers.length; layerIndex += 1) {
      const previousLayer = layers[layerIndex - 1];
      const currentLayer = layers[layerIndex];
      if (previousLayer === undefined || currentLayer === undefined) {
        continue;
      }

      const previousIndex = new Map(previousLayer.map((nodeId, index) => [nodeId, index]));
      currentLayer.sort((left, right) => {
        const leftNeighbors = [...(adjacency.get(left) ?? [])].filter((nodeId) => previousIndex.has(nodeId));
        const rightNeighbors = [...(adjacency.get(right) ?? [])].filter((nodeId) => previousIndex.has(nodeId));
        const leftBarycenter =
          leftNeighbors.length === 0
            ? Number.POSITIVE_INFINITY
            : leftNeighbors.reduce((sum, nodeId) => sum + (previousIndex.get(nodeId) ?? 0), 0) / leftNeighbors.length;
        const rightBarycenter =
          rightNeighbors.length === 0
            ? Number.POSITIVE_INFINITY
            : rightNeighbors.reduce((sum, nodeId) => sum + (previousIndex.get(nodeId) ?? 0), 0) / rightNeighbors.length;
        if (leftBarycenter !== rightBarycenter) {
          return leftBarycenter - rightBarycenter;
        }

        return left.localeCompare(right);
      });
    }

    for (let layerIndex = layers.length - 2; layerIndex >= 0; layerIndex -= 1) {
      const nextLayer = layers[layerIndex + 1];
      const currentLayer = layers[layerIndex];
      if (nextLayer === undefined || currentLayer === undefined) {
        continue;
      }

      const nextIndex = new Map(nextLayer.map((nodeId, index) => [nodeId, index]));
      currentLayer.sort((left, right) => {
        const leftNeighbors = [...(adjacency.get(left) ?? [])].filter((nodeId) => nextIndex.has(nodeId));
        const rightNeighbors = [...(adjacency.get(right) ?? [])].filter((nodeId) => nextIndex.has(nodeId));
        const leftBarycenter =
          leftNeighbors.length === 0
            ? Number.POSITIVE_INFINITY
            : leftNeighbors.reduce((sum, nodeId) => sum + (nextIndex.get(nodeId) ?? 0), 0) / leftNeighbors.length;
        const rightBarycenter =
          rightNeighbors.length === 0
            ? Number.POSITIVE_INFINITY
            : rightNeighbors.reduce((sum, nodeId) => sum + (nextIndex.get(nodeId) ?? 0), 0) / rightNeighbors.length;
        if (leftBarycenter !== rightBarycenter) {
          return leftBarycenter - rightBarycenter;
        }

        return left.localeCompare(right);
      });
    }
  }

  const maxLayerSize = layers.reduce((max, layer) => Math.max(max, layer.length), 1);
  const positions = {} as Record<NodeId, NodePosition>;
  for (let layerIndex = 0; layerIndex < layers.length; layerIndex += 1) {
    const layer = layers[layerIndex] ?? [];
    const layerHeight = (layer.length - 1) * verticalSpacing;
    for (let index = 0; index < layer.length; index += 1) {
      const nodeId = layer[index];
      if (nodeId === undefined) {
        continue;
      }

      positions[nodeId] = {
        x: nodePadding + layerIndex * horizontalSpacing,
        y: nodePadding + index * verticalSpacing - layerHeight / 2 + ((maxLayerSize - 1) * verticalSpacing) / 2
      };
    }
  }

  return {
    positions,
    width: nodePadding * 2 + Math.max(0, (layers.length - 1) * horizontalSpacing),
    height: nodePadding * 2 + Math.max(0, (maxLayerSize - 1) * verticalSpacing)
  };
}

function segmentsShareEndpoint(left: Segment, right: Segment): boolean {
  return (
    left.nodeA === right.nodeA ||
    left.nodeA === right.nodeB ||
    left.nodeB === right.nodeA ||
    left.nodeB === right.nodeB
  );
}

function orientation(a: NodePosition, b: NodePosition, c: NodePosition): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function areSegmentsCrossing(
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

function isPointOnSegment(start: NodePosition, end: NodePosition, point: NodePosition, epsilon = 0.01): boolean {
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

function distanceBetweenPoints(a: NodePosition, b: NodePosition): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distanceFromPointToSegment(point: NodePosition, start: NodePosition, end: NodePosition): number {
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

function scoreVisualConflicts(
  segments: Segment[],
  nodePositions: Record<NodeId, NodePosition>
): number {
  const crossings = countSegmentCrossings(segments, nodePositions);
  const nodeOverlaps = countSegmentNodeOverlaps(segments, nodePositions);
  const nodeClearanceViolations = countSegmentNodeClearanceViolations(segments, nodePositions);
  return crossings * 400 + nodeOverlaps * 120 + nodeClearanceViolations * 24;
}

type VisualConflictRank = readonly [nodeOverlaps: number, clearanceViolations: number, crossings: number, score: number];

function getVisualConflictRank(
  segments: Segment[],
  nodePositions: Record<NodeId, NodePosition>
): VisualConflictRank {
  const crossings = countSegmentCrossings(segments, nodePositions);
  const nodeOverlaps = countSegmentNodeOverlaps(segments, nodePositions);
  const clearanceViolations = countSegmentNodeClearanceViolations(segments, nodePositions);
  const score = crossings * 400 + nodeOverlaps * 120 + clearanceViolations * 24;
  return [nodeOverlaps, clearanceViolations, crossings, score];
}

function isVisualConflictRankBetter(candidate: VisualConflictRank, current: VisualConflictRank): boolean {
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

function listNudgeCandidates(
  source: NodePosition,
  options: NodePositionMapOptions
): NodePosition[] {
  const shouldSnapToGrid = options.snapToGrid ?? false;
  const gridStep = options.gridStep ?? NETWORK_GRID_STEP;
  const nudgeStep = shouldSnapToGrid ? gridStep : 12;
  const offsets = [1, -1, 2, -2, 3, -3];
  const rawCandidates = [] as NodePosition[];
  for (const offset of offsets) {
    rawCandidates.push({ x: source.x + nudgeStep * offset, y: source.y });
    rawCandidates.push({ x: source.x, y: source.y + nudgeStep * offset });
  }
  for (const xOffset of offsets.slice(0, 4)) {
    for (const yOffset of offsets.slice(0, 4)) {
      if (Math.abs(xOffset) !== Math.abs(yOffset)) {
        continue;
      }

      rawCandidates.push({
        x: source.x + nudgeStep * xOffset,
        y: source.y + nudgeStep * yOffset
      });
    }
  }

  return rawCandidates
    .map((candidate) => {
      const rawX = shouldSnapToGrid ? snapToGrid(candidate.x, gridStep) : candidate.x;
      const rawY = shouldSnapToGrid ? snapToGrid(candidate.y, gridStep) : candidate.y;
      return {
        x: clamp(rawX, 20, NETWORK_VIEW_WIDTH - 20),
        y: clamp(rawY, 20, NETWORK_VIEW_HEIGHT - 20)
      };
    })
    .filter((candidate, index, all) => {
      if (candidate.x === source.x && candidate.y === source.y) {
        return false;
      }
      return all.findIndex((entry) => entry.x === candidate.x && entry.y === candidate.y) === index;
    });
}

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

function findFirstCrossingConflict(
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

function findFirstSegmentNodeOverlapConflict(
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

function findFirstSegmentNodeClearanceConflict(
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

function resolveVisualOverlaps(
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
        if (trialScore < bestScore || (trialScore === bestScore && (bestNodeId === null || nodeId.localeCompare(bestNodeId) < 0))) {
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
        if (trialScore < bestScore || (trialScore === bestScore && (bestNodeId === null || nodeId.localeCompare(bestNodeId) < 0))) {
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

export function createNodePositionMap(
  nodes: NetworkNode[],
  segments: Segment[] = [],
  options: NodePositionMapOptions = {}
): Record<NodeId, NodePosition> {
  const shouldSnapToGrid = options.snapToGrid ?? false;
  const gridStep = options.gridStep ?? NETWORK_GRID_STEP;
  const positions = {} as Record<NodeId, NodePosition>;
  if (nodes.length === 0) {
    return positions;
  }

  const adjacency = buildAdjacency(nodes, segments);
  const components = getConnectedComponents(adjacency).sort((left, right) => {
    const leftFirst = left[0] ?? "";
    const rightFirst = right[0] ?? "";
    return leftFirst.localeCompare(rightFirst);
  });
  const componentGapX = 72;
  const componentGapY = 72;
  const outerPadding = 32;
  let cursorX = outerPadding;
  let cursorY = outerPadding;
  let rowHeight = 0;

  for (const componentNodeIds of components) {
    const localLayout = createComponentLayout(componentNodeIds, adjacency);
    const layoutWidth = Math.max(localLayout.width, 1);
    const layoutHeight = Math.max(localLayout.height, 1);
    if (cursorX > outerPadding && cursorX + layoutWidth > NETWORK_VIEW_WIDTH - outerPadding) {
      cursorX = outerPadding;
      cursorY += rowHeight + componentGapY;
      rowHeight = 0;
    }

    for (const nodeId of componentNodeIds) {
      const localPosition = localLayout.positions[nodeId];
      if (localPosition === undefined) {
        continue;
      }

      positions[nodeId] = {
        x: cursorX + localPosition.x,
        y: cursorY + localPosition.y
      };
    }

    cursorX += layoutWidth + componentGapX;
    rowHeight = Math.max(rowHeight, layoutHeight);
  }

  const allNodeIds = nodes.map((node) => node.id);
  const availablePositions = allNodeIds
    .map((nodeId) => positions[nodeId])
    .filter((position): position is NodePosition => position !== undefined);
  if (availablePositions.length === 0) {
    return positions;
  }

  const first = availablePositions[0];
  if (first === undefined) {
    return positions;
  }

  let minX = first.x;
  let maxX = first.x;
  let minY = first.y;
  let maxY = first.y;
  for (const position of availablePositions.slice(1)) {
    minX = Math.min(minX, position.x);
    maxX = Math.max(maxX, position.x);
    minY = Math.min(minY, position.y);
    maxY = Math.max(maxY, position.y);
  }

  const contentWidth = Math.max(1, maxX - minX);
  const contentHeight = Math.max(1, maxY - minY);
  const targetPadding = 24;
  const maxWidth = Math.max(1, NETWORK_VIEW_WIDTH - targetPadding * 2);
  const maxHeight = Math.max(1, NETWORK_VIEW_HEIGHT - targetPadding * 2);
  const fitScale = Math.min(1, maxWidth / contentWidth, maxHeight / contentHeight);
  const fittedWidth = contentWidth * fitScale;
  const fittedHeight = contentHeight * fitScale;
  const offsetX = (NETWORK_VIEW_WIDTH - fittedWidth) / 2;
  const offsetY = (NETWORK_VIEW_HEIGHT - fittedHeight) / 2;

  for (const nodeId of allNodeIds) {
    const position = positions[nodeId];
    if (position === undefined) {
      continue;
    }

    const rawX = offsetX + (position.x - minX) * fitScale;
    const rawY = offsetY + (position.y - minY) * fitScale;
    const maybeSnappedX = shouldSnapToGrid ? snapToGrid(rawX, gridStep) : rawX;
    const maybeSnappedY = shouldSnapToGrid ? snapToGrid(rawY, gridStep) : rawY;
    positions[nodeId] = {
      x: clamp(maybeSnappedX, 20, NETWORK_VIEW_WIDTH - 20),
      y: clamp(maybeSnappedY, 20, NETWORK_VIEW_HEIGHT - 20)
    };
  }

  return resolveVisualOverlaps(positions, segments, options);
}
