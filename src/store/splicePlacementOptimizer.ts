import type { NodeId, Segment, SegmentId, SpliceId, Wire } from "../core/entities";
import { resolveSplicePortMode } from "../core/splicePortMode";
import type { LayoutNodePosition, AppState } from "./types";
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
  position: LayoutNodePosition;
  segmentLengths: Record<SegmentId, number>;
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

function interpolatePosition(
  left: LayoutNodePosition,
  right: LayoutNodePosition,
  ratioFromLeft: number
): LayoutNodePosition {
  return {
    x: Math.round(left.x + (right.x - left.x) * ratioFromLeft),
    y: Math.round(left.y + (right.y - left.y) * ratioFromLeft)
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

function buildCandidateState(
  state: AppState,
  spliceNodeId: NodeId,
  leftSegment: ConnectedSegment,
  rightSegment: ConnectedSegment,
  leftLengthMm: number,
  rightLengthMm: number,
  position: LayoutNodePosition
): AppState {
  const leftSegmentValue = toSegment(leftSegment);
  const rightSegmentValue = toSegment(rightSegment);
  return {
    ...state,
    nodePositions: {
      ...state.nodePositions,
      [spliceNodeId]: position
    },
    segments: {
      ...state.segments,
      byId: {
        ...state.segments.byId,
        [leftSegment.id]: { ...leftSegmentValue, lengthMm: leftLengthMm },
        [rightSegment.id]: { ...rightSegmentValue, lengthMm: rightLengthMm }
      }
    }
  };
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
    return { reason: "This splice has no linked splice node to move." };
  }

  const connectedSegments = getConnectedSegments(state, spliceNodeId);
  if (connectedSegments.length !== 2) {
    return { reason: "Optimized placement is available when the splice is connected to exactly two routing segments." };
  }

  const [leftSegment, rightSegment] = connectedSegments;
  if (leftSegment === undefined || rightSegment === undefined) {
    return { reason: "Cannot resolve splice routing branches." };
  }

  const leftPosition = state.nodePositions[leftSegment.otherNodeId];
  const rightPosition = state.nodePositions[rightSegment.otherNodeId];
  if (leftPosition === undefined || rightPosition === undefined) {
    return { reason: "Both adjacent branch nodes need canvas positions before optimizing placement." };
  }

  const connectedWires = getConnectedWires(state, spliceId);
  if (connectedWires.length < 2) {
    return { reason: "At least two connected wires are required to optimize splice placement." };
  }
  if (connectedWires.some((wire) => !Number.isFinite(wire.sectionMm2) || wire.sectionMm2 <= 0)) {
    return { reason: "Every connected wire needs a positive section before optimizing placement." };
  }

  const currentRecomputed = recomputeConnectedWiresForCandidate(state, spliceId, connectedWires);
  if (currentRecomputed === null) {
    return { reason: "Connected wires cannot be routed from the current placement." };
  }
  const current = computeMetrics(currentRecomputed, spliceId);

  const totalAdjacentLengthMm = leftSegment.lengthMm + rightSegment.lengthMm;
  if (!Number.isFinite(totalAdjacentLengthMm) || totalAdjacentLengthMm < 20) {
    return { reason: "Adjacent splice segment lengths are too short to optimize safely." };
  }

  let best:
    | {
        position: LayoutNodePosition;
        leftLengthMm: number;
        rightLengthMm: number;
        metrics: SplicePlacementMetrics;
        score: number;
      }
    | null = null;

  for (let step = 1; step <= 9; step += 1) {
    const ratioFromLeft = step / 10;
    const leftLengthMm = Math.max(1, Math.round(totalAdjacentLengthMm * ratioFromLeft));
    const rightLengthMm = Math.max(1, totalAdjacentLengthMm - leftLengthMm);
    if (leftLengthMm === leftSegment.lengthMm && rightLengthMm === rightSegment.lengthMm) {
      continue;
    }

    const candidateState = buildCandidateState(
      state,
      spliceNodeId,
      leftSegment,
      rightSegment,
      leftLengthMm,
      rightLengthMm,
      interpolatePosition(leftPosition, rightPosition, ratioFromLeft)
    );
    const candidateWires = recomputeConnectedWiresForCandidate(candidateState, spliceId, connectedWires);
    if (candidateWires === null) {
      continue;
    }

    const metrics = computeMetrics(candidateWires, spliceId);
    const score = scoreCandidate(metrics, balanceLimitPercent);
    if (best === null || score < best.score) {
      best = {
        position: interpolatePosition(leftPosition, rightPosition, ratioFromLeft),
        leftLengthMm,
        rightLengthMm,
        metrics,
        score
      };
    }
  }

  if (best === null) {
    return { reason: "No routable optimized placement candidate was found." };
  }

  const copperVolumeDeltaMm3 = best.metrics.copperVolumeMm3 - current.copperVolumeMm3;
  const copperVolumeDeltaPercent =
    current.copperVolumeMm3 > 0 ? (copperVolumeDeltaMm3 / current.copperVolumeMm3) * 100 : 0;
  if (copperVolumeDeltaPercent > -minimumImprovementPercent) {
    return { reason: "No better placement found within current constraints." };
  }

  const warning =
    best.metrics.balanceRatioPercent !== null && best.metrics.balanceRatioPercent > balanceLimitPercent
      ? "Suggested placement reduces copper but remains above the section balance limit."
      : null;

  return {
    suggestion: {
      spliceId,
      spliceNodeId,
      position: best.position,
      segmentLengths: {
        [leftSegment.id]: best.leftLengthMm,
        [rightSegment.id]: best.rightLengthMm
      } as Record<SegmentId, number>,
      current,
      suggested: best.metrics,
      copperVolumeDeltaMm3,
      copperVolumeDeltaPercent,
      balanceLimitPercent,
      warning
    }
  };
}
