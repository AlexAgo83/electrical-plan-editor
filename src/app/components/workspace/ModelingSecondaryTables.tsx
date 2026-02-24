import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { getWireColorSortValue } from "../../../core/cableColors";
import { focusElementWithoutScroll, sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import { getWireColorCsvValue, renderWireColorCellValue } from "../../lib/wireColorPresentation";
import { TableFilterBar } from "./TableFilterBar";
import type {
  NodeId,
  Segment,
  SegmentId,
  Wire,
  WireId
} from "../../../core/entities";
import type { SegmentSubNetworkFilter, SortDirection, SortState } from "../../types/app-controller";

interface ModelingSecondaryTablesProps {
  isSegmentSubScreen: boolean;
  segmentFormMode: "idle" | "create" | "edit";
  onOpenCreateSegment: () => void;
  segmentSubNetworkFilter: SegmentSubNetworkFilter;
  setSegmentSubNetworkFilter: (value: SegmentSubNetworkFilter) => void;
  segmentFilterField: "id" | "nodeA" | "nodeB" | "subNetwork" | "any";
  setSegmentFilterField: (value: "id" | "nodeA" | "nodeB" | "subNetwork" | "any") => void;
  segmentFilterQuery: string;
  setSegmentFilterQuery: (value: string) => void;
  segments: Segment[];
  visibleSegments: Segment[];
  segmentIdSortDirection: SortDirection;
  setSegmentIdSortDirection: (value: SortDirection | ((current: SortDirection) => SortDirection)) => void;
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
  setWireRouteFilter: (value: "all" | "auto" | "locked") => void;
  wireFilterField: "endpoints" | "name" | "technicalId" | "any";
  setWireFilterField: (value: "endpoints" | "name" | "technicalId" | "any") => void;
  wireEndpointFilterQuery: string;
  setWireEndpointFilterQuery: (value: string) => void;
  wires: Wire[];
  visibleWires: Wire[];
  wireSort: SortState;
  setWireSort: (value: SortState | ((current: SortState) => SortState)) => void;
  getSortIndicator: (sortState: SortState, field: SortState["field"]) => string;
  selectedWireId: WireId | null;
  describeWireEndpoint: (endpoint: Wire["endpointA"]) => string;
  describeWireEndpointId: (endpoint: Wire["endpointA"]) => string;
  onEditWire: (wire: Wire) => void;
  onDeleteWire: (wireId: WireId) => void;
  onOpenWireOnboardingHelp?: () => void;
}

export function ModelingSecondaryTables({
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
  setWireRouteFilter,
  wireFilterField,
  setWireFilterField,
  wireEndpointFilterQuery,
  setWireEndpointFilterQuery,
  wires,
  visibleWires,
  wireSort: _wireSort,
  setWireSort: _setWireSort,
  getSortIndicator: _getSortIndicator,
  selectedWireId,
  describeWireEndpoint,
  describeWireEndpointId,
  onEditWire,
  onDeleteWire,
  onOpenWireOnboardingHelp
}: ModelingSecondaryTablesProps): ReactElement {
  void _getSortIndicator;
  type SegmentTableSortField = "id" | "nodeA" | "nodeB" | "lengthMm" | "subNetwork";
  type WireTableSortField = "name" | "technicalId" | "sectionMm2" | "color" | "endpoints" | "lengthMm" | "routeMode";
  const segmentRowRefs = useRef<Partial<Record<SegmentId, HTMLTableRowElement | null>>>({});
  const wireRowRefs = useRef<Partial<Record<WireId, HTMLTableRowElement | null>>>({});
  const lastAutoFocusedSegmentIdRef = useRef<SegmentId | null>(null);
  const lastAutoFocusedWireIdRef = useRef<WireId | null>(null);
  const previousSegmentFormModeRef = useRef<typeof segmentFormMode>(segmentFormMode);
  const previousWireFormModeRef = useRef<typeof wireFormMode>(wireFormMode);
  const focusedSegment =
    selectedSegmentId === null ? null : (visibleSegments.find((segment) => segment.id === selectedSegmentId) ?? null);
  const focusedWire =
    selectedWireId === null ? null : (visibleWires.find((wire) => wire.id === selectedWireId) ?? null);
  const showSegmentSubNetworkColumn = segmentSubNetworkFilter !== "default";
  const showWireRouteModeColumn = wireRouteFilter === "all";
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
  const [segmentTableSort, setSegmentTableSort] = useState<{ field: SegmentTableSortField; direction: "asc" | "desc" }>({
    field: "id",
    direction: "asc"
  });
  const [wireTableSort, setWireTableSort] = useState<{ field: WireTableSortField; direction: "asc" | "desc" }>({
    field: "name",
    direction: "asc"
  });
  useEffect(() => {
    setSegmentTableSort((current) =>
      current.field === "id" && current.direction === _segmentIdSortDirection
        ? current
        : { field: "id", direction: _segmentIdSortDirection }
    );
  }, [_segmentIdSortDirection]);
  useEffect(() => {
    if (_wireSort.field !== "name" && _wireSort.field !== "technicalId" && _wireSort.field !== "lengthMm") {
      return;
    }
    const field =
      _wireSort.field === "lengthMm" ? "lengthMm" : _wireSort.field;
    setWireTableSort((current) =>
      current.field === field && current.direction === _wireSort.direction
        ? current
        : { field, direction: _wireSort.direction }
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
        (segment) => segment.id
      ),
    [nodeLabelById, segmentTableSort, visibleSegments]
  );
  const sortedVisibleWires = useMemo(
    () =>
      sortByTableColumns(
        visibleWires,
        wireTableSort,
        (wire, field) => {
          const endpoints = `${describeWireEndpoint(wire.endpointA)} -> ${describeWireEndpoint(wire.endpointB)}`;
          if (field === "name") return wire.name;
          if (field === "technicalId") return wire.technicalId;
          if (field === "sectionMm2") return wire.sectionMm2;
          if (field === "color") return getWireColorSortValue(wire);
          if (field === "endpoints") return endpoints;
          if (field === "lengthMm") return wire.lengthMm;
          return wire.isRouteLocked ? "Locked" : "Auto";
        },
        (wire) => wire.id
      ),
    [describeWireEndpoint, visibleWires, wireTableSort]
  );
  const segmentSortIndicator = (field: SegmentTableSortField) =>
    segmentTableSort.field === field ? (segmentTableSort.direction === "asc" ? "▲" : "▼") : "";
  const wireSortIndicator = (field: WireTableSortField) =>
    wireTableSort.field === field ? (wireTableSort.direction === "asc" ? "▲" : "▼") : "";

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
    if (previousMode !== "edit" || segmentFormMode !== "create" || selectedSegmentId === null) {
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
    if (previousMode !== "edit" || wireFormMode !== "create" || selectedWireId === null) {
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
      <article className="panel" hidden={!isSegmentSubScreen} data-onboarding-panel="modeling-segments">
        <header className="list-panel-header">
          <h2>Segments</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row">
              <div className="chip-group list-panel-filters" role="group" aria-label="Segment sub-network filter">
                {([
                  ["all", "All"],
                  ["default", "Default"],
                  ["tagged", "Tagged"]
                ] as const).map(([filterId, label]) => (
                  <button key={filterId} type="button" className={segmentSubNetworkFilter === filterId ? "filter-chip is-active" : "filter-chip"} onClick={() => setSegmentSubNetworkFilter(filterId)}>{label}</button>
                ))}
              </div>
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() => {
                  const headers = showSegmentSubNetworkColumn
                    ? ["ID", "Node A", "Node B", "Length (mm)", "Sub-network"]
                    : ["ID", "Node A", "Node B", "Length (mm)"];
                  const rows = sortedVisibleSegments.map((segment) => {
                    const nodeA = nodeLabelById.get(segment.nodeA) ?? segment.nodeA;
                    const nodeB = nodeLabelById.get(segment.nodeB) ?? segment.nodeB;
                    if (showSegmentSubNetworkColumn) {
                      return [segment.id, nodeA, nodeB, segment.lengthMm, segment.subNetworkTag?.trim() || ""];
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
              {onOpenSegmentOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenSegmentOnboardingHelp}
                >
                  <span className="action-button-icon is-help" aria-hidden="true" />
                  <span>Help</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row">
              <TableFilterBar
                label="Filter"
                fieldLabel="Segment filter field"
                fieldValue={segmentFilterField}
                onFieldChange={(value) => setSegmentFilterField(value as "id" | "nodeA" | "nodeB" | "subNetwork" | "any")}
                fieldOptions={[
                  { value: "id", label: "Segment ID" },
                  { value: "nodeA", label: "Node A" },
                  { value: "nodeB", label: "Node B" },
                  { value: "subNetwork", label: "Sub-network" },
                  { value: "any", label: "Any" }
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
          <p className="empty-copy">No segment matches the current filters.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => { setSegmentTableSort((current) => ({ field: "id", direction: current.field === "id" && current.direction === "asc" ? "desc" : "asc" })); _setSegmentIdSortDirection((current) => current === "asc" ? "desc" : "asc"); }}>ID <span className="sort-indicator">{segmentSortIndicator("id")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort((current) => ({ field: "nodeA", direction: current.field === "nodeA" && current.direction === "asc" ? "desc" : "asc" }))}>Node A <span className="sort-indicator">{segmentSortIndicator("nodeA")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort((current) => ({ field: "nodeB", direction: current.field === "nodeB" && current.direction === "asc" ? "desc" : "asc" }))}>Node B <span className="sort-indicator">{segmentSortIndicator("nodeB")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort((current) => ({ field: "lengthMm", direction: current.field === "lengthMm" && current.direction === "asc" ? "desc" : "asc" }))}>Length (mm) <span className="sort-indicator">{segmentSortIndicator("lengthMm")}</span></button></th>
                {showSegmentSubNetworkColumn ? <th><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort((current) => ({ field: "subNetwork", direction: current.field === "subNetwork" && current.direction === "asc" ? "desc" : "asc" }))}>Sub-network <span className="sort-indicator">{segmentSortIndicator("subNetwork")}</span></button></th> : null}
              </tr>
            </thead>
            <tbody>
              {sortedVisibleSegments.map((segment) => {
                const nodeA = nodeLabelById.get(segment.nodeA) ?? segment.nodeA;
                const nodeB = nodeLabelById.get(segment.nodeB) ?? segment.nodeB;
                const isFocused = focusedSegment?.id === segment.id;
                const isWireHighlighted = selectedWireRouteSegmentIds.has(segment.id);
                const rowClassName = `${isFocused ? "is-selected " : ""}${isWireHighlighted ? "is-wire-highlighted " : ""}is-focusable-row`;
                return (
                  <tr
                    key={segment.id}
                    ref={(element) => {
                      segmentRowRefs.current[segment.id] = element;
                    }}
                    className={rowClassName}
                    aria-selected={isFocused}
                    tabIndex={0}
                    onClick={() => onEditSegment(segment)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onEditSegment(segment);
                      }
                    }}
                  >
                    <td className="technical-id">{segment.id}</td>
                    <td>{nodeA}</td>
                    <td>{nodeB}</td>
                    <td>{segment.lengthMm}</td>
                    {showSegmentSubNetworkColumn ? (
                      <td>{(segment.subNetworkTag?.trim().length ?? 0) > 0 ? <span className="subnetwork-chip">{segment.subNetworkTag?.trim()}</span> : null}</td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="row-actions compact modeling-list-actions">
          <button type="button" className="button-with-icon" onClick={onOpenCreateSegment}>
            <span className="action-button-icon is-new" aria-hidden="true" />
            New
          </button>
          <button
            type="button"
            className="button-with-icon"
            onClick={() => focusedSegment !== null && onEditSegment(focusedSegment)}
            disabled={focusedSegment === null}
          >
            <span className="action-button-icon is-edit" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className="modeling-list-action-delete button-with-icon"
            onClick={() => focusedSegment !== null && onDeleteSegment(focusedSegment.id)}
            disabled={focusedSegment === null || segmentFormMode === "create"}
          >
            <span className="action-button-icon is-delete" aria-hidden="true" />
            Delete
          </button>
        </div>
      </article>

      <article className="panel" hidden={!isWireSubScreen} data-onboarding-panel="modeling-wires">
        <header className="list-panel-header">
          <h2>Wires</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row">
              <div className="chip-group list-panel-filters" role="group" aria-label="Wire route mode filter">
                {([
                  ["all", "All"],
                  ["auto", "Auto"],
                  ["locked", "Locked"]
                ] as const).map(([filterId, label]) => (
                  <button key={filterId} type="button" className={wireRouteFilter === filterId ? "filter-chip is-active" : "filter-chip"} onClick={() => setWireRouteFilter(filterId)}>{label}</button>
                ))}
              </div>
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() => {
                  const headers = showWireRouteModeColumn
                    ? ["Name", "Technical ID", "Color", "Endpoints", "Begin", "End", "Section (mm²)", "Length (mm)", "Route mode"]
                    : ["Name", "Technical ID", "Color", "Endpoints", "Begin", "End", "Section (mm²)", "Length (mm)"];
                  const rows = sortedVisibleWires.map((wire) => {
                    const endpoints = `${describeWireEndpoint(wire.endpointA)} -> ${describeWireEndpoint(wire.endpointB)}`;
                    const begin = describeWireEndpointId(wire.endpointA);
                    const end = describeWireEndpointId(wire.endpointB);
                    const colorCode = getWireColorCsvValue(wire);
                    if (showWireRouteModeColumn) {
                      return [
                        wire.name,
                        wire.technicalId,
                        colorCode,
                        endpoints,
                        begin,
                        end,
                        wire.sectionMm2,
                        wire.lengthMm,
                        wire.isRouteLocked ? "Locked" : "Auto"
                      ];
                    }
                    return [wire.name, wire.technicalId, colorCode, endpoints, begin, end, wire.sectionMm2, wire.lengthMm];
                  });
                  downloadCsvFile("modeling-wires", headers, rows);
                }}
                disabled={sortedVisibleWires.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                CSV
              </button>
              {onOpenWireOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenWireOnboardingHelp}
                >
                  <span className="action-button-icon is-help" aria-hidden="true" />
                  <span>Help</span>
                </button>
              ) : null}
            </div>
              <div className="list-panel-header-tools-row">
                <TableFilterBar
                  label="Filter"
                  fieldLabel="Wire filter field"
                  fieldValue={wireFilterField}
                  onFieldChange={(value) => setWireFilterField(value as "endpoints" | "name" | "technicalId" | "any")}
                  fieldOptions={[
                    { value: "endpoints", label: "Endpoints" },
                    { value: "name", label: "Wire name" },
                    { value: "technicalId", label: "Technical ID" },
                    { value: "any", label: "Any" }
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
          <p className="empty-copy">No wire matches the current filters.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => { setWireTableSort((current) => ({ field: "name", direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc" })); _setWireSort((current) => ({ field: "name", direction: current.field === "name" && current.direction === "asc" ? "desc" : "asc" })); }}>Name <span className="sort-indicator">{wireSortIndicator("name")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => { setWireTableSort((current) => ({ field: "technicalId", direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc" })); _setWireSort((current) => ({ field: "technicalId", direction: current.field === "technicalId" && current.direction === "asc" ? "desc" : "asc" })); }}>Technical ID <span className="sort-indicator">{wireSortIndicator("technicalId")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => setWireTableSort((current) => ({ field: "color", direction: current.field === "color" && current.direction === "asc" ? "desc" : "asc" }))}>Color <span className="sort-indicator">{wireSortIndicator("color")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => setWireTableSort((current) => ({ field: "endpoints", direction: current.field === "endpoints" && current.direction === "asc" ? "desc" : "asc" }))}>Endpoints <span className="sort-indicator">{wireSortIndicator("endpoints")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => setWireTableSort((current) => ({ field: "sectionMm2", direction: current.field === "sectionMm2" && current.direction === "asc" ? "desc" : "asc" }))}>Section (mm²) <span className="sort-indicator">{wireSortIndicator("sectionMm2")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => { setWireTableSort((current) => ({ field: "lengthMm", direction: current.field === "lengthMm" && current.direction === "asc" ? "desc" : "asc" })); _setWireSort((current) => ({ field: "lengthMm", direction: current.field === "lengthMm" && current.direction === "asc" ? "desc" : "asc" })); }}>Length (mm) <span className="sort-indicator">{wireSortIndicator("lengthMm")}</span></button></th>
                {showWireRouteModeColumn ? <th><button type="button" className="sort-header-button" onClick={() => setWireTableSort((current) => ({ field: "routeMode", direction: current.field === "routeMode" && current.direction === "asc" ? "desc" : "asc" }))}>Route mode <span className="sort-indicator">{wireSortIndicator("routeMode")}</span></button></th> : null}
              </tr>
            </thead>
            <tbody>
              {sortedVisibleWires.map((wire) => {
                const isFocused = focusedWire?.id === wire.id;
                return (
                  <tr
                    key={wire.id}
                    ref={(element) => {
                      wireRowRefs.current[wire.id] = element;
                    }}
                    className={isFocused ? "is-selected is-focusable-row" : "is-focusable-row"}
                    aria-selected={isFocused}
                    tabIndex={0}
                    onClick={() => onEditWire(wire)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onEditWire(wire);
                      }
                    }}
                  >
                    <td>{wire.name}</td>
                    <td className="technical-id">{wire.technicalId}</td>
              <td>{renderWireColorCellValue(wire)}</td>
                    <td>{describeWireEndpoint(wire.endpointA)} <strong>&rarr;</strong> {describeWireEndpoint(wire.endpointB)}</td>
                    <td>{wire.sectionMm2}</td>
                    <td>{wire.lengthMm}</td>
                    {showWireRouteModeColumn ? <td>{wire.isRouteLocked ? "Locked" : "Auto"}</td> : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="row-actions compact modeling-list-actions">
          <button type="button" className="button-with-icon" onClick={onOpenCreateWire}>
            <span className="action-button-icon is-new" aria-hidden="true" />
            New
          </button>
          <button
            type="button"
            className="button-with-icon"
            onClick={() => focusedWire !== null && onEditWire(focusedWire)}
            disabled={focusedWire === null}
          >
            <span className="action-button-icon is-edit" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className="modeling-list-action-delete button-with-icon"
            onClick={() => focusedWire !== null && onDeleteWire(focusedWire.id)}
            disabled={focusedWire === null || wireFormMode === "create"}
          >
            <span className="action-button-icon is-delete" aria-hidden="true" />
            Delete
          </button>
        </div>
      </article>
    </>
  );
}
