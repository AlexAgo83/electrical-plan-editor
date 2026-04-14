import { useEffect, useRef, useState, type ReactElement } from "react";

interface NetworkSummaryViewMenuProps {
  showNetworkInfoPanels: boolean;
  showSegmentLengths: boolean;
  showCableCallouts: boolean;
  toggleShowNetworkInfoPanels: () => void;
  toggleShowSegmentLengths: () => void;
  toggleShowCableCallouts: () => void;
}

export function NetworkSummaryViewMenu({
  showNetworkInfoPanels,
  showSegmentLengths,
  showCableCallouts,
  toggleShowNetworkInfoPanels,
  toggleShowSegmentLengths,
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
