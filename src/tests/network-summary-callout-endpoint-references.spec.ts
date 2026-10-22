import { describe, expect, it } from "vitest";
import type { CatalogItem, CatalogItemId, Connector, ConnectorId, Splice, SpliceId, Wire, WireId } from "../core/entities";
import { resolveEffectiveWireEndpointReferences } from "../core/connectorCatalogMaterials";
import {
  buildConnectorCalloutGroupsById,
  buildSpliceCalloutGroupsById
} from "../app/components/network-summary/callouts/calloutModel";
import type { CalloutEntry } from "../app/components/network-summary/callouts/calloutLayout";

const CATALOG_ID = "CAT-1" as CatalogItemId;

function connector(id: string, overrides: Partial<Connector> = {}): Connector {
  return {
    id: id as ConnectorId,
    name: id,
    technicalId: id,
    cavityCount: 3,
    ...overrides
  };
}

function splice(id: string, overrides: Partial<Splice> = {}): Splice {
  return {
    id: id as SpliceId,
    name: id,
    technicalId: id,
    portCount: 4,
    ...overrides
  };
}

function wire(id: string, overrides: Partial<Wire>): Wire {
  return {
    id: id as WireId,
    name: id,
    technicalId: id,
    sectionMm2: 0.5,
    primaryColorId: null,
    secondaryColorId: null,
    routeSegmentIds: [],
    lengthMm: 100,
    isRouteLocked: false,
    endpointA: { kind: "connectorCavity", connectorId: "C1" as ConnectorId, cavityIndex: 1 },
    endpointB: { kind: "connectorCavity", connectorId: "C2" as ConnectorId, cavityIndex: 1 },
    ...overrides
  };
}

const catalogItem = {
  id: CATALOG_ID,
  manufacturerReference: "HOUSING-1",
  connectorDefaults: {
    allSameTerminals: true,
    defaultTerminal: { terminalReference: "CAT-TERM", sealReference: "CAT-SEAL" },
    terminalOverrides: { 2: { terminalReference: "CAT-TERM-C2", sealReference: "CAT-SEAL-C2" } }
  }
} as unknown as CatalogItem;

function references(entry: CalloutEntry | undefined): Record<string, string | null | undefined> {
  return {
    side: entry?.localEndpointSide,
    localConnection: entry?.localConnectionReference,
    localSeal: entry?.localSealReference,
    oppositeConnection: entry?.oppositeConnectionReference,
    oppositeSeal: entry?.oppositeSealReference
  };
}

function buildConnectorEntries(
  connectors: Connector[],
  wires: Wire[],
  splices: Splice[] = []
): Map<ConnectorId, CalloutEntry[][]> {
  const groupsById = buildConnectorCalloutGroupsById({
    connectorMap: new Map(connectors.map((entry) => [entry.id, entry])),
    catalogItemMap: new Map([[CATALOG_ID, catalogItem]]),
    spliceMap: new Map(splices.map((entry) => [entry.id, entry])),
    wires
  });
  return new Map([...groupsById].map(([id, groups]) => [id, groups.map((group) => group.entries)]));
}

