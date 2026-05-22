import type { AppAction } from "../actions";
import type { SegmentId } from "../../core/entities";
import { recomputeWireRouteAndDirectionalEndpoints } from "./helpers/wireTransitions";
import type { AppState } from "../types";
import { bumpRevision, clearLastError, withError } from "./shared";

export function applyOptimizedSplicePlacement(
  state: AppState,
  action: Extract<AppAction, { type: "splice/applyOptimizedPlacement" }>
): AppState {
  const splice = state.splices.byId[action.payload.id];
  if (splice === undefined) {
    return withError(state, "Cannot optimize lengths for unknown splice.");
  }
  const node = state.nodes.byId[action.payload.nodeId];
  if (node?.kind !== "splice" || node.spliceId !== splice.id) {
    return withError(state, "Cannot optimize lengths without the linked splice node.");
  }

  const nextSegmentsById = { ...state.segments.byId };
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

  const transientState: AppState = {
    ...state,
    segments: {
      ...state.segments,
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
      byId: nextSegmentsById
    },
    wires: {
      ...state.wires,
      byId: nextWiresById
    }
  });
}
