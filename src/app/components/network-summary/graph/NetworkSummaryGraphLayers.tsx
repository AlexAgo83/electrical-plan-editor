import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  useRef
} from "react";
import type { NetworkNode, NodeId, SegmentId, WireId } from "../../../../core/entities";
import type { NodePosition } from "../../../types/app-controller";
import { getConsistentConnectorLayoutDrawingSize, renderConnectorLayoutDrawing } from "../callouts/NetworkSummaryCalloutsLayer";
import type { RenderedNodeModel, RenderedSegmentModel } from "./networkSummaryGraphModel";

const DOUBLE_CLICK_INTERVAL_MS = 450;

export interface SplicePlacementPreviewSegmentModel {
  key: string;
  segmentId: SegmentId;
  kind: "current" | "suggested";
  nodeAPosition: NodePosition;
  nodeBPosition: NodePosition;
}

export interface SplicePlacementPreviewNodeModel {
  nodeId: NodeId;
  position: NodePosition;
}

interface NetworkSummaryGraphLayersProps {
  networkOffset: NodePosition;
  networkScale: number;
  showNetworkGrid: boolean;
  gridXPositions: number[];
  gridYPositions: number[];
  visibleModelMinX: number;
  visibleModelMaxX: number;
  visibleModelMinY: number;
  visibleModelMaxY: number;
  afterGridLayer?: ReactNode;
  renderedSegments: RenderedSegmentModel[];
  splicePlacementPreviewSegments?: SplicePlacementPreviewSegmentModel[];
  splicePlacementPreviewNode?: SplicePlacementPreviewNodeModel | null;
  renderedNodes: RenderedNodeModel[];
  showSegmentNames: boolean;
  showSegmentLengths: boolean;
  inverseLabelScale: number;
  labelRotationDegrees: number;
  zoomInvariantNodeShapes: boolean;
  normalizedNodeShapeScale: number;
  connectorDrawingScale: number;
  useConsistentConnectorLayoutScale: boolean;
  nodeStrokeWidth: number;
  nodeStrokeEmphasisWidth: number;
  describeNode: (node: NetworkNode) => string;
  onSelectSegment: (segmentId: SegmentId) => void;
  onNodeMouseDown: (event: ReactMouseEvent<SVGGElement>, nodeId: NodeId) => void;
  onNodeActivate: (nodeId: NodeId) => void;
  onOpenInspectorForSelection: () => void;
  onSelectWireFromConnectorPin: (wireId: WireId) => void;
}

function handleNetworkNodeKeyDown(
  event: ReactKeyboardEvent<SVGGElement>,
  nodeId: NodeId,
  onNodeActivate: (nodeId: NodeId) => void
): void {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  onNodeActivate(nodeId);
}

function handleNetworkSegmentKeyDown(
  event: ReactKeyboardEvent<SVGLineElement>,
  segmentId: SegmentId,
  onSelectSegment: (segmentId: SegmentId) => void
): void {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  onSelectSegment(segmentId);
}

