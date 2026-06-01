import type { ConnectorId, ConnectorLayout, NodeId, SpliceId } from "../../../../core/entities";
import type { CanvasCalloutTextSize, NetworkCalloutContentMode, NodePosition } from "../../../types/app-controller";
import { getCanvasTextMeasurementContext } from "../../../lib/canvasTextMeasurement";
import { getConnectorLayoutShellPadding } from "../../../../core/connectorLayout";

export type CalloutTargetKey = `connector:${string}` | `splice:${string}`;

export interface CalloutEntry {
  wireId: string;
  name: string;
  technicalId: string;
  color: string;
  colorPrimaryHex: string | null;
  colorSecondaryHex: string | null;
  targetId: string;
  targetPin: string;
  lengthMm: number;
  sectionMm2: number;
}

export interface CalloutGroup {
  key: string;
  label: string;
  entries: CalloutEntry[];
}

export interface CableCalloutViewModel {
  key: CalloutTargetKey;
  kind: "connector" | "splice";
  entityId: ConnectorId | SpliceId;
  nodeId: NodeId;
  nodePosition: NodePosition;
  position: NodePosition;
  title: string;
  subtitle: string;
  connectorLayout?: ConnectorLayout;
  groups: CalloutGroup[];
  isDeemphasized: boolean;
  isSelected: boolean;
}

export interface DraggingCalloutState {
  key: CalloutTargetKey;
  kind: "connector" | "splice";
  entityId: ConnectorId | SpliceId;
  startPosition: NodePosition;
  startClientX: number;
  startClientY: number;
  hasStartedDrag: boolean;
}

export interface RenderedCableCallout {
  callout: CableCalloutViewModel;
  layout: CalloutLayoutMetrics;
  lineEnd: { x: number; y: number };
  calloutClassName: string;
  isVisibleInViewport: boolean;
}

export interface ComputeRenderedCableCalloutsOptions {
  orderedCableCallouts: CableCalloutViewModel[];
  calloutTextSize: CanvasCalloutTextSize;
  connectorDrawingScale: number;
  calloutContentMode: NetworkCalloutContentMode;
  showCalloutWireNames: boolean;
  inverseLabelScale: number;
  hoveredCalloutKey: CalloutTargetKey | null;
  draggingCalloutKey: CalloutTargetKey | null;
  visibleModelMinX: number;
  visibleModelMaxX: number;
  visibleModelMinY: number;
  visibleModelMaxY: number;
}

const CALLOUT_MIN_WIDTH = 44;
const CALLOUT_MAX_WIDTH = 520;
const CALLOUT_LAYOUT_CACHE_MAX_ENTRIES = 512;
const CALLOUT_CONNECTOR_DRAWING_FALLBACK_ASPECT_RATIO = 1.35;
const CALLOUT_CONNECTOR_DRAWING_HEIGHT = 64;
export const CALLOUT_OFFSET_SCREEN_UNITS = 92;
export const CALLOUT_COLOR_SWATCH_RADIUS = 1.35;
export const CALLOUT_COLOR_SWATCH_GAP = 0.95;
export const CALLOUT_COLOR_SWATCH_TO_TEXT_GAP = 1.5;

type CalloutTableColumnKey =
  | "pin"
  | "technicalId"
  | "color"
  | "targetId"
  | "targetPin"
  | "wireName"
  | "length"
  | "section";

export interface CalloutTableRow {
  wireId: string;
  pin: string;
  technicalId: string;
  color: string;
  colorPrimaryHex: string | null;
  colorSecondaryHex: string | null;
  targetId: string;
  targetPin: string;
  wireName: string;
  length: string;
  section: string;
}

export interface CalloutTableColumnLayout {
  key: CalloutTableColumnKey;
  header: string;
  width: number;
  x: number;
  textAnchor: "start" | "end";
}

