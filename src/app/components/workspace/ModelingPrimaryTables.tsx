import type { ReactElement } from "react";
import { nextSortState } from "../../lib/app-utils";
import type {
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Splice,
  SpliceId
} from "../../../core/entities";
import type { OccupancyFilter, SortDirection, SortState } from "../../types/app-controller";

interface ModelingPrimaryTablesProps {
  isConnectorSubScreen: boolean;
  connectorSearchQuery: string;
  setConnectorSearchQuery: (value: string) => void;
  connectorOccupancyFilter: OccupancyFilter;
  setConnectorOccupancyFilter: (value: OccupancyFilter) => void;
  connectors: Connector[];
  visibleConnectors: Connector[];
  connectorSort: SortState;
  setConnectorSort: (value: SortState | ((current: SortState) => SortState)) => void;
  getSortIndicator: (sortState: SortState, field: "name" | "technicalId") => string;
  connectorOccupiedCountById: Map<ConnectorId, number>;
  selectedConnectorId: ConnectorId | null;
  onSelectConnector: (connectorId: ConnectorId) => void;
  onEditConnector: (connector: Connector) => void;
  onDeleteConnector: (connectorId: ConnectorId) => void;
  isSpliceSubScreen: boolean;
  spliceSearchQuery: string;
  setSpliceSearchQuery: (value: string) => void;
  spliceOccupancyFilter: OccupancyFilter;
  setSpliceOccupancyFilter: (value: OccupancyFilter) => void;
  splices: Splice[];
  visibleSplices: Splice[];
  spliceSort: SortState;
  setSpliceSort: (value: SortState | ((current: SortState) => SortState)) => void;
  spliceOccupiedCountById: Map<SpliceId, number>;
  selectedSpliceId: SpliceId | null;
  onSelectSplice: (spliceId: SpliceId) => void;
  onEditSplice: (splice: Splice) => void;
  onDeleteSplice: (spliceId: SpliceId) => void;
  isNodeSubScreen: boolean;
  nodeSearchQuery: string;
  setNodeSearchQuery: (value: string) => void;
  nodeKindFilter: "all" | NetworkNode["kind"];
  setNodeKindFilter: (value: "all" | NetworkNode["kind"]) => void;
  nodes: NetworkNode[];
  visibleNodes: NetworkNode[];
  nodeIdSortDirection: SortDirection;
  setNodeIdSortDirection: (value: SortDirection | ((current: SortDirection) => SortDirection)) => void;
  segmentsCountByNodeId: Map<NodeId, number>;
  selectedNodeId: NodeId | null;
  describeNode: (node: NetworkNode) => string;
  onSelectNode: (nodeId: NodeId) => void;
  onEditNode: (node: NetworkNode) => void;
  onDeleteNode: (nodeId: NodeId) => void;
}

