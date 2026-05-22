import type { NodeId, Segment, SegmentId, SpliceId, Wire } from "../core/entities";
import { resolveSplicePortMode } from "../core/splicePortMode";
import type { AppState } from "./types";
import { recomputeWireRouteAndDirectionalEndpoints } from "./reducer/helpers/wireTransitions";

export interface SplicePlacementMetrics {
  copperVolumeMm3: number;
  leftSectionMm2: number;
  rightSectionMm2: number;
  balanceRatioPercent: number | null;
}

export interface SplicePlacementSuggestion {
  spliceId: SpliceId;
  spliceNodeId: NodeId;
  segmentLengths: Record<SegmentId, number>;
  segments: Record<SegmentId, Segment>;
  removedSegmentIds: SegmentId[];
  targetSegmentId: SegmentId;
  spliceNodePosition: { x: number; y: number } | null;
  current: SplicePlacementMetrics;
  suggested: SplicePlacementMetrics;
  copperVolumeDeltaMm3: number;
  copperVolumeDeltaPercent: number;
  balanceLimitPercent: number;
  warning: string | null;
}

type ConnectedSegment = Segment & { otherNodeId: NodeId };

function findSpliceNodeId(state: AppState, spliceId: SpliceId): NodeId | null {
  for (const nodeId of state.nodes.allIds) {
    const node = state.nodes.byId[nodeId];
    if (node?.kind === "splice" && node.spliceId === spliceId) {
      return nodeId;
    }
  }

  return null;
}

function getConnectedSegments(state: AppState, nodeId: NodeId): ConnectedSegment[] {
  const segments: ConnectedSegment[] = [];
  for (const segmentId of state.segments.allIds) {
    const segment = state.segments.byId[segmentId];
    if (segment === undefined) {
      continue;
    }
    if (segment.nodeA === nodeId) {
      segments.push({ ...segment, otherNodeId: segment.nodeB });
    } else if (segment.nodeB === nodeId) {
      segments.push({ ...segment, otherNodeId: segment.nodeA });
    }
  }

  return segments.sort((left, right) => left.id.localeCompare(right.id));
}

function getConnectedWires(state: AppState, spliceId: SpliceId): Wire[] {
  return state.wires.allIds
    .map((wireId) => state.wires.byId[wireId])
    .filter((wire): wire is Wire => {
      if (wire === undefined) {
        return false;
      }
      return (
        (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === spliceId) ||
        (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === spliceId)
      );
    });
}

function computeMetrics(wires: Wire[], spliceId: SpliceId): SplicePlacementMetrics {
  let copperVolumeMm3 = 0;
  let leftSectionMm2 = 0;
  let rightSectionMm2 = 0;

  for (const wire of wires) {
    copperVolumeMm3 += wire.sectionMm2 * wire.lengthMm;
    const endpoint =
      wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === spliceId
        ? wire.endpointA
        : wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === spliceId
          ? wire.endpointB
          : null;
    if (endpoint === null) {
      continue;
    }
    const side = endpoint.spliceSideOverride ?? (endpoint.portIndex === 2 ? "R" : "L");
    if (side === "L") {
      leftSectionMm2 += wire.sectionMm2;
    } else {
      rightSectionMm2 += wire.sectionMm2;
    }
  }

  const balanceRatioPercent =
    leftSectionMm2 > 0 && rightSectionMm2 > 0
      ? (Math.max(leftSectionMm2, rightSectionMm2) / Math.min(leftSectionMm2, rightSectionMm2)) * 100
      : null;

  return {
    copperVolumeMm3,
    leftSectionMm2,
    rightSectionMm2,
    balanceRatioPercent
  };
}

function toSegment(segment: ConnectedSegment): Segment {
  return {
    id: segment.id,
    nodeA: segment.nodeA,
    nodeB: segment.nodeB,
    lengthMm: segment.lengthMm,
    ...(segment.subNetworkTag === undefined ? {} : { subNetworkTag: segment.subNetworkTag })
  };
}

function getMergedSubNetworkTag(leftSegment: ConnectedSegment, rightSegment: ConnectedSegment): string | undefined {
  return leftSegment.subNetworkTag === rightSegment.subNetworkTag ? leftSegment.subNetworkTag : undefined;
}

