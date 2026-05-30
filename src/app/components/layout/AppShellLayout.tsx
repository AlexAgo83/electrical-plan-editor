import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject
} from "react";
import { HomeWorkspaceContainer } from "../containers/HomeWorkspaceContainer";
import { ModelingWorkspaceContainer } from "../containers/ModelingWorkspaceContainer";
import { NetworkScopeWorkspaceContainer } from "../containers/NetworkScopeWorkspaceContainer";
import { SettingsWorkspaceContainer } from "../containers/SettingsWorkspaceContainer";
import { SettingsSearchControl, SettingsSearchDockProvider } from "../settings/SettingsSearchDockContext";
import { ValidationWorkspaceContainer } from "../containers/ValidationWorkspaceContainer";
import type { ScreenContainerComponent } from "../containers/screenContainer.shared";
import { NetworkSummaryQuickEntityNavigation } from "../network-summary/NetworkSummaryQuickEntityNavigation";
import { AppHeaderAndStats } from "../workspace/AppHeaderAndStats";
import { OperationsHealthPanel } from "../workspace/OperationsHealthPanel";
import { WorkspaceSidebarPanel } from "../workspace/WorkspaceSidebarPanel";

type AppHeaderAndStatsProps = Parameters<typeof AppHeaderAndStats>[0];
type WorkspaceSidebarPanelProps = Parameters<typeof WorkspaceSidebarPanel>[0];
type OperationsHealthPanelProps = Parameters<typeof OperationsHealthPanel>[0];

const QUICK_ENTITY_NAV_DOCK_HYSTERESIS_PX = 18;
const QUICK_ENTITY_NAV_DOCK_DELAY_PX = 16;
const QUICK_ENTITY_NAV_DOCK_BLEND_RANGE_PX = 44;
const QUICK_ENTITY_NAV_PRESENTATION_RELEASE_PX = 18;

