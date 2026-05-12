import { describe, expect, it } from "vitest";
import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  HarnessAssembly,
  HarnessAssemblyId,
  Network,
  NetworkId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireId
} from "../core/entities";
import { buildFunctionalSchematicGraph, buildHarnessAssemblyFunctionalSchematicGraph } from "../core/functionalSchematic";

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function asHarnessAssemblyId(value: string): HarnessAssemblyId {
  return value as HarnessAssemblyId;
}

function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

function asWireId(value: string): WireId {
  return value as WireId;
}

const connectors: Connector[] = [
  { id: asConnectorId("C-BCM"), name: "Body Controller", technicalId: "BCM C1", cavityCount: 24 },
  { id: asConnectorId("C-ACT"), name: "Door actuator", technicalId: "ACT C1", cavityCount: 4 }
];
const splices: Splice[] = [{ id: asSpliceId("S08"), name: "Signal splice", technicalId: "S08", portCount: 4 }];
const fuseCatalogItem: CatalogItem = {
  id: asCatalogItemId("F12-CAT"),
  manufacturerReference: "F12",
  connectionCount: 2,
  name: "Fuse F12"
};
const segments: Segment[] = [
  { id: asSegmentId("SEG-CAN-A"), nodeA: "N1" as never, nodeB: "N2" as never, lengthMm: 10, subNetworkTag: "CAN" },
  { id: asSegmentId("SEG-CAN-B"), nodeA: "N2" as never, nodeB: "N3" as never, lengthMm: 10, subNetworkTag: "CAN" }
];
const wires: Wire[] = [
  {
    id: asWireId("W-001"),
    name: "BCM to S08",
    technicalId: "W-001",
    sectionMm2: 0.35,
    primaryColorId: null,
    secondaryColorId: null,
    endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-BCM"), cavityIndex: 12 },
    endpointB: { kind: "splicePort", spliceId: asSpliceId("S08"), portIndex: 1 },
    protection: { kind: "fuse", catalogItemId: asCatalogItemId("F12-CAT") },
    routeSegmentIds: [asSegmentId("SEG-CAN-A")],
    lengthMm: 20,
    isRouteLocked: false
  },
  {
    id: asWireId("W-002"),
    name: "S08 to actuator",
    technicalId: "W-002",
    sectionMm2: 0.35,
    primaryColorId: null,
    secondaryColorId: null,
    endpointA: { kind: "splicePort", spliceId: asSpliceId("S08"), portIndex: 2 },
    endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-ACT"), cavityIndex: 2 },
    routeSegmentIds: [asSegmentId("SEG-CAN-B")],
    lengthMm: 30,
    isRouteLocked: false
  }
];