function buildCandidateTopology(
  state: AppState,
  leftSegment: ConnectedSegment,
  rightSegment: ConnectedSegment,
  spliceNodeId: NodeId,
  targetSegment: Segment,
  leftLengthMm: number,
  rightLengthMm: number
): {
  state: AppState;
  segments: Record<SegmentId, Segment>;
  removedSegmentIds: SegmentId[];
} {
  const mergedSegment: Segment = {
    id: leftSegment.id,
    nodeA: leftSegment.otherNodeId,
    nodeB: rightSegment.otherNodeId,
    lengthMm: leftSegment.lengthMm + rightSegment.lengthMm,
    ...(getMergedSubNetworkTag(leftSegment, rightSegment) === undefined
      ? {}
      : { subNetworkTag: getMergedSubNetworkTag(leftSegment, rightSegment) })
  };
  const firstSplitSegment: Segment = {
    id: targetSegment.id,
    nodeA: targetSegment.nodeA,
    nodeB: spliceNodeId,
    lengthMm: leftLengthMm,
    ...(targetSegment.subNetworkTag === undefined ? {} : { subNetworkTag: targetSegment.subNetworkTag })
  };
  const secondSplitSegment: Segment = {
    id: rightSegment.id,
    nodeA: spliceNodeId,
    nodeB: targetSegment.nodeB,
    lengthMm: rightLengthMm,
    ...(targetSegment.subNetworkTag === undefined ? {} : { subNetworkTag: targetSegment.subNetworkTag })
  };
  const nextSegmentsById = { ...state.segments.byId };
  delete nextSegmentsById[rightSegment.id];
  nextSegmentsById[leftSegment.id] = mergedSegment;
  nextSegmentsById[targetSegment.id] = firstSplitSegment;
  nextSegmentsById[rightSegment.id] = secondSplitSegment;

  return {
    state: {
      ...state,
      segments: {
        ...state.segments,
        allIds: state.segments.allIds.includes(rightSegment.id)
          ? state.segments.allIds
          : [...state.segments.allIds, rightSegment.id].sort((left, right) => left.localeCompare(right)),
        byId: nextSegmentsById
      }
    },
    segments: {
      [leftSegment.id]: nextSegmentsById[leftSegment.id] as Segment,
      [targetSegment.id]: nextSegmentsById[targetSegment.id] as Segment,
      [rightSegment.id]: nextSegmentsById[rightSegment.id] as Segment
    },
    removedSegmentIds: []
  };
}

function buildRemovedSpliceSegments(
  state: AppState,
  leftSegment: ConnectedSegment,
  rightSegment: ConnectedSegment
): Segment[] {
  const mergedSegment: Segment = {
    id: leftSegment.id,
    nodeA: leftSegment.otherNodeId,
    nodeB: rightSegment.otherNodeId,
    lengthMm: leftSegment.lengthMm + rightSegment.lengthMm,
    ...(getMergedSubNetworkTag(leftSegment, rightSegment) === undefined
      ? {}
      : { subNetworkTag: getMergedSubNetworkTag(leftSegment, rightSegment) })
  };

  return state.segments.allIds
    .map((segmentId) => state.segments.byId[segmentId])
    .filter((segment): segment is Segment => segment !== undefined)
    .filter((segment) => segment.id !== leftSegment.id && segment.id !== rightSegment.id)
    .concat(mergedSegment)
    .sort((left, right) => left.id.localeCompare(right.id));
}

function isOriginalMergedSegment(targetSegment: Segment, leftSegment: ConnectedSegment): boolean {
  return targetSegment.id === leftSegment.id;
}

function buildCandidateState(
  state: AppState,
  leftSegment: ConnectedSegment,
  rightSegment: ConnectedSegment,
  spliceNodeId: NodeId,
  targetSegment: Segment,
  leftLengthMm: number,
  rightLengthMm: number
): {
  state: AppState;
  segments: Record<SegmentId, Segment>;
  removedSegmentIds: SegmentId[];
} {
  if (isOriginalMergedSegment(targetSegment, leftSegment)) {
    const leftSegmentValue: Segment = {
      ...toSegment(leftSegment),
      nodeA: targetSegment.nodeA,
      nodeB: spliceNodeId,
      lengthMm: leftLengthMm
    };
    const rightSegmentValue: Segment = {
      ...toSegment(rightSegment),
      nodeA: spliceNodeId,
      nodeB: targetSegment.nodeB,
      lengthMm: rightLengthMm
    };
    const nextSegmentsById = {
      ...state.segments.byId,
      [leftSegment.id]: leftSegmentValue,
      [rightSegment.id]: rightSegmentValue
    };

    return {
      state: {
        ...state,
        segments: {
          ...state.segments,
          byId: nextSegmentsById
        }
      },
      segments: {
        [leftSegment.id]: leftSegmentValue,
        [rightSegment.id]: rightSegmentValue
      } as Record<SegmentId, Segment>,
      removedSegmentIds: []
    };
  }

  return buildCandidateTopology(state, leftSegment, rightSegment, spliceNodeId, targetSegment, leftLengthMm, rightLengthMm);
}

