import { Suspense, type CSSProperties, type ReactElement, type ReactNode, type RefObject } from "react";
import { AnalysisWorkspaceContainer } from "../containers/AnalysisWorkspaceContainer";
import { ModelingWorkspaceContainer } from "../containers/ModelingWorkspaceContainer";
import { NetworkScopeWorkspaceContainer } from "../containers/NetworkScopeWorkspaceContainer";
import { SettingsWorkspaceContainer } from "../containers/SettingsWorkspaceContainer";
import { ValidationWorkspaceContainer } from "../containers/ValidationWorkspaceContainer";
import type { ScreenContainerComponent } from "../containers/screenContainer.shared";
import { AppHeaderAndStats } from "../workspace/AppHeaderAndStats";
import { OperationsHealthPanel } from "../workspace/OperationsHealthPanel";
import { WorkspaceSidebarPanel } from "../workspace/WorkspaceSidebarPanel";

type AppHeaderAndStatsProps = Parameters<typeof AppHeaderAndStats>[0];
type WorkspaceSidebarPanelProps = Parameters<typeof WorkspaceSidebarPanel>[0];
type OperationsHealthPanelProps = Parameters<typeof OperationsHealthPanel>[0];

interface AppShellLayoutProps {
  appShellClassName: string;
  workspaceShellStyle: CSSProperties;
  appRepositoryUrl: string;
  currentYear: number;
  appVersion: string;
  headerBlockRef: RefObject<HTMLElement | null>;
  navigationToggleButtonRef: RefObject<HTMLButtonElement | null>;
  operationsButtonRef: RefObject<HTMLButtonElement | null>;
  navigationDrawerRef: RefObject<HTMLDivElement | null>;
  operationsPanelRef: RefObject<HTMLDivElement | null>;
  isNavigationDrawerOpen: boolean;
  isOperationsPanelOpen: boolean;
  closeNavigationDrawer: () => void;
  closeOperationsPanel: () => void;
  onToggleNavigationDrawer: AppHeaderAndStatsProps["onToggleNavigationDrawer"];
  onToggleOperationsPanel: AppHeaderAndStatsProps["onToggleOperationsPanel"];
  isSettingsActive: boolean;
  onOpenSettings: AppHeaderAndStatsProps["onOpenSettings"];
  isInstallPromptAvailable: AppHeaderAndStatsProps["isInstallPromptAvailable"];
  onInstallApp: AppHeaderAndStatsProps["onInstallApp"];
  isPwaUpdateReady: AppHeaderAndStatsProps["isPwaUpdateReady"];
  onApplyPwaUpdate: AppHeaderAndStatsProps["onApplyPwaUpdate"];
  validationIssuesCount: number;
  validationErrorCount: number;
  validationWarningCount: number;
  lastError: AppHeaderAndStatsProps["lastError"];
  onClearError: AppHeaderAndStatsProps["onClearError"];
  activeScreen: WorkspaceSidebarPanelProps["activeScreen"];
  activeSubScreen: WorkspaceSidebarPanelProps["activeSubScreen"];
  isModelingScreen: WorkspaceSidebarPanelProps["isModelingScreen"];
  isAnalysisScreen: WorkspaceSidebarPanelProps["isAnalysisScreen"];
  isValidationScreen: WorkspaceSidebarPanelProps["isValidationScreen"];
  entityCountBySubScreen: WorkspaceSidebarPanelProps["entityCountBySubScreen"];
  onScreenChange: WorkspaceSidebarPanelProps["onScreenChange"];
  onSubScreenChange: WorkspaceSidebarPanelProps["onSubScreenChange"];
  handleUndo: OperationsHealthPanelProps["handleUndo"];
  handleRedo: OperationsHealthPanelProps["handleRedo"];
  isUndoAvailable: OperationsHealthPanelProps["isUndoAvailable"];
  isRedoAvailable: OperationsHealthPanelProps["isRedoAvailable"];
  showShortcutHints: OperationsHealthPanelProps["showShortcutHints"];
  saveStatus: OperationsHealthPanelProps["saveStatus"];
  issueNavigatorDisplay: OperationsHealthPanelProps["issueNavigatorDisplay"];
  issueNavigationScopeLabel: OperationsHealthPanelProps["issueNavigationScopeLabel"];
  currentValidationIssue: OperationsHealthPanelProps["currentValidationIssue"];
  orderedValidationIssues: OperationsHealthPanelProps["orderedValidationIssues"];
  handleOpenValidationScreen: OperationsHealthPanelProps["handleOpenValidationScreen"];
  moveValidationIssueCursor: OperationsHealthPanelProps["moveValidationIssueCursor"];
  NetworkScopeScreenComponent: ScreenContainerComponent;
  ModelingScreenComponent: ScreenContainerComponent;
  AnalysisScreenComponent: ScreenContainerComponent;
  ValidationScreenComponent: ScreenContainerComponent;
  SettingsScreenComponent: ScreenContainerComponent;
  isNetworkScopeScreen: boolean;
  hasActiveNetwork: boolean;
  networkScopeWorkspaceContent: ReactNode;
  modelingLeftColumnContent: ReactNode;
  modelingFormsColumnContent: ReactNode;
  networkSummaryPanel: ReactNode;
  analysisWorkspaceContent: ReactNode;
  validationWorkspaceContent: ReactNode;
  settingsWorkspaceContent: ReactNode;
  isSettingsScreen: boolean;
  isInspectorHidden: boolean;
  isInspectorOpen: boolean;
  inspectorContextPanel: ReactNode;
}

