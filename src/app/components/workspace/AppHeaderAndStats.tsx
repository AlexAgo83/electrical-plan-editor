import { translateCurrent as t } from "../../lib/i18n";
import type { ReactElement, ReactNode, RefObject } from "react";
import type { AppError } from "../../../store/types";
interface AppHeaderAndStatsProps {
  headerBlockRef: RefObject<HTMLElement | null>;
  isNavigationDrawerOpen: boolean;
  onToggleNavigationDrawer: () => void;
  navigationToggleButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenHome: () => void;
  isSettingsActive: boolean;
  onOpenSettings: () => void;
  isInstallPromptAvailable: boolean;
  isDockedNavigationVisible: boolean;
  onInstallApp: () => void;
  isPwaUpdateReady: boolean;
  onApplyPwaUpdate: () => void;
  isOperationsPanelOpen: boolean;
  onToggleOperationsPanel: () => void;
  operationsButtonRef: RefObject<HTMLButtonElement | null>;
  validationIssuesCount: number;
  validationErrorCount: number;
  lastError: AppError | null;
  onClearError: () => void;
  bootRecoveryMessage: string | null;
  onCommitBootRecovery: () => void;
  centerContent?: ReactNode;
}

export function AppHeaderAndStats({
  headerBlockRef,
  isNavigationDrawerOpen,
  onToggleNavigationDrawer,
  navigationToggleButtonRef,
  onOpenHome,
  isSettingsActive,
  onOpenSettings,
  isInstallPromptAvailable,
  isDockedNavigationVisible,
  onInstallApp,
  isPwaUpdateReady,
  onApplyPwaUpdate,
  isOperationsPanelOpen,
  onToggleOperationsPanel,
  operationsButtonRef,
  validationIssuesCount,
  validationErrorCount,
  lastError,
  onClearError,
  bootRecoveryMessage,
  onCommitBootRecovery,
  centerContent = null
}: AppHeaderAndStatsProps): ReactElement {
  const headerClassName = [
    "header-block",
    isNavigationDrawerOpen ? "is-drawer-open" : "",
    isDockedNavigationVisible ? "has-center-content" : ""
  ]
    .filter((token) => token.length > 0)
    .join(" ");
  const opsStatusDescription = `${validationIssuesCount} validation issue${validationIssuesCount === 1 ? "" : "s"}${
    validationErrorCount > 0
      ? `, ${validationErrorCount} error${validationErrorCount === 1 ? "" : "s"}`
      : ", no errors"
  }`;
  return (
    <>
      <section
        ref={headerBlockRef}
        className={headerClassName}
      >
        <div className="header-brand">
          <button
            ref={navigationToggleButtonRef}
            type="button"
            className="header-nav-toggle"
            onClick={onToggleNavigationDrawer}
            aria-label={isNavigationDrawerOpen ? t("ui.closeMenu") : t("ui.openMenu")}
            aria-expanded={isNavigationDrawerOpen}
            aria-controls="workspace-navigation-drawer"
          >
            <span className="header-nav-icon" aria-hidden="true" />
          </button>
          <h1 className="header-title">
            <button type="button" className="header-title-button" onClick={onOpenHome}>
              <span className="header-title-accent">e</span>-Plan<span className="header-title-full"> Editor</span>
            </button>
          </h1>
        </div>
        {centerContent !== null ? <div className="header-center-content">{centerContent}</div> : null}
        <div className="header-actions">
          {isInstallPromptAvailable && !isDockedNavigationVisible ? (
            <button type="button" className="header-install-toggle" onClick={onInstallApp}>
              <span className="header-install-icon" aria-hidden="true" />
              <span className="header-install-label">{t("ui.installApp")}</span>
            </button>
          ) : null}
          {isPwaUpdateReady ? (
            <button
              type="button"
              className={
                isDockedNavigationVisible
                  ? "header-update-toggle is-ready-glow is-icon-only"
                  : "header-update-toggle is-ready-glow"
              }
              onClick={onApplyPwaUpdate}
              aria-label={t("ui.updateReady")}
              title={t("ui.updateReady")}
            >
              <span className="action-button-icon is-redo" aria-hidden="true" />
              <span className="header-update-label">{t("ui.updateReady")}</span>
            </button>
          ) : null}
          <button
            type="button"
            className={isSettingsActive ? "header-settings-toggle is-active" : "header-settings-toggle"}
            aria-pressed={isSettingsActive}
            aria-label={t("ui.settings")}
            onClick={onOpenSettings}
          >
            <span className="header-settings-icon" aria-hidden="true" />
            <span className="header-settings-label">{t("ui.settings")}</span>
          </button>
          <button
            ref={operationsButtonRef}
            type="button"
            className="header-ops-toggle"
            onClick={onToggleOperationsPanel}
            aria-expanded={isOperationsPanelOpen}
            aria-controls="workspace-operations-panel"
            aria-label={t("ui.ops")}
            aria-description={opsStatusDescription}
          >
            <span className="header-ops-icon" aria-hidden="true" />
            <span className="header-ops-label">{t("ui.ops")}</span>
            <span
              className={validationErrorCount > 0 ? "header-ops-badge is-error" : "header-ops-badge"}
              aria-hidden="true"
            >
              {validationIssuesCount}
            </span>
          </button>
        </div>
      </section>

      {bootRecoveryMessage !== null ? (
        <section className="error-banner" role="alert">
          <p>{bootRecoveryMessage}</p>
          <div className="inline-actions">
            <button type="button" onClick={onCommitBootRecovery}>
              Reset stored workspace
            </button>
            <button type="button" onClick={onClearError}>
              Dismiss
            </button>
          </div>
        </section>
      ) : null}

      {lastError !== null && lastError.message !== bootRecoveryMessage ? (
        <section className="error-banner" role="alert">
          <p>{lastError.message}</p>
          <p>
            <small>{lastError.code}</small>
          </p>
          <button type="button" onClick={onClearError}>
            
            {t("ui.clear")}
          </button>
        </section>
      ) : null}
    </>
  );
}
