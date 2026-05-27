import type { Connector, Splice, Wire } from "../../core/entities";
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
      position: endpoint.cavityIndex + 1
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
  splices: Splice[]
): TabularWorksheetExport {
  const connectorById = new Map(connectors.map((c) => [c.id, c]));
  const spliceById = new Map(splices.map((s) => [s.id, s]));

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
    return [
      wire.technicalId,
      wire.name,
      wire.twistGroupLabel ?? "",
      wire.sectionMm2,
      resolveColor(wire),
      begin.type,
      begin.ref,
      begin.position,
      wire.endpointAConnectionReference ?? "",
      wire.endpointASealReference ?? "",
      end.type,
      end.ref,
      end.position,
      wire.endpointBConnectionReference ?? "",
      wire.endpointBSealReference ?? "",
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
