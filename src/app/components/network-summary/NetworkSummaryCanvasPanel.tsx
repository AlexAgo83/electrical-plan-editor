import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  RefObject,
  WheelEvent as ReactWheelEvent
} from "react";
import type { NetworkNode, NodeId, SegmentId, SpliceId, Wire } from "../../../core/entities";
import type { CanvasCalloutTextSize, CanvasLabelSizeMode, CanvasLabelStrokeMode, NodePosition } from "../../types/app-controller";
import { NetworkSummaryCalloutLeaders, NetworkSummaryCalloutsLayer } from "./callouts/NetworkSummaryCalloutsLayer";
import type { CableCalloutViewModel, CalloutTargetKey, RenderedCableCallout } from "./callouts/calloutLayout";
import {
  NetworkSummaryGraphLayers,
  type SplicePlacementPreviewNodeModel,
  type SplicePlacementPreviewSegmentModel
} from "./graph/NetworkSummaryGraphLayers";
import type {
  RenderedFloatingSpliceModel,
  RenderedNodeModel,
  RenderedSegmentModel
} from "./graph/networkSummaryGraphModel";
import { NetworkCanvasFloatingInfoPanels } from "./NetworkCanvasFloatingInfoPanels";
import { NetworkSummaryLegend } from "./NetworkSummaryLegend";
import type { SubNetworkSummary } from "../../../store";

interface NetworkSummaryCanvasPanelProps {
  nodes: NetworkNode[];
  networkCanvasShellRef: RefObject<HTMLDivElement | null>;
  networkSvgRef: RefObject<SVGSVGElement | null>;
  isPanningNetwork: boolean;
  showNetworkInfoPanels: boolean;
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  fitNetworkToContent: () => void;
  globalRenderScalePercent: number;
  setGlobalRenderScalePercent: (value: number) => void;
  selectedCanvasNodeCount: number;
  clearSelectedCanvasNodes: () => void;
  subNetworkSummaries: SubNetworkSummary[];
  activeSubNetworkTags: ReadonlySet<string>;
  toggleSubNetworkTag: (tag: string) => void;
  enableAllSubNetworkTags: () => void;
  graphStats: Array<{ label: string; value: number }>;
  useStrokeInvariantLines: boolean;
  labelStrokeMode: CanvasLabelStrokeMode;
  labelSizeMode: CanvasLabelSizeMode;
  calloutTextSize: CanvasCalloutTextSize;
  networkViewWidth: number;
  networkViewHeight: number;
  networkSvgStrokeVariables: CSSProperties;
  handleNetworkCanvasMouseDown: (event: ReactMouseEvent<SVGSVGElement>) => void;
  handleNetworkCanvasClick: (event: ReactMouseEvent<SVGSVGElement>) => void;
  handleNetworkWheel: (event: ReactWheelEvent<SVGSVGElement>) => void;
  handleCanvasMouseMoveWithCallouts: (event: ReactMouseEvent<SVGSVGElement>) => void;
  stopNetworkInteractions: () => void;
  networkOffset: NodePosition;
  networkScale: number;
  showNetworkGrid: boolean;
  gridXPositions: number[];
  gridYPositions: number[];
  visibleModelMinX: number;
  visibleModelMaxX: number;
  visibleModelMinY: number;
  visibleModelMaxY: number;
  renderedCableCallouts: RenderedCableCallout[];
  renderedSegments: RenderedSegmentModel[];
  splicePlacementPreviewSegments: SplicePlacementPreviewSegmentModel[];
  splicePlacementPreviewNode: SplicePlacementPreviewNodeModel | null;
  renderedFloatingSplices: RenderedFloatingSpliceModel[];
  renderedNodes: RenderedNodeModel[];
  showSegmentNames: boolean;
  showSegmentLengths: boolean;
  showSegmentDressings: boolean;
  inverseLabelScale: number;
  labelRotationDegrees: number;
  zoomInvariantNodeShapes: boolean;
  normalizedNodeShapeScale: number;
  normalizedConnectorNodeDrawingScale: number;
  useConsistentConnectorLayoutScale: boolean;
  nodeStrokeWidth: number;
  nodeStrokeEmphasisWidth: number;
  describeNode: (node: NetworkNode) => string;
  handleNetworkSegmentClick: (segmentId: SegmentId) => void;
  handleSegmentCalloutMouseDown: (event: ReactMouseEvent<SVGGElement>, segmentId: SegmentId) => void;
  handleNetworkNodeMouseDown: (event: ReactMouseEvent<SVGGElement>, nodeId: NodeId) => void;
  handleNetworkNodeActivate: (nodeId: NodeId) => void;
  openInspectorForCanvasSelection: () => void;
  selectedWireId: Wire["id"] | null;
  setHoveredCalloutKey: (key: CalloutTargetKey | null) => void;
  handleCalloutMouseDown: (
    event: ReactMouseEvent<SVGGElement>,
    callout: Pick<CableCalloutViewModel, "key" | "kind" | "entityId" | "position">
  ) => void;
  onSelectConnectorFromCallout: Parameters<typeof NetworkSummaryCalloutsLayer>[0]["onSelectConnectorFromCallout"];
  onSelectSpliceFromCallout: Parameters<typeof NetworkSummaryCalloutsLayer>[0]["onSelectSpliceFromCallout"];
  onActivateFloatingSplice: (spliceId: SpliceId) => void;
  onSelectWireFromConnectorPin: Parameters<typeof NetworkSummaryCalloutsLayer>[0]["onSelectWireFromConnectorPin"];
}

