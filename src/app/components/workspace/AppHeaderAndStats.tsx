import type { ReactElement, RefObject } from "react";
interface AppHeaderAndStatsProps {
  activeNetworkLabel: string;
  isNavigationDrawerOpen: boolean;
  onToggleNavigationDrawer: () => void;
  navigationToggleButtonRef: RefObject<HTMLButtonElement | null>;
  lastError: string | null;
  onClearError: () => void;
  connectorCount: number;
  spliceCount: number;
  nodeCount: number;
  segmentCount: number;
  wireCount: number;
}

export function AppHeaderAndStats({
  activeNetworkLabel,
  isNavigationDrawerOpen,
  onToggleNavigationDrawer,
  navigationToggleButtonRef,
  lastError,
  onClearError,
  connectorCount,
  spliceCount,
  nodeCount,
  segmentCount,
  wireCount
}: AppHeaderAndStatsProps): ReactElement {
  return (
    <>
      <section className="header-block">
        <button
          ref={navigationToggleButtonRef}
          type="button"
          className="header-nav-toggle"
          onClick={onToggleNavigationDrawer}
          aria-expanded={isNavigationDrawerOpen}
          aria-controls="workspace-navigation-drawer"
        >
          {isNavigationDrawerOpen ? "Close menu" : "Open menu"}
        </button>
        <h1>Electrical Plan Editor</h1>
        <p className="meta-line">
          Active network: <strong>{activeNetworkLabel}</strong>
        </p>
      </section>

      {lastError !== null ? (
        <section className="error-banner" role="alert">
          <p>{lastError}</p>
          <button type="button" onClick={onClearError}>
            Clear
          </button>
        </section>
      ) : null}

      <section className="stats-grid" aria-label="Entity counters">
        <article>
          <h2>Connectors</h2>
          <p>{connectorCount}</p>
        </article>
        <article>
          <h2>Splices</h2>
          <p>{spliceCount}</p>
        </article>
        <article>
          <h2>Nodes</h2>
          <p>{nodeCount}</p>
        </article>
        <article>
          <h2>Segments</h2>
          <p>{segmentCount}</p>
        </article>
        <article>
          <h2>Wires</h2>
          <p>{wireCount}</p>
        </article>
      </section>
    </>
  );
}
