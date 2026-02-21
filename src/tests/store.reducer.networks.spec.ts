import { describe, expect, it } from "vitest";
import type { ConnectorId, NetworkId } from "../core/entities";
import { appActions, appReducer, createInitialState } from "../store";

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
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
});
