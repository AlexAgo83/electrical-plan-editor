import { useRef, type ReactElement } from "react";
import { useModalDialog } from "../../hooks/useModalDialog";
import type { ChoiceDialogOption, ConfirmDialogIntent } from "../../types/confirm-dialog";

interface ChoiceDialogProps {
  isOpen: boolean;
  themeHostClassName?: string;
  title: string;
  message: string;
  details?: string;
  discardLabel?: string;
  options: ChoiceDialogOption[];
  closeOnBackdrop?: boolean;
  onChoose: (choiceId: string | null) => void;
}

function getIntentClassName(intent: ConfirmDialogIntent | undefined): string {
  return intent === "danger" ? "is-danger" : intent === "warning" ? "is-warning" : "is-neutral";
}

export function ChoiceDialog({
  isOpen, themeHostClassName, title, message, details, discardLabel = "Discard", options,
  closeOnBackdrop = true, onChoose
}: ChoiceDialogProps): ReactElement | null {
  const discardButtonRef = useRef<HTMLButtonElement | null>(null);
  const close = () => onChoose(null);
  const { dialogRef, onKeyDown } = useModalDialog<HTMLElement>({ isOpen, onClose: close, initialFocusRef: discardButtonRef, identity: title });
  if (!isOpen) return null;
  const titleId = `choice-dialog-title-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const descriptionId = `${titleId}-description`;
  const detailsId = `${titleId}-details`;
  return (
    <div className={themeHostClassName ? `confirm-dialog-layer ${themeHostClassName}` : "confirm-dialog-layer"} role="presentation">
      <button type="button" className="confirm-dialog-backdrop" aria-label="Dismiss choice dialog" onClick={closeOnBackdrop ? close : undefined} />
      <section ref={dialogRef} className={`confirm-dialog panel ${getIntentClassName(options[0]?.intent)}`} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={details ? `${descriptionId} ${detailsId}` : descriptionId} tabIndex={-1} onKeyDown={onKeyDown}>
        <header className="confirm-dialog-header"><h2 id={titleId}>{title}</h2></header>
        <p id={descriptionId} className="confirm-dialog-message">{message}</p>
        {details ? <p id={detailsId} className="confirm-dialog-details">{details}</p> : null}
        <footer className="confirm-dialog-actions confirm-dialog-choice-actions">
          <button ref={discardButtonRef} type="button" className="confirm-dialog-cancel" onClick={close}>{discardLabel}</button>
          {options.map((option) => (
            <button key={option.id} type="button" className="button-with-icon confirm-dialog-confirm confirm-dialog-choice-button" onClick={() => onChoose(option.id)}>
              <span className="action-button-icon is-open" aria-hidden="true" /><span>{option.label}</span>
            </button>
          ))}
        </footer>
      </section>
    </div>
  );
}
