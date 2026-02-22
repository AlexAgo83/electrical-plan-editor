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

const SHOULD_LAZY_LOAD_UI_MODULES = !import.meta.env.VITEST;

const NetworkSummaryPanelLazy = lazy(() =>
  import("./NetworkSummaryPanel").then((module) => ({ default: module.NetworkSummaryPanel }))
);
const AnalysisScreenLazy = lazy(() =>
  import("./screens/AnalysisScreen").then((module) => ({ default: module.AnalysisScreen }))
);
const ModelingScreenLazy = lazy(() =>
  import("./screens/ModelingScreen").then((module) => ({ default: module.ModelingScreen }))
);
const NetworkScopeScreenLazy = lazy(() =>
  import("./screens/NetworkScopeScreen").then((module) => ({ default: module.NetworkScopeScreen }))
);
const SettingsScreenLazy = lazy(() =>
  import("./screens/SettingsScreen").then((module) => ({ default: module.SettingsScreen }))
);
const ValidationScreenLazy = lazy(() =>
  import("./screens/ValidationScreen").then((module) => ({ default: module.ValidationScreen }))
);
const AnalysisWorkspaceContentLazy = lazy(() =>
  import("./workspace/AnalysisWorkspaceContent").then((module) => ({ default: module.AnalysisWorkspaceContent }))
);
const ModelingFormsColumnLazy = lazy(() =>
  import("./workspace/ModelingFormsColumn").then((module) => ({ default: module.ModelingFormsColumn }))
);
const ModelingPrimaryTablesLazy = lazy(() =>
  import("./workspace/ModelingPrimaryTables").then((module) => ({ default: module.ModelingPrimaryTables }))
);
const ModelingSecondaryTablesLazy = lazy(() =>
  import("./workspace/ModelingSecondaryTables").then((module) => ({ default: module.ModelingSecondaryTables }))
);
const NetworkScopeWorkspaceContentLazy = lazy(() =>
  import("./workspace/NetworkScopeWorkspaceContent").then((module) => ({ default: module.NetworkScopeWorkspaceContent }))
);
const SettingsWorkspaceContentLazy = lazy(() =>
  import("./workspace/SettingsWorkspaceContent").then((module) => ({ default: module.SettingsWorkspaceContent }))
);
const ValidationWorkspaceContentLazy = lazy(() =>
  import("./workspace/ValidationWorkspaceContent").then((module) => ({ default: module.ValidationWorkspaceContent }))
);

export const appUiModules = {
  NetworkSummaryPanel: SHOULD_LAZY_LOAD_UI_MODULES ? NetworkSummaryPanelLazy : NetworkSummaryPanelEager,
  AnalysisScreen: SHOULD_LAZY_LOAD_UI_MODULES ? AnalysisScreenLazy : AnalysisScreenEager,
  ModelingScreen: SHOULD_LAZY_LOAD_UI_MODULES ? ModelingScreenLazy : ModelingScreenEager,
  NetworkScopeScreen: SHOULD_LAZY_LOAD_UI_MODULES ? NetworkScopeScreenLazy : NetworkScopeScreenEager,
  SettingsScreen: SHOULD_LAZY_LOAD_UI_MODULES ? SettingsScreenLazy : SettingsScreenEager,
  ValidationScreen: SHOULD_LAZY_LOAD_UI_MODULES ? ValidationScreenLazy : ValidationScreenEager,
  AnalysisWorkspaceContent: SHOULD_LAZY_LOAD_UI_MODULES ? AnalysisWorkspaceContentLazy : AnalysisWorkspaceContentEager,
  ModelingFormsColumn: SHOULD_LAZY_LOAD_UI_MODULES ? ModelingFormsColumnLazy : ModelingFormsColumnEager,
  ModelingPrimaryTables: SHOULD_LAZY_LOAD_UI_MODULES ? ModelingPrimaryTablesLazy : ModelingPrimaryTablesEager,
  ModelingSecondaryTables: SHOULD_LAZY_LOAD_UI_MODULES ? ModelingSecondaryTablesLazy : ModelingSecondaryTablesEager,
  NetworkScopeWorkspaceContent: SHOULD_LAZY_LOAD_UI_MODULES ? NetworkScopeWorkspaceContentLazy : NetworkScopeWorkspaceContentEager,
  SettingsWorkspaceContent: SHOULD_LAZY_LOAD_UI_MODULES ? SettingsWorkspaceContentLazy : SettingsWorkspaceContentEager,
  ValidationWorkspaceContent: SHOULD_LAZY_LOAD_UI_MODULES ? ValidationWorkspaceContentLazy : ValidationWorkspaceContentEager
} as const;

