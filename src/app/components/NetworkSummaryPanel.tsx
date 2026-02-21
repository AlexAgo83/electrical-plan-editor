import type { MouseEvent as ReactMouseEvent, ReactElement, WheelEvent as ReactWheelEvent } from "react";
import type {
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId
} from "../../core/entities";
import type { ShortestRouteResult } from "../../core/pathfinding";
import type { SubNetworkSummary } from "../../store";

interface NodePosition {
  x: number;
  y: number;
}

interface NetworkSummaryPanelProps {
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  fitNetworkToContent: () => void;
  showNetworkGrid: boolean;
  snapNodesToGrid: boolean;
  toggleShowNetworkGrid: () => void;
  toggleSnapNodesToGrid: () => void;
  networkScalePercent: number;
  routingGraphNodeCount: number;
  routingGraphSegmentCount: number;
  totalEdgeEntries: number;
  nodes: NetworkNode[];
  segments: Segment[];
  isPanningNetwork: boolean;
  networkViewWidth: number;
  networkViewHeight: number;
  networkGridStep: number;
  networkOffset: NodePosition;
  networkScale: number;
  handleNetworkCanvasMouseDown: (event: ReactMouseEvent<SVGSVGElement>) => void;
  handleNetworkCanvasClick: (event: ReactMouseEvent<SVGSVGElement>) => void;
  handleNetworkWheel: (event: ReactWheelEvent<SVGSVGElement>) => void;
  handleNetworkMouseMove: (event: ReactMouseEvent<SVGSVGElement>) => void;
  stopNetworkNodeDrag: () => void;
  networkNodePositions: Record<NodeId, NodePosition>;
  selectedWireRouteSegmentIds: Set<SegmentId>;
  selectedSegmentId: SegmentId | null;
  handleNetworkSegmentClick: (segmentId: SegmentId) => void;
  selectedNodeId: NodeId | null;
  handleNetworkNodeMouseDown: (event: ReactMouseEvent<SVGGElement>, nodeId: NodeId) => void;
  handleNetworkNodeClick: (nodeId: NodeId) => void;
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  describeNode: (node: NetworkNode) => string;
  subNetworkSummaries: SubNetworkSummary[];
  routePreviewStartNodeId: string;
  setRoutePreviewStartNodeId: (value: string) => void;
  routePreviewEndNodeId: string;
  setRoutePreviewEndNodeId: (value: string) => void;
  routePreview: ShortestRouteResult | null;
  onRegenerateLayout: () => void;
}

