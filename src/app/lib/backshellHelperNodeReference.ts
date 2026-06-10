import type { Connector, ConnectorId, NetworkNode } from "../../core/entities";

type BackshellHelperNode = Extract<NetworkNode, { kind: "connectorBackshellHelper" }>;

export function normalizeOptionalNodeLabel(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : undefined;
}

export function resolveBackshellHelperNodeReference(
  node: BackshellHelperNode,
  connectorMap: ReadonlyMap<ConnectorId, Connector>
): string {
  const explicitLabel = normalizeOptionalNodeLabel(node.label);
  if (explicitLabel !== undefined) {
    return explicitLabel;
  }

  const normalizedNodeId = node.id.trim();
  if (normalizedNodeId.length > 0) {
    return normalizedNodeId;
  }

  return `${connectorMap.get(node.connectorId)?.technicalId ?? node.connectorId}-BS`;
}
