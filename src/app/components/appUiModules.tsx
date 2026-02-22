import { lazy } from "react";
import { NetworkSummaryPanel as NetworkSummaryPanelEager } from "./NetworkSummaryPanel";
import { AnalysisScreen as AnalysisScreenEager } from "./screens/AnalysisScreen";
import { ModelingScreen as ModelingScreenEager } from "./screens/ModelingScreen";
import { NetworkScopeScreen as NetworkScopeScreenEager } from "./screens/NetworkScopeScreen";
import { SettingsScreen as SettingsScreenEager } from "./screens/SettingsScreen";
import { ValidationScreen as ValidationScreenEager } from "./screens/ValidationScreen";
import { AnalysisWorkspaceContent as AnalysisWorkspaceContentEager } from "./workspace/AnalysisWorkspaceContent";
import { ModelingFormsColumn as ModelingFormsColumnEager } from "./workspace/ModelingFormsColumn";
import { ModelingPrimaryTables as ModelingPrimaryTablesEager } from "./workspace/ModelingPrimaryTables";
import { ModelingSecondaryTables as ModelingSecondaryTablesEager } from "./workspace/ModelingSecondaryTables";
import { NetworkScopeWorkspaceContent as NetworkScopeWorkspaceContentEager } from "./workspace/NetworkScopeWorkspaceContent";
import { SettingsWorkspaceContent as SettingsWorkspaceContentEager } from "./workspace/SettingsWorkspaceContent";
import { ValidationWorkspaceContent as ValidationWorkspaceContentEager } from "./workspace/ValidationWorkspaceContent";

export type AppUiModuleLoadingMode = "auto" | "eager" | "lazy";

let appUiModulesLoadingModeForTests: AppUiModuleLoadingMode = "auto";
let appUiModulesLazyImportDelayMsForTests = 0;

function shouldLazyLoadUiModules(): boolean {
  if (appUiModulesLoadingModeForTests === "lazy") {
    return true;
  }
  if (appUiModulesLoadingModeForTests === "eager") {
    return false;
  }

  return !import.meta.env.VITEST;
}

async function maybeDelayLazyImportForTests(): Promise<void> {
  if (appUiModulesLazyImportDelayMsForTests <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, appUiModulesLazyImportDelayMsForTests));
}

function loadLazyUiModule<TModule, TExport>(
  loader: () => Promise<TModule>,
  pickDefault: (module: TModule) => TExport
): Promise<{ default: TExport }> {
  return (async () => {
    await maybeDelayLazyImportForTests();
    const module = await loader();
    return { default: pickDefault(module) };
  })();
}

const NetworkSummaryPanelLazy = lazy(() =>
  loadLazyUiModule(() => import("./NetworkSummaryPanel"), (module) => module.NetworkSummaryPanel)
);
const AnalysisScreenLazy = lazy(() =>
  loadLazyUiModule(() => import("./screens/AnalysisScreen"), (module) => module.AnalysisScreen)
);
const ModelingScreenLazy = lazy(() =>
  loadLazyUiModule(() => import("./screens/ModelingScreen"), (module) => module.ModelingScreen)
);
const NetworkScopeScreenLazy = lazy(() =>
  loadLazyUiModule(() => import("./screens/NetworkScopeScreen"), (module) => module.NetworkScopeScreen)
);
const SettingsScreenLazy = lazy(() =>
  loadLazyUiModule(() => import("./screens/SettingsScreen"), (module) => module.SettingsScreen)
);
const ValidationScreenLazy = lazy(() =>
  loadLazyUiModule(() => import("./screens/ValidationScreen"), (module) => module.ValidationScreen)
);
const AnalysisWorkspaceContentLazy = lazy(() =>
  loadLazyUiModule(() => import("./workspace/AnalysisWorkspaceContent"), (module) => module.AnalysisWorkspaceContent)
);
const ModelingFormsColumnLazy = lazy(() =>
  loadLazyUiModule(() => import("./workspace/ModelingFormsColumn"), (module) => module.ModelingFormsColumn)
);
const ModelingPrimaryTablesLazy = lazy(() =>
  loadLazyUiModule(() => import("./workspace/ModelingPrimaryTables"), (module) => module.ModelingPrimaryTables)
);
const ModelingSecondaryTablesLazy = lazy(() =>
  loadLazyUiModule(() => import("./workspace/ModelingSecondaryTables"), (module) => module.ModelingSecondaryTables)
);
const NetworkScopeWorkspaceContentLazy = lazy(() =>
  loadLazyUiModule(() => import("./workspace/NetworkScopeWorkspaceContent"), (module) => module.NetworkScopeWorkspaceContent)
);
const SettingsWorkspaceContentLazy = lazy(() =>
  loadLazyUiModule(() => import("./workspace/SettingsWorkspaceContent"), (module) => module.SettingsWorkspaceContent)
);
const ValidationWorkspaceContentLazy = lazy(() =>
  loadLazyUiModule(() => import("./workspace/ValidationWorkspaceContent"), (module) => module.ValidationWorkspaceContent)
);

