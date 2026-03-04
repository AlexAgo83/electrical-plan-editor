import { useCallback, type RefObject } from "react";
import type { CanvasExportFormat } from "../../../types/app-controller";
import {
  applyExportDecorations,
  copyComputedStylesToSvgClone,
  exportCanvasToPngBlob,
  resolveCanvasExportBackgroundFill
} from "./networkSummaryExport";

interface UseNetworkSummaryExportActionsParams {
  networkSvgRef: RefObject<SVGSVGElement | null>;
  networkCanvasShellRef: RefObject<HTMLDivElement | null>;
  canvasExportFormat: CanvasExportFormat;
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

export function useNetworkSummaryExportActions({
  networkSvgRef,
  networkCanvasShellRef,
  canvasExportFormat,
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
  const prepareDecoratedSvgClone = useCallback(async () => {
    const sourceSvg = networkSvgRef.current;
    if (sourceSvg === null) {
      return null;
    }

    const { svgClone, exportWidth, exportHeight } = prepareSvgCloneForExport(sourceSvg);
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

    return {
      svgClone,
      exportWidth,
      exportHeight
    };
  }, [
    exportCartoucheAuthor,
    exportCartoucheCreatedAt,
    exportCartoucheLogoUrl,
    exportCartoucheNetworkName,
    exportCartoucheNotes,
    exportCartoucheProjectCode,
    exportIncludeCartouche,
    exportIncludeFrame,
    networkSvgRef
  ]);

  const handleExportPlanAsSvg = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const prepared = await prepareDecoratedSvgClone();
    if (prepared === null) {
      return;
    }

    const serializedSvg = new XMLSerializer().serializeToString(prepared.svgClone);
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
  }, [prepareDecoratedSvgClone]);

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

      const context = canvas.getContext("2d");
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
    handleExportPlan,
    handleExportPlanAsPng,
    handleExportPlanAsSvg
  };
}
