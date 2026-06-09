import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  HarnessAssembly,
  Network,
  NetworkId,
  Wire
} from "../../core/entities";
import { aggregateAssembly, type AssemblyNetworkSlice } from "../../core/pinElectricalLoadAssembly";
import {
  buildHarnessAssemblyFunctionalSchematicGraph,
  FUNCTIONAL_FILTER_ALL,
  type HarnessFunctionalNetworkBundle,
  type FunctionalSchematicGraph
} from "../../core/functionalSchematic";
import type { BranchLoad, FuseProtectedLoadEntry } from "../../core/pinElectricalLoad";
import { resolveAmpacityA } from "../../core/wireAmpacity";
import { resolveWireMaterial } from "../../core/wireSizing";
import type { NetworkScopedState } from "../../store";
import {
  appendElectricalDimensioningIssues,
  ELECTRICAL_DIMENSIONING_CATEGORY
} from "../hook-impl/validation/appendElectricalDimensioningIssues";
import type { ValidationIssue } from "../types/app-controller";

export type MultiNetworkFunctionalAnalysisScope = "current" | "assembly" | "custom";
export type MultiNetworkFunctionalAnalysisSeverity = "error" | "warning" | "info";
export type MultiNetworkFunctionalAnalysisTarget = {
  networkId: NetworkId;
  subScreen: "connector" | "splice" | "node" | "segment" | "wire";
  selectionKind: "connector" | "splice" | "node" | "segment" | "wire";
  selectionId: string;
};

export interface MultiNetworkFunctionalAnalysisFinding {
  id: string;
  severity: MultiNetworkFunctionalAnalysisSeverity;
  family: "D1-D4" | "L1" | "Assembly";
  networkLabel: string;
  message: string;
  target?: MultiNetworkFunctionalAnalysisTarget;
}

export interface MultiNetworkFunctionalAnalysisNetworkOption {
  id: NetworkId;
  label: string;
  selected: boolean;
}

export interface MultiNetworkFunctionalAnalysisSchematic {
  nodeCount: number;
  edgeCount: number;
  warnings: string[];
}

export interface MultiNetworkFunctionalAnalysisModel {
  scope: MultiNetworkFunctionalAnalysisScope;
  activeAssemblyName: string | null;
  availableNetworkCount: number;
  selectedNetworkLabels: string[];
  networkOptions: MultiNetworkFunctionalAnalysisNetworkOption[];
  findings: MultiNetworkFunctionalAnalysisFinding[];
  schematic: MultiNetworkFunctionalAnalysisSchematic | null;
  summary: {
    errors: number;
    warnings: number;
    info: number;
    l1: number;
    skippedBridges: number;
    loops: number;
  };
}

export interface BuildMultiNetworkFunctionalAnalysisModelParams {
  activeNetworkId: NetworkId | null;
  networks: readonly Network[];
  harnessAssemblies: readonly HarnessAssembly[];
  networkStates: Record<NetworkId, NetworkScopedState>;
  currentNetworkState: NetworkScopedState | null;
  catalogItems: readonly CatalogItem[];
  scope: MultiNetworkFunctionalAnalysisScope;
  customNetworkIds?: readonly NetworkId[];
}

