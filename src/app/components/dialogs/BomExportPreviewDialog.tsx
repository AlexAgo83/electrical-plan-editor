import { translateCurrent as t } from "../../lib/i18n";
import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { useModalDialog } from "../../hooks/useModalDialog";
import type { ActiveBomPreviewState } from "../../hooks/controller/useAppControllerBomExportHandlers";
import type { CsvCellValue } from "../../lib/csv";
import type { TabularWorksheetExport } from "../../lib/tabularExport";
import type { CatalogItemId, ConnectorId } from "../../../core/entities";
import { EntityReferenceButton } from "../workspace/EntityReferenceButton";

interface BomExportPreviewDialogProps {
  isOpen: boolean;
  themeHostClassName?: string;
  preview: ActiveBomPreviewState;
  onOpenCatalogItem: (catalogItemId: CatalogItemId) => void;
  onOpenConnector: (connectorId: ConnectorId) => void;
  onConfirm: () => void;
  onCancel: () => void;
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
  onOpenCatalogItem,
  onOpenConnector,
  onConfirm,
  onCancel
}: BomExportPreviewDialogProps): ReactElement | null {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const { dialogRef, onKeyDown } = useModalDialog<HTMLElement>({ isOpen, onClose: onCancel, initialFocusRef: cancelButtonRef });
  const previousPreviewRef = useRef(preview);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const titleId = "bom-export-preview-title";
  const descriptionId = "bom-export-preview-description";
  const previewSheets = useMemo(() => buildPreviewSheets(preview), [preview]);
  const fallbackSheet = previewSheets[0] ?? { name: "Network BOM", headers: preview.headers, rows: preview.rows };
  const activeSheet = previewSheets[Math.min(activeSheetIndex, previewSheets.length - 1)] ?? fallbackSheet;
  const typeColumnIndex = activeSheet.headers.indexOf(t("ui.type"));
  const manufacturerReferenceColumnIndex = activeSheet.headers.indexOf(t("ui.manufacturerReference"));
  const connectorIdColumnIndex = activeSheet.headers.indexOf("Connector ID");
  const connectorNameColumnIndex = activeSheet.headers.indexOf(t("ui.connectorName"));
  const formatLabel = preview.format.toUpperCase();

  useEffect(() => {
    if (previousPreviewRef.current !== preview) {
      previousPreviewRef.current = preview;
      setActiveSheetIndex(0);
    }
  }, [preview]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={themeHostClassName ? `confirm-dialog-layer ${themeHostClassName}` : "confirm-dialog-layer"} role="presentation">
      <button type="button" className="confirm-dialog-backdrop" aria-label={t("ui.bomexportpreviewdialogCloseBOMPreview")} onClick={onCancel} />
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
          <h2 id={titleId}>{t("ui.bomexportpreviewdialogBomPreview")}</h2>
          <div className="bom-preview-dialog-summary" id={descriptionId}>
            <span className="bom-preview-summary-item">
              <span className="bom-preview-summary-label">{t("ui.bomexportpreviewdialogItems")}</span>
              <span className="bom-preview-summary-value">{preview.itemRowCount}</span>
            </span>
            <span className="bom-preview-summary-item">
              <span className="bom-preview-summary-label">{t("ui.bomexportpreviewdialogRows")}</span>
              <span className="bom-preview-summary-value">{preview.rows.length}</span>
            </span>
            <span className="bom-preview-summary-item">
              <span className="bom-preview-summary-label">{t("ui.bomexportpreviewdialogFormat")}</span>
              <span className="bom-preview-summary-value">{formatLabel}</span>
            </span>
            {previewSheets.length > 1 ? (
              <span className="bom-preview-summary-item">
                <span className="bom-preview-summary-label">{t("ui.bomexportpreviewdialogSheets")}</span>
                <span className="bom-preview-summary-value">{previewSheets.length}</span>
              </span>
            ) : null}
            <span className="bom-preview-summary-item">
              <span className="bom-preview-summary-label">{t("ui.bomexportpreviewdialogCurrency")}</span>
              <span className="bom-preview-summary-value">{preview.workspaceCurrencyCode}</span>
            </span>
            <span className="bom-preview-summary-item">
              <span className="bom-preview-summary-label">{t("ui.bomexportpreviewdialogTax")}</span>
              <span className="bom-preview-summary-value">
                {preview.workspaceTaxEnabled ? `${preview.workspaceTaxRatePercent.toFixed(2)}%` : t("ui.disabled")}
              </span>
            </span>
            {preview.compactColumns ? (
              <span className="bom-preview-summary-item">
                <span className="bom-preview-summary-label">{t("ui.bomexportpreviewdialogColumns")}</span>
                <span className="bom-preview-summary-value">{t("ui.compact")}</span>
              </span>
            ) : null}
          </div>
        </header>
        {preview.warnings.length > 0 ? (
          <div className="confirm-dialog-details bom-preview-warnings" role="status">
            <span className="confirm-dialog-details-label">{t("ui.warnings2")}</span>
            <ul>
              {preview.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {previewSheets.length > 1 ? (
          <div className="bom-preview-sheet-tabs" role="tablist" aria-label={t("ui.bomexportpreviewdialogBomPreviewSheets")}>
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
        <div id="bom-preview-sheet-panel" role="tabpanel" className="bom-preview-table-shell" tabIndex={0} aria-label={t("ui.bomexportpreviewdialogNameTablePreview", { name: activeSheet.name })}>
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
                  {activeSheet.headers.map((header, columnIndex) => {
                    const cellValue = formatPreviewCell(row[columnIndex]);
                    const rowType = typeColumnIndex >= 0 ? formatPreviewCell(row[typeColumnIndex]) : "";
                    const linkedCatalogItemId =
                      rowType === t("ui.catalogItem") && columnIndex === manufacturerReferenceColumnIndex
                        ? preview.catalogItemReferenceLinks[cellValue]
                        : undefined;
                    const connectorTechnicalId = connectorIdColumnIndex >= 0 ? formatPreviewCell(row[connectorIdColumnIndex]) : "";
                    const linkedConnectorId =
                      activeSheet.name === "By connector" &&
                      (columnIndex === connectorIdColumnIndex || columnIndex === connectorNameColumnIndex)
                        ? preview.connectorTechnicalIdLinks[connectorTechnicalId]
                        : undefined;
                    return (
                      <td key={`${header}-${columnIndex}`}>
                        {linkedCatalogItemId !== undefined ? (
                          <EntityReferenceButton
                            className="technical-id"
                            title={t("ui.bomexportpreviewdialogOpenCatalogItemCellValue", { cellValue: cellValue })}
                            onClick={() => onOpenCatalogItem(linkedCatalogItemId)}
                          >
                            {cellValue}
                          </EntityReferenceButton>
                        ) : linkedConnectorId !== undefined ? (
                          <EntityReferenceButton
                            className={columnIndex === connectorIdColumnIndex ? "technical-id" : ""}
                            title={t("ui.bomexportpreviewdialogOpenConnectorConnectorTechnicalId", { connectorTechnicalId: connectorTechnicalId })}
                            onClick={() => onOpenConnector(linkedConnectorId)}
                          >
                            {cellValue}
                          </EntityReferenceButton>
                        ) : (
                          cellValue
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="confirm-dialog-actions">
          <button ref={cancelButtonRef} type="button" className="confirm-dialog-cancel" onClick={onCancel}>
            
            {t("ui.cancel")}
          </button>
          <button type="button" className="button-with-icon confirm-dialog-confirm" onClick={onConfirm}>
            <span className="table-export-icon" aria-hidden="true" />
            <span>{t("ui.bomexportpreviewdialogDownload")}{formatLabel}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
