import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactElement } from "react";
import type { ActiveBomPreviewState } from "../../hooks/controller/useAppControllerBomExportHandlers";
import type { CsvCellValue } from "../../lib/csv";
import type { TabularWorksheetExport } from "../../lib/tabularExport";

interface BomExportPreviewDialogProps {
  isOpen: boolean;
  themeHostClassName?: string;
  preview: ActiveBomPreviewState;
  onConfirm: () => void;
  onCancel: () => void;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
}

function formatPreviewCell(value: CsvCellValue): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function buildPreviewSheets(preview: ActiveBomPreviewState): TabularWorksheetExport[] {
  if (preview.format === "xlsx" && preview.workbookSheets.length > 0) {
    return preview.workbookSheets;
  }

  return [
    {
      name: "Network BOM",
      headers: preview.headers,
      rows: preview.rows
    }
  ];
}

export function BomExportPreviewDialog({
  isOpen,
  themeHostClassName,
  preview,
  onConfirm,
  onCancel
}: BomExportPreviewDialogProps): ReactElement | null {
  const dialogRef = useRef<HTMLElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const titleId = "bom-export-preview-title";
  const descriptionId = "bom-export-preview-description";
  const previewSheets = useMemo(() => buildPreviewSheets(preview), [preview]);
  const fallbackSheet = previewSheets[0] ?? { name: "Network BOM", headers: preview.headers, rows: preview.rows };
  const activeSheet = previewSheets[Math.min(activeSheetIndex, previewSheets.length - 1)] ?? fallbackSheet;
  const formatLabel = preview.format.toUpperCase();

  useEffect(() => {
    setActiveSheetIndex(0);
  }, [preview]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelButtonRef.current?.focus();

    return () => {
      const previousFocusedElement = previousFocusedElementRef.current;
      if (previousFocusedElement?.isConnected) {
        previousFocusedElement.focus();
      }
      previousFocusedElementRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const dialogElement = dialogRef.current;
    if (dialogElement === null) {
      return;
    }

    const focusableElements = getFocusableElements(dialogElement);
    if (focusableElements.length === 0) {
      event.preventDefault();
      dialogElement.focus();
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    if (firstFocusable === undefined || lastFocusable === undefined) {
      return;
    }

    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (event.shiftKey) {
      if (activeElement === firstFocusable || activeElement === dialogElement) {
        event.preventDefault();
        lastFocusable.focus();
      }
      return;
    }

    if (activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  };

  return (
    <div className={themeHostClassName ? `confirm-dialog-layer ${themeHostClassName}` : "confirm-dialog-layer"} role="presentation">
      <button type="button" className="confirm-dialog-backdrop" aria-label="Close BOM preview" onClick={onCancel} />
      <section
        ref={dialogRef}
        className="confirm-dialog panel bom-preview-dialog is-neutral"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="confirm-dialog-header bom-preview-dialog-header">
          <h2 id={titleId}>BOM preview</h2>
          <div className="bom-preview-dialog-summary" id={descriptionId}>
            <span>{preview.itemRowCount} BOM item rows</span>
            <span>{preview.rows.length} export rows</span>
            <span>{formatLabel}</span>
            {previewSheets.length > 1 ? <span>{previewSheets.length} sheets</span> : null}
            <span>{preview.workspaceCurrencyCode}</span>
            <span>{preview.workspaceTaxEnabled ? `Tax ${preview.workspaceTaxRatePercent.toFixed(2)}%` : "Tax disabled"}</span>
            {preview.compactColumns ? <span>Compact columns</span> : null}
          </div>
        </header>
        {preview.warnings.length > 0 ? (
          <div className="confirm-dialog-details bom-preview-warnings" role="status">
            <span className="confirm-dialog-details-label">Warnings</span>
            <ul>
              {preview.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {previewSheets.length > 1 ? (
          <div className="bom-preview-sheet-tabs" role="tablist" aria-label="BOM preview sheets">
            {previewSheets.map((sheet, sheetIndex) => {
              const selected = sheetIndex === activeSheetIndex;
              return (
                <button
                  key={sheet.name}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="bom-preview-sheet-panel"
                  className={selected ? "bom-preview-sheet-tab is-active" : "bom-preview-sheet-tab"}
                  onClick={() => setActiveSheetIndex(sheetIndex)}
                >
                  <span>{sheet.name}</span>
                  <span className="bom-preview-sheet-tab-count">{sheet.rows.length}</span>
                </button>
              );
            })}
          </div>
        ) : null}
        <div id="bom-preview-sheet-panel" role="tabpanel" className="bom-preview-table-shell" tabIndex={0} aria-label={`${activeSheet.name} table preview`}>
          <table className="bom-preview-table">
            <thead>
              <tr>
                {activeSheet.headers.map((header) => (
                  <th key={header} scope="col">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeSheet.rows.map((row, rowIndex) => (
                <tr key={`${rowIndex}-${row.join("|")}`}>
                  {activeSheet.headers.map((header, columnIndex) => (
                    <td key={`${header}-${columnIndex}`}>{formatPreviewCell(row[columnIndex])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="confirm-dialog-actions">
          <button ref={cancelButtonRef} type="button" className="confirm-dialog-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="button-with-icon confirm-dialog-confirm" onClick={onConfirm}>
            <span className="table-export-icon" aria-hidden="true" />
            <span>Download {formatLabel}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
