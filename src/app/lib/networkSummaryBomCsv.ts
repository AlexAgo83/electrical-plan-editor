import type { CatalogItem, Connector, Splice } from "../../core/entities";
import type { CsvCellValue } from "./csv";

interface BomAggregateRow {
  catalogItem: CatalogItem;
  connectorQuantity: number;
  spliceQuantity: number;
}

export interface NetworkSummaryBomCsvExport {
  headers: string[];
  rows: CsvCellValue[][];
}

function formatOptionalMoney(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) {
    return "";
  }
  return value.toFixed(2);
}

function formatRowMoney(quantity: number, unitPrice: number | undefined): string {
  if (unitPrice === undefined || !Number.isFinite(unitPrice)) {
    return "";
  }
  return (quantity * unitPrice).toFixed(2);
}

export function buildNetworkSummaryBomCsvExport(
  catalogItems: CatalogItem[],
  connectors: Connector[],
  splices: Splice[]
): NetworkSummaryBomCsvExport {
  const catalogById = new Map(catalogItems.map((item) => [item.id, item] as const));
  const aggregates = new Map<string, BomAggregateRow>();

  const ensureAggregate = (catalogItem: CatalogItem): BomAggregateRow => {
    const existing = aggregates.get(catalogItem.id);
    if (existing !== undefined) {
      return existing;
    }
    const created: BomAggregateRow = {
      catalogItem,
      connectorQuantity: 0,
      spliceQuantity: 0
    };
    aggregates.set(catalogItem.id, created);
    return created;
  };

  for (const connector of connectors) {
    if (connector.catalogItemId === undefined) {
      continue;
    }
    const catalogItem = catalogById.get(connector.catalogItemId);
    if (catalogItem === undefined) {
      continue;
    }
    ensureAggregate(catalogItem).connectorQuantity += 1;
  }

  for (const splice of splices) {
    if (splice.catalogItemId === undefined) {
      continue;
    }
    const catalogItem = catalogById.get(splice.catalogItemId);
    if (catalogItem === undefined) {
      continue;
    }
    ensureAggregate(catalogItem).spliceQuantity += 1;
  }

  const orderedRows = [...aggregates.values()].sort((left, right) => {
    const manufacturerReferenceCompare = left.catalogItem.manufacturerReference.localeCompare(
      right.catalogItem.manufacturerReference,
      undefined,
      { sensitivity: "base" }
    );
    if (manufacturerReferenceCompare !== 0) {
      return manufacturerReferenceCompare;
    }
    return left.catalogItem.id.localeCompare(right.catalogItem.id, undefined, { sensitivity: "base" });
  });

  const headers = [
    "Manufacturer reference",
    "Name",
    "Connection count",
    "Connector quantity",
    "Splice quantity",
    "Component quantity",
    "Unit price (excl. tax)",
    "Line total (excl. tax)",
    "URL"
  ];

  let pricedRowsTotal = 0;
  const rows: CsvCellValue[][] = orderedRows.map(({ catalogItem, connectorQuantity, spliceQuantity }) => {
    const componentQuantity = connectorQuantity + spliceQuantity;
    const unitPrice = catalogItem.unitPriceExclTax;
    if (unitPrice !== undefined && Number.isFinite(unitPrice)) {
      pricedRowsTotal += componentQuantity * unitPrice;
    }
    return [
      catalogItem.manufacturerReference,
      catalogItem.name ?? "",
      catalogItem.connectionCount,
      connectorQuantity,
      spliceQuantity,
      componentQuantity,
      formatOptionalMoney(unitPrice),
      formatRowMoney(componentQuantity, unitPrice),
      catalogItem.url ?? ""
    ];
  });

  rows.push(["TOTAL (priced rows only)", "", "", "", "", "", "", pricedRowsTotal.toFixed(2), ""]);

  return { headers, rows };
}
