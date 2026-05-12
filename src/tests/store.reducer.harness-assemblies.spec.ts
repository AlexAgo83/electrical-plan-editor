import { describe, expect, it } from "vitest";
import type { ConnectorId, HarnessAssemblyId, NetworkId } from "../core/entities";
import { appActions, appReducer, createInitialState } from "../store";

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asAssemblyId(value: string): HarnessAssemblyId {
  return value as HarnessAssemblyId;
}

describe("appReducer harness assemblies", () => {
  it("persists harness assemblies globally and cleans deleted network references", () => {
    const initial = createInitialState();
    const defaultNetworkId = initial.activeNetworkId as NetworkId;
    const withSecondNetwork = appReducer(
      initial,
      appActions.createNetwork({
        id: asNetworkId("net-b"),
        name: "Harness B",
        technicalId: "H-B",
        createdAt: "2026-05-11T00:00:00.000Z",
        updatedAt: "2026-05-11T00:00:00.000Z"
      })
    );

    const withAssembly = appReducer(
      withSecondNetwork,
      appActions.upsertHarnessAssembly({
        id: asAssemblyId("asm-main"),
        name: "Main assembly",
        technicalId: "ASM-MAIN",
        members: [
          { networkId: defaultNetworkId, color: "#2563eb" },
          { networkId: asNetworkId("net-b"), color: "#16a34a" }
        ],
        masterConnectorRefs: [{ networkId: defaultNetworkId, connectorId: asConnectorId("C-MASTER") }],
        connectorLinks: [
          {
            id: "link-1" as never,
            sourceNetworkId: defaultNetworkId,
            sourceConnectorId: asConnectorId("C-A"),
            targetNetworkId: asNetworkId("net-b"),
            targetConnectorId: asConnectorId("C-B")
          }
        ],
        createdAt: "2026-05-11T00:00:00.000Z",
        updatedAt: "2026-05-11T00:00:00.000Z"
      })
    );

    expect(withAssembly.harnessAssemblies.byId[asAssemblyId("asm-main")]?.members).toHaveLength(2);

    const afterDelete = appReducer(withAssembly, appActions.deleteNetwork(asNetworkId("net-b")));
    const assembly = afterDelete.harnessAssemblies.byId[asAssemblyId("asm-main")];
    expect(assembly?.members).toEqual([{ networkId: defaultNetworkId, color: "#2563eb" }]);
    expect(assembly?.connectorLinks).toEqual([]);
  });
});
