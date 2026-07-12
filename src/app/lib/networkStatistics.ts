import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  Network,
  NetworkId,
  NetworkNode,
  Segment,
  SegmentId,
  Splice,
  Wire
} from "../../core/entities";
import { occupantsAt } from "../../core/connectorOccupancy";
import { resolveSplicePortMode } from "../../core/splicePortMode";
import { resolveWireMaterial } from "../../core/wireSizing";
import type { EntityState, NetworkScopedState } from "../../store";

export interface NetworkStatisticsSlice {
  network: Network;
  state: NetworkScopedState;
}

export interface NetworkStatisticsInput {
  slices: NetworkStatisticsSlice[];
}

export interface CountStatistics {
  connectors: number;
  splices: number;
  connectorNodes: number;
  spliceNodes: number;
  intermediateNodes: number;
  segments: number;
  wires: number;
  catalogItems: number;
}

export interface WireLengthStatistics {
  totalMm: number;
  averageMm: number | null;
  minMm: number | null;
  maxMm: number | null;
  medianMm: number | null;
  samplesMm: number[];
  includedWireCount: number;
  ignoredWireCount: number;
  routeLockedCount: number;
  routeLockedPercent: number | null;
  longestWires: Array<{
    networkId: NetworkId;
    wireId: Wire["id"];
    name: string;
    technicalId: string;
    lengthMm: number;
  }>;
}

export interface DistributionRow {
  key: string;
  label: string;
  count: number;
  totalLengthMm: number;
}

export interface ElectricalMetadataStatistics {
  wiresWithCurrentA: number;
  maxCurrentA: number | null;
  fuseProtectedWires: number;
}

export interface PinRoleStatistics {
  source: number;
  consumer: number;
  passive: number;
  bidirectional: number;
  connectorsWithDeclaredRoles: number;
}

export interface ConnectorUtilizationStatistics {
  totalWays: number;
  occupiedWays: number;
  occupancyPercent: number | null;
  /** Number of ways shared by 2+ wires (multi-wire crimp). */
  sharedWays: number;
  topUnusedConnectors: Array<{
    networkId: NetworkId;
    connectorId: ConnectorId;
    name: string;
    technicalId: string;
    unusedWays: number;
    totalWays: number;
  }>;
}

export interface SpliceUtilizationStatistics {
  finitePortCapacity: number;
  occupiedFinitePorts: number;
  finiteOccupancyPercent: number | null;
  unboundedSpliceCount: number;
  directionalSpliceCount: number;
}

export interface CatalogLinkageStatistics {
  linkedConnectors: number;
  unlinkedConnectors: number;
  linkedSplices: number;
  unlinkedSplices: number;
  manufacturerReferences: DistributionRow[];
}

export interface PerNetworkStatistics {
  networkId: NetworkId;
  networkName: string;
  networkTechnicalId: string;
  counts: CountStatistics;
  wireLengths: WireLengthStatistics;
  sectionDistribution: DistributionRow[];
  materialDistribution: DistributionRow[];
  colorDistribution: DistributionRow[];
  electricalMetadata: ElectricalMetadataStatistics;
  pinRoles: PinRoleStatistics;
  connectorUtilization: ConnectorUtilizationStatistics;
  spliceUtilization: SpliceUtilizationStatistics;
  catalogLinkage: CatalogLinkageStatistics;
}

export interface NetworkStatisticsResult {
  perNetwork: PerNetworkStatistics[];
  aggregate: PerNetworkStatistics;
}

interface LengthResolvedWire {
  networkId: NetworkId;
  wire: Wire;
  lengthMm: number | null;
}

function entityValues<T, Id extends string>(state: EntityState<T, Id>): T[] {
  return state.allIds.flatMap((id) => {
    const value = state.byId[id];
    return value === undefined ? [] : [value];
  });
}

function createEmptyCounts(): CountStatistics {
  return {
    connectors: 0,
    splices: 0,
    connectorNodes: 0,
    spliceNodes: 0,
    intermediateNodes: 0,
    segments: 0,
    wires: 0,
    catalogItems: 0
  };
}

function createEmptyPinRoles(): PinRoleStatistics {
  return {
    source: 0,
    consumer: 0,
    passive: 0,
    bidirectional: 0,
    connectorsWithDeclaredRoles: 0
  };
}

function positiveFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function stableCompareText(left: string, right: string): number {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

function resolveWirePhysicalLengthMm(wire: Wire, segmentById: ReadonlyMap<SegmentId, Segment>): number | null {
  if (positiveFinite(wire.lengthMm)) {
    return wire.lengthMm;
  }
  if (wire.routeSegmentIds.length === 0) {
    return null;
  }
  let total = 0;
  for (const segmentId of wire.routeSegmentIds) {
    const segment = segmentById.get(segmentId);
    if (segment === undefined || !positiveFinite(segment.lengthMm)) {
      return null;
    }
    total += segment.lengthMm;
  }
  return total > 0 ? total : null;
}

function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[middle] ?? null;
  }
  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

function incrementDistribution(
  rows: Map<string, DistributionRow>,
  key: string,
  label: string,
  lengthMm: number
): void {
  const existing = rows.get(key);
  if (existing === undefined) {
    rows.set(key, { key, label, count: 1, totalLengthMm: lengthMm });
    return;
  }
  existing.count += 1;
  existing.totalLengthMm += lengthMm;
}

function sortedDistribution(rows: Map<string, DistributionRow>): DistributionRow[] {
  return [...rows.values()].sort((left, right) => stableCompareText(left.label, right.label));
}

function colorLabelForWire(wire: Wire): string {
  const free = typeof wire.freeColorLabel === "string" ? wire.freeColorLabel.trim() : "";
  if (free.length > 0) {
    return free;
  }
  if (wire.primaryColorId !== null && wire.secondaryColorId !== null) {
    return `${wire.primaryColorId}/${wire.secondaryColorId}`;
  }
  if (wire.primaryColorId !== null) {
    return wire.primaryColorId;
  }
  return "Unspecified";
}

function buildCountStatistics(
  connectors: Connector[],
  splices: Splice[],
  nodes: NetworkNode[],
  segments: Segment[],
  wires: Wire[],
  catalogItems: CatalogItem[]
): CountStatistics {
  const counts = createEmptyCounts();
  counts.connectors = connectors.length;
  counts.splices = splices.length;
  counts.segments = segments.length;
  counts.wires = wires.length;
  counts.catalogItems = catalogItems.length;
  for (const node of nodes) {
    if (node.kind === "connector") {
      counts.connectorNodes += 1;
    } else if (node.kind === "splice") {
      counts.spliceNodes += 1;
    } else {
      counts.intermediateNodes += 1;
    }
  }
  return counts;
}

function buildWireLengthStatistics(resolvedWires: LengthResolvedWire[]): WireLengthStatistics {
  const lengths = resolvedWires.flatMap((entry) => (entry.lengthMm === null ? [] : [entry.lengthMm]));
  const totalMm = lengths.reduce((total, value) => total + value, 0);
  const includedWireCount = lengths.length;
  const routeLockedCount = resolvedWires.filter((entry) => entry.wire.isRouteLocked).length;
  const longestWires = resolvedWires
    .filter((entry): entry is LengthResolvedWire & { lengthMm: number } => entry.lengthMm !== null)
    .sort((left, right) => {
      if (right.lengthMm !== left.lengthMm) {
        return right.lengthMm - left.lengthMm;
      }
      return stableCompareText(left.wire.technicalId, right.wire.technicalId);
    })
    .slice(0, 10)
    .map((entry) => ({
      networkId: entry.networkId,
      wireId: entry.wire.id,
      name: entry.wire.name,
      technicalId: entry.wire.technicalId,
      lengthMm: entry.lengthMm
    }));

  return {
    totalMm,
    averageMm: includedWireCount === 0 ? null : totalMm / includedWireCount,
    minMm: includedWireCount === 0 ? null : Math.min(...lengths),
    maxMm: includedWireCount === 0 ? null : Math.max(...lengths),
    medianMm: median(lengths),
    samplesMm: lengths,
    includedWireCount,
    ignoredWireCount: resolvedWires.length - includedWireCount,
    routeLockedCount,
    routeLockedPercent: resolvedWires.length === 0 ? null : (routeLockedCount / resolvedWires.length) * 100,
    longestWires
  };
}

