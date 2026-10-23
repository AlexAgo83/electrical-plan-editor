import {
  formatIsoToLocalDateInput,
  isNetworkLogoUrlValid,
  normalizeNetworkLogoUrl,
  normalizeNetworkPlanParties,
  type NetworkPlanParties
} from "../../../../core/networkMetadata";
import { translateCurrent as t } from "../../../lib/i18n";
import { getCanvasTextMeasurementContext } from "../../../lib/canvasTextMeasurement";
import { NETWORK_GRID_STEP } from "../../../lib/app-utils-shared";

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

type ExportLogoAsset = { kind: "image"; href: string } | { kind: "fallback" };

export interface ApplyExportDecorationsParams {
  sourceSvg: SVGSVGElement;
  cloneSvg: SVGSVGElement;
  width: number;
  height: number;
  includeFrame: boolean;
  includeCartouche: boolean;
  cartoucheNetworkName: string;
  cartoucheAuthor?: string;
  cartoucheProjectCode?: string;
  cartouchePlanRevision?: string;
  /** Calendar date `YYYY-MM-DD`, rendered verbatim (never timezone-shifted). */
  cartouchePlanIssueDate?: string;
  /** Plan-level manufacturer/supplier names and references of the exported network. */
  cartouchePlanParties?: NetworkPlanParties;
  cartoucheCreatedAt: string;
  cartoucheLogoUrl?: string;
  cartoucheNotes?: string;
}

/** Final export size after decorations; the cartouche can grow the height for wrapped rows. */
export interface ExportDecorationsResult {
  width: number;
  height: number;
}

/** Upper bound of wrapped lines per plan party row (a 120-character code at minimum width). */
const CARTOUCHE_PLAN_PARTY_MAX_LINES = 16;

/**
 * Localized cartouche row for one plan party role; company names and references stay literal.
 * Returns null when both values are unset so the role is omitted.
 */
export function formatCartouchePlanPartyRow(
  role: "Manufacturer" | "Supplier",
  name: string | undefined,
  reference: string | undefined
): string | null {
  if (name !== undefined && reference !== undefined) {
    return t(`ui.exportCartouchePlan${role}Row`, { name, reference });
  }
  if (reference !== undefined) {
    return t(`ui.exportCartouchePlan${role}ReferenceRow`, { reference });
  }
  if (name !== undefined) {
    return t(`ui.exportCartouchePlan${role}NameRow`, { name });
  }
  return null;
}

