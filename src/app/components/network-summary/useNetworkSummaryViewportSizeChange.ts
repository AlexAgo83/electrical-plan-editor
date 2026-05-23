import { type RefObject, useEffect } from "react";

type UseNetworkSummaryViewportSizeChangeOptions = {
  networkCanvasShellRef: RefObject<HTMLDivElement | null>;
  networkSvgRef: RefObject<SVGSVGElement | null>;
  nodeCount: number;
  onViewportSizeChange: ((size: { width: number; height: number }) => void) | undefined;
  resizeBehaviorMode: string;
};

export function useNetworkSummaryViewportSizeChange({
  networkCanvasShellRef,
  networkSvgRef,
  nodeCount,
  onViewportSizeChange,
  resizeBehaviorMode
}: UseNetworkSummaryViewportSizeChangeOptions): void {
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
  }, [networkCanvasShellRef, networkSvgRef, nodeCount, onViewportSizeChange, resizeBehaviorMode]);
}