describe("callout endpoint material references", () => {
  it("resolves local and opposite references relative to each row with asymmetric A/B values", () => {
    const asymmetric = wire("W1", {
      endpointAConnectionReference: "A-CONN",
      endpointASealReference: "A-SEAL",
      endpointBConnectionReference: "B-CONN",
      endpointBSealReference: "B-SEAL"
    });
    const entries = buildConnectorEntries([connector("C1"), connector("C2")], [asymmetric]);

    expect(references(entries.get("C1" as ConnectorId)?.[0]?.[0])).toEqual({
      side: "A",
      localConnection: "A-CONN",
      localSeal: "A-SEAL",
      oppositeConnection: "B-CONN",
      oppositeSeal: "B-SEAL"
    });
    expect(references(entries.get("C2" as ConnectorId)?.[0]?.[0])).toEqual({
      side: "B",
      localConnection: "B-CONN",
      localSeal: "B-SEAL",
      oppositeConnection: "A-CONN",
      oppositeSeal: "A-SEAL"
    });
  });

  it("keeps references attached to the physical endpoint when A/B is swapped with its metadata", () => {
    const swapped = wire("W1", {
      endpointA: { kind: "connectorCavity", connectorId: "C2" as ConnectorId, cavityIndex: 1 },
      endpointB: { kind: "connectorCavity", connectorId: "C1" as ConnectorId, cavityIndex: 1 },
      endpointAConnectionReference: "B-CONN",
      endpointBConnectionReference: "A-CONN"
    });
    const entries = buildConnectorEntries([connector("C1"), connector("C2")], [swapped]);

    expect(entries.get("C1" as ConnectorId)?.[0]?.[0]?.localConnectionReference).toBe("A-CONN");
    expect(entries.get("C1" as ConnectorId)?.[0]?.[0]?.oppositeConnectionReference).toBe("B-CONN");
    expect(entries.get("C2" as ConnectorId)?.[0]?.[0]?.localConnectionReference).toBe("B-CONN");
  });

  it("gives a self-loop two rows with mirrored local/opposite values", () => {
    const loop = wire("W-LOOP", {
      endpointA: { kind: "connectorCavity", connectorId: "C1" as ConnectorId, cavityIndex: 1 },
      endpointB: { kind: "connectorCavity", connectorId: "C1" as ConnectorId, cavityIndex: 3 },
      endpointAConnectionReference: "LOOP-A",
      endpointBConnectionReference: "LOOP-B"
    });
    const groups = buildConnectorEntries([connector("C1")], [loop]).get("C1" as ConnectorId) ?? [];

    expect(references(groups[0]?.[0])).toMatchObject({ side: "A", localConnection: "LOOP-A", oppositeConnection: "LOOP-B" });
    expect(references(groups[2]?.[0])).toMatchObject({ side: "B", localConnection: "LOOP-B", oppositeConnection: "LOOP-A" });
  });

  it("keeps one row per wire sharing a cavity without collapsing distinct references", () => {
    const first = wire("W1", { endpointAConnectionReference: "SHARED-1" });
    const second = wire("W2", {
      endpointA: { kind: "connectorCavity", connectorId: "C1" as ConnectorId, cavityIndex: 1, allowSharedCavity: true },
      endpointAConnectionReference: "SHARED-2"
    });
    const rows = buildConnectorEntries([connector("C1"), connector("C2")], [first, second]).get("C1" as ConnectorId)?.[0] ?? [];

    expect(rows.map((row) => [row.wireId, row.localConnectionReference])).toEqual([
      ["W1", "SHARED-1"],
      ["W2", "SHARED-2"]
    ]);
  });

  it("applies manual-over-cavity/catalog precedence and never borrows the other endpoint", () => {
    const catalogConnector = connector("C1", {
      catalogItemId: CATALOG_ID,
      terminalOverrides: { 3: { terminalReference: "INSTANCE-TERM" } }
    });
    const wires = [
      wire("W-CATALOG", { endpointBConnectionReference: "B-ONLY" }),
      wire("W-CAVITY", {
        endpointA: { kind: "connectorCavity", connectorId: "C1" as ConnectorId, cavityIndex: 2 },
        endpointAConnectionReference: "   "
      }),
      wire("W-INSTANCE", {
        endpointA: { kind: "connectorCavity", connectorId: "C1" as ConnectorId, cavityIndex: 3 }
      }),
      wire("W-MANUAL", {
        endpointA: { kind: "connectorCavity", connectorId: "C1" as ConnectorId, cavityIndex: 2 },
        endpointAConnectionReference: " MANUAL-TERM ",
        endpointASealReference: "MANUAL-SEAL"
      })
    ];
    const groups = buildConnectorEntries([catalogConnector, connector("C2")], wires);
    const c1 = groups.get("C1" as ConnectorId) ?? [];
    const byWire = new Map(c1.flat().map((entry) => [entry.wireId, entry]));

    expect(references(byWire.get("W-CATALOG"))).toMatchObject({ localConnection: "CAT-TERM", localSeal: "CAT-SEAL", oppositeConnection: "B-ONLY", oppositeSeal: null });
    expect(references(byWire.get("W-CAVITY"))).toMatchObject({ localConnection: "CAT-TERM-C2", localSeal: "CAT-SEAL-C2" });
    expect(references(byWire.get("W-INSTANCE"))).toMatchObject({ localConnection: "INSTANCE-TERM", localSeal: null });
    expect(references(byWire.get("W-MANUAL"))).toMatchObject({ localConnection: "MANUAL-TERM", localSeal: "MANUAL-SEAL" });

    const c2Row = groups.get("C2" as ConnectorId)?.[0]?.find((entry) => entry.wireId === "W-CATALOG");
    expect(references(c2Row)).toMatchObject({ localConnection: "B-ONLY", localSeal: null, oppositeConnection: "CAT-TERM" });
  });

  it("suppresses catalog seal fallback when applyCatalogSeals is false but keeps manual seals", () => {
    const noSeals = connector("C1", { catalogItemId: CATALOG_ID, applyCatalogSeals: false });
    const connectorById = new Map([[noSeals.id, noSeals]]);
    const catalogById = new Map([[CATALOG_ID, catalogItem]]);

    expect(resolveEffectiveWireEndpointReferences(wire("W1", {}), "A", connectorById, catalogById)).toEqual({
      connectionReference: "CAT-TERM",
      sealReference: undefined
    });
    expect(
      resolveEffectiveWireEndpointReferences(wire("W1", { endpointASealReference: "MANUAL-SEAL" }), "A", connectorById, catalogById)
    ).toEqual({ connectionReference: "CAT-TERM", sealReference: "MANUAL-SEAL" });
  });

  it("returns no reference for absent or deleted catalog links", () => {
    const orphan = connector("C1", { catalogItemId: "CAT-DELETED" as CatalogItemId });
    expect(
      resolveEffectiveWireEndpointReferences(wire("W1", {}), "A", new Map([[orphan.id, orphan]]), new Map())
    ).toEqual({ connectionReference: undefined, sealReference: undefined });
  });

  it("uses only explicit references on splice endpoints, in splice and connector callouts", () => {
    const toSplice = wire("W-SPLICE", {
      endpointB: { kind: "splicePort", spliceId: "S1" as SpliceId, portIndex: 2 },
      endpointAConnectionReference: "C-SIDE",
      endpointBSealReference: "SPLICE-SEAL"
    });
    const splices = [splice("S1")];
    const connectors = [connector("C1", { catalogItemId: CATALOG_ID })];
    const connectorRow = buildConnectorEntries(connectors, [toSplice], splices).get("C1" as ConnectorId)?.[0]?.[0];
    expect(references(connectorRow)).toMatchObject({
      localConnection: "C-SIDE",
      localSeal: "CAT-SEAL",
      oppositeConnection: null,
      oppositeSeal: "SPLICE-SEAL"
    });

    const spliceGroups = buildSpliceCalloutGroupsById({
      connectorMap: new Map(connectors.map((entry) => [entry.id, entry])),
      catalogItemMap: new Map([[CATALOG_ID, catalogItem]]),
      spliceMap: new Map(splices.map((entry) => [entry.id, entry])),
      wires: [toSplice]
    }).get("S1" as SpliceId);
    expect(references(spliceGroups?.find((group) => group.entries.length > 0)?.entries[0])).toEqual({
      side: "B",
      localConnection: null,
      localSeal: "SPLICE-SEAL",
      oppositeConnection: "C-SIDE",
      oppositeSeal: "CAT-SEAL"
    });
  });

  it("is read-only: building callouts never writes resolved defaults back to wires", () => {
    const source = wire("W1", {});
    const snapshot = JSON.stringify(source);
    buildConnectorEntries([connector("C1", { catalogItemId: CATALOG_ID }), connector("C2")], [source]);
    expect(JSON.stringify(source)).toBe(snapshot);
  });
});
