import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type WheelEvent as ReactWheelEvent
} from "react";
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
import type {
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  SubScreenId
} from "../types/app-controller";
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

function resolveCanvasExportBackgroundFill(shellElement: HTMLElement | null): string | null {
  if (shellElement === null || typeof window === "undefined") {
    return null;
  }

  const style = window.getComputedStyle(shellElement);
  const backgroundColor = style.backgroundColor.trim();
  if (backgroundColor.length > 0 && backgroundColor !== "rgba(0, 0, 0, 0)" && backgroundColor !== "transparent") {
    return backgroundColor;
  }

  const backgroundImage = style.backgroundImage;
  if (!backgroundImage.includes("gradient")) {
    return null;
  }

  const colorMatch = backgroundImage.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})/);
  return colorMatch?.[1] ?? null;
}

export interface NetworkSummaryPanelProps {
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  fitNetworkToContent: () => void;
  showNetworkInfoPanels: boolean;
  showSegmentLengths: boolean;
  labelStrokeMode: CanvasLabelStrokeMode;
  labelSizeMode: CanvasLabelSizeMode;
  labelRotationDegrees: CanvasLabelRotationDegrees;
  showNetworkGrid: boolean;
  snapNodesToGrid: boolean;
  lockEntityMovement: boolean;
  toggleShowNetworkInfoPanels: () => void;
  toggleShowSegmentLengths: () => void;
  toggleShowNetworkGrid: () => void;
  toggleSnapNodesToGrid: () => void;
  toggleLockEntityMovement: () => void;
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
  handleNetworkNodeActivate: (nodeId: NodeId) => void;
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  describeNode: (node: NetworkNode) => string;
  subNetworkSummaries: SubNetworkSummary[];
  routePreviewStartNodeId: string;
  setRoutePreviewStartNodeId: (value: string) => void;
  routePreviewEndNodeId: string;
  setRoutePreviewEndNodeId: (value: string) => void;
  routePreview: ShortestRouteResult | null;
  quickEntityNavigationMode: "modeling" | "analysis";
  activeSubScreen: SubScreenId;
  entityCountBySubScreen: Record<SubScreenId, number>;
  onQuickEntityNavigation: (subScreen: SubScreenId) => void;
  pngExportIncludeBackground: boolean;
  onRegenerateLayout: () => void;
}

const QUICK_ENTITY_NAV_ITEMS: Record<
  NetworkSummaryPanelProps["quickEntityNavigationMode"],
  ReadonlyArray<{ subScreen: SubScreenId; label: string }>
> = {
  modeling: [
    { subScreen: "connector", label: "Connectors" },
    { subScreen: "splice", label: "Splices" },
    { subScreen: "node", label: "Nodes" },
    { subScreen: "segment", label: "Segments" },
    { subScreen: "wire", label: "Wires" }
  ],
  analysis: [
    { subScreen: "connector", label: "Connectors" },
    { subScreen: "splice", label: "Splices" },
    { subScreen: "wire", label: "Wires" }
  ]
};

