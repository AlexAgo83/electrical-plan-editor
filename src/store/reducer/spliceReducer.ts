import type { AppAction } from "../actions";
import { analyzeSpliceDeleteImpact } from "../deleteImpact";
import {
  normalizeDirectionalSpliceEndpoint,
  type DirectionalSpliceSide
} from "../../core/directionalSplice";
import type { SegmentId, Wire, WireEndpoint, WireId } from "../../core/entities";
import { recomputeWireRouteAndDirectionalEndpoints, resolveDirectionalSpliceEndpointSide } from "./helpers/wireTransitions";
import type { AppState, EntityState } from "../types";
import {
  DIRECTIONAL_SPLICE_PORT_COUNT,
  normalizeSplicePortMode,
  normalizeUnboundedPortCountFallback,
  resolveSplicePortMode
} from "../../core/splicePortMode";
import {
  bumpRevision,
  clearLastError,
  isValidSlotIndex,
  removeEntity,
  shouldClearSelection,
  upsertEntity,
  withError
} from "./shared";

function hasDuplicateSpliceTechnicalId(state: AppState, spliceId: string, technicalId: string): boolean {
  return state.splices.allIds.some((id) => {
    if (id === spliceId) {
      return false;
    }

    const splice = state.splices.byId[id];
    if (splice === undefined) {
      return false;
    }

    return splice.technicalId === technicalId;
  });
}

function normalizeManufacturerReference(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return undefined;
  }

  return normalized.length > 120 ? normalized.slice(0, 120) : normalized;
}

function hasWireEndpointIndexOutOfRange(state: AppState, spliceId: string, portCount: number): boolean {
  return state.wires.allIds.some((id) => {
    const wire = state.wires.byId[id];
    if (wire === undefined) {
      return false;
    }
    return (
      (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === spliceId && wire.endpointA.portIndex > portCount) ||
      (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === spliceId && wire.endpointB.portIndex > portCount)
    );
  });
}

function isValidSplicePortIndexForMode(
  splice: {
    portMode?: "bounded" | "unbounded" | "directional";
    portCount: number;
  },
  portIndex: number
): boolean {
  if (!Number.isInteger(portIndex) || portIndex < 1) {
    return false;
  }
  const portMode = resolveSplicePortMode(splice);
  if (portMode === "unbounded") {
    return true;
  }
  if (portMode === "directional") {
    return portIndex === 1 || portIndex === 2;
  }
  return isValidSlotIndex(portIndex, splice.portCount);
}

function hasSpliceNodeReference(state: AppState, spliceId: string): boolean {
  return state.nodes.allIds.some((id) => {
    const node = state.nodes.byId[id];
    return node?.kind === "splice" && node.spliceId === spliceId;
  });
}

function hasWireEndpointReferenceOnSplice(state: AppState, spliceId: string): boolean {
  return state.wires.allIds.some((id) => {
    const wire = state.wires.byId[id];
    if (wire === undefined) {
      return false;
    }

    return (
      (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === spliceId) ||
      (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === spliceId)
    );
  });
}

function resolveConvertedEndpointSide(
  state: AppState,
  endpoint: Extract<WireEndpoint, { kind: "splicePort" }>,
  routeSegmentIds: SegmentId[],
  wireSide: "A" | "B",
  originalPortCount: number
): DirectionalSpliceSide {
  const inferredSide = resolveDirectionalSpliceEndpointSide(state, endpoint, routeSegmentIds, wireSide);
  if (inferredSide !== null) {
    return inferredSide;
  }

  return endpoint.portIndex > Math.ceil(originalPortCount / 2) ? "R" : "L";
}

