import { APP_RELEASE_VERSION } from "../../core/schema";
import type {
  CatalogItem,
  Connector,
  ConnectorId,
  HarnessAssembly,
  HarnessAssemblyId,
  Network,
  NetworkId,
  Segment,
  Splice,
  Wire,
  WireEndpoint,
  WireProtection
} from "../../core/entities";
import {
  type BomMaterialOrigin,
  type ConnectorCavityOccupancyMap,
  resolveConnectorPlugMaterials,
  resolveConnectorTerminalMaterial
} from "../../core/connectorCatalogMaterials";
import type { AppState, NetworkScopedState } from "../../store";
import { toFilesystemSafeTimestamp } from "./exportFileName";

export const SELECTED_HARNESS_AGENT_JSON_SCHEMA_VERSION = "1.0";
export const SELECTED_HARNESS_AGENT_JSON_EXPORT_KIND = "electrical-plan-editor.selected-harness-agent-json";

type AgentMaterialOrigin = "manual" | "connectorOverride" | "catalogDefault" | "computed";
type AgentWarningSeverity = "info" | "warning" | "error";

export interface SelectedHarnessAgentJsonWarning {
  code: string;
  severity: AgentWarningSeverity;
  message: string;
  related: Array<Record<string, string | number>>;
}

interface MaterialRef {
  reference?: string;
  name?: string;
  origin?: AgentMaterialOrigin;
}

interface BomQuantity {
  kind: "connector" | "splice" | "terminal" | "seal" | "plug" | "protection" | "accessory";
  reference: string;
  name?: string;
  quantity: number;
  origin?: AgentMaterialOrigin;
  usedBy: Array<Record<string, string | number>>;
}

interface AgentCatalogPart {
  kind: "catalogItem" | "terminal" | "seal" | "plug" | "protection" | "accessory";
  reference: string;
  id?: string;
  name?: string;
  connectionCount?: number;
  manufacturerReference?: string;
  usedBy: Array<Record<string, string | number>>;
}

interface AgentRelationship {
  kind: string;
  from: Record<string, string | number>;
  to: Record<string, string | number>;
  via?: Record<string, string | number>;
}

export interface SelectedHarnessAgentJsonPayload {
  schemaVersion: typeof SELECTED_HARNESS_AGENT_JSON_SCHEMA_VERSION;
  exportKind: typeof SELECTED_HARNESS_AGENT_JSON_EXPORT_KIND;
  exportedAt: string;
  appVersion: string;
  selectedHarness: {
    id: string;
    technicalId: string;
    name: string;
  };
  harness: HarnessAssembly;
  members: Array<{
    networkId: NetworkId;
    color: string;
    network?: Network;
  }>;
  networks: Array<{
    network: Network;
    connectors: Array<
      Connector & {
        cavityOccupancy: Array<{ cavityIndex: number; occupantRef: string }>;
        resolvedCavities: Array<{
          cavityIndex: number;
          terminal?: MaterialRef;
          seal?: MaterialRef;
        }>;
        unusedCavityPlugRequirements: Array<MaterialRef & { quantity: number; unusedCavityCount: number }>;
      }
    >;
    splices: Splice[];
    segments: Segment[];
    wires: Array<
      Omit<Wire, "endpointA" | "endpointB" | "protection"> & {
        endpointA: ReturnType<typeof buildEndpointRecord>;
        endpointB: ReturnType<typeof buildEndpointRecord>;
        protection?: WireProtection & { catalogItem?: CatalogItem };
      }
    >;
    catalogItems: CatalogItem[];
  }>;
  catalogParts: AgentCatalogPart[];
  bomQuantities: BomQuantity[];
  relationships: AgentRelationship[];
  warnings: SelectedHarnessAgentJsonWarning[];
}

export type SelectedHarnessAgentJsonResult =
  | { ok: true; payload: SelectedHarnessAgentJsonPayload; warnings: SelectedHarnessAgentJsonWarning[] }
  | { ok: false; error: SelectedHarnessAgentJsonWarning };

