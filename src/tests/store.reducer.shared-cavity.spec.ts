import { describe, expect, it } from "vitest";
import type { AppAction } from "../store/actions";
import { appActions, appReducer } from "../store";
import {
  asConnectorId,
  asNodeId,
  asSegmentId,
  asWireId,
  reduceAll
} from "./helpers/store-reducer-test-utils";

/**
 * Two connectors joined by a single segment, so wires can be routed between them.
 * C1 and C2 each expose several ways.
 */
const NETWORK_SETUP: AppAction[] = [
  appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 4 }),
  appActions.upsertConnector({ id: asConnectorId("C2"), name: "Connector 2", technicalId: "C-2", cavityCount: 4 }),
  appActions.upsertNode({ id: asNodeId("N-C1"), kind: "connector", connectorId: asConnectorId("C1") }),
  appActions.upsertNode({ id: asNodeId("N-C2"), kind: "connector", connectorId: asConnectorId("C2") }),
  appActions.upsertSegment({ id: asSegmentId("SEG1"), nodeA: asNodeId("N-C1"), nodeB: asNodeId("N-C2"), lengthMm: 100 })
];

function saveWire(
  id: string,
  technicalId: string,
  endpointA: { connectorId: string; cavityIndex: number; allowSharedCavity?: boolean },
  endpointB: { connectorId: string; cavityIndex: number }
): AppAction {
  return appActions.saveWire({
    id: asWireId(id),
    name: id,
    technicalId,
    endpointA: {
      kind: "connectorCavity",
      connectorId: asConnectorId(endpointA.connectorId),
      cavityIndex: endpointA.cavityIndex,
      ...(endpointA.allowSharedCavity === true ? { allowSharedCavity: true as const } : {})
    },
    endpointB: {
      kind: "connectorCavity",
      connectorId: asConnectorId(endpointB.connectorId),
      cavityIndex: endpointB.cavityIndex
    }
  });
}

describe("shared connector way (multi-wire crimp)", () => {
  it("rejects a second wire on an occupied way when overload is not opted into", () => {
    const state = reduceAll([
      ...NETWORK_SETUP,
      saveWire("W1", "W-1", { connectorId: "C1", cavityIndex: 1 }, { connectorId: "C2", cavityIndex: 1 })
    ]);

    const next = appReducer(
      state,
      saveWire("W2", "W-2", { connectorId: "C1", cavityIndex: 1 }, { connectorId: "C2", cavityIndex: 2 })
    );

    expect(next.ui.lastError?.message).toBe("Wire endpoint A is already occupied.");
    expect(next.wires.byId[asWireId("W2")]).toBeUndefined();
    expect(next.connectorCavityOccupancy[asConnectorId("C1")]?.[1]).toEqual(["wire:W1:A"]);
  });

  it("accepts a second wire on an occupied way when the incoming endpoint opts into overload", () => {
    const state = reduceAll([
      ...NETWORK_SETUP,
      saveWire("W1", "W-1", { connectorId: "C1", cavityIndex: 1 }, { connectorId: "C2", cavityIndex: 1 }),
      saveWire("W2", "W-2", { connectorId: "C1", cavityIndex: 1, allowSharedCavity: true }, { connectorId: "C2", cavityIndex: 2 })
    ]);

    expect(state.wires.byId[asWireId("W2")]).toBeDefined();
    expect(state.connectorCavityOccupancy[asConnectorId("C1")]?.[1]).toEqual(["wire:W1:A", "wire:W2:A"]);
    // The overload flag is preserved on the saved wire endpoint.
    const endpointA = state.wires.byId[asWireId("W2")]?.endpointA;
    expect(endpointA?.kind === "connectorCavity" && endpointA.allowSharedCavity).toBe(true);
  });

  it("has no upper bound on the number of wires sharing a way", () => {
    const state = reduceAll([
      ...NETWORK_SETUP,
      saveWire("W1", "W-1", { connectorId: "C1", cavityIndex: 1 }, { connectorId: "C2", cavityIndex: 1 }),
      saveWire("W2", "W-2", { connectorId: "C1", cavityIndex: 1, allowSharedCavity: true }, { connectorId: "C2", cavityIndex: 2 }),
      saveWire("W3", "W-3", { connectorId: "C1", cavityIndex: 1, allowSharedCavity: true }, { connectorId: "C2", cavityIndex: 3 })
    ]);

    expect(state.connectorCavityOccupancy[asConnectorId("C1")]?.[1]).toEqual([
      "wire:W1:A",
      "wire:W2:A",
      "wire:W3:A"
    ]);
  });

  it("releases only the removed occupant, keeping the remaining shared wire", () => {
    const state = reduceAll([
      ...NETWORK_SETUP,
      saveWire("W1", "W-1", { connectorId: "C1", cavityIndex: 1 }, { connectorId: "C2", cavityIndex: 1 }),
      saveWire("W2", "W-2", { connectorId: "C1", cavityIndex: 1, allowSharedCavity: true }, { connectorId: "C2", cavityIndex: 2 })
    ]);

    const afterRemove = appReducer(state, appActions.removeWire(asWireId("W1")));

    expect(afterRemove.connectorCavityOccupancy[asConnectorId("C1")]?.[1]).toEqual(["wire:W2:A"]);
  });
});
