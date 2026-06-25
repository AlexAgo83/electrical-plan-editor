import { resolveConnectorTerminalMaterial } from "../../core/connectorCatalogMaterials";
import type { CatalogItem, Connector, Splice, Wire, WireEndpoint } from "../../core/entities";
import type { TabularWorksheetExport } from "./tabularExport";
import {
  buildWireTwistGroupExportCounts,
  resolveWireExportLengthMm,
  type WireExportLengthPreferences
} from "./wireExportLength";

function resolveColor(wire: Wire): string {
  if (wire.colorMode === "free") {
    return wire.freeColorLabel ?? "";
  }
  const primary = wire.primaryColorId ?? "";
  const secondary = wire.secondaryColorId ?? "";
  return secondary.length > 0 ? `${primary}/${secondary}` : primary;
}

interface ResolvedEndpoint {
  type: string;
  ref: string;
  position: string | number;
}

interface ResolvedEndpointMaterial {
  reference: string;
  name?: string;
}

export interface ResolvedWireExportEndpointMaterials {
  connectionRef: string;
  connectionName: string;
  sealRef: string;
  sealName: string;
}

function normalizeReference(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeName(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : undefined;
}

function resolvedMaterialReference(material: ResolvedEndpointMaterial | undefined): string {
  return material?.reference ?? "";
}

function resolvedMaterialName(material: ResolvedEndpointMaterial | undefined): string {
  return material?.name ?? "";
}

function resolveSpliceConnectionMaterial(
  endpoint: Extract<WireEndpoint, { kind: "splicePort" }>,
  reference: string | undefined,
  name: string | undefined,
  spliceById: ReadonlyMap<string, Splice>,
  catalogItemById: ReadonlyMap<string, CatalogItem>
): ResolvedEndpointMaterial | undefined {
  const manualReference = normalizeReference(reference);
  if (manualReference !== undefined) {
    return {
      reference: manualReference,
      name: normalizeName(name)
    };
  }

  const splice = spliceById.get(endpoint.spliceId);
  if (splice === undefined) {
    return undefined;
  }

  const catalogItem = splice.catalogItemId === undefined ? undefined : catalogItemById.get(splice.catalogItemId);
  if (catalogItem !== undefined) {
    return {
      reference: catalogItem.manufacturerReference,
      name: normalizeName(catalogItem.name)
    };
  }

  const spliceReference = normalizeReference(splice.manufacturerReference);
  if (spliceReference === undefined) {
    return undefined;
  }
  return { reference: spliceReference };
}

function resolveEndpointConnectionMaterial(
  endpoint: WireEndpoint,
  reference: string | undefined,
  name: string | undefined,
  connectorById: ReadonlyMap<string, Connector>,
  spliceById: ReadonlyMap<string, Splice>,
  catalogItemById: ReadonlyMap<string, CatalogItem>
): ResolvedEndpointMaterial | undefined {
  if (endpoint.kind === "splicePort") {
    return resolveSpliceConnectionMaterial(endpoint, reference, name, spliceById, catalogItemById);
  }

  const manualReference = normalizeReference(reference);
  if (manualReference !== undefined) {
    return {
      reference: manualReference,
      name: normalizeName(name)
    };
  }

  const connector = connectorById.get(endpoint.connectorId);
  const catalogItem = connector?.catalogItemId === undefined ? undefined : catalogItemById.get(connector.catalogItemId);
  const resolved = connector === undefined ? undefined : resolveConnectorTerminalMaterial(connector, catalogItem, endpoint.cavityIndex);
  if (resolved?.terminalReference === undefined) {
    return undefined;
  }
  return {
    reference: resolved.terminalReference,
    name: normalizeName(resolved.terminalName)
  };
}

function resolveEndpointSealMaterial(
  endpoint: WireEndpoint,
  reference: string | undefined,
  name: string | undefined,
  connectorById: ReadonlyMap<string, Connector>,
  catalogItemById: ReadonlyMap<string, CatalogItem>
): ResolvedEndpointMaterial | undefined {
  if (endpoint.kind === "splicePort") {
    return undefined;
  }

  const manualReference = normalizeReference(reference);
  if (manualReference !== undefined) {
    return {
      reference: manualReference,
      name: normalizeName(name)
    };
  }

  const connector = connectorById.get(endpoint.connectorId);
  if (connector === undefined || connector.applyCatalogSeals === false) {
    return undefined;
  }

  const catalogItem = connector.catalogItemId === undefined ? undefined : catalogItemById.get(connector.catalogItemId);
  const resolved = resolveConnectorTerminalMaterial(connector, catalogItem, endpoint.cavityIndex);
  if (resolved?.sealReference === undefined) {
    return undefined;
  }
  return {
    reference: resolved.sealReference,
    name: normalizeName(resolved.sealName)
  };
}

export function resolveWireExportEndpointMaterials(
  wire: Wire,
  side: "A" | "B",
  connectorById: ReadonlyMap<string, Connector>,
  spliceById: ReadonlyMap<string, Splice>,
  catalogItemById: ReadonlyMap<string, CatalogItem>
): ResolvedWireExportEndpointMaterials {
  const endpoint = side === "A" ? wire.endpointA : wire.endpointB;
  const connectionReference = side === "A" ? wire.endpointAConnectionReference : wire.endpointBConnectionReference;
  const connectionName = side === "A" ? wire.endpointAConnectionName : wire.endpointBConnectionName;
  const sealReference = side === "A" ? wire.endpointASealReference : wire.endpointBSealReference;
  const sealName = side === "A" ? wire.endpointASealName : wire.endpointBSealName;

  const connectionMaterial = resolveEndpointConnectionMaterial(
    endpoint,
    connectionReference,
    connectionName,
    connectorById,
    spliceById,
    catalogItemById
  );
  const sealMaterial = resolveEndpointSealMaterial(endpoint, sealReference, sealName, connectorById, catalogItemById);

  return {
    connectionRef: resolvedMaterialReference(connectionMaterial),
    connectionName: resolvedMaterialName(connectionMaterial),
    sealRef: resolvedMaterialReference(sealMaterial),
    sealName: resolvedMaterialName(sealMaterial)
  };
}

function resolveEndpoint(
  wire: Wire,
  side: "A" | "B",
  connectorById: Map<string, Connector>,
  spliceById: Map<string, Splice>
): ResolvedEndpoint {
  const endpoint = side === "A" ? wire.endpointA : wire.endpointB;
  if (endpoint.kind === "connectorCavity") {
    const connector = connectorById.get(endpoint.connectorId);
    return {
      type: "Connector",
      ref: connector?.technicalId ?? endpoint.connectorId,
      position: `C${endpoint.cavityIndex}`
    };
  }
  const splice = spliceById.get(endpoint.spliceId);
  return {
    type: "Splice",
    ref: splice?.technicalId ?? endpoint.spliceId,
    position: endpoint.spliceSideOverride ?? endpoint.portIndex
  };
}

export function buildWireListSheet(
  sheetName: string,
  wires: Wire[],
  connectors: Connector[],
  splices: Splice[],
  catalogItems: CatalogItem[],
  exportLengthPreferences: WireExportLengthPreferences = {},
  formatEntityId: (id: string) => string = (id) => id
): TabularWorksheetExport {
  const connectorById = new Map(connectors.map((c) => [c.id, c]));
  const spliceById = new Map(splices.map((s) => [s.id, s]));
  const catalogItemById = new Map(catalogItems.map((item) => [item.id, item]));

  const headers = [
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
    "Length (mm)"
  ];

  const sortedWires = [...wires].sort((a, b) =>
    a.technicalId.localeCompare(b.technicalId, undefined, { sensitivity: "base" })
  );
  const twistGroupCounts = buildWireTwistGroupExportCounts(sortedWires);

  const rows = sortedWires.map((wire) => {
    const begin = resolveEndpoint(wire, "A", connectorById, spliceById);
    const end = resolveEndpoint(wire, "B", connectorById, spliceById);
    const beginMaterials = resolveWireExportEndpointMaterials(wire, "A", connectorById, spliceById, catalogItemById);
    const endMaterials = resolveWireExportEndpointMaterials(wire, "B", connectorById, spliceById, catalogItemById);
    return [
      formatEntityId(wire.technicalId),
      wire.name,
      wire.twistGroupLabel ?? "",
      wire.sectionMm2,
      resolveColor(wire),
      begin.type,
      formatEntityId(begin.ref),
      begin.position,
      beginMaterials.connectionRef,
      beginMaterials.connectionName,
      beginMaterials.sealRef,
      beginMaterials.sealName,
      end.type,
      formatEntityId(end.ref),
      end.position,
      endMaterials.connectionRef,
      endMaterials.connectionName,
      endMaterials.sealRef,
      endMaterials.sealName,
      resolveWireExportLengthMm(wire, twistGroupCounts, exportLengthPreferences)
    ];
  });

  return {
    name: sheetName,
    headers,
    rows,
    freezeHeaderRow: true,
    autoFilter: true
  };
}