function buildWireDistributions(resolvedWires: LengthResolvedWire[]): {
  sectionDistribution: DistributionRow[];
  materialDistribution: DistributionRow[];
  colorDistribution: DistributionRow[];
} {
  const sections = new Map<string, DistributionRow>();
  const materials = new Map<string, DistributionRow>();
  const colors = new Map<string, DistributionRow>();
  for (const entry of resolvedWires) {
    const lengthMm = entry.lengthMm ?? 0;
    incrementDistribution(sections, String(entry.wire.sectionMm2), `${entry.wire.sectionMm2} mm²`, lengthMm);
    const material = entry.wire.material === undefined ? "unspecified" : resolveWireMaterial(entry.wire.material);
    incrementDistribution(materials, material, material === "unspecified" ? "Unspecified" : material, lengthMm);
    const color = colorLabelForWire(entry.wire);
    incrementDistribution(colors, color.toLowerCase(), color, lengthMm);
  }
  return {
    sectionDistribution: sortedDistribution(sections),
    materialDistribution: sortedDistribution(materials),
    colorDistribution: sortedDistribution(colors)
  };
}

function buildElectricalMetadata(wires: Wire[]): ElectricalMetadataStatistics {
  const currents = wires.flatMap((wire) =>
    typeof wire.currentA === "number" && Number.isFinite(wire.currentA) ? [wire.currentA] : []
  );
  return {
    wiresWithCurrentA: currents.length,
    maxCurrentA: currents.length === 0 ? null : Math.max(...currents),
    fuseProtectedWires: wires.filter((wire) => wire.protection?.kind === "fuse").length
  };
}

function buildPinRoleStatistics(connectors: Connector[], catalogItemsById: ReadonlyMap<CatalogItemId, CatalogItem>): PinRoleStatistics {
  const roles = createEmptyPinRoles();
  const connectorsWithDeclaredRoles = new Set<ConnectorId>();
  for (const connector of connectors) {
    const connectorRoleEntries = Object.values(connector.pinElectricalRoles ?? {});
    const catalogRoleEntries =
      connector.catalogItemId === undefined
        ? []
        : Object.values(catalogItemsById.get(connector.catalogItemId)?.connectorDefaults?.pinElectricalRoles ?? {});
    if (connectorRoleEntries.length > 0 || catalogRoleEntries.length > 0) {
      connectorsWithDeclaredRoles.add(connector.id);
    }
    for (const role of [...catalogRoleEntries, ...connectorRoleEntries]) {
      roles[role.role] += 1;
    }
  }
  roles.connectorsWithDeclaredRoles = connectorsWithDeclaredRoles.size;
  return roles;
}

function countOccupiedSlots(occupancy: Record<number, string> | undefined, max: number): number {
  if (occupancy === undefined) {
    return 0;
  }
  return Object.keys(occupancy).filter((key) => {
    const index = Number(key);
    return Number.isInteger(index) && index >= 1 && index <= max && occupancy[index] !== undefined;
  }).length;
}

function countConnectorWays(
  occupancy: Record<number, string[]> | undefined,
  max: number
): { occupied: number; shared: number } {
  if (occupancy === undefined) {
    return { occupied: 0, shared: 0 };
  }
  let occupied = 0;
  let shared = 0;
  for (const [key, rawOccupants] of Object.entries(occupancy)) {
    const index = Number(key);
    if (!Number.isInteger(index) || index < 1 || index > max) {
      continue;
    }
    const occupants = occupantsAt(rawOccupants);
    // A shared way (2+ wires crimped together) still occupies a single way.
    if (occupants.length > 0) {
      occupied += 1;
    }
    if (occupants.length > 1) {
      shared += 1;
    }
  }
  return { occupied, shared };
}