export function copyComputedStylesToSvgClone(sourceSvg: SVGSVGElement, cloneSvg: SVGSVGElement): void {
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

export function disableSvgCloneInteractivity(cloneSvg: SVGSVGElement): void {
  const interactiveElements = [cloneSvg, ...Array.from(cloneSvg.querySelectorAll("*"))] as SVGElement[];
  for (const element of interactiveElements) {
    element.removeAttribute("role");
    element.removeAttribute("tabindex");
    element.removeAttribute("focusable");
    element.removeAttribute("aria-label");
    element.removeAttribute("aria-pressed");
    element.removeAttribute("aria-selected");
    element.style.removeProperty("cursor");
    element.style.setProperty("pointer-events", "none");
  }
}

export function removeGlobalRenderScaleFromSvgClone(params: {
  cloneSvg: SVGSVGElement;
  networkOffset: { x: number; y: number };
  networkScale: number;
  renderedNetworkScale: number;
  width: number;
  height: number;
}): void {
  const renderedScale = params.renderedNetworkScale;
  const baseScale = params.networkScale;
  if (!Number.isFinite(renderedScale) || !Number.isFinite(baseScale) || renderedScale <= 0) {
    return;
  }

  const transformPattern = /^translate\(([-+\d.eE]+)\s+([-+\d.eE]+)\)\s+scale\(([-+\d.eE]+)\)$/;
  const transformElements = Array.from(params.cloneSvg.querySelectorAll<SVGElement>("[transform]"));
  for (const element of transformElements) {
    const transform = element.getAttribute("transform")?.trim() ?? "";
    const match = transform.match(transformPattern);
    if (match === null) {
      continue;
    }

    const [, rawX, rawY, rawScale] = match;
    const x = Number(rawX);
    const y = Number(rawY);
    const scale = Number(rawScale);
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(scale) ||
      Math.abs(x - params.networkOffset.x) > 0.0001 ||
      Math.abs(y - params.networkOffset.y) > 0.0001 ||
      Math.abs(scale - renderedScale) > 0.0001
    ) {
      continue;
    }

    element.setAttribute("transform", `translate(${params.networkOffset.x} ${params.networkOffset.y}) scale(${baseScale})`);
  }

  const gridLayer = params.cloneSvg.querySelector<SVGGElement>(".network-grid");
  if (gridLayer === null || baseScale <= 0) {
    return;
  }
  const gridLineStyle =
    gridLayer.querySelector<SVGLineElement>("line")?.getAttribute("style") ||
    "stroke: #d5e1eb; stroke-width: 1; vector-effect: non-scaling-stroke;";

  const visibleModelMinX = (0 - params.networkOffset.x) / baseScale;
  const visibleModelMaxX = (params.width - params.networkOffset.x) / baseScale;
  const visibleModelMinY = (0 - params.networkOffset.y) / baseScale;
  const visibleModelMaxY = (params.height - params.networkOffset.y) / baseScale;
  const gridStartX = Math.floor(visibleModelMinX / NETWORK_GRID_STEP) * NETWORK_GRID_STEP;
  const gridEndX = Math.ceil(visibleModelMaxX / NETWORK_GRID_STEP) * NETWORK_GRID_STEP;
  const gridStartY = Math.floor(visibleModelMinY / NETWORK_GRID_STEP) * NETWORK_GRID_STEP;
  const gridEndY = Math.ceil(visibleModelMaxY / NETWORK_GRID_STEP) * NETWORK_GRID_STEP;

  gridLayer.replaceChildren();
  for (let x = gridStartX; x <= gridEndX; x += NETWORK_GRID_STEP) {
    const line = createSvgElement("line");
    if (gridLineStyle.length > 0) {
      line.setAttribute("style", gridLineStyle);
    }
    line.setAttribute("x1", String(x));
    line.setAttribute("y1", String(visibleModelMinY));
    line.setAttribute("x2", String(x));
    line.setAttribute("y2", String(visibleModelMaxY));
    gridLayer.appendChild(line);
  }
  for (let y = gridStartY; y <= gridEndY; y += NETWORK_GRID_STEP) {
    const line = createSvgElement("line");
    if (gridLineStyle.length > 0) {
      line.setAttribute("style", gridLineStyle);
    }
    line.setAttribute("x1", String(visibleModelMinX));
    line.setAttribute("y1", String(y));
    line.setAttribute("x2", String(visibleModelMaxX));
    line.setAttribute("y2", String(y));
    gridLayer.appendChild(line);
  }
}

