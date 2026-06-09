import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  Network,
  NetworkNode,
  NodeId,
  Splice,
  SpliceId,
  Wire
} from "../../../core/entities";
import type { ModelingBatchSelectionScope } from "../../lib/modelingBatchDelete";
import type { OccupancyFilter, SortDirection, SortState } from "../../types/app-controller";
import type { PinRoleMassEditUpdate } from "./PinRoleMassEditPanel";

export interface ModelingPrimaryTablesProps {
  activeBatchScope: ModelingBatchSelectionScope | null;
  batchSelectionIds: ReadonlySet<string>;
  onEnterBatchMode: (scope: ModelingBatchSelectionScope) => void;
  onExitBatchMode: () => void;
  onToggleBatchSelection: (scope: ModelingBatchSelectionScope, id: string) => void;
  onSetBatchSelectionForVisible: (scope: ModelingBatchSelectionScope, ids: readonly string[]) => void;
  onDeleteSelectedInBatchMode: () => void;
  isConnectorSubScreen: boolean;
  connectorFormMode: "idle" | "create" | "edit";
  onOpenCreateConnector: () => void;
  connectorOccupancyFilter: OccupancyFilter;
  setConnectorOccupancyFilter: (value: OccupancyFilter) => void;
  connectorFilterField: "name" | "technicalId" | "any";
  setConnectorFilterField: (value: "name" | "technicalId" | "any") => void;
  connectorFilterQuery: string;
  setConnectorFilterQuery: (value: string) => void;
  catalogItems: CatalogItem[];
  connectors: Connector[];
  visibleConnectors: Connector[];
  connectorSort: SortState;
  setConnectorSort: (value: SortState | ((current: SortState) => SortState)) => void;
  getSortIndicator: (sortState: SortState, field: SortState["field"]) => string;
  connectorOccupiedCountById: Map<ConnectorId, number>;
  selectedConnectorId: ConnectorId | null;
  onEditConnector: (connector: Connector) => void;
  onSelectCatalogItem: (catalogItemId: CatalogItemId) => void;
  onDeleteConnector: (connectorId: ConnectorId) => void;
  onOpenConnectorOnboardingHelp?: () => void;
  activeNetwork: Network | null;
  wires: Wire[];
  onApplyPinRoleMassEdit: (updates: PinRoleMassEditUpdate[]) => void;
  isSpliceSubScreen: boolean;
  spliceFormMode: "idle" | "create" | "edit";
  onOpenCreateSplice: () => void;
  spliceOccupancyFilter: OccupancyFilter;
  setSpliceOccupancyFilter: (value: OccupancyFilter) => void;
  spliceFilterField: "name" | "technicalId" | "any";
  setSpliceFilterField: (value: "name" | "technicalId" | "any") => void;
  spliceFilterQuery: string;
  setSpliceFilterQuery: (value: string) => void;
  splices: Splice[];
  visibleSplices: Splice[];
  spliceSort: SortState;
  setSpliceSort: (value: SortState | ((current: SortState) => SortState)) => void;
  spliceOccupiedCountById: Map<SpliceId, number>;
  selectedSpliceId: SpliceId | null;
  onEditSplice: (splice: Splice) => void;
  onDeleteSplice: (spliceId: SpliceId) => void;
  onOpenSpliceOnboardingHelp?: () => void;
  isNodeSubScreen: boolean;
  nodeFormMode: "idle" | "create" | "edit";
  onOpenCreateNode: () => void;
  nodeKindFilter: "all" | NetworkNode["kind"];
  setNodeKindFilter: (value: "all" | NetworkNode["kind"]) => void;
  nodeFilterField: "id" | "kind" | "reference" | "any";
  setNodeFilterField: (value: "id" | "kind" | "reference" | "any") => void;
  nodeFilterQuery: string;
  setNodeFilterQuery: (value: string) => void;
  nodes: NetworkNode[];
  visibleNodes: NetworkNode[];
  nodeIdSortDirection: SortDirection;
  setNodeIdSortDirection: (value: SortDirection | ((current: SortDirection) => SortDirection)) => void;
  segmentsCountByNodeId: Map<NodeId, number>;
  selectedNodeId: NodeId | null;
  describeNode: (node: NetworkNode) => string;
  onEditNode: (node: NetworkNode) => void;
  onDeleteNode: (nodeId: NodeId) => void;
  onOpenNodeOnboardingHelp?: () => void;
}
