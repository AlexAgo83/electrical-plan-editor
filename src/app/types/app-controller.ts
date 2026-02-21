import type { ConnectorId, NodeId, SpliceId, WireId } from "../../core/entities";
import type { AppStore } from "../../store";

export interface AppProps {
  store?: AppStore;
}

export interface NodePosition {
  x: number;
  y: number;
}

export type SortField = "name" | "technicalId";
export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface ConnectorSynthesisRow {
  wireId: WireId;
  wireName: string;
  wireTechnicalId: string;
  localEndpointLabel: string;
  remoteEndpointLabel: string;
  lengthMm: number;
}

export interface SpliceSynthesisRow {
  wireId: WireId;
  wireName: string;
  wireTechnicalId: string;
  localEndpointLabel: string;
  remoteEndpointLabel: string;
  lengthMm: number;
}

export type SubScreenId = "connector" | "splice" | "node" | "segment" | "wire";
export type InteractionMode = "select" | "addNode" | "addSegment" | "connect" | "route";
export type TableDensity = "comfortable" | "compact";
export type TableFontSize = "small" | "normal" | "large";
export type CanvasLabelStrokeMode = "none" | "light" | "normal";
export type OccupancyFilter = "all" | "occupied" | "free";
export type SegmentSubNetworkFilter = "all" | "default" | "tagged";
export type ValidationSeverityFilter = "all" | "error" | "warning";

export interface ValidationIssue {
  id: string;
  severity: "error" | "warning";
  category: string;
  message: string;
  subScreen: SubScreenId;
  selectionKind: "connector" | "splice" | "node" | "segment" | "wire";
  selectionId: string;
}

export interface SelectionTarget {
  kind: ValidationIssue["selectionKind"];
  id: string;
}

export interface ImportExportStatus {
  kind: "success" | "partial" | "failed";
  message: string;
}

export type EndpointNodeMapContext = {
  connectorNodeByConnectorId: Map<ConnectorId, NodeId>;
  spliceNodeBySpliceId: Map<SpliceId, NodeId>;
};
