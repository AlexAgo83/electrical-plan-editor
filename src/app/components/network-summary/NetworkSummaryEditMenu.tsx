import { useEffect, useRef, useState, type ReactElement } from "react";

interface NetworkSummaryEditMenuProps {
  showNetworkGrid: boolean;
  snapNodesToGrid: boolean;
  lockEntityMovement: boolean;
  toggleShowNetworkGrid: () => void;
  toggleSnapNodesToGrid: () => void;
  toggleLockEntityMovement: () => void;
  onRegenerateLayout: () => void;
}

export function NetworkSummaryEditMenu({
  showNetworkGrid,
  snapNodesToGrid,
  lockEntityMovement,
  toggleShowNetworkGrid,
  toggleSnapNodesToGrid,
  toggleLockEntityMovement,
  onRegenerateLayout
}: NetworkSummaryEditMenuProps): ReactElement {
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

  function handleRegenerateLayout(): void {
    setOpen(false);
    onRegenerateLayout();
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
        <span className="network-summary-edit-icon" aria-hidden="true" />
        Edit
      </button>
      {open ? (
        <div className="panel network-summary-view-menu network-summary-view-menu--right">
          <button
            type="button"
            className={showNetworkGrid ? "network-summary-view-menu-item is-active" : "network-summary-view-menu-item"}
            onClick={toggleShowNetworkGrid}
          >
            <span className="network-summary-grid-icon" aria-hidden="true" />
            Grid
          </button>
          <button
            type="button"
            className={snapNodesToGrid ? "network-summary-view-menu-item is-active" : "network-summary-view-menu-item"}
            onClick={toggleSnapNodesToGrid}
          >
            <span className="network-summary-snap-icon" aria-hidden="true" />
            Snap
          </button>
          <button
            type="button"
            className={lockEntityMovement ? "network-summary-view-menu-item is-active" : "network-summary-view-menu-item"}
            onClick={toggleLockEntityMovement}
          >
            <span className="network-summary-lock-move-icon" aria-hidden="true" />
            Lock
          </button>
          <button
            type="button"
            className="network-summary-view-menu-item"
            onClick={handleRegenerateLayout}
          >
            <span className="action-button-icon is-prevnext" aria-hidden="true" />
            Generate
          </button>
        </div>
      ) : null}
    </div>
  );
}
