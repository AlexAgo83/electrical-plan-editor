import { resolveConnectorTerminalMaterial } from "../../core/connectorCatalogMaterials";
import type { CatalogItem, Connector, Splice, Wire, WireEndpoint } from "../../core/entities";
import type { TabularWorksheetExport } from "./tabularExport";

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
  sealRef: string;
}

function normalizeReference(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeName(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : undefined;
}

function formatResolvedMaterial(material: ResolvedEndpointMaterial | undefined): string {
  if (material === undefined) {
    return "";
  }
  return material.name === undefined ? material.reference : `${material.reference} - ${material.name}`;
}

function resolveEndpointConnectionMaterial(
  endpoint: WireEndpoint,
  reference: string | undefined,
  name: string | undefined,
  connectorById: ReadonlyMap<string, Connector>,
  catalogItemById: ReadonlyMap<string, CatalogItem>
): ResolvedEndpointMaterial | undefined {
  if (endpoint.kind === "splicePort") {
    return { reference: "Preden 13mm" };
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
  catalogItemById: ReadonlyMap<string, CatalogItem>
): ResolvedWireExportEndpointMaterials {
  const endpoint = side === "A" ? wire.endpointA : wire.endpointB;
  const connectionReference = side === "A" ? wire.endpointAConnectionReference : wire.endpointBConnectionReference;
  const connectionName = side === "A" ? wire.endpointAConnectionName : wire.endpointBConnectionName;
  const sealReference = side === "A" ? wire.endpointASealReference : wire.endpointBSealReference;
  const sealName = side === "A" ? wire.endpointASealName : wire.endpointBSealName;

  return {
    connectionRef: formatResolvedMaterial(
      resolveEndpointConnectionMaterial(endpoint, connectionReference, connectionName, connectorById, catalogItemById)
    ),
    sealRef: formatResolvedMaterial(
      resolveEndpointSealMaterial(endpoint, sealReference, sealName, connectorById, catalogItemById)
    )
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
  catalogItems: CatalogItem[]
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
    "Begin seal ref",
    "End type",
    "End ref",
    "End pin",
    "End connection ref",
    "End seal ref",
    "Length (mm)"
  ];

  const sortedWires = [...wires].sort((a, b) =>
    a.technicalId.localeCompare(b.technicalId, undefined, { sensitivity: "base" })
  );

  const rows = sortedWires.map((wire) => {
    const begin = resolveEndpoint(wire, "A", connectorById, spliceById);
    const end = resolveEndpoint(wire, "B", connectorById, spliceById);
    const beginMaterials = resolveWireExportEndpointMaterials(wire, "A", connectorById, catalogItemById);
    const endMaterials = resolveWireExportEndpointMaterials(wire, "B", connectorById, catalogItemById);
    return [
      wire.technicalId,
      wire.name,
      wire.twistGroupLabel ?? "",
      wire.sectionMm2,
      resolveColor(wire),
      begin.type,
      begin.ref,
      begin.position,
      beginMaterials.connectionRef,
      beginMaterials.sealRef,
      end.type,
      end.ref,
      end.position,
      endMaterials.connectionRef,
      endMaterials.sealRef,
      wire.lengthMm
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
