import { describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import type { CatalogItemId, ConnectorId, NodeId, SegmentId } from "../core/entities";

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

describe("rear backshell topology", () => {
  it("creates the helper node and dedicated segment when the connector node is created", () => {
    let state = createInitialState();
    state = appReducer(
      state,
      appActions.upsertCatalogItem({
        id: asCatalogItemId("CAT-1"),
        manufacturerReference: "CAT-1",
        name: "Connector with backshell",
        connectionCount: 2,
        connectorDefaults: {
          rearBackshell: {
            enabled: true,
            lengthMm: 35
          }
        }
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        id: asConnectorId("CONN-1"),
        name: "Connector 1",
        technicalId: "CT5",
        catalogItemId: asCatalogItemId("CAT-1"),
        manufacturerReference: "CAT-1",
        cavityCount: 2
      })
    );
    state = appReducer(
      state,
      appActions.upsertNode({
        id: asNodeId("N-CONN-1"),
        kind: "connector",
        connectorId: asConnectorId("CONN-1")
      })
    );

    expect(state.nodes.byId[asNodeId("CONN-1__BSH")]).toMatchObject({
      kind: "connectorBackshellHelper",
      connectorId: asConnectorId("CONN-1")
    });
    expect(state.segments.byId[asSegmentId("CONN-1__BSL")]).toMatchObject({
      nodeA: asNodeId("N-CONN-1"),
      nodeB: asNodeId("CONN-1__BSH"),
      lengthMm: 35,
      role: "rearBackshellLink"
    });
  });

  it("reroutes external segments through the helper node instead of the connector node", () => {
    let state = createInitialState();
    state = appReducer(
      state,
      appActions.upsertCatalogItem({
        id: asCatalogItemId("CAT-1"),
        manufacturerReference: "CAT-1",
        name: "Connector with backshell",
        connectionCount: 2,
        connectorDefaults: {
          rearBackshell: {
            enabled: true,
            lengthMm: 35
          }
        }
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        id: asConnectorId("CONN-1"),
        name: "Connector 1",
        technicalId: "CT5",
        catalogItemId: asCatalogItemId("CAT-1"),
        manufacturerReference: "CAT-1",
        cavityCount: 2
      })
    );
    state = appReducer(
      state,
      appActions.upsertNode({
        id: asNodeId("N-CONN-1"),
        kind: "connector",
        connectorId: asConnectorId("CONN-1")
      })
    );
    state = appReducer(
      state,
      appActions.upsertNode({
        id: asNodeId("N10"),
        kind: "intermediate",
        label: "N10"
      })
    );
    state = appReducer(
      state,
      appActions.upsertSegment({
        id: asSegmentId("SEG-EXT"),
        nodeA: asNodeId("N10"),
        nodeB: asNodeId("N-CONN-1"),
        lengthMm: 120
      })
    );

    expect(state.segments.byId[asSegmentId("SEG-EXT")]).toMatchObject({
      nodeA: asNodeId("N10"),
      nodeB: asNodeId("CONN-1__BSH")
    });
  });
});