function clampDockedNavigationProgress(value: number): number {
  return Math.min(1, Math.max(0, value));
}

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
  onOpenHome: AppHeaderAndStatsProps["onOpenHome"];
  isSettingsActive: boolean;
  onOpenSettings: AppHeaderAndStatsProps["onOpenSettings"];
  isInstallPromptAvailable: AppHeaderAndStatsProps["isInstallPromptAvailable"];
  onInstallApp: AppHeaderAndStatsProps["onInstallApp"];
  isPwaUpdateReady: AppHeaderAndStatsProps["isPwaUpdateReady"];
  onApplyPwaUpdate: AppHeaderAndStatsProps["onApplyPwaUpdate"];
  workspaceFileStatus: OperationsHealthPanelProps["workspaceFileStatus"];
  onOpenWorkspaceFile: OperationsHealthPanelProps["onOpenWorkspaceFile"];
  onRelinkWorkspaceFile: OperationsHealthPanelProps["onRelinkWorkspaceFile"];
  onResumeWorkspaceFile: OperationsHealthPanelProps["onResumeWorkspaceFile"];
  onSaveWorkspaceFileNow: OperationsHealthPanelProps["onSaveWorkspaceFileNow"];
  onSaveWorkspaceFileAs: OperationsHealthPanelProps["onSaveWorkspaceFileAs"];
  onUnlinkWorkspaceFile: OperationsHealthPanelProps["onUnlinkWorkspaceFile"];
  workspaceFileInputRef: OperationsHealthPanelProps["workspaceFileInputRef"];
  onWorkspaceFileInputChange: OperationsHealthPanelProps["onWorkspaceFileInputChange"];
  validationIssuesCount: number;
  validationErrorCount: number;
  validationWarningCount: number;
  lastError: AppHeaderAndStatsProps["lastError"];
  onClearError: AppHeaderAndStatsProps["onClearError"];
  bootRecoveryMessage: AppHeaderAndStatsProps["bootRecoveryMessage"];
  onCommitBootRecovery: AppHeaderAndStatsProps["onCommitBootRecovery"];
  activeScreen: WorkspaceSidebarPanelProps["activeScreen"];
  activeSubScreen: WorkspaceSidebarPanelProps["activeSubScreen"];
  isModelingScreen: WorkspaceSidebarPanelProps["isModelingScreen"];
  isAnalysisScreen: WorkspaceSidebarPanelProps["isAnalysisScreen"];
  isValidationScreen: WorkspaceSidebarPanelProps["isValidationScreen"];
  entityCountBySubScreen: WorkspaceSidebarPanelProps["entityCountBySubScreen"];
  isAiAgentOpen: boolean;
  isAiAgentReady: boolean;
  aiAgentDisabledReason: string;
  onScreenChange: WorkspaceSidebarPanelProps["onScreenChange"];
  onSubScreenChange: WorkspaceSidebarPanelProps["onSubScreenChange"];
  onOpenAiAgent: () => void;
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
  HomeScreenComponent: ScreenContainerComponent;
  ModelingScreenComponent: ScreenContainerComponent;
  AnalysisScreenComponent: ScreenContainerComponent;
  ValidationScreenComponent: ScreenContainerComponent;
  SettingsScreenComponent: ScreenContainerComponent;
  isHomeScreen: boolean;
  isNetworkScopeScreen: boolean;
  isHarnessAssemblyScreen: boolean;
  homeWorkspaceContent: ReactNode;
  hasActiveNetwork: boolean;
  networkScopeWorkspaceContent: ReactNode;
  harnessAssemblyWorkspaceContent: ReactNode;
  headerHarnessAssemblyFunctionalScopeNavigation: ReactNode;
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
  onOpenHome,
  isSettingsActive,
  onOpenSettings,
  isInstallPromptAvailable,
  onInstallApp,
  isPwaUpdateReady,
  onApplyPwaUpdate,
  workspaceFileStatus,
  onOpenWorkspaceFile,
  onRelinkWorkspaceFile,
  onResumeWorkspaceFile,
  onSaveWorkspaceFileNow,
  onSaveWorkspaceFileAs,
  onUnlinkWorkspaceFile,
  workspaceFileInputRef,
  onWorkspaceFileInputChange,
  validationIssuesCount,
  validationErrorCount,
  validationWarningCount,
  lastError,
  onClearError,
  bootRecoveryMessage,
  onCommitBootRecovery,
  activeScreen,
  activeSubScreen,
  isModelingScreen,
  isAnalysisScreen,
  isValidationScreen,
  entityCountBySubScreen,
  isAiAgentOpen,
  isAiAgentReady,
  aiAgentDisabledReason,
  onScreenChange,
  onSubScreenChange,
  onOpenAiAgent,
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
  HomeScreenComponent,
  ModelingScreenComponent,
  AnalysisScreenComponent,
  ValidationScreenComponent,
  SettingsScreenComponent,
  isHomeScreen,
  isNetworkScopeScreen,
  isHarnessAssemblyScreen,
  homeWorkspaceContent,
  hasActiveNetwork,
  networkScopeWorkspaceContent,
  harnessAssemblyWorkspaceContent,
  headerHarnessAssemblyFunctionalScopeNavigation,
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
  const [isQuickEntityNavigationDocked, setIsQuickEntityNavigationDocked] = useState(false);
  const [isQuickEntityNavigationPresentationActive, setIsQuickEntityNavigationPresentationActive] = useState(false);
  const [quickEntityNavigationDockProgress, setQuickEntityNavigationDockProgress] = useState(0);
  const [settingsSearchQuery, setSettingsSearchQuery] = useState("");
  const [isSettingsSearchDocked, setIsSettingsSearchDocked] = useState(false);
  const [isSettingsSearchPresentationActive, setIsSettingsSearchPresentationActive] = useState(false);
  const [settingsSearchDockProgress, setSettingsSearchDockProgress] = useState(0);
  const isQuickEntityNavigationDockedRef = useRef(false);
  const isQuickEntityNavigationPresentationActiveRef = useRef(false);
  const quickEntityNavigationDockThresholdRef = useRef<number | null>(null);
  const isSettingsSearchDockedRef = useRef(false);
  const isSettingsSearchPresentationActiveRef = useRef(false);
  const settingsSearchDockThresholdRef = useRef<number | null>(null);
  const shouldOfferDockedEntityNavigation =
    hasActiveNetwork &&
    (isModelingScreen || isAnalysisScreen || (isHarnessAssemblyScreen && headerHarnessAssemblyFunctionalScopeNavigation !== null));

  useEffect(() => {
    isQuickEntityNavigationDockedRef.current = isQuickEntityNavigationDocked;
  }, [isQuickEntityNavigationDocked]);

  useEffect(() => {
    isQuickEntityNavigationPresentationActiveRef.current = isQuickEntityNavigationPresentationActive;
  }, [isQuickEntityNavigationPresentationActive]);

  useEffect(() => {
    isSettingsSearchDockedRef.current = isSettingsSearchDocked;
  }, [isSettingsSearchDocked]);

  useEffect(() => {
    isSettingsSearchPresentationActiveRef.current = isSettingsSearchPresentationActive;
  }, [isSettingsSearchPresentationActive]);

  useEffect(() => {
    if (!shouldOfferDockedEntityNavigation) {
      quickEntityNavigationDockThresholdRef.current = null;
      setIsQuickEntityNavigationDocked(false);
      setIsQuickEntityNavigationPresentationActive(false);
      setQuickEntityNavigationDockProgress(0);
      return undefined;
    }

    if (typeof window === "undefined") {
      return undefined;
    }

    let animationFrameId = 0;
    const updateDockedNavigationState = () => {
      animationFrameId = 0;
      const sourceNavigation = document.querySelector<HTMLElement>("[data-quick-entity-nav-source='true']");
      const headerElement = headerBlockRef.current;

      if (sourceNavigation === null || headerElement === null) {
        const fallbackThreshold = quickEntityNavigationDockThresholdRef.current;
        setIsQuickEntityNavigationDocked((current) =>
          fallbackThreshold === null ? current : window.scrollY >= fallbackThreshold
        );
        setIsQuickEntityNavigationPresentationActive((current) =>
          fallbackThreshold === null ? current : window.scrollY >= fallbackThreshold
        );
        setQuickEntityNavigationDockProgress((current) =>
          fallbackThreshold === null ? current : window.scrollY >= fallbackThreshold ? 1 : 0
        );
        return;
      }

      const navigationRect = sourceNavigation.getBoundingClientRect();
      const headerRect = headerElement.getBoundingClientRect();
      const headerHeight = Math.max(0, headerRect.height);
      if (quickEntityNavigationDockThresholdRef.current === null) {
        quickEntityNavigationDockThresholdRef.current = Math.max(
          0,
          navigationRect.top + window.scrollY - headerHeight + QUICK_ENTITY_NAV_DOCK_DELAY_PX
        );
      }
      const dockThreshold = quickEntityNavigationDockThresholdRef.current;
      const nextIsDocked = isQuickEntityNavigationDockedRef.current
        ? window.scrollY >= Math.max(0, dockThreshold - QUICK_ENTITY_NAV_DOCK_HYSTERESIS_PX)
        : window.scrollY >= dockThreshold;
      const presentationStart = Math.max(0, dockThreshold - QUICK_ENTITY_NAV_DOCK_HYSTERESIS_PX);
      const nextPresentationActive = isQuickEntityNavigationPresentationActiveRef.current
        ? window.scrollY >= Math.max(0, presentationStart - QUICK_ENTITY_NAV_PRESENTATION_RELEASE_PX)
        : window.scrollY >= presentationStart;
      const nextDockProgress =
        dockThreshold <= QUICK_ENTITY_NAV_DOCK_HYSTERESIS_PX
          ? 1
          : clampDockedNavigationProgress(
              (window.scrollY - (dockThreshold - QUICK_ENTITY_NAV_DOCK_HYSTERESIS_PX)) /
                QUICK_ENTITY_NAV_DOCK_BLEND_RANGE_PX
            );
      setIsQuickEntityNavigationDocked((current) => (current === nextIsDocked ? current : nextIsDocked));
      setIsQuickEntityNavigationPresentationActive((current) =>
        current === nextPresentationActive ? current : nextPresentationActive
      );
      setQuickEntityNavigationDockProgress((current) =>
        Math.abs(current - nextDockProgress) < 0.01 ? current : nextDockProgress
      );
    };

    const scheduleDockedNavigationStateUpdate = () => {
      if (animationFrameId !== 0) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateDockedNavigationState);
    };

    scheduleDockedNavigationStateUpdate();
    window.addEventListener("scroll", scheduleDockedNavigationStateUpdate, { passive: true });
    window.addEventListener("resize", scheduleDockedNavigationStateUpdate);
    document.addEventListener("scroll", scheduleDockedNavigationStateUpdate, { passive: true, capture: true });
    return () => {
      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("scroll", scheduleDockedNavigationStateUpdate);
      window.removeEventListener("resize", scheduleDockedNavigationStateUpdate);
      document.removeEventListener("scroll", scheduleDockedNavigationStateUpdate, { capture: true });
    };
  }, [headerBlockRef, shouldOfferDockedEntityNavigation]);

  useEffect(() => {
    if (!isSettingsScreen) {
      settingsSearchDockThresholdRef.current = null;
      setIsSettingsSearchDocked(false);
      setIsSettingsSearchPresentationActive(false);
      setSettingsSearchDockProgress(0);
      return undefined;
    }

    if (typeof window === "undefined") {
      return undefined;
    }

    let animationFrameId = 0;
    const updateDockedSettingsSearchState = () => {
      animationFrameId = 0;
      const sourceSearch = document.querySelector<HTMLElement>("[data-settings-search-source='true']");
      const headerElement = headerBlockRef.current;

      if (sourceSearch === null || headerElement === null) {
        const fallbackThreshold = settingsSearchDockThresholdRef.current;
        setIsSettingsSearchDocked((current) => (fallbackThreshold === null ? current : window.scrollY >= fallbackThreshold));
        setIsSettingsSearchPresentationActive((current) => (fallbackThreshold === null ? current : window.scrollY >= fallbackThreshold));
        setSettingsSearchDockProgress((current) => (fallbackThreshold === null ? current : window.scrollY >= fallbackThreshold ? 1 : 0));
        return;
      }

      const searchRect = sourceSearch.getBoundingClientRect();
      const headerRect = headerElement.getBoundingClientRect();
      const headerHeight = Math.max(0, headerRect.height);
      if (settingsSearchDockThresholdRef.current === null) {
        settingsSearchDockThresholdRef.current = Math.max(
          0,
          searchRect.top + window.scrollY - headerHeight + QUICK_ENTITY_NAV_DOCK_DELAY_PX
        );
      }

      const dockThreshold = settingsSearchDockThresholdRef.current;
      const nextIsDocked = isSettingsSearchDockedRef.current
        ? window.scrollY >= Math.max(0, dockThreshold - QUICK_ENTITY_NAV_DOCK_HYSTERESIS_PX)
        : window.scrollY >= dockThreshold;
      const presentationStart = Math.max(0, dockThreshold - QUICK_ENTITY_NAV_DOCK_HYSTERESIS_PX);
      const nextPresentationActive = isSettingsSearchPresentationActiveRef.current
        ? window.scrollY >= Math.max(0, presentationStart - QUICK_ENTITY_NAV_PRESENTATION_RELEASE_PX)
        : window.scrollY >= presentationStart;
      const nextDockProgress =
        dockThreshold <= QUICK_ENTITY_NAV_DOCK_HYSTERESIS_PX
          ? 1
          : clampDockedNavigationProgress(
              (window.scrollY - (dockThreshold - QUICK_ENTITY_NAV_DOCK_HYSTERESIS_PX)) /
                QUICK_ENTITY_NAV_DOCK_BLEND_RANGE_PX
            );
      setIsSettingsSearchDocked((current) => (current === nextIsDocked ? current : nextIsDocked));
      setIsSettingsSearchPresentationActive((current) =>
        current === nextPresentationActive ? current : nextPresentationActive
      );
      setSettingsSearchDockProgress((current) =>
        Math.abs(current - nextDockProgress) < 0.01 ? current : nextDockProgress
      );
    };

    const scheduleDockedSettingsSearchStateUpdate = () => {
      if (animationFrameId !== 0) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateDockedSettingsSearchState);
    };

    scheduleDockedSettingsSearchStateUpdate();
    window.addEventListener("scroll", scheduleDockedSettingsSearchStateUpdate, { passive: true });
    window.addEventListener("resize", scheduleDockedSettingsSearchStateUpdate);
    document.addEventListener("scroll", scheduleDockedSettingsSearchStateUpdate, { passive: true, capture: true });
    return () => {
      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("scroll", scheduleDockedSettingsSearchStateUpdate);
      window.removeEventListener("resize", scheduleDockedSettingsSearchStateUpdate);
      document.removeEventListener("scroll", scheduleDockedSettingsSearchStateUpdate, { capture: true });
    };
  }, [headerBlockRef, isSettingsScreen]);

  const shouldMountDockedEntityNavigation =
    shouldOfferDockedEntityNavigation && isQuickEntityNavigationPresentationActive;
  const shouldMountDockedSettingsSearch = isSettingsScreen && isSettingsSearchPresentationActive;
  const headerCenterNavigation = isHarnessAssemblyScreen ? (
    headerHarnessAssemblyFunctionalScopeNavigation
  ) : (
    <NetworkSummaryQuickEntityNavigation
      variant="header"
      quickEntityNavigationMode={isAnalysisScreen ? "analysis" : "modeling"}
      activeSubScreen={activeSubScreen}
      entityCountBySubScreen={entityCountBySubScreen}
      onQuickEntityNavigation={onSubScreenChange}
      isAiAgentOpen={isAiAgentOpen}
      isAiAgentReady={isAiAgentReady}
      aiAgentDisabledReason={aiAgentDisabledReason}
      onOpenAiAgent={onOpenAiAgent}
    />
  );
  const headerCenterContent = shouldMountDockedSettingsSearch ? (
    <div
      className={
        isSettingsSearchDocked || settingsSearchDockProgress > 0
          ? "header-docked-nav-shell is-visible"
          : "header-docked-nav-shell is-hidden"
      }
      style={{ "--header-docked-nav-progress": settingsSearchDockProgress } as CSSProperties}
      aria-hidden={!isSettingsSearchDocked}
    >
      <SettingsSearchControl variant="header" />
    </div>
  ) : shouldMountDockedEntityNavigation ? (
    <div
      className={
        isQuickEntityNavigationDocked || quickEntityNavigationDockProgress > 0
          ? "header-docked-nav-shell is-visible"
          : "header-docked-nav-shell is-hidden"
      }
      style={{ "--header-docked-nav-progress": quickEntityNavigationDockProgress } as CSSProperties}
      aria-hidden={!isQuickEntityNavigationDocked}
    >
      {headerCenterNavigation}
    </div>
    ) : null;

  let activeWorkspaceContent: ReactNode;
  if (isHomeScreen) {
    activeWorkspaceContent = (
      <HomeWorkspaceContainer
        ScreenComponent={HomeScreenComponent}
        isActive={isHomeScreen}
        workspaceContent={homeWorkspaceContent}
      />
    );
  } else if (isNetworkScopeScreen) {
    activeWorkspaceContent = (
      <NetworkScopeWorkspaceContainer
        ScreenComponent={NetworkScopeScreenComponent}
        isActive={isNetworkScopeScreen}
        workspaceContent={networkScopeWorkspaceContent}
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
  } else if (!hasActiveNetwork) {
    activeWorkspaceContent = (
      <section className="panel">
        <h2>No active network</h2>
        <p className="empty-copy">
          Create a network from the network scope controls to start modeling connectors, splices, nodes, segments, and wires.
        </p>
      </section>
    );
  } else if (isHarnessAssemblyScreen) {
    activeWorkspaceContent = (
      <NetworkScopeWorkspaceContainer
        ScreenComponent={NetworkScopeScreenComponent}
        isActive={isHarnessAssemblyScreen}
        workspaceContent={harnessAssemblyWorkspaceContent}
      />
    );
  } else if (isModelingScreen) {
    activeWorkspaceContent = (
      <ModelingWorkspaceContainer
        ScreenComponent={ModelingScreenComponent}
        isActive={isModelingScreen}
        leftColumnContent={modelingLeftColumnContent}
        formsColumnContent={modelingFormsColumnContent}
        networkSummaryPanel={networkSummaryPanel}
        analysisWorkspaceContent={analysisWorkspaceContent}
      />
    );
  } else if (isAnalysisScreen) {
    activeWorkspaceContent = (
      <ModelingWorkspaceContainer
        ScreenComponent={AnalysisScreenComponent}
        isActive={isAnalysisScreen}
        leftColumnContent={modelingLeftColumnContent}
        formsColumnContent={modelingFormsColumnContent}
        networkSummaryPanel={networkSummaryPanel}
        analysisWorkspaceContent={analysisWorkspaceContent}
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
  } else {
    activeWorkspaceContent = null;
  }

  return (
    <SettingsSearchDockProvider value={{ settingsSearchQuery, setSettingsSearchQuery }}>
    <main className={appShellClassName}>
      <AppHeaderAndStats
        headerBlockRef={headerBlockRef}
        isNavigationDrawerOpen={isNavigationDrawerOpen}
        onToggleNavigationDrawer={onToggleNavigationDrawer}
        navigationToggleButtonRef={navigationToggleButtonRef}
        onOpenHome={onOpenHome}
        isSettingsActive={isSettingsActive}
        onOpenSettings={onOpenSettings}
        isInstallPromptAvailable={isInstallPromptAvailable}
        isDockedNavigationVisible={shouldMountDockedEntityNavigation || shouldMountDockedSettingsSearch}
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
        bootRecoveryMessage={bootRecoveryMessage}
        onCommitBootRecovery={onCommitBootRecovery}
        centerContent={headerCenterContent}
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
            isAiAgentOpen={isAiAgentOpen}
            isAiAgentReady={isAiAgentReady}
            aiAgentDisabledReason={aiAgentDisabledReason}
            onScreenChange={(screen) => {
              onScreenChange(screen);
              if (screen !== "modeling") {
                closeNavigationDrawer();
              }
            }}
            onSubScreenChange={(subScreen) => {
              onSubScreenChange(subScreen);
              closeNavigationDrawer();
            }}
            onOpenAiAgent={() => {
              onOpenAiAgent();
              closeNavigationDrawer();
            }}
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
            workspaceFileStatus={workspaceFileStatus}
            onOpenWorkspaceFile={onOpenWorkspaceFile}
            onRelinkWorkspaceFile={onRelinkWorkspaceFile}
            onResumeWorkspaceFile={onResumeWorkspaceFile}
            onSaveWorkspaceFileNow={onSaveWorkspaceFileNow}
            onSaveWorkspaceFileAs={onSaveWorkspaceFileAs}
            onUnlinkWorkspaceFile={onUnlinkWorkspaceFile}
            workspaceFileInputRef={workspaceFileInputRef}
            onWorkspaceFileInputChange={onWorkspaceFileInputChange}
            validationIssuesCount={validationIssuesCount}
            validationErrorCount={validationErrorCount}
            validationWarningCount={validationWarningCount}
            issueNavigatorDisplay={issueNavigatorDisplay}
            issueNavigationScopeLabel={issueNavigationScopeLabel}
            currentValidationIssue={currentValidationIssue}
            orderedValidationIssues={orderedValidationIssues}
            handleOpenValidationScreen={(filter) => {
              closeOperationsPanel();
              handleOpenValidationScreen(filter);
            }}
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
    </SettingsSearchDockProvider>
  );
}
