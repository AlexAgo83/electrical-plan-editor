import { useCallback, useRef, useState, type RefObject } from "react";
import type { ThemeMode } from "../../../../store";
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

export interface SvgExportPreviewState {
  format: "svg" | "png";
  svgMarkup: string;
  pngDataUrl?: string;
  exportWidth: number;
  exportHeight: number;
  includeFrame: boolean;
  includeCartouche: boolean;
  includeGrid: boolean;
  themeMode: ThemeMode;
}

export type CanvasPreviewFormat = "svg" | "png";

export interface SvgPreviewOptions {
  format?: CanvasPreviewFormat;
  includeFrame?: boolean;
  includeCartouche?: boolean;
  includeGrid?: boolean;
  themeMode?: ThemeMode;
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
      const { svgClone, exportWidth, exportHeight } = prepareSvgCloneForExport(themedSourceSvg);
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
  }, []);

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
      const previewThemeMode = options?.themeMode ?? themeMode;
      let prepared: PreparedSvgExport | null;
      try {
        await waitForPreviewRenderTurn();
        if (requestId !== svgPreviewRequestIdRef.current) {
          return null;
        }
        prepared = await prepareDecoratedSvgClone({ includeFrame, includeCartouche, includeGrid, themeMode: previewThemeMode });
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
      const previewThemeMode = options?.themeMode ?? themeMode;
      let prepared: PreparedSvgExport | null;
      try {
        await waitForPreviewRenderTurn();
        if (requestId !== svgPreviewRequestIdRef.current) {
          return null;
        }
        prepared = await prepareDecoratedSvgClone({ includeFrame, includeCartouche, includeGrid, themeMode: previewThemeMode });
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
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const downloadLink = document.createElement("a");
      downloadLink.href = activeSvgPreview.pngDataUrl;
      downloadLink.download = `network-plan-${timestamp}.png`;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      setActiveSvgPreview(null);
      return;
    }
    downloadSvgMarkup(activeSvgPreview.svgMarkup);
    setActiveSvgPreview(null);
  }, [activeSvgPreview, downloadSvgMarkup]);

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

  return {
    activeSvgPreview,
    createPngPreview,
    createSvgPreview,
    handleCloseSvgPreview,
    handleDownloadSvgPreview,
    handleExportPlanAsPng,
    handleExportPlanAsSvg,
    isSvgPreviewLoading,
    svgPreviewLoadingFormat
  };
}
