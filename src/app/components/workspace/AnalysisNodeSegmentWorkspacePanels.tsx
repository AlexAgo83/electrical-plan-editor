import { useMemo, useState, type ReactElement } from "react";
import { getWireColorSortValue } from "../../../core/cableColors";
import type { NetworkNode, Wire } from "../../../core/entities";
import { getTableAriaSort } from "../../lib/accessibility";
import { sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import { renderWireColorCellValue } from "../../lib/wireColorPresentation";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";

function formatSubNetworkDisplay(tag: string | undefined): string {
  const normalized = tag?.trim() ?? "";
  return normalized === "(default)" ? "" : normalized;
}

function renderWireColorCell(wire: Wire): ReactElement {
  return renderWireColorCellValue(wire);
}

function nodeKindLabel(node: NetworkNode): string {
  return node.kind;
}

export function AnalysisNodeSegmentWorkspacePanels(props: AnalysisWorkspaceContentProps): ReactElement {
  const {
    isNodeSubScreen,
    isSegmentSubScreen,
    nodeKindFilter,
    setNodeKindFilter,
    nodeFilterField,
    setNodeFilterField,
    nodeFilterQuery,
    setNodeFilterQuery,
    nodes,
    visibleNodes,
    segmentsCountByNodeId,
    selectedNodeId,
    selectedNode,
    onSelectNode,
    onOpenNodeOnboardingHelp,
    describeNode,
    nodeLabelById,
    segmentSubNetworkFilter,
    setSegmentSubNetworkFilter,
    segmentFilterField,
    setSegmentFilterField,
    segmentFilterQuery,
    setSegmentFilterQuery,
    segments,
    visibleSegments,
    selectedSegmentId,
    selectedSegment,
    onSelectSegment,
    onOpenSegmentOnboardingHelp,
    wires,
    showEntityTables = true,
    describeWireEndpoint
  } = props;

  type NodeTableSortField = "id" | "kind" | "reference" | "linkedSegments";
  type NodeAssociatedSegmentsSortField = "segmentId" | "peerNode" | "lengthMm" | "subNetwork" | "wireCount";
  type SegmentTableSortField = "id" | "nodeA" | "nodeB" | "subNetwork" | "lengthMm";
  type SegmentTraversingWiresSortField = "name" | "technicalId" | "color" | "endpoints" | "sectionMm2" | "lengthMm" | "routeMode";

  const [nodeTableSort, setNodeTableSort] = useState<{ field: NodeTableSortField; direction: "asc" | "desc" }>({
    field: "id",
    direction: "asc"
  });
  const [nodeSegmentsSort, setNodeSegmentsSort] = useState<{ field: NodeAssociatedSegmentsSortField; direction: "asc" | "desc" }>({
    field: "segmentId",
    direction: "asc"
  });
  const [segmentTableSort, setSegmentTableSort] = useState<{ field: SegmentTableSortField; direction: "asc" | "desc" }>({
    field: "id",
    direction: "asc"
  });
  const [segmentWiresSort, setSegmentWiresSort] = useState<{ field: SegmentTraversingWiresSortField; direction: "asc" | "desc" }>({
    field: "name",
    direction: "asc"
  });

  const wireCountBySegmentId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const wire of wires) {
      for (const segmentId of wire.routeSegmentIds) {
        counts.set(segmentId, (counts.get(segmentId) ?? 0) + 1);
      }
    }
    return counts;
  }, [wires]);

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

  const nodeAssociatedSegments = useMemo(
    () =>
      selectedNode === null
        ? []
        : segments.filter((segment) => segment.nodeA === selectedNode.id || segment.nodeB === selectedNode.id),
    [segments, selectedNode]
  );

  const sortedNodeAssociatedSegments = useMemo(
    () =>
      sortByTableColumns(
        nodeAssociatedSegments,
        nodeSegmentsSort,
        (segment, field) => {
          const peerNodeId = selectedNode === null ? segment.nodeB : segment.nodeA === selectedNode.id ? segment.nodeB : segment.nodeA;
          if (field === "segmentId") return segment.id;
          if (field === "peerNode") return nodeLabelById.get(peerNodeId) ?? peerNodeId;
          if (field === "lengthMm") return segment.lengthMm;
          if (field === "subNetwork") return formatSubNetworkDisplay(segment.subNetworkTag);
          return wireCountBySegmentId.get(segment.id) ?? 0;
        },
        (segment) => segment.id
      ),
    [nodeAssociatedSegments, nodeLabelById, nodeSegmentsSort, selectedNode, wireCountBySegmentId]
  );

  const sortedVisibleSegments = useMemo(
    () =>
      sortByTableColumns(
        visibleSegments,
        segmentTableSort,
        (segment, field) => {
          if (field === "id") return segment.id;
          if (field === "nodeA") return nodeLabelById.get(segment.nodeA) ?? segment.nodeA;
          if (field === "nodeB") return nodeLabelById.get(segment.nodeB) ?? segment.nodeB;
          if (field === "subNetwork") return formatSubNetworkDisplay(segment.subNetworkTag);
          return segment.lengthMm;
        },
        (segment) => segment.id
      ),
    [nodeLabelById, segmentTableSort, visibleSegments]
  );

  const segmentTraversingWires = useMemo(
    () =>
      selectedSegment === null ? [] : wires.filter((wire) => wire.routeSegmentIds.includes(selectedSegment.id)),
    [selectedSegment, wires]
  );

  const sortedSegmentTraversingWires = useMemo(
    () =>
      sortByTableColumns(
        segmentTraversingWires,
        segmentWiresSort,
        (wire, field) => {
          const endpoints = `${describeWireEndpoint(wire.endpointA)} -> ${describeWireEndpoint(wire.endpointB)}`;
          if (field === "name") return wire.name;
          if (field === "technicalId") return wire.technicalId;
          if (field === "color") return getWireColorSortValue(wire);
          if (field === "endpoints") return endpoints;
          if (field === "sectionMm2") return wire.sectionMm2;
          if (field === "lengthMm") return wire.lengthMm;
          return wire.isRouteLocked ? "Locked" : "Auto";
        },
        (wire) => wire.id
      ),
    [describeWireEndpoint, segmentTraversingWires, segmentWiresSort]
  );

  const nodeFilterPlaceholder =
    nodeFilterField === "id"
      ? "Node ID"
      : nodeFilterField === "kind"
        ? "Node kind"
        : nodeFilterField === "reference"
          ? "Reference"
          : "ID, kind, reference...";
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

  const indicator = <T extends string>(state: { field: T; direction: "asc" | "desc" }, field: T) =>
    state.field === field ? (state.direction === "asc" ? "▲" : "▼") : "";
  const buildToggleSortUpdater = <T extends string>(field: T) =>
    (current: { field: T; direction: "asc" | "desc" }): { field: T; direction: "asc" | "desc" } => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc"
    });

  return (
    <>
      <section className="panel" hidden={!isNodeSubScreen || !showEntityTables}>
        <header className="list-panel-header">
          <h2>Nodes</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row">
              <div className="chip-group list-panel-filters" role="group" aria-label="Node kind filter">
                {([
                  ["all", "All"],
                  ["connector", "Connectors"],
                  ["splice", "Splices"],
                  ["intermediate", "Intermediate"]
                ] as const).map(([kindId, label]) => (
                  <button key={kindId} type="button" className={nodeKindFilter === kindId ? "filter-chip is-active" : "filter-chip"} onClick={() => setNodeKindFilter(kindId)}>
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() =>
                  downloadCsvFile(
                    "analysis-nodes",
                    ["ID", "Kind", "Reference", "Linked segments"],
                    sortedVisibleNodes.map((node) => [node.id, nodeKindLabel(node), describeNode(node), segmentsCountByNodeId.get(node.id) ?? 0])
                  )
                }
                disabled={sortedVisibleNodes.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                CSV
              </button>
              {onOpenNodeOnboardingHelp !== undefined ? (
                <button type="button" className="filter-chip onboarding-help-button" onClick={onOpenNodeOnboardingHelp}>
                  <span className="action-button-icon is-help" aria-hidden="true" />
                  <span>Help</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row">
              <TableFilterBar
                label="Filter"
                fieldLabel="Node filter field"
                fieldValue={nodeFilterField}
                onFieldChange={(value) => setNodeFilterField(value as "id" | "reference" | "kind" | "any")}
                fieldOptions={[
                  { value: "id", label: "Node ID" },
                  { value: "reference", label: "Reference" },
                  { value: "kind", label: "Kind" },
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
                <th aria-sort={getTableAriaSort(nodeTableSort, "id")}><button type="button" className="sort-header-button" onClick={() => setNodeTableSort(buildToggleSortUpdater<NodeTableSortField>("id"))}>ID <span className="sort-indicator">{indicator(nodeTableSort, "id")}</span></button></th>
                <th aria-sort={getTableAriaSort(nodeTableSort, "kind")}><button type="button" className="sort-header-button" onClick={() => setNodeTableSort(buildToggleSortUpdater<NodeTableSortField>("kind"))}>Kind <span className="sort-indicator">{indicator(nodeTableSort, "kind")}</span></button></th>
                <th aria-sort={getTableAriaSort(nodeTableSort, "reference")}><button type="button" className="sort-header-button" onClick={() => setNodeTableSort(buildToggleSortUpdater<NodeTableSortField>("reference"))}>Reference <span className="sort-indicator">{indicator(nodeTableSort, "reference")}</span></button></th>
                <th aria-sort={getTableAriaSort(nodeTableSort, "linkedSegments")}><button type="button" className="sort-header-button" onClick={() => setNodeTableSort(buildToggleSortUpdater<NodeTableSortField>("linkedSegments"))}>Linked segments <span className="sort-indicator">{indicator(nodeTableSort, "linkedSegments")}</span></button></th>
              </tr>
              </thead>
              <tbody>
              {sortedVisibleNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <tr
                    key={node.id}
                    className={isSelected ? "is-selected is-focusable-row" : "is-focusable-row"}
                    aria-selected={isSelected}
                    tabIndex={0}
                    onClick={() => onSelectNode(node.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectNode(node.id);
                      }
                    }}
                  >
                    <td className="technical-id">{node.id}</td>
                    <td>{nodeKindLabel(node)}</td>
                    <td>{describeNode(node)}</td>
                    <td>{segmentsCountByNodeId.get(node.id) ?? 0}</td>
                  </tr>
                );
              })}
              </tbody>
            </table>
            <TableEntryCountFooter count={sortedVisibleNodes.length} />
          </>
        )}
      </section>

      <section className="panel" hidden={!isNodeSubScreen}>
        <header className="analysis-wire-route-header">
          <h2>Node analysis</h2>
        </header>
        {selectedNode === null ? (
          <p className="empty-copy">Select a node to inspect associated segments.</p>
        ) : (
          <div className="analysis-wire-route-content">
            <article className="analysis-wire-identity">
              <span className="analysis-wire-identity-label">Selected node</span>
              <p className="analysis-wire-identity-value">
                <strong>{describeNode(selectedNode)}</strong> <span className="technical-id">({selectedNode.id})</span>
              </p>
            </article>
            <article className="analysis-wire-route-current">
              <span>Associated segments</span>
              <p className="route-preview-path">{sortedNodeAssociatedSegments.length}</p>
            </article>
            {sortedNodeAssociatedSegments.length === 0 ? (
              <p className="empty-copy">No segment is connected to this node.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th aria-sort={getTableAriaSort(nodeSegmentsSort, "segmentId")}><button type="button" className="sort-header-button" onClick={() => setNodeSegmentsSort(buildToggleSortUpdater<NodeAssociatedSegmentsSortField>("segmentId"))}>Segment ID <span className="sort-indicator">{indicator(nodeSegmentsSort, "segmentId")}</span></button></th>
                    <th aria-sort={getTableAriaSort(nodeSegmentsSort, "peerNode")}><button type="button" className="sort-header-button" onClick={() => setNodeSegmentsSort(buildToggleSortUpdater<NodeAssociatedSegmentsSortField>("peerNode"))}>Peer node <span className="sort-indicator">{indicator(nodeSegmentsSort, "peerNode")}</span></button></th>
                    <th aria-sort={getTableAriaSort(nodeSegmentsSort, "lengthMm")}><button type="button" className="sort-header-button" onClick={() => setNodeSegmentsSort(buildToggleSortUpdater<NodeAssociatedSegmentsSortField>("lengthMm"))}>Length (mm) <span className="sort-indicator">{indicator(nodeSegmentsSort, "lengthMm")}</span></button></th>
                    <th aria-sort={getTableAriaSort(nodeSegmentsSort, "subNetwork")}><button type="button" className="sort-header-button" onClick={() => setNodeSegmentsSort(buildToggleSortUpdater<NodeAssociatedSegmentsSortField>("subNetwork"))}>Sub-network <span className="sort-indicator">{indicator(nodeSegmentsSort, "subNetwork")}</span></button></th>
                    <th aria-sort={getTableAriaSort(nodeSegmentsSort, "wireCount")}><button type="button" className="sort-header-button" onClick={() => setNodeSegmentsSort(buildToggleSortUpdater<NodeAssociatedSegmentsSortField>("wireCount"))}>Wires <span className="sort-indicator">{indicator(nodeSegmentsSort, "wireCount")}</span></button></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedNodeAssociatedSegments.map((segment) => {
                    const peerNodeId = segment.nodeA === selectedNode.id ? segment.nodeB : segment.nodeA;
                    return (
                      <tr key={segment.id}>
                        <td className="technical-id">{segment.id}</td>
                        <td>{nodeLabelById.get(peerNodeId) ?? peerNodeId}</td>
                        <td>{segment.lengthMm}</td>
                        <td>{formatSubNetworkDisplay(segment.subNetworkTag)}</td>
                        <td>{wireCountBySegmentId.get(segment.id) ?? 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>

      <section className="panel" hidden={!isSegmentSubScreen || !showEntityTables}>
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
                  <button key={filterId} type="button" className={segmentSubNetworkFilter === filterId ? "filter-chip is-active" : "filter-chip"} onClick={() => setSegmentSubNetworkFilter(filterId)}>
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() =>
                  downloadCsvFile(
                    "analysis-segments",
                    ["ID", "Node A", "Node B", "Sub-network", "Length (mm)"],
                    sortedVisibleSegments.map((segment) => [
                      segment.id,
                      nodeLabelById.get(segment.nodeA) ?? segment.nodeA,
                      nodeLabelById.get(segment.nodeB) ?? segment.nodeB,
                      formatSubNetworkDisplay(segment.subNetworkTag),
                      segment.lengthMm
                    ])
                  )
                }
                disabled={sortedVisibleSegments.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                CSV
              </button>
              {onOpenSegmentOnboardingHelp !== undefined ? (
                <button type="button" className="filter-chip onboarding-help-button" onClick={onOpenSegmentOnboardingHelp}>
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
          <>
            <p className="empty-copy">No segment matches the current filters.</p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <>
            <table className="data-table">
              <thead>
              <tr>
                <th aria-sort={getTableAriaSort(segmentTableSort, "id")}><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort(buildToggleSortUpdater<SegmentTableSortField>("id"))}>ID <span className="sort-indicator">{indicator(segmentTableSort, "id")}</span></button></th>
                <th aria-sort={getTableAriaSort(segmentTableSort, "nodeA")}><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort(buildToggleSortUpdater<SegmentTableSortField>("nodeA"))}>Node A <span className="sort-indicator">{indicator(segmentTableSort, "nodeA")}</span></button></th>
                <th aria-sort={getTableAriaSort(segmentTableSort, "nodeB")}><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort(buildToggleSortUpdater<SegmentTableSortField>("nodeB"))}>Node B <span className="sort-indicator">{indicator(segmentTableSort, "nodeB")}</span></button></th>
                <th aria-sort={getTableAriaSort(segmentTableSort, "subNetwork")}><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort(buildToggleSortUpdater<SegmentTableSortField>("subNetwork"))}>Sub-network <span className="sort-indicator">{indicator(segmentTableSort, "subNetwork")}</span></button></th>
                <th aria-sort={getTableAriaSort(segmentTableSort, "lengthMm")}><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort(buildToggleSortUpdater<SegmentTableSortField>("lengthMm"))}>Length (mm) <span className="sort-indicator">{indicator(segmentTableSort, "lengthMm")}</span></button></th>
              </tr>
              </thead>
              <tbody>
              {sortedVisibleSegments.map((segment) => {
                const isSelected = selectedSegmentId === segment.id;
                return (
                  <tr
                    key={segment.id}
                    className={isSelected ? "is-selected is-focusable-row" : "is-focusable-row"}
                    aria-selected={isSelected}
                    tabIndex={0}
                    onClick={() => onSelectSegment(segment.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectSegment(segment.id);
                      }
                    }}
                  >
                    <td className="technical-id">{segment.id}</td>
                    <td>{nodeLabelById.get(segment.nodeA) ?? segment.nodeA}</td>
                    <td>{nodeLabelById.get(segment.nodeB) ?? segment.nodeB}</td>
                    <td>{formatSubNetworkDisplay(segment.subNetworkTag)}</td>
                    <td>{segment.lengthMm}</td>
                  </tr>
                );
              })}
              </tbody>
            </table>
            <TableEntryCountFooter count={sortedVisibleSegments.length} />
          </>
        )}
      </section>

      <section className="panel" hidden={!isSegmentSubScreen}>
        <header className="analysis-wire-route-header">
          <h2>Segment analysis</h2>
        </header>
        {selectedSegment === null ? (
          <p className="empty-copy">Select a segment to inspect traversing wires.</p>
        ) : (
          <div className="analysis-wire-route-content">
            <article className="analysis-wire-identity">
              <span className="analysis-wire-identity-label">Selected segment</span>
              <p className="analysis-wire-identity-value">
                <strong>{selectedSegment.id}</strong>{" "}
                <span className="technical-id">
                  ({nodeLabelById.get(selectedSegment.nodeA) ?? selectedSegment.nodeA} → {nodeLabelById.get(selectedSegment.nodeB) ?? selectedSegment.nodeB})
                </span>
              </p>
              <p className="meta-line" style={{ margin: 0 }}>
                {selectedSegment.lengthMm} mm{formatSubNetworkDisplay(selectedSegment.subNetworkTag) ? ` • ${formatSubNetworkDisplay(selectedSegment.subNetworkTag)}` : ""}
              </p>
            </article>
            {sortedSegmentTraversingWires.length === 0 ? (
              <p className="empty-copy">No wire traverses this segment.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "name")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("name"))}>Name <span className="sort-indicator">{indicator(segmentWiresSort, "name")}</span></button></th>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "technicalId")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("technicalId"))}>Technical ID <span className="sort-indicator">{indicator(segmentWiresSort, "technicalId")}</span></button></th>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "color")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("color"))}>Color <span className="sort-indicator">{indicator(segmentWiresSort, "color")}</span></button></th>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "endpoints")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("endpoints"))}>Endpoints <span className="sort-indicator">{indicator(segmentWiresSort, "endpoints")}</span></button></th>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "sectionMm2")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("sectionMm2"))}>Section (mm²) <span className="sort-indicator">{indicator(segmentWiresSort, "sectionMm2")}</span></button></th>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "lengthMm")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("lengthMm"))}>Length (mm) <span className="sort-indicator">{indicator(segmentWiresSort, "lengthMm")}</span></button></th>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "routeMode")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("routeMode"))}>Route mode <span className="sort-indicator">{indicator(segmentWiresSort, "routeMode")}</span></button></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSegmentTraversingWires.map((wire) => (
                    <tr key={wire.id}>
                      <td>{wire.name}</td>
                      <td className="technical-id">{wire.technicalId}</td>
                      <td>{renderWireColorCell(wire)}</td>
                      <td>{describeWireEndpoint(wire.endpointA)} <strong>&rarr;</strong> {describeWireEndpoint(wire.endpointB)}</td>
                      <td>{wire.sectionMm2}</td>
                      <td>{wire.lengthMm}</td>
                      <td>{wire.isRouteLocked ? "Locked" : "Auto"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </>
  );
}
