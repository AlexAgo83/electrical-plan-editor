import { describe, expect, it } from "vitest";
import type {
  Connector,
  ConnectorId,
  HarnessAssembly,
  HarnessAssemblyId,
  InterHarnessConnectorLink,
  InterHarnessConnectorLinkId,
  NetworkId,
  Wire,
  WireId
} from "../core/entities";
import {
  aggregateAssembly,
  type AssemblyNetworkSlice
} from "../core/pinElectricalLoadAssembly";

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function makeConnector(
  id: string,
  cavityCount: number,
  extras: Partial<Connector> = {}
): Connector {
  return {
    id: asConnectorId(id),
    name: id,
    technicalId: id,
    cavityCount,
    ...extras
  };
}

function makeWire(
  id: string,
  endpointA: Wire["endpointA"],
  endpointB: Wire["endpointB"]
): Wire {
  return {
    id: id as WireId,
    name: id,
    technicalId: id,
    sectionMm2: 1,
    primaryColorId: null,
    secondaryColorId: null,
    endpointA,
    endpointB,
    routeSegmentIds: [],
    lengthMm: 0,
    isRouteLocked: false
  };
}

function makeAssembly(links: InterHarnessConnectorLink[]): HarnessAssembly {
  return {
    id: "asm" as HarnessAssemblyId,
    name: "Test Assembly",
    technicalId: "ASM",
    members: [],
    masterConnectorRefs: [],
    connectorLinks: links,
    createdAt: "2026-06-02T00:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z"
  };
}

