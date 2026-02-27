import type { ConnectorId, NetworkId, NodeId, SpliceId, WireId } from "../../core/entities";
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

export type SubScreenId = "catalog" | "connector" | "splice" | "node" | "segment" | "wire";
// Product-supported canvas interaction modes (legacy addSegment/connect/route flows removed from UI).
export type InteractionMode = "select" | "addNode";
export type TableDensity = "comfortable" | "compact";
export type TableFontSize = "small" | "normal" | "large";
export type WorkspaceCurrencyCode = "EUR" | "USD" | "GBP" | "CAD" | "CHF";
export type WorkspacePanelsLayoutMode = "multiColumn" | "singleColumn";
export type CanvasLabelStrokeMode = "none" | "light" | "normal";
export type CanvasLabelSizeMode = "extraSmall" | "small" | "normal" | "large" | "extraLarge";
export type CanvasCalloutTextSize = "small" | "normal" | "large";
export type CanvasLabelRotationDegrees = -90 | -45 | -20 | 0 | 20 | 45 | 90;
export type OccupancyFilter = "all" | "occupied" | "free";
export type SegmentSubNetworkFilter = "all" | "default" | "tagged";
export type ValidationSeverityFilter = "all" | "error" | "warning";

export type UndoHistoryTargetKind = "network" | "catalog" | "connector" | "splice" | "node" | "segment" | "wire" | "layout" | "workspace";

export interface UndoHistoryEntry {
  sequence: number;
  actionType: string;
  targetKind: UndoHistoryTargetKind;
  targetId: string | null;
  networkId: NetworkId | null;
  label: string;
  timestampIso: string;
}

export interface ValidationIssue {
  id: string;
  severity: "error" | "warning";
  category: string;
  message: string;
  subScreen: SubScreenId;
  selectionKind: "catalog" | "connector" | "splice" | "node" | "segment" | "wire";
  selectionId: string;
}

export interface SelectionTarget {
  kind: Exclude<ValidationIssue["selectionKind"], "catalog">;
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
