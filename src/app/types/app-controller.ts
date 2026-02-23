import type { ConnectorId, NodeId, SpliceId, WireId } from "../../core/entities";
import type { AppStore } from "../../store";

export interface AppProps {
  store?: AppStore;
}

export interface NodePosition {
  x: number;
  y: number;
}

export type SortField = "name" | "technicalId" | "lengthMm";
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
// Product-supported canvas interaction modes (legacy addSegment/connect/route flows removed from UI).
export type InteractionMode = "select" | "addNode";
export type TableDensity = "comfortable" | "compact";
export type TableFontSize = "small" | "normal" | "large";
export type WorkspacePanelsLayoutMode = "multiColumn" | "singleColumn";
export type CanvasLabelStrokeMode = "none" | "light" | "normal";
export type CanvasLabelSizeMode = "extraSmall" | "small" | "normal" | "large" | "extraLarge";
export type CanvasCalloutTextSize = "small" | "normal" | "large";
export type CanvasLabelRotationDegrees = -90 | -45 | -20 | 0 | 20 | 45 | 90;
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
