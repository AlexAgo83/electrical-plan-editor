import { translateCurrent as t } from "../../lib/i18n";
import { useEffect, useRef, useState, type ReactElement } from "react";

interface NetworkSummaryExportMenuProps {
  canExportSvg: boolean;
  canExportPng: boolean;
  canExportPdf?: boolean;
  canExportNetwork?: boolean;
  canExportBomCsv?: boolean;
  onExportSvg: () => void;
  onExportPng: () => void;
  onExportPdf?: () => void;
  onExportNetwork?: () => void;
  onExportBomCsv?: () => void;
}

export function NetworkSummaryExportMenu({
  canExportSvg,
  canExportPng,
  canExportPdf,
  canExportNetwork,
  canExportBomCsv,
  onExportSvg,
  onExportPng,
  onExportPdf,
  onExportNetwork,
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

  function handleExportSvg() {
    setOpen(false);
    onExportSvg();
  }

  function handleExportPng() {
    setOpen(false);
    onExportPng();
  }

  function handleExportPdf() {
    setOpen(false);
    onExportPdf?.();
  }

  function handleExportBom() {
    setOpen(false);
    onExportBomCsv?.();
  }

  function handleExportNetwork() {
    setOpen(false);
    onExportNetwork?.();
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
        {t("ui.tabularexportpreviewdialogExport")}</button>
      {open && (
        <div className="panel network-summary-view-menu network-summary-view-menu--right">
          <button
            type="button"
            className="network-summary-view-menu-item"
            onClick={handleExportSvg}
            disabled={!canExportSvg}
          >
            <span className="network-summary-export-icon" aria-hidden="true" />
            SVG
          </button>
          <button
            type="button"
            className="network-summary-view-menu-item"
            onClick={handleExportPng}
            disabled={!canExportPng}
          >
            <span className="network-summary-export-icon" aria-hidden="true" />
            PNG
          </button>
          {onExportPdf === undefined ? null : (
            <button
              type="button"
              className="network-summary-view-menu-item"
              onClick={handleExportPdf}
              disabled={!canExportPdf}
            >
              <span className="network-summary-export-icon" aria-hidden="true" />
              PDF
            </button>
          )}
          {onExportNetwork === undefined ? null : (
            <button
              type="button"
              className="network-summary-view-menu-item"
              onClick={handleExportNetwork}
              disabled={!canExportNetwork}
            >
              <span className="action-button-icon is-home-import" aria-hidden="true" />
              {t("ui.networksummaryexportmenuNetwork")}</button>
          )}
          {onExportBomCsv === undefined ? null : (
            <button
              type="button"
              className="network-summary-view-menu-item"
              onClick={handleExportBom}
              disabled={!canExportBomCsv}
            >
              <span className="table-export-icon" aria-hidden="true" />
              
              {t("ui.bom")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
