import {
  memo,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  startTransition,
  useRef
} from "react";
import type { NetworkNode, NodeId, SegmentId, SpliceId, WireId } from "../../../../core/entities";
import type { NodePosition } from "../../../types/app-controller";
import { arePanelMemoPropsEqual } from "../../../lib/renderMemoCompare";
import { getConsistentConnectorLayoutDrawingSize, renderConnectorLayoutDrawing } from "../callouts/NetworkSummaryCalloutsLayer";
import {
  SEGMENT_SHEATH_CALLOUT_COLUMN_DIVIDER_OFFSETS,
  SEGMENT_SHEATH_CALLOUT_COLUMN_TEXT_OFFSETS,
  type RenderedFloatingSpliceModel,
  type RenderedNodeModel,
  type RenderedSegmentModel
} from "./networkSummaryGraphModel";

const DOUBLE_CLICK_INTERVAL_MS = 450;

// useEvent pattern: memoized graph items skip re-renders on handler identity
// changes, so they must always dispatch through the latest handler instance
// (e.g. group-drag captures the current canvas selection, not a stale one).
function useLatestHandlers<T extends Record<string, (...args: never[]) => unknown>>(handlers: T): T {
  const latestRef = useRef(handlers);
  latestRef.current = handlers;
  const stableRef = useRef<T | null>(null);
  if (stableRef.current === null) {
    const stable = {} as Record<string, unknown>;
    for (const key of Object.keys(handlers)) {
      stable[key] = (...args: never[]) => latestRef.current[key]?.(...args);
    }
    stableRef.current = stable as T;
  }
  return stableRef.current;
}

// Sub-span distances can carry rounding noise from non-integer splice offsets; keep them tidy.
function formatSegmentLengthMm(lengthMm: number): number {
  return Number.isInteger(lengthMm) ? lengthMm : Math.round(lengthMm * 10) / 10;
}

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
  renderedFloatingSplices: RenderedFloatingSpliceModel[];
  renderedNodes: RenderedNodeModel[];
  showSegmentNames: boolean;
  showSegmentLengths: boolean;
  showSegmentDressings: boolean;
  showColocatedSpliceLinkLine: boolean;
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
  onSegmentCalloutMouseDown: (event: ReactMouseEvent<SVGGElement>, segmentId: SegmentId) => void;
  onNodeMouseDown: (event: ReactMouseEvent<SVGGElement>, nodeId: NodeId) => void;
  onNodeActivate: (nodeId: NodeId) => void;
  onSelectFloatingSplice: (spliceId: SpliceId) => void;
  onActivateFloatingSplice: (spliceId: SpliceId) => void;
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

function resolveSegmentCalloutLeaderFrameIntersection(
  deltaX: number,
  deltaY: number,
  width: number,
  height: number
): NodePosition {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  if (absDeltaX < 0.0001 && absDeltaY < 0.0001) {
    return { x: 0, y: 0 };
  }

  const scaleX = absDeltaX < 0.0001 ? Number.POSITIVE_INFINITY : halfWidth / absDeltaX;
  const scaleY = absDeltaY < 0.0001 ? Number.POSITIVE_INFINITY : halfHeight / absDeltaY;
  const scale = Math.min(scaleX, scaleY);

  return {
    x: deltaX * scale,
    y: deltaY * scale
  };
}

// ponytail: per-item memo components below — selection/drag changes only re-render
// the affected node/segment instead of the whole 49-node SVG (arePanelMemoPropsEqual
// ignores handler identity and shallow-compares the rebuilt model records).

type GraphNodeItemProps = RenderedNodeModel & {
  normalizedNodeShapeScale: number;
  connectorDrawingScale: number;
  useConsistentConnectorLayoutScale: boolean;
  inverseLabelScale: number;
  zoomInvariantNodeShapes: boolean;
  describeNode: (node: NetworkNode) => string;
  onNodeMouseDown: (event: ReactMouseEvent<SVGGElement>, nodeId: NodeId) => void;
  onNodeActivate: (nodeId: NodeId) => void;
  onOpenInspectorForSelection: () => void;
  onSelectWireFromConnectorPin: (wireId: WireId) => void;
  isRepeatedClick: (key: string) => boolean;
};

