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

    const exported = buildNetworkSummaryBomCsvExport(catalogItems, connectors, splices, "GBP", true, 20);

    expect(exported.headers).toEqual([
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
    expect(exported.headers).not.toContain("Type");
    expect(exported.itemRowCount).toBe(2);
    expect(exported.rows).toHaveLength(7);

    expect(exported.rows[0]).toEqual([
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
    expect(exported.rows[1]).toEqual(["REF-B", "No price", 6, 0, 1, 1, "", "", "", ""]);
    expect(exported.rows[2]).toEqual(["TOTAL (priced rows only)", "", "", "", "", "", "", "15.00", "", ""]);
    expect(exported.rows[3]).toEqual(["TOTAL TTC (priced rows only)", "", "", "", "", "", "", "", "18.00", ""]);
    expect(exported.rows[4]).toEqual(["PRICING CONTEXT", "Currency", "GBP"]);
    expect(exported.rows[5]).toEqual(["PRICING CONTEXT", "Tax enabled", "true"]);
    expect(exported.rows[6]).toEqual(["PRICING CONTEXT", "Tax rate (%)", "20.00"]);
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

    const exported = buildNetworkSummaryBomCsvExport(catalogItems, connectors, [], "CAD", false, 5.5);

    expect(exported.headers).toEqual([
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
    expect(exported.rows).toContainEqual(["TOTAL (priced rows only)", "", "", "", "", "", "", "5.00", ""]);
    expect(exported.rows.find((row) => row[0] === "TOTAL TTC (priced rows only)")).toBeUndefined();
    expect(exported.rows).toContainEqual(["PRICING CONTEXT", "Tax enabled", "false"]);
    expect(exported.rows).toContainEqual(["PRICING CONTEXT", "Tax rate (%)", "5.50"]);
  });

  it("returns summary and metadata rows only when no resolvable catalog-backed components are present", () => {
    const exported = buildNetworkSummaryBomCsvExport([], [{ id: asConnectorId("C1"), name: "C1", technicalId: "C-1", cavityCount: 2 }], []);

    expect(exported.itemRowCount).toBe(0);
    expect(exported.rows).toEqual([
      ["TOTAL (priced rows only)", "", "", "", "", "", "", "0.00", "", ""],
      ["TOTAL TTC (priced rows only)", "", "", "", "", "", "", "", "0.00", ""],
      ["PRICING CONTEXT", "Currency", "EUR"],
      ["PRICING CONTEXT", "Tax enabled", "true"],
      ["PRICING CONTEXT", "Tax rate (%)", "20.00"]
    ]);
  });
});
