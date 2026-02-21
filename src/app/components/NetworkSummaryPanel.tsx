import type { MouseEvent as ReactMouseEvent, ReactElement, WheelEvent as ReactWheelEvent } from "react";
import type {
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire
} from "../../core/entities";
import type { ShortestRouteResult } from "../../core/pathfinding";
import type { SubNetworkSummary } from "../../store";

interface NodePosition {
  x: number;
  y: number;
}

interface NetworkSummaryPanelProps {
  interactionMode: "select" | "addNode" | "addSegment" | "connect" | "route";
  setInteractionMode: (mode: "select" | "addNode" | "addSegment" | "connect" | "route") => void;
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  fitNetworkToContent: () => void;
  showNetworkGrid: boolean;
  snapNodesToGrid: boolean;
  toggleShowNetworkGrid: () => void;
  toggleSnapNodesToGrid: () => void;
  interactionModeHint: string;
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
  selectedConnector: Connector | null;
  selectedSplice: Splice | null;
  selectedNode: NetworkNode | null;
  selectedSegment: Segment | null;
  selectedWire: Wire | null;
  routePreviewStartNodeId: string;
  setRoutePreviewStartNodeId: (value: string) => void;
  routePreviewEndNodeId: string;
  setRoutePreviewEndNodeId: (value: string) => void;
  routePreview: ShortestRouteResult | null;
}

export function NetworkSummaryPanel({
  interactionMode,
  setInteractionMode,
  handleZoomAction,
  fitNetworkToContent,
  showNetworkGrid,
  snapNodesToGrid,
  toggleShowNetworkGrid,
  toggleSnapNodesToGrid,
  interactionModeHint,
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
  selectedConnector,
  selectedSplice,
  selectedNode,
  selectedSegment,
  selectedWire,
  routePreviewStartNodeId,
  setRoutePreviewStartNodeId,
  routePreviewEndNodeId,
  setRoutePreviewEndNodeId,
  routePreview
}: NetworkSummaryPanelProps): ReactElement {
  return (
    <section className="panel">
      <h2>Network summary</h2>
      <div className="canvas-toolbar" aria-label="Canvas interaction mode">
        <span>Interaction mode</span>
        {([
          ["select", "Select"],
          ["addNode", "Add Node"],
          ["addSegment", "Add Segment"],
          ["connect", "Connect"],
          ["route", "Route"]
        ] as const).map(([modeId, label]) => (
          <button
            key={modeId}
            type="button"
            className={interactionMode === modeId ? "workspace-tab is-active" : "workspace-tab"}
            onClick={() => setInteractionMode(modeId)}
          >
            {label}
          </button>
        ))}
        <span className="canvas-toolbar-separator" />
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
      <p className="meta-line">
        {interactionModeHint} View: {networkScalePercent}% zoom. Use toolbar buttons to zoom. Hold <strong>Shift</strong> and drag
        empty canvas to pan.
      </p>
      <div className="summary-grid">
        <article>
          <h3>Graph nodes</h3>
          <p>{routingGraphNodeCount}</p>
        </article>
        <article>
          <h3>Graph segments</h3>
          <p>{routingGraphSegmentCount}</p>
        </article>
        <article>
          <h3>Adjacency entries</h3>
          <p>{totalEdgeEntries}</p>
        </article>
      </div>

      <h3 className="summary-title">2D network view</h3>
      {nodes.length === 0 ? (
        <p className="empty-copy">No nodes yet. Create nodes and segments to render the 2D network.</p>
      ) : (
        <div className={`network-canvas-shell${isPanningNetwork ? " is-panning" : ""}`}>
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

      <h3 className="summary-title">Sub-networks</h3>
      {subNetworkSummaries.length === 0 ? (
        <p className="empty-copy">No sub-network tags yet. Segments currently belong to the default group.</p>
      ) : (
        <ul className="subnetwork-list">
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

      <h3 className="summary-title">Selection snapshot</h3>
      <div className="selection-snapshot">
        <p>Connector: {selectedConnector === null ? "none" : `${selectedConnector.name} (${selectedConnector.technicalId})`}</p>
        <p>Splice: {selectedSplice === null ? "none" : `${selectedSplice.name} (${selectedSplice.technicalId})`}</p>
        <p>Node: {selectedNode === null ? "none" : describeNode(selectedNode)}</p>
        <p>Segment: {selectedSegment === null ? "none" : `${selectedSegment.id} (${selectedSegment.lengthMm} mm)`}</p>
        <p>Wire: {selectedWire === null ? "none" : `${selectedWire.name} (${selectedWire.technicalId})`}</p>
      </div>

      <h3 className="summary-title">Route preview</h3>
      <form className="row-form">
        <label>
          Start node
          <select value={routePreviewStartNodeId} onChange={(event) => setRoutePreviewStartNodeId(event.target.value)}>
            <option value="">Select node</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {describeNode(node)}
              </option>
            ))}
          </select>
        </label>

        <label>
          End node
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

      {routePreviewStartNodeId.length > 0 && routePreviewEndNodeId.length > 0 ? (
        routePreview === null ? (
          <p className="empty-copy">No route currently exists between the selected nodes.</p>
        ) : (
          <div className="selection-snapshot">
            <p>Length: {routePreview.totalLengthMm} mm</p>
            <p>Segments: {routePreview.segmentIds.length === 0 ? "(none)" : routePreview.segmentIds.join(" -> ")}</p>
            <p>Nodes: {routePreview.nodeIds.join(" -> ")}</p>
          </div>
        )
      ) : (
        <p className="empty-copy">Select start and end nodes to preview shortest path routing.</p>
      )}
    </section>
  );
}