const GraphNodeItem = memo(function GraphNodeItem({
  node,
  position,
  nodeClassName,
  nodeLabel,
  connectorLayout,
  highlightedConnectorCavityIndexes,
  connectorCavityWireIdByIndex,
  normalizedNodeShapeScale,
  connectorDrawingScale,
  useConsistentConnectorLayoutScale,
  inverseLabelScale,
  zoomInvariantNodeShapes,
  describeNode,
  onNodeMouseDown,
  onNodeActivate,
  onOpenInspectorForSelection,
  onSelectWireFromConnectorPin,
  isRepeatedClick
}: GraphNodeItemProps): ReactElement {
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
      className={nodeClassName}
      data-node-id={node.id}
      role="button"
      tabIndex={0}
      focusable="true"
      aria-label={`Select ${describeNode(node)}`}
      onMouseDown={(event) => onNodeMouseDown(event, node.id)}
      onKeyDown={(event) => handleNetworkNodeKeyDown(event, node.id, onNodeActivate)}
      onClick={(event) => {
        event.stopPropagation();
        if (event.detail >= 2 || isRepeatedClick(`node:${node.id}`)) {
          onNodeActivate(node.id);
          onOpenInspectorForSelection();
          return;
        }
        startTransition(() => onNodeActivate(node.id));
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
            <circle
              className="network-node-shape"
              cx={position.x}
              cy={position.y}
              r={node.kind === "connectorBackshellHelper" ? Math.max(5, intermediateRadius - 3) : intermediateRadius}
            />
          </>
        )}
      </g>
    </g>
  );
}, arePanelMemoPropsEqual);

type GraphSegmentItemProps = Pick<
  RenderedSegmentModel,
  "segment" | "nodeAPosition" | "nodeBPosition" | "segmentClassName" | "segmentGroupClassName" | "wireHighlightPortion"
> & {
  onSelectSegment: (segmentId: SegmentId) => void;
  onOpenInspectorForSelection: () => void;
  isRepeatedClick: (key: string) => boolean;
};

const GraphSegmentItem = memo(function GraphSegmentItem({
  segment,
  nodeAPosition,
  nodeBPosition,
  segmentClassName,
  segmentGroupClassName,
  wireHighlightPortion,
  onSelectSegment,
  onOpenInspectorForSelection,
  isRepeatedClick
}: GraphSegmentItemProps): ReactElement {
  return (
    <g className={segmentGroupClassName} data-segment-id={segment.id}>
      <line
        className={segmentClassName}
        x1={nodeAPosition.x}
        y1={nodeAPosition.y}
        x2={nodeBPosition.x}
        y2={nodeBPosition.y}
      />
      {wireHighlightPortion ? (
        <>
          <line
            className="network-segment-wire-highlight-portion"
            x1={wireHighlightPortion.x1}
            y1={wireHighlightPortion.y1}
            x2={wireHighlightPortion.x2}
            y2={wireHighlightPortion.y2}
          />
          {wireHighlightPortion.markers.map((marker) => (
            <circle
              key={marker.key}
              className="network-segment-wire-highlight-marker"
              cx={marker.x}
              cy={marker.y}
              r={4}
            />
          ))}
        </>
      ) : null}
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
  );
}, arePanelMemoPropsEqual);

type GraphSegmentLabelsItemProps = Pick<
  RenderedSegmentModel,
  | "segment"
  | "segmentGroupClassName"
  | "labelX"
  | "labelY"
  | "segmentLabelRotationDegrees"
  | "segmentIdLabelX"
  | "segmentIdLabelY"
  | "segmentLengthLabelX"
  | "segmentLengthLabelY"
  | "segmentLengthSubLabels"
  | "mountingLabels"
> & {
  showSegmentNames: boolean;
  showSegmentLengths: boolean;
  showSegmentDressings: boolean;
  inverseLabelScale: number;
};