export function buildMultiNetworkFunctionalAnalysisModel({
  activeNetworkId,
  networks,
  harnessAssemblies,
  networkStates,
  currentNetworkState,
  catalogItems,
  scope,
  customNetworkIds = []
}: BuildMultiNetworkFunctionalAnalysisModelParams): MultiNetworkFunctionalAnalysisModel {
  const networkById = new Map(networks.map((network) => [network.id, network]));
  const activeAssembly = findActiveAssembly(activeNetworkId, harnessAssemblies);
  const catalogItemsById = buildCatalogItemsById(catalogItems, networkStates);
  const findings: MultiNetworkFunctionalAnalysisFinding[] = [];

  if ((scope === "assembly" || scope === "custom") && activeAssembly !== null) {
    const assemblyNetworkIds = activeAssembly.members
      .map((member) => member.networkId)
      .filter((networkId) => networkStates[networkId] !== undefined);
    const customSet = new Set(customNetworkIds);
    const selectedNetworkIds = scope === "custom"
      ? assemblyNetworkIds.filter((networkId) => customSet.has(networkId))
      : assemblyNetworkIds;
    const effectiveSelectedNetworkIds = selectedNetworkIds.length > 0 ? selectedNetworkIds : [activeNetworkId ?? assemblyNetworkIds[0]].filter(
      (networkId): networkId is NetworkId => networkId !== undefined && networkId !== null && assemblyNetworkIds.includes(networkId)
    );
    const slices: AssemblyNetworkSlice[] = effectiveSelectedNetworkIds.map((networkId) => {
      const scoped = networkStates[networkId]!;
      return {
        networkId,
        connectors: values(scoped.connectors),
        splices: values(scoped.splices),
        wires: values(scoped.wires)
      };
    });

    const aggregation = aggregateAssembly(activeAssembly, slices, effectiveSelectedNetworkIds, catalogItemsById);
    appendAssemblyDimensioningFindings(findings, aggregation, networkById, catalogItemsById);
    for (const entry of aggregation.l1Mismatches) {
      const sourceLabel = networkLabel(networkById.get(entry.sourceNetworkId), entry.sourceNetworkId);
      const targetLabel = networkLabel(networkById.get(entry.targetNetworkId), entry.targetNetworkId);
      const sourceConnectorLabel = connectorLabel(networkStates, entry.sourceNetworkId, entry.sourceConnectorId);
      const targetConnectorLabel = connectorLabel(networkStates, entry.targetNetworkId, entry.targetConnectorId);
      const linkLabel = entry.linkName?.trim() || `${sourceConnectorLabel} -> ${targetConnectorLabel}`;
      findings.push({
        id: `l1-${entry.linkId}-${entry.cavityIndex}`,
        severity: "warning",
        family: "L1",
        networkLabel: `${sourceLabel} -> ${targetLabel}`,
        message: `Link '${linkLabel}' cavity ${entry.cavityIndex}: ${sourceConnectorLabel} ${roleDescriptor(entry.sourceRole)} ↔ ${targetConnectorLabel} ${roleDescriptor(entry.targetRole)}; declarations conflict and aggregation uses max(${formatCurrent(entry.maxCurrentA)}).`,
        target: {
          networkId: entry.sourceNetworkId,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: entry.sourceConnectorId
        }
      });
    }
    for (const entry of aggregation.skippedBridges) {
      const linkLabel = assemblyLinkLabel(activeAssembly, networkStates, entry.linkId);
      findings.push({
        id: `assembly-skipped-${entry.linkId}`,
        severity: "info",
        family: "Assembly",
        networkLabel: activeAssembly.name,
        message: `Link '${linkLabel}' was not aggregated because one side is outside the selected assembly scope.`
      });
    }
    for (const warning of aggregation.load.warnings) {
      findings.push({
        id: `assembly-warning-${warning.code}-${findings.length}`,
        severity: "warning",
        family: "Assembly",
        networkLabel: activeAssembly.name,
        message: warning.message
      });
    }
    const selectedNetworkSet = new Set(effectiveSelectedNetworkIds);
    const schematic = buildAssemblySchematic(activeAssembly, networkById, networkStates, catalogItemsById, selectedNetworkSet);

    return summarize({
      scope,
      activeAssemblyName: activeAssembly.name,
      availableNetworkCount: assemblyNetworkIds.length,
      selectedNetworkLabels: effectiveSelectedNetworkIds.map((networkId) => networkLabel(networkById.get(networkId), networkId)),
      networkOptions: assemblyNetworkIds.map((networkId) => ({
        id: networkId,
        label: networkLabel(networkById.get(networkId), networkId),
        selected: selectedNetworkSet.has(networkId)
      })),
      findings,
      schematic
    });
  }

  if (currentNetworkState !== null) {
    appendScopedDimensioningFindings(
      findings,
      currentNetworkState,
      catalogItemsById,
      activeNetworkId === null ? null : networkById.get(activeNetworkId) ?? null
    );
  }

  return summarize({
    scope: "current",
    activeAssemblyName: activeAssembly?.name ?? null,
    availableNetworkCount: activeNetworkId === null ? 0 : 1,
    selectedNetworkLabels: activeNetworkId === null ? [] : [networkLabel(networkById.get(activeNetworkId), activeNetworkId)],
    networkOptions: activeNetworkId === null
      ? []
      : [{ id: activeNetworkId, label: networkLabel(networkById.get(activeNetworkId), activeNetworkId), selected: true }],
    findings,
    schematic: null
  });
}

