import { describe, expect, it } from "vitest";
import type { CatalogItem, CatalogItemId, Connector, ConnectorId, Splice, SpliceId } from "../core/entities";
import { buildNetworkSummaryBomCsvExport } from "../app/lib/networkSummaryBomCsv";

function asCatalogItemId(value: string): CatalogItemId {
  return value as CatalogItemId;
}

function asConnectorId(value: string): ConnectorId {
  return value as ConnectorId;
}

function asSpliceId(value: string): SpliceId {
  return value as SpliceId;
}

describe("buildNetworkSummaryBomCsvExport", () => {
  it("aggregates connector/splice usage by catalog item and adds a priced total row", () => {
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

    const exported = buildNetworkSummaryBomCsvExport(catalogItems, connectors, splices);

    expect(exported.headers).toEqual([
      "Manufacturer reference",
      "Name",
      "Connection count",
      "Connector quantity",
      "Splice quantity",
      "Component quantity",
      "Unit price (excl. tax)",
      "Line total (excl. tax)",
      "URL"
    ]);
    expect(exported.headers).not.toContain("Type");
    expect(exported.rows).toHaveLength(3);

    expect(exported.rows[0]).toEqual([
      "REF-A",
      "Quoted, \"A\"",
      2,
      2,
      1,
      3,
      "5.00",
      "15.00",
      "https://example.test/a"
    ]);
    expect(exported.rows[1]).toEqual(["REF-B", "No price", 6, 0, 1, 1, "", "", ""]);
    expect(exported.rows[2]).toEqual(["TOTAL (priced rows only)", "", "", "", "", "", "", "15.00", ""]);
  });

  it("returns only the total row when no resolvable catalog-backed components are present", () => {
    const exported = buildNetworkSummaryBomCsvExport([], [{ id: asConnectorId("C1"), name: "C1", technicalId: "C-1", cavityCount: 2 }], []);

    expect(exported.rows).toEqual([["TOTAL (priced rows only)", "", "", "", "", "", "", "0.00", ""]]);
  });
});
