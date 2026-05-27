import { describe, expect, it } from "vitest";
import { buildCatalogCsvExport, CATALOG_CSV_HEADERS, LEGACY_CATALOG_CSV_HEADERS, parseCatalogCsvImportText } from "../app/lib/catalogCsv";
import { buildCsvContent, type CsvCellValue } from "../app/lib/csv";
import type { CatalogItem } from "../core/entities";

function toCsvText(headers: string[], rows: CsvCellValue[][]): string {
  return buildCsvContent(headers, rows);
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
        url: "https://example.com/b",
        additionalAccessories: [{ accessoryReference: "LOCK-B", accessoryName: "Secondary lock" }],
        connectorDefaults: {
          allSameTerminals: true,
          defaultTerminal: {
            terminalReference: "TERM-B",
            terminalName: "Beta terminal",
            sealReference: "SEAL-B",
            sealName: "Beta seal"
          },
          plugs: [{ plugReference: "PLUG-B", plugName: "Beta plug", quantity: 1 }]
        },
        connectorLayout: {
          version: 1,
          units: "grid",
          width: 2,
          height: 1,
          shellShape: "circle",
          ways: [
            { cavityIndex: 1, x: 1, y: 1, shape: "round", label: "A" },
            { cavityIndex: 2, x: 2, y: 1, shape: "square", label: "B" }
          ]
        }
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
    expect(exported.rows[1]?.[5]).toBe('[{"accessoryName":"Secondary lock","accessoryReference":"LOCK-B"}]');
    expect(exported.rows[1]?.[6]).toBe(
      '{"allSameTerminals":true,"defaultTerminal":{"sealName":"Beta seal","sealReference":"SEAL-B","terminalName":"Beta terminal","terminalReference":"TERM-B"},"plugs":[{"plugName":"Beta plug","plugReference":"PLUG-B","quantity":1}]}'
    );
    expect(exported.rows[1]?.[7]).toBe(
      '{"height":1,"shellShape":"circle","units":"grid","version":1,"ways":[{"cavityIndex":1,"label":"A","shape":"round","x":1,"y":1},{"cavityIndex":2,"label":"B","shape":"square","x":2,"y":1}],"width":2}'
    );

    const parsed = parseCatalogCsvImportText(
      toCsvText(exported.headers, exported.rows.map((row) => row.map((cell) => (cell ?? "") as string | number)))
    );

    expect(parsed.schema).toBe("current");
    expect(parsed.issues).toEqual([]);
    expect(parsed.rows).toEqual([
      {
        manufacturerReference: "REF-A",
        connectionCount: 4,
        name: "Alpha",
        unitPriceExclTax: undefined,
        url: undefined,
        additionalAccessories: undefined,
        connectorDefaults: undefined,
        connectorLayout: undefined
      },
      {
        manufacturerReference: "REF-B",
        connectionCount: 2,
        name: "Beta",
        unitPriceExclTax: 4.5,
        url: "https://example.com/b",
        additionalAccessories: [{ accessoryReference: "LOCK-B", accessoryName: "Secondary lock" }],
        connectorDefaults: {
          allSameTerminals: true,
          defaultTerminal: {
            terminalReference: "TERM-B",
            terminalName: "Beta terminal",
            sealReference: "SEAL-B",
            sealName: "Beta seal"
          },
          plugs: [{ plugReference: "PLUG-B", plugName: "Beta plug", quantity: 1 }]
        },
        connectorLayout: {
          version: 1,
          units: "grid",
          width: 2,
          height: 1,
          shellShape: "circle",
          ways: [
            { cavityIndex: 1, x: 1, y: 1, shape: "round", label: "A" },
            { cavityIndex: 2, x: 2, y: 1, shape: "square", label: "B" }
          ]
        }
      }
    ]);
  });

  it("still accepts legacy five-column catalog exports", () => {
    const parsed = parseCatalogCsvImportText(
      toCsvText([...LEGACY_CATALOG_CSV_HEADERS], [["REF-LEGACY", 3, "Legacy", 2.5, "https://example.com/legacy"]])
    );

    expect(parsed.schema).toBe("legacy");
    expect(parsed.issues).toEqual([]);
    expect(parsed.rows).toEqual([
      {
        manufacturerReference: "REF-LEGACY",
        connectionCount: 3,
        name: "Legacy",
        unitPriceExclTax: 2.5,
        url: "https://example.com/legacy",
        additionalAccessories: undefined,
        connectorDefaults: undefined,
        connectorLayout: undefined
      }
    ]);
  });

  it("rejects malformed catalog JSON extension columns", () => {
    const invalidDefaults = parseCatalogCsvImportText(
      toCsvText([...CATALOG_CSV_HEADERS], [["REF-1", 2, "Item", "", "", "", "[invalid]", ""]])
    );
    expect(invalidDefaults.rows).toEqual([]);
    expect(invalidDefaults.issues).toEqual([
      expect.objectContaining({
        kind: "error",
        rowNumber: 2,
        message: "Connector defaults (JSON) must be valid JSON when provided."
      })
    ]);
  });

  it("enforces strict headers and rejects duplicate rows case-insensitively", () => {
    const invalidHeaders = parseCatalogCsvImportText("Ref,Count\r\nA,2");
    expect(invalidHeaders.rows).toEqual([]);
    expect(invalidHeaders.issues).toHaveLength(1);
    expect(invalidHeaders.issues[0]?.kind).toBe("error");

    const duplicateRows = parseCatalogCsvImportText(
      toCsvText(
        [...CATALOG_CSV_HEADERS],
        [
          ["REF-1", 2, "First", 1.5, "https://example.com/a", "", "", ""],
          ["ref-1", 3, "Override", 2.5, "https://example.com/b", "", "", ""]
        ]
      )
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
        url: "https://example.com/a",
        additionalAccessories: undefined,
        connectorDefaults: undefined,
        connectorLayout: undefined
      }
    ]);
  });
});
