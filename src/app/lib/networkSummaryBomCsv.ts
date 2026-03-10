import type { CatalogItem, Connector, Splice, Wire } from "../../core/entities";
import type { WorkspaceCurrencyCode } from "../types/app-controller";
import type { CsvCellValue } from "./csv";

interface BomAggregateRow {
  catalogItem: CatalogItem;
  connectorQuantity: number;
  spliceQuantity: number;
}

export interface NetworkSummaryBomCsvExport {
  headers: string[];
  rows: CsvCellValue[][];
  itemRowCount: number;
}

interface WireTerminationAggregateRow {
  reference: string;
  quantity: number;
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
  splices: Splice[],
  wires: Wire[],
  workspaceCurrencyCode: WorkspaceCurrencyCode = "EUR",
  workspaceTaxEnabled = true,
  workspaceTaxRatePercent = 20
): NetworkSummaryBomCsvExport {
  const normalizedTaxEnabled = workspaceTaxEnabled === true;
  const normalizedTaxRatePercent = Number.isFinite(workspaceTaxRatePercent)
    ? Math.min(1000, Math.max(0, workspaceTaxRatePercent))
    : 20;
  const taxMultiplier = 1 + normalizedTaxRatePercent / 100;
  const catalogById = new Map(catalogItems.map((item) => [item.id, item] as const));
  const aggregates = new Map<string, BomAggregateRow>();
  const wireTerminationAggregates = new Map<string, WireTerminationAggregateRow>();

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

  const registerWireTermination = (reference: string | undefined): void => {
    const normalizedReference = reference?.trim() ?? "";
    if (normalizedReference.length === 0) {
      return;
    }

    const existing = wireTerminationAggregates.get(normalizedReference);
    if (existing !== undefined) {
      existing.quantity += 1;
      return;
    }

    wireTerminationAggregates.set(normalizedReference, {
      reference: normalizedReference,
      quantity: 1
    });
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

  for (const wire of wires) {
    registerWireTermination(wire.endpointAConnectionReference);
    registerWireTermination(wire.endpointASealReference);
    registerWireTermination(wire.endpointBConnectionReference);
    registerWireTermination(wire.endpointBSealReference);
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
  const orderedWireTerminationRows = [...wireTerminationAggregates.values()].sort((left, right) =>
    left.reference.localeCompare(right.reference, undefined, { sensitivity: "base" })
  );

  const headers = [
    "Manufacturer reference",
    "Name",
    "Connection count",
    "Connector quantity",
    "Splice quantity",
    "Component quantity",
    `Unit price (excl. tax, ${workspaceCurrencyCode})`,
    `Line total (excl. tax, ${workspaceCurrencyCode})`,
    ...(normalizedTaxEnabled ? [`Line total (incl. tax, ${workspaceCurrencyCode})`] : []),
    "URL"
  ];

  let pricedRowsTotal = 0;
  let pricedRowsTotalInclTax = 0;
  const rows: CsvCellValue[][] = orderedRows.map(({ catalogItem, connectorQuantity, spliceQuantity }) => {
    const componentQuantity = connectorQuantity + spliceQuantity;
    const unitPrice = catalogItem.unitPriceExclTax;
    const lineTotalExclTax =
      unitPrice !== undefined && Number.isFinite(unitPrice) ? componentQuantity * unitPrice : undefined;
    if (unitPrice !== undefined && Number.isFinite(unitPrice)) {
      pricedRowsTotal += componentQuantity * unitPrice;
      if (normalizedTaxEnabled) {
        pricedRowsTotalInclTax += componentQuantity * unitPrice * taxMultiplier;
      }
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
      ...(normalizedTaxEnabled
        ? [lineTotalExclTax === undefined ? "" : (lineTotalExclTax * taxMultiplier).toFixed(2)]
        : []),
      catalogItem.url ?? ""
    ];
  });

  rows.push(
    normalizedTaxEnabled
      ? ["TOTAL (priced rows only)", "", "", "", "", "", "", pricedRowsTotal.toFixed(2), "", ""]
      : ["TOTAL (priced rows only)", "", "", "", "", "", "", pricedRowsTotal.toFixed(2), ""]
  );
  if (normalizedTaxEnabled) {
    rows.push(["TOTAL TTC (priced rows only)", "", "", "", "", "", "", "", pricedRowsTotalInclTax.toFixed(2), ""]);
  }
  rows.push(["PRICING CONTEXT", "Currency", workspaceCurrencyCode]);
  rows.push(["PRICING CONTEXT", "Tax enabled", normalizedTaxEnabled ? "true" : "false"]);
  rows.push(["PRICING CONTEXT", "Tax rate (%)", normalizedTaxRatePercent.toFixed(2)]);

  if (orderedWireTerminationRows.length > 0) {
    rows.push(Array.from<CsvCellValue>({ length: headers.length }).fill(""));
    rows.push(["Wire terminations"]);
    rows.push(["Reference", "Quantity"]);
    rows.push(...orderedWireTerminationRows.map(({ reference, quantity }) => [reference, quantity] satisfies CsvCellValue[]));
  }

  return { headers, rows, itemRowCount: orderedRows.length + orderedWireTerminationRows.length };
}
