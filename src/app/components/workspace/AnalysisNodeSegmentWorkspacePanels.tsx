import { translateCurrent as t } from "../../lib/i18n";
import { useMemo, useState, type ReactElement } from "react";
import { getWireColorSortValue } from "../../../core/cableColors";
import type { NetworkNode, Wire } from "../../../core/entities";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { getTableAriaSort } from "../../lib/accessibility";
import { sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import { renderWireColorCellValue } from "../../lib/wireColorPresentation";
import type { AnalysisWorkspaceContentProps } from "./AnalysisWorkspaceContent.types";
import { EntityReferenceButton } from "./EntityReferenceButton";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";

function formatSubNetworkDisplay(tag: string | undefined): string {
  const normalized = tag?.trim() ?? "";
  return normalized === t("ui.default3") ? "" : normalized;
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
    onSelectConnector,
    onSelectSplice,
    onSelectSegment,
    onGoToSegmentFromAnalysis,
    onOpenSegmentOnboardingHelp,
    wires,
    showEntityTables = true,
    describeWireEndpoint,
    onGoToWireFromAnalysis
  } = props;

  type NodeTableSortField = "id" | "kind" | "reference" | "linkedSegments";
  type NodeAssociatedSegmentsSortField = "segmentId" | "peerNode" | "lengthMm" | "subNetwork" | "wireCount";
  type SegmentTableSortField = "id" | "nodeA" | "nodeB" | "subNetwork" | "lengthMm";
  type SegmentTraversingWiresSortField = "name" | "technicalId" | "color" | "endpointA" | "endpointB" | "sectionMm2" | "lengthMm" | "routeMode";
  const isMobileViewport = useIsMobileViewport();

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
          const endpointA = describeWireEndpoint(wire.endpointA);
          const endpointB = describeWireEndpoint(wire.endpointB);
          if (field === "name") return wire.name;
          if (field === "technicalId") return wire.technicalId;
          if (field === "color") return getWireColorSortValue(wire);
          if (field === "endpointA") return endpointA;
          if (field === "endpointB") return endpointB;
          if (field === "sectionMm2") return wire.sectionMm2;
          if (field === "lengthMm") return wire.lengthMm;
          return wire.isRouteLocked ? t("ui.locked") : t("ui.auto");
        },
        (wire) => wire.id
      ),
    [describeWireEndpoint, segmentTraversingWires, segmentWiresSort]
  );

  const nodeFilterPlaceholder =
    nodeFilterField === "id"
      ? t("ui.nodeID")
      : nodeFilterField === "kind"
        ? t("ui.nodeKind")
        : nodeFilterField === "reference"
          ? t("ui.reference")
          : t("ui.idKindReference");
  const segmentFilterPlaceholder =
    segmentFilterField === "id"
      ? t("ui.segmentID")
      : segmentFilterField === "nodeA"
        ? t("ui.nodeA")
        : segmentFilterField === "nodeB"
          ? t("ui.nodeB")
          : segmentFilterField === "subNetwork"
            ? t("ui.subNetwork")
            : t("ui.idNodesSubNetwork");

  const indicator = <T extends string>(state: { field: T; direction: "asc" | "desc" }, field: T) =>
    state.field === field ? (state.direction === "asc" ? "▲" : "▼") : "";
  const buildToggleSortUpdater = <T extends string>(field: T) =>
    (current: { field: T; direction: "asc" | "desc" }): { field: T; direction: "asc" | "desc" } => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc"
    });
  const renderWireEndpointReference = (endpoint: Wire["endpointA"]): ReactElement => {
    const label = describeWireEndpoint(endpoint);
    if (endpoint.kind === "connectorCavity") {
      return (
        <EntityReferenceButton title={`Open connector ${endpoint.connectorId}`} onClick={() => onSelectConnector(endpoint.connectorId)}>
          {label}
        </EntityReferenceButton>
      );
    }

    return (
      <EntityReferenceButton title={`Open splice ${endpoint.spliceId}`} onClick={() => onSelectSplice(endpoint.spliceId)}>
        {label}
      </EntityReferenceButton>
    );
  };
  const renderSegmentEndpointReference = (nodeId: NetworkNode["id"], endpointLabel: string): ReactElement => (
    <EntityReferenceButton className="analysis-segment-endpoint-button" title={`Open ${endpointLabel.toLowerCase()} ${nodeLabelById.get(nodeId) ?? nodeId}`} onClick={() => onSelectNode(nodeId)}>
      {nodeLabelById.get(nodeId) ?? nodeId}
    </EntityReferenceButton>
  );

  return (
    <>
      <section className="panel" hidden={!isNodeSubScreen || !showEntityTables}>
        <header className="list-panel-header list-panel-header-mobile-inline-tools">
          <h2>{t("ui.nodes")}</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row is-title-actions">
              <div className="chip-group list-panel-filters" role="group" aria-label={t("ui.nodeKindFilter")}>
                {([
                  ["all", t("ui.all")],
                  ["connector", t("ui.connectors")],
                  ["splice", t("ui.splices")],
                  ["intermediate", t("ui.intermediate")]
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
                    [t("ui.id"), t("ui.kind"), t("ui.reference"), t("ui.linkedSegments")],
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
                  <span>{t("ui.help")}</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row is-filter-row">
              <TableFilterBar
                label={t("ui.filter")}
                fieldLabel={t("ui.nodeFilterField")}
                fieldValue={nodeFilterField}
                onFieldChange={(value) => setNodeFilterField(value as "id" | "reference" | "kind" | "any")}
                fieldOptions={[
                  { value: "id", label: t("ui.nodeID") },
                  { value: "reference", label: t("ui.reference") },
                  { value: "kind", label: t("ui.kind") },
                  { value: "any", label: t("ui.any") }
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
            <table className="data-table analysis-nodes-table">
              <thead>
              <tr>
                <th aria-sort={getTableAriaSort(nodeTableSort, "id")}><button type="button" className="sort-header-button" onClick={() => setNodeTableSort(buildToggleSortUpdater<NodeTableSortField>("id"))}>{t("ui.id")} <span className="sort-indicator">{indicator(nodeTableSort, "id")}</span></button></th>
                <th aria-sort={getTableAriaSort(nodeTableSort, "kind")}><button type="button" className="sort-header-button" onClick={() => setNodeTableSort(buildToggleSortUpdater<NodeTableSortField>("kind"))}>{t("ui.kind")} <span className="sort-indicator">{indicator(nodeTableSort, "kind")}</span></button></th>
                <th aria-sort={getTableAriaSort(nodeTableSort, "reference")}><button type="button" className="sort-header-button" onClick={() => setNodeTableSort(buildToggleSortUpdater<NodeTableSortField>("reference"))}>{isMobileViewport ? t("ui.ref") : t("ui.reference")} <span className="sort-indicator">{indicator(nodeTableSort, "reference")}</span></button></th>
                <th aria-sort={getTableAriaSort(nodeTableSort, "linkedSegments")}><button type="button" className="sort-header-button" onClick={() => setNodeTableSort(buildToggleSortUpdater<NodeTableSortField>("linkedSegments"))}>{t("ui.linkedSegments")} <span className="sort-indicator">{indicator(nodeTableSort, "linkedSegments")}</span></button></th>
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
          <h2>{t("ui.nodeAnalysis")}</h2>
        </header>
        {selectedNode === null ? (
          <p className="empty-copy">{t("ui.selectANodeToInspectAssociatedSegments")}</p>
        ) : (
          <div className="analysis-wire-route-content">
            <article className="analysis-wire-identity">
              <span className="analysis-wire-identity-label">{t("ui.selectedNode")}</span>
              <p className="analysis-wire-identity-value">
                <strong>{describeNode(selectedNode)}</strong> <span className="technical-id">({selectedNode.id})</span>
              </p>
            </article>
            <article className="analysis-wire-route-current">
              <span>{t("ui.associatedSegments")}</span>
              <p className="route-preview-path">{sortedNodeAssociatedSegments.length}</p>
            </article>
            {sortedNodeAssociatedSegments.length === 0 ? (
              <p className="empty-copy">{t("ui.noSegmentIsConnectedToThisNode")}</p>
            ) : (
              <table className="data-table analysis-node-segments-table">
                <thead>
                  <tr>
                    <th aria-sort={getTableAriaSort(nodeSegmentsSort, "segmentId")}><button type="button" className="sort-header-button" onClick={() => setNodeSegmentsSort(buildToggleSortUpdater<NodeAssociatedSegmentsSortField>("segmentId"))}>{t("ui.segmentID")} <span className="sort-indicator">{indicator(nodeSegmentsSort, "segmentId")}</span></button></th>
                    <th aria-sort={getTableAriaSort(nodeSegmentsSort, "peerNode")}><button type="button" className="sort-header-button" onClick={() => setNodeSegmentsSort(buildToggleSortUpdater<NodeAssociatedSegmentsSortField>("peerNode"))}>{t("ui.peerNode")} <span className="sort-indicator">{indicator(nodeSegmentsSort, "peerNode")}</span></button></th>
                    <th aria-sort={getTableAriaSort(nodeSegmentsSort, "lengthMm")}><button type="button" className="sort-header-button" onClick={() => setNodeSegmentsSort(buildToggleSortUpdater<NodeAssociatedSegmentsSortField>("lengthMm"))}>{isMobileViewport ? t("ui.len") : t("ui.lengthMm")} <span className="sort-indicator">{indicator(nodeSegmentsSort, "lengthMm")}</span></button></th>
                    <th aria-sort={getTableAriaSort(nodeSegmentsSort, "subNetwork")}><button type="button" className="sort-header-button" onClick={() => setNodeSegmentsSort(buildToggleSortUpdater<NodeAssociatedSegmentsSortField>("subNetwork"))}>{t("ui.subNetwork")} <span className="sort-indicator">{indicator(nodeSegmentsSort, "subNetwork")}</span></button></th>
                    <th aria-sort={getTableAriaSort(nodeSegmentsSort, "wireCount")}><button type="button" className="sort-header-button" onClick={() => setNodeSegmentsSort(buildToggleSortUpdater<NodeAssociatedSegmentsSortField>("wireCount"))}>{t("ui.wires")} <span className="sort-indicator">{indicator(nodeSegmentsSort, "wireCount")}</span></button></th>
                    <th className="validation-actions-cell">{t("ui.actions")}</th>
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
                        <td className="validation-actions-cell">
                          <button
                            type="button"
                            aria-label={t("ui.goTo")}
                            className="validation-row-go-to-button button-with-icon"
                            onClick={() => onGoToSegmentFromAnalysis(segment.id)}
                          >
                            <span className="action-button-icon is-open" aria-hidden="true" />
                            <span className="analysis-table-go-to-label">{t("ui.goTo")}</span>
                          </button>
                        </td>
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
        <header className="list-panel-header list-panel-header-mobile-inline-tools">
          <h2>{t("ui.segments")}</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row is-title-actions">
              <div className="chip-group list-panel-filters" role="group" aria-label={t("ui.segmentSubNetworkFilter")}>
                {([
                  ["all", t("ui.all")],
                  ["default", t("ui.default")],
                  ["tagged", t("ui.tagged")]
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
                    [t("ui.id"), t("ui.nodeA"), t("ui.nodeB"), t("ui.subNetwork"), t("ui.lengthMm")],
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
                  <span>{t("ui.help")}</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row is-filter-row">
              <TableFilterBar
                label={t("ui.filter")}
                fieldLabel={t("ui.segmentFilterField")}
                fieldValue={segmentFilterField}
                onFieldChange={(value) => setSegmentFilterField(value as "id" | "nodeA" | "nodeB" | "subNetwork" | "any")}
                fieldOptions={[
                  { value: "id", label: t("ui.segmentID") },
                  { value: "nodeA", label: t("ui.nodeA") },
                  { value: "nodeB", label: t("ui.nodeB") },
                  { value: "subNetwork", label: t("ui.subNetwork") },
                  { value: "any", label: t("ui.any") }
                ]}
                queryValue={segmentFilterQuery}
                onQueryChange={setSegmentFilterQuery}
                placeholder={segmentFilterPlaceholder}
              />
            </div>
          </div>
        </header>
        {segments.length === 0 ? (
          <p className="empty-copy">{t("ui.noSegmentYet")}</p>
        ) : sortedVisibleSegments.length === 0 ? (
          <>
            <p className="empty-copy">{t("ui.noSegmentMatchesTheCurrentFilters")}</p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <>
            <table className="data-table analysis-segments-table">
              <thead>
              <tr>
                <th aria-sort={getTableAriaSort(segmentTableSort, "id")}><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort(buildToggleSortUpdater<SegmentTableSortField>("id"))}>{t("ui.id")} <span className="sort-indicator">{indicator(segmentTableSort, "id")}</span></button></th>
                <th aria-sort={getTableAriaSort(segmentTableSort, "nodeA")}><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort(buildToggleSortUpdater<SegmentTableSortField>("nodeA"))}>{t("ui.nodeA")} <span className="sort-indicator">{indicator(segmentTableSort, "nodeA")}</span></button></th>
                <th aria-sort={getTableAriaSort(segmentTableSort, "nodeB")}><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort(buildToggleSortUpdater<SegmentTableSortField>("nodeB"))}>{t("ui.nodeB")} <span className="sort-indicator">{indicator(segmentTableSort, "nodeB")}</span></button></th>
                <th aria-sort={getTableAriaSort(segmentTableSort, "subNetwork")}><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort(buildToggleSortUpdater<SegmentTableSortField>("subNetwork"))}>{t("ui.subNetwork")} <span className="sort-indicator">{indicator(segmentTableSort, "subNetwork")}</span></button></th>
                <th aria-sort={getTableAriaSort(segmentTableSort, "lengthMm")}><button type="button" className="sort-header-button" onClick={() => setSegmentTableSort(buildToggleSortUpdater<SegmentTableSortField>("lengthMm"))}>{isMobileViewport ? t("ui.len") : t("ui.lengthMm")} <span className="sort-indicator">{indicator(segmentTableSort, "lengthMm")}</span></button></th>
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
          <h2>{t("ui.segmentAnalysis")}</h2>
        </header>
        {selectedSegment === null ? (
          <p className="empty-copy">{t("ui.selectASegmentToInspectTraversingWires")}</p>
        ) : (
          <div className="analysis-wire-route-content">
            <article className="analysis-wire-identity">
              <div className="analysis-segment-identity-heading">
                <span className="analysis-wire-identity-label">{t("ui.selectedSegment")}</span>
                <strong className="analysis-segment-identity-id technical-id">{selectedSegment.id}</strong>
              </div>
              <div className="analysis-segment-endpoint-path" aria-label={`Selected segment ${selectedSegment.id} path`}>
                <span className="analysis-segment-endpoint">
                  <span className="analysis-segment-endpoint-label">A</span>
                  {renderSegmentEndpointReference(selectedSegment.nodeA, t("ui.nodeA"))}
                </span>
                <span className="analysis-segment-endpoint-arrow" aria-hidden="true">
                  →
                </span>
                <span className="analysis-segment-endpoint">
                  <span className="analysis-segment-endpoint-label">B</span>
                  {renderSegmentEndpointReference(selectedSegment.nodeB, t("ui.nodeB"))}
                </span>
              </div>
              <div className="analysis-segment-identity-meta">
                <span>{selectedSegment.lengthMm} mm</span>
                {formatSubNetworkDisplay(selectedSegment.subNetworkTag) ? <span>{formatSubNetworkDisplay(selectedSegment.subNetworkTag)}</span> : null}
              </div>
            </article>
            {sortedSegmentTraversingWires.length === 0 ? (
              <p className="empty-copy">{t("ui.noWireTraversesThisSegment")}</p>
            ) : (
              <table className="data-table analysis-segment-wires-table">
                <thead>
                  <tr>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "name")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("name"))}>{t("ui.name")} <span className="sort-indicator">{indicator(segmentWiresSort, "name")}</span></button></th>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "technicalId")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("technicalId"))}>{isMobileViewport ? t("ui.id") : t("ui.technicalID")} <span className="sort-indicator">{indicator(segmentWiresSort, "technicalId")}</span></button></th>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "color")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("color"))}>{t("ui.color")} <span className="sort-indicator">{indicator(segmentWiresSort, "color")}</span></button></th>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "endpointA")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("endpointA"))}>{isMobileViewport ? t("ui.endA") : t("ui.endpointA")} <span className="sort-indicator">{indicator(segmentWiresSort, "endpointA")}</span></button></th>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "endpointB")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("endpointB"))}>{isMobileViewport ? t("ui.endB") : t("ui.endpointB")} <span className="sort-indicator">{indicator(segmentWiresSort, "endpointB")}</span></button></th>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "sectionMm2")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("sectionMm2"))}>{isMobileViewport ? t("ui.sec") : t("ui.sectionMm2")} <span className="sort-indicator">{indicator(segmentWiresSort, "sectionMm2")}</span></button></th>
                    <th aria-sort={getTableAriaSort(segmentWiresSort, "lengthMm")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("lengthMm"))}>{isMobileViewport ? t("ui.len") : t("ui.lengthMm")} <span className="sort-indicator">{indicator(segmentWiresSort, "lengthMm")}</span></button></th>
                    {!isMobileViewport ? <th aria-sort={getTableAriaSort(segmentWiresSort, "routeMode")}><button type="button" className="sort-header-button" onClick={() => setSegmentWiresSort(buildToggleSortUpdater<SegmentTraversingWiresSortField>("routeMode"))}>{t("ui.routeMode")} <span className="sort-indicator">{indicator(segmentWiresSort, "routeMode")}</span></button></th> : null}
                    <th className="validation-actions-cell">{t("ui.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSegmentTraversingWires.map((wire) => (
                    <tr key={wire.id}>
                      <td>{wire.name}</td>
                      <td className="technical-id">{wire.technicalId}</td>
                      <td>{renderWireColorCell(wire)}</td>
                      <td>{renderWireEndpointReference(wire.endpointA)}</td>
                      <td>{renderWireEndpointReference(wire.endpointB)}</td>
                      <td>{wire.sectionMm2}</td>
                      <td>{wire.lengthMm}</td>
                      {!isMobileViewport ? <td>{wire.isRouteLocked ? t("ui.locked") : t("ui.auto")}</td> : null}
                      <td className="validation-actions-cell">
                        <button
                          type="button"
                          aria-label={t("ui.goTo")}
                          className="validation-row-go-to-button button-with-icon"
                          onClick={() => onGoToWireFromAnalysis(wire.id)}
                        >
                          <span className="action-button-icon is-open" aria-hidden="true" />
                          <span className="analysis-table-go-to-label">{t("ui.goTo")}</span>
                        </button>
                      </td>
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