export function NetworkSummaryGraphLayers({
  networkOffset,
  networkScale,
  showNetworkGrid,
  gridXPositions,
  gridYPositions,
  visibleModelMinX,
  visibleModelMaxX,
  visibleModelMinY,
  visibleModelMaxY,
  afterGridLayer,
  renderedSegments,
  splicePlacementPreviewSegments = [],
  splicePlacementPreviewNode = null,
  renderedNodes,
  showSegmentNames,
  showSegmentLengths,
  inverseLabelScale,
  labelRotationDegrees,
  zoomInvariantNodeShapes,
  normalizedNodeShapeScale,
  connectorDrawingScale,
  useConsistentConnectorLayoutScale,
  nodeStrokeWidth,
  nodeStrokeEmphasisWidth,
  describeNode,
  onSelectSegment,
  onNodeMouseDown,
  onNodeActivate,
  onOpenInspectorForSelection,
  onSelectWireFromConnectorPin
}: NetworkSummaryGraphLayersProps): ReactElement {
  const lastClickRef = useRef<{ key: string; timestamp: number } | null>(null);
  const isRepeatedClick = (key: string): boolean => {
    const timestamp = Date.now();
    const isRepeated = lastClickRef.current?.key === key && timestamp - lastClickRef.current.timestamp <= DOUBLE_CLICK_INTERVAL_MS;
    lastClickRef.current = { key, timestamp };
    return isRepeated;
  };
  const renderNode = ({
    node,
    position,
    nodeClassName,
    nodeLabel,
    connectorLayout,
    highlightedConnectorCavityIndexes,
    connectorCavityWireIdByIndex
  }: RenderedNodeModel): ReactElement => {
    const connectorWidth = 46 * normalizedNodeShapeScale;
    const connectorHeight = 30 * normalizedNodeShapeScale;
    const connectorDrawingReferenceWidth = connectorWidth * connectorDrawingScale;
    const connectorDrawingReferenceHeight = connectorHeight * connectorDrawingScale;
    const connectorDrawingSize =
      connectorLayout !== undefined && useConsistentConnectorLayoutScale
        ? getConsistentConnectorLayoutDrawingSize(
            connectorLayout,
            connectorDrawingReferenceWidth,
            connectorDrawingReferenceHeight
          )
        : { width: connectorDrawingReferenceWidth, height: connectorDrawingReferenceHeight };
    const spliceDiamondSize = 30 * normalizedNodeShapeScale;
    const connectorHitboxWidth = 56 * normalizedNodeShapeScale;
    const connectorHitboxHeight = 40 * normalizedNodeShapeScale;
    const spliceHitboxSize = 38 * normalizedNodeShapeScale;
    const intermediateRadius = 17 * normalizedNodeShapeScale;
    const intermediateHitboxRadius = 22 * normalizedNodeShapeScale;
    const shapeAnchorTransform = `translate(${position.x} ${position.y}) scale(${inverseLabelScale}) translate(${-position.x} ${-position.y})`;

    return (
      <g
        key={node.id}
        className={nodeClassName}
        data-node-id={node.id}
        role="button"
        tabIndex={0}
        focusable="true"
        aria-label={`Select ${describeNode(node)}`}
        onMouseDown={(event) => onNodeMouseDown(event, node.id)}
        onKeyDown={(event) => handleNetworkNodeKeyDown(event, node.id, onNodeActivate)}
        onClick={(event) => {
          // Selection/editing is handled on mouse-down to support immediate drag interactions.
          // Keep click from bubbling to future parent click handlers.
          event.stopPropagation();
          if (event.detail >= 2 || isRepeatedClick(`node:${node.id}`)) {
            onNodeActivate(node.id);
            onOpenInspectorForSelection();
          }
        }}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onNodeActivate(node.id);
          onOpenInspectorForSelection();
        }}
      >
        <title>{describeNode(node)}</title>
        <g
          className={zoomInvariantNodeShapes ? "network-node-shape-anchor" : undefined}
          transform={zoomInvariantNodeShapes ? shapeAnchorTransform : undefined}
        >
          {node.kind === "connector" ? (
            <>
              {connectorLayout === undefined ? (
                <>
                  <rect
                    className="network-node-hitbox"
                    x={position.x - connectorHitboxWidth / 2}
                    y={position.y - connectorHitboxHeight / 2}
                    width={connectorHitboxWidth}
                    height={connectorHitboxHeight}
                    rx={9}
                    ry={9}
                  />
                  <rect
                    className="network-node-shape"
                    x={position.x - connectorWidth / 2}
                    y={position.y - connectorHeight / 2}
                    width={connectorWidth}
                    height={connectorHeight}
                    rx={7}
                    ry={7}
                  />
                </>
              ) : (
                <g
                  className="network-node-connector-drawing"
                  transform={`translate(${position.x} ${position.y - connectorDrawingSize.height / 2})`}
                >
                  {renderConnectorLayoutDrawing(
                    connectorLayout,
                    connectorDrawingSize.width,
                    connectorDrawingSize.height,
                    highlightedConnectorCavityIndexes,
                    nodeLabel,
                    connectorCavityWireIdByIndex,
                    onSelectWireFromConnectorPin,
                    onOpenInspectorForSelection
                  )}
                </g>
              )}
            </>
          ) : node.kind === "splice" ? (
            <>
              <rect
                className="network-node-hitbox"
                x={position.x - spliceHitboxSize / 2}
                y={position.y - spliceHitboxSize / 2}
                width={spliceHitboxSize}
                height={spliceHitboxSize}
                rx={7}
                ry={7}
                transform={`rotate(45 ${position.x} ${position.y})`}
              />
              <rect
                className="network-node-shape"
                x={position.x - spliceDiamondSize / 2}
                y={position.y - spliceDiamondSize / 2}
                width={spliceDiamondSize}
                height={spliceDiamondSize}
                rx={5}
                ry={5}
                transform={`rotate(45 ${position.x} ${position.y})`}
              />
            </>
          ) : (
            <>
              <circle className="network-node-hitbox" cx={position.x} cy={position.y} r={intermediateHitboxRadius} />
              <circle className="network-node-shape" cx={position.x} cy={position.y} r={intermediateRadius} />
            </>
          )}
        </g>
      </g>
    );
  };

  return (
    <>
      <g
        className={showNetworkGrid ? "network-grid" : "network-grid is-hidden"}
        style={showNetworkGrid ? undefined : { display: "none" }}
        transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
      >
          {gridXPositions.map((position) => {
            return <line key={`grid-v-${position}`} x1={position} y1={visibleModelMinY} x2={position} y2={visibleModelMaxY} />;
          })}
          {gridYPositions.map((position) => {
            return <line key={`grid-h-${position}`} x1={visibleModelMinX} y1={position} x2={visibleModelMaxX} y2={position} />;
          })}
      </g>
      {afterGridLayer}

      {splicePlacementPreviewSegments.length > 0 || splicePlacementPreviewNode !== null ? (
        <g
          className="network-graph-layer network-splice-placement-preview-layer"
          transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
          aria-hidden="true"
        >
          {splicePlacementPreviewSegments.map((segment) => (
            <line
              key={segment.key}
              className={
                segment.kind === "current"
                  ? "network-splice-placement-preview-segment is-current"
                  : "network-splice-placement-preview-segment is-suggested"
              }
              x1={segment.nodeAPosition.x}
              y1={segment.nodeAPosition.y}
              x2={segment.nodeBPosition.x}
              y2={segment.nodeBPosition.y}
            />
          ))}
          {splicePlacementPreviewNode === null ? null : (
            <rect
              className="network-splice-placement-preview-node"
              x={splicePlacementPreviewNode.position.x - 15}
              y={splicePlacementPreviewNode.position.y - 15}
              width={30}
              height={30}
              rx={5}
              ry={5}
              transform={`rotate(45 ${splicePlacementPreviewNode.position.x} ${splicePlacementPreviewNode.position.y})`}
            />
          )}
        </g>
      ) : null}

      <g className="network-graph-layer network-graph-layer-segments" transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}>
        {renderedSegments.map(({ segment, nodeAPosition, nodeBPosition, segmentClassName, segmentGroupClassName }) => (
          <g key={segment.id} className={segmentGroupClassName} data-segment-id={segment.id}>
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
              role="button"
              tabIndex={0}
              focusable="true"
              aria-label={`Select segment ${segment.id}`}
              onClick={(event) => {
                event.stopPropagation();
                onSelectSegment(segment.id);
                if (event.detail >= 2 || isRepeatedClick(`segment:${segment.id}`)) {
                  onOpenInspectorForSelection();
                }
              }}
              onDoubleClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSelectSegment(segment.id);
                onOpenInspectorForSelection();
              }}
              onKeyDown={(event) => handleNetworkSegmentKeyDown(event, segment.id, onSelectSegment)}
            />
          </g>
        ))}
      </g>

      <g
        className="network-graph-layer network-graph-layer-labels network-graph-layer-segment-labels"
        transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
      >
        {renderedSegments.map(
          ({
            segment,
            segmentGroupClassName,
            labelX,
            labelY,
            segmentLabelRotationDegrees,
            segmentIdLabelX,
            segmentIdLabelY,
            segmentLengthLabelX,
            segmentLengthLabelY
          }) => (
            <g key={`${segment.id}-labels`} className={segmentGroupClassName} data-segment-id={segment.id}>
              {showSegmentNames ? (
                <g className="network-segment-label-anchor" transform={`translate(${labelX} ${labelY}) scale(${inverseLabelScale})`}>
                  <text
                    className="network-segment-label"
                    x={segmentIdLabelX}
                    y={segmentIdLabelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={
                      segmentLabelRotationDegrees === 0
                        ? undefined
                        : `rotate(${segmentLabelRotationDegrees} ${segmentIdLabelX} ${segmentIdLabelY})`
                    }
                  >
                    {segment.id}
                  </text>
                </g>
              ) : null}
              {showSegmentLengths ? (
                <g
                  className="network-segment-length-label-anchor"
                  transform={`translate(${labelX} ${labelY}) scale(${inverseLabelScale})`}
                >
                  <text
                    className="network-segment-length-label"
                    x={segmentLengthLabelX}
                    y={segmentLengthLabelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={
                      segmentLabelRotationDegrees === 0
                        ? undefined
                        : `rotate(${segmentLabelRotationDegrees} ${segmentLengthLabelX} ${segmentLengthLabelY})`
                    }
                  >
                    <tspan>{segment.lengthMm}</tspan>
                    <tspan className="network-segment-length-unit" dx="2">
                      mm
                    </tspan>
                  </text>
                </g>
              ) : null}
            </g>
          )
        )}
      </g>

      <g
        className="network-graph-layer network-graph-layer-nodes"
        transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
        style={
          {
            "--network-node-stroke-width": `${nodeStrokeWidth}`,
            "--network-node-stroke-emphasis-width": `${nodeStrokeEmphasisWidth}`
          } as CSSProperties
        }
      >
        {renderedNodes.filter(({ connectorLayout }) => connectorLayout === undefined).map(renderNode)}
      </g>

      <g
        className="network-graph-layer network-graph-layer-labels network-graph-layer-node-labels"
        transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
      >
        {renderedNodes.map(({ node, position, nodeLabel, labelOffsetY, connectorLayout, isSubNetworkDeemphasized }) => {
          if (connectorLayout !== undefined) {
            return null;
          }

          return (
            <g
              key={`${node.id}-label`}
              className={`network-entity-group${isSubNetworkDeemphasized ? " is-deemphasized" : ""}`}
              data-node-id={node.id}
            >
              <g
                className="network-node-label-anchor"
                transform={`translate(${position.x} ${position.y + labelOffsetY}) scale(${inverseLabelScale})`}
              >
                <text
                  className="network-node-label"
                  x={0}
                  y={0}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={labelRotationDegrees === 0 ? undefined : `rotate(${labelRotationDegrees} 0 0)`}
                >
                  {nodeLabel}
                </text>
              </g>
            </g>
          );
        })}
      </g>

      <g
        className="network-graph-layer network-graph-layer-nodes network-graph-layer-physical-connector-nodes"
        transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
        style={
          {
            "--network-node-stroke-width": `${nodeStrokeWidth}`,
            "--network-node-stroke-emphasis-width": `${nodeStrokeEmphasisWidth}`
          } as CSSProperties
        }
      >
        {renderedNodes.filter(({ connectorLayout }) => connectorLayout !== undefined).map(renderNode)}
      </g>
    </>
  );
}