function valuesFromEntityState<T, Id extends string>(state: { byId: Record<Id, T>; allIds: Id[] }): T[] {
  return state.allIds.flatMap((id) => {
    const value = state.byId[id];
    return value === undefined ? [] : [value];
  });
}

function normalizeReference(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  return normalized.length === 0 ? undefined : normalized;
}

function mapMaterialOrigin(origin: BomMaterialOrigin): AgentMaterialOrigin {
  if (origin === "instance override") {
    return "connectorOverride";
  }
  if (origin === "catalog default") {
    return "catalogDefault";
  }
  return "manual";
}

function buildWarning(
  code: string,
  severity: AgentWarningSeverity,
  message: string,
  related: Array<Record<string, string | number>> = []
): SelectedHarnessAgentJsonWarning {
  return { code, severity, message, related };
}

function addUsedBy(target: Map<string, AgentCatalogPart>, key: string, part: Omit<AgentCatalogPart, "usedBy">, usedBy: Record<string, string | number>): void {
  const existing = target.get(key);
  if (existing !== undefined) {
    existing.usedBy.push(usedBy);
    return;
  }
  target.set(key, { ...part, usedBy: [usedBy] });
}

function addQuantity(
  quantities: Map<string, BomQuantity>,
  quantity: Omit<BomQuantity, "quantity" | "usedBy">,
  amount: number,
  usedBy: Record<string, string | number>
): void {
  const key = `${quantity.kind}:${quantity.origin ?? ""}:${quantity.reference}`;
  const existing = quantities.get(key);
  if (existing !== undefined) {
    existing.quantity += amount;
    existing.usedBy.push(usedBy);
    if (existing.name === undefined && quantity.name !== undefined) {
      existing.name = quantity.name;
    }
    return;
  }
  quantities.set(key, { ...quantity, quantity: amount, usedBy: [usedBy] });
}

function buildEndpointRecord(
  endpoint: WireEndpoint,
  networkId: NetworkId,
  wire: Wire,
  endpointSide: "A" | "B",
  connectorById: ReadonlyMap<ConnectorId, Connector>,
  catalogById: ReadonlyMap<CatalogItem["id"], CatalogItem>,
  warnings: SelectedHarnessAgentJsonWarning[]
) {
  if (endpoint.kind === "splicePort") {
    return {
      ...endpoint,
      networkId,
      wireId: wire.id,
      endpointSide
    };
  }

  const connector = connectorById.get(endpoint.connectorId);
  const catalogItem = connector?.catalogItemId === undefined ? undefined : catalogById.get(connector.catalogItemId);
  const manualTerminalReference = normalizeReference(endpointSide === "A" ? wire.endpointAConnectionReference : wire.endpointBConnectionReference);
  const manualSealReference = normalizeReference(endpointSide === "A" ? wire.endpointASealReference : wire.endpointBSealReference);
  const resolved = connector === undefined ? undefined : resolveConnectorTerminalMaterial(connector, catalogItem, endpoint.cavityIndex);
  const terminal =
    manualTerminalReference !== undefined
      ? {
          reference: manualTerminalReference,
          name: endpointSide === "A" ? wire.endpointAConnectionName : wire.endpointBConnectionName,
          origin: "manual" as const
        }
      : resolved?.terminalReference === undefined
        ? undefined
        : {
            reference: resolved.terminalReference,
            name: resolved.terminalName,
            origin: mapMaterialOrigin(resolved.origin)
          };
  const seal =
    manualSealReference !== undefined
      ? {
          reference: manualSealReference,
          name: endpointSide === "A" ? wire.endpointASealName : wire.endpointBSealName,
          origin: "manual" as const
        }
      : connector?.applyCatalogSeals === false || resolved?.sealReference === undefined
        ? undefined
        : {
            reference: resolved.sealReference,
            name: resolved.sealName,
            origin: mapMaterialOrigin(resolved.origin)
          };

  if (connector === undefined) {
    warnings.push(
      buildWarning("MISSING_CONNECTOR", "error", `Wire '${wire.technicalId}' references a missing connector.`, [
        { networkId, wireId: wire.id, endpointSide, connectorId: endpoint.connectorId }
      ])
    );
  }

  return {
    ...endpoint,
    networkId,
    wireId: wire.id,
    endpointSide,
    connectorTechnicalId: connector?.technicalId,
    connectorName: connector?.name,
    manualConnectionReference: endpointSide === "A" ? wire.endpointAConnectionReference : wire.endpointBConnectionReference,
    manualConnectionName: endpointSide === "A" ? wire.endpointAConnectionName : wire.endpointBConnectionName,
    manualSealReference: endpointSide === "A" ? wire.endpointASealReference : wire.endpointBSealReference,
    manualSealName: endpointSide === "A" ? wire.endpointASealName : wire.endpointBSealName,
    terminal,
    seal
  };
}

