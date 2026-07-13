import { translateCurrent as t } from "../../lib/i18n";
import { useEffect, useState, type ReactElement } from "react";
import { useModalDialog } from "../../hooks/useModalDialog";
import type { CsvCellValue } from "../../lib/csv";
import type { TabularWorksheetExport } from "../../lib/tabularExport";

interface TabularExportPreviewDialogProps {
  isOpen: boolean;
  themeHostClassName?: string;
  title: string;
  summaryLabel: string;
  filenameLabel: string;
  sheets: TabularWorksheetExport[];
  onConfirm: () => void;
  onCancel: () => void;
}

function formatPreviewCellValue(value: CsvCellValue): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

export function TabularExportPreviewDialog({
  isOpen,
  themeHostClassName,
  title,
  summaryLabel,
  filenameLabel,
  sheets,
  onConfirm,
  onCancel
}: TabularExportPreviewDialogProps): ReactElement | null {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const { dialogRef, onKeyDown } = useModalDialog<HTMLElement>({ isOpen, onClose: onCancel, identity: title });

  useEffect(() => {
    if (isOpen) {
      setActiveSheetIndex(0);
    }
  }, [isOpen, sheets]);

  if (!isOpen || sheets.length === 0) {
    return null;
  }

  const titleId = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-title`;
  const descriptionId = `${titleId}-description`;
  const activeSheet = sheets[Math.min(activeSheetIndex, sheets.length - 1)] ?? sheets[0];
  if (activeSheet === undefined) {
    return null;
  }

  return (
    <div className={themeHostClassName ? `confirm-dialog-layer ${themeHostClassName}` : "confirm-dialog-layer"} role="presentation">
      <button type="button" className="confirm-dialog-backdrop" aria-label={t("ui.tabularexportpreviewdialogCloseTitle", { title: title })} onClick={onCancel} />
      <section
        ref={dialogRef}
        className="confirm-dialog panel bom-preview-dialog is-neutral"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <header className="confirm-dialog-header bom-preview-dialog-header">
          <h2 id={titleId}>{title}</h2>
          <div className="bom-preview-dialog-summary" id={descriptionId}>
            <span className="bom-preview-summary-item">
              <span className="bom-preview-summary-label">{t("ui.bomexportpreviewdialogRows")}</span>
              <span className="bom-preview-summary-value">{activeSheet.rows.length}</span>
            </span>
            <span className="bom-preview-summary-item">
              <span className="bom-preview-summary-label">{t("ui.bomexportpreviewdialogSheets")}</span>
              <span className="bom-preview-summary-value">{sheets.length}</span>
            </span>
            <span className="bom-preview-summary-item">
              <span className="bom-preview-summary-label">{t("ui.tabularexportpreviewdialogTarget")}</span>
              <span className="bom-preview-summary-value">{summaryLabel}</span>
            </span>
          </div>
        </header>
        <p className="confirm-dialog-details">
          <span className="confirm-dialog-details-label">{t("ui.tabularexportpreviewdialogSuggestedFilename")}</span>
          <code className="confirm-dialog-details-code">{filenameLabel}</code>
        </p>
        {sheets.length > 1 ? (
          <div className="bom-preview-sheet-tabs" role="tablist" aria-label={t("ui.tabularexportpreviewdialogTitleSheets", { title: title })}>
            {sheets.map((sheet, index) => {
              const selected = index === activeSheetIndex;
              return (
                <button
                  key={`${sheet.name}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={selected ? "bom-preview-sheet-tab is-active" : "bom-preview-sheet-tab"}
                  onClick={() => setActiveSheetIndex(index)}
                >
                  <span>{sheet.name}</span>
                  <span className="bom-preview-sheet-tab-count">{sheet.rows.length}</span>
                </button>
              );
            })}
          </div>
        ) : null}
        <div className="bom-preview-table-shell" tabIndex={0} aria-label={t("ui.bomexportpreviewdialogNameTablePreview", { name: activeSheet.name })}>
          <table className="bom-preview-table">
            <thead>
              <tr>
                {activeSheet.headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeSheet.rows.map((row, rowIndex) => (
                <tr key={`${activeSheet.name}-row-${rowIndex}`}>
                  {row.map((cell, columnIndex) => (
                    <td key={`${activeSheet.name}-${rowIndex}-${columnIndex}`}>{formatPreviewCellValue(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-cancel" onClick={onCancel}>
            
            {t("ui.cancel")}
          </button>
          <button type="button" className="button-with-icon confirm-dialog-confirm" onClick={onConfirm}>
            <span className="action-button-icon is-open" aria-hidden="true" />
            <span>{t("ui.tabularexportpreviewdialogExport")}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
