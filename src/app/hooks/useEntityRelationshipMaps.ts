import { useMemo } from "react";
import type {
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId
} from "../../core/entities";

interface EntityRelationshipMaps {
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  segmentMap: Map<SegmentId, Segment>;
  connectorNodeByConnectorId: Map<ConnectorId, NodeId>;
  spliceNodeBySpliceId: Map<SpliceId, NodeId>;
}

export function useEntityRelationshipMaps(
  connectors: Connector[],
  splices: Splice[],
  nodes: NetworkNode[],
  segments: Segment[]
): EntityRelationshipMaps {
  const connectorMap = useMemo(() => new Map(connectors.map((connector) => [connector.id, connector])), [connectors]);
  const spliceMap = useMemo(() => new Map(splices.map((splice) => [splice.id, splice])), [splices]);
  const segmentMap = useMemo(() => new Map(segments.map((segment) => [segment.id, segment])), [segments]);
  const connectorNodeByConnectorId = useMemo(
    () =>
      new Map(
        nodes
          .filter((node): node is Extract<NetworkNode, { kind: "connector" }> => node.kind === "connector")
          .map((node) => [node.connectorId, node.id])
      ),
    [nodes]
  );
  const spliceNodeBySpliceId = useMemo(
    () =>
      new Map(
        nodes
          .filter((node): node is Extract<NetworkNode, { kind: "splice" }> => node.kind === "splice")
          .map((node) => [node.spliceId, node.id])
      ),
    [nodes]
  );

  return {
    connectorMap,
    spliceMap,
    segmentMap,
    connectorNodeByConnectorId,
    spliceNodeBySpliceId
  };
}
