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
  connectorFormMode: "create" | "edit";
  onOpenCreateConnector: () => void;
  connectorOccupancyFilter: OccupancyFilter;
  setConnectorOccupancyFilter: (value: OccupancyFilter) => void;
  connectors: Connector[];
  visibleConnectors: Connector[];
  connectorSort: SortState;
  setConnectorSort: (value: SortState | ((current: SortState) => SortState)) => void;
  getSortIndicator: (sortState: SortState, field: "name" | "technicalId") => string;
  connectorOccupiedCountById: Map<ConnectorId, number>;
  selectedConnectorId: ConnectorId | null;
  onEditConnector: (connector: Connector) => void;
  onDeleteConnector: (connectorId: ConnectorId) => void;
  isSpliceSubScreen: boolean;
  spliceFormMode: "create" | "edit";
  onOpenCreateSplice: () => void;
  spliceOccupancyFilter: OccupancyFilter;
  setSpliceOccupancyFilter: (value: OccupancyFilter) => void;
  splices: Splice[];
  visibleSplices: Splice[];
  spliceSort: SortState;
  setSpliceSort: (value: SortState | ((current: SortState) => SortState)) => void;
  spliceOccupiedCountById: Map<SpliceId, number>;
  selectedSpliceId: SpliceId | null;
  onEditSplice: (splice: Splice) => void;
  onDeleteSplice: (spliceId: SpliceId) => void;
  isNodeSubScreen: boolean;
  nodeFormMode: "create" | "edit";
  onOpenCreateNode: () => void;
  nodeKindFilter: "all" | NetworkNode["kind"];
  setNodeKindFilter: (value: "all" | NetworkNode["kind"]) => void;
  nodes: NetworkNode[];
  visibleNodes: NetworkNode[];
  nodeIdSortDirection: SortDirection;
  setNodeIdSortDirection: (value: SortDirection | ((current: SortDirection) => SortDirection)) => void;
  segmentsCountByNodeId: Map<NodeId, number>;
  selectedNodeId: NodeId | null;
  describeNode: (node: NetworkNode) => string;
  onEditNode: (node: NetworkNode) => void;
  onDeleteNode: (nodeId: NodeId) => void;
}

