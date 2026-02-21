import { describe, expect, it } from "vitest";
import type { ConnectorId, SegmentId, WireId } from "../core/entities";
import {
  createInitialState,
  createSampleNetworkState,
  hasSampleNetworkSignature,
  isWorkspaceEmpty
} from "../store";

function asWireId(value: string): WireId {
  return value as WireId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

describe("sample network fixture", () => {
  it("creates a comprehensive deterministic sample state", () => {
    const state = createSampleNetworkState();

    expect(state.connectors.allIds.length).toBeGreaterThanOrEqual(3);
    expect(state.splices.allIds.length).toBeGreaterThanOrEqual(2);
    expect(state.nodes.allIds.length).toBeGreaterThanOrEqual(8);
    expect(state.segments.allIds.length).toBeGreaterThanOrEqual(9);
    expect(state.wires.allIds.length).toBeGreaterThanOrEqual(5);
    expect(state.ui.lastError).toBeNull();
    expect(hasSampleNetworkSignature(state)).toBe(true);
    expect(isWorkspaceEmpty(state)).toBe(false);
  });

  it("includes a locked-route wire scenario in the fixture", () => {
    const state = createSampleNetworkState();
    const lockedWire = state.wires.byId[asWireId("W-004")];

    expect(lockedWire).toBeDefined();
    expect(lockedWire?.isRouteLocked).toBe(true);
    expect(lockedWire?.routeSegmentIds).toEqual([
      asSegmentId("SEG-001"),
      asSegmentId("SEG-002"),
      asSegmentId("SEG-005"),
      asSegmentId("SEG-006")
    ]);
    expect(lockedWire?.lengthMm).toBe(120);
  });

  it("keeps source connector occupancy coherent for seeded wires", () => {
    const state = createSampleNetworkState();
    const sourceOccupancy = state.connectorCavityOccupancy[asConnectorId("C-SRC")];

    expect(sourceOccupancy?.[1]).toBe("wire:W-001:A");
    expect(sourceOccupancy?.[2]).toBe("wire:W-002:A");
    expect(sourceOccupancy?.[3]).toBe("wire:W-004:A");
  });

  it("identifies an empty initial state correctly", () => {
    const initialState = createInitialState();

    expect(isWorkspaceEmpty(initialState)).toBe(true);
    expect(hasSampleNetworkSignature(initialState)).toBe(false);
  });
});

