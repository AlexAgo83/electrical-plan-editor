import { useCallback, useRef, useState, type RefObject } from "react";
import type { ThemeMode } from "../../../../store";
import { buildTimestampedFileName } from "../../../lib/exportFileName";
import { getCanvasTextMeasurementContext } from "../../../lib/canvasTextMeasurement";
import { getThemeClassNames } from "../../../lib/themeModes";
import {
  applyExportDecorations,
  copyComputedStylesToSvgClone,
  disableSvgCloneInteractivity,
  removeGlobalRenderScaleFromSvgClone,
  resolveCanvasExportBackgroundFill
} from "./networkSummaryExport";

interface UseNetworkSummaryExportActionsParams {
  networkSvgRef: RefObject<SVGSVGElement | null>;
  networkCanvasShellRef: RefObject<HTMLDivElement | null>;
  networkOffset: { x: number; y: number };
  networkScale: number;
  renderedNetworkScale: number;
  themeMode: ThemeMode;
  pngExportIncludeBackground: boolean;
  exportIncludeFrame: boolean;
  exportIncludeCartouche: boolean;
  exportIncludeGrid?: boolean;
  exportCartoucheNetworkName: string;
  exportCartoucheAuthor?: string;
  exportCartoucheProjectCode?: string;
  exportCartoucheCreatedAt: string;
  exportCartoucheLogoUrl?: string;
  exportCartoucheNotes?: string;
}

interface PreparedSvgExport {
  svgClone: SVGSVGElement;
  exportWidth: number;
  exportHeight: number;
}

interface FittedSvgExport extends PreparedSvgExport {
  deltaX: number;
  deltaY: number;
}

export interface SvgExportPreviewState {
  format: "svg" | "png";
  svgMarkup: string;
  pngDataUrl?: string;
  exportWidth: number;
  exportHeight: number;
  includeFrame: boolean;
  includeCartouche: boolean;
  includeGrid: boolean;
  fitToContent: boolean;
  themeMode: ThemeMode;
}

export type CanvasPreviewFormat = "svg" | "png";

export interface SvgPreviewOptions {
  format?: CanvasPreviewFormat;
  includeFrame?: boolean;
  includeCartouche?: boolean;
  includeGrid?: boolean;
  fitToContent?: boolean;
  themeMode?: ThemeMode;
}

interface SvgBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface Matrix2d {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

const SVG_FIT_EXPORT_PADDING = 48;
const SVG_TEXT_FALLBACK_WIDTH_FACTOR = 7.2;
const SVG_TEXT_FALLBACK_HEIGHT = 16;

const IDENTITY_MATRIX: Matrix2d = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

function multiplyMatrix(left: Matrix2d, right: Matrix2d): Matrix2d {
  return {
    a: left.a * right.a + left.c * right.b,
    b: left.b * right.a + left.d * right.b,
    c: left.a * right.c + left.c * right.d,
    d: left.b * right.c + left.d * right.d,
    e: left.a * right.e + left.c * right.f + left.e,
    f: left.b * right.e + left.d * right.f + left.f
  };
}

function translateMatrix(x: number, y: number): Matrix2d {
  return { a: 1, b: 0, c: 0, d: 1, e: x, f: y };
}

function scaleMatrix(x: number, y: number): Matrix2d {
  return { a: x, b: 0, c: 0, d: y, e: 0, f: 0 };
}

function rotateMatrix(degrees: number): Matrix2d {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 };
}

function applyMatrix(matrix: Matrix2d, point: { x: number; y: number }): { x: number; y: number } {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f
  };
}

function expandBounds(bounds: SvgBounds | null, next: SvgBounds): SvgBounds {
  if (bounds === null) {
    return next;
  }
  return {
    minX: Math.min(bounds.minX, next.minX),
    maxX: Math.max(bounds.maxX, next.maxX),
    minY: Math.min(bounds.minY, next.minY),
    maxY: Math.max(bounds.maxY, next.maxY)
  };
}

