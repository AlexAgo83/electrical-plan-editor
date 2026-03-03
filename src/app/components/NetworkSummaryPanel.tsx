import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type WheelEvent as ReactWheelEvent
} from "react";
import type {
  Connector,
  ConnectorId,
  NetworkNode,
  NodeId,
  Segment,
  SegmentId,
  Splice,
  SpliceId,
  Wire
} from "../../core/entities";
import { CABLE_COLOR_BY_ID, getWireColorCode } from "../../core/cableColors";
import {
  formatIsoToLocalDateInput,
  isNetworkLogoUrlValid,
  normalizeNetworkLogoUrl
} from "../../core/networkMetadata";
import type { ShortestRouteResult } from "../../core/pathfinding";
import type { SubNetworkSummary } from "../../store";
import type {
  CanvasCalloutTextSize,
  CanvasExportFormat,
  CanvasLabelRotationDegrees,
  CanvasResizeBehaviorMode,
  CanvasLabelSizeMode,
  CanvasLabelStrokeMode,
  SubScreenId
} from "../types/app-controller";
import { NetworkCanvasFloatingInfoPanels } from "./network-summary/NetworkCanvasFloatingInfoPanels";
import { NetworkRoutePreviewPanel } from "./network-summary/NetworkRoutePreviewPanel";
import { NetworkSummaryLegend } from "./network-summary/NetworkSummaryLegend";
import { snapToGrid } from "../lib/app-utils-shared";
import { resolveSplicePortMode } from "../../core/splicePortMode";

export interface NodePosition {
  x: number;
  y: number;
}

const SVG_EXPORT_STYLE_PROPERTIES = [
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-opacity",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "vector-effect",
  "opacity",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "letter-spacing",
  "text-anchor",
  "dominant-baseline",
  "paint-order",
  "display",
  "visibility"
] as const;

function copyComputedStylesToSvgClone(sourceSvg: SVGSVGElement, cloneSvg: SVGSVGElement): void {
  const sourceElements = [sourceSvg, ...Array.from(sourceSvg.querySelectorAll("*"))] as SVGElement[];
  const cloneElements = [cloneSvg, ...Array.from(cloneSvg.querySelectorAll("*"))] as SVGElement[];
  const pairCount = Math.min(sourceElements.length, cloneElements.length);

  for (let index = 0; index < pairCount; index += 1) {
    const sourceElement = sourceElements[index];
    const cloneElement = cloneElements[index];
    if (sourceElement === undefined || cloneElement === undefined) {
      continue;
    }
    const computedStyle = window.getComputedStyle(sourceElement);
    const inlineStyle = cloneElement.style;

    for (const propertyName of SVG_EXPORT_STYLE_PROPERTIES) {
      const propertyValue = computedStyle.getPropertyValue(propertyName);
      if (propertyValue.length > 0) {
        inlineStyle.setProperty(propertyName, propertyValue);
      }
    }
  }
}

function resolveCanvasExportBackgroundFill(shellElement: HTMLElement | null): string | null {
  if (shellElement === null || typeof window === "undefined") {
    return null;
  }

  const style = window.getComputedStyle(shellElement);
  const backgroundColor = style.backgroundColor.trim();
  if (backgroundColor.length > 0 && backgroundColor !== "rgba(0, 0, 0, 0)" && backgroundColor !== "transparent") {
    return backgroundColor;
  }

  const backgroundImage = style.backgroundImage;
  if (!backgroundImage.includes("gradient")) {
    return null;
  }

  const colorMatch = backgroundImage.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})/);
  return colorMatch?.[1] ?? null;
}

type ExportLogoAsset = { kind: "image"; href: string } | { kind: "fallback" };

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to read blob as data URL."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read blob as data URL."));
    reader.readAsDataURL(blob);
  });
}

async function resolveExportLogoAsset(logoUrl: string | undefined): Promise<ExportLogoAsset> {
  const normalizedLogoUrl = normalizeNetworkLogoUrl(logoUrl);
  if (normalizedLogoUrl === undefined || !isNetworkLogoUrlValid(normalizedLogoUrl)) {
    return { kind: "fallback" };
  }

  if (normalizedLogoUrl.toLowerCase().startsWith("data:image/")) {
    return { kind: "image", href: normalizedLogoUrl };
  }

  try {
    const response = await fetch(normalizedLogoUrl, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "no-store"
    });
    if (!response.ok) {
      return { kind: "fallback" };
    }
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) {
      return { kind: "fallback" };
    }
    const dataUrl = await readBlobAsDataUrl(blob);
    return { kind: "image", href: dataUrl };
  } catch {
    return { kind: "fallback" };
  }
}

function createSvgElement<K extends keyof SVGElementTagNameMap>(tagName: K): SVGElementTagNameMap[K] {
  return document.createElementNS("http://www.w3.org/2000/svg", tagName);
}

function clampNumberValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveElementStyleValue(style: CSSStyleDeclaration, property: string, fallback: string): string {
  const value = style.getPropertyValue(property).trim();
  return value.length > 0 ? value : fallback;
}

function measureTextWidth(text: string, font: string): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context === null) {
    return text.length * 7;
  }
  context.font = font;
  return context.measureText(text).width;
}

function truncateLineWithEllipsis(line: string, maxWidth: number, font: string): string {
  const ellipsis = "...";
  if (measureTextWidth(`${line}${ellipsis}`, font) <= maxWidth) {
    return `${line}${ellipsis}`;
  }

  let candidate = line;
  while (candidate.length > 0) {
    candidate = candidate.slice(0, -1);
    if (measureTextWidth(`${candidate}${ellipsis}`, font) <= maxWidth) {
      return `${candidate}${ellipsis}`;
    }
  }
  return ellipsis;
}

