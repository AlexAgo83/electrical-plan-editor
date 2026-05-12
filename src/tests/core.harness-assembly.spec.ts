import { describe, expect, it } from "vitest";
import type { Connector, ConnectorId, HarnessAssembly, HarnessAssemblyId, Network, NetworkId } from "../core/entities";
import { validateHarnessAssembly } from "../core/harnessAssembly";

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asAssemblyId(value: string): HarnessAssemblyId {
  return value as HarnessAssemblyId;
}

const networks = new Map<NetworkId, Network>([
  [
    asNetworkId("net-a"),
    {
      id: asNetworkId("net-a"),
      name: "Harness A",
      technicalId: "H-A",
      createdAt: "2026-05-11T00:00:00.000Z",
      updatedAt: "2026-05-11T00:00:00.000Z"
    }
  ],
  [
    asNetworkId("net-b"),
    {
      id: asNetworkId("net-b"),
      name: "Harness B",
      technicalId: "H-B",
      createdAt: "2026-05-11T00:00:00.000Z",
      updatedAt: "2026-05-11T00:00:00.000Z"
    }
  ]
]);

const connectorsByNetworkId = new Map<NetworkId, ReadonlyMap<ConnectorId, Connector>>([
  [
    asNetworkId("net-a"),
    new Map([
      [asConnectorId("C-A1"), { id: asConnectorId("C-A1"), name: "A1", technicalId: "C-A1", cavityCount: 4 }],
      [asConnectorId("C-A2"), { id: asConnectorId("C-A2"), name: "A2", technicalId: "C-A2", cavityCount: 2 }]
    ])
  ],
  [
    asNetworkId("net-b"),
    new Map([[asConnectorId("C-B1"), { id: asConnectorId("C-B1"), name: "B1", technicalId: "C-B1", cavityCount: 2 }]])
  ]
]);

function createAssembly(overrides: Partial<HarnessAssembly> = {}): HarnessAssembly {
  return {
    id: asAssemblyId("asm-1"),
    name: "Main assembly",
    technicalId: "ASM-1",
    members: [
      { networkId: asNetworkId("net-a"), color: "#2563eb" },
      { networkId: asNetworkId("net-b"), color: "#16a34a" }
    ],
    masterConnectorRefs: [{ networkId: asNetworkId("net-a"), connectorId: asConnectorId("C-A1") }],
    connectorLinks: [
      {
        id: "link-1" as never,
        sourceNetworkId: asNetworkId("net-a"),
        sourceConnectorId: asConnectorId("C-A1"),
        targetNetworkId: asNetworkId("net-b"),
        targetConnectorId: asConnectorId("C-B1")
      }
    ],
    createdAt: "2026-05-11T00:00:00.000Z",
    updatedAt: "2026-05-11T00:00:00.000Z",
    ...overrides
  };
}

describe("harness assembly validation", () => {
  it("reports mismatched pin counts as warnings, not blocking errors", () => {
    const issues = validateHarnessAssembly(createAssembly(), { networks, connectorsByNetworkId });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "warning",
          kind: "mismatched-pin-count"
        })
      ])
    );
    expect(issues.some((issue) => issue.severity === "error")).toBe(false);
  });

  it("blocks duplicate connector participation in first-version interconnector links", () => {
    const issues = validateHarnessAssembly(
      createAssembly({
        connectorLinks: [
          ...createAssembly().connectorLinks,
          {
            id: "link-2" as never,
            sourceNetworkId: asNetworkId("net-a"),
            sourceConnectorId: asConnectorId("C-A1"),
            targetNetworkId: asNetworkId("net-a"),
            targetConnectorId: asConnectorId("C-A2")
          }
        ]
      }),
      { networks, connectorsByNetworkId }
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "error",
          kind: "connector-duplicate-link",
          connectorId: asConnectorId("C-A1")
        })
      ])
    );
  });
});
