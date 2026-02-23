import type { ReactElement } from "react";
import { nextSortState } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
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
  connectorFormMode: "idle" | "create" | "edit";
  onOpenCreateConnector: () => void;
  connectorOccupancyFilter: OccupancyFilter;
  setConnectorOccupancyFilter: (value: OccupancyFilter) => void;
  connectors: Connector[];
  visibleConnectors: Connector[];
  connectorSort: SortState;
  setConnectorSort: (value: SortState | ((current: SortState) => SortState)) => void;
  getSortIndicator: (sortState: SortState, field: SortState["field"]) => string;
  connectorOccupiedCountById: Map<ConnectorId, number>;
  selectedConnectorId: ConnectorId | null;
  onEditConnector: (connector: Connector) => void;
  onDeleteConnector: (connectorId: ConnectorId) => void;
  isSpliceSubScreen: boolean;
  spliceFormMode: "idle" | "create" | "edit";
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
  nodeFormMode: "idle" | "create" | "edit";
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
    selectedConnectorId === null ? null : (visibleConnectors.find((connector) => connector.id === selectedConnectorId) ?? null);
  const focusedSplice =
    selectedSpliceId === null ? null : (visibleSplices.find((splice) => splice.id === selectedSpliceId) ?? null);
  const focusedNode =
    selectedNodeId === null ? null : (visibleNodes.find((node) => node.id === selectedNodeId) ?? null);
  const showNodeKindColumn = nodeKindFilter === "all";

  return (
    <>
      <article className="panel" hidden={!isConnectorSubScreen}>
        <header className="list-panel-header">
          <h2>Connectors</h2>
          <div className="list-panel-header-tools">
            <div className="chip-group list-panel-filters" role="group" aria-label="Connector occupancy filter">
              {([
                ["all", "All"],
                ["occupied", "Occupied"],
                ["free", "Free"]
              ] as const).map(([filterId, label]) => (
                <button key={filterId} type="button" className={connectorOccupancyFilter === filterId ? "filter-chip is-active" : "filter-chip"} onClick={() => setConnectorOccupancyFilter(filterId)}>{label}</button>
              ))}
            </div>
            <button
              type="button"
              className="filter-chip table-export-button"
              onClick={() =>
                downloadCsvFile(
                  "modeling-connectors",
                  ["Name", "Technical ID", "Ways", "Occupied"],
                  visibleConnectors.map((connector) => [
                    connector.name,
                    connector.technicalId,
                    connector.cavityCount,
                    connectorOccupiedCountById.get(connector.id) ?? 0
                  ])
                )
              }
              disabled={visibleConnectors.length === 0}
            >
              <span className="table-export-icon" aria-hidden="true" />
              CSV
            </button>
          </div>
        </header>
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
                <th>Ways</th>
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
          <button type="button" className="button-with-icon" onClick={onOpenCreateConnector}>
            <span className="action-button-icon is-new" aria-hidden="true" />
            New
          </button>
          <button
            type="button"
            className="button-with-icon"
            onClick={() => focusedConnector !== null && onEditConnector(focusedConnector)}
            disabled={focusedConnector === null}
          >
            <span className="action-button-icon is-edit" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className="modeling-list-action-delete button-with-icon"
            onClick={() => focusedConnector !== null && onDeleteConnector(focusedConnector.id)}
            disabled={focusedConnector === null || connectorFormMode === "create"}
          >
            <span className="action-button-icon is-delete" aria-hidden="true" />
            Delete
          </button>
        </div>
      </article>

      <article className="panel" hidden={!isSpliceSubScreen}>
        <header className="list-panel-header">
          <h2>Splices</h2>
          <div className="list-panel-header-tools">
            <div className="chip-group list-panel-filters" role="group" aria-label="Splice occupancy filter">
              {([
                ["all", "All"],
                ["occupied", "Occupied"],
                ["free", "Free"]
              ] as const).map(([filterId, label]) => (
                <button key={filterId} type="button" className={spliceOccupancyFilter === filterId ? "filter-chip is-active" : "filter-chip"} onClick={() => setSpliceOccupancyFilter(filterId)}>{label}</button>
              ))}
            </div>
            <button
              type="button"
              className="filter-chip table-export-button"
              onClick={() =>
                downloadCsvFile(
                  "modeling-splices",
                  ["Name", "Technical ID", "Ports", "Branches"],
                  visibleSplices.map((splice) => [
                    splice.name,
                    splice.technicalId,
                    splice.portCount,
                    spliceOccupiedCountById.get(splice.id) ?? 0
                  ])
                )
              }
              disabled={visibleSplices.length === 0}
            >
              <span className="table-export-icon" aria-hidden="true" />
              CSV
            </button>
          </div>
        </header>
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
                    <td>{splice.name}</td>
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
          <button type="button" className="button-with-icon" onClick={onOpenCreateSplice}>
            <span className="action-button-icon is-new" aria-hidden="true" />
            New
          </button>
          <button
            type="button"
            className="button-with-icon"
            onClick={() => focusedSplice !== null && onEditSplice(focusedSplice)}
            disabled={focusedSplice === null}
          >
            <span className="action-button-icon is-edit" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className="modeling-list-action-delete button-with-icon"
            onClick={() => focusedSplice !== null && onDeleteSplice(focusedSplice.id)}
            disabled={focusedSplice === null || spliceFormMode === "create"}
          >
            <span className="action-button-icon is-delete" aria-hidden="true" />
            Delete
          </button>
        </div>
      </article>

      <article className="panel" hidden={!isNodeSubScreen}>
        <header className="list-panel-header">
          <h2>Nodes</h2>
          <div className="list-panel-header-tools">
            <div className="chip-group list-panel-filters" role="group" aria-label="Node kind filter">
              {([
                ["all", "All"],
                ["connector", "Connector"],
                ["splice", "Splice"],
                ["intermediate", "Intermediate"]
              ] as const).map(([kindId, label]) => (
                <button key={kindId} type="button" className={nodeKindFilter === kindId ? "filter-chip is-active" : "filter-chip"} onClick={() => setNodeKindFilter(kindId)}>{label}</button>
              ))}
            </div>
            <button
              type="button"
              className="filter-chip table-export-button"
              onClick={() => {
                const headers = showNodeKindColumn
                  ? ["ID", "Kind", "Reference", "Linked segments"]
                  : ["ID", "Reference", "Linked segments"];
                const rows = visibleNodes.map((node) => {
                  const linkedSegments = segmentsCountByNodeId.get(node.id) ?? 0;
                  if (showNodeKindColumn) {
                    return [node.id, node.kind, describeNode(node), linkedSegments];
                  }
                  return [node.id, describeNode(node), linkedSegments];
                });
                downloadCsvFile("modeling-nodes", headers, rows);
              }}
              disabled={visibleNodes.length === 0}
            >
              <span className="table-export-icon" aria-hidden="true" />
              CSV
            </button>
          </div>
        </header>
        {nodes.length === 0 ? (
          <p className="empty-copy">No node yet.</p>
        ) : visibleNodes.length === 0 ? (
          <p className="empty-copy">No node matches the current filters.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => setNodeIdSortDirection((currentDirection) => currentDirection === "asc" ? "desc" : "asc")}>ID <span className="sort-indicator">{nodeIdSortDirection === "asc" ? "▲" : "▼"}</span></button></th>
                {showNodeKindColumn ? <th>Kind</th> : null}
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
                    {showNodeKindColumn ? <td>{node.kind}</td> : null}
                    <td>{describeNode(node)}</td>
                    <td>{linkedSegments}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="row-actions compact modeling-list-actions">
          <button type="button" className="button-with-icon" onClick={onOpenCreateNode}>
            <span className="action-button-icon is-new" aria-hidden="true" />
            New
          </button>
          <button
            type="button"
            className="button-with-icon"
            onClick={() => focusedNode !== null && onEditNode(focusedNode)}
            disabled={focusedNode === null}
          >
            <span className="action-button-icon is-edit" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className="modeling-list-action-delete button-with-icon"
            onClick={() => focusedNode !== null && onDeleteNode(focusedNode.id)}
            disabled={focusedNode === null || nodeFormMode === "create"}
          >
            <span className="action-button-icon is-delete" aria-hidden="true" />
            Delete
          </button>
        </div>
      </article>
    </>
  );
}
