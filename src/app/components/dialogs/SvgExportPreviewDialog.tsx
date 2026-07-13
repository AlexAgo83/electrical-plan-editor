import { translateCurrent as t } from "../../lib/i18n";
import { useLayoutEffect, useRef, type ReactElement } from "react";
import { useModalDialog } from "../../hooks/useModalDialog";
import type { ThemeMode } from "../../../store";
import { getThemeClassNames, getThemeModeOptions } from "../../lib/themeModes";
import type { SvgExportPreviewState, SvgPreviewOptions } from "../network-summary/export/useNetworkSummaryExportActions";

interface SvgExportPreviewDialogProps {
  isOpen: boolean;
  themeHostClassName?: string;
  showDecorationOptions?: boolean;
  showGridOption?: boolean;
  preview: SvgExportPreviewState | null;
  onPreviewOptionsChange: (options: SvgPreviewOptions) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SvgExportPreviewDialog({
  isOpen,
  themeHostClassName,
  showDecorationOptions = true,
  showGridOption = false,
  preview,
  onPreviewOptionsChange,
  onConfirm,
  onCancel
}: SvgExportPreviewDialogProps): ReactElement | null {
  const previewShellRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const { dialogRef, onKeyDown } = useModalDialog<HTMLElement>({ isOpen, onClose: onCancel, initialFocusRef: cancelButtonRef });
  const titleId = "svg-export-preview-title";
  const descriptionId = "svg-export-preview-description";

  useLayoutEffect(() => {
    if (!isOpen || preview === null) {
      return;
    }

    const previewShell = previewShellRef.current;
    if (previewShell === null) {
      return;
    }

    previewShell.scrollLeft = Math.max(0, (previewShell.scrollWidth - previewShell.clientWidth) / 2);
    previewShell.scrollTop = Math.max(0, (previewShell.scrollHeight - previewShell.clientHeight) / 2);
  }, [isOpen, preview]);

  if (!isOpen || preview === null) {
    return null;
  }
  const previewFormatLabel = preview.format.toUpperCase();
  const previewTitle = `${previewFormatLabel} preview`;
  const previewAriaLabel = `${previewFormatLabel} export preview`;

  const handleFrameChange = (includeFrame: boolean): void => {
    onPreviewOptionsChange({
      format: preview.format,
      includeFrame,
      includeCartouche: preview.includeCartouche,
      includeGrid: preview.includeGrid,
      fitToContent: preview.fitToContent,
      themeMode: preview.themeMode
    });
  };

  const handleCartoucheChange = (includeCartouche: boolean): void => {
    onPreviewOptionsChange({
      format: preview.format,
      includeFrame: preview.includeFrame,
      includeCartouche,
      includeGrid: preview.includeGrid,
      fitToContent: preview.fitToContent,
      themeMode: preview.themeMode
    });
  };

  const handleGridChange = (includeGrid: boolean): void => {
    onPreviewOptionsChange({
      format: preview.format,
      includeFrame: preview.includeFrame,
      includeCartouche: preview.includeCartouche,
      includeGrid,
      fitToContent: preview.fitToContent,
      themeMode: preview.themeMode
    });
  };

  const handleThemeChange = (themeMode: ThemeMode): void => {
    onPreviewOptionsChange({
      format: preview.format,
      includeFrame: preview.includeFrame,
      includeCartouche: preview.includeCartouche,
      includeGrid: preview.includeGrid,
      fitToContent: preview.fitToContent,
      themeMode
    });
  };
  const layerClassName = ["confirm-dialog-layer", themeHostClassName ?? ""].filter((token) => token.length > 0).join(" ");
  const previewThemeHostClassName = ["svg-preview-theme-host", "app-shell", ...getThemeClassNames(preview.themeMode)]
    .filter((token) => token.length > 0)
    .join(" ");

  return (
    <div className={layerClassName} role="presentation">
      <button type="button" className="confirm-dialog-backdrop" aria-label={`Close ${previewFormatLabel} preview`} onClick={onCancel} />
      <section
        ref={dialogRef}
        className="confirm-dialog panel bom-preview-dialog svg-preview-dialog is-neutral"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <header className="confirm-dialog-header bom-preview-dialog-header">
          <h2 id={titleId}>{previewTitle}</h2>
          <div className="bom-preview-dialog-summary" id={descriptionId}>
            <span className="bom-preview-summary-item">
              <span className="bom-preview-summary-label">Format</span>
              <span className="bom-preview-summary-value">{previewFormatLabel}</span>
            </span>
            <span className="bom-preview-summary-item">
              <span className="bom-preview-summary-label">Size</span>
              <span className="bom-preview-summary-value">
                {preview.exportWidth} x {preview.exportHeight}
              </span>
            </span>
          </div>
        </header>
        <div className="svg-preview-toolbar" aria-label="SVG preview options">
          {showDecorationOptions ? (
            <>
              <label className="settings-checkbox-row">
                <input type="checkbox" checked={preview.includeFrame} onChange={(event) => handleFrameChange(event.target.checked)} />
                <span>Include frame</span>
              </label>
              <label className="settings-checkbox-row">
                <input
                  type="checkbox"
                  checked={preview.includeCartouche}
                  onChange={(event) => handleCartoucheChange(event.target.checked)}
                />
                <span>Include identity</span>
              </label>
            </>
          ) : null}
          {showGridOption ? (
            <label className="settings-checkbox-row">
              <input type="checkbox" checked={preview.includeGrid} onChange={(event) => handleGridChange(event.target.checked)} />
              <span>Include grid</span>
            </label>
          ) : null}
          <label className="svg-preview-theme-field">
            <span>{t("ui.theme")}</span>
            <select value={preview.themeMode} onChange={(event) => handleThemeChange(event.target.value as ThemeMode)}>
              {getThemeModeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div ref={previewShellRef} className="svg-preview-shell" tabIndex={0} aria-label={previewAriaLabel}>
          <div className={previewThemeHostClassName}>
            {preview.format === "png" && preview.pngDataUrl !== undefined ? (
              <div className="svg-preview-content">
                <img
                  src={preview.pngDataUrl}
                  width={preview.exportWidth}
                  height={preview.exportHeight}
                  alt=""
                  aria-hidden="true"
                />
              </div>
            ) : (
              <div className="svg-preview-content" dangerouslySetInnerHTML={{ __html: preview.svgMarkup }} />
            )}
          </div>
        </div>
        <footer className="confirm-dialog-actions">
          <button ref={cancelButtonRef} type="button" className="confirm-dialog-cancel" onClick={onCancel}>
            
            {t("ui.cancel")}
          </button>
          <button type="button" className="button-with-icon confirm-dialog-confirm" onClick={onConfirm}>
            <span className="network-summary-export-icon" aria-hidden="true" />
            <span>Download {previewFormatLabel}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
