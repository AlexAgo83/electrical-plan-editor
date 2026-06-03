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

function createFuseBoxCatalogItem(id = "FBOX-CAT"): CatalogItem {
  return {
    id: asCatalogItemId(id),
    manufacturerReference: "FBOX-4",
    connectionCount: 4,
    name: "Four way fuse box",
    fuseBoxConfig: {
      pairs: [
        { pairIndex: 0, pinA: 1, pinB: 2 },
        { pairIndex: 1, pinA: 3, pinB: 4 }
      ]
    }
  };
}

function createFuseBoxTraceFixture() {
  const fuseBoxCatalogItem = createFuseBoxCatalogItem();
  const traceConnectors: Connector[] = [
    { id: asConnectorId("C-MAIN"), name: "Main", technicalId: "MAIN", cavityCount: 2 },
    {
      id: asConnectorId("C-FUSE"),
      name: "Fuse box",
      technicalId: "FUSEBOX",
      cavityCount: 4,
      catalogItemId: fuseBoxCatalogItem.id,
      fusePairRatings: { 0: 10 }
    },
    { id: asConnectorId("C-LOAD"), name: "Load", technicalId: "LOAD", cavityCount: 2 },
    { id: asConnectorId("C-AUX-A"), name: "Aux A", technicalId: "AUX-A", cavityCount: 2 },
    { id: asConnectorId("C-AUX-B"), name: "Aux B", technicalId: "AUX-B", cavityCount: 2 }
  ];
  const traceWires: Wire[] = [
    {
      id: asWireId("W-IN"),
      name: "Main feed",
      technicalId: "W-IN",
      sectionMm2: 1,
      primaryColorId: null,
      secondaryColorId: null,
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-MAIN"), cavityIndex: 1 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-FUSE"), cavityIndex: 1 },
      routeSegmentIds: [],
      lengthMm: 100,
      isRouteLocked: false
    },
    {
      id: asWireId("W-OUT"),
      name: "Protected load",
      technicalId: "W-OUT",
      sectionMm2: 1,
      primaryColorId: null,
      secondaryColorId: null,
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-FUSE"), cavityIndex: 2 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-LOAD"), cavityIndex: 1 },
      routeSegmentIds: [],
      lengthMm: 100,
      isRouteLocked: false
    },
    {
      id: asWireId("W-AUX-IN"),
      name: "Aux feed",
      technicalId: "W-AUX-IN",
      sectionMm2: 1,
      primaryColorId: null,
      secondaryColorId: null,
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-AUX-A"), cavityIndex: 1 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-FUSE"), cavityIndex: 3 },
      routeSegmentIds: [],
      lengthMm: 100,
      isRouteLocked: false
    },
    {
      id: asWireId("W-AUX-OUT"),
      name: "Aux protected",
      technicalId: "W-AUX-OUT",
      sectionMm2: 1,
      primaryColorId: null,
      secondaryColorId: null,
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-FUSE"), cavityIndex: 4 },
      endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-AUX-B"), cavityIndex: 1 },
      routeSegmentIds: [],
      lengthMm: 100,
      isRouteLocked: false
    }
  ];

  return {
    catalogItems: [fuseBoxCatalogItem],
    connectors: traceConnectors,
    wires: traceWires,
    connectorMap: new Map(traceConnectors.map((connector) => [connector.id, connector])),
    catalogItemMap: new Map([[fuseBoxCatalogItem.id, fuseBoxCatalogItem]])
  };
}

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

  it("uses explicit wire functional tags before text and route heuristics", () => {
    const taggedWire: Wire = {
      ...wires[1]!,
      id: asWireId("W-SIGNAL"),
      name: "Door command",
      technicalId: "W-SIGNAL",
      functionalDomainTag: "Signal",
      routeSegmentIds: []
    };
    const graph = buildFunctionalSchematicGraph({
      network: null,
      seed: { kind: "wire", wireId: taggedWire.id },
      activeFilter: "Signal",
      wires: [taggedWire],
      segments: [],
      connectorMap: new Map(connectors.map((connector) => [connector.id, connector])),
      spliceMap: new Map(splices.map((splice) => [splice.id, splice])),
      catalogItemMap: new Map()
    });

    expect(graph.includedWireIds).toEqual([taggedWire.id]);
    expect(graph.availableFilters).toContain("Signal");
    expect(graph.edges.every((edge) => edge.domainTags.includes("Signal"))).toBe(true);
    expect(graph.warnings.map((warning) => warning.kind)).not.toContain("ambiguous-domain");
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

  it("expands a trace across a fuse-box pair from the main connector side", () => {
    const fixture = createFuseBoxTraceFixture();
    const graph = buildFunctionalSchematicGraph({
      network: { voltageV: 12 },
      seed: { kind: "connector", connectorId: asConnectorId("C-MAIN") },
      activeFilter: "all",
      wires: fixture.wires,
      segments: [],
      connectorMap: fixture.connectorMap,
      spliceMap: new Map(),
      catalogItemMap: fixture.catalogItemMap
    });

    expect(graph.includedWireIds).toEqual([asWireId("W-IN"), asWireId("W-OUT")]);
    expect(graph.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "fuse-box:C-FUSE:pair0", kind: "fuse", label: "FUSEBOX", ratingLabel: "10A" })
      ])
    );
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "W-IN",
          fromNodeId: "connector:C-MAIN:pin:1",
          toNodeId: "fuse-box:C-FUSE:pair0"
        }),
        expect.objectContaining({
          label: "W-OUT",
          fromNodeId: "fuse-box:C-FUSE:pair0",
          toNodeId: "connector:C-LOAD:pin:1"
        })
      ])
    );
    expect(graph.edges).toHaveLength(2);
  });

  it("expands a trace across a fuse-box pair from the consumer side and from a selected wire", () => {
    const fixture = createFuseBoxTraceFixture();
    const fromConsumer = buildFunctionalSchematicGraph({
      network: null,
      seed: { kind: "connector", connectorId: asConnectorId("C-LOAD") },
      activeFilter: "all",
      wires: fixture.wires,
      segments: [],
      connectorMap: fixture.connectorMap,
      spliceMap: new Map(),
      catalogItemMap: fixture.catalogItemMap
    });
    const fromIncomingWire = buildFunctionalSchematicGraph({
      network: null,
      seed: { kind: "wire", wireId: asWireId("W-IN") },
      activeFilter: "all",
      wires: fixture.wires,
      segments: [],
      connectorMap: fixture.connectorMap,
      spliceMap: new Map(),
      catalogItemMap: fixture.catalogItemMap
    });

    expect(fromConsumer.includedWireIds).toEqual([asWireId("W-IN"), asWireId("W-OUT")]);
    expect(fromIncomingWire.includedWireIds).toEqual([asWireId("W-IN"), asWireId("W-OUT")]);
  });

  it("does not bridge unrelated fuse-box pairs", () => {
    const fixture = createFuseBoxTraceFixture();
    const graph = buildFunctionalSchematicGraph({
      network: null,
      seed: { kind: "connector", connectorId: asConnectorId("C-MAIN") },
      activeFilter: "all",
      wires: fixture.wires,
      segments: [],
      connectorMap: fixture.connectorMap,
      spliceMap: new Map(),
      catalogItemMap: fixture.catalogItemMap
    });

    expect(graph.includedWireIds).toEqual([asWireId("W-IN"), asWireId("W-OUT")]);
    expect(graph.includedWireIds).not.toContain(asWireId("W-AUX-IN"));
    expect(graph.includedWireIds).not.toContain(asWireId("W-AUX-OUT"));
  });

  it("renders explicit fuse-to-fuse interconnection edges and same-pair loops", () => {
    const fuseCatalogA = createFuseBoxCatalogItem("FBOX-A");
    const fuseCatalogB = createFuseBoxCatalogItem("FBOX-B");
    const fuseConnectors: Connector[] = [
      { id: asConnectorId("C-MAIN"), name: "Main", technicalId: "MAIN", cavityCount: 2 },
      {
        id: asConnectorId("C-FUSE-A"),
        name: "Fuse box A",
        technicalId: "FUSE-A",
        cavityCount: 4,
        catalogItemId: fuseCatalogA.id
      },
      {
        id: asConnectorId("C-FUSE-B"),
        name: "Fuse box B",
        technicalId: "FUSE-B",
        cavityCount: 4,
        catalogItemId: fuseCatalogB.id
      },
      { id: asConnectorId("C-LOAD"), name: "Load", technicalId: "LOAD", cavityCount: 2 }
    ];
    const fuseWires: Wire[] = [
      {
        id: asWireId("W-IN"),
        name: "Main feed",
        technicalId: "W-IN",
        sectionMm2: 1,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-MAIN"), cavityIndex: 1 },
        endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-FUSE-A"), cavityIndex: 1 },
        routeSegmentIds: [],
        lengthMm: 100,
        isRouteLocked: false
      },
      {
        id: asWireId("W-CENTER"),
        name: "Center link",
        technicalId: "W-CENTER",
        sectionMm2: 1,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-FUSE-A"), cavityIndex: 2 },
        endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-FUSE-B"), cavityIndex: 1 },
        routeSegmentIds: [],
        lengthMm: 100,
        isRouteLocked: false
      },
      {
        id: asWireId("W-OUT"),
        name: "Load feed",
        technicalId: "W-OUT",
        sectionMm2: 1,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-FUSE-B"), cavityIndex: 2 },
        endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-LOAD"), cavityIndex: 1 },
        routeSegmentIds: [],
        lengthMm: 100,
        isRouteLocked: false
      },
      {
        id: asWireId("W-LOOP"),
        name: "Loop debug",
        technicalId: "W-LOOP",
        sectionMm2: 1,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-FUSE-A"), cavityIndex: 1 },
        endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-FUSE-A"), cavityIndex: 2 },
        routeSegmentIds: [],
        lengthMm: 100,
        isRouteLocked: false
      }
    ];

    const chainGraph = buildFunctionalSchematicGraph({
      network: null,
      seed: { kind: "wire", wireId: asWireId("W-IN") },
      activeFilter: "all",
      wires: fuseWires.filter((wire) => wire.id !== asWireId("W-LOOP")),
      segments: [],
      connectorMap: new Map(fuseConnectors.map((connector) => [connector.id, connector])),
      spliceMap: new Map(),
      catalogItemMap: new Map([
        [fuseCatalogA.id, fuseCatalogA],
        [fuseCatalogB.id, fuseCatalogB]
      ])
    });
    const loopGraph = buildFunctionalSchematicGraph({
      network: null,
      seed: { kind: "wire", wireId: asWireId("W-LOOP") },
      activeFilter: "all",
      wires: [fuseWires[3]!],
      segments: [],
      connectorMap: new Map(fuseConnectors.map((connector) => [connector.id, connector])),
      spliceMap: new Map(),
      catalogItemMap: new Map([
        [fuseCatalogA.id, fuseCatalogA],
        [fuseCatalogB.id, fuseCatalogB]
      ])
    });

    expect(chainGraph.includedWireIds).toEqual([asWireId("W-IN"), asWireId("W-CENTER"), asWireId("W-OUT")]);
    expect(chainGraph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "W-CENTER",
          fromNodeId: "fuse-box:C-FUSE-A:pair0",
          toNodeId: "fuse-box:C-FUSE-B:pair0"
        })
      ])
    );
    expect(loopGraph.edges).toEqual([
      expect.objectContaining({
        label: "W-LOOP",
        fromNodeId: "fuse-box:C-FUSE-A:pair0",
        toNodeId: "fuse-box:C-FUSE-A:pair0"
      })
    ]);
  });

  it("expands traces through mixed splices and fuse-box pairs", () => {
    const fuseBoxCatalogItem = createFuseBoxCatalogItem();
    const mixedSplice = { id: asSpliceId("S-MIX"), name: "Mixed splice", technicalId: "S-MIX", portCount: 3 };
    const mixedConnectors: Connector[] = [
      { id: asConnectorId("C-MAIN"), name: "Main", technicalId: "MAIN", cavityCount: 2 },
      {
        id: asConnectorId("C-FUSE"),
        name: "Fuse box",
        technicalId: "FUSEBOX",
        cavityCount: 4,
        catalogItemId: fuseBoxCatalogItem.id
      },
      { id: asConnectorId("C-LOAD"), name: "Load", technicalId: "LOAD", cavityCount: 2 }
    ];
    const mixedWires: Wire[] = [
      {
        id: asWireId("W-MAIN-SPLICE"),
        name: "Main to splice",
        technicalId: "W-MAIN-SPLICE",
        sectionMm2: 1,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-MAIN"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: mixedSplice.id, portIndex: 1 },
        routeSegmentIds: [],
        lengthMm: 100,
        isRouteLocked: false
      },
      {
        id: asWireId("W-SPLICE-FUSE"),
        name: "Splice to fuse",
        technicalId: "W-SPLICE-FUSE",
        sectionMm2: 1,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: { kind: "splicePort", spliceId: mixedSplice.id, portIndex: 2 },
        endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-FUSE"), cavityIndex: 1 },
        routeSegmentIds: [],
        lengthMm: 100,
        isRouteLocked: false
      },
      {
        id: asWireId("W-FUSE-LOAD"),
        name: "Fuse to load",
        technicalId: "W-FUSE-LOAD",
        sectionMm2: 1,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-FUSE"), cavityIndex: 2 },
        endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-LOAD"), cavityIndex: 1 },
        routeSegmentIds: [],
        lengthMm: 100,
        isRouteLocked: false
      }
    ];

    const graph = buildFunctionalSchematicGraph({
      network: null,
      seed: { kind: "connector", connectorId: asConnectorId("C-MAIN") },
      activeFilter: "all",
      wires: mixedWires,
      segments: [],
      connectorMap: new Map(mixedConnectors.map((connector) => [connector.id, connector])),
      spliceMap: new Map([[mixedSplice.id, mixedSplice]]),
      catalogItemMap: new Map([[fuseBoxCatalogItem.id, fuseBoxCatalogItem]])
    });

    expect(graph.includedWireIds).toEqual([
      asWireId("W-MAIN-SPLICE"),
      asWireId("W-SPLICE-FUSE"),
      asWireId("W-FUSE-LOAD")
    ]);
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
        colorMode: "catalog",
        primaryColorId: "RD",
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
        colorMode: "catalog",
        primaryColorId: "BU",
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
    expect(graph.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "interconnector",
          label: "Inline interface",
          detailTop: "H-A / A-OUT pin 1 - Output",
          detailBottom: "H-B / B-IN pin 1 - Input"
        })
      ])
    );
    expect(graph.nodes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "network:net-a:connector:C-A-OUT:pin:1" }),
        expect.objectContaining({ id: "network:net-b:connector:C-B-IN:pin:1" })
      ])
    );
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "W-A",
          toNodeId: "interconnector:link-ab:pin:1",
          harnessColor: "#2563eb"
        }),
        expect.objectContaining({
          label: "W-B",
          fromNodeId: "interconnector:link-ab:pin:1",
          wireName: "Wake B",
          wireTechnicalId: "W-B",
          wirePrimaryColorId: "BU",
          harnessColor: "#16a34a"
        })
      ])
    );
    expect(graph.edges).toHaveLength(2);
    expect(graph.rootNodeIds).toContain("network:net-a:connector:C-A-MASTER:pin:1");
  });

  it("stops assembly expansion at unselected master connectors so unrelated downstream branches do not leak", () => {
    const network: Network = {
      id: asNetworkId("net-main"),
      name: "Main harness",
      technicalId: "H-MAIN",
      createdAt: "2026-05-11T00:00:00.000Z",
      updatedAt: "2026-05-11T00:00:00.000Z"
    };
    const assembly: HarnessAssembly = {
      id: asHarnessAssemblyId("asm-boundary"),
      name: "Boundary assembly",
      technicalId: "ASM-BOUNDARY",
      members: [{ networkId: network.id, color: "#2563eb" }],
      masterConnectorRefs: [{ networkId: network.id, connectorId: asConnectorId("C-ROOT") }],
      connectorLinks: [],
      createdAt: "2026-05-11T00:00:00.000Z",
      updatedAt: "2026-05-11T00:00:00.000Z"
    };
    const networkConnectors: Connector[] = [
      { id: asConnectorId("C-ROOT"), name: "Root", technicalId: "ROOT", cavityCount: 2 },
      {
        id: asConnectorId("C-HUB"),
        name: "Main hub",
        technicalId: "HUB",
        cavityCount: 2,
        isMainHarnessConnector: true
      },
      { id: asConnectorId("C-LEAK"), name: "Leak branch", technicalId: "LEAK", cavityCount: 2 }
    ];
    const networkWires: Wire[] = [
      {
        id: asWireId("W-ROOT"),
        name: "Root feed",
        technicalId: "W-ROOT",
        sectionMm2: 0.35,
        colorMode: "catalog",
        primaryColorId: "RD",
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-ROOT"), cavityIndex: 1 },
        endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-HUB"), cavityIndex: 1 },
        routeSegmentIds: [],
        lengthMm: 50,
        isRouteLocked: false
      },
      {
        id: asWireId("W-LEAK"),
        name: "Unexpected branch",
        technicalId: "W-LEAK",
        sectionMm2: 0.35,
        colorMode: "catalog",
        primaryColorId: "BU",
        secondaryColorId: null,
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C-HUB"), cavityIndex: 2 },
        endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C-LEAK"), cavityIndex: 1 },
        routeSegmentIds: [],
        lengthMm: 50,
        isRouteLocked: false
      }
    ];

    const graph = buildHarnessAssemblyFunctionalSchematicGraph({
      assembly,
      activeFilter: "all",
      rootConnectorRefs: [{ networkId: network.id, connectorId: asConnectorId("C-ROOT") }],
      networksById: new Map([
        [
          network.id,
          {
            network,
            wires: networkWires,
            segments: [],
            connectorMap: new Map(networkConnectors.map((connector) => [connector.id, connector])),
            spliceMap: new Map(),
            catalogItemMap: new Map()
          }
        ]
      ])
    });

    expect(graph.includedWireIds).toEqual([asWireId("W-ROOT")]);
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]?.label).toBe("W-ROOT");
    expect(graph.edges.some((edge) => edge.label === "W-LEAK")).toBe(false);
    expect(graph.nodes.some((node) => node.label.includes("HUB"))).toBe(true);
  });
});