export function ModelingPrimaryTables({
  isConnectorSubScreen,
  connectorFormMode,
  onOpenCreateConnector,
  connectorOccupancyFilter,
  setConnectorOccupancyFilter,
  connectors,
  visibleConnectors,
  connectorSort,
  setConnectorSort,
  getSortIndicator,
  connectorOccupiedCountById,
  selectedConnectorId,
  onEditConnector,
  onDeleteConnector,
  isSpliceSubScreen,
  spliceFormMode,
  onOpenCreateSplice,
  spliceOccupancyFilter,
  setSpliceOccupancyFilter,
  splices,
  visibleSplices,
  spliceSort,
  setSpliceSort,
  spliceOccupiedCountById,
  selectedSpliceId,
  onEditSplice,
  onDeleteSplice,
  isNodeSubScreen,
  nodeFormMode,
  onOpenCreateNode,
  nodeKindFilter,
  setNodeKindFilter,
  nodes,
  visibleNodes,
  nodeIdSortDirection,
  setNodeIdSortDirection,
  segmentsCountByNodeId,
  selectedNodeId,
  describeNode,
  onEditNode,
  onDeleteNode
}: ModelingPrimaryTablesProps): ReactElement {
  const focusedConnector =
    (selectedConnectorId === null ? null : visibleConnectors.find((connector) => connector.id === selectedConnectorId) ?? null) ??
    visibleConnectors[0] ??
    null;
  const focusedSplice =
    (selectedSpliceId === null ? null : visibleSplices.find((splice) => splice.id === selectedSpliceId) ?? null) ??
    visibleSplices[0] ??
    null;
  const focusedNode =
    (selectedNodeId === null ? null : visibleNodes.find((node) => node.id === selectedNodeId) ?? null) ??
    visibleNodes[0] ??
    null;

  return (
    <>
      <article className="panel" hidden={!isConnectorSubScreen}>
        <h2>Connectors</h2>
        <div className="list-toolbar">
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
          <p className="empty-copy">No connector matches the current filters.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => setConnectorSort((current) => nextSortState(current, "name"))}>Name <span className="sort-indicator">{getSortIndicator(connectorSort, "name")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => setConnectorSort((current) => nextSortState(current, "technicalId"))}>Technical ID <span className="sort-indicator">{getSortIndicator(connectorSort, "technicalId")}</span></button></th>
                <th>Cavities</th>
                <th>Occupied</th>
              </tr>
            </thead>
            <tbody>
              {visibleConnectors.map((connector) => {
                const occupiedCount = connectorOccupiedCountById.get(connector.id) ?? 0;
                const isFocused = focusedConnector?.id === connector.id;
                return (
                  <tr
                    key={connector.id}
                    className={isFocused ? "is-selected is-focusable-row" : "is-focusable-row"}
                    aria-selected={isFocused}
                    tabIndex={0}
                    onClick={() => onEditConnector(connector)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onEditConnector(connector);
                      }
                    }}
                  >
                    <td>{connector.name}</td>
                    <td className="technical-id">{connector.technicalId}</td>
                    <td>{connector.cavityCount}</td>
                    <td>{occupiedCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="row-actions compact modeling-list-actions">
          <button type="button" onClick={onOpenCreateConnector}>New</button>
          <button type="button" onClick={() => focusedConnector !== null && onEditConnector(focusedConnector)} disabled={focusedConnector === null}>Edit</button>
          <button type="button" className="modeling-list-action-delete" onClick={() => focusedConnector !== null && onDeleteConnector(focusedConnector.id)} disabled={focusedConnector === null || connectorFormMode === "create"}>Delete</button>
        </div>
      </article>

      <article className="panel" hidden={!isSpliceSubScreen}>
        <h2>Splices</h2>
        <div className="list-toolbar">
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
          <p className="empty-copy">No splice matches the current filters.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => setSpliceSort((current) => nextSortState(current, "name"))}>Name <span className="sort-indicator">{getSortIndicator(spliceSort, "name")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => setSpliceSort((current) => nextSortState(current, "technicalId"))}>Technical ID <span className="sort-indicator">{getSortIndicator(spliceSort, "technicalId")}</span></button></th>
                <th>Ports</th>
                <th>Branches</th>
              </tr>
            </thead>
            <tbody>
              {visibleSplices.map((splice) => {
                const occupiedCount = spliceOccupiedCountById.get(splice.id) ?? 0;
                const isFocused = focusedSplice?.id === splice.id;
                return (
                  <tr
                    key={splice.id}
                    className={isFocused ? "is-selected is-focusable-row" : "is-focusable-row"}
                    aria-selected={isFocused}
                    tabIndex={0}
                    onClick={() => onEditSplice(splice)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onEditSplice(splice);
                      }
                    }}
                  >
                    <td><span className="splice-badge">Junction</span> {splice.name}</td>
                    <td className="technical-id">{splice.technicalId}</td>
                    <td>{splice.portCount}</td>
                    <td>{occupiedCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="row-actions compact modeling-list-actions">
          <button type="button" onClick={onOpenCreateSplice}>New</button>
          <button type="button" onClick={() => focusedSplice !== null && onEditSplice(focusedSplice)} disabled={focusedSplice === null}>Edit</button>
          <button type="button" className="modeling-list-action-delete" onClick={() => focusedSplice !== null && onDeleteSplice(focusedSplice.id)} disabled={focusedSplice === null || spliceFormMode === "create"}>Delete</button>
        </div>
      </article>

      <article className="panel" hidden={!isNodeSubScreen}>
        <h2>Nodes</h2>
        <div className="list-toolbar">
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
          <p className="empty-copy">No node matches the current filters.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => setNodeIdSortDirection((currentDirection) => currentDirection === "asc" ? "desc" : "asc")}>ID <span className="sort-indicator">{nodeIdSortDirection === "asc" ? "▲" : "▼"}</span></button></th>
                <th>Kind</th>
                <th>Reference</th>
                <th>Linked segments</th>
              </tr>
            </thead>
            <tbody>
              {visibleNodes.map((node) => {
                const linkedSegments = segmentsCountByNodeId.get(node.id) ?? 0;
                const isFocused = focusedNode?.id === node.id;
                return (
                  <tr
                    key={node.id}
                    className={isFocused ? "is-selected is-focusable-row" : "is-focusable-row"}
                    aria-selected={isFocused}
                    tabIndex={0}
                    onClick={() => onEditNode(node)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onEditNode(node);
                      }
                    }}
                  >
                    <td className="technical-id">{node.id}</td>
                    <td>{node.kind}</td>
                    <td>{describeNode(node)}</td>
                    <td>{linkedSegments}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="row-actions compact modeling-list-actions">
          <button type="button" onClick={onOpenCreateNode}>New</button>
          <button type="button" onClick={() => focusedNode !== null && onEditNode(focusedNode)} disabled={focusedNode === null}>Edit</button>
          <button type="button" className="modeling-list-action-delete" onClick={() => focusedNode !== null && onDeleteNode(focusedNode.id)} disabled={focusedNode === null || nodeFormMode === "create"}>Delete</button>
        </div>
      </article>
    </>
  );
}