export function NetworkSummaryPanel({
  handleZoomAction,
  fitNetworkToContent,
  showNetworkInfoPanels,
  showSegmentLengths,
  labelStrokeMode,
  labelSizeMode,
  labelRotationDegrees,
  showNetworkGrid,
  snapNodesToGrid,
  lockEntityMovement,
  toggleShowNetworkInfoPanels,
  toggleShowSegmentLengths,
  toggleShowNetworkGrid,
  toggleSnapNodesToGrid,
  toggleLockEntityMovement,
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
  handleNetworkNodeActivate,
  connectorMap,
  spliceMap,
  describeNode,
  subNetworkSummaries,
  routePreviewStartNodeId,
  setRoutePreviewStartNodeId,
  routePreviewEndNodeId,
  setRoutePreviewEndNodeId,
  routePreview,
  quickEntityNavigationMode,
  activeSubScreen,
  entityCountBySubScreen,
  onQuickEntityNavigation,
  pngExportIncludeBackground,
  onRegenerateLayout
}: NetworkSummaryPanelProps): ReactElement {
  const networkSvgRef = useRef<SVGSVGElement | null>(null);
  const networkCanvasShellRef = useRef<HTMLDivElement | null>(null);
  const subNetworkFilterInitializedRef = useRef(false);
  const [activeSubNetworkTags, setActiveSubNetworkTags] = useState<Set<string>>(new Set());
  const graphStats = [
    { label: "Graph nodes", value: routingGraphNodeCount },
    { label: "Graph segments", value: routingGraphSegmentCount },
    { label: "Adjacency entries", value: totalEdgeEntries }
  ];
  const effectiveScale = networkScale > 0 ? networkScale : 1;
  const inverseLabelScale = 1 / effectiveScale;
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
  const allSubNetworkTags = useMemo(
    () => subNetworkSummaries.map((summary) => summary.tag),
    [subNetworkSummaries]
  );

  useEffect(() => {
    if (allSubNetworkTags.length === 0) {
      subNetworkFilterInitializedRef.current = false;
      setActiveSubNetworkTags((current) => (current.size === 0 ? current : new Set()));
      return;
    }

    setActiveSubNetworkTags((current) => {
      const next = new Set<string>();
      const isUninitialized = !subNetworkFilterInitializedRef.current;
      for (const tag of allSubNetworkTags) {
        if (isUninitialized || current.has(tag)) {
          next.add(tag);
        }
      }
      if (isUninitialized) {
        subNetworkFilterInitializedRef.current = true;
      }
      const hasSameSize = next.size === current.size;
      if (hasSameSize && [...next].every((tag) => current.has(tag))) {
        return current;
      }
      return next;
    });
  }, [allSubNetworkTags]);

  const activeSubNetworkTagSet = activeSubNetworkTags as ReadonlySet<string>;
  const isSubNetworkFilteringActive =
    allSubNetworkTags.length > 0 && activeSubNetworkTagSet.size < allSubNetworkTags.length;

  const segmentSubNetworkTagById = useMemo(() => {
    const byId = new Map<SegmentId, string>();
    for (const segment of segments) {
      const normalizedTag = segment.subNetworkTag?.trim();
      byId.set(segment.id, normalizedTag === undefined || normalizedTag.length === 0 ? "(default)" : normalizedTag);
    }
    return byId;
  }, [segments]);

  const nodeHasActiveSubNetworkConnection = useMemo(() => {
    const byNodeId = new Map<NodeId, boolean>();
    for (const node of nodes) {
      byNodeId.set(node.id, false);
    }
    for (const segment of segments) {
      const tag = segmentSubNetworkTagById.get(segment.id) ?? "(default)";
      if (!activeSubNetworkTagSet.has(tag)) {
        continue;
      }
      byNodeId.set(segment.nodeA, true);
      byNodeId.set(segment.nodeB, true);
    }
    return byNodeId;
  }, [nodes, segments, segmentSubNetworkTagById, activeSubNetworkTagSet]);

  const toggleSubNetworkTag = useCallback((tag: string) => {
    setActiveSubNetworkTags((current) => {
      const next = new Set(current);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const enableAllSubNetworkTags = useCallback(() => {
    setActiveSubNetworkTags(new Set(allSubNetworkTags));
  }, [allSubNetworkTags]);

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
      if (pngExportIncludeBackground) {
        const backgroundFill = resolveCanvasExportBackgroundFill(networkCanvasShellRef.current);
        if (backgroundFill !== null) {
          context.fillStyle = backgroundFill;
          context.fillRect(0, 0, exportWidth, exportHeight);
        }
      }
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
  }, [pngExportIncludeBackground]);

  function handleNetworkNodeKeyDown(event: ReactKeyboardEvent<SVGGElement>, nodeId: NodeId): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handleNetworkNodeActivate(nodeId);
  }

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
              className={lockEntityMovement ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleLockEntityMovement}
            >
              <span className="network-summary-lock-move-icon" aria-hidden="true" />
              Lock
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
          <div ref={networkCanvasShellRef} className={`network-canvas-shell${isPanningNetwork ? " is-panning" : ""}`}>
            <NetworkCanvasFloatingInfoPanels
              showNetworkInfoPanels={showNetworkInfoPanels}
              handleZoomAction={handleZoomAction}
              fitNetworkToContent={fitNetworkToContent}
              onRegenerateLayout={onRegenerateLayout}
              networkScalePercent={networkScalePercent}
              subNetworkSummaries={subNetworkSummaries}
              activeSubNetworkTags={activeSubNetworkTagSet}
              toggleSubNetworkTag={toggleSubNetworkTag}
              enableAllSubNetworkTags={enableAllSubNetworkTags}
              graphStats={graphStats}
            />
            <svg
              ref={networkSvgRef}
              className={`network-svg network-canvas--label-stroke-${labelStrokeMode} network-canvas--label-size-${labelSizeMode}`}
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

                  const segmentSubNetworkTag = segmentSubNetworkTagById.get(segment.id) ?? "(default)";
                  const isSubNetworkDeemphasized =
                    isSubNetworkFilteringActive && !activeSubNetworkTagSet.has(segmentSubNetworkTag);
                  const isWireHighlighted = selectedWireRouteSegmentIds.has(segment.id);
                  const isSelectedSegment = selectedSegmentId === segment.id;
                  const segmentClassName = `network-segment${isWireHighlighted ? " is-wire-highlighted" : ""}${
                    isSelectedSegment ? " is-selected" : ""
                  }`;
                  const segmentGroupClassName = `network-entity-group${
                    isSubNetworkDeemphasized ? " is-deemphasized" : ""
                  }`;
                  const labelX = (nodeAPosition.x + nodeBPosition.x) / 2;
                  const labelY = (nodeAPosition.y + nodeBPosition.y) / 2;

                  return (
                    <g key={segment.id} className={segmentGroupClassName}>
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
                      <g
                        className="network-segment-label-anchor"
                        transform={`translate(${labelX} ${labelY}) scale(${inverseLabelScale})`}
                      >
                        <text
                          className="network-segment-label"
                          x={0}
                          y={-6}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={labelRotationDegrees === 0 ? undefined : `rotate(${labelRotationDegrees} 0 -6)`}
                        >
                          {segment.id}
                        </text>
                      </g>
                      {showSegmentLengths ? (
                        <g
                          className="network-segment-length-label-anchor"
                          transform={`translate(${labelX} ${labelY}) scale(${inverseLabelScale})`}
                        >
                          <text
                            className="network-segment-length-label"
                            x={0}
                            y={6}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={labelRotationDegrees === 0 ? undefined : `rotate(${labelRotationDegrees} 0 6)`}
                          >
                            {segment.lengthMm} mm
                          </text>
                        </g>
                      ) : null}
                    </g>
                  );
                })}

                {nodes.map((node) => {
                  const position = networkNodePositions[node.id];
                  if (position === undefined) {
                    return null;
                  }

                  const isSubNetworkDeemphasized =
                    isSubNetworkFilteringActive && !(nodeHasActiveSubNetworkConnection.get(node.id) ?? false);
                  const nodeKindClass =
                    node.kind === "connector" ? "connector" : node.kind === "splice" ? "splice" : "intermediate";
                  const isSelectedNode =
                    selectedNodeId === node.id ||
                    (node.kind === "connector" && selectedConnectorId === node.connectorId) ||
                    (node.kind === "splice" && selectedSpliceId === node.spliceId);
                  const nodeClassName = `network-node ${nodeKindClass}${isSelectedNode ? " is-selected" : ""}${
                    isSubNetworkDeemphasized ? " is-deemphasized" : ""
                  }`;
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
                      role="button"
                      tabIndex={0}
                      focusable="true"
                      aria-label={`Select ${describeNode(node)}`}
                      onMouseDown={(event) => handleNetworkNodeMouseDown(event, node.id)}
                      onKeyDown={(event) => handleNetworkNodeKeyDown(event, node.id)}
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
                      <g
                        className="network-node-label-anchor"
                        transform={`translate(${position.x} ${position.y}) scale(${inverseLabelScale})`}
                      >
                        <text
                          className="network-node-label"
                          x={0}
                          y={4}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={labelRotationDegrees === 0 ? undefined : `rotate(${labelRotationDegrees} 0 4)`}
                        >
                          {nodeLabel}
                        </text>
                      </g>
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
      <section className="panel network-summary-quick-entity-nav-panel" aria-label="Quick entity navigation">
        <div className="network-summary-quick-entity-nav" role="group" aria-label="Quick entity navigation strip">
          {QUICK_ENTITY_NAV_ITEMS[quickEntityNavigationMode].map((item) => (
            <button
              key={item.subScreen}
              type="button"
              className={activeSubScreen === item.subScreen ? "filter-chip is-active" : "filter-chip"}
              onClick={() => onQuickEntityNavigation(item.subScreen)}
              aria-pressed={activeSubScreen === item.subScreen}
            >
              <span className="network-summary-quick-entity-nav-label">{item.label}</span>
              <span className="filter-chip-count">{entityCountBySubScreen[item.subScreen]}</span>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}
