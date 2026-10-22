import { describe, expect, it } from "vitest";
import type { SegmentId, Wire, WireId } from "../core/entities";
import {
  appActions,
  appReducer,
  createInitialState,
  createRoutingDriftPreviewJob,
  previewActiveNetworkRoutingDrift,
  sameRoutingDriftInputs,
  selectRoutingDriftInputs,
  type AppState
} from "../store";
import { wirePersistedFieldsDiffer } from "../store/reducer/helpers/wireRecomputeReport";
import { buildSyntheticRoutingNetworkState } from "./helpers/routing-drift-fixtures";

function buildConsistentState(): AppState {
  return buildSyntheticRoutingNetworkState({ gridSize: 5, connectorCount: 12, spliceCount: 4, wireCount: 60, seed: 11 });
}

function withWire(state: AppState, wireId: WireId, update: (wire: Wire) => Wire): AppState {
  const wire = state.wires.byId[wireId];
  if (wire === undefined) {
    throw new Error(`Missing wire ${wireId}`);
  }
  return { ...state, wires: { ...state.wires, byId: { ...state.wires.byId, [wireId]: update(wire) } } };
}

/** Wire IDs whose persisted representation the real manual recompute changes. */
function actualRecomputeChanges(state: AppState): { changed: string[]; error: boolean; after: AppState } {
  const after = appReducer(state, appActions.recomputeAllWires());
  if (after.ui.lastRecomputeReport === undefined || after.ui.lastRecomputeReport === null) {
    return { changed: [], error: true, after };
  }
  const changed = state.wires.allIds.filter((wireId) => {
    const before = state.wires.byId[wireId];
    const next = after.wires.byId[wireId];
    return before !== undefined && next !== undefined && wirePersistedFieldsDiffer(before, next);
  });
  return { changed, error: false, after };
}

function expectParity(state: AppState): void {
  const preview = previewActiveNetworkRoutingDrift(state);
  const actual = actualRecomputeChanges(state);
  if (actual.error) {
    expect(preview?.status).toBe("failed");
    return;
  }
  const previewIds = preview?.status === "drift" ? preview.entries.map((entry) => entry.wireId) : [];
  expect(preview?.status).toBe(actual.changed.length === 0 ? "consistent" : "drift");
  expect(previewIds).toEqual(actual.changed);
  expect(actual.after.ui.lastRecomputeReport?.map((entry) => entry.wireId)).toEqual(previewIds);
}