function boundsFromPoints(points: Array<{ x: number; y: number }>, matrix: Matrix2d): SvgBounds | null {
  const transformed = points.map((point) => applyMatrix(matrix, point));
  const firstPoint = transformed[0];
  if (firstPoint === undefined) {
    return null;
  }
  return transformed.slice(1).reduce<SvgBounds>(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      maxX: Math.max(bounds.maxX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxY: Math.max(bounds.maxY, point.y)
    }),
    { minX: firstPoint.x, maxX: firstPoint.x, minY: firstPoint.y, maxY: firstPoint.y }
  );
}

function getNumberAttribute(element: SVGElement, name: string, fallback = 0): number {
  const value = Number(element.getAttribute(name));
  return Number.isFinite(value) ? value : fallback;
}

function parseTransform(transform: string | null): Matrix2d {
  if (transform === null || transform.trim().length === 0) {
    return IDENTITY_MATRIX;
  }

  const commandPattern = /([a-zA-Z]+)\(([^)]*)\)/g;
  let matrix = IDENTITY_MATRIX;
  for (const match of transform.matchAll(commandPattern)) {
    const [, command, rawArgs = ""] = match;
    const args = rawArgs
      .trim()
      .split(/[\s,]+/)
      .filter((part) => part.length > 0)
      .map(Number);
    if (args.some((value) => !Number.isFinite(value))) {
      continue;
    }
    if (command === "translate") {
      matrix = multiplyMatrix(matrix, translateMatrix(args[0] ?? 0, args[1] ?? 0));
    } else if (command === "scale") {
      matrix = multiplyMatrix(matrix, scaleMatrix(args[0] ?? 1, args[1] ?? args[0] ?? 1));
    } else if (command === "rotate") {
      const rotation = rotateMatrix(args[0] ?? 0);
      if (args.length >= 3) {
        matrix = multiplyMatrix(matrix, translateMatrix(args[1] ?? 0, args[2] ?? 0));
        matrix = multiplyMatrix(matrix, rotation);
        matrix = multiplyMatrix(matrix, translateMatrix(-(args[1] ?? 0), -(args[2] ?? 0)));
      } else {
        matrix = multiplyMatrix(matrix, rotation);
      }
    }
  }
  return matrix;
}

function getElementOwnBounds(element: SVGElement, matrix: Matrix2d): SvgBounds | null {
  const tagName = element.tagName.toLowerCase();
  if (tagName === "line") {
    const strokePadding = 4;
    const bounds = boundsFromPoints(
      [
        { x: getNumberAttribute(element, "x1"), y: getNumberAttribute(element, "y1") },
        { x: getNumberAttribute(element, "x2"), y: getNumberAttribute(element, "y2") }
      ],
      matrix
    );
    return bounds === null
      ? null
      : {
          minX: bounds.minX - strokePadding,
          maxX: bounds.maxX + strokePadding,
          minY: bounds.minY - strokePadding,
          maxY: bounds.maxY + strokePadding
        };
  }
  if (tagName === "rect") {
    const x = getNumberAttribute(element, "x");
    const y = getNumberAttribute(element, "y");
    const width = getNumberAttribute(element, "width");
    const height = getNumberAttribute(element, "height");
    return boundsFromPoints(
      [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height }
      ],
      matrix
    );
  }
  if (tagName === "circle") {
    const cx = getNumberAttribute(element, "cx");
    const cy = getNumberAttribute(element, "cy");
    const r = getNumberAttribute(element, "r");
    return boundsFromPoints(
      [
        { x: cx - r, y: cy - r },
        { x: cx + r, y: cy - r },
        { x: cx + r, y: cy + r },
        { x: cx - r, y: cy + r }
      ],
      matrix
    );
  }
  if (tagName === "ellipse") {
    const cx = getNumberAttribute(element, "cx");
    const cy = getNumberAttribute(element, "cy");
    const rx = getNumberAttribute(element, "rx");
    const ry = getNumberAttribute(element, "ry");
    return boundsFromPoints(
      [
        { x: cx - rx, y: cy - ry },
        { x: cx + rx, y: cy - ry },
        { x: cx + rx, y: cy + ry },
        { x: cx - rx, y: cy + ry }
      ],
      matrix
    );
  }
  if (tagName === "text") {
    const text = element.textContent?.trim() ?? "";
    if (text.length === 0) {
      return null;
    }
    const x = getNumberAttribute(element, "x");
    const y = getNumberAttribute(element, "y");
    const fontSize = Number.parseFloat(element.style.getPropertyValue("font-size")) || SVG_TEXT_FALLBACK_HEIGHT;
    const width = text.length * SVG_TEXT_FALLBACK_WIDTH_FACTOR;
    const height = Math.max(SVG_TEXT_FALLBACK_HEIGHT, fontSize);
    const textAnchor = element.getAttribute("text-anchor") ?? element.style.getPropertyValue("text-anchor");
    const left = textAnchor === "middle" ? x - width / 2 : textAnchor === "end" ? x - width : x;
    return boundsFromPoints(
      [
        { x: left, y: y - height },
        { x: left + width, y: y - height },
        { x: left + width, y: y + height * 0.35 },
        { x: left, y: y + height * 0.35 }
      ],
      matrix
    );
  }
  return null;
}