export function NetworkSummaryCanvasPanel({
  nodes,
  networkCanvasShellRef,
  networkSvgRef,
  isPanningNetwork,
  showNetworkInfoPanels,
  handleZoomAction,
  fitNetworkToContent,
  globalRenderScalePercent,
  setGlobalRenderScalePercent,
  selectedCanvasNodeCount,
  clearSelectedCanvasNodes,
  subNetworkSummaries,
  activeSubNetworkTags,
  toggleSubNetworkTag,
  enableAllSubNetworkTags,
  graphStats,
  useStrokeInvariantLines,
  labelStrokeMode,
  labelSizeMode,
  calloutTextSize,
  networkViewWidth,
  networkViewHeight,
  networkSvgStrokeVariables,
  handleNetworkCanvasMouseDown,
  handleNetworkCanvasClick,
  handleNetworkWheel,
  handleCanvasMouseMoveWithCallouts,
  stopNetworkInteractions,
  networkOffset,
  networkScale,
  showNetworkGrid,
  gridXPositions,
  gridYPositions,
  visibleModelMinX,
  visibleModelMaxX,
  visibleModelMinY,
  visibleModelMaxY,
  renderedCableCallouts,
  renderedSegments,
  splicePlacementPreviewSegments,
  splicePlacementPreviewNode,
  renderedFloatingSplices,
  renderedNodes,
  showSegmentNames,
  showSegmentLengths,
  showSegmentDressings,
  inverseLabelScale,
  labelRotationDegrees,
  zoomInvariantNodeShapes,
  normalizedNodeShapeScale,
  normalizedConnectorNodeDrawingScale,
  useConsistentConnectorLayoutScale,
  nodeStrokeWidth,
  nodeStrokeEmphasisWidth,
  describeNode,
  handleNetworkSegmentClick,
  handleSegmentCalloutMouseDown,
  handleNetworkNodeMouseDown,
  handleNetworkNodeActivate,
  openInspectorForCanvasSelection,
  selectedWireId,
  setHoveredCalloutKey,
  handleCalloutMouseDown,
  onSelectConnectorFromCallout,
  onSelectSpliceFromCallout,
  onActivateFloatingSplice,
  onSelectWireFromConnectorPin
}: NetworkSummaryCanvasPanelProps): ReactElement {
  return (
    <>
      <div className="network-summary-canvas-region">
        {nodes.length === 0 ? (
          <p className="empty-copy">No nodes yet. Create nodes and segments to render the 2D network.</p>
        ) : (
          <div ref={networkCanvasShellRef} className={`network-canvas-shell${isPanningNetwork ? " is-panning" : ""}`}>
            <NetworkCanvasFloatingInfoPanels
              showNetworkInfoPanels={showNetworkInfoPanels}
              handleZoomAction={handleZoomAction}
              fitNetworkToContent={fitNetworkToContent}
              globalRenderScalePercent={globalRenderScalePercent}
              setGlobalRenderScalePercent={setGlobalRenderScalePercent}
              selectedCanvasNodeCount={selectedCanvasNodeCount}
              clearSelectedCanvasNodes={clearSelectedCanvasNodes}
              subNetworkSummaries={subNetworkSummaries}
              activeSubNetworkTags={activeSubNetworkTags}
              toggleSubNetworkTag={toggleSubNetworkTag}
              enableAllSubNetworkTags={enableAllSubNetworkTags}
              graphStats={graphStats}
            />
            <svg
              ref={networkSvgRef}
              className={`network-svg${useStrokeInvariantLines ? " network-svg--stroke-invariant" : ""} network-canvas--label-stroke-${labelStrokeMode} network-canvas--label-size-${labelSizeMode} network-callout-text-size-${calloutTextSize}`}
              aria-label="2D network diagram"
              viewBox={`0 0 ${networkViewWidth} ${networkViewHeight}`}
              style={networkSvgStrokeVariables}
              onMouseDown={handleNetworkCanvasMouseDown}
              onClick={handleNetworkCanvasClick}
              onWheel={handleNetworkWheel}
              onMouseMove={handleCanvasMouseMoveWithCallouts}
              onMouseUp={stopNetworkInteractions}
              onMouseLeave={stopNetworkInteractions}
            >
              <NetworkSummaryGraphLayers
                networkOffset={networkOffset}
                networkScale={networkScale}
                showNetworkGrid={showNetworkGrid}
                gridXPositions={gridXPositions}
                gridYPositions={gridYPositions}
                visibleModelMinX={visibleModelMinX}
                visibleModelMaxX={visibleModelMaxX}
                visibleModelMinY={visibleModelMinY}
                visibleModelMaxY={visibleModelMaxY}
                afterGridLayer={
                  <NetworkSummaryCalloutLeaders
                    renderedCableCallouts={renderedCableCallouts}
                    networkOffset={networkOffset}
                    networkScale={networkScale}
                  />
                }
                renderedSegments={renderedSegments}
                splicePlacementPreviewSegments={splicePlacementPreviewSegments}
                splicePlacementPreviewNode={splicePlacementPreviewNode}
                renderedFloatingSplices={renderedFloatingSplices}
                renderedNodes={renderedNodes}
                showSegmentNames={showSegmentNames}
                showSegmentLengths={showSegmentLengths}
                showSegmentDressings={showSegmentDressings}
                inverseLabelScale={inverseLabelScale}
                labelRotationDegrees={labelRotationDegrees}
                zoomInvariantNodeShapes={zoomInvariantNodeShapes}
                normalizedNodeShapeScale={normalizedNodeShapeScale}
                connectorDrawingScale={normalizedConnectorNodeDrawingScale}
                useConsistentConnectorLayoutScale={useConsistentConnectorLayoutScale}
                nodeStrokeWidth={nodeStrokeWidth}
                nodeStrokeEmphasisWidth={nodeStrokeEmphasisWidth}
                describeNode={describeNode}
                onSelectSegment={handleNetworkSegmentClick}
                onSegmentCalloutMouseDown={handleSegmentCalloutMouseDown}
                onNodeMouseDown={handleNetworkNodeMouseDown}
                onNodeActivate={handleNetworkNodeActivate}
                onSelectFloatingSplice={onSelectSpliceFromCallout}
                onActivateFloatingSplice={onActivateFloatingSplice}
                onOpenInspectorForSelection={openInspectorForCanvasSelection}
                onSelectWireFromConnectorPin={onSelectWireFromConnectorPin}
              />
              <NetworkSummaryCalloutsLayer
                renderedCableCallouts={renderedCableCallouts}
                inverseLabelScale={inverseLabelScale}
                selectedWireId={selectedWireId}
                onHoverCallout={setHoveredCalloutKey}
                onCalloutMouseDown={handleCalloutMouseDown}
                onSelectConnectorFromCallout={onSelectConnectorFromCallout}
                onSelectSpliceFromCallout={onSelectSpliceFromCallout}
                onSelectWireFromConnectorPin={onSelectWireFromConnectorPin}
                onOpenInspectorForSelection={openInspectorForCanvasSelection}
                networkOffset={networkOffset}
                networkScale={networkScale}
              />
            </svg>
          </div>
        )}
      </div>
      <p className="empty-copy network-summary-mobile-unavailable" role="status">
        2D network summary is not available on mobile. Use a wider screen to access the canvas controls and legend.
      </p>
      <NetworkSummaryLegend />
    </>
  );
}
