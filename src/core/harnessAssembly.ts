import type {
  Connector,
  ConnectorId,
  NetworkId
} from "./entities";

export interface NetworkConnectorLookup {
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
