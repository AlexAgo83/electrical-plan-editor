import { describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState, type AppState } from "../store";
import type { AppAction } from "../store/actions";
import {
  asCatalogItemId,
  asConnectorId,
  asNodeId,
  asSegmentId,
  asSpliceId,
  asWireId
} from "./helpers/store-reducer-test-utils";

function assertScopedSlicesMatchActiveNetwork(state: AppState): void {
  const activeNetworkId = state.activeNetworkId;
  expect(activeNetworkId).not.toBeNull();
  if (activeNetworkId === null) {
    return;
  }
  const scoped = state.networkStates[activeNetworkId];
  expect(scoped).toBeDefined();
  if (scoped === undefined) {
    return;
  }
  expect(scoped.catalogItems).toEqual(state.catalogItems);
  expect(scoped.connectors).toEqual(state.connectors);
  expect(scoped.splices).toEqual(state.splices);
  expect(scoped.nodes).toEqual(state.nodes);
  expect(scoped.segments).toEqual(state.segments);
  expect(scoped.wires).toEqual(state.wires);
  expect(scoped.nodePositions).toEqual(state.nodePositions);
  expect(scoped.connectorCavityOccupancy).toEqual(state.connectorCavityOccupancy);
  expect(scoped.splicePortOccupancy).toEqual(state.splicePortOccupancy);
}

function buildBaseStateWithGraphFixture(): AppState {
  const setup: AppAction[] = [
    appActions.upsertCatalogItem({
      id: asCatalogItemId("CAT-SYNC"),
      manufacturerReference: "CAT-SYNC",
      name: "Catalog sync fixture",
      connectionCount: 4
    }),
    appActions.upsertConnector({
      id: asConnectorId("C1"),
      name: "Connector 1",
      technicalId: "C-1",
      cavityCount: 4
    }),
    appActions.upsertSplice({
      id: asSpliceId("S1"),
      name: "Splice 1",
      technicalId: "S-1",
      portCount: 4
    }),
    appActions.upsertNode({
      id: asNodeId("N-C1"),
      kind: "connector",
      connectorId: asConnectorId("C1")
    }),
    appActions.upsertNode({
      id: asNodeId("N-S1"),
      kind: "splice",
      spliceId: asSpliceId("S1")
    }),
    appActions.upsertSegment({
      id: asSegmentId("SEG-1"),
      nodeA: asNodeId("N-C1"),
      nodeB: asNodeId("N-S1"),
      lengthMm: 100
    }),
    appActions.upsertWire({
      id: asWireId("W-1"),
      name: "Wire 1",
      technicalId: "W-1",
      sectionMm2: 0.5,
      primaryColorId: null,
      secondaryColorId: null,
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
      routeSegmentIds: [asSegmentId("SEG-1")],
      lengthMm: 100,
      isRouteLocked: false
    })
  ];
  let state: AppState = createInitialState();
  for (const action of setup) {
    state = appReducer(state, action);
  }
  return state;
}

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

  describe("preserves dual-state sync across every scoped domain action prefix", () => {
    const scopedDomainActionCases: ReadonlyArray<{
      readonly prefix: string;
      readonly label: string;
      readonly buildAction: () => AppAction;
    }> = [
      {
        prefix: "catalog/",
        label: "catalog/upsert",
        buildAction: () =>
          appActions.upsertCatalogItem({
            id: asCatalogItemId("CAT-SYNC"),
            manufacturerReference: "CAT-SYNC-V2",
            name: "Catalog sync fixture updated",
            connectionCount: 6
          })
      },
      {
        prefix: "connector/",
        label: "connector/upsert",
        buildAction: () =>
          appActions.upsertConnector({
            id: asConnectorId("C1"),
            name: "Connector renamed",
            technicalId: "C-1",
            cavityCount: 4
          })
      },
      {
        prefix: "connector/",
        label: "connector/occupyCavity",
        buildAction: () => appActions.occupyConnectorCavity(asConnectorId("C1"), 2, "external-ref")
      },
      {
        prefix: "splice/",
        label: "splice/upsert",
        buildAction: () =>
          appActions.upsertSplice({
            id: asSpliceId("S1"),
            name: "Splice renamed",
            technicalId: "S-1",
            portCount: 4
          })
      },
      {
        prefix: "splice/",
        label: "splice/occupyPort",
        buildAction: () => appActions.occupySplicePort(asSpliceId("S1"), 2, "external-ref")
      },
      {
        prefix: "node/",
        label: "node/upsert",
        buildAction: () =>
          appActions.upsertNode({
            id: asNodeId("N-MID"),
            kind: "intermediate",
            label: "MID"
          })
      },
      {
        prefix: "segment/",
        label: "segment/upsert",
        buildAction: () =>
          appActions.upsertSegment({
            id: asSegmentId("SEG-1"),
            nodeA: asNodeId("N-C1"),
            nodeB: asNodeId("N-S1"),
            lengthMm: 150
          })
      },
      {
        prefix: "wire/",
        label: "wire/upsert",
        buildAction: () =>
          appActions.upsertWire({
            id: asWireId("W-1"),
            name: "Wire 1 renamed",
            technicalId: "W-1",
            sectionMm2: 0.75,
            primaryColorId: null,
            secondaryColorId: null,
            endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
            endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
            routeSegmentIds: [asSegmentId("SEG-1")],
            lengthMm: 100,
            isRouteLocked: false
          })
      },
      {
        prefix: "wire/",
        label: "wire/remove",
        buildAction: () => appActions.removeWire(asWireId("W-1"))
      },
      {
        prefix: "layout/",
        label: "layout/setNodePosition",
        buildAction: () => appActions.setNodePosition(asNodeId("N-C1"), { x: 320, y: 480 })
      },
      {
        prefix: "layout/",
        label: "layout/setNodePositions",
        buildAction: () =>
          appActions.setNodePositions({
            [asNodeId("N-C1")]: { x: 40, y: 80 },
            [asNodeId("N-S1")]: { x: 220, y: 80 }
          })
      }
    ];

    for (const entry of scopedDomainActionCases) {
      it(`${entry.label} (prefix ${entry.prefix}) keeps networkStates[activeNetworkId] in sync with the root slices`, () => {
        const base = buildBaseStateWithGraphFixture();
        assertScopedSlicesMatchActiveNetwork(base);

        const action: AppAction = entry.buildAction();
        expect(action.type.startsWith(entry.prefix)).toBe(true);

        const next = appReducer(base, action);
        expect(next).not.toBe(base);
        assertScopedSlicesMatchActiveNetwork(next);
      });
    }

    it("covers every scoped domain prefix referenced by hasActiveNetworkForDomainActions", () => {
      const expectedPrefixes = ["connector/", "catalog/", "splice/", "node/", "segment/", "wire/", "layout/"];
      const observedPrefixes = new Set(scopedDomainActionCases.map((entry) => entry.prefix));
      for (const prefix of expectedPrefixes) {
        expect(observedPrefixes.has(prefix)).toBe(true);
      }
    });
  });
});
