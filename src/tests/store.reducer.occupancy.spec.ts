import { describe, expect, it, vi } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import { asConnectorId, asSpliceId } from "./helpers/store-reducer-test-utils";

describe("appReducer occupancy guards", () => {
  it("rejects out-of-range connector cavity writes without mutating the occupancy map", () => {
    const baseState = appReducer(
      createInitialState(),
      appActions.upsertConnector({
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-1",
        cavityCount: 2
      })
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const nextState = appReducer(baseState, appActions.occupyConnectorCavity(asConnectorId("C1"), 3, "wire:W1:A"));

    expect(nextState).toBe(baseState);
    expect(nextState.connectorCavityOccupancy).toEqual(baseState.connectorCavityOccupancy);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it("rejects out-of-range splice port writes without mutating the occupancy map", () => {
    const baseState = appReducer(
      createInitialState(),
      appActions.upsertSplice({
        id: asSpliceId("S1"),
        name: "Splice 1",
        technicalId: "S-1",
        portCount: 2
      })
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const nextState = appReducer(baseState, appActions.occupySplicePort(asSpliceId("S1"), 3, "wire:W1:B"));

    expect(nextState).toBe(baseState);
    expect(nextState.splicePortOccupancy).toEqual(baseState.splicePortOccupancy);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });
});
