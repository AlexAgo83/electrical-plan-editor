import { useCallback, useRef, type MouseEvent as ReactMouseEvent, type ReactElement, type WheelEvent as ReactWheelEvent } from "react";
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
import type { CanvasLabelStrokeMode } from "../types/app-controller";
import { NetworkCanvasFloatingInfoPanels } from "./network-summary/NetworkCanvasFloatingInfoPanels";
import { NetworkRoutePreviewPanel } from "./network-summary/NetworkRoutePreviewPanel";
import { NetworkSummaryLegend } from "./network-summary/NetworkSummaryLegend";

export interface NodePosition {
  x: number;
  y: number;
}

const SVG_EXPORT_STYLE_PROPERTIES = [
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-opacity",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "opacity",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "letter-spacing",
  "text-anchor",
  "dominant-baseline",
  "paint-order",
  "display",
  "visibility"
] as const;

function copyComputedStylesToSvgClone(sourceSvg: SVGSVGElement, cloneSvg: SVGSVGElement): void {
  const sourceElements = [sourceSvg, ...Array.from(sourceSvg.querySelectorAll("*"))] as SVGElement[];
  const cloneElements = [cloneSvg, ...Array.from(cloneSvg.querySelectorAll("*"))] as SVGElement[];
  const pairCount = Math.min(sourceElements.length, cloneElements.length);

  for (let index = 0; index < pairCount; index += 1) {
    const sourceElement = sourceElements[index];
    const cloneElement = cloneElements[index];
    if (sourceElement === undefined || cloneElement === undefined) {
      continue;
    }
    const computedStyle = window.getComputedStyle(sourceElement);
    const inlineStyle = cloneElement.style;

    for (const propertyName of SVG_EXPORT_STYLE_PROPERTIES) {
      const propertyValue = computedStyle.getPropertyValue(propertyName);
      if (propertyValue.length > 0) {
        inlineStyle.setProperty(propertyName, propertyValue);
      }
    }
  }
}

export interface NetworkSummaryPanelProps {
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  fitNetworkToContent: () => void;
  showNetworkInfoPanels: boolean;
  showSegmentLengths: boolean;
  labelStrokeMode: CanvasLabelStrokeMode;
  showNetworkGrid: boolean;
  snapNodesToGrid: boolean;
  toggleShowNetworkInfoPanels: () => void;
  toggleShowSegmentLengths: () => void;
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
  selectedConnectorId: ConnectorId | null;
  selectedSpliceId: SpliceId | null;
  handleNetworkNodeMouseDown: (event: ReactMouseEvent<SVGGElement>, nodeId: NodeId) => void;
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
  showNetworkInfoPanels,
  showSegmentLengths,
  labelStrokeMode,
  showNetworkGrid,
  snapNodesToGrid,
  toggleShowNetworkInfoPanels,
  toggleShowSegmentLengths,
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
  selectedConnectorId,
  selectedSpliceId,
  handleNetworkNodeMouseDown,
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
  const networkSvgRef = useRef<SVGSVGElement | null>(null);
  const graphStats = [
    { label: "Graph nodes", value: routingGraphNodeCount },
    { label: "Graph segments", value: routingGraphSegmentCount },
    { label: "Adjacency entries", value: totalEdgeEntries }
  ];
  const effectiveScale = networkScale > 0 ? networkScale : 1;
  const visibleModelMinX = (0 - networkOffset.x) / effectiveScale;
  const visibleModelMaxX = (networkViewWidth - networkOffset.x) / effectiveScale;
  const visibleModelMinY = (0 - networkOffset.y) / effectiveScale;
  const visibleModelMaxY = (networkViewHeight - networkOffset.y) / effectiveScale;
  const gridStartX = Math.floor(visibleModelMinX / networkGridStep) * networkGridStep;
  const gridEndX = Math.ceil(visibleModelMaxX / networkGridStep) * networkGridStep;
  const gridStartY = Math.floor(visibleModelMinY / networkGridStep) * networkGridStep;
  const gridEndY = Math.ceil(visibleModelMaxY / networkGridStep) * networkGridStep;
  const verticalGridLineCount = Math.max(0, Math.ceil((gridEndX - gridStartX) / networkGridStep) + 1);
  const horizontalGridLineCount = Math.max(0, Math.ceil((gridEndY - gridStartY) / networkGridStep) + 1);
  const gridXPositions = Array.from({ length: verticalGridLineCount }, (_, index) => gridStartX + index * networkGridStep);
  const gridYPositions = Array.from({ length: horizontalGridLineCount }, (_, index) => gridStartY + index * networkGridStep);
  const handleExportPlanAsPng = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const sourceSvg = networkSvgRef.current;
    if (sourceSvg === null) {
      return;
    }

    const viewBoxWidth = sourceSvg.viewBox.baseVal.width;
    const viewBoxHeight = sourceSvg.viewBox.baseVal.height;
    const fallbackRect = sourceSvg.getBoundingClientRect();
    const exportWidth = Math.max(1, Math.round(viewBoxWidth > 0 ? viewBoxWidth : fallbackRect.width));
    const exportHeight = Math.max(1, Math.round(viewBoxHeight > 0 ? viewBoxHeight : fallbackRect.height));

    const svgClone = sourceSvg.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgClone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    svgClone.setAttribute("width", String(exportWidth));
    svgClone.setAttribute("height", String(exportHeight));
    if (!svgClone.getAttribute("viewBox")) {
      svgClone.setAttribute("viewBox", `0 0 ${exportWidth} ${exportHeight}`);
    }
    copyComputedStylesToSvgClone(sourceSvg, svgClone);