function registerEndpointMaterials(
  endpoint: ReturnType<typeof buildEndpointRecord>,
  catalogParts: Map<string, AgentCatalogPart>,
  quantities: Map<string, BomQuantity>
): void {
  if (endpoint.kind !== "connectorCavity") {
    return;
  }
  const usedBy = {
    networkId: endpoint.networkId,
    wireId: endpoint.wireId,
    endpointSide: endpoint.endpointSide,
    connectorId: endpoint.connectorId,
    cavityIndex: endpoint.cavityIndex
  };
  if (endpoint.terminal?.reference !== undefined) {
    addUsedBy(
      catalogParts,
      `terminal:${endpoint.terminal.reference}`,
      { kind: "terminal", reference: endpoint.terminal.reference, name: endpoint.terminal.name },
      usedBy
    );
    addQuantity(
      quantities,
      { kind: "terminal", reference: endpoint.terminal.reference, name: endpoint.terminal.name, origin: endpoint.terminal.origin },
      1,
      usedBy
    );
  }
  if (endpoint.seal?.reference !== undefined) {
    addUsedBy(
      catalogParts,
      `seal:${endpoint.seal.reference}`,
      { kind: "seal", reference: endpoint.seal.reference, name: endpoint.seal.name },
      usedBy
    );
    addQuantity(
      quantities,
      { kind: "seal", reference: endpoint.seal.reference, name: endpoint.seal.name, origin: endpoint.seal.origin },
      1,
      usedBy
    );
  }
}

function registerCatalogAdditionalAccessories(
  catalogItem: CatalogItem,
  usedBy: Record<string, string | number>,
  catalogParts: Map<string, AgentCatalogPart>,
  quantities: Map<string, BomQuantity>,
  relationships: AgentRelationship[]
): void {
  for (const accessory of catalogItem.additionalAccessories ?? []) {
    const reference = normalizeReference(accessory.accessoryReference);
    if (reference === undefined) {
      continue;
    }
    const accessoryUsedBy = {
      ...usedBy,
      catalogItemId: catalogItem.id,
      catalogItemReference: catalogItem.manufacturerReference
    };
    addUsedBy(
      catalogParts,
      `accessory:${reference}`,
      { kind: "accessory", reference, name: accessory.accessoryName },
      accessoryUsedBy
    );
    addQuantity(
      quantities,
      { kind: "accessory", reference, name: accessory.accessoryName, origin: "catalogDefault" },
      1,
      accessoryUsedBy
    );
    relationships.push({
      kind: "catalog-item-additional-accessory",
      from: { catalogItemId: catalogItem.id, manufacturerReference: catalogItem.manufacturerReference },
      to: { accessoryReference: reference },
      via: usedBy
    });
  }
}

function scopedConnectorOccupancy(scoped: NetworkScopedState): ConnectorCavityOccupancyMap {
  return scoped.connectorCavityOccupancy;
}

