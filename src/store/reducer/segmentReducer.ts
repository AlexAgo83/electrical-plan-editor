import type { AppAction } from "../actions";
import type { Segment, Splice } from "../../core/entities";
import type { AppState } from "../types";
import { recomputeAllWiresForNetwork } from "./helpers/wireTransitions";
import { listPlacedSpliceIdsOnSegment } from "./helpers/splicePlacement";
import { resolveSegmentEndpointForRearBackshell } from "./helpers/rearBackshell";
import {
  bumpRevision,
  clearLastError,
  removeEntity,
  shouldClearSelection,
  upsertEntity,
  withError,
  withWarning
} from "./shared";

function normalizeOptionalSegmentText(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length === 0 ? undefined : normalized;
}

function normalizeMountingLabels(segment: Segment): Segment["mountingLabels"] {
  const labels = segment.mountingLabels;
  if (!Array.isArray(labels)) {
    return undefined;
  }
  const normalized = labels
    .map((label) => {
      const text = label.text.trim();
      if (label.id.trim().length === 0 || text.length === 0) {
        return null;
      }
      const positionRatio =
        Number.isFinite(label.positionRatio) ? Math.min(1, Math.max(0, label.positionRatio)) : 0.5;
      const offsetX = Number.isFinite(label.offsetX) ? label.offsetX : 0;
      const offsetY = Number.isFinite(label.offsetY) ? label.offsetY : 0;
      return {
        ...label,
        text,
        positionRatio,
        offsetX,
        offsetY
      };
    })
    .filter((label): label is NonNullable<typeof label> => label !== null);
  return normalized.length === 0 ? undefined : normalized;
}

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

      const normalizedNodeA = resolveSegmentEndpointForRearBackshell(
        state,
        action.payload.nodeA,
        action.payload.nodeB,
        action.payload.role
      );
      const normalizedNodeB = resolveSegmentEndpointForRearBackshell(
        state,
        action.payload.nodeB,
        normalizedNodeA,
        action.payload.role
      );
      if (normalizedNodeA === normalizedNodeB) {
        return withError(state, "Segment endpoints must reference two different nodes.");
      }

      const previousSegment = state.segments.byId[normalizedSegmentId];
      const hostedSpliceIds = listPlacedSpliceIdsOnSegment(state, normalizedSegmentId);
      const nextRole = action.payload.role === "rearBackshellLink" ? ("rearBackshellLink" as const) : undefined;
      if (nextRole === "rearBackshellLink" && hostedSpliceIds.length > 0) {
        return withError(state, "Cannot mark a segment as rear backshell link while splices are placed on it.");
      }

      const normalizedSubNetworkTag = action.payload.subNetworkTag?.trim();
      const nextSegment: Segment = {
        ...action.payload,
        id: normalizedSegmentId,
        nodeA: normalizedNodeA,
        nodeB: normalizedNodeB,
        role: nextRole,
        subNetworkTag: normalizedSubNetworkTag === undefined || normalizedSubNetworkTag.length === 0
          ? undefined
          : normalizedSubNetworkTag,
        sheathType: normalizeOptionalSegmentText(action.payload.sheathType),
        insulation: normalizeOptionalSegmentText(action.payload.insulation),
        lineStyle: normalizeOptionalSegmentText(action.payload.lineStyle),
        internalPartReference: normalizeOptionalSegmentText(action.payload.internalPartReference),
        mountingLabels: normalizeMountingLabels(action.payload)
      };

      // Keep splice placements coherent with the edited segment: remap the
      // reference node when an endpoint moved, preserve absolute offsets when
      // possible, clamp out-of-range offsets, and report relative shifts.
      let nextSplices = state.splices;
      const warningMessages: string[] = [];
      if (previousSegment !== undefined && hostedSpliceIds.length > 0) {
        for (const spliceId of hostedSpliceIds) {
          const splice = state.splices.byId[spliceId];
          const placement = splice?.placement;
          if (splice === undefined || placement === undefined) {
            continue;
          }

          let nextFromNodeId = placement.fromNodeId;
          if (placement.fromNodeId === previousSegment.nodeA) {
            nextFromNodeId = nextSegment.nodeA;
          } else if (placement.fromNodeId === previousSegment.nodeB) {
            nextFromNodeId = nextSegment.nodeB;
          }

          let nextOffsetMm = placement.offsetMm;
          if (nextOffsetMm > nextSegment.lengthMm) {
            warningMessages.push(
              `Splice '${splice.technicalId}' offset clamped from ${String(placement.offsetMm)} mm to ${String(nextSegment.lengthMm)} mm on segment '${normalizedSegmentId}'.`
            );
            nextOffsetMm = nextSegment.lengthMm;
          } else if (previousSegment.lengthMm !== nextSegment.lengthMm && previousSegment.lengthMm > 0 && nextSegment.lengthMm > 0) {
            const previousPercent = Math.round((placement.offsetMm / previousSegment.lengthMm) * 100);
            const nextPercent = Math.round((nextOffsetMm / nextSegment.lengthMm) * 100);
            if (previousPercent !== nextPercent) {
              warningMessages.push(
                `Splice '${splice.technicalId}' keeps ${String(nextOffsetMm)} mm from its reference node on segment '${normalizedSegmentId}' (relative position shifts from ${String(previousPercent)}% to ${String(nextPercent)}%).`
              );
            }
          }

          if (nextFromNodeId !== placement.fromNodeId || nextOffsetMm !== placement.offsetMm) {
            const nextSplice: Splice = {
              ...splice,
              placement: {
                ...placement,
                fromNodeId: nextFromNodeId,
                offsetMm: nextOffsetMm
              }
            };
            nextSplices = upsertEntity(nextSplices, nextSplice);
          }
        }
      }

      const stateWithUpdatedSegments = {
        ...clearLastError(state),
        splices: nextSplices,
        segments: upsertEntity(state.segments, nextSegment)
      };

      const recomputed = recomputeAllWiresForNetwork(stateWithUpdatedSegments);
      if ("error" in recomputed) {
        return withError(state, recomputed.error);
      }

      const nextState = bumpRevision({
        ...stateWithUpdatedSegments,
        wires: recomputed.wires
      });

      return warningMessages.length === 0 ? nextState : withWarning(nextState, warningMessages.join(" "));
    }

    case "segment/updateBatch": {
      if (action.payload.ids.length === 0) {
        return clearLastError(state);
      }

      let nextSegments = state.segments;
      let changed = false;
      for (const segmentId of new Set(action.payload.ids)) {
        const segment = nextSegments.byId[segmentId];
        if (segment === undefined) {
          continue;
        }

        const nextSegment = {
          ...segment,
          ...(Object.prototype.hasOwnProperty.call(action.payload.changes, "sheathType")
            ? { sheathType: normalizeOptionalSegmentText(action.payload.changes.sheathType) }
            : {}),
          ...(Object.prototype.hasOwnProperty.call(action.payload.changes, "insulation")
            ? { insulation: normalizeOptionalSegmentText(action.payload.changes.insulation) }
            : {}),
          ...(Object.prototype.hasOwnProperty.call(action.payload.changes, "lineStyle")
            ? { lineStyle: normalizeOptionalSegmentText(action.payload.changes.lineStyle) }
            : {}),
          ...(Object.prototype.hasOwnProperty.call(action.payload.changes, "internalPartReference")
            ? { internalPartReference: normalizeOptionalSegmentText(action.payload.changes.internalPartReference) }
            : {})
        };

        if (
          nextSegment.sheathType === segment.sheathType &&
          nextSegment.insulation === segment.insulation &&
          nextSegment.lineStyle === segment.lineStyle &&
          nextSegment.internalPartReference === segment.internalPartReference
        ) {
          continue;
        }

        nextSegments = upsertEntity(nextSegments, nextSegment);
        changed = true;
      }

      if (!changed) {
        return clearLastError(state);
      }

      return bumpRevision({
        ...clearLastError(state),
        segments: nextSegments
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
        if (
          wire === undefined ||
          (!wire.routeSegmentIds.includes(fromId) &&
            wire.routeEndpointDetailA?.segmentId !== fromId &&
            wire.routeEndpointDetailB?.segmentId !== fromId)
        ) {
          continue;
        }
        wiresChanged = true;
        nextWiresById[wireId] = {
          ...wire,
          routeSegmentIds: wire.routeSegmentIds.map((segmentId) => (segmentId === fromId ? toId : segmentId)),
          routeEndpointDetailA:
            wire.routeEndpointDetailA?.segmentId === fromId
              ? { ...wire.routeEndpointDetailA, segmentId: toId }
              : wire.routeEndpointDetailA,
          routeEndpointDetailB:
            wire.routeEndpointDetailB?.segmentId === fromId
              ? { ...wire.routeEndpointDetailB, segmentId: toId }
              : wire.routeEndpointDetailB
        };
      }

      let splicesChanged = false;
      const nextSplicesById = { ...state.splices.byId };
      for (const spliceId of state.splices.allIds) {
        const splice = state.splices.byId[spliceId];
        if (splice?.placement === undefined || splice.placement.segmentId !== fromId) {
          continue;
        }
        splicesChanged = true;
        nextSplicesById[spliceId] = {
          ...splice,
          placement: { ...splice.placement, segmentId: toId }
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
        splices: splicesChanged
          ? {
              ...state.splices,
              byId: nextSplicesById
            }
          : state.splices,
        ui: {
          ...state.ui,
          selected: nextSelected,
          lastError: null
        }
      });
    }

    case "segment/remove": {
      const hostedSpliceIds = listPlacedSpliceIdsOnSegment(state, action.payload.id);
      if (hostedSpliceIds.length > 0) {
        const hostedTechnicalIds = hostedSpliceIds
          .map((spliceId) => state.splices.byId[spliceId]?.technicalId ?? spliceId)
          .slice(0, 3)
          .join("', '");
        return withError(
          state,
          `Segment '${action.payload.id}' cannot be deleted while splice(s) '${hostedTechnicalIds}' are placed on it. Move or delete the splice first.`
        );
      }

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

    case "mountingLabel/upsert": {
      const segment = state.segments.byId[action.payload.segmentId];
      if (segment === undefined) {
        return withError(state, "Cannot save mounting label on unknown segment.");
      }
      const text = action.payload.label.text.trim();
      if (action.payload.label.id.trim().length === 0 || text.length === 0) {
        return withError(state, "Mounting label ID and text are required.");
      }
      const nextLabels = [
        ...(segment.mountingLabels ?? []).filter((label) => label.id !== action.payload.label.id),
        {
          ...action.payload.label,
          text,
          positionRatio: Math.min(1, Math.max(0, action.payload.label.positionRatio)),
          offsetX: Number.isFinite(action.payload.label.offsetX) ? action.payload.label.offsetX : 0,
          offsetY: Number.isFinite(action.payload.label.offsetY) ? action.payload.label.offsetY : 0
        }
      ].sort((left, right) => left.id.localeCompare(right.id));
      return bumpRevision({
        ...clearLastError(state),
        segments: upsertEntity(state.segments, {
          ...segment,
          mountingLabels: nextLabels
        })
      });
    }

    case "mountingLabel/remove": {
      const segment = state.segments.byId[action.payload.segmentId];
      if (segment === undefined) {
        return clearLastError(state);
      }
      const nextLabels = (segment.mountingLabels ?? []).filter((label) => label.id !== action.payload.labelId);
      return bumpRevision({
        ...clearLastError(state),
        segments: upsertEntity(state.segments, {
          ...segment,
          mountingLabels: nextLabels.length === 0 ? undefined : nextLabels
        })
      });
    }

    default:
      return null;
  }
}
