import { NetworkSummaryPanel } from "./NetworkSummaryPanel";
import { AnalysisScreen } from "./screens/AnalysisScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ModelingScreen } from "./screens/ModelingScreen";
import { NetworkScopeScreen } from "./screens/NetworkScopeScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ValidationScreen } from "./screens/ValidationScreen";
import { AnalysisWorkspaceContent } from "./workspace/AnalysisWorkspaceContent";
import { HomeWorkspaceContent } from "./workspace/HomeWorkspaceContent";
import { ModelingFormsColumn } from "./workspace/ModelingFormsColumn";
import { ModelingPrimaryTables } from "./workspace/ModelingPrimaryTables";
import { ModelingSecondaryTables } from "./workspace/ModelingSecondaryTables";
import { NetworkScopeWorkspaceContent } from "./workspace/NetworkScopeWorkspaceContent";
import { SettingsWorkspaceContent } from "./workspace/SettingsWorkspaceContent";
import { ValidationWorkspaceContent } from "./workspace/ValidationWorkspaceContent";

export const appUiModulesEager = {
  NetworkSummaryPanel,
  AnalysisScreen,
  HomeScreen,
  ModelingScreen,
  NetworkScopeScreen,
  SettingsScreen,
  ValidationScreen,
  AnalysisWorkspaceContent,
  HomeWorkspaceContent,
  ModelingFormsColumn,
  ModelingPrimaryTables,
  ModelingSecondaryTables,
  NetworkScopeWorkspaceContent,
  SettingsWorkspaceContent,
  ValidationWorkspaceContent
} as const;
