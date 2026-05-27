import type { CatalogItem, Connector, Splice, Wire, WireEndpoint } from "../../core/entities";
import {
  type BomMaterialOrigin,
  type ConnectorCavityOccupancyMap,
  resolveConnectorPlugMaterials,
  resolveConnectorTerminalMaterial
} from "../../core/connectorCatalogMaterials";
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
  origin: BomMaterialOrigin;
  rowType?: "Wire termination" | "Catalog accessory";
}

type WireTerminationKind = "connection" | "seal" | "plug" | "accessory";

interface ConnectorGroupedTerminationRow {
  kind: WireTerminationKind;
  reference: string;
  name?: string;
  quantity: number;
  origin: BomMaterialOrigin;
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
  warnings: string[];
}

interface NetworkSummaryBomExportData {
  compactColumns: boolean;
  headers: string[];
  rows: CsvCellValue[][];
  itemRowCount: number;
  warnings: string[];
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

function buildBomHeaders(
  workspaceCurrencyCode: WorkspaceCurrencyCode,
  normalizedTaxEnabled: boolean,
  compactColumns: boolean,
  includeTraceability: boolean
): string[] {
  const headers = compactColumns
    ? ["Type", "Manufacturer reference", "Name", "Connection count", "Connector quantity", ...(includeTraceability ? ["Origin"] : [])]
    : [
        "Type",
        "Manufacturer reference",
        "Name",
        "Connection count",
        "Connector quantity",
        "Splice quantity",
        "Component quantity",
        ...(includeTraceability ? ["Origin"] : []),
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
    origin?: CsvCellValue;
    unitPriceExclTax?: CsvCellValue;
    lineTotalExclTax?: CsvCellValue;
    lineTotalInclTax?: CsvCellValue;
    url?: CsvCellValue;
  }
): CsvCellValue[] {
  if (compactColumns) {
    const row = [
      values.type,
      values.manufacturerReference,
      values.name,
      values.connectionCount,
      values.connectorQuantity
    ];
    if (values.origin !== undefined) {
      row.push(values.origin);
    }
    return row;
  }

  return [
    values.type,
    values.manufacturerReference,
    values.name,
    values.connectionCount,
    values.connectorQuantity,
    values.spliceQuantity ?? "",
    values.componentQuantity ?? "",
    ...(values.origin !== undefined ? [values.origin] : []),
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
  origin: BomMaterialOrigin,
  lookup: ReturnType<typeof buildWireEndpointReferenceNameLookup>
): void {
  const normalizedReference = normalizeWireTerminationReference(reference);
  if (normalizedReference === undefined) {
    return;
  }

  const resolvedName = normalizeWireEndpointReferenceName(explicitName) ?? (kind === "connection" ? lookup.connection.get(normalizedReference) : lookup.seal.get(normalizedReference));
  const aggregateKey = `${origin}:${normalizedReference}`;
  const existing = aggregates.get(aggregateKey);
  if (existing !== undefined) {
    existing.quantity += 1;
    if (existing.name === undefined && resolvedName !== undefined) {
      existing.name = resolvedName;
    }
    return;
  }

  aggregates.set(aggregateKey, {
    reference: normalizedReference,
    name: resolvedName,
    quantity: 1,
    origin
  });
}

function registerCatalogAccessory(
  aggregates: Map<string, WireTerminationAggregateRow>,
  reference: string | undefined,
  name: string | undefined,
  quantity: number
): void {
  const normalizedReference = normalizeWireTerminationReference(reference);
  if (normalizedReference === undefined || quantity < 1) {
    return;
  }

  const aggregateKey = `accessory:catalog default:${normalizedReference}`;
  const existing = aggregates.get(aggregateKey);
  if (existing !== undefined) {
    existing.quantity += quantity;
    if (existing.name === undefined && name !== undefined) {
      existing.name = name;
    }
    return;
  }

  aggregates.set(aggregateKey, {
    reference: normalizedReference,
    name,
    quantity,
    origin: "catalog default",
    rowType: "Catalog accessory"
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
  origin: BomMaterialOrigin,
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

  const rowKey = `${kind}:${origin}:${normalizedReference}`;
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
    quantity: 1,
    origin
  });
}

function resolveWireEndpointTerminal(
  endpoint: WireEndpoint,
  connectorById: ReadonlyMap<Connector["id"], Connector>,
  catalogById: ReadonlyMap<CatalogItem["id"], CatalogItem>,
  reference: string | undefined,
  name: string | undefined
): { reference: string | undefined; name: string | undefined; origin: BomMaterialOrigin } {
  const manualReference = normalizeWireTerminationReference(reference);
  if (manualReference !== undefined) {
    return { reference: manualReference, name, origin: "manual" };
  }
  if (endpoint.kind !== "connectorCavity") {
    return { reference, name, origin: "manual" };
  }
  const connector = connectorById.get(endpoint.connectorId);
  const catalogItem = connector?.catalogItemId === undefined ? undefined : catalogById.get(connector.catalogItemId);
  const resolved = connector === undefined ? undefined : resolveConnectorTerminalMaterial(connector, catalogItem, endpoint.cavityIndex);
  return {
    reference: resolved?.terminalReference,
    name: resolved?.terminalName,
    origin: resolved?.origin ?? "manual"
  };
}

function resolveWireEndpointSeal(
  endpoint: WireEndpoint,
  connectorById: ReadonlyMap<Connector["id"], Connector>,
  catalogById: ReadonlyMap<CatalogItem["id"], CatalogItem>,
  reference: string | undefined,
  name: string | undefined
): { reference: string | undefined; name: string | undefined; origin: BomMaterialOrigin } {
  const manualReference = normalizeWireTerminationReference(reference);
  if (manualReference !== undefined) {
    return { reference: manualReference, name, origin: "manual" };
  }
  if (endpoint.kind !== "connectorCavity") {
    return { reference, name, origin: "manual" };
  }
  const connector = connectorById.get(endpoint.connectorId);
  if (connector === undefined || connector.applyCatalogSeals === false) {
    return { reference, name, origin: "manual" };
  }
  const catalogItem = connector.catalogItemId === undefined ? undefined : catalogById.get(connector.catalogItemId);
  const resolved = resolveConnectorTerminalMaterial(connector, catalogItem, endpoint.cavityIndex);
  return {
    reference: resolved?.sealReference,
    name: resolved?.sealName,
    origin: resolved?.origin ?? "manual"
  };
}

function buildNetworkSummaryBomExportData(
  catalogItems: CatalogItem[],
  connectors: Connector[],
  splices: Splice[],
  wires: Wire[],
  workspaceCurrencyCode: WorkspaceCurrencyCode = "EUR",
  workspaceTaxEnabled = true,
  workspaceTaxRatePercent = 20,
  compactColumns = false,
  options: {
    connectorCavityOccupancy?: ConnectorCavityOccupancyMap;
    showTraceabilityLabels?: boolean;
  } = {}
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
  const warnings: string[] = [];
  const includeTraceability = options.showTraceabilityLabels === true;

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
    for (const accessory of catalogItem.additionalAccessories ?? []) {
      registerCatalogAccessory(wireTerminationAggregates, accessory.accessoryReference, accessory.accessoryName, 1);
    }
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
    for (const accessory of catalogItem.additionalAccessories ?? []) {
      registerCatalogAccessory(wireTerminationAggregates, accessory.accessoryReference, accessory.accessoryName, 1);
    }
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
    connectionOrigin: BomMaterialOrigin,
    sealReference: string | undefined,
    sealName: string | undefined,
    sealOrigin: BomMaterialOrigin
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
      connectionOrigin,
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
      sealOrigin,
      wireReferenceNameLookup
    );
  };

