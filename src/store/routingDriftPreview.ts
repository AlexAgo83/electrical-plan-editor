import type { NetworkId } from "../core/entities";
import { describeWireRecomputeChange } from "./reducer/helpers/wireRecomputeReport";
import { recomputeWireRouteAndDirectionalEndpoints } from "./reducer/helpers/wireTransitions";
import type { AppState, WireRecomputeReportEntry } from "./types";

/**
 * Read-only outcome of previewing the manual full-network recompute (Network >
 * Recompute routes) for the active network. `failed` is never a consistent
 * result: the recompute could not run, so drift is unknown.
 */
export type RoutingDriftPreview =
  | { status: "consistent"; networkId: NetworkId }
  | { status: "drift"; networkId: NetworkId; entries: WireRecomputeReportEntry[] }
  | { status: "failed"; networkId: NetworkId; error: string };

export interface RoutingDriftPreviewJob {
  /**
   * Processes wires in recompute order until `shouldYield()` returns true. Returns the
   * final preview once every wire was processed (or the first failure), else `null`.
   */
  step(shouldYield: () => boolean): RoutingDriftPreview | null;
}

/**
 * Creates a resumable, read-only preview of precisely the same per-wire computation
 * as `wire/recomputeAll` (`recomputeAllWiresForNetwork` + recompute report): every
 * wire is recomputed against the unchanged input state, in the same order, and the
 * first failing wire aborts the preview like it aborts the manual recompute.
 * Returns `null` when no network is active.
 */
export function createRoutingDriftPreviewJob(state: AppState): RoutingDriftPreviewJob | null {
  const networkId = state.activeNetworkId;
  if (networkId === null) {
    return null;
  }

  const wireIds = state.wires.allIds;
  const entries: WireRecomputeReportEntry[] = [];
  let cursor = 0;
  let outcome: RoutingDriftPreview | null = null;

  return {
    step(shouldYield) {
      while (outcome === null) {
        if (cursor >= wireIds.length) {
          outcome = entries.length === 0 ? { status: "consistent", networkId } : { status: "drift", networkId, entries };
          break;
        }
        const wireId = wireIds[cursor];
        cursor += 1;
        const wire = wireId === undefined ? undefined : state.wires.byId[wireId];
        if (wire === undefined) {
          continue;
        }
        try {
          const recomputed = recomputeWireRouteAndDirectionalEndpoints(state, wire);
          if (!("wire" in recomputed)) {
            outcome = { status: "failed", networkId, error: recomputed.error };
            break;
          }
          const entry = describeWireRecomputeChange(wire, recomputed.wire);
          if (entry !== null) {
            entries.push(entry);
          }
        } catch (error) {
          outcome = { status: "failed", networkId, error: error instanceof Error ? error.message : String(error) };
          break;
        }
        if (shouldYield()) {
          return null;
        }
      }
      return outcome;
    }
  };
}

/**
 * Runs the whole preview synchronously. Returns `null` when no network is active.
 * An empty network is consistent.
 */
export function previewActiveNetworkRoutingDrift(state: AppState): RoutingDriftPreview | null {
  return createRoutingDriftPreviewJob(state)?.step(() => false) ?? null;
}

/**
 * Identity tuple of every state slice the full-network recompute reads. The store
 * is immutable, so the tuple only changes when a routing-relevant input changes;
 * selection, viewport, locale, workspace naming and network metadata edits keep it.
 */
export function selectRoutingDriftInputs(state: AppState): readonly unknown[] {
  return [
    state.activeNetworkId,
    state.wires,
    state.segments,
    state.nodes,
    state.nodePositions,
    state.splices,
    state.connectors
  ];
}

export function sameRoutingDriftInputs(left: readonly unknown[], right: readonly unknown[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