function WorkspaceLoadingFallback(): ReactElement {
  return (
    <section className="panel" aria-live="polite" aria-busy="true">
      <h2>Loading workspace</h2>
      <p className="empty-copy">The requested screen is loading.</p>
    </section>
  );
}

export function AppShellLayout({
  appShellClassName,
  workspaceShellStyle,
  appRepositoryUrl,
  currentYear,
  appVersion,
  headerBlockRef,
  navigationToggleButtonRef,
  operationsButtonRef,
  navigationDrawerRef,
  operationsPanelRef,
  isNavigationDrawerOpen,
  isOperationsPanelOpen,
  closeNavigationDrawer,
  closeOperationsPanel,
  onToggleNavigationDrawer,
  onToggleOperationsPanel,
  isSettingsActive,
  onOpenSettings,
  isInstallPromptAvailable,
  onInstallApp,
  isPwaUpdateReady,
  onApplyPwaUpdate,
  validationIssuesCount,
  validationErrorCount,
  validationWarningCount,
  lastError,
  onClearError,
  activeScreen,
  activeSubScreen,
  isModelingScreen,
  isAnalysisScreen,
  isValidationScreen,
  entityCountBySubScreen,
  onScreenChange,
  onSubScreenChange,
  handleUndo,
  handleRedo,
  isUndoAvailable,
  isRedoAvailable,
  showShortcutHints,
  saveStatus,
  issueNavigatorDisplay,
  issueNavigationScopeLabel,
  currentValidationIssue,
  orderedValidationIssues,
  handleOpenValidationScreen,
  moveValidationIssueCursor,
  NetworkScopeScreenComponent,
  ModelingScreenComponent,
  AnalysisScreenComponent,
  ValidationScreenComponent,
  SettingsScreenComponent,
  isNetworkScopeScreen,
  hasActiveNetwork,
  networkScopeWorkspaceContent,
  modelingLeftColumnContent,
  modelingFormsColumnContent,
  networkSummaryPanel,
  analysisWorkspaceContent,
  validationWorkspaceContent,
  settingsWorkspaceContent,
  isSettingsScreen,
  isInspectorHidden,
  isInspectorOpen,
  inspectorContextPanel
}: AppShellLayoutProps): ReactElement {
  const isNavigationDrawerInteractionHidden = !isNavigationDrawerOpen;

  let activeWorkspaceContent: ReactNode;
  if (isNetworkScopeScreen) {
    activeWorkspaceContent = (
      <NetworkScopeWorkspaceContainer
        ScreenComponent={NetworkScopeScreenComponent}
        isActive={isNetworkScopeScreen}
        workspaceContent={networkScopeWorkspaceContent}
      />
    );
  } else if (!hasActiveNetwork) {
    activeWorkspaceContent = (
      <section className="panel">
        <h2>No active network</h2>
        <p className="empty-copy">
          Create a network from the network scope controls to start modeling connectors, splices, nodes, segments, and wires.
        </p>
      </section>
    );
  } else if (isModelingScreen) {
    activeWorkspaceContent = (
      <ModelingWorkspaceContainer
        ScreenComponent={ModelingScreenComponent}
        isActive={isModelingScreen}
        leftColumnContent={modelingLeftColumnContent}
        formsColumnContent={modelingFormsColumnContent}
        networkSummaryPanel={networkSummaryPanel}
      />
    );
  } else if (isAnalysisScreen) {
    activeWorkspaceContent = (
      <AnalysisWorkspaceContainer
        ScreenComponent={AnalysisScreenComponent}
        isActive={isAnalysisScreen}
        workspaceContent={analysisWorkspaceContent}
      />
    );
  } else if (isValidationScreen) {
    activeWorkspaceContent = (
      <ValidationWorkspaceContainer
        ScreenComponent={ValidationScreenComponent}
        isActive={isValidationScreen}
        workspaceContent={validationWorkspaceContent}
      />
    );
  } else if (isSettingsScreen) {
    activeWorkspaceContent = (
      <SettingsWorkspaceContainer
        ScreenComponent={SettingsScreenComponent}
        isActive={isSettingsScreen}
        workspaceContent={settingsWorkspaceContent}
      />
    );
  } else {
    activeWorkspaceContent = null;
  }

  return (
    <main className={appShellClassName}>
      <AppHeaderAndStats
        headerBlockRef={headerBlockRef}
        isNavigationDrawerOpen={isNavigationDrawerOpen}
        onToggleNavigationDrawer={onToggleNavigationDrawer}
        navigationToggleButtonRef={navigationToggleButtonRef}
        isSettingsActive={isSettingsActive}
        onOpenSettings={onOpenSettings}
        isInstallPromptAvailable={isInstallPromptAvailable}
        onInstallApp={onInstallApp}
        isPwaUpdateReady={isPwaUpdateReady}
        onApplyPwaUpdate={onApplyPwaUpdate}
        isOperationsPanelOpen={isOperationsPanelOpen}
        onToggleOperationsPanel={onToggleOperationsPanel}
        operationsButtonRef={operationsButtonRef}
        validationIssuesCount={validationIssuesCount}
        validationErrorCount={validationErrorCount}
        lastError={lastError}
        onClearError={onClearError}
      />

      <section className="workspace-shell" style={workspaceShellStyle}>
        <button
          type="button"
          className={isNavigationDrawerOpen ? "workspace-drawer-backdrop is-open" : "workspace-drawer-backdrop"}
          aria-label="Close navigation menu"
          aria-hidden={!isNavigationDrawerOpen}
          disabled={!isNavigationDrawerOpen}
          tabIndex={isNavigationDrawerOpen ? 0 : -1}
          onClick={closeNavigationDrawer}
        />
        <div
          id="workspace-navigation-drawer"
          ref={navigationDrawerRef}
          className={isNavigationDrawerOpen ? "workspace-drawer is-open" : "workspace-drawer"}
          aria-hidden={isNavigationDrawerInteractionHidden}
          inert={isNavigationDrawerInteractionHidden}
        >
          <WorkspaceSidebarPanel
            activeScreen={activeScreen}
            activeSubScreen={activeSubScreen}
            isModelingScreen={isModelingScreen}
            isAnalysisScreen={isAnalysisScreen}
            isValidationScreen={isValidationScreen}
            validationIssuesCount={validationIssuesCount}
            validationErrorCount={validationErrorCount}
            entityCountBySubScreen={entityCountBySubScreen}
            onScreenChange={onScreenChange}
            onSubScreenChange={onSubScreenChange}
          />
        </div>
        <button
          type="button"
          className={isOperationsPanelOpen ? "workspace-ops-backdrop is-open" : "workspace-ops-backdrop"}
          aria-label="Close operations panel"
          aria-hidden={!isOperationsPanelOpen}
          disabled={!isOperationsPanelOpen}
          tabIndex={isOperationsPanelOpen ? 0 : -1}
          onClick={closeOperationsPanel}
        />
        <div
          id="workspace-operations-panel"
          ref={operationsPanelRef}
          className={isOperationsPanelOpen ? "workspace-ops-panel is-open" : "workspace-ops-panel"}
          aria-hidden={!isOperationsPanelOpen}
          inert={!isOperationsPanelOpen}
        >
          <OperationsHealthPanel
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            isUndoAvailable={isUndoAvailable}
            isRedoAvailable={isRedoAvailable}
            showShortcutHints={showShortcutHints}
            saveStatus={saveStatus}
            validationIssuesCount={validationIssuesCount}
            validationErrorCount={validationErrorCount}
            validationWarningCount={validationWarningCount}
            issueNavigatorDisplay={issueNavigatorDisplay}
            issueNavigationScopeLabel={issueNavigationScopeLabel}
            currentValidationIssue={currentValidationIssue}
            orderedValidationIssues={orderedValidationIssues}
            handleOpenValidationScreen={handleOpenValidationScreen}
            moveValidationIssueCursor={moveValidationIssueCursor}
          />
        </div>

        <section className="workspace-content">
          <Suspense fallback={<WorkspaceLoadingFallback />}>
            {activeWorkspaceContent}
          </Suspense>
        </section>
      </section>

      <a className="app-footer-link" href={appRepositoryUrl} target="_blank" rel="noopener noreferrer">
        © {currentYear} e-Plan Editor · v{appVersion}
      </a>

      {!isInspectorHidden ? (
        <aside
          className={isInspectorOpen ? "workspace-inspector-panel is-open" : "workspace-inspector-panel is-collapsed"}
          aria-label="Inspector context panel"
        >
          {inspectorContextPanel}
        </aside>
      ) : null}
    </main>
  );
}
