import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode
} from "react";
import type { NetworkNode, NodeId, SegmentId, WireId } from "../../../../core/entities";
import type { NodePosition } from "../../../types/app-controller";
import { renderConnectorLayoutDrawing } from "../callouts/NetworkSummaryCalloutsLayer";
import type { RenderedNodeModel, RenderedSegmentModel } from "./networkSummaryGraphModel";

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
  nodeStrokeWidth: number;
  nodeStrokeEmphasisWidth: number;
  describeNode: (node: NetworkNode) => string;
  onSelectSegment: (segmentId: SegmentId) => void;
  onNodeMouseDown: (event: ReactMouseEvent<SVGGElement>, nodeId: NodeId) => void;
  onNodeActivate: (nodeId: NodeId) => void;
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
  nodeStrokeWidth,
  nodeStrokeEmphasisWidth,
  describeNode,
  onSelectSegment,
  onNodeMouseDown,
  onNodeActivate,
  onSelectWireFromConnectorPin
}: NetworkSummaryGraphLayersProps): ReactElement {
  return (
    <>
      {showNetworkGrid ? (
        <g className="network-grid" transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}>
          {gridXPositions.map((position) => {
            return <line key={`grid-v-${position}`} x1={position} y1={visibleModelMinY} x2={position} y2={visibleModelMaxY} />;
          })}
          {gridYPositions.map((position) => {
            return <line key={`grid-h-${position}`} x1={visibleModelMinX} y1={position} x2={visibleModelMaxX} y2={position} />;
          })}
        </g>
      ) : null}
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
              }}
              onKeyDown={(event) => handleNetworkSegmentKeyDown(event, segment.id, onSelectSegment)}
            />
          </g>
        ))}
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
        {renderedNodes.map(({ node, position, nodeClassName, nodeLabel, connectorLayout, highlightedConnectorCavityIndexes, connectorCavityWireIdByIndex }) => {
          const connectorWidth = 46 * normalizedNodeShapeScale;
          const connectorHeight = 30 * normalizedNodeShapeScale;
          const connectorDrawingWidth = connectorWidth * connectorDrawingScale;
          const connectorDrawingHeight = connectorHeight * connectorDrawingScale;
          const spliceDiamondSize = 30 * normalizedNodeShapeScale;
          const connectorHitboxWidth = Math.max(56 * normalizedNodeShapeScale, connectorDrawingWidth + 10 * normalizedNodeShapeScale);
          const connectorHitboxHeight = Math.max(40 * normalizedNodeShapeScale, connectorDrawingHeight + 10 * normalizedNodeShapeScale);
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
              }}
            >
              <title>{describeNode(node)}</title>
              <g
                className={zoomInvariantNodeShapes ? "network-node-shape-anchor" : undefined}
                transform={zoomInvariantNodeShapes ? shapeAnchorTransform : undefined}
              >
                {node.kind === "connector" ? (
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
                    {connectorLayout === undefined ? (
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
                      <g
                        className="network-node-connector-drawing"
                        transform={`translate(${position.x} ${position.y - connectorDrawingHeight / 2})`}
                      >
                        {renderConnectorLayoutDrawing(
                          connectorLayout,
                          connectorDrawingWidth,
                          connectorDrawingHeight,
                          highlightedConnectorCavityIndexes,
                          nodeLabel,
                          connectorCavityWireIdByIndex,
                          onSelectWireFromConnectorPin
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
        })}
      </g>

      <g className="network-graph-layer network-graph-layer-labels" transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}>
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
    </>
  );
}