export function resolveCanvasExportBackgroundFill(shellElement: HTMLElement | null): string | null {
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

function clampNumberValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveElementStyleValue(style: CSSStyleDeclaration, property: string, fallback: string): string {
  const value = style.getPropertyValue(property).trim();
  return value.length > 0 ? value : fallback;
}

function isUninformativeSvgColor(value: string): boolean {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  return (
    normalized.length === 0 ||
    normalized === "transparent" ||
    normalized === "currentcolor" ||
    normalized === "#000" ||
    normalized === "#000000" ||
    normalized === "rgb(0, 0, 0)" ||
    normalized === "rgba(0, 0, 0, 0)"
  );
}

function resolveCartoucheColor(style: CSSStyleDeclaration, property: string, fallback: string): string {
  const value = style.getPropertyValue(property).trim();
  return isUninformativeSvgColor(value) ? fallback : value;
}

function measureTextWidth(text: string, font: string): number {
  const canvas = document.createElement("canvas");
  const context = getCanvasTextMeasurementContext(canvas);
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

function createSvgElement<K extends keyof SVGElementTagNameMap>(tagName: K): SVGElementTagNameMap[K] {
  return document.createElementNS("http://www.w3.org/2000/svg", tagName);
}

async function readBlobAsDataUrl(blob: Blob): Promise<string> {
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

function isSvgDataUri(value: string): boolean {
  return /^data:image\/(svg\+xml|svg);/i.test(value.trim());
}

async function resolveExportLogoAsset(logoUrl: string | undefined): Promise<ExportLogoAsset> {
  const normalizedLogoUrl = normalizeNetworkLogoUrl(logoUrl);
  if (normalizedLogoUrl === undefined || !isNetworkLogoUrlValid(normalizedLogoUrl)) {
    return { kind: "fallback" };
  }

  if (normalizedLogoUrl.toLowerCase().startsWith("data:image/")) {
    if (isSvgDataUri(normalizedLogoUrl)) {
      return { kind: "fallback" };
    }
    return { kind: "image", href: normalizedLogoUrl };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(normalizedLogoUrl, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal
    });
    if (!response.ok) {
      return { kind: "fallback" };
    }
    const blob = await response.blob();
    if (!blob.type.startsWith("image/") || blob.type.includes("svg")) {
      return { kind: "fallback" };
    }
    const dataUrl = await readBlobAsDataUrl(blob);
    return { kind: "image", href: dataUrl };
  } catch {
    return { kind: "fallback" };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function appendExportFrameOverlay(params: {
  sourceSvg: SVGSVGElement;
  cloneSvg: SVGSVGElement;
  width: number;
  height: number;
}): void {
  const segmentSource =
    params.sourceSvg.querySelector(".network-segment:not(.is-wire-highlighted):not(.is-selected)") ??
    params.sourceSvg.querySelector(".network-segment");
  const svgStyle = window.getComputedStyle(params.sourceSvg);
  const segmentStyle = window.getComputedStyle(segmentSource ?? params.sourceSvg);
  const segmentBaseColor = svgStyle.getPropertyValue("--network-segment-color").trim();
  const strokeColor =
    segmentBaseColor.length > 0
      ? segmentBaseColor
      : resolveElementStyleValue(segmentStyle, "stroke", "var(--network-segment-color, #7f99af)");
  const segmentBaseStrokeWidth = svgStyle.getPropertyValue("--network-segment-stroke-width").trim();
  const parsedStrokeWidth = Number.parseFloat(
    segmentBaseStrokeWidth.length > 0
      ? segmentBaseStrokeWidth
      : resolveElementStyleValue(segmentStyle, "stroke-width", "3")
  );
  const strokeWidth = Number.isFinite(parsedStrokeWidth) ? clampNumberValue(parsedStrokeWidth, 1.4, 3.4) : 2.2;
  const margin = Math.max(10, Math.round(Math.min(params.width, params.height) * 0.018));

  const frame = createSvgElement("rect");
  frame.setAttribute("class", "network-export-frame");
  frame.setAttribute("x", String(margin));
  frame.setAttribute("y", String(margin));
  frame.setAttribute("width", String(Math.max(1, params.width - margin * 2)));
  frame.setAttribute("height", String(Math.max(1, params.height - margin * 2)));
  frame.setAttribute("rx", "0");
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
  planRevision?: string;
  planIssueDate?: string;
  planParties?: NetworkPlanParties;
  createdAt: string;
  notes?: string;
  logoAsset: ExportLogoAsset;
}): number {
  const frameSource = params.sourceSvg.querySelector(".network-callout-frame");
  const connectorShapeSource = params.sourceSvg.querySelector(".network-node.connector .network-node-shape");
  const genericNodeShapeSource = params.sourceSvg.querySelector(".network-node .network-node-shape");
  const titleSource = params.sourceSvg.querySelector(".network-callout-title");
  const rowTextSource =
    params.sourceSvg.querySelector(".network-callout-row-text") ??
    titleSource ??
    params.sourceSvg.querySelector(".network-node-label");
  const frameStyle = window.getComputedStyle(frameSource ?? connectorShapeSource ?? genericNodeShapeSource ?? params.sourceSvg);
  const rowStyle = window.getComputedStyle(rowTextSource ?? params.sourceSvg);
  const titleStyle = window.getComputedStyle(titleSource ?? rowTextSource ?? params.sourceSvg);

  const fillColor = resolveCartoucheColor(frameStyle, "fill", "rgba(223, 240, 255, 0.92)");
  const fillOpacity = resolveElementStyleValue(frameStyle, "fill-opacity", "0.92");
  const strokeColor = resolveCartoucheColor(frameStyle, "stroke", "var(--network-node-stroke-color, #55748d)");
  const textColor = resolveCartoucheColor(rowStyle, "fill", "var(--network-node-label-color, #183549)");
  const subtleTextColor = resolveCartoucheColor(
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
  const planParties = normalizeNetworkPlanParties(params.planParties ?? {});
  const planPartyRows = [
    formatCartouchePlanPartyRow("Manufacturer", planParties.planManufacturerName, planParties.planManufacturerReference),
    formatCartouchePlanPartyRow("Supplier", planParties.planSupplierName, planParties.planSupplierReference)
  ].flatMap((text) => (text === null ? [] : [{ text, isTitle: false, wraps: true }]));
  const metadataRows: Array<{ text: string; isTitle: boolean; wraps?: boolean }> = [
    { text: `Network: ${normalizedNetworkName}`, isTitle: true },
    ...(params.author?.trim() ? [{ text: `Author: ${params.author.trim()}`, isTitle: false }] : []),
    ...(params.projectCode?.trim() ? [{ text: `Code: ${params.projectCode.trim()}`, isTitle: false }] : []),
    ...(params.planRevision?.trim()
      ? [{ text: t("ui.exportCartouchePlanRevisionRow", { value: params.planRevision.trim() }), isTitle: false }]
      : []),
    ...(params.planIssueDate?.trim()
      ? [{ text: t("ui.exportCartouchePlanIssueDateRow", { value: params.planIssueDate.trim() }), isTitle: false }]
      : []),
    ...planPartyRows,
    { text: `Created: ${createdAtLabel.length > 0 ? createdAtLabel : "N/A"}`, isTitle: false }
  ];
  const metadataMaxContentWidth = metadataRows.reduce((maxWidth, row) => {
    const rowFont = row.isTitle ? `700 11px ${titleFontFamily}` : `600 9.6px ${fontFamily}`;
    return Math.max(maxWidth, measureTextWidth(row.text, rowFont));
  }, 0);
  const maxCartoucheWidth = Math.min(
    clampNumberValue(Math.round(params.width * 0.8), 250, 620),
    Math.max(180, params.width - margin * 2)
  );
  const minCartoucheWidth = Math.min(210, maxCartoucheWidth);
  const metadataDrivenWidth = padding * 2 + logoWidth + 10 + metadataMaxContentWidth + 8;
  const cartoucheWidth = clampNumberValue(Math.round(metadataDrivenWidth), minCartoucheWidth, maxCartoucheWidth);
  const metadataWidth = cartoucheWidth - padding * 2 - logoWidth - 10;
  const notesLines = wrapTextWithClamp(params.notes ?? "", cartoucheWidth - padding * 2, notesFont, 8);
  const hasNotes = notesLines.length > 0;
  const renderedMetadataRows = metadataRows.map((metadataRow) => {
    const rowFont = metadataRow.isTitle ? `700 11px ${titleFontFamily}` : `600 9.6px ${fontFamily}`;
    const lines =
      metadataRow.wraps === true
        ? wrapTextWithClamp(metadataRow.text, metadataWidth, rowFont, CARTOUCHE_PLAN_PARTY_MAX_LINES)
        : [
            measureTextWidth(metadataRow.text, rowFont) > metadataWidth
              ? truncateLineWithEllipsis(metadataRow.text, metadataWidth, rowFont)
              : metadataRow.text
          ];
    return { ...metadataRow, lines };
  });
  const metadataLineCount = renderedMetadataRows.reduce((count, row) => count + row.lines.length, 0);
  const metadataHeight = Math.max(logoHeight, metadataLineCount * metadataLineHeight);
  const notesBlockHeight = hasNotes ? 8 + 12 + notesLines.length * notesLineHeight : 0;
  const cartoucheHeight = padding * 2 + metadataHeight + notesBlockHeight;
  const exportHeight = Math.max(params.height, cartoucheHeight + margin * 2);
  const cartoucheX = Math.max(margin, params.width - margin - cartoucheWidth);
  const cartoucheY = Math.max(margin, exportHeight - margin - cartoucheHeight);

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

  let metadataLineIndex = 0;
  renderedMetadataRows.forEach((metadataRow) => {
    const row = createSvgElement("text");
    const rowX = String(cartoucheX + metadataX);
    row.setAttribute("class", "network-export-cartouche-meta");
    row.setAttribute("x", rowX);
    row.setAttribute("y", String(cartoucheY + padding + 11 + metadataLineIndex * metadataLineHeight));
    row.setAttribute("fill", metadataRow.isTitle ? textColor : subtleTextColor);
    row.setAttribute("font-family", metadataRow.isTitle ? titleFontFamily : fontFamily);
    row.setAttribute("font-size", metadataRow.isTitle ? "11px" : "9.6px");
    row.setAttribute("font-weight", metadataRow.isTitle ? "700" : "600");
    if (metadataRow.lines.length === 1) {
      row.textContent = metadataRow.lines[0] ?? "";
    } else {
      metadataRow.lines.forEach((line, lineIndex) => {
        const lineSpan = createSvgElement("tspan");
        lineSpan.setAttribute("x", rowX);
        lineSpan.setAttribute("dy", lineIndex === 0 ? "0" : String(metadataLineHeight));
        lineSpan.textContent = line;
        row.appendChild(lineSpan);
      });
    }
    metadataLineIndex += metadataRow.lines.length;
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
  return exportHeight;
}

function resizeSvgCloneHeight(cloneSvg: SVGSVGElement, width: number, height: number): void {
  cloneSvg.setAttribute("height", String(height));
  if (cloneSvg.hasAttribute("viewBox")) {
    cloneSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }
}

export async function applyExportDecorations(params: ApplyExportDecorationsParams): Promise<ExportDecorationsResult> {
  let height = params.height;
  if (params.includeCartouche) {
    const logoAsset = await resolveExportLogoAsset(params.cartoucheLogoUrl);
    height = appendExportCartoucheOverlay({
      sourceSvg: params.sourceSvg,
      cloneSvg: params.cloneSvg,
      width: params.width,
      height: params.height,
      networkName: params.cartoucheNetworkName,
      author: params.cartoucheAuthor,
      projectCode: params.cartoucheProjectCode,
      planRevision: params.cartouchePlanRevision,
      planIssueDate: params.cartouchePlanIssueDate,
      planParties: params.cartouchePlanParties,
      createdAt: params.cartoucheCreatedAt,
      notes: params.cartoucheNotes,
      logoAsset
    });
    if (height > params.height) {
      resizeSvgCloneHeight(params.cloneSvg, params.width, height);
    }
  }

  if (params.includeFrame) {
    appendExportFrameOverlay({
      sourceSvg: params.sourceSvg,
      cloneSvg: params.cloneSvg,
      width: params.width,
      height
    });
  }

  return { width: params.width, height };
}

export async function exportCanvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  if (typeof canvas.toBlob === "function") {
    const blobFromToBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
    if (blobFromToBlob !== null) {
      return blobFromToBlob;
    }
  }

  const dataUrl = canvas.toDataURL("image/png");
  const response = await fetch(dataUrl);
  return response.blob();
}
