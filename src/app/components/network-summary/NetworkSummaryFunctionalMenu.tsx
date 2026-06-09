import { useEffect, useRef, useState, type ReactElement } from "react";

interface NetworkSummaryFunctionalMenuProps {
  onOpenHarnessAssembly: () => void;
  onOpenAnalysis?: () => void;
}

export function NetworkSummaryFunctionalMenu({
  onOpenHarnessAssembly,
  onOpenAnalysis
}: NetworkSummaryFunctionalMenuProps): ReactElement {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current !== null && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleOpenHarnessAssembly(): void {
    setOpen(false);
    onOpenHarnessAssembly();
  }

  function handleOpenAnalysis(): void {
    setOpen(false);
    onOpenAnalysis?.();
  }

  return (
    <div ref={wrapperRef} className="network-summary-view-menu-wrapper">
      <button
        type="button"
        className="workspace-tab network-summary-export-button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="action-button-icon is-harness-assembly" aria-hidden="true" />
        Functional
      </button>
      {open ? (
        <div className="panel network-summary-view-menu network-summary-view-menu--right">
          <button type="button" className="network-summary-view-menu-item" onClick={handleOpenHarnessAssembly}>
            <span className="action-button-icon is-harness-assembly" aria-hidden="true" />
            Harness assembly
          </button>
          {onOpenAnalysis === undefined ? null : (
            <button type="button" className="network-summary-view-menu-item" onClick={handleOpenAnalysis}>
              <span className="action-button-icon is-analysis" aria-hidden="true" />
              Analysis
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
