import type { NodeId, Wire, WireId, WireRouteEndpointDetail } from "../../../core/entities";
import { normalizeDirectionalSpliceEndpoint } from "../../../core/directionalSplice";
import type { AppState, EntityState } from "../../types";
import {
  computeForcedRouteWithAnchors,
  computeShortestWireRoute,
  resolveWireEndpointAnchor
} from "./derivedWireRouting";
import { resolveDirectionalSpliceEndpointSide } from "./directionalSpliceSide";

export { getEndpointKey, findNodeIdForEndpoint, getEndpointValidationError } from "./wireEndpointHelpers";
export {
  type WireEndpointAnchor,
  type ComputedWireRoute,
  resolveWireEndpointAnchor,
  computeForcedRouteWithAnchors,
  computeForcedRouteLength,
  computeShortestWireRoute
} from "./derivedWireRouting";
export { resolveDirectionalSpliceEndpointSide } from "./directionalSpliceSide";

export function recomputeWireRouteAndDirectionalEndpoints(
  state: AppState,
  wire: Wire
): { wire: Wire } | { error: string } {
  const anchorAResult = resolveWireEndpointAnchor(state, wire.endpointA);
  const anchorBResult = resolveWireEndpointAnchor(state, wire.endpointB);
  if ("error" in anchorAResult || "error" in anchorBResult) {
    const reason = "error" in anchorAResult ? anchorAResult.error : ("error" in anchorBResult ? anchorBResult.error : "");
    return { error: `Wire '${wire.technicalId}': ${reason}` };
  }

  const anchorA = anchorAResult.anchor;
  const anchorB = anchorBResult.anchor;

  let routeSegmentIds = wire.routeSegmentIds;
  let routeEndpointDetailA: WireRouteEndpointDetail | undefined;
  let routeEndpointDetailB: WireRouteEndpointDetail | undefined;
  let lengthMm = wire.lengthMm;
  let isRouteLocked = wire.isRouteLocked;
  let exitNodeIdHintA: NodeId | null = null;
  let exitNodeIdHintB: NodeId | null = null;

  if (wire.isRouteLocked) {
    const forced = computeForcedRouteWithAnchors(state, anchorA, anchorB, wire.routeSegmentIds);
    if (forced === null) {
      return { error: `Locked route for wire '${wire.technicalId}' is no longer valid.` };
    }
    lengthMm = forced.lengthMm;
    routeEndpointDetailA = forced.detailA;
    routeEndpointDetailB = forced.detailB;
  } else {
    const computedRoute = computeShortestWireRoute(state, anchorA, anchorB);
    if (computedRoute === null) {
      return { error: `No route found for wire '${wire.technicalId}'.` };
    }

    routeSegmentIds = computedRoute.routeSegmentIds;
    lengthMm = computedRoute.lengthMm;
    routeEndpointDetailA = computedRoute.detailA;
    routeEndpointDetailB = computedRoute.detailB;
    exitNodeIdHintA = computedRoute.exitNodeIdHintA;
    exitNodeIdHintB = computedRoute.exitNodeIdHintB;
    isRouteLocked = false;
  }

  let endpointA = wire.endpointA;
  let endpointB = wire.endpointB;
  const endpointASide = resolveDirectionalSpliceEndpointSide(state, endpointA, routeSegmentIds, "A", exitNodeIdHintA);
  if (endpointASide !== null) {
    endpointA = normalizeDirectionalSpliceEndpoint(endpointA, endpointASide);
  }
  const endpointBSide = resolveDirectionalSpliceEndpointSide(state, endpointB, routeSegmentIds, "B", exitNodeIdHintB);
  if (endpointBSide !== null) {
    endpointB = normalizeDirectionalSpliceEndpoint(endpointB, endpointBSide);
  }

  return {
    wire: {
      ...wire,
      endpointA,
      endpointB,
      routeSegmentIds,
      routeEndpointDetailA,
      routeEndpointDetailB,
      lengthMm,
      isRouteLocked
    }
  };
}

export function recomputeAllWiresForNetwork(state: AppState): { wires: EntityState<Wire, WireId> } | { error: string } {
  if (state.wires.allIds.length === 0) {
    return { wires: state.wires };
  }

  const nextWiresById: Record<WireId, Wire> = { ...state.wires.byId };

  for (const wireId of state.wires.allIds) {
    const wire = state.wires.byId[wireId];
    if (wire === undefined) {
      continue;
    }

    const recomputed = recomputeWireRouteAndDirectionalEndpoints(state, wire);
    if (!("wire" in recomputed)) {
      return recomputed;
    }

    nextWiresById[wireId] = recomputed.wire;
  }

  return {
    wires: {
      byId: nextWiresById,
      allIds: state.wires.allIds
    }
  };
}
