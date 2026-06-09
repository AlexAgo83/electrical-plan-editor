import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  HarnessAssembly,
  InterHarnessConnectorLink,
  NetworkId,
  PinElectricalRole,
  Splice,
  Wire,
  WireId
} from "./entities";
import {
  computePinElectricalLoad,
  type PinElectricalLoadInput,
  type PinElectricalLoadResult
} from "./pinElectricalLoad";
import { resolvePinElectricalRole } from "./pinElectricalRole";

export interface AssemblyNetworkSlice {
  networkId: NetworkId;
  connectors: Connector[];
  splices: Splice[];
  wires: Wire[];
}

export interface L1LinkMismatchEntry {
  linkId: InterHarnessConnectorLink["id"];
  linkName?: string;
  cavityIndex: number;
  sourceNetworkId: NetworkId;
  sourceConnectorId: ConnectorId;
  sourceRole: PinElectricalRole;
  targetNetworkId: NetworkId;
  targetConnectorId: ConnectorId;
  targetRole: PinElectricalRole;
  maxCurrentA?: number;
}

export interface SkippedBridgeEntry {
  linkId: InterHarnessConnectorLink["id"];
  reason: "far-end-out-of-scope";
}

export interface AssemblyAggregationResult {
  load: PinElectricalLoadResult;
  l1Mismatches: L1LinkMismatchEntry[];
  skippedBridges: SkippedBridgeEntry[];
  wireOriginByPrefixedId: Map<WireId, { networkId: NetworkId; wire: Wire }>;
  connectorOriginByPrefixedId: Map<ConnectorId, { networkId: NetworkId; connector: Connector }>;
}

function isIncompatible(a: PinElectricalRole, b: PinElectricalRole): boolean {
  if (a.role === "bidirectional" || b.role === "bidirectional") {
    return false;
  }
  if (a.role === "passive" || b.role === "passive") {
    return false;
  }
  if (a.role === b.role) {
    return true; // source ↔ source, consumer ↔ consumer
  }
  if (typeof a.currentA === "number" && typeof b.currentA === "number") {
    return a.currentA !== b.currentA;
  }
  return false;
}

function maxDeclaredCurrent(a: PinElectricalRole, b: PinElectricalRole): number | undefined {
  if (typeof a.currentA === "number" && typeof b.currentA === "number") {
    return Math.max(a.currentA, b.currentA);
  }
  return a.currentA ?? b.currentA;
}

interface PrefixedIds {
  prefixedConnectorId: (id: ConnectorId) => ConnectorId;
  prefixedWireId: (id: WireId) => WireId;
}

function makePrefix(networkId: NetworkId): PrefixedIds {
  const prefix = `${networkId}::`;
  return {
    prefixedConnectorId: (id) => (`${prefix}${id}`) as ConnectorId,
    prefixedWireId: (id) => (`${prefix}${id}`) as WireId
  };
}

function prefixConnector(connector: Connector, ids: PrefixedIds): Connector {
  return { ...connector, id: ids.prefixedConnectorId(connector.id) };
}

function prefixWire(wire: Wire, networkConnectorIds: Set<ConnectorId>, ids: PrefixedIds): Wire {
  const remapEndpoint = (endpoint: Wire["endpointA"]): Wire["endpointA"] => {
    if (endpoint.kind === "connectorCavity" && networkConnectorIds.has(endpoint.connectorId)) {
      return { ...endpoint, connectorId: ids.prefixedConnectorId(endpoint.connectorId) };
    }
    return endpoint;
  };
  return {
    ...wire,
    id: ids.prefixedWireId(wire.id),
    endpointA: remapEndpoint(wire.endpointA),
    endpointB: remapEndpoint(wire.endpointB)
  };
}