    const serializedSvg = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      URL.revokeObjectURL(svgUrl);
      const exportScale = Math.max(1, Math.ceil(window.devicePixelRatio || 1));
      const canvas = document.createElement("canvas");
      canvas.width = exportWidth * exportScale;
      canvas.height = exportHeight * exportScale;

      const context = canvas.getContext("2d");
      if (context === null) {
        return;
      }

      context.setTransform(exportScale, 0, 0, exportScale, 0, 0);
      context.drawImage(image, 0, 0, exportWidth, exportHeight);

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const downloadLink = document.createElement("a");
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.download = `network-plan-${timestamp}.png`;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    };
    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
    };
    image.src = svgUrl;
  }, []);

  return (
    <section className="network-summary-stack">
      <section className="panel">
        <header className="network-summary-header">
          <h2>Network summary</h2>
          <div className="network-summary-header-actions" role="group" aria-label="Network summary display options">
            <button
              type="button"
              className={showNetworkInfoPanels ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleShowNetworkInfoPanels}
            >
              <span className="network-summary-info-icon" aria-hidden="true" />
              Info
            </button>
            <button
              type="button"
              className={showSegmentLengths ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleShowSegmentLengths}
            >
              <span className="network-summary-length-icon" aria-hidden="true" />
              Length
            </button>
            <button
              type="button"
              className={showNetworkGrid ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleShowNetworkGrid}
            >
              <span className="network-summary-grid-icon" aria-hidden="true" />
              Grid
            </button>
            <button
              type="button"
              className={snapNodesToGrid ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleSnapNodesToGrid}
            >
              <span className="network-summary-snap-icon" aria-hidden="true" />
              Snap
            </button>
            <button
              type="button"
              className="workspace-tab network-summary-export-button"
              onClick={handleExportPlanAsPng}
              disabled={nodes.length === 0}
            >
              <span className="network-summary-export-icon" aria-hidden="true" />
              Export PNG
            </button>
          </div>
        </header>
        {nodes.length === 0 ? (
          <p className="empty-copy">No nodes yet. Create nodes and segments to render the 2D network.</p>
        ) : (
          <div className={`network-canvas-shell${isPanningNetwork ? " is-panning" : ""}`}>
            <NetworkCanvasFloatingInfoPanels
              showNetworkInfoPanels={showNetworkInfoPanels}
              handleZoomAction={handleZoomAction}
              fitNetworkToContent={fitNetworkToContent}
              onRegenerateLayout={onRegenerateLayout}
              networkScalePercent={networkScalePercent}
              subNetworkSummaries={subNetworkSummaries}
              graphStats={graphStats}
            />
            <svg
              ref={networkSvgRef}
              className={`network-svg network-canvas--label-stroke-${labelStrokeMode}`}
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
                  {gridXPositions.map((position) => {
                    return (
                      <line key={`grid-v-${position}`} x1={position} y1={visibleModelMinY} x2={position} y2={visibleModelMaxY} />
                    );
                  })}
                  {gridYPositions.map((position) => {
                    return (
                      <line key={`grid-h-${position}`} x1={visibleModelMinX} y1={position} x2={visibleModelMaxX} y2={position} />
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
                      {showSegmentLengths ? (
                        <text className="network-segment-length-label" x={labelX} y={labelY + 6} textAnchor="middle">
                          {segment.lengthMm} mm
                        </text>
                      ) : null}
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
                  const isSelectedNode =
                    selectedNodeId === node.id ||
                    (node.kind === "connector" && selectedConnectorId === node.connectorId) ||
                    (node.kind === "splice" && selectedSpliceId === node.spliceId);
                  const nodeClassName = `network-node ${nodeKindClass}${isSelectedNode ? " is-selected" : ""}`;
                  const nodeLabel =
                    node.kind === "intermediate"
                      ? node.id
                      : node.kind === "connector"
                        ? (connectorMap.get(node.connectorId)?.technicalId ?? node.connectorId)
                        : (spliceMap.get(node.spliceId)?.technicalId ?? node.spliceId);

                  const connectorWidth = 46;
                  const connectorHeight = 30;

                  return (
                    <g
                      key={node.id}
                      className={nodeClassName}
                      onMouseDown={(event) => handleNetworkNodeMouseDown(event, node.id)}
                      onClick={(event) => {
                        // Selection/editing is handled on mouse-down to support immediate drag interactions.
                        // Keep click from bubbling to future parent click handlers.
                        event.stopPropagation();
                      }}
                    >
                      <title>{describeNode(node)}</title>
                      {node.kind === "connector" ? (
                        <rect
                          className="network-node-shape"
                          x={position.x - connectorWidth / 2}
                          y={position.y - connectorHeight / 2}
                          width={connectorWidth}
                          height={connectorHeight}
                          rx={7}
                          ry={7}
                        />
                      ) : (
                        <circle className="network-node-shape" cx={position.x} cy={position.y} r={17} />
                      )}
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
        <NetworkSummaryLegend />
      </section>
      <NetworkRoutePreviewPanel
        nodes={nodes}
        describeNode={describeNode}
        routePreviewStartNodeId={routePreviewStartNodeId}
        setRoutePreviewStartNodeId={setRoutePreviewStartNodeId}
        routePreviewEndNodeId={routePreviewEndNodeId}
        setRoutePreviewEndNodeId={setRoutePreviewEndNodeId}
        routePreview={routePreview}
      />
    </section>
  );
}