export function ModelingPrimaryTables({
  isConnectorSubScreen,
  connectorSearchQuery,
  setConnectorSearchQuery,
  connectorOccupancyFilter,
  setConnectorOccupancyFilter,
  connectors,
  visibleConnectors,
  connectorSort,
  setConnectorSort,
  getSortIndicator,
  connectorOccupiedCountById,
  selectedConnectorId,
  onSelectConnector,
  onEditConnector,
  onDeleteConnector,
  isSpliceSubScreen,
  spliceSearchQuery,
  setSpliceSearchQuery,
  spliceOccupancyFilter,
  setSpliceOccupancyFilter,
  splices,
  visibleSplices,
  spliceSort,
  setSpliceSort,
  spliceOccupiedCountById,
  selectedSpliceId,
  onSelectSplice,
  onEditSplice,
  onDeleteSplice,
  isNodeSubScreen,
  nodeSearchQuery,
  setNodeSearchQuery,
  nodeKindFilter,
  setNodeKindFilter,
  nodes,
  visibleNodes,
  nodeIdSortDirection,
  setNodeIdSortDirection,
  segmentsCountByNodeId,
  selectedNodeId,
  describeNode,
  onSelectNode,
  onEditNode,
  onDeleteNode
}: ModelingPrimaryTablesProps): ReactElement {
  return (
    <>
      <article className="panel" hidden={!isConnectorSubScreen}>
        <h2>Connectors</h2>
        <div className="list-toolbar">
          <label className="stack-label list-search">
            Search
            <input aria-label="Search connectors" value={connectorSearchQuery} onChange={(event) => setConnectorSearchQuery(event.target.value)} placeholder="Name or technical ID" />
          </label>
          <div className="chip-group" role="group" aria-label="Connector occupancy filter">
            {([
              ["all", "All"],
              ["occupied", "Occupied"],
              ["free", "Free"]
            ] as const).map(([filterId, label]) => (
              <button key={filterId} type="button" className={connectorOccupancyFilter === filterId ? "filter-chip is-active" : "filter-chip"} onClick={() => setConnectorOccupancyFilter(filterId)}>{label}</button>
            ))}
          </div>
        </div>
        {connectors.length === 0 ? (
          <p className="empty-copy">No connector yet.</p>
        ) : visibleConnectors.length === 0 ? (
          <p className="empty-copy">No connector matches the current search/filter.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => setConnectorSort((current) => nextSortState(current, "name"))}>Name <span className="sort-indicator">{getSortIndicator(connectorSort, "name")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => setConnectorSort((current) => nextSortState(current, "technicalId"))}>Technical ID <span className="sort-indicator">{getSortIndicator(connectorSort, "technicalId")}</span></button></th>
                <th>Cavities</th>
                <th>Occupied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleConnectors.map((connector) => {
                const occupiedCount = connectorOccupiedCountById.get(connector.id) ?? 0;
                const isSelected = selectedConnectorId === connector.id;
                return (
                  <tr key={connector.id} className={isSelected ? "is-selected" : undefined}>
                    <td>{connector.name}</td>
                    <td className="technical-id">{connector.technicalId}</td>
                    <td>{connector.cavityCount}</td>
                    <td>{occupiedCount}</td>
                    <td><div className="row-actions compact"><button type="button" onClick={() => onSelectConnector(connector.id)}>Select</button><button type="button" onClick={() => onEditConnector(connector)}>Edit</button><button type="button" onClick={() => onDeleteConnector(connector.id)}>Delete</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </article>

      <article className="panel" hidden={!isSpliceSubScreen}>
        <h2>Splices</h2>
        <div className="list-toolbar">
          <label className="stack-label list-search">
            Search
            <input aria-label="Search splices" value={spliceSearchQuery} onChange={(event) => setSpliceSearchQuery(event.target.value)} placeholder="Name or technical ID" />
          </label>
          <div className="chip-group" role="group" aria-label="Splice occupancy filter">
            {([
              ["all", "All"],
              ["occupied", "Occupied"],
              ["free", "Free"]
            ] as const).map(([filterId, label]) => (
              <button key={filterId} type="button" className={spliceOccupancyFilter === filterId ? "filter-chip is-active" : "filter-chip"} onClick={() => setSpliceOccupancyFilter(filterId)}>{label}</button>
            ))}
          </div>
        </div>
        {splices.length === 0 ? (
          <p className="empty-copy">No splice yet.</p>
        ) : visibleSplices.length === 0 ? (
          <p className="empty-copy">No splice matches the current search/filter.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => setSpliceSort((current) => nextSortState(current, "name"))}>Name <span className="sort-indicator">{getSortIndicator(spliceSort, "name")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => setSpliceSort((current) => nextSortState(current, "technicalId"))}>Technical ID <span className="sort-indicator">{getSortIndicator(spliceSort, "technicalId")}</span></button></th>
                <th>Ports</th>
                <th>Branches</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleSplices.map((splice) => {
                const occupiedCount = spliceOccupiedCountById.get(splice.id) ?? 0;
                const isSelected = selectedSpliceId === splice.id;
                return (
                  <tr key={splice.id} className={isSelected ? "is-selected" : undefined}>
                    <td><span className="splice-badge">Junction</span> {splice.name}</td>
                    <td className="technical-id">{splice.technicalId}</td>
                    <td>{splice.portCount}</td>
                    <td>{occupiedCount}</td>
                    <td><div className="row-actions compact"><button type="button" onClick={() => onSelectSplice(splice.id)}>Select</button><button type="button" onClick={() => onEditSplice(splice)}>Edit</button><button type="button" onClick={() => onDeleteSplice(splice.id)}>Delete</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </article>

      <article className="panel" hidden={!isNodeSubScreen}>
        <h2>Nodes</h2>
        <div className="list-toolbar">
          <label className="stack-label list-search">
            Search
            <input aria-label="Search nodes" value={nodeSearchQuery} onChange={(event) => setNodeSearchQuery(event.target.value)} placeholder="ID, label, connector, splice" />
          </label>
          <div className="chip-group" role="group" aria-label="Node kind filter">
            {([
              ["all", "All"],
              ["connector", "Connector"],
              ["splice", "Splice"],
              ["intermediate", "Intermediate"]
            ] as const).map(([kindId, label]) => (
              <button key={kindId} type="button" className={nodeKindFilter === kindId ? "filter-chip is-active" : "filter-chip"} onClick={() => setNodeKindFilter(kindId)}>{label}</button>
            ))}
          </div>
        </div>
        {nodes.length === 0 ? (
          <p className="empty-copy">No node yet.</p>
        ) : visibleNodes.length === 0 ? (
          <p className="empty-copy">No node matches the current search/filter.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => setNodeIdSortDirection((currentDirection) => currentDirection === "asc" ? "desc" : "asc")}>ID <span className="sort-indicator">{nodeIdSortDirection === "asc" ? "▲" : "▼"}</span></button></th>
                <th>Kind</th>
                <th>Reference</th>
                <th>Linked segments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleNodes.map((node) => {
                const linkedSegments = segmentsCountByNodeId.get(node.id) ?? 0;
                const isSelected = selectedNodeId === node.id;
                return (
                  <tr key={node.id} className={isSelected ? "is-selected" : undefined}>
                    <td className="technical-id">{node.id}</td>
                    <td>{node.kind}</td>
                    <td>{describeNode(node)}</td>
                    <td>{linkedSegments}</td>
                    <td><div className="row-actions compact"><button type="button" onClick={() => onSelectNode(node.id)}>Select</button><button type="button" onClick={() => onEditNode(node)}>Edit</button><button type="button" onClick={() => onDeleteNode(node.id)}>Delete</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </article>
    </>
  );
}
