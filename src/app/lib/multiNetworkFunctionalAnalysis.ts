import type {
  CatalogItem,
  CatalogItemId,
  HarnessAssembly,
  Network,
  NetworkId
} from "../../core/entities";
import { aggregateAssembly, type AssemblyNetworkSlice } from "../../core/pinElectricalLoadAssembly";
import type { NetworkScopedState } from "../../store";
import {
  appendElectricalDimensioningIssues,
  ELECTRICAL_DIMENSIONING_CATEGORY
} from "../hook-impl/validation/appendElectricalDimensioningIssues";
import type { ValidationIssue } from "../types/app-controller";

export type MultiNetworkFunctionalAnalysisScope = "current" | "assembly";
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

export interface MultiNetworkFunctionalAnalysisModel {
  scope: MultiNetworkFunctionalAnalysisScope;
  activeAssemblyName: string | null;
  availableNetworkCount: number;
  selectedNetworkLabels: string[];
  findings: MultiNetworkFunctionalAnalysisFinding[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    l1: number;
    skippedBridges: number;
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
}

export function buildMultiNetworkFunctionalAnalysisModel({
  activeNetworkId,
  networks,
  harnessAssemblies,
  networkStates,
  currentNetworkState,
  catalogItems,
  scope
}: BuildMultiNetworkFunctionalAnalysisModelParams): MultiNetworkFunctionalAnalysisModel {
  const networkById = new Map(networks.map((network) => [network.id, network]));
  const activeAssembly = findActiveAssembly(activeNetworkId, harnessAssemblies);
  const catalogItemsById = buildCatalogItemsById(catalogItems, networkStates);
  const findings: MultiNetworkFunctionalAnalysisFinding[] = [];

  if (scope === "assembly" && activeAssembly !== null) {
    const selectedNetworkIds = activeAssembly.members
      .map((member) => member.networkId)
      .filter((networkId) => networkStates[networkId] !== undefined);
    const slices: AssemblyNetworkSlice[] = selectedNetworkIds.map((networkId) => {
      const scoped = networkStates[networkId]!;
      return {
        networkId,
        connectors: values(scoped.connectors),
        splices: values(scoped.splices),
        wires: values(scoped.wires)
      };
    });

    for (const networkId of selectedNetworkIds) {
      const scoped = networkStates[networkId]!;
      appendScopedDimensioningFindings(findings, scoped, catalogItemsById, networkById.get(networkId) ?? null);
    }

    const aggregation = aggregateAssembly(activeAssembly, slices, selectedNetworkIds, catalogItemsById);
    for (const entry of aggregation.l1Mismatches) {
      const sourceLabel = networkLabel(networkById.get(entry.sourceNetworkId), entry.sourceNetworkId);
      const targetLabel = networkLabel(networkById.get(entry.targetNetworkId), entry.targetNetworkId);
      findings.push({
        id: `l1-${entry.linkId}-${entry.cavityIndex}`,
        severity: "warning",
        family: "L1",
        networkLabel: `${sourceLabel} -> ${targetLabel}`,
        message: entry.message,
        target: {
          networkId: entry.sourceNetworkId,
          subScreen: "connector",
          selectionKind: "connector",
          selectionId: entry.sourceConnectorId
        }
      });
    }
    for (const entry of aggregation.skippedBridges) {
      findings.push({
        id: `assembly-skipped-${entry.linkId}`,
        severity: "info",
        family: "Assembly",
        networkLabel: activeAssembly.name,
        message: `Link '${entry.linkId}' was not aggregated because one side is outside the selected assembly scope.`
      });
    }

    return summarize({
      scope,
      activeAssemblyName: activeAssembly.name,
      availableNetworkCount: selectedNetworkIds.length,
      selectedNetworkLabels: selectedNetworkIds.map((networkId) => networkLabel(networkById.get(networkId), networkId)),
      findings
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
    findings
  });
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
      target: network === null ? undefined : {
        networkId: network.id,
        subScreen: issue.subScreen,
        selectionKind: issue.selectionKind,
        selectionId: issue.selectionId
      }
    });
  }
}

function summarize(
  input: Omit<MultiNetworkFunctionalAnalysisModel, "summary">
): MultiNetworkFunctionalAnalysisModel {
  let errors = 0;
  let warnings = 0;
  let info = 0;
  let l1 = 0;
  let skippedBridges = 0;
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
  }
  return {
    ...input,
    summary: {
      errors,
      warnings,
      info,
      l1,
      skippedBridges
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
  return network?.name ?? fallbackId ?? "Current network";
}