function appendAssemblyDimensioningFindings(
  findings: MultiNetworkFunctionalAnalysisFinding[],
  aggregation: ReturnType<typeof aggregateAssembly>,
  networkById: ReadonlyMap<NetworkId, Network>,
  catalogItemsById: ReadonlyMap<CatalogItemId, CatalogItem>
): void {
  for (const [prefixedWireId, branch] of aggregation.load.branchLoadByWire) {
    const origin = aggregation.wireOriginByPrefixedId.get(prefixedWireId);
    if (origin === undefined) {
      continue;
    }
    appendAssemblyD1Finding(findings, origin.networkId, origin.wire, branch, networkById);
    appendAssemblyD4Finding(findings, origin.networkId, origin.wire, branch, networkById);
  }
  for (const [key, entry] of aggregation.load.fuseProtectedLoad) {
    appendAssemblyD2Finding(findings, key, entry, aggregation, networkById, catalogItemsById);
  }
  for (const [prefixedConnectorId, balance] of aggregation.load.deviceBalance) {
    const origin = aggregation.connectorOriginByPrefixedId.get(prefixedConnectorId);
    if (origin === undefined || balance.supplyPins.length === 0 || balance.totalSourceA === 0 || balance.totalConsumerA === 0) {
      continue;
    }
    if (balance.totalConsumerA >= balance.totalSourceA) {
      continue;
    }
    findings.push({
      id: `assembly-d3-${origin.networkId}-${origin.connector.id}`,
      severity: "warning",
      family: "D1-D4",
      networkLabel: networkLabel(networkById.get(origin.networkId), origin.networkId),
      message: `Assembly D3: supply pins on '${entityLabel(origin.connector)}' declared at ${balance.totalConsumerA.toFixed(1)} A are under-rated vs. selected-union output sum of ${balance.totalSourceA.toFixed(1)} A.`,
      target: {
        networkId: origin.networkId,
        subScreen: "connector",
        selectionKind: "connector",
        selectionId: origin.connector.id
      }
    });
  }
}

function appendAssemblyD1Finding(
  findings: MultiNetworkFunctionalAnalysisFinding[],
  networkId: NetworkId,
  wire: Wire,
  branch: BranchLoad,
  networkById: ReadonlyMap<NetworkId, Network>
): void {
  const manualCurrent = typeof wire.currentA === "number" && wire.currentA > 0 ? wire.currentA : 0;
  const effective = Math.max(branch.continuousA, manualCurrent);
  if (effective <= 0) {
    return;
  }
  const material = resolveWireMaterial(wire.material);
  const ampacity = resolveAmpacityA(wire.sectionMm2, material, networkById.get(networkId));
  if (ampacity === undefined) {
    return;
  }
  const ratio = effective / ampacity;
  if (ratio < 0.8) {
    return;
  }
  findings.push({
    id: `assembly-d1-${networkId}-${wire.id}`,
    severity: ratio > 1 ? "error" : "warning",
    family: "D1-D4",
    networkLabel: networkLabel(networkById.get(networkId), networkId),
    message: `Assembly D1: wire '${entityLabel(wire)}' carries ${effective.toFixed(1)} A in the selected union but its ${wire.sectionMm2} mm² ${material} section is rated for ${ampacity} A (ratio ${(ratio * 100).toFixed(0)}%).`,
    target: {
      networkId,
      subScreen: "wire",
      selectionKind: "wire",
      selectionId: wire.id
    }
  });
}

function appendAssemblyD2Finding(
  findings: MultiNetworkFunctionalAnalysisFinding[],
  key: string,
  entry: FuseProtectedLoadEntry,
  aggregation: ReturnType<typeof aggregateAssembly>,
  networkById: ReadonlyMap<NetworkId, Network>,
  catalogItemsById: ReadonlyMap<CatalogItemId, CatalogItem>
): void {
  if (entry.kind !== "wireFuse" || entry.continuousA <= 0) {
    return;
  }
  const prefixedWireId = key.slice("wireFuse:".length) as Wire["id"];
  const origin = aggregation.wireOriginByPrefixedId.get(prefixedWireId);
  if (origin === undefined || origin.wire.protection?.kind !== "fuse") {
    return;
  }
  const rating = extractFuseRatingA(catalogItemsById.get(origin.wire.protection.catalogItemId));
  if (rating === undefined) {
    findings.push({
      id: `assembly-d2-missing-${origin.networkId}-${origin.wire.id}`,
      severity: "warning",
      family: "D1-D4",
      networkLabel: networkLabel(networkById.get(origin.networkId), origin.networkId),
      message: `Assembly D2: wire '${entityLabel(origin.wire)}' is fuse-protected but the fuse rating is unknown while selected-union downstream load is ${entry.continuousA.toFixed(1)} A.`,
      target: { networkId: origin.networkId, subScreen: "wire", selectionKind: "wire", selectionId: origin.wire.id }
    });
    return;
  }
  if (entry.continuousA <= 0 || entry.continuousA / rating < 0.8) {
    return;
  }
  findings.push({
    id: `assembly-d2-${origin.networkId}-${origin.wire.id}`,
    severity: entry.continuousA > rating ? "error" : "warning",
    family: "D1-D4",
    networkLabel: networkLabel(networkById.get(origin.networkId), origin.networkId),
    message: `Assembly D2: fuse on wire '${entityLabel(origin.wire)}' is rated ${rating} A while selected-union downstream load is ${entry.continuousA.toFixed(1)} A.`,
    target: { networkId: origin.networkId, subScreen: "wire", selectionKind: "wire", selectionId: origin.wire.id }
  });
}

