import { useCallback, useRef, useState, type RefObject } from "react";
import type { ThemeMode } from "../../../../store";
import type { CanvasExportFormat } from "../../../types/app-controller";
import { getCanvasTextMeasurementContext } from "../../../lib/canvasTextMeasurement";
import { getThemeClassNames } from "../../../lib/themeModes";
import {
  applyExportDecorations,
  copyComputedStylesToSvgClone,
  disableSvgCloneInteractivity,
  exportCanvasToPngBlob,
  removeGlobalRenderScaleFromSvgClone,
  resolveCanvasExportBackgroundFill
} from "./networkSummaryExport";

interface UseNetworkSummaryExportActionsParams {
  networkSvgRef: RefObject<SVGSVGElement | null>;
  networkCanvasShellRef: RefObject<HTMLDivElement | null>;
  canvasExportFormat: CanvasExportFormat;
  networkOffset: { x: number; y: number };
  networkScale: number;
  renderedNetworkScale: number;
  themeMode: ThemeMode;
  pngExportIncludeBackground: boolean;
  exportIncludeFrame: boolean;
  exportIncludeCartouche: boolean;
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
  svgMarkup: string;
  exportWidth: number;
  exportHeight: number;
  includeFrame: boolean;
  includeCartouche: boolean;
  themeMode: ThemeMode;
}

export interface SvgPreviewOptions {
  includeFrame?: boolean;
  includeCartouche?: boolean;
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
  canvasExportFormat,
  networkOffset,
  networkScale,
  renderedNetworkScale,
  themeMode,
  pngExportIncludeBackground,
  exportIncludeFrame,
  exportIncludeCartouche,
  exportCartoucheNetworkName,
  exportCartoucheAuthor,
  exportCartoucheProjectCode,
  exportCartoucheCreatedAt,
  exportCartoucheLogoUrl,
  exportCartoucheNotes
}: UseNetworkSummaryExportActionsParams) {
  const [activeSvgPreview, setActiveSvgPreview] = useState<SvgExportPreviewState | null>(null);
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

  const createSvgPreview = useCallback(
    async (options?: SvgPreviewOptions) => {
      const requestId = svgPreviewRequestIdRef.current + 1;
      svgPreviewRequestIdRef.current = requestId;
      const includeFrame = options?.includeFrame ?? exportIncludeFrame;
      const includeCartouche = options?.includeCartouche ?? exportIncludeCartouche;
      const previewThemeMode = options?.themeMode ?? themeMode;
      const prepared = await prepareDecoratedSvgClone({ includeFrame, includeCartouche, themeMode: previewThemeMode });
      if (prepared === null) {
        return null;
      }
      if (requestId !== svgPreviewRequestIdRef.current) {
        return null;
      }

      const svgMarkup = new XMLSerializer().serializeToString(prepared.svgClone);
      const preview = {
        svgMarkup,
        exportWidth: prepared.exportWidth,
        exportHeight: prepared.exportHeight,
        includeFrame,
        includeCartouche,
        themeMode: previewThemeMode
      };
      setActiveSvgPreview(preview);
      return preview;
    },
    [exportIncludeCartouche, exportIncludeFrame, prepareDecoratedSvgClone, themeMode]
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
    downloadSvgMarkup(activeSvgPreview.svgMarkup);
    setActiveSvgPreview(null);
  }, [activeSvgPreview, downloadSvgMarkup]);

  const handleCloseSvgPreview = useCallback(() => {
    svgPreviewRequestIdRef.current += 1;
    setActiveSvgPreview(null);
  }, []);

  const handleExportPlanAsPng = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const prepared = await prepareDecoratedSvgClone();
    if (prepared === null) {
      return;
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
        return;
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

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const pngBlob = await exportCanvasToPngBlob(canvas);
      const pngBlobUrl = URL.createObjectURL(pngBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = pngBlobUrl;
      downloadLink.download = `network-plan-${timestamp}.png`;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => {
        URL.revokeObjectURL(pngBlobUrl);
      }, 0);
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }, [networkCanvasShellRef, pngExportIncludeBackground, prepareDecoratedSvgClone]);

  const handleExportPlan = useCallback(() => {
    if (canvasExportFormat === "png") {
      void handleExportPlanAsPng();
      return;
    }

    void handleExportPlanAsSvg();
  }, [canvasExportFormat, handleExportPlanAsPng, handleExportPlanAsSvg]);

  return {
    activeSvgPreview,
    createSvgPreview,
    handleCloseSvgPreview,
    handleDownloadSvgPreview,
    handleExportPlan,
    handleExportPlanAsPng,
    handleExportPlanAsSvg
  };
}
