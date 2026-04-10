import { describe, expect, it } from "vitest";
import type { CatalogItem, CatalogItemId, Connector, ConnectorId, Splice, SpliceId, Wire, WireId } from "../core/entities";
import { buildNetworkSummaryBomCsvExport, buildNetworkSummaryBomWorkbookSheets } from "../app/lib/networkSummaryBomCsv";

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

describe("buildNetworkSummaryBomCsvExport", () => {
  it("aggregates connector/splice usage, adds TTC when tax is enabled, and appends pricing context metadata", () => {
    const catalogItems: CatalogItem[] = [
      {
        id: asCatalogItemId("CAT-A"),
        manufacturerReference: "REF-A",
        name: "Quoted, \"A\"",
        connectionCount: 2,
        unitPriceExclTax: 5,
        url: "https://example.test/a"
      },
      {
        id: asCatalogItemId("CAT-B"),
        manufacturerReference: "REF-B",
        name: "No price",
        connectionCount: 6
      }
    ];
    const connectors: Connector[] = [
      { id: asConnectorId("C1"), name: "C1", technicalId: "C-1", cavityCount: 2, catalogItemId: asCatalogItemId("CAT-A") },
      { id: asConnectorId("C2"), name: "C2", technicalId: "C-2", cavityCount: 2, catalogItemId: asCatalogItemId("CAT-A") },
      { id: asConnectorId("C3"), name: "C3", technicalId: "C-3", cavityCount: 4, catalogItemId: asCatalogItemId("MISSING") }
    ];
    const splices: Splice[] = [
      { id: asSpliceId("S1"), name: "S1", technicalId: "S-1", portCount: 2, catalogItemId: asCatalogItemId("CAT-A") },
      { id: asSpliceId("S2"), name: "S2", technicalId: "S-2", portCount: 6, catalogItemId: asCatalogItemId("CAT-B") }
    ];
    const wires: Wire[] = [
      {
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-1",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
        endpointAConnectionReference: "TERM-001",
        endpointBSealReference: "SEAL-001",
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 10,
        sectionMm2: 1,
        isRouteLocked: false
      }
    ];

    const exported = buildNetworkSummaryBomCsvExport(catalogItems, connectors, splices, wires, "GBP", true, 20);

    expect(exported.headers).toEqual([
      "Type",
      "Manufacturer reference",
      "Name",
      "Connection count",
      "Connector quantity",
      "Splice quantity",
      "Component quantity",
      "Unit price (excl. tax, GBP)",
      "Line total (excl. tax, GBP)",
      "Line total (incl. tax, GBP)",
      "URL"
    ]);
    expect(exported.itemRowCount).toBe(4);
    expect(exported.rows).toHaveLength(9);

    expect(exported.rows[0]).toEqual([
      "Catalog item",
      "REF-A",
      "Quoted, \"A\"",
      2,
      2,
      1,
      3,
      "5.00",
      "15.00",
      "18.00",
      "https://example.test/a"
    ]);
    expect(exported.rows[1]).toEqual(["Catalog item", "REF-B", "No price", 6, 0, 1, 1, "", "", "", ""]);
    expect(exported.rows[2]).toEqual(["Summary", "TOTAL (priced rows only)", "", "", "", "", "", "", "15.00", "", ""]);
    expect(exported.rows[3]).toEqual(["Summary", "TOTAL TTC (priced rows only)", "", "", "", "", "", "", "", "18.00", ""]);
    expect(exported.rows[4]).toEqual(["Summary", "PRICING CONTEXT", "Currency", "GBP", "", "", "", "", "", "", ""]);
    expect(exported.rows[5]).toEqual(["Summary", "PRICING CONTEXT", "Tax enabled", "true", "", "", "", "", "", "", ""]);
    expect(exported.rows[6]).toEqual(["Summary", "PRICING CONTEXT", "Tax rate (%)", "20.00", "", "", "", "", "", "", ""]);
    expect(exported.rows[7]).toEqual(["Wire termination", "SEAL-001", "", "", 1, "", 1, "", "", "", ""]);
    expect(exported.rows[8]).toEqual(["Wire termination", "TERM-001", "", "", 1, "", 1, "", "", "", ""]);
  });

  it("omits TTC column and total when tax is disabled", () => {
    const catalogItems: CatalogItem[] = [
      {
        id: asCatalogItemId("CAT-A"),
        manufacturerReference: "REF-A",
        connectionCount: 2,
        unitPriceExclTax: 5
      }
    ];
    const connectors: Connector[] = [
      { id: asConnectorId("C1"), name: "C1", technicalId: "C-1", cavityCount: 2, catalogItemId: asCatalogItemId("CAT-A") }
    ];

    const exported = buildNetworkSummaryBomCsvExport(catalogItems, connectors, [], [], "CAD", false, 5.5);

    expect(exported.headers).toEqual([
      "Type",
      "Manufacturer reference",
      "Name",
      "Connection count",
      "Connector quantity",
      "Splice quantity",
      "Component quantity",
      "Unit price (excl. tax, CAD)",
      "Line total (excl. tax, CAD)",
      "URL"
    ]);
    expect(exported.headers).not.toContain("Line total (incl. tax, CAD)");
    expect(exported.rows[0]).toEqual(["Catalog item", "REF-A", "", 2, 1, 0, 1, "5.00", "5.00", ""]);
    expect(exported.rows.find((row) => row[1] === "TOTAL TTC (priced rows only)")).toBeUndefined();
    expect(
      exported.rows.some(
        (row) => row[0] === "Summary" && row[1] === "PRICING CONTEXT" && row[2] === "Tax enabled" && row[3] === "false"
      )
    ).toBe(true);
    expect(
      exported.rows.some(
        (row) => row[0] === "Summary" && row[1] === "PRICING CONTEXT" && row[2] === "Tax rate (%)" && row[3] === "5.50"
      )
    ).toBe(true);
  });

  it("supports compact BOM export columns for the masked export view", () => {
    const catalogItems: CatalogItem[] = [
      {
        id: asCatalogItemId("CAT-A"),
        manufacturerReference: "REF-A",
        name: "Compact item",
        connectionCount: 2,
        unitPriceExclTax: 5,
        url: "https://example.test/a"
      }
    ];
    const connectors: Connector[] = [
      {
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-001",
        cavityCount: 2,
        catalogItemId: asCatalogItemId("CAT-A")
      }
    ];

    const exported = buildNetworkSummaryBomCsvExport(catalogItems, connectors, [], [], "EUR", true, 20, true);

    expect(exported.headers).toEqual(["Type", "Manufacturer reference", "Name", "Connection count", "Connector quantity"]);
    expect(exported.rows).toEqual([["Catalog item", "REF-A", "Compact item", 2, 1]]);
  });

  it("builds a two-sheet workbook structure for xlsx export", () => {
    const connectors: Connector[] = [
      {
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-001",
        cavityCount: 2
      }
    ];
    const wires: Wire[] = [
      {
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-1",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
        endpointAConnectionReference: "TERM-A",
        endpointAConnectionName: "Conn A",
        endpointASealReference: "SEAL-A",
        endpointASealName: "Seal A",
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 10,
        sectionMm2: 1,
        isRouteLocked: false
      }
    ];

    const sheets = buildNetworkSummaryBomWorkbookSheets([], connectors, [], wires);

    expect(sheets).toHaveLength(2);
    expect(sheets[0]?.name).toBe("Network BOM");
    expect(sheets[1]?.name).toBe("By connector");
    expect(sheets[1]?.rows).toEqual([["C-001", "Connector 1", "Connector", "", "", 1], ["C-001", "Connector 1", "Connection", "TERM-A", "Conn A", 1], ["C-001", "Connector 1", "Seal", "SEAL-A", "Seal A", 1]]);
  });

  it("returns summary and metadata rows only when no resolvable catalog-backed components are present", () => {
    const exported = buildNetworkSummaryBomCsvExport([], [{ id: asConnectorId("C1"), name: "C1", technicalId: "C-1", cavityCount: 2 }], [], []);

    expect(exported.itemRowCount).toBe(0);
    expect(exported.rows).toEqual([
      ["Summary", "TOTAL (priced rows only)", "", "", "", "", "", "", "0.00", "", ""],
      ["Summary", "TOTAL TTC (priced rows only)", "", "", "", "", "", "", "", "0.00", ""],
      ["Summary", "PRICING CONTEXT", "Currency", "EUR", "", "", "", "", "", "", ""],
      ["Summary", "PRICING CONTEXT", "Tax enabled", "true", "", "", "", "", "", "", ""],
      ["Summary", "PRICING CONTEXT", "Tax rate (%)", "20.00", "", "", "", "", "", "", ""]
    ]);
  });

  it("counts wire terminations even when there is no catalog-backed BOM row", () => {
    const wires: Wire[] = [
      {
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-1",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
        endpointAConnectionReference: "TERM-A",
        endpointBConnectionReference: "TERM-A",
        endpointASealReference: "SEAL-B",
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 10,
        sectionMm2: 1,
        isRouteLocked: false
      }
    ];

    const exported = buildNetworkSummaryBomCsvExport([], [], [], wires);

    expect(exported.itemRowCount).toBe(2);
    expect(exported.rows).toContainEqual(["Wire termination", "SEAL-B", "", "", 1, "", 1, "", "", "", ""]);
    expect(exported.rows).toContainEqual(["Wire termination", "TERM-A", "", "", 2, "", 2, "", "", "", ""]);
  });

  it("merges same reference text across connection and seal occurrences into one row", () => {
    const wires: Wire[] = [
      {
        id: asWireId("W1"),
        name: "Wire 1",
        technicalId: "W-1",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
        endpointAConnectionReference: " 1108503 ",
        endpointBSealReference: "1108503",
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 10,
        sectionMm2: 1,
        isRouteLocked: false
      },
      {
        id: asWireId("W2"),
        name: "Wire 2",
        technicalId: "W-2",
        endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C2"), cavityIndex: 1 },
        endpointB: { kind: "splicePort", spliceId: asSpliceId("S2"), portIndex: 1 },
        endpointBConnectionReference: "1108503",
        endpointASealReference: "   ",
        primaryColorId: null,
        secondaryColorId: null,
        routeSegmentIds: [],
        lengthMm: 10,
        sectionMm2: 1,
        isRouteLocked: false
      }
    ];

    const exported = buildNetworkSummaryBomCsvExport([], [], [], wires);

    expect(exported.itemRowCount).toBe(1);
    expect(exported.rows).toContainEqual(["Wire termination", "1108503", "", "", 3, "", 3, "", "", "", ""]);
  });
});
