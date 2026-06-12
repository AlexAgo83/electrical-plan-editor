import type { AppAction } from "../actions";
import type { Segment, SegmentId } from "../../core/entities";
import { recomputeWireRouteAndDirectionalEndpoints } from "./helpers/wireTransitions";
import type { AppState } from "../types";
import { bumpRevision, clearLastError, withError } from "./shared";

function sortSegmentIds(ids: SegmentId[]): SegmentId[] {
  return [...ids].sort((left, right) => left.localeCompare(right));
}

function validateSegment(segment: Segment): string | null {
  if (segment.nodeA === segment.nodeB) {
    return "Cannot optimize placement because a target segment loops on the same node.";
  }
  if (!Number.isFinite(segment.lengthMm) || segment.lengthMm < 1) {
    return "Cannot optimize placement because a target segment length is invalid.";
  }

  return null;
}

export function applyOptimizedSpliceCanvasLayout(
  state: AppState,
  action: Extract<AppAction, { type: "splice/applyOptimizedCanvasLayout" }>
): AppState {
  const splice = state.splices.byId[action.payload.id];
  if (splice === undefined) {
    return withError(state, "Cannot optimize lengths for unknown splice.");
  }
  const node = state.nodes.byId[action.payload.nodeId];
  if (node?.kind !== "splice" || node.spliceId !== splice.id) {
    return withError(state, "Cannot optimize lengths without the linked splice node.");
  }

  let nextSegmentIds = [...state.segments.allIds];
  const nextSegmentsById = { ...state.segments.byId };
  for (const removedSegmentId of action.payload.removedSegmentIds ?? []) {
    delete nextSegmentsById[removedSegmentId];
    nextSegmentIds = nextSegmentIds.filter((segmentId) => segmentId !== removedSegmentId);
  }

  if (action.payload.segments !== undefined) {
    for (const [segmentId, segment] of Object.entries(action.payload.segments)) {
      const typedSegmentId = segmentId as SegmentId;
      if (segment.id !== typedSegmentId) {
        return withError(state, "Cannot optimize placement because a target segment id is inconsistent.");
      }
      if (state.nodes.byId[segment.nodeA] === undefined || state.nodes.byId[segment.nodeB] === undefined) {
        return withError(state, "Cannot optimize placement because a target segment references an unknown node.");
      }
      const validationError = validateSegment(segment);
      if (validationError !== null) {
        return withError(state, validationError);
      }
      nextSegmentsById[typedSegmentId] = segment;
      if (!nextSegmentIds.includes(typedSegmentId)) {
        nextSegmentIds.push(typedSegmentId);
      }
    }
  } else {
    for (const [segmentId, lengthMm] of Object.entries(action.payload.segmentLengths)) {
      const typedSegmentId = segmentId as SegmentId;
      const segment = state.segments.byId[typedSegmentId];
      if (segment === undefined) {
        return withError(state, "Cannot optimize lengths because a target segment is missing.");
      }
      if (!Number.isFinite(lengthMm) || lengthMm < 1) {
        return withError(state, "Cannot optimize lengths because a target segment length is invalid.");
      }
      nextSegmentsById[typedSegmentId] = {
        ...segment,
        lengthMm
      };
    }
  }
  nextSegmentIds = sortSegmentIds(nextSegmentIds.filter((segmentId) => nextSegmentsById[segmentId] !== undefined));

  const transientState: AppState = {
    ...state,
    segments: {
      ...state.segments,
      allIds: nextSegmentIds,
      byId: nextSegmentsById
    }
  };
  const nextWiresById = { ...state.wires.byId };
  let touchedWireCount = 0;
  let recomputeState = transientState;
  for (const wireId of state.wires.allIds) {
    const wire = recomputeState.wires.byId[wireId];
    if (
      wire === undefined ||
      !(
        (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === splice.id) ||
        (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === splice.id)
      )
    ) {
      continue;
    }

    const recomputed = recomputeWireRouteAndDirectionalEndpoints(recomputeState, {
      ...wire,
      isRouteLocked: false
    });
    if (!("wire" in recomputed)) {
      return withError(state, recomputed.error);
    }

    nextWiresById[wireId] = recomputed.wire;
    recomputeState = {
      ...recomputeState,
      wires: {
        ...recomputeState.wires,
        byId: {
          ...recomputeState.wires.byId,
          [wireId]: recomputed.wire
        }
      }
    };
    touchedWireCount += 1;
  }

  if (touchedWireCount === 0) {
    return withError(state, "Cannot optimize lengths because the splice has no connected wires.");
  }

  return bumpRevision({
    ...clearLastError(state),
    segments: {
      ...state.segments,
      allIds: nextSegmentIds,
      byId: nextSegmentsById
    },
    nodePositions:
      action.payload.nodePosition === null || action.payload.nodePosition === undefined
        ? state.nodePositions
        : {
            ...state.nodePositions,
            [action.payload.nodeId]: action.payload.nodePosition
          },
    wires: {
      ...state.wires,
      byId: nextWiresById
    }
  });
}
