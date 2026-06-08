import type {
  CatalogItem,
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId
} from "./entities";

export interface EffectiveRearBackshellConfig {
  enabled: true;
  lengthMm: number;
}

export function getEffectiveRearBackshellConfig(
  connector: Connector,
  catalogItem: Pick<CatalogItem, "connectorDefaults"> | undefined
): EffectiveRearBackshellConfig | undefined {
  const catalogRearBackshell = catalogItem?.connectorDefaults?.rearBackshell;
  const override = connector.rearBackshellOverride;

  const enabled =
    override?.enabled !== undefined
      ? override.enabled
      : catalogRearBackshell?.enabled === true;
  if (enabled !== true) {
    return undefined;
  }

  const lengthMm = override?.lengthMm ?? catalogRearBackshell?.lengthMm;
  if (typeof lengthMm !== "number" || !Number.isFinite(lengthMm) || lengthMm < 1) {
    return undefined;
  }

  return {
    enabled: true,
    lengthMm
  };
}

export function buildRearBackshellHelperNodeId(connectorId: ConnectorId): NodeId {
  return `${String(connectorId)}__BSH` as NodeId;
}

export function buildRearBackshellLinkSegmentId(connectorId: ConnectorId): SegmentId {
  return `${String(connectorId)}__BSL` as SegmentId;
}

export function findConnectorNodeId(nodes: Record<NodeId, NetworkNode>, connectorId: ConnectorId): NodeId | undefined {
  for (const [nodeId, node] of Object.entries(nodes) as Array<[NodeId, NetworkNode]>) {
    if (node.kind === "connector" && node.connectorId === connectorId) {
      return nodeId;
    }
  }
  return undefined;
}

export function findRearBackshellHelperNodeId(nodes: Record<NodeId, NetworkNode>, connectorId: ConnectorId): NodeId | undefined {
  for (const [nodeId, node] of Object.entries(nodes) as Array<[NodeId, NetworkNode]>) {
    if (node.kind === "connectorBackshellHelper" && node.connectorId === connectorId) {
      return nodeId;
    }
  }
  return undefined;
}

export function isRearBackshellLinkSegment(
  segment: Segment,
  connectorNodeId: NodeId,
  helperNodeId: NodeId
): boolean {
  return (
    segment.role === "rearBackshellLink" &&
    ((segment.nodeA === connectorNodeId && segment.nodeB === helperNodeId) ||
      (segment.nodeA === helperNodeId && segment.nodeB === connectorNodeId))
  );
}
