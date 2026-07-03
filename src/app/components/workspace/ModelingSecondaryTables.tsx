import { memo, useEffect, useMemo, useRef, useState, type Dispatch, type ReactElement, type SetStateAction } from "react";
import { getWireColorSortValue } from "../../../core/cableColors";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { getTableAriaSort } from "../../lib/accessibility";
import {
  focusElementWithoutScroll,
  sortByTableColumns,
} from "../../lib/app-utils-shared";
import { arePanelMemoPropsEqual } from "../../lib/renderMemoCompare";
import { downloadCsvFile } from "../../lib/csv";
import { normalizeFileNamePart } from "../../lib/exportFileName";
import {
  downloadTabularCsvOrXlsxFile,
  downloadTabularWorkbookFile,
  type TabularWorksheetExport,
} from "../../lib/tabularExport";
import { FORM_PANEL_IDS, scrollToFormPanel } from "../../lib/form-panel-scroll";
import {
  getWireColorCsvValue,
  renderWireColorCellValue,
} from "../../lib/wireColorPresentation";
import {
  buildWireTwistGroupExportCounts,
  resolveWireExportLengthMm,
  resolveWireUntwistedExportLengthMm,
  type WireExportLengthPreferences,
} from "../../lib/wireExportLength";
import {
  appendWireReferenceTable,
  resolveWireExportEndpointMaterials,
} from "../../lib/wireListExport";
import { TabularExportPreviewDialog } from "../dialogs/TabularExportPreviewDialog";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";
import type {
  CatalogItem,
  CatalogItemId,
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  WireEndpoint,
  Wire,
  WireId,
} from "../../../core/entities";
import type { ModelingBatchSelectionScope } from "../../lib/modelingBatchDelete";
import type {
  SegmentSubNetworkFilter,
  SortDirection,
  SortState,
  TabularExportFormat,
} from "../../types/app-controller";
import { EntityReferenceButton } from "./EntityReferenceButton";
import { ConfigurableTableColumnsControl, type ConfigurableTableColumn } from "./ConfigurableTableColumns";
import type { TableColumnPreferences } from "../../hooks/uiPreferencesStorage";

interface ModelingSecondaryTablesProps {
  activeBatchScope: ModelingBatchSelectionScope | null;
  batchSelectionIds: ReadonlySet<string>;
  onEnterBatchMode: (scope: ModelingBatchSelectionScope) => void;
  onExitBatchMode: () => void;
  onToggleBatchSelection: (
    scope: ModelingBatchSelectionScope,
    id: string,
  ) => void;
  onSetBatchSelectionForVisible: (
    scope: ModelingBatchSelectionScope,
    ids: readonly string[],
  ) => void;
  onOpenBatchSelectionDialog: () => void;
  onDeleteSelectedInBatchMode: () => void;
  tableColumnPreferences: TableColumnPreferences;
  setTableColumnPreferences: Dispatch<SetStateAction<TableColumnPreferences>>;
  isSegmentSubScreen: boolean;
  segmentFormMode: "idle" | "create" | "edit";
  onOpenCreateSegment: () => void;
  segmentSubNetworkFilter: SegmentSubNetworkFilter;
  setSegmentSubNetworkFilter: (value: SegmentSubNetworkFilter) => void;
  segmentFilterField: "id" | "nodeA" | "nodeB" | "subNetwork" | "any";
  setSegmentFilterField: (
    value: "id" | "nodeA" | "nodeB" | "subNetwork" | "any",
  ) => void;
  segmentFilterQuery: string;
  setSegmentFilterQuery: (value: string) => void;
  segments: Segment[];
  visibleSegments: Segment[];
  segmentIdSortDirection: SortDirection;
  setSegmentIdSortDirection: (
    value: SortDirection | ((current: SortDirection) => SortDirection),
  ) => void;
  nodeLabelById: Map<NodeId, string>;
  selectedSegmentId: SegmentId | null;
  selectedWireRouteSegmentIds: Set<SegmentId>;
  onEditSegment: (segment: Segment) => void;
  onDeleteSegment: (segmentId: SegmentId) => void;
  onOpenSegmentOnboardingHelp?: () => void;
  isWireSubScreen: boolean;
  wireFormMode: "idle" | "create" | "edit";
  onOpenCreateWire: () => void;
  wireRouteFilter: "all" | "auto" | "locked";
  wireFunctionalTagFilter: string;
  setWireFunctionalTagFilter: (value: string) => void;
  wireFunctionalTagOptions: string[];
  wireFilterField: "endpoints" | "name" | "technicalId" | "any";
  setWireFilterField: (
    value: "endpoints" | "name" | "technicalId" | "any",
  ) => void;
  wireEndpointFilterQuery: string;
  setWireEndpointFilterQuery: (value: string) => void;
  tabularExportFormat: TabularExportFormat;
  wireExportLengthPreferences: WireExportLengthPreferences;
  catalogItems: CatalogItem[];
  connectors: Connector[];
  nodes: NetworkNode[];
  splices: Splice[];
  wires: Wire[];
  visibleWires: Wire[];
  wireSort: SortState;
  setWireSort: (value: SortState | ((current: SortState) => SortState)) => void;
  getSortIndicator: (sortState: SortState, field: SortState["field"]) => string;
  selectedWireId: WireId | null;
  onSelectCatalogItem: (catalogItemId: CatalogItemId) => void;
  onSelectConnectorReference: (connectorId: ConnectorId) => void;
  onSelectSpliceReference: (spliceId: SpliceId) => void;
  describeWireEndpoint: (endpoint: Wire["endpointA"]) => string;
  describeWireEndpointCsvParts: (endpoint: Wire["endpointA"]) => {
    endpointId: string;
    pin: string;
  };
  onEditWire: (wire: Wire) => void;
  onDeleteWire: (wireId: WireId) => void;
  onOpenWireOnboardingHelp?: () => void;
  activeNetworkName?: string | null;
}