  for (const wire of wires) {
    const endpointATerminal = resolveWireEndpointTerminal(
      wire.endpointA,
      connectorById,
      catalogById,
      wire.endpointAConnectionReference,
      wire.endpointAConnectionName
    );
    const endpointASeal = resolveWireEndpointSeal(
      wire.endpointA,
      connectorById,
      catalogById,
      wire.endpointASealReference,
      wire.endpointASealName
    );
    const endpointBTerminal = resolveWireEndpointTerminal(
      wire.endpointB,
      connectorById,
      catalogById,
      wire.endpointBConnectionReference,
      wire.endpointBConnectionName
    );
    const endpointBSeal = resolveWireEndpointSeal(
      wire.endpointB,
      connectorById,
      catalogById,
      wire.endpointBSealReference,
      wire.endpointBSealName
    );

    registerWireTermination(
      wireTerminationAggregates,
      endpointATerminal.reference,
      "connection",
      endpointATerminal.name,
      endpointATerminal.origin,
      wireReferenceNameLookup
    );
    registerWireTermination(wireTerminationAggregates, endpointASeal.reference, "seal", endpointASeal.name, endpointASeal.origin, wireReferenceNameLookup);
    registerWireTermination(
      wireTerminationAggregates,
      endpointBTerminal.reference,
      "connection",
      endpointBTerminal.name,
      endpointBTerminal.origin,
      wireReferenceNameLookup
    );
    registerWireTermination(wireTerminationAggregates, endpointBSeal.reference, "seal", endpointBSeal.name, endpointBSeal.origin, wireReferenceNameLookup);

    registerEndpointGroupedTerminology(
      wire.endpointA,
      endpointATerminal.reference,
      endpointATerminal.name,
      endpointATerminal.origin,
      endpointASeal.reference,
      endpointASeal.name,
      endpointASeal.origin
    );
    registerEndpointGroupedTerminology(
      wire.endpointB,
      endpointBTerminal.reference,
      endpointBTerminal.name,
      endpointBTerminal.origin,
      endpointBSeal.reference,
      endpointBSeal.name,
      endpointBSeal.origin
    );
  }