describe("aggregateAssembly", () => {
  it("propagates a consumer in B into the branch aggregate of A through a link", () => {
    const sourceA = makeConnector("CA-src", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 8 } }
    });
    const portA = makeConnector("CA-port", 1);
    const portB = makeConnector("CB-port", 1);
    const consumerB = makeConnector("CB-con", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 8 } }
    });
    const wireA = makeWire(
      "WA",
      { kind: "connectorCavity", connectorId: sourceA.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: portA.id, cavityIndex: 1 }
    );
    const wireB = makeWire(
      "WB",
      { kind: "connectorCavity", connectorId: portB.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumerB.id, cavityIndex: 1 }
    );

    const slices: AssemblyNetworkSlice[] = [
      {
        networkId: asNetworkId("net-a"),
        connectors: [sourceA, portA],
        splices: [],
        wires: [wireA]
      },
      {
        networkId: asNetworkId("net-b"),
        connectors: [portB, consumerB],
        splices: [],
        wires: [wireB]
      }
    ];

    const link: InterHarnessConnectorLink = {
      id: "L1" as InterHarnessConnectorLinkId,
      sourceNetworkId: asNetworkId("net-a"),
      sourceConnectorId: portA.id,
      targetNetworkId: asNetworkId("net-b"),
      targetConnectorId: portB.id
    };

    const result = aggregateAssembly(
      makeAssembly([link]),
      slices,
      [asNetworkId("net-a"), asNetworkId("net-b")],
      new Map()
    );

    // Find the prefixed wire IDs to check
    const wireAEntries = [...result.load.branchLoadByWire.entries()].filter(([id]) =>
      id.endsWith("WA")
    );
    expect(wireAEntries.length).toBe(1);
    expect(wireAEntries[0]![1].continuousA).toBe(8);
    expect(result.l1Mismatches).toEqual([]);
  });

  it("emits an L1 warning when both sides of a link declare incompatible roles", () => {
    const portA = makeConnector("CA-port", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 10 } }
    });
    const portB = makeConnector("CB-port", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 8 } }
    });

    const slices: AssemblyNetworkSlice[] = [
      {
        networkId: asNetworkId("net-a"),
        connectors: [portA],
        splices: [],
        wires: []
      },
      {
        networkId: asNetworkId("net-b"),
        connectors: [portB],
        splices: [],
        wires: []
      }
    ];

    const link: InterHarnessConnectorLink = {
      id: "L1" as InterHarnessConnectorLinkId,
      sourceNetworkId: asNetworkId("net-a"),
      sourceConnectorId: portA.id,
      targetNetworkId: asNetworkId("net-b"),
      targetConnectorId: portB.id
    };

    const result = aggregateAssembly(
      makeAssembly([link]),
      slices,
      [asNetworkId("net-a"), asNetworkId("net-b")],
      new Map()
    );

    expect(result.l1Mismatches.length).toBe(1);
    expect(result.l1Mismatches[0]!.cavityIndex).toBe(1);
  });

  it("skips bridges whose far end is outside the selected network IDs", () => {
    const portA = makeConnector("CA-port", 1);
    const portB = makeConnector("CB-port", 1);

    const slices: AssemblyNetworkSlice[] = [
      {
        networkId: asNetworkId("net-a"),
        connectors: [portA],
        splices: [],
        wires: []
      },
      {
        networkId: asNetworkId("net-b"),
        connectors: [portB],
        splices: [],
        wires: []
      }
    ];

    const link: InterHarnessConnectorLink = {
      id: "L1" as InterHarnessConnectorLinkId,
      sourceNetworkId: asNetworkId("net-a"),
      sourceConnectorId: portA.id,
      targetNetworkId: asNetworkId("net-b"),
      targetConnectorId: portB.id
    };

    const result = aggregateAssembly(
      makeAssembly([link]),
      slices,
      [asNetworkId("net-a")],
      new Map()
    );

    expect(result.skippedBridges.length).toBe(1);
    expect(result.skippedBridges[0]!.linkId).toBe(link.id);
  });

  it("propagates through shared master connector references", () => {
    const sourceA = makeConnector("MASTER", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 6 } }
    });
    const masterB = makeConnector("MASTER", 1);
    const consumerB = makeConnector("CON-B", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 6 } }
    });
    const wireB = makeWire(
      "WB",
      { kind: "connectorCavity", connectorId: masterB.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumerB.id, cavityIndex: 1 }
    );

    const slices: AssemblyNetworkSlice[] = [
      { networkId: asNetworkId("net-a"), connectors: [sourceA], splices: [], wires: [] },
      { networkId: asNetworkId("net-b"), connectors: [masterB, consumerB], splices: [], wires: [wireB] }
    ];
    const assembly = {
      ...makeAssembly([]),
      masterConnectorRefs: [
        { networkId: asNetworkId("net-a"), connectorId: sourceA.id },
        { networkId: asNetworkId("net-b"), connectorId: masterB.id }
      ]
    };

    const result = aggregateAssembly(
      assembly,
      slices,
      [asNetworkId("net-a"), asNetworkId("net-b")],
      new Map()
    );

    const wireBEntry = [...result.load.branchLoadByWire.entries()].find(([id]) => id.endsWith("WB"));
    expect(wireBEntry?.[1].continuousA).toBe(6);
    expect(result.wireOriginByPrefixedId.get(wireBEntry![0])?.networkId).toBe(asNetworkId("net-b"));
  });

  it("does not emit L1 when one side is passive or undeclared", () => {
    const portA = makeConnector("CA", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 5 } }
    });
    const portB = makeConnector("CB", 1); // undeclared

    const slices: AssemblyNetworkSlice[] = [
      { networkId: asNetworkId("a"), connectors: [portA], splices: [], wires: [] },
      { networkId: asNetworkId("b"), connectors: [portB], splices: [], wires: [] }
    ];
    const link: InterHarnessConnectorLink = {
      id: "L" as InterHarnessConnectorLinkId,
      sourceNetworkId: asNetworkId("a"),
      sourceConnectorId: portA.id,
      targetNetworkId: asNetworkId("b"),
      targetConnectorId: portB.id
    };
    const result = aggregateAssembly(
      makeAssembly([link]),
      slices,
      [asNetworkId("a"), asNetworkId("b")],
      new Map()
    );
    expect(result.l1Mismatches).toEqual([]);
  });

  it("L1 uses max(currentA) for downstream propagation when incompatibility is numeric", () => {
    const portA = makeConnector("CA", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 5 } }
    });
    const portB = makeConnector("CB", 1, {
      pinElectricalRoles: { 1: { role: "source", currentA: 12 } }
    });
    const consumerExtra = makeConnector("CON", 1, {
      pinElectricalRoles: { 1: { role: "consumer", currentA: 12 } }
    });
    const wireB = makeWire(
      "Wcon",
      { kind: "connectorCavity", connectorId: portB.id, cavityIndex: 1 },
      { kind: "connectorCavity", connectorId: consumerExtra.id, cavityIndex: 1 }
    );
    const slices: AssemblyNetworkSlice[] = [
      { networkId: asNetworkId("a"), connectors: [portA], splices: [], wires: [] },
      {
        networkId: asNetworkId("b"),
        connectors: [portB, consumerExtra],
        splices: [],
        wires: [wireB]
      }
    ];
    const link: InterHarnessConnectorLink = {
      id: "L" as InterHarnessConnectorLinkId,
      sourceNetworkId: asNetworkId("a"),
      sourceConnectorId: portA.id,
      targetNetworkId: asNetworkId("b"),
      targetConnectorId: portB.id
    };
    const result = aggregateAssembly(
      makeAssembly([link]),
      slices,
      [asNetworkId("a"), asNetworkId("b")],
      new Map()
    );
    expect(result.l1Mismatches.length).toBe(1);
    // Downstream wire on B should now propagate 12 A (max of 5 and 12)
    const wireBEntries = [...result.load.branchLoadByWire.entries()].filter(([id]) =>
      id.endsWith("Wcon")
    );
    expect(wireBEntries.length).toBe(1);
    expect(wireBEntries[0]![1].continuousA).toBe(12);
  });
});