function shouldSkipFitBoundsElement(element: SVGElement): boolean {
  if (
    element.classList.contains("network-grid") ||
    element.classList.contains("network-segment-hitbox") ||
    element.classList.contains("network-node-hitbox") ||
    element.classList.contains("network-callout-table-row-hitbox")
  ) {
    return true;
  }
  const display = element.style.getPropertyValue("display");
  return display === "none" || element.classList.contains("is-hidden");
}

function collectSvgContentBounds(root: SVGElement, inheritedMatrix: Matrix2d = IDENTITY_MATRIX): SvgBounds | null {
  if (shouldSkipFitBoundsElement(root)) {
    return null;
  }
  const matrix = multiplyMatrix(inheritedMatrix, parseTransform(root.getAttribute("transform")));
  let bounds = getElementOwnBounds(root, matrix);
  for (const child of Array.from(root.children)) {
    if (!(child instanceof SVGElement)) {
      continue;
    }
    const childBounds = collectSvgContentBounds(child, matrix);
    if (childBounds !== null) {
      bounds = expandBounds(bounds, childBounds);
    }
  }
  return bounds;
}

function translateRootLayerTransforms(svgClone: SVGSVGElement, deltaX: number, deltaY: number, networkScale: number): void {
  const transformPattern = /^translate\(([-+\d.eE]+)\s+([-+\d.eE]+)\)\s+scale\(([-+\d.eE]+)\)$/;
  for (const child of Array.from(svgClone.children)) {
    if (!(child instanceof SVGElement)) {
      continue;
    }
    const element = child;
    const transform = element.getAttribute("transform")?.trim() ?? "";
    const match = transform.match(transformPattern);
    if (match === null) {
      continue;
    }
    const [, rawX, rawY, rawScale] = match;
    const x = Number(rawX);
    const y = Number(rawY);
    const scale = Number(rawScale);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(scale) || Math.abs(scale - networkScale) > 0.0001) {
      continue;
    }
    element.setAttribute("transform", `translate(${x + deltaX} ${y + deltaY}) scale(${scale})`);
  }
}

