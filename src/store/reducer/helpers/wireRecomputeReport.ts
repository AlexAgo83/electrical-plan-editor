import type { Wire, WireId } from "../../../core/entities";
import type { AppState, EntityState, WireRecomputeChangeKind, WireRecomputeReportEntry } from "../../types";
import { recomputeAllWiresForNetwork } from "./wireTransitions";

export interface WireRecomputeReportResult {
  wires: EntityState<Wire, WireId>;
  report: WireRecomputeReportEntry[];
}

function describeEndpointSide(wire: Wire, side: "A" | "B"): string {
  const endpoint = side === "A" ? wire.endpointA : wire.endpointB;
  if (endpoint.kind !== "splicePort") {
    return "-";
  }
  return endpoint.spliceSideOverride ?? "-";
}

function sameRoute(before: readonly string[], after: readonly string[]): boolean {
  if (before.length !== after.length) {
    return false;
  }
  return before.every((segmentId, index) => segmentId === after[index]);
}

/**
 * Recompute every wire route and directional splice side for the active network
 * and build a deterministic before/after change report. Returns the recomputed
 * wire collection alongside one report entry per wire that actually changed
 * (route rewritten, length changed, or a directional splice side re-inferred on
 * endpoint A or B). An empty report means the network was already consistent.
 *
 * Recompute failures (e.g. an invalid locked route) are surfaced as
 * `{ error }` so callers can abort without committing a partial state.
 */
export function buildWireRecomputeReport(state: AppState): WireRecomputeReportResult | { error: string } {
  const recomputed = recomputeAllWiresForNetwork(state);
  if (!("wires" in recomputed)) {
    return recomputed;
  }

  const report: WireRecomputeReportEntry[] = [];
  for (const wireId of state.wires.allIds) {
    const before = state.wires.byId[wireId];
    const after = recomputed.wires.byId[wireId];
    if (before === undefined || after === undefined) {
      continue;
    }

    const kinds: WireRecomputeChangeKind[] = [];
    const details: string[] = [];

    if (!sameRoute(before.routeSegmentIds, after.routeSegmentIds)) {
      kinds.push("route");
      details.push(
        `route ${String(before.routeSegmentIds.length)} -> ${String(after.routeSegmentIds.length)} segment(s)`
      );
    }
    if (before.lengthMm !== after.lengthMm) {
      kinds.push("length");
      details.push(`length ${String(before.lengthMm)} -> ${String(after.lengthMm)} mm`);
    }

    for (const side of ["A", "B"] as const) {
      const beforeSide = describeEndpointSide(before, side);
      const afterSide = describeEndpointSide(after, side);
      if (beforeSide !== afterSide && beforeSide !== "-" && afterSide !== "-") {
        kinds.push(side === "A" ? "sideA" : "sideB");
        details.push(`splice side ${side} ${beforeSide} -> ${afterSide}`);
      }
    }

    if (kinds.length === 0) {
      continue;
    }

    report.push({
      wireId,
      technicalId: before.technicalId,
      kinds,
      message: `Wire '${before.technicalId}': ${details.join("; ")}.`
    });
  }

  return { wires: recomputed.wires, report };
}
