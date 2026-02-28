import type { ReactElement, RefObject } from "react";
interface AppHeaderAndStatsProps {
  headerBlockRef: RefObject<HTMLElement | null>;
  isNavigationDrawerOpen: boolean;
  onToggleNavigationDrawer: () => void;
  navigationToggleButtonRef: RefObject<HTMLButtonElement | null>;
  isSettingsActive: boolean;
  onOpenSettings: () => void;
  isInstallPromptAvailable: boolean;
  onInstallApp: () => void;
  isPwaUpdateReady: boolean;
  onApplyPwaUpdate: () => void;
  isOperationsPanelOpen: boolean;
  onToggleOperationsPanel: () => void;
  operationsButtonRef: RefObject<HTMLButtonElement | null>;
  validationIssuesCount: number;
  validationErrorCount: number;
  lastError: string | null;
  onClearError: () => void;
}

export function AppHeaderAndStats({
  headerBlockRef,
  isNavigationDrawerOpen,
  onToggleNavigationDrawer,
  navigationToggleButtonRef,
  isSettingsActive,
  onOpenSettings,
  isInstallPromptAvailable,
  onInstallApp,
  isPwaUpdateReady,
  onApplyPwaUpdate,
  isOperationsPanelOpen,
  onToggleOperationsPanel,
  operationsButtonRef,
  validationIssuesCount,
  validationErrorCount,
  lastError,
  onClearError
}: AppHeaderAndStatsProps): ReactElement {
  const opsStatusDescription = `${validationIssuesCount} validation issue${validationIssuesCount === 1 ? "" : "s"}${
    validationErrorCount > 0
      ? `, ${validationErrorCount} error${validationErrorCount === 1 ? "" : "s"}`
      : ", no errors"
  }`;
  return (
    <>
      <section
        ref={headerBlockRef}
        className={isNavigationDrawerOpen ? "header-block is-drawer-open" : "header-block"}
      >
        <button
          ref={navigationToggleButtonRef}
          type="button"
          className="header-nav-toggle"
          onClick={onToggleNavigationDrawer}
          aria-label={isNavigationDrawerOpen ? "Close menu" : "Open menu"}
          aria-expanded={isNavigationDrawerOpen}
          aria-controls="workspace-navigation-drawer"
        >
          <span className="header-nav-icon" aria-hidden="true" />
        </button>
        <h1 className="header-title">
          <span className="header-title-accent">e</span>-Plan Editor
        </h1>
        <div className="header-actions">
          {isInstallPromptAvailable ? (
            <button type="button" className="header-install-toggle" onClick={onInstallApp}>
              Install app
            </button>
          ) : null}
          {isPwaUpdateReady ? (
            <button type="button" className="header-update-toggle is-ready-glow" onClick={onApplyPwaUpdate}>
              Update ready
            </button>
          ) : null}
          <button
            type="button"
            className={isSettingsActive ? "header-settings-toggle is-active" : "header-settings-toggle"}
            aria-pressed={isSettingsActive}
            aria-label="Settings"
            onClick={onOpenSettings}
          >
            <span className="header-settings-icon" aria-hidden="true" />
            <span className="header-settings-label">Settings</span>
          </button>
          <button
            ref={operationsButtonRef}
            type="button"
            className="header-ops-toggle"
            onClick={onToggleOperationsPanel}
            aria-expanded={isOperationsPanelOpen}
            aria-controls="workspace-operations-panel"
            aria-label="Ops & Health"
            aria-description={opsStatusDescription}
          >
            <span className="header-ops-icon" aria-hidden="true" />
            <span className="header-ops-label">Ops &amp; Health</span>
            <span
              className={validationErrorCount > 0 ? "header-ops-badge is-error" : "header-ops-badge"}
              aria-hidden="true"
            >
              {validationIssuesCount}
            </span>
          </button>
        </div>
      </section>

      {lastError !== null ? (
        <section className="error-banner" role="alert">
          <p>{lastError}</p>
          <button type="button" onClick={onClearError}>
            Clear
          </button>
        </section>
      ) : null}
    </>
  );
}
