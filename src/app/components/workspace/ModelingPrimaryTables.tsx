import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { getTableAriaSort } from "../../lib/accessibility";
import { focusElementWithoutScroll, sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";
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
  connectorFilterField: "name" | "technicalId" | "any";
  setConnectorFilterField: (value: "name" | "technicalId" | "any") => void;
  connectorFilterQuery: string;
  setConnectorFilterQuery: (value: string) => void;
  connectors: Connector[];
  visibleConnectors: Connector[];
  connectorSort: SortState;
  setConnectorSort: (value: SortState | ((current: SortState) => SortState)) => void;
  getSortIndicator: (sortState: SortState, field: SortState["field"]) => string;
  connectorOccupiedCountById: Map<ConnectorId, number>;
  selectedConnectorId: ConnectorId | null;
  onEditConnector: (connector: Connector) => void;
  onDeleteConnector: (connectorId: ConnectorId) => void;
  onOpenConnectorOnboardingHelp?: () => void;
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

export function ModelingPrimaryTables({
  isConnectorSubScreen,
  connectorFormMode,
  onOpenCreateConnector,
  connectorOccupancyFilter,
  setConnectorOccupancyFilter,
  connectorFilterField,
  setConnectorFilterField,
  connectorFilterQuery,
  setConnectorFilterQuery,
  connectors,
  visibleConnectors,
  connectorSort,
  setConnectorSort,
  connectorOccupiedCountById,
  selectedConnectorId,
  onEditConnector,
  onDeleteConnector,
  onOpenConnectorOnboardingHelp,
  isSpliceSubScreen,
  spliceFormMode,
  onOpenCreateSplice,
  spliceOccupancyFilter,
  setSpliceOccupancyFilter,
  spliceFilterField,
  setSpliceFilterField,
  spliceFilterQuery,
  setSpliceFilterQuery,
  splices,
  visibleSplices,
  spliceSort,
  setSpliceSort,
  spliceOccupiedCountById,
  selectedSpliceId,
  onEditSplice,
  onDeleteSplice,
  onOpenSpliceOnboardingHelp,
  isNodeSubScreen,
  nodeFormMode,
  onOpenCreateNode,
  nodeKindFilter,
  setNodeKindFilter,
  nodeFilterField,
  setNodeFilterField,
  nodeFilterQuery,
  setNodeFilterQuery,
  nodes,
  visibleNodes,
  nodeIdSortDirection,
  setNodeIdSortDirection,
  segmentsCountByNodeId,
  selectedNodeId,
  describeNode,
  onEditNode,
  onDeleteNode,
  onOpenNodeOnboardingHelp
}: ModelingPrimaryTablesProps): ReactElement {
  type ConnectorTableSortField = "name" | "technicalId" | "manufacturerReference" | "cavityCount" | "occupiedCount";
  type SpliceTableSortField = "name" | "technicalId" | "manufacturerReference" | "portCount" | "branchCount";
  type NodeTableSortField = "id" | "kind" | "reference" | "linkedSegments";
  const connectorRowRefs = useRef<Partial<Record<ConnectorId, HTMLTableRowElement | null>>>({});
  const spliceRowRefs = useRef<Partial<Record<SpliceId, HTMLTableRowElement | null>>>({});
  const nodeRowRefs = useRef<Partial<Record<NodeId, HTMLTableRowElement | null>>>({});
  const lastAutoFocusedConnectorIdRef = useRef<ConnectorId | null>(null);
  const lastAutoFocusedSpliceIdRef = useRef<SpliceId | null>(null);
  const lastAutoFocusedNodeIdRef = useRef<NodeId | null>(null);
  const isMobileViewport = useIsMobileViewport();
  const previousConnectorFormModeRef = useRef<typeof connectorFormMode>(connectorFormMode);
  const previousSpliceFormModeRef = useRef<typeof spliceFormMode>(spliceFormMode);
  const previousNodeFormModeRef = useRef<typeof nodeFormMode>(nodeFormMode);
  const focusedConnector =
    selectedConnectorId === null ? null : (visibleConnectors.find((connector) => connector.id === selectedConnectorId) ?? null);
  const focusedSplice =
    selectedSpliceId === null ? null : (visibleSplices.find((splice) => splice.id === selectedSpliceId) ?? null);
  const focusedNode =
    selectedNodeId === null ? null : (visibleNodes.find((node) => node.id === selectedNodeId) ?? null);
  const showNodeKindColumn = nodeKindFilter === "all";
  const connectorFilterPlaceholder =
    connectorFilterField === "name"
      ? "Connector name"
      : connectorFilterField === "technicalId"
        ? "Technical ID"
        : "Name or technical ID";
  const spliceFilterPlaceholder =
    spliceFilterField === "name"
      ? "Splice name"
      : spliceFilterField === "technicalId"
        ? "Technical ID"
        : "Name or technical ID";
  const nodeFilterPlaceholder =
    nodeFilterField === "id"
      ? "Node ID"
      : nodeFilterField === "kind"
        ? "connector / splice / intermediate"
        : nodeFilterField === "reference"
          ? "Reference"
          : "ID, kind, reference...";
  const [connectorTableSort, setConnectorTableSort] = useState<{ field: ConnectorTableSortField; direction: SortDirection }>({
    field: "name",
    direction: "asc"
  });
  const [spliceTableSort, setSpliceTableSort] = useState<{ field: SpliceTableSortField; direction: SortDirection }>({
    field: "name",
    direction: "asc"
  });
  const [nodeTableSort, setNodeTableSort] = useState<{ field: NodeTableSortField; direction: SortDirection }>({
    field: "id",
    direction: "asc"
  });
  useEffect(() => {
    if (connectorSort.field !== "name" && connectorSort.field !== "technicalId") {
      return;
    }
    const nextField: ConnectorTableSortField = connectorSort.field;
    setConnectorTableSort((current) =>
      current.field === nextField && current.direction === connectorSort.direction
        ? current
        : { field: nextField, direction: connectorSort.direction }
    );
  }, [connectorSort]);
  useEffect(() => {
    if (spliceSort.field !== "name" && spliceSort.field !== "technicalId") {
      return;
    }
    const nextField: SpliceTableSortField = spliceSort.field;
    setSpliceTableSort((current) =>
      current.field === nextField && current.direction === spliceSort.direction
        ? current
        : { field: nextField, direction: spliceSort.direction }
    );
  }, [spliceSort]);
  useEffect(() => {
    setNodeTableSort((current) =>
      current.field === "id" && current.direction === nodeIdSortDirection
        ? current
        : { field: "id", direction: nodeIdSortDirection }
    );
  }, [nodeIdSortDirection]);
  const sortedVisibleConnectors = useMemo(
    () =>
      sortByTableColumns(
        visibleConnectors,
        connectorTableSort,
        (connector, field) => {
          if (field === "name") return connector.name;
          if (field === "technicalId") return connector.technicalId;
          if (field === "manufacturerReference") return connector.manufacturerReference;
          if (field === "cavityCount") return connector.cavityCount;
          return connectorOccupiedCountById.get(connector.id) ?? 0;
        },
        (connector) => connector.id
      ),
    [connectorOccupiedCountById, connectorTableSort, visibleConnectors]
  );
  const sortedVisibleSplices = useMemo(
    () =>
      sortByTableColumns(
        visibleSplices,
        spliceTableSort,
        (splice, field) => {
          if (field === "name") return splice.name;
          if (field === "technicalId") return splice.technicalId;
          if (field === "manufacturerReference") return splice.manufacturerReference;
          if (field === "portCount") return splice.portCount;
          return spliceOccupiedCountById.get(splice.id) ?? 0;
        },
        (splice) => splice.id
      ),
    [spliceOccupiedCountById, spliceTableSort, visibleSplices]
  );
  const sortedVisibleNodes = useMemo(
    () =>
      sortByTableColumns(
        visibleNodes,
        nodeTableSort,
        (node, field) => {
          if (field === "id") return node.id;
          if (field === "kind") return node.kind;
          if (field === "reference") return describeNode(node);
          return segmentsCountByNodeId.get(node.id) ?? 0;
        },
        (node) => node.id
      ),
    [describeNode, nodeTableSort, segmentsCountByNodeId, visibleNodes]
  );
  const connectorSortIndicator = (field: ConnectorTableSortField) =>
    connectorTableSort.field === field ? (connectorTableSort.direction === "asc" ? "▲" : "▼") : "";
  const spliceSortIndicator = (field: SpliceTableSortField) =>
    spliceTableSort.field === field ? (spliceTableSort.direction === "asc" ? "▲" : "▼") : "";
  const nodeSortIndicator = (field: NodeTableSortField) =>
    nodeTableSort.field === field ? (nodeTableSort.direction === "asc" ? "▲" : "▼") : "";

  useEffect(() => {
    if (connectorFormMode !== "edit" || selectedConnectorId === null) {
      lastAutoFocusedConnectorIdRef.current = null;
      return;
    }
    if (lastAutoFocusedConnectorIdRef.current === selectedConnectorId) {
      return;
    }
    lastAutoFocusedConnectorIdRef.current = selectedConnectorId;
    if (typeof window === "undefined") {
      focusElementWithoutScroll(connectorRowRefs.current[selectedConnectorId]);
      return;
    }
    window.requestAnimationFrame(() => {
      focusElementWithoutScroll(connectorRowRefs.current[selectedConnectorId]);
    });
  }, [connectorFormMode, selectedConnectorId]);

  useEffect(() => {
    if (spliceFormMode !== "edit" || selectedSpliceId === null) {
      lastAutoFocusedSpliceIdRef.current = null;
      return;
    }
    if (lastAutoFocusedSpliceIdRef.current === selectedSpliceId) {
      return;
    }
    lastAutoFocusedSpliceIdRef.current = selectedSpliceId;
    if (typeof window === "undefined") {
      focusElementWithoutScroll(spliceRowRefs.current[selectedSpliceId]);
      return;
    }
    window.requestAnimationFrame(() => {
      focusElementWithoutScroll(spliceRowRefs.current[selectedSpliceId]);
    });
  }, [spliceFormMode, selectedSpliceId]);

  useEffect(() => {
    if (nodeFormMode !== "edit" || selectedNodeId === null) {
      lastAutoFocusedNodeIdRef.current = null;
      return;
    }
    if (lastAutoFocusedNodeIdRef.current === selectedNodeId) {
      return;
    }
    lastAutoFocusedNodeIdRef.current = selectedNodeId;
    if (typeof window === "undefined") {
      focusElementWithoutScroll(nodeRowRefs.current[selectedNodeId]);
      return;
    }
    window.requestAnimationFrame(() => {
      focusElementWithoutScroll(nodeRowRefs.current[selectedNodeId]);
    });
  }, [nodeFormMode, selectedNodeId]);

  useEffect(() => {
    const previousMode = previousConnectorFormModeRef.current;
    previousConnectorFormModeRef.current = connectorFormMode;
    if (previousMode !== "edit" || connectorFormMode !== "create" || selectedConnectorId === null) {
      return;
    }
    if (typeof window === "undefined") {
      focusElementWithoutScroll(connectorRowRefs.current[selectedConnectorId]);
      return;
    }
    window.requestAnimationFrame(() => {
      focusElementWithoutScroll(connectorRowRefs.current[selectedConnectorId]);
    });
  }, [connectorFormMode, selectedConnectorId]);

  useEffect(() => {
    const previousMode = previousSpliceFormModeRef.current;
    previousSpliceFormModeRef.current = spliceFormMode;
    if (previousMode !== "edit" || spliceFormMode !== "create" || selectedSpliceId === null) {
      return;
    }
    if (typeof window === "undefined") {
      focusElementWithoutScroll(spliceRowRefs.current[selectedSpliceId]);
      return;
    }
    window.requestAnimationFrame(() => {
      focusElementWithoutScroll(spliceRowRefs.current[selectedSpliceId]);
    });
  }, [spliceFormMode, selectedSpliceId]);

  useEffect(() => {
    const previousMode = previousNodeFormModeRef.current;
    previousNodeFormModeRef.current = nodeFormMode;
    if (previousMode !== "edit" || nodeFormMode !== "create" || selectedNodeId === null) {
      return;
    }
    if (typeof window === "undefined") {
      focusElementWithoutScroll(nodeRowRefs.current[selectedNodeId]);
      return;
    }
    window.requestAnimationFrame(() => {
      focusElementWithoutScroll(nodeRowRefs.current[selectedNodeId]);
    });
  }, [nodeFormMode, selectedNodeId]);

  return (
    <>
      <article className="panel" hidden={!isConnectorSubScreen} data-onboarding-panel="modeling-connectors">
        <header className="list-panel-header list-panel-header-mobile-inline-tools">
          <h2>Connectors</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row is-title-actions">
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() =>
                  downloadCsvFile(
                    "modeling-connectors",
                    ["Name", "Technical ID", "Mfr Ref", "Ways", "Occupied"],
                    sortedVisibleConnectors.map((connector) => [
                      connector.name,
                      connector.technicalId,
                      connector.manufacturerReference ?? "",
                      connector.cavityCount,
                      connectorOccupiedCountById.get(connector.id) ?? 0
                    ])
                  )
                }
                disabled={sortedVisibleConnectors.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                CSV
              </button>
              {onOpenConnectorOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenConnectorOnboardingHelp}
                >
                  <span className="action-button-icon is-help" aria-hidden="true" />
                  <span>Help</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row is-filter-row">
              <div className="chip-group list-panel-filters" role="group" aria-label="Connector occupancy filter">
                {([
                  ["all", "All"],
                  ["occupied", "Occupied"],
                  ["free", "Free"]
                ] as const).map(([filterId, label]) => (
                  <button key={filterId} type="button" className={connectorOccupancyFilter === filterId ? "filter-chip is-active" : "filter-chip"} onClick={() => setConnectorOccupancyFilter(filterId)}>{label}</button>
                ))}
              </div>
              <TableFilterBar
                label="Filter"
                fieldLabel="Connector filter field"
                fieldValue={connectorFilterField}
                onFieldChange={(value) => setConnectorFilterField(value as "name" | "technicalId" | "any")}
                fieldOptions={[
                  { value: "name", label: "Name" },
                  { value: "technicalId", label: "Technical ID" },
                  { value: "any", label: "Any" }
                ]}
                queryValue={connectorFilterQuery}
                onQueryChange={setConnectorFilterQuery}
                placeholder={connectorFilterPlaceholder}
              />
            </div>
          </div>
        </header>
        {connectors.length === 0 ? (
          <p className="empty-copy">No connector yet.</p>
        ) : sortedVisibleConnectors.length === 0 ? (
          <>
            <p className="empty-copy">No connector matches the current filters.</p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <>
            <table className="data-table">
              <thead>
              <tr>
                <th aria-sort={getTableAriaSort(connectorTableSort, "name")}><button type="button" className="sort-header-button" onClick={() => { setConnectorTableSort((current) => ({ field: "name", direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc" })); setConnectorSort((current) => ({ field: "name", direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc" })); }}>Name <span className="sort-indicator">{connectorSortIndicator("name")}</span></button></th>
                <th aria-sort={getTableAriaSort(connectorTableSort, "technicalId")}><button type="button" className="sort-header-button" onClick={() => { setConnectorTableSort((current) => ({ field: "technicalId", direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc" })); setConnectorSort((current) => ({ field: "technicalId", direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc" })); }}>{isMobileViewport ? "ID" : "Technical ID"} <span className="sort-indicator">{connectorSortIndicator("technicalId")}</span></button></th>
                <th aria-sort={getTableAriaSort(connectorTableSort, "manufacturerReference")}><button type="button" className="sort-header-button" onClick={() => setConnectorTableSort((current) => ({ field: "manufacturerReference", direction: current.field === "manufacturerReference" && current.direction === "asc" ? "desc" : "asc" }))}>Mfr Ref <span className="sort-indicator">{connectorSortIndicator("manufacturerReference")}</span></button></th>
                <th aria-sort={getTableAriaSort(connectorTableSort, "cavityCount")}><button type="button" className="sort-header-button" onClick={() => setConnectorTableSort((current) => ({ field: "cavityCount", direction: current.field === "cavityCount" && current.direction === "asc" ? "desc" : "asc" }))}>Ways <span className="sort-indicator">{connectorSortIndicator("cavityCount")}</span></button></th>
                <th aria-sort={getTableAriaSort(connectorTableSort, "occupiedCount")}><button type="button" className="sort-header-button" onClick={() => setConnectorTableSort((current) => ({ field: "occupiedCount", direction: current.field === "occupiedCount" && current.direction === "asc" ? "desc" : "asc" }))}>{isMobileViewport ? "Occup." : "Occupied"} <span className="sort-indicator">{connectorSortIndicator("occupiedCount")}</span></button></th>
              </tr>
              </thead>
              <tbody>
              {sortedVisibleConnectors.map((connector) => {
                const occupiedCount = connectorOccupiedCountById.get(connector.id) ?? 0;
                const isFocused = focusedConnector?.id === connector.id;
                return (
                  <tr
                    key={connector.id}
                    ref={(element) => {
                      connectorRowRefs.current[connector.id] = element;
                    }}
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
                    <td className="technical-id">{connector.manufacturerReference ?? ""}</td>
                    <td>{connector.cavityCount}</td>
                    <td>{occupiedCount}</td>
                  </tr>
                );
              })}
              </tbody>
            </table>
            <TableEntryCountFooter count={sortedVisibleConnectors.length} />
          </>
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

      <article className="panel" hidden={!isSpliceSubScreen} data-onboarding-panel="modeling-splices">
        <header className="list-panel-header list-panel-header-mobile-inline-tools">
          <h2>Splices</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row is-title-actions">
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() =>
                  downloadCsvFile(
                    "modeling-splices",
                    ["Name", "Technical ID", "Mfr Ref", "Ports", "Branches"],
                    sortedVisibleSplices.map((splice) => [
                      splice.name,
                      splice.technicalId,
                      splice.manufacturerReference ?? "",
                      splice.portCount,
                      spliceOccupiedCountById.get(splice.id) ?? 0
                    ])
                  )
                }
                disabled={sortedVisibleSplices.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                CSV
              </button>
              {onOpenSpliceOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenSpliceOnboardingHelp}
                >
                  <span className="action-button-icon is-help" aria-hidden="true" />
                  <span>Help</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row is-filter-row">
              <div className="chip-group list-panel-filters" role="group" aria-label="Splice occupancy filter">
                {([
                  ["all", "All"],
                  ["occupied", "Occupied"],
                  ["free", "Free"]
                ] as const).map(([filterId, label]) => (
                  <button key={filterId} type="button" className={spliceOccupancyFilter === filterId ? "filter-chip is-active" : "filter-chip"} onClick={() => setSpliceOccupancyFilter(filterId)}>{label}</button>
                ))}
              </div>
              <TableFilterBar
                label="Filter"
                fieldLabel="Splice filter field"
                fieldValue={spliceFilterField}
                onFieldChange={(value) => setSpliceFilterField(value as "name" | "technicalId" | "any")}
                fieldOptions={[
                  { value: "name", label: "Name" },
                  { value: "technicalId", label: "Technical ID" },
                  { value: "any", label: "Any" }
                ]}
                queryValue={spliceFilterQuery}
                onQueryChange={setSpliceFilterQuery}
                placeholder={spliceFilterPlaceholder}
              />
            </div>
          </div>
        </header>
        {splices.length === 0 ? (
          <p className="empty-copy">No splice yet.</p>
        ) : sortedVisibleSplices.length === 0 ? (
          <>
            <p className="empty-copy">No splice matches the current filters.</p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <>
            <table className="data-table">
              <thead>
              <tr>
                <th aria-sort={getTableAriaSort(spliceTableSort, "name")}><button type="button" className="sort-header-button" onClick={() => { setSpliceTableSort((current) => ({ field: "name", direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc" })); setSpliceSort((current) => ({ field: "name", direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc" })); }}>Name <span className="sort-indicator">{spliceSortIndicator("name")}</span></button></th>
                <th aria-sort={getTableAriaSort(spliceTableSort, "technicalId")}><button type="button" className="sort-header-button" onClick={() => { setSpliceTableSort((current) => ({ field: "technicalId", direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc" })); setSpliceSort((current) => ({ field: "technicalId", direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc" })); }}>{isMobileViewport ? "ID" : "Technical ID"} <span className="sort-indicator">{spliceSortIndicator("technicalId")}</span></button></th>
                <th aria-sort={getTableAriaSort(spliceTableSort, "manufacturerReference")}><button type="button" className="sort-header-button" onClick={() => setSpliceTableSort((current) => ({ field: "manufacturerReference", direction: current.field === "manufacturerReference" && current.direction === "asc" ? "desc" : "asc" }))}>Mfr Ref <span className="sort-indicator">{spliceSortIndicator("manufacturerReference")}</span></button></th>
                <th aria-sort={getTableAriaSort(spliceTableSort, "portCount")}><button type="button" className="sort-header-button" onClick={() => setSpliceTableSort((current) => ({ field: "portCount", direction: current.field === "portCount" && current.direction === "asc" ? "desc" : "asc" }))}>Ports <span className="sort-indicator">{spliceSortIndicator("portCount")}</span></button></th>
                <th aria-sort={getTableAriaSort(spliceTableSort, "branchCount")}><button type="button" className="sort-header-button" onClick={() => setSpliceTableSort((current) => ({ field: "branchCount", direction: current.field === "branchCount" && current.direction === "asc" ? "desc" : "asc" }))}>Branches <span className="sort-indicator">{spliceSortIndicator("branchCount")}</span></button></th>
              </tr>
              </thead>
              <tbody>
              {sortedVisibleSplices.map((splice) => {
                const occupiedCount = spliceOccupiedCountById.get(splice.id) ?? 0;
                const isFocused = focusedSplice?.id === splice.id;
                return (
                  <tr
                    key={splice.id}
                    ref={(element) => {
                      spliceRowRefs.current[splice.id] = element;
                    }}
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
                    <td className="technical-id">{splice.manufacturerReference ?? ""}</td>
                    <td>{splice.portCount}</td>
                    <td>{occupiedCount}</td>
                  </tr>
                );
              })}
              </tbody>
            </table>
            <TableEntryCountFooter count={sortedVisibleSplices.length} />
          </>
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

      <article className="panel" hidden={!isNodeSubScreen} data-onboarding-panel="modeling-nodes">
        <header className="list-panel-header list-panel-header-mobile-inline-tools">
          <h2>Nodes</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row is-title-actions">
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() => {
                  const headers = showNodeKindColumn
                    ? ["ID", "Kind", "Reference", "Linked segments"]
                    : ["ID", "Reference", "Linked segments"];
                  const rows = sortedVisibleNodes.map((node) => {
                    const linkedSegments = segmentsCountByNodeId.get(node.id) ?? 0;
                    if (showNodeKindColumn) {
                      return [node.id, node.kind, describeNode(node), linkedSegments];
                    }
                    return [node.id, describeNode(node), linkedSegments];
                  });
                  downloadCsvFile("modeling-nodes", headers, rows);
                }}
                disabled={sortedVisibleNodes.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                CSV
              </button>
              {onOpenNodeOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenNodeOnboardingHelp}
                >
                  <span className="action-button-icon is-help" aria-hidden="true" />
                  <span>Help</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row is-filter-row">
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
              <TableFilterBar
                label="Filter"
                fieldLabel="Node filter field"
                fieldValue={nodeFilterField}
                onFieldChange={(value) => setNodeFilterField(value as "id" | "kind" | "reference" | "any")}
                fieldOptions={[
                  { value: "id", label: "Node ID" },
                  { value: "kind", label: "Kind" },
                  { value: "reference", label: "Reference" },
                  { value: "any", label: "Any" }
                ]}
                queryValue={nodeFilterQuery}
                onQueryChange={setNodeFilterQuery}
                placeholder={nodeFilterPlaceholder}
              />
            </div>
          </div>
        </header>
        {nodes.length === 0 ? (
          <p className="empty-copy">No node yet.</p>
        ) : sortedVisibleNodes.length === 0 ? (
          <>
            <p className="empty-copy">No node matches the current filters.</p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <>
            <table className="data-table">
              <thead>
              <tr>
                <th aria-sort={getTableAriaSort(nodeTableSort, "id")}><button type="button" className="sort-header-button" onClick={() => { setNodeTableSort((current) => ({ field: "id", direction: current.field === "id" && current.direction === "asc" ? "desc" : "asc" })); setNodeIdSortDirection((current) => current === "asc" ? "desc" : "asc"); }}>ID <span className="sort-indicator">{nodeSortIndicator("id")}</span></button></th>
                {showNodeKindColumn ? <th aria-sort={getTableAriaSort(nodeTableSort, "kind")}><button type="button" className="sort-header-button" onClick={() => setNodeTableSort((current) => ({ field: "kind", direction: current.field === "kind" && current.direction === "asc" ? "desc" : "asc" }))}>Kind <span className="sort-indicator">{nodeSortIndicator("kind")}</span></button></th> : null}
                <th aria-sort={getTableAriaSort(nodeTableSort, "reference")}><button type="button" className="sort-header-button" onClick={() => setNodeTableSort((current) => ({ field: "reference", direction: current.field === "reference" && current.direction === "asc" ? "desc" : "asc" }))}>{isMobileViewport ? "Ref." : "Reference"} <span className="sort-indicator">{nodeSortIndicator("reference")}</span></button></th>
                <th aria-sort={getTableAriaSort(nodeTableSort, "linkedSegments")}><button type="button" className="sort-header-button" onClick={() => setNodeTableSort((current) => ({ field: "linkedSegments", direction: current.field === "linkedSegments" && current.direction === "asc" ? "desc" : "asc" }))}>Linked segments <span className="sort-indicator">{nodeSortIndicator("linkedSegments")}</span></button></th>
              </tr>
              </thead>
              <tbody>
              {sortedVisibleNodes.map((node) => {
                const linkedSegments = segmentsCountByNodeId.get(node.id) ?? 0;
                const isFocused = focusedNode?.id === node.id;
                return (
                  <tr
                    key={node.id}
                    ref={(element) => {
                      nodeRowRefs.current[node.id] = element;
                    }}
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
            <TableEntryCountFooter count={sortedVisibleNodes.length} />
          </>
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
