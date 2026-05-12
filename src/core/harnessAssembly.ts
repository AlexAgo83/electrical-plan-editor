import type {
  Connector,
  ConnectorId,
  HarnessAssembly,
  InterHarnessConnectorLink,
  Network,
  NetworkId
} from "./entities";

export type HarnessAssemblyValidationSeverity = "error" | "warning";

export type HarnessAssemblyValidationKind =
  | "missing-network"
  | "missing-connector"
  | "connector-self-link"
  | "connector-duplicate-link"
  | "mismatched-pin-count";

export interface HarnessAssemblyValidationIssue {
  severity: HarnessAssemblyValidationSeverity;
  kind: HarnessAssemblyValidationKind;
  message: string;
  assemblyId: HarnessAssembly["id"];
  linkId?: InterHarnessConnectorLink["id"];
  networkId?: NetworkId;
  connectorId?: ConnectorId;
}

export interface NetworkConnectorLookup {
  networks: ReadonlyMap<NetworkId, Network>;
  connectorsByNetworkId: ReadonlyMap<NetworkId, ReadonlyMap<ConnectorId, Connector>>;
}

export const DEFAULT_HARNESS_ASSEMBLY_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ca8a04",
  "#0891b2",
  "#db2777",
  "#4f46e5"
] as const;

export function resolveDefaultHarnessColor(index: number): string {
  return DEFAULT_HARNESS_ASSEMBLY_COLORS[index % DEFAULT_HARNESS_ASSEMBLY_COLORS.length] ?? "#2563eb";
}

export function getConnectorFromNetwork(
  lookup: NetworkConnectorLookup,
  networkId: NetworkId,
  connectorId: ConnectorId
): Connector | undefined {
  return lookup.connectorsByNetworkId.get(networkId)?.get(connectorId);
}

export function getSymmetricSharedPinCount(left: Connector, right: Connector): number {
  return Math.max(0, Math.min(left.cavityCount, right.cavityCount));
}

export function validateHarnessAssembly(
  assembly: HarnessAssembly,
  lookup: NetworkConnectorLookup
): HarnessAssemblyValidationIssue[] {
  const issues: HarnessAssemblyValidationIssue[] = [];
  const knownNetworkIds = new Set(lookup.networks.keys());
  const linkedConnectorKeys = new Map<string, InterHarnessConnectorLink["id"]>();

  for (const member of assembly.members) {
    if (!knownNetworkIds.has(member.networkId)) {
      issues.push({
        severity: "error",
        kind: "missing-network",
        message: `Harness assembly '${assembly.technicalId}' references missing network '${member.networkId}'.`,
        assemblyId: assembly.id,
        networkId: member.networkId
      });
    }
  }

  for (const root of assembly.masterConnectorRefs) {
    if (!knownNetworkIds.has(root.networkId)) {
      issues.push({
        severity: "error",
        kind: "missing-network",
        message: `Master connector '${root.connectorId}' references missing network '${root.networkId}'.`,
        assemblyId: assembly.id,
        networkId: root.networkId,
        connectorId: root.connectorId
      });
      continue;
    }
    if (getConnectorFromNetwork(lookup, root.networkId, root.connectorId) === undefined) {
      issues.push({
        severity: "error",
        kind: "missing-connector",
        message: `Master connector '${root.connectorId}' is missing from network '${root.networkId}'.`,
        assemblyId: assembly.id,
        networkId: root.networkId,
        connectorId: root.connectorId
      });
    }
  }

  for (const link of assembly.connectorLinks) {
    const endpoints = [
      { networkId: link.sourceNetworkId, connectorId: link.sourceConnectorId },
      { networkId: link.targetNetworkId, connectorId: link.targetConnectorId }
    ];

    if (link.sourceNetworkId === link.targetNetworkId && link.sourceConnectorId === link.targetConnectorId) {
      issues.push({
        severity: "error",
        kind: "connector-self-link",
        message: `Interconnector link '${link.id}' cannot connect a connector to itself.`,
        assemblyId: assembly.id,
        linkId: link.id,
        networkId: link.sourceNetworkId,
        connectorId: link.sourceConnectorId
      });
    }

    const resolvedConnectors: Connector[] = [];
    for (const endpoint of endpoints) {
      if (!knownNetworkIds.has(endpoint.networkId)) {
        issues.push({
          severity: "error",
          kind: "missing-network",
          message: `Interconnector link '${link.id}' references missing network '${endpoint.networkId}'.`,
          assemblyId: assembly.id,
          linkId: link.id,
          networkId: endpoint.networkId,
          connectorId: endpoint.connectorId
        });
        continue;
      }

      const connector = getConnectorFromNetwork(lookup, endpoint.networkId, endpoint.connectorId);
      if (connector === undefined) {
        issues.push({
          severity: "error",
          kind: "missing-connector",
          message: `Interconnector link '${link.id}' references missing connector '${endpoint.connectorId}'.`,
          assemblyId: assembly.id,
          linkId: link.id,
          networkId: endpoint.networkId,
          connectorId: endpoint.connectorId
        });
        continue;
      }
      resolvedConnectors.push(connector);

      const connectorKey = `${endpoint.networkId}:${endpoint.connectorId}`;
      const existingLinkId = linkedConnectorKeys.get(connectorKey);
      if (existingLinkId !== undefined && existingLinkId !== link.id) {
        issues.push({
          severity: "error",
          kind: "connector-duplicate-link",
          message: `Connector '${endpoint.connectorId}' is already used by interconnector link '${existingLinkId}'.`,
          assemblyId: assembly.id,
          linkId: link.id,
          networkId: endpoint.networkId,
          connectorId: endpoint.connectorId
        });
      } else {
        linkedConnectorKeys.set(connectorKey, link.id);
      }
    }

    if (resolvedConnectors.length === 2 && resolvedConnectors[0]!.cavityCount !== resolvedConnectors[1]!.cavityCount) {
      issues.push({
        severity: "warning",
        kind: "mismatched-pin-count",
        message: `Interconnector link '${link.id}' has mismatched pin counts; only shared symmetric pins can be traced.`,
        assemblyId: assembly.id,
        linkId: link.id
      });
    }
  }

  return issues;
}