function convertWireEndpointsForDirectionalSplice(
  state: AppState,
  spliceId: string,
  originalPortCount: number
): EntityState<Wire, WireId> {
  const nextWiresById = { ...state.wires.byId };
  for (const wireId of state.wires.allIds) {
    const wire = state.wires.byId[wireId];
    if (wire === undefined) {
      continue;
    }

    let endpointA = wire.endpointA;
    let endpointB = wire.endpointB;
    if (endpointA.kind === "splicePort" && endpointA.spliceId === spliceId) {
      endpointA = normalizeDirectionalSpliceEndpoint(
        endpointA,
        resolveConvertedEndpointSide(state, endpointA, wire.routeSegmentIds, "A", originalPortCount)
      );
    }
    if (endpointB.kind === "splicePort" && endpointB.spliceId === spliceId) {
      endpointB = normalizeDirectionalSpliceEndpoint(
        endpointB,
        resolveConvertedEndpointSide(state, endpointB, wire.routeSegmentIds, "B", originalPortCount)
      );
    }

    if (endpointA !== wire.endpointA || endpointB !== wire.endpointB) {
      nextWiresById[wireId] = {
        ...wire,
        endpointA,
        endpointB
      };
    }
  }

  return {
    ...state.wires,
    byId: nextWiresById
  };
}