describe("routing drift preview parity with the manual Network recompute", () => {
  it("reports a consistent network as consistent without changes", () => {
    const state = buildConsistentState();
    expect(previewActiveNetworkRoutingDrift(state)?.status).toBe("consistent");
    expectParity(state);
  });

  it("treats an empty network as consistent and no active network as not applicable", () => {
    const empty = createInitialState();
    expect(previewActiveNetworkRoutingDrift(empty)?.status).toBe("consistent");
    expect(previewActiveNetworkRoutingDrift({ ...empty, activeNetworkId: null })).toBeNull();
  });

  it("detects stale lengths and routes after a segment length change", () => {
    const state = buildConsistentState();
    const segmentId = state.segments.allIds.find((id) => id.startsWith("S-H-")) as SegmentId;
    const segment = state.segments.byId[segmentId]!;
    const stale = { ...state, segments: { ...state.segments, byId: { ...state.segments.byId, [segmentId]: { ...segment, lengthMm: 5000 } } } };
    const preview = previewActiveNetworkRoutingDrift(stale);
    expect(preview?.status).toBe("drift");
    expectParity(stale);
  });

  it("detects unset-to-set directional splice side transitions", () => {
    const state = buildConsistentState();
    const spliceWireId = state.wires.allIds.find((id) => state.wires.byId[id]?.endpointB.kind === "splicePort") as WireId;
    const stale = withWire(state, spliceWireId, (wire) => {
      if (wire.endpointB.kind !== "splicePort") {
        return wire;
      }
      const { spliceSideOverride: _ignored, ...endpointB } = wire.endpointB;
      void _ignored;
      return { ...wire, endpointB };
    });
    const preview = previewActiveNetworkRoutingDrift(stale);
    expect(preview?.status).toBe("drift");
    if (preview?.status === "drift") {
      const entry = preview.entries.find((candidate) => candidate.wireId === spliceWireId);
      expect(entry?.kinds).toContain("sideB");
      expect(entry?.message).toMatch(/splice side B unset -> [LR]/);
    }
    expectParity(stale);
  });

  it("detects endpoint route detail drift", () => {
    const state = buildConsistentState();
    const wireId = state.wires.allIds[3] as WireId;
    const stale = withWire(state, wireId, (wire) => ({
      ...wire,
      routeEndpointDetailA: { segmentId: wire.routeSegmentIds[0] as SegmentId, coveredLengthMm: 1 }
    }));
    const preview = previewActiveNetworkRoutingDrift(stale);
    expect(preview?.status).toBe("drift");
    if (preview?.status === "drift") {
      expect(preview.entries[0]?.kinds).toContain("endpointDetailA");
    }
    expectParity(stale);
  });

  it("preserves locked routes and reports only their stale length", () => {
    const state = buildConsistentState();
    const wireId = state.wires.allIds.find((id) => (state.wires.byId[id]?.routeSegmentIds.length ?? 0) >= 3) as WireId;
    const locked = withWire(state, wireId, (wire) => ({ ...wire, isRouteLocked: true, lengthMm: wire.lengthMm + 17 }));
    const preview = previewActiveNetworkRoutingDrift(locked);
    expect(preview?.status).toBe("drift");
    if (preview?.status === "drift") {
      expect(preview.entries.map((entry) => entry.wireId)).toEqual([wireId]);
      expect(preview.entries[0]?.kinds).toEqual(["length"]);
    }
    expectParity(locked);
  });

  it("reports an invalid locked route as failed, never consistent", () => {
    const state = buildConsistentState();
    const wireId = state.wires.allIds.find((id) => (state.wires.byId[id]?.routeSegmentIds.length ?? 0) >= 3) as WireId;
    const broken = withWire(state, wireId, (wire) => ({
      ...wire,
      isRouteLocked: true,
      routeSegmentIds: [...wire.routeSegmentIds].reverse()
    }));
    const preview = previewActiveNetworkRoutingDrift(broken);
    expect(preview?.status).toBe("failed");
    expectParity(broken);
  });

  it("produces identical results when processed in yielded slices", () => {
    const state = buildConsistentState();
    const segmentId = state.segments.allIds.find((id) => id.startsWith("S-V-")) as SegmentId;
    const segment = state.segments.byId[segmentId]!;
    const stale = { ...state, segments: { ...state.segments, byId: { ...state.segments.byId, [segmentId]: { ...segment, lengthMm: 3000 } } } };
    const job = createRoutingDriftPreviewJob(stale);
    let result = null;
    let slices = 0;
    while (result === null) {
      result = job?.step(() => true) ?? null;
      slices += 1;
    }
    expect(slices).toBeGreaterThan(stale.wires.allIds.length - 1);
    expect(result).toEqual(previewActiveNetworkRoutingDrift(stale));
  });

  it("never mutates the input state or bumps its revision", () => {
    const state = buildConsistentState();
    const snapshot = JSON.stringify(state);
    previewActiveNetworkRoutingDrift(state);
    expect(JSON.stringify(state)).toBe(snapshot);
  });
});

describe("routing drift inputs", () => {
  it("ignore selection, network metadata and theme changes but track routing inputs", () => {
    const state = buildConsistentState();
    const inputs = selectRoutingDriftInputs(state);
    const networkId = state.activeNetworkId!;
    const selected = appReducer(state, appActions.select({ kind: "wire", id: state.wires.allIds[0]! }));
    const renamed = appReducer(
      state,
      appActions.updateNetwork(networkId, "Renamed", "NET-SYNTH", "2026-10-22T10:00:00.000Z", undefined, { planRevision: "B" })
    );
    expect(sameRoutingDriftInputs(inputs, selectRoutingDriftInputs(selected))).toBe(true);
    expect(sameRoutingDriftInputs(inputs, selectRoutingDriftInputs(renamed))).toBe(true);
    const segmentId = state.segments.allIds[0]!;
    const resized = appReducer(state, appActions.upsertSegment({ ...state.segments.byId[segmentId]!, lengthMm: 999 }));
    expect(sameRoutingDriftInputs(inputs, selectRoutingDriftInputs(resized))).toBe(false);
  });
});
