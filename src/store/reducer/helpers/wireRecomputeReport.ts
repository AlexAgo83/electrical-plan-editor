import type { Wire, WireId, WireRouteEndpointDetail } from "../../../core/entities";
import type { AppState, EntityState, WireRecomputeChangeKind, WireRecomputeReportEntry } from "../../types";
import { recomputeAllWiresForNetwork } from "./wireTransitions";

export interface WireRecomputeReportResult {
  wires: EntityState<Wire, WireId>;
  report: WireRecomputeReportEntry[];
}

function describeEndpointSide(wire: Wire, side: "A" | "B"): string | null {
  const endpoint = side === "A" ? wire.endpointA : wire.endpointB;
  if (endpoint.kind !== "splicePort") {
    return null;
  }
  return endpoint.spliceSideOverride ?? "unset";
}

function sameRoute(before: readonly string[], after: readonly string[]): boolean {
  if (before.length !== after.length) {
    return false;
  }
  return before.every((segmentId, index) => segmentId === after[index]);
}

function describeEndpointDetail(detail: WireRouteEndpointDetail | undefined): string {
  return detail === undefined ? "unset" : `${detail.segmentId}@${String(detail.coveredLengthMm)}`;
}

/**
 * Canonical serialization with sorted keys and `undefined` members dropped, so
 * two wires compare equal exactly when every persisted field is equal.
 */
function canonicalize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}

/** True when the persisted representation of two wires differs in any field. */
export function wirePersistedFieldsDiffer(before: Wire, after: Wire): boolean {
  return canonicalize(before) !== canonicalize(after);
}

/**
 * Describes every persisted routing change between a stored wire and its recomputed
 * counterpart, or `null` when the wire would stay unchanged.
 */
export function describeWireRecomputeChange(before: Wire, after: Wire): WireRecomputeReportEntry | null {
  const kinds: WireRecomputeChangeKind[] = [];
  const details: string[] = [];

  if (!sameRoute(before.routeSegmentIds, after.routeSegmentIds)) {
    kinds.push("route");
    details.push(`route ${String(before.routeSegmentIds.length)} -> ${String(after.routeSegmentIds.length)} segment(s)`);
  }
  if (before.lengthMm !== after.lengthMm) {
    kinds.push("length");
    details.push(`length ${String(before.lengthMm)} -> ${String(after.lengthMm)} mm`);
  }

  for (const side of ["A", "B"] as const) {
    const beforeSide = describeEndpointSide(before, side);
    const afterSide = describeEndpointSide(after, side);
    const beforeEndpoint = side === "A" ? before.endpointA : before.endpointB;
    const afterEndpoint = side === "A" ? after.endpointA : after.endpointB;
    if (beforeSide !== afterSide || canonicalize(beforeEndpoint) !== canonicalize(afterEndpoint)) {
      kinds.push(side === "A" ? "sideA" : "sideB");
      details.push(`splice side ${side} ${beforeSide ?? "-"} -> ${afterSide ?? "-"}`);
    }
  }

  for (const side of ["A", "B"] as const) {
    const beforeDetail = side === "A" ? before.routeEndpointDetailA : before.routeEndpointDetailB;
    const afterDetail = side === "A" ? after.routeEndpointDetailA : after.routeEndpointDetailB;
    if (canonicalize(beforeDetail) !== canonicalize(afterDetail)) {
      kinds.push(side === "A" ? "endpointDetailA" : "endpointDetailB");
      details.push(
        `endpoint ${side} route detail ${describeEndpointDetail(beforeDetail)} -> ${describeEndpointDetail(afterDetail)}`
      );
    }
  }

  if (kinds.length === 0 && wirePersistedFieldsDiffer(before, after)) {
    kinds.push("other");
    details.push(before.isRouteLocked !== after.isRouteLocked ? "route lock state changed" : "routing fields changed");
  }

  if (kinds.length === 0) {
    return null;
  }

  return {
    wireId: before.id,
    technicalId: before.technicalId,
    kinds,
    message: `Wire '${before.technicalId}': ${details.join("; ")}.`
  };
}

/**
 * Recompute every wire route and directional splice side for the active network
 * and build a deterministic before/after change report. Returns the recomputed
 * wire collection alongside one report entry per wire whose persisted routing
 * output would change: ordered route, length, endpoint route details, directional
 * splice side (including unset -> set transitions) or any other persisted field.
 * An empty report means the network was already consistent.
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

    const entry = describeWireRecomputeChange(before, after);
    if (entry !== null) {
      report.push(entry);
    }
  }

  return { wires: recomputed.wires, report };
}
