import { useEffect, useRef, useState, type ReactElement } from "react";

interface NetworkSummaryViewMenuProps {
  showFloatingInspectorPanel: boolean;
  showNetworkInfoPanels: boolean;
  showSegmentLengths: boolean;
  showSegmentDressings: boolean;
  showCableCallouts: boolean;
  toggleShowFloatingInspectorPanel: () => void;
  toggleShowNetworkInfoPanels: () => void;
  toggleShowSegmentLengths: () => void;
  toggleShowSegmentDressings: () => void;
  toggleShowCableCallouts: () => void;
}

export function NetworkSummaryViewMenu({
  showFloatingInspectorPanel,
  showNetworkInfoPanels,
  showSegmentLengths,
  showSegmentDressings,
  showCableCallouts,
  toggleShowFloatingInspectorPanel,
  toggleShowNetworkInfoPanels,
  toggleShowSegmentLengths,
  toggleShowSegmentDressings,
  toggleShowCableCallouts
}: NetworkSummaryViewMenuProps): ReactElement {
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

  return (
    <div ref={wrapperRef} className="network-summary-view-menu-wrapper">
      <button
        type="button"
        className="workspace-tab network-summary-export-button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="network-summary-view-icon" aria-hidden="true" />
        View
      </button>
      {open && (
        <div className="panel network-summary-view-menu network-summary-view-menu--right">
          <button
            type="button"
            className={showFloatingInspectorPanel ? "network-summary-view-menu-item is-active" : "network-summary-view-menu-item"}
            onClick={toggleShowFloatingInspectorPanel}
            aria-pressed={showFloatingInspectorPanel}
            aria-label={showFloatingInspectorPanel ? "Hide inspector" : "Show inspector"}
          >
            <span className="network-summary-inspector-icon" aria-hidden="true" />
            Inspect
          </button>
          <button
            type="button"
            className={showNetworkInfoPanels ? "network-summary-view-menu-item is-active" : "network-summary-view-menu-item"}
            onClick={toggleShowNetworkInfoPanels}
          >
            <span className="network-summary-info-icon" aria-hidden="true" />
            Info
          </button>
          <button
            type="button"
            className={showSegmentLengths ? "network-summary-view-menu-item is-active" : "network-summary-view-menu-item"}
            onClick={toggleShowSegmentLengths}
          >
            <span className="network-summary-length-icon" aria-hidden="true" />
            Length
          </button>
          <button
            type="button"
            className={showSegmentDressings ? "network-summary-view-menu-item is-active" : "network-summary-view-menu-item"}
            onClick={toggleShowSegmentDressings}
          >
            <span className="network-summary-callouts-icon" aria-hidden="true" />
            Dressings
          </button>
          <button
            type="button"
            className={showCableCallouts ? "network-summary-view-menu-item is-active" : "network-summary-view-menu-item"}
            onClick={toggleShowCableCallouts}
          >
            <span className="network-summary-callouts-icon" aria-hidden="true" />
            Callouts
          </button>
        </div>
      )}
    </div>
  );
}
