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

const lazyUiModulePromiseCache = new Map<string, Promise<{ default: unknown }>>();

function loadLazyUiModule<TModule, TExport>(
  cacheKey: string,
  loader: () => Promise<TModule>,
  pickDefault: (module: TModule) => TExport
): Promise<{ default: TExport }> {
  const cachedPromise = lazyUiModulePromiseCache.get(cacheKey);
  if (cachedPromise !== undefined) {
    return cachedPromise as Promise<{ default: TExport }>;
  }

  const lazyModulePromise = (async () => {
    await maybeDelayLazyImportForTests();
    const module = await loader();
    return { default: pickDefault(module) };
  })();
  lazyUiModulePromiseCache.set(cacheKey, lazyModulePromise as Promise<{ default: unknown }>);
  void lazyModulePromise.catch(() => {
    if (lazyUiModulePromiseCache.get(cacheKey) === lazyModulePromise) {
      lazyUiModulePromiseCache.delete(cacheKey);
    }
  });
  return lazyModulePromise;
}

const appUiModulesLazy = {
  NetworkSummaryPanel: lazy(() =>
    loadLazyUiModule("NetworkSummaryPanel", () => import("./NetworkSummaryPanel"), (module) => module.NetworkSummaryPanel)
  ),
  AnalysisScreen: lazy(() => loadLazyUiModule("AnalysisScreen", () => import("./screens/AnalysisScreen"), (module) => module.AnalysisScreen)),
  HomeScreen: lazy(() => loadLazyUiModule("HomeScreen", () => import("./screens/HomeScreen"), (module) => module.HomeScreen)),
  ModelingScreen: lazy(() => loadLazyUiModule("ModelingScreen", () => import("./screens/ModelingScreen"), (module) => module.ModelingScreen)),
  NetworkScopeScreen: lazy(() =>
    loadLazyUiModule("NetworkScopeScreen", () => import("./screens/NetworkScopeScreen"), (module) => module.NetworkScopeScreen)
  ),
  SettingsScreen: lazy(() => loadLazyUiModule("SettingsScreen", () => import("./screens/SettingsScreen"), (module) => module.SettingsScreen)),
  ValidationScreen: lazy(() =>
    loadLazyUiModule("ValidationScreen", () => import("./screens/ValidationScreen"), (module) => module.ValidationScreen)
  ),
  AnalysisWorkspaceContent: lazy(() =>
    loadLazyUiModule("AnalysisWorkspaceContent", () => import("./workspace/AnalysisWorkspaceContent"), (module) => module.AnalysisWorkspaceContent)
  ),
  HomeWorkspaceContent: lazy(() =>
    loadLazyUiModule("HomeWorkspaceContent", () => import("./workspace/HomeWorkspaceContent"), (module) => module.HomeWorkspaceContent)
  ),
  ModelingFormsColumn: lazy(() =>
    loadLazyUiModule("ModelingFormsColumn", () => import("./workspace/ModelingFormsColumn"), (module) => module.ModelingFormsColumn)
  ),
  ModelingPrimaryTables: lazy(() =>
    loadLazyUiModule("ModelingPrimaryTables", () => import("./workspace/ModelingPrimaryTables"), (module) => module.ModelingPrimaryTables)
  ),
  ModelingSecondaryTables: lazy(() =>
    loadLazyUiModule("ModelingSecondaryTables", () => import("./workspace/ModelingSecondaryTables"), (module) => module.ModelingSecondaryTables)
  ),
  NetworkScopeWorkspaceContent: lazy(() =>
    loadLazyUiModule("NetworkScopeWorkspaceContent", () => import("./workspace/NetworkScopeWorkspaceContent"), (module) => module.NetworkScopeWorkspaceContent)
  ),
  SettingsWorkspaceContent: lazy(() =>
    loadLazyUiModule("SettingsWorkspaceContent", () => import("./workspace/SettingsWorkspaceContent"), (module) => module.SettingsWorkspaceContent)
  ),
  ValidationWorkspaceContent: lazy(() =>
    loadLazyUiModule("ValidationWorkspaceContent", () => import("./workspace/ValidationWorkspaceContent"), (module) => module.ValidationWorkspaceContent)
  )
} as const;

export function preloadNetworkSummaryWorkspaceUiModules(): void {
  if (!shouldLazyLoadUiModules()) {
    return;
  }

  void Promise.all([
    loadLazyUiModule("NetworkSummaryPanel", () => import("./NetworkSummaryPanel"), (module) => module.NetworkSummaryPanel),
    loadLazyUiModule("AnalysisScreen", () => import("./screens/AnalysisScreen"), (module) => module.AnalysisScreen),
    loadLazyUiModule("ModelingScreen", () => import("./screens/ModelingScreen"), (module) => module.ModelingScreen),
    loadLazyUiModule("AnalysisWorkspaceContent", () => import("./workspace/AnalysisWorkspaceContent"), (module) => module.AnalysisWorkspaceContent),
    loadLazyUiModule("ModelingFormsColumn", () => import("./workspace/ModelingFormsColumn"), (module) => module.ModelingFormsColumn),
    loadLazyUiModule("ModelingPrimaryTables", () => import("./workspace/ModelingPrimaryTables"), (module) => module.ModelingPrimaryTables),
    loadLazyUiModule("ModelingSecondaryTables", () => import("./workspace/ModelingSecondaryTables"), (module) => module.ModelingSecondaryTables)
  ]).catch(() => undefined);
}

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
  get HomeScreen() {
    return getActiveAppUiModulesRegistry().HomeScreen;
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
  get HomeWorkspaceContent() {
    return getActiveAppUiModulesRegistry().HomeWorkspaceContent;
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
  lazyUiModulePromiseCache.clear();
}

// Backward-compatible alias: only resets mode/delay knobs. The eager registry is managed separately in test setup.
export function resetAppUiModulesTestControls(): void {
  resetAppUiModulesNonRegistryTestControls();
}
