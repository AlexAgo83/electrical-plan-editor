import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SegmentId } from "../core/entities";
import { appActions, appReducer, type AppState } from "../store";
import {
  ROUTING_DRIFT_CHECK_DEBOUNCE_MS,
  useRoutingDriftDiagnostics
} from "../app/hooks/validation/useRoutingDriftDiagnostics";
import { buildRoutingDriftValidationIssues } from "../app/hooks/validation/buildRoutingDriftValidationIssues";
import { setActiveLocale } from "../app/lib/i18n";
import { buildSyntheticRoutingNetworkState } from "./helpers/routing-drift-fixtures";

function buildState(): AppState {
  return buildSyntheticRoutingNetworkState({ gridSize: 4, connectorCount: 8, spliceCount: 2, wireCount: 20, seed: 5 });
}

function withSegmentLength(state: AppState, lengthMm: number): AppState {
  const routedWire = state.wires.allIds.map((id) => state.wires.byId[id]).find((wire) => (wire?.routeSegmentIds.length ?? 0) > 0);
  const segmentId = routedWire?.routeSegmentIds[0] as SegmentId;
  const segment = state.segments.byId[segmentId]!;
  return { ...state, segments: { ...state.segments, byId: { ...state.segments.byId, [segmentId]: { ...segment, lengthMm } } } };
}

function createCountingScheduler() {
  const scheduler = vi.fn((callback: () => void) => {
    const handle = setTimeout(callback, 0);
    return () => clearTimeout(handle);
  });
  return scheduler;
}

async function flushCheck(): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ROUTING_DRIFT_CHECK_DEBOUNCE_MS + 50);
  });
}

describe("useRoutingDriftDiagnostics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    setActiveLocale("en");
  });

  it("stays pending until the debounced check completes, then reports consistency", async () => {
    const state = buildState();
    const { result } = renderHook(({ current }) => useRoutingDriftDiagnostics(current), { initialProps: { current: state } });
    expect(result.current.status).toEqual({ kind: "pending" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ROUTING_DRIFT_CHECK_DEBOUNCE_MS - 10);
    });
    expect(result.current.status).toEqual({ kind: "pending" });
    await flushCheck();
    expect(result.current.status).toEqual({ kind: "consistent" });
  });

  it("never keeps an old all-clear after a routing edit and reports the new drift", async () => {
    const state = buildState();
    const { result, rerender } = renderHook(({ current }) => useRoutingDriftDiagnostics(current), { initialProps: { current: state } });
    await flushCheck();
    expect(result.current.status.kind).toBe("consistent");

    rerender({ current: withSegmentLength(state, 4000) });
    expect(result.current.status).toEqual({ kind: "pending" });
    expect(result.current.preview).toBeNull();
    await flushCheck();
    expect(result.current.status.kind).toBe("drift");
  });

  it("ignores selection changes and coalesces rapid routing edits into one check", async () => {
    const state = buildState();
    const scheduler = createCountingScheduler();
    const { result, rerender } = renderHook(({ current }) => useRoutingDriftDiagnostics(current, { scheduler }), {
      initialProps: { current: state }
    });
    await flushCheck();
    const slicesAfterFirstCheck = scheduler.mock.calls.length;

    rerender({ current: appReducer(state, appActions.select({ kind: "wire", id: state.wires.allIds[0]! })) });
    expect(result.current.status.kind).toBe("consistent");
    await flushCheck();
    expect(scheduler.mock.calls.length).toBe(slicesAfterFirstCheck);

    for (const length of [1000, 2000, 3000, 4000]) {
      rerender({ current: withSegmentLength(state, length) });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
    }
    await flushCheck();
    expect(scheduler.mock.calls.length).toBe(slicesAfterFirstCheck + 1);
    expect(result.current.status.kind).toBe("drift");
  });

  it("discards an obsolete run when inputs change mid-check", async () => {
    const state = buildState();
    const drifted = withSegmentLength(state, 5000);
    const { result, rerender } = renderHook(
      ({ current }) => useRoutingDriftDiagnostics(current, { sliceBudgetMs: 0 }),
      { initialProps: { current: drifted } }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ROUTING_DRIFT_CHECK_DEBOUNCE_MS + 1);
    });
    // The drifted run is sliced (one wire per slice) and still in flight.
    rerender({ current: state });
    expect(result.current.status).toEqual({ kind: "pending" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ROUTING_DRIFT_CHECK_DEBOUNCE_MS + 1000);
    });
    expect(result.current.status).toEqual({ kind: "consistent" });
  });

  it("reuses cached results when returning to earlier inputs (undo, network switch back)", async () => {
    const state = buildState();
    const drifted = withSegmentLength(state, 5000);
    const scheduler = createCountingScheduler();
    const { result, rerender } = renderHook(({ current }) => useRoutingDriftDiagnostics(current, { scheduler }), {
      initialProps: { current: state }
    });
    await flushCheck();
    rerender({ current: drifted });
    await flushCheck();
    const callsBeforeUndo = scheduler.mock.calls.length;
    rerender({ current: state });
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.status.kind).toBe("consistent");
    expect(scheduler.mock.calls.length).toBe(callsBeforeUndo);
  });

  it("reports failed previews explicitly and is idle without an active network", async () => {
    const state = buildState();
    const wireId = state.wires.allIds.find((id) => (state.wires.byId[id]?.routeSegmentIds.length ?? 0) >= 2)!;
    const wire = state.wires.byId[wireId]!;
    const broken: AppState = {
      ...state,
      wires: {
        ...state.wires,
        byId: { ...state.wires.byId, [wireId]: { ...wire, isRouteLocked: true, routeSegmentIds: [...wire.routeSegmentIds].reverse() } }
      }
    };
    const { result, rerender } = renderHook(({ current }) => useRoutingDriftDiagnostics(current), { initialProps: { current: broken } });
    await flushCheck();
    expect(result.current.status).toEqual({ kind: "failed" });

    rerender({ current: { ...state, activeNetworkId: null } });
    expect(result.current.status).toEqual({ kind: "idle" });
  });
});

