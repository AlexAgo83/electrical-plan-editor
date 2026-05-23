import type { MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent } from "react";
import type {
  CatalogItem,
  Connector,
  ConnectorId,
  Network,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire
} from "../../../core/entities";
import type { ShortestRouteResult } from "../../../core/pathfinding";
import type { SubNetworkSummary } from "../../../store";
import type {
  CanvasCalloutTextSize,
  CanvasExportFormat,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  CanvasResizeBehaviorMode,
  ConnectorDrawingDisplayMode,
  NetworkCalloutContentMode,
  NodePosition,
  SubScreenId
} from "../../types/app-controller";

export interface NetworkSummaryPanelProps {
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  fitNetworkToContent: () => void;
  showNetworkInfoPanels: boolean;
  showSegmentNames: boolean;
  showSegmentLengths: boolean;
  showCableCallouts: boolean;
  calloutContentMode: NetworkCalloutContentMode;
  showSelectedCalloutOnly: boolean;
  showCalloutWireNames: boolean;
  connectorDrawingDisplayMode: ConnectorDrawingDisplayMode;
  connectorDrawingScalePercent: number;
  zoomInvariantNodeShapes: boolean;
  nodeShapeSizePercent: number;
  resizeBehaviorMode: CanvasResizeBehaviorMode;
  labelStrokeMode: CanvasLabelStrokeMode;
  labelSizeMode: CanvasLabelSizeMode;
  calloutTextSize: CanvasCalloutTextSize;
  labelRotationDegrees: CanvasLabelRotationDegrees;
  autoSegmentLabelRotation: boolean;
  canvasExportFormat: CanvasExportFormat;
  exportIncludeFrame: boolean;
  exportIncludeCartouche: boolean;
  exportCartoucheNetworkName: string;
  exportCartoucheAuthor?: string;
  exportCartoucheProjectCode?: string;
  exportCartoucheCreatedAt: string;
  exportCartoucheLogoUrl?: string;
  exportCartoucheNotes?: string;
  showFloatingInspectorPanel: boolean;
  showNetworkGrid: boolean;
  snapNodesToGrid: boolean;
  lockEntityMovement: boolean;
  toggleShowNetworkInfoPanels: () => void;
  toggleShowSegmentLengths: () => void;
  toggleShowCableCallouts: () => void;
  toggleShowFloatingInspectorPanel: () => void;
  toggleShowNetworkGrid: () => void;
  toggleSnapNodesToGrid: () => void;
  toggleLockEntityMovement: () => void;
  networkScalePercent: number;
  routingGraphNodeCount: number;
  routingGraphSegmentCount: number;
  totalEdgeEntries: number;
  nodes: NetworkNode[];
  segments: Segment[];
  splicePlacementPreview?: {
    spliceNodeId: NodeId;
    segments: Record<SegmentId, Segment>;
    removedSegmentIds: SegmentId[];
    spliceNodePosition: NodePosition | null;
  } | null;
  wires: Wire[];
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
  selectedWireId: Wire["id"] | null;
  handleNetworkSegmentClick: (segmentId: SegmentId) => void;
  selectedCanvasNodeIds: ReadonlySet<NodeId>;
  clearSelectedCanvasNodes: () => void;
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
  showRoutePreviewPanel: boolean;
  quickEntityNavigationMode: "modeling" | "analysis";
  activeSubScreen: SubScreenId;
  entityCountBySubScreen: Record<SubScreenId, number>;
  onQuickEntityNavigation: (subScreen: SubScreenId) => void;
  onSelectConnectorFromCallout: (connectorId: ConnectorId) => void;
  onSelectSpliceFromCallout: (spliceId: SpliceId) => void;
  onSelectWireFromConnectorPin: (wireId: Wire["id"]) => void;
  onPersistConnectorCalloutPosition: (connectorId: ConnectorId, position: NodePosition) => void;
  onPersistSpliceCalloutPosition: (spliceId: SpliceId, position: NodePosition) => void;
  onViewportSizeChange?: (size: { width: number; height: number }) => void;
  pngExportIncludeBackground: boolean;
  canExportBomCsv: boolean;
  onExportBomCsv: () => void;
  onRegenerateLayout: () => void;
  onOpenCurrentNetworkFunctional?: () => void;
  activeNetwork: Network | null;
  catalogItems: CatalogItem[];
  showFunctionalSchematic?: boolean;
}
