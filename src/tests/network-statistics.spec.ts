import { describe, expect, it } from "vitest";
import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  Network,
  NetworkId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireId
} from "../core/entities";
import { calculateNetworkStatistics, type NetworkStatisticsSlice } from "../app/lib/networkStatistics";
import { createEmptyNetworkScopedState, type EntityState, type NetworkScopedState } from "../store";

function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

function asNodeId(value: string): NodeId {
  return value as NodeId;
}

function asSegmentId(value: string): SegmentId {
  return value as SegmentId;
}

function asWireId(value: string): WireId {
  return value as WireId;
}

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

function makeNetwork(id: string, name = id): Network {
  return {
    id: asNetworkId(id),
    name,
    technicalId: id.toUpperCase(),
    createdAt: "2026-06-03T00:00:00.000Z",
    updatedAt: "2026-06-03T00:00:00.000Z"
  };
}

function makeConnector(id: string, extras: Partial<Connector> = {}): Connector {
  return {
    id: asConnectorId(id),
    name: id,
    technicalId: id,
    cavityCount: 4,
    ...extras
  };
}

function makeSplice(id: string, extras: Partial<Splice> = {}): Splice {
  return {
    id: asSpliceId(id),
    name: id,
    technicalId: id,
    portCount: 3,
    portMode: "bounded",
    ...extras
  };
}

function makeSegment(id: string, lengthMm: number): Segment {
  return {
    id: asSegmentId(id),
    nodeA: asNodeId(`${id}-a`),
    nodeB: asNodeId(`${id}-b`),
    lengthMm
  };
}

function makeWire(id: string, extras: Partial<Wire> = {}): Wire {
  return {
    id: asWireId(id),
    name: id,
    technicalId: id,
    sectionMm2: 1,
    primaryColorId: null,
    secondaryColorId: null,
    endpointA: {
      kind: "connectorCavity",
      connectorId: asConnectorId("C1"),
      cavityIndex: 1
    },
    endpointB: {
      kind: "splicePort",
      spliceId: asSpliceId("S1"),
      portIndex: 1
    },
    routeSegmentIds: [],
    lengthMm: 0,
    isRouteLocked: false,
    ...extras
  };
}

function makeCatalogItem(id: string, extras: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: asCatalogItemId(id),
    manufacturerReference: id,
    connectionCount: 4,
    ...extras
  };
}

function withEntities(base: NetworkScopedState, patch: Partial<NetworkScopedState>): NetworkScopedState {
  return {
    ...base,
    ...patch
  };
}

function entityState<T, Id extends string>(items: T[], getId: (item: T) => Id): EntityState<T, Id> {
  return {
    allIds: items.map(getId),
    byId: Object.fromEntries(items.map((item) => [getId(item), item]))
  } as EntityState<T, Id>;
}

function makeSlice(network: Network, state: Partial<NetworkScopedState>): NetworkStatisticsSlice {
  return {
    network,
    state: withEntities(createEmptyNetworkScopedState(), state)
  };
}