export interface CalloutLayoutMetrics {
  width: number;
  drawingTopY: number | null;
  drawingWidth: number;
  drawingHeight: number;
  titleStartY: number;
  subtitleStartY: number | null;
  headerY: number;
  rowsStartY: number;
  rowStep: number;
  rowHeight: number;
  height: number;
  columns: CalloutTableColumnLayout[];
  rows: CalloutTableRow[];
}

let calloutMeasureCanvas: HTMLCanvasElement | null = null;
const calloutLayoutCache = new Map<string, CalloutLayoutMetrics>();

export function disposeCalloutMeasurementResources(): void {
  calloutMeasureCanvas = null;
  calloutLayoutCache.clear();
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeReadableSegmentLabelAngle(angleDegrees: number): number {
  let normalized = angleDegrees % 360;
  if (normalized > 180) {
    normalized -= 360;
  } else if (normalized <= -180) {
    normalized += 360;
  }
  if (normalized > 90) {
    normalized -= 180;
  } else if (normalized < -90) {
    normalized += 180;
  }
  return normalized;
}

export function normalizeVector(x: number, y: number): { x: number; y: number } {
  const magnitude = Math.hypot(x, y);
  if (magnitude <= 0.0001) {
    return { x: 0, y: 0 };
  }
  return { x: x / magnitude, y: y / magnitude };
}

function getCalloutRowFontSize(calloutTextSize: CanvasCalloutTextSize): number {
  switch (calloutTextSize) {
    case "small":
      return 5.5;
    case "extraLarge":
      return 7.2;
    case "large":
      return 7.2;
    case "normal":
    default:
      return 6.3;
  }
}

function getCalloutTitleFontSize(calloutTextSize: CanvasCalloutTextSize): number {
  switch (calloutTextSize) {
    case "small":
      return 8.3;
    case "extraLarge":
      return 10.9;
    case "large":
      return 10.9;
    case "normal":
    default:
      return 9.5;
  }
}

function getCalloutSubtitleFontSize(calloutTextSize: CanvasCalloutTextSize): number {
  switch (calloutTextSize) {
    case "small":
      return 6.9;
    case "extraLarge":
      return 8.7;
    case "large":
      return 8.7;
    case "normal":
    default:
      return 7.6;
  }
}

export function buildCalloutHeaderDisplay(name: string, technicalId: string): { title: string; subtitle: string } {
  const trimmedName = name.trim();
  const trimmedTechnicalId = technicalId.trim();
  if (trimmedTechnicalId.length > 0) {
    if (trimmedName.length > 0 && trimmedTechnicalId !== trimmedName) {
      return { title: `${trimmedTechnicalId} · ${trimmedName}`, subtitle: "" };
    }
    return { title: trimmedTechnicalId, subtitle: "" };
  }
  if (trimmedName.length > 0) {
    return { title: trimmedName, subtitle: "" };
  }
  return { title: "(unnamed)", subtitle: "" };
}

function buildCalloutRows(groups: CalloutGroup[]): CalloutTableRow[] {
  const rows: CalloutTableRow[] = [];
  for (const group of groups) {
    for (const entry of group.entries) {
      rows.push({
        wireId: entry.wireId,
        pin: group.label,
        technicalId: entry.technicalId.trim().length > 0 ? entry.technicalId : entry.wireId,
        color: entry.color,
        colorPrimaryHex: entry.colorPrimaryHex,
        colorSecondaryHex: entry.colorSecondaryHex,
        targetId: entry.targetId,
        targetPin: entry.targetPin,
        wireName: entry.name,
        length: `${entry.lengthMm} mm`,
        section: `${entry.sectionMm2} mm²`
      });
    }
  }
  return rows;
}

function buildCalloutLayoutCacheKey(
  title: string,
  subtitle: string,
  rows: CalloutTableRow[],
  calloutTextSize: CanvasCalloutTextSize,
  showCalloutWireNames: boolean,
  hasConnectorDrawing: boolean,
  connectorDrawingScale: number,
  connectorDrawingAspectRatio: number
): string {
  return JSON.stringify({
    calloutTextSize,
    showCalloutWireNames,
    hasConnectorDrawing,
    connectorDrawingScale,
    connectorDrawingAspectRatio,
    title,
    subtitle,
    rows
  });
}

export function getConnectorLayoutDrawingAspectRatio(layout: ConnectorLayout): number {
  const shellPadding = getConnectorLayoutShellPadding(layout);
  const viewWidth = Math.max(1, layout.width + shellPadding * 2);
  const viewHeight = Math.max(1, layout.height + shellPadding * 2);
  return viewWidth / viewHeight;
}

function measureCalloutRowTextWidth(text: string, fontSizePx: number): number {
  const fallback = text.length * fontSizePx * 0.56;
  if (typeof document === "undefined") {
    return fallback;
  }
  if (!calloutMeasureCanvas) {
    calloutMeasureCanvas = document.createElement("canvas");
  }
  const context = getCanvasTextMeasurementContext(calloutMeasureCanvas);
  if (!context) {
    return fallback;
  }
  context.font = `${fontSizePx}px "IBM Plex Sans", "Segoe UI", sans-serif`;
  return context.measureText(text).width;
}

function measureCalloutRowTextMetrics(fontSizePx: number): { topOffset: number; height: number } {
  return { topOffset: 0, height: fontSizePx };
}

export function getCalloutRowCellValue(row: CalloutTableRow, key: CalloutTableColumnKey): string {
  if (key === "pin") {
    return row.pin;
  }
  if (key === "technicalId") {
    return row.technicalId;
  }
  if (key === "color") {
    return row.color;
  }
  if (key === "targetId") {
    return row.targetId;
  }
  if (key === "targetPin") {
    return row.targetPin;
  }
  if (key === "wireName") {
    return row.wireName;
  }
  if (key === "length") {
    return row.length;
  }
  return row.section;
}

export function getCalloutColorSwatchesWidth(row: Pick<CalloutTableRow, "colorPrimaryHex" | "colorSecondaryHex">): number {
  if (row.colorPrimaryHex === null) {
    return 0;
  }
  const dotDiameter = CALLOUT_COLOR_SWATCH_RADIUS * 2;
  if (row.colorSecondaryHex === null) {
    return dotDiameter + CALLOUT_COLOR_SWATCH_TO_TEXT_GAP;
  }
  return dotDiameter * 2 + CALLOUT_COLOR_SWATCH_GAP + CALLOUT_COLOR_SWATCH_TO_TEXT_GAP;
}

export function buildCalloutLayoutMetrics(
  title: string,
  subtitle: string,
  groups: CalloutGroup[],
  calloutTextSize: CanvasCalloutTextSize,
  showCalloutWireNames: boolean,
  hasConnectorDrawing = false,
  connectorDrawingScale = 1,
  connectorDrawingAspectRatio = CALLOUT_CONNECTOR_DRAWING_FALLBACK_ASPECT_RATIO
): CalloutLayoutMetrics {
  const rows = buildCalloutRows(groups);
  const normalizedConnectorDrawingScale = clampNumber(connectorDrawingScale, 1, 2);
  const normalizedConnectorDrawingAspectRatio = clampNumber(
    connectorDrawingAspectRatio,
    0.45,
    2.25
  );
  const cacheKey = buildCalloutLayoutCacheKey(
    title,
    subtitle,
    rows,
    calloutTextSize,
    showCalloutWireNames,
    hasConnectorDrawing,
    normalizedConnectorDrawingScale,
    normalizedConnectorDrawingAspectRatio
  );
  const cached = calloutLayoutCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const columnDefinitions: Array<{
    key: CalloutTableColumnKey;
    header: string;
    textAnchor: "start" | "end";
  }> = [
    { key: "pin", header: "Pin", textAnchor: "start" },
    { key: "technicalId", header: "Wire ID", textAnchor: "start" },
    { key: "color", header: "Color", textAnchor: "start" },
    { key: "targetId", header: "Node ID", textAnchor: "start" },
    { key: "targetPin", header: "PIN", textAnchor: "start" },
    ...(showCalloutWireNames
      ? ([{ key: "wireName", header: "Wire name", textAnchor: "start" }] as const)
      : []),
    { key: "length", header: "Len", textAnchor: "end" },
    { key: "section", header: "Sec", textAnchor: "end" }
  ];

  const rowFontSize = getCalloutRowFontSize(calloutTextSize);
  const titleFontSize = getCalloutTitleFontSize(calloutTextSize);
  const subtitleFontSize = getCalloutSubtitleFontSize(calloutTextSize);
  const topPadding = 0.9;
  const bottomPadding = 2.8;
  const subtitleTopGap = subtitle.length > 0 ? 0.25 : 0;
  const subtitleBottomGap = subtitle.length > 0 ? 0.55 : 0;
  const titleBottomGap = rows.length > 0 ? 0.75 : 0;
  const tableHeaderBottomGap = rows.length > 0 ? 0.5 : 0;
  const rowGap = 0.45;
  const columnGap = 3;
  const leftPadding = 4;
  const rightPadding = 4;
  const titleTextMetrics = measureCalloutRowTextMetrics(titleFontSize);
  const titleLineHeight = titleTextMetrics.height;
  const subtitleTextMetrics = subtitle.length > 0 ? measureCalloutRowTextMetrics(subtitleFontSize) : null;
  const subtitleLineHeight = subtitleTextMetrics?.height ?? 0;
  const rowTextMetrics = measureCalloutRowTextMetrics(rowFontSize);
  const rowLineHeight = rowTextMetrics.height;
  const rowStep = rowLineHeight + rowGap;
  const measuredTitleWidth = measureCalloutRowTextWidth(title, titleFontSize);
  const measuredSubtitleWidth = subtitle.length > 0 ? measureCalloutRowTextWidth(subtitle, subtitleFontSize) : 0;
  const columns: CalloutTableColumnLayout[] = [];
  let tableWidth = 0;
  for (let columnIndex = 0; columnIndex < columnDefinitions.length; columnIndex += 1) {
    const definition = columnDefinitions[columnIndex];
    if (definition === undefined) {
      continue;
    }
    let columnWidth = measureCalloutRowTextWidth(definition.header, rowFontSize);
    for (const row of rows) {
      const cellTextWidth = measureCalloutRowTextWidth(getCalloutRowCellValue(row, definition.key), rowFontSize);
      const cellDecorationWidth = definition.key === "color" ? getCalloutColorSwatchesWidth(row) : 0;
      columnWidth = Math.max(columnWidth, cellTextWidth + cellDecorationWidth);
    }
    columns.push({
      key: definition.key,
      header: definition.header,
      width: columnWidth,
      x: tableWidth,
      textAnchor: definition.textAnchor
    });
    tableWidth += columnWidth;
    if (columnIndex < columnDefinitions.length - 1) {
      tableWidth += columnGap;
    }
  }

  const drawingHeight = hasConnectorDrawing ? CALLOUT_CONNECTOR_DRAWING_HEIGHT * normalizedConnectorDrawingScale : 0;
  const drawingWidth = hasConnectorDrawing ? drawingHeight * normalizedConnectorDrawingAspectRatio : 0;
  const drawingBottomGap = hasConnectorDrawing ? 1 : 0;
  const measuredContentWidth = Math.max(tableWidth, measuredTitleWidth, measuredSubtitleWidth, drawingWidth);
  const measuredContentHeight =
    rows.length > 0
      ? rowLineHeight + tableHeaderBottomGap + rowLineHeight + (rows.length - 1) * rowStep
      : rowLineHeight;
  const drawingTopY = hasConnectorDrawing ? topPadding : null;
  const titleStartY = topPadding + drawingHeight + drawingBottomGap - titleTextMetrics.topOffset;
  const subtitleStartY =
    subtitle.length > 0 && subtitleTextMetrics !== null
      ? titleStartY + titleLineHeight + subtitleTopGap - subtitleTextMetrics.topOffset
      : null;
  const headerBottomY =
    subtitleStartY === null
      ? titleStartY + titleLineHeight
      : subtitleStartY + subtitleLineHeight + subtitleBottomGap;
  const headerY = headerBottomY + titleBottomGap - rowTextMetrics.topOffset;
  const rowsStartY = headerY + rowLineHeight + tableHeaderBottomGap;

  const width = clampNumber(Math.ceil(measuredContentWidth + leftPadding + rightPadding), CALLOUT_MIN_WIDTH, CALLOUT_MAX_WIDTH);
  const headerHeight =
    titleLineHeight + (subtitleStartY === null ? 0 : subtitleTopGap + subtitleLineHeight + subtitleBottomGap);
  const height = Math.max(0, topPadding + drawingHeight + drawingBottomGap + headerHeight + titleBottomGap + measuredContentHeight + bottomPadding);
  const layout = {
    width,
    drawingTopY,
    drawingWidth,
    drawingHeight,
    titleStartY,
    subtitleStartY,
    headerY,
    rowsStartY,
    rowStep,
    rowHeight: rowLineHeight,
    height,
    columns,
    rows
  } satisfies CalloutLayoutMetrics;
  if (calloutLayoutCache.size >= CALLOUT_LAYOUT_CACHE_MAX_ENTRIES) {
    calloutLayoutCache.clear();
  }
  calloutLayoutCache.set(cacheKey, layout);
  return layout;
}

export function getCalloutFrameEdgePoint(
  nodePosition: NodePosition,
  calloutPosition: NodePosition,
  width: number,
  height: number,
  inverseScale: number
): NodePosition {
  const dx = calloutPosition.x - nodePosition.x;
  const dy = calloutPosition.y - nodePosition.y;
  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
    return calloutPosition;
  }

  const halfWidth = (width / 2) * inverseScale;
  const halfHeight = (height / 2) * inverseScale;
  const scaleX = Math.abs(dx) < 0.0001 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(dx);
  const scaleY = Math.abs(dy) < 0.0001 ? Number.POSITIVE_INFINITY : halfHeight / Math.abs(dy);
  const t = Math.min(scaleX, scaleY);

  return {
    x: calloutPosition.x - dx * t,
    y: calloutPosition.y - dy * t
  };
}

