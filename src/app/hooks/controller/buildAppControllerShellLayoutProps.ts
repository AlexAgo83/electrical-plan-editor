import { AppShellLayout } from "../../components/layout/AppShellLayout";

type AppShellLayoutProps = Parameters<typeof AppShellLayout>[0];

interface BuildAppControllerShellLayoutPropsParams {
  meta: Pick<
    AppShellLayoutProps,
    "appShellClassName" | "workspaceShellStyle" | "appRepositoryUrl" | "currentYear" | "appVersion"
  >;
  refs: Pick<
    AppShellLayoutProps,
    | "headerBlockRef"
    | "navigationToggleButtonRef"
    | "operationsButtonRef"
    | "navigationDrawerRef"
    | "operationsPanelRef"
  >;
  shellChrome: Pick<
    AppShellLayoutProps,
    | "isNavigationDrawerOpen"
    | "isOperationsPanelOpen"
    | "closeNavigationDrawer"
    | "closeOperationsPanel"
    | "onToggleNavigationDrawer"
    | "onToggleOperationsPanel"
    | "isSettingsActive"
    | "onOpenSettings"
    | "isInstallPromptAvailable"
    | "onInstallApp"
    | "isPwaUpdateReady"
    | "onApplyPwaUpdate"
  >;
  health: Pick<
    AppShellLayoutProps,
    | "validationIssuesCount"
    | "validationErrorCount"
    | "validationWarningCount"
    | "lastError"
    | "onClearError"
  >;
  navigation: Pick<
    AppShellLayoutProps,
    | "activeScreen"
    | "activeSubScreen"
    | "isModelingScreen"
    | "isAnalysisScreen"
    | "isValidationScreen"
    | "entityCountBySubScreen"
    | "onScreenChange"
    | "onSubScreenChange"
  >;
  operations: Pick<
    AppShellLayoutProps,
    | "handleUndo"
    | "handleRedo"
    | "isUndoAvailable"
    | "isRedoAvailable"
    | "showShortcutHints"
    | "saveStatus"
    | "issueNavigatorDisplay"
    | "issueNavigationScopeLabel"
    | "currentValidationIssue"
    | "orderedValidationIssues"
    | "handleOpenValidationScreen"
    | "moveValidationIssueCursor"
  >;
  screenComponents: Pick<
    AppShellLayoutProps,
    | "NetworkScopeScreenComponent"
    | "HomeScreenComponent"
    | "ModelingScreenComponent"
    | "AnalysisScreenComponent"
    | "ValidationScreenComponent"
    | "SettingsScreenComponent"
  >;
  workspace: Pick<
    AppShellLayoutProps,
    | "isHomeScreen"
    | "isNetworkScopeScreen"
    | "homeWorkspaceContent"
    | "hasActiveNetwork"
    | "networkScopeWorkspaceContent"
    | "modelingLeftColumnContent"
    | "modelingFormsColumnContent"
    | "networkSummaryPanel"
    | "analysisWorkspaceContent"
    | "validationWorkspaceContent"
    | "settingsWorkspaceContent"
    | "isSettingsScreen"
  >;
  inspector: Pick<AppShellLayoutProps, "isInspectorHidden" | "isInspectorOpen" | "inspectorContextPanel">;
}

export function buildAppControllerShellLayoutProps({
  meta,
  refs,
  shellChrome,
  health,
  navigation,
  operations,
  screenComponents,
  workspace,
  inspector
}: BuildAppControllerShellLayoutPropsParams): AppShellLayoutProps {
  return {
    ...meta,
    ...refs,
    ...shellChrome,
    ...health,
    ...navigation,
    ...operations,
    ...screenComponents,
    ...workspace,
    ...inspector
  };
}