describe("calculateNetworkStatistics", () => {
  it("computes active-network counts, physical lengths, distributions, and utilization", () => {
    const catalog = makeCatalogItem("CAT-A", {
      connectorDefaults: {
        pinElectricalRoles: {
          1: { role: "source", currentA: 5 }
        }
      }
    });
    const connector = makeConnector("C1", {
      catalogItemId: catalog.id,
      pinElectricalRoles: { 2: { role: "consumer", currentA: 3 } }
    });
    const splice = makeSplice("S1", { catalogItemId: catalog.id, portMode: "directional", portCount: 2 });
    const wire = makeWire("W1", {
      lengthMm: 1250,
      currentA: 8,
      material: "aluminum",
      primaryColorId: "RD",
      protection: { kind: "fuse", catalogItemId: catalog.id },
      isRouteLocked: true
    });
    const state = makeSlice(makeNetwork("net-a", "Alpha"), {
      catalogItems: entityState([catalog], (item) => item.id),
      connectors: entityState([connector], (item) => item.id),
      splices: entityState([splice], (item) => item.id),
      nodes: entityState<NetworkNode, NodeId>(
        [
          { id: asNodeId("N-C"), kind: "connector", connectorId: connector.id },
          { id: asNodeId("N-S"), kind: "splice", spliceId: splice.id },
          { id: asNodeId("N-I"), kind: "intermediate", label: "I" }
        ],
        (item) => item.id
      ),
      wires: entityState([wire], (item) => item.id),
      connectorCavityOccupancy: { [connector.id]: { 1: "wire:W1:A", 2: "manual" } },
      splicePortOccupancy: { [splice.id]: { 1: "wire:W1:B" } }
    });

    const result = calculateNetworkStatistics({ slices: [state] });
    const stats = result.perNetwork[0]!;

    expect(stats.counts).toMatchObject({
      connectors: 1,
      splices: 1,
      connectorNodes: 1,
      spliceNodes: 1,
      intermediateNodes: 1,
      wires: 1,
      catalogItems: 1
    });
    expect(stats.wireLengths.totalMm).toBe(1250);
    expect(stats.wireLengths.averageMm).toBe(1250);
    expect(stats.wireLengths.routeLockedPercent).toBe(100);
    expect(stats.materialDistribution).toEqual([{ key: "aluminum", label: "aluminum", count: 1, totalLengthMm: 1250 }]);
    expect(stats.electricalMetadata).toEqual({ wiresWithCurrentA: 1, maxCurrentA: 8, fuseProtectedWires: 1 });
    expect(stats.pinRoles).toMatchObject({ source: 1, consumer: 1, connectorsWithDeclaredRoles: 1 });
    expect(stats.connectorUtilization).toMatchObject({ totalWays: 4, occupiedWays: 2, occupancyPercent: 50 });
    expect(stats.spliceUtilization).toMatchObject({
      finitePortCapacity: 2,
      occupiedFinitePorts: 1,
      finiteOccupancyPercent: 50,
      directionalSpliceCount: 1
    });
    expect(stats.catalogLinkage).toMatchObject({
      linkedConnectors: 1,
      unlinkedConnectors: 0,
      linkedSplices: 1,
      unlinkedSplices: 0
    });
  });

  it("falls back to route segment lengths and ignores non-physical wires", () => {
    const segmentA = makeSegment("SEG-A", 400);
    const segmentB = makeSegment("SEG-B", 600);
    const routed = makeWire("W-routed", {
      routeSegmentIds: [segmentA.id, segmentB.id],
      lengthMm: 0
    });
    const ignored = makeWire("W-ignored", {
      routeSegmentIds: [],
      lengthMm: 0
    });
    const slice = makeSlice(makeNetwork("net-a"), {
      segments: entityState([segmentA, segmentB], (item) => item.id),
      wires: entityState([routed, ignored], (item) => item.id)
    });

    const result = calculateNetworkStatistics({ slices: [slice] });
    const lengths = result.aggregate.wireLengths;

    expect(lengths.totalMm).toBe(1000);
    expect(lengths.includedWireCount).toBe(1);
    expect(lengths.ignoredWireCount).toBe(1);
    expect(lengths.minMm).toBe(1000);
    expect(lengths.maxMm).toBe(1000);
    expect(lengths.longestWires.map((wire) => wire.technicalId)).toEqual(["W-routed"]);
  });

  it("returns exact aggregate totals for manual multi-network selections", () => {
    const first = makeSlice(makeNetwork("net-b", "Beta"), {
      connectors: entityState([makeConnector("C1")], (item) => item.id),
      wires: entityState([makeWire("W1", { lengthMm: 100 }), makeWire("W2", { lengthMm: 300 })], (item) => item.id)
    });
    const second = makeSlice(makeNetwork("net-a", "Alpha"), {
      connectors: entityState([makeConnector("C2"), makeConnector("C3")], (item) => item.id),
      wires: entityState([makeWire("W3", { lengthMm: 500 })], (item) => item.id)
    });

    const result = calculateNetworkStatistics({ slices: [first, second] });

    expect(result.perNetwork.map((row) => row.networkName)).toEqual(["Alpha", "Beta"]);
    expect(result.aggregate.counts.connectors).toBe(3);
    expect(result.aggregate.wireLengths.totalMm).toBe(900);
    expect(result.aggregate.wireLengths.medianMm).toBe(300);
    expect(result.aggregate.wireLengths.averageMm).toBe(300);
  });

  it("uses explicit unspecified buckets for material and color distributions", () => {
    const slice = makeSlice(makeNetwork("net-a"), {
      wires: entityState([makeWire("W1", { lengthMm: 100 })], (item) => item.id)
    });

    const result = calculateNetworkStatistics({ slices: [slice] });

    expect(result.aggregate.materialDistribution).toEqual([
      { key: "unspecified", label: "Unspecified", count: 1, totalLengthMm: 100 }
    ]);
    expect(result.aggregate.colorDistribution).toEqual([
      { key: "unspecified", label: "Unspecified", count: 1, totalLengthMm: 100 }
    ]);
  });
});
