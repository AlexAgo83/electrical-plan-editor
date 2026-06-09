import type { Connector, ConnectorId, Network, NetworkNode, NodeId, Segment, Splice, SpliceId } from "../../core/entities";
import type { AppState, AppStore, ThemeMode } from "../../store";
import type { ConfirmDialogRequest } from "../types/confirm-dialog";
import type {
  AppLocale,
  CanvasCalloutTextSize,
  CanvasLabelRotationDegrees,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  ConnectorDrawingDisplayMode,
  NetworkCalloutContentMode,
  NodePosition,
  SortDirection,
  SortField,
  SortState,
  TableDensity,
  TableFontSize,
  WorkspaceCurrencyCode,
  WorkspacePanelsLayoutMode
} from "../types/app-controller";

export type DispatchAction = (
  action: Parameters<AppStore["dispatch"]>[0],
  options?: {
    trackHistory?: boolean;
  }
) => void;

export interface UseWorkspaceHandlersParams {
  store: AppStore;
  networks: Network[];
  newNetworkName: string;
  setNewNetworkName: (value: string) => void;
  newNetworkTechnicalId: string;
  setNewNetworkTechnicalId: (value: string) => void;
  newNetworkCreatedAtDate: string;
  setNewNetworkCreatedAtDate: (value: string) => void;
  newNetworkDescription: string;
  setNewNetworkDescription: (value: string) => void;
  newNetworkAuthor: string;
  setNewNetworkAuthor: (value: string) => void;
  newNetworkVoltageV: string;
  setNewNetworkVoltageV: (value: string) => void;
  newNetworkProjectCode: string;
  setNewNetworkProjectCode: (value: string) => void;
  newNetworkLogoUrl: string;
  setNewNetworkLogoUrl: (value: string) => void;
  newNetworkExportNotes: string;
  setNewNetworkExportNotes: (value: string) => void;
  setNetworkFormError: (value: string | null) => void;
  isCurrentWorkspaceEmpty: boolean;
  hasBuiltInSampleState: boolean;
  dispatchAction: DispatchAction;
  replaceStateWithHistory: (nextState: AppState) => void;
  nodes: NetworkNode[];
  segments: Segment[];
  networkNodePositions: Record<NodeId, NodePosition>;
  connectorMap: Map<ConnectorId, Connector>;
  spliceMap: Map<SpliceId, Splice>;
  configuredResetScale: number;
  networkViewWidth: number;
  networkViewHeight: number;
  setNetworkScale: (value: number) => void;
  setNetworkOffset: (value: NodePosition) => void;
  showCableCallouts: boolean;
  networkCalloutTextSize: CanvasCalloutTextSize;
  setShowNetworkGrid: (value: boolean | ((current: boolean) => boolean)) => void;
  setSnapNodesToGrid: (value: boolean | ((current: boolean) => boolean)) => void;
  setLockEntityMovement: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowNetworkInfoPanels: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowSegmentNames: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowSegmentLengths: (value: boolean | ((current: boolean) => boolean)) => void;
  setShowCableCallouts: (value: boolean | ((current: boolean) => boolean)) => void;
  setNetworkCalloutContentMode: (
    value: NetworkCalloutContentMode | ((current: NetworkCalloutContentMode) => NetworkCalloutContentMode)
  ) => void;
  setShowSelectedCalloutOnly: (value: boolean | ((current: boolean) => boolean)) => void;
  setNetworkLabelStrokeMode: (value: CanvasLabelStrokeMode | ((current: CanvasLabelStrokeMode) => CanvasLabelStrokeMode)) => void;
  setNetworkLabelSizeMode: (value: CanvasLabelSizeMode | ((current: CanvasLabelSizeMode) => CanvasLabelSizeMode)) => void;
  setNetworkCalloutTextSize: (value: CanvasCalloutTextSize | ((current: CanvasCalloutTextSize) => CanvasCalloutTextSize)) => void;
  setNetworkLabelRotationDegrees: (
    value: CanvasLabelRotationDegrees | ((current: CanvasLabelRotationDegrees) => CanvasLabelRotationDegrees)
  ) => void;
  setNetworkAutoSegmentLabelRotation: (value: boolean | ((current: boolean) => boolean)) => void;
  setConnectorSort: (value: SortState) => void;
  setSpliceSort: (value: SortState) => void;
  setWireSort: (value: SortState) => void;
  setConnectorSynthesisSort: (value: SortState) => void;
  setSpliceSynthesisSort: (value: SortState) => void;
  setNetworkSort: (value: SortState) => void;
  setNodeIdSortDirection: (value: SortDirection) => void;
  setSegmentIdSortDirection: (value: SortDirection) => void;
  setThemeMode: (value: ThemeMode | ((current: ThemeMode) => ThemeMode)) => void;
  setLocale: (value: AppLocale) => void;
  setTableDensity: (value: TableDensity) => void;
  setTableFontSize: (value: TableFontSize) => void;
  setWorkspaceCurrencyCode: (value: WorkspaceCurrencyCode) => void;
  setWorkspaceTaxEnabled: (value: boolean) => void;
  setWorkspaceTaxRatePercent: (value: number) => void;
  setBomTraceabilityLabelsHidden: (value: boolean) => void;
  setDefaultWireSectionMm2: (value: number) => void;
  setDefaultAutoCreateLinkedNodes: (value: boolean) => void;
  setDefaultSortField: (value: SortField) => void;
  setDefaultSortDirection: (value: SortDirection) => void;
  setDefaultIdSortDirection: (value: SortDirection) => void;
  setCanvasDefaultShowGrid: (value: boolean) => void;
  setCanvasDefaultSnapToGrid: (value: boolean) => void;
  setCanvasDefaultLockEntityMovement: (value: boolean) => void;
  setCanvasDefaultShowInfoPanels: (value: boolean) => void;
  setCanvasDefaultShowSegmentNames: (value: boolean) => void;
  setCanvasDefaultShowSegmentLengths: (value: boolean) => void;
  setCanvasDefaultShowCableCallouts: (value: boolean) => void;
  setCanvasDefaultCalloutContentMode: (value: NetworkCalloutContentMode) => void;
  setCanvasDefaultShowSelectedCalloutOnly: (value: boolean) => void;
  setCanvasDefaultLabelStrokeMode: (value: CanvasLabelStrokeMode) => void;
  setCanvasDefaultLabelSizeMode: (value: CanvasLabelSizeMode) => void;
  setCanvasDefaultCalloutTextSize: (value: CanvasCalloutTextSize) => void;
  setCanvasDefaultLabelRotationDegrees: (value: CanvasLabelRotationDegrees) => void;
  setCanvasDefaultAutoSegmentLabelRotation: (value: boolean) => void;
  setCanvasShowCalloutWireNames: (value: boolean) => void;
  setCanvasConnectorDrawingDisplayMode: (value: ConnectorDrawingDisplayMode) => void;
  setCanvasGlobalRenderScalePercent: (value: number) => void;
  setCanvasZoomInvariantNodeShapes: (value: boolean) => void;
  setCanvasNodeShapeSizePercent: (value: number) => void;
  setCanvasExportFormat: (value: "svg" | "png") => void;
  setCanvasPngExportIncludeBackground: (value: boolean) => void;
  setCanvasExportIncludeFrame: (value: boolean) => void;
  setCanvasExportIncludeCartouche: (value: boolean) => void;
  setCanvasResizeBehaviorMode: (value: "responsiveContentScale" | "visibleAreaOnly") => void;
  setCanvasResetZoomPercentInput: (value: string) => void;
  setShowShortcutHints: (value: boolean) => void;
  setKeyboardShortcutsEnabled: (value: boolean) => void;
  setRestoreViewportOnUndo: (value: boolean) => void;
  setShowFloatingInspectorPanel: (value: boolean) => void;
  setShowRoutePreviewPanel: (value: boolean) => void;
  setHideWireAnalysisRoutePanel: (value: boolean) => void;
  setShowMultiNetworkFunctionalAnalysisPanel: (value: boolean) => void;
  setWorkspacePanelsLayoutMode: (value: WorkspacePanelsLayoutMode) => void;
  setWorkspaceWideScreen: (value: boolean) => void;
  confirmAction: (request: ConfirmDialogRequest) => Promise<boolean>;
}
