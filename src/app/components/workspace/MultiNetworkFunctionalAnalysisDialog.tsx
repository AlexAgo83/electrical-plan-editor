import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactElement } from "react";
import type { NetworkId } from "../../../core/entities";
import type {
  MultiNetworkFunctionalAnalysisModel,
  MultiNetworkFunctionalAnalysisScope,
  MultiNetworkFunctionalAnalysisTarget
} from "../../lib/multiNetworkFunctionalAnalysis";
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

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
}

export function MultiNetworkFunctionalAnalysisDialog({
  isOpen,
  model,
  scope,
  setScope,
  onToggleCustomNetwork,
  onGoToFinding,
  onClose
}: MultiNetworkFunctionalAnalysisDialogProps): ReactElement | null {
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    previousFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
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
      onClose();
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
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    if (firstFocusable === undefined || lastFocusable === undefined) {
      event.preventDefault();
      dialogElement.focus();
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
    <div className="confirm-dialog-layer app-shell" role="presentation">
      <button type="button" className="confirm-dialog-backdrop" aria-label="Close multi-network functional analysis" onClick={onClose} />
      <section
        ref={dialogRef}
        className="confirm-dialog panel workspace-tool-dialog multi-network-functional-analysis-dialog is-neutral"
        role="dialog"
        aria-modal="true"
        aria-labelledby="multi-network-functional-analysis-dialog-title"
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="confirm-dialog-header workspace-tool-dialog-header">
          <h2 id="multi-network-functional-analysis-dialog-title">Multi-network functional analysis</h2>
          <button ref={closeButtonRef} type="button" className="confirm-dialog-cancel" onClick={onClose}>
            Close
          </button>
        </header>
        <MultiNetworkFunctionalAnalysisPanel
          model={model}
          scope={scope}
          setScope={setScope}
          onToggleCustomNetwork={onToggleCustomNetwork}
          onGoToFinding={onGoToFinding}
        />
      </section>
    </div>
  );
}