function appendAssemblyD4Finding(
  findings: MultiNetworkFunctionalAnalysisFinding[],
  networkId: NetworkId,
  wire: Wire,
  branch: BranchLoad,
  networkById: ReadonlyMap<NetworkId, Network>
): void {
  if (branch.sourceRefs.length < 2) {
    return;
  }
  findings.push({
    id: `assembly-d4-facing-sources-${networkId}-${wire.id}`,
    severity: "warning",
    family: "D1-D4",
    networkLabel: networkLabel(networkById.get(networkId), networkId),
    message: `Assembly D4: wire '${entityLabel(wire)}' is reached by ${branch.sourceRefs.length} declared sources in the selected union, suggesting a conflict.`,
    target: { networkId, subScreen: "wire", selectionKind: "wire", selectionId: wire.id }
  });
}

function buildAssemblySchematic(
  assembly: HarnessAssembly,
  networkById: ReadonlyMap<NetworkId, Network>,
  networkStates: Record<NetworkId, NetworkScopedState>,
  catalogItemsById: ReadonlyMap<CatalogItemId, CatalogItem>,
  selectedNetworkIds: ReadonlySet<NetworkId>
): MultiNetworkFunctionalAnalysisSchematic {
  const scopedAssembly: HarnessAssembly = {
    ...assembly,
    members: assembly.members.filter((member) => selectedNetworkIds.has(member.networkId)),
    masterConnectorRefs: assembly.masterConnectorRefs.filter((ref) => selectedNetworkIds.has(ref.networkId)),
    connectorLinks: assembly.connectorLinks.filter(
      (link) => selectedNetworkIds.has(link.sourceNetworkId) && selectedNetworkIds.has(link.targetNetworkId)
    )
  };
  const networksById = new Map<NetworkId, HarnessFunctionalNetworkBundle>();
  for (const networkId of selectedNetworkIds) {
    const scoped = networkStates[networkId];
    const network = networkById.get(networkId);
    if (scoped === undefined || network === undefined) {
      continue;
    }
    networksById.set(networkId, {
      network,
      wires: values(scoped.wires),
      segments: values(scoped.segments),
      connectorMap: new Map(values(scoped.connectors).map((connector) => [connector.id, connector] as const)),
      spliceMap: new Map(values(scoped.splices).map((splice) => [splice.id, splice] as const)),
      catalogItemMap: new Map([...catalogItemsById])
    });
  }
  const graph: FunctionalSchematicGraph = buildHarnessAssemblyFunctionalSchematicGraph({
    assembly: scopedAssembly,
    networksById,
    activeFilter: FUNCTIONAL_FILTER_ALL,
    rootConnectorRefs: scopedAssembly.masterConnectorRefs
  });
  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    warnings: graph.warnings.map((warning) => warning.message)
  };
}