describe("buildFunctionalSchematicGraph", () => {
  it("expands a selected wire through connected splices and keeps significant electrical nodes", () => {
    const graph = buildFunctionalSchematicGraph({
      network: { voltageV: 12 },
      seed: { kind: "wire", wireId: asWireId("W-001") },
      activeFilter: "all",
      wires,
      segments,
      connectorMap: new Map(connectors.map((connector) => [connector.id, connector])),
      spliceMap: new Map(splices.map((splice) => [splice.id, splice])),
      catalogItemMap: new Map([[fuseCatalogItem.id, fuseCatalogItem]])
    });

    expect(graph.includedWireIds).toEqual([asWireId("W-001"), asWireId("W-002")]);
    expect(graph.nodes.map((node) => node.kind)).toContain("fuse");
    expect(graph.nodes.map((node) => node.label)).toEqual(expect.arrayContaining(["BCM C1 pin 12", "ACT C1 pin 2", "S08", "F12"]));
    expect(graph.edges).toHaveLength(3);
    expect(graph.nodes.some((node) => node.label.includes("SEG-CAN"))).toBe(false);
  });

  it("keeps source IDs and filters traces by domain", () => {
    const graph = buildFunctionalSchematicGraph({
      network: null,
      seed: { kind: "splice", spliceId: asSpliceId("S08") },
      activeFilter: "CAN",
      wires,
      segments,
      connectorMap: new Map(connectors.map((connector) => [connector.id, connector])),
      spliceMap: new Map(splices.map((splice) => [splice.id, splice])),
      catalogItemMap: new Map([[fuseCatalogItem.id, fuseCatalogItem]])
    });

    expect(graph.includedWireIds).toHaveLength(2);
    expect(graph.availableFilters).toContain("CAN");
    expect(graph.edges.every((edge) => edge.domainTags.includes("CAN"))).toBe(true);
    expect(graph.nodes.some((node) => node.sourceIds.includes("C-BCM"))).toBe(true);
  });

  it("can seed the trace from configured main harness connectors", () => {
    const graph = buildFunctionalSchematicGraph({
      network: { voltageV: 12 },
      seed: { kind: "wire", wireId: null },
      activeFilter: "all",
      wires,
      segments,
      connectorMap: new Map(connectors.map((connector) => [connector.id, connector])),
      spliceMap: new Map(splices.map((splice) => [splice.id, splice])),
      catalogItemMap: new Map([[fuseCatalogItem.id, fuseCatalogItem]]),
      rootConnectorIds: [asConnectorId("C-BCM")]
    });

    expect(graph.rootNodeIds).toContain("connector:C-BCM:pin:12");
    expect(graph.includedWireIds).toEqual([asWireId("W-001"), asWireId("W-002")]);
    expect(graph.edges[0]?.fromNodeId).toBe("connector:C-BCM:pin:12");
  });

  it("reports non-blocking warnings for missing data instead of failing generation", () => {
    const brokenWire: Wire = {
      ...wires[0]!,
      id: asWireId("W-BROKEN"),
      technicalId: "W-BROKEN",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-MISSING"), cavityIndex: 1 },
      routeSegmentIds: [],
      protection: { kind: "fuse", catalogItemId: asCatalogItemId("F-MISSING") }
    };
    const graph = buildFunctionalSchematicGraph({
      network: null,
      seed: { kind: "wire", wireId: brokenWire.id },
      activeFilter: "all",
      wires: [brokenWire],
      segments: [],
      connectorMap: new Map(connectors.map((connector) => [connector.id, connector])),
      spliceMap: new Map(splices.map((splice) => [splice.id, splice])),
      catalogItemMap: new Map()
    });

    expect(graph.warnings.map((warning) => warning.kind)).toEqual(
      expect.arrayContaining(["missing-endpoint", "ambiguous-domain"])
    );
    expect(graph.edges).toHaveLength(0);
  });

  it("traces across harnesses through physical interconnector links and colors wires by harness", () => {
    const networkA: Network = {
      id: asNetworkId("net-a"),
      name: "Harness A",
      technicalId: "H-A",
      createdAt: "2026-05-11T00:00:00.000Z",
      updatedAt: "2026-05-11T00:00:00.000Z"
    };
    const networkB: Network = {
      id: asNetworkId("net-b"),
      name: "Harness B",
      technicalId: "H-B",
      createdAt: "2026-05-11T00:00:00.000Z",
      updatedAt: "2026-05-11T00:00:00.000Z"
    };
    const assembly: HarnessAssembly = {
      id: asHarnessAssemblyId("asm-main"),
      name: "Main assembly",
      technicalId: "ASM-MAIN",
      members: [
        { networkId: networkA.id, color: "#2563eb" },
        { networkId: networkB.id, color: "#16a34a" }
      ],
      masterConnectorRefs: [{ networkId: networkA.id, connectorId: asConnectorId("C-A-MASTER") }],
      connectorLinks: [
        {
          id: "link-ab" as never,
          name: "Inline interface",
          sourceNetworkId: networkA.id,
          sourceConnectorId: asConnectorId("C-A-OUT"),
          targetNetworkId: networkB.id,
          targetConnectorId: asConnectorId("C-B-IN")
        }
      ],
      createdAt: "2026-05-11T00:00:00.000Z",
      updatedAt: "2026-05-11T00:00:00.000Z"
    };
    const networkAConnectors: Connector[] = [
      { id: asConnectorId("C-A-MASTER"), name: "Master", technicalId: "A-MASTER", cavityCount: 2 },
      { id: asConnectorId("C-A-OUT"), name: "Output", technicalId: "A-OUT", cavityCount: 2 }
    ];
    const networkBConnectors: Connector[] = [
      { id: asConnectorId("C-B-IN"), name: "Input", technicalId: "B-IN", cavityCount: 2 },
      { id: asConnectorId("C-B-END"), name: "Terminal", technicalId: "B-END", cavityCount: 2, isTerminalConnector: true }
    ];
    const networkAWires: Wire[] = [
      {
        id: asWireId("W-A"),
        name: "Wake A",
        technicalId: "W-A",
        sectionMm2: 0.35,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-A-MASTER"), cavityIndex: 1 },
        endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-A-OUT"), cavityIndex: 1 },
        routeSegmentIds: [asSegmentId("SEG-CAN-A")],
        lengthMm: 100,
        isRouteLocked: false
      }
    ];
    const networkBWires: Wire[] = [
      {
        id: asWireId("W-B"),
        name: "Wake B",
        technicalId: "W-B",
        sectionMm2: 0.35,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-B-IN"), cavityIndex: 1 },
        endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-B-END"), cavityIndex: 1 },
        routeSegmentIds: [asSegmentId("SEG-CAN-B")],
        lengthMm: 120,
        isRouteLocked: false
      }
    ];

    const graph = buildHarnessAssemblyFunctionalSchematicGraph({
      assembly,
      activeFilter: "all",
      networksById: new Map([
        [
          networkA.id,
          {
            network: networkA,
            wires: networkAWires,
            segments,
            connectorMap: new Map(networkAConnectors.map((connector) => [connector.id, connector])),
            spliceMap: new Map(),
            catalogItemMap: new Map()
          }
        ],
        [
          networkB.id,
          {
            network: networkB,
            wires: networkBWires,
            segments,
            connectorMap: new Map(networkBConnectors.map((connector) => [connector.id, connector])),
            spliceMap: new Map(),
            catalogItemMap: new Map()
          }
        ]
      ])
    });

    expect(graph.includedWireIds).toEqual([asWireId("W-A"), asWireId("W-B")]);
    expect(graph.nodes).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "interconnector", label: "Inline interface" })]));
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "W-A", harnessColor: "#2563eb" }),
        expect.objectContaining({ label: "W-B", harnessColor: "#16a34a" }),
        expect.objectContaining({ interconnectorLinkId: "link-ab" })
      ])
    );
    expect(graph.rootNodeIds).toContain("network:net-a:connector:C-A-MASTER:pin:1");
  });
});
