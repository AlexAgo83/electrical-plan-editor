import type { AppAction } from "../actions";
import type { AppState } from "../types";
import { recomputeAllWiresForNetwork } from "./helpers/wireTransitions";
import { bumpRevision, clearLastError, removeEntity, shouldClearSelection, upsertEntity, withError } from "./shared";

export function handleSegmentActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "segment/upsert": {
      const normalizedSegmentId = action.payload.id.trim() as typeof action.payload.id;
      if (normalizedSegmentId.length === 0) {
        return withError(state, "Segment ID is required.");
      }
      if (action.payload.nodeA === action.payload.nodeB) {
        return withError(state, "Segment endpoints must reference two different nodes.");
      }

      if (state.nodes.byId[action.payload.nodeA] === undefined || state.nodes.byId[action.payload.nodeB] === undefined) {
        return withError(state, "Segment endpoints must reference existing nodes.");
      }

      if (!Number.isFinite(action.payload.lengthMm) || action.payload.lengthMm < 1) {
        return withError(state, "Segment lengthMm must be >= 1.");
      }

      const normalizedSubNetworkTag = action.payload.subNetworkTag?.trim();
      const stateWithUpdatedSegments = {
        ...clearLastError(state),
        segments: upsertEntity(state.segments, {
          ...action.payload,
          id: normalizedSegmentId,
          subNetworkTag: normalizedSubNetworkTag === undefined || normalizedSubNetworkTag.length === 0
            ? undefined
            : normalizedSubNetworkTag
        })
      };

      const recomputed = recomputeAllWiresForNetwork(stateWithUpdatedSegments);
      if ("error" in recomputed) {
        return withError(state, recomputed.error);
      }

      return bumpRevision({
        ...stateWithUpdatedSegments,
        wires: recomputed.wires
      });
    }

    case "segment/remove": {
      const stateWithRemovedSegment = {
        ...clearLastError(state),
        segments: removeEntity(state.segments, action.payload.id),
        ui: shouldClearSelection(state.ui.selected, "segment", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      };

      const recomputed = recomputeAllWiresForNetwork(stateWithRemovedSegment);
      if ("error" in recomputed) {
        return withError(state, recomputed.error);
      }

      return bumpRevision({
        ...stateWithRemovedSegment,
        wires: recomputed.wires
      });
    }

    default:
      return null;
  }
}