function buildConnectorUtilization(
  networkId: NetworkId,
  connectors: Connector[],
  occupancy: NetworkScopedState["connectorCavityOccupancy"]
): ConnectorUtilizationStatistics {
  const totalWays = connectors.reduce((total, connector) => total + connector.cavityCount, 0);
  const rows = connectors.map((connector) => {
    const { occupied, shared } = countConnectorWays(occupancy[connector.id], connector.cavityCount);
    return {
      networkId,
      connectorId: connector.id,
      name: connector.name,
      technicalId: connector.technicalId,
      unusedWays: Math.max(0, connector.cavityCount - occupied),
      totalWays: connector.cavityCount,
      occupied,
      shared
    };
  });
  const occupiedWays = rows.reduce((total, row) => total + row.occupied, 0);
  const sharedWays = rows.reduce((total, row) => total + row.shared, 0);
  return {
    totalWays,
    occupiedWays,
    sharedWays,
    occupancyPercent: totalWays === 0 ? null : (occupiedWays / totalWays) * 100,
    topUnusedConnectors: rows
      .filter((row) => row.unusedWays > 0)
      .sort((left, right) => {
        if (right.unusedWays !== left.unusedWays) {
          return right.unusedWays - left.unusedWays;
        }
        return stableCompareText(left.technicalId, right.technicalId);
      })
      .slice(0, 10)
      .map((row) => ({
        networkId: row.networkId,
        connectorId: row.connectorId,
        name: row.name,
        technicalId: row.technicalId,
        unusedWays: row.unusedWays,
        totalWays: row.totalWays
      }))
  };
}

function buildSpliceUtilization(
  splices: Splice[],
  occupancy: NetworkScopedState["splicePortOccupancy"]
): SpliceUtilizationStatistics {
  let finitePortCapacity = 0;
  let occupiedFinitePorts = 0;
  let unboundedSpliceCount = 0;
  let directionalSpliceCount = 0;
  for (const splice of splices) {
    const mode = resolveSplicePortMode(splice);
    if (mode === "unbounded") {
      unboundedSpliceCount += 1;
      continue;
    }
    if (mode === "directional") {
      directionalSpliceCount += 1;
    }
    finitePortCapacity += splice.portCount;
    occupiedFinitePorts += countOccupiedSlots(occupancy[splice.id], splice.portCount);
  }
  return {
    finitePortCapacity,
    occupiedFinitePorts,
    finiteOccupancyPercent: finitePortCapacity === 0 ? null : (occupiedFinitePorts / finitePortCapacity) * 100,
    unboundedSpliceCount,
    directionalSpliceCount
  };
}

function manufacturerReferenceFor(item: CatalogItem | undefined): string {
  const ref = item?.manufacturerReference.trim();
  return ref && ref.length > 0 ? ref : "Unspecified";
}

function buildCatalogLinkage(
  connectors: Connector[],
  splices: Splice[],
  catalogItemsById: ReadonlyMap<CatalogItemId, CatalogItem>
): CatalogLinkageStatistics {
  const references = new Map<string, DistributionRow>();
  let linkedConnectors = 0;
  let linkedSplices = 0;

  for (const connector of connectors) {
    if (connector.catalogItemId === undefined) {
      continue;
    }
    linkedConnectors += 1;
    const label = manufacturerReferenceFor(catalogItemsById.get(connector.catalogItemId));
    incrementDistribution(references, label.toLowerCase(), label, 0);
  }
  for (const splice of splices) {
    if (splice.catalogItemId === undefined) {
      continue;
    }
    linkedSplices += 1;
    const label = manufacturerReferenceFor(catalogItemsById.get(splice.catalogItemId));
    incrementDistribution(references, label.toLowerCase(), label, 0);
  }

  return {
    linkedConnectors,
    unlinkedConnectors: connectors.length - linkedConnectors,
    linkedSplices,
    unlinkedSplices: splices.length - linkedSplices,
    manufacturerReferences: sortedDistribution(references)
  };
}

function buildPerNetworkStatistics(slice: NetworkStatisticsSlice): PerNetworkStatistics {
  const connectors = entityValues(slice.state.connectors);
  const splices = entityValues(slice.state.splices);
  const nodes = entityValues(slice.state.nodes);
  const segments = entityValues(slice.state.segments);
  const wires = entityValues(slice.state.wires);
  const catalogItems = entityValues(slice.state.catalogItems);
  const segmentById = new Map(segments.map((segment) => [segment.id, segment]));
  const catalogItemsById = new Map(catalogItems.map((item) => [item.id, item]));
  const resolvedWires: LengthResolvedWire[] = wires.map((wire) => ({
    networkId: slice.network.id,
    wire,
    lengthMm: resolveWirePhysicalLengthMm(wire, segmentById)
  }));
  const distributions = buildWireDistributions(resolvedWires);

  return {
    networkId: slice.network.id,
    networkName: slice.network.name,
    networkTechnicalId: slice.network.technicalId,
    counts: buildCountStatistics(connectors, splices, nodes, segments, wires, catalogItems),
    wireLengths: buildWireLengthStatistics(resolvedWires),
    sectionDistribution: distributions.sectionDistribution,
    materialDistribution: distributions.materialDistribution,
    colorDistribution: distributions.colorDistribution,
    electricalMetadata: buildElectricalMetadata(wires),
    pinRoles: buildPinRoleStatistics(connectors, catalogItemsById),
    connectorUtilization: buildConnectorUtilization(slice.network.id, connectors, slice.state.connectorCavityOccupancy),
    spliceUtilization: buildSpliceUtilization(splices, slice.state.splicePortOccupancy),
    catalogLinkage: buildCatalogLinkage(connectors, splices, catalogItemsById)
  };
}

