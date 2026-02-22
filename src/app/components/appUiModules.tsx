import { lazy } from "react";

export type AppUiModuleLoadingMode = "auto" | "eager" | "lazy";

type AppUiModulesRegistry = typeof import("./appUiModules.eager").appUiModulesEager;

let appUiModulesLoadingModeForTests: AppUiModuleLoadingMode = "auto";
let appUiModulesLazyImportDelayMsForTests = 0;
let eagerRegistryForTests: AppUiModulesRegistry | null = null;

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

const appUiModulesLazy = {
  NetworkSummaryPanel: lazy(() =>
    loadLazyUiModule(() => import("./NetworkSummaryPanel"), (module) => module.NetworkSummaryPanel)
  ),
  AnalysisScreen: lazy(() => loadLazyUiModule(() => import("./screens/AnalysisScreen"), (module) => module.AnalysisScreen)),
  ModelingScreen: lazy(() => loadLazyUiModule(() => import("./screens/ModelingScreen"), (module) => module.ModelingScreen)),
  NetworkScopeScreen: lazy(() =>
    loadLazyUiModule(() => import("./screens/NetworkScopeScreen"), (module) => module.NetworkScopeScreen)
  ),
  SettingsScreen: lazy(() => loadLazyUiModule(() => import("./screens/SettingsScreen"), (module) => module.SettingsScreen)),
  ValidationScreen: lazy(() =>
    loadLazyUiModule(() => import("./screens/ValidationScreen"), (module) => module.ValidationScreen)
  ),
  AnalysisWorkspaceContent: lazy(() =>
    loadLazyUiModule(() => import("./workspace/AnalysisWorkspaceContent"), (module) => module.AnalysisWorkspaceContent)
  ),
  ModelingFormsColumn: lazy(() =>
    loadLazyUiModule(() => import("./workspace/ModelingFormsColumn"), (module) => module.ModelingFormsColumn)
  ),
  ModelingPrimaryTables: lazy(() =>
    loadLazyUiModule(() => import("./workspace/ModelingPrimaryTables"), (module) => module.ModelingPrimaryTables)
  ),
  ModelingSecondaryTables: lazy(() =>
    loadLazyUiModule(() => import("./workspace/ModelingSecondaryTables"), (module) => module.ModelingSecondaryTables)
  ),
  NetworkScopeWorkspaceContent: lazy(() =>
    loadLazyUiModule(() => import("./workspace/NetworkScopeWorkspaceContent"), (module) => module.NetworkScopeWorkspaceContent)
  ),
  SettingsWorkspaceContent: lazy(() =>
    loadLazyUiModule(() => import("./workspace/SettingsWorkspaceContent"), (module) => module.SettingsWorkspaceContent)
  ),
  ValidationWorkspaceContent: lazy(() =>
    loadLazyUiModule(() => import("./workspace/ValidationWorkspaceContent"), (module) => module.ValidationWorkspaceContent)
  )
} as const;

function getEagerRegistryForCurrentEnvironment(): AppUiModulesRegistry {
  if (eagerRegistryForTests === null) {
    throw new Error("Eager UI modules registry is only available in tests.");
  }

  return eagerRegistryForTests;
}

function getActiveAppUiModulesRegistry() {
  return shouldLazyLoadUiModules() ? appUiModulesLazy : getEagerRegistryForCurrentEnvironment();
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

export function setAppUiModulesEagerRegistryForTests(registry: AppUiModulesRegistry | null): void {
  eagerRegistryForTests = registry;
}

export function resetAppUiModulesNonRegistryTestControls(): void {
  appUiModulesLoadingModeForTests = "auto";
  appUiModulesLazyImportDelayMsForTests = 0;
}

// Backward-compatible alias: only resets mode/delay knobs. The eager registry is managed separately in test setup.
export function resetAppUiModulesTestControls(): void {
  resetAppUiModulesNonRegistryTestControls();
}