export function handleSpliceActions(state: AppState, action: AppAction): AppState | null {
  switch (action.type) {
    case "splice/upsert": {
      const normalizedName = action.payload.name.trim();
      const normalizedTechnicalId = action.payload.technicalId.trim();
      let portMode = normalizeSplicePortMode(action.payload.portMode);
      let portCount = action.payload.portCount;
      if (action.payload.id.trim().length === 0) {
        return withError(state, "Splice ID is required.");
      }
      if (normalizedName.length === 0 || normalizedTechnicalId.length === 0) {
        return withError(state, "Splice name and technical ID are required.");
      }
      const linkedCatalogItem =
        action.payload.catalogItemId === undefined ? undefined : state.catalogItems.byId[action.payload.catalogItemId];
      if (action.payload.catalogItemId !== undefined && linkedCatalogItem === undefined) {
        return withError(state, "Splice catalog item is invalid.");
      }
      if (portMode === "directional") {
        portCount = DIRECTIONAL_SPLICE_PORT_COUNT;
      } else if (linkedCatalogItem !== undefined) {
        portMode = "bounded";
        portCount = linkedCatalogItem.connectionCount;
      }

      if (portMode === "bounded" && (!Number.isInteger(portCount) || portCount < 1)) {
        return withError(state, "Splice portCount must be an integer >= 1.");
      }
      if (portMode === "unbounded") {
        portCount = normalizeUnboundedPortCountFallback(portCount);
      }

      if (hasDuplicateSpliceTechnicalId(state, action.payload.id, normalizedTechnicalId)) {
        return withError(state, `Splice technical ID '${normalizedTechnicalId}' is already used.`);
      }

      if (portMode === "bounded") {
        const occupancy = state.splicePortOccupancy[action.payload.id];
        if (occupancy !== undefined) {
          const hasOutOfRangeOccupancy = Object.keys(occupancy)
            .map((key) => Number(key))
            .some((slot) => slot > portCount);

          if (hasOutOfRangeOccupancy) {
            return withError(
              state,
              "Splice portCount cannot be reduced below occupied port indexes."
            );
          }
        }
        if (hasWireEndpointIndexOutOfRange(state, action.payload.id, portCount)) {
          return withError(state, "Splice portCount cannot be reduced below wire endpoint port indexes.");
        }
      }
      if (portMode === "directional") {
        const nextSplicePortOccupancy = { ...state.splicePortOccupancy };
        delete nextSplicePortOccupancy[action.payload.id];
        return bumpRevision({
          ...clearLastError(state),
          splicePortOccupancy: nextSplicePortOccupancy,
          splices: upsertEntity(state.splices, {
            ...action.payload,
            name: normalizedName,
            technicalId: normalizedTechnicalId,
            portMode,
            portCount,
            sideInverted: action.payload.sideInverted === true,
            manufacturerReference:
              linkedCatalogItem !== undefined
                ? linkedCatalogItem.manufacturerReference
                : normalizeManufacturerReference(action.payload.manufacturerReference)
          })
        });
      }

      return bumpRevision({
        ...clearLastError(state),
        splices: upsertEntity(state.splices, {
          ...action.payload,
          name: normalizedName,
          technicalId: normalizedTechnicalId,
          portMode,
          portCount,
          sideInverted: action.payload.sideInverted === true,
          manufacturerReference:
            linkedCatalogItem !== undefined
              ? linkedCatalogItem.manufacturerReference
              : normalizeManufacturerReference(action.payload.manufacturerReference)
        })
      });
    }

    case "splice/convertToDirectional": {
      const splice = state.splices.byId[action.payload.id];
      if (splice === undefined) {
        return withError(state, "Cannot convert unknown splice.");
      }
      if (resolveSplicePortMode(splice) === "directional") {
        return clearLastError(state);
      }

      const convertedSplice = {
        ...splice,
        portMode: "directional" as const,
        portCount: DIRECTIONAL_SPLICE_PORT_COUNT,
        sideInverted: false
      };
      const transientState: AppState = {
        ...state,
        splices: upsertEntity(state.splices, convertedSplice)
      };
      const nextSplicePortOccupancy = { ...state.splicePortOccupancy };
      delete nextSplicePortOccupancy[action.payload.id];

      return bumpRevision({
        ...clearLastError(state),
        splices: upsertEntity(state.splices, convertedSplice),
        wires: convertWireEndpointsForDirectionalSplice(transientState, action.payload.id, splice.portCount),
        splicePortOccupancy: nextSplicePortOccupancy
      });
    }

    case "splice/rerouteConnectedWires": {
      const splice = state.splices.byId[action.payload.id];
      if (splice === undefined) {
        return withError(state, "Cannot reroute wires for unknown splice.");
      }

      const nextWiresById = { ...state.wires.byId };
      let touchedWireCount = 0;
      for (const wireId of state.wires.allIds) {
        const wire = state.wires.byId[wireId];
        if (
          wire === undefined ||
          !(
            (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === splice.id) ||
            (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === splice.id)
          )
        ) {
          continue;
        }

        const recomputed = recomputeWireRouteAndDirectionalEndpoints(state, {
          ...wire,
          isRouteLocked: false
        });
        if (!("wire" in recomputed)) {
          return withError(state, recomputed.error);
        }

        nextWiresById[wireId] = recomputed.wire;
        touchedWireCount += 1;
      }

      if (touchedWireCount === 0) {
        return clearLastError(state);
      }

      return bumpRevision({
        ...clearLastError(state),
        wires: {
          ...state.wires,
          byId: nextWiresById
        }
      });
    }

    case "splice/applyOptimizedPlacement": {
      const splice = state.splices.byId[action.payload.id];
      if (splice === undefined) {
        return withError(state, "Cannot optimize placement for unknown splice.");
      }
      const node = state.nodes.byId[action.payload.nodeId];
      if (node?.kind !== "splice" || node.spliceId !== splice.id) {
        return withError(state, "Cannot optimize placement without the linked splice node.");
      }

      const nextSegmentsById = { ...state.segments.byId };
      for (const [segmentId, lengthMm] of Object.entries(action.payload.segmentLengths)) {
        const typedSegmentId = segmentId as SegmentId;
        const segment = state.segments.byId[typedSegmentId];
        if (segment === undefined) {
          return withError(state, "Cannot optimize placement because a target segment is missing.");
        }
        if (!Number.isFinite(lengthMm) || lengthMm < 1) {
          return withError(state, "Cannot optimize placement because a target segment length is invalid.");
        }
        nextSegmentsById[typedSegmentId] = {
          ...segment,
          lengthMm
        };
      }

      const transientState: AppState = {
        ...state,
        nodePositions: {
          ...state.nodePositions,
          [action.payload.nodeId]: action.payload.position
        },
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
        return withError(state, "Cannot optimize placement because the splice has no connected wires.");
      }

      return bumpRevision({
        ...clearLastError(state),
        nodePositions: transientState.nodePositions,
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

    case "splice/remove": {
      if (hasSpliceNodeReference(state, action.payload.id)) {
        return withError(state, "Cannot remove splice while a splice node references it.");
      }
      if (hasWireEndpointReferenceOnSplice(state, action.payload.id)) {
        return withError(state, "Cannot remove splice while wire endpoints reference it.");
      }

      const nextSplicePortOccupancy = { ...state.splicePortOccupancy };
      delete nextSplicePortOccupancy[action.payload.id];

      return bumpRevision({
        ...clearLastError(state),
        splices: removeEntity(state.splices, action.payload.id),
        splicePortOccupancy: nextSplicePortOccupancy,
        ui: shouldClearSelection(state.ui.selected, "splice", action.payload.id)
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    case "splice/removeCascade": {
      const impact = analyzeSpliceDeleteImpact(state, action.payload.id);
      if (impact.kind === "direct") {
        return handleSpliceActions(state, { type: "splice/remove", payload: action.payload });
      }
      if (impact.kind !== "cascade") {
        return withError(state, "Cannot cascade remove splice while higher-level dependencies still reference it.");
      }

      const nextNodes = impact.linkedNodeIds.reduce((current, nodeId) => removeEntity(current, nodeId), state.nodes);
      const nextNodePositions = { ...state.nodePositions };
      for (const nodeId of impact.linkedNodeIds) {
        delete nextNodePositions[nodeId];
      }
      const nextSplicePortOccupancy = { ...state.splicePortOccupancy };
      delete nextSplicePortOccupancy[action.payload.id];
      const shouldClearCurrentSelection =
        shouldClearSelection(state.ui.selected, "splice", action.payload.id) ||
        impact.linkedNodeIds.some((nodeId) => shouldClearSelection(state.ui.selected, "node", nodeId));

      return bumpRevision({
        ...clearLastError(state),
        splices: removeEntity(state.splices, action.payload.id),
        nodes: nextNodes,
        nodePositions: nextNodePositions,
        splicePortOccupancy: nextSplicePortOccupancy,
        ui: shouldClearCurrentSelection
          ? { ...state.ui, selected: null, lastError: null }
          : { ...state.ui, lastError: null }
      });
    }

    case "splice/occupyPort": {
      const splice = state.splices.byId[action.payload.spliceId];
      if (splice === undefined) {
        return withError(state, "Cannot occupy port on unknown splice.");
      }

      if (!isValidSplicePortIndexForMode(splice, action.payload.portIndex)) {
        console.warn("Rejected splice occupancy write with out-of-range port index.", {
          spliceId: action.payload.spliceId,
          portIndex: action.payload.portIndex,
          portMode: splice.portMode ?? "bounded",
          portCount: splice.portCount
        });
        return state;
      }

      const occupantRef = action.payload.occupantRef.trim();
      if (occupantRef.length === 0) {
        return withError(state, "Occupant reference must be non-empty.");
      }

      const spliceOccupancy = state.splicePortOccupancy[action.payload.spliceId] ?? {};
      const currentOccupant = spliceOccupancy[action.payload.portIndex];
      if (currentOccupant !== undefined && currentOccupant !== occupantRef) {
        return withError(
          state,
          `Port ${action.payload.portIndex} is already occupied by '${currentOccupant}'.`
        );
      }

      if (currentOccupant === occupantRef && state.ui.lastError === null) {
        return state;
      }

      return bumpRevision({
        ...clearLastError(state),
        splicePortOccupancy: {
          ...state.splicePortOccupancy,
          [action.payload.spliceId]: {
            ...spliceOccupancy,
            [action.payload.portIndex]: occupantRef
          }
        }
      });
    }

    case "splice/releasePort": {
      const splice = state.splices.byId[action.payload.spliceId];
      if (splice === undefined) {
        return withError(state, "Cannot release port on unknown splice.");
      }

      if (!isValidSplicePortIndexForMode(splice, action.payload.portIndex)) {
        console.warn("Rejected splice occupancy release with out-of-range port index.", {
          spliceId: action.payload.spliceId,
          portIndex: action.payload.portIndex,
          portMode: splice.portMode ?? "bounded",
          portCount: splice.portCount
        });
        return state;
      }

      const spliceOccupancy = state.splicePortOccupancy[action.payload.spliceId];
      if (spliceOccupancy === undefined || spliceOccupancy[action.payload.portIndex] === undefined) {
        return clearLastError(state);
      }

      const nextSpliceOccupancy = { ...spliceOccupancy };
      delete nextSpliceOccupancy[action.payload.portIndex];

      const nextSplicePortOccupancy = { ...state.splicePortOccupancy };
      if (Object.keys(nextSpliceOccupancy).length === 0) {
        delete nextSplicePortOccupancy[action.payload.spliceId];
      } else {
        nextSplicePortOccupancy[action.payload.spliceId] = nextSpliceOccupancy;
      }

      return bumpRevision({
        ...clearLastError(state),
        splicePortOccupancy: nextSplicePortOccupancy
      });
    }

    default:
      return null;
  }
}