export function aggregateAssembly(
  assembly: HarnessAssembly,
  slices: AssemblyNetworkSlice[],
  selectedNetworkIds: NetworkId[],
  catalogItemsById: ReadonlyMap<CatalogItemId, CatalogItem>
): AssemblyAggregationResult {
  const selectedSet = new Set(selectedNetworkIds);
  const selectedSlices = slices.filter((s) => selectedSet.has(s.networkId));

  // Prefix every connector and wire by its network ID so the union graph is unambiguous.
  const mergedConnectors: Connector[] = [];
  const mergedSplices: Splice[] = [];
  const mergedWires: Wire[] = [];

  const connectorOriginByPrefixedId = new Map<
    ConnectorId,
    { networkId: NetworkId; connector: Connector }
  >();
  const wireOriginByPrefixedId = new Map<WireId, { networkId: NetworkId; wire: Wire }>();

  for (const slice of selectedSlices) {
    const ids = makePrefix(slice.networkId);
    const sliceConnectorIds = new Set(slice.connectors.map((c) => c.id));
    for (const connector of slice.connectors) {
      const prefixed = prefixConnector(connector, ids);
      mergedConnectors.push(prefixed);
      connectorOriginByPrefixedId.set(prefixed.id, { networkId: slice.networkId, connector });
    }
    mergedSplices.push(...slice.splices); // splice IDs already unique by branding; safe enough
    for (const wire of slice.wires) {
      const prefixed = prefixWire(wire, sliceConnectorIds, ids);
      mergedWires.push(prefixed);
      wireOriginByPrefixedId.set(prefixed.id, { networkId: slice.networkId, wire });
    }
  }

  const l1Mismatches: L1LinkMismatchEntry[] = [];
  const skippedBridges: SkippedBridgeEntry[] = [];

  const bridgeLinks: InterHarnessConnectorLink[] = [...assembly.connectorLinks, ...buildMasterConnectorBridgeLinks(assembly)];

  // For each connector link in the assembly, evaluate L1 + add bridge wires between the
  // two prefixed connectors at matching cavities.
  for (const link of bridgeLinks) {
    if (!selectedSet.has(link.sourceNetworkId) || !selectedSet.has(link.targetNetworkId)) {
      skippedBridges.push({ linkId: link.id, reason: "far-end-out-of-scope" });
      continue;
    }
    const sourceSlice = selectedSlices.find((s) => s.networkId === link.sourceNetworkId);
    const targetSlice = selectedSlices.find((s) => s.networkId === link.targetNetworkId);
    if (!sourceSlice || !targetSlice) {
      skippedBridges.push({ linkId: link.id, reason: "far-end-out-of-scope" });
      continue;
    }
    const sourceConnector = sourceSlice.connectors.find((c) => c.id === link.sourceConnectorId);
    const targetConnector = targetSlice.connectors.find((c) => c.id === link.targetConnectorId);
    if (!sourceConnector || !targetConnector) {
      skippedBridges.push({ linkId: link.id, reason: "far-end-out-of-scope" });
      continue;
    }
    const sourceCatalog = sourceConnector.catalogItemId
      ? catalogItemsById.get(sourceConnector.catalogItemId)
      : undefined;
    const targetCatalog = targetConnector.catalogItemId
      ? catalogItemsById.get(targetConnector.catalogItemId)
      : undefined;

    const sourceIds = makePrefix(link.sourceNetworkId);
    const targetIds = makePrefix(link.targetNetworkId);

    const sharedCavities = Math.min(sourceConnector.cavityCount, targetConnector.cavityCount);
    for (let cavityIndex = 1; cavityIndex <= sharedCavities; cavityIndex += 1) {
      const sourceRole = resolvePinElectricalRole(sourceConnector, sourceCatalog, cavityIndex);
      const targetRole = resolvePinElectricalRole(targetConnector, targetCatalog, cavityIndex);
      if (isIncompatible(sourceRole, targetRole)) {
        l1Mismatches.push({
          linkId: link.id,
          linkName: link.name,
          cavityIndex,
          sourceNetworkId: link.sourceNetworkId,
          sourceConnectorId: link.sourceConnectorId,
          sourceRole,
          targetNetworkId: link.targetNetworkId,
          targetConnectorId: link.targetConnectorId,
          targetRole,
          maxCurrentA: maxDeclaredCurrent(sourceRole, targetRole)
        });
      }

      // Add a synthetic bridge wire between the two prefixed connectors at this cavity.
      const bridgeWire: Wire = {
        id: (`bridge:${link.id}:${cavityIndex}`) as WireId,
        name: `bridge ${link.id} cavity ${cavityIndex}`,
        technicalId: `bridge-${link.id}-${cavityIndex}`,
        sectionMm2: 0.0001,
        primaryColorId: null,
        secondaryColorId: null,
        endpointA: {
          kind: "connectorCavity",
          connectorId: sourceIds.prefixedConnectorId(sourceConnector.id),
          cavityIndex
        },
        endpointB: {
          kind: "connectorCavity",
          connectorId: targetIds.prefixedConnectorId(targetConnector.id),
          cavityIndex
        },
        routeSegmentIds: [],
        lengthMm: 0,
        isRouteLocked: false
      };
      mergedWires.push(bridgeWire);

      // For L1 mismatches, override the prefixed connector's pin role with the resolved max
      // current so downstream propagation uses the conservative value.
      if (isIncompatible(sourceRole, targetRole)) {
        const maxA = maxDeclaredCurrent(sourceRole, targetRole);
        for (const merged of mergedConnectors) {
          if (
            merged.id === sourceIds.prefixedConnectorId(sourceConnector.id) ||
            merged.id === targetIds.prefixedConnectorId(targetConnector.id)
          ) {
            if (!merged.pinElectricalRoles) {
              merged.pinElectricalRoles = {};
            }
            const existing = merged.pinElectricalRoles[cavityIndex];
            if (existing && typeof maxA === "number") {
              merged.pinElectricalRoles[cavityIndex] = { ...existing, currentA: maxA };
            }
          }
        }
      }
    }
  }

  const input: PinElectricalLoadInput = {
    connectors: mergedConnectors,
    splices: mergedSplices,
    wires: mergedWires,
    catalogItemsById
  };
  const load = computePinElectricalLoad(input);
  return { load, l1Mismatches, skippedBridges, wireOriginByPrefixedId, connectorOriginByPrefixedId };
}

function buildMasterConnectorBridgeLinks(assembly: HarnessAssembly): InterHarnessConnectorLink[] {
  const refsByConnectorId = new Map<ConnectorId, Array<{ networkId: NetworkId; connectorId: ConnectorId }>>();
  for (const ref of assembly.masterConnectorRefs) {
    const refs = refsByConnectorId.get(ref.connectorId) ?? [];
    refs.push(ref);
    refsByConnectorId.set(ref.connectorId, refs);
  }
  const links: InterHarnessConnectorLink[] = [];
  for (const [connectorId, refs] of refsByConnectorId) {
    const sortedRefs = [...refs].sort((left, right) => String(left.networkId).localeCompare(String(right.networkId)));
    for (let index = 1; index < sortedRefs.length; index += 1) {
      const previous = sortedRefs[index - 1]!;
      const current = sortedRefs[index]!;
      links.push({
        id: `master:${connectorId}:${previous.networkId}:${current.networkId}` as InterHarnessConnectorLink["id"],
        name: `Master ${connectorId}`,
        sourceNetworkId: previous.networkId,
        sourceConnectorId: previous.connectorId,
        targetNetworkId: current.networkId,
        targetConnectorId: current.connectorId
      });
    }
  }
  return links;
}
