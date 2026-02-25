import { describe, expect, it } from "vitest";
import type { ConnectorId, NetworkId, NodeId } from "../core/entities";
import { appActions, appReducer, createInitialState } from "../store";

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

describe("appReducer network lifecycle", () => {
  it("isolates entities by active network scope", () => {
    const base = createInitialState();
    const withConnectorInDefault = appReducer(
      base,
      appActions.upsertConnector({
        id: asConnectorId("C-DEFAULT"),
        name: "Default connector",
        technicalId: "C-DEFAULT",
        cavityCount: 2
      })
    );

    const withSecondNetwork = appReducer(
      withConnectorInDefault,
      appActions.createNetwork({
        id: asNetworkId("net-b"),
        name: "Network B",
        technicalId: "NET-B",
        createdAt: "2026-02-21T09:00:00.000Z",
        updatedAt: "2026-02-21T09:00:00.000Z"
      })
    );

    expect(withSecondNetwork.activeNetworkId).toBe(asNetworkId("net-b"));
    expect(withSecondNetwork.connectors.allIds).toEqual([]);

    const withConnectorInSecond = appReducer(
      withSecondNetwork,
      appActions.upsertConnector({
        id: asConnectorId("C-B"),
        name: "Connector B",
        technicalId: "C-B",
        cavityCount: 3
      })
    );

    const switchedBackToDefault = appReducer(
      withConnectorInSecond,
      appActions.selectNetwork(base.activeNetworkId as NetworkId)
    );

    expect(switchedBackToDefault.connectors.byId[asConnectorId("C-DEFAULT")]).toBeDefined();
    expect(switchedBackToDefault.connectors.byId[asConnectorId("C-B")]).toBeUndefined();
  });

  it("duplicates active network into an isolated deep copy", () => {
    const base = appReducer(
      createInitialState(),
      appActions.upsertConnector({
        id: asConnectorId("C-A"),
        name: "Connector A",
        technicalId: "C-A",
        cavityCount: 2
      })
    );
    const activeNetworkId = base.activeNetworkId as NetworkId;

    const duplicated = appReducer(
      base,
      appActions.duplicateNetwork(activeNetworkId, {
        id: asNetworkId("net-copy"),
        name: "Main network (Copy)",
        technicalId: "NET-MAIN-COPY",
        createdAt: "2026-02-21T09:30:00.000Z",
        updatedAt: "2026-02-21T09:30:00.000Z"
      })
    );

    expect(duplicated.activeNetworkId).toBe(asNetworkId("net-copy"));
    expect(duplicated.connectors.byId[asConnectorId("C-A")]).toBeDefined();

    const copyEdited = appReducer(
      duplicated,
      appActions.upsertConnector({
        id: asConnectorId("C-COPY-ONLY"),
        name: "Copy connector",
        technicalId: "C-COPY-ONLY",
        cavityCount: 2
      })
    );

    const switchedBack = appReducer(copyEdited, appActions.selectNetwork(activeNetworkId));
    expect(switchedBack.connectors.byId[asConnectorId("C-COPY-ONLY")]).toBeUndefined();
    expect(switchedBack.connectors.byId[asConnectorId("C-A")]).toBeDefined();
  });

  it("keeps node layout positions isolated per network", () => {
    const base = appReducer(
      createInitialState(),
      appActions.upsertNode({ id: asNodeId("N-1"), kind: "intermediate", label: "Node 1" })
    );
    const withPositionInDefault = appReducer(
      base,
      appActions.setNodePosition(asNodeId("N-1"), { x: 111, y: 222 })
    );

    const withSecondNetwork = appReducer(
      withPositionInDefault,
      appActions.createNetwork({
        id: asNetworkId("net-b"),
        name: "Network B",
        technicalId: "NET-B",
        createdAt: "2026-02-21T09:00:00.000Z",
        updatedAt: "2026-02-21T09:00:00.000Z"
      })
    );

    expect(withSecondNetwork.nodePositions[asNodeId("N-1")]).toBeUndefined();

    const withNodeInSecond = appReducer(
      withSecondNetwork,
      appActions.upsertNode({ id: asNodeId("N-2"), kind: "intermediate", label: "Node 2" })
    );
    const withPositionInSecond = appReducer(
      withNodeInSecond,
      appActions.setNodePosition(asNodeId("N-2"), { x: 333, y: 144 })
    );

    const switchedBack = appReducer(
      withPositionInSecond,
      appActions.selectNetwork(base.activeNetworkId as NetworkId)
    );
    expect(switchedBack.nodePositions[asNodeId("N-1")]).toEqual({ x: 111, y: 222 });
    expect(switchedBack.nodePositions[asNodeId("N-2")]).toBeUndefined();
  });

  it("cleans node layout position when a node is removed", () => {
    const withNode = appReducer(
      createInitialState(),
      appActions.upsertNode({ id: asNodeId("N-REMOVE"), kind: "intermediate", label: "Node remove" })
    );
    const withPosition = appReducer(
      withNode,
      appActions.setNodePosition(asNodeId("N-REMOVE"), { x: 260, y: 170 })
    );

    const removed = appReducer(withPosition, appActions.removeNode(asNodeId("N-REMOVE")));
    expect(removed.nodePositions[asNodeId("N-REMOVE")]).toBeUndefined();
  });

  it("deletes active network and applies deterministic fallback", () => {
    const withA = appReducer(
      createInitialState(),
      appActions.createNetwork(
        {
          id: asNetworkId("net-a"),
          name: "Network A",
          technicalId: "NET-A",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z"
        },
        false
      )
    );
    const withB = appReducer(
      withA,
      appActions.createNetwork(
        {
          id: asNetworkId("net-b"),
          name: "Network B",
          technicalId: "NET-B",
          createdAt: "2026-02-01T00:00:00.000Z",
          updatedAt: "2026-02-01T00:00:00.000Z"
        },
        true
      )
    );

    const deleted = appReducer(withB, appActions.deleteNetwork(asNetworkId("net-b")));
    expect(deleted.networks.byId[asNetworkId("net-b")]).toBeUndefined();
    expect(deleted.activeNetworkId).toBe(asNetworkId("net-a"));
  });

  it("updates active network metadata and blocks duplicate technical IDs", () => {
    const initial = createInitialState();
    const activeNetworkId = initial.activeNetworkId as NetworkId;

    const updated = appReducer(
      initial,
      appActions.updateNetwork(
        activeNetworkId,
        "Main network updated",
        "NET-MAIN-UPD",
        "2026-02-21T10:00:00.000Z",
        "Updated description"
      )
    );
    const updatedNetwork = updated.networks.byId[activeNetworkId];
    expect(updatedNetwork?.name).toBe("Main network updated");
    expect(updatedNetwork?.technicalId).toBe("NET-MAIN-UPD");
    expect(updatedNetwork?.description).toBe("Updated description");

    const withAnotherNetwork = appReducer(
      updated,
      appActions.createNetwork(
        {
          id: asNetworkId("net-other"),
          name: "Other",
          technicalId: "NET-OTHER",
          createdAt: "2026-02-21T10:01:00.000Z",
          updatedAt: "2026-02-21T10:01:00.000Z"
        },
        false
      )
    );
    const duplicateRejected = appReducer(
      withAnotherNetwork,
      appActions.updateNetwork(
        activeNetworkId,
        "Main network updated",
        "NET-OTHER",
        "2026-02-21T10:02:00.000Z",
        "Updated description"
      )
    );

    expect(duplicateRejected.networks.byId[activeNetworkId]?.technicalId).toBe("NET-MAIN-UPD");
    expect(duplicateRejected.ui.lastError).toContain("already used");
  });

  it("blocks domain writes when no active network exists", () => {
    const initial = createInitialState();
    const onlyNetworkId = initial.activeNetworkId as NetworkId;
    const noNetwork = appReducer(initial, appActions.deleteNetwork(onlyNetworkId));

    expect(noNetwork.activeNetworkId).toBeNull();

    const attemptedWrite = appReducer(
      noNetwork,
      appActions.upsertConnector({
        id: asConnectorId("C-NONE"),
        name: "Should fail",
        technicalId: "C-NONE",
        cavityCount: 2
      })
    );

    expect(attemptedWrite.connectors.byId[asConnectorId("C-NONE")]).toBeUndefined();
    expect(attemptedWrite.ui.lastError).toBe("No active network selected. Create or select a network first.");
  });

  it("seeds exactly three default catalog items when creating a new network", () => {
    const created = appReducer(
      createInitialState(),
      appActions.createNetwork({
        id: asNetworkId("net-seeded"),
        name: "Seeded network",
        technicalId: "NET-SEEDED",
        createdAt: "2026-03-01T10:00:00.000Z",
        updatedAt: "2026-03-01T10:00:00.000Z"
      })
    );

    expect(created.activeNetworkId).toBe(asNetworkId("net-seeded"));
    expect(created.catalogItems.allIds).toHaveLength(3);

    const refs = created.catalogItems.allIds
      .map((id) => created.catalogItems.byId[id]?.manufacturerReference)
      .filter((value): value is string => typeof value === "string");
    expect(refs).toEqual(["CAT-2W-STD", "CAT-6P-STD", "CAT-8W-STD"]);

    const findCatalogItemByRef = (manufacturerReference: string) =>
      created.catalogItems.allIds
        .map((id) => created.catalogItems.byId[id])
        .find((item) => item?.manufacturerReference === manufacturerReference);

    expect(findCatalogItemByRef("CAT-2W-STD")?.name).toBe("2-way standard connector");
    expect(findCatalogItemByRef("CAT-2W-STD")?.unitPriceExclTax).toBe(5);
    expect(findCatalogItemByRef("CAT-6P-STD")?.name).toBe("6-port standard splice");
    expect(findCatalogItemByRef("CAT-6P-STD")?.unitPriceExclTax).toBe(8.5);
    expect(findCatalogItemByRef("CAT-8W-STD")?.name).toBe("8-way standard connector");
    expect(findCatalogItemByRef("CAT-8W-STD")?.unitPriceExclTax).toBe(12);
  });

  it("does not inject default catalog seeds on network import", () => {
    const importedNetworkId = asNetworkId("net-import");
    const importedState = {
      ...createInitialState(),
      networks: {
        byId: {} as ReturnType<typeof createInitialState>["networks"]["byId"],
        allIds: [] as NetworkId[]
      },
      activeNetworkId: null,
      networkStates: {} as ReturnType<typeof createInitialState>["networkStates"]
    };
    const importedScoped = importedState.networkStates;
    void importedScoped;

    const result = appReducer(
      createInitialState(),
      appActions.importNetworks(
        [
          {
            id: importedNetworkId,
            name: "Imported",
            technicalId: "NET-IMPORTED",
            createdAt: "2026-03-02T10:00:00.000Z",
            updatedAt: "2026-03-02T10:00:00.000Z"
          }
        ],
        {
          [importedNetworkId]: {
            catalogItems: { byId: {} as ReturnType<typeof createInitialState>["catalogItems"]["byId"], allIds: [] },
            connectors: { byId: {} as ReturnType<typeof createInitialState>["connectors"]["byId"], allIds: [] },
            splices: { byId: {} as ReturnType<typeof createInitialState>["splices"]["byId"], allIds: [] },
            nodes: { byId: {} as ReturnType<typeof createInitialState>["nodes"]["byId"], allIds: [] },
            segments: { byId: {} as ReturnType<typeof createInitialState>["segments"]["byId"], allIds: [] },
            wires: { byId: {} as ReturnType<typeof createInitialState>["wires"]["byId"], allIds: [] },
            nodePositions: {} as ReturnType<typeof createInitialState>["nodePositions"],
            connectorCavityOccupancy: {} as ReturnType<typeof createInitialState>["connectorCavityOccupancy"],
            splicePortOccupancy: {} as ReturnType<typeof createInitialState>["splicePortOccupancy"]
          }
        },
        true
      )
    );

    expect(result.activeNetworkId).toBe(importedNetworkId);
    expect(result.catalogItems.allIds).toEqual([]);
  });
});