export function NetworkSummaryPanel({
  handleZoomAction,
  fitNetworkToContent,
  showNetworkGrid,
  snapNodesToGrid,
  toggleShowNetworkGrid,
  toggleSnapNodesToGrid,
  networkScalePercent,
  routingGraphNodeCount,
  routingGraphSegmentCount,
  totalEdgeEntries,
  nodes,
  segments,
  isPanningNetwork,
  networkViewWidth,
  networkViewHeight,
  networkGridStep,
  networkOffset,
  networkScale,
  handleNetworkCanvasMouseDown,
  handleNetworkCanvasClick,
  handleNetworkWheel,
  handleNetworkMouseMove,
  stopNetworkNodeDrag,
  networkNodePositions,
  selectedWireRouteSegmentIds,
  selectedSegmentId,
  handleNetworkSegmentClick,
  selectedNodeId,
  handleNetworkNodeMouseDown,
  handleNetworkNodeClick,
  connectorMap,
  spliceMap,
  describeNode,
  subNetworkSummaries,
  routePreviewStartNodeId,
  setRoutePreviewStartNodeId,
  routePreviewEndNodeId,
  setRoutePreviewEndNodeId,
  routePreview,
  onRegenerateLayout
}: NetworkSummaryPanelProps): ReactElement {
  const graphStats = [
    { label: "Graph nodes", value: routingGraphNodeCount },
    { label: "Graph segments", value: routingGraphSegmentCount },
    { label: "Adjacency entries", value: totalEdgeEntries }
  ];
  const hasRouteSelection = routePreviewStartNodeId.length > 0 && routePreviewEndNodeId.length > 0;
  const selectedStartNode = nodes.find((node) => node.id === routePreviewStartNodeId) ?? null;
  const selectedEndNode = nodes.find((node) => node.id === routePreviewEndNodeId) ?? null;

  return (
    <section className="network-summary-stack">
      <section className="panel">
        <header className="network-summary-header">
          <h2>Network summary</h2>
          <div className="network-summary-header-actions" role="group" aria-label="Network summary display options">
            <button
              type="button"
              className={showNetworkGrid ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleShowNetworkGrid}
            >
              Grid
            </button>
            <button
              type="button"
              className={snapNodesToGrid ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleSnapNodesToGrid}
            >
              Snap
            </button>
          </div>
        </header>
        {nodes.length === 0 ? (
          <p className="empty-copy">No nodes yet. Create nodes and segments to render the 2D network.</p>
        ) : (
          <div className={`network-canvas-shell${isPanningNetwork ? " is-panning" : ""}`}>
            <div className="network-canvas-floating-controls" aria-label="Canvas controls">
              <div className="network-canvas-toolbar">
                <button type="button" className="workspace-tab" onClick={() => handleZoomAction("out")}>
                  Zoom -
                </button>
                <button type="button" className="workspace-tab" onClick={() => handleZoomAction("in")}>
                  Zoom +
                </button>
                <button type="button" className="workspace-tab" onClick={() => handleZoomAction("reset")}>
                  Reset view
                </button>
                <button type="button" className="workspace-tab" onClick={fitNetworkToContent}>
                  Fit network
                </button>
                <button type="button" className="workspace-tab" onClick={onRegenerateLayout}>
                  Generate
                </button>
              </div>
              <p className="meta-line network-canvas-floating-copy">
                View: {networkScalePercent}% zoom. Hold <strong>Shift</strong> and drag empty canvas to pan.
              </p>
            </div>
            <div className="network-canvas-floating-stack">
              <section className="network-canvas-floating-subnetworks" aria-label="Sub-networks">
                {subNetworkSummaries.length === 0 ? (
                  <p className="network-canvas-floating-copy">No sub-network tags yet.</p>
                ) : (
                  <ul className="network-canvas-subnetwork-list">
                    {subNetworkSummaries.map((group) => (
                      <li key={group.tag}>
                        <span className="subnetwork-chip">{group.tag}</span>
                        <span>
                          {group.segmentCount} segment(s), {group.totalLengthMm} mm total
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="network-canvas-floating-stats" aria-label="Graph statistics">
                <ul className="network-canvas-stats-list">
                  {graphStats.map((entry) => (
                    <li key={entry.label}>
                      <span>{entry.label}</span>
                      <strong>{entry.value}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <svg
              className="network-svg"
              role="img"
              aria-label="2D network diagram"
              viewBox={`0 0 ${networkViewWidth} ${networkViewHeight}`}
              onMouseDown={handleNetworkCanvasMouseDown}
              onClick={handleNetworkCanvasClick}
              onWheel={handleNetworkWheel}
              onMouseMove={handleNetworkMouseMove}
              onMouseUp={stopNetworkNodeDrag}
              onMouseLeave={stopNetworkNodeDrag}
            >
              {showNetworkGrid ? (
                <g className="network-grid" transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}>
                  {Array.from({ length: Math.floor(networkViewWidth / networkGridStep) + 1 }).map((_, index) => {
                    const position = index * networkGridStep;
                    return (
                      <line key={`grid-v-${position}`} x1={position} y1={0} x2={position} y2={networkViewHeight} />
                    );
                  })}
                  {Array.from({ length: Math.floor(networkViewHeight / networkGridStep) + 1 }).map((_, index) => {
                    const position = index * networkGridStep;
                    return (
                      <line key={`grid-h-${position}`} x1={0} y1={position} x2={networkViewWidth} y2={position} />
                    );
                  })}
                </g>
              ) : null}
              <g transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}>
                {segments.map((segment) => {
                  const nodeAPosition = networkNodePositions[segment.nodeA];
                  const nodeBPosition = networkNodePositions[segment.nodeB];
                  if (nodeAPosition === undefined || nodeBPosition === undefined) {
                    return null;
                  }

                  const isWireHighlighted = selectedWireRouteSegmentIds.has(segment.id);
                  const isSelectedSegment = selectedSegmentId === segment.id;
                  const segmentClassName = `network-segment${isWireHighlighted ? " is-wire-highlighted" : ""}${
                    isSelectedSegment ? " is-selected" : ""
                  }`;
                  const labelX = (nodeAPosition.x + nodeBPosition.x) / 2;
                  const labelY = (nodeAPosition.y + nodeBPosition.y) / 2;

                  return (
                    <g key={segment.id}>
                      <line
                        className={segmentClassName}
                        x1={nodeAPosition.x}
                        y1={nodeAPosition.y}
                        x2={nodeBPosition.x}
                        y2={nodeBPosition.y}
                      />
                      <line
                        className="network-segment-hitbox"
                        x1={nodeAPosition.x}
                        y1={nodeAPosition.y}
                        x2={nodeBPosition.x}
                        y2={nodeBPosition.y}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleNetworkSegmentClick(segment.id);
                        }}
                      />
                      <text className="network-segment-label" x={labelX} y={labelY - 6} textAnchor="middle">
                        {segment.id}
                      </text>
                    </g>
                  );
                })}

                {nodes.map((node) => {
                  const position = networkNodePositions[node.id];
                  if (position === undefined) {
                    return null;
                  }

                  const nodeKindClass =
                    node.kind === "connector" ? "connector" : node.kind === "splice" ? "splice" : "intermediate";
                  const isSelectedNode = selectedNodeId === node.id;
                  const nodeClassName = `network-node ${nodeKindClass}${isSelectedNode ? " is-selected" : ""}`;
                  const nodeLabel =
                    node.kind === "intermediate"
                      ? node.label
                      : node.kind === "connector"
                        ? (connectorMap.get(node.connectorId)?.technicalId ?? node.connectorId)
                        : (spliceMap.get(node.spliceId)?.technicalId ?? node.spliceId);

                  return (
                    <g
                      key={node.id}
                      className={nodeClassName}
                      onMouseDown={(event) => handleNetworkNodeMouseDown(event, node.id)}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleNetworkNodeClick(node.id);
                      }}
                    >
                      <title>{describeNode(node)}</title>
                      <circle cx={position.x} cy={position.y} r={17} />
                      <text className="network-node-label" x={position.x} y={position.y + 4} textAnchor="middle">
                        {nodeLabel}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        )}
        <ul className="network-legend">
          <li>
            <span className="legend-swatch connector" /> Connector node
          </li>
          <li>
            <span className="legend-swatch splice" /> Splice node
          </li>
          <li>
            <span className="legend-swatch intermediate" /> Intermediate node
          </li>
          <li>
            <span className="legend-line selected" /> Selected segment
          </li>
          <li>
            <span className="legend-line wire" /> Wire highlighted segment
          </li>
        </ul>
      </section>

      <section className="panel route-preview-panel">
        <h2>Route preview</h2>
        <form className="row-form network-route-form route-preview-form">
          <label className="route-preview-field">
            <span className="route-preview-label">Start node</span>
            <select value={routePreviewStartNodeId} onChange={(event) => setRoutePreviewStartNodeId(event.target.value)}>
              <option value="">Select node</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {describeNode(node)}
                </option>
              ))}
            </select>
          </label>

          <label className="route-preview-field">
            <span className="route-preview-label">End node</span>
            <select value={routePreviewEndNodeId} onChange={(event) => setRoutePreviewEndNodeId(event.target.value)}>
              <option value="">Select node</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {describeNode(node)}
                </option>
              ))}
            </select>
          </label>
        </form>

        <div className="route-preview-selection-strip" aria-live="polite">
          <article>
            <span>Start</span>
            <strong>{selectedStartNode === null ? "Select node" : describeNode(selectedStartNode)}</strong>
          </article>
          <span className="route-preview-selection-arrow" aria-hidden="true">
            →
          </span>
          <article>
            <span>End</span>
            <strong>{selectedEndNode === null ? "Select node" : describeNode(selectedEndNode)}</strong>
          </article>
        </div>

        {hasRouteSelection ? (
          routePreview === null ? (
            <p className="route-preview-empty">No route currently exists between the selected start and end nodes.</p>
          ) : (
            <div className="route-preview-results">
              <div className="route-preview-status-line">
                <span className="route-preview-status-chip">Route found</span>
                <p>Shortest path computed from current selection.</p>
              </div>
              <div className="route-preview-metrics">
                <article>
                  <span>Length</span>
                  <strong>{routePreview.totalLengthMm} mm</strong>
                </article>
                <article>
                  <span>Segments</span>
                  <strong>{routePreview.segmentIds.length}</strong>
                </article>
                <article>
                  <span>Nodes</span>
                  <strong>{routePreview.nodeIds.length}</strong>
                </article>
              </div>
              <div className="route-preview-path-grid">
                <article>
                  <h4>Segments path</h4>
                  <p className="route-preview-path">
                    {routePreview.segmentIds.length === 0 ? "(none)" : routePreview.segmentIds.join(" -> ")}
                  </p>
                </article>
                <article>
                  <h4>Nodes path</h4>
                  <p className="route-preview-path">{routePreview.nodeIds.join(" -> ")}</p>
                </article>
              </div>
            </div>
          )
        ) : (
          <p className="route-preview-empty">Select start and end nodes to preview shortest path routing.</p>
        )}
      </section>
    </section>
  );
}
