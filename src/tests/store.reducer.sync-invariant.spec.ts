import { describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import { asConnectorId, asNodeId } from "./helpers/store-reducer-test-utils";

describe("appReducer scoped sync invariant", () => {
  it("keeps the active root slices and active network snapshot aligned after scoped mutations", () => {
    let state = createInitialState();
    const activeNetworkId = state.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected an active network in the initial state.");
    }

    state = appReducer(
      appReducer(
        appReducer(
          state,
          appActions.upsertConnector({
            id: asConnectorId("C1"),
            name: "Connector",
            technicalId: "C-1",
            cavityCount: 4
          })
        ),
        appActions.upsertNode({
          id: asNodeId("N-C1"),
          kind: "connector",
          connectorId: asConnectorId("C1")
        })
      ),
      appActions.setNodePosition(asNodeId("N-C1"), { x: 120, y: 240 })
    );

    const scoped = state.networkStates[activeNetworkId];
    expect(scoped).toBeDefined();
    if (scoped === undefined) {
      throw new Error("Expected scoped state for active network.");
    }

    expect(scoped.connectors).toEqual(state.connectors);
    expect(scoped.nodes).toEqual(state.nodes);
    expect(scoped.nodePositions).toEqual(state.nodePositions);
    expect(scoped.connectorCavityOccupancy).toEqual(state.connectorCavityOccupancy);
    expect(scoped.splicePortOccupancy).toEqual(state.splicePortOccupancy);
  });

  it("merges partial layout position batches without dropping persisted positions for unrelated nodes", () => {
    let state = createInitialState();
    const activeNetworkId = state.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected an active network in the initial state.");
    }

    state = appReducer(
      appReducer(
        appReducer(
          appReducer(
            state,
            appActions.upsertConnector({
              id: asConnectorId("C1"),
              name: "Connector",
              technicalId: "C-1",
              cavityCount: 4
            })
          ),
          appActions.upsertNode({
            id: asNodeId("N-C1"),
            kind: "connector",
            connectorId: asConnectorId("C1")
          })
        ),
        appActions.upsertNode({
          id: asNodeId("N-MID"),
          kind: "intermediate",
          label: "MID"
        })
      ),
      appActions.setNodePositions({
        [asNodeId("N-C1")]: { x: 120, y: 240 },
        [asNodeId("N-MID")]: { x: 260, y: 300 }
      })
    );

    state = appReducer(
      state,
      appActions.setNodePositions({
        [asNodeId("N-C1")]: { x: 180, y: 260 }
      })
    );

    expect(state.nodePositions).toEqual({
      [asNodeId("N-C1")]: { x: 180, y: 260 },
      [asNodeId("N-MID")]: { x: 260, y: 300 }
    });

    const scoped = state.networkStates[activeNetworkId];
    expect(scoped).toBeDefined();
    if (scoped === undefined) {
      throw new Error("Expected scoped state for active network.");
    }
    expect(scoped.nodePositions).toEqual(state.nodePositions);
  });
});
