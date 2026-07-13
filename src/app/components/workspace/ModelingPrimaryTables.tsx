import { translateCurrent as t } from "../../lib/i18n";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { getTableAriaSort } from "../../lib/accessibility";
import {
  focusElementWithoutScroll,
  sortByTableColumns,
} from "../../lib/app-utils-shared";
import { logPerfDuration } from "../../lib/perfDebug";
import { arePanelMemoPropsEqual } from "../../lib/renderMemoCompare";
import { downloadCsvFile } from "../../lib/csv";
import { FORM_PANEL_IDS, scrollToFormPanel } from "../../lib/form-panel-scroll";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";
import type {
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Splice,
  SpliceId,
} from "../../../core/entities";
import type { SortDirection } from "../../types/app-controller";
import { EntityReferenceButton } from "./EntityReferenceButton";
import type { ModelingPrimaryTablesProps } from "./ModelingPrimaryTables.types";
import { PinRoleMassEditDialog } from "./PinRoleMassEditDialog";
import { ConfigurableTableColumnsControl, type ConfigurableTableColumn } from "./ConfigurableTableColumns";

function ModelingPrimaryTablesComponent({
  activeBatchScope,
  batchSelectionIds,
  onEnterBatchMode,
  onExitBatchMode,
  onToggleBatchSelection,
  onSetBatchSelectionForVisible,
  onOpenBatchSelectionDialog,
  onDeleteSelectedInBatchMode,
  tableColumnPreferences,
  setTableColumnPreferences,
  isConnectorSubScreen,
  connectorFormMode,
  onOpenCreateConnector,
  connectorOccupancyFilter,
  setConnectorOccupancyFilter,
  connectorFilterField,
  setConnectorFilterField,
  connectorFilterQuery,
  setConnectorFilterQuery,
  catalogItems,
  connectors,
  visibleConnectors,
  connectorSort,
  setConnectorSort,
  connectorOccupiedCountById,
  selectedConnectorId,
  onEditConnector,
  onSelectCatalogItem,
  onDeleteConnector,
  onOpenConnectorOnboardingHelp,
  activeNetwork,
  wires,
  onApplyPinRoleMassEdit,
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
  segments,
  visibleSplices,
  spliceSort,
  setSpliceSort,
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
  onOpenNodeOnboardingHelp,
}: ModelingPrimaryTablesProps): ReactElement {
  const renderStartedAt = performance.now();
  useEffect(() => {
    logPerfDuration("render+commit ModelingPrimaryTables", renderStartedAt, {
      connectors: visibleConnectors.length,
      splices: visibleSplices.length,
      nodes: visibleNodes.length,
      activeSubScreen: isConnectorSubScreen ? "connector" : isSpliceSubScreen ? "splice" : isNodeSubScreen ? "node" : "other"
    });
  });

  type ConnectorTableSortField =
    | "name"
    | "technicalId"
    | "manufacturerReference"
    | "cavityCount"
    | "occupiedCount";
  type SpliceTableSortField =
    | "name"
    | "technicalId"
    | "manufacturerReference"
    | "connectedWireCount"
    | "hostSegment"
    | "offsetMm";
  type NodeTableSortField = "id" | "kind" | "reference" | "linkedSegments";
  const connectorRowRefs = useRef<
    Partial<Record<ConnectorId, HTMLTableRowElement | null>>
  >({});
  const connectorTableRef = useRef<HTMLTableElement | null>(null);
  const spliceRowRefs = useRef<
    Partial<Record<SpliceId, HTMLTableRowElement | null>>
  >({});
  const spliceTableRef = useRef<HTMLTableElement | null>(null);
  const nodeRowRefs = useRef<
    Partial<Record<NodeId, HTMLTableRowElement | null>>
  >({});
  const nodeTableRef = useRef<HTMLTableElement | null>(null);
  const lastAutoFocusedConnectorIdRef = useRef<ConnectorId | null>(null);
  const lastAutoFocusedSpliceIdRef = useRef<SpliceId | null>(null);
  const lastAutoFocusedNodeIdRef = useRef<NodeId | null>(null);
  const isMobileViewport = useIsMobileViewport();
  const previousConnectorFormModeRef =
    useRef<typeof connectorFormMode>(connectorFormMode);
  const previousSpliceFormModeRef =
    useRef<typeof spliceFormMode>(spliceFormMode);
  const previousNodeFormModeRef = useRef<typeof nodeFormMode>(nodeFormMode);
  const isConnectorBatchMode = activeBatchScope === "connector";
  const isSpliceBatchMode = activeBatchScope === "splice";
  const isNodeBatchMode = activeBatchScope === "node";
  const focusedConnector =
    !isConnectorSubScreen || selectedConnectorId === null
      ? null
      : (visibleConnectors.find(
          (connector) => connector.id === selectedConnectorId,
        ) ?? null);
  const focusedSplice =
    !isSpliceSubScreen || selectedSpliceId === null
      ? null
      : (visibleSplices.find((splice) => splice.id === selectedSpliceId) ??
        null);
  const focusedNode =
    !isNodeSubScreen || selectedNodeId === null
      ? null
      : (visibleNodes.find((node) => node.id === selectedNodeId) ?? null);
  const showNodeKindColumn = nodeKindFilter === "all";
  const connectorColumns: ConfigurableTableColumn[] = [
    { id: "name", label: t("ui.name"), hideable: false },
    { id: "technicalId", label: t("ui.technicalID") },
    { id: "manufacturerReference", label: t("ui.mfrRef") },
    { id: "cavityCount", label: t("ui.ways") },
    { id: "occupiedCount", label: t("ui.occupied") },
  ];
  const spliceColumns: ConfigurableTableColumn[] = [
    { id: "name", label: t("ui.name"), hideable: false },
    { id: "technicalId", label: t("ui.technicalID") },
    { id: "manufacturerReference", label: t("ui.mfrRef") },
    { id: "hostSegment", label: t("ui.segment") },
    { id: "offsetMm", label: "Offset" },
    { id: "connectedWireCount", label: t("ui.connectedWires") },
  ];
  const nodeColumns: ConfigurableTableColumn[] = [
    { id: "id", label: t("ui.id"), hideable: false },
    ...(showNodeKindColumn ? [{ id: "kind", label: t("ui.kind") }] : []),
    { id: "reference", label: t("ui.reference") },
    { id: "linkedSegments", label: t("ui.linkedSegments") },
  ];
  const catalogItemById = useMemo(
    () => new Map(catalogItems.map((item) => [item.id, item] as const)),
    [catalogItems],
  );
  const segmentById = useMemo(
    () => new Map(segments.map((segment) => [segment.id, segment] as const)),
    [segments],
  );
  const nodeById = useMemo(
    () => new Map(nodes.map((node) => [node.id, node] as const)),
    [nodes],
  );
  const resolveSplicePlacementPresentation = useCallback(
    (splice: Splice) => {
      const placement = splice.placement;
      if (placement === undefined) {
        return {
          hostSegmentLabel: "Draft",
          fromNodeLabel: "Unplaced",
          offsetLabel: "Draft",
          hostSegmentSort: "",
          offsetSort: Number.NEGATIVE_INFINITY,
        };
      }

      const hostSegment = segmentById.get(placement.segmentId);
      const fromNode = nodeById.get(placement.fromNodeId);

      return {
        hostSegmentLabel: hostSegment?.id ?? placement.segmentId,
        fromNodeLabel:
          fromNode === undefined ? placement.fromNodeId : describeNode(fromNode),
        offsetLabel: `${placement.offsetMm} mm`,
        hostSegmentSort: placement.segmentId,
        offsetSort: placement.offsetMm,
      };
    },
    [describeNode, nodeById, segmentById],
  );
  const connectorFilterPlaceholder =
    connectorFilterField === "name"
      ? t("ui.connectorName")
      : connectorFilterField === "technicalId"
        ? t("ui.technicalID")
        : t("ui.nameOrTechnicalID");
  const spliceFilterPlaceholder =
    spliceFilterField === "name"
      ? t("ui.spliceName")
      : spliceFilterField === "technicalId"
        ? t("ui.technicalID")
        : t("ui.nameOrTechnicalID");
  const nodeFilterPlaceholder =
    nodeFilterField === "id"
      ? t("ui.nodeID")
      : nodeFilterField === "kind"
        ? t("ui.connectorSpliceIntermediate")
        : nodeFilterField === "reference"
          ? t("ui.reference")
          : t("ui.idKindReference");
  const [connectorTableSort, setConnectorTableSort] = useState<{
    field: ConnectorTableSortField;
    direction: SortDirection;
  }>({
    field: "name",
    direction: "asc",
  });
  const [spliceTableSort, setSpliceTableSort] = useState<{
    field: SpliceTableSortField;
    direction: SortDirection;
  }>({
    field: "name",
    direction: "asc",
  });
  const [nodeTableSort, setNodeTableSort] = useState<{
    field: NodeTableSortField;
    direction: SortDirection;
  }>({
    field: "id",
    direction: "asc",
  });
  const [isPinRoleMassEditOpen, setIsPinRoleMassEditOpen] = useState(false);
  const openCreateConnectorAndScroll = () => {
    onOpenCreateConnector();
    scrollToFormPanel(FORM_PANEL_IDS.connector);
  };
  const openEditConnectorAndScroll = (connector: Connector) => {
    onEditConnector(connector);
    scrollToFormPanel(FORM_PANEL_IDS.connector);
  };
  const openCreateSpliceAndScroll = () => {
    onOpenCreateSplice();
    scrollToFormPanel(FORM_PANEL_IDS.splice);
  };
  const openEditSpliceAndScroll = (splice: Splice) => {
    onEditSplice(splice);
    scrollToFormPanel(FORM_PANEL_IDS.splice);
  };
  const openCreateNodeAndScroll = () => {
    onOpenCreateNode();
    scrollToFormPanel(FORM_PANEL_IDS.node);
  };
  const openEditNodeAndScroll = (node: NetworkNode) => {
    onEditNode(node);
    scrollToFormPanel(FORM_PANEL_IDS.node);
  };
  useEffect(() => {
    if (
      connectorSort.field !== "name" &&
      connectorSort.field !== "technicalId"
    ) {
      return;
    }
    const nextField: ConnectorTableSortField = connectorSort.field;
    setConnectorTableSort((current) =>
      current.field === nextField &&
      current.direction === connectorSort.direction
        ? current
        : { field: nextField, direction: connectorSort.direction },
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
        : { field: nextField, direction: spliceSort.direction },
    );
  }, [spliceSort]);
  useEffect(() => {
    setNodeTableSort((current) =>
      current.field === "id" && current.direction === nodeIdSortDirection
        ? current
        : { field: "id", direction: nodeIdSortDirection },
    );
  }, [nodeIdSortDirection]);
  const sortedVisibleConnectors = useMemo(
    () => {
      if (!isConnectorSubScreen) {
        return [];
      }
      return sortByTableColumns(
        visibleConnectors,
        connectorTableSort,
        (connector, field) => {
          if (field === "name") return connector.name;
          if (field === "technicalId") return connector.technicalId;
          if (field === "manufacturerReference")
            return connector.manufacturerReference;
          if (field === "cavityCount") return connector.cavityCount;
          return connectorOccupiedCountById.get(connector.id) ?? 0;
        },
        (connector) => connector.id,
      );
    },
    [connectorOccupiedCountById, connectorTableSort, isConnectorSubScreen, visibleConnectors],
  );
  const spliceConnectedWireCountById = useMemo(() => {
    if (!isSpliceSubScreen) {
      return new Map<SpliceId, number>();
    }
    const result = new Map<SpliceId, number>();
    for (const wire of wires) {
      if (wire.endpointA.kind === "splicePort") {
        result.set(
          wire.endpointA.spliceId,
          (result.get(wire.endpointA.spliceId) ?? 0) + 1,
        );
      }
      if (wire.endpointB.kind === "splicePort") {
        result.set(
          wire.endpointB.spliceId,
          (result.get(wire.endpointB.spliceId) ?? 0) + 1,
        );
      }
    }
    return result;
  }, [isSpliceSubScreen, wires]);
  const sortedVisibleSplices = useMemo(
    () => {
      if (!isSpliceSubScreen) {
        return [];
      }
      return sortByTableColumns(
        visibleSplices,
        spliceTableSort,
        (splice, field) => {
          if (field === "name") return splice.name;
          if (field === "technicalId") return splice.technicalId;
          if (field === "manufacturerReference")
            return splice.manufacturerReference;
          if (field === "hostSegment")
            return resolveSplicePlacementPresentation(splice).hostSegmentSort;
          if (field === "offsetMm")
            return resolveSplicePlacementPresentation(splice).offsetSort;
          return spliceConnectedWireCountById.get(splice.id) ?? 0;
        },
        (splice) => splice.id,
      );
    },
    [
      isSpliceSubScreen,
      resolveSplicePlacementPresentation,
      spliceConnectedWireCountById,
      spliceTableSort,
      visibleSplices,
    ],
  );
  const sortedVisibleNodes = useMemo(
    () => {
      if (!isNodeSubScreen) {
        return [];
      }
      return sortByTableColumns(
        visibleNodes,
        nodeTableSort,
        (node, field) => {
          if (field === "id") return node.id;
          if (field === "kind") return node.kind;
          if (field === "reference") return describeNode(node);
          return segmentsCountByNodeId.get(node.id) ?? 0;
        },
        (node) => node.id,
      );
    },
    [describeNode, isNodeSubScreen, nodeTableSort, segmentsCountByNodeId, visibleNodes],
  );
  const visibleConnectorIds = useMemo(
    () => sortedVisibleConnectors.map((connector) => connector.id),
    [sortedVisibleConnectors],
  );
  const visibleSpliceIds = useMemo(
    () => sortedVisibleSplices.map((splice) => splice.id),
    [sortedVisibleSplices],
  );
  const visibleNodeIds = useMemo(
    () => sortedVisibleNodes.map((node) => node.id),
    [sortedVisibleNodes],
  );
  const allVisibleConnectorsSelected =
    visibleConnectorIds.length > 0 &&
    visibleConnectorIds.every((connectorId) =>
      batchSelectionIds.has(connectorId),
    );
  const allVisibleSplicesSelected =
    visibleSpliceIds.length > 0 &&
    visibleSpliceIds.every((spliceId) => batchSelectionIds.has(spliceId));
  const allVisibleNodesSelected =
    visibleNodeIds.length > 0 &&
    visibleNodeIds.every((nodeId) => batchSelectionIds.has(nodeId));
  const selectedConnectorBatchCount = batchSelectionIds.size;
  const selectedSpliceBatchCount = batchSelectionIds.size;
  const selectedNodeBatchCount = batchSelectionIds.size;
  const connectorSortIndicator = (field: ConnectorTableSortField) =>
    connectorTableSort.field === field
      ? connectorTableSort.direction === "asc"
        ? "▲"
        : "▼"
      : "";
  const spliceSortIndicator = (field: SpliceTableSortField) =>
    spliceTableSort.field === field
      ? spliceTableSort.direction === "asc"
        ? "▲"
        : "▼"
      : "";
  const nodeSortIndicator = (field: NodeTableSortField) =>
    nodeTableSort.field === field
      ? nodeTableSort.direction === "asc"
        ? "▲"
        : "▼"
      : "";

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
    if (
      previousMode !== "edit" ||
      connectorFormMode !== "create" ||
      selectedConnectorId === null
    ) {
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
    if (
      previousMode !== "edit" ||
      spliceFormMode !== "create" ||
      selectedSpliceId === null
    ) {
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
    if (
      previousMode !== "edit" ||
      nodeFormMode !== "create" ||
      selectedNodeId === null
    ) {
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
      {isConnectorSubScreen ? (
        <>
          <article
            className="panel"
            data-onboarding-panel="modeling-connectors"
          >
        <header className="list-panel-header list-panel-header-mobile-inline-tools">
          <h2>{t("ui.connectors")}</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row is-title-actions">
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() =>
                  downloadCsvFile(
                    "modeling-connectors",
                    [t("ui.name"), t("ui.technicalID"), t("ui.mfrRef"), t("ui.ways"), t("ui.occupied")],
                    sortedVisibleConnectors.map((connector) => [
                      connector.name,
                      connector.technicalId,
                      connector.manufacturerReference ?? "",
                      connector.cavityCount,
                      connectorOccupiedCountById.get(connector.id) ?? 0,
                    ]),
                  )
                }
                disabled={sortedVisibleConnectors.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                CSV
              </button>
              <ConfigurableTableColumnsControl
                tableId="modeling-connectors"
                tableRef={connectorTableRef}
                columns={connectorColumns}
                leadingColumnCount={isConnectorBatchMode ? 1 : 0}
                tableColumnPreferences={tableColumnPreferences}
                setTableColumnPreferences={setTableColumnPreferences}
              />
              {onOpenConnectorOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenConnectorOnboardingHelp}
                >
                  <span
                    className="action-button-icon is-help"
                    aria-hidden="true"
                  />
                  <span>{t("ui.help")}</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row is-filter-row">
              <div
                className="chip-group list-panel-filters"
                role="group"
                aria-label={t("ui.connectorOccupancyFilter")}
              >
                {(
                  [
                    ["all", t("ui.all")],
                    ["occupied", t("ui.occupied")],
                    ["free", t("ui.free")],
                  ] as const
                ).map(([filterId, label]) => (
                  <button
                    key={filterId}
                    type="button"
                    className={
                      connectorOccupancyFilter === filterId
                        ? "filter-chip is-active"
                        : "filter-chip"
                    }
                    onClick={() => setConnectorOccupancyFilter(filterId)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <TableFilterBar
                label={t("ui.filter")}
                fieldLabel={t("ui.connectorFilterField")}
                fieldValue={connectorFilterField}
                onFieldChange={(value) =>
                  setConnectorFilterField(
                    value as "name" | "technicalId" | "any",
                  )
                }
                fieldOptions={[
                  { value: "name", label: t("ui.name") },
                  { value: "technicalId", label: t("ui.technicalID") },
                  { value: "any", label: t("ui.any") },
                ]}
                queryValue={connectorFilterQuery}
                onQueryChange={setConnectorFilterQuery}
                placeholder={connectorFilterPlaceholder}
              />
            </div>
          </div>
        </header>
        {connectors.length === 0 ? (
          <p className="empty-copy">{t("ui.noConnectorYet")}</p>
        ) : sortedVisibleConnectors.length === 0 ? (
          <>
            <p className="empty-copy">
              
              {t("ui.noConnectorMatchesTheCurrentFilters")}
            </p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <>
            <table className="data-table" ref={connectorTableRef}>
              <thead>
                <tr>
                  {isConnectorBatchMode ? (
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all visible connectors"
                        checked={allVisibleConnectorsSelected}
                        onChange={() =>
                          onSetBatchSelectionForVisible(
                            "connector",
                            visibleConnectorIds,
                          )
                        }
                      />
                    </th>
                  ) : null}
                  <th aria-sort={getTableAriaSort(connectorTableSort, "name")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => {
                        setConnectorTableSort((current) => ({
                          field: "name",
                          direction:
                            current.field === "name" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                        setConnectorSort((current) => ({
                          field: "name",
                          direction:
                            current.field === "name" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                      }}
                    >
                      
                      {t("ui.name")}{" "}
                      <span className="sort-indicator">
                        {connectorSortIndicator("name")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(
                      connectorTableSort,
                      "technicalId",
                    )}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => {
                        setConnectorTableSort((current) => ({
                          field: "technicalId",
                          direction:
                            current.field === "technicalId" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                        setConnectorSort((current) => ({
                          field: "technicalId",
                          direction:
                            current.field === "technicalId" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                      }}
                    >
                      {isMobileViewport ? t("ui.id") : t("ui.technicalID")}{" "}
                      <span className="sort-indicator">
                        {connectorSortIndicator("technicalId")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(
                      connectorTableSort,
                      "manufacturerReference",
                    )}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setConnectorTableSort((current) => ({
                          field: "manufacturerReference",
                          direction:
                            current.field === "manufacturerReference" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      
                      {t("ui.mfrRef")}{" "}
                      <span className="sort-indicator">
                        {connectorSortIndicator("manufacturerReference")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(
                      connectorTableSort,
                      "cavityCount",
                    )}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setConnectorTableSort((current) => ({
                          field: "cavityCount",
                          direction:
                            current.field === "cavityCount" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      
                      {t("ui.ways")}{" "}
                      <span className="sort-indicator">
                        {connectorSortIndicator("cavityCount")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(
                      connectorTableSort,
                      "occupiedCount",
                    )}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setConnectorTableSort((current) => ({
                          field: "occupiedCount",
                          direction:
                            current.field === "occupiedCount" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      {isMobileViewport ? t("ui.occup") : t("ui.occupied")}{" "}
                      <span className="sort-indicator">
                        {connectorSortIndicator("occupiedCount")}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVisibleConnectors.map((connector) => {
                  const occupiedCount =
                    connectorOccupiedCountById.get(connector.id) ?? 0;
                  const isFocused = focusedConnector?.id === connector.id;
                  const isBatchSelected = batchSelectionIds.has(connector.id);
                  const linkedCatalogItemId = connector.catalogItemId;
                  const linkedCatalogItem =
                    linkedCatalogItemId === undefined
                      ? undefined
                      : catalogItemById.get(linkedCatalogItemId);
                  return (
                    <tr
                      key={connector.id}
                      ref={(element) => {
                        connectorRowRefs.current[connector.id] = element;
                      }}
                      className={
                        isConnectorBatchMode
                          ? `${isBatchSelected ? "is-selected " : ""}is-focusable-row`
                          : isFocused
                            ? "is-selected is-focusable-row"
                            : "is-focusable-row"
                      }
                      aria-selected={
                        isConnectorBatchMode ? isBatchSelected : isFocused
                      }
                      tabIndex={0}
                      onClick={() =>
                        isConnectorBatchMode
                          ? onToggleBatchSelection("connector", connector.id)
                          : onEditConnector(connector)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          if (isConnectorBatchMode) {
                            onToggleBatchSelection("connector", connector.id);
                            return;
                          }
                          onEditConnector(connector);
                        }
                      }}
                    >
                      {isConnectorBatchMode ? (
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select connector ${connector.technicalId}`}
                            checked={isBatchSelected}
                            onChange={() =>
                              onToggleBatchSelection("connector", connector.id)
                            }
                            onClick={(event) => event.stopPropagation()}
                          />
                        </td>
                      ) : null}
                      <td>{connector.name}</td>
                      <td className="technical-id">{connector.technicalId}</td>
                      <td className="technical-id">
                        {linkedCatalogItemId !== undefined &&
                        linkedCatalogItem !== undefined ? (
                          <EntityReferenceButton
                            className="technical-id"
                            title={`Open catalog item ${connector.manufacturerReference ?? linkedCatalogItem.manufacturerReference}`}
                            onClick={() =>
                              onSelectCatalogItem(linkedCatalogItemId)
                            }
                          >
                            {connector.manufacturerReference ??
                              linkedCatalogItem.manufacturerReference}
                          </EntityReferenceButton>
                        ) : (
                          (connector.manufacturerReference ?? "")
                        )}
                      </td>
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
        <div className="row-actions compact modeling-list-actions connector-modeling-list-actions">
          {isConnectorBatchMode ? (
            <>
              <button
                type="button"
                className="button-with-icon"
                onClick={onOpenBatchSelectionDialog}
                disabled={selectedConnectorBatchCount === 0}
              >
                Open batch
                {selectedConnectorBatchCount > 0
                  ? ` (${selectedConnectorBatchCount})`
                  : ""}
              </button>
              <button
                type="button"
                className="modeling-list-action-delete button-with-icon"
                onClick={onDeleteSelectedInBatchMode}
                disabled={selectedConnectorBatchCount === 0}
              >
                <span
                  className="action-button-icon is-delete"
                  aria-hidden="true"
                />
                Delete selected
                {selectedConnectorBatchCount > 0
                  ? ` (${selectedConnectorBatchCount})`
                  : ""}
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={onExitBatchMode}
              >
                Cancel selection
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="button-with-icon"
                onClick={openCreateConnectorAndScroll}
              >
                <span
                  className="action-button-icon is-new"
                  aria-hidden="true"
                />
                
                {t("ui.new")}
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={() =>
                  focusedConnector !== null &&
                  openEditConnectorAndScroll(focusedConnector)
                }
                disabled={focusedConnector === null}
              >
                <span
                  className="action-button-icon is-edit"
                  aria-hidden="true"
                />
                
                {t("ui.edit")}
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={() => onEnterBatchMode("connector")}
                disabled={sortedVisibleConnectors.length === 0}
              >
                <span
                  className="action-button-icon is-multi-select"
                  aria-hidden="true"
                />
                {isMobileViewport ? "Select" : "Select multiple"}
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={() => setIsPinRoleMassEditOpen(true)}
                disabled={connectors.length === 0}
              >
                <span
                  className="action-button-icon is-edit"
                  aria-hidden="true"
                />
                Mass edit
              </button>
              <button
                type="button"
                className="modeling-list-action-delete button-with-icon"
                onClick={() =>
                  focusedConnector !== null &&
                  onDeleteConnector(focusedConnector.id)
                }
                disabled={
                  focusedConnector === null || connectorFormMode === "create"
                }
              >
                <span
                  className="action-button-icon is-delete"
                  aria-hidden="true"
                />
                
                {t("ui.delete")}
              </button>
            </>
          )}
        </div>
      </article>
          <PinRoleMassEditDialog
            isOpen={isPinRoleMassEditOpen}
            activeNetwork={activeNetwork}
            connectors={connectors}
            splices={splices}
            wires={wires}
            catalogItems={catalogItems}
            onApplyPinRoleMassEdit={onApplyPinRoleMassEdit}
            onClose={() => setIsPinRoleMassEditOpen(false)}
          />
        </>
      ) : null}

      {isSpliceSubScreen ? (
      <article
        className="panel"
        data-onboarding-panel="modeling-splices"
      >
        <header className="list-panel-header list-panel-header-mobile-inline-tools">
          <h2>{t("ui.splices")}</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row is-title-actions">
                <button
                  type="button"
                  className="filter-chip table-export-button"
                  onClick={() =>
                    downloadCsvFile(
                      "modeling-splices",
                      [
                        t("ui.name"),
                        t("ui.technicalID"),
                        t("ui.mfrRef"),
                        "Host segment",
                        "Reference node",
                        "Offset (mm)",
                        t("ui.connectedWires"),
                      ],
                      sortedVisibleSplices.map((splice) => {
                        const placement =
                          resolveSplicePlacementPresentation(splice);
                        return [
                          splice.name,
                          splice.technicalId,
                          splice.manufacturerReference ?? "",
                          placement.hostSegmentLabel,
                          placement.fromNodeLabel,
                          splice.placement?.offsetMm ?? "",
                          spliceConnectedWireCountById.get(splice.id) ?? 0,
                        ];
                      }),
                    )
                  }
                  disabled={sortedVisibleSplices.length === 0}
                >
                <span className="table-export-icon" aria-hidden="true" />
                CSV
              </button>
              <ConfigurableTableColumnsControl
                tableId="modeling-splices"
                tableRef={spliceTableRef}
                columns={spliceColumns}
                leadingColumnCount={isSpliceBatchMode ? 1 : 0}
                tableColumnPreferences={tableColumnPreferences}
                setTableColumnPreferences={setTableColumnPreferences}
              />
              {onOpenSpliceOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenSpliceOnboardingHelp}
                >
                  <span
                    className="action-button-icon is-help"
                    aria-hidden="true"
                  />
                  <span>{t("ui.help")}</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row is-filter-row">
              <div
                className="chip-group list-panel-filters"
                role="group"
                aria-label={t("ui.spliceOccupancyFilter")}
              >
                {(
                  [
                    ["all", t("ui.all")],
                    ["occupied", t("ui.occupied")],
                    ["free", t("ui.free")],
                  ] as const
                ).map(([filterId, label]) => (
                  <button
                    key={filterId}
                    type="button"
                    className={
                      spliceOccupancyFilter === filterId
                        ? "filter-chip is-active"
                        : "filter-chip"
                    }
                    onClick={() => setSpliceOccupancyFilter(filterId)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <TableFilterBar
                label={t("ui.filter")}
                fieldLabel={t("ui.spliceFilterField")}
                fieldValue={spliceFilterField}
                onFieldChange={(value) =>
                  setSpliceFilterField(value as "name" | "technicalId" | "any")
                }
                fieldOptions={[
                  { value: "name", label: t("ui.name") },
                  { value: "technicalId", label: t("ui.technicalID") },
                  { value: "any", label: t("ui.any") },
                ]}
                queryValue={spliceFilterQuery}
                onQueryChange={setSpliceFilterQuery}
                placeholder={spliceFilterPlaceholder}
              />
            </div>
          </div>
        </header>
        {splices.length === 0 ? (
          <p className="empty-copy">{t("ui.noSpliceYet")}</p>
        ) : sortedVisibleSplices.length === 0 ? (
          <>
            <p className="empty-copy">{t("ui.noSpliceMatchesTheCurrentFilters")}</p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <>
            <table className="data-table" ref={spliceTableRef}>
              <thead>
                <tr>
                  {isSpliceBatchMode ? (
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all visible splices"
                        checked={allVisibleSplicesSelected}
                        onChange={() =>
                          onSetBatchSelectionForVisible(
                            "splice",
                            visibleSpliceIds,
                          )
                        }
                      />
                    </th>
                  ) : null}
                  <th aria-sort={getTableAriaSort(spliceTableSort, "name")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => {
                        setSpliceTableSort((current) => ({
                          field: "name",
                          direction:
                            current.field === "name" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                        setSpliceSort((current) => ({
                          field: "name",
                          direction:
                            current.field === "name" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                      }}
                    >
                      
                      {t("ui.name")}{" "}
                      <span className="sort-indicator">
                        {spliceSortIndicator("name")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(spliceTableSort, "technicalId")}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => {
                        setSpliceTableSort((current) => ({
                          field: "technicalId",
                          direction:
                            current.field === "technicalId" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                        setSpliceSort((current) => ({
                          field: "technicalId",
                          direction:
                            current.field === "technicalId" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                      }}
                    >
                      {isMobileViewport ? t("ui.id") : t("ui.technicalID")}{" "}
                      <span className="sort-indicator">
                        {spliceSortIndicator("technicalId")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(
                      spliceTableSort,
                      "manufacturerReference",
                    )}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSpliceTableSort((current) => ({
                          field: "manufacturerReference",
                          direction:
                            current.field === "manufacturerReference" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      
                      {t("ui.mfrRef")}{" "}
                      <span className="sort-indicator">
                        {spliceSortIndicator("manufacturerReference")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(
                      spliceTableSort,
                      "hostSegment",
                    )}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSpliceTableSort((current) => ({
                          field: "hostSegment",
                          direction:
                            current.field === "hostSegment" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      
                      {t("ui.segment")}{" "}
                      <span className="sort-indicator">
                        {spliceSortIndicator("hostSegment")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(spliceTableSort, "offsetMm")}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSpliceTableSort((current) => ({
                          field: "offsetMm",
                          direction:
                            current.field === "offsetMm" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      Offset{" "}
                      <span className="sort-indicator">
                        {spliceSortIndicator("offsetMm")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(
                      spliceTableSort,
                      "connectedWireCount",
                    )}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSpliceTableSort((current) => ({
                          field: "connectedWireCount",
                          direction:
                            current.field === "connectedWireCount" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      
                      {t("ui.connectedWires")}{" "}
                      <span className="sort-indicator">
                        {spliceSortIndicator("connectedWireCount")}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVisibleSplices.map((splice) => {
                  const connectedWireCount =
                    spliceConnectedWireCountById.get(splice.id) ?? 0;
                  const isFocused = focusedSplice?.id === splice.id;
                  const isBatchSelected = batchSelectionIds.has(splice.id);
                  const linkedCatalogItemId = splice.catalogItemId;
                  const linkedCatalogItem =
                    linkedCatalogItemId === undefined
                      ? undefined
                      : catalogItemById.get(linkedCatalogItemId);
                  const placement = resolveSplicePlacementPresentation(splice);
                  return (
                    <tr
                      key={splice.id}
                      ref={(element) => {
                        spliceRowRefs.current[splice.id] = element;
                      }}
                      className={
                        isSpliceBatchMode
                          ? `${isBatchSelected ? "is-selected " : ""}is-focusable-row`
                          : isFocused
                            ? "is-selected is-focusable-row"
                            : "is-focusable-row"
                      }
                      aria-selected={
                        isSpliceBatchMode ? isBatchSelected : isFocused
                      }
                      tabIndex={0}
                      onClick={() =>
                        isSpliceBatchMode
                          ? onToggleBatchSelection("splice", splice.id)
                          : onEditSplice(splice)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          if (isSpliceBatchMode) {
                            onToggleBatchSelection("splice", splice.id);
                            return;
                          }
                          onEditSplice(splice);
                        }
                      }}
                    >
                      {isSpliceBatchMode ? (
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select splice ${splice.technicalId}`}
                            checked={isBatchSelected}
                            onChange={() =>
                              onToggleBatchSelection("splice", splice.id)
                            }
                            onClick={(event) => event.stopPropagation()}
                          />
                        </td>
                      ) : null}
                      <td>{splice.name}</td>
                      <td className="technical-id">{splice.technicalId}</td>
                      <td className="technical-id">
                        {linkedCatalogItemId !== undefined &&
                        linkedCatalogItem !== undefined ? (
                          <EntityReferenceButton
                            className="technical-id"
                            title={`Open catalog item ${splice.manufacturerReference ?? linkedCatalogItem.manufacturerReference}`}
                            onClick={() =>
                              onSelectCatalogItem(linkedCatalogItemId)
                            }
                          >
                            {splice.manufacturerReference ??
                              linkedCatalogItem.manufacturerReference}
                          </EntityReferenceButton>
                        ) : (
                          (splice.manufacturerReference ?? "")
                        )}
                      </td>
                      <td>
                        <span>{placement.hostSegmentLabel}</span>
                        <br />
                        <small>{placement.fromNodeLabel}</small>
                      </td>
                      <td>{placement.offsetLabel}</td>
                      <td>{connectedWireCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <TableEntryCountFooter count={sortedVisibleSplices.length} />
          </>
        )}
        <div className="row-actions compact modeling-list-actions">
          {isSpliceBatchMode ? (
            <>
              <button
                type="button"
                className="button-with-icon"
                onClick={onOpenBatchSelectionDialog}
                disabled={selectedSpliceBatchCount === 0}
              >
                Open batch
                {selectedSpliceBatchCount > 0
                  ? ` (${selectedSpliceBatchCount})`
                  : ""}
              </button>
              <button
                type="button"
                className="modeling-list-action-delete button-with-icon"
                onClick={onDeleteSelectedInBatchMode}
                disabled={selectedSpliceBatchCount === 0}
              >
                <span
                  className="action-button-icon is-delete"
                  aria-hidden="true"
                />
                Delete selected
                {selectedSpliceBatchCount > 0
                  ? ` (${selectedSpliceBatchCount})`
                  : ""}
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={onExitBatchMode}
              >
                Cancel selection
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="button-with-icon"
                onClick={openCreateSpliceAndScroll}
              >
                <span
                  className="action-button-icon is-new"
                  aria-hidden="true"
                />
                
                {t("ui.new")}
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={() =>
                  focusedSplice !== null &&
                  openEditSpliceAndScroll(focusedSplice)
                }
                disabled={focusedSplice === null}
              >
                <span
                  className="action-button-icon is-edit"
                  aria-hidden="true"
                />
                
                {t("ui.edit")}
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={() => onEnterBatchMode("splice")}
                disabled={sortedVisibleSplices.length === 0}
              >
                <span
                  className="action-button-icon is-multi-select"
                  aria-hidden="true"
                />
                {isMobileViewport ? "Select" : "Select multiple"}
              </button>
              <button
                type="button"
                className="modeling-list-action-delete button-with-icon"
                onClick={() =>
                  focusedSplice !== null && onDeleteSplice(focusedSplice.id)
                }
                disabled={focusedSplice === null || spliceFormMode === "create"}
              >
                <span
                  className="action-button-icon is-delete"
                  aria-hidden="true"
                />
                
                {t("ui.delete")}
              </button>
            </>
          )}
        </div>
      </article>
      ) : null}

      {isNodeSubScreen ? (
      <article
        className="panel"
        data-onboarding-panel="modeling-nodes"
      >
        <header className="list-panel-header list-panel-header-mobile-inline-tools">
          <h2>{t("ui.nodes")}</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row is-title-actions">
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() => {
                  const headers = showNodeKindColumn
                    ? [t("ui.id"), t("ui.kind"), t("ui.reference"), t("ui.linkedSegments")]
                    : [t("ui.id"), t("ui.reference"), t("ui.linkedSegments")];
                  const rows = sortedVisibleNodes.map((node) => {
                    const linkedSegments =
                      segmentsCountByNodeId.get(node.id) ?? 0;
                    if (showNodeKindColumn) {
                      return [
                        node.id,
                        node.kind,
                        describeNode(node),
                        linkedSegments,
                      ];
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
              <ConfigurableTableColumnsControl
                tableId="modeling-nodes"
                tableRef={nodeTableRef}
                columns={nodeColumns}
                leadingColumnCount={isNodeBatchMode ? 1 : 0}
                tableColumnPreferences={tableColumnPreferences}
                setTableColumnPreferences={setTableColumnPreferences}
              />
              {onOpenNodeOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenNodeOnboardingHelp}
                >
                  <span
                    className="action-button-icon is-help"
                    aria-hidden="true"
                  />
                  <span>{t("ui.help")}</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row is-filter-row">
              <div
                className="chip-group list-panel-filters"
                role="group"
                aria-label={t("ui.nodeKindFilter")}
              >
                {(
                  [
                    ["all", t("ui.all")],
                    ["connector", t("ui.connector")],
                    ["splice", t("ui.splice")],
                    ["intermediate", t("ui.intermediate")],
                  ] as const
                ).map(([kindId, label]) => (
                  <button
                    key={kindId}
                    type="button"
                    className={
                      nodeKindFilter === kindId
                        ? "filter-chip is-active"
                        : "filter-chip"
                    }
                    onClick={() => setNodeKindFilter(kindId)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <TableFilterBar
                label={t("ui.filter")}
                fieldLabel={t("ui.nodeFilterField")}
                fieldValue={nodeFilterField}
                onFieldChange={(value) =>
                  setNodeFilterField(
                    value as "id" | "kind" | "reference" | "any",
                  )
                }
                fieldOptions={[
                  { value: "id", label: t("ui.nodeID") },
                  { value: "kind", label: t("ui.kind") },
                  { value: "reference", label: t("ui.reference") },
                  { value: "any", label: t("ui.any") },
                ]}
                queryValue={nodeFilterQuery}
                onQueryChange={setNodeFilterQuery}
                placeholder={nodeFilterPlaceholder}
              />
            </div>
          </div>
        </header>
        {nodes.length === 0 ? (
          <p className="empty-copy">{t("ui.noNodeYet")}</p>
        ) : sortedVisibleNodes.length === 0 ? (
          <>
            <p className="empty-copy">{t("ui.noNodeMatchesTheCurrentFilters")}</p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <>
            <table className="data-table" ref={nodeTableRef}>
              <thead>
                <tr>
                  {isNodeBatchMode ? (
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all visible nodes"
                        checked={allVisibleNodesSelected}
                        onChange={() =>
                          onSetBatchSelectionForVisible("node", visibleNodeIds)
                        }
                      />
                    </th>
                  ) : null}
                  <th aria-sort={getTableAriaSort(nodeTableSort, "id")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => {
                        setNodeTableSort((current) => ({
                          field: "id",
                          direction:
                            current.field === "id" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                        setNodeIdSortDirection((current) =>
                          current === "asc" ? "desc" : "asc",
                        );
                      }}
                    >
                      
                      {t("ui.id")}{" "}
                      <span className="sort-indicator">
                        {nodeSortIndicator("id")}
                      </span>
                    </button>
                  </th>
                  {showNodeKindColumn ? (
                    <th aria-sort={getTableAriaSort(nodeTableSort, "kind")}>
                      <button
                        type="button"
                        className="sort-header-button"
                        onClick={() =>
                          setNodeTableSort((current) => ({
                            field: "kind",
                            direction:
                              current.field === "kind" &&
                              current.direction === "asc"
                                ? "desc"
                                : "asc",
                          }))
                        }
                      >
                        
                        {t("ui.kind")}{" "}
                        <span className="sort-indicator">
                          {nodeSortIndicator("kind")}
                        </span>
                      </button>
                    </th>
                  ) : null}
                  <th aria-sort={getTableAriaSort(nodeTableSort, "reference")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setNodeTableSort((current) => ({
                          field: "reference",
                          direction:
                            current.field === "reference" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      {isMobileViewport ? t("ui.ref") : t("ui.reference")}{" "}
                      <span className="sort-indicator">
                        {nodeSortIndicator("reference")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(
                      nodeTableSort,
                      "linkedSegments",
                    )}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setNodeTableSort((current) => ({
                          field: "linkedSegments",
                          direction:
                            current.field === "linkedSegments" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      
                      {t("ui.linkedSegments")}{" "}
                      <span className="sort-indicator">
                        {nodeSortIndicator("linkedSegments")}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVisibleNodes.map((node) => {
                  const linkedSegments =
                    segmentsCountByNodeId.get(node.id) ?? 0;
                  const isFocused = focusedNode?.id === node.id;
                  const isBatchSelected = batchSelectionIds.has(node.id);
                  return (
                    <tr
                      key={node.id}
                      ref={(element) => {
                        nodeRowRefs.current[node.id] = element;
                      }}
                      className={
                        isNodeBatchMode
                          ? `${isBatchSelected ? "is-selected " : ""}is-focusable-row`
                          : isFocused
                            ? "is-selected is-focusable-row"
                            : "is-focusable-row"
                      }
                      aria-selected={
                        isNodeBatchMode ? isBatchSelected : isFocused
                      }
                      tabIndex={0}
                      onClick={() =>
                        isNodeBatchMode
                          ? onToggleBatchSelection("node", node.id)
                          : onEditNode(node)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          if (isNodeBatchMode) {
                            onToggleBatchSelection("node", node.id);
                            return;
                          }
                          onEditNode(node);
                        }
                      }}
                    >
                      {isNodeBatchMode ? (
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select node ${node.id}`}
                            checked={isBatchSelected}
                            onChange={() =>
                              onToggleBatchSelection("node", node.id)
                            }
                            onClick={(event) => event.stopPropagation()}
                          />
                        </td>
                      ) : null}
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
          {isNodeBatchMode ? (
            <>
              <button
                type="button"
                className="button-with-icon"
                onClick={onOpenBatchSelectionDialog}
                disabled={selectedNodeBatchCount === 0}
              >
                Open batch
                {selectedNodeBatchCount > 0
                  ? ` (${selectedNodeBatchCount})`
                  : ""}
              </button>
              <button
                type="button"
                className="modeling-list-action-delete button-with-icon"
                onClick={onDeleteSelectedInBatchMode}
                disabled={selectedNodeBatchCount === 0}
              >
                <span
                  className="action-button-icon is-delete"
                  aria-hidden="true"
                />
                Delete selected
                {selectedNodeBatchCount > 0
                  ? ` (${selectedNodeBatchCount})`
                  : ""}
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={onExitBatchMode}
              >
                Cancel selection
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="button-with-icon"
                onClick={openCreateNodeAndScroll}
              >
                <span
                  className="action-button-icon is-new"
                  aria-hidden="true"
                />
                
                {t("ui.new")}
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={() =>
                  focusedNode !== null && openEditNodeAndScroll(focusedNode)
                }
                disabled={focusedNode === null}
              >
                <span
                  className="action-button-icon is-edit"
                  aria-hidden="true"
                />
                
                {t("ui.edit")}
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={() => onEnterBatchMode("node")}
                disabled={sortedVisibleNodes.length === 0}
              >
                <span
                  className="action-button-icon is-multi-select"
                  aria-hidden="true"
                />
                {isMobileViewport ? "Select" : "Select multiple"}
              </button>
              <button
                type="button"
                className="modeling-list-action-delete button-with-icon"
                onClick={() =>
                  focusedNode !== null && onDeleteNode(focusedNode.id)
                }
                disabled={focusedNode === null || nodeFormMode === "create"}
              >
                <span
                  className="action-button-icon is-delete"
                  aria-hidden="true"
                />
                
                {t("ui.delete")}
              </button>
            </>
          )}
        </div>
      </article>
      ) : null}
    </>
  );
}

export const ModelingPrimaryTables = memo(ModelingPrimaryTablesComponent, arePanelMemoPropsEqual);
