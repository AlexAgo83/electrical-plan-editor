import type { FormEvent } from "react";
import type {
  CatalogItem,
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire,
  WireId
} from "../../../core/entities";
import type { ConnectorSynthesisRow, SegmentSubNetworkFilter, SortState, SpliceSynthesisRow } from "../../types/app-controller";

interface OccupancyStatus {
  isOccupied: boolean;
  occupantRef: string | null;
}

export interface ConnectorCavityStatus extends OccupancyStatus {
  cavityIndex: number;
}

export interface SplicePortStatus extends OccupancyStatus {
  portIndex: number;
}

export interface AnalysisWorkspaceContentProps {
  showEntityTables?: boolean;
  isConnectorSubScreen: boolean;
  isSpliceSubScreen: boolean;
  isNodeSubScreen: boolean;
  isSegmentSubScreen: boolean;
  isWireSubScreen: boolean;
  selectedConnector: Connector | null;
  selectedConnectorId: ConnectorId | null;
  connectorOccupancyFilter: "all" | "occupied" | "free";
  setConnectorOccupancyFilter: (value: "all" | "occupied" | "free") => void;
  connectorFilterField: "name" | "technicalId" | "any";
  setConnectorFilterField: (value: "name" | "technicalId" | "any") => void;
  connectorFilterQuery: string;
  setConnectorFilterQuery: (value: string) => void;
  connectors: Connector[];
  visibleConnectors: Connector[];
  connectorSort: SortState;
  setConnectorSort: (value: SortState | ((current: SortState) => SortState)) => void;
  connectorOccupiedCountById: Map<ConnectorId, number>;
  onSelectConnector: (connectorId: ConnectorId) => void;
  onOpenConnectorOnboardingHelp?: () => void;
  cavityIndexInput: string;
  setCavityIndexInput: (value: string) => void;
  connectorOccupantRefInput: string;
  setConnectorOccupantRefInput: (value: string) => void;
  handleReserveCavity: (event: FormEvent<HTMLFormElement>) => void;
  connectorCavityStatuses: ConnectorCavityStatus[];
  handleReleaseCavity: (cavityIndex: number) => void;
  sortedConnectorSynthesisRows: ConnectorSynthesisRow[];
  connectorSynthesisSort: SortState;
  setConnectorSynthesisSort: (value: SortState | ((current: SortState) => SortState)) => void;
  getSortIndicator: (sortState: SortState, field: SortState["field"]) => string;
  selectedSplice: Splice | null;
  selectedSpliceId: SpliceId | null;
  spliceOccupancyFilter: "all" | "occupied" | "free";
  setSpliceOccupancyFilter: (value: "all" | "occupied" | "free") => void;
  spliceFilterField: "name" | "technicalId" | "any";
  setSpliceFilterField: (value: "name" | "technicalId" | "any") => void;
  spliceFilterQuery: string;
  setSpliceFilterQuery: (value: string) => void;
  splices: Splice[];
  visibleSplices: Splice[];
  spliceSort: SortState;
  setSpliceSort: (value: SortState | ((current: SortState) => SortState)) => void;
  spliceOccupiedCountById: Map<SpliceId, number>;
  onSelectSplice: (spliceId: SpliceId) => void;
  onOpenSpliceOnboardingHelp?: () => void;
  splicePortStatuses: SplicePortStatus[];
  portIndexInput: string;
  setPortIndexInput: (value: string) => void;
  spliceOccupantRefInput: string;
  setSpliceOccupantRefInput: (value: string) => void;
  handleReservePort: (event: FormEvent<HTMLFormElement>) => void;
  handleReleasePort: (portIndex: number) => void;
  sortedSpliceSynthesisRows: SpliceSynthesisRow[];
  spliceSynthesisSort: SortState;
  setSpliceSynthesisSort: (value: SortState | ((current: SortState) => SortState)) => void;
  nodeKindFilter: "all" | NetworkNode["kind"];
  setNodeKindFilter: (value: "all" | NetworkNode["kind"]) => void;
  nodeFilterField: "id" | "reference" | "kind" | "any";
  setNodeFilterField: (value: "id" | "reference" | "kind" | "any") => void;
  nodeFilterQuery: string;
  setNodeFilterQuery: (value: string) => void;
  nodes: NetworkNode[];
  visibleNodes: NetworkNode[];
  segmentsCountByNodeId: Map<NodeId, number>;
  selectedNodeId: NodeId | null;
  selectedNode: NetworkNode | null;
  selectedSegment: Segment | null;
  onSelectNode: (nodeId: NodeId) => void;
  onOpenNodeOnboardingHelp?: () => void;
  describeNode: (node: NetworkNode) => string;
  nodeLabelById: Map<NodeId, string>;
  segmentSubNetworkFilter: SegmentSubNetworkFilter;
  setSegmentSubNetworkFilter: (value: SegmentSubNetworkFilter) => void;
  segmentFilterField: "id" | "nodeA" | "nodeB" | "subNetwork" | "any";
  setSegmentFilterField: (value: "id" | "nodeA" | "nodeB" | "subNetwork" | "any") => void;
  segmentFilterQuery: string;
  setSegmentFilterQuery: (value: string) => void;
  segments: Segment[];
  visibleSegments: Segment[];
  selectedSegmentId: SegmentId | null;
  onSelectSegment: (segmentId: SegmentId) => void;
  onOpenSegmentOnboardingHelp?: () => void;
  wireRouteFilter: "all" | "auto" | "locked";
  setWireRouteFilter: (value: "all" | "auto" | "locked") => void;
  wireFilterField: "endpoints" | "name" | "technicalId" | "any";
  setWireFilterField: (value: "endpoints" | "name" | "technicalId" | "any") => void;
  wireEndpointFilterQuery: string;
  setWireEndpointFilterQuery: (value: string) => void;
  catalogItems: CatalogItem[];
  wires: Wire[];
  visibleWires: Wire[];
  wireSort: SortState;
  setWireSort: (value: SortState | ((current: SortState) => SortState)) => void;
  selectedWireId: WireId | null;
  onSelectWire: (wireId: WireId) => void;
  onOpenWireOnboardingHelp?: () => void;
  selectedWire: Wire | null;
  describeWireEndpoint: (endpoint: Wire["endpointA"]) => string;
  describeWireEndpointId: (endpoint: Wire["endpointA"]) => string;
  wireForcedRouteInput: string;
  setWireForcedRouteInput: (value: string) => void;
  handleLockWireRoute: () => void;
  handleResetWireRoute: () => void;
  wireFormError: string | null;
}
