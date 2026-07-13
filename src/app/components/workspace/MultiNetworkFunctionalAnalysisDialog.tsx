import { translateCurrent as t } from "../../lib/i18n";
import { useRef, type ReactElement } from "react";
import type { NetworkId } from "../../../core/entities";
import { useModalDialog } from "../../hooks/useModalDialog";
import type { MultiNetworkFunctionalAnalysisModel, MultiNetworkFunctionalAnalysisScope, MultiNetworkFunctionalAnalysisTarget } from "../../lib/multiNetworkFunctionalAnalysis";
import { MultiNetworkFunctionalAnalysisPanel } from "./MultiNetworkFunctionalAnalysisPanel";

interface MultiNetworkFunctionalAnalysisDialogProps {
  isOpen: boolean;
  model: MultiNetworkFunctionalAnalysisModel;
  scope: MultiNetworkFunctionalAnalysisScope;
  setScope: (value: MultiNetworkFunctionalAnalysisScope) => void;
  onToggleCustomNetwork: (networkId: NetworkId) => void;
  onGoToFinding: (target: MultiNetworkFunctionalAnalysisTarget) => void;
  onClose: () => void;
}

export function MultiNetworkFunctionalAnalysisDialog(props: MultiNetworkFunctionalAnalysisDialogProps): ReactElement | null {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const { dialogRef, onKeyDown } = useModalDialog<HTMLElement>({ isOpen: props.isOpen, onClose: props.onClose, initialFocusRef: closeButtonRef });
  if (!props.isOpen) return null;
  return (
    <div className="confirm-dialog-layer app-shell" role="presentation">
      <button type="button" className="confirm-dialog-backdrop" aria-label={t("ui.multinetworkfunctionalanalysisdialogCloseMultiNetworkFunctionalAnalysis")} onClick={props.onClose} />
      <section ref={dialogRef} className="confirm-dialog panel workspace-tool-dialog multi-network-functional-analysis-dialog is-neutral" role="dialog" aria-modal="true" aria-labelledby="multi-network-functional-analysis-dialog-title" tabIndex={-1} onKeyDown={onKeyDown}>
        <header className="confirm-dialog-header workspace-tool-dialog-header">
          <h2 id="multi-network-functional-analysis-dialog-title">Multi-network functional analysis</h2>
          <button ref={closeButtonRef} type="button" className="confirm-dialog-cancel" onClick={props.onClose}>{t("ui.close")}</button>
        </header>
        <MultiNetworkFunctionalAnalysisPanel model={props.model} scope={props.scope} setScope={props.setScope} onToggleCustomNetwork={props.onToggleCustomNetwork} onGoToFinding={props.onGoToFinding} />
      </section>
    </div>
  );
}
