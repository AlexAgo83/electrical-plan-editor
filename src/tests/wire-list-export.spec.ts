import { describe, expect, it } from "vitest";
import type { CatalogItem, CatalogItemId, Connector, ConnectorId, NodeId, Splice, SpliceId, Wire, WireId } from "../core/entities";
import { buildWireListSheet } from "../app/lib/wireListExport";
import { formatEntityIdForDisplay } from "../core/networkEntityPrefix";

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

function asNodeId(value: string): NodeId {
  return value as NodeId;
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
    const firstRow = sheet.rows[0];
    const secondRow = sheet.rows[1];
    expect(firstRow).toBeDefined();
    expect(secondRow).toBeDefined();

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
      "Length (mm)",
      "Untwisted length (mm)",
      "",
      "",
      "",
      "",
      "",
      "Entity type",
      "Entity ID",
      "Entity name",
      "Internal ID"
    ]);
    expect(firstRow!.slice(0, 20)).toEqual([
      "W-001",
      "Wire 1",
      "",
      1,
      "",
      "Connector",
      "C-1",
      "C1 (shared)",
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
    expect(firstRow![20]).toBe("");
    expect(firstRow!.slice(26)).toEqual(["Connector", "C-1", "Connector 1", "C1"]);
    expect(secondRow!.slice(0, 20)).toEqual([
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
      "C1 (shared)",
      "TERM-DEFAULT",
      "Default terminal",
      "SEAL-MANUAL",
      "Manual seal",
      190
    ]);
    expect(secondRow![20]).toBe("");
    expect(secondRow!.slice(26)).toEqual(["Splice", "S-1", "Splice 1", "S1"]);
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

  it("uses physical layout labels for connector endpoint positions and falls back to C-prefixed indexes", () => {
    const catalogItems: CatalogItem[] = [
      {
        id: asCatalogItemId("CAT-LABELED"),
        manufacturerReference: "LABELED-CONN",
        connectionCount: 2,
        connectorLayout: {
          version: 1,
          units: "grid",
          width: 2,
          height: 1,
          ways: [
            { cavityIndex: 1, x: 1, y: 1, shape: "round", label: "A10" },
            { cavityIndex: 2, x: 2, y: 1, shape: "round" }
          ]
        }
      }
    ];
    const connectors: Connector[] = [
      {
        id: asConnectorId("CT1"),
        name: "CT1",
        technicalId: "CT1",
        cavityCount: 2,
        catalogItemId: asCatalogItemId("CAT-LABELED")
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
        id: asWireId("W2"),
        name: "Wire 2",
        technicalId: "W-002",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("CT1"), cavityIndex: 2 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 2 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 100,
        sectionMm2: 1,
        isRouteLocked: false
      }
    ];

    const sheet = buildWireListSheet("Wires", wires, connectors, splices, catalogItems);

    expect(sheet.rows[0]?.[7]).toBe("A10");
    expect(sheet.rows[1]?.[7]).toBe("C2");
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
    // Length stays at index 19; untwisted length is appended next to it.
    expect(defaultSheet.rows.map((row) => row[19])).toEqual([1040, 1115, 1115, 1040]);
    expect(defaultSheet.rows.map((row) => row[20])).toEqual(["", 1040, 1040, ""]);
    expect(wires.map((wire) => wire.lengthMm)).toEqual([1000, 1000, 1000, 1000]);

    const customSheet = buildWireListSheet("Wires", wires, connectors, splices, [], {
      strippingAllowanceMm: 25,
      twistedPairLengthCoefficient: 1.08
    });
    expect(customSheet.rows.map((row) => row[19])).toEqual([1050, 1130, 1130, 1050]);
    expect(customSheet.rows.map((row) => row[20])).toEqual(["", 1050, 1050, ""]);
  });

  it("adds connector, splice, and node references starting at column AA", () => {
    const connectors: Connector[] = [
      { id: asConnectorId("C1"), name: "Connector 1", technicalId: "NET-C-1", cavityCount: 2 }
    ];
    const splices: Splice[] = [{ id: asSpliceId("S1"), name: "Splice 1", technicalId: "NET-S-1", portCount: 2 }];
    const wires: Wire[] = [
      {
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "NET-W-001",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 100,
        sectionMm2: 1,
        isRouteLocked: false
      }
    ];

    const sheet = buildWireListSheet(
      "Wires",
      wires,
      connectors,
      splices,
      [],
      {},
      (id) => formatEntityIdForDisplay(id, "NET-", false),
      [
        { id: asNodeId("NET-N1"), kind: "intermediate", label: "Node 1" },
        { id: asNodeId("NET-N-C1"), kind: "connector", connectorId: asConnectorId("C1") }
      ]
    );

    expect(sheet.headers[26]).toBe("Entity type");
    expect(sheet.headers.slice(26, 30)).toEqual(["Entity type", "Entity ID", "Entity name", "Internal ID"]);
    expect(sheet.rows.map((row) => row.slice(26, 30))).toEqual([
      ["Connector", "C-1", "Connector 1", "C1"],
      ["Splice", "S-1", "Splice 1", "S1"],
      ["Node", "N-C1", "Connector 1", "NET-N-C1"],
      ["Node", "N1", "Node 1", "NET-N1"]
    ]);
  });

  it("hides the active network prefix in human-readable IDs when the formatter strips it (AC9)", () => {
    const connectors: Connector[] = [
      { id: asConnectorId("C1"), name: "Connector 1", technicalId: "LAT-C-1", cavityCount: 2 }
    ];
    const splices: Splice[] = [{ id: asSpliceId("S1"), name: "Splice 1", technicalId: "LAT-S-1", portCount: 2 }];
    const wires: Wire[] = [
      {
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "LAT-W-001",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 100,
        sectionMm2: 1,
        isRouteLocked: false
      }
    ];

    const shown = buildWireListSheet("Wires", wires, connectors, splices, []);
    expect(shown.rows[0]?.[0]).toBe("LAT-W-001");
    expect(shown.rows[0]?.[6]).toBe("LAT-C-1");
    expect(shown.rows[0]?.[13]).toBe("LAT-S-1");

    const hidden = buildWireListSheet("Wires", wires, connectors, splices, [], {}, (id) =>
      formatEntityIdForDisplay(id, "LAT-", false)
    );
    // Wire technical ID, begin ref (connector) and end ref (splice) drop the prefix.
    expect(hidden.rows[0]?.[0]).toBe("W-001");
    expect(hidden.rows[0]?.[6]).toBe("C-1");
    expect(hidden.rows[0]?.[13]).toBe("S-1");
  });
});
