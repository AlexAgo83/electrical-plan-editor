import type { CatalogItem, Connector, Splice, Wire, WireEndpoint } from "../../core/entities";
import { buildWireEndpointReferenceNameLookup, normalizeWireEndpointReferenceName } from "../../core/wireReferences";
import type { WorkspaceCurrencyCode } from "../types/app-controller";
import type { CsvCellValue } from "./csv";
import type { TabularWorksheetExport } from "./tabularExport";

interface BomAggregateRow {
  catalogItem: CatalogItem;
  connectorQuantity: number;
  spliceQuantity: number;
}

interface WireTerminationAggregateRow {
  reference: string;
  name?: string;
  quantity: number;
}

type WireTerminationKind = "connection" | "seal";

interface ConnectorGroupedTerminationRow {
  kind: WireTerminationKind;
  reference: string;
  name?: string;
  quantity: number;
}

interface ConnectorGroupedTerminationAggregate {
  connectorTechnicalId: string;
  connectorName: string;
  connectionCount: number;
  rows: Map<string, ConnectorGroupedTerminationRow>;
}

export interface NetworkSummaryBomCsvExport {
  headers: string[];
  rows: CsvCellValue[][];
  itemRowCount: number;
}

interface NetworkSummaryBomExportData {
  compactColumns: boolean;
  headers: string[];
  rows: CsvCellValue[][];
  itemRowCount: number;
  groupedSheets: TabularWorksheetExport[];
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

function normalizeWireTerminationReference(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  return normalized.length === 0 ? undefined : normalized;
}

function padRow(values: CsvCellValue[], length: number): CsvCellValue[] {
  const padded = [...values];
  while (padded.length < length) {
    padded.push("");
  }
  return padded.slice(0, length);
}

function buildBomHeaders(workspaceCurrencyCode: WorkspaceCurrencyCode, normalizedTaxEnabled: boolean, compactColumns: boolean): string[] {
  const headers = compactColumns
    ? ["Type", "Manufacturer reference", "Name", "Connection count", "Connector quantity"]
    : [
        "Type",
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
  return headers;
}

function createBomRow(
  compactColumns: boolean,
  values: {
    type: string;
    manufacturerReference: string;
    name: string;
    connectionCount: CsvCellValue;
    connectorQuantity: CsvCellValue;
    spliceQuantity?: CsvCellValue;
    componentQuantity?: CsvCellValue;
    unitPriceExclTax?: CsvCellValue;
    lineTotalExclTax?: CsvCellValue;
    lineTotalInclTax?: CsvCellValue;
    url?: CsvCellValue;
  }
): CsvCellValue[] {
  if (compactColumns) {
    return [
      values.type,
      values.manufacturerReference,
      values.name,
      values.connectionCount,
      values.connectorQuantity
    ];
  }

  return [
    values.type,
    values.manufacturerReference,
    values.name,
    values.connectionCount,
    values.connectorQuantity,
    values.spliceQuantity ?? "",
    values.componentQuantity ?? "",
    values.unitPriceExclTax ?? "",
    values.lineTotalExclTax ?? "",
    values.lineTotalInclTax ?? "",
    values.url ?? ""
  ];
}

function registerWireTermination(
  aggregates: Map<string, WireTerminationAggregateRow>,
  reference: string | undefined,
  kind: WireTerminationKind,
  explicitName: string | undefined,
  lookup: ReturnType<typeof buildWireEndpointReferenceNameLookup>
): void {
  const normalizedReference = normalizeWireTerminationReference(reference);
  if (normalizedReference === undefined) {
    return;
  }

  const resolvedName = normalizeWireEndpointReferenceName(explicitName) ?? (kind === "connection" ? lookup.connection.get(normalizedReference) : lookup.seal.get(normalizedReference));
  const existing = aggregates.get(normalizedReference);
  if (existing !== undefined) {
    existing.quantity += 1;
    if (existing.name === undefined && resolvedName !== undefined) {
      existing.name = resolvedName;
    }
    return;
  }

  aggregates.set(normalizedReference, {
    reference: normalizedReference,
    name: resolvedName,
    quantity: 1
  });
}

function registerGroupedWireTermination(
  groups: Map<string, ConnectorGroupedTerminationAggregate>,
  connectorTechnicalId: string,
  connectorName: string,
  connectionCount: number,
  kind: WireTerminationKind,
  reference: string | undefined,
  explicitName: string | undefined,
  lookup: ReturnType<typeof buildWireEndpointReferenceNameLookup>
): void {
  const normalizedReference = normalizeWireTerminationReference(reference);
  if (normalizedReference === undefined) {
    return;
  }

  const resolvedName = normalizeWireEndpointReferenceName(explicitName) ?? (kind === "connection" ? lookup.connection.get(normalizedReference) : lookup.seal.get(normalizedReference));
  const groupKey = connectorTechnicalId;
  const existingGroup = groups.get(groupKey);
  const group =
    existingGroup ??
    (() => {
      const created: ConnectorGroupedTerminationAggregate = {
        connectorTechnicalId,
        connectorName,
        connectionCount,
        rows: new Map<string, ConnectorGroupedTerminationRow>()
      };
      groups.set(groupKey, created);
      return created;
    })();

  const rowKey = `${kind}:${normalizedReference}`;
  const existingRow = group.rows.get(rowKey);
  if (existingRow !== undefined) {
    existingRow.quantity += 1;
    if (existingRow.name === undefined && resolvedName !== undefined) {
      existingRow.name = resolvedName;
    }
    return;
  }

  group.rows.set(rowKey, {
    kind,
    reference: normalizedReference,
    name: resolvedName,
    quantity: 1
  });
}

function buildNetworkSummaryBomExportData(
  catalogItems: CatalogItem[],
  connectors: Connector[],
  splices: Splice[],
  wires: Wire[],
  workspaceCurrencyCode: WorkspaceCurrencyCode = "EUR",
  workspaceTaxEnabled = true,
  workspaceTaxRatePercent = 20,
  compactColumns = false
): NetworkSummaryBomExportData {
  const normalizedTaxEnabled = workspaceTaxEnabled === true;
  const normalizedTaxRatePercent = Number.isFinite(workspaceTaxRatePercent)
    ? Math.min(1000, Math.max(0, workspaceTaxRatePercent))
    : 20;
  const taxMultiplier = 1 + normalizedTaxRatePercent / 100;
  const catalogById = new Map(catalogItems.map((item) => [item.id, item] as const));
  const connectorById = new Map(connectors.map((connector) => [connector.id, connector] as const));
  const aggregates = new Map<string, BomAggregateRow>();
  const wireTerminationAggregates = new Map<string, WireTerminationAggregateRow>();
  const groupedConnectorAggregates = new Map<string, ConnectorGroupedTerminationAggregate>();
  const wireReferenceNameLookup = buildWireEndpointReferenceNameLookup(wires);

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

  for (const connector of connectors) {
    groupedConnectorAggregates.set(connector.technicalId, {
      connectorTechnicalId: connector.technicalId,
      connectorName: connector.name,
      connectionCount: connector.cavityCount,
      rows: new Map<string, ConnectorGroupedTerminationRow>()
    });
  }

  const registerEndpointGroupedTerminology = (
    endpoint: WireEndpoint,
    connectionReference: string | undefined,
    connectionName: string | undefined,
    sealReference: string | undefined,
    sealName: string | undefined
  ): void => {
    if (endpoint.kind !== "connectorCavity") {
      return;
    }
    const connector = connectorById.get(endpoint.connectorId);
    if (connector === undefined) {
      return;
    }
    registerGroupedWireTermination(
      groupedConnectorAggregates,
      connector.technicalId,
      connector.name,
      connector.cavityCount,
      "connection",
      connectionReference,
      connectionName,
      wireReferenceNameLookup
    );
    registerGroupedWireTermination(
      groupedConnectorAggregates,
      connector.technicalId,
      connector.name,
      connector.cavityCount,
      "seal",
      sealReference,
      sealName,
      wireReferenceNameLookup
    );
  };

  for (const wire of wires) {
    registerWireTermination(
      wireTerminationAggregates,
      wire.endpointAConnectionReference,
      "connection",
      wire.endpointAConnectionName,
      wireReferenceNameLookup
    );
    registerWireTermination(wireTerminationAggregates, wire.endpointASealReference, "seal", wire.endpointASealName, wireReferenceNameLookup);
    registerWireTermination(
      wireTerminationAggregates,
      wire.endpointBConnectionReference,
      "connection",
      wire.endpointBConnectionName,
      wireReferenceNameLookup
    );
    registerWireTermination(wireTerminationAggregates, wire.endpointBSealReference, "seal", wire.endpointBSealName, wireReferenceNameLookup);

    registerEndpointGroupedTerminology(
      wire.endpointA,
      wire.endpointAConnectionReference,
      wire.endpointAConnectionName,
      wire.endpointASealReference,
      wire.endpointASealName
    );
    registerEndpointGroupedTerminology(
      wire.endpointB,
      wire.endpointBConnectionReference,
      wire.endpointBConnectionName,
      wire.endpointBSealReference,
      wire.endpointBSealName
    );
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

  const groupedConnectorRows = [...groupedConnectorAggregates.values()].sort((left, right) =>
    left.connectorTechnicalId.localeCompare(right.connectorTechnicalId, undefined, { sensitivity: "base" })
  );

  const headers = buildBomHeaders(workspaceCurrencyCode, normalizedTaxEnabled, compactColumns);
  const rows: CsvCellValue[][] = [];
  const groupedSheetRows: CsvCellValue[][] = [];
  const groupedSheetMergeRanges: Array<{ startRow: number; endRow: number }> = [];

  let pricedRowsTotal = 0;
  let pricedRowsTotalInclTax = 0;

  for (const { catalogItem, connectorQuantity, spliceQuantity } of orderedRows) {
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

    rows.push(
      padRow(
        createBomRow(compactColumns, {
          type: "Catalog item",
          manufacturerReference: catalogItem.manufacturerReference,
          name: catalogItem.name ?? "",
          connectionCount: catalogItem.connectionCount,
          connectorQuantity,
          spliceQuantity,
          componentQuantity,
          unitPriceExclTax: formatOptionalMoney(unitPrice),
          lineTotalExclTax: formatRowMoney(componentQuantity, unitPrice),
          lineTotalInclTax:
            normalizedTaxEnabled && lineTotalExclTax !== undefined ? (lineTotalExclTax * taxMultiplier).toFixed(2) : undefined,
          url: catalogItem.url ?? ""
        }),
        headers.length
      )
    );
  }

  if (!compactColumns) {
    rows.push(
      padRow(
        createBomRow(compactColumns, {
          type: "Summary",
          manufacturerReference: "TOTAL (priced rows only)",
          name: "",
          connectionCount: "",
          connectorQuantity: "",
          lineTotalExclTax: pricedRowsTotal.toFixed(2)
        }),
        headers.length
      )
    );
    if (normalizedTaxEnabled) {
      rows.push(
        padRow(
          createBomRow(compactColumns, {
          type: "Summary",
          manufacturerReference: "TOTAL TTC (priced rows only)",
          name: "",
          connectionCount: "",
          connectorQuantity: "",
          lineTotalInclTax: pricedRowsTotalInclTax.toFixed(2)
        }),
          headers.length
        )
      );
    }
    rows.push(
      padRow(
        createBomRow(compactColumns, {
          type: "Summary",
          manufacturerReference: "PRICING CONTEXT",
          name: "Currency",
          connectionCount: workspaceCurrencyCode,
          connectorQuantity: ""
        }),
        headers.length
      )
    );
    rows.push(
      padRow(
        createBomRow(compactColumns, {
          type: "Summary",
          manufacturerReference: "PRICING CONTEXT",
          name: "Tax enabled",
          connectionCount: normalizedTaxEnabled ? "true" : "false",
          connectorQuantity: ""
        }),
        headers.length
      )
    );
    rows.push(
      padRow(
        createBomRow(compactColumns, {
          type: "Summary",
          manufacturerReference: "PRICING CONTEXT",
          name: "Tax rate (%)",
          connectionCount: normalizedTaxRatePercent.toFixed(2),
          connectorQuantity: ""
        }),
        headers.length
      )
    );
  }

  for (const { reference, name, quantity } of orderedWireTerminationRows) {
    rows.push(
      padRow(
        createBomRow(compactColumns, {
          type: "Wire termination",
          manufacturerReference: reference,
          name: name ?? "",
          connectionCount: "",
          connectorQuantity: quantity,
          componentQuantity: quantity
        }),
        headers.length
      )
    );
  }

  const itemRowCount = orderedRows.length + orderedWireTerminationRows.length;
  for (const group of groupedConnectorRows) {
    const orderedGroupRows = [...group.rows.values()].sort((left, right) => {
      const kindCompare = left.kind.localeCompare(right.kind, undefined, { sensitivity: "base" });
      if (kindCompare !== 0) {
        return kindCompare;
      }
      return left.reference.localeCompare(right.reference, undefined, { sensitivity: "base" });
    });
    const startRow = groupedSheetRows.length + 2;
    groupedSheetRows.push([group.connectorTechnicalId, group.connectorName, group.connectionCount, "Connector", "", "", 1]);
    for (const row of orderedGroupRows) {
      groupedSheetRows.push([
        group.connectorTechnicalId,
        group.connectorName,
        "",
        row.kind === "connection" ? "Connection" : "Seal",
        row.reference,
        row.name ?? "",
        row.quantity
      ]);
    }
    const endRow = groupedSheetRows.length + 1;
    if (endRow > startRow) {
      groupedSheetMergeRanges.push({ startRow, endRow });
    }
  }

  const groupedSheets: TabularWorksheetExport[] = [
    {
      name: "Network BOM",
      headers,
      rows,
      freezeHeaderRow: true,
      autoFilter: true
    },
    {
      name: "By connector",
      headers: ["Connector ID", "Connector name", "Connection count", "Type", "Reference", "Name", "Quantity"],
      rows: groupedSheetRows,
      freezeHeaderRow: true,
      autoFilter: true,
      configureWorksheet: (worksheet) => {
        for (const { startRow, endRow } of groupedSheetMergeRanges) {
          if (endRow <= startRow) {
            continue;
          }
          worksheet.mergeCells(startRow, 1, endRow, 1);
          worksheet.mergeCells(startRow, 2, endRow, 2);
          worksheet.getCell(startRow, 1).font = { bold: true };
          worksheet.getCell(startRow, 2).font = { bold: true };
          worksheet.getCell(startRow, 1).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
          worksheet.getCell(startRow, 2).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        }
      }
    }
  ];

  return {
    compactColumns,
    headers,
    rows,
    itemRowCount,
    groupedSheets
  };
}

export function buildNetworkSummaryBomCsvExport(
  catalogItems: CatalogItem[],
  connectors: Connector[],
  splices: Splice[],
  wires: Wire[],
  workspaceCurrencyCode: WorkspaceCurrencyCode = "EUR",
  workspaceTaxEnabled = true,
  workspaceTaxRatePercent = 20,
  compactColumns = false
): NetworkSummaryBomCsvExport {
  const exportData = buildNetworkSummaryBomExportData(
    catalogItems,
    connectors,
    splices,
    wires,
    workspaceCurrencyCode,
    workspaceTaxEnabled,
    workspaceTaxRatePercent,
    compactColumns
  );

  return {
    headers: exportData.headers,
    rows: exportData.rows,
    itemRowCount: exportData.itemRowCount
  };
}

export function buildNetworkSummaryBomWorkbookSheets(
  catalogItems: CatalogItem[],
  connectors: Connector[],
  splices: Splice[],
  wires: Wire[],
  workspaceCurrencyCode: WorkspaceCurrencyCode = "EUR",
  workspaceTaxEnabled = true,
  workspaceTaxRatePercent = 20,
  compactColumns = false
): TabularWorksheetExport[] {
  const exportData = buildNetworkSummaryBomExportData(
    catalogItems,
    connectors,
    splices,
    wires,
    workspaceCurrencyCode,
    workspaceTaxEnabled,
    workspaceTaxRatePercent,
    compactColumns
  );

  return exportData.groupedSheets;
}
