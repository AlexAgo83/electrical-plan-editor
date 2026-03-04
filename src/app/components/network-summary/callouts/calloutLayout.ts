import type { ConnectorId, NodeId, SpliceId } from "../../../../core/entities";
import type { CanvasCalloutTextSize, NodePosition } from "../../../types/app-controller";

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
  groups: CalloutGroup[];
  isDeemphasized: boolean;
  isSelected: boolean;
}

export interface DraggingCalloutState {
  key: CalloutTargetKey;
  kind: "connector" | "splice";
  entityId: ConnectorId | SpliceId;
  startPosition: NodePosition;
}

const CALLOUT_MIN_WIDTH = 44;
const CALLOUT_MAX_WIDTH = 520;
const CALLOUT_LAYOUT_CACHE_MAX_ENTRIES = 512;
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

interface CalloutTableRow {
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

interface CalloutTableColumnLayout {
  key: CalloutTableColumnKey;
  header: string;
  width: number;
  x: number;
  textAnchor: "start" | "end";
}

interface CalloutLayoutMetrics {
  width: number;
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
let calloutMeasureSvgText: SVGTextElement | null = null;
let calloutMeasureSvgRoot: SVGSVGElement | null = null;
const calloutLayoutCache = new Map<string, CalloutLayoutMetrics>();

export function disposeCalloutMeasurementResources(): void {
  if (calloutMeasureSvgRoot !== null) {
    calloutMeasureSvgRoot.remove();
  }
  calloutMeasureSvgText = null;
  calloutMeasureSvgRoot = null;
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
  showCalloutWireNames: boolean
): string {
  return JSON.stringify({
    calloutTextSize,
    showCalloutWireNames,
    title,
    subtitle,
    rows
  });
}

function measureCalloutRowTextWidth(text: string, fontSizePx: number): number {
  const fallback = text.length * fontSizePx * 0.56;
  if (typeof document === "undefined") {
    return fallback;
  }
  if (!calloutMeasureSvgText || !calloutMeasureSvgRoot) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("data-callout-measure-root", "true");
    svg.style.position = "absolute";
    svg.style.left = "-9999px";
    svg.style.top = "-9999px";
    svg.style.pointerEvents = "none";
    svg.style.opacity = "0";
    const textNode = document.createElementNS(ns, "text");
    svg.appendChild(textNode);
    document.body.appendChild(svg);
    calloutMeasureSvgRoot = svg;
    calloutMeasureSvgText = textNode;
  }
  if (calloutMeasureSvgText) {
    calloutMeasureSvgText.textContent = text;
    calloutMeasureSvgText.setAttribute("font-size", String(fontSizePx));
    calloutMeasureSvgText.setAttribute("font-family", '"IBM Plex Sans", "Segoe UI", sans-serif');
    calloutMeasureSvgText.setAttribute("font-weight", "400");
    try {
      const measured = calloutMeasureSvgText.getComputedTextLength();
      if (Number.isFinite(measured) && measured > 0) {
        return measured;
      }
    } catch {
      // Fall through to canvas/fallback.
    }
  }
  if (!calloutMeasureCanvas) {
    calloutMeasureCanvas = document.createElement("canvas");
  }
  let context: CanvasRenderingContext2D | null = null;
  try {
    context = calloutMeasureCanvas.getContext("2d");
  } catch {
    return fallback;
  }
  if (!context) {
    return fallback;
  }
  context.font = `${fontSizePx}px "IBM Plex Sans", "Segoe UI", sans-serif`;
  return context.measureText(text).width;
}

function measureCalloutRowTextMetrics(fontSizePx: number): { topOffset: number; height: number } {
  const fallback = { topOffset: 0, height: fontSizePx };
  if (typeof document === "undefined") {
    return fallback;
  }
  if (!calloutMeasureSvgText || !calloutMeasureSvgRoot) {
    measureCalloutRowTextWidth("Ag", fontSizePx);
  }
  if (!calloutMeasureSvgText) {
    return fallback;
  }
  calloutMeasureSvgText.textContent = "Ag";
  calloutMeasureSvgText.setAttribute("x", "0");
  calloutMeasureSvgText.setAttribute("y", "0");
  calloutMeasureSvgText.setAttribute("font-size", String(fontSizePx));
  calloutMeasureSvgText.setAttribute("font-family", '"IBM Plex Sans", "Segoe UI", sans-serif');
  calloutMeasureSvgText.setAttribute("font-weight", "400");
  calloutMeasureSvgText.setAttribute("dominant-baseline", "hanging");
  try {
    const bbox = calloutMeasureSvgText.getBBox();
    if (Number.isFinite(bbox.height) && bbox.height > 0) {
      return { topOffset: bbox.y, height: bbox.height };
    }
  } catch {
    return fallback;
  }
  return fallback;
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
  showCalloutWireNames: boolean
): CalloutLayoutMetrics {
  const rows = buildCalloutRows(groups);
  const cacheKey = buildCalloutLayoutCacheKey(title, subtitle, rows, calloutTextSize, showCalloutWireNames);
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

  const measuredContentWidth = Math.max(tableWidth, measuredTitleWidth, measuredSubtitleWidth);
  const measuredContentHeight =
    rows.length > 0
      ? rowLineHeight + tableHeaderBottomGap + rowLineHeight + (rows.length - 1) * rowStep
      : rowLineHeight;
  const titleStartY = topPadding - titleTextMetrics.topOffset;
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
  const height = Math.max(0, topPadding + headerHeight + titleBottomGap + measuredContentHeight + bottomPadding);
  const layout = {
    width,
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