export function buildSelectedHarnessAgentJsonPayload(params: {
  state: AppState;
  selectedHarnessAssemblyId: HarnessAssemblyId | null | undefined;
  exportedAt?: string;
  appVersion?: string;
}): SelectedHarnessAgentJsonResult {
  const { state, selectedHarnessAssemblyId } = params;
  if (selectedHarnessAssemblyId === null || selectedHarnessAssemblyId === undefined) {
    return {
      ok: false,
      error: buildWarning("NO_SELECTED_HARNESS", "error", "No harness assembly is selected for agent JSON export.")
    };
  }

  const harness = state.harnessAssemblies.byId[selectedHarnessAssemblyId];
  if (harness === undefined) {
    return {
      ok: false,
      error: buildWarning("MISSING_SELECTED_HARNESS", "error", "The selected harness assembly no longer exists.", [
        { harnessAssemblyId: selectedHarnessAssemblyId }
      ])
    };
  }

  const warnings: SelectedHarnessAgentJsonWarning[] = [];
  const relationships: AgentRelationship[] = [];
  const catalogParts = new Map<string, AgentCatalogPart>();
  const quantities = new Map<string, BomQuantity>();
  const networkPayloads: SelectedHarnessAgentJsonPayload["networks"] = [];

  for (const member of harness.members) {
    const network = state.networks.byId[member.networkId];
    const scoped = state.networkStates[member.networkId];
    relationships.push({
      kind: "harness-member-network",
      from: { harnessAssemblyId: harness.id },
      to: { networkId: member.networkId },
      via: { color: member.color }
    });
    if (network === undefined || scoped === undefined) {
      warnings.push(
        buildWarning("MISSING_MEMBER_NETWORK", "error", `Harness member network '${String(member.networkId)}' is missing.`, [
          { harnessAssemblyId: harness.id, networkId: member.networkId }
        ])
      );
      continue;
    }

    const connectors = valuesFromEntityState(scoped.connectors);
    const splices = valuesFromEntityState(scoped.splices);
    const segments = valuesFromEntityState(scoped.segments);
    const wires = valuesFromEntityState(scoped.wires);
    const catalogItems = valuesFromEntityState(scoped.catalogItems);
    const connectorById = new Map(connectors.map((connector) => [connector.id, connector] as const));
    const spliceById = new Map(splices.map((splice) => [splice.id, splice] as const));
    const segmentById = new Map(segments.map((segment) => [segment.id, segment] as const));
    const catalogById = new Map(catalogItems.map((item) => [item.id, item] as const));
    const occupancy = scopedConnectorOccupancy(scoped);

    for (const connector of connectors) {
      if (connector.catalogItemId !== undefined) {
        const catalogItem = catalogById.get(connector.catalogItemId);
        if (catalogItem === undefined) {
          warnings.push(
            buildWarning("MISSING_CONNECTOR_CATALOG_ITEM", "warning", `Connector '${connector.technicalId}' references a missing catalog item.`, [
              { networkId: member.networkId, connectorId: connector.id, catalogItemId: connector.catalogItemId }
            ])
          );
        } else {
          const usedBy = { networkId: member.networkId, connectorId: connector.id };
          addUsedBy(
            catalogParts,
            `catalogItem:${catalogItem.id}`,
            {
              kind: "catalogItem",
              id: catalogItem.id,
              reference: catalogItem.manufacturerReference,
              manufacturerReference: catalogItem.manufacturerReference,
              name: catalogItem.name,
              connectionCount: catalogItem.connectionCount
            },
            usedBy
          );
          addQuantity(
            quantities,
            { kind: "connector", reference: catalogItem.manufacturerReference, name: catalogItem.name, origin: "catalogDefault" },
            1,
            usedBy
          );
          registerCatalogAdditionalAccessories(catalogItem, usedBy, catalogParts, quantities, relationships);
          relationships.push({
            kind: "connector-catalog-item",
            from: { networkId: member.networkId, connectorId: connector.id },
            to: { catalogItemId: catalogItem.id }
          });
        }
      }
    }

    for (const splice of splices) {
      if (splice.catalogItemId !== undefined) {
        const catalogItem = catalogById.get(splice.catalogItemId);
        if (catalogItem === undefined) {
          warnings.push(
            buildWarning("MISSING_SPLICE_CATALOG_ITEM", "warning", `Splice '${splice.technicalId}' references a missing catalog item.`, [
              { networkId: member.networkId, spliceId: splice.id, catalogItemId: splice.catalogItemId }
            ])
          );
        } else {
          const usedBy = { networkId: member.networkId, spliceId: splice.id };
          addUsedBy(
            catalogParts,
            `catalogItem:${catalogItem.id}`,
            {
              kind: "catalogItem",
              id: catalogItem.id,
              reference: catalogItem.manufacturerReference,
              manufacturerReference: catalogItem.manufacturerReference,
              name: catalogItem.name,
              connectionCount: catalogItem.connectionCount
            },
            usedBy
          );
          addQuantity(
            quantities,
            { kind: "splice", reference: catalogItem.manufacturerReference, name: catalogItem.name, origin: "catalogDefault" },
            1,
            usedBy
          );
          registerCatalogAdditionalAccessories(catalogItem, usedBy, catalogParts, quantities, relationships);
          relationships.push({
            kind: "splice-catalog-item",
            from: { networkId: member.networkId, spliceId: splice.id },
            to: { catalogItemId: catalogItem.id }
          });
        }
      }
    }

    const exportedConnectors = connectors.map((connector) => {
      const catalogItem = connector.catalogItemId === undefined ? undefined : catalogById.get(connector.catalogItemId);
      const cavityOccupancy = Object.entries(occupancy[connector.id] ?? {})
        .map(([cavityIndex, occupantRef]) => ({ cavityIndex: Number(cavityIndex), occupantRef }))
        .filter((entry) => Number.isInteger(entry.cavityIndex))
        .sort((left, right) => left.cavityIndex - right.cavityIndex);
      const resolvedCavities = Array.from({ length: connector.cavityCount }, (_, index) => {
        const cavityIndex = index + 1;
        const resolved = resolveConnectorTerminalMaterial(connector, catalogItem, cavityIndex);
        return {
          cavityIndex,
          terminal:
            resolved?.terminalReference === undefined
              ? undefined
              : { reference: resolved.terminalReference, name: resolved.terminalName, origin: mapMaterialOrigin(resolved.origin) },
          seal:
            connector.applyCatalogSeals === false || resolved?.sealReference === undefined
              ? undefined
              : { reference: resolved.sealReference, name: resolved.sealName, origin: mapMaterialOrigin(resolved.origin) }
        };
      });
      const { plugs, unusedCavityCount, warnings: plugWarnings } = resolveConnectorPlugMaterials(connector, catalogItem, wires, occupancy);
      for (const warning of plugWarnings) {
        warnings.push(
          buildWarning(warning.code, "warning", warning.message, [
            { networkId: member.networkId, connectorId: warning.connectorId, connectorTechnicalId: warning.connectorTechnicalId }
          ])
        );
      }
      const unusedCavityPlugRequirements = plugs.map((plug) => {
        const usedBy = { networkId: member.networkId, connectorId: connector.id };
        addUsedBy(catalogParts, `plug:${plug.plugReference}`, { kind: "plug", reference: plug.plugReference, name: plug.plugName }, usedBy);
        addQuantity(
          quantities,
          { kind: "plug", reference: plug.plugReference, name: plug.plugName, origin: mapMaterialOrigin(plug.origin) },
          plug.quantity,
          usedBy
        );
        if (plug.quantity !== unusedCavityCount) {
          warnings.push(
            buildWarning("PLUG_QUANTITY_ONLY_ASSIGNMENT", "info", `Connector '${connector.technicalId}' plug data is quantity-based and not cavity-specific.`, [
              { networkId: member.networkId, connectorId: connector.id, plugReference: plug.plugReference }
            ])
          );
        }
        return {
          reference: plug.plugReference,
          name: plug.plugName,
          origin: mapMaterialOrigin(plug.origin),
          quantity: plug.quantity,
          unusedCavityCount
        };
      });
      return {
        ...connector,
        cavityOccupancy,
        resolvedCavities,
        unusedCavityPlugRequirements
      };
    });

    const exportedWires = wires.map((wire) => {
      const endpointA = buildEndpointRecord(wire.endpointA, member.networkId, wire, "A", connectorById, catalogById, warnings);
      const endpointB = buildEndpointRecord(wire.endpointB, member.networkId, wire, "B", connectorById, catalogById, warnings);
      registerEndpointMaterials(endpointA, catalogParts, quantities);
      registerEndpointMaterials(endpointB, catalogParts, quantities);
      relationships.push({
        kind: "wire-endpoint",
        from: { networkId: member.networkId, wireId: wire.id },
        to:
          wire.endpointA.kind === "connectorCavity"
            ? { networkId: member.networkId, connectorId: wire.endpointA.connectorId, cavityIndex: wire.endpointA.cavityIndex }
            : { networkId: member.networkId, spliceId: wire.endpointA.spliceId, portIndex: wire.endpointA.portIndex },
        via: { endpointSide: "A" }
      });
      relationships.push({
        kind: "wire-endpoint",
        from: { networkId: member.networkId, wireId: wire.id },
        to:
          wire.endpointB.kind === "connectorCavity"
            ? { networkId: member.networkId, connectorId: wire.endpointB.connectorId, cavityIndex: wire.endpointB.cavityIndex }
            : { networkId: member.networkId, spliceId: wire.endpointB.spliceId, portIndex: wire.endpointB.portIndex },
        via: { endpointSide: "B" }
      });
      for (const segmentId of wire.routeSegmentIds) {
        if (segmentById.has(segmentId)) {
          relationships.push({
            kind: "wire-route-segment",
            from: { networkId: member.networkId, wireId: wire.id },
            to: { networkId: member.networkId, segmentId }
          });
        } else {
          warnings.push(
            buildWarning("MISSING_ROUTE_SEGMENT", "warning", `Wire '${wire.technicalId}' references a missing route segment.`, [
              { networkId: member.networkId, wireId: wire.id, segmentId }
            ])
          );
        }
      }
      if (wire.endpointA.kind === "splicePort" && !spliceById.has(wire.endpointA.spliceId)) {
        warnings.push(
          buildWarning("MISSING_SPLICE", "error", `Wire '${wire.technicalId}' references a missing splice.`, [
            { networkId: member.networkId, wireId: wire.id, endpointSide: "A", spliceId: wire.endpointA.spliceId }
          ])
        );
      }
      if (wire.endpointB.kind === "splicePort" && !spliceById.has(wire.endpointB.spliceId)) {
        warnings.push(
          buildWarning("MISSING_SPLICE", "error", `Wire '${wire.technicalId}' references a missing splice.`, [
            { networkId: member.networkId, wireId: wire.id, endpointSide: "B", spliceId: wire.endpointB.spliceId }
          ])
        );
      }
      const protection = buildProtectionRecord(wire.protection, member.networkId, wire, catalogById, catalogParts, quantities, relationships, warnings);
      return {
        id: wire.id,
        name: wire.name,
        technicalId: wire.technicalId,
        twistGroupLabel: wire.twistGroupLabel,
        functionalDomainTag: wire.functionalDomainTag,
        sectionMm2: wire.sectionMm2,
        currentA: wire.currentA,
        material: wire.material,
        colorMode: wire.colorMode,
        primaryColorId: wire.primaryColorId,
        secondaryColorId: wire.secondaryColorId,
        freeColorLabel: wire.freeColorLabel,
        routeSegmentIds: wire.routeSegmentIds,
        lengthMm: wire.lengthMm,
        isRouteLocked: wire.isRouteLocked,
        endpointA,
        endpointB,
        protection
      };
    });

    networkPayloads.push({
      network,
      connectors: exportedConnectors,
      splices,
      segments,
      wires: exportedWires,
      catalogItems
    });
  }

  for (const root of harness.masterConnectorRefs) {
    relationships.push({
      kind: "harness-master-connector",
      from: { harnessAssemblyId: harness.id },
      to: { networkId: root.networkId, connectorId: root.connectorId }
    });
    const scoped = state.networkStates[root.networkId];
    if (scoped?.connectors.byId[root.connectorId] === undefined) {
      warnings.push(
        buildWarning("MISSING_MASTER_CONNECTOR", "warning", "Harness master connector reference is unresolved.", [
          { harnessAssemblyId: harness.id, networkId: root.networkId, connectorId: root.connectorId }
        ])
      );
    }
  }

  for (const link of harness.connectorLinks) {
    relationships.push({
      kind: "inter-harness-connector-link",
      from: { networkId: link.sourceNetworkId, connectorId: link.sourceConnectorId },
      to: { networkId: link.targetNetworkId, connectorId: link.targetConnectorId },
      via: { harnessAssemblyId: harness.id, linkId: link.id, name: link.name ?? "" }
    });
  }

  return {
    ok: true,
    payload: {
      schemaVersion: SELECTED_HARNESS_AGENT_JSON_SCHEMA_VERSION,
      exportKind: SELECTED_HARNESS_AGENT_JSON_EXPORT_KIND,
      exportedAt: params.exportedAt ?? new Date().toISOString(),
      appVersion: params.appVersion ?? APP_RELEASE_VERSION,
      selectedHarness: {
        id: harness.id,
        technicalId: harness.technicalId,
        name: harness.name
      },
      harness,
      members: harness.members.map((member) => ({
        ...member,
        network: state.networks.byId[member.networkId]
      })),
      networks: networkPayloads,
      catalogParts: [...catalogParts.values()].sort((left, right) => left.reference.localeCompare(right.reference)),
      bomQuantities: [...quantities.values()].sort((left, right) => `${left.kind}:${left.reference}`.localeCompare(`${right.kind}:${right.reference}`)),
      relationships,
      warnings
    },
    warnings
  };
}

