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

    case "segment/rename": {
      const rawFromId = action.payload.fromId;
      const rawToId = action.payload.toId;
      const fromId = rawFromId.trim() as typeof rawFromId;
      const toId = rawToId.trim() as typeof rawToId;

      if (fromId.length === 0 || state.segments.byId[fromId] === undefined) {
        return withError(state, "Cannot rename unknown segment.");
      }
      if (toId.length === 0) {
        return withError(state, "Segment ID is required.");
      }
      if (fromId === toId) {
        return clearLastError(state);
      }
      if (state.segments.byId[toId] !== undefined) {
        return withError(state, `Segment ID '${toId}' already exists.`);
      }

      const existingSegment = state.segments.byId[fromId];
      if (existingSegment === undefined) {
        return withError(state, "Cannot rename unknown segment.");
      }

      const nextSegmentsById = { ...state.segments.byId };
      delete nextSegmentsById[fromId];
      nextSegmentsById[toId] = { ...existingSegment, id: toId };

      const nextSegmentsAllIds = [...state.segments.allIds.filter((candidate) => candidate !== fromId), toId].sort((a, b) =>
        a.localeCompare(b)
      );

      let wiresChanged = false;
      const nextWiresById = { ...state.wires.byId };
      for (const wireId of state.wires.allIds) {
        const wire = state.wires.byId[wireId];
        if (wire === undefined || !wire.routeSegmentIds.includes(fromId)) {
          continue;
        }
        wiresChanged = true;
        nextWiresById[wireId] = {
          ...wire,
          routeSegmentIds: wire.routeSegmentIds.map((segmentId) => (segmentId === fromId ? toId : segmentId))
        };
      }

      const nextSelected =
        state.ui.selected?.kind === "segment" && state.ui.selected.id === fromId
          ? { kind: "segment" as const, id: toId }
          : state.ui.selected;

      return bumpRevision({
        ...clearLastError(state),
        segments: {
          byId: nextSegmentsById,
          allIds: nextSegmentsAllIds
        },
        wires: wiresChanged
          ? {
              ...state.wires,
              byId: nextWiresById
            }
          : state.wires,
        ui: {
          ...state.ui,
          selected: nextSelected,
          lastError: null
        }
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