function fitSvgCloneToExportContent(params: PreparedSvgExport & { networkScale: number }): FittedSvgExport | null {
  const contentBounds = collectSvgContentBounds(params.svgClone);
  if (contentBounds === null) {
    return null;
  }

  const fittedWidth = Math.max(1, Math.ceil(contentBounds.maxX - contentBounds.minX + SVG_FIT_EXPORT_PADDING * 2));
  const fittedHeight = Math.max(1, Math.ceil(contentBounds.maxY - contentBounds.minY + SVG_FIT_EXPORT_PADDING * 2));
  const deltaX = SVG_FIT_EXPORT_PADDING - contentBounds.minX;
  const deltaY = SVG_FIT_EXPORT_PADDING - contentBounds.minY;
  translateRootLayerTransforms(params.svgClone, deltaX, deltaY, params.networkScale);
  params.svgClone.setAttribute("width", String(fittedWidth));
  params.svgClone.setAttribute("height", String(fittedHeight));
  params.svgClone.setAttribute("viewBox", `0 0 ${fittedWidth} ${fittedHeight}`);
  return {
    svgClone: params.svgClone,
    exportWidth: fittedWidth,
    exportHeight: fittedHeight,
    deltaX,
    deltaY
  };
}

function prepareSvgCloneForExport(sourceSvg: SVGSVGElement): PreparedSvgExport {
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

  return {
    svgClone,
    exportWidth,
    exportHeight
  };
}

function applySvgGridVisibility(svgClone: SVGSVGElement, includeGrid: boolean): void {
  const gridLayers = Array.from(svgClone.querySelectorAll<SVGGElement>(".network-grid"));
  if (!includeGrid) {
    gridLayers.forEach((gridLayer) => gridLayer.remove());
    return;
  }

  gridLayers.forEach((gridLayer) => {
    gridLayer.classList.remove("is-hidden");
    gridLayer.style.removeProperty("display");
  });
}

