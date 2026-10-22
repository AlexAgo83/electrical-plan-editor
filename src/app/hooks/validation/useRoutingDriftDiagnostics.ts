import { useEffect, useMemo, useRef, useState } from "react";
import type { AppStore, RoutingDriftPreview } from "../../../store";
import { createRoutingDriftPreviewJob, sameRoutingDriftInputs, selectRoutingDriftInputs } from "../../../store";

type AppState = ReturnType<AppStore["getState"]>;

/** Debounce after the latest routing-relevant change before a check starts (AC6). */
export const ROUTING_DRIFT_CHECK_DEBOUNCE_MS = 500;
/** Main-thread budget of one preview slice; slices yield between each other. */
export const ROUTING_DRIFT_SLICE_BUDGET_MS = 8;
const ROUTING_DRIFT_CACHE_SIZE = 8;

export type RoutingDriftStatus =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "consistent" }
  | { kind: "drift"; wireCount: number }
  | { kind: "failed" };

export interface RoutingDriftDiagnostics {
  status: RoutingDriftStatus;
  /** Result for the current routing inputs, or `null` while pending / not applicable. */
  preview: RoutingDriftPreview | null;
}

interface CachedPreview {
  inputs: readonly unknown[];
  preview: RoutingDriftPreview | null;
}

type IdleScheduler = (callback: () => void) => () => void;

function scheduleSlice(callback: () => void): () => void {
  const host = globalThis as typeof globalThis & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };
  if (typeof host.requestIdleCallback === "function" && typeof host.cancelIdleCallback === "function") {
    const handle = host.requestIdleCallback(callback, { timeout: 1000 });
    return () => host.cancelIdleCallback?.(handle);
  }
  const handle = setTimeout(callback, 0);
  return () => clearTimeout(handle);
}

function measureSlice(startMark: number): void {
  if (typeof performance.measure !== "function") {
    return;
  }
  try {
    performance.measure("routing-drift-slice", { start: startMark, end: performance.now() });
  } catch {
    // Instrumentation only; unsupported measure options must never affect diagnostics.
  }
}

/**
 * Read-only, cached diagnostics comparing the active network with the result the
 * manual Network > Recompute routes action would produce. Checks run after the
 * latest routing-relevant change (initial restore, import, workspace activation and
 * network switch included) once {@link ROUTING_DRIFT_CHECK_DEBOUNCE_MS} elapsed,
 * in idle-time slices of at most {@link ROUTING_DRIFT_SLICE_BUDGET_MS}. Results are
 * cached by routing input identity, obsolete runs are cancelled, and nothing is ever
 * dispatched: no state mutation, revision bump, dirty flag, history entry or dialog.
 */
export function useRoutingDriftDiagnostics(
  state: AppState,
  options: { debounceMs?: number; sliceBudgetMs?: number; scheduler?: IdleScheduler } = {}
): RoutingDriftDiagnostics {
  const { activeNetworkId, wires, segments, nodes, nodePositions, splices, connectors } = state;
  const inputs = useMemo(
    () => selectRoutingDriftInputs({ activeNetworkId, wires, segments, nodes, nodePositions, splices, connectors } as AppState),
    [activeNetworkId, wires, segments, nodes, nodePositions, splices, connectors]
  );
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const cacheRef = useRef<CachedPreview[]>([]);
  const [latest, setLatest] = useState<CachedPreview | null>(null);
  const debounceMs = options.debounceMs ?? ROUTING_DRIFT_CHECK_DEBOUNCE_MS;
  const sliceBudgetMs = options.sliceBudgetMs ?? ROUTING_DRIFT_SLICE_BUDGET_MS;
  const scheduler = options.scheduler ?? scheduleSlice;

  useEffect(() => {
    const cached = cacheRef.current.find((entry) => sameRoutingDriftInputs(entry.inputs, inputs));
    if (cached !== undefined) {
      setLatest(cached);
      return;
    }

    let cancelled = false;
    let cancelSlice: (() => void) | null = null;
    const debounceHandle = setTimeout(() => {
      const job = createRoutingDriftPreviewJob(stateRef.current);
      const finish = (preview: RoutingDriftPreview | null) => {
        const entry: CachedPreview = { inputs, preview };
        cacheRef.current = [entry, ...cacheRef.current].slice(0, ROUTING_DRIFT_CACHE_SIZE);
        setLatest(entry);
      };
      if (job === null) {
        finish(null);
        return;
      }
      const runSlice = () => {
        cancelSlice = null;
        if (cancelled) {
          return;
        }
        const startMark = performance.now();
        const result = job.step(() => performance.now() - startMark >= sliceBudgetMs);
        measureSlice(startMark);
        if (cancelled) {
          return;
        }
        if (result === null) {
          cancelSlice = scheduler(runSlice);
          return;
        }
        finish(result);
      };
      cancelSlice = scheduler(runSlice);
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(debounceHandle);
      cancelSlice?.();
    };
  }, [debounceMs, inputs, scheduler, sliceBudgetMs]);

  const current = latest !== null && sameRoutingDriftInputs(latest.inputs, inputs) ? latest : null;
  const preview = current?.preview ?? null;
  const status: RoutingDriftStatus =
    activeNetworkId === null
      ? { kind: "idle" }
      : current === null || preview === null
        ? { kind: "pending" }
        : preview.status === "drift"
          ? { kind: "drift", wireCount: preview.entries.length }
          : { kind: preview.status };
  return { status, preview: current === null ? null : preview };
}
