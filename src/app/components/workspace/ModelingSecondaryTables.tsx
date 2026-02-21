import type { ReactElement } from "react";
import { nextSortState } from "../../lib/app-utils";
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
  segmentSearchQuery: string;
  setSegmentSearchQuery: (value: string) => void;
  segmentSubNetworkFilter: SegmentSubNetworkFilter;
  setSegmentSubNetworkFilter: (value: SegmentSubNetworkFilter) => void;
  segments: Segment[];
  visibleSegments: Segment[];
  segmentIdSortDirection: SortDirection;
  setSegmentIdSortDirection: (value: SortDirection | ((current: SortDirection) => SortDirection)) => void;
  nodeLabelById: Map<NodeId, string>;
  selectedSegmentId: SegmentId | null;
  selectedWireRouteSegmentIds: Set<SegmentId>;
  onSelectSegment: (segmentId: SegmentId) => void;
  onEditSegment: (segment: Segment) => void;
  onDeleteSegment: (segmentId: SegmentId) => void;
  isWireSubScreen: boolean;
  wireSearchQuery: string;
  setWireSearchQuery: (value: string) => void;
  wireRouteFilter: "all" | "auto" | "locked";
  setWireRouteFilter: (value: "all" | "auto" | "locked") => void;
  wires: Wire[];
  visibleWires: Wire[];
  wireSort: SortState;
  setWireSort: (value: SortState | ((current: SortState) => SortState)) => void;
  getSortIndicator: (sortState: SortState, field: "name" | "technicalId") => string;
  selectedWireId: WireId | null;
  describeWireEndpoint: (endpoint: Wire["endpointA"]) => string;
  onSelectWire: (wire: Wire) => void;
  onEditWire: (wire: Wire) => void;
  onDeleteWire: (wireId: WireId) => void;
}

export function ModelingSecondaryTables({
  isSegmentSubScreen,
  segmentSearchQuery,
  setSegmentSearchQuery,
  segmentSubNetworkFilter,
  setSegmentSubNetworkFilter,
  segments,
  visibleSegments,
  segmentIdSortDirection,
  setSegmentIdSortDirection,
  nodeLabelById,
  selectedSegmentId,
  selectedWireRouteSegmentIds,
  onSelectSegment,
  onEditSegment,
  onDeleteSegment,
  isWireSubScreen,
  wireSearchQuery,
  setWireSearchQuery,
  wireRouteFilter,
  setWireRouteFilter,
  wires,
  visibleWires,
  wireSort,
  setWireSort,
  getSortIndicator,
  selectedWireId,
  describeWireEndpoint,
  onSelectWire,
  onEditWire,
  onDeleteWire
}: ModelingSecondaryTablesProps): ReactElement {
  return (
    <>
      <article className="panel" hidden={!isSegmentSubScreen}>
        <h2>Segments</h2>
        <div className="list-toolbar">
          <label className="stack-label list-search">Search<input aria-label="Search segments" value={segmentSearchQuery} onChange={(event) => setSegmentSearchQuery(event.target.value)} placeholder="ID, node, sub-network" /></label>
          <div className="chip-group" role="group" aria-label="Segment sub-network filter">
            {([
              ["all", "All"],
              ["default", "Default"],
              ["tagged", "Tagged"]
            ] as const).map(([filterId, label]) => (
              <button key={filterId} type="button" className={segmentSubNetworkFilter === filterId ? "filter-chip is-active" : "filter-chip"} onClick={() => setSegmentSubNetworkFilter(filterId)}>{label}</button>
            ))}
          </div>
        </div>
        {segments.length === 0 ? (
          <p className="empty-copy">No segment yet.</p>
        ) : visibleSegments.length === 0 ? (
          <p className="empty-copy">No segment matches the current search/filter.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => setSegmentIdSortDirection((currentDirection) => currentDirection === "asc" ? "desc" : "asc")}>ID <span className="sort-indicator">{segmentIdSortDirection === "asc" ? "▲" : "▼"}</span></button></th>
                <th>Node A</th>
                <th>Node B</th>
                <th>Length (mm)</th>
                <th>Sub-network</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleSegments.map((segment) => {
                const nodeA = nodeLabelById.get(segment.nodeA) ?? segment.nodeA;
                const nodeB = nodeLabelById.get(segment.nodeB) ?? segment.nodeB;
                const isSelected = selectedSegmentId === segment.id;
                const isWireHighlighted = selectedWireRouteSegmentIds.has(segment.id);
                const rowClassName = isSelected ? "is-selected" : isWireHighlighted ? "is-wire-highlighted" : undefined;
                return (
                  <tr key={segment.id} className={rowClassName}>
                    <td className="technical-id">{segment.id}</td>
                    <td>{nodeA}</td>
                    <td>{nodeB}</td>
                    <td>{segment.lengthMm}</td>
                    <td><span className="subnetwork-chip">{segment.subNetworkTag?.trim() || "(default)"}</span></td>
                    <td><div className="row-actions compact"><button type="button" onClick={() => onSelectSegment(segment.id)}>Select</button><button type="button" onClick={() => onEditSegment(segment)}>Edit</button><button type="button" onClick={() => onDeleteSegment(segment.id)}>Delete</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </article>

      <article className="panel" hidden={!isWireSubScreen}>
        <h2>Wires</h2>
        <div className="list-toolbar">
          <label className="stack-label list-search">Search<input aria-label="Search wires" value={wireSearchQuery} onChange={(event) => setWireSearchQuery(event.target.value)} placeholder="Name or technical ID" /></label>
          <div className="chip-group" role="group" aria-label="Wire route mode filter">
            {([
              ["all", "All"],
              ["auto", "Auto"],
              ["locked", "Locked"]
            ] as const).map(([filterId, label]) => (
              <button key={filterId} type="button" className={wireRouteFilter === filterId ? "filter-chip is-active" : "filter-chip"} onClick={() => setWireRouteFilter(filterId)}>{label}</button>
            ))}
          </div>
        </div>
        {wires.length === 0 ? (
          <p className="empty-copy">No wire yet.</p>
        ) : visibleWires.length === 0 ? (
          <p className="empty-copy">No wire matches the current search/filter.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><button type="button" className="sort-header-button" onClick={() => setWireSort((current) => nextSortState(current, "name"))}>Name <span className="sort-indicator">{getSortIndicator(wireSort, "name")}</span></button></th>
                <th><button type="button" className="sort-header-button" onClick={() => setWireSort((current) => nextSortState(current, "technicalId"))}>Technical ID <span className="sort-indicator">{getSortIndicator(wireSort, "technicalId")}</span></button></th>
                <th>Endpoints</th>
                <th>Length (mm)</th>
                <th>Route mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleWires.map((wire) => {
                const isSelected = selectedWireId === wire.id;
                return (
                  <tr key={wire.id} className={isSelected ? "is-selected" : undefined}>
                    <td>{wire.name}</td>
                    <td className="technical-id">{wire.technicalId}</td>
                    <td>{describeWireEndpoint(wire.endpointA)} <strong>&rarr;</strong> {describeWireEndpoint(wire.endpointB)}</td>
                    <td>{wire.lengthMm}</td>
                    <td>{wire.isRouteLocked ? "Locked" : "Auto"}</td>
                    <td><div className="row-actions compact"><button type="button" onClick={() => onSelectWire(wire)}>Select</button><button type="button" onClick={() => onEditWire(wire)}>Edit</button><button type="button" onClick={() => onDeleteWire(wire.id)}>Delete</button></div></td>
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
