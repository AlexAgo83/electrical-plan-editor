import { translateCurrent as t } from "../../lib/i18n";
import { useRef, type ReactElement } from "react";
import { useModalDialog } from "../../hooks/useModalDialog";
import type { ConfirmDialogIntent } from "../../types/confirm-dialog";

interface FileFeedbackDialogProps {
  isOpen: boolean;
  themeHostClassName?: string;
  title: string;
  message: string;
  items?: string[];
  intent?: ConfirmDialogIntent;
  onClose: () => void;
}

export function FileFeedbackDialog({ isOpen, themeHostClassName, title, message, items = [], intent = "warning", onClose }: FileFeedbackDialogProps): ReactElement | null {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const { dialogRef, onKeyDown } = useModalDialog<HTMLElement>({ isOpen, onClose, initialFocusRef: closeButtonRef, identity: title });
  if (!isOpen) return null;
  const intentClassName = intent === "danger" ? "is-danger" : intent === "warning" ? "is-warning" : "is-neutral";
  const titleId = `file-feedback-dialog-title-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const descriptionId = `${titleId}-description`;
  return (
    <div className={themeHostClassName ? `confirm-dialog-layer ${themeHostClassName}` : "confirm-dialog-layer"} role="presentation">
      <button type="button" className="confirm-dialog-backdrop" aria-label={t("ui.filefeedbackdialogCloseImportFeedback")} onClick={onClose} />
      <section ref={dialogRef} className={`confirm-dialog panel ${intentClassName}`} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} tabIndex={-1} onKeyDown={onKeyDown}>
        <header className="confirm-dialog-header"><h2 id={titleId}>{title}</h2></header>
        <p id={descriptionId} className="confirm-dialog-message">{message}</p>
        {items.length > 0 ? (
          <div className="confirm-dialog-details">
            <span className="confirm-dialog-details-label">{t("ui.filefeedbackdialogDetails")}</span>
            <ul className="confirm-dialog-feedback-list">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
          </div>
        ) : null}
        <footer className="confirm-dialog-actions">
          <button ref={closeButtonRef} type="button" className="button-with-icon confirm-dialog-confirm" onClick={onClose}>
            <span className="action-button-icon is-open" aria-hidden="true" /><span>{t("ui.close")}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
