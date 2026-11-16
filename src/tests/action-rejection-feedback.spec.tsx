import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, createAppStore, createEmptyWorkspaceState, type AppState } from "../store";
import type { AppAction } from "../store/actions";
import { useAppControllerHistoryDispatch } from "../app/hooks/controller/useAppControllerHistoryDispatch";
import {
  asConnectorId, asNodeId, asSegmentId, asSpliceId, asWireId, createUiIntegrationState
} from "./helpers/app-ui-test-utils";

function setup(state: AppState = createUiIntegrationState()) {
  const store = createAppStore(state);
  const notifyToast = vi.fn();
  const hook = renderHook(() => useAppControllerHistoryDispatch({
    store, notifyToast, restoreViewportOnUndo: true,
    setPendingNewNodePosition: vi.fn(), setActiveScreen: vi.fn(),
    setActiveSubScreen: vi.fn(), setInteractionMode: vi.fn()
  }));
  return { ...hook, store, notifyToast };
}

describe("action rejection feedback pipeline", () => {
  beforeEach(() => localStorage.clear());

  const rejectedActions: Array<[string, () => AppAction]> = [
    ["connector reservation conflict", () => appActions.occupyConnectorCavity(asConnectorId("C1"), 1, "draft")],
    ["splice reservation conflict", () => appActions.occupySplicePort(asSpliceId("S1"), 1, "draft")],
    ["connector index outside range", () => appActions.occupyConnectorCavity(asConnectorId("C1"), 3, "draft")],
    ["splice index outside range", () => appActions.occupySplicePort(asSpliceId("S1"), 3, "draft")],
    ["connector release outside range", () => appActions.releaseConnectorCavity(asConnectorId("C1"), 0)],
    ["splice release outside range", () => appActions.releaseSplicePort(asSpliceId("S1"), 0)],
    ["unknown connector", () => appActions.occupyConnectorCavity(asConnectorId("missing"), 1, "draft")],
    ["unknown splice", () => appActions.occupySplicePort(asSpliceId("missing"), 1, "draft")],
    ["empty reservation reference", () => appActions.occupyConnectorCavity(asConnectorId("C1"), 2, " ")],
    ["connector dependencies", () => appActions.removeConnector(asConnectorId("C1"))],
    ["splice dependencies", () => appActions.removeSplice(asSpliceId("S1"))],
    ["node dependencies", () => appActions.removeNode(asNodeId("N-MID"))],
    ["invalid connector", () => appActions.upsertConnector({ id: asConnectorId("new"), name: "", technicalId: "", cavityCount: 2 })],
    ["invalid segment", () => appActions.upsertSegment({ id: asSegmentId("new"), nodeA: asNodeId("N-MID"), nodeB: asNodeId("missing"), lengthMm: 1 })],
    ["unknown layout node", () => appActions.setNodePosition(asNodeId("missing"), { x: 1, y: 1 })],
    ["unknown wire route", () => appActions.resetWireRoute(asWireId("missing"))],
    ["invalid network name", () => appActions.renameNetwork(createUiIntegrationState().activeNetworkId!, " ", "2026-11-16T10:00:00Z")]
  ];

  it.each(rejectedActions)("notifies for %s, even on repeat, without adding undo entries", (_name, makeAction) => {
    const { result, store, notifyToast } = setup();
    const action = makeAction();
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      act(() => result.current.dispatchAction(action));
      expect(store.getState().ui.lastError).not.toBeNull();
      expect(notifyToast).toHaveBeenLastCalledWith("Action rejected", {
        message: store.getState().ui.lastError!.message, variant: "error"
      });
      expect(notifyToast).toHaveBeenCalledTimes(attempt);
      expect(result.current.isUndoAvailable).toBe(false);
      expect(result.current.undoHistoryEntries).toHaveLength(0);
    }
  });

  it("also notifies when history tracking is explicitly disabled", () => {
    const { result, notifyToast } = setup(createEmptyWorkspaceState());
    act(() => result.current.dispatchAction(appActions.recomputeAllWires(), { trackHistory: false }));
    expect(notifyToast).toHaveBeenCalledWith("Action rejected", {
      message: "No active network selected. Create or select a network first.", variant: "error"
    });
  });

  it("keeps a previous successful edit undoable after a rejection", () => {
    const { result, store } = setup();
    act(() => result.current.dispatchAction(appActions.renameNetwork(store.getState().activeNetworkId!, "New name", "2026-11-16T10:00:00Z")));
    act(() => result.current.dispatchAction(appActions.removeConnector(asConnectorId("C1"))));
    expect(result.current.undoHistoryEntries).toHaveLength(1);
    act(() => result.current.handleUndo());
    expect(store.getState().networks.byId[store.getState().activeNetworkId!]?.name).toBe("Main network (Sample)");
  });

  it("reports a thrown dispatch reason", () => {
    const { result, store, notifyToast } = setup();
    act(() => result.current.dispatchAction(appActions.removeConnector(asConnectorId("C1"))));
    notifyToast.mockClear();
    const originalDispatch = store.dispatch;
    vi.spyOn(store, "dispatch").mockImplementation((action) => {
      if (action.type === "wire/remove") throw new Error("Cannot apply this edit.");
      originalDispatch(action);
    });
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      act(() => result.current.dispatchAction(appActions.removeWire(asWireId("W1"))));
      expect(notifyToast).toHaveBeenCalledTimes(attempt);
    }
    expect(notifyToast).toHaveBeenCalledWith("Action rejected", { message: "Cannot apply this edit.", variant: "error" });
    expect(result.current.isUndoAvailable).toBe(false);
  });

  it("does not show a stale error or a false success when an action has no effect", () => {
    const { result, notifyToast } = setup();
    act(() => result.current.dispatchAction(appActions.removeConnector(asConnectorId("C1"))));
    notifyToast.mockClear();
    act(() => result.current.dispatchAction(appActions.removeWire(asWireId("missing"))));
    expect(notifyToast).not.toHaveBeenCalled();
    act(() => result.current.dispatchAction(appActions.select({ kind: "wire", id: "W1" })));
    expect(notifyToast).not.toHaveBeenCalled();
  });

  it("keeps identical automatic rejections idempotent", () => {
    const { result, store, notifyToast } = setup();
    const action = appActions.removeConnector(asConnectorId("C1"));
    act(() => result.current.dispatchAction(action, { background: true }));
    const stateAfterRejection = store.getState();
    act(() => result.current.dispatchAction(action, { background: true }));
    expect(store.getState()).toBe(stateAfterRejection);
    expect(notifyToast).toHaveBeenCalledTimes(1);
  });

  it("reports invalid stored endpoints instead of silently refusing a wire edit", () => {
    const state = createUiIntegrationState();
    const wire = state.wires.byId[asWireId("W1")]!;
    const corrupted = {
      ...state,
      wires: { ...state.wires, byId: {
        ...state.wires.byId,
        [wire.id]: { ...wire, endpointA: { kind: "connectorCavity" as const, connectorId: asConnectorId("C1"), cavityIndex: 3 } }
      } }
    };
    const { result, store, notifyToast } = setup(corrupted);
    act(() => result.current.dispatchAction(appActions.saveWire(wire)));
    expect(notifyToast).toHaveBeenCalledWith("Action rejected", {
      message: "Wire connector way endpoint is out of range.", variant: "error"
    });
    expect(store.getState().wires).toBe(corrupted.wires);
    expect(store.getState().connectorCavityOccupancy).toBe(state.connectorCavityOccupancy);
  });
});
