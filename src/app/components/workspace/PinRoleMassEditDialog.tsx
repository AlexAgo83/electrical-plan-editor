import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactElement } from "react";
import type { CatalogItem, Connector, Network, Splice, Wire } from "../../../core/entities";
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

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
}

export function PinRoleMassEditDialog({
  isOpen,
  activeNetwork,
  connectors,
  splices,
  wires,
  catalogItems,
  onApplyPinRoleMassEdit,
  onClose
}: PinRoleMassEditDialogProps): ReactElement | null {
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
      <button type="button" className="confirm-dialog-backdrop" aria-label="Close pin role mass edit" onClick={onClose} />
      <section
        ref={dialogRef}
        className="confirm-dialog panel workspace-tool-dialog pin-role-mass-edit-dialog is-neutral"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pin-role-mass-edit-dialog-title"
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="confirm-dialog-header workspace-tool-dialog-header">
          <h2 id="pin-role-mass-edit-dialog-title">Pin role mass edit</h2>
          <button ref={closeButtonRef} type="button" className="confirm-dialog-cancel" onClick={onClose}>
            Close
          </button>
        </header>
        <PinRoleMassEditPanel
          activeNetwork={activeNetwork}
          connectors={connectors}
          splices={splices}
          wires={wires}
          catalogItems={catalogItems}
          onApplyPinRoleMassEdit={onApplyPinRoleMassEdit}
        />
      </section>
    </div>
  );
}
