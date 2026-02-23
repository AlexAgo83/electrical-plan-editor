import { useEffect, useRef, type ReactElement } from "react";
import { nextSortState } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
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
  segments,
  visibleSegments,
  segmentIdSortDirection,
  setSegmentIdSortDirection,
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
  wireSort,
  setWireSort,
  getSortIndicator,
  selectedWireId,
  describeWireEndpoint,
  describeWireEndpointId,
  onEditWire,
  onDeleteWire,
  onOpenWireOnboardingHelp
}: ModelingSecondaryTablesProps): ReactElement {
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
  const wireFilterPlaceholder =
    wireFilterField === "endpoints"
      ? "Connector/Splice or ID"
      : wireFilterField === "name"
        ? "Wire name"
        : wireFilterField === "technicalId"
          ? "Technical ID"
          : "Name, technical ID, endpoint...";

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
      segmentRowRefs.current[selectedSegmentId]?.focus();
      return;
    }
    window.requestAnimationFrame(() => {
      segmentRowRefs.current[selectedSegmentId]?.focus();
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
      wireRowRefs.current[selectedWireId]?.focus();
      return;
    }
    window.requestAnimationFrame(() => {
      wireRowRefs.current[selectedWireId]?.focus();
    });
  }, [wireFormMode, selectedWireId]);

  useEffect(() => {
    const previousMode = previousSegmentFormModeRef.current;
    previousSegmentFormModeRef.current = segmentFormMode;
    if (previousMode !== "edit" || segmentFormMode !== "create" || selectedSegmentId === null) {
      return;
    }
    if (typeof window === "undefined") {
      segmentRowRefs.current[selectedSegmentId]?.focus();
      return;
    }
    window.requestAnimationFrame(() => {
      segmentRowRefs.current[selectedSegmentId]?.focus();
    });
  }, [segmentFormMode, selectedSegmentId]);

  useEffect(() => {
    const previousMode = previousWireFormModeRef.current;
    previousWireFormModeRef.current = wireFormMode;
    if (previousMode !== "edit" || wireFormMode !== "create" || selectedWireId === null) {
      return;
    }
    if (typeof window === "undefined") {
      wireRowRefs.current[selectedWireId]?.focus();
      return;
    }
    window.requestAnimationFrame(() => {
      wireRowRefs.current[selectedWireId]?.focus();
    });
  }, [wireFormMode, selectedWireId]);

  return (
    <>
      <article className="panel" hidden={!isSegmentSubScreen} data-onboarding-panel="modeling-segments">
        <header className="list-panel-header">
          <h2>Segments</h2>
          <div className="list-panel-header-tools">
            {onOpenSegmentOnboardingHelp !== undefined ? (
              <button
                type="button"
                className="filter-chip onboarding-help-button"
                onClick={onOpenSegmentOnboardingHelp}
              >
                Help
              </button>
            ) : null}
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
                const rows = visibleSegments.map((segment) => {
                  const nodeA = nodeLabelById.get(segment.nodeA) ?? segment.nodeA;
                  const nodeB = nodeLabelById.get(segment.nodeB) ?? segment.nodeB;
                  if (showSegmentSubNetworkColumn) {
                    return [segment.id, nodeA, nodeB, segment.lengthMm, segment.subNetworkTag?.trim() || "(default)"];
                  }
                  return [segment.id, nodeA, nodeB, segment.lengthMm];
                });
                downloadCsvFile("modeling-segments", headers, rows);
              }}
              disabled={visibleSegments.length === 0}
            >
              <span className="table-export-icon" aria-hidden="true" />
              CSV
            </button>
          </div>
        </header>
        {segments.length === 0 ? (
          <p className="empty-copy">No segment yet.</p>
        ) : visibleSegments.length === 0 ? (
          <p className="empty-copy">No segment matches the current filters.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => setSegmentIdSortDirection((currentDirection) => currentDirection === "asc" ? "desc" : "asc")}>ID <span className="sort-indicator">{segmentIdSortDirection === "asc" ? "▲" : "▼"}</span></button></th>
                <th>Node A</th>
                <th>Node B</th>
                <th>Length (mm)</th>
                {showSegmentSubNetworkColumn ? <th>Sub-network</th> : null}
              </tr>
            </thead>
            <tbody>
              {visibleSegments.map((segment) => {
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
                      <td><span className="subnetwork-chip">{segment.subNetworkTag?.trim() || "(default)"}</span></td>
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
                    ? ["Name", "Technical ID", "Endpoints", "Begin", "End", "Length (mm)", "Route mode"]
                    : ["Name", "Technical ID", "Endpoints", "Begin", "End", "Length (mm)"];
                  const rows = visibleWires.map((wire) => {
                    const endpoints = `${describeWireEndpoint(wire.endpointA)} -> ${describeWireEndpoint(wire.endpointB)}`;
                    const begin = describeWireEndpointId(wire.endpointA);
                    const end = describeWireEndpointId(wire.endpointB);
                    if (showWireRouteModeColumn) {
                      return [wire.name, wire.technicalId, endpoints, begin, end, wire.lengthMm, wire.isRouteLocked ? "Locked" : "Auto"];
                    }
                    return [wire.name, wire.technicalId, endpoints, begin, end, wire.lengthMm];
                  });
                  downloadCsvFile("modeling-wires", headers, rows);
                }}
                disabled={visibleWires.length === 0}
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
                  Help
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
        ) : visibleWires.length === 0 ? (
          <p className="empty-copy">No wire matches the current filters.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => setWireSort((current) => nextSortState(current, "name"))}>Name <span className="sort-indicator">{getSortIndicator(wireSort, "name")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => setWireSort((current) => nextSortState(current, "technicalId"))}>Technical ID <span className="sort-indicator">{getSortIndicator(wireSort, "technicalId")}</span></button></th>
                <th>Endpoints</th>
                <th>
                  <button
                    type="button"
                    className="sort-header-button"
                    onClick={() => setWireSort((current) => nextSortState(current, "lengthMm"))}
                  >
                    Length (mm) <span className="sort-indicator">{getSortIndicator(wireSort, "lengthMm")}</span>
                  </button>
                </th>
                {showWireRouteModeColumn ? <th>Route mode</th> : null}
              </tr>
            </thead>
            <tbody>
              {visibleWires.map((wire) => {
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
                    <td>{describeWireEndpoint(wire.endpointA)} <strong>&rarr;</strong> {describeWireEndpoint(wire.endpointB)}</td>
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
