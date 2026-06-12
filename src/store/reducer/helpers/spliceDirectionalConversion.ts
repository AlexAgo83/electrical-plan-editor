import {
  normalizeDirectionalSpliceEndpoint,
  type DirectionalSpliceSide
} from "../../../core/directionalSplice";
import type { SegmentId, Wire, WireEndpoint, WireId } from "../../../core/entities";
import type { AppState, EntityState } from "../../types";
import { resolveDirectionalSpliceEndpointSide } from "./directionalSpliceSide";

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

export function convertWireEndpointsForDirectionalSplice(
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
