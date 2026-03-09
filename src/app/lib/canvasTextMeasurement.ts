function isJsdomUserAgent(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /jsdom/i.test(navigator.userAgent);
}

export function canUseCanvasTextMeasurement(): boolean {
  if (typeof document === "undefined" || typeof HTMLCanvasElement === "undefined") {
    return false;
  }

  if (isJsdomUserAgent()) {
    return false;
  }

  return typeof HTMLCanvasElement.prototype.getContext === "function";
}

export function getCanvasTextMeasurementContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  if (!canUseCanvasTextMeasurement()) {
    return null;
  }

  try {
    return canvas.getContext("2d");
  } catch {
    return null;
  }
}