function mergeDistributions(distributions: DistributionRow[][]): DistributionRow[] {
  const merged = new Map<string, DistributionRow>();
  for (const rows of distributions) {
    for (const row of rows) {
      const existing = merged.get(row.key);
      if (existing === undefined) {
        merged.set(row.key, { ...row });
      } else {
        existing.count += row.count;
        existing.totalLengthMm += row.totalLengthMm;
      }
    }
  }
  return sortedDistribution(merged);
}

function mergeCounts(rows: PerNetworkStatistics[]): CountStatistics {
  return rows.reduce((counts, row) => ({
    connectors: counts.connectors + row.counts.connectors,
    splices: counts.splices + row.counts.splices,
    connectorNodes: counts.connectorNodes + row.counts.connectorNodes,
    spliceNodes: counts.spliceNodes + row.counts.spliceNodes,
    intermediateNodes: counts.intermediateNodes + row.counts.intermediateNodes,
    segments: counts.segments + row.counts.segments,
    wires: counts.wires + row.counts.wires,
    catalogItems: counts.catalogItems + row.counts.catalogItems
  }), createEmptyCounts());
}

function mergeWireLengths(rows: PerNetworkStatistics[]): WireLengthStatistics {
  const longestWires = rows.flatMap((row) => row.wireLengths.longestWires);
  const totalMm = rows.reduce((total, row) => total + row.wireLengths.totalMm, 0);
  const includedWireCount = rows.reduce((total, row) => total + row.wireLengths.includedWireCount, 0);
  const ignoredWireCount = rows.reduce((total, row) => total + row.wireLengths.ignoredWireCount, 0);
  const routeLockedCount = rows.reduce((total, row) => total + row.wireLengths.routeLockedCount, 0);
  const allLengths = rows.flatMap((row) => row.wireLengths.samplesMm);
  return {
    totalMm,
    averageMm: includedWireCount === 0 ? null : totalMm / includedWireCount,
    minMm: allLengths.length === 0 ? null : Math.min(...allLengths),
    maxMm: allLengths.length === 0 ? null : Math.max(...allLengths),
    medianMm: median(allLengths),
    samplesMm: allLengths,
    includedWireCount,
    ignoredWireCount,
    routeLockedCount,
    routeLockedPercent: includedWireCount + ignoredWireCount === 0 ? null : (routeLockedCount / (includedWireCount + ignoredWireCount)) * 100,
    longestWires: longestWires
      .sort((left, right) => {
        if (right.lengthMm !== left.lengthMm) {
          return right.lengthMm - left.lengthMm;
        }
        return stableCompareText(left.technicalId, right.technicalId);
      })
      .slice(0, 10)
  };
}

function mergeConnectorUtilization(rows: PerNetworkStatistics[]): ConnectorUtilizationStatistics {
  const totalWays = rows.reduce((total, row) => total + row.connectorUtilization.totalWays, 0);
  const occupiedWays = rows.reduce((total, row) => total + row.connectorUtilization.occupiedWays, 0);
  const sharedWays = rows.reduce((total, row) => total + row.connectorUtilization.sharedWays, 0);
  return {
    totalWays,
    occupiedWays,
    sharedWays,
    occupancyPercent: totalWays === 0 ? null : (occupiedWays / totalWays) * 100,
    topUnusedConnectors: rows
      .flatMap((row) => row.connectorUtilization.topUnusedConnectors)
      .sort((left, right) => {
        if (right.unusedWays !== left.unusedWays) {
          return right.unusedWays - left.unusedWays;
        }
        return stableCompareText(left.technicalId, right.technicalId);
      })
      .slice(0, 10)
  };
}