function wrapTextWithClamp(text: string, maxWidth: number, font: string, maxLines: number): string[] {
  if (text.trim().length === 0 || maxLines <= 0) {
    return [];
  }

  const lines: string[] = [];
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  for (const paragraph of paragraphs) {
    const normalizedParagraph = paragraph.trim();
    if (normalizedParagraph.length === 0) {
      lines.push("");
      continue;
    }

    const words = normalizedParagraph.split(/\s+/).filter((word) => word.length > 0);
    let currentLine = "";
    for (const word of words) {
      const tentative = currentLine.length === 0 ? word : `${currentLine} ${word}`;
      if (measureTextWidth(tentative, font) <= maxWidth) {
        currentLine = tentative;
        continue;
      }

      if (currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = "";
      }

      if (measureTextWidth(word, font) <= maxWidth) {
        currentLine = word;
        continue;
      }

      let fragment = "";
      for (const character of word) {
        const nextFragment = `${fragment}${character}`;
        if (measureTextWidth(nextFragment, font) <= maxWidth) {
          fragment = nextFragment;
          continue;
        }

        if (fragment.length > 0) {
          lines.push(fragment);
        }
        fragment = character;
      }
      currentLine = fragment;
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
  }

  if (lines.length <= maxLines) {
    return lines;
  }

  const truncated = lines.slice(0, maxLines);
  const lastLine = truncated[truncated.length - 1] ?? "";
  truncated[truncated.length - 1] = truncateLineWithEllipsis(lastLine, maxWidth, font);
  return truncated;
}

function appendExportFrameOverlay(params: {
  sourceSvg: SVGSVGElement;
  cloneSvg: SVGSVGElement;
  width: number;
  height: number;
}): void {
  const segmentSource = params.sourceSvg.querySelector(".network-segment");
  const segmentStyle = window.getComputedStyle(segmentSource ?? params.sourceSvg);
  const strokeColor = resolveElementStyleValue(segmentStyle, "stroke", "var(--network-segment-color, #7f99af)");
  const parsedStrokeWidth = Number.parseFloat(resolveElementStyleValue(segmentStyle, "stroke-width", "3"));
  const strokeWidth = Number.isFinite(parsedStrokeWidth) ? clampNumberValue(parsedStrokeWidth, 1.4, 3.4) : 2.2;
  const margin = Math.max(10, Math.round(Math.min(params.width, params.height) * 0.018));
  const rx = Math.max(6, Math.round(Math.min(params.width, params.height) * 0.008));

  const frame = createSvgElement("rect");
  frame.setAttribute("class", "network-export-frame");
  frame.setAttribute("x", String(margin));
  frame.setAttribute("y", String(margin));
  frame.setAttribute("width", String(Math.max(1, params.width - margin * 2)));
  frame.setAttribute("height", String(Math.max(1, params.height - margin * 2)));
  frame.setAttribute("rx", String(rx));
  frame.setAttribute("fill", "none");
  frame.setAttribute("stroke", strokeColor);
  frame.setAttribute("stroke-width", String(strokeWidth));
  frame.setAttribute("stroke-linecap", "round");
  frame.setAttribute("stroke-linejoin", "round");
  frame.setAttribute("vector-effect", "non-scaling-stroke");
  frame.style.pointerEvents = "none";
  params.cloneSvg.insertBefore(frame, params.cloneSvg.firstChild);
}

function appendExportCartoucheOverlay(params: {
  sourceSvg: SVGSVGElement;
  cloneSvg: SVGSVGElement;
  width: number;
  height: number;
  networkName: string;
  author?: string;
  projectCode?: string;
  createdAt: string;
  notes?: string;
  logoAsset: ExportLogoAsset;
}): void {
  const frameSource = params.sourceSvg.querySelector(".network-callout-frame");
  const titleSource = params.sourceSvg.querySelector(".network-callout-title");
  const rowTextSource =
    params.sourceSvg.querySelector(".network-callout-row-text") ??
    titleSource ??
    params.sourceSvg.querySelector(".network-node-label");
  const frameStyle = window.getComputedStyle(frameSource ?? params.sourceSvg);
  const rowStyle = window.getComputedStyle(rowTextSource ?? params.sourceSvg);
  const titleStyle = window.getComputedStyle(titleSource ?? rowTextSource ?? params.sourceSvg);

  const fillColor = resolveElementStyleValue(frameStyle, "fill", "rgba(223, 240, 255, 0.92)");
  const fillOpacity = resolveElementStyleValue(frameStyle, "fill-opacity", "0.92");
  const strokeColor = resolveElementStyleValue(frameStyle, "stroke", "var(--network-node-stroke-color, #55748d)");
  const textColor = resolveElementStyleValue(rowStyle, "fill", "var(--network-node-label-color, #183549)");
  const subtleTextColor = resolveElementStyleValue(
    titleStyle,
    "fill",
    "var(--network-segment-length-label-color, #547086)"
  );
  const fontFamily = resolveElementStyleValue(rowStyle, "font-family", "Inter, system-ui, sans-serif");
  const titleFontFamily = resolveElementStyleValue(titleStyle, "font-family", fontFamily);

  const margin = Math.max(12, Math.round(Math.min(params.width, params.height) * 0.02));
  const padding = 12;
  const logoWidth = 84;
  const logoHeight = 46;
  const metadataX = padding + logoWidth + 10;
  const metadataLineHeight = 14;
  const notesLineHeight = 12;
  const notesFont = `500 ${notesLineHeight}px ${fontFamily}`;

  const createdAtLabel = formatIsoToLocalDateInput(params.createdAt);
  const normalizedNetworkName = params.networkName.trim().length > 0 ? params.networkName.trim() : "Unnamed network";
  const metadataRows = [
    { text: `Network: ${normalizedNetworkName}`, isTitle: true },
    ...(params.author?.trim() ? [{ text: `Author: ${params.author.trim()}`, isTitle: false }] : []),
    ...(params.projectCode?.trim() ? [{ text: `Code: ${params.projectCode.trim()}`, isTitle: false }] : []),
    { text: `Created: ${createdAtLabel.length > 0 ? createdAtLabel : "N/A"}`, isTitle: false }
  ];
  const metadataMaxContentWidth = metadataRows.reduce((maxWidth, row) => {
    const rowFont = row.isTitle ? `700 11px ${titleFontFamily}` : `600 9.6px ${fontFamily}`;
    return Math.max(maxWidth, measureTextWidth(row.text, rowFont));
  }, 0);
  const maxCartoucheWidth = Math.min(
    clampNumberValue(Math.round(params.width * 0.36), 250, 460),
    Math.max(180, params.width - margin * 2)
  );
  const minCartoucheWidth = Math.min(210, maxCartoucheWidth);
  const metadataDrivenWidth = padding * 2 + logoWidth + 10 + metadataMaxContentWidth;
  // Keep width compact and let notes wrap; long note lines must not force a very wide cartouche.
  const cartoucheWidth = clampNumberValue(Math.round(metadataDrivenWidth), minCartoucheWidth, maxCartoucheWidth);
  const metadataWidth = cartoucheWidth - padding * 2 - logoWidth - 10;
  const notesLines = wrapTextWithClamp(
    params.notes ?? "",
    cartoucheWidth - padding * 2,
    notesFont,
    8
  );
  const hasNotes = notesLines.length > 0;
  const metadataHeight = Math.max(logoHeight, metadataRows.length * metadataLineHeight);
  const notesBlockHeight = hasNotes ? 8 + 12 + notesLines.length * notesLineHeight : 0;
  const cartoucheHeight = padding * 2 + metadataHeight + notesBlockHeight;
  const cartoucheX = Math.max(margin, params.width - margin - cartoucheWidth);
  const cartoucheY = Math.max(margin, params.height - margin - cartoucheHeight);

  const group = createSvgElement("g");
  group.setAttribute("class", "network-export-cartouche");
  group.style.pointerEvents = "none";

  const container = createSvgElement("rect");
  container.setAttribute("class", "network-export-cartouche-frame");
  container.setAttribute("x", String(cartoucheX));
  container.setAttribute("y", String(cartoucheY));
  container.setAttribute("width", String(cartoucheWidth));
  container.setAttribute("height", String(cartoucheHeight));
  container.setAttribute("rx", "0");
  container.setAttribute("fill", fillColor);
  container.setAttribute("fill-opacity", fillOpacity);
  container.setAttribute("stroke", strokeColor);
  container.setAttribute("stroke-width", "1");
  container.setAttribute("vector-effect", "non-scaling-stroke");
  group.appendChild(container);

  const logoX = cartoucheX + padding;
  const logoY = cartoucheY + padding;
  if (params.logoAsset.kind === "image") {
    const image = createSvgElement("image");
    image.setAttribute("x", String(logoX));
    image.setAttribute("y", String(logoY));
    image.setAttribute("width", String(logoWidth));
    image.setAttribute("height", String(logoHeight));
    image.setAttribute("preserveAspectRatio", "xMidYMid meet");
    image.setAttribute("href", params.logoAsset.href);
    group.appendChild(image);
  } else {
    const logoFrame = createSvgElement("rect");
    logoFrame.setAttribute("class", "network-export-cartouche-logo-frame");
    logoFrame.setAttribute("x", String(logoX));
    logoFrame.setAttribute("y", String(logoY));
    logoFrame.setAttribute("width", String(logoWidth));
    logoFrame.setAttribute("height", String(logoHeight));
    logoFrame.setAttribute("rx", "0");
    logoFrame.setAttribute("fill", "none");
    logoFrame.setAttribute("stroke", strokeColor);
    logoFrame.setAttribute("stroke-width", "0.8");
    group.appendChild(logoFrame);

    const fallbackText = createSvgElement("text");
    fallbackText.setAttribute("x", String(logoX + logoWidth / 2));
    fallbackText.setAttribute("y", String(logoY + logoHeight / 2 + 1));
    fallbackText.setAttribute("text-anchor", "middle");
    fallbackText.setAttribute("dominant-baseline", "middle");
    fallbackText.setAttribute("fill", subtleTextColor);
    fallbackText.setAttribute("font-family", fontFamily);
    fallbackText.setAttribute("font-size", "8.2px");
    fallbackText.setAttribute("font-weight", "600");
    fallbackText.textContent = "Logo indisponible";
    group.appendChild(fallbackText);
  }

  metadataRows.forEach((metadataRow, index) => {
    const row = createSvgElement("text");
    const rowFont = metadataRow.isTitle ? `700 11px ${titleFontFamily}` : `600 9.6px ${fontFamily}`;
    row.setAttribute("class", "network-export-cartouche-meta");
    row.setAttribute("x", String(cartoucheX + metadataX));
    row.setAttribute("y", String(cartoucheY + padding + 11 + index * metadataLineHeight));
    row.setAttribute("fill", metadataRow.isTitle ? textColor : subtleTextColor);
    row.setAttribute("font-family", metadataRow.isTitle ? titleFontFamily : fontFamily);
    row.setAttribute("font-size", metadataRow.isTitle ? "11px" : "9.6px");
    row.setAttribute("font-weight", metadataRow.isTitle ? "700" : "600");
    if (measureTextWidth(metadataRow.text, rowFont) > metadataWidth) {
      row.textContent = truncateLineWithEllipsis(metadataRow.text, metadataWidth, rowFont);
    } else {
      row.textContent = metadataRow.text;
    }
    group.appendChild(row);
  });

  if (hasNotes) {
    const dividerY = cartoucheY + padding + metadataHeight + 4;
    const divider = createSvgElement("line");
    divider.setAttribute("x1", String(cartoucheX + padding));
    divider.setAttribute("y1", String(dividerY));
    divider.setAttribute("x2", String(cartoucheX + cartoucheWidth - padding));
    divider.setAttribute("y2", String(dividerY));
    divider.setAttribute("stroke", strokeColor);
    divider.setAttribute("stroke-opacity", "0.5");
    divider.setAttribute("stroke-width", "0.8");
    group.appendChild(divider);

    const notesLabel = createSvgElement("text");
    notesLabel.setAttribute("class", "network-export-cartouche-notes-label");
    notesLabel.setAttribute("x", String(cartoucheX + padding));
    notesLabel.setAttribute("y", String(dividerY + 12));
    notesLabel.setAttribute("fill", subtleTextColor);
    notesLabel.setAttribute("font-family", fontFamily);
    notesLabel.setAttribute("font-size", "9.2px");
    notesLabel.setAttribute("font-weight", "700");
    notesLabel.textContent = "Notes";
    group.appendChild(notesLabel);

    notesLines.forEach((line, index) => {
      const note = createSvgElement("text");
      note.setAttribute("class", "network-export-cartouche-note");
      note.setAttribute("x", String(cartoucheX + padding));
      note.setAttribute("y", String(dividerY + 24 + index * notesLineHeight));
      note.setAttribute("fill", textColor);
      note.setAttribute("font-family", fontFamily);
      note.setAttribute("font-size", "9.2px");
      note.setAttribute("font-weight", "500");
      note.textContent = line;
      group.appendChild(note);
    });
  }

  params.cloneSvg.appendChild(group);
}

async function applyExportDecorations(params: {
  sourceSvg: SVGSVGElement;
  cloneSvg: SVGSVGElement;
  width: number;
  height: number;
  includeFrame: boolean;
  includeCartouche: boolean;
  cartoucheNetworkName: string;
  cartoucheAuthor?: string;
  cartoucheProjectCode?: string;
  cartoucheCreatedAt: string;
  cartoucheLogoUrl?: string;
  cartoucheNotes?: string;
}): Promise<void> {
  if (params.includeFrame) {
    appendExportFrameOverlay({
      sourceSvg: params.sourceSvg,
      cloneSvg: params.cloneSvg,
      width: params.width,
      height: params.height
    });
  }

  if (!params.includeCartouche) {
    return;
  }

  const logoAsset = await resolveExportLogoAsset(params.cartoucheLogoUrl);
  appendExportCartoucheOverlay({
    sourceSvg: params.sourceSvg,
    cloneSvg: params.cloneSvg,
    width: params.width,
    height: params.height,
    networkName: params.cartoucheNetworkName,
    author: params.cartoucheAuthor,
    projectCode: params.cartoucheProjectCode,
    createdAt: params.cartoucheCreatedAt,
    notes: params.cartoucheNotes,
    logoAsset
  });
}

export interface NetworkSummaryPanelProps {
  handleZoomAction: (target: "in" | "out" | "reset") => void;
  fitNetworkToContent: () => void;
  showNetworkInfoPanels: boolean;
  showSegmentNames: boolean;
  showSegmentLengths: boolean;
  showCableCallouts: boolean;
  showSelectedCalloutOnly: boolean;
  showCalloutWireNames: boolean;
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
  showNetworkGrid: boolean;
  snapNodesToGrid: boolean;
  lockEntityMovement: boolean;
  toggleShowNetworkInfoPanels: () => void;
  toggleShowSegmentLengths: () => void;
  toggleShowCableCallouts: () => void;
  toggleShowNetworkGrid: () => void;
  toggleSnapNodesToGrid: () => void;
  toggleLockEntityMovement: () => void;
  networkScalePercent: number;
  routingGraphNodeCount: number;
  routingGraphSegmentCount: number;
  totalEdgeEntries: number;
  nodes: NetworkNode[];
  segments: Segment[];
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
  quickEntityNavigationMode: "modeling" | "analysis";
  activeSubScreen: SubScreenId;
  entityCountBySubScreen: Record<SubScreenId, number>;
  onQuickEntityNavigation: (subScreen: SubScreenId) => void;
  onSelectConnectorFromCallout: (connectorId: ConnectorId) => void;
  onSelectSpliceFromCallout: (spliceId: SpliceId) => void;
  onPersistConnectorCalloutPosition: (connectorId: ConnectorId, position: NodePosition) => void;
  onPersistSpliceCalloutPosition: (spliceId: SpliceId, position: NodePosition) => void;
  onViewportSizeChange?: (size: { width: number; height: number }) => void;
  pngExportIncludeBackground: boolean;
  canExportBomCsv: boolean;
  onExportBomCsv: () => void;
  onRegenerateLayout: () => void;
}

const QUICK_ENTITY_NAV_ITEMS: Record<
  NetworkSummaryPanelProps["quickEntityNavigationMode"],
  ReadonlyArray<{ subScreen: SubScreenId; label: string }>
> = {
  modeling: [
    { subScreen: "catalog", label: "Catalog" },
    { subScreen: "connector", label: "Connectors" },
    { subScreen: "splice", label: "Splices" },
    { subScreen: "node", label: "Nodes" },
    { subScreen: "segment", label: "Segments" },
    { subScreen: "wire", label: "Wires" }
  ],
  analysis: [
    { subScreen: "connector", label: "Connectors" },
    { subScreen: "splice", label: "Splices" },
    { subScreen: "node", label: "Nodes" },
    { subScreen: "segment", label: "Segments" },
    { subScreen: "wire", label: "Wires" }
  ]
};

const SUB_SCREEN_ICON_CLASS_BY_ID: Record<SubScreenId, string> = {
  catalog: "is-catalog",
  connector: "is-connectors",
  splice: "is-splices",
  node: "is-nodes",
  segment: "is-segments",
  wire: "is-wires"
};

type CalloutTargetKey = `connector:${string}` | `splice:${string}`;

interface CalloutEntry {
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

interface CalloutGroup {
  key: string;
  label: string;
  entries: CalloutEntry[];
}

interface CableCalloutViewModel {
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

interface DraggingCalloutState {
  key: CalloutTargetKey;
  kind: "connector" | "splice";
  entityId: ConnectorId | SpliceId;
  startPosition: NodePosition;
}

const CALLOUT_OFFSET_SCREEN_UNITS = 92;
const CALLOUT_MIN_WIDTH = 44;
const CALLOUT_MAX_WIDTH = 520;
const CALLOUT_LAYOUT_CACHE_MAX_ENTRIES = 512;
const CALLOUT_COLOR_SWATCH_RADIUS = 1.35;
const CALLOUT_COLOR_SWATCH_GAP = 0.95;
const CALLOUT_COLOR_SWATCH_TO_TEXT_GAP = 1.5;

type CalloutTableColumnKey = "pin" | "technicalId" | "color" | "targetId" | "targetPin" | "wireName" | "length" | "section";

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

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeReadableSegmentLabelAngle(angleDegrees: number): number {
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

function normalizeVector(x: number, y: number): { x: number; y: number } {
  const magnitude = Math.hypot(x, y);
  if (magnitude <= 0.0001) {
    return { x: 0, y: 0 };
  }
  return { x: x / magnitude, y: y / magnitude };
}

function getCalloutRowFontSize(calloutTextSize: CanvasCalloutTextSize): number {
  switch (calloutTextSize) {
    case "small":
      return 4.3;
    case "extraLarge":
      return 7.2;
    case "large":
      return 6.3;
    case "normal":
    default:
      return 5.5;
  }
}

function getCalloutTitleFontSize(calloutTextSize: CanvasCalloutTextSize): number {
  switch (calloutTextSize) {
    case "small":
      return 6.4;
    case "extraLarge":
      return 10.9;
    case "large":
      return 9.5;
    case "normal":
    default:
      return 8.3;
  }
}

function getCalloutSubtitleFontSize(calloutTextSize: CanvasCalloutTextSize): number {
  switch (calloutTextSize) {
    case "small":
      return 5.5;
    case "extraLarge":
      return 8.7;
    case "large":
      return 7.6;
    case "normal":
    default:
      return 6.9;
  }
}

function buildCalloutHeaderDisplay(name: string, technicalId: string): { title: string; subtitle: string } {
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

let calloutMeasureCanvas: HTMLCanvasElement | null = null;
let calloutMeasureSvgText: SVGTextElement | null = null;
let calloutMeasureSvgRoot: SVGSVGElement | null = null;
const calloutLayoutCache = new Map<string, CalloutLayoutMetrics>();

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
    calloutMeasureSvgText.setAttribute("font-family", "\"IBM Plex Sans\", \"Segoe UI\", sans-serif");
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
    // Reuse width measurer initializer.
    measureCalloutRowTextWidth("Ag", fontSizePx);
  }
  if (!calloutMeasureSvgText) {
    return fallback;
  }
  calloutMeasureSvgText.textContent = "Ag";
  calloutMeasureSvgText.setAttribute("x", "0");
  calloutMeasureSvgText.setAttribute("y", "0");
  calloutMeasureSvgText.setAttribute("font-size", String(fontSizePx));
  calloutMeasureSvgText.setAttribute("font-family", "\"IBM Plex Sans\", \"Segoe UI\", sans-serif");
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

function getCalloutRowCellValue(row: CalloutTableRow, key: CalloutTableColumnKey): string {
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

function getCalloutColorSwatchesWidth(row: Pick<CalloutTableRow, "colorPrimaryHex" | "colorSecondaryHex">): number {
  if (row.colorPrimaryHex === null) {
    return 0;
  }
  const dotDiameter = CALLOUT_COLOR_SWATCH_RADIUS * 2;
  if (row.colorSecondaryHex === null) {
    return dotDiameter + CALLOUT_COLOR_SWATCH_TO_TEXT_GAP;
  }
  return dotDiameter * 2 + CALLOUT_COLOR_SWATCH_GAP + CALLOUT_COLOR_SWATCH_TO_TEXT_GAP;
}

function buildCalloutLayoutMetrics(
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

function getCalloutFrameEdgePoint(
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

export function NetworkSummaryPanel({
  handleZoomAction,
  fitNetworkToContent,
  showNetworkInfoPanels,
  showSegmentNames,
  showSegmentLengths,
  showCableCallouts,
  showSelectedCalloutOnly,
  showCalloutWireNames,
  zoomInvariantNodeShapes,
  nodeShapeSizePercent,
  resizeBehaviorMode,
  labelStrokeMode,
  labelSizeMode,
  calloutTextSize,
  labelRotationDegrees,
  autoSegmentLabelRotation,
  canvasExportFormat,
  exportIncludeFrame,
  exportIncludeCartouche,
  exportCartoucheNetworkName,
  exportCartoucheAuthor,
  exportCartoucheProjectCode,
  exportCartoucheCreatedAt,
  exportCartoucheLogoUrl,
  exportCartoucheNotes,
  showNetworkGrid,
  snapNodesToGrid,
  lockEntityMovement,
  toggleShowNetworkInfoPanels,
  toggleShowSegmentLengths,
  toggleShowCableCallouts,
  toggleShowNetworkGrid,
  toggleSnapNodesToGrid,
  toggleLockEntityMovement,
  networkScalePercent,
  routingGraphNodeCount,
  routingGraphSegmentCount,
  totalEdgeEntries,
  nodes,
  segments,
  wires,
  isPanningNetwork,
  networkViewWidth,
  networkViewHeight,
  networkGridStep,
  networkOffset,
  networkScale,
  handleNetworkCanvasMouseDown,
  handleNetworkCanvasClick,
  handleNetworkWheel,
  handleNetworkMouseMove,
  stopNetworkNodeDrag,
  networkNodePositions,
  selectedWireRouteSegmentIds,
  selectedSegmentId,
  selectedWireId,
  handleNetworkSegmentClick,
  selectedNodeId,
  selectedConnectorId,
  selectedSpliceId,
  handleNetworkNodeMouseDown,
  handleNetworkNodeActivate,
  connectorMap,
  spliceMap,
  describeNode,
  subNetworkSummaries,
  routePreviewStartNodeId,
  setRoutePreviewStartNodeId,
  routePreviewEndNodeId,
  setRoutePreviewEndNodeId,
  routePreview,
  quickEntityNavigationMode,
  activeSubScreen,
  entityCountBySubScreen,
  onQuickEntityNavigation,
  onSelectConnectorFromCallout,
  onSelectSpliceFromCallout,
  onPersistConnectorCalloutPosition,
  onPersistSpliceCalloutPosition,
  onViewportSizeChange,
  pngExportIncludeBackground,
  canExportBomCsv,
  onExportBomCsv,
  onRegenerateLayout
}: NetworkSummaryPanelProps): ReactElement {
  const networkSvgRef = useRef<SVGSVGElement | null>(null);
  const networkCanvasShellRef = useRef<HTMLDivElement | null>(null);
  const subNetworkFilterInitializedRef = useRef(false);
  const [activeSubNetworkTags, setActiveSubNetworkTags] = useState<Set<string>>(new Set());
  const graphStats = [
    { label: "Graph nodes", value: routingGraphNodeCount },
    { label: "Graph segments", value: routingGraphSegmentCount },
    { label: "Adjacency entries", value: totalEdgeEntries }
  ];
  const effectiveScale = networkScale > 0 ? networkScale : 1;
  const inverseLabelScale = 1 / effectiveScale;
  const normalizedNodeShapeScale = zoomInvariantNodeShapes
    ? Math.min(1.25, Math.max(0.5, nodeShapeSizePercent / 100))
    : 1;
  const normalizedNodeStrokeScale = zoomInvariantNodeShapes
    ? clampNumber(normalizedNodeShapeScale, 0.65, 1.35)
    : 1;
  const nodeStrokeWidth = clampNumber(2 * normalizedNodeStrokeScale, 1.4, 3.4);
  const nodeStrokeEmphasisWidth = clampNumber(3 * normalizedNodeStrokeScale, 2.1, 5.1);
  const segmentStrokeWidth = clampNumber(3 * normalizedNodeStrokeScale, 1.95, 4.05);
  const segmentStrokeEmphasisWidth = clampNumber(5 * normalizedNodeStrokeScale, 3.25, 6.75);
  const calloutLeaderStrokeWidth = clampNumber(1.25 * normalizedNodeStrokeScale, 0.82, 1.7);
  const calloutLeaderDashFirst = clampNumber(1.7 * normalizedNodeStrokeScale, 1.1, 2.3);
  const calloutLeaderDashSecond = clampNumber(2.4 * normalizedNodeStrokeScale, 1.56, 3.24);
  const networkSvgStrokeVariables = {
    "--network-segment-stroke-width": `${segmentStrokeWidth}`,
    "--network-segment-stroke-emphasis-width": `${segmentStrokeEmphasisWidth}`,
    "--network-callout-leader-stroke-width": `${calloutLeaderStrokeWidth}`,
    "--network-callout-leader-dasharray": `${calloutLeaderDashFirst} ${calloutLeaderDashSecond}`
  } as CSSProperties;
  const useStrokeInvariantLines = resizeBehaviorMode === "visibleAreaOnly";
  const visibleModelMinX = (0 - networkOffset.x) / effectiveScale;
  const visibleModelMaxX = (networkViewWidth - networkOffset.x) / effectiveScale;
  const visibleModelMinY = (0 - networkOffset.y) / effectiveScale;
  const visibleModelMaxY = (networkViewHeight - networkOffset.y) / effectiveScale;
  const gridStartX = Math.floor(visibleModelMinX / networkGridStep) * networkGridStep;
  const gridEndX = Math.ceil(visibleModelMaxX / networkGridStep) * networkGridStep;
  const gridStartY = Math.floor(visibleModelMinY / networkGridStep) * networkGridStep;
  const gridEndY = Math.ceil(visibleModelMaxY / networkGridStep) * networkGridStep;
  const verticalGridLineCount = Math.max(0, Math.ceil((gridEndX - gridStartX) / networkGridStep) + 1);
  const horizontalGridLineCount = Math.max(0, Math.ceil((gridEndY - gridStartY) / networkGridStep) + 1);
  const gridXPositions = Array.from({ length: verticalGridLineCount }, (_, index) => gridStartX + index * networkGridStep);
  const gridYPositions = Array.from({ length: horizontalGridLineCount }, (_, index) => gridStartY + index * networkGridStep);
  const allSubNetworkTags = useMemo(
    () => subNetworkSummaries.map((summary) => summary.tag),
    [subNetworkSummaries]
  );

  useEffect(() => {
    if (allSubNetworkTags.length === 0) {
      subNetworkFilterInitializedRef.current = false;
      setActiveSubNetworkTags((current) => (current.size === 0 ? current : new Set()));
      return;
    }

    setActiveSubNetworkTags((current) => {
      const next = new Set<string>();
      const isUninitialized = !subNetworkFilterInitializedRef.current;
      for (const tag of allSubNetworkTags) {
        if (isUninitialized || current.has(tag)) {
          next.add(tag);
        }
      }
      if (isUninitialized) {
        subNetworkFilterInitializedRef.current = true;
      }
      const hasSameSize = next.size === current.size;
      if (hasSameSize && [...next].every((tag) => current.has(tag))) {
        return current;
      }
      return next;
    });
  }, [allSubNetworkTags]);

  useEffect(() => {
    if (
      resizeBehaviorMode !== "visibleAreaOnly" ||
      onViewportSizeChange === undefined ||
      typeof window === "undefined"
    ) {
      return undefined;
    }

    let animationFrameId = 0;
    const measureViewport = () => {
      animationFrameId = 0;
      const svgElement = networkSvgRef.current;
      if (svgElement === null) {
        return;
      }
      const rect = svgElement.getBoundingClientRect();
      if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height) || rect.width <= 0 || rect.height <= 0) {
        return;
      }

      onViewportSizeChange({
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height))
      });
    };
    const scheduleMeasure = () => {
      if (animationFrameId !== 0) {
        return;
      }
      animationFrameId = window.requestAnimationFrame(measureViewport);
    };

    scheduleMeasure();
    window.addEventListener("resize", scheduleMeasure);
    const observedElement = networkCanvasShellRef.current ?? networkSvgRef.current;
    const resizeObserver =
      observedElement === null || typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleMeasure);
    if (resizeObserver !== null && observedElement !== null) {
      resizeObserver.observe(observedElement);
    }

    return () => {
      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("resize", scheduleMeasure);
      resizeObserver?.disconnect();
    };
  }, [onViewportSizeChange, resizeBehaviorMode, nodes.length]);

  const activeSubNetworkTagSet = activeSubNetworkTags as ReadonlySet<string>;
  const isSubNetworkFilteringActive =
    allSubNetworkTags.length > 0 && activeSubNetworkTagSet.size < allSubNetworkTags.length;

  const segmentSubNetworkTagById = useMemo(() => {
    const byId = new Map<SegmentId, string>();
    for (const segment of segments) {
      const normalizedTag = segment.subNetworkTag?.trim();
      byId.set(segment.id, normalizedTag === undefined || normalizedTag.length === 0 ? "(default)" : normalizedTag);
    }
    return byId;
  }, [segments]);

  const nodeHasActiveSubNetworkConnection = useMemo(() => {
    const byNodeId = new Map<NodeId, boolean>();
    for (const node of nodes) {
      byNodeId.set(node.id, false);
    }
    for (const segment of segments) {
      const tag = segmentSubNetworkTagById.get(segment.id) ?? "(default)";
      if (!activeSubNetworkTagSet.has(tag)) {
        continue;
      }
      byNodeId.set(segment.nodeA, true);
      byNodeId.set(segment.nodeB, true);
    }
    return byNodeId;
  }, [nodes, segments, segmentSubNetworkTagById, activeSubNetworkTagSet]);

  const toggleSubNetworkTag = useCallback((tag: string) => {
    setActiveSubNetworkTags((current) => {
      const next = new Set(current);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const enableAllSubNetworkTags = useCallback(() => {
    setActiveSubNetworkTags(new Set(allSubNetworkTags));
  }, [allSubNetworkTags]);

  const [hoveredCalloutKey, setHoveredCalloutKey] = useState<CalloutTargetKey | null>(null);
  const [draggingCallout, setDraggingCallout] = useState<DraggingCalloutState | null>(null);
  const [draftCalloutPositions, setDraftCalloutPositions] = useState<Record<string, NodePosition>>({});

  const graphCenter = useMemo(() => {
    const positionedNodes = nodes
      .map((node) => networkNodePositions[node.id])
      .filter((position): position is NodePosition => position !== undefined);
    if (positionedNodes.length === 0) {
      return { x: 0, y: 0 };
    }
    const sum = positionedNodes.reduce(
      (accumulator, position) => ({
        x: accumulator.x + position.x,
        y: accumulator.y + position.y
      }),
      { x: 0, y: 0 }
    );
    return {
      x: sum.x / positionedNodes.length,
      y: sum.y / positionedNodes.length
    };
  }, [nodes, networkNodePositions]);

  const connectedSegmentDirectionByNodeId = useMemo(() => {
    const directions = new Map<NodeId, { x: number; y: number }[]>();
    for (const node of nodes) {
      directions.set(node.id, []);
    }
    for (const segment of segments) {
      const positionA = networkNodePositions[segment.nodeA];
      const positionB = networkNodePositions[segment.nodeB];
      if (positionA === undefined || positionB === undefined) {
        continue;
      }
      const forward = normalizeVector(positionB.x - positionA.x, positionB.y - positionA.y);
      const backward = normalizeVector(positionA.x - positionB.x, positionA.y - positionB.y);
      directions.get(segment.nodeA)?.push(forward);
      directions.get(segment.nodeB)?.push(backward);
    }
    return directions;
  }, [nodes, segments, networkNodePositions]);

  const describeWireEndpointForCallout = useCallback(
    (endpoint: Wire["endpointA"]): { targetId: string; targetPin: string } => {
      if (endpoint.kind === "connectorCavity") {
        const connectorTechnicalId = connectorMap.get(endpoint.connectorId)?.technicalId ?? String(endpoint.connectorId);
        return {
          targetId: connectorTechnicalId,
          targetPin: `C${endpoint.cavityIndex}`
        };
      }
      const spliceTechnicalId = spliceMap.get(endpoint.spliceId)?.technicalId ?? String(endpoint.spliceId);
      return {
        targetId: spliceTechnicalId,
        targetPin: `P${endpoint.portIndex}`
      };
    },
    [connectorMap, spliceMap]
  );

  const resolveWireColorSwatches = useCallback((wire: Wire): { primaryHex: string | null; secondaryHex: string | null } => {
    const primaryId = wire.primaryColorId;
    if (primaryId === null) {
      return { primaryHex: null, secondaryHex: null };
    }
    const primaryHex = CABLE_COLOR_BY_ID[primaryId]?.hex ?? null;
    if (primaryHex === null) {
      return { primaryHex: null, secondaryHex: null };
    }
    const secondaryId = wire.secondaryColorId;
    return {
      primaryHex,
      secondaryHex: secondaryId === null ? null : CABLE_COLOR_BY_ID[secondaryId]?.hex ?? null
    };
  }, []);

  const connectorCalloutGroupsById = useMemo(() => {
    const map = new Map<ConnectorId, CalloutGroup[]>();
    for (const connector of connectorMap.values()) {
      const groups = Array.from({ length: Math.max(0, connector.cavityCount) }, (_, index) => ({
        key: `connector:${connector.id}:C${index + 1}`,
        label: `C${index + 1}`,
        entries: [] as CalloutEntry[]
      }));
      map.set(connector.id, groups);
    }

    for (const wire of wires) {
      const endpointPairs = [
        { localEndpoint: wire.endpointA, targetEndpoint: wire.endpointB },
        { localEndpoint: wire.endpointB, targetEndpoint: wire.endpointA }
      ] as const;
      for (const { localEndpoint, targetEndpoint } of endpointPairs) {
        if (localEndpoint.kind !== "connectorCavity") {
          continue;
        }
        const groups = map.get(localEndpoint.connectorId);
        if (groups === undefined || localEndpoint.cavityIndex < 1) {
          continue;
        }
        const groupIndex = localEndpoint.cavityIndex - 1;
        if (groupIndex >= groups.length) {
          continue;
        }
        const target = describeWireEndpointForCallout(targetEndpoint);
        const colorSwatches = resolveWireColorSwatches(wire);
        groups[groupIndex]?.entries.push({
          wireId: wire.id,
          name: wire.name,
          technicalId: wire.technicalId,
          color: getWireColorCode(wire),
          colorPrimaryHex: colorSwatches.primaryHex,
          colorSecondaryHex: colorSwatches.secondaryHex,
          targetId: target.targetId,
          targetPin: target.targetPin,
          lengthMm: wire.lengthMm,
          sectionMm2: wire.sectionMm2
        });
      }
    }

    for (const groups of map.values()) {
      for (const group of groups) {
        group.entries.sort(
          (left, right) =>
            left.name.localeCompare(right.name) || left.technicalId.localeCompare(right.technicalId)
        );
      }
    }
    return map;
  }, [connectorMap, wires, describeWireEndpointForCallout, resolveWireColorSwatches]);

  const spliceCalloutGroupsById = useMemo(() => {
    const map = new Map<SpliceId, CalloutGroup[]>();
    const entriesBySpliceAndPort = new Map<SpliceId, Map<number, CalloutEntry[]>>();

    for (const wire of wires) {
      const endpointPairs = [
        { localEndpoint: wire.endpointA, targetEndpoint: wire.endpointB },
        { localEndpoint: wire.endpointB, targetEndpoint: wire.endpointA }
      ] as const;
      for (const { localEndpoint, targetEndpoint } of endpointPairs) {
        if (localEndpoint.kind !== "splicePort") {
          continue;
        }
        if (localEndpoint.portIndex < 1) {
          continue;
        }
        const splice = spliceMap.get(localEndpoint.spliceId);
        if (splice === undefined) {
          continue;
        }
        if (resolveSplicePortMode(splice) === "bounded" && localEndpoint.portIndex > splice.portCount) {
          continue;
        }
        let entriesByPort = entriesBySpliceAndPort.get(localEndpoint.spliceId);
        if (entriesByPort === undefined) {
          entriesByPort = new Map<number, CalloutEntry[]>();
          entriesBySpliceAndPort.set(localEndpoint.spliceId, entriesByPort);
        }
        const currentEntries = entriesByPort.get(localEndpoint.portIndex) ?? [];
        const target = describeWireEndpointForCallout(targetEndpoint);
        const colorSwatches = resolveWireColorSwatches(wire);
        currentEntries.push({
          wireId: wire.id,
          name: wire.name,
          technicalId: wire.technicalId,
          color: getWireColorCode(wire),
          colorPrimaryHex: colorSwatches.primaryHex,
          colorSecondaryHex: colorSwatches.secondaryHex,
          targetId: target.targetId,
          targetPin: target.targetPin,
          lengthMm: wire.lengthMm,
          sectionMm2: wire.sectionMm2
        });
        entriesByPort.set(localEndpoint.portIndex, currentEntries);
      }
    }

    for (const splice of spliceMap.values()) {
      const entriesByPort = entriesBySpliceAndPort.get(splice.id) ?? new Map<number, CalloutEntry[]>();
      const portIndexes =
        resolveSplicePortMode(splice) === "bounded"
          ? Array.from({ length: Math.max(0, splice.portCount) }, (_, index) => index + 1)
          : [...entriesByPort.keys()].sort((left, right) => left - right);
      const groups = portIndexes.map((portIndex) => ({
        key: `splice:${splice.id}:P${portIndex}`,
        label: `P${portIndex}`,
        entries: entriesByPort.get(portIndex) ?? []
      }));
      for (const group of groups) {
        group.entries.sort(
          (left, right) =>
            left.name.localeCompare(right.name) || left.technicalId.localeCompare(right.technicalId)
        );
      }
      map.set(splice.id, groups);
    }
    return map;
  }, [spliceMap, wires, describeWireEndpointForCallout, resolveWireColorSwatches]);

  const getDefaultCalloutPosition = useCallback(
    (nodeId: NodeId, nodePosition: NodePosition) => {
      const connectedDirections = connectedSegmentDirectionByNodeId.get(nodeId) ?? [];
      let outward = { x: 0, y: 0 };
      if (connectedDirections.length > 0) {
        const accumulated = connectedDirections.reduce(
          (accumulator, direction) => ({
            x: accumulator.x + direction.x,
            y: accumulator.y + direction.y
          }),
          { x: 0, y: 0 }
        );
        outward = normalizeVector(-accumulated.x, -accumulated.y);
      }

      if (outward.x === 0 && outward.y === 0) {
        outward = normalizeVector(nodePosition.x - graphCenter.x, nodePosition.y - graphCenter.y);
      }
      if (outward.x === 0 && outward.y === 0) {
        outward = { x: 1, y: -0.4 };
      }

      const distance = CALLOUT_OFFSET_SCREEN_UNITS * inverseLabelScale;
      return {
        x: nodePosition.x + outward.x * distance,
        y: nodePosition.y + outward.y * distance
      } satisfies NodePosition;
    },
    [connectedSegmentDirectionByNodeId, graphCenter, inverseLabelScale]
  );

  const cableCalloutViewModels = useMemo(() => {
    if (!showCableCallouts) {
      return [] as CableCalloutViewModel[];
    }

    const models: CableCalloutViewModel[] = [];
    for (const node of nodes) {
      const nodePosition = networkNodePositions[node.id];
      if (nodePosition === undefined || (node.kind !== "connector" && node.kind !== "splice")) {
        continue;
      }

      if (node.kind === "connector") {
        const connector = connectorMap.get(node.connectorId);
        if (connector === undefined) {
          continue;
        }
        const key = `connector:${connector.id}` as const;
        const draftPosition = draftCalloutPositions[key];
        const persistedPosition = connector.cableCalloutPosition;
        const position = draftPosition ?? persistedPosition ?? getDefaultCalloutPosition(node.id, nodePosition);
        const groups = (connectorCalloutGroupsById.get(connector.id) ?? []).filter((group) => group.entries.length > 0);
        if (groups.length === 0) {
          continue;
        }
        const header = buildCalloutHeaderDisplay(connector.name, connector.technicalId);
        models.push({
          key,
          kind: "connector",
          entityId: connector.id,
          nodeId: node.id,
          nodePosition,
          position,
          title: header.title,
          subtitle: header.subtitle,
          groups,
          isDeemphasized: isSubNetworkFilteringActive && !(nodeHasActiveSubNetworkConnection.get(node.id) ?? false),
          isSelected: selectedConnectorId === connector.id
        });
        continue;
      }

      const splice = spliceMap.get(node.spliceId);
      if (splice === undefined) {
        continue;
      }
      const key = `splice:${splice.id}` as const;
      const draftPosition = draftCalloutPositions[key];
      const persistedPosition = splice.cableCalloutPosition;
      const position = draftPosition ?? persistedPosition ?? getDefaultCalloutPosition(node.id, nodePosition);
      const groups = (spliceCalloutGroupsById.get(splice.id) ?? []).filter((group) => group.entries.length > 0);
      if (groups.length === 0) {
        continue;
      }
      const header = buildCalloutHeaderDisplay(splice.name, splice.technicalId);
      models.push({
        key,
        kind: "splice",
        entityId: splice.id,
        nodeId: node.id,
        nodePosition,
        position,
        title: header.title,
        subtitle: header.subtitle,
        groups,
        isDeemphasized: isSubNetworkFilteringActive && !(nodeHasActiveSubNetworkConnection.get(node.id) ?? false),
        isSelected: selectedSpliceId === splice.id
      });
    }

    const sortedModels = models.sort((left, right) => left.title.localeCompare(right.title) || left.subtitle.localeCompare(right.subtitle));
    if (!showSelectedCalloutOnly) {
      return sortedModels;
    }

    let selectedCalloutKey =
      selectedConnectorId !== null
        ? (`connector:${selectedConnectorId}` as const)
        : selectedSpliceId !== null
          ? (`splice:${selectedSpliceId}` as const)
          : null;
    if (selectedCalloutKey === null && selectedNodeId !== null) {
      const selectedNode = nodes.find((entry) => entry.id === selectedNodeId);
      if (selectedNode?.kind === "connector") {
        selectedCalloutKey = `connector:${selectedNode.connectorId}` as const;
      } else if (selectedNode?.kind === "splice") {
        selectedCalloutKey = `splice:${selectedNode.spliceId}` as const;
      }
    }
    if (selectedCalloutKey === null) {
      return [] as CableCalloutViewModel[];
    }

    const selectedCallout = sortedModels.find((entry) => entry.key === selectedCalloutKey);
    return selectedCallout === undefined ? [] as CableCalloutViewModel[] : [selectedCallout];
  }, [
    showCableCallouts,
    showSelectedCalloutOnly,
    nodes,
    networkNodePositions,
    connectorMap,
    spliceMap,
    connectorCalloutGroupsById,
    spliceCalloutGroupsById,
    draftCalloutPositions,
    getDefaultCalloutPosition,
    isSubNetworkFilteringActive,
    nodeHasActiveSubNetworkConnection,
    selectedConnectorId,
    selectedSpliceId,
    selectedNodeId
  ]);

  const orderedCableCallouts = useMemo(() => {
    if (cableCalloutViewModels.length <= 1) {
      return cableCalloutViewModels;
    }

    const draggingKey = draggingCallout?.key ?? null;
    return [...cableCalloutViewModels].sort((left, right) => {
      const weightFor = (key: CalloutTargetKey, isSelected: boolean) => {
        if (draggingKey === key) {
          return 3;
        }
        if (hoveredCalloutKey === key) {
          return 2;
        }
        if (isSelected) {
          return 1;
        }
        return 0;
      };
      const weightDelta = weightFor(left.key, left.isSelected) - weightFor(right.key, right.isSelected);
      if (weightDelta !== 0) {
        return weightDelta;
      }
      return left.title.localeCompare(right.title) || left.subtitle.localeCompare(right.subtitle);
    });
  }, [cableCalloutViewModels, draggingCallout?.key, hoveredCalloutKey]);

  const getSvgCoordinates = useCallback(
    (svgElement: SVGSVGElement, clientX: number, clientY: number): NodePosition | null => {
      const bounds = svgElement.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) {
        return null;
      }

      const localX = ((clientX - bounds.left) / bounds.width) * networkViewWidth;
      const localY = ((clientY - bounds.top) / bounds.height) * networkViewHeight;
      const modelX = (localX - networkOffset.x) / networkScale;
      const modelY = (localY - networkOffset.y) / networkScale;
      return {
        x: snapNodesToGrid ? snapToGrid(modelX, networkGridStep) : modelX,
        y: snapNodesToGrid ? snapToGrid(modelY, networkGridStep) : modelY
      };
    },
    [networkGridStep, networkOffset.x, networkOffset.y, networkScale, networkViewHeight, networkViewWidth, snapNodesToGrid]
  );

  const handleCalloutMouseDown = useCallback(
    (
      event: ReactMouseEvent<SVGGElement>,
      callout: Pick<CableCalloutViewModel, "key" | "kind" | "entityId" | "position">
    ) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (callout.kind === "connector") {
        onSelectConnectorFromCallout(callout.entityId as ConnectorId);
      } else {
        onSelectSpliceFromCallout(callout.entityId as SpliceId);
      }

      if (lockEntityMovement) {
        return;
      }

      setDraggingCallout({
        key: callout.key,
        kind: callout.kind,
        entityId: callout.entityId,
        startPosition: callout.position
      });
      setDraftCalloutPositions((current) => ({
        ...current,
        [callout.key]: callout.position
      }));
    },
    [lockEntityMovement, onSelectConnectorFromCallout, onSelectSpliceFromCallout]
  );

  const handleCanvasMouseMoveWithCallouts = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (draggingCallout === null) {
        handleNetworkMouseMove(event);
        return;
      }

      const coordinates = getSvgCoordinates(event.currentTarget, event.clientX, event.clientY);
      if (coordinates === null) {
        return;
      }

      setDraftCalloutPositions((current) => {
        const previousPosition = current[draggingCallout.key];
        if (
          previousPosition !== undefined &&
          Math.abs(previousPosition.x - coordinates.x) <= 0.0001 &&
          Math.abs(previousPosition.y - coordinates.y) <= 0.0001
        ) {
          return current;
        }
        return {
          ...current,
          [draggingCallout.key]: coordinates
        };
      });
    },
    [draggingCallout, getSvgCoordinates, handleNetworkMouseMove]
  );

  const stopCalloutDrag = useCallback(() => {
    if (draggingCallout === null) {
      return;
    }

    const draftPosition = draftCalloutPositions[draggingCallout.key];
    if (draftPosition !== undefined) {
      const changed =
        Math.abs(draftPosition.x - draggingCallout.startPosition.x) > 0.0001 ||
        Math.abs(draftPosition.y - draggingCallout.startPosition.y) > 0.0001;
      if (changed) {
        if (draggingCallout.kind === "connector") {
          onPersistConnectorCalloutPosition(draggingCallout.entityId as ConnectorId, draftPosition);
        } else {
          onPersistSpliceCalloutPosition(draggingCallout.entityId as SpliceId, draftPosition);
        }
      }
    }

    setDraggingCallout(null);
    setDraftCalloutPositions((current) => {
      if (current[draggingCallout.key] === undefined) {
        return current;
      }
      const next = { ...current };
      delete next[draggingCallout.key];
      return next;
    });
  }, [
    draggingCallout,
    draftCalloutPositions,
    onPersistConnectorCalloutPosition,
    onPersistSpliceCalloutPosition
  ]);

  const stopNetworkInteractions = useCallback(() => {
    stopCalloutDrag();
    stopNetworkNodeDrag();
  }, [stopCalloutDrag, stopNetworkNodeDrag]);

  const handleExportPlanAsSvg = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const sourceSvg = networkSvgRef.current;
    if (sourceSvg === null) {
      return;
    }

    const viewBoxWidth = sourceSvg.viewBox.baseVal.width;
    const viewBoxHeight = sourceSvg.viewBox.baseVal.height;
    const fallbackRect = sourceSvg.getBoundingClientRect();
    const exportWidth = Math.max(1, Math.round(viewBoxWidth > 0 ? viewBoxWidth : fallbackRect.width));
    const exportHeight = Math.max(1, Math.round(viewBoxHeight > 0 ? viewBoxHeight : fallbackRect.height));
    const svgClone = sourceSvg.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgClone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    svgClone.setAttribute("width", String(exportWidth));
    svgClone.setAttribute("height", String(exportHeight));
    if (!svgClone.getAttribute("viewBox")) {
      svgClone.setAttribute("viewBox", `0 0 ${exportWidth} ${exportHeight}`);
    }
    copyComputedStylesToSvgClone(sourceSvg, svgClone);
    await applyExportDecorations({
      sourceSvg,
      cloneSvg: svgClone,
      width: exportWidth,
      height: exportHeight,
      includeFrame: exportIncludeFrame,
      includeCartouche: exportIncludeCartouche,
      cartoucheNetworkName: exportCartoucheNetworkName,
      cartoucheAuthor: exportCartoucheAuthor,
      cartoucheProjectCode: exportCartoucheProjectCode,
      cartoucheCreatedAt: exportCartoucheCreatedAt,
      cartoucheLogoUrl: exportCartoucheLogoUrl,
      cartoucheNotes: exportCartoucheNotes
    });

    const serializedSvg = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = `network-plan-${timestamp}.svg`;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 0);
  }, [
    exportCartoucheAuthor,
    exportCartoucheCreatedAt,
    exportCartoucheLogoUrl,
    exportCartoucheNetworkName,
    exportCartoucheNotes,
    exportCartoucheProjectCode,
    exportIncludeCartouche,
    exportIncludeFrame
  ]);

  const handleExportPlanAsPng = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const sourceSvg = networkSvgRef.current;
    if (sourceSvg === null) {
      return;
    }

    const viewBoxWidth = sourceSvg.viewBox.baseVal.width;
    const viewBoxHeight = sourceSvg.viewBox.baseVal.height;
    const fallbackRect = sourceSvg.getBoundingClientRect();
    const exportWidth = Math.max(1, Math.round(viewBoxWidth > 0 ? viewBoxWidth : fallbackRect.width));
    const exportHeight = Math.max(1, Math.round(viewBoxHeight > 0 ? viewBoxHeight : fallbackRect.height));

    const svgClone = sourceSvg.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgClone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    svgClone.setAttribute("width", String(exportWidth));
    svgClone.setAttribute("height", String(exportHeight));
    if (!svgClone.getAttribute("viewBox")) {
      svgClone.setAttribute("viewBox", `0 0 ${exportWidth} ${exportHeight}`);
    }
    copyComputedStylesToSvgClone(sourceSvg, svgClone);
    await applyExportDecorations({
      sourceSvg,
      cloneSvg: svgClone,
      width: exportWidth,
      height: exportHeight,
      includeFrame: exportIncludeFrame,
      includeCartouche: exportIncludeCartouche,
      cartoucheNetworkName: exportCartoucheNetworkName,
      cartoucheAuthor: exportCartoucheAuthor,
      cartoucheProjectCode: exportCartoucheProjectCode,
      cartoucheCreatedAt: exportCartoucheCreatedAt,
      cartoucheLogoUrl: exportCartoucheLogoUrl,
      cartoucheNotes: exportCartoucheNotes
    });

    const serializedSvg = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const nextImage = new Image();
        nextImage.decoding = "async";
        nextImage.onload = () => resolve(nextImage);
        nextImage.onerror = () => reject(new Error("Unable to render SVG export preview."));
        nextImage.src = svgUrl;
      });

      const exportScale = Math.max(1, Math.ceil(window.devicePixelRatio || 1));
      const canvas = document.createElement("canvas");
      canvas.width = exportWidth * exportScale;
      canvas.height = exportHeight * exportScale;

      const context = canvas.getContext("2d");
      if (context === null) {
        return;
      }

      context.setTransform(exportScale, 0, 0, exportScale, 0, 0);
      if (pngExportIncludeBackground) {
        const backgroundFill = resolveCanvasExportBackgroundFill(networkCanvasShellRef.current);
        if (backgroundFill !== null) {
          context.fillStyle = backgroundFill;
          context.fillRect(0, 0, exportWidth, exportHeight);
        }
      }
      context.drawImage(image, 0, 0, exportWidth, exportHeight);

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const downloadLink = document.createElement("a");
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.download = `network-plan-${timestamp}.png`;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }, [
    exportCartoucheAuthor,
    exportCartoucheCreatedAt,
    exportCartoucheLogoUrl,
    exportCartoucheNetworkName,
    exportCartoucheNotes,
    exportCartoucheProjectCode,
    exportIncludeCartouche,
    exportIncludeFrame,
    pngExportIncludeBackground
  ]);

  const handleExportPlan = useCallback(() => {
    if (canvasExportFormat === "png") {
      void handleExportPlanAsPng();
      return;
    }
    void handleExportPlanAsSvg();
  }, [canvasExportFormat, handleExportPlanAsPng, handleExportPlanAsSvg]);

  function handleNetworkNodeKeyDown(event: ReactKeyboardEvent<SVGGElement>, nodeId: NodeId): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handleNetworkNodeActivate(nodeId);
  }

  function handleNetworkSegmentKeyDown(event: ReactKeyboardEvent<SVGLineElement>, segmentId: SegmentId): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handleNetworkSegmentClick(segmentId);
  }

  const renderedCableCallouts = useMemo(() => {
    const draggingCalloutKey = draggingCallout?.key ?? null;
    return orderedCableCallouts.map((callout) => {
      const layout = buildCalloutLayoutMetrics(callout.title, "", callout.groups, calloutTextSize, showCalloutWireNames);
      const halfWidthInModelUnits = (layout.width / 2) * inverseLabelScale;
      const halfHeightInModelUnits = (layout.height / 2) * inverseLabelScale;
      const isVisibleInViewport = !(
        callout.position.x + halfWidthInModelUnits < visibleModelMinX ||
        callout.position.x - halfWidthInModelUnits > visibleModelMaxX ||
        callout.position.y + halfHeightInModelUnits < visibleModelMinY ||
        callout.position.y - halfHeightInModelUnits > visibleModelMaxY
      );
      const lineEnd = getCalloutFrameEdgePoint(
        callout.nodePosition,
        callout.position,
        layout.width,
        layout.height,
        inverseLabelScale
      );
      const calloutClassName = `network-callout-group${callout.isDeemphasized ? " is-deemphasized" : ""}${
        callout.isSelected ? " is-selected" : ""
      }${hoveredCalloutKey === callout.key ? " is-hovered" : ""}${
        draggingCalloutKey === callout.key ? " is-dragging" : ""
      }`;

      return {
        callout,
        layout,
        lineEnd,
        calloutClassName,
        isVisibleInViewport
      };
    });
  }, [
    orderedCableCallouts,
    calloutTextSize,
    showCalloutWireNames,
    inverseLabelScale,
    hoveredCalloutKey,
    draggingCallout?.key,
    visibleModelMinX,
    visibleModelMaxX,
    visibleModelMinY,
    visibleModelMaxY
  ]);

  const renderedSegments = useMemo(
    () =>
      segments.flatMap((segment) => {
        const nodeAPosition = networkNodePositions[segment.nodeA];
        const nodeBPosition = networkNodePositions[segment.nodeB];
        if (nodeAPosition === undefined || nodeBPosition === undefined) {
          return [];
        }

        const segmentSubNetworkTag = segmentSubNetworkTagById.get(segment.id) ?? "(default)";
        const isSubNetworkDeemphasized = isSubNetworkFilteringActive && !activeSubNetworkTagSet.has(segmentSubNetworkTag);
        const isWireHighlighted = selectedWireRouteSegmentIds.has(segment.id);
        const isSelectedSegment = selectedSegmentId === segment.id;
        const segmentClassName = `network-segment${isWireHighlighted ? " is-wire-highlighted" : ""}${
          isSelectedSegment ? " is-selected" : ""
        }`;
        const segmentGroupClassName = `network-entity-group${isSubNetworkDeemphasized ? " is-deemphasized" : ""}`;
        const labelX = (nodeAPosition.x + nodeBPosition.x) / 2;
        const labelY = (nodeAPosition.y + nodeBPosition.y) / 2;
        const segmentVectorX = nodeBPosition.x - nodeAPosition.x;
        const segmentVectorY = nodeBPosition.y - nodeAPosition.y;
        const segmentAngleDegrees = normalizeReadableSegmentLabelAngle(
          (Math.atan2(segmentVectorY, segmentVectorX) * 180) / Math.PI
        );
        const segmentLabelRotationDegrees = autoSegmentLabelRotation ? segmentAngleDegrees : labelRotationDegrees;
        const segmentLabelRotationRadians = (segmentLabelRotationDegrees * Math.PI) / 180;
        const segmentLabelOffsetDistance = showSegmentLengths && showSegmentNames ? 6 : 0;
        // Keep ID/length split along the label-normal axis, including when labels are auto-rotated.
        const segmentLengthLabelOffsetX = -Math.sin(segmentLabelRotationRadians) * segmentLabelOffsetDistance;
        const segmentLengthLabelOffsetY = Math.cos(segmentLabelRotationRadians) * segmentLabelOffsetDistance;

        return [
          {
            segment,
            nodeAPosition,
            nodeBPosition,
            segmentClassName,
            segmentGroupClassName,
            labelX,
            labelY,
            segmentLabelRotationDegrees,
            segmentIdLabelX: -segmentLengthLabelOffsetX,
            segmentIdLabelY: -segmentLengthLabelOffsetY,
            segmentLengthLabelX: segmentLengthLabelOffsetX,
            segmentLengthLabelY: segmentLengthLabelOffsetY
          }
        ];
      }),
    [
      segments,
      networkNodePositions,
      segmentSubNetworkTagById,
      isSubNetworkFilteringActive,
      activeSubNetworkTagSet,
      selectedWireRouteSegmentIds,
      selectedSegmentId,
      autoSegmentLabelRotation,
      labelRotationDegrees,
      showSegmentNames,
      showSegmentLengths
    ]
  );

  const renderedNodes = useMemo(
    () =>
      nodes.flatMap((node) => {
        const position = networkNodePositions[node.id];
        if (position === undefined) {
          return [];
        }

        const isSubNetworkDeemphasized =
          isSubNetworkFilteringActive && !(nodeHasActiveSubNetworkConnection.get(node.id) ?? false);
        const nodeKindClass =
          node.kind === "connector" ? "connector" : node.kind === "splice" ? "splice" : "intermediate";
        const isSelectedNode =
          selectedNodeId === node.id ||
          (node.kind === "connector" && selectedConnectorId === node.connectorId) ||
          (node.kind === "splice" && selectedSpliceId === node.spliceId);
        const nodeClassName = `network-node ${nodeKindClass}${isSelectedNode ? " is-selected" : ""}${
          isSubNetworkDeemphasized ? " is-deemphasized" : ""
        }`;
        const nodeLabel =
          node.kind === "intermediate"
            ? node.id
            : node.kind === "connector"
              ? (connectorMap.get(node.connectorId)?.technicalId ?? node.connectorId)
              : (spliceMap.get(node.spliceId)?.technicalId ?? node.spliceId);

        return [
          {
            node,
            position,
            nodeClassName,
            nodeLabel,
            isSubNetworkDeemphasized
          }
        ];
      }),
    [
      nodes,
      networkNodePositions,
      isSubNetworkFilteringActive,
      nodeHasActiveSubNetworkConnection,
      selectedNodeId,
      selectedConnectorId,
      selectedSpliceId,
      connectorMap,
      spliceMap
    ]
  );

  return (
    <section className="network-summary-stack">
      <section className="panel">
        <header className="network-summary-header">
          <h2>Network summary</h2>
          <div className="network-summary-header-actions" role="group" aria-label="Network summary display options">
            <button
              type="button"
              className={showNetworkInfoPanels ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleShowNetworkInfoPanels}
            >
              <span className="network-summary-info-icon" aria-hidden="true" />
              Info
            </button>
            <button
              type="button"
              className={showSegmentLengths ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleShowSegmentLengths}
            >
              <span className="network-summary-length-icon" aria-hidden="true" />
              Length
            </button>
            <button
              type="button"
              className={showCableCallouts ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleShowCableCallouts}
            >
              <span className="network-summary-callouts-icon" aria-hidden="true" />
              Callouts
            </button>
            <button
              type="button"
              className={showNetworkGrid ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleShowNetworkGrid}
            >
              <span className="network-summary-grid-icon" aria-hidden="true" />
              Grid
            </button>
            <button
              type="button"
              className={snapNodesToGrid ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleSnapNodesToGrid}
            >
              <span className="network-summary-snap-icon" aria-hidden="true" />
              Snap
            </button>
            <button
              type="button"
              className={lockEntityMovement ? "workspace-tab is-active" : "workspace-tab"}
              onClick={toggleLockEntityMovement}
            >
              <span className="network-summary-lock-move-icon" aria-hidden="true" />
              Lock
            </button>
            <button
              type="button"
              className="workspace-tab network-summary-export-button"
              onClick={handleExportPlan}
              disabled={nodes.length === 0}
            >
              <span className="network-summary-export-icon" aria-hidden="true" />
              {canvasExportFormat.toUpperCase()}
            </button>
            <button
              type="button"
              className="workspace-tab network-summary-export-button"
              onClick={onExportBomCsv}
              disabled={!canExportBomCsv}
            >
              <span className="table-export-icon" aria-hidden="true" />
              BOM
            </button>
          </div>
        </header>
        <div className="network-summary-canvas-region">
          {nodes.length === 0 ? (
            <p className="empty-copy">No nodes yet. Create nodes and segments to render the 2D network.</p>
          ) : (
            <div ref={networkCanvasShellRef} className={`network-canvas-shell${isPanningNetwork ? " is-panning" : ""}`}>
              <NetworkCanvasFloatingInfoPanels
                showNetworkInfoPanels={showNetworkInfoPanels}
                handleZoomAction={handleZoomAction}
                fitNetworkToContent={fitNetworkToContent}
                onRegenerateLayout={onRegenerateLayout}
                networkScalePercent={networkScalePercent}
                subNetworkSummaries={subNetworkSummaries}
                activeSubNetworkTags={activeSubNetworkTagSet}
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
              <g transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}>
                {renderedCableCallouts.map(({ callout, lineEnd, calloutClassName }) => (
                  <g key={`${callout.key}-leader`} className={calloutClassName}>
                    <line
                      className="network-callout-leader-line"
                      x1={callout.nodePosition.x}
                      y1={callout.nodePosition.y}
                      x2={lineEnd.x}
                      y2={lineEnd.y}
                    />
                  </g>
                ))}
              </g>
              {showNetworkGrid ? (
                <g className="network-grid" transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}>
                  {gridXPositions.map((position) => {
                    return (
                      <line key={`grid-v-${position}`} x1={position} y1={visibleModelMinY} x2={position} y2={visibleModelMaxY} />
                    );
                  })}
                  {gridYPositions.map((position) => {
                    return (
                      <line key={`grid-h-${position}`} x1={visibleModelMinX} y1={position} x2={visibleModelMaxX} y2={position} />
                    );
                  })}
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
                        handleNetworkSegmentClick(segment.id);
                      }}
                      onKeyDown={(event) => handleNetworkSegmentKeyDown(event, segment.id)}
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
                {renderedNodes.map(({ node, position, nodeClassName }) => {
                  const connectorWidth = 46 * normalizedNodeShapeScale;
                  const connectorHeight = 30 * normalizedNodeShapeScale;
                  const spliceDiamondSize = 30 * normalizedNodeShapeScale;
                  const connectorHitboxWidth = 56 * normalizedNodeShapeScale;
                  const connectorHitboxHeight = 40 * normalizedNodeShapeScale;
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
                      onMouseDown={(event) => handleNetworkNodeMouseDown(event, node.id)}
                      onKeyDown={(event) => handleNetworkNodeKeyDown(event, node.id)}
                      onClick={(event) => {
                        // Selection/editing is handled on mouse-down to support immediate drag interactions.
                        // Keep click from bubbling to future parent click handlers.
                        event.stopPropagation();
                      }}
                    >
                      <title>{describeNode(node)}</title>
                      <g className={zoomInvariantNodeShapes ? "network-node-shape-anchor" : undefined} transform={zoomInvariantNodeShapes ? shapeAnchorTransform : undefined}>
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
                        <g
                          className="network-segment-label-anchor"
                          transform={`translate(${labelX} ${labelY}) scale(${inverseLabelScale})`}
                        >
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
                            {segment.lengthMm} mm
                          </text>
                        </g>
                      ) : null}
                    </g>
                  )
                )}

                {renderedNodes.map(({ node, position, nodeLabel, isSubNetworkDeemphasized }) => (
                  <g
                    key={`${node.id}-label`}
                    className={`network-entity-group${isSubNetworkDeemphasized ? " is-deemphasized" : ""}`}
                    data-node-id={node.id}
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
                ))}
              </g>

              <g
                className="network-graph-layer network-graph-layer-callouts"
                transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
              >
                {renderedCableCallouts.map(({ callout, layout, calloutClassName, isVisibleInViewport }) => {
                  const contentLeftX = -layout.width / 2 + 4;
                  const headerY = -layout.height / 2 + layout.headerY;
                  const rowsStartY = -layout.height / 2 + layout.rowsStartY;
                  const lastColumn = layout.columns[layout.columns.length - 1];
                  const tableRightX =
                    lastColumn === undefined ? contentLeftX : contentLeftX + lastColumn.x + lastColumn.width;

                  return (
                    <g
                      key={callout.key}
                      className={calloutClassName}
                      onMouseEnter={() => setHoveredCalloutKey(callout.key)}
                      onMouseLeave={() => {
                        setHoveredCalloutKey((current) => (current === callout.key ? null : current));
                      }}
                    >
                      <g
                        className="network-callout-anchor"
                        transform={`translate(${callout.position.x} ${callout.position.y}) scale(${inverseLabelScale})`}
                        role="button"
                        tabIndex={isVisibleInViewport ? 0 : -1}
                        focusable={isVisibleInViewport ? "true" : "false"}
                        aria-hidden={isVisibleInViewport ? undefined : true}
                        aria-label={`Select ${callout.kind} ${callout.title}`}
                        style={isVisibleInViewport ? undefined : { pointerEvents: "none" }}
                        onMouseDown={(event) => handleCalloutMouseDown(event, callout)}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") {
                            return;
                          }
                          event.preventDefault();
                          event.stopPropagation();
                          if (callout.kind === "connector") {
                            onSelectConnectorFromCallout(callout.entityId as ConnectorId);
                          } else {
                            onSelectSpliceFromCallout(callout.entityId as SpliceId);
                          }
                        }}
                      >
                        <rect
                          className="network-callout-frame"
                          x={-layout.width / 2}
                          y={-layout.height / 2}
                          width={layout.width}
                          height={layout.height}
                        />
                        <g className="network-callout-content">
                          <text
                            className="network-callout-title"
                            x={-layout.width / 2 + 4}
                            y={-layout.height / 2 + layout.titleStartY}
                            textAnchor="start"
                            dominantBaseline="hanging"
                          >
                            {callout.title}
                          </text>
                          {layout.subtitleStartY !== null ? (
                            <text
                              className="network-callout-subtitle"
                              x={-layout.width / 2 + 4}
                              y={-layout.height / 2 + layout.subtitleStartY}
                              textAnchor="start"
                              dominantBaseline="hanging"
                            >
                              {callout.subtitle}
                            </text>
                          ) : null}
                          {layout.columns.map((column) => {
                            const x =
                              column.textAnchor === "end"
                                ? contentLeftX + column.x + column.width
                                : contentLeftX + column.x;
                            return (
                              <text
                                key={`${callout.key}-header-${column.key}`}
                                className="network-callout-table-header-cell"
                                x={x}
                                y={headerY}
                                textAnchor={column.textAnchor}
                                dominantBaseline="hanging"
                                data-locale-exempt={
                                  column.key === "technicalId" ||
                                  column.key === "color" ||
                                  column.key === "targetId" ||
                                  column.key === "length" ||
                                  column.key === "section"
                                    ? "true"
                                    : undefined
                                }
                              >
                                {column.header}
                              </text>
                            );
                          })}
                          <line
                            className="network-callout-table-divider"
                            x1={contentLeftX}
                            y1={rowsStartY - 0.35}
                            x2={tableRightX}
                            y2={rowsStartY - 0.35}
                          />
                          {layout.rows.map((row, rowIndex) => {
                            const rowY = rowsStartY + rowIndex * layout.rowStep;
                            const isSelectedWireRow = selectedWireId !== null && row.wireId === selectedWireId;
                            const rowClassName = `network-callout-table-row${isSelectedWireRow ? " is-selected-wire" : ""}`;
                            return (
                              <g
                                key={`${callout.key}-row-${rowIndex}`}
                                className={rowClassName}
                                data-wire-id={row.wireId}
                              >
                                {isSelectedWireRow ? (
                                  <rect
                                    className="network-callout-table-row-highlight"
                                    x={contentLeftX - 0.8}
                                    y={rowY - 0.25}
                                    width={Math.max(0, tableRightX - contentLeftX + 1.6)}
                                    height={layout.rowHeight + 0.45}
                                    rx={0.5}
                                    ry={0.5}
                                  />
                                ) : null}
                                {layout.columns.map((column) => {
                                  const x =
                                    column.textAnchor === "end"
                                      ? contentLeftX + column.x + column.width
                                      : contentLeftX + column.x;
                                  if (column.key === "color") {
                                    const swatchWidth = getCalloutColorSwatchesWidth(row);
                                    const dotDiameter = CALLOUT_COLOR_SWATCH_RADIUS * 2;
                                    const swatchCenterY = rowY + layout.rowHeight / 2;
                                    return (
                                      <g key={`${callout.key}-row-${rowIndex}-${column.key}`}>
                                        {row.colorPrimaryHex !== null ? (
                                          <circle
                                            className="network-callout-color-dot"
                                            cx={x + CALLOUT_COLOR_SWATCH_RADIUS}
                                            cy={swatchCenterY}
                                            r={CALLOUT_COLOR_SWATCH_RADIUS}
                                            fill={row.colorPrimaryHex}
                                          />
                                        ) : null}
                                        {row.colorSecondaryHex !== null ? (
                                          <circle
                                            className="network-callout-color-dot"
                                            cx={x + CALLOUT_COLOR_SWATCH_RADIUS + dotDiameter + CALLOUT_COLOR_SWATCH_GAP}
                                            cy={swatchCenterY}
                                            r={CALLOUT_COLOR_SWATCH_RADIUS}
                                            fill={row.colorSecondaryHex}
                                          />
                                        ) : null}
                                        <text
                                          className={`network-callout-table-cell${isSelectedWireRow ? " is-selected-wire" : ""}`}
                                          x={x + swatchWidth}
                                          y={rowY}
                                          textAnchor={column.textAnchor}
                                          dominantBaseline="hanging"
                                        >
                                          {getCalloutRowCellValue(row, column.key)}
                                        </text>
                                      </g>
                                    );
                                  }
                                  return (
                                    <text
                                      key={`${callout.key}-row-${rowIndex}-${column.key}`}
                                      className={`network-callout-table-cell${isSelectedWireRow ? " is-selected-wire" : ""}`}
                                      x={x}
                                      y={rowY}
                                      textAnchor={column.textAnchor}
                                      dominantBaseline="hanging"
                                    >
                                      {getCalloutRowCellValue(row, column.key)}
                                    </text>
                                  );
                                })}
                              </g>
                            );
                          })}
                        </g>
                      </g>
                    </g>
                  );
                })}
              </g>
              </svg>
            </div>
          )}
        </div>
        <p className="empty-copy network-summary-mobile-unavailable" role="status">
          2D network summary is not available on mobile. Use a wider screen to access the canvas controls and legend.
        </p>
        <NetworkSummaryLegend />
      </section>
      <NetworkRoutePreviewPanel
        nodes={nodes}
        describeNode={describeNode}
        routePreviewStartNodeId={routePreviewStartNodeId}
        setRoutePreviewStartNodeId={setRoutePreviewStartNodeId}
        routePreviewEndNodeId={routePreviewEndNodeId}
        setRoutePreviewEndNodeId={setRoutePreviewEndNodeId}
        routePreview={routePreview}
      />
      <section className="panel network-summary-quick-entity-nav-panel" aria-label="Quick entity navigation">
        <div className="network-summary-quick-entity-nav" role="group" aria-label="Quick entity navigation strip">
          {QUICK_ENTITY_NAV_ITEMS[quickEntityNavigationMode].map((item) => (
            <button
              key={item.subScreen}
              type="button"
              className={activeSubScreen === item.subScreen ? "filter-chip is-active" : "filter-chip"}
              onClick={() => onQuickEntityNavigation(item.subScreen)}
              aria-pressed={activeSubScreen === item.subScreen}
            >
              <span
                className={`action-button-icon network-summary-quick-entity-nav-icon ${SUB_SCREEN_ICON_CLASS_BY_ID[item.subScreen]}`}
                aria-hidden="true"
              />
              <span className="network-summary-quick-entity-nav-label">{item.label}</span>
              <span className="filter-chip-count">{entityCountBySubScreen[item.subScreen]}</span>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}
