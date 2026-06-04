export interface GroupedSvgExportProgress {
  current: number;
  format?: "png" | "svg";
  total: number;
  networkName: string;
}

const GROUPED_SVG_EXPORT_OVERLAY_ID = "grouped-svg-export-overlay";

function escapeHtml(value: string): string {
  return value.replace(/[<>&"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;" })[character] ?? character);
}

export function removeGroupedSvgExportOverlay(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.getElementById(GROUPED_SVG_EXPORT_OVERLAY_ID)?.remove();
}

export function renderGroupedSvgExportOverlay(progress: GroupedSvgExportProgress): void {
  if (typeof document === "undefined") {
    return;
  }

  let overlay = document.getElementById(GROUPED_SVG_EXPORT_OVERLAY_ID);
  if (overlay === null) {
    overlay = document.createElement("div");
    overlay.id = GROUPED_SVG_EXPORT_OVERLAY_ID;
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "10000",
      background: "rgba(0, 0, 0, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontFamily: "system-ui, -apple-system, sans-serif",
      pointerEvents: "auto"
    });
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `<div style="background:#1f2937;padding:24px 32px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,0.4);text-align:center;max-width:480px"><div style="font-weight:600;font-size:16px;margin-bottom:6px">Exporting ${(progress.format ?? "svg").toUpperCase()} ${progress.current} of ${progress.total}</div><div style="opacity:0.85;font-size:14px">${escapeHtml(progress.networkName)}</div></div>`;
}