function ModelingSecondaryTablesComponent({
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
  isSegmentSubScreen,
  segmentFormMode,
  onOpenCreateSegment,
  segmentSubNetworkFilter,
  setSegmentSubNetworkFilter,
  segmentFilterField,
  setSegmentFilterField,
  segmentFilterQuery,
  setSegmentFilterQuery,
  segments,
  visibleSegments,
  segmentIdSortDirection: _segmentIdSortDirection,
  setSegmentIdSortDirection: _setSegmentIdSortDirection,
  nodeLabelById,
  selectedSegmentId,
  selectedWireRouteSegmentIds,
  onEditSegment,
  onDeleteSegment,
  onOpenSegmentOnboardingHelp,
  isWireSubScreen,
  wireFormMode,
  onOpenCreateWire,
  wireRouteFilter,
  wireFunctionalTagFilter,
  setWireFunctionalTagFilter,
  wireFunctionalTagOptions,
  wireFilterField,
  setWireFilterField,
  wireEndpointFilterQuery,
  setWireEndpointFilterQuery,
  tabularExportFormat,
  wireExportLengthPreferences,
  catalogItems,
  connectors,
  nodes,
  splices,
  wires,
  visibleWires,
  wireSort: _wireSort,
  setWireSort: _setWireSort,
  getSortIndicator: _getSortIndicator,
  selectedWireId,
  onSelectCatalogItem,
  onSelectConnectorReference,
  onSelectSpliceReference,
  describeWireEndpoint,
  describeWireEndpointCsvParts,
  onEditWire,
  onDeleteWire,
  onOpenWireOnboardingHelp,
  activeNetworkName,
}: ModelingSecondaryTablesProps): ReactElement {
  void _getSortIndicator;
  type SegmentTableSortField =
    | "id"
    | "nodeA"
    | "nodeB"
    | "lengthMm"
    | "subNetwork";
  type WireTableSortField =
    | "name"
    | "technicalId"
    | "sectionMm2"
    | "color"
    | "endpointA"
    | "endpointB"
    | "lengthMm"
    | "routeMode";
  const segmentRowRefs = useRef<
    Partial<Record<SegmentId, HTMLTableRowElement | null>>
  >({});
  const segmentTableRef = useRef<HTMLTableElement | null>(null);
  const wireRowRefs = useRef<
    Partial<Record<WireId, HTMLTableRowElement | null>>
  >({});
  const wireTableRef = useRef<HTMLTableElement | null>(null);
  const lastAutoFocusedSegmentIdRef = useRef<SegmentId | null>(null);
  const lastAutoFocusedWireIdRef = useRef<WireId | null>(null);
  const isMobileViewport = useIsMobileViewport();
  const previousSegmentFormModeRef =
    useRef<typeof segmentFormMode>(segmentFormMode);
  const previousWireFormModeRef = useRef<typeof wireFormMode>(wireFormMode);
  const isSegmentBatchMode = activeBatchScope === "segment";
  const isWireBatchMode = activeBatchScope === "wire";
  const focusedSegment =
    selectedSegmentId === null
      ? null
      : (visibleSegments.find((segment) => segment.id === selectedSegmentId) ??
        null);
  const focusedWire =
    selectedWireId === null
      ? null
      : (visibleWires.find((wire) => wire.id === selectedWireId) ?? null);
  const showSegmentSubNetworkColumn = segmentSubNetworkFilter !== "default";
  const showWireRouteModeColumn =
    wireRouteFilter === "all" && !isMobileViewport;
  const segmentColumns: ConfigurableTableColumn[] = [
    { id: "id", label: "ID", hideable: false },
    { id: "nodeA", label: "Node A" },
    { id: "nodeB", label: "Node B" },
    { id: "lengthMm", label: "Length" },
    ...(showSegmentSubNetworkColumn ? [{ id: "subNetwork", label: "Sub-network" }] : []),
  ];
  const wireColumns: ConfigurableTableColumn[] = [
    { id: "name", label: "Name", hideable: false },
    { id: "technicalId", label: "Technical ID" },
    { id: "functionalDomainTag", label: "Functional tag" },
    { id: "twistGroupLabel", label: "Twist group" },
    { id: "color", label: "Color" },
    { id: "endpointA", label: "Endpoint A" },
    { id: "endpointB", label: "Endpoint B" },
    { id: "sectionMm2", label: "Section" },
    { id: "lengthMm", label: "Length" },
  ];
  const segmentFilterPlaceholder =
    segmentFilterField === "id"
      ? "Segment ID"
      : segmentFilterField === "nodeA"
        ? "Node A"
        : segmentFilterField === "nodeB"
          ? "Node B"
          : segmentFilterField === "subNetwork"
            ? "Sub-network"
            : "ID, nodes, sub-network...";
  const wireFilterPlaceholder =
    wireFilterField === "endpoints"
      ? "Connector/Splice or ID"
      : wireFilterField === "name"
        ? "Wire name"
        : wireFilterField === "technicalId"
          ? "Technical ID"
          : "Name, technical ID, endpoint...";
  const [segmentTableSort, setSegmentTableSort] = useState<{
    field: SegmentTableSortField;
    direction: "asc" | "desc";
  }>({
    field: "id",
    direction: "asc",
  });
  const [wireTableSort, setWireTableSort] = useState<{
    field: WireTableSortField;
    direction: "asc" | "desc";
  }>({
    field: "name",
    direction: "asc",
  });
  const [wireExportPreview, setWireExportPreview] = useState<{
    filenameBase: string;
    sheets: TabularWorksheetExport[];
  } | null>(null);
  const openCreateSegmentAndScroll = () => {
    onOpenCreateSegment();
    scrollToFormPanel(FORM_PANEL_IDS.segment);
  };
  const openEditSegmentAndScroll = (segment: Segment) => {
    onEditSegment(segment);
    scrollToFormPanel(FORM_PANEL_IDS.segment);
  };
  const openEditSegment = (segment: Segment) => {
    onEditSegment(segment);
  };
  const openCreateWireAndScroll = () => {
    onOpenCreateWire();
    scrollToFormPanel(FORM_PANEL_IDS.wire);
  };
  const openEditWireAndScroll = (wire: Wire) => {
    onEditWire(wire);
    scrollToFormPanel(FORM_PANEL_IDS.wire);
  };
  const openEditWire = (wire: Wire) => {
    onEditWire(wire);
  };
  const catalogItemById = useMemo(
    () => new Map(catalogItems.map((item) => [item.id, item] as const)),
    [catalogItems],
  );
  const connectorById = useMemo(
    () =>
      new Map(
        connectors.map((connector) => [connector.id, connector] as const),
      ),
    [connectors],
  );
  const spliceById = useMemo(
    () => new Map(splices.map((splice) => [splice.id, splice] as const)),
    [splices],
  );
  useEffect(() => {
    setSegmentTableSort((current) =>
      current.field === "id" && current.direction === _segmentIdSortDirection
        ? current
        : { field: "id", direction: _segmentIdSortDirection },
    );
  }, [_segmentIdSortDirection]);
  useEffect(() => {
    if (
      _wireSort.field !== "name" &&
      _wireSort.field !== "technicalId" &&
      _wireSort.field !== "lengthMm"
    ) {
      return;
    }
    const field = _wireSort.field === "lengthMm" ? "lengthMm" : _wireSort.field;
    setWireTableSort((current) =>
      current.field === field && current.direction === _wireSort.direction
        ? current
        : { field, direction: _wireSort.direction },
    );
  }, [_wireSort]);
  const sortedVisibleSegments = useMemo(
    () =>
      sortByTableColumns(
        visibleSegments,
        segmentTableSort,
        (segment, field) => {
          const nodeA = nodeLabelById.get(segment.nodeA) ?? segment.nodeA;
          const nodeB = nodeLabelById.get(segment.nodeB) ?? segment.nodeB;
          const subNetwork = segment.subNetworkTag?.trim() ?? "";
          if (field === "id") return segment.id;
          if (field === "nodeA") return nodeA;
          if (field === "nodeB") return nodeB;
          if (field === "lengthMm") return segment.lengthMm;
          return subNetwork;
        },
        (segment) => segment.id,
      ),
    [nodeLabelById, segmentTableSort, visibleSegments],
  );
  const sortedVisibleWires = useMemo(
    () =>
      sortByTableColumns(
        visibleWires,
        wireTableSort,
        (wire, field) => {
          const endpointA = describeWireEndpoint(wire.endpointA);
          const endpointB = describeWireEndpoint(wire.endpointB);
          if (field === "name") return wire.name;
          if (field === "technicalId") return wire.technicalId;
          if (field === "sectionMm2") return wire.sectionMm2;
          if (field === "color") return getWireColorSortValue(wire);
          if (field === "endpointA") return endpointA;
          if (field === "endpointB") return endpointB;
          if (field === "lengthMm") return wire.lengthMm;
          return wire.isRouteLocked ? "Locked" : "Auto";
        },
        (wire) => wire.id,
      ),
    [describeWireEndpoint, visibleWires, wireTableSort],
  );
  const visibleSegmentIds = useMemo(
    () => sortedVisibleSegments.map((segment) => segment.id),
    [sortedVisibleSegments],
  );
  const visibleWireIds = useMemo(
    () => sortedVisibleWires.map((wire) => wire.id),
    [sortedVisibleWires],
  );
  const allVisibleSegmentsSelected =
    visibleSegmentIds.length > 0 &&
    visibleSegmentIds.every((segmentId) => batchSelectionIds.has(segmentId));
  const allVisibleWiresSelected =
    visibleWireIds.length > 0 &&
    visibleWireIds.every((wireId) => batchSelectionIds.has(wireId));
  const selectedSegmentBatchCount = batchSelectionIds.size;
  const selectedWireBatchCount = batchSelectionIds.size;
  const segmentSortIndicator = (field: SegmentTableSortField) =>
    segmentTableSort.field === field
      ? segmentTableSort.direction === "asc"
        ? "▲"
        : "▼"
      : "";
  const wireSortIndicator = (field: WireTableSortField) =>
    wireTableSort.field === field
      ? wireTableSort.direction === "asc"
        ? "▲"
        : "▼"
      : "";
  const getWireFuseManufacturerReference = (wire: Wire): string | null => {
    if (wire.protection?.kind !== "fuse") {
      return null;
    }
    return (
      catalogItemById.get(wire.protection.catalogItemId)
        ?.manufacturerReference ?? "(missing catalog item)"
    );
  };
  const renderWireEndpointReference = (
    endpoint: WireEndpoint,
  ): ReactElement => {
    const label = describeWireEndpoint(endpoint);
    if (endpoint.kind === "connectorCavity") {
      const connector = connectorById.get(endpoint.connectorId);
      if (connector === undefined) {
        return <>{label}</>;
      }
      return (
        <EntityReferenceButton
          title={`Open connector ${connector.technicalId}`}
          onClick={() => onSelectConnectorReference(endpoint.connectorId)}
        >
          {label}
        </EntityReferenceButton>
      );
    }

    const splice = spliceById.get(endpoint.spliceId);
    if (splice === undefined) {
      return <>{label}</>;
    }
    return (
      <EntityReferenceButton
        title={`Open splice ${splice.technicalId}`}
        onClick={() => onSelectSpliceReference(endpoint.spliceId)}
      >
        {label}
      </EntityReferenceButton>
    );
  };

  useEffect(() => {
    if (segmentFormMode !== "edit" || selectedSegmentId === null) {
      lastAutoFocusedSegmentIdRef.current = null;
      return;
    }
    if (lastAutoFocusedSegmentIdRef.current === selectedSegmentId) {
      return;
    }
    lastAutoFocusedSegmentIdRef.current = selectedSegmentId;
    if (typeof window === "undefined") {
      focusElementWithoutScroll(segmentRowRefs.current[selectedSegmentId]);
      return;
    }
    window.requestAnimationFrame(() => {
      focusElementWithoutScroll(segmentRowRefs.current[selectedSegmentId]);
    });
  }, [segmentFormMode, selectedSegmentId]);

  useEffect(() => {
    if (wireFormMode !== "edit" || selectedWireId === null) {
      lastAutoFocusedWireIdRef.current = null;
      return;
    }
    if (lastAutoFocusedWireIdRef.current === selectedWireId) {
      return;
    }
    lastAutoFocusedWireIdRef.current = selectedWireId;
    if (typeof window === "undefined") {
      focusElementWithoutScroll(wireRowRefs.current[selectedWireId]);
      return;
    }
    window.requestAnimationFrame(() => {
      focusElementWithoutScroll(wireRowRefs.current[selectedWireId]);
    });
  }, [wireFormMode, selectedWireId]);

  useEffect(() => {
    const previousMode = previousSegmentFormModeRef.current;
    previousSegmentFormModeRef.current = segmentFormMode;
    if (
      previousMode !== "edit" ||
      segmentFormMode !== "create" ||
      selectedSegmentId === null
    ) {
      return;
    }
    if (typeof window === "undefined") {
      focusElementWithoutScroll(segmentRowRefs.current[selectedSegmentId]);
      return;
    }
    window.requestAnimationFrame(() => {
      focusElementWithoutScroll(segmentRowRefs.current[selectedSegmentId]);
    });
  }, [segmentFormMode, selectedSegmentId]);

  useEffect(() => {
    const previousMode = previousWireFormModeRef.current;
    previousWireFormModeRef.current = wireFormMode;
    if (
      previousMode !== "edit" ||
      wireFormMode !== "create" ||
      selectedWireId === null
    ) {
      return;
    }
    if (typeof window === "undefined") {
      focusElementWithoutScroll(wireRowRefs.current[selectedWireId]);
      return;
    }
    window.requestAnimationFrame(() => {
      focusElementWithoutScroll(wireRowRefs.current[selectedWireId]);
    });
  }, [wireFormMode, selectedWireId]);

  return (
    <>
      <article
        className="panel"
        hidden={!isSegmentSubScreen}
        data-onboarding-panel="modeling-segments"
      >
        <header className="list-panel-header list-panel-header-mobile-inline-tools">
          <h2>Segments</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row is-title-actions">
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() => {
                  const headers = showSegmentSubNetworkColumn
                    ? ["ID", "Node A", "Node B", "Length (mm)", "Sub-network"]
                    : ["ID", "Node A", "Node B", "Length (mm)"];
                  const rows = sortedVisibleSegments.map((segment) => {
                    const nodeA =
                      nodeLabelById.get(segment.nodeA) ?? segment.nodeA;
                    const nodeB =
                      nodeLabelById.get(segment.nodeB) ?? segment.nodeB;
                    if (showSegmentSubNetworkColumn) {
                      return [
                        segment.id,
                        nodeA,
                        nodeB,
                        segment.lengthMm,
                        segment.subNetworkTag?.trim() || "",
                      ];
                    }
                    return [segment.id, nodeA, nodeB, segment.lengthMm];
                  });
                  downloadCsvFile("modeling-segments", headers, rows);
                }}
                disabled={sortedVisibleSegments.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                CSV
              </button>
              <ConfigurableTableColumnsControl
                tableId="modeling-segments"
                tableRef={segmentTableRef}
                columns={segmentColumns}
                leadingColumnCount={isSegmentBatchMode ? 1 : 0}
                tableColumnPreferences={tableColumnPreferences}
                setTableColumnPreferences={setTableColumnPreferences}
              />
              {onOpenSegmentOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenSegmentOnboardingHelp}
                >
                  <span
                    className="action-button-icon is-help"
                    aria-hidden="true"
                  />
                  <span>Help</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row is-filter-row">
              <div
                className="chip-group list-panel-filters"
                role="group"
                aria-label="Segment sub-network filter"
              >
                {(
                  [
                    ["all", "All"],
                    ["default", "Default"],
                    ["tagged", "Tagged"],
                  ] as const
                ).map(([filterId, label]) => (
                  <button
                    key={filterId}
                    type="button"
                    className={
                      segmentSubNetworkFilter === filterId
                        ? "filter-chip is-active"
                        : "filter-chip"
                    }
                    onClick={() => setSegmentSubNetworkFilter(filterId)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <TableFilterBar
                label="Filter"
                fieldLabel="Segment filter field"
                fieldValue={segmentFilterField}
                onFieldChange={(value) =>
                  setSegmentFilterField(
                    value as "id" | "nodeA" | "nodeB" | "subNetwork" | "any",
                  )
                }
                fieldOptions={[
                  { value: "id", label: "Segment ID" },
                  { value: "nodeA", label: "Node A" },
                  { value: "nodeB", label: "Node B" },
                  { value: "subNetwork", label: "Sub-network" },
                  { value: "any", label: "Any" },
                ]}
                queryValue={segmentFilterQuery}
                onQueryChange={setSegmentFilterQuery}
                placeholder={segmentFilterPlaceholder}
              />
            </div>
          </div>
        </header>
        {segments.length === 0 ? (
          <p className="empty-copy">No segment yet.</p>
        ) : sortedVisibleSegments.length === 0 ? (
          <>
            <p className="empty-copy">
              No segment matches the current filters.
            </p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <>
            <table className="data-table" ref={segmentTableRef}>
              <thead>
                <tr>
                  {isSegmentBatchMode ? (
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all visible segments"
                        checked={allVisibleSegmentsSelected}
                        onChange={() =>
                          onSetBatchSelectionForVisible(
                            "segment",
                            visibleSegmentIds,
                          )
                        }
                      />
                    </th>
                  ) : null}
                  <th aria-sort={getTableAriaSort(segmentTableSort, "id")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => {
                        setSegmentTableSort((current) => ({
                          field: "id",
                          direction:
                            current.field === "id" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                        _setSegmentIdSortDirection((current) =>
                          current === "asc" ? "desc" : "asc",
                        );
                      }}
                    >
                      ID{" "}
                      <span className="sort-indicator">
                        {segmentSortIndicator("id")}
                      </span>
                    </button>
                  </th>
                  <th aria-sort={getTableAriaSort(segmentTableSort, "nodeA")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSegmentTableSort((current) => ({
                          field: "nodeA",
                          direction:
                            current.field === "nodeA" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      Node A{" "}
                      <span className="sort-indicator">
                        {segmentSortIndicator("nodeA")}
                      </span>
                    </button>
                  </th>
                  <th aria-sort={getTableAriaSort(segmentTableSort, "nodeB")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSegmentTableSort((current) => ({
                          field: "nodeB",
                          direction:
                            current.field === "nodeB" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      Node B{" "}
                      <span className="sort-indicator">
                        {segmentSortIndicator("nodeB")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(segmentTableSort, "lengthMm")}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setSegmentTableSort((current) => ({
                          field: "lengthMm",
                          direction:
                            current.field === "lengthMm" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      {isMobileViewport ? "Len" : "Length (mm)"}{" "}
                      <span className="sort-indicator">
                        {segmentSortIndicator("lengthMm")}
                      </span>
                    </button>
                  </th>
                  {showSegmentSubNetworkColumn ? (
                    <th
                      aria-sort={getTableAriaSort(
                        segmentTableSort,
                        "subNetwork",
                      )}
                    >
                      <button
                        type="button"
                        className="sort-header-button"
                        onClick={() =>
                          setSegmentTableSort((current) => ({
                            field: "subNetwork",
                            direction:
                              current.field === "subNetwork" &&
                              current.direction === "asc"
                                ? "desc"
                                : "asc",
                          }))
                        }
                      >
                        Sub-network{" "}
                        <span className="sort-indicator">
                          {segmentSortIndicator("subNetwork")}
                        </span>
                      </button>
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {sortedVisibleSegments.map((segment) => {
                  const nodeA =
                    nodeLabelById.get(segment.nodeA) ?? segment.nodeA;
                  const nodeB =
                    nodeLabelById.get(segment.nodeB) ?? segment.nodeB;
                  const isFocused = focusedSegment?.id === segment.id;
                  const isWireHighlighted = selectedWireRouteSegmentIds.has(
                    segment.id,
                  );
                  const isBatchSelected = batchSelectionIds.has(segment.id);
                  const rowClassName = `${isSegmentBatchMode ? (isBatchSelected ? "is-selected " : "") : isFocused ? "is-selected " : ""}${isWireHighlighted ? "is-wire-highlighted " : ""}is-focusable-row`;
                  return (
                    <tr
                      key={segment.id}
                      ref={(element) => {
                        segmentRowRefs.current[segment.id] = element;
                      }}
                      className={rowClassName}
                      aria-selected={
                        isSegmentBatchMode ? isBatchSelected : isFocused
                      }
                      tabIndex={0}
                      onClick={() =>
                        isSegmentBatchMode
                          ? onToggleBatchSelection("segment", segment.id)
                          : openEditSegment(segment)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          if (isSegmentBatchMode) {
                            onToggleBatchSelection("segment", segment.id);
                            return;
                          }
                          openEditSegment(segment);
                        }
                      }}
                    >
                      {isSegmentBatchMode ? (
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select segment ${segment.id}`}
                            checked={isBatchSelected}
                            onChange={() =>
                              onToggleBatchSelection("segment", segment.id)
                            }
                            onClick={(event) => event.stopPropagation()}
                          />
                        </td>
                      ) : null}
                      <td className="technical-id">{segment.id}</td>
                      <td>{nodeA}</td>
                      <td>{nodeB}</td>
                      <td>{segment.lengthMm}</td>
                      {showSegmentSubNetworkColumn ? (
                        <td>
                          {(segment.subNetworkTag?.trim().length ?? 0) > 0 ? (
                            <span className="subnetwork-chip">
                              {segment.subNetworkTag?.trim()}
                            </span>
                          ) : null}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <TableEntryCountFooter count={sortedVisibleSegments.length} />
          </>
        )}
        <div className="row-actions compact modeling-list-actions">
          {isSegmentBatchMode ? (
            <>
              <button
                type="button"
                className="button-with-icon"
                onClick={onOpenBatchSelectionDialog}
                disabled={selectedSegmentBatchCount === 0}
              >
                Open batch
                {selectedSegmentBatchCount > 0
                  ? ` (${selectedSegmentBatchCount})`
                  : ""}
              </button>
              <button
                type="button"
                className="modeling-list-action-delete button-with-icon"
                onClick={onDeleteSelectedInBatchMode}
                disabled={selectedSegmentBatchCount === 0}
              >
                <span
                  className="action-button-icon is-delete"
                  aria-hidden="true"
                />
                Delete selected
                {selectedSegmentBatchCount > 0
                  ? ` (${selectedSegmentBatchCount})`
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
                onClick={openCreateSegmentAndScroll}
              >
                <span
                  className="action-button-icon is-new"
                  aria-hidden="true"
                />
                New
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={() =>
                  focusedSegment !== null &&
                  openEditSegmentAndScroll(focusedSegment)
                }
                disabled={focusedSegment === null}
              >
                <span
                  className="action-button-icon is-edit"
                  aria-hidden="true"
                />
                Edit
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={() => onEnterBatchMode("segment")}
                disabled={sortedVisibleSegments.length === 0}
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
                  focusedSegment !== null && onDeleteSegment(focusedSegment.id)
                }
                disabled={
                  focusedSegment === null || segmentFormMode === "create"
                }
              >
                <span
                  className="action-button-icon is-delete"
                  aria-hidden="true"
                />
                Delete
              </button>
            </>
          )}
        </div>
      </article>

      <article
        className="panel"
        hidden={!isWireSubScreen}
        data-onboarding-panel="modeling-wires"
      >
        <header className="list-panel-header list-panel-header-mobile-inline-tools">
          <h2>Wires</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row is-title-actions">
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() => {
                  const headers = showWireRouteModeColumn
                    ? [
                        "Name",
                        "Technical ID",
                        "Twist group",
                        "Color",
                        "Begin ID",
                        "Begin pin",
                        "Begin connection ref",
                        "Begin connection name",
                        "Begin seal ref",
                        "Begin seal name",
                        "End ID",
                        "End pin",
                        "End connection ref",
                        "End connection name",
                        "End seal ref",
                        "End seal name",
                        "Section (mm²)",
                        "Length (mm)",
                        "Untwisted length (mm)",
                        "Route mode",
                      ]
                    : [
                        "Name",
                        "Technical ID",
                        "Color",
                        "Begin ID",
                        "Begin pin",
                        "Begin connection ref",
                        "Begin connection name",
                        "Begin seal ref",
                        "Begin seal name",
                        "End ID",
                        "End pin",
                        "End connection ref",
                        "End connection name",
                        "End seal ref",
                        "End seal name",
                        "Section (mm²)",
                        "Length (mm)",
                        "Untwisted length (mm)",
                      ];
                  const twistGroupCounts = buildWireTwistGroupExportCounts(wires);
                  const rows = sortedVisibleWires.map((wire) => {
                    const begin = describeWireEndpointCsvParts(wire.endpointA);
                    const end = describeWireEndpointCsvParts(wire.endpointB);
                    const colorCode = getWireColorCsvValue(wire);
                    const beginMaterials = resolveWireExportEndpointMaterials(
                      wire,
                      "A",
                      connectorById,
                      spliceById,
                      catalogItemById,
                    );
                    const endMaterials = resolveWireExportEndpointMaterials(
                      wire,
                      "B",
                      connectorById,
                      spliceById,
                      catalogItemById,
                    );
                    if (showWireRouteModeColumn) {
                      return [
                        wire.name,
                        wire.technicalId,
                        wire.twistGroupLabel ?? "",
                        colorCode,
                        begin.endpointId,
                        begin.pin,
                        beginMaterials.connectionRef,
                        beginMaterials.connectionName,
                        beginMaterials.sealRef,
                        beginMaterials.sealName,
                        end.endpointId,
                        end.pin,
                        endMaterials.connectionRef,
                        endMaterials.connectionName,
                        endMaterials.sealRef,
                        endMaterials.sealName,
                        wire.sectionMm2,
                        resolveWireExportLengthMm(
                          wire,
                          twistGroupCounts,
                          wireExportLengthPreferences,
                        ),
                        resolveWireUntwistedExportLengthMm(
                          wire,
                          twistGroupCounts,
                          wireExportLengthPreferences,
                        ),
                        wire.isRouteLocked ? "Locked" : "Auto",
                      ];
                    }
                    return [
                      wire.name,
                      wire.technicalId,
                      wire.twistGroupLabel ?? "",
                      colorCode,
                      begin.endpointId,
                      begin.pin,
                      beginMaterials.connectionRef,
                      beginMaterials.connectionName,
                      beginMaterials.sealRef,
                      beginMaterials.sealName,
                      end.endpointId,
                      end.pin,
                      endMaterials.connectionRef,
                      endMaterials.connectionName,
                      endMaterials.sealRef,
                      endMaterials.sealName,
                      wire.sectionMm2,
                      resolveWireExportLengthMm(
                        wire,
                        twistGroupCounts,
                        wireExportLengthPreferences,
                      ),
                      resolveWireUntwistedExportLengthMm(
                        wire,
                        twistGroupCounts,
                        wireExportLengthPreferences,
                      ),
                    ];
                  });
                  const sheetContent = appendWireReferenceTable(
                    headers,
                    rows,
                    connectors,
                    splices,
                    nodes,
                  );
                  const sheet = {
                    name: "Modeling Wires",
                    headers: sheetContent.headers,
                    rows: sheetContent.rows,
                    freezeHeaderRow: true,
                    autoFilter: true,
                  } satisfies TabularWorksheetExport;
                  const filenameBase = [
                    "wire-list",
                    normalizeFileNamePart(activeNetworkName),
                    normalizeFileNamePart(focusedWire?.technicalId) ?? "modeling",
                  ]
                    .filter((part): part is string => part !== null)
                    .join("-");
                  if (tabularExportFormat === "xlsx") {
                    setWireExportPreview({
                      filenameBase,
                      sheets: [sheet],
                    });
                    return;
                  }
                  void downloadTabularCsvOrXlsxFile(
                    filenameBase,
                    tabularExportFormat,
                    sheet,
                    { includeUtf8Bom: true },
                  );
                }}
                disabled={sortedVisibleWires.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                {tabularExportFormat.toUpperCase()}
              </button>
              <ConfigurableTableColumnsControl
                tableId="modeling-wires"
                tableRef={wireTableRef}
                columns={wireColumns}
                leadingColumnCount={isWireBatchMode ? 1 : 0}
                tableColumnPreferences={tableColumnPreferences}
                setTableColumnPreferences={setTableColumnPreferences}
              />
              {onOpenWireOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenWireOnboardingHelp}
                >
                  <span
                    className="action-button-icon is-help"
                    aria-hidden="true"
                  />
                  <span>Help</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row is-filter-row is-wire-filter-row">
              <label className="list-inline-number-filter wire-tag-filter">
                <span>Tag</span>
                <select
                  className="list-inline-table-filter-select"
                  aria-label="Wire tag filter"
                  value={wireFunctionalTagFilter}
                  onChange={(event) =>
                    setWireFunctionalTagFilter(event.target.value)
                  }
                >
                  <option value="all">Any</option>
                  {wireFunctionalTagOptions.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <TableFilterBar
                label="Filter"
                fieldLabel="Wire filter field"
                fieldValue={wireFilterField}
                onFieldChange={(value) =>
                  setWireFilterField(
                    value as "endpoints" | "name" | "technicalId" | "any",
                  )
                }
                fieldOptions={[
                  { value: "endpoints", label: "Endpoints" },
                  { value: "name", label: "Wire name" },
                  { value: "technicalId", label: "Technical ID" },
                  { value: "any", label: "Any" },
                ]}
                queryValue={wireEndpointFilterQuery}
                onQueryChange={setWireEndpointFilterQuery}
                placeholder={wireFilterPlaceholder}
              />
            </div>
          </div>
        </header>
        {wires.length === 0 ? (
          <p className="empty-copy">No wire yet.</p>
        ) : sortedVisibleWires.length === 0 ? (
          <>
            <p className="empty-copy">No wire matches the current filters.</p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <>
            <table className="data-table" ref={wireTableRef}>
              <thead>
                <tr>
                  {isWireBatchMode ? (
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all visible wires"
                        checked={allVisibleWiresSelected}
                        onChange={() =>
                          onSetBatchSelectionForVisible("wire", visibleWireIds)
                        }
                      />
                    </th>
                  ) : null}
                  <th aria-sort={getTableAriaSort(wireTableSort, "name")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => {
                        setWireTableSort((current) => ({
                          field: "name",
                          direction:
                            current.field === "name" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                        _setWireSort((current) => ({
                          field: "name",
                          direction:
                            current.field === "name" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                      }}
                    >
                      Name{" "}
                      <span className="sort-indicator">
                        {wireSortIndicator("name")}
                      </span>
                    </button>
                  </th>
                  <th
                    aria-sort={getTableAriaSort(wireTableSort, "technicalId")}
                  >
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => {
                        setWireTableSort((current) => ({
                          field: "technicalId",
                          direction:
                            current.field === "technicalId" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                        _setWireSort((current) => ({
                          field: "technicalId",
                          direction:
                            current.field === "technicalId" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                      }}
                    >
                      {isMobileViewport ? "ID" : "Technical ID"}{" "}
                      <span className="sort-indicator">
                        {wireSortIndicator("technicalId")}
                      </span>
                    </button>
                  </th>
                  <th>{isMobileViewport ? "Func tag" : "Functional tag"}</th>
                  <th>{isMobileViewport ? "Twist" : "Twist group"}</th>
                  <th aria-sort={getTableAriaSort(wireTableSort, "color")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setWireTableSort((current) => ({
                          field: "color",
                          direction:
                            current.field === "color" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      Color{" "}
                      <span className="sort-indicator">
                        {wireSortIndicator("color")}
                      </span>
                    </button>
                  </th>
                  <th aria-sort={getTableAriaSort(wireTableSort, "endpointA")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setWireTableSort((current) => ({
                          field: "endpointA",
                          direction:
                            current.field === "endpointA" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      {isMobileViewport ? "End A" : "Endpoint A"}{" "}
                      <span className="sort-indicator">
                        {wireSortIndicator("endpointA")}
                      </span>
                    </button>
                  </th>
                  <th aria-sort={getTableAriaSort(wireTableSort, "endpointB")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setWireTableSort((current) => ({
                          field: "endpointB",
                          direction:
                            current.field === "endpointB" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      {isMobileViewport ? "End B" : "Endpoint B"}{" "}
                      <span className="sort-indicator">
                        {wireSortIndicator("endpointB")}
                      </span>
                    </button>
                  </th>
                  <th aria-sort={getTableAriaSort(wireTableSort, "sectionMm2")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() =>
                        setWireTableSort((current) => ({
                          field: "sectionMm2",
                          direction:
                            current.field === "sectionMm2" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      {isMobileViewport ? "Sec" : "Section (mm²)"}{" "}
                      <span className="sort-indicator">
                        {wireSortIndicator("sectionMm2")}
                      </span>
                    </button>
                  </th>
                  <th aria-sort={getTableAriaSort(wireTableSort, "lengthMm")}>
                    <button
                      type="button"
                      className="sort-header-button"
                      onClick={() => {
                        setWireTableSort((current) => ({
                          field: "lengthMm",
                          direction:
                            current.field === "lengthMm" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                        _setWireSort((current) => ({
                          field: "lengthMm",
                          direction:
                            current.field === "lengthMm" &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }));
                      }}
                    >
                      {isMobileViewport ? "Len" : "Length (mm)"}{" "}
                      <span className="sort-indicator">
                        {wireSortIndicator("lengthMm")}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVisibleWires.map((wire) => {
                  const isFocused = focusedWire?.id === wire.id;
                  const fuseManufacturerReference =
                    getWireFuseManufacturerReference(wire);
                  const fuseCatalogItemId = wire.protection?.catalogItemId;
                  const fuseCatalogItem =
                    fuseCatalogItemId === undefined
                      ? undefined
                      : catalogItemById.get(fuseCatalogItemId);
                  const isBatchSelected = batchSelectionIds.has(wire.id);
                  return (
                    <tr
                      key={wire.id}
                      ref={(element) => {
                        wireRowRefs.current[wire.id] = element;
                      }}
                      className={
                        isWireBatchMode
                          ? `${isBatchSelected ? "is-selected " : ""}is-focusable-row`
                          : isFocused
                            ? "is-selected is-focusable-row"
                            : "is-focusable-row"
                      }
                      aria-selected={
                        isWireBatchMode ? isBatchSelected : isFocused
                      }
                      tabIndex={0}
                      onClick={() =>
                        isWireBatchMode
                          ? onToggleBatchSelection("wire", wire.id)
                          : openEditWire(wire)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          if (isWireBatchMode) {
                            onToggleBatchSelection("wire", wire.id);
                            return;
                          }
                          openEditWire(wire);
                        }
                      }}
                    >
                      {isWireBatchMode ? (
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select wire ${wire.technicalId}`}
                            checked={isBatchSelected}
                            onChange={() =>
                              onToggleBatchSelection("wire", wire.id)
                            }
                            onClick={(event) => event.stopPropagation()}
                          />
                        </td>
                      ) : null}
                      <td>
                        <div>{wire.name}</div>
                        {fuseManufacturerReference !== null ? (
                          <div className="wire-fuse-inline">
                            <span className="status-chip wire-fuse-chip">
                              Fuse
                            </span>
                            {fuseCatalogItemId !== undefined &&
                            fuseCatalogItem !== undefined ? (
                              <EntityReferenceButton
                                className="technical-id"
                                title={`Open catalog item ${fuseManufacturerReference}`}
                                onClick={() =>
                                  onSelectCatalogItem(fuseCatalogItemId)
                                }
                              >
                                {fuseManufacturerReference}
                              </EntityReferenceButton>
                            ) : (
                              <span className="technical-id">
                                {fuseManufacturerReference}
                              </span>
                            )}
                          </div>
                        ) : null}
                      </td>
                      <td className="technical-id">{wire.technicalId}</td>
                      <td>{wire.functionalDomainTag ?? "Auto"}</td>
                      <td>{wire.twistGroupLabel ?? ""}</td>
                      <td>{renderWireColorCellValue(wire)}</td>
                      <td>{renderWireEndpointReference(wire.endpointA)}</td>
                      <td>{renderWireEndpointReference(wire.endpointB)}</td>
                      <td>{wire.sectionMm2}</td>
                      <td>{wire.lengthMm}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <TableEntryCountFooter count={sortedVisibleWires.length} />
          </>
        )}
        <div className="row-actions compact modeling-list-actions">
          {isWireBatchMode ? (
            <>
              <button
                type="button"
                className="button-with-icon"
                onClick={onOpenBatchSelectionDialog}
                disabled={selectedWireBatchCount === 0}
              >
                Open batch
                {selectedWireBatchCount > 0
                  ? ` (${selectedWireBatchCount})`
                  : ""}
              </button>
              <button
                type="button"
                className="modeling-list-action-delete button-with-icon"
                onClick={onDeleteSelectedInBatchMode}
                disabled={selectedWireBatchCount === 0}
              >
                <span
                  className="action-button-icon is-delete"
                  aria-hidden="true"
                />
                Delete selected
                {selectedWireBatchCount > 0
                  ? ` (${selectedWireBatchCount})`
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
                onClick={openCreateWireAndScroll}
              >
                <span
                  className="action-button-icon is-new"
                  aria-hidden="true"
                />
                New
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={() =>
                  focusedWire !== null && openEditWireAndScroll(focusedWire)
                }
                disabled={focusedWire === null}
              >
                <span
                  className="action-button-icon is-edit"
                  aria-hidden="true"
                />
                Edit
              </button>
              <button
                type="button"
                className="button-with-icon"
                onClick={() => onEnterBatchMode("wire")}
                disabled={sortedVisibleWires.length === 0}
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
                  focusedWire !== null && onDeleteWire(focusedWire.id)
                }
                disabled={focusedWire === null || wireFormMode === "create"}
              >
                <span
                  className="action-button-icon is-delete"
                  aria-hidden="true"
                />
                Delete
              </button>
            </>
          )}
        </div>
      </article>
      {wireExportPreview !== null ? (
        <TabularExportPreviewDialog
          isOpen={wireExportPreview !== null}
          title="Wire export preview"
          summaryLabel="Modeling wires"
          filenameLabel={`${wireExportPreview.filenameBase}.xlsx`}
          sheets={wireExportPreview.sheets}
          onConfirm={() => {
            void downloadTabularWorkbookFile(
              wireExportPreview.filenameBase,
              wireExportPreview.sheets,
            ).catch((error: unknown) => {
              console.error("Failed to export modeling wires workbook", error);
            });
            setWireExportPreview(null);
          }}
          onCancel={() => setWireExportPreview(null)}
        />
      ) : null}
    </>
  );
}

export const ModelingSecondaryTables = memo(ModelingSecondaryTablesComponent, arePanelMemoPropsEqual);
