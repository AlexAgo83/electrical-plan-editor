import { translateCurrent as t } from "../../lib/i18n";
import { useRef, type ReactElement } from "react";
import type { CatalogItem, Connector, Network, Splice, Wire } from "../../../core/entities";
import { useModalDialog } from "../../hooks/useModalDialog";
import { PinRoleMassEditPanel, type PinRoleMassEditUpdate } from "./PinRoleMassEditPanel";

interface PinRoleMassEditDialogProps {
  isOpen: boolean;
  activeNetwork: Network | null;
  connectors: Connector[];
  splices: Splice[];
  wires: Wire[];
  catalogItems: CatalogItem[];
  onApplyPinRoleMassEdit: (updates: PinRoleMassEditUpdate[]) => void;
  onClose: () => void;
}

export function PinRoleMassEditDialog(props: PinRoleMassEditDialogProps): ReactElement | null {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const { dialogRef, onKeyDown } = useModalDialog<HTMLElement>({ isOpen: props.isOpen, onClose: props.onClose, initialFocusRef: closeButtonRef });
  if (!props.isOpen) return null;
  return (
    <div className="confirm-dialog-layer app-shell" role="presentation">
      <button type="button" className="confirm-dialog-backdrop" aria-label={t("ui.pinrolemasseditdialogClosePinRoleMassEdit")} onClick={props.onClose} />
      <section ref={dialogRef} className="confirm-dialog panel workspace-tool-dialog pin-role-mass-edit-dialog is-neutral" role="dialog" aria-modal="true" aria-labelledby="pin-role-mass-edit-dialog-title" tabIndex={-1} onKeyDown={onKeyDown}>
        <header className="confirm-dialog-header workspace-tool-dialog-header">
          <h2 id="pin-role-mass-edit-dialog-title">{t("ui.pinrolemasseditdialogPinRoleMassEdit")}</h2>
          <button ref={closeButtonRef} type="button" className="confirm-dialog-cancel" onClick={props.onClose}>{t("ui.close")}</button>
        </header>
        <PinRoleMassEditPanel activeNetwork={props.activeNetwork} connectors={props.connectors} splices={props.splices} wires={props.wires} catalogItems={props.catalogItems} onApplyPinRoleMassEdit={props.onApplyPinRoleMassEdit} />
      </section>
    </div>
  );
}