function waitForPreviewRenderTurn(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

async function withThemedSourceSvg<T>(
  sourceSvg: SVGSVGElement,
  themeMode: ThemeMode,
  callback: (themedSourceSvg: SVGSVGElement) => Promise<T>
): Promise<T> {
  if (typeof document === "undefined") {
    return callback(sourceSvg);
  }

  const sourceRect = sourceSvg.getBoundingClientRect();
  const host = document.createElement("div");
  host.className = ["app-shell", ...getThemeClassNames(themeMode)].join(" ");
  host.style.position = "fixed";
  host.style.left = "-100000px";
  host.style.top = "0";
  host.style.width = `${Math.max(1, Math.round(sourceRect.width || sourceSvg.viewBox.baseVal.width || 1))}px`;
  host.style.height = `${Math.max(1, Math.round(sourceRect.height || sourceSvg.viewBox.baseVal.height || 1))}px`;
  host.style.opacity = "0";
  host.style.pointerEvents = "none";
  host.style.overflow = "hidden";
  host.setAttribute("aria-hidden", "true");

  const themedSourceSvg = sourceSvg.cloneNode(true) as SVGSVGElement;
  host.appendChild(themedSourceSvg);
  document.body.appendChild(host);
  try {
    return await callback(themedSourceSvg);
  } finally {
    host.remove();
  }
}

export function useNetworkSummaryExportActions({
  networkSvgRef,
  networkCanvasShellRef,
  networkOffset,
  networkScale,
  renderedNetworkScale,
  themeMode,
  pngExportIncludeBackground,
  exportIncludeFrame,
  exportIncludeCartouche,
  exportIncludeGrid = true,
  exportCartoucheNetworkName,
  exportCartoucheAuthor,
  exportCartoucheProjectCode,
  exportCartoucheCreatedAt,
  exportCartoucheLogoUrl,
  exportCartoucheNotes
}: UseNetworkSummaryExportActionsParams) {
  const [activeSvgPreview, setActiveSvgPreview] = useState<SvgExportPreviewState | null>(null);
  const [isSvgPreviewLoading, setIsSvgPreviewLoading] = useState(false);
  const [svgPreviewLoadingFormat, setSvgPreviewLoadingFormat] = useState<CanvasPreviewFormat>("svg");
  const svgPreviewRequestIdRef = useRef(0);

  const prepareDecoratedSvgClone = useCallback(async (options?: SvgPreviewOptions) => {
    const sourceSvg = networkSvgRef.current;
    if (sourceSvg === null) {
      return null;
    }

    return withThemedSourceSvg(sourceSvg, options?.themeMode ?? themeMode, async (themedSourceSvg) => {
      let { svgClone, exportWidth, exportHeight } = prepareSvgCloneForExport(themedSourceSvg);
      copyComputedStylesToSvgClone(themedSourceSvg, svgClone);
      disableSvgCloneInteractivity(svgClone);
      removeGlobalRenderScaleFromSvgClone({
        cloneSvg: svgClone,
        networkOffset,
        networkScale,
        renderedNetworkScale,
        width: exportWidth,
        height: exportHeight
      });
      if (options?.fitToContent === true) {
        const fitted = fitSvgCloneToExportContent({ svgClone, exportWidth, exportHeight, networkScale });
        if (fitted !== null) {
          svgClone = fitted.svgClone;
          exportWidth = fitted.exportWidth;
          exportHeight = fitted.exportHeight;
          removeGlobalRenderScaleFromSvgClone({
            cloneSvg: svgClone,
            networkOffset: {
              x: networkOffset.x + fitted.deltaX,
              y: networkOffset.y + fitted.deltaY
            },
            networkScale,
            renderedNetworkScale: networkScale,
            width: exportWidth,
            height: exportHeight
          });
        }
      }
      applySvgGridVisibility(svgClone, options?.includeGrid ?? exportIncludeGrid);
      await applyExportDecorations({
        sourceSvg: themedSourceSvg,
        cloneSvg: svgClone,
        width: exportWidth,
        height: exportHeight,
        includeFrame: options?.includeFrame ?? exportIncludeFrame,
        includeCartouche: options?.includeCartouche ?? exportIncludeCartouche,
        cartoucheNetworkName: exportCartoucheNetworkName,
        cartoucheAuthor: exportCartoucheAuthor,
        cartoucheProjectCode: exportCartoucheProjectCode,
        cartoucheCreatedAt: exportCartoucheCreatedAt,
        cartoucheLogoUrl: exportCartoucheLogoUrl,
        cartoucheNotes: exportCartoucheNotes
      });

      return {
        svgClone,
        exportWidth,
        exportHeight
      };
    });
  }, [
    exportCartoucheAuthor,
    exportCartoucheCreatedAt,
    exportCartoucheLogoUrl,
    exportCartoucheNetworkName,
    exportCartoucheNotes,
    exportCartoucheProjectCode,
    exportIncludeCartouche,
    exportIncludeFrame,
    exportIncludeGrid,
    networkSvgRef,
    networkOffset,
    networkScale,
    renderedNetworkScale,
    themeMode
  ]);

  const downloadSvgMarkup = useCallback((svgMarkup: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = buildTimestampedFileName(["network-plan", exportCartoucheNetworkName], "svg");
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 0);
  }, [exportCartoucheNetworkName]);

  const renderPreparedSvgAsPngDataUrl = useCallback(
    async (prepared: PreparedSvgExport): Promise<string | null> => {
      if (typeof window === "undefined") {
        return null;
      }

      const serializedSvg = new XMLSerializer().serializeToString(prepared.svgClone);
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
        canvas.width = prepared.exportWidth * exportScale;
        canvas.height = prepared.exportHeight * exportScale;

        const context = getCanvasTextMeasurementContext(canvas);
        if (context === null) {
          return null;
        }

        context.setTransform(exportScale, 0, 0, exportScale, 0, 0);
        if (pngExportIncludeBackground) {
          const backgroundFill = resolveCanvasExportBackgroundFill(networkCanvasShellRef.current);
          if (backgroundFill !== null) {
            context.fillStyle = backgroundFill;
            context.fillRect(0, 0, prepared.exportWidth, prepared.exportHeight);
          }
        }
        context.drawImage(image, 0, 0, prepared.exportWidth, prepared.exportHeight);

        return canvas.toDataURL("image/png");
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
    },
    [networkCanvasShellRef, pngExportIncludeBackground]
  );

  const createSvgPreview = useCallback(
    async (options?: SvgPreviewOptions) => {
      const requestId = svgPreviewRequestIdRef.current + 1;
      svgPreviewRequestIdRef.current = requestId;
      setSvgPreviewLoadingFormat("svg");
      setIsSvgPreviewLoading(true);
      const includeFrame = options?.includeFrame ?? exportIncludeFrame;
      const includeCartouche = options?.includeCartouche ?? exportIncludeCartouche;
      const includeGrid = options?.includeGrid ?? exportIncludeGrid;
      const fitToContent = options?.fitToContent ?? true;
      const previewThemeMode = options?.themeMode ?? themeMode;
      let prepared: PreparedSvgExport | null;
      try {
        await waitForPreviewRenderTurn();
        if (requestId !== svgPreviewRequestIdRef.current) {
          return null;
        }
        prepared = await prepareDecoratedSvgClone({ includeFrame, includeCartouche, includeGrid, fitToContent, themeMode: previewThemeMode });
      } catch (error) {
        if (requestId === svgPreviewRequestIdRef.current) {
          setIsSvgPreviewLoading(false);
        }
        throw error;
      }
      if (prepared === null || requestId !== svgPreviewRequestIdRef.current) {
        if (requestId === svgPreviewRequestIdRef.current) {
          setIsSvgPreviewLoading(false);
        }
        return null;
      }

      const svgMarkup = new XMLSerializer().serializeToString(prepared.svgClone);
      const preview = {
        format: "svg" as const,
        svgMarkup,
        exportWidth: prepared.exportWidth,
        exportHeight: prepared.exportHeight,
        includeFrame,
        includeCartouche,
        includeGrid,
        fitToContent,
        themeMode: previewThemeMode
      };
      setActiveSvgPreview(preview);
      setIsSvgPreviewLoading(false);
      return preview;
    },
    [exportIncludeCartouche, exportIncludeFrame, exportIncludeGrid, prepareDecoratedSvgClone, themeMode]
  );

  const createPngPreview = useCallback(
    async (options?: SvgPreviewOptions) => {
      const requestId = svgPreviewRequestIdRef.current + 1;
      svgPreviewRequestIdRef.current = requestId;
      setSvgPreviewLoadingFormat("png");
      setIsSvgPreviewLoading(true);
      const includeFrame = options?.includeFrame ?? exportIncludeFrame;
      const includeCartouche = options?.includeCartouche ?? exportIncludeCartouche;
      const includeGrid = options?.includeGrid ?? exportIncludeGrid;
      const fitToContent = options?.fitToContent ?? true;
      const previewThemeMode = options?.themeMode ?? themeMode;
      let prepared: PreparedSvgExport | null;
      try {
        await waitForPreviewRenderTurn();
        if (requestId !== svgPreviewRequestIdRef.current) {
          return null;
        }
        prepared = await prepareDecoratedSvgClone({ includeFrame, includeCartouche, includeGrid, fitToContent, themeMode: previewThemeMode });
      } catch (error) {
        if (requestId === svgPreviewRequestIdRef.current) {
          setIsSvgPreviewLoading(false);
        }
        throw error;
      }
      if (prepared === null || requestId !== svgPreviewRequestIdRef.current) {
        if (requestId === svgPreviewRequestIdRef.current) {
          setIsSvgPreviewLoading(false);
        }
        return null;
      }

      let pngDataUrl: string | null;
      try {
        pngDataUrl = await renderPreparedSvgAsPngDataUrl(prepared);
      } catch (error) {
        if (requestId === svgPreviewRequestIdRef.current) {
          setIsSvgPreviewLoading(false);
        }
        throw error;
      }
      if (pngDataUrl === null || requestId !== svgPreviewRequestIdRef.current) {
        if (requestId === svgPreviewRequestIdRef.current) {
          setIsSvgPreviewLoading(false);
        }
        return null;
      }

      const svgMarkup = new XMLSerializer().serializeToString(prepared.svgClone);
      const preview = {
        format: "png" as const,
        svgMarkup,
        pngDataUrl,
        exportWidth: prepared.exportWidth,
        exportHeight: prepared.exportHeight,
        includeFrame,
        includeCartouche,
        includeGrid,
        fitToContent,
        themeMode: previewThemeMode
      };
      setActiveSvgPreview(preview);
      setIsSvgPreviewLoading(false);
      return preview;
    },
    [
      exportIncludeCartouche,
      exportIncludeFrame,
      exportIncludeGrid,
      prepareDecoratedSvgClone,
      renderPreparedSvgAsPngDataUrl,
      themeMode
    ]
  );

  const handleExportPlanAsSvg = useCallback(async () => {
    const preview = await createSvgPreview();
    if (preview === null) {
      return;
    }
  }, [createSvgPreview]);

  const handleDownloadSvgPreview = useCallback(() => {
    if (activeSvgPreview === null) {
      return;
    }
    svgPreviewRequestIdRef.current += 1;
    setIsSvgPreviewLoading(false);
    if (activeSvgPreview.format === "png") {
      if (activeSvgPreview.pngDataUrl === undefined) {
        return;
      }
      const downloadLink = document.createElement("a");
      downloadLink.href = activeSvgPreview.pngDataUrl;
      downloadLink.download = buildTimestampedFileName(["network-plan", exportCartoucheNetworkName], "png");
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      setActiveSvgPreview(null);
      return;
    }
    downloadSvgMarkup(activeSvgPreview.svgMarkup);
    setActiveSvgPreview(null);
  }, [activeSvgPreview, downloadSvgMarkup, exportCartoucheNetworkName]);

  const handleCloseSvgPreview = useCallback(() => {
    svgPreviewRequestIdRef.current += 1;
    setIsSvgPreviewLoading(false);
    setActiveSvgPreview(null);
  }, []);

  const handleExportPlanAsPng = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    await createPngPreview();
  }, [createPngPreview]);

  const handleExportPlanAsPngDirect = useCallback(async () => {
    await waitForPreviewRenderTurn();
    const prepared = await prepareDecoratedSvgClone({ fitToContent: true });
    if (prepared === null) {
      return;
    }
    const pngDataUrl = await renderPreparedSvgAsPngDataUrl(prepared);
    if (pngDataUrl === null) {
      return;
    }
    const downloadLink = document.createElement("a");
    downloadLink.href = pngDataUrl;
    downloadLink.download = buildTimestampedFileName(["network-plan", exportCartoucheNetworkName], "png");
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }, [exportCartoucheNetworkName, prepareDecoratedSvgClone, renderPreparedSvgAsPngDataUrl]);

  const handleExportPlanAsSvgDirect = useCallback(async () => {
    await waitForPreviewRenderTurn();
    const prepared = await prepareDecoratedSvgClone({ fitToContent: true });
    if (prepared === null) {
      return;
    }
    const svgMarkup = new XMLSerializer().serializeToString(prepared.svgClone);
    downloadSvgMarkup(svgMarkup);
  }, [downloadSvgMarkup, prepareDecoratedSvgClone]);

  return {
    activeSvgPreview,
    createPngPreview,
    createSvgPreview,
    handleCloseSvgPreview,
    handleDownloadSvgPreview,
    handleExportPlanAsPngDirect,
    handleExportPlanAsPng,
    handleExportPlanAsSvg,
    handleExportPlanAsSvgDirect,
    isSvgPreviewLoading,
    svgPreviewLoadingFormat
  };
}