function extractFuseRatingA(catalogItem: CatalogItem | undefined): number | undefined {
  if (!catalogItem) {
    return undefined;
  }
  const match = /(\d+(?:\.\d+)?)\s*A/i.exec(catalogItem.manufacturerReference);
  if (match?.[1] === undefined) {
    return undefined;
  }
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function appendScopedDimensioningFindings(
  findings: MultiNetworkFunctionalAnalysisFinding[],
  scoped: NetworkScopedState,
  catalogItemsById: ReadonlyMap<CatalogItemId, CatalogItem>,
  network: Network | null
): void {
  const issues: ValidationIssue[] = [];
  appendElectricalDimensioningIssues(issues, {
    connectors: values(scoped.connectors),
    splices: values(scoped.splices),
    wires: values(scoped.wires),
    catalogItems: [...catalogItemsById.values()],
    network
  });
  for (const issue of issues) {
    if (issue.category !== ELECTRICAL_DIMENSIONING_CATEGORY) {
      continue;
    }
    findings.push({
      id: `${network?.id ?? "current"}-${issue.id}`,
      severity: issue.severity,
      family: "D1-D4",
      networkLabel: networkLabel(network, network?.id ?? null),
      message: issue.message,
      target: network === null ? undefined : navigationTargetFromIssue(network.id, issue)
    });
  }
}

function navigationTargetFromIssue(
  networkId: NetworkId,
  issue: ValidationIssue
): MultiNetworkFunctionalAnalysisTarget | undefined {
  if (issue.selectionKind === "catalog" || issue.subScreen === "catalog") {
    return undefined;
  }
  return {
    networkId,
    subScreen: issue.subScreen,
    selectionKind: issue.selectionKind,
    selectionId: issue.selectionId
  };
}

function summarize(
  input: Omit<MultiNetworkFunctionalAnalysisModel, "summary">
): MultiNetworkFunctionalAnalysisModel {
  let errors = 0;
  let warnings = 0;
  let info = 0;
  let l1 = 0;
  let skippedBridges = 0;
  let loops = 0;
  for (const finding of input.findings) {
    if (finding.severity === "error") {
      errors += 1;
    } else if (finding.severity === "warning") {
      warnings += 1;
    } else {
      info += 1;
    }
    if (finding.family === "L1") {
      l1 += 1;
    }
    if (finding.id.startsWith("assembly-skipped-")) {
      skippedBridges += 1;
    }
    if (finding.id.startsWith("assembly-warning-loop-")) {
      loops += 1;
    }
  }
  return {
    ...input,
    summary: {
      errors,
      warnings,
      info,
      l1,
      skippedBridges,
      loops
    }
  };
}

function findActiveAssembly(
  activeNetworkId: NetworkId | null,
  harnessAssemblies: readonly HarnessAssembly[]
): HarnessAssembly | null {
  if (activeNetworkId === null) {
    return harnessAssemblies[0] ?? null;
  }
  return harnessAssemblies.find((assembly) =>
    assembly.members.some((member) => member.networkId === activeNetworkId)
  ) ?? null;
}

function buildCatalogItemsById(
  catalogItems: readonly CatalogItem[],
  networkStates: Record<NetworkId, NetworkScopedState>
): Map<CatalogItemId, CatalogItem> {
  const catalogItemsById = new Map<CatalogItemId, CatalogItem>();
  for (const item of catalogItems) {
    catalogItemsById.set(item.id, item);
  }
  for (const scoped of Object.values(networkStates)) {
    for (const item of values(scoped.catalogItems)) {
      catalogItemsById.set(item.id, item);
    }
  }
  return catalogItemsById;
}

function values<T, Id extends string>(state: { byId: Record<Id, T>; allIds: Id[] }): T[] {
  return state.allIds.map((id) => state.byId[id]).filter((item): item is T => item !== undefined);
}

function networkLabel(network: Network | null | undefined, fallbackId: NetworkId | null): string {
  if (network === null || network === undefined) {
    return fallbackId ?? "Current network";
  }
  return `${network.name} (${network.technicalId})`;
}

function entityLabel(entity: { name: string; technicalId: string }): string {
  return `${entity.name} (${entity.technicalId})`;
}

function connectorLabel(
  networkStates: Record<NetworkId, NetworkScopedState>,
  networkId: NetworkId,
  connectorId: Connector["id"]
): string {
  const connector = networkStates[networkId]?.connectors.byId[connectorId];
  return connector === undefined ? String(connectorId) : entityLabel(connector);
}

function assemblyLinkLabel(
  assembly: HarnessAssembly,
  networkStates: Record<NetworkId, NetworkScopedState>,
  linkId: string
): string {
  const directLink = assembly.connectorLinks.find((link) => link.id === linkId);
  if (directLink !== undefined) {
    return directLink.name?.trim()
      || `${connectorLabel(networkStates, directLink.sourceNetworkId, directLink.sourceConnectorId)} -> ${connectorLabel(networkStates, directLink.targetNetworkId, directLink.targetConnectorId)}`;
  }
  const masterMatch = /^master:(.+):([^:]+):([^:]+)$/.exec(linkId);
  if (masterMatch?.[1] === undefined || masterMatch[2] === undefined || masterMatch[3] === undefined) {
    return linkId;
  }
  return `Master ${connectorLabel(networkStates, masterMatch[2] as NetworkId, masterMatch[1] as Connector["id"])}`;
}

function roleDescriptor(role: { role: string; currentA?: number }): string {
  return typeof role.currentA === "number" ? `${role.role} ${role.currentA} A` : role.role;
}

function formatCurrent(value: number | undefined): string {
  return typeof value === "number" ? `${value} A` : "unknown A";
}