const GraphSegmentLabelsItem = memo(function GraphSegmentLabelsItem({
  segment,
  segmentGroupClassName,
  labelX,
  labelY,
  segmentLabelRotationDegrees,
  segmentIdLabelX,
  segmentIdLabelY,
  segmentLengthLabelX,
  segmentLengthLabelY,
  segmentLengthSubLabels,
  mountingLabels,
  showSegmentNames,
  showSegmentLengths,
  showSegmentDressings,
  inverseLabelScale
}: GraphSegmentLabelsItemProps): ReactElement {
  return (
    <g className={segmentGroupClassName} data-segment-id={segment.id}>
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
        segmentLengthSubLabels.length > 0 ? (
          segmentLengthSubLabels.map((subLabel) => (
            <g
              key={subLabel.key}
              className="network-segment-length-label-anchor"
              transform={`translate(${subLabel.anchorX} ${subLabel.anchorY}) scale(${inverseLabelScale})`}
            >
              <text
                className="network-segment-length-label"
                x={subLabel.textX}
                y={subLabel.textY}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={
                  subLabel.rotationDegrees === 0
                    ? undefined
                    : `rotate(${subLabel.rotationDegrees} ${subLabel.textX} ${subLabel.textY})`
                }
              >
                <tspan>{formatSegmentLengthMm(subLabel.lengthMm)}</tspan>
                <tspan className="network-segment-length-unit" dx="2">
                  mm
                </tspan>
              </text>
            </g>
          ))
        ) : (
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
        )
      ) : null}
      {showSegmentDressings
        ? mountingLabels.map((label) => (
            <g
              key={label.key}
              className="network-segment-mounting-label-anchor"
              transform={`translate(${label.x} ${label.y}) scale(${inverseLabelScale})`}
            >
              <rect
                className="network-segment-mounting-label-frame"
                x={-22}
                y={-8}
                width={44}
                height={16}
                rx={3}
                ry={3}
              />
              <text
                className="network-segment-mounting-label-text"
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {label.text}
              </text>
            </g>
          ))
        : null}
    </g>
  );
}, arePanelMemoPropsEqual);

type GraphNodeLabelItemProps = Pick<RenderedNodeModel, "node" | "position" | "nodeLabel" | "labelOffsetY" | "isSubNetworkDeemphasized"> & {
  inverseLabelScale: number;
  labelRotationDegrees: number;
};

