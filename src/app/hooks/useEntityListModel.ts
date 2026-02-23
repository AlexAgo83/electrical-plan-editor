import { useMemo, useState } from "react";
import type { Connector, ConnectorId, NetworkNode, NodeId, Segment, Splice, SpliceId, Wire } from "../../core/entities";
import { selectConnectorCavityStatuses, selectSplicePortStatuses, type AppState } from "../../store";
import { normalizeSearch, sortById, sortByNameAndTechnicalId } from "../lib/app-utils-shared";
import type {
  ConnectorSynthesisRow,
  OccupancyFilter,
  SegmentSubNetworkFilter,
  SortDirection,
  SortField,
  SortState,
  SpliceSynthesisRow
} from "../types/app-controller";

interface UseEntityListModelParams {
  state: AppState;
  connectors: Connector[];
  splices: Splice[];
  nodes: NetworkNode[];
  segments: Segment[];
  wires: Wire[];
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  selectedConnector: Connector | null;
  selectedSplice: Splice | null;
  describeWireEndpoint: (endpoint: Wire["endpointA"]) => string;
}

export function useEntityListModel({
  state,
  connectors,
  splices,
  nodes,
  segments,
  wires,
  connectorMap,
  spliceMap,
  selectedConnector,
  selectedSplice,
  describeWireEndpoint
}: UseEntityListModelParams) {
  const [connectorSearchQuery, setConnectorSearchQuery] = useState("");
  const [spliceSearchQuery, setSpliceSearchQuery] = useState("");
  const [nodeSearchQuery, setNodeSearchQuery] = useState("");
  const [segmentSearchQuery, setSegmentSearchQuery] = useState("");
  const [wireSearchQuery, setWireSearchQuery] = useState("");
  const [connectorOccupancyFilter, setConnectorOccupancyFilter] = useState<OccupancyFilter>("all");
  const [spliceOccupancyFilter, setSpliceOccupancyFilter] = useState<OccupancyFilter>("all");
  const [nodeKindFilter, setNodeKindFilter] = useState<"all" | NetworkNode["kind"]>("all");
  const [segmentSubNetworkFilter, setSegmentSubNetworkFilter] = useState<SegmentSubNetworkFilter>("all");
  const [wireRouteFilter, setWireRouteFilter] = useState<"all" | "auto" | "locked">("all");
  const [connectorSort, setConnectorSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [spliceSort, setSpliceSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [nodeIdSortDirection, setNodeIdSortDirection] = useState<SortDirection>("asc");
  const [segmentIdSortDirection, setSegmentIdSortDirection] = useState<SortDirection>("asc");
  const [wireSort, setWireSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [wireEndpointFilterQuery, setWireEndpointFilterQuery] = useState("");
  const [connectorSynthesisSort, setConnectorSynthesisSort] = useState<SortState>({ field: "name", direction: "asc" });
  const [spliceSynthesisSort, setSpliceSynthesisSort] = useState<SortState>({ field: "name", direction: "asc" });

  const connectorSynthesisRows = useMemo<ConnectorSynthesisRow[]>(() => {
    if (selectedConnector === null) {
      return [];
    }
    return wires.flatMap((wire) => {
      const entries: ConnectorSynthesisRow[] = [];
      if (wire.endpointA.kind === "connectorCavity" && wire.endpointA.connectorId === selectedConnector.id) {
        entries.push({
          wireId: wire.id,
          wireName: wire.name,
          wireTechnicalId: wire.technicalId,
          localEndpointLabel: `C${wire.endpointA.cavityIndex}`,
          remoteEndpointLabel: describeWireEndpoint(wire.endpointB),
          lengthMm: wire.lengthMm
        });
      }
      if (wire.endpointB.kind === "connectorCavity" && wire.endpointB.connectorId === selectedConnector.id) {
        entries.push({
          wireId: wire.id,
          wireName: wire.name,
          wireTechnicalId: wire.technicalId,
          localEndpointLabel: `C${wire.endpointB.cavityIndex}`,
          remoteEndpointLabel: describeWireEndpoint(wire.endpointA),
          lengthMm: wire.lengthMm
        });
      }
      return entries;
    });
  }, [describeWireEndpoint, selectedConnector, wires]);

  const spliceSynthesisRows = useMemo<SpliceSynthesisRow[]>(() => {
    if (selectedSplice === null) {
      return [];
    }
    return wires.flatMap((wire) => {
      const entries: SpliceSynthesisRow[] = [];
      if (wire.endpointA.kind === "splicePort" && wire.endpointA.spliceId === selectedSplice.id) {
        entries.push({
          wireId: wire.id,
          wireName: wire.name,
          wireTechnicalId: wire.technicalId,
          localEndpointLabel: `P${wire.endpointA.portIndex}`,
          remoteEndpointLabel: describeWireEndpoint(wire.endpointB),
          lengthMm: wire.lengthMm
        });
      }
      if (wire.endpointB.kind === "splicePort" && wire.endpointB.spliceId === selectedSplice.id) {
        entries.push({
          wireId: wire.id,
          wireName: wire.name,
          wireTechnicalId: wire.technicalId,
          localEndpointLabel: `P${wire.endpointB.portIndex}`,
          remoteEndpointLabel: describeWireEndpoint(wire.endpointA),
          lengthMm: wire.lengthMm
        });
      }
      return entries;
    });
  }, [describeWireEndpoint, selectedSplice, wires]);

  const sortedConnectors = useMemo(() => sortByNameAndTechnicalId(connectors, connectorSort, (connector) => connector.name, (connector) => connector.technicalId), [connectors, connectorSort]);
  const sortedSplices = useMemo(() => sortByNameAndTechnicalId(splices, spliceSort, (splice) => splice.name, (splice) => splice.technicalId), [splices, spliceSort]);
  const sortedNodes = useMemo(() => sortById(nodes, nodeIdSortDirection, (node) => node.id), [nodes, nodeIdSortDirection]);
  const sortedSegments = useMemo(() => sortById(segments, segmentIdSortDirection, (segment) => segment.id), [segments, segmentIdSortDirection]);
  const sortedWires = useMemo(() => {
    if (wireSort.field !== "lengthMm") {
      return sortByNameAndTechnicalId(wires, wireSort, (wire) => wire.name, (wire) => wire.technicalId);
    }

    const factor = wireSort.direction === "asc" ? 1 : -1;
    return [...wires].sort((left, right) => {
      const delta = (left.lengthMm - right.lengthMm) * factor;
      if (delta !== 0) {
        return delta;
      }
      return left.technicalId.localeCompare(right.technicalId) * factor;
    });
  }, [wires, wireSort]);
  const sortedConnectorSynthesisRows = useMemo(() => sortByNameAndTechnicalId(connectorSynthesisRows, connectorSynthesisSort, (row) => row.wireName, (row) => row.wireTechnicalId), [connectorSynthesisRows, connectorSynthesisSort]);
  const sortedSpliceSynthesisRows = useMemo(() => sortByNameAndTechnicalId(spliceSynthesisRows, spliceSynthesisSort, (row) => row.wireName, (row) => row.wireTechnicalId), [spliceSynthesisRows, spliceSynthesisSort]);

  const normalizedConnectorSearch = normalizeSearch(connectorSearchQuery);
  const normalizedSpliceSearch = normalizeSearch(spliceSearchQuery);
  const normalizedNodeSearch = normalizeSearch(nodeSearchQuery);
  const normalizedSegmentSearch = normalizeSearch(segmentSearchQuery);
  const normalizedWireSearch = normalizeSearch(wireSearchQuery);
  const normalizedWireEndpointFilter = normalizeSearch(wireEndpointFilterQuery);

  const connectorOccupiedCountById = useMemo(() => {
    const result = new Map<ConnectorId, number>();
    for (const connector of connectors) {
      result.set(connector.id, selectConnectorCavityStatuses(state, connector.id).filter((slot) => slot.isOccupied).length);
    }
    return result;
  }, [connectors, state]);

  const spliceOccupiedCountById = useMemo(() => {
    const result = new Map<SpliceId, number>();
    for (const splice of splices) {
      result.set(splice.id, selectSplicePortStatuses(state, splice.id).filter((slot) => slot.isOccupied).length);
    }
    return result;
  }, [splices, state]);

  const visibleConnectors = useMemo(() => sortedConnectors.filter((connector) => {
    const occupiedCount = connectorOccupiedCountById.get(connector.id) ?? 0;
    if (connectorOccupancyFilter === "occupied" && occupiedCount === 0) {
      return false;
    }
    if (connectorOccupancyFilter === "free" && occupiedCount > 0) {
      return false;
    }
    return `${connector.name} ${connector.technicalId}`.toLocaleLowerCase().includes(normalizedConnectorSearch);
  }), [connectorOccupiedCountById, connectorOccupancyFilter, normalizedConnectorSearch, sortedConnectors]);

  const visibleSplices = useMemo(() => sortedSplices.filter((splice) => {
    const occupiedCount = spliceOccupiedCountById.get(splice.id) ?? 0;
    if (spliceOccupancyFilter === "occupied" && occupiedCount === 0) {
      return false;
    }
    if (spliceOccupancyFilter === "free" && occupiedCount > 0) {
      return false;
    }
    return `${splice.name} ${splice.technicalId}`.toLocaleLowerCase().includes(normalizedSpliceSearch);
  }), [normalizedSpliceSearch, sortedSplices, spliceOccupancyFilter, spliceOccupiedCountById]);

  const visibleNodes = useMemo(() => sortedNodes.filter((node) => {
    if (nodeKindFilter !== "all" && node.kind !== nodeKindFilter) {
      return false;
    }
    if (normalizedNodeSearch.length === 0) {
      return true;
    }
    if (node.kind === "intermediate") {
      return `${node.id} ${node.label}`.toLocaleLowerCase().includes(normalizedNodeSearch);
    }
    if (node.kind === "connector") {
      const connector = connectorMap.get(node.connectorId);
      return `${node.id} ${node.connectorId} ${connector?.name ?? ""} ${connector?.technicalId ?? ""}`.toLocaleLowerCase().includes(normalizedNodeSearch);
    }
    const splice = spliceMap.get(node.spliceId);
    return `${node.id} ${node.spliceId} ${splice?.name ?? ""} ${splice?.technicalId ?? ""}`.toLocaleLowerCase().includes(normalizedNodeSearch);
  }), [connectorMap, nodeKindFilter, normalizedNodeSearch, sortedNodes, spliceMap]);

  const visibleSegments = useMemo(() => sortedSegments.filter((segment) => {
    const normalizedSubNetworkTag = segment.subNetworkTag?.trim() ?? "";
    if (segmentSubNetworkFilter === "default" && normalizedSubNetworkTag.length > 0) {
      return false;
    }
    if (segmentSubNetworkFilter === "tagged" && normalizedSubNetworkTag.length === 0) {
      return false;
    }
    return `${segment.id} ${segment.nodeA} ${segment.nodeB} ${segment.subNetworkTag ?? ""}`.toLocaleLowerCase().includes(normalizedSegmentSearch);
  }), [normalizedSegmentSearch, segmentSubNetworkFilter, sortedSegments]);

  const visibleWires = useMemo(() => sortedWires.filter((wire) => {
    if (wireRouteFilter === "locked" && !wire.isRouteLocked) {
      return false;
    }
    if (wireRouteFilter === "auto" && wire.isRouteLocked) {
      return false;
    }
    if (normalizedWireEndpointFilter.length > 0) {
      const endpointSearchText =
        `${describeWireEndpoint(wire.endpointA)} ${describeWireEndpoint(wire.endpointB)}`.toLocaleLowerCase();
      if (!endpointSearchText.includes(normalizedWireEndpointFilter)) {
        return false;
      }
    }
    if (normalizedWireSearch.length === 0) {
      return true;
    }
    return `${wire.name} ${wire.technicalId}`.toLocaleLowerCase().includes(normalizedWireSearch);
  }), [describeWireEndpoint, normalizedWireEndpointFilter, normalizedWireSearch, sortedWires, wireRouteFilter]);

  const segmentsCountByNodeId = useMemo(() => {
    const result = new Map<NodeId, number>();
    for (const node of nodes) {
      result.set(node.id, 0);
    }
    for (const segment of segments) {
      result.set(segment.nodeA, (result.get(segment.nodeA) ?? 0) + 1);
      result.set(segment.nodeB, (result.get(segment.nodeB) ?? 0) + 1);
    }
    return result;
  }, [nodes, segments]);

  function getSortIndicator(sortState: SortState, field: SortField): string {
    if (sortState.field !== field) {
      return "";
    }
    return sortState.direction === "asc" ? "▲" : "▼";
  }

  return {
    connectorSearchQuery,
    setConnectorSearchQuery,
    spliceSearchQuery,
    setSpliceSearchQuery,
    nodeSearchQuery,
    setNodeSearchQuery,
    segmentSearchQuery,
    setSegmentSearchQuery,
    wireSearchQuery,
    setWireSearchQuery,
    connectorOccupancyFilter,
    setConnectorOccupancyFilter,
    spliceOccupancyFilter,
    setSpliceOccupancyFilter,
    nodeKindFilter,
    setNodeKindFilter,
    segmentSubNetworkFilter,
    setSegmentSubNetworkFilter,
    wireRouteFilter,
    setWireRouteFilter,
    wireEndpointFilterQuery,
    setWireEndpointFilterQuery,
    connectorSort,
    setConnectorSort,
    spliceSort,
    setSpliceSort,
    nodeIdSortDirection,
    setNodeIdSortDirection,
    segmentIdSortDirection,
    setSegmentIdSortDirection,
    wireSort,
    setWireSort,
    connectorSynthesisSort,
    setConnectorSynthesisSort,
    spliceSynthesisSort,
    setSpliceSynthesisSort,
    connectorOccupiedCountById,
    spliceOccupiedCountById,
    sortedConnectorSynthesisRows,
    sortedSpliceSynthesisRows,
    visibleConnectors,
    visibleSplices,
    visibleNodes,
    visibleSegments,
    visibleWires,
    segmentsCountByNodeId,
    getSortIndicator
  };
}

export type EntityListModel = ReturnType<typeof useEntityListModel>;