function computeSpliceNodePosition(
  state: AppState,
  spliceNodeId: NodeId,
  targetSegment: Segment,
  leftLengthMm: number,
  rightLengthMm: number
): { x: number; y: number } | null {
  const positionA = state.nodePositions[targetSegment.nodeA];
  const positionB = state.nodePositions[targetSegment.nodeB];
  if (positionA === undefined || positionB === undefined) {
    return state.nodePositions[spliceNodeId] ?? null;
  }

  const totalLengthMm = leftLengthMm + rightLengthMm;
  if (!Number.isFinite(totalLengthMm) || totalLengthMm <= 0) {
    return null;
  }

  const ratioFromA = leftLengthMm / totalLengthMm;
  return {
    x: positionA.x + (positionB.x - positionA.x) * ratioFromA,
    y: positionA.y + (positionB.y - positionA.y) * ratioFromA
  };
}

function getSegmentLengths(segments: Record<SegmentId, Segment>): Record<SegmentId, number> {
  const lengths: Record<SegmentId, number> = {} as Record<SegmentId, number>;
  for (const [segmentId, segment] of Object.entries(segments)) {
    lengths[segmentId as SegmentId] = segment.lengthMm;
  }

  return lengths;
}

function calculatePositionSteps(totalLengthMm: number): number[] {
  const steps = new Set<number>();
  const lastPositionMm = Math.max(1, Math.round(totalLengthMm) - 1);
  const sampleCount = Math.min(lastPositionMm, 500);
  for (let step = 1; step <= sampleCount; step += 1) {
    steps.add(Math.max(1, Math.round((lastPositionMm * step) / sampleCount)));
  }
  return [...steps].sort((left, right) => left - right);
}

function getCandidateTargetSegments(
  state: AppState,
  leftSegment: ConnectedSegment,
  rightSegment: ConnectedSegment
): Segment[] {
  return buildRemovedSpliceSegments(state, leftSegment, rightSegment).filter((segment) => {
    if (segment.nodeA === segment.nodeB) {
      return false;
    }
    return Number.isFinite(segment.lengthMm) && segment.lengthMm >= 2;
  });
}

function recomputeConnectedWiresForCandidate(
  state: AppState,
  spliceId: SpliceId,
  connectedWires: Wire[]
): Wire[] | null {
  const recomputedWires: Wire[] = [];
  let transientState = state;

  for (const wire of connectedWires) {
    const recomputed = recomputeWireRouteAndDirectionalEndpoints(transientState, {
      ...wire,
      isRouteLocked: false
    });
    if (!("wire" in recomputed)) {
      return null;
    }
    recomputedWires.push(recomputed.wire);
    transientState = {
      ...transientState,
      wires: {
        ...transientState.wires,
        byId: {
          ...transientState.wires.byId,
          [wire.id]: recomputed.wire
        }
      }
    };
  }

  return recomputedWires.filter(
    (wire) =>
      (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === spliceId) ||
      (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === spliceId)
  );
}

function scoreCandidate(metrics: SplicePlacementMetrics, balanceLimitPercent: number): number {
  const ratio = metrics.balanceRatioPercent ?? Number.POSITIVE_INFINITY;
  const overLimitPenalty = ratio > balanceLimitPercent ? (ratio - balanceLimitPercent) * 10_000 : 0;
  const balancePenalty = Number.isFinite(ratio) ? Math.max(0, ratio - 100) * 10 : 1_000_000;
  return metrics.copperVolumeMm3 + overLimitPenalty + balancePenalty;
}