const GraphNodeLabelItem = memo(function GraphNodeLabelItem({
  node,
  position,
  nodeLabel,
  labelOffsetY,
  isSubNetworkDeemphasized,
  inverseLabelScale,
  labelRotationDegrees
}: GraphNodeLabelItemProps): ReactElement {
  return (
    <g
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
}, arePanelMemoPropsEqual);

type GraphFloatingSpliceItemProps = RenderedFloatingSpliceModel & {
  normalizedNodeShapeScale: number;
  inverseLabelScale: number;
  zoomInvariantNodeShapes: boolean;
  showColocatedSpliceLinkLine: boolean;
  onSelectFloatingSplice: (spliceId: SpliceId) => void;
  onActivateFloatingSplice: (spliceId: SpliceId) => void;
  onOpenInspectorForSelection: () => void;
};

const GraphFloatingSpliceItem = memo(function GraphFloatingSpliceItem({
  splice,
  position,
  anchorPosition,
  nodeClassName,
  isColocated,
  normalizedNodeShapeScale,
  inverseLabelScale,
  zoomInvariantNodeShapes,
  showColocatedSpliceLinkLine,
  onSelectFloatingSplice,
  onActivateFloatingSplice,
  onOpenInspectorForSelection
}: GraphFloatingSpliceItemProps): ReactElement {
  const spliceDiamondSize = 30 * normalizedNodeShapeScale;
  const spliceHitboxSize = 38 * normalizedNodeShapeScale;
  const shapeAnchorTransform = `translate(${position.x} ${position.y}) scale(${inverseLabelScale}) translate(${-position.x} ${-position.y})`;
  const hasAnchorTick =
    Math.abs(anchorPosition.x - position.x) > 0.01 ||
    Math.abs(anchorPosition.y - position.y) > 0.01;
  // Colocated splices draw a short link line back to the shared placement point
  // (default on, hidden via settings). Lone splices nudged off their anchor for
  // node clearance keep their always-on placement tick.
  const showAnchorTick = hasAnchorTick && (isColocated ? showColocatedSpliceLinkLine : true);
  return (
    <g
      className={nodeClassName}
      data-splice-id={splice.id}
      role="button"
      tabIndex={0}
      focusable="true"
      aria-label={`Select splice ${splice.technicalId}`}
      onClick={(event) => {
        event.stopPropagation();
        // Match connector behavior: a single click selects and opens the splice
        // edit flow directly (connectors activate on mouse-down) WITHOUT opening
        // the inspector panel. The inspector is reserved for double-click below.
        onSelectFloatingSplice(splice.id);
        onActivateFloatingSplice(splice.id);
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onActivateFloatingSplice(splice.id);
        onOpenInspectorForSelection();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        onActivateFloatingSplice(splice.id);
        onOpenInspectorForSelection();
      }}
    >
      <title>{splice.technicalId}</title>
      {showAnchorTick ? (
        <line
          className={`network-splice-placement-preview-segment is-current${
            isColocated ? " network-splice-colocated-link-line" : ""
          }`}
          x1={anchorPosition.x}
          y1={anchorPosition.y}
          x2={position.x}
          y2={position.y}
        />
      ) : null}
      <g
        className={zoomInvariantNodeShapes ? "network-node-shape-anchor" : undefined}
        transform={zoomInvariantNodeShapes ? shapeAnchorTransform : undefined}
      >
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
      </g>
    </g>
  );
}, arePanelMemoPropsEqual);

type GraphFloatingSpliceLabelItemProps = Pick<RenderedFloatingSpliceModel, "splice" | "position" | "nodeLabel" | "isSubNetworkDeemphasized"> & {
  inverseLabelScale: number;
  labelRotationDegrees: number;
};

const GraphFloatingSpliceLabelItem = memo(function GraphFloatingSpliceLabelItem({
  splice,
  position,
  nodeLabel,
  isSubNetworkDeemphasized,
  inverseLabelScale,
  labelRotationDegrees
}: GraphFloatingSpliceLabelItemProps): ReactElement {
  return (
    <g
      className={`network-entity-group${isSubNetworkDeemphasized ? " is-deemphasized" : ""}`}
      data-splice-id={splice.id}
    >
      <g
        className="network-node-label-anchor"
        transform={`translate(${position.x} ${position.y}) scale(${inverseLabelScale})`}
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
}, arePanelMemoPropsEqual);

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
  renderedFloatingSplices,
  renderedNodes,
  showSegmentNames,
  showSegmentLengths,
  showSegmentDressings,
  showColocatedSpliceLinkLine,
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
  onSegmentCalloutMouseDown,
  onNodeMouseDown,
  onNodeActivate,
  onSelectFloatingSplice,
  onActivateFloatingSplice,
  onOpenInspectorForSelection,
  onSelectWireFromConnectorPin
}: NetworkSummaryGraphLayersProps): ReactElement {
  const latest = useLatestHandlers({
    describeNode,
    onSelectSegment,
    onSegmentCalloutMouseDown,
    onNodeMouseDown,
    onNodeActivate,
    onSelectFloatingSplice,
    onActivateFloatingSplice,
    onOpenInspectorForSelection,
    onSelectWireFromConnectorPin
  });
  const lastClickRef = useRef<{ key: string; timestamp: number } | null>(null);
  const isRepeatedClick = (key: string): boolean => {
    const timestamp = Date.now();
    const isRepeated = lastClickRef.current?.key === key && timestamp - lastClickRef.current.timestamp <= DOUBLE_CLICK_INTERVAL_MS;
    lastClickRef.current = { key, timestamp };
    return isRepeated;
  };
  const renderNode = (model: RenderedNodeModel): ReactElement => (
    <GraphNodeItem
      key={model.node.id}
      {...model}
      normalizedNodeShapeScale={normalizedNodeShapeScale}
      connectorDrawingScale={connectorDrawingScale}
      useConsistentConnectorLayoutScale={useConsistentConnectorLayoutScale}
      inverseLabelScale={inverseLabelScale}
      zoomInvariantNodeShapes={zoomInvariantNodeShapes}
      describeNode={latest.describeNode}
      onNodeMouseDown={latest.onNodeMouseDown}
      onNodeActivate={latest.onNodeActivate}
      onOpenInspectorForSelection={latest.onOpenInspectorForSelection}
      onSelectWireFromConnectorPin={latest.onSelectWireFromConnectorPin}
      isRepeatedClick={isRepeatedClick}
    />
  );

  const renderSegmentCallout = ({ segment, segmentCallout }: RenderedSegmentModel): ReactElement | null => {
    if (segmentCallout === null) {
      return null;
    }
    const leaderDeltaX = (segmentCallout.targetX - segmentCallout.anchorX) / inverseLabelScale;
    const leaderDeltaY = (segmentCallout.targetY - segmentCallout.anchorY) / inverseLabelScale;
    const leaderFrameIntersection = resolveSegmentCalloutLeaderFrameIntersection(
      leaderDeltaX,
      leaderDeltaY,
      segmentCallout.width,
      segmentCallout.height
    );

    return (
      <g
        key={segmentCallout.key}
        className="network-callout-group network-segment-callout-group"
        data-segment-id={segment.id}
      >
        <g
          className="network-callout-anchor network-segment-callout-anchor"
          transform={`translate(${segmentCallout.anchorX} ${segmentCallout.anchorY}) scale(${inverseLabelScale})`}
          onMouseDown={(event) => onSegmentCalloutMouseDown(event, segmentCallout.segmentId)}
        >
          <line
            className="network-callout-leader-line network-segment-callout-leader-line"
            x1={leaderDeltaX}
            y1={leaderDeltaY}
            x2={leaderFrameIntersection.x}
            y2={leaderFrameIntersection.y}
          />
          <rect
            className="network-callout-frame network-segment-callout-frame"
            x={-segmentCallout.width / 2}
            y={-segmentCallout.height / 2}
            width={segmentCallout.width}
            height={segmentCallout.height}
            rx={5}
            ry={5}
          />
          <line
            className="network-callout-table-divider network-segment-callout-table-divider"
            x1={-segmentCallout.width / 2}
            y1={-segmentCallout.height / 2 + 9}
            x2={segmentCallout.width / 2}
            y2={-segmentCallout.height / 2 + 9}
          />
          <line
            className="network-callout-table-divider network-segment-callout-table-divider"
            x1={-segmentCallout.width / 2}
            y1={-segmentCallout.height / 2 + 18}
            x2={segmentCallout.width / 2}
            y2={-segmentCallout.height / 2 + 18}
          />
          {SEGMENT_SHEATH_CALLOUT_COLUMN_DIVIDER_OFFSETS.map((offset, index) => {
            const x = -segmentCallout.width / 2 + offset;
            return (
              <line
                key={`${segment.id}-callout-divider-${index}`}
                className="network-callout-table-divider network-segment-callout-table-divider"
                x1={x}
                y1={-segmentCallout.height / 2 + 9}
                x2={x}
                y2={segmentCallout.height / 2}
              />
            );
          })}
          <text className="network-callout-table-cell network-segment-callout-text network-segment-callout-route" x={-segmentCallout.width / 2 + 3} y={-6}>
            {segmentCallout.routeLabel}
          </text>
          {segmentCallout.headers.map((header, index) => (
            <text
              key={`${segment.id}-callout-header-${header}`}
              className="network-callout-table-header-cell network-segment-callout-text network-segment-callout-header"
              x={-segmentCallout.width / 2 + (SEGMENT_SHEATH_CALLOUT_COLUMN_TEXT_OFFSETS[index] ?? 0)}
              y={3}
            >
              {header}
            </text>
          ))}
          {segmentCallout.values.map((value, index) => (
            <text
              key={`${segment.id}-callout-value-${index}`}
              className="network-callout-table-cell network-segment-callout-text"
              x={-segmentCallout.width / 2 + (SEGMENT_SHEATH_CALLOUT_COLUMN_TEXT_OFFSETS[index] ?? 0)}
              y={12}
            >
              {value}
            </text>
          ))}
        </g>
      </g>
    );
  };

  const renderFloatingSplice = (model: RenderedFloatingSpliceModel): ReactElement => (
    <GraphFloatingSpliceItem
      key={model.splice.id}
      {...model}
      normalizedNodeShapeScale={normalizedNodeShapeScale}
      inverseLabelScale={inverseLabelScale}
      zoomInvariantNodeShapes={zoomInvariantNodeShapes}
      showColocatedSpliceLinkLine={showColocatedSpliceLinkLine}
      onSelectFloatingSplice={latest.onSelectFloatingSplice}
      onActivateFloatingSplice={latest.onActivateFloatingSplice}
      onOpenInspectorForSelection={latest.onOpenInspectorForSelection}
    />
  );

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
        {renderedSegments.map((model) => (
          <GraphSegmentItem
            key={model.segment.id}
            segment={model.segment}
            nodeAPosition={model.nodeAPosition}
            nodeBPosition={model.nodeBPosition}
            segmentClassName={model.segmentClassName}
            segmentGroupClassName={model.segmentGroupClassName}
            wireHighlightPortion={model.wireHighlightPortion}
            onSelectSegment={latest.onSelectSegment}
            onOpenInspectorForSelection={latest.onOpenInspectorForSelection}
            isRepeatedClick={isRepeatedClick}
          />
        ))}
      </g>

      <g
        className="network-graph-layer network-graph-layer-labels network-graph-layer-segment-labels"
        transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
      >
        {renderedSegments.map((model) => (
          <GraphSegmentLabelsItem
            key={`${model.segment.id}-labels`}
            segment={model.segment}
            segmentGroupClassName={model.segmentGroupClassName}
            labelX={model.labelX}
            labelY={model.labelY}
            segmentLabelRotationDegrees={model.segmentLabelRotationDegrees}
            segmentIdLabelX={model.segmentIdLabelX}
            segmentIdLabelY={model.segmentIdLabelY}
            segmentLengthLabelX={model.segmentLengthLabelX}
            segmentLengthLabelY={model.segmentLengthLabelY}
            segmentLengthSubLabels={model.segmentLengthSubLabels}
            mountingLabels={model.mountingLabels}
            showSegmentNames={showSegmentNames}
            showSegmentLengths={showSegmentLengths}
            showSegmentDressings={showSegmentDressings}
            inverseLabelScale={inverseLabelScale}
          />
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
        {renderedNodes.filter(({ connectorLayout }) => connectorLayout === undefined).map(renderNode)}
        {renderedFloatingSplices.map(renderFloatingSplice)}
      </g>

      <g
        className="network-graph-layer network-graph-layer-labels network-graph-layer-node-labels"
        transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
      >
        {renderedNodes.map((model) => {
          if (model.connectorLayout !== undefined) {
            return null;
          }

          return (
            <GraphNodeLabelItem
              key={`${model.node.id}-label`}
              node={model.node}
              position={model.position}
              nodeLabel={model.nodeLabel}
              labelOffsetY={model.labelOffsetY}
              isSubNetworkDeemphasized={model.isSubNetworkDeemphasized}
              inverseLabelScale={inverseLabelScale}
              labelRotationDegrees={labelRotationDegrees}
            />
          );
        })}
        {renderedFloatingSplices.map((model) => (
          <GraphFloatingSpliceLabelItem
            key={`${model.splice.id}-label`}
            splice={model.splice}
            position={model.position}
            nodeLabel={model.nodeLabel}
            isSubNetworkDeemphasized={model.isSubNetworkDeemphasized}
            inverseLabelScale={inverseLabelScale}
            labelRotationDegrees={labelRotationDegrees}
          />
        ))}
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

      <g
        className="network-graph-layer network-graph-layer-callouts network-graph-layer-segment-callouts"
        transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
      >
        {showSegmentDressings ? renderedSegments.map(renderSegmentCallout) : null}
      </g>
    </>
  );
}
