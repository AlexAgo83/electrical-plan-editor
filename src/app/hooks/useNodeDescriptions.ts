import { useCallback, useMemo } from "react";
import type { Connector, ConnectorId, NetworkNode, NodeId, Splice, SpliceId } from "../../core/entities";

export function useNodeDescriptions(
  nodes: NetworkNode[],
  connectorMap: Map<ConnectorId, Connector>,
  spliceMap: Map<SpliceId, Splice>
): {
  describeNode: (node: NetworkNode) => string;
  nodeLabelById: Map<NodeId, string>;
} {
  const describeNode = useCallback((node: NetworkNode): string => {
    if (node.kind === "intermediate") {
      return `Intermediate: ${node.label}`;
    }

    if (node.kind === "connector") {
      const connector = connectorMap.get(node.connectorId);
      return connector === undefined
        ? `Connector node (${node.connectorId})`
        : `Connector: ${connector.name} (${connector.technicalId})`;
    }

    const splice = spliceMap.get(node.spliceId);
    return splice === undefined ? `Splice node (${node.spliceId})` : `Splice: ${splice.name} (${splice.technicalId})`;
  }, [connectorMap, spliceMap]);

  const nodeLabelById = useMemo(() => {
    const result = new Map<NodeId, string>();
    for (const node of nodes) {
      result.set(node.id, describeNode(node));
    }
    return result;
  }, [describeNode, nodes]);

  return {
    describeNode,
    nodeLabelById
  };
}