  for (const connector of connectors) {
    const catalogItem = connector.catalogItemId === undefined ? undefined : catalogById.get(connector.catalogItemId);
    const { plugs, warnings: plugWarnings } = resolveConnectorPlugMaterials(
      connector,
      catalogItem,
      wires,
      options.connectorCavityOccupancy
    );
    warnings.push(...plugWarnings.map((warning) => warning.message));
    for (const accessory of catalogItem?.additionalAccessories ?? []) {
      registerGroupedWireTermination(
        groupedConnectorAggregates,
        connector.technicalId,
        connector.name,
        connector.cavityCount,
        "accessory",
        accessory.accessoryReference,
        accessory.accessoryName,
        "catalog default",
        wireReferenceNameLookup
      );
    }
    for (const plug of plugs) {
      registerWireTermination(
        wireTerminationAggregates,
        plug.plugReference,
        "plug",
        plug.plugName,
        plug.origin,
        wireReferenceNameLookup
      );
      const existing = wireTerminationAggregates.get(`${plug.origin}:${plug.plugReference}`);
      if (existing !== undefined) {
        existing.quantity += plug.quantity - 1;
      }

      registerGroupedWireTermination(
        groupedConnectorAggregates,
        connector.technicalId,
        connector.name,
        connector.cavityCount,
        "plug",
        plug.plugReference,
        plug.plugName,
        plug.origin,
        wireReferenceNameLookup
      );
      const group = groupedConnectorAggregates.get(connector.technicalId);
      const row = group?.rows.get(`plug:${plug.origin}:${plug.plugReference}`);
      if (row !== undefined) {
        row.quantity += plug.quantity - 1;
      }
    }
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

  const headers = buildBomHeaders(workspaceCurrencyCode, normalizedTaxEnabled, compactColumns, includeTraceability);
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
          origin: includeTraceability ? "catalog default" : undefined,
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
          origin: includeTraceability ? "" : undefined,
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
          origin: includeTraceability ? "" : undefined,
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
          connectorQuantity: "",
          origin: includeTraceability ? "" : undefined
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
          connectorQuantity: "",
          origin: includeTraceability ? "" : undefined
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
          connectorQuantity: "",
          origin: includeTraceability ? "" : undefined
        }),
        headers.length
      )
    );
  }

  for (const { reference, name, quantity, origin, rowType } of orderedWireTerminationRows) {
    rows.push(
      padRow(
        createBomRow(compactColumns, {
          type: rowType ?? "Wire termination",
          manufacturerReference: reference,
          name: name ?? "",
          connectionCount: "",
          connectorQuantity: quantity,
          componentQuantity: quantity,
          origin: includeTraceability ? origin : undefined
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
    groupedSheetRows.push([
      group.connectorTechnicalId,
      group.connectorName,
      group.connectionCount,
      "Connector",
      "",
      "",
      1,
      ...(includeTraceability ? ["catalog default"] : [])
    ]);
    for (const row of orderedGroupRows) {
      groupedSheetRows.push([
        group.connectorTechnicalId,
        group.connectorName,
        "",
        row.kind === "connection" ? "Connection" : row.kind === "seal" ? "Seal" : row.kind === "plug" ? "Plug" : "Accessory",
        row.reference,
        row.name ?? "",
        row.quantity,
        ...(includeTraceability ? [row.origin] : [])
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
      headers: [
        "Connector ID",
        "Connector name",
        "Connection count",
        "Type",
        "Reference",
        "Name",
        "Quantity",
        ...(includeTraceability ? ["Origin"] : [])
      ],
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
    warnings,
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
  compactColumns = false,
  options?: {
    connectorCavityOccupancy?: ConnectorCavityOccupancyMap;
    showTraceabilityLabels?: boolean;
  }
): NetworkSummaryBomCsvExport {
  const exportData = buildNetworkSummaryBomExportData(
    catalogItems,
    connectors,
    splices,
    wires,
    workspaceCurrencyCode,
    workspaceTaxEnabled,
    workspaceTaxRatePercent,
    compactColumns,
    options
  );

  return {
    headers: exportData.headers,
    rows: exportData.rows,
    itemRowCount: exportData.itemRowCount,
    warnings: exportData.warnings
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
  compactColumns = false,
  options?: {
    connectorCavityOccupancy?: ConnectorCavityOccupancyMap;
    showTraceabilityLabels?: boolean;
  }
): TabularWorksheetExport[] {
  const exportData = buildNetworkSummaryBomExportData(
    catalogItems,
    connectors,
    splices,
    wires,
    workspaceCurrencyCode,
    workspaceTaxEnabled,
    workspaceTaxRatePercent,
    compactColumns,
    options
  );

  return exportData.groupedSheets;
}