function buildProtectionRecord(
  protection: WireProtection | undefined,
  networkId: NetworkId,
  wire: Wire,
  catalogById: ReadonlyMap<CatalogItem["id"], CatalogItem>,
  catalogParts: Map<string, AgentCatalogPart>,
  quantities: Map<string, BomQuantity>,
  relationships: AgentRelationship[],
  warnings: SelectedHarnessAgentJsonWarning[]
): (WireProtection & { catalogItem?: CatalogItem }) | undefined {
  if (protection === undefined) {
    return undefined;
  }
  const catalogItem = catalogById.get(protection.catalogItemId);
  if (catalogItem === undefined) {
    warnings.push(
      buildWarning("MISSING_PROTECTION_CATALOG_ITEM", "warning", `Wire '${wire.technicalId}' references a missing protection catalog item.`, [
        { networkId, wireId: wire.id, catalogItemId: protection.catalogItemId }
      ])
    );
    return protection;
  }
  const usedBy = { networkId, wireId: wire.id };
  addUsedBy(
    catalogParts,
    `protection:${catalogItem.id}`,
    {
      kind: "protection",
      id: catalogItem.id,
      reference: catalogItem.manufacturerReference,
      manufacturerReference: catalogItem.manufacturerReference,
      name: catalogItem.name,
      connectionCount: catalogItem.connectionCount
    },
    usedBy
  );
  addQuantity(
    quantities,
    { kind: "protection", reference: catalogItem.manufacturerReference, name: catalogItem.name, origin: "catalogDefault" },
    1,
    usedBy
  );
  relationships.push({
    kind: "wire-protection-catalog-item",
    from: { networkId, wireId: wire.id },
    to: { catalogItemId: catalogItem.id }
  });
  return { ...protection, catalogItem };
}

export function buildSelectedHarnessAgentJsonFilename(harness: Pick<HarnessAssembly, "technicalId">, exportedAtIso: string): string {
  const technicalId = harness.technicalId.trim().replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "selected-harness";
  return `selected-harness-agent-${technicalId}-${toFilesystemSafeTimestamp(exportedAtIso)}.json`;
}

export function serializeSelectedHarnessAgentJsonPayload(payload: SelectedHarnessAgentJsonPayload): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}
