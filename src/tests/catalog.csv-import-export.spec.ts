import { describe, expect, it } from "vitest";
import { buildCatalogCsvExport, CATALOG_CSV_HEADERS, parseCatalogCsvImportText } from "../app/lib/catalogCsv";
import type { CatalogItem } from "../core/entities";

function toCsvText(headers: string[], rows: Array<Array<string | number>>): string {
  return [headers, ...rows].map((row) => row.join(",")).join("\r\n");
}

describe("catalogCsv", () => {
  it("builds a stable export and parses it back", () => {
    const catalogItems = [
      {
        id: "catalog-b",
        manufacturerReference: "REF-B",
        connectionCount: 2,
        name: "Beta",
        unitPriceExclTax: 4.5,
        url: "https://example.com/b"
      },
      {
        id: "catalog-a",
        manufacturerReference: "REF-A",
        connectionCount: 4,
        name: "Alpha"
      }
    ] as CatalogItem[];

    const exported = buildCatalogCsvExport(catalogItems);
    expect(exported.headers).toEqual([...CATALOG_CSV_HEADERS]);
    expect(exported.rows.map((row) => row[0])).toEqual(["REF-A", "REF-B"]);

    const parsed = parseCatalogCsvImportText(
      toCsvText(exported.headers, exported.rows.map((row) => row.map((cell) => (cell ?? "") as string | number)))
    );

    expect(parsed.issues).toEqual([]);
    expect(parsed.rows).toEqual([
      {
        manufacturerReference: "REF-A",
        connectionCount: 4,
        name: "Alpha",
        unitPriceExclTax: undefined,
        url: undefined
      },
      {
        manufacturerReference: "REF-B",
        connectionCount: 2,
        name: "Beta",
        unitPriceExclTax: 4.5,
        url: "https://example.com/b"
      }
    ]);
  });

  it("enforces strict headers and rejects duplicate rows case-insensitively", () => {
    const invalidHeaders = parseCatalogCsvImportText("Ref,Count\r\nA,2");
    expect(invalidHeaders.rows).toEqual([]);
    expect(invalidHeaders.issues).toHaveLength(1);
    expect(invalidHeaders.issues[0]?.kind).toBe("error");

    const duplicateRows = parseCatalogCsvImportText(
      [
        CATALOG_CSV_HEADERS.join(","),
        "REF-1,2,First,1.5,https://example.com/a",
        "ref-1,3,Override,2.5,https://example.com/b"
      ].join("\r\n")
    );

    expect(duplicateRows.issues).toEqual([
      expect.objectContaining({
        kind: "error",
        rowNumber: 3
      })
    ]);
    expect(duplicateRows.rows).toEqual([
      {
        manufacturerReference: "REF-1",
        connectionCount: 2,
        name: "First",
        unitPriceExclTax: 1.5,
        url: "https://example.com/a"
      }
    ]);
  });
});
