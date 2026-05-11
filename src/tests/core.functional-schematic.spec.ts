import { describe, expect, it } from "vitest";
import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireId
} from "../core/entities";
import { buildFunctionalSchematicGraph } from "../core/functionalSchematic";

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
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
});