export function computeRenderedCableCallouts(options: ComputeRenderedCableCalloutsOptions): RenderedCableCallout[] {
  return options.orderedCableCallouts.map((callout) => {
    const layout = buildCalloutLayoutMetrics(
      callout.title,
      "",
      callout.groups,
      options.calloutTextSize,
      options.showCalloutWireNames,
      callout.connectorLayout !== undefined,
      options.connectorDrawingScale,
      callout.connectorLayout === undefined
        ? CALLOUT_CONNECTOR_DRAWING_FALLBACK_ASPECT_RATIO
        : getConnectorLayoutDrawingAspectRatio(callout.connectorLayout)
    );
    const halfWidthInModelUnits = (layout.width / 2) * options.inverseLabelScale;
    const halfHeightInModelUnits = (layout.height / 2) * options.inverseLabelScale;
    const isVisibleInViewport = !(
      callout.position.x + halfWidthInModelUnits < options.visibleModelMinX ||
      callout.position.x - halfWidthInModelUnits > options.visibleModelMaxX ||
      callout.position.y + halfHeightInModelUnits < options.visibleModelMinY ||
      callout.position.y - halfHeightInModelUnits > options.visibleModelMaxY
    );
    const lineEnd = getCalloutFrameEdgePoint(
      callout.nodePosition,
      callout.position,
      layout.width,
      layout.height,
      options.inverseLabelScale
    );
    const calloutClassName = `network-callout-group${callout.isDeemphasized ? " is-deemphasized" : ""}${
      callout.isSelected ? " is-selected" : ""
    }${options.hoveredCalloutKey === callout.key ? " is-hovered" : ""}${
      options.draggingCalloutKey === callout.key ? " is-dragging" : ""
    }`;

    return {
      callout,
      layout,
      lineEnd,
      calloutClassName,
      isVisibleInViewport
    };
  });
}