const appUiModulesEager = {
  NetworkSummaryPanel: NetworkSummaryPanelEager,
  AnalysisScreen: AnalysisScreenEager,
  ModelingScreen: ModelingScreenEager,
  NetworkScopeScreen: NetworkScopeScreenEager,
  SettingsScreen: SettingsScreenEager,
  ValidationScreen: ValidationScreenEager,
  AnalysisWorkspaceContent: AnalysisWorkspaceContentEager,
  ModelingFormsColumn: ModelingFormsColumnEager,
  ModelingPrimaryTables: ModelingPrimaryTablesEager,
  ModelingSecondaryTables: ModelingSecondaryTablesEager,
  NetworkScopeWorkspaceContent: NetworkScopeWorkspaceContentEager,
  SettingsWorkspaceContent: SettingsWorkspaceContentEager,
  ValidationWorkspaceContent: ValidationWorkspaceContentEager
} as const;

const appUiModulesLazy = {
  NetworkSummaryPanel: NetworkSummaryPanelLazy,
  AnalysisScreen: AnalysisScreenLazy,
  ModelingScreen: ModelingScreenLazy,
  NetworkScopeScreen: NetworkScopeScreenLazy,
  SettingsScreen: SettingsScreenLazy,
  ValidationScreen: ValidationScreenLazy,
  AnalysisWorkspaceContent: AnalysisWorkspaceContentLazy,
  ModelingFormsColumn: ModelingFormsColumnLazy,
  ModelingPrimaryTables: ModelingPrimaryTablesLazy,
  ModelingSecondaryTables: ModelingSecondaryTablesLazy,
  NetworkScopeWorkspaceContent: NetworkScopeWorkspaceContentLazy,
  SettingsWorkspaceContent: SettingsWorkspaceContentLazy,
  ValidationWorkspaceContent: ValidationWorkspaceContentLazy
} as const;

function getActiveAppUiModulesRegistry() {
  return shouldLazyLoadUiModules() ? appUiModulesLazy : appUiModulesEager;
}

export const appUiModules = {
  get NetworkSummaryPanel() {
    return getActiveAppUiModulesRegistry().NetworkSummaryPanel;
  },
  get AnalysisScreen() {
    return getActiveAppUiModulesRegistry().AnalysisScreen;
  },
  get ModelingScreen() {
    return getActiveAppUiModulesRegistry().ModelingScreen;
  },
  get NetworkScopeScreen() {
    return getActiveAppUiModulesRegistry().NetworkScopeScreen;
  },
  get SettingsScreen() {
    return getActiveAppUiModulesRegistry().SettingsScreen;
  },
  get ValidationScreen() {
    return getActiveAppUiModulesRegistry().ValidationScreen;
  },
  get AnalysisWorkspaceContent() {
    return getActiveAppUiModulesRegistry().AnalysisWorkspaceContent;
  },
  get ModelingFormsColumn() {
    return getActiveAppUiModulesRegistry().ModelingFormsColumn;
  },
  get ModelingPrimaryTables() {
    return getActiveAppUiModulesRegistry().ModelingPrimaryTables;
  },
  get ModelingSecondaryTables() {
    return getActiveAppUiModulesRegistry().ModelingSecondaryTables;
  },
  get NetworkScopeWorkspaceContent() {
    return getActiveAppUiModulesRegistry().NetworkScopeWorkspaceContent;
  },
  get SettingsWorkspaceContent() {
    return getActiveAppUiModulesRegistry().SettingsWorkspaceContent;
  },
  get ValidationWorkspaceContent() {
    return getActiveAppUiModulesRegistry().ValidationWorkspaceContent;
  }
} as const;

export function setAppUiModulesLoadingModeForTests(mode: AppUiModuleLoadingMode): void {
  appUiModulesLoadingModeForTests = mode;
}

export function setAppUiModulesLazyImportDelayForTests(delayMs: number): void {
  appUiModulesLazyImportDelayMsForTests = Math.max(0, delayMs);
}
