import { describe, expect, it } from "vitest";
import type { CatalogItem, CatalogItemId, Connector, ConnectorId, Splice, SpliceId, Wire, WireId } from "../core/entities";
import { buildWireListSheet } from "../app/lib/wireListExport";

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

function asWireId(value: string): WireId {
  return value as WireId;
}

describe("buildWireListSheet", () => {
  it("uses catalog connector defaults, keeps manual overrides, and leaves splice connection refs empty without splice material", () => {
    const catalogItems: CatalogItem[] = [
      {
        id: asCatalogItemId("CAT-1"),
        manufacturerReference: "CONN-CAT-1",
        connectionCount: 2,
        connectorDefaults: {
          allSameTerminals: true,
          defaultTerminal: {
            terminalReference: "TERM-DEFAULT",
            terminalName: "Default terminal",
            sealReference: "SEAL-DEFAULT",
            sealName: "Default seal"
          }
        }
      }
    ];
    const connectors: Connector[] = [
      {
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-1",
        cavityCount: 2,
        catalogItemId: asCatalogItemId("CAT-1")
      }
    ];
    const splices: Splice[] = [
      {
        id: asSpliceId("S1"),
        name: "Splice 1",
        technicalId: "S-1",
        portCount: 2
      }
    ];
    const wires: Wire[] = [
      {
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-001",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 100,
        sectionMm2: 1,
        isRouteLocked: false
      },
      {
        id: asWireId("W2"),
        name: "Wire 2",
        technicalId: "W-002",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 2 },
        endpointB: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointAConnectionReference: "TERM-MANUAL",
        endpointAConnectionName: "Manual terminal",
        endpointBSealReference: "SEAL-MANUAL",
        endpointBSealName: "Manual seal",
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 150,
        sectionMm2: 1.5,
        isRouteLocked: false
      }
    ];

    const sheet = buildWireListSheet("Wires", wires, connectors, splices, catalogItems);

    expect(sheet.headers).toEqual([
      "Technical ID",
      "Name",
      "Twist group",
      "Section (mm²)",
      "Color",
      "Begin type",
      "Begin ref",
      "Begin pin",
      "Begin connection ref",
      "Begin connection name",
      "Begin seal ref",
      "Begin seal name",
      "End type",
      "End ref",
      "End pin",
      "End connection ref",
      "End connection name",
      "End seal ref",
      "End seal name",
      "Length (mm)"
    ]);
    expect(sheet.rows[0]).toEqual([
      "W-001",
      "Wire 1",
      "",
      1,
      "",
      "Connector",
      "C-1",
      "C1",
      "TERM-DEFAULT",
      "Default terminal",
      "SEAL-DEFAULT",
      "Default seal",
      "Splice",
      "S-1",
      1,
      "",
      "",
      "",
      "",
      140
    ]);
    expect(sheet.rows[1]).toEqual([
      "W-002",
      "Wire 2",
      "",
      1.5,
      "",
      "Connector",
      "C-1",
      "C2",
      "TERM-MANUAL",
      "Manual terminal",
      "SEAL-DEFAULT",
      "Default seal",
      "Connector",
      "C-1",
      "C1",
      "TERM-DEFAULT",
      "Default terminal",
      "SEAL-MANUAL",
      "Manual seal",
      190
    ]);
  });

  it("resolves splice-end connection refs from manual ref, catalog material, then splice manufacturerReference", () => {
    const catalogItems: CatalogItem[] = [
      {
        id: asCatalogItemId("CAT-SPLICE"),
        manufacturerReference: "SPLICE-CAT-REF",
        connectionCount: 4,
        name: "Manchon épissure"
      }
    ];
    const connectors: Connector[] = [
      {
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-1",
        cavityCount: 4
      }
    ];
    const splices: Splice[] = [
      {
        id: asSpliceId("S-CAT"),
        name: "Catalog splice",
        technicalId: "S-CAT",
        portCount: 4,
        catalogItemId: asCatalogItemId("CAT-SPLICE"),
        manufacturerReference: "IGNORED-WHEN-CATALOG"
      },
      {
        id: asSpliceId("S-MANUF"),
        name: "Bare manufacturer splice",
        technicalId: "S-MANUF",
        portCount: 4,
        manufacturerReference: "Manchon épissure"
      },
      {
        id: asSpliceId("S-NONE"),
        name: "Bare splice",
        technicalId: "S-NONE",
        portCount: 4
      }
    ];
    const wires: Wire[] = [
      {
        id: asWireId("W-CAT"),
        name: "Catalog wire",
        technicalId: "W-001",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-CAT"), portIndex: 1 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 100,
        sectionMm2: 1,
        isRouteLocked: false
      },
      {
        id: asWireId("W-MANUAL"),
        name: "Manual override wire",
        technicalId: "W-002",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 2 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-CAT"), portIndex: 2 },
        endpointBConnectionReference: "MANUAL-SPLICE-REF",
        endpointBConnectionName: "Manual splice ref",
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 100,
        sectionMm2: 1,
        isRouteLocked: false
      },
      {
        id: asWireId("W-MANUF"),
        name: "Bare manufacturer wire",
        technicalId: "W-003",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 3 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-MANUF"), portIndex: 1 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 100,
        sectionMm2: 1,
        isRouteLocked: false
      },
      {
        id: asWireId("W-NONE"),
        name: "Bare wire",
        technicalId: "W-004",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 4 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S-NONE"), portIndex: 1 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 100,
        sectionMm2: 1,
        isRouteLocked: false
      }
    ];

    const sheet = buildWireListSheet("Wires", wires, connectors, splices, catalogItems);
    // End connection ref/name are now separate columns (indexes 15 and 16).
    const connectionRefByWire = new Map(sheet.rows.map((row) => [row[0], row[15]]));
    const connectionNameByWire = new Map(sheet.rows.map((row) => [row[0], row[16]]));

    // Catalog splice -> catalog manufacturerReference (matches BOM grouping key) + name.
    expect(connectionRefByWire.get("W-001")).toBe("SPLICE-CAT-REF");
    expect(connectionNameByWire.get("W-001")).toBe("Manchon épissure");
    // Manual endpoint reference wins over catalog material.
    expect(connectionRefByWire.get("W-002")).toBe("MANUAL-SPLICE-REF");
    expect(connectionNameByWire.get("W-002")).toBe("Manual splice ref");
    // No catalog item -> falls back to splice.manufacturerReference (no separate name).
    expect(connectionRefByWire.get("W-003")).toBe("Manchon épissure");
    expect(connectionNameByWire.get("W-003")).toBe("");
    // No material at all -> empty, never a hardcoded default.
    expect(connectionRefByWire.get("W-004")).toBe("");
    expect(connectionNameByWire.get("W-004")).toBe("");
    // Splice ends never carry a seal reference (now index 17).
    expect(sheet.rows.every((row) => row[17] === "")).toBe(true);
  });

  it("formats connector pins with their C-prefixed one-based cavity label without offsetting", () => {
    const connectors: Connector[] = [
      {
        id: asConnectorId("CT1"),
        name: "CT1",
        technicalId: "CT1",
        cavityCount: 10
      }
    ];
    const splices: Splice[] = [
      {
        id: asSpliceId("S1"),
        name: "Splice 1",
        technicalId: "S-1",
        portCount: 1
      }
    ];
    const wires: Wire[] = [
      {
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-001",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("CT1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 100,
        sectionMm2: 1,
        isRouteLocked: false
      },
      {
        id: asWireId("W9"),
        name: "Wire 9",
        technicalId: "W-009",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("CT1"), cavityIndex: 9 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 900,
        sectionMm2: 1,
        isRouteLocked: false
      }
    ];

    const sheet = buildWireListSheet("Wires", wires, connectors, splices, []);

    expect(sheet.rows[0]?.[7]).toBe("C1");
    expect(sheet.rows[0]?.[7]).not.toBe(2);
    expect(sheet.rows[1]?.[7]).toBe("C9");
    expect(sheet.rows[1]?.[7]).not.toBe(10);
  });

  it("adds export-only stripping allowance and twisted-pair coefficient to wire lengths", () => {
    const connectors: Connector[] = [
      {
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-1",
        cavityCount: 4
      }
    ];
    const splices: Splice[] = [
      {
        id: asSpliceId("S1"),
        name: "Splice 1",
        technicalId: "S-1",
        portCount: 4
      }
    ];
    const wires: Wire[] = [
      {
        id: asWireId("W1"),
        name: "Plain",
        technicalId: "W-001",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 1000,
        sectionMm2: 1,
        isRouteLocked: false
      },
      {
        id: asWireId("W2"),
        name: "CAN H",
        technicalId: "W-002",
        twistGroupLabel: "CAN 1",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 2 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 2 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 1000,
        sectionMm2: 1,
        isRouteLocked: false
      },
      {
        id: asWireId("W3"),
        name: "CAN L",
        technicalId: "W-003",
        twistGroupLabel: " CAN 1 ",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 3 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 3 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 1000,
        sectionMm2: 1,
        isRouteLocked: false
      },
      {
        id: asWireId("W4"),
        name: "Singleton twist",
        technicalId: "W-004",
        twistGroupLabel: "LIN",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 4 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 4 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 1000,
        sectionMm2: 1,
        isRouteLocked: false
      }
    ];

    const defaultSheet = buildWireListSheet("Wires", wires, connectors, splices, []);
    // Length (mm) is the last column (index 19) after splitting ref/name columns.
    expect(defaultSheet.rows.map((row) => row[19])).toEqual([1040, 1115, 1115, 1040]);
    expect(wires.map((wire) => wire.lengthMm)).toEqual([1000, 1000, 1000, 1000]);

    const customSheet = buildWireListSheet("Wires", wires, connectors, splices, [], {
      strippingAllowanceMm: 25,
      twistedPairLengthCoefficient: 1.08
    });
    expect(customSheet.rows.map((row) => row[19])).toEqual([1050, 1130, 1130, 1050]);
  });
});