describe("buildRoutingDriftValidationIssues", () => {
  afterEach(() => {
    setActiveLocale("en");
  });

  it("builds stable network and wire warnings with the recompute path, localized", () => {
    const networkId = "net-a" as never;
    const preview = {
      status: "drift" as const,
      networkId,
      entries: [
        { wireId: "W-1" as never, technicalId: "W-1", kinds: ["length" as const], message: "Wire 'W-1': length 10 -> 12 mm." },
        { wireId: "W-2" as never, technicalId: "W-2", kinds: ["sideB" as const], message: "Wire 'W-2': splice side B unset -> L." }
      ]
    };
    const issues = buildRoutingDriftValidationIssues(preview, "NET-A");
    expect(issues.map((issue) => issue.id)).toEqual(["routing-drift-network-net-a", "routing-drift-wire-W-1", "routing-drift-wire-W-2"]);
    expect(issues.every((issue) => issue.severity === "warning")).toBe(true);
    expect(issues[0]).toMatchObject({ selectionKind: "network", selectionId: "net-a" });
    expect(issues[0]?.message).toContain("2 wires");
    expect(issues[0]?.message).toContain("Network Scope > Recompute routes");
    expect(issues[2]?.message).toContain("W-2");

    setActiveLocale("fr");
    const frIssues = buildRoutingDriftValidationIssues(preview, "NET-A");
    expect(frIssues[0]?.category).toBe("Cohérence du routage");
    expect(frIssues[0]?.message).toContain("Périmètre réseau > Recalculer les trajets");
  });

  it("returns nothing for consistent or pending previews and one distinct warning for failures", () => {
    expect(buildRoutingDriftValidationIssues(null, "NET-A")).toEqual([]);
    expect(buildRoutingDriftValidationIssues({ status: "consistent", networkId: "net-a" as never }, "NET-A")).toEqual([]);
    const failed = buildRoutingDriftValidationIssues({ status: "failed", networkId: "net-a" as never, error: "boom" }, "NET-A");
    expect(failed).toHaveLength(1);
    expect(failed[0]).toMatchObject({ id: "routing-drift-unavailable-net-a", severity: "warning", selectionKind: "network" });
  });
});
