import { useEffect, useRef, useState, type ReactElement } from "react";

interface NetworkSummaryExportMenuProps {
  canvasExportFormat: string;
  canExportCanvas: boolean;
  canExportBomCsv: boolean;
  onExportCanvas: () => void;
  onExportBomCsv: () => void;
}

export function NetworkSummaryExportMenu({
  canvasExportFormat,
  canExportCanvas,
  canExportBomCsv,
  onExportCanvas,
  onExportBomCsv
}: NetworkSummaryExportMenuProps): ReactElement {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current !== null && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleExportCanvas() {
    setOpen(false);
    onExportCanvas();
  }

  function handleExportBom() {
    setOpen(false);
    onExportBomCsv();
  }

  return (
    <div ref={wrapperRef} className="network-summary-view-menu-wrapper">
      <button
        type="button"
        className="workspace-tab network-summary-export-button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="network-summary-export-icon" aria-hidden="true" />
        Export
      </button>
      {open && (
        <div className="panel network-summary-view-menu network-summary-view-menu--right">
          <button
            type="button"
            className="network-summary-view-menu-item"
            onClick={handleExportCanvas}
            disabled={!canExportCanvas}
          >
            <span className="network-summary-export-icon" aria-hidden="true" />
            {canvasExportFormat.toUpperCase()}
          </button>
          <button
            type="button"
            className="network-summary-view-menu-item"
            onClick={handleExportBom}
            disabled={!canExportBomCsv}
          >
            <span className="table-export-icon" aria-hidden="true" />
            BOM
          </button>
        </div>
      )}
    </div>
  );
}