function mergeSpliceUtilization(rows: PerNetworkStatistics[]): SpliceUtilizationStatistics {
  const finitePortCapacity = rows.reduce((total, row) => total + row.spliceUtilization.finitePortCapacity, 0);
  const occupiedFinitePorts = rows.reduce((total, row) => total + row.spliceUtilization.occupiedFinitePorts, 0);
  return {
    finitePortCapacity,
    occupiedFinitePorts,
    finiteOccupancyPercent: finitePortCapacity === 0 ? null : (occupiedFinitePorts / finitePortCapacity) * 100,
    unboundedSpliceCount: rows.reduce((total, row) => total + row.spliceUtilization.unboundedSpliceCount, 0),
    directionalSpliceCount: rows.reduce((total, row) => total + row.spliceUtilization.directionalSpliceCount, 0)
  };
}

function mergeElectricalMetadata(rows: PerNetworkStatistics[]): ElectricalMetadataStatistics {
  const maxValues = rows.flatMap((row) => (row.electricalMetadata.maxCurrentA === null ? [] : [row.electricalMetadata.maxCurrentA]));
  return {
    wiresWithCurrentA: rows.reduce((total, row) => total + row.electricalMetadata.wiresWithCurrentA, 0),
    maxCurrentA: maxValues.length === 0 ? null : Math.max(...maxValues),
    fuseProtectedWires: rows.reduce((total, row) => total + row.electricalMetadata.fuseProtectedWires, 0)
  };
}

function mergePinRoles(rows: PerNetworkStatistics[]): PinRoleStatistics {
  return rows.reduce((total, row) => ({
    source: total.source + row.pinRoles.source,
    consumer: total.consumer + row.pinRoles.consumer,
    passive: total.passive + row.pinRoles.passive,
    bidirectional: total.bidirectional + row.pinRoles.bidirectional,
    connectorsWithDeclaredRoles: total.connectorsWithDeclaredRoles + row.pinRoles.connectorsWithDeclaredRoles
  }), createEmptyPinRoles());
}

function mergeCatalogLinkage(rows: PerNetworkStatistics[]): CatalogLinkageStatistics {
  return {
    linkedConnectors: rows.reduce((total, row) => total + row.catalogLinkage.linkedConnectors, 0),
    unlinkedConnectors: rows.reduce((total, row) => total + row.catalogLinkage.unlinkedConnectors, 0),
    linkedSplices: rows.reduce((total, row) => total + row.catalogLinkage.linkedSplices, 0),
    unlinkedSplices: rows.reduce((total, row) => total + row.catalogLinkage.unlinkedSplices, 0),
    manufacturerReferences: mergeDistributions(rows.map((row) => row.catalogLinkage.manufacturerReferences))
  };
}

function buildAggregateStatistics(rows: PerNetworkStatistics[]): PerNetworkStatistics {
  return {
    networkId: "aggregate" as NetworkId,
    networkName: "Aggregate",
    networkTechnicalId: "AGGREGATE",
    counts: mergeCounts(rows),
    wireLengths: mergeWireLengths(rows),
    sectionDistribution: mergeDistributions(rows.map((row) => row.sectionDistribution)),
    materialDistribution: mergeDistributions(rows.map((row) => row.materialDistribution)),
    colorDistribution: mergeDistributions(rows.map((row) => row.colorDistribution)),
    electricalMetadata: mergeElectricalMetadata(rows),
    pinRoles: mergePinRoles(rows),
    connectorUtilization: mergeConnectorUtilization(rows),
    spliceUtilization: mergeSpliceUtilization(rows),
    catalogLinkage: mergeCatalogLinkage(rows)
  };
}

export function calculateNetworkStatistics(input: NetworkStatisticsInput): NetworkStatisticsResult {
  const perNetwork = input.slices
    .map(buildPerNetworkStatistics)
    .sort((left, right) => {
      const byName = stableCompareText(left.networkName, right.networkName);
      return byName === 0 ? stableCompareText(left.networkTechnicalId, right.networkTechnicalId) : byName;
    });
  return {
    perNetwork,
    aggregate: buildAggregateStatistics(perNetwork)
  };
}