export function findSplicePlacementSuggestion(
  state: AppState,
  spliceId: SpliceId,
  options: { balanceLimitPercent?: number; minimumImprovementPercent?: number } = {}
): { suggestion: SplicePlacementSuggestion } | { reason: string } {
  const balanceLimitPercent =
    Number.isFinite(options.balanceLimitPercent) && options.balanceLimitPercent !== undefined && options.balanceLimitPercent >= 100
      ? options.balanceLimitPercent
      : 300;
  const minimumImprovementPercent =
    Number.isFinite(options.minimumImprovementPercent) && options.minimumImprovementPercent !== undefined
      ? options.minimumImprovementPercent
      : 1;

  const splice = state.splices.byId[spliceId];
  if (splice === undefined) {
    return { reason: "Cannot optimize an unknown splice." };
  }
  if (resolveSplicePortMode(splice) !== "directional") {
    return { reason: "Only automatic L/R directional splices can be optimized." };
  }

  const spliceNodeId = findSpliceNodeId(state, spliceId);
  if (spliceNodeId === null) {
    return { reason: "This splice has no linked splice node." };
  }

  const connectedSegments = getConnectedSegments(state, spliceNodeId);
  if (connectedSegments.length !== 2) {
    return { reason: "Length optimization is available when the splice is connected to exactly two routing segments." };
  }

  const [leftSegment, rightSegment] = connectedSegments;
  if (leftSegment === undefined || rightSegment === undefined) {
    return { reason: "Cannot resolve splice routing branches." };
  }

  const connectedWires = getConnectedWires(state, spliceId);
  if (connectedWires.length < 2) {
    return { reason: "At least two connected wires are required to optimize splice lengths." };
  }
  if (connectedWires.some((wire) => !Number.isFinite(wire.sectionMm2) || wire.sectionMm2 <= 0)) {
    return { reason: "Every connected wire needs a positive section before optimizing lengths." };
  }

  const currentRecomputed = recomputeConnectedWiresForCandidate(state, spliceId, connectedWires);
  if (currentRecomputed === null) {
    return { reason: "Connected wires cannot be routed from the current segment lengths." };
  }
  const current = computeMetrics(currentRecomputed, spliceId);

  const totalAdjacentLengthMm = leftSegment.lengthMm + rightSegment.lengthMm;
  if (!Number.isFinite(totalAdjacentLengthMm) || totalAdjacentLengthMm < 2) {
    return { reason: "Adjacent splice segment lengths are too short to remove and reinsert safely." };
  }

  let best:
    | {
        targetSegmentId: SegmentId;
        segments: Record<SegmentId, Segment>;
        removedSegmentIds: SegmentId[];
        spliceNodePosition: { x: number; y: number } | null;
        metrics: SplicePlacementMetrics;
        score: number;
      }
    | null = null;

  for (const targetSegment of getCandidateTargetSegments(state, leftSegment, rightSegment)) {
    for (const leftLengthMm of calculatePositionSteps(targetSegment.lengthMm)) {
      const rightLengthMm = Math.max(1, targetSegment.lengthMm - leftLengthMm);
      if (
        isOriginalMergedSegment(targetSegment, leftSegment) &&
        leftLengthMm === leftSegment.lengthMm &&
        rightLengthMm === rightSegment.lengthMm
      ) {
        continue;
      }

      const candidate = buildCandidateState(
        state,
        leftSegment,
        rightSegment,
        spliceNodeId,
        targetSegment,
        leftLengthMm,
        rightLengthMm
      );
      const candidateWires = recomputeConnectedWiresForCandidate(candidate.state, spliceId, connectedWires);
      if (candidateWires === null) {
        continue;
      }

      const metrics = computeMetrics(candidateWires, spliceId);
      const score = scoreCandidate(metrics, balanceLimitPercent);
      if (best === null || score < best.score) {
        best = {
          targetSegmentId: targetSegment.id,
          segments: candidate.segments,
          removedSegmentIds: candidate.removedSegmentIds,
          spliceNodePosition: computeSpliceNodePosition(state, spliceNodeId, targetSegment, leftLengthMm, rightLengthMm),
          metrics,
          score
        };
      }
    }
  }

  if (best === null) {
    return { reason: "No routable optimized length candidate was found." };
  }

  const copperVolumeDeltaMm3 = best.metrics.copperVolumeMm3 - current.copperVolumeMm3;
  const copperVolumeDeltaPercent =
    current.copperVolumeMm3 > 0 ? (copperVolumeDeltaMm3 / current.copperVolumeMm3) * 100 : 0;
  if (copperVolumeDeltaPercent > -minimumImprovementPercent) {
    return { reason: "No better lengths found within current constraints." };
  }

  const warning =
    best.metrics.balanceRatioPercent !== null && best.metrics.balanceRatioPercent > balanceLimitPercent
      ? "Suggested lengths reduce copper but remain above the section balance limit."
      : null;

  return {
    suggestion: {
      spliceId,
      spliceNodeId,
      segmentLengths: getSegmentLengths(best.segments),
      segments: best.segments,
      removedSegmentIds: best.removedSegmentIds,
      targetSegmentId: best.targetSegmentId,
      spliceNodePosition: best.spliceNodePosition,
      current,
      suggested: best.metrics,
      copperVolumeDeltaMm3,
      copperVolumeDeltaPercent,
      balanceLimitPercent,
      warning
    }
  };
}
